from django.urls import path
from . import views

urlpatterns = [
    path('plans/', views.premium_plans, name='premium_plans'),
    path('upgrade/<str:plan_type>/', views.upgrade_premium, name='upgrade_premium'),
    path('success/', views.payment_success, name='payment_success'),
    path('cancel/', views.payment_cancel, name='payment_cancel'),
]