from django.contrib import admin
from .models import PremiumPlan, PaymentTransaction

class PremiumPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'plan_type', 'price', 'currency', 'duration_months', 'is_active')
    list_filter = ('is_active', 'plan_type')
    search_fields = ('name', 'plan_type')
    readonly_fields = ('created_at', 'updated_at')

class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'plan', 'amount', 'status', 'payment_method', 'premium_activated', 'created_at')
    list_filter = ('status', 'payment_method', 'premium_activated', 'created_at')
    search_fields = ('student__user__username', 'student__user__email', 'payment_id')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Student & Plan', {
            'fields': ('student', 'plan', 'amount', 'currency')
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'payment_id', 'status')
        }),
        ('Premium Activation', {
            'fields': ('premium_activated', 'premium_start_date', 'premium_expiry_date')
        }),
        ('Refund', {
            'fields': ('refund_id', 'refund_amount', 'refund_reason')
        }),
        ('Notes', {
            'fields': ('student_notes', 'admin_notes')
        }),
        ('System', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    actions = ['activate_premium_action']
    
    def activate_premium_action(self, request, queryset):
        """Admin action to manually activate premium"""
        for transaction in queryset:
            if transaction.status == 'completed' and not transaction.premium_activated:
                if transaction.activate_premium():
                    self.message_user(request, f"Activated premium for {transaction.student.user.username}")
                else:
                    self.message_user(request, f"Failed to activate premium for {transaction.student.user.username}", level='ERROR')
    activate_premium_action.short_description = "Activate Premium for selected transactions"

admin.site.register(PremiumPlan, PremiumPlanAdmin)
admin.site.register(PaymentTransaction, PaymentTransactionAdmin)