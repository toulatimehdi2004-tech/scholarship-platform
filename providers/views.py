from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from .models import Service, ServiceCategory, Provider, ServiceOrder
from students.models import Student

def service_list(request):
    """View all services with search and filters"""
    
    # Get all active services
    services = Service.objects.filter(is_active=True)
    
    # Search functionality
    search_query = request.GET.get('search', '')
    if search_query:
        services = services.filter(
            Q(name__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(provider__business_name__icontains=search_query)
        )
    
    # Filter by category
    category_id = request.GET.get('category', '')
    if category_id:
        services = services.filter(category_id=category_id)
    
    # Get all categories for filter dropdown
    categories = ServiceCategory.objects.filter(is_active=True)
    
    context = {
        'services': services,
        'categories': categories,
        'search_query': search_query,
        'selected_category': category_id,
        'total_count': services.count(),
    }
    
    return render(request, 'providers/service_list.html', context)

def service_detail(request, service_id):
    """View a single service detail"""
    service = get_object_or_404(Service, id=service_id, is_active=True)
    
    # Calculate commission
    commission_rate = service.provider.get_commission(service.category)
    commission_amount = service.get_commission_amount()
    provider_payout = service.price - commission_amount
    
    context = {
        'service': service,
        'commission_rate': commission_rate,
        'commission_amount': commission_amount,
        'provider_payout': provider_payout,
    }
    
    return render(request, 'providers/service_detail.html', context)

@login_required(login_url='login')
def book_service(request, service_id):
    """Book a service with document upload"""
    service = get_object_or_404(Service, id=service_id, is_active=True)
    student = request.user.student_profile
    
    if request.method == 'POST':
        quantity = int(request.POST.get('quantity', 1))
        notes = request.POST.get('notes', '')
        
        # Calculate totals
        total_amount = service.price * quantity
        commission_amount = service.get_commission_amount() * quantity
        provider_payout = total_amount - commission_amount
        
        # Create the order
        order = ServiceOrder.objects.create(
            service=service,
            student=student,
            provider=service.provider,
            quantity=quantity,
            total_amount=total_amount,
            commission_amount=commission_amount,
            provider_payout=provider_payout,
            currency=service.currency,
            notes=notes,
            status='pending'
        )
        
        # Handle document upload
        uploaded_files = request.FILES.getlist('documents')
        from documents.models import Document
        for file in uploaded_files:
            Document.objects.create(
                student=student,
                order=order,
                title=f"Document for Order #{order.id} - {file.name}",
                document_type='other',
                file=file,
                file_name=file.name,
                file_size=file.size,
                status='uploaded'
            )
        
        if uploaded_files:
            messages.success(request, f'Service booked successfully! {len(uploaded_files)} document(s) uploaded.')
        else:
            messages.success(request, f'Service booked successfully! Order #{order.id}')
        
        return redirect('order_detail', order_id=order.id)
    
    # Get student's documents for the form
    from documents.models import Document
    student_documents = Document.objects.filter(student=student)
    
    context = {
        'service': service,
        'student_documents': student_documents,
    }
    
    return render(request, 'providers/book_service.html', context)


@login_required(login_url='login')
def my_orders(request):
    """View all orders for the current student"""
    student = request.user.student_profile
    orders = ServiceOrder.objects.filter(student=student).order_by('-created_at')
    
    context = {
        'orders': orders,
        'total_orders': orders.count(),
    }
    
    return render(request, 'providers/my_orders.html', context)

@login_required(login_url='login')
def order_detail(request, order_id):
    """View a single order detail"""
    student = request.user.student_profile
    order = get_object_or_404(ServiceOrder, id=order_id, student=student)
    
    context = {
        'order': order,
    }
    
    return render(request, 'providers/order_detail.html', context)
# ============================================================
# PROVIDER DASHBOARD VIEWS
# ============================================================

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout

def provider_register(request):
    """Provider registration view"""
    if request.method == 'POST':
        business_name = request.POST.get('business_name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        country = request.POST.get('country')
        city = request.POST.get('city')
        phone = request.POST.get('phone')
        description = request.POST.get('description')
        
        if password != password2:
            messages.error(request, 'Passwords do not match!')
            return render(request, 'providers/register.html')
        
        if User.objects.filter(username=email).exists():
            messages.error(request, 'Email already registered!')
            return render(request, 'providers/register.html')
        
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=business_name
        )
        
        provider = Provider.objects.create(
            user=user,
            business_name=business_name,
            business_description=description,
            country=country,
            city=city,
            phone=phone,
                   )
        
        login(request, user)
        messages.success(request, f'Provider "{business_name}" registered successfully!')
        return redirect('provider_dashboard')
    
    return render(request, 'providers/register.html')

def provider_login(request):
    """Provider login view"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            if hasattr(user, 'provider_profile'):
                login(request, user)
                messages.success(request, f'Welcome back, {user.provider_profile.business_name}!')
                return redirect('provider_dashboard')
            else:
                messages.error(request, 'This account is not registered as a service provider.')
        else:
            messages.error(request, 'Invalid email or password!')
    
    return render(request, 'providers/login.html')

def provider_logout(request):
    """Provider logout view"""
    logout(request)
    messages.success(request, 'Logged out successfully!')
    return redirect('provider_login')

@login_required(login_url='provider_login')
def provider_dashboard(request):
    """Provider dashboard view"""
    provider = request.user.provider_profile
    
    total_services = provider.services.count()
    active_services = provider.services.filter(is_active=True).count()
    total_orders = ServiceOrder.objects.filter(provider=provider).count()
    pending_orders = ServiceOrder.objects.filter(provider=provider, status='pending').count()
    completed_orders = ServiceOrder.objects.filter(provider=provider, status='completed').count()
    
    total_earnings = sum(
        order.provider_payout 
        for order in ServiceOrder.objects.filter(provider=provider, status='completed')
    ) or 0
    
    recent_orders = ServiceOrder.objects.filter(provider=provider).order_by('-created_at')[:5]
    recent_services = provider.services.all().order_by('-created_at')[:5]
    
    context = {
        'provider': provider,
        'total_services': total_services,
        'active_services': active_services,
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'completed_orders': completed_orders,
        'total_earnings': total_earnings,
        'recent_orders': recent_orders,
        'recent_services': recent_services,
    }
    
    return render(request, 'providers/dashboard.html', context)

@login_required(login_url='provider_login')
def provider_services(request):
    """Provider's services list"""
    provider = request.user.provider_profile
    services = provider.services.all().order_by('-created_at')
    
    context = {
        'provider': provider,
        'services': services,
        'total_count': services.count(),
    }
    
    return render(request, 'providers/manage_services.html', context)

@login_required(login_url='provider_login')
def provider_add_service(request):
    """Add a new service"""
    provider = request.user.provider_profile
    categories = ServiceCategory.objects.filter(is_active=True)
    
    if request.method == 'POST':
        name = request.POST.get('name')
        description = request.POST.get('description')
        category_id = request.POST.get('category')
        price = request.POST.get('price')
        currency = request.POST.get('currency', 'USD')
        delivery_time = request.POST.get('delivery_time')
        is_online = request.POST.get('is_online') == 'on'
        is_onsite = request.POST.get('is_onsite') == 'on'
        
        category = get_object_or_404(ServiceCategory, id=category_id)
        
        service = Service.objects.create(
            provider=provider,
            category=category,
            name=name,
            description=description,
            price=price,
            currency=currency,
            delivery_time=delivery_time,
            is_online=is_online,
            is_onsite=is_onsite,
            is_active=True
        )
        
        messages.success(request, f'Service "{name}" created successfully!')
        return redirect('provider_services')
    
    context = {
        'categories': categories,
    }
    
    return render(request, 'providers/add_service.html', context)

@login_required(login_url='provider_login')
def provider_edit_service(request, service_id):
    """Edit a service"""
    provider = request.user.provider_profile
    service = get_object_or_404(Service, id=service_id, provider=provider)
    categories = ServiceCategory.objects.filter(is_active=True)
    
    if request.method == 'POST':
        service.name = request.POST.get('name')
        service.description = request.POST.get('description')
        service.category_id = request.POST.get('category')
        service.price = request.POST.get('price')
        service.currency = request.POST.get('currency', 'USD')
        service.delivery_time = request.POST.get('delivery_time')
        service.is_online = request.POST.get('is_online') == 'on'
        service.is_onsite = request.POST.get('is_onsite') == 'on'
        service.is_active = request.POST.get('is_active') == 'on'
        service.save()
        
        messages.success(request, f'Service "{service.name}" updated successfully!')
        return redirect('provider_services')
    
    context = {
        'service': service,
        'categories': categories,
    }
    
    return render(request, 'providers/edit_service.html', context)

@login_required(login_url='provider_login')
def provider_delete_service(request, service_id):
    """Delete a service"""
    provider = request.user.provider_profile
    service = get_object_or_404(Service, id=service_id, provider=provider)
    
    if request.method == 'POST':
        name = service.name
        service.delete()
        messages.success(request, f'Service "{name}" deleted successfully!')
        return redirect('provider_services')
    
    context = {
        'service': service,
    }
    
    return render(request, 'providers/delete_service.html', context)

@login_required(login_url='provider_login')
def provider_orders(request):
    """View all orders for provider"""
    provider = request.user.provider_profile
    orders = ServiceOrder.objects.filter(provider=provider).order_by('-created_at')
    
    context = {
        'provider': provider,
        'orders': orders,
        'total_count': orders.count(),
    }
    
    return render(request, 'providers/provider_orders.html', context)

@login_required(login_url='provider_login')
def provider_order_detail(request, order_id):
    """View order detail for provider"""
    provider = request.user.provider_profile
    order = get_object_or_404(ServiceOrder, id=order_id, provider=provider)
    
    context = {
        'order': order,
        'status_choices': ServiceOrder.STATUS_CHOICES,
    }
    
    return render(request, 'providers/provider_order_detail.html', context)

@login_required(login_url='provider_login')
def provider_update_order_status(request, order_id):
    """Update order status"""
    provider = request.user.provider_profile
    order = get_object_or_404(ServiceOrder, id=order_id, provider=provider)
    
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in dict(ServiceOrder.STATUS_CHOICES):
            order.status = new_status
            if new_status == 'completed':
                order.completed_date = timezone.now()
            order.save()
            messages.success(request, f'Order #{order.id} status updated to {order.get_status_display()}')
        else:
            messages.error(request, 'Invalid status')
    
    return redirect('provider_order_detail', order_id=order.id)

@login_required(login_url='provider_login')
def provider_earnings(request):
    """View provider earnings"""
    provider = request.user.provider_profile
    completed_orders = ServiceOrder.objects.filter(provider=provider, status='completed').order_by('-created_at')
    
    total_earnings = sum(order.provider_payout for order in completed_orders) or 0
    total_commission = sum(order.commission_amount for order in completed_orders) or 0
    total_revenue = sum(order.total_amount for order in completed_orders) or 0
    
    context = {
        'provider': provider,
        'orders': completed_orders,
        'total_earnings': total_earnings,
        'total_commission': total_commission,
        'total_revenue': total_revenue,
        'total_orders': completed_orders.count(),
    }
    
    return render(request, 'providers/earnings.html', context)

@login_required(login_url='provider_login')
def provider_profile(request):
    """Provider profile view"""
    provider = request.user.provider_profile
    
    context = {
        'provider': provider,
    }
    
    return render(request, 'providers/provider_profile.html', context)

@login_required(login_url='provider_login')
def provider_edit_profile(request):
    """Edit provider profile"""
    provider = request.user.provider_profile
    
    if request.method == 'POST':
        provider.business_name = request.POST.get('business_name')
        provider.business_description = request.POST.get('business_description')
        provider.country = request.POST.get('country')
        provider.city = request.POST.get('city')
        provider.phone = request.POST.get('phone')
        provider.address = request.POST.get('address')
        provider.website = request.POST.get('website')
        provider.save()
        
        messages.success(request, 'Profile updated successfully!')
        return redirect('provider_profile')
    
    context = {
        'provider': provider,
    }
    
    return render(request, 'providers/edit_profile.html', context)