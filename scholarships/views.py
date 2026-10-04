from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from .models import Scholarship, University

def scholarship_list(request):
    """View all scholarships with search and filters"""
    
    # Get all active China scholarships by default
    scholarships = Scholarship.objects.filter(is_active=True, university__country='China')
    
    # Search functionality
    search_query = request.GET.get('search', '')
    if search_query:
        scholarships = scholarships.filter(
            Q(title__icontains=search_query) |
            Q(university__name__icontains=search_query) |
            Q(description__icontains=search_query)
        )
    
    # Filter by scholarship type
    scholarship_type = request.GET.get('type', '')
    if scholarship_type:
        scholarships = scholarships.filter(type=scholarship_type)
    
    # Filter by education level
    level = request.GET.get('level', '')
    if level:
        scholarships = scholarships.filter(level=level)
    
    # Filter by country
    country = request.GET.get('country', '')
    if country:
        scholarships = scholarships.filter(university__country=country)
    
    # Order by deadline (soonest first)
    scholarships = scholarships.order_by('application_deadline')
    
    # Get all universities for filter dropdown
    universities = University.objects.filter(is_verified=True)
    
    # Get unique countries for filter
    countries = University.objects.values_list('country', flat=True).distinct()
    
    context = {
        'scholarships': scholarships,
        'universities': universities,
        'countries': countries,
        'search_query': search_query,
        'selected_type': scholarship_type,
        'selected_level': level,
        'selected_country': country,
        # For the filter dropdowns
        'SCHOLARSHIP_TYPES': Scholarship.TYPE_CHOICES,
        'LEVEL_CHOICES': Scholarship.LEVEL_CHOICES,
        'total_count': scholarships.count(),
    }
    
    return render(request, 'scholarships/list.html', context)

def scholarship_detail(request, scholarship_id):
    """View a single scholarship detail"""
    scholarship = get_object_or_404(Scholarship, id=scholarship_id, is_active=True)
    
    # Increment view count
    scholarship.view_count += 1
    scholarship.save()
    
    # Check if the student has saved this scholarship
    is_saved = False
    if request.user.is_authenticated:
        student = request.user.student_profile
        if scholarship.id in student.saved_scholarships:
            is_saved = True
    
    context = {
        'scholarship': scholarship,
        'is_saved': is_saved,
        'days_left': scholarship.days_until_deadline(),
    }
    
    return render(request, 'scholarships/detail.html', context)

@login_required(login_url='login')
def save_scholarship(request, scholarship_id):
    """Save or unsave a scholarship"""
    scholarship = get_object_or_404(Scholarship, id=scholarship_id)
    student = request.user.student_profile
    
    # Toggle save/unsave
    if scholarship.id in student.saved_scholarships:
        student.saved_scholarships.remove(scholarship.id)
        messages.success(request, f'Removed "{scholarship.title}" from saved scholarships.')
    else:
        student.saved_scholarships.append(scholarship.id)
        messages.success(request, f'Saved "{scholarship.title}" to your list!')
    
    student.save()
    
    return redirect('scholarship_detail', scholarship_id=scholarship.id)