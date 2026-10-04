from django.urls import path
from . import views

urlpatterns = [
    # Registration & Authentication
    path('register/', views.university_register, name='university_register'),
    path('login/', views.university_login, name='university_login'),
    path('logout/', views.university_logout, name='university_logout'),
    
    # Dashboard
    path('dashboard/', views.university_dashboard, name='university_dashboard'),
    
    # Scholarship Management
    path('scholarships/', views.manage_scholarships, name='manage_scholarships'),
    path('scholarships/add/', views.add_scholarship, name='add_scholarship'),
    path('scholarships/edit/<int:scholarship_id>/', views.edit_scholarship, name='edit_scholarship'),
    path('scholarships/delete/<int:scholarship_id>/', views.delete_scholarship, name='delete_scholarship'),
    path('scholarships/publish/<int:scholarship_id>/', views.publish_scholarship, name='publish_scholarship'),
    
    # Applications
    path('applications/', views.view_applications, name='view_applications'),
    path('applications/<int:application_id>/', views.application_detail, name='application_detail'),
    path('applications/<int:application_id>/status/', views.update_application_status, name='update_application_status'),
    
    # Profile
    path('profile/', views.university_profile, name='university_profile'),
    path('profile/edit/', views.edit_university_profile, name='edit_university_profile'),
]