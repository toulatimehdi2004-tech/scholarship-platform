import uuid
import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db.models import Q
from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from students.models import Student, EmailVerification
from scholarships.models import University, Scholarship
from documents.models import Document
from ai_assistant.models import (
    ApplicationTracker, ScholarshipMatch, AISuggestion
)
from ai_assistant.chatbot import generate_response

from .serializers import (
    UserSerializer, RegisterSerializer,
    StudentSerializer,
    UniversityListSerializer, UniversityDetailSerializer,
    ScholarshipListSerializer, ScholarshipDetailSerializer,
    ApplicationTrackerSerializer, ScholarshipMatchSerializer,
    AISuggestionSerializer, AIConversationSerializer,
    AIChatRequestSerializer, DocumentSerializer,
)


# ── Auth Views ───────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Account created.',
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_code(request):
    """POST /api/auth/send-code/ — Send 6-digit code to email"""
    email = request.data.get('email', '').strip()
    if not email:
        return Response({'error': 'Email is required.'}, status=400)

    # Invalidate old unused codes for this email
    EmailVerification.objects.filter(email=email, is_used=False).update(is_used=True)

    code = EmailVerification.generate_code()
    EmailVerification.objects.create(email=email, code=code)

    try:
        send_mail(
            subject='Your Verification Code — Scholarship Platform',
            message=f'Your verification code is: {code}\n\nThis code expires in 5 minutes.\n\nIf you didn\'t request this, ignore this email.',
            from_email=None,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({'message': 'Verification code sent to ' + email})
    except Exception as e:
        return Response({'error': 'Failed to send email. Please try again.'}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_code(request):
    """POST /api/auth/verify-code/ — Verify 6-digit code and return token"""
    email = request.data.get('email', '').strip()
    code = request.data.get('code', '').strip()

    if not email or not code:
        return Response({'error': 'Email and code are required.'}, status=400)

    # Find latest unused, unexpired code
    verification = EmailVerification.objects.filter(
        email=email, code=code, is_used=False
    ).order_by('-created_at').first()

    if not verification:
        return Response({'error': 'Invalid verification code.'}, status=400)

    if verification.is_expired():
        verification.mark_used()
        return Response({'error': 'Verification code has expired. Request a new one.'}, status=400)

    verification.mark_used()

    # Find or create user by email
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({'error': 'No account found with this email.'}, status=400)

    # Mark email as verified
    student, _ = Student.objects.get_or_create(user=user)
    student.is_email_verified = True
    student.save(update_fields=['is_email_verified'])

    # Get or create token
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'user': UserSerializer(user).data,
        'token': token.key,
        'message': 'Email verified successfully!',
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification_code(request):
    """POST /api/auth/resend-code/ — Resend verification code"""
    email = request.user.email
    if not email:
        return Response({'error': 'No email associated with this account.'}, status=400)

    # Invalidate old unused codes
    EmailVerification.objects.filter(email=email, is_used=False).update(is_used=True)

    code = EmailVerification.generate_code()
    EmailVerification.objects.create(email=email, code=code)

    try:
        send_mail(
            subject='Your Verification Code — Scholarship Platform',
            message=f'Your verification code is: {code}\n\nThis code expires in 5 minutes.\n\nIf you didn\'t request this, ignore this email.',
            from_email=None,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({'message': 'Verification code sent to ' + email})
    except Exception as e:
        return Response({'error': 'Failed to send email. Please try again.'}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """POST /api/auth/forgot-password/ — Send 6-digit code to reset password"""
    email = request.data.get('email', '').strip()
    if not email:
        return Response({'error': 'Email is required.'}, status=400)

    user = User.objects.filter(email=email).first()
    if not user:
        # Don't reveal if email exists
        return Response({'message': 'If an account exists with this email, a reset code has been sent.'})

    # Invalidate old unused codes for this email (reuse EmailVerification model)
    EmailVerification.objects.filter(email=email, is_used=False).update(is_used=True)

    code = EmailVerification.generate_code()
    EmailVerification.objects.create(email=email, code=code)

    try:
        send_mail(
            subject='Password Reset Code — Scholarship Platform',
            message=f'Your password reset code is: {code}\n\nThis code expires in 5 minutes.\n\nIf you didn\'t request this, ignore this email.',
            from_email=None,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception:
        pass

    return Response({'message': 'If an account exists with this email, a reset code has been sent.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """POST /api/auth/reset-password/ — Verify code and set new password"""
    email = request.data.get('email', '').strip()
    code = request.data.get('code', '').strip()
    new_password = request.data.get('new_password', '')

    if not email or not code or not new_password:
        return Response({'error': 'Email, code, and new password are required.'}, status=400)

    if len(new_password) < 6:
        return Response({'error': 'Password must be at least 6 characters.'}, status=400)

    # Find latest unused, unexpired code
    verification = EmailVerification.objects.filter(
        email=email, code=code, is_used=False
    ).order_by('-created_at').first()

    if not verification:
        return Response({'error': 'Invalid verification code.'}, status=400)

    if verification.is_expired():
        verification.mark_used()
        return Response({'error': 'Verification code has expired. Request a new one.'}, status=400)

    verification.mark_used()

    user = User.objects.filter(email=email).first()
    if not user:
        return Response({'error': 'No account found with this email.'}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password reset successful! You can now sign in.'})


class LoginView(generics.GenericAPIView):
    """POST /api/auth/login/"""
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '')
        password = request.data.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            # Check if email is verified
            student = Student.objects.filter(user=user).first()
            if student and not student.is_email_verified:
                return Response({
                    'error': 'Please verify your email first.',
                    'needs_verification': True,
                    'email': user.email,
                }, status=status.HTTP_403_FORBIDDEN)

            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Logged in.',
            })
        return Response(
            {'error': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """POST /api/auth/logout/"""
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({'message': 'Logged out.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """GET /api/auth/user/"""
    user = request.user
    data = UserSerializer(user).data
    try:
        data['student_profile'] = StudentSerializer(user.student_profile).data
    except Student.DoesNotExist:
        data['student_profile'] = None
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_premium_view(request):
    """POST /api/auth/activate-premium/ — One-time payment activation"""
    payment_id = request.data.get('payment_id', 'manual_' + str(uuid.uuid4())[:8])
    student, _ = Student.objects.get_or_create(user=request.user)
    student.activate_premium(payment_id=payment_id)
    return Response({
        'message': 'Premium activated! You now have full access to all scholarships and AI chat.',
        'is_premium': True,
    })


# ── Student Profile ──────────────────────────────────────────

class StudentProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/students/profile/"""
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _ = Student.objects.get_or_create(user=self.request.user)
        return profile


# ── Scholarships ─────────────────────────────────────────────

FREE_TRIAL_LIMIT = 5

class ScholarshipViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET  /api/scholarships/           – list (with filters)
    GET  /api/scholarships/{id}/      – detail
    Free users see only 5 per type. Premium sees all.
    """
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ScholarshipDetailSerializer
        return ScholarshipListSerializer

    def get_queryset(self):
        qs = Scholarship.objects.select_related('university').filter(is_active=True)
        params = self.request.query_params

        # Search
        search = params.get('search')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(university__name__icontains=search)
            )

        # Filters
        country = params.get('country')
        if country:
            qs = qs.filter(university__country__icontains=country)

        level = params.get('level')
        if level:
            qs = qs.filter(level=level)

        scholarship_type = params.get('type')
        if scholarship_type:
            qs = qs.filter(type=scholarship_type)

        university = params.get('university')
        if university:
            qs = qs.filter(university_id=university)

        # Free trial: limit to FREE_TRIAL_LIMIT per type for non-premium users
        is_premium = False
        user = self.request.user
        if user.is_authenticated:
            try:
                profile = user.student_profile
                is_premium = profile.is_premium
            except Exception:
                pass

        if not is_premium:
            from django.db.models import Min, Q
            featured_ids = Scholarship.objects.filter(
                is_active=True, is_featured=True
            ).values_list('id', flat=True)

            limited_ids = []
            for stype in ['full', 'partial', 'living', 'research', 'tuition']:
                type_ids = list(
                    qs.filter(type=stype)
                    .order_by('-is_featured', '-created_at')
                    .values_list('id', flat=True)[:FREE_TRIAL_LIMIT]
                )
                limited_ids.extend(type_ids)

            all_limited = list(set(list(featured_ids) + limited_ids))
            qs = qs.filter(id__in=all_limited)

        return qs.distinct()


# ── Universities ─────────────────────────────────────────────

class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET  /api/universities/           – list
    GET  /api/universities/{id}/      – detail
    """
    permission_classes = [AllowAny]
    queryset = University.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UniversityDetailSerializer
        return UniversityListSerializer


# ── Application Tracker ──────────────────────────────────────

class ApplicationTrackerViewSet(viewsets.ModelViewSet):
    """
    CRUD /api/applications/
    """
    serializer_class = ApplicationTrackerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ApplicationTracker.objects.filter(
            student=self.request.user
        ).select_related('scholarship')


# ── Scholarship Matches ──────────────────────────────────────

class ScholarshipMatchView(generics.ListAPIView):
    """GET /api/matches/"""
    serializer_class = ScholarshipMatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ScholarshipMatch.objects.filter(
            student=self.request.user
        ).select_related('scholarship', 'scholarship__university')


# ── AI Suggestions ───────────────────────────────────────────

class AISuggestionViewSet(viewsets.ModelViewSet):
    """
    GET    /api/suggestions/              – list
    GET    /api/suggestions/{id}/         – detail
    PATCH  /api/suggestions/{id}/         – mark read / dismiss
    DELETE /api/suggestions/{id}/         – dismiss
    """
    serializer_class = AISuggestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AISuggestion.objects.filter(
            student=self.request.user
        ).select_related('related_scholarship')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        suggestion = self.get_object()
        suggestion.is_read = True
        suggestion.save(update_fields=['is_read'])
        return Response(self.get_serializer(suggestion).data)

    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        suggestion = self.get_object()
        suggestion.is_dismissed = True
        suggestion.save(update_fields=['is_dismissed'])
        return Response(self.get_serializer(suggestion).data)


# ── AI Chat ──────────────────────────────────────────────────

class AIChatView(generics.GenericAPIView):
    """POST /api/ai/chat/"""
    permission_classes = [IsAuthenticated]
    serializer_class = AIChatRequestSerializer

    def post(self, request):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)

        # Check premium status
        is_premium = False
        try:
            profile = request.user.student_profile
            is_premium = profile.is_premium
        except Exception:
            pass

        if not is_premium:
            # Free trial: limit AI chat messages
            from ai_assistant.models import AIConversation
            today_count = AIConversation.objects.filter(
                student=request.user,
                role='user',
                created_at__date=timezone.now().date()
            ).count()

            if today_count >= 3:
                session_id = ser.validated_data.get('session_id') or str(uuid.uuid4())
                return Response({
                    'response': (
                        "You've used your 3 free AI messages today! "
                        "Upgrade to Premium for unlimited AI chat, "
                        "full scholarship access, and application tracking.\n\n"
                        "To upgrade, go to your Dashboard or contact us."
                    ),
                    'session_id': session_id,
                    'intent': 'payment',
                    'metadata': {'premium_required': True, 'messages_used': today_count},
                })

        message = ser.validated_data['message']
        session_id = ser.validated_data.get('session_id') or str(uuid.uuid4())
        use_ai = ser.validated_data.get('use_ai', False)
        language = ser.validated_data.get('language') or None

        result = generate_response(
            user=request.user,
            message=message,
            session_id=session_id,
            use_ai=use_ai,
            language=language,
        )

        return Response({
            'session_id': session_id,
            'response': result.get('response', result.get('response_text', '')),
            'intent': result.get('intent'),
            'metadata': result.get('metadata', {}),
        })


class AIChatStreamView(generics.GenericAPIView):
    """POST /api/ai/chat/stream/ — Server-sent events stream of the AI reply."""
    permission_classes = [IsAuthenticated]
    serializer_class = AIChatRequestSerializer

    def post(self, request):
        from ai_assistant.models import AIConversation
        from ai_assistant.chatbot import (
            detect_intent, get_student_context, _build_system_prompt,
        )
        from ai_assistant.llm_client import (
            chat_completion_stream, is_available as llm_available,
        )

        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)

        try:
            profile = request.user.student_profile
            is_premium = profile.is_premium
        except Exception:
            is_premium = False

        if not is_premium:
            today_count = AIConversation.objects.filter(
                student=request.user,
                role='user',
                created_at__date=timezone.now().date()
            ).count()
            if today_count >= 3:
                def limited():
                    yield 'data: ' + json.dumps({
                        'error': 'limit',
                        'response': (
                            "You've used your 3 free AI messages today! "
                            "Upgrade to Premium for unlimited AI chat."
                        ),
                    }) + '\n\n'
                resp = StreamingHttpResponse(limited(), content_type='text/event-stream')
                resp['Cache-Control'] = 'no-cache'
                return resp

        message = ser.validated_data['message']
        session_id = ser.validated_data.get('session_id') or str(uuid.uuid4())
        language = ser.validated_data.get('language') or None
        user = request.user

        intent = detect_intent(message)
        context = get_student_context(user)
        user_msg = AIConversation.objects.create(
            student=user, session_id=session_id, role='user',
            message=message, intent=intent,
        )
        history = list(reversed(
            AIConversation.objects.filter(
                student=user, session_id=session_id
            ).exclude(id=user_msg.id).order_by('-created_at')[:12]
        ))
        messages = [{"role": "system", "content": _build_system_prompt(message, context, language)}]
        for msg in history:
            messages.append({
                "role": "user" if msg.role == "user" else "assistant",
                "content": (msg.message or "")[:600],
            })
        messages.append({"role": "user", "content": message})

        def event_stream():
            if not llm_available():
                yield 'data: ' + json.dumps({'error': 'unavailable'}) + '\n\n'
                return
            yield 'data: ' + json.dumps({'session_id': session_id, 'intent': intent}) + '\n\n'
            full = []
            try:
                for chunk in chat_completion_stream(messages, temperature=0.7, max_tokens=2048):
                    if chunk:
                        full.append(chunk)
                        yield 'data: ' + json.dumps({'token': chunk}) + '\n\n'
            except Exception:
                pass
            text = ''.join(full)
            if text:
                AIConversation.objects.create(
                    student=user, session_id=session_id, role='assistant',
                    message=text, intent=intent,
                    metadata={'intent': intent, 'llm_used': True, 'stream': True},
                )
            yield 'data: [DONE]\n\n'

        resp = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        resp['Cache-Control'] = 'no-cache'
        resp['X-Accel-Buffering'] = 'no'
        return resp


# ── Translate ──────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def translate_view(request):
    """POST /api/translate/ — Translate a short text to fr/ar via LLM."""
    from ai_assistant.llm_client import chat_completion, is_available as llm_available

    text = (request.data.get('text') or '').strip()
    target = (request.data.get('target_lang') or '').strip().lower()

    if not text:
        return Response({'error': 'Text is required.'}, status=400)
    if target not in ('fr', 'ar'):
        return Response({'error': 'target_lang must be fr or ar.'}, status=400)
    if len(text) > 3000:
        return Response({'error': 'Text too long (max 3000 chars).'}, status=400)
    if not llm_available():
        return Response({'error': 'Translation service unavailable.'}, status=503)

    lang_name = 'French' if target == 'fr' else 'Arabic'
    translated = chat_completion(
        messages=[
            {
                'role': 'system',
                'content': (
                    f'Translate the following text to {lang_name}. '
                    'Return ONLY the translation, no explanations, '
                    'no quotes, preserve line breaks.'
                ),
            },
            {'role': 'user', 'content': text},
        ],
        temperature=0.2,
        max_tokens=2048,
    )
    if not translated:
        return Response({'error': 'Translation failed.'}, status=502)
    return Response({'translated_text': translated.strip()})


@api_view(['GET'])
@permission_classes([AllowAny])
def stats_view(request):
    """GET /api/stats/ — Public platform counts for the homepage."""
    from scholarships.models import University, Scholarship
    cities = {
        u.city for u in University.objects.exclude(city__isnull=True).exclude(city='')
    }
    return Response({
        'scholarships': Scholarship.objects.filter(is_active=True).count(),
        'universities': University.objects.count(),
        'cities': len(cities),
    })


# ── Eligibility Match ────────────────────────────────────────

def _score_scholarship(s, level, gpa4, field_words):
    """Transparent 100-point eligibility score + breakdown."""
    bd = {}
    # Level 40
    if level and s.level == level:
        bd['level'] = {'points': 40, 'met': True, 'note': f"Open to {s.get_level_display()} students"}
    elif s.level == 'all':
        bd['level'] = {'points': 30, 'met': True, 'note': 'Open to all levels'}
    elif not level:
        bd['level'] = {'points': 20, 'met': True, 'note': f"Listed for {s.get_level_display()}"}
    else:
        bd['level'] = {'points': 0, 'met': False, 'note': f"Requires {s.get_level_display()} level"}
    # GPA 30
    if gpa4 is None:
        bd['gpa'] = {'points': 15, 'met': True, 'note': 'Add your GPA for a precise score'}
    elif s.minimum_gpa is None:
        bd['gpa'] = {'points': 20, 'met': True, 'note': 'No minimum GPA published'}
    elif gpa4 >= float(s.minimum_gpa):
        bd['gpa'] = {'points': 30, 'met': True, 'note': f"Your GPA meets the {s.minimum_gpa} minimum"}
    elif gpa4 >= float(s.minimum_gpa) - 0.3:
        bd['gpa'] = {'points': 15, 'met': False, 'note': f"Below the {s.minimum_gpa} minimum, but close"}
    else:
        bd['gpa'] = {'points': 5, 'met': False, 'note': f"Requires GPA {s.minimum_gpa}"}
    # Field 15
    if not field_words:
        bd['field'] = {'points': 10, 'met': True, 'note': 'No field restriction checked'}
    else:
        hay = f"{s.title} {s.description or ''}".lower()
        hit = next((w for w in field_words if len(w) > 2 and w in hay), None)
        if hit:
            bd['field'] = {'points': 15, 'met': True, 'note': f'Matches "{hit}" in this program'}
        else:
            bd['field'] = {'points': 8, 'met': True, 'note': 'Open to many fields of study'}
    # Availability 15
    try:
        left = s.seats_left()
    except Exception:
        left = None
    if left is None:
        bd['availability'] = {'points': 10, 'met': True, 'note': 'Places confirmed by the university'}
    elif left > 0:
        bd['availability'] = {'points': 15, 'met': True, 'note': f'{left} places left'}
    else:
        bd['availability'] = {'points': 0, 'met': False, 'note': 'All places taken'}
    score = sum(v['points'] for v in bd.values())
    return score, bd


@api_view(['GET'])
@permission_classes([AllowAny])
def match_view(request):
    """GET /api/match/?level=&gpa=&scale=4|20&field= — Scored scholarship matches."""
    from scholarships.models import Scholarship
    level = (request.query_params.get('level') or '').strip().lower() or None
    if level not in ('bachelor', 'master', 'phd'):
        level = None
    gpa4 = None
    try:
        gpa = float(request.query_params.get('gpa') or '')
        scale = request.query_params.get('scale') or '4'
        gpa4 = gpa / 5.0 if scale == '20' else gpa
        if not (0 < gpa4 <= 4.5):
            gpa4 = None
    except (TypeError, ValueError):
        gpa4 = None
    field = (request.query_params.get('field') or '').strip().lower()
    field_words = [w for w in field.replace(',', ' ').split() if w]

    out = []
    for s in Scholarship.objects.filter(is_active=True).select_related('university'):
        score, bd = _score_scholarship(s, level, gpa4, field_words)
        try:
            days = s.days_until_deadline()
        except Exception:
            days = None
        out.append({
            'id': s.id,
            'title': s.title,
            'university_name': s.university.name,
            'university_city': s.university.city,
            'type': s.type,
            'level': s.level,
            'score': score,
            'breakdown': bd,
            'days_left': days,
            'application_deadline': s.application_deadline,
            'application_link': s.application_link,
        })
    out.sort(key=lambda x: -x['score'])
    return Response({'count': len(out), 'results': out[:30]})


# ── SOP Generator + Export ───────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sop_generate_view(request):
    """POST /api/sop/ — Generate a motivation letter with the LLM."""
    from ai_assistant.llm_client import chat_completion, is_available as llm_available
    full_name = (request.data.get('full_name') or '').strip()[:100]
    program = (request.data.get('program') or '').strip()[:200]
    university = (request.data.get('university') or '').strip()[:200]
    level = (request.data.get('level') or '').strip()[:50]
    background = (request.data.get('background') or '').strip()[:2000]
    goals = (request.data.get('goals') or '').strip()[:2000]
    lang = (request.data.get('lang') or 'en').strip().lower()
    if lang not in ('en', 'fr', 'ar'):
        lang = 'en'
    if not (full_name and program and background and goals):
        return Response(
            {'error': 'full_name, program, background and goals are required.'},
            status=400,
        )
    if not llm_available():
        return Response({'error': 'AI service unavailable.'}, status=503)
    lang_name = {'en': 'English', 'fr': 'French', 'ar': 'Arabic'}[lang]
    letter = chat_completion(
        messages=[
            {'role': 'system', 'content': (
                'You write outstanding motivation letters (statements of purpose) for '
                f'international scholarship applications. Write in {lang_name}. Structure: '
                'greeting, introduction (who + what applying for), academic background '
                '(2 paragraphs tying past to program), motivation for this university/program '
                '(1 paragraph, specific), career goals + why this scholarship matters '
                '(1 paragraph), closing. 400-600 words. Warm, specific, no placeholders '
                'except [brackets] where the student must add personal details. '
                'Return ONLY the letter.'
            )},
            {'role': 'user', 'content': (
                f"Student: {full_name}\nApplying for: {program} ({level}) at {university}\n"
                f"Background: {background}\nGoals: {goals}"
            )},
        ],
        temperature=0.7,
        max_tokens=2048,
    )
    if not letter:
        return Response({'error': 'Generation failed.'}, status=502)
    return Response({'letter': letter.strip()})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sop_export_view(request):
    """POST /api/sop/export/ — Download the letter as PDF (en/fr) or DOCX."""
    from django.http import FileResponse
    import io
    letter = (request.data.get('letter') or '').strip()
    fmt = (request.data.get('format') or 'pdf').strip().lower()
    name = (request.data.get('full_name') or 'motivation-letter').strip()[:60]
    if not letter:
        return Response({'error': 'Letter text is required.'}, status=400)
    if len(letter) > 12000:
        return Response({'error': 'Letter too long.'}, status=400)

    safe = ''.join(c if c.isalnum() or c in (' ', '-', '_') else '' for c in name).strip() or 'letter'

    if fmt == 'docx':
        from docx import Document
        from docx.shared import Pt
        doc = Document()
        style = doc.styles['Normal']
        style.font.size = Pt(11)
        for para in letter.split('\n'):
            p = para.strip()
            if p:
                doc.add_paragraph(p)
        buf = io.BytesIO()
        doc.save(buf)
        buf.seek(0)
        resp = FileResponse(buf, content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        resp['Content-Disposition'] = f'attachment; filename="{safe}.docx"'
        return resp

    # PDF (latin scripts; Arabic shaping isn't available server-side — use DOCX for Arabic)
    from fpdf import FPDF
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 16)
    pdf.cell(0, 12, 'Motivation Letter', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(4)
    pdf.set_font('Helvetica', '', 11)
    for para in letter.split('\n'):
        p = para.strip()
        if not p:
            pdf.ln(4)
            continue
        pdf.multi_cell(0, 6, p)
        pdf.ln(2)
    buf = io.BytesIO(bytes(pdf.output()))
    resp = FileResponse(buf, content_type='application/pdf')
    resp['Content-Disposition'] = f'attachment; filename="{safe}.pdf"'
    return resp


# ── Documents ────────────────────────────────────────────────

class DocumentViewSet(viewsets.ModelViewSet):
    """
    CRUD /api/documents/
    """
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(
            student__user=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):
        from students.models import Student
        student, _ = Student.objects.get_or_create(user=self.request.user)
        doc = serializer.save(student=student)
        if doc.file:
            doc.file_name = doc.file.name.split('/')[-1]
            doc.file_size = doc.file.size
            doc.save(update_fields=['file_name', 'file_size'])
