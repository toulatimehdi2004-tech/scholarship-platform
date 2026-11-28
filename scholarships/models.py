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
    admissions_email = models.EmailField(max_length=200, blank=True, null=True, help_text="Official admissions office email")
    secondary_email = models.EmailField(max_length=200, blank=True, null=True, help_text="Backup / admissions Gmail")
    official_domain = models.CharField(max_length=150, blank=True, null=True, help_text="Official university domain e.g. tsinghua.edu.cn")
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
    
    # Dates (Stored in UTC)
    application_deadline = models.DateTimeField(help_text="Primary unified application deadline in UTC")
    embassy_deadline = models.DateTimeField(
        blank=True, null=True,
        help_text="Home-country dispatching agency / embassy deadline in UTC (e.g. Type A bilateral programs)"
    )
    university_deadline = models.DateTimeField(
        blank=True, null=True,
        help_text="Host university portal application deadline in UTC (e.g. Type B direct admissions)"
    )
    host_timezone = models.CharField(
        max_length=50, default='Asia/Shanghai',
        help_text="Timezone of the host institution/portal e.g. Asia/Shanghai (CST, UTC+8)"
    )
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    
    # Eligibility
    eligibility_criteria = models.TextField(help_text="List eligibility requirements")
    required_education_level = models.CharField(max_length=100, blank=True, null=True)
    target_degree = models.CharField(max_length=100, blank=True, null=True, help_text="Target academic degree e.g. Bachelor, Master, PhD")
    max_age = models.PositiveIntegerField(blank=True, null=True, help_text="Maximum applicant age in years")
    minimum_gpa = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    min_gpa_100 = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, help_text="Minimum normalized GPA (0-100 scale)")
    min_english_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, help_text="Minimum English test score")
    min_hsk_level = models.PositiveSmallIntegerField(default=0, help_text="Minimum HSK level (0-6)")
    eligible_countries = models.JSONField(default=list, blank=True, help_text="List of eligible country codes or names")
    excluded_countries = models.JSONField(default=list, blank=True, help_text="List of excluded country codes or names")
    required_fields_of_study = models.JSONField(default=list, blank=True, help_text="List of accepted fields of study")
    
    # Application details
    application_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0, help_text="Official application / registration fee")
    covers_tuition = models.BooleanField(default=True, help_text="Whether tuition is 100% covered")
    covers_dorm = models.BooleanField(default=True, help_text="Whether free on-campus dormitory accommodation is provided")
    covers_flight = models.BooleanField(default=False, help_text="Whether round-trip international airfare is covered")
    covers_insurance = models.BooleanField(default=True, help_text="Whether comprehensive medical insurance is covered (800 RMB/yr)")
    monthly_stipend = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, blank=True, null=True, help_text="Monthly cash living allowance e.g. 2500, 3000, 3500 RMB")
    stipend_currency = models.CharField(max_length=10, default='CNY', help_text="Currency for monthly living stipend e.g. CNY")
    estimated_visa_medical_docs_cost = models.DecimalField(max_digits=10, decimal_places=2, default=1500.00, blank=True, null=True, help_text="Estimated out-of-pocket costs for JW202, visa, medical exam, notarization")
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


class CityLivingCost(models.Model):
    """
    City Living Costs model tracking baseline expenses across university cities:
    dormitory rent, off-campus housing, and food/transport expenses.
    """
    country = models.CharField(max_length=100, default='China', help_text="Country name e.g. China")
    city_name = models.CharField(max_length=100, db_index=True, help_text="City name in English e.g. Beijing, Shanghai, Hangzhou")
    currency = models.CharField(max_length=10, default='CNY', help_text="Local currency e.g. CNY")
    monthly_dorm_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Average monthly on-campus dorm cost (RMB)")
    monthly_offcampus_rent = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Average monthly off-campus single apartment/room rent (RMB)")
    monthly_food_transport = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Average monthly food, dining, and transit expense (RMB)")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'city_living_costs'
        ordering = ['country', 'city_name']
        unique_together = ['country', 'city_name']
        verbose_name = 'City Living Cost'
        verbose_name_plural = 'City Living Costs'

    def __str__(self):
        return f"{self.city_name}, {self.country} ({self.currency})"

    @property
    def total_monthly_oncampus(self):
        """Total monthly living expense when staying in university dorm."""
        return (self.monthly_dorm_cost or 0) + (self.monthly_food_transport or 0)

    @property
    def total_monthly_offcampus(self):
        """Total monthly living expense when renting an off-campus apartment."""
        return (self.monthly_offcampus_rent or 0) + (self.monthly_food_transport or 0)
