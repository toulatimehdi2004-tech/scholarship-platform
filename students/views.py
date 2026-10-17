from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Student

def homepage(request):
    """Homepage with role selection"""
    return render(request, 'students/homepage.html')

def register(request):
    """Student registration view"""
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        
        # Check if passwords match
        if password != password2:
            messages.error(request, 'Passwords do not match!')
            return render(request, 'students/register.html')
        
        # Check if username already exists
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already taken!')
            return render(request, 'students/register.html')
        
        # Check if email already exists
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already registered!')
            return render(request, 'students/register.html')
        
        # Create the user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        # Create the student profile
        student = Student.objects.create(
            user=user
        )
        
        # Log the user in
        login(request, user)
        messages.success(request, 'Registration successful! Welcome to the platform!')
        return redirect('profile')
    
    return render(request, 'students/register.html')

def login_view(request):
    """Student login view"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            messages.success(request, 'Logged in successfully!')
            return redirect('profile')
        else:
            messages.error(request, 'Invalid username or password!')
    
    return render(request, 'students/login.html')

def logout_view(request):
    """Student logout view"""
    logout(request)
    messages.success(request, 'Logged out successfully!')
    return redirect('login')

@login_required(login_url='login')
def profile(request):
    """Student profile view"""
    student = request.user.student_profile
    context = {
        'student': student,
        'is_premium_active': student.is_premium_active(),
        'premium_display': student.get_premium_type_display()
    }
    return render(request, 'students/profile.html', context)


# ── ScholarTrack Application CRM ViewSet ───────────────────────

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from .models import ApplicationTracker
from .serializers import ApplicationTrackerSerializer
from scholarships.models import Scholarship


class StudentApplicationTrackerViewSet(viewsets.ModelViewSet):
    """
    CRUD for ScholarTrack-style Application CRM Pipeline
    GET /api/tracker/ -> Returns tracked applications grouped by status
    POST /api/tracker/ -> Add a scholarship to tracker
    PATCH /api/tracker/<id>/ -> Update status, notes, or checklist
    DELETE /api/tracker/<id>/ -> Remove from tracker
    """
    serializer_class = ApplicationTrackerSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get_student(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return None
        student, _ = Student.objects.get_or_create(user=user)
        return student

    def get_queryset(self):
        student = self.get_student()
        if not student:
            return ApplicationTracker.objects.none()
        return ApplicationTracker.objects.filter(student=student).select_related(
            'scholarship', 'scholarship__university'
        ).order_by('-updated_at')

    def list(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({
                'authenticated': False,
                'applications': [],
                'grouped': {
                    'wishlist': [],
                    'preparing_docs': [],
                    'submitted': [],
                    'interview': [],
                    'accepted': [],
                    'rejected': [],
                },
                'stats': {
                    'total': 0,
                    'wishlist': 0,
                    'preparing_docs': 0,
                    'submitted': 0,
                    'interview': 0,
                    'accepted': 0,
                    'rejected': 0,
                }
            }, status=status.HTTP_200_OK)

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        apps = serializer.data

        grouped = {
            'wishlist': [],
            'preparing_docs': [],
            'submitted': [],
            'interview': [],
            'accepted': [],
            'rejected': [],
        }

        for app in apps:
            st = app.get('status', 'wishlist')
            if st in grouped:
                grouped[st].append(app)
            else:
                grouped.setdefault(st, []).append(app)

        stats = {
            'total': len(apps),
            'wishlist': len(grouped['wishlist']),
            'preparing_docs': len(grouped['preparing_docs']),
            'submitted': len(grouped['submitted']),
            'interview': len(grouped['interview']),
            'accepted': len(grouped['accepted']),
            'rejected': len(grouped['rejected']),
        }

        return Response({
            'authenticated': True,
            'applications': apps,
            'grouped': grouped,
            'stats': stats,
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        student = self.get_student()
        if not student:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        scholarship_id = request.data.get('scholarship_id') or request.data.get('scholarship')
        if not scholarship_id:
            return Response({'error': 'scholarship_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            scholarship = Scholarship.objects.get(id=scholarship_id)
        except Scholarship.DoesNotExist:
            return Response({'error': 'Scholarship not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status', 'wishlist')
        notes = request.data.get('notes', '')
        portal_id = request.data.get('portal_application_id', '')

        # Build initial checklist from scholarship required_documents if available
        initial_checklist = {}
        if scholarship.required_documents:
            docs = scholarship.required_documents
            if isinstance(docs, str):
                import json
                try:
                    docs = json.loads(docs)
                except Exception:
                    docs = [docs]
            for doc in docs:
                initial_checklist[str(doc).strip()] = False

        tracker_item, created = ApplicationTracker.objects.get_or_create(
            student=student,
            scholarship=scholarship,
            defaults={
                'status': new_status,
                'notes': notes,
                'portal_application_id': portal_id,
                'checklist': initial_checklist,
            }
        )

        if not created:
            # If already exists, update fields if provided
            if 'status' in request.data:
                tracker_item.status = request.data['status']
            if 'notes' in request.data:
                tracker_item.notes = request.data['notes']
            if 'portal_application_id' in request.data:
                tracker_item.portal_application_id = request.data['portal_application_id']
            if 'checklist' in request.data and isinstance(request.data['checklist'], dict):
                tracker_item.checklist.update(request.data['checklist'])
            tracker_item.save()

        serializer = self.get_serializer(tracker_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)