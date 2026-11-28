"""
Document Expiry & Compliance Services
Handles:
1. Daily @scheduled check for expiring documents (<= 30 days) and documents
   expiring BEFORE tracked scholarship deadlines.
2. Alert generation and persistence in DocumentExpiryAlert.
3. Integration with DeadlineTimezoneUtil for multi-timezone deadline comparisons.
"""
from datetime import datetime, timezone, date
import logging
from typing import Dict, Any, List, Optional
from django.contrib.auth.models import User
from django.utils import timezone as dj_timezone

from documents.models import StudentDocument, DocumentExpiryAlert
from documents.timezone_utils import DeadlineTimezoneUtil
from students.models import ApplicationTracker

logger = logging.getLogger(__name__)


class DocumentExpiryCheckService:
    """
    Core service that performs validity compliance audits across all student documents
    against 30-day thresholds and tracked scholarship deadlines.
    """

    @classmethod
    def run_daily_expiry_check(cls, target_user: Optional[User] = None) -> Dict[str, Any]:
        """
        Runs the daily document audit.
        Checks:
        1. Documents expiring within 30 days (or already expired).
        2. Documents expiring BEFORE any tracked scholarship deadline.
        """
        now_date = dj_timezone.now().date()
        doc_qs = StudentDocument.objects.filter(expiry_date__isnull=False).select_related('user')
        if target_user:
            doc_qs = doc_qs.filter(user=target_user)

        total_checked = 0
        alerts_created = 0
        alerts_updated = 0
        warnings_found: List[Dict[str, Any]] = []

        # Cache tracked applications grouped by user
        # Only check active / relevant statuses (wishlist, preparing_docs, submitted, interview)
        active_statuses = ['wishlist', 'preparing_docs', 'submitted', 'interview']
        tracker_qs = ApplicationTracker.objects.filter(
            status__in=active_statuses
        ).select_related('student__user', 'scholarship')

        tracker_by_user_id: Dict[int, List[ApplicationTracker]] = {}
        for app in tracker_qs:
            uid = app.student.user_id
            tracker_by_user_id.setdefault(uid, []).append(app)

        for doc in doc_qs:
            total_checked += 1
            user = doc.user
            expiry = doc.expiry_date
            days_until = (expiry - now_date).days
            doc_title = doc.get_title()
            doc_type = doc.doc_type

            # ── Check 1: 30-Day Expiration / Already Expired ──
            if days_until <= 30:
                is_expired = days_until < 0
                alert_type = 'EXPIRED' if is_expired else 'EXPIRING_SOON_30D'
                severity = 'critical' if (is_expired or days_until <= 7) else 'warning'

                if is_expired:
                    title = f"Document Expired: {doc_title}"
                    title_fr = f"Document Expiré : {doc_title}"
                    title_ar = f"وثيقة منتهية الصلاحية: {doc_title}"
                    msg = f"Your {doc_title} expired on {expiry} ({abs(days_until)} days ago). Chinese universities and CSC will reject expired documents. Please upload an updated certificate immediately."
                    msg_fr = f"Votre document {doc_title} a expiré le {expiry} (il y a {abs(days_until)} jours). Les universités chinoises et le CSC refusent les documents périmés. Veuillez téléverser un document à jour immédiatement."
                    msg_ar = f"انتهت صلاحية وثيقتك {doc_title} بتاريخ {expiry} (منذ {abs(days_until)} يوم). ترفض الجامعات الصينية والمنح الوثائق منتهية الصلاحية. يرجى تجديدها وتحميل النسخة الجديدة فوراً."
                else:
                    title = f"Expiring Soon: {doc_title} ({days_until} days remaining)"
                    title_fr = f"Expiration Proche : {doc_title} ({days_until} jours restants)"
                    title_ar = f"اقتراب انتهاء الصلاحية: {doc_title} (متبقي {days_until} يوم)"
                    msg = f"Your {doc_title} is expiring on {expiry} ({days_until} days left). If this is a 6-month Police Clearance or Foreigner Physical Exam, ensure your renewal is underway before submitting applications."
                    msg_fr = f"Votre {doc_title} arrive à expiration le {expiry} ({days_until} jours restants). Pour le Casier Judiciaire ou la Visite Médicale (validité 6 mois), préparez le renouvellement avant le dépôt."
                    msg_ar = f"تنتهي صلاحية {doc_title} بتاريخ {expiry} (متبقي {days_until} يوم). بالنسبة للفحص الطبي وحسن السيرة (صلاحية 6 أشهر)، يرجى البدء في تجديدها فوراً."

                alert, created = DocumentExpiryAlert.objects.update_or_create(
                    user=user,
                    document=doc,
                    alert_type=alert_type,
                    scholarship=None,
                    defaults={
                        'severity': severity,
                        'title': title,
                        'title_fr': title_fr,
                        'title_ar': title_ar,
                        'message': msg,
                        'message_fr': msg_fr,
                        'message_ar': msg_ar,
                        'expiry_date': expiry,
                        'days_until_expiry': days_until,
                        'is_resolved': False,
                    }
                )
                if created:
                    alerts_created += 1
                else:
                    alerts_updated += 1

                warnings_found.append({
                    'type': alert_type,
                    'severity': severity,
                    'doc_id': doc.id,
                    'doc_title': doc_title,
                    'expiry_date': str(expiry),
                    'days_until_expiry': days_until,
                    'user_id': user.id,
                    'username': user.username,
                    'message': msg,
                })

            # ── Check 2: Expiration BEFORE Tracked Scholarship Deadline ──
            user_apps = tracker_by_user_id.get(user.id, [])
            for app in user_apps:
                sch = app.scholarship
                # Gather deadlines to check (prioritize embassy_deadline, university_deadline, then application_deadline)
                deadlines_to_check = []
                if sch.embassy_deadline:
                    deadlines_to_check.append(('Embassy Deadline', sch.embassy_deadline))
                if sch.university_deadline:
                    deadlines_to_check.append(('University Portal Deadline', sch.university_deadline))
                if not deadlines_to_check and sch.application_deadline:
                    deadlines_to_check.append(('Application Deadline', sch.application_deadline))

                for label, deadline_dt in deadlines_to_check:
                    tz_info = DeadlineTimezoneUtil.convert_deadline(
                        deadline_dt,
                        host_timezone_name=sch.host_timezone or 'Asia/Shanghai',
                        user_timezone_name='Africa/Casablanca'
                    )
                    eval_result = DeadlineTimezoneUtil.evaluate_doc_against_deadline(expiry, deadline_dt)

                    if eval_result.get('has_conflict') and eval_result.get('severity') == 'critical':
                        diff = eval_result['days_difference']
                        host_str = tz_info.get('host', {}).get('formatted', '')
                        user_str = tz_info.get('user', {}).get('formatted', '')

                        title = f"Deadline Conflict: {doc_title} expires BEFORE {sch.title}"
                        title_fr = f"Conflit de Date : {doc_title} expire AVANT {sch.title}"
                        title_ar = f"تعارض في الموعد: تنتهي صلاحية {doc_title} قبل موعد منحة {sch.title}"

                        msg = (
                            f"CRITICAL WARNING: Your document '{doc_title}' expires on {expiry}, which is {abs(diff)} day(s) "
                            f"BEFORE the {label} for '{sch.title}' ({host_str}). Chinese admissions & visa authorities "
                            f"require all official documents (especially Police Clearance and Medical Exam) to remain strictly valid "
                            f"at the time of evaluation. Renew this document immediately!"
                        )
                        msg_fr = (
                            f"AVERTISSEMENT CRITIQUE : Votre document '{doc_title}' expire le {expiry}, soit {abs(diff)} jour(s) "
                            f"AVANT la date limite ({label}) de '{sch.title}' ({host_str}). Les autorités consulaires et universitaires "
                            f"exigent des documents en cours de validité (en particulier Casier Judiciaire et Examen Médical). Renouvelez ce document sans attendre !"
                        )
                        msg_ar = (
                            f"تحذير هام جداً: وثيقتك '{doc_title}' تنتهي صلاحيتها في {expiry}، أي قبل الموعد النهائي ({label}) "
                            f"لمنحة '{sch.title}' بـ {abs(diff)} يوم ({host_str}). تتطلب لوائح القبول والتأشيرات بالصين وثائق سارية المفعول "
                            f"(خصوصاً الفحص الطبي وحسن السيرة). يجب تجديد الوثيقة فوراً!"
                        )

                        alert, created = DocumentExpiryAlert.objects.update_or_create(
                            user=user,
                            document=doc,
                            scholarship=sch,
                            alert_type='EXPIRES_BEFORE_DEADLINE',
                            defaults={
                                'severity': 'critical',
                                'title': title,
                                'title_fr': title_fr,
                                'title_ar': title_ar,
                                'message': msg,
                                'message_fr': msg_fr,
                                'message_ar': msg_ar,
                                'expiry_date': expiry,
                                'deadline_utc': DeadlineTimezoneUtil.parse_datetime(deadline_dt),
                                'host_deadline_str': host_str,
                                'user_deadline_str': user_str,
                                'days_until_expiry': days_until,
                                'days_difference': diff,
                                'is_resolved': False,
                            }
                        )
                        if created:
                            alerts_created += 1
                        else:
                            alerts_updated += 1

                        warnings_found.append({
                            'type': 'EXPIRES_BEFORE_DEADLINE',
                            'severity': 'critical',
                            'doc_id': doc.id,
                            'doc_title': doc_title,
                            'expiry_date': str(expiry),
                            'scholarship_id': sch.id,
                            'scholarship_title': sch.title,
                            'deadline_label': label,
                            'host_deadline': host_str,
                            'user_deadline': user_str,
                            'days_difference': diff,
                            'user_id': user.id,
                            'username': user.username,
                            'message': msg,
                        })

        logger.info(
            f"[DocumentExpiryCheckService] Checked {total_checked} docs: "
            f"{alerts_created} created, {alerts_updated} updated, {len(warnings_found)} active warnings."
        )

        return {
            'checked_documents': total_checked,
            'alerts_created': alerts_created,
            'alerts_updated': alerts_updated,
            'total_warnings': len(warnings_found),
            'warnings': warnings_found,
            'timestamp': dj_timezone.now().isoformat(),
        }

    @classmethod
    def get_user_expiry_warnings(cls, user: User, user_tz: str = 'Africa/Casablanca') -> List[Dict[str, Any]]:
        """
        Evaluates and returns live expiry warnings for a specific student.
        Useful for on-the-fly UI rendering in Document Vault & Tracker.
        """
        now_date = dj_timezone.now().date()
        docs = StudentDocument.objects.filter(user=user, expiry_date__isnull=False)
        user_apps = ApplicationTracker.objects.filter(
            student__user=user,
            status__in=['wishlist', 'preparing_docs', 'submitted', 'interview']
        ).select_related('scholarship')

        warnings: List[Dict[str, Any]] = []

        for doc in docs:
            days_until = (doc.expiry_date - now_date).days
            doc_title = doc.get_title()

            # Rule 1: <= 30 days
            if days_until <= 30:
                is_expired = days_until < 0
                warnings.append({
                    'id': f"warn-30d-{doc.id}",
                    'rule': 'EXPIRED' if is_expired else 'EXPIRING_SOON_30D',
                    'severity': 'critical' if (is_expired or days_until <= 7) else 'warning',
                    'doc_id': doc.id,
                    'doc_title': doc_title,
                    'doc_type': doc.doc_type,
                    'doc_type_display': doc.get_doc_type_display(),
                    'expiry_date': str(doc.expiry_date),
                    'days_until_expiry': days_until,
                    'is_expired': is_expired,
                    'title': f"{'Document Expired' if is_expired else 'Expiring Soon'}: {doc_title}",
                    'message': f"Expires on {doc.expiry_date} ({days_until} days remaining). Renewal required.",
                })

            # Rule 2: Conflicts with tracked scholarships
            for app in user_apps:
                sch = app.scholarship
                deadlines = []
                if sch.embassy_deadline:
                    deadlines.append(('Embassy Deadline', sch.embassy_deadline))
                if sch.university_deadline:
                    deadlines.append(('University Deadline', sch.university_deadline))
                if not deadlines and sch.application_deadline:
                    deadlines.append(('Application Deadline', sch.application_deadline))

                for label, dead in deadlines:
                    eval_res = DeadlineTimezoneUtil.evaluate_doc_against_deadline(doc.expiry_date, dead)
                    if eval_res.get('has_conflict') and eval_res.get('severity') == 'critical':
                        tz_conv = DeadlineTimezoneUtil.convert_deadline(
                            dead,
                            host_timezone_name=sch.host_timezone or 'Asia/Shanghai',
                            user_timezone_name=user_tz
                        )
                        diff = eval_res['days_difference']
                        warnings.append({
                            'id': f"warn-conflict-{doc.id}-{sch.id}",
                            'rule': 'EXPIRES_BEFORE_DEADLINE',
                            'severity': 'critical',
                            'doc_id': doc.id,
                            'doc_title': doc_title,
                            'doc_type': doc.doc_type,
                            'doc_type_display': doc.get_doc_type_display(),
                            'expiry_date': str(doc.expiry_date),
                            'scholarship_id': sch.id,
                            'scholarship_title': sch.title,
                            'deadline_label': label,
                            'deadline_utc': tz_conv.get('utc', {}).get('formatted'),
                            'host_deadline': tz_conv.get('host', {}).get('formatted'),
                            'user_deadline': tz_conv.get('user', {}).get('formatted'),
                            'days_difference': diff,
                            'title': f"Deadline Conflict: {doc_title} expires BEFORE {sch.title}",
                            'message': f"Document expires {abs(diff)} day(s) before the {label} ({tz_conv.get('host', {}).get('formatted')}).",
                        })

        return warnings
