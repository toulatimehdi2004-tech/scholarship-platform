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