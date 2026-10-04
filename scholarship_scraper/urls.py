from django.urls import path
from . import views

urlpatterns = [
    path('run/', views.run_scraper_view, name='run_scraper'),
    path('logs/', views.scraper_logs, name='scraper_logs'),
]
