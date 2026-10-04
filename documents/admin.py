from django.contrib import admin
from .models import Document, DocumentScan

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

admin.site.register(Document, DocumentAdmin)
admin.site.register(DocumentScan, DocumentScanAdmin)