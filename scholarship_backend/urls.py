from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def api_root(request):
    return JsonResponse({
        'message': 'Scholarship Platform API',
        'endpoints': {
            'scholarships': '/api/scholarships/',
            'universities': '/api/universities/',
            'auth': '/api/auth/login/',
            'ai_chat': '/api/ai/chat/',
            'documents': '/api/documents/',
            'admin': '/admin/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', api_root, name='api_root'),
    path('api/', include('api.urls')),
]

from django.views.static import serve
from django.urls import re_path

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
