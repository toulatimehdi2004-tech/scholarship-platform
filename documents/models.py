from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from students.models import Student
from providers.models import ServiceOrder

class Document(models.Model):
    """Student document model for uploads and scans"""
    
    DOCUMENT_TYPES = [
        ('passport', 'Passport'),
        ('id_card', 'ID Card'),
        ('transcript', 'Academic Transcript'),
        ('diploma', 'Diploma/Certificate'),
        ('recommendation', 'Recommendation Letter'),
        ('motivation', 'Motivation Letter'),
        ('cv', 'CV/Resume'),
        ('translation', 'Translation Document'),
        ('apostille', 'Apostille Document'),
        ('legalization', 'Legalization Document'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('completed', 'Processed'),
        ('error', 'Error'),
    ]
    
    # Relationships
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='documents')
    order = models.ForeignKey(ServiceOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    
    # Document info
    title = models.CharField(max_length=200)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES, default='other')
    file = models.FileField(upload_to='student_documents/')
    file_name = models.CharField(max_length=200, blank=True, null=True)
    file_size = models.PositiveIntegerField(blank=True, null=True, help_text="File size in bytes")
    
    # OCR extracted text
    extracted_text = models.TextField(blank=True, null=True)
    extracted_data = models.JSONField(default=dict, blank=True, help_text="Structured data from OCR")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded')
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_documents')
    verified_at = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.student.user.username}"
    
    def get_file_extension(self):
        """Get the file extension"""
        if self.file:
            return self.file.name.split('.')[-1].lower()
        return None
    
    def is_image(self):
        """Check if the file is an image"""
        ext = self.get_file_extension()
        return ext in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
    
    def is_pdf(self):
        """Check if the file is a PDF"""
        ext = self.get_file_extension()
        return ext == 'pdf'

class DocumentScan(models.Model):
    """Stores scanned document results from OCR"""
    
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='scan_result')
    
    # OCR results
    full_text = models.TextField(blank=True, null=True)
    
    # Extracted fields
    name = models.CharField(max_length=200, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    document_number = models.CharField(max_length=100, blank=True, null=True)
    issued_date = models.DateField(blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Additional extracted data
    extracted_entities = models.JSONField(default=dict, blank=True)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    
    # Processing info
    processed_at = models.DateTimeField(auto_now_add=True)
    processing_time = models.DurationField(blank=True, null=True)
    
    def __str__(self):
        return f"Scan for {self.document.title}"