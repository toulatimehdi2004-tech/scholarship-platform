from django.urls import path
from . import views

urlpatterns = [
    path('', views.scholarship_list, name='scholarship_list'),
    path('<int:scholarship_id>/', views.scholarship_detail, name='scholarship_detail'),
    path('save/<int:scholarship_id>/', views.save_scholarship, name='save_scholarship'),
]