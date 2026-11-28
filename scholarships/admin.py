from django.contrib import admin
from .models import University, Scholarship, CityLivingCost, AdmissionAnnouncement

class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'city', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'country')
    search_fields = ('name', 'country', 'city')
    readonly_fields = ('created_at',)

class ScholarshipAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'type', 'level', 'covers_tuition', 'covers_dorm', 'monthly_stipend', 'application_deadline', 'is_active', 'is_featured')
    list_filter = ('type', 'level', 'covers_tuition', 'covers_dorm', 'covers_flight', 'is_active', 'is_featured', 'university')
    search_fields = ('title', 'university__name', 'description')
    readonly_fields = ('view_count', 'created_at', 'updated_at')
   # filter_horizontal = ('required_fields_of_study',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'university', 'description', 'type', 'level')
        }),
        ('Financial Details & Coverage', {
            'fields': (
                'amount', 'currency', 'duration',
                'application_fee',
                'covers_tuition', 'covers_dorm', 'covers_flight', 'covers_insurance',
                'monthly_stipend', 'stipend_currency',
                'estimated_visa_medical_docs_cost',
            )
        }),
        ('Dates & Deadlines (UTC)', {
            'fields': (
                'application_deadline', 'embassy_deadline', 'university_deadline',
                'host_timezone', 'start_date', 'end_date'
            )
        }),
        ('Eligibility', {
            'fields': (
                'eligibility_criteria', 'required_education_level', 'target_degree',
                'max_age', 'minimum_gpa', 'min_gpa_100', 'min_english_score',
                'min_hsk_level', 'eligible_countries', 'excluded_countries',
                'required_fields_of_study'
            )
        }),
        ('Application', {
            'fields': ('application_link', 'required_documents', 'application_instructions')
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

class CityLivingCostAdmin(admin.ModelAdmin):
    list_display = ('city_name', 'country', 'currency', 'monthly_dorm_cost', 'monthly_offcampus_rent', 'monthly_food_transport', 'updated_at')
    list_filter = ('country', 'currency')
    search_fields = ('city_name', 'country')
    ordering = ('country', 'city_name')

admin.site.register(University, UniversityAdmin)
admin.site.register(Scholarship, ScholarshipAdmin)
admin.site.register(CityLivingCost, CityLivingCostAdmin)