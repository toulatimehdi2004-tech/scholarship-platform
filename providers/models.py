from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class ServiceCategory(models.Model):
    """Service categories like Translation, Apostille, etc."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    default_commission = models.DecimalField(max_digits=5, decimal_places=2, default=10.00, help_text="Default commission percentage")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.name} ({self.default_commission}%)"
    
    class Meta:
        verbose_name_plural = "Service Categories"

class Provider(models.Model):
    """Service Provider (Translation, Apostille, Airport Pickup, etc.)"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='provider_profile')
    
    # Business information
    business_name = models.CharField(max_length=200)
    business_description = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='provider_logos/', blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Contact information
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verification_documents = models.JSONField(default=list, blank=True)
    
    # Categories this provider offers
    categories = models.ManyToManyField(ServiceCategory, blank=True)
    
    # Custom commission (override default for this provider)
    custom_commission = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, help_text="Override default commission for this provider")
    
    # Ratings
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.PositiveIntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.business_name} - {self.user.email}"
    
    def get_commission(self, category=None):
        """Get the commission rate for this provider"""
        if self.custom_commission is not None:
            return self.custom_commission
        if category and category.default_commission:
            return category.default_commission
        return 10.00  # Default fallback

class Service(models.Model):
    """Individual service offered by a provider"""
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name='services')
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE)
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    
    # Service details
    delivery_time = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., 2-3 days")
    is_online = models.BooleanField(default=True, help_text="Can be done online")
    is_onsite = models.BooleanField(default=False, help_text="Requires in-person visit")
    
    # Availability
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.provider.business_name}"
    
    def get_commission_amount(self):
        """Calculate the commission amount for this service"""
        commission_rate = self.provider.get_commission(self.category)
        return (self.price * commission_rate) / 100

class ServiceOrder(models.Model):
    """Order/Booking for a service"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE)
    
    # Order details
    quantity = models.PositiveIntegerField(default=1)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2)
    provider_payout = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Dates
    requested_date = models.DateField(blank=True, null=True)
    completed_date = models.DateTimeField(blank=True, null=True)
    
    # Additional info
    notes = models.TextField(blank=True, null=True)
    student_rating = models.PositiveIntegerField(blank=True, null=True, choices=[(i, i) for i in range(1, 6)])
    student_review = models.TextField(blank=True, null=True)
    
    # Tracking
    payment_id = models.CharField(max_length=200, blank=True, null=True)
    refund_id = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order #{self.id} - {self.service.name} - {self.student.user.username}"
    
    def calculate_payout(self):
        """Calculate provider payout after commission"""
        self.commission_amount = self.service.get_commission_amount()
        self.provider_payout = self.total_amount - self.commission_amount
        return self.provider_payout
    
    def save(self, *args, **kwargs):
        if not self.commission_amount or not self.provider_payout:
            self.calculate_payout()
        super().save(*args, **kwargs)