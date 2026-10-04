from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from scholarships.models import Scholarship


class ScholarshipVerificationLog(models.Model):
    """Tracks automated verification checks on scholarship links and availability"""

    STATUS_CHOICES = [
        ('active', 'Active / Link Working'),
        ('broken', 'Broken Link'),
        ('expired', 'Expired Deadline'),
        ('redirected', 'Redirected'),
        ('unreachable', 'Unreachable'),
        ('deactivated', 'Auto-Deactivated'),
    ]

    scholarship = models.ForeignKey(
        Scholarship, on_delete=models.CASCADE, related_name='verification_logs'
    )
    checked_url = models.URLField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    http_status_code = models.PositiveIntegerField(blank=True, null=True)
    response_time_ms = models.PositiveIntegerField(blank=True, null=True)
    redirect_url = models.URLField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    checked_at = models.DateTimeField(default=timezone.now)
    action_taken = models.TextField(
        blank=True, null=True,
        help_text='What the system did in response (e.g., deactivated listing)'
    )

    class Meta:
        ordering = ['-checked_at']

    def __str__(self):
        return f"[{self.status}] {self.scholarship.title} @ {self.checked_at:%Y-%m-%d %H:%M}"


class AIConversation(models.Model):
    """Stores chat history between a student and the AI assistant"""

    ROLE_CHOICES = [
        ('user', 'Student'),
        ('assistant', 'AI Assistant'),
        ('system', 'System'),
    ]

    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='ai_conversations'
    )
    session_id = models.CharField(max_length=64, db_index=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    message = models.TextField()
    intent = models.CharField(
        max_length=50, blank=True, null=True,
        help_text='Detected intent: scholarship_search, document_help, deadline, eligibility, etc.'
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.role}] {self.student.username}: {self.message[:60]}"


class ApplicationTracker(models.Model):
    """Tracks a student's step-by-step progress on a specific scholarship application"""

    STEP_CHOICES = [
        ('discovered', 'Discovered'),
        ('researching', 'Researching Requirements'),
        ('documents_gathering', 'Gathering Documents'),
        ('documents_complete', 'Documents Ready'),
        ('writing_motivation', 'Writing Motivation Letter'),
        ('writing_complete', 'Motivation Letter Done'),
        ('getting_recommendations', 'Getting Recommendation Letters'),
        ('recommendations_complete', 'Recommendations Done'),
        ('submitting', 'Submitting Application'),
        ('submitted', 'Application Submitted'),
        ('interview_prep', 'Interview Preparation'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('enrolled', 'Enrolled'),
    ]

    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='application_tracker'
    )
    scholarship = models.ForeignKey(
        Scholarship, on_delete=models.CASCADE, related_name='tracked_applications'
    )
    current_step = models.CharField(max_length=30, choices=STEP_CHOICES, default='discovered')
    checklist = models.JSONField(
        default=dict, blank=True,
        help_text='Per-step checklist: {"documents_gathering": {"transcript": false, "passport": true, ...}}'
    )
    ai_recommendations = models.JSONField(
        default=list, blank=True,
        help_text='AI-generated tips/next steps for this application'
    )
    notes = models.TextField(blank=True, null=True)
    deadline_reminder_sent = models.BooleanField(default=False)
    last_ai_check = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'scholarship']
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.student.username} -> {self.scholarship.title} [{self.current_step}]"

    def get_next_step(self):
        """Return the next logical step in the application process"""
        steps = [s[0] for s in self.STEP_CHOICES]
        try:
            idx = steps.index(self.current_step)
            if idx < len(steps) - 1:
                return steps[idx + 1]
        except ValueError:
            pass
        return None

    def get_progress_percentage(self):
        """Calculate completion percentage"""
        steps = [s[0] for s in self.STEP_CHOICES]
        try:
            idx = steps.index(self.current_step)
            return int((idx / (len(steps) - 1)) * 100)
        except ValueError:
            return 0


class ScholarshipMatch(models.Model):
    """AI-generated scholarship match scores for a student"""

    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='scholarship_matches'
    )
    scholarship = models.ForeignKey(
        Scholarship, on_delete=models.CASCADE, related_name='matches'
    )
    match_score = models.PositiveIntegerField(
        help_text='0-100 score indicating how well the scholarship matches the student profile'
    )
    match_reasons = models.JSONField(
        default=list, blank=True,
        help_text='List of reasons why this scholarship matches'
    )
    generated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ['student', 'scholarship']
        ordering = ['-match_score']

    def __str__(self):
        return f"{self.student.username} x {self.scholarship.title} ({self.match_score}%)"


class AISuggestion(models.Model):
    """Proactive AI suggestions and alerts for students"""

    TYPE_CHOICES = [
        ('deadline_approaching', 'Deadline Approaching'),
        ('new_scholarship', 'New Matching Scholarship'),
        ('document_reminder', 'Document Reminder'),
        ('tip', 'Application Tip'),
        ('warning', 'Warning / Issue'),
        ('recommendation', 'Personalized Recommendation'),
    ]

    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='ai_suggestions'
    )
    suggestion_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_scholarship = models.ForeignKey(
        Scholarship, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='ai_suggestions'
    )
    is_read = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    action_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.suggestion_type}] {self.student.username}: {self.title}"
