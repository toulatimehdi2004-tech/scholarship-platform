from django.contrib import admin
from .models import University, Scholarship

class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'city', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'country')
    search_fields = ('name', 'country', 'city')
    readonly_fields = ('created_at',)

class ScholarshipAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'type', 'level', 'application_deadline', 'is_active', 'is_featured')
    list_filter = ('type', 'level', 'is_active', 'is_featured', 'university')
    search_fields = ('title', 'university__name', 'description')
    readonly_fields = ('view_count', 'created_at', 'updated_at')
   # filter_horizontal = ('required_fields_of_study',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'university', 'description', 'type', 'level')
        }),
        ('Financial Details', {
            'fields': ('amount', 'currency', 'duration')
        }),
        ('Dates', {
            'fields': ('application_deadline', 'start_date', 'end_date')
        }),
        ('Eligibility', {
            'fields': ('eligibility_criteria', 'required_education_level', 'minimum_gpa', 'required_fields_of_study')
        }),
        ('Application', {
            'fields': ('application_fee', 'application_link', 'required_documents', 'application_instructions')
        }),
        ('Contact', {
            'fields': ('contact_email', 'contact_phone', 'language')
        }),
        ('Visibility', {
            'fields': ('is_active', 'is_featured', 'view_count', 'published_by')
        }),
        ('System', {
            'fields': ('created_at', 'updated_at')
        }),
    )

admin.site.register(University, UniversityAdmin)
admin.site.register(Scholarship, ScholarshipAdmin)