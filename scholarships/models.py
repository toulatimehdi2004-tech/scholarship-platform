from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class University(models.Model):
    """University model for scholarship providers"""
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='university_logos/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=500, blank=True, null=True)
    founding_year = models.IntegerField(blank=True, null=True)
    motto = models.CharField(max_length=300, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    tagline = models.CharField(max_length=300, blank=True, null=True)
    about = models.TextField(blank=True, null=True, help_text="4-5 paragraph background (e.g. from Wikipedia)")
    about_ar = models.TextField(blank=True, null=True, help_text="Native Arabic background from Arabic Wikipedia")
    wikipedia_url = models.URLField(max_length=500, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return self.name


class CampusLandmark(models.Model):
    """A real landmark/spot on a university campus for the virtual tour"""
    CATEGORY_CHOICES = [
        ('academic', 'Academic Building'),
        ('gate', 'Gate & Entrance'),
        ('nature', 'Nature & Scenery'),
        ('life', 'Campus Life'),
        ('dining', 'Canteen & Dining'),
        ('sports', 'Sports & Activities'),
        ('culture', 'Culture & Museum'),
    ]
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='landmarks')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=1000, blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='academic')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ['university', 'name']

    def __str__(self):
        return f"{self.university.name}: {self.name}"

class Scholarship(models.Model):
    """Scholarship model"""
    # Types of scholarships
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
        ('all', 'All Levels'),
    ]
    
    # Basic information
    title = models.CharField(max_length=300)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='scholarships')
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='full')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='bachelor')
    
    # Financial details
    amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, help_text="Scholarship amount in USD")
    currency = models.CharField(max_length=10, default='USD')
    duration = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., 1 year, 4 years, etc.")
    tuition_info = models.TextField(blank=True, null=True, help_text="Published tuition fees per year (RMB) by program level")
    total_seats = models.PositiveIntegerField(default=0, help_text="Total places for this scholarship (0 = unknown)")
    seats_filled = models.PositiveIntegerField(default=0, help_text="Places already taken")
    
    # Dates
    application_deadline = models.DateTimeField()
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    
    # Eligibility
    eligibility_criteria = models.TextField(help_text="List eligibility requirements")
    required_education_level = models.CharField(max_length=100, blank=True, null=True)
    minimum_gpa = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    required_fields_of_study = models.JSONField(default=list, blank=True, help_text="List of accepted fields of study")
    
    # Application details
    application_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    application_link = models.URLField(blank=True, null=True, help_text="Link to apply")
    required_documents = models.JSONField(default=list, blank=True, help_text="List of required documents")
    application_instructions = models.TextField(blank=True, null=True)
    
    # Additional info
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    language = models.CharField(max_length=50, default='English')
    
    # Visibility
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    published_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} - {self.university.name}"
    
    def is_deadline_passed(self):
        """Check if the application deadline has passed"""
        return timezone.now() > self.application_deadline
    
    def days_until_deadline(self):
        """Return days until the deadline"""
        if self.is_deadline_passed():
            return 0
        delta = self.application_deadline - timezone.now()
        return delta.days

    def seats_left(self):
        """Return remaining places, or None when total is unknown"""
        if not self.total_seats:
            return None
        return max(0, self.total_seats - self.seats_filled)
    
    class Meta:
        ordering = ['-created_at']


class AdmissionAnnouncement(models.Model):
    """Official admission announcements/brochures collected from a university's
    international admissions pages (downloadable via the official URL)."""
    KIND_CHOICES = [
        ('brochure', 'Admission Brochure'),
        ('guide', 'Program Guide'),
        ('notice', 'Admission Notice'),
        ('scholarship', 'Scholarship Notice'),
        ('qa', 'Q&A'),
    ]
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='announcements')
    title = models.CharField(max_length=300)
    date = models.DateField(blank=True, null=True)
    url = models.URLField(max_length=1000, blank=True, null=True)
    kind = models.CharField(max_length=20, choices=KIND_CHOICES, default='notice')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ['university', 'title']

    def __str__(self):
        return f"{self.university.name}: {self.title[:60]}"