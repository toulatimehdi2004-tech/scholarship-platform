"""
Automated Scholarship Verification Engine
Checks if scholarship links are still active, deadlines are valid,
and auto-deactivates expired/unavailable listings.
"""

import logging
import time
from datetime import timedelta
from urllib.parse import urlparse

import requests
from django.conf import settings
from django.db import models
from django.utils import timezone

from scholarships.models import Scholarship
from .models import ScholarshipVerificationLog

logger = logging.getLogger(__name__)

# Configuration
REQUEST_TIMEOUT = 15  # seconds
MAX_REDIRECTS = 5
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
HEADERS = {"User-Agent": USER_AGENT}

# HTTP status codes that indicate the link is problematic
BROKEN_STATUS_CODES = {404, 410, 500, 502, 503, 521, 522, 523, 525, 530}
REDIRECT_STATUS_CODES = {301, 302, 307, 308}


def check_url_health(url, timeout=REQUEST_TIMEOUT):
    """
    Check if a URL is reachable and healthy.
    Returns a dict with status, http_code, response_time, redirect_url, error.
    """
    result = {
        'status': 'active',
        'http_status_code': None,
        'response_time_ms': None,
        'redirect_url': None,
        'error_message': None,
    }

    if not url:
        result['status'] = 'unreachable'
        result['error_message'] = 'No URL provided'
        return result

    try:
        start = time.time()
        response = requests.get(
            url,
            headers=HEADERS,
            timeout=timeout,
            allow_redirects=True,
            max_redirects=MAX_REDIRECTS,
        )
        elapsed_ms = int((time.time() - start) * 1000)

        result['http_status_code'] = response.status_code
        result['response_time_ms'] = elapsed_ms

        # Check if redirected to a different domain
        if len(response.history) > 0:
            original_domain = urlparse(url).netloc
            final_domain = urlparse(response.url).netloc
            if original_domain != final_domain:
                result['status'] = 'redirected'
                result['redirect_url'] = response.url
                result['error_message'] = (
                    f'Redirected from {original_domain} to {final_domain}'
                )
                return result

        # Check for broken status codes
        if response.status_code in BROKEN_STATUS_CODES:
            result['status'] = 'broken'
            result['error_message'] = f'HTTP {response.status_code}'
            return result

        # Check for generic server errors
        if response.status_code >= 400:
            result['status'] = 'broken'
            result['error_message'] = f'HTTP {response.status_code}'
            return result

        result['status'] = 'active'

    except requests.exceptions.SSLError:
        result['status'] = 'broken'
        result['error_message'] = 'SSL certificate error'
    except requests.exceptions.ConnectionError:
        result['status'] = 'unreachable'
        result['error_message'] = 'Connection failed - host unreachable'
    except requests.exceptions.Timeout:
        result['status'] = 'unreachable'
        result['error_message'] = f'Request timed out after {timeout}s'
    except requests.exceptions.TooManyRedirects:
        result['status'] = 'broken'
        result['error_message'] = 'Too many redirects'
    except requests.exceptions.RequestException as e:
        result['status'] = 'unreachable'
        result['error_message'] = str(e)[:500]

    return result


def verify_scholarship(scholarship, auto_deactivate=True):
    """
    Verify a single scholarship: check link health + deadline expiry.
    Creates a verification log entry.
    Optionally auto-deactivates if broken or expired.
    """
    now = timezone.now()
    url = scholarship.application_link
    action_taken = None

    # Step 1: Check if deadline has passed
    if scholarship.is_deadline_passed():
        log = ScholarshipVerificationLog.objects.create(
            scholarship=scholarship,
            checked_url=url or '',
            status='expired',
            error_message='Application deadline has passed',
            checked_at=now,
        )
        if auto_deactivate and scholarship.is_active:
            scholarship.is_active = False
            scholarship.save(update_fields=['is_active', 'updated_at'])
            log.action_taken = 'Auto-deactivated: deadline expired'
            log.save(update_fields=['action_taken'])
            logger.info(f"Deactivated expired scholarship: {scholarship.title}")
        return log

    # Step 2: Check link health (only if URL exists)
    if url:
        health = check_url_health(url)
        log = ScholarshipVerificationLog.objects.create(
            scholarship=scholarship,
            checked_url=url,
            status=health['status'],
            http_status_code=health['http_status_code'],
            response_time_ms=health['response_time_ms'],
            redirect_url=health['redirect_url'],
            error_message=health['error_message'],
            checked_at=now,
        )

        # Auto-deactivate if link is broken or unreachable
        if auto_deactivate and health['status'] in ('broken', 'unreachable'):
            if scholarship.is_active:
                scholarship.is_active = False
                scholarship.save(update_fields=['is_active', 'updated_at'])
                log.action_taken = f'Auto-deactivated: link {health["status"]}'
                log.save(update_fields=['action_taken'])
                logger.info(
                    f"Deactivated scholarship with broken link: {scholarship.title} "
                    f"({health['status']}: {health['error_message']})"
                )
        return log

    # No URL to check — just log that it was verified by deadline only
    return ScholarshipVerificationLog.objects.create(
        scholarship=scholarship,
        checked_url='',
        status='active',
        error_message='Verified by deadline only (no application link)',
        checked_at=now,
    )


def verify_all_scholarships(auto_deactivate=True, batch_size=None):
    """
    Run verification across all active scholarships.
    Returns summary dict with counts.
    """
    now = timezone.now()
    queryset = Scholarship.objects.filter(is_active=True)

    # Also check recently expired ones that might not have been deactivated
    recently_expired = Scholarship.objects.filter(
        is_active=True,
        application_deadline__lt=now
    )
    queryset = Scholarship.objects.filter(
        models.Q(is_active=True) | models.Q(id__in=recently_expired.values('id'))
    ).distinct()

    if batch_size:
        queryset = queryset[:batch_size]

    results = {
        'total_checked': 0,
        'active': 0,
        'broken': 0,
        'expired': 0,
        'redirected': 0,
        'unreachable': 0,
        'deactivated': 0,
        'errors': [],
    }

    for scholarship in queryset:
        try:
            log = verify_scholarship(scholarship, auto_deactivate=auto_deactivate)
            results['total_checked'] += 1
            results[log.status] = results.get(log.status, 0) + 1
            if log.action_taken and 'deactivated' in log.action_taken.lower():
                results['deactivated'] += 1
        except Exception as e:
            results['errors'].append({
                'scholarship_id': scholarship.id,
                'title': scholarship.title,
                'error': str(e),
            })
            logger.error(f"Error verifying scholarship {scholarship.id}: {e}")

    logger.info(
        f"Verification complete: {results['total_checked']} checked, "
        f"{results['deactivated']} deactivated"
    )
    return results


def get_verification_summary():
    """Get a summary of verification status across all scholarships."""
    now = timezone.now()
    from django.db import models as db_models

    total = Scholarship.objects.count()
    active = Scholarship.objects.filter(is_active=True).count()
    expired_deadline = Scholarship.objects.filter(
        is_active=True, application_deadline__lt=now
    ).count()
    recently_verified = ScholarshipVerificationLog.objects.filter(
        checked_at__gte=now - timedelta(hours=24)
    ).values('scholarship').distinct().count()

    return {
        'total_scholarships': total,
        'active_scholarships': active,
        'expired_deadline_not_deactivated': expired_deadline,
        'verified_last_24h': recently_verified,
    }
