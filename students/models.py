from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import random
import string


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')

    phone = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)

    education_level = models.CharField(max_length=100, blank=True, null=True)
    field_of_study = models.CharField(max_length=200, blank=True, null=True)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)

    # One-time payment: once paid, always premium
    is_premium = models.BooleanField(default=False)
    payment_date = models.DateTimeField(blank=True, null=True)
    payment_id = models.CharField(max_length=200, blank=True, null=True)

    # Email verification
    is_email_verified = models.BooleanField(default=False)

    saved_scholarships = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.user.email}"

    def activate_premium(self, payment_id=None):
        """Activate premium permanently after one-time payment"""
        self.is_premium = True
        self.payment_date = timezone.now()
        self.payment_id = payment_id
        self.save(update_fields=['is_premium', 'payment_date', 'payment_id'])


class EmailVerification(models.Model):
    """Stores 2FA verification codes for email verification"""
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(default=timezone.now)
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} - {self.code}"

    @staticmethod
    def generate_code():
        return ''.join(random.choices(string.digits, k=6))

    def is_expired(self):
        return (timezone.now() - self.created_at).total_seconds() > 300  # 5 minutes

    def mark_used(self):
        self.is_used = True
        self.save(update_fields=['is_used'])
