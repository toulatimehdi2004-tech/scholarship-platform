from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

from students.views import StudentApplicationTrackerViewSet

router = DefaultRouter()
router.register(r'scholarships', views.ScholarshipViewSet, basename='scholarship')
router.register(r'universities', views.UniversityViewSet, basename='university')
router.register(r'student-profiles', views.StudentProfileViewSet, basename='student-profile')
router.register(r'tracker', StudentApplicationTrackerViewSet, basename='tracker')
router.register(r'applications', views.ApplicationTrackerViewSet, basename='application')
router.register(r'suggestions', views.AISuggestionViewSet, basename='suggestion')
router.register(r'documents', views.DocumentViewSet, basename='document')
router.register(r'service-orders', views.ServiceOrderViewSet, basename='service-order')
router.register(r'stories', views.SuccessStoryViewSet, basename='story')
router.register(r'reviews', views.ExperienceReviewViewSet, basename='review')
router.register(r'city-costs', views.CityLivingCostViewSet, basename='city-cost')

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='api-register'),
    path('auth/login/', views.LoginView.as_view(), name='api-login'),
    path('auth/logout/', views.logout_view, name='api-logout'),
    path('auth/user/', views.current_user_view, name='api-current-user'),
    path('auth/activate-premium/', views.activate_premium_view, name='api-activate-premium'),
    path('auth/verify-university-email/', views.verify_university_email_view, name='api-verify-university-email'),

    # Email verification (2FA)
    path('auth/send-code/', views.send_verification_code, name='api-send-code'),
    path('auth/verify-code/', views.verify_email_code, name='api-verify-code'),
    path('auth/resend-code/', views.resend_verification_code, name='api-resend-code'),

    # Forgot password
    path('auth/forgot-password/', views.forgot_password, name='api-forgot-password'),
    path('auth/reset-password/', views.reset_password, name='api-reset-password'),

    # Student profile
    path('students/profile/', views.StudentProfileView.as_view(), name='api-student-profile'),

    # Scholarship Eligibility & Recommendation
    path('scholarships/<int:pk>/eligibility/', views.scholarship_eligibility_view, name='api-scholarship-eligibility'),
    path('scholarships/<int:pk>/eligibility', views.scholarship_eligibility_view),
    path('scholarships/recommended/', views.scholarships_recommended_view, name='api-scholarships-recommended'),
    path('scholarships/recommended', views.scholarships_recommended_view),

    # AI
    path('ai/chat/', views.AIChatView.as_view(), name='api-ai-chat'),
    path('ai/chat/stream/', views.AIChatStreamView.as_view(), name='api-ai-chat-stream'),
    path('translate/', views.translate_view, name='api-translate'),
    path('stats/', views.stats_view, name='api-stats'),
    path('match/', views.match_view, name='api-match'),
    path('sop/', views.sop_generate_view, name='api-sop'),
    path('sop/export/', views.sop_export_view, name='api-sop-export'),
    path('matches/', views.ScholarshipMatchView.as_view(), name='api-matches'),

    # Provider Banking & Pickup Service
    path('provider/banking/', views.provider_banking_view, name='api-provider-banking'),
    path('provider/payout-request/', views.provider_request_payout_view, name='api-provider-payout-request'),
    path('provider/pickup/', views.provider_pickup_application_view, name='api-provider-pickup'),

    # Welcome message (Email & Twilio SMS)
    path('send-welcome-message/', views.send_welcome_message_view, name='api-send-welcome-message'),

    # Router-generated routes
    path('', include(router.urls)),
]
