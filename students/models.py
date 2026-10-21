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


class ApplicationTracker(models.Model):
    """
    ScholarTrack-style Application CRM Pipeline:
    Tracks student applications through 5+ Kanban stages.
    """
    STATUS_CHOICES = [
        ('wishlist', 'Saved / Wishlist'),
        ('preparing_docs', 'Preparing Documents'),
        ('submitted', 'Submitted to Portal'),
        ('interview', 'Under Review / Interview'),
        ('accepted', 'Accepted (Won 🏆)'),
        ('rejected', 'Not Selected'),
    ]

    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='tracked_applications'
    )
    scholarship = models.ForeignKey(
        'scholarships.Scholarship', on_delete=models.CASCADE, related_name='tracked_by_students'
    )
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='wishlist')
    notes = models.TextField(blank=True, null=True, help_text="Personal notes or portal login references")
    portal_application_id = models.CharField(max_length=100, blank=True, null=True)
    checklist = models.JSONField(
        default=dict, blank=True,
        help_text="Checked state for required docs: e.g. {'passport': true, 'physical_exam': false}"
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        unique_together = ['student', 'scholarship']

    def __str__(self):
        return f"{self.student.user.username} - {self.scholarship.title} [{self.status}]"


class SuccessStory(models.Model):
    """
    Student Success Stories & Testimonials:
    Real stories of students who won Chinese scholarships with their tips and journey.
    """
    DEGREE_CHOICES = [
        ('bachelor', 'Bachelor / Licence'),
        ('master', 'Master / Ingénieur'),
        ('phd', 'PhD / Doctorat'),
        ('language', '1-Year Chinese Language'),
    ]

    name = models.CharField(max_length=120)
    country = models.CharField(max_length=100, default='Morocco')
    city = models.CharField(max_length=100, blank=True, default='')
    university_name = models.CharField(max_length=200)
    degree_level = models.CharField(max_length=50, default='master')
    field_of_study = models.CharField(max_length=200)
    scholarship_type = models.CharField(max_length=200, default='CSC Full Scholarship')
    year_awarded = models.IntegerField(default=2025)
    golden_tip = models.TextField(help_text="Single most important tip for applicants")
    story = models.TextField(help_text="Detailed personal journey and experience")
    rating = models.IntegerField(default=5)
    avatar_initials = models.CharField(max_length=10, blank=True, default='')
    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.university_name} ({self.year_awarded})"


class ExperienceReview(models.Model):
    """
    Candidate & Student Platform Experience Review:
    Rating (1-5 stars) and feedback comment from students on their experience.
    """
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='experience_reviews')
    name = models.CharField(max_length=120, blank=True, default='')
    rating = models.PositiveSmallIntegerField(default=5, help_text="Rating from 1 to 5 stars")
    comment = models.TextField(blank=True, default='', help_text="Student feedback / comment")
    category = models.CharField(max_length=100, blank=True, default='General Experience')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name or (self.user.username if self.user else 'Anonymous')} - {self.rating}★"

