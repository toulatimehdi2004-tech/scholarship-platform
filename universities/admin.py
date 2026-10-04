from django.contrib import admin
from .models import UniversityProfile, UniversityScholarship, Application

class UniversityProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'city', 'is_verified', 'is_active', 'total_scholarships')
    list_filter = ('is_verified', 'is_active', 'country')
    search_fields = ('name', 'city', 'country')
    readonly_fields = ('created_at', 'updated_at')

class UniversityScholarshipAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'type', 'level', 'status', 'application_deadline', 'view_count')
    list_filter = ('status', 'type', 'level', 'university')
    search_fields = ('title', 'university__name', 'description')
    readonly_fields = ('view_count', 'created_at', 'updated_at', 'published_at')

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'scholarship', 'status', 'applied_at')
    list_filter = ('status', 'applied_at')
    search_fields = ('student__user__username', 'scholarship__title')
    readonly_fields = ('applied_at', 'updated_at')

admin.site.register(UniversityProfile, UniversityProfileAdmin)
admin.site.register(UniversityScholarship, UniversityScholarshipAdmin)
admin.site.register(Application, ApplicationAdmin)