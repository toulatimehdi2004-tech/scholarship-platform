from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from .models import UniversityProfile, UniversityScholarship, Application
from students.models import Student
from scholarships.models import Scholarship, University

def university_register(request):
    """University registration view"""
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        country = request.POST.get('country')
        city = request.POST.get('city')
        website = request.POST.get('website')
        
        # Check if passwords match
        if password != password2:
            messages.error(request, 'Passwords do not match!')
            return render(request, 'universities/register.html')
        
        # Check if user already exists
        if User.objects.filter(username=email).exists():
            messages.error(request, 'Email already registered!')
            return render(request, 'universities/register.html')
        
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already registered!')
            return render(request, 'universities/register.html')
        
        # Create user
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name
        )
        
        # Create university profile
        university = UniversityProfile.objects.create(
            user=user,
            name=name,
            country=country,
            city=city,
            website=website,
            contact_email=email
        )
        
        # Log the university in
        login(request, user)
        messages.success(request, f'University "{name}" registered successfully!')
        return redirect('university_dashboard')
    
    return render(request, 'universities/register.html')

def university_login(request):
    """University login view"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Check if user is a university
            if hasattr(user, 'university_profile'):
                login(request, user)
                messages.success(request, f'Welcome back, {user.university_profile.name}!')
                return redirect('university_dashboard')
            else:
                messages.error(request, 'This account is not registered as a university.')
        else:
            messages.error(request, 'Invalid email or password!')
    
    return render(request, 'universities/login.html')

def university_logout(request):
    """University logout view"""
    logout(request)
    messages.success(request, 'Logged out successfully!')
    return redirect('university_login')

@login_required(login_url='university_login')
def university_dashboard(request):
    """University dashboard view"""
    university = request.user.university_profile
    
    # Get statistics
    total_scholarships = university.scholarships.count()
    total_applications = Application.objects.filter(scholarship__university=university).count()
    pending_applications = Application.objects.filter(scholarship__university=university, status='pending').count()
    total_enrollments = Application.objects.filter(scholarship__university=university, status='enrolled').count()
    
    # Get recent scholarships
    recent_scholarships = university.scholarships.order_by('-created_at')[:5]
    
    # Get recent applications
    recent_applications = Application.objects.filter(
        scholarship__university=university
    ).order_by('-applied_at')[:5]
    
    context = {
        'university': university,
        'total_scholarships': total_scholarships,
        'total_applications': total_applications,
        'pending_applications': pending_applications,
        'total_enrollments': total_enrollments,
        'recent_scholarships': recent_scholarships,
        'recent_applications': recent_applications,
    }
    
    return render(request, 'universities/dashboard.html', context)

@login_required(login_url='university_login')
def manage_scholarships(request):
    """Manage university scholarships"""
    university = request.user.university_profile
    scholarships = university.scholarships.all().order_by('-created_at')
    
    context = {
        'scholarships': scholarships,
        'total_count': scholarships.count(),
    }
    
    return render(request, 'universities/manage_scholarships.html', context)

@login_required(login_url='university_login')
def add_scholarship(request):
    """Add a new scholarship"""
    university = request.user.university_profile
    
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        scholarship_type = request.POST.get('type')
        level = request.POST.get('level')
        amount = request.POST.get('amount')
        currency = request.POST.get('currency', 'USD')
        duration = request.POST.get('duration')
        application_deadline = request.POST.get('application_deadline')
        eligibility_criteria = request.POST.get('eligibility_criteria')
        minimum_gpa = request.POST.get('minimum_gpa')
        application_fee = request.POST.get('application_fee', 0)
        application_link = request.POST.get('application_link')
        contact_email = request.POST.get('contact_email')
        contact_phone = request.POST.get('contact_phone')
        
        # Create scholarship
        scholarship = UniversityScholarship.objects.create(
            university=university,
            title=title,
            description=description,
            type=scholarship_type,
            level=level,
            amount=amount or None,
            currency=currency,
            duration=duration,
            application_deadline=application_deadline,
            eligibility_criteria=eligibility_criteria,
            minimum_gpa=minimum_gpa or None,
            application_fee=application_fee,
            application_link=application_link,
            contact_email=contact_email or university.contact_email,
            contact_phone=contact_phone or university.contact_phone,
            status='draft'
        )
        
        messages.success(request, f'Scholarship "{title}" created successfully!')
        return redirect('manage_scholarships')
    
    context = {
        'type_choices': UniversityScholarship.TYPE_CHOICES,
        'level_choices': UniversityScholarship.LEVEL_CHOICES,
    }
    
    return render(request, 'universities/add_scholarship.html', context)

@login_required(login_url='university_login')
def edit_scholarship(request, scholarship_id):
    """Edit a scholarship"""
    university = request.user.university_profile
    scholarship = get_object_or_404(UniversityScholarship, id=scholarship_id, university=university)
    
    if request.method == 'POST':
        scholarship.title = request.POST.get('title')
        scholarship.description = request.POST.get('description')
        scholarship.type = request.POST.get('type')
        scholarship.level = request.POST.get('level')
        scholarship.amount = request.POST.get('amount') or None
        scholarship.currency = request.POST.get('currency', 'USD')
        scholarship.duration = request.POST.get('duration')
        scholarship.application_deadline = request.POST.get('application_deadline')
        scholarship.eligibility_criteria = request.POST.get('eligibility_criteria')
        scholarship.minimum_gpa = request.POST.get('minimum_gpa') or None
        scholarship.application_fee = request.POST.get('application_fee', 0)
        scholarship.application_link = request.POST.get('application_link')
        scholarship.contact_email = request.POST.get('contact_email')
        scholarship.contact_phone = request.POST.get('contact_phone')
        scholarship.save()
        
        messages.success(request, f'Scholarship "{scholarship.title}" updated successfully!')
        return redirect('manage_scholarships')
    
    context = {
        'scholarship': scholarship,
        'type_choices': UniversityScholarship.TYPE_CHOICES,
        'level_choices': UniversityScholarship.LEVEL_CHOICES,
    }
    
    return render(request, 'universities/edit_scholarship.html', context)

@login_required(login_url='university_login')
def delete_scholarship(request, scholarship_id):
    """Delete a scholarship"""
    university = request.user.university_profile
    scholarship = get_object_or_404(UniversityScholarship, id=scholarship_id, university=university)
    
    if request.method == 'POST':
        title = scholarship.title
        scholarship.delete()
        messages.success(request, f'Scholarship "{title}" deleted successfully!')
        return redirect('manage_scholarships')
    
    context = {
        'scholarship': scholarship,
    }
    
    return render(request, 'universities/delete_scholarship.html', context)

@login_required(login_url='university_login')
def publish_scholarship(request, scholarship_id):
    """Publish a scholarship"""
    university = request.user.university_profile
    scholarship = get_object_or_404(UniversityScholarship, id=scholarship_id, university=university)
    
    if request.method == 'POST':
        scholarship.publish()
        
        # Also create in the main Scholarship model
        university_model, created = University.objects.get_or_create(
            name=university.name,
            defaults={
                'country': university.country,
                'city': university.city,
                'website': university.website,
                'is_verified': university.is_verified,
            }
        )
        
        Scholarship.objects.create(
            title=scholarship.title,
            university=university_model,
            description=scholarship.description,
            type=scholarship.type,
            level=scholarship.level,
            amount=scholarship.amount,
            currency=scholarship.currency,
            duration=scholarship.duration,
            application_deadline=scholarship.application_deadline,
            eligibility_criteria=scholarship.eligibility_criteria,
            minimum_gpa=scholarship.minimum_gpa,
            application_fee=scholarship.application_fee,
            application_link=scholarship.application_link,
            contact_email=scholarship.contact_email,
            contact_phone=scholarship.contact_phone,
            is_active=True,
            published_by=request.user
        )
        
        messages.success(request, f'Scholarship "{scholarship.title}" published successfully!')
        return redirect('manage_scholarships')
    
    context = {
        'scholarship': scholarship,
    }
    
    return render(request, 'universities/publish_scholarship.html', context)

@login_required(login_url='university_login')
def view_applications(request):
    """View all applications for university scholarships"""
    university = request.user.university_profile
    applications = Application.objects.filter(
        scholarship__university=university
    ).order_by('-applied_at')
    
    context = {
        'applications': applications,
        'total_count': applications.count(),
    }
    
    return render(request, 'universities/view_applications.html', context)

@login_required(login_url='university_login')
def application_detail(request, application_id):
    """View application detail"""
    university = request.user.university_profile
    application = get_object_or_404(
        Application, 
        id=application_id, 
        scholarship__university=university
    )
    
    context = {
        'application': application,
        'status_choices': Application.STATUS_CHOICES,
    }
    
    return render(request, 'universities/application_detail.html', context)

@login_required(login_url='university_login')
def update_application_status(request, application_id):
    """Update application status"""
    university = request.user.university_profile
    application = get_object_or_404(
        Application, 
        id=application_id, 
        scholarship__university=university
    )
    
    if request.method == 'POST':
        new_status = request.POST.get('status')
        notes = request.POST.get('notes', '')
        
        if new_status in dict(Application.STATUS_CHOICES):
            application.status = new_status
            application.admin_notes = notes
            application.save()
            
            messages.success(request, f'Application status updated to {application.get_status_display()}')
        else:
            messages.error(request, 'Invalid status')
    
    return redirect('application_detail', application_id=application.id)

@login_required(login_url='university_login')
def university_profile(request):
    """University profile view"""
    university = request.user.university_profile
    
    context = {
        'university': university,
    }
    
    return render(request, 'universities/profile.html', context)

@login_required(login_url='university_login')
def edit_university_profile(request):
    """Edit university profile"""
    university = request.user.university_profile
    
    if request.method == 'POST':
        university.name = request.POST.get('name')
        university.description = request.POST.get('description')
        university.country = request.POST.get('country')
        university.city = request.POST.get('city')
        university.address = request.POST.get('address')
        university.website = request.POST.get('website')
        university.contact_email = request.POST.get('contact_email')
        university.contact_phone = request.POST.get('contact_phone')
        university.save()
        
        messages.success(request, 'Profile updated successfully!')
        return redirect('university_profile')
    
    context = {
        'university': university,
    }
    
    return render(request, 'universities/edit_profile.html', context)