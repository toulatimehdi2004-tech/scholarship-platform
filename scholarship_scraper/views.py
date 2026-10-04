import time
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from .models import ScraperSource, ScraperLog
from .scraper import run_scraper


@login_required(login_url='login')
def run_scraper_view(request):
    """Admin view to trigger scraper manually"""
    if not request.user.is_staff:
        messages.error(request, 'Access denied.')
        return redirect('homepage')

    if request.method == 'POST':
        start = time.time()
        results = run_scraper(dry_run=False, verbose=True)
        duration = int(time.time() - start)

        # Log the run
        for source_name, data in results.get('sources', {}).items():
            if 'error' in data:
                ScraperLog.objects.create(
                    source_name=source_name,
                    status='failed',
                    error_details=data['error'],
                    duration_seconds=duration,
                    completed_at=time.timezone.now(),
                )
            else:
                status = 'success' if data.get('errors', 0) == 0 else 'partial'
                ScraperLog.objects.create(
                    source_name=source_name,
                    status=status,
                    scholarships_found=data.get('found', 0),
                    scholarships_created=data.get('created', 0),
                    scholarships_skipped=data.get('skipped', 0),
                    errors_count=data.get('errors', 0),
                    duration_seconds=duration,
                    completed_at=time.timezone.now(),
                )

        # Update source stats
        for source in ScraperSource.objects.all():
            source.last_scraped = time.timezone.now()
            source.total_created += results.get('total_created', 0)
            source.total_found += results.get('total_found', 0)
            source.save()

        messages.success(
            request,
            f"Scraper complete! Found: {results['total_found']}, "
            f"Created: {results['total_created']}, Skipped: {results['total_skipped']}"
        )
        return redirect('scraper_logs')

    return render(request, 'scholarship_scraper/run.html', {
        'sources': [],
    })


@login_required(login_url='login')
def scraper_logs(request):
    """View scraper run history"""
    if not request.user.is_staff:
        messages.error(request, 'Access denied.')
        return redirect('homepage')

    logs = ScraperLog.objects.all()[:20]
    sources = ScraperSource.objects.all()

    return render(request, 'scholarship_scraper/logs.html', {
        'logs': logs,
        'sources': sources,
    })
