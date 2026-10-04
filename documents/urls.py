from django.urls import path
from . import views

urlpatterns = [
    path('', views.document_list, name='document_list'),
    path('upload/', views.upload_document, name='upload_document'),
    path('<int:document_id>/', views.document_detail, name='document_detail'),
    path('<int:document_id>/scan/', views.scan_document, name='scan_document'),
    path('<int:document_id>/delete/', views.delete_document, name='delete_document'),
]