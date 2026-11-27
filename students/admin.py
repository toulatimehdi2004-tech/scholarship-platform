from django.contrib import admin
from .models import Student, StudentProfile, EmailVerification


class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'user_email', 'is_premium', 'is_email_verified', 'payment_date', 'created_at')
    list_filter = ('is_premium', 'is_email_verified', 'country', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone', 'country')
    readonly_fields = ('created_at', 'updated_at')

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'

    fieldsets = (
        ('User Information', {
            'fields': ('user', 'phone', 'date_of_birth', 'country', 'city')
        }),
        ('Education', {
            'fields': ('education_level', 'field_of_study', 'gpa')
        }),
        ('Verification', {
            'fields': ('is_email_verified',)
        }),
        ('Premium Status', {
            'fields': ('is_premium', 'payment_date', 'payment_id')
        }),
        ('System', {
            'fields': ('created_at', 'updated_at', 'saved_scholarships')
        }),
    )


class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'is_used', 'created_at')
    list_filter = ('is_used', 'created_at')
    search_fields = ('email',)


admin.site.register(Student, StudentAdmin)
admin.site.register(EmailVerification, EmailVerificationAdmin)

class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'nationality', 'current_degree', 'gpa_raw', 'gpa_scale', 'gpa_normalized_100', 'english_test_type', 'english_score', 'hsk_level')
    list_filter = ('gpa_scale', 'english_test_type', 'hsk_level', 'nationality')
    search_fields = ('user__username', 'user__email', 'nationality', 'current_degree')
    readonly_fields = ('created_at', 'updated_at')

admin.site.register(StudentProfile, StudentProfileAdmin)
