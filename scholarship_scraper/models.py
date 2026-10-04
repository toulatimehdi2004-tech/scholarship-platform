from django.db import models
from django.utils import timezone


class ScraperSource(models.Model):
    """Configurable scholarship scraping sources"""

    name = models.CharField(max_length=200, unique=True)
    url = models.URLField(blank=True, null=True)
    source_type = models.CharField(max_length=50, default='generic', choices=[
        ('generic', 'Generic URL Scraper'),
        ('portal', 'Scholarship Portal'),
        ('university', 'University Website'),
        ('api', 'API Endpoint'),
    ])
    is_enabled = models.BooleanField(default=True)
    last_scraped = models.DateTimeField(blank=True, null=True)
    total_found = models.PositiveIntegerField(default=0)
    total_created = models.PositiveIntegerField(default=0)
    scrape_interval_hours = models.PositiveIntegerField(default=24)
    config = models.JSONField(default=dict, blank=True, help_text='Extra config for custom scrapers')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_enabled else 'Disabled'})"


class ScraperLog(models.Model):
    """Log of scraping runs"""

    STATUS_CHOICES = [
        ('success', 'Success'),
        ('partial', 'Partial Success'),
        ('failed', 'Failed'),
    ]

    source = models.ForeignKey(ScraperSource, on_delete=models.CASCADE, related_name='logs', null=True, blank=True)
    source_name = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    scholarships_found = models.PositiveIntegerField(default=0)
    scholarships_created = models.PositiveIntegerField(default=0)
    scholarships_skipped = models.PositiveIntegerField(default=0)
    errors_count = models.PositiveIntegerField(default=0)
    error_details = models.TextField(blank=True, null=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.source_name} - {self.get_status_display()} @ {self.started_at:%Y-%m-%d %H:%M}"
