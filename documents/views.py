from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import JsonResponse
from django.conf import settings
from .models import Document, DocumentScan
from students.models import Student
import os
import json
from datetime import datetime

try:
    import pytesseract
    from PIL import Image
    import pdf2image
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

@login_required(login_url='login')
def document_list(request):
    """View all documents for the current student"""
    student = request.user.student_profile
    documents = Document.objects.filter(student=student).order_by('-created_at')
    
    context = {
        'documents': documents,
        'total_documents': documents.count(),
        'ocr_available': OCR_AVAILABLE,
    }
    
    return render(request, 'documents/document_list.html', context)

@login_required(login_url='login')
def upload_document(request):
    """Upload a new document"""
    student = request.user.student_profile
    
    if request.method == 'POST':
        title = request.POST.get('title')
        document_type = request.POST.get('document_type')
        file = request.FILES.get('file')
        order_id = request.POST.get('order_id')
        
        if not title or not file:
            messages.error(request, 'Please provide a title and file.')
            return render(request, 'documents/upload_document.html')
        
        # Get order if provided
        order = None
        if order_id:
            from providers.models import ServiceOrder
            order = get_object_or_404(ServiceOrder, id=order_id, student=student)
        
        # Save the document
        document = Document.objects.create(
            student=student,
            order=order,
            title=title,
            document_type=document_type,
            file=file,
            file_name=file.name,
            file_size=file.size,
            status='uploaded'
        )
        
        messages.success(request, f'Document "{title}" uploaded successfully!')
        
        # If OCR is available, process it automatically
        if OCR_AVAILABLE:
            try:
                process_ocr(document)
                messages.info(request, 'Document is being processed with OCR.')
            except Exception as e:
                messages.warning(request, f'Document uploaded but OCR processing failed: {str(e)}')
        
        return redirect('document_detail', document_id=document.id)
    
    # Get student's orders for linking
    from providers.models import ServiceOrder
    orders = ServiceOrder.objects.filter(student=student)
    
    context = {
        'orders': orders,
        'document_types': Document.DOCUMENT_TYPES,
    }
    
    return render(request, 'documents/upload_document.html', context)

@login_required(login_url='login')
def document_detail(request, document_id):
    """View a single document"""
    student = request.user.student_profile
    document = get_object_or_404(Document, id=document_id, student=student)
    
    context = {
        'document': document,
        'has_scan': hasattr(document, 'scan_result'),
        'ocr_available': OCR_AVAILABLE,
    }
    
    return render(request, 'documents/document_detail.html', context)

@login_required(login_url='login')
def scan_document(request, document_id):
    """Manually trigger OCR scanning for a document"""
    student = request.user.student_profile
    document = get_object_or_404(Document, id=document_id, student=student)
    
    if not OCR_AVAILABLE:
        messages.error(request, 'OCR is not available. Please install pytesseract and Tesseract-OCR.')
        return redirect('document_detail', document_id=document.id)
    
    try:
        result = process_ocr(document)
        if result:
            messages.success(request, 'Document scanned successfully! Text extracted.')
        else:
            messages.warning(request, 'No text could be extracted from this document.')
    except Exception as e:
        messages.error(request, f'OCR failed: {str(e)}')
    
    return redirect('document_detail', document_id=document.id)

@login_required(login_url='login')
def delete_document(request, document_id):
    """Delete a document"""
    student = request.user.student_profile
    document = get_object_or_404(Document, id=document_id, student=student)
    
    if request.method == 'POST':
        # Delete the file
        if document.file:
            document.file.delete()
        document.delete()
        messages.success(request, 'Document deleted successfully.')
        return redirect('document_list')
    
    return render(request, 'documents/delete_document.html', {'document': document})

def process_ocr(document):
    """Process OCR on a document"""
    if not OCR_AVAILABLE:
        return None
    
    file_path = document.file.path
    extracted_text = ""
    
    try:
        # Check if file is PDF or Image
        if document.is_pdf():
            # Convert PDF to images
            images = pdf2image.convert_from_path(file_path)
            for image in images:
                text = pytesseract.image_to_string(image)
                extracted_text += text + "\n"
        elif document.is_image():
            # Process image directly
            image = Image.open(file_path)
            extracted_text = pytesseract.image_to_string(image)
        else:
            # Try to process as image anyway
            try:
                image = Image.open(file_path)
                extracted_text = pytesseract.image_to_string(image)
            except:
                # For other file types, try to read as text
                with open(file_path, 'r') as f:
                    extracted_text = f.read()
        
        if extracted_text.strip():
            document.extracted_text = extracted_text
            document.status = 'completed'
            document.save()
            
            # Create scan result
            scan_result, created = DocumentScan.objects.get_or_create(document=document)
            scan_result.full_text = extracted_text
            
            # Try to extract useful information
            extracted_data = extract_info_from_text(extracted_text)
            scan_result.extracted_entities = extracted_data
            
            # Extract specific fields
            if 'name' in extracted_data:
                scan_result.name = extracted_data['name'][:200]  # Limit length
            if 'nationality' in extracted_data:
                scan_result.nationality = extracted_data['nationality'][:100]
            
            scan_result.save()
            
            return scan_result
    
    except Exception as e:
        document.status = 'error'
        document.save()
        raise e
    
    return None

def extract_info_from_text(text):
    """Extract structured information from OCR text"""
    extracted = {}
    
    # Simple extraction patterns
    lines = text.split('\n')
    
    # Try to find name patterns
    for line in lines:
        line_lower = line.lower()
        
        # Name patterns
        if 'name:' in line_lower:
            extracted['name'] = line.split(':', 1)[-1].strip()
        elif 'name ' in line_lower and ':' not in line:
            # Try to find name in first few lines
            if len(line.strip()) > 3 and not any(x in line_lower for x in ['date', 'address', 'phone', 'email']):
                if 'name' not in extracted:
                    extracted['name'] = line.strip()
        
        # Nationality patterns
        if 'nationality:' in line_lower:
            extracted['nationality'] = line.split(':', 1)[-1].strip()
        elif 'citizenship' in line_lower and ':' in line:
            extracted['nationality'] = line.split(':', 1)[-1].strip()
        
        # Date patterns
        if 'date of birth' in line_lower or 'dob:' in line_lower:
            extracted['date_of_birth'] = line.split(':', 1)[-1].strip()
        
        # Document number patterns
        if 'passport no' in line_lower or 'document no' in line_lower or 'id no' in line_lower:
            extracted['document_number'] = line.split(':', 1)[-1].strip()
        
        # Address patterns
        if 'address:' in line_lower:
            extracted['address'] = line.split(':', 1)[-1].strip()
        
        # Expiry patterns
        if 'expiry date' in line_lower or 'expiration date' in line_lower:
            extracted['expiry_date'] = line.split(':', 1)[-1].strip()
    
    return extracted