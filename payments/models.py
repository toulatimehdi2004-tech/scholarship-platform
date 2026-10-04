from django.db import models
from django.utils import timezone
from students.models import Student

class PremiumPlan(models.Model):
    """Premium subscription plans"""
    PLAN_TYPES = [
        ('premium', 'Premium'),
        ('premium_ai', 'Premium AI'),
    ]
    
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, unique=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    duration_months = models.PositiveIntegerField(default=12, help_text="Duration in months")
    is_active = models.BooleanField(default=True)
    
    # Features (as text for display)
    features = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.price} {self.currency}"
    
    class Meta:
        ordering = ['price']

class PaymentTransaction(models.Model):
    """Payment transaction record"""
    
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_METHODS = [
        ('stripe', 'Stripe'),
        ('paypal', 'PayPal'),
        ('manual', 'Manual'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    plan = models.ForeignKey(PremiumPlan, on_delete=models.CASCADE)
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='stripe')
    payment_id = models.CharField(max_length=200, blank=True, null=True, help_text="Stripe/PayPal payment ID")
    
    # Status
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Premium activation
    premium_start_date = models.DateTimeField(blank=True, null=True)
    premium_expiry_date = models.DateTimeField(blank=True, null=True)
    premium_activated = models.BooleanField(default=False)
    
    # Refund
    refund_id = models.CharField(max_length=200, blank=True, null=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    refund_reason = models.TextField(blank=True, null=True)
    
    # Additional info
    student_notes = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment #{self.id} - {self.student.user.username} - {self.plan.name}"
    
    def activate_premium(self):
        """Activate premium for the student"""
        if not self.premium_activated and self.status == 'completed':
            student = self.student
            student.is_premium = True
            student.premium_type = self.plan.plan_type
            student.premium_start_date = timezone.now()
            student.premium_expiry_date = timezone.now() + timezone.timedelta(days=self.plan.duration_months * 30)
            student.premium_payment_id = self.payment_id
            student.save()
            
            self.premium_start_date = student.premium_start_date
            self.premium_expiry_date = student.premium_expiry_date
            self.premium_activated = True
            self.save()
            return True
        return False