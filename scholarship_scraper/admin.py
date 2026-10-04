from django.contrib import admin
from .models import ScraperSource, ScraperLog


class ScraperSourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'source_type', 'is_enabled', 'last_scraped', 'total_found', 'total_created')
    list_filter = ('is_enabled', 'source_type')
    search_fields = ('name', 'url')
    readonly_fields = ('last_scraped', 'total_found', 'total_created', 'created_at')


class ScraperLogAdmin(admin.ModelAdmin):
    list_display = ('source_name', 'status', 'scholarships_found', 'scholarships_created', 'duration_seconds', 'started_at')
    list_filter = ('status', 'source_name')
    search_fields = ('source_name', 'error_details')
    readonly_fields = ('started_at', 'completed_at')


admin.site.register(ScraperSource, ScraperSourceAdmin)
admin.site.register(ScraperLog, ScraperLogAdmin)
