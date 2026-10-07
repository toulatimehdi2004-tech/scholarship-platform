from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'scholarships', views.ScholarshipViewSet, basename='scholarship')
router.register(r'universities', views.UniversityViewSet, basename='university')
router.register(r'applications', views.ApplicationTrackerViewSet, basename='application')
router.register(r'suggestions', views.AISuggestionViewSet, basename='suggestion')
router.register(r'documents', views.DocumentViewSet, basename='document')
router.register(r'service-orders', views.ServiceOrderViewSet, basename='service-order')

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='api-register'),
    path('auth/login/', views.LoginView.as_view(), name='api-login'),
    path('auth/logout/', views.logout_view, name='api-logout'),
    path('auth/user/', views.current_user_view, name='api-current-user'),
    path('auth/activate-premium/', views.activate_premium_view, name='api-activate-premium'),

    # Email verification (2FA)
    path('auth/send-code/', views.send_verification_code, name='api-send-code'),
    path('auth/verify-code/', views.verify_email_code, name='api-verify-code'),
    path('auth/resend-code/', views.resend_verification_code, name='api-resend-code'),

    # Forgot password
    path('auth/forgot-password/', views.forgot_password, name='api-forgot-password'),
    path('auth/reset-password/', views.reset_password, name='api-reset-password'),

    # Student profile
    path('students/profile/', views.StudentProfileView.as_view(), name='api-student-profile'),

    # AI
    path('ai/chat/', views.AIChatView.as_view(), name='api-ai-chat'),
    path('ai/chat/stream/', views.AIChatStreamView.as_view(), name='api-ai-chat-stream'),
    path('translate/', views.translate_view, name='api-translate'),
    path('stats/', views.stats_view, name='api-stats'),
    path('match/', views.match_view, name='api-match'),
    path('sop/', views.sop_generate_view, name='api-sop'),
    path('sop/export/', views.sop_export_view, name='api-sop-export'),
    path('matches/', views.ScholarshipMatchView.as_view(), name='api-matches'),

    # Router-generated routes
    path('', include(router.urls)),
]
