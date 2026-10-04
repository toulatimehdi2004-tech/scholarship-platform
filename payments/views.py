from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from .models import PremiumPlan, PaymentTransaction
from students.models import Student
import json
import uuid

@login_required(login_url='login')
def premium_plans(request):
    """Display all premium plans for students to choose"""
    student = request.user.student_profile
    plans = PremiumPlan.objects.filter(is_active=True)
    
    # Check if student already has premium
    has_premium = student.is_premium and student.is_premium_active()
    current_plan = None
    if has_premium:
        current_plan = student.premium_type
    
    context = {
        'plans': plans,
        'has_premium': has_premium,
        'current_plan': current_plan,
        'student': student,
    }
    
    return render(request, 'payments/premium_plans.html', context)

@login_required(login_url='login')
def upgrade_premium(request, plan_type):
    """Upgrade student to premium"""
    student = request.user.student_profile
    
    # Check if already has premium
    if student.is_premium and student.is_premium_active():
        messages.warning(request, 'You already have an active premium subscription!')
        return redirect('premium_plans')
    
    # Get the plan
    plan = get_object_or_404(PremiumPlan, plan_type=plan_type, is_active=True)
    
    if request.method == 'POST':
        # Create a payment transaction (manual for testing)
        payment_id = f"pay_{uuid.uuid4().hex[:12]}"
        
        transaction = PaymentTransaction.objects.create(
            student=student,
            plan=plan,
            amount=plan.price,
            currency=plan.currency,
            payment_method='manual',
            payment_id=payment_id,
            status='completed'  # Auto-complete for testing (Stripe will be added later)
        )
        
        # Activate premium
        if transaction.activate_premium():
            messages.success(request, f'🎉 Successfully upgraded to {plan.name}!')
            return redirect('payment_success')
        else:
            messages.error(request, 'Something went wrong. Please try again.')
            return redirect('premium_plans')
    
    context = {
        'plan': plan,
        'student': student,
    }
    
    return render(request, 'payments/upgrade_premium.html', context)

@login_required(login_url='login')
def payment_success(request):
    """Payment success page"""
    return render(request, 'payments/success.html')

@login_required(login_url='login')
def payment_cancel(request):
    """Payment cancelled page"""
    return render(request, 'payments/cancel.html')