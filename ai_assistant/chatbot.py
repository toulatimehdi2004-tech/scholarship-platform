"""
AI Chatbot Engine
Handles student conversations, detects intents, provides guidance
through the entire scholarship application process.
Uses BazaarLink AI for real AI responses, grounded with live platform data.
"""

import re
import json
import logging
from datetime import timedelta

from django.utils import timezone
from django.db.models import Q

from scholarships.models import Scholarship, University
from students.models import Student
from .models import (
    AIConversation, ApplicationTracker, ScholarshipMatch, AISuggestion
)
from .llm_client import chat_completion, is_available as llm_available

logger = logging.getLogger(__name__)

# Cache for scholarship data (avoids DB query every message)
_scholarship_cache = None
_scholarship_cache_time = None

# Intent detection keywords
INTENT_KEYWORDS = {
    'application_help': [
        'apply', 'application', 'how to apply', 'how do i apply', 'submit',
        'steps', 'procedure', 'guidance', 'help me', 'guide', 'walkthrough',
        'process', 'government scholarship', 'csc', 'chinese government',
    ],
    'scholarship_search': [
        'find', 'search', 'looking for', 'scholarship', 'scholarships',
        'opportunities', 'funding', 'grant', 'financial aid', 'tuition free',
        'free major', 'fully funded', 'partial funding'
    ],
    'eligibility': [
        'eligible', 'eligibility', 'requirements', 'qualify', 'gpa',
        'can i apply', 'am i eligible', 'criteria', 'prerequisite'
    ],
    'document_help': [
        'document', 'documents', 'transcript', 'passport', 'cv',
        'motivation letter', 'recommendation', 'certificate', 'diploma',
        'apostille', 'legalization', 'translation', 'upload', 'scan'
    ],
    'deadline': [
        'deadline', 'due date', 'last date', 'time left',
        'how long', 'closing date', 'expir'
    ],
    'country_info': [
        'country', 'countries', 'china', 'chinese', 'morocco', 'usa', 'uk',
        'germany', 'france', 'turkey', 'japan', 'korea', 'where'
    ],
    'payment': [
        'pay', 'payment', 'premium', 'subscribe', 'fee', 'cost',
        'free', 'price', 'upgrade'
    ],
    'profile': [
        'profile', 'account', 'my info', 'my details', 'settings',
        'update', 'edit profile'
    ],
    'tips': [
        'tip', 'advice', 'suggestion', 'recommend', 'strategy',
        'best practice', 'improve', 'strengthen'
    ],
}


def detect_intent(message):
    """Detect the user's intent from their message"""
    message_lower = message.lower()
    scores = {}

    for intent, keywords in INTENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in message_lower)
        if score > 0:
            scores[intent] = score

    if not scores:
        return 'general'

    return max(scores, key=scores.get)


def get_student_context(user):
    """Build context dict about the student for personalized responses"""
    context = {
        'name': user.first_name or user.username,
        'is_premium': False,
        'education_level': None,
        'field_of_study': None,
        'country': None,
        'saved_count': 0,
        'active_applications': 0,
    }

    try:
        profile = user.student_profile
        context['is_premium'] = bool(getattr(profile, 'is_premium', False))
        context['education_level'] = profile.education_level
        context['field_of_study'] = profile.field_of_study
        context['country'] = profile.country
        context['saved_count'] = len(profile.saved_scholarships or [])
        context['active_applications'] = ApplicationTracker.objects.filter(
            student=user
        ).exclude(current_step__in=['accepted', 'rejected', 'enrolled']).count()
    except Student.DoesNotExist:
        pass

    return context


def generate_response(user, message, session_id, use_ai=False, language=None):
    """
    Generate an AI assistant response based on the student's message.
    Uses the real LLM (BazaarLink) whenever use_ai=True, grounded with
    live platform data (relevant scholarships/universities). Falls back
    to instant keyword-based responses only if the LLM is unavailable.
    Returns dict with: response_text, intent, metadata
    """
    intent = detect_intent(message)
    context = get_student_context(user)
    student_name = context['name']

    # Save user message (keep its id so we can exclude it from history)
    user_msg = AIConversation.objects.create(
        student=user,
        session_id=session_id,
        role='user',
        message=message,
        intent=intent,
    )

    # Recent conversation history for context (last 12, oldest first)
    recent_messages = list(reversed(
        AIConversation.objects.filter(
            student=user, session_id=session_id
        ).exclude(id=user_msg.id).order_by('-created_at')[:12]
    ))

    # Build messages array for LLM: rich grounded system prompt + history
    messages = [{"role": "system", "content": _build_system_prompt(message, context, language)}]
    for msg in recent_messages:
        messages.append({
            "role": "user" if msg.role == "user" else "assistant",
            "content": (msg.message or "")[:600],
        })
    messages.append({"role": "user", "content": message})

    # Try the real LLM first
    response_text = None
    llm_used = False
    if use_ai and llm_available():
        response_text = chat_completion(messages, temperature=0.7, max_tokens=2048)
        llm_used = bool(response_text)

    if not response_text:
        # LLM unavailable/failed: instant keyword-based responses
        response_text = _fallback_response(intent, user, message, context)

    metadata = {'intent': intent, 'llm_used': llm_used}

    # Save assistant response
    AIConversation.objects.create(
        student=user,
        session_id=session_id,
        role='assistant',
        message=response_text,
        intent=intent,
        metadata=metadata,
    )

    return {
        'response': response_text,
        'intent': intent,
        'metadata': metadata,
    }


def _find_relevant_context(message):
    """Search the live DB for scholarships/universities relevant to the message.

    Returns a string block with real facts (ids, deadlines, links) that the
    LLM must use instead of inventing details.
    """
    msg = (message or '').lower()
    blocks = []

    # ── Universities mentioned by name, short name, or acronym ──
    uni_hits = []
    try:
        for u in University.objects.all().only('id', 'name', 'city', 'country', 'website'):
            name = (u.name or '').strip()
            if not name:
                continue
            candidates = [name.lower()]
            # Also match the short stem: "Tsinghua" for "Tsinghua University"
            for suffix in (' university', ' institute', ' college', ' school', ' academy'):
                if name.lower().endswith(suffix):
                    stem = name.lower()[: -len(suffix)].strip()
                    if len(stem) > 4:
                        candidates.append(stem)
                    break
            hit = False
            for cand in candidates:
                if len(cand) > 10:
                    hit = cand in msg
                else:
                    hit = re.search(r'\b' + re.escape(cand) + r'\b', msg) is not None
                if hit:
                    break
            if hit:
                uni_hits.append(u)
            if len(uni_hits) >= 3:
                break
    except Exception:
        uni_hits = []

    if uni_hits:
        lines = []
        for u in uni_hits:
            n_sch = Scholarship.objects.filter(university=u, is_active=True).count()
            lines.append(
                f"- {u.name} ({u.city or '?'}, {u.country or '?'}) — "
                f"{n_sch} active scholarships — page: /university/{u.id}/"
            )
        blocks.append("RELEVANT UNIVERSITIES (real, link with /university/<id>/):\n" + "\n".join(lines))

    # ── Scholarships matching level / type / university / field ──
    # Progressive relaxation: strict filters first, loosen until matches found.
    try:
        level_kw = None
        for lvl in ['bachelor', 'master', 'phd', 'postdoc', 'exchange', 'summer']:
            if lvl in msg or (lvl == 'master' and "master's" in msg):
                level_kw = lvl
                break

        type_kw = None
        if 'fully funded' in msg or 'full scholarship' in msg or 'full funding' in msg:
            type_kw = 'full'
        elif 'partial' in msg:
            type_kw = 'partial'

        field_kw = None
        for fk in [
            'computer science', 'software', 'engineering', 'business',
            'medicine', 'mbbs', 'economics', 'chinese language', 'arts',
            'mathematics', 'physics', 'law', 'architecture',
        ]:
            if fk in msg:
                field_kw = fk
                break

        uni_ids = [u.id for u in uni_hits]

        def run_qs(use_level, use_type, use_uni, use_field):
            qs = Scholarship.objects.filter(is_active=True).select_related('university')
            if use_level and level_kw:
                qs = qs.filter(level=level_kw)
            if use_type and type_kw:
                qs = qs.filter(type=type_kw)
            if use_uni and uni_ids:
                qs = qs.filter(university__in=uni_ids)
            if use_field and field_kw:
                qs = qs.filter(
                    Q(title__icontains=field_kw) | Q(description__icontains=field_kw)
                )
            return list(qs.order_by('application_deadline')[:6])

        matches = run_qs(True, True, True, True)
        if not matches:
            matches = run_qs(True, True, True, False)
        if not matches:
            matches = run_qs(True, False, True, False)
        if not matches and uni_ids:
            matches = run_qs(False, False, True, False)
        if not matches:
            matches = run_qs(True, True, False, False)
        if not matches:
            matches = list(
                Scholarship.objects.filter(is_active=True)
                .select_related('university')
                .order_by('application_deadline')[:6]
            )
        if matches:
            now = timezone.now()
            lines = []
            for s in matches:
                try:
                    days = s.days_until_deadline()
                    dl = s.application_deadline.strftime('%B %d, %Y')
                    dl_str = f"{dl} ({days} days left)" if days > 0 else f"{dl} (PASSED)"
                except Exception:
                    dl_str = 'rolling'
                money = f"{s.amount} {s.currency}" if s.amount else (s.duration or 'see details')
                lines.append(
                    f"- [{s.id}] {s.title} — {s.university.name}, "
                    f"{s.university.city or '?'} | {s.get_level_display()}/{s.get_type_display()} | "
                    f"deadline {dl_str} | {money} | "
                    f"apply: {s.application_link or 'see page'} | page: /scholarships/{s.id}/"
                )
            blocks.append(
                "RELEVANT SCHOLARSHIPS (real, use exact titles/deadlines/links, "
                "link with /scholarships/<id>/):\n" + "\n".join(lines)
            )
    except Exception:
        pass

    return "\n\n".join(blocks)


def _build_system_prompt(message, context, language=None):
    """Build a rich grounded system prompt so the LLM answers like a smart
    assistant: any question, correct facts, platform-aware."""
    try:
        uni_count = University.objects.count()
        sch_count = Scholarship.objects.filter(is_active=True).count()
    except Exception:
        uni_count, sch_count = 80, 100

    edu = context.get('education_level') or 'unknown'
    field = context.get('field_of_study') or 'unknown'
    country = context.get('country') or 'unknown'
    premium = 'premium' if context.get('is_premium') else 'free plan'

    relevant = _find_relevant_context(message)

    lang_names = {'en': 'English', 'fr': 'French', 'ar': 'Arabic'}
    if language in lang_names:
        lang_rule = (
            f"LANGUAGE RULE (most important): the student chose {lang_names[language]} "
            f"as the application language. ALWAYS reply in {lang_names[language]} — "
            "every word of your answer, no matter what language the student writes in. "
            "Never switch to another language and never ask them to switch."
        )
    else:
        lang_rule = (
            "LANGUAGE RULE (most important): first detect the language of the student's "
            "latest message automatically — Arabic, French, English, Chinese, or anything else — "
            "and ALWAYS reply in that exact same language, no matter what language the UI "
            "or earlier messages used. Never ask the student to switch languages."
        )

    return (
        "You are a friendly, knowledgeable AI study-abroad assistant inside a "
        "China scholarship-finder web platform. Answer ANY question the student asks "
        "— scholarships, universities, applications, documents, visas, studying and "
        "living in China, plus general knowledge questions — with correct, helpful, "
        "well-organized answers. Use **bold** for key points and short lists where useful. "
        + lang_rule + "\n\n"
        f"PLATFORM FACTS: {uni_count} Chinese universities, {sch_count} active scholarships "
        "(real 2026 programs: CSC/Chinese Government Scholarship via campuschina.org, "
        "university scholarships, plus key world scholarships). Free plan: 5 scholarships per "
        "type visible, 3 AI messages/day. Premium: one-time payment, unlocks everything. "
        "Every scholarship page has a live deadline countdown, an interactive document "
        "checklist, and an Apply button going straight to the official application page. "
        "Every university page has a photo-based virtual campus tour with map and street view.\n\n"
        f"STUDENT: name={context['name']}, education={edu}, field={field}, "
        f"country={country}, plan={premium}, saved={context.get('saved_count', 0)}, "
        f"active applications={context.get('active_applications', 0)}. "
        "Personalize when relevant.\n\n"
        f"{relevant}\n\n"
        "RULES: Use the REAL scholarships/universities above when relevant — exact titles, "
        "deadlines, links, and /scholarships/<id>/ or /university/<id>/ page paths. "
        "Never invent deadlines, amounts, or URLs. If unsure about a platform fact, say so "
        "and point to the site search. Keep answers focused and practical; ask a follow-up "
        "question when it helps."
        + ("\n\nFINAL REMINDER: write your ENTIRE response in "
           + (lang_names[language] if language in lang_names else "the student's message language")
           + ". Do not use any other language.")
    )


def _fallback_response(intent, user, message, context):
    """Keyword-based fallback when LLM is unavailable"""
    if intent == 'scholarship_search':
        return _handle_scholarship_search(user, message, context)
    elif intent == 'eligibility':
        return _handle_eligibility(user, message, context)
    elif intent == 'document_help':
        return _handle_document_help(user, message, context)
    elif intent == 'deadline':
        return _handle_deadline(user, message, context)
    elif intent == 'application_help':
        return _handle_application_help(user, message, context)
    elif intent == 'country_info':
        return _handle_country_info(user, message, context)
    elif intent == 'payment':
        return _handle_payment(user, message, context)
    elif intent == 'tips':
        return _handle_tips(user, message, context)
    else:
        return _handle_general(user, message, context)


def _handle_scholarship_search(user, message, context):
    """Handle scholarship search queries"""
    message_lower = message.lower()
    scholarships = Scholarship.objects.filter(is_active=True)

    # Try to extract country from message
    countries = ['china', 'morocco', 'usa', 'uk', 'germany', 'france',
                 'turkey', 'japan', 'korea', 'canada', 'australia']
    found_country = None
    for c in countries:
        if c in message_lower:
            found_country = c.title()
            break

    if found_country:
        scholarships = scholarships.filter(
            university__country__icontains=found_country
        )

    # Try to extract level
    levels = ['bachelor', 'master', 'phd', 'postdoc']
    found_level = None
    for l in levels:
        if l in message_lower:
            found_level = l
            break

    if found_level:
        scholarships = scholarships.filter(level=found_level)

    # Filter for fully funded if mentioned
    if any(w in message_lower for w in ['fully funded', 'full scholarship', 'full funding']):
        scholarships = scholarships.filter(type='full')

    # Filter for tuition free if mentioned
    if any(w in message_lower for w in ['tuition free', 'free tuition', 'free major']):
        scholarships = scholarships.filter(type='tuition')

    scholarships = scholarships.order_by('application_deadline')[:5]

    if not scholarships.exists():
        return (
            f"Hi {context['name']}! I searched our database but couldn't find "
            f"an exact match for your criteria. Try broadening your search or "
            f"browse all scholarships at /scholarships/. You can also tell me "
            f"your field of study and I'll find the best matches for you!"
        )

    response = f"Here are the top matches I found for you, {context['name']}:\n\n"
    for i, s in enumerate(scholarships, 1):
        days_left = s.days_until_deadline()
        deadline_str = f"{days_left} days left" if days_left > 0 else "Deadline passed"
        response += (
            f"{i}. **{s.title}** at {s.university.name} ({s.university.country})\n"
            f"   Type: {s.get_type_display()} | Level: {s.get_level_display()}\n"
            f"   Deadline: {deadline_str}\n"
            f"   View details: /scholarships/{s.id}/\n\n"
        )

    response += (
        "Would you like me to help you check eligibility for any of these, "
        "or start tracking your application? Just tell me which one!"
    )
    return response


def _handle_eligibility(user, message, context):
    """Handle eligibility check queries"""
    response = (
        f"To check your eligibility, {context['name']}, I need to know:\n\n"
        "1. **Your education level** (Bachelor/Master/PhD)\n"
        "2. **Your field of study** (e.g., Computer Science, Engineering, Business)\n"
        "3. **Your GPA** (if you know it)\n"
        "4. **Your country of residence**\n\n"
        "Once you share these details, I can match you with scholarships you qualify for. "
        "You can also update your profile at /students/profile/ so I can auto-match you!"
    )

    if context['education_level'] and context['field_of_study']:
        response += (
            f"\n\nI see from your profile that you're studying "
            f"{context['field_of_study']} at the {context['education_level']} level. "
            f"Want me to search for scholarships matching your background?"
        )

    return response


def _handle_document_help(user, message, context):
    """Handle document preparation queries"""
    message_lower = message.lower()

    document_guidance = {
        'transcript': (
            "**Academic Transcript:**\n"
            "- Request an official copy from your university\n"
            "- Make sure it's stamped/attested if required\n"
            "- Some countries require a GPA conversion (WES, ECE)\n"
            "- Keep multiple certified copies"
        ),
        'passport': (
            "**Passport:**\n"
            "- Must be valid for at least 6-12 months beyond your study start date\n"
            "- Scan both the photo page and any visa pages\n"
            "- If expiring soon, renew it ASAP"
        ),
        'cv': (
            "**CV / Resume:**\n"
            "- Academic format (not corporate)\n"
            "- Include: education, research, publications, skills, languages\n"
            "- 1-2 pages max\n"
            "- Tailor it to the specific scholarship"
        ),
        'motivation': (
            "**Motivation Letter / Statement of Purpose:**\n"
            "- Why this specific program/university\n"
            "- Your academic background and achievements\n"
            "- Career goals and how the scholarship helps\n"
            "- 500-1000 words typically\n"
            "- Be specific, avoid generic statements"
        ),
        'recommendation': (
            "**Recommendation Letters:**\n"
            "- Usually 2-3 letters required\n"
            "- Choose professors/employers who know you well\n"
            "- Give them at least 3-4 weeks notice\n"
            "- Provide them with your CV and motivation letter draft"
        ),
        'apostille': (
            "**Apostille / Legalization:**\n"
            "- Some countries require documents to be apostilled\n"
            "- In Morocco: visit the Ministry of Foreign Affairs\n"
            "- Check if the destination country is part of the Hague Apostille Convention\n"
            "- Start this process early - it can take weeks"
        ),
    }

    for keyword, guidance in document_guidance.items():
        if keyword in message_lower:
            response = f"Great question about {keyword}, {context['name']}!\n\n{guidance}"
            response += (
                "\n\nWould you like me to help you track your document preparation "
                "for a specific scholarship? I can create a checklist for you!"
            )
            return response

    return (
        f"I can help with document preparation, {context['name']}! "
        "Here are the documents I can guide you on:\n\n"
        "• Academic Transcript\n"
        "• Passport\n"
        "• CV / Resume\n"
        "• Motivation Letter\n"
        "• Recommendation Letters\n"
        "• Apostille / Legalization\n\n"
        "Which one would you like help with? Or tell me about a specific "
        "scholarship and I'll tell you exactly what documents you need."
    )


def _handle_deadline(user, message, context):
    """Handle deadline-related queries"""
    # Check saved scholarships deadlines
    try:
        profile = user.student_profile
        saved_ids = profile.saved_scholarships or []
        if saved_ids:
            saved = Scholarship.objects.filter(id__in=saved_ids, is_active=True)
            upcoming = saved.filter(
                application_deadline__gte=timezone.now()
            ).order_by('application_deadline')[:5]

            if upcoming.exists():
                response = f"Here are your upcoming deadlines, {context['name']}:\n\n"
                for s in upcoming:
                    days = s.days_until_deadline()
                    urgency = " URGENT!" if days <= 7 else ""
                    response += (
                        f"• **{s.title}** ({s.university.name})\n"
                        f"  Deadline: {s.application_deadline.strftime('%B %d, %Y')} "
                        f"({days} days left){urgency}\n\n"
                    )
                response += (
                    "Need help preparing for any of these? I can guide you through "
                    "the requirements and create a checklist!"
                )
                return response
    except Student.DoesNotExist:
        pass

    return (
        f"Let me help you track deadlines, {context['name']}! "
        "If you save scholarships to your profile, I can monitor all your "
        "deadlines and send you reminders.\n\n"
        "Browse scholarships at /scholarships/ and save the ones you're interested in. "
        "Then come back and ask me about your deadlines anytime!"
    )


def _handle_application_help(user, message, context):
    """Handle application process guidance"""
    message_lower = message.lower()

    # Specific CSC / Chinese Government Scholarship guidance
    if any(w in message_lower for w in ['csc', 'chinese government', 'government scholarship']):
        return (
            f"Here's how to apply for the **Chinese Government Scholarship (CSC)**, {context['name']}!\n\n"
            "**Step 1: Check Eligibility**\n"
            "→ Non-Chinese citizen, good health\n"
            "→ Education: Bachelor for Master, Master for PhD\n"
            "→ Age: Under 35 for Master, under 40 for PhD\n\n"
            "**Step 2: Choose Your Channel**\n"
            "→ Type A: Apply through Chinese embassy in your country\n"
            "→ Type B: Apply directly to a Chinese university (recommended)\n\n"
            "**Step 3: Prepare Documents**\n"
            "→ Passport copy\n"
            "→ Notarized diploma & transcripts (English/Chinese)\n"
            "→ Study plan / research proposal (800+ words)\n"
            "→ 2 recommendation letters\n"
            "→ Physical examination form\n"
            "→ English proficiency (IELTS/TOEFL) or HSK if Chinese-taught\n\n"
            "**Step 4: Apply Online**\n"
            "→ Visit: http://campuschina.org\n"
            "→ Fill application, upload documents\n"
            "→ Choose 'Chinese Government Scholarship'\n"
            "→ Submit before **April 15** (usually)\n\n"
            "**Step 5: University Admission**\n"
            "→ Apply separately to 1-3 preferred universities\n"
            "→ Get pre-admission letter (increases chances)\n\n"
            "**Timeline:**\n"
            "• Jan-Mar: Prepare documents\n"
            "• Mar-Apr: Submit CSC application\n"
            "• May-Jun: Review & interviews\n"
            "• Jul-Aug: Results announced\n"
            "• Sep: Arrive in China!\n\n"
            "Want me to help you track your CSC application? Just say 'track CSC'!"
        )

    # Generic application help
    return (
        f"I'll walk you through the scholarship application process, {context['name']}! "
        "Here's the typical roadmap:\n\n"
        "**Step 1: Research & Select**\n"
        "→ Find scholarships that match your profile\n"
        "→ Check eligibility requirements carefully\n\n"
        "**Step 2: Prepare Documents**\n"
        "→ Transcript, passport, CV, motivation letter, recommendation letters\n"
        "→ Get documents apostilled/legalized if required\n\n"
        "**Step 3: Write & Review**\n"
        "→ Draft your motivation letter\n"
        "→ Have it reviewed by someone experienced\n\n"
        "**Step 4: Submit**\n"
        "→ Submit before the deadline (aim for 2-3 days early)\n"
        "→ Keep copies of everything submitted\n\n"
        "**Step 5: Follow Up**\n"
        "→ Check email regularly\n"
        "→ Prepare for interviews if required\n\n"
        "Want me to track your progress on a specific scholarship? "
        "Just say 'track [scholarship name]' and I'll set up a personalized checklist!"
    )


def _handle_country_info(user, message, context):
    """Handle country-specific information queries"""
    message_lower = message.lower()

    country_info = {
        'china': (
            "**Studying in China** - Great choice!\n\n"
            "**Popular Scholarships:**\n"
            "• CSC (Chinese Government Scholarship) - Fully funded\n"
            "• Provincial Scholarships\n"
            "• University-specific scholarships\n\n"
            "**Key Info:**\n"
            "• Many programs taught in English (no HSK required)\n"
            "• Some require Chinese language prep year\n"
            "• Medical exam required\n"
            "• Documents need legalization\n\n"
            "Want me to search for China-specific scholarships?"
        ),
        'morocco': (
            "**Morocco - Local Opportunities:**\n\n"
            "• CNOPS scholarships\n"
            "• University exchange programs\n"
            "• French/German embassy scholarships\n"
            "• OCP Foundation\n\n"
            "I can also help you find scholarships FROM Morocco to study abroad!"
        ),
    }

    for country, info in country_info.items():
        if country in message_lower:
            return f"{info}\n\nAsk me anything else about studying in {country.title()}!"

    return (
        "Which country are you interested in? I can provide info about:\n\n"
        "• China (CSC scholarships, English-taught programs)\n"
        "• Morocco (local and outbound opportunities)\n"
        "• USA, UK, Germany, France, Turkey, Japan, Korea\n"
        "• And many more!\n\n"
        "Just tell me the country name and I'll share what I know!"
    )


def _handle_payment(user, message, context):
    """Handle payment/premium queries"""
    if context['is_premium']:
        return (
            f"Great news, {context['name']}! You're already a Premium member! "
            "You have full access to:\n\n"
            "• All scholarship details and verified links\n"
            "• Application tracking & AI guidance\n"
            "• Document preparation checklists\n"
            "• Deadline reminders\n\n"
            "How can I help you make the most of your access?"
        )

    return (
        f"Here's what you get with Premium, {context['name']}:\n\n"
        "**Free tier:**\n"
        "• Search scholarships (basic info visible)\n"
        "• Browse universities\n\n"
        "**Premium (one-time fee):**\n"
        "• Full scholarship details + verified official links\n"
        "• AI-powered scholarship matching\n"
        "• Application tracker with step-by-step guidance\n"
        "• Document preparation checklists\n"
        "• Deadline reminders\n"
        "• Priority support\n\n"
        "Visit /payments/plans/ to upgrade! It's a one-time fee - no subscriptions."
    )


def _handle_tips(user, message, context):
    """Handle tips and advice queries"""
    return (
        f"Here are my top tips for a successful scholarship application, {context['name']}:\n\n"
        "**1. Start Early**\n"
        "Begin 3-6 months before the deadline. Rushed applications show.\n\n"
        "**2. Be Specific**\n"
        "Tailor each motivation letter to the specific scholarship/university. "
        "Generic letters are immediately obvious.\n\n"
        "**3. Show Impact**\n"
        "Don't just list activities - show what you achieved and the impact you made.\n\n"
        "**4. Get Strong Recommendations**\n"
        "Choose people who know you well, not just famous names. "
        "Give them context and plenty of time.\n\n"
        "**5. Proofread Everything**\n"
        "Typos and grammar mistakes signal carelessness. Have someone else review.\n\n"
        "**6. Apply to Multiple**\n"
        "Don't put all your eggs in one basket. Apply to 5-10 scholarships.\n\n"
        "**7. Follow Instructions**\n"
        "If they say 500 words, don't write 1000. Follow formatting rules exactly.\n\n"
        "Want me to help you implement any of these for a specific application?"
    )


def _handle_general(user, message, context):
    """Handle general/unrecognized queries"""
    saved_count = context['saved_count']
    app_count = context['active_applications']

    response = f"Hi {context['name']}! I'm your AI scholarship assistant. "

    if saved_count == 0 and app_count == 0:
        response += (
            "It looks like you're just getting started. Here's what I can help with:\n\n"
            "• **Find scholarships** - Tell me your field of study and country preference\n"
            "• **Check eligibility** - Share your academic background\n"
            "• **Track applications** - I'll guide you step by step\n"
            "• **Document help** - I'll tell you exactly what you need\n"
            "• **Deadline tracking** - Never miss a deadline again\n\n"
            "What would you like to start with?"
        )
    else:
        response += (
            f"I see you have {saved_count} saved scholarships "
            f"and {app_count} active applications. "
            "How can I help you today?\n\n"
            "• Search for new scholarships\n"
            "• Check your application deadlines\n"
            "• Get help with documents\n"
            "• Track your application progress"
        )

    return response


def get_quick_suggestions(user):
    """Generate proactive suggestions based on student's current state"""
    suggestions = []
    now = timezone.now()

    try:
        profile = user.student_profile
    except Student.DoesNotExist:
        return suggestions

    # Check for deadline reminders on saved scholarships
    saved_ids = profile.saved_scholarships or []
    if saved_ids:
        urgent = Scholarship.objects.filter(
            id__in=saved_ids, is_active=True,
            application_deadline__gte=now,
            application_deadline__lte=now + timedelta(days=7)
        )
        for s in urgent:
            suggestions.append(AISuggestion(
                student=user,
                suggestion_type='deadline_approaching',
                title=f'Deadline in {s.days_until_deadline()} days!',
                message=f'{s.title} at {s.university.name} deadline is approaching.',
                related_scholarship=s,
                action_url=f'/scholarships/{s.id}/',
            ))

    # Check for new matching scholarships
    if profile.education_level and profile.field_of_study:
        new_matches = Scholarship.objects.filter(
            is_active=True,
            level__icontains=profile.education_level,
            created_at__gte=now - timedelta(days=7),
        ).exclude(id__in=saved_ids)[:3]
        for s in new_matches:
            suggestions.append(AISuggestion(
                student=user,
                suggestion_type='new_scholarship',
                title=f'New: {s.title}',
                message=f'A new {s.get_level_display()} scholarship at {s.university.name} matches your profile.',
                related_scholarship=s,
                action_url=f'/scholarships/{s.id}/',
            ))

    return suggestions
