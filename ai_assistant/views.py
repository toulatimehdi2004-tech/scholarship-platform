import json
import uuid
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils import timezone

from scholarships.models import Scholarship
from students.models import Student
from .models import (
    AIConversation, ApplicationTracker, ScholarshipMatch,
    AISuggestion, ScholarshipVerificationLog
)
from .chatbot import generate_response, get_quick_suggestions
from .matcher import generate_matches, calculate_match_score
from .verifier import (
    verify_scholarship, verify_all_scholarships,
    get_verification_summary
)


# ─── AI Chat View ───────────────────────────────────────────────

@login_required(login_url='login')
def ai_chat(request):
    """Main AI assistant chat interface"""
    # Get or create session ID
    session_id = request.session.get('ai_session_id')
    if not session_id:
        session_id = str(uuid.uuid4())[:16]
        request.session['ai_session_id'] = session_id

    # Load conversation history
    conversations = AIConversation.objects.filter(
        student=request.user,
        session_id=session_id
    ).order_by('created_at')[:50]

    # Handle new message
    if request.method == 'POST':
        message = request.POST.get('message', '').strip()
        use_ai = request.POST.get('use_ai') == '1'
        if message:
            result = generate_response(request.user, message, session_id, use_ai=use_ai)
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse(result)
            return redirect('ai_chat')

    # Get proactive suggestions
    suggestions = get_quick_suggestions(request.user)

    context = {
        'conversations': conversations,
        'suggestions': suggestions,
        'session_id': session_id,
    }
    return render(request, 'ai_assistant/chat.html', context)


@csrf_exempt
@require_POST
@login_required(login_url='login')
def ai_chat_api(request):
    """API endpoint for AJAX chat messages"""
    try:
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        use_ai = data.get('use_ai', False)
        session_id = data.get('session_id') or request.session.get('ai_session_id')

        if not session_id:
            session_id = str(uuid.uuid4())[:16]
            request.session['ai_session_id'] = session_id

        if not message:
            return JsonResponse({'error': 'No message provided'}, status=400)

        result = generate_response(request.user, message, session_id, use_ai=use_ai)
        return JsonResponse(result)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


# ─── Application Tracker ────────────────────────────────────────

@login_required(login_url='login')
def application_tracker(request):
    """View all tracked applications with progress"""
    trackers = ApplicationTracker.objects.filter(
        student=request.user
    ).select_related('scholarship', 'scholarship__university')

    active = trackers.exclude(current_step__in=['accepted', 'rejected', 'enrolled'])
    completed = trackers.filter(current_step__in=['accepted', 'rejected', 'enrolled'])

    context = {
        'active_applications': active,
        'completed_applications': completed,
        'total_tracked': trackers.count(),
    }
    return render(request, 'ai_assistant/tracker.html', context)


@login_required(login_url='login')
def track_scholarship(request, scholarship_id):
    """Start tracking a scholarship application"""
    scholarship = get_object_or_404(Scholarship, id=scholarship_id, is_active=True)

    tracker, created = ApplicationTracker.objects.get_or_create(
        student=request.user,
        scholarship=scholarship,
        defaults={'current_step': 'discovered'}
    )

    if created:
        messages.success(request, f'Now tracking: {scholarship.title}')
    else:
        messages.info(request, f'Already tracking: {scholarship.title}')

    return redirect('tracker_detail', tracker_id=tracker.id)


@login_required(login_url='login')
def tracker_detail(request, tracker_id):
    """View detail of a specific tracked application"""
    tracker = get_object_or_404(
        ApplicationTracker, id=tracker_id, student=request.user
    )

    # Generate AI recommendations based on current step
    recommendations = _get_step_recommendations(tracker)
    tracker.ai_recommendations = recommendations
    tracker.last_ai_check = timezone.now()
    tracker.save(update_fields=['ai_recommendations', 'last_ai_check'])

    steps = ApplicationTracker.STEP_CHOICES
    progress = tracker.get_progress_percentage()

    context = {
        'tracker': tracker,
        'steps': steps,
        'progress': progress,
        'recommendations': recommendations,
    }
    return render(request, 'ai_assistant/tracker_detail.html', context)


@login_required(login_url='login')
@require_POST
def update_tracker_step(request, tracker_id):
    """Update the step of a tracked application"""
    tracker = get_object_or_404(
        ApplicationTracker, id=tracker_id, student=request.user
    )
    new_step = request.POST.get('step')
    valid_steps = [s[0] for s in ApplicationTracker.STEP_CHOICES]

    if new_step in valid_steps:
        tracker.current_step = new_step
        tracker.save(update_fields=['current_step', 'updated_at'])
        messages.success(request, f'Progress updated to: {tracker.get_current_step_display()}')

    return redirect('tracker_detail', tracker_id=tracker.id)


def _get_step_recommendations(tracker):
    """Generate AI recommendations based on current application step"""
    step = tracker.current_step
    scholarship = tracker.scholarship
    days_left = scholarship.days_until_deadline()

    recommendations = []

    if step == 'discovered':
        recommendations = [
            "Review the full eligibility requirements carefully",
            f"Deadline: {scholarship.application_deadline.strftime('%B %d, %Y')} ({days_left} days away)",
            "Check if you meet the GPA requirement",
            "Start gathering required documents early",
        ]
        if scholarship.application_link:
            recommendations.append(f"Visit the official page: {scholarship.application_link}")

    elif step == 'researching':
        recommendations = [
            "Read the scholarship FAQ thoroughly",
            "Check what previous recipients say about this scholarship",
            "Note down any questions for the contact email",
            "Understand the selection criteria and weighting",
        ]

    elif step == 'documents_gathering':
        docs_needed = scholarship.required_documents or []
        recommendations = [f"Prepare: {doc}" for doc in docs_needed]
        recommendations.extend([
            "Start apostille/legalization process if needed",
            "Get certified translations ready",
            "Keep digital and physical copies of everything",
        ])

    elif step == 'writing_motivation':
        recommendations = [
            "Research the university and program specifically",
            "Connect your goals to what the scholarship values",
            "Be specific about why THIS scholarship, not just any scholarship",
            "Have someone review your draft",
            "Stay within the word limit",
        ]

    elif step == 'getting_recommendations':
        recommendations = [
            "Ask recommenders at least 3-4 weeks before deadline",
            "Provide them with your CV and motivation letter draft",
            "Give them a summary of what the scholarship values",
            "Follow up politely if they haven't submitted yet",
        ]

    elif step == 'submitting':
        recommendations = [
            "Submit at least 2-3 days before the deadline",
            "Double-check all uploaded documents",
            "Save your submission confirmation/receipt",
            "Note down your application reference number",
        ]
        if days_left <= 3:
            recommendations.insert(0, f"URGENT: Only {days_left} days left!")

    elif step == 'submitted':
        recommendations = [
            "Check your email regularly (including spam)",
            "Keep all submission receipts safe",
            "Start preparing for potential interview",
            "Continue applying to other scholarships",
        ]

    elif step == 'interview_prep':
        recommendations = [
            "Research common interview questions for this scholarship",
            "Prepare your elevator pitch (1-2 minutes)",
            "Practice explaining your research/goals clearly",
            "Prepare questions to ask the interviewers",
            "Test your tech setup if it's a virtual interview",
        ]

    return recommendations


# ─── Scholarship Matching ───────────────────────────────────────

@login_required(login_url='login')
def my_matches(request):
    """View AI-generated scholarship matches"""
    matches = ScholarshipMatch.objects.filter(
        student=request.user
    ).select_related('scholarship', 'scholarship__university')[:20]

    context = {
        'matches': matches,
        'total_matches': matches.count(),
    }
    return render(request, 'ai_assistant/matches.html', context)


@login_required(login_url='login')
def refresh_matches(request):
    """Regenerate scholarship matches based on current profile"""
    matches = generate_matches(request.user, max_results=15)
    messages.success(request, f'Updated! Found {len(matches)} matching scholarships.')
    return redirect('my_matches')


# ─── AI Suggestions ─────────────────────────────────────────────

@login_required(login_url='login')
def ai_suggestions(request):
    """View all AI-generated suggestions and alerts"""
    suggestions = AISuggestion.objects.filter(
        student=request.user,
        is_dismissed=False,
    )

    unread_count = suggestions.filter(is_read=False).count()

    context = {
        'suggestions': suggestions,
        'unread_count': unread_count,
    }
    return render(request, 'ai_assistant/suggestions.html', context)


@login_required(login_url='login')
@require_POST
def dismiss_suggestion(request, suggestion_id):
    """Dismiss an AI suggestion"""
    suggestion = get_object_or_404(
        AISuggestion, id=suggestion_id, student=request.user
    )
    suggestion.is_dismissed = True
    suggestion.save(update_fields=['is_dismissed'])
    return redirect('ai_suggestions')


@login_required(login_url='login')
@require_POST
def mark_suggestion_read(request, suggestion_id):
    """Mark an AI suggestion as read"""
    suggestion = get_object_or_404(
        AISuggestion, id=suggestion_id, student=request.user
    )
    suggestion.is_read = True
    suggestion.save(update_fields=['is_read'])
    return JsonResponse({'status': 'ok'})


# ─── Admin / Verification Views ────────────────────────────────

@login_required(login_url='login')
def verification_dashboard(request):
    """Admin dashboard for scholarship verification status"""
    if not request.user.is_staff:
        messages.error(request, 'Access denied.')
        return redirect('homepage')

    summary = get_verification_summary()
    recent_logs = ScholarshipVerificationLog.objects.select_related(
        'scholarship', 'scholarship__university'
    )[:20]

    context = {
        'summary': summary,
        'recent_logs': recent_logs,
    }
    return render(request, 'ai_assistant/verification_dashboard.html', context)


@login_required(login_url='login')
@require_POST
def run_verification(request):
    """Trigger manual verification of all scholarships"""
    if not request.user.is_staff:
        messages.error(request, 'Access denied.')
        return redirect('homepage')

    results = verify_all_scholarships(auto_deactivate=True)
    messages.success(
        request,
        f"Verification complete! Checked {results['total_checked']} scholarships. "
        f"{results['deactivated']} were auto-deactivated."
    )
    return redirect('verification_dashboard')


@login_required(login_url='login')
def verify_single_scholarship(request, scholarship_id):
    """Verify a single scholarship"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Access denied'}, status=403)

    scholarship = get_object_or_404(Scholarship, id=scholarship_id)
    log = verify_scholarship(scholarship, auto_deactivate=True)

    return JsonResponse({
        'status': log.status,
        'http_code': log.http_status_code,
        'error': log.error_message,
        'action': log.action_taken,
    })


# ─── Profile Completion Check ───────────────────────────────────

@login_required(login_url='login')
def profile_completion(request):
    """Check and prompt for profile completion to improve matching"""
    try:
        profile = request.user.student_profile
    except Student.DoesNotExist:
        return redirect('profile')

    missing = []
    if not profile.education_level:
        missing.append('education_level')
    if not profile.field_of_study:
        missing.append('field_of_study')
    if not profile.country:
        missing.append('country')
    if not profile.gpa:
        missing.append('gpa')

    context = {
        'missing_fields': missing,
        'completion_score': int(((4 - len(missing)) / 4) * 100),
    }
    return render(request, 'ai_assistant/profile_completion.html', context)
