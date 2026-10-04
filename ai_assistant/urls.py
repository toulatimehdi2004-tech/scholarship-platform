from django.urls import path
from . import views

urlpatterns = [
    # AI Chat
    path('chat/', views.ai_chat, name='ai_chat'),
    path('chat/api/', views.ai_chat_api, name='ai_chat_api'),

    # Application Tracker
    path('tracker/', views.application_tracker, name='application_tracker'),
    path('tracker/<int:tracker_id>/', views.tracker_detail, name='tracker_detail'),
    path('tracker/<int:tracker_id>/update/', views.update_tracker_step, name='update_tracker_step'),
    path('track/<int:scholarship_id>/', views.track_scholarship, name='track_scholarship'),

    # Scholarship Matching
    path('matches/', views.my_matches, name='my_matches'),
    path('matches/refresh/', views.refresh_matches, name='refresh_matches'),

    # AI Suggestions
    path('suggestions/', views.ai_suggestions, name='ai_suggestions'),
    path('suggestions/<int:suggestion_id>/dismiss/', views.dismiss_suggestion, name='dismiss_suggestion'),
    path('suggestions/<int:suggestion_id>/read/', views.mark_suggestion_read, name='mark_suggestion_read'),

    # Verification Dashboard (admin)
    path('verification/', views.verification_dashboard, name='verification_dashboard'),
    path('verification/run/', views.run_verification, name='run_verification'),
    path('verification/check/<int:scholarship_id>/', views.verify_single_scholarship, name='verify_single_scholarship'),

    # Profile Completion
    path('profile-completion/', views.profile_completion, name='profile_completion'),
]
