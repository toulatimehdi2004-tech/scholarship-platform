from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UniversityProfile(models.Model):
    """University profile model"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='university_profile')
    
    # Basic information
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='university_logos/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Location
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Contact information
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verification_documents = models.JSONField(default=list, blank=True)
    
    # Statistics
    total_scholarships = models.PositiveIntegerField(default=0)
    total_applications = models.PositiveIntegerField(default=0)
    total_enrollments = models.PositiveIntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class UniversityScholarship(models.Model):
    """Scholarship model for universities (extends the main Scholarship model)"""
    
    TYPE_CHOICES = [
        ('full', 'Full Scholarship'),
        ('partial', 'Partial Scholarship'),
        ('tuition', 'Tuition Fee Waiver'),
        ('living', 'Living Stipend'),
        ('research', 'Research Grant'),
        ('other', 'Other'),
    ]
    
    LEVEL_CHOICES = [
        ('bachelor', 'Bachelor'),
        ('master', 'Master'),
        ('phd', 'PhD'),
        ('postdoc', 'Postdoctoral'),
        ('exchange', 'Exchange Program'),
        ('summer', 'Summer School'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('closed', 'Closed'),
        ('archived', 'Archived'),
    ]
    
    # Relationships
    university = models.ForeignKey(UniversityProfile, on_delete=models.CASCADE, related_name='scholarships')
    
    # Basic information
    title = models.CharField(max_length=300)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='full')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='bachelor')
    
    # Financial details
    amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    currency = models.CharField(max_length=10, default='USD')
    duration = models.CharField(max_length=100, blank=True, null=True)
    
    # Dates
    application_deadline = models.DateTimeField()
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    
    # Eligibility
    eligibility_criteria = models.TextField()
    minimum_gpa = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    required_fields = models.JSONField(default=list, blank=True)
    
    # Application details
    application_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    application_link = models.URLField(blank=True, null=True)
    required_documents = models.JSONField(default=list, blank=True)
    
    # Contact
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.title} - {self.university.name}"
    
    def publish(self):
        """Publish the scholarship"""
        self.status = 'published'
        self.published_at = timezone.now()
        self.save()
        # Update the main Scholarship model will be handled by a signal

class Application(models.Model):
    """Student application to a scholarship"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('reviewing', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('enrolled', 'Enrolled'),
    ]
    
    scholarship = models.ForeignKey(UniversityScholarship, on_delete=models.CASCADE, related_name='applications')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='applications')
    
    # Application details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)
    
    # Documents
    documents = models.JSONField(default=list, blank=True)
    
    # Tracking
    applied_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    review_completed_at = models.DateTimeField(blank=True, null=True)
    
    # Additional info
    student_notes = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.student.user.username} - {self.scholarship.title}"
    
    def accept(self):
        """Accept the application"""
        self.status = 'accepted'
        self.review_completed_at = timezone.now()
        self.save()
    
    def reject(self):
        """Reject the application"""
        self.status = 'rejected'
        self.review_completed_at = timezone.now()
        self.save()
    
    def enroll(self):
        """Enroll the student"""
        self.status = 'enrolled'
        self.review_completed_at = timezone.now()
        self.save()