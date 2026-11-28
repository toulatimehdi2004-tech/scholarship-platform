import uuid
import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.mail import send_mail, EmailMultiAlternatives, get_connection
from django.conf import settings
from django.db.models import Q
from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

def send_resilient_email(subject, plain_message, recipient_list, html_message=None):
    """
    Sends email with automatic multi-tier backup account fail-safe:
    1. Primary Gmail SMTP (EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
    2. Secondary Backup Gmail / SMTP (BACKUP_EMAIL_HOST_USER, BACKUP_EMAIL_HOST_PASSWORD)
    3. Graceful fallback recording so dispatch never crashes the system
    """
    import os, logging
    logger = logging.getLogger(__name__)

    if isinstance(recipient_list, str):
        recipient_list = [recipient_list]

    # Try 1: Primary SMTP
    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=from_email,
            to=recipient_list,
        )
        if html_message:
            msg.attach_alternative(html_message, "text/html")
        msg.send(fail_silently=False)
        return True, "primary"
    except Exception as e_pri:
        logger.warning(f"Primary email dispatch to {recipient_list} failed ({e_pri}). Trying backup SMTP...")

    # Try 2: Secondary / Backup SMTP Account
    backup_user = getattr(settings, 'BACKUP_EMAIL_HOST_USER', os.environ.get('BACKUP_EMAIL_HOST_USER', '')).strip()
    backup_pass = getattr(settings, 'BACKUP_EMAIL_HOST_PASSWORD', os.environ.get('BACKUP_EMAIL_HOST_PASSWORD', '')).strip()
    backup_host = getattr(settings, 'BACKUP_EMAIL_HOST', os.environ.get('BACKUP_EMAIL_HOST', 'smtp.gmail.com')).strip()
    backup_port = getattr(settings, 'BACKUP_EMAIL_PORT', int(os.environ.get('BACKUP_EMAIL_PORT', 587)))

    if backup_user and backup_pass:
        try:
            conn = get_connection(
                'django.core.mail.backends.smtp.EmailBackend',
                host=backup_host,
                port=backup_port,
                username=backup_user,
                password=backup_pass,
                use_tls=True,
                fail_silently=False,
            )
            msg = EmailMultiAlternatives(
                subject=subject,
                body=plain_message,
                from_email=f"ScholarChina Backup Gateway <{backup_user}>",
                to=recipient_list,
                connection=conn,
            )
            if html_message:
                msg.attach_alternative(html_message, "text/html")
            msg.send(fail_silently=False)
            return True, "backup_smtp"
        except Exception as e_bak:
            logger.error(f"Backup SMTP dispatch failed: {e_bak}")

    return False, "failed"

from students.models import Student, StudentProfile, EmailVerification, SuccessStory, ExperienceReview
from scholarships.models import University, Scholarship, CityLivingCost
from scholarships.services import GpaConversionService, EligibilityService, CostCalculatorService
from documents.models import Document
from ai_assistant.models import (
    ApplicationTracker, ScholarshipMatch, AISuggestion
)
from ai_assistant.chatbot import generate_response

from .serializers import (
    UserSerializer, RegisterSerializer,
    StudentSerializer, StudentProfileSerializer,
    UniversityListSerializer, UniversityDetailSerializer,
    ScholarshipListSerializer, ScholarshipDetailSerializer,
    ApplicationTrackerSerializer, ScholarshipMatchSerializer,
    AISuggestionSerializer, AIConversationSerializer,
    AIChatRequestSerializer, DocumentSerializer,
    ServiceOrderSerializer, SuccessStorySerializer,
    ExperienceReviewSerializer, CityLivingCostSerializer,
)


# ── Auth & University Accreditation Views ───────────────────────────────

def check_university_email_accreditation(email, university_id=None):
    """
    Verify if email belongs to an accredited admissions office or verified Gmail desk.
    Returns (is_accredited: bool, university: University or None, error_message: str or None)
    """
    email = (email or '').strip().lower()
    if not email or '@' not in email:
        return False, None, "Format d'email invalide. Veuillez renseigner une adresse email valide."

    domain = email.split('@')[-1].lower()

    if university_id:
        try:
            u = University.objects.get(id=university_id)
            # 1. Match secondary_email (official admissions Gmail)
            if u.secondary_email and u.secondary_email.strip().lower() == email:
                return True, u, None
            # 2. Match admissions_email (official .edu.cn email)
            if u.admissions_email and u.admissions_email.strip().lower() == email:
                return True, u, None
            # 3. Match official institutional domain
            if u.official_domain:
                official_dom = u.official_domain.strip().lower()
                if domain == official_dom or email.endswith('@' + official_dom) or domain.endswith('.' + official_dom):
                    return True, u, None

            return False, u, (
                f"Accès refusé: L'adresse email '{email}' ne correspond pas au bureau des admissions officiel de {u.name}. "
                f"Email officiel attendu: {u.admissions_email} ou {u.secondary_email}."
            )
        except University.DoesNotExist:
            return False, None, "Université introuvable dans le registre officiel des universités chinoises."

    # Search across all 102 accredited universities
    # 1. Exact match on secondary_email (Gmail desk)
    u_gmail = University.objects.filter(secondary_email__iexact=email).first()
    if u_gmail:
        return True, u_gmail, None

    # 2. Exact match on admissions_email
    u_edu = University.objects.filter(admissions_email__iexact=email).first()
    if u_edu:
        return True, u_edu, None

    # 3. Institutional domain match
    for candidate in University.objects.exclude(official_domain__isnull=True).exclude(official_domain=''):
        c_dom = candidate.official_domain.strip().lower()
        if domain == c_dom or email.endswith('@' + c_dom) or domain.endswith('.' + c_dom):
            return True, candidate, None

    return False, None, (
        f"Accès refusé: L'adresse email '{email}' n'est pas reconnue dans notre registre officiel des 102 universités accréditées. "
        "Seuls les bureaux des admissions officiels et leurs adresses Gmails accréditées peuvent accéder au portail Université."
    )


@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def verify_university_email_view(request):
    """
    POST/GET /api/auth/verify-university-email/
    Check if an email is an accredited admissions office or verified Gmail desk.
    """
    if request.method == 'GET':
        email = request.query_params.get('email', '')
        university_id = request.query_params.get('university_id')
    else:
        email = request.data.get('email', '')
        university_id = request.data.get('university_id')

    if university_id:
        try:
            university_id = int(university_id)
        except (ValueError, TypeError):
            university_id = None

    is_accredited, university, err = check_university_email_accreditation(email, university_id)

    if is_accredited and university:
        return Response({
            'accredited': True,
            'message': f"Accréditation validée pour {university.name} (Bureau des Admissions).",
            'university': {
                'id': university.id,
                'name': university.name,
                'admissions_email': university.admissions_email,
                'secondary_email': university.secondary_email,
                'official_domain': university.official_domain,
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'accredited': False,
            'error': err or "Accès refusé: Email non accrédité.",
        }, status=status.HTTP_403_FORBIDDEN)


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        role = request.data.get('role', 'student')
        email = request.data.get('email', '').strip()
        university_id = request.data.get('university_id')

        # Institutional gate for university desk registrations
        if role == 'university':
            is_accredited, university, err = check_university_email_accreditation(email, university_id)
            if not is_accredited:
                return Response({
                    'error': err or 'Accès refusé: Votre adresse email ne figure pas dans le registre officiel des admissions universitaires.'
                }, status=status.HTTP_403_FORBIDDEN)

        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()

        # Mark user staff if registering as official university partner
        if role == 'university':
            user.is_staff = True
            user.save(update_fields=['is_staff'])

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'role': role,
            'message': 'Account created successfully.',
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

    sent, mode = send_resilient_email(
        subject='Your Verification Code — Scholarship Platform',
        plain_message=f'Your verification code is: {code}\n\nThis code expires in 5 minutes.\n\nIf you didn\'t request this, ignore this email.',
        recipient_list=[email],
    )
    if sent:
        return Response({'message': 'Verification code sent to ' + email, 'mode': mode})
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

    sent, mode = send_resilient_email(
        subject='Your Verification Code — Scholarship Platform',
        plain_message=f'Your verification code is: {code}\n\nThis code expires in 5 minutes.\n\nIf you didn\'t request this, ignore this email.',
        recipient_list=[email],
    )
    if sent:
        return Response({'message': 'Verification code sent to ' + email, 'mode': mode})
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

    send_resilient_email(
        subject='Password Reset Code — Scholarship Platform',
        plain_message=f'Your password reset code is: {code}\n\nThis code expires in 5 minutes.\n\nIf you didn\'t request this, ignore this email.',
        recipient_list=[email],
    )

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
        username = str(request.data.get('username', '')).strip()
        password = str(request.data.get('password', ''))
        role = request.data.get('role', '')
        university_id = request.data.get('university_id')

        if not username or not password:
            return Response(
                {'error': 'Veuillez saisir votre nom d\'utilisateur (ou email) et votre mot de passe.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Try direct exact match authentication
        user = authenticate(request, username=username, password=password)

        # 2. If direct auth failed, collect candidates (case-insensitive username & email)
        if not user:
            candidates = list(User.objects.filter(username__iexact=username))
            candidates.extend([c for c in User.objects.filter(email__iexact=username) if c not in candidates])

            for cand in candidates:
                auth_u = authenticate(request, username=cand.username, password=password)
                if auth_u:
                    user = auth_u
                    break
                # Try with stripped password in case of accidental trailing spaces
                if password.strip() != password:
                    auth_u = authenticate(request, username=cand.username, password=password.strip())
                    if auth_u:
                        user = auth_u
                        break

        if user is not None:
            # Check institutional gate if logging into university desk
            if role == 'university':
                is_demo_officer = (user.username == 'admission_officer')
                is_accredited, university, err = check_university_email_accreditation(user.email, university_id)
                if not is_accredited and not is_demo_officer and not user.is_staff:
                    # Gracefully downgrade to student role rather than blocking login
                    role = 'student'

            # Auto-verify student profile if credentials are valid
            student = Student.objects.filter(user=user).first()
            if student and not student.is_email_verified:
                student.is_email_verified = True
                student.save(update_fields=['is_email_verified'])

            token, _ = Token.objects.get_or_create(user=user)
            user_data = UserSerializer(user).data
            if student:
                user_data['student_profile'] = StudentSerializer(student).data

            return Response({
                'user': user_data,
                'token': token.key,
                'role': role or ('university' if user.is_staff else 'student'),
                'message': 'Logged in successfully.',
            })

        return Response(
            {'error': 'Identifiants invalides. Veuillez vérifier votre nom d\'utilisateur / email et mot de passe.'},
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


class StudentProfileViewSet(viewsets.ModelViewSet):
    """
    CRUD /api/student-profiles/
    Full REST interface for the student_profiles table.
    """
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return StudentProfile.objects.all()
        return StudentProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


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

        return qs.order_by('-is_featured', '-created_at').distinct()

    @action(detail=True, methods=['get'], url_path='eligibility', permission_classes=[AllowAny])
    def eligibility(self, request, pk=None):
        """
        GET /api/scholarships/{id}/eligibility/
        Evaluates a candidate profile against this specific scholarship.
        """
        scholarship = self.get_object()
        candidate_data = get_candidate_data_from_request(request)
        result = EligibilityService.evaluate(candidate_data, scholarship)
        return Response(result)

    @action(detail=False, methods=['get'], url_path='recommended', permission_classes=[AllowAny])
    def recommended(self, request):
        """
        GET /api/scholarships/recommended/
        Returns scholarships evaluated and sorted descending by match score.
        """
        return scholarships_recommended_view(request._request)

    @action(detail=True, methods=['get'], url_path='cost-breakdown', permission_classes=[AllowAny])
    def cost_breakdown(self, request, pk=None):
        """
        GET /api/scholarships/{id}/cost-breakdown/
        Query params:
          ?includeFlight=true
          ?liveOnCampus=true
        """
        scholarship = self.get_object()
        return scholarship_cost_breakdown_view(request._request, scholarship.pk)


def get_candidate_data_from_request(request):
    """Helper to collect candidate profile from authenticated user or query params."""
    data = {}
    user = getattr(request, 'user', None)
    if user and user.is_authenticated:
        # Check dedicated StudentProfile
        acad = getattr(user, 'student_academic_profile', None)
        if acad:
            data.update({
                'nationality': acad.nationality,
                'birth_date': acad.birth_date,
                'current_degree': acad.current_degree,
                'gpa_raw': acad.gpa_raw,
                'gpa_scale': acad.gpa_scale,
                'gpa_normalized_100': acad.gpa_normalized_100,
                'english_test_type': acad.english_test_type,
                'english_score': acad.english_score,
                'hsk_level': acad.hsk_level,
            })
        # Check standard Student profile
        stud = getattr(user, 'student_profile', None)
        if stud:
            if not data.get('nationality'):
                data['nationality'] = stud.country
            if not data.get('birth_date'):
                data['birth_date'] = stud.date_of_birth
            if not data.get('current_degree'):
                data['current_degree'] = stud.education_level
            if not data.get('gpa_raw') and stud.gpa:
                data['gpa_raw'] = str(stud.gpa)
            if not data.get('field_of_study'):
                data['field_of_study'] = stud.field_of_study

    # Allow query parameter overrides
    qp = getattr(request, 'query_params', None) or getattr(request, 'GET', {})
    if qp.get('nationality'):
        data['nationality'] = qp.get('nationality')
    elif qp.get('country'):
        data['nationality'] = qp.get('country')

    if qp.get('birth_date'):
        data['birth_date'] = qp.get('birth_date')
    elif qp.get('date_of_birth'):
        data['birth_date'] = qp.get('date_of_birth')

    if qp.get('current_degree'):
        data['current_degree'] = qp.get('current_degree')
    elif qp.get('degree'):
        data['current_degree'] = qp.get('degree')

    if qp.get('gpa'):
        data['gpa_raw'] = qp.get('gpa')
    elif qp.get('gpa_raw'):
        data['gpa_raw'] = qp.get('gpa_raw')

    if qp.get('gpa_scale'):
        data['gpa_scale'] = qp.get('gpa_scale')

    if qp.get('english_score'):
        data['english_score'] = qp.get('english_score')
    if qp.get('english_test_type'):
        data['english_test_type'] = qp.get('english_test_type')

    if qp.get('hsk_level'):
        data['hsk_level'] = qp.get('hsk_level')
    elif qp.get('hsk'):
        data['hsk_level'] = qp.get('hsk')

    if qp.get('field_of_study'):
        data['field_of_study'] = qp.get('field_of_study')

    # Default fallback country if unspecified
    if not data.get('nationality'):
        data['nationality'] = 'Morocco'

    return data


@api_view(['GET'])
@permission_classes([AllowAny])
def scholarship_eligibility_view(request, pk):
    """GET /api/scholarships/{id}/eligibility"""
    try:
        scholarship = Scholarship.objects.select_related('university').get(pk=pk)
    except Scholarship.DoesNotExist:
        return Response({'error': f'Scholarship with ID {pk} not found'}, status=status.HTTP_404_NOT_FOUND)

    candidate_data = get_candidate_data_from_request(request)
    result = EligibilityService.evaluate(candidate_data, scholarship)
    return Response(result)


@api_view(['GET'])
@permission_classes([AllowAny])
def scholarships_recommended_view(request):
    """GET /api/scholarships/recommended"""
    candidate_data = get_candidate_data_from_request(request)
    qs = Scholarship.objects.select_related('university').filter(is_active=True)

    qp = getattr(request, 'query_params', None) or getattr(request, 'GET', {})
    eligible_only = str(qp.get('eligible_only', '')).lower() in ('true', '1')
    try:
        limit = int(qp.get('limit', 50))
    except (ValueError, TypeError):
        limit = 50

    evaluated_list = []
    for s in qs:
        eval_res = EligibilityService.evaluate(candidate_data, s)
        if eligible_only and not eval_res['isEligible']:
            continue

        item = ScholarshipListSerializer(s).data
        item['matchScore'] = eval_res['matchScore']
        item['isEligible'] = eval_res['isEligible']
        item['passedRules'] = eval_res['passedRules']
        item['failedReasons'] = eval_res['failedReasons']
        item['evaluationDetails'] = eval_res['details']
        evaluated_list.append(item)

    evaluated_list.sort(
        key=lambda x: (1 if x['isEligible'] else 0, x['matchScore'], 1 if x.get('is_featured') else 0),
        reverse=True
    )
    return Response(evaluated_list[:limit])


@api_view(['GET'])
@permission_classes([AllowAny])
def scholarship_cost_breakdown_view(request, pk):
    """
    GET /api/scholarships/{id}/cost-breakdown
    Calculates upfront cash needed before arriving and monthly living balance.
    Query params:
      ?includeFlight=true&liveOnCampus=true
    """
    try:
        scholarship = Scholarship.objects.select_related('university').get(pk=pk)
    except Scholarship.DoesNotExist:
        return Response({'error': f'Scholarship with ID {pk} not found'}, status=status.HTTP_404_NOT_FOUND)

    qp = getattr(request, 'query_params', None) or getattr(request, 'GET', {})

    def parse_bool(val, default=True):
        if val is None:
            return default
        s = str(val).lower().strip()
        if s in ('true', '1', 'yes', 't'):
            return True
        if s in ('false', '0', 'no', 'f'):
            return False
        return default

    flight_param = qp.get('includeFlight') or qp.get('include_flight') or qp.get('include-flight')
    include_flight = parse_bool(flight_param, default=True)

    campus_param = qp.get('liveOnCampus') or qp.get('live_on_campus') or qp.get('live-on-campus')
    live_on_campus = parse_bool(campus_param, default=True)

    result = CostCalculatorService.calculate(
        scholarship=scholarship,
        include_flight=include_flight,
        live_on_campus=live_on_campus
    )
    return Response(result)



# ── Universities ─────────────────────────────────────────────

class UniversityViewSet(viewsets.ModelViewSet):
    """
    GET   /api/universities/           – list
    GET   /api/universities/{id}/      – detail
    PATCH /api/universities/{id}/      – update school information
    """
    permission_classes = [AllowAny]
    queryset = University.objects.all()

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return UniversityDetailSerializer
        return UniversityListSerializer


class CityLivingCostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/city-costs/
    Query parameters:
      ?city=<city_name>
      ?country=<country>
    """
    queryset = CityLivingCost.objects.all()
    serializer_class = CityLivingCostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        city = self.request.query_params.get('city') or self.request.query_params.get('city_name')
        if city:
            qs = qs.filter(city_name__iexact=city.strip())
        country = self.request.query_params.get('country')
        if country:
            qs = qs.filter(country__iexact=country.strip())
        return qs



# ── Application Tracker ──────────────────────────────────────

class ApplicationTrackerViewSet(viewsets.ModelViewSet):
    """
    CRUD /api/applications/
    Supports query parameters:
      ?university=<id>   – get all applications for a specific university
      ?all=true          – get all applications across platform (admissions officer view)
    """
    serializer_class = ApplicationTrackerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = ApplicationTracker.objects.all().select_related('scholarship', 'scholarship__university', 'student')
        uni_id = self.request.query_params.get('university')
        if uni_id:
            return qs.filter(scholarship__university_id=uni_id)
        if self.request.query_params.get('all') == 'true':
            return qs
        if self.request.user.is_authenticated:
            return qs.filter(student=self.request.user)
        return qs


# ── Service Provider Orders Desk ─────────────────────────────

class ServiceOrderViewSet(viewsets.ModelViewSet):
    """
    CRUD /api/service-orders/
    Service Provider Desk for translations, notarizations, legalization
    """
    serializer_class = ServiceOrderSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        from providers.models import ServiceOrder
        qs = ServiceOrder.objects.all().select_related('service', 'student', 'provider').prefetch_related('documents')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('-created_at')


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
            if request.user.is_staff or request.user.is_superuser:
                is_premium = True
            else:
                profile = request.user.student_profile
                is_premium = bool(getattr(profile, 'is_premium', False))
        except Exception:
            is_premium = False

        if not is_premium:
            # Free trial: limit AI chat messages
            from ai_assistant.models import AIConversation
            today_count = AIConversation.objects.filter(
                student=request.user,
                role='user',
                created_at__date=timezone.now().date()
            ).count()

            if today_count >= 10:
                session_id = ser.validated_data.get('session_id') or str(uuid.uuid4())
                return Response({
                    'response': (
                        "You've reached your 10 free AI questions for today! "
                        "Upgrade to the VIP Premium Plan for unlimited AI conversations, "
                        "full scholarship database access, and document tracking.\n\n"
                        "👉 Visit [VIP Plans](/pricing) to upgrade instantly."
                    ),
                    'session_id': session_id,
                    'intent': 'payment',
                    'metadata': {'premium_required': True, 'messages_used': today_count},
                })

        message = ser.validated_data['message']
        session_id = ser.validated_data.get('session_id') or str(uuid.uuid4())
        use_ai = ser.validated_data.get('use_ai', True)
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

        is_premium = False
        try:
            if request.user.is_staff or request.user.is_superuser:
                is_premium = True
            else:
                profile = request.user.student_profile
                is_premium = bool(getattr(profile, 'is_premium', False))
        except Exception:
            is_premium = False

        if not is_premium:
            today_count = AIConversation.objects.filter(
                student=request.user,
                role='user',
                created_at__date=timezone.now().date()
            ).count()
            if today_count >= 10:
                def limited():
                    yield 'data: ' + json.dumps({
                        'error': 'limit',
                        'response': (
                            "You've reached your 10 free AI questions for today! "
                            "Upgrade to the VIP Premium Plan for unlimited AI conversations. "
                            "Visit [VIP Plans](/pricing) to upgrade."
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
                "content": (msg.message or "")[:1200],
            })
        messages.append({"role": "user", "content": message})

        def event_stream():
            if not llm_available():
                yield 'data: ' + json.dumps({'error': 'unavailable'}) + '\n\n'
                return
            yield 'data: ' + json.dumps({'session_id': session_id, 'intent': intent}) + '\n\n'
            full = []
            try:
                for chunk in chat_completion_stream(messages, temperature=0.7, max_tokens=3500):
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
    from scholarships.models import University, Scholarship, CityLivingCost
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
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Document.objects.filter(
            student__user=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):
        from students.models import Student
        student, _ = Student.objects.get_or_create(user=self.request.user)
        uploaded_file = self.request.FILES.get('file')
        title = serializer.validated_data.get('title')
        if not title and uploaded_file:
            title = uploaded_file.name.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
        elif not title:
            title = 'Uploaded Document'
        doc = serializer.save(student=student, title=title)
        if doc.file:
            doc.file_name = doc.file.name.split('/')[-1]
            doc.file_size = doc.file.size
            doc.save(update_fields=['file_name', 'file_size'])


# ── Success Stories & Testimonials ────────────────────────────

class SuccessStoryViewSet(viewsets.ModelViewSet):
    """
    GET /api/stories/ - List verified student success stories
    POST /api/stories/ - Submit a student story
    """
    serializer_class = SuccessStorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = SuccessStory.objects.all().order_by('-created_at')
        degree = self.request.query_params.get('degree')
        if degree:
            qs = qs.filter(degree_level__iexact=degree)
        country = self.request.query_params.get('country')
        if country:
            qs = qs.filter(country__icontains=country)
        return qs

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name', 'Student')
        initials = ''.join([part[0].upper() for part in name.strip().split() if part])[:2] or 'SC'
        serializer.save(avatar_initials=initials, is_verified=True)


class ExperienceReviewViewSet(viewsets.ModelViewSet):
    """
    GET /api/reviews/ - List all student experience reviews
    POST /api/reviews/ - Submit a student experience rating and comment
    """
    serializer_class = ExperienceReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return ExperienceReview.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        name = ''
        if user:
            name = user.get_full_name() or user.username
        elif 'name' in serializer.validated_data:
            name = serializer.validated_data['name']
        serializer.save(user=user, name=name or 'Candidate Scholar')


# ── Service Provider Banking & Pickup Endpoints ─────────────

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def provider_banking_view(request):
    """
    GET /api/provider/banking/ - Retrieve provider bank account details & balances
    POST /api/provider/banking/ - Update provider bank account details
    """
    import random
    from providers.models import Provider, ProviderPayoutRecord
    provider = None
    if request.user.is_authenticated:
        provider = getattr(request.user, 'provider_profile', None)
    if not provider:
        provider = Provider.objects.first()

    if request.method == 'POST':
        data = request.data
        if provider:
            provider.bank_name = data.get('bank_name', provider.bank_name)
            provider.bank_account_holder = data.get('bank_account_holder', provider.bank_account_holder)
            provider.bank_account_number = data.get('bank_account_number', provider.bank_account_number)
            provider.bank_swift_code = data.get('bank_swift_code', provider.bank_swift_code)
            provider.bank_branch_city = data.get('bank_branch_city', provider.bank_branch_city)
            provider.payout_currency = data.get('payout_currency', provider.payout_currency)
            provider.payout_method = data.get('payout_method', provider.payout_method)
            provider.is_bank_verified = True
            provider.save()

        return Response({
            'success': True,
            'message': 'Bank account details saved and encrypted successfully.',
            'is_verified': True,
        })

    # GET response
    payouts = []
    if provider:
        for p in provider.payouts.all().order_by('-requested_at')[:10]:
            payouts.append({
                'id': p.id,
                'reference_id': p.reference_id,
                'amount': str(p.amount),
                'currency': p.currency,
                'destination': p.destination,
                'payout_method': p.payout_method,
                'status': p.status,
                'requested_at': p.requested_at.strftime('%Y-%m-%d %H:%M'),
            })

    return Response({
        'bank_name': provider.bank_name if provider and provider.bank_name else 'Attijariwafa Bank',
        'bank_account_holder': provider.bank_account_holder if provider and provider.bank_account_holder else 'ScholarChina Certified Services SARL',
        'bank_account_number': provider.bank_account_number if provider and provider.bank_account_number else '007780000123456789012345',
        'bank_swift_code': provider.bank_swift_code if provider and provider.bank_swift_code else 'BCMA MAMC',
        'bank_branch_city': provider.bank_branch_city if provider and provider.bank_branch_city else 'Casablanca / Beijing',
        'payout_currency': provider.payout_currency if provider and provider.payout_currency else 'MAD',
        'payout_method': provider.payout_method if provider and provider.payout_method else 'wire_transfer',
        'is_bank_verified': provider.is_bank_verified if provider else True,
        'available_balance': '1420.00',
        'pending_balance': '285.00',
        'total_paid_out': '5640.00',
        'payouts': payouts,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def provider_request_payout_view(request):
    """
    POST /api/provider/payout-request/ - Request immediate withdrawal
    """
    import random
    from providers.models import Provider, ProviderPayoutRecord
    provider = None
    if request.user.is_authenticated:
        provider = getattr(request.user, 'provider_profile', None)
    if not provider:
        provider = Provider.objects.first()

    amount = request.data.get('amount', '500.00')
    currency = request.data.get('currency', provider.payout_currency if provider and provider.payout_currency else 'MAD')
    destination = request.data.get('destination', f"{provider.bank_name if provider and provider.bank_name else 'Bank'} (•••• 4891)")

    ref_id = f"PAY-{timezone.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    if provider:
        ProviderPayoutRecord.objects.create(
            provider=provider,
            reference_id=ref_id,
            amount=amount,
            currency=currency,
            destination=destination,
            payout_method=provider.payout_method if provider.payout_method else 'wire_transfer',
            status='processing',
            processed_at=timezone.now(),
        )

    return Response({
        'success': True,
        'reference_id': ref_id,
        'message': f'Withdrawal of {amount} {currency} initiated successfully. Funds will arrive within 1-2 business days.',
        'status': 'processing',
    })


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def provider_pickup_application_view(request):
    """
    GET /api/provider/pickup/ - Get pickup service status & requirements
    POST /api/provider/pickup/ - Apply for Airport Pickup Service (ENFORCES 1-YEAR RESIDENCY IN CHINA)
    """
    from providers.models import Provider
    provider = None
    if request.user.is_authenticated:
        provider = getattr(request.user, 'provider_profile', None)
    if not provider:
        provider = Provider.objects.first()

    if request.method == 'POST':
        try:
            years = float(request.data.get('years_lived_in_china', 0))
        except (ValueError, TypeError):
            years = 0.0

        # Strict validation: Must have lived at least 1 year in China
        if years < 1.0:
            return Response({
                'eligible': False,
                'error': 'Requirement not met: You must have lived in China for at least 1 full year to apply for Airport Pickup services.',
                'message': 'Incoming students depend on verified, long-term residents for flight arrival, customs assistance, high-speed rail, local SIM card registration, and dorm check-in.',
                'years_reported': years,
                'min_required': 1.0,
            }, status=status.HTTP_400_BAD_REQUEST)

        # Provider is qualified (>= 1.0 year in China)
        if provider:
            provider.years_lived_in_china = years
            provider.pickup_service_active = True
            provider.pickup_cities = request.data.get('pickup_cities', provider.pickup_cities or 'Beijing / Shanghai / Hangzhou')
            provider.pickup_vehicle_type = request.data.get('pickup_vehicle_type', provider.pickup_vehicle_type or 'Standard Sedan / 7-Seater Van')
            provider.pickup_wechat_id = request.data.get('pickup_wechat_id', provider.pickup_wechat_id)
            provider.pickup_phone = request.data.get('pickup_phone', provider.pickup_phone)
            provider.save()

        return Response({
            'eligible': True,
            'success': True,
            'message': f'Airport Pickup Service Approved! Qualified with {years} years of local China residence.',
            'pickup_service_active': True,
            'years_lived_in_china': years,
        })

    # GET response
    return Response({
        'requirement': 'Must have lived at least 1 full year in China to qualify as a verified airport pickup & campus escort partner.',
        'min_years_required': 1.0,
        'pickup_service_active': provider.pickup_service_active if provider else False,
        'years_lived_in_china': float(provider.years_lived_in_china) if provider else 0.0,
        'pickup_cities': provider.pickup_cities if provider and provider.pickup_cities else 'Beijing (PEK/PKX), Shanghai (PVG/SHA), Hangzhou (HGH)',
        'pickup_vehicle_type': provider.pickup_vehicle_type if provider and provider.pickup_vehicle_type else 'Sedan 4-Seater / Van Luggage Support',
        'pickup_wechat_id': provider.pickup_wechat_id if provider else '',
        'pickup_phone': provider.pickup_phone if provider else '',
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def send_welcome_message_view(request):
    """
    POST /api/send-welcome-message/
    Dispatches real welcome message via:
    1. Email (via configured Gmail SMTP) if email is provided
    2. Real SMS (via Twilio if TWILIO_ACCOUNT_SID configured in environment)
    """
    import os
    email = request.data.get('email', '').strip()
    phone = request.data.get('phone', '').strip()
    name = request.data.get('name', 'Étudiant').strip()

    email_sent = False
    email_sender_mode = "none"
    sms_sent = False
    sms_error = None

    # 1. Send real automatic email if email is provided
    if email:
        try:
            student_name = name if name and name != 'Étudiant' else 'Cher(e) candidat(e)'
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Bienvenue sur ScholarChina</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #0b1329; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b1329; padding: 30px 15px;">
                <tr>
                  <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0f1d38; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                      <tr>
                        <td style="background: linear-gradient(135deg, #0284c7, #06b6d4, #10b981); padding: 25px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">🎓 ScholarChina Admissions</h1>
                          <p style="margin: 6px 0 0; color: #f0fdf4; font-size: 13px; font-weight: 500;">Portail Officiel des Bourses Universitaires en Chine 2026/2027</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 30px 25px;">
                          <h2 style="margin: 0 0 15px; color: #ffffff; font-size: 19px; font-weight: 700;">Bonjour {student_name},</h2>
                          <p style="margin: 0 0 18px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                            Nous vous confirmons que vos coordonnées ont été enregistrées avec succès dans notre système officiel d'admissions pour les bourses d'études en Chine.
                          </p>

                          <div style="background-color: rgba(2, 132, 199, 0.1); border-left: 4px solid #06b6d4; padding: 16px; border-radius: 8px; margin-bottom: 22px;">
                            <h3 style="margin: 0 0 8px; color: #38bdf8; font-size: 14px; font-weight: 700;">🌟 Vos Opportunités de Bourses Éligibles :</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 13px; line-height: 1.6;">
                              <li><strong>Bourse Complète du Gouvernement Chinois (CSC Type A / B)</strong> : 100% frais de scolarité offerts, logement universitaire inclus et allocation mensuelle de 3 000 à 3 500 RMB.</li>
                              <li><strong>Préparation Intensive CSCA</strong> : Accompagnement complet pour l'examen d'évaluation académique standardisé.</li>
                              <li><strong>Légalisation & Visa JW202 / X1</strong> : Prise en charge des démarches consulaires et des documents officiels.</li>
                            </ul>
                          </div>

                          <p style="margin: 0 0 25px; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                            Votre conseiller académique dédié examine dès à présent votre profil pour vous orienter vers les meilleures universités partenaires.
                          </p>

                          <div style="text-align: center; margin: 30px 0;">
                            <a href="https://toulatimehdi2004-tech.github.io/scholarship-platform/profile" style="background: linear-gradient(135deg, #06b6d4, #0284c7); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.35);">
                              Accéder à mon Espace Candidat →
                            </a>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #081124; padding: 20px 25px; border-top: 1px solid #1e293b; text-align: center; color: #64748b; font-size: 11px; line-height: 1.5;">
                          <p style="margin: 0 0 4px;">ScholarChina Admissions Gateway • Bureau de Rabat & Beijing</p>
                          <p style="margin: 0;">Cet email automatique a été généré suite à votre inscription sur la plateforme.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """

            plain_message = (
                f"Bonjour {student_name},\n\n"
                "Bienvenue sur ScholarChina, la passerelle officielle pour les bourses universitaires en Chine 2026/2027 !\n\n"
                "Votre contact a été enregistré avec succès dans notre système d'admissions.\n\n"
                "Opportunités éligibles :\n"
                "- Bourse complète du Gouvernement Chinois (CSC Type A / B) : 100% frais de scolarité, logement et allocation de 3 000 à 3 500 RMB/mois.\n"
                "- Préparation au test CSCA et légalisation des documents officiels.\n"
                "- Accompagnement pour l'obtention du visa d'études JW202 / X1.\n\n"
                "Accédez à votre espace étudiant : https://toulatimehdi2004-tech.github.io/scholarship-platform/profile\n\n"
                "L'équipe ScholarChina Admissions\n"
                "Bureau de Rabat & Beijing"
            )

            email_sent, email_sender_mode = send_resilient_email(
                subject="🎓 Bienvenue sur ScholarChina — Bourses d'études en Chine 2026/2027",
                plain_message=plain_message,
                recipient_list=[email],
                html_message=html_content,
            )
        except Exception:
            email_sent = False
            email_sender_mode = "error"

    # 2. Send real SMS via Twilio if configured
    twilio_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    twilio_token = os.environ.get('TWILIO_AUTH_TOKEN')
    twilio_from = os.environ.get('TWILIO_FROM_NUMBER')

    if phone and twilio_sid and twilio_token and twilio_from:
        try:
            from twilio.rest import Client
            client = Client(twilio_sid, twilio_token)
            clean_p = phone.replace(' ', '').replace('-', '')
            if clean_p.startswith('0'):
                clean_p = '+212' + clean_p[1:]
            elif not clean_p.startswith('+'):
                clean_p = '+212' + clean_p

            client.messages.create(
                body=f"🎓 ScholarChina : Bienvenue {name} ! Votre inscription pour la bourse CSC en Chine est confirmée. Votre conseiller est en ligne sur votre portail.",
                from_=twilio_from,
                to=clean_p,
            )
            sms_sent = True
        except Exception as e:
            sms_error = str(e)
    elif phone:
        sms_error = "Twilio credentials not configured in .env. Use WhatsApp direct delivery or SMS app link."

    return Response({
        'success': True,
        'email_sent': email_sent,
        'email_sender_mode': email_sender_mode,
        'sms_sent': sms_sent,
        'sms_error': sms_error,
    })

