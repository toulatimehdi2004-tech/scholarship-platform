from django.contrib import admin
from .models import ServiceCategory, Provider, Service, ServiceOrder

class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'default_commission', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)

class ProviderAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'user', 'is_verified', 'is_active', 'average_rating', 'total_reviews')
    list_filter = ('is_verified', 'is_active', 'country', 'categories')
    search_fields = ('business_name', 'user__username', 'user__email', 'city', 'country')
    readonly_fields = ('average_rating', 'total_reviews', 'created_at', 'updated_at')
    filter_horizontal = ('categories',)

class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider', 'category', 'price', 'is_active')
    list_filter = ('is_active', 'category', 'is_online', 'is_onsite')
    search_fields = ('name', 'description', 'provider__business_name')
    readonly_fields = ('created_at', 'updated_at')

class ServiceOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'service', 'student', 'provider', 'total_amount', 'commission_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'currency')
    search_fields = ('service__name', 'student__user__username', 'provider__business_name', 'payment_id')
    readonly_fields = ('commission_amount', 'provider_payout', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Order Information', {
            'fields': ('service', 'student', 'provider', 'quantity', 'total_amount', 'commission_amount', 'provider_payout', 'currency')
        }),
        ('Status', {
            'fields': ('status', 'requested_date', 'completed_date')
        }),
        ('Review', {
            'fields': ('student_rating', 'student_review')
        }),
        ('Payment', {
            'fields': ('payment_id', 'refund_id')
        }),
        ('Additional', {
            'fields': ('notes',)
        }),
        ('System', {
            'fields': ('created_at', 'updated_at')
        }),
    )

admin.site.register(ServiceCategory, ServiceCategoryAdmin)
admin.site.register(Provider, ProviderAdmin)
admin.site.register(Service, ServiceAdmin)
admin.site.register(ServiceOrder, ServiceOrderAdmin)