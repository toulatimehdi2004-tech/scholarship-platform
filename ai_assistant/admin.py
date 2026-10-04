from django.contrib import admin
from .models import (
    ScholarshipVerificationLog, AIConversation, ApplicationTracker,
    ScholarshipMatch, AISuggestion
)


class ScholarshipVerificationLogAdmin(admin.ModelAdmin):
    list_display = ('scholarship', 'status', 'http_status_code', 'checked_at', 'action_taken')
    list_filter = ('status', 'checked_at')
    search_fields = ('scholarship__title', 'checked_url', 'error_message')
    readonly_fields = ('checked_at',)
    raw_id_fields = ('scholarship',)


class AIConversationAdmin(admin.ModelAdmin):
    list_display = ('student', 'role', 'intent', 'created_at')
    list_filter = ('role', 'intent', 'created_at')
    search_fields = ('student__username', 'message')
    readonly_fields = ('created_at',)
    raw_id_fields = ('student',)


class ApplicationTrackerAdmin(admin.ModelAdmin):
    list_display = ('student', 'scholarship', 'current_step', 'last_ai_check', 'updated_at')
    list_filter = ('current_step', 'created_at')
    search_fields = ('student__username', 'scholarship__title')
    readonly_fields = ('created_at', 'updated_at', 'last_ai_check')
    raw_id_fields = ('student', 'scholarship')


class ScholarshipMatchAdmin(admin.ModelAdmin):
    list_display = ('student', 'scholarship', 'match_score', 'generated_at')
    list_filter = ('match_score', 'generated_at')
    search_fields = ('student__username', 'scholarship__title')
    readonly_fields = ('generated_at',)
    raw_id_fields = ('student', 'scholarship')


class AISuggestionAdmin(admin.ModelAdmin):
    list_display = ('student', 'suggestion_type', 'title', 'is_read', 'is_dismissed', 'created_at')
    list_filter = ('suggestion_type', 'is_read', 'is_dismissed', 'created_at')
    search_fields = ('student__username', 'title', 'message')
    readonly_fields = ('created_at',)
    raw_id_fields = ('student', 'related_scholarship')


admin.site.register(ScholarshipVerificationLog, ScholarshipVerificationLogAdmin)
admin.site.register(AIConversation, AIConversationAdmin)
admin.site.register(ApplicationTracker, ApplicationTrackerAdmin)
admin.site.register(ScholarshipMatch, ScholarshipMatchAdmin)
admin.site.register(AISuggestion, AISuggestionAdmin)
