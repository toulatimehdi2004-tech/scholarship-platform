from django.urls import path
from . import views

urlpatterns = [
    # Public service pages
    path('', views.service_list, name='service_list'),
    path('service/<int:service_id>/', views.service_detail, name='service_detail'),
    path('book/<int:service_id>/', views.book_service, name='book_service'),
    path('orders/', views.my_orders, name='my_orders'),
    path('order/<int:order_id>/', views.order_detail, name='order_detail'),
    
    # Provider authentication
    path('provider/register/', views.provider_register, name='provider_register'),
    path('provider/login/', views.provider_login, name='provider_login'),
    path('provider/logout/', views.provider_logout, name='provider_logout'),
    
    # Provider dashboard
    path('provider/dashboard/', views.provider_dashboard, name='provider_dashboard'),
    
    # Provider services
    path('provider/services/', views.provider_services, name='provider_services'),
    path('provider/services/add/', views.provider_add_service, name='provider_add_service'),
    path('provider/services/edit/<int:service_id>/', views.provider_edit_service, name='provider_edit_service'),
    path('provider/services/delete/<int:service_id>/', views.provider_delete_service, name='provider_delete_service'),
    
    # Provider orders
    path('provider/orders/', views.provider_orders, name='provider_orders'),
    path('provider/orders/<int:order_id>/', views.provider_order_detail, name='provider_order_detail'),
    path('provider/orders/<int:order_id>/status/', views.provider_update_order_status, name='provider_update_order_status'),
    
    # Provider earnings
    path('provider/earnings/', views.provider_earnings, name='provider_earnings'),
    
    # Provider profile
    path('provider/profile/', views.provider_profile, name='provider_profile'),
    path('provider/profile/edit/', views.provider_edit_profile, name='provider_edit_profile'),
]