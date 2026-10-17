from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tracker', views.StudentApplicationTrackerViewSet, basename='student-tracker')

urlpatterns = [
    path('register/', views.register, name='register'),
    path('profile/', views.profile, name='profile'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('', include(router.urls)),
]