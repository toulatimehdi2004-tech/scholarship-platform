from django.contrib import admin
from .models import Document, DocumentScan, StudentDocument, DocumentExpiryAlert

class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'student', 'document_type', 'status', 'is_verified', 'created_at')
    list_filter = ('document_type', 'status', 'is_verified', 'created_at')
    search_fields = ('title', 'student__user__username', 'student__user__email')
    readonly_fields = ('file_size', 'extracted_text', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Document Information', {
            'fields': ('student', 'order', 'title', 'document_type', 'file')
        }),
        ('File Details', {
            'fields': ('file_name', 'file_size')
        }),
        ('OCR & Extraction', {
            'fields': ('extracted_text', 'extracted_data')
        }),
        ('Verification', {
            'fields': ('status', 'is_verified', 'verified_by', 'verified_at')
        }),
        ('System', {
            'fields': ('created_at', 'updated_at')
        }),
    )

class DocumentScanAdmin(admin.ModelAdmin):
    list_display = ('document', 'name', 'nationality', 'confidence_score', 'processed_at')
    search_fields = ('name', 'document_number', 'nationality')
    readonly_fields = ('processed_at',)

class StudentDocumentAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_title', 'doc_type', 'issue_date', 'expiry_date', 'days_until_expiry', 'is_verified', 'created_at')
    list_filter = ('doc_type', 'is_verified', 'expiry_date')
    search_fields = ('user__username', 'user__email', 'title', 'notes')
    readonly_fields = ('created_at', 'updated_at')

    def days_until_expiry(self, obj):
        return obj.days_until_expiry()
    days_until_expiry.short_description = 'Days to Expiry'


class DocumentExpiryAlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'alert_type', 'severity', 'expiry_date', 'scholarship', 'is_resolved', 'created_at')
    list_filter = ('alert_type', 'severity', 'is_resolved', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    readonly_fields = ('created_at', 'updated_at')


admin.site.register(Document, DocumentAdmin)
admin.site.register(DocumentScan, DocumentScanAdmin)
admin.site.register(StudentDocument, StudentDocumentAdmin)
admin.site.register(DocumentExpiryAlert, DocumentExpiryAlertAdmin)
