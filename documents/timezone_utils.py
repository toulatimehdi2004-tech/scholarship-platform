"""
DeadlineTimezoneUtil
Converts UTC deadlines into:
1. The host university's timezone (e.g., Asia/Shanghai for Chinese universities, UTC+8).
2. The user's local browser / home timezone (e.g., Africa/Casablanca, Europe/Paris, America/New_York).
Provides rich countdown calculations, localized strings, and compliance checks.
"""
from datetime import datetime, timezone, date
from zoneinfo import ZoneInfo
from typing import Optional, Dict, Any


class DeadlineTimezoneUtil:
    DEFAULT_HOST_TIMEZONE = 'Asia/Shanghai'
    DEFAULT_USER_TIMEZONE = 'Africa/Casablanca'

    @classmethod
    def get_safe_zone(cls, tz_name: Optional[str], fallback: str = 'UTC') -> ZoneInfo:
        """Safely loads a ZoneInfo object, falling back if invalid or missing."""
        if not tz_name:
            return ZoneInfo(fallback)
        clean = str(tz_name).strip()
        try:
            return ZoneInfo(clean)
        except Exception:
            # Handle common aliases
            aliases = {
                'Beijing': 'Asia/Shanghai',
                'China': 'Asia/Shanghai',
                'CST': 'Asia/Shanghai',
                'Morocco': 'Africa/Casablanca',
                'Rabat': 'Africa/Casablanca',
                'Casablanca': 'Africa/Casablanca',
                'Paris': 'Europe/Paris',
                'London': 'Europe/London',
            }
            if clean in aliases:
                try:
                    return ZoneInfo(aliases[clean])
                except Exception:
                    pass
            return ZoneInfo(fallback)

    @classmethod
    def parse_datetime(cls, dt_value) -> Optional[datetime]:
        """Ensures a datetime is aware and in UTC."""
        if not dt_value:
            return None
        if isinstance(dt_value, datetime):
            if dt_value.tzinfo is None:
                return dt_value.replace(tzinfo=timezone.utc)
            return dt_value.astimezone(timezone.utc)
        if isinstance(dt_value, date):
            return datetime.combine(dt_value, datetime.min.time(), tzinfo=timezone.utc)
        if isinstance(dt_value, str):
            clean = dt_value.strip().replace('Z', '+00:00')
            try:
                parsed = datetime.fromisoformat(clean)
                if parsed.tzinfo is None:
                    return parsed.replace(tzinfo=timezone.utc)
                return parsed.astimezone(timezone.utc)
            except Exception:
                return None
        return None

    @classmethod
    def convert_deadline(
        cls,
        utc_dt_input,
        host_timezone_name: str = DEFAULT_HOST_TIMEZONE,
        user_timezone_name: str = DEFAULT_USER_TIMEZONE,
    ) -> Dict[str, Any]:
        """
        Converts UTC deadline into both the host university's timezone
        and the user's local timezone.
        """
        utc_dt = cls.parse_datetime(utc_dt_input)
        if not utc_dt:
            return {
                'is_set': False,
                'utc': None,
                'host': None,
                'user': None,
                'countdown': {
                    'days_remaining': None,
                    'hours_remaining': None,
                    'is_passed': False,
                    'is_urgent': False,
                    'human': 'No deadline specified',
                }
            }

        now_utc = datetime.now(timezone.utc)
        delta = utc_dt - now_utc
        total_seconds = int(delta.total_seconds())
        days_remaining = delta.days
        hours_remaining = total_seconds // 3600
        is_passed = total_seconds < 0
        is_urgent = 0 <= days_remaining <= 14
        is_critical = 0 <= days_remaining <= 3

        host_tz = cls.get_safe_zone(host_timezone_name, cls.DEFAULT_HOST_TIMEZONE)
        user_tz = cls.get_safe_zone(user_timezone_name, cls.DEFAULT_USER_TIMEZONE)

        host_dt = utc_dt.astimezone(host_tz)
        user_dt = utc_dt.astimezone(user_tz)

        # Offsets
        host_offset = host_dt.strftime('%z')  # e.g. +0800
        user_offset = user_dt.strftime('%z')  # e.g. +0100

        host_tz_abbr = host_dt.tzname() or str(host_tz)
        user_tz_abbr = user_dt.tzname() or str(user_tz)

        host_offset_str = f"UTC{host_offset[:3]}:{host_offset[3:]}" if len(host_offset) >= 5 else "UTC"
        user_offset_str = f"UTC{user_offset[:3]}:{user_offset[3:]}" if len(user_offset) >= 5 else "UTC"

        return {
            'is_set': True,
            'utc': {
                'iso': utc_dt.isoformat(),
                'formatted': utc_dt.strftime('%b %d, %Y %H:%M UTC'),
                'date': utc_dt.strftime('%Y-%m-%d'),
                'time': utc_dt.strftime('%H:%M'),
            },
            'host': {
                'timezone': str(host_tz),
                'abbr': host_tz_abbr,
                'offset': host_offset_str,
                'iso': host_dt.isoformat(),
                'formatted': host_dt.strftime('%b %d, %Y %H:%M') + f" ({host_tz_abbr}, {host_offset_str})",
                'date': host_dt.strftime('%Y-%m-%d'),
                'time': host_dt.strftime('%H:%M'),
            },
            'user': {
                'timezone': str(user_tz),
                'abbr': user_tz_abbr,
                'offset': user_offset_str,
                'iso': user_dt.isoformat(),
                'formatted': user_dt.strftime('%b %d, %Y %H:%M') + f" ({user_tz_abbr}, {user_offset_str})",
                'date': user_dt.strftime('%Y-%m-%d'),
                'time': user_dt.strftime('%H:%M'),
            },
            'countdown': {
                'days_remaining': max(0, days_remaining) if not is_passed else 0,
                'hours_remaining': max(0, hours_remaining) if not is_passed else 0,
                'total_seconds': total_seconds,
                'is_passed': is_passed,
                'is_urgent': is_urgent,
                'is_critical': is_critical,
                'human': cls._format_human_countdown(days_remaining, is_passed),
            }
        }

    @staticmethod
    def _format_human_countdown(days: int, is_passed: bool) -> str:
        if is_passed:
            abs_days = abs(days)
            return f"Expired {abs_days} day{'s' if abs_days != 1 else ''} ago"
        if days == 0:
            return "Closes today!"
        if days == 1:
            return "Closes tomorrow!"
        if days <= 14:
            return f"Urgent: {days} days remaining"
        return f"{days} days remaining"

    @classmethod
    def evaluate_doc_against_deadline(cls, doc_expiry_date, scholarship_deadline_utc) -> Dict[str, Any]:
        """
        Compares a document's expiration date (DateField) against a scholarship's UTC deadline.
        Returns conflict analysis.
        """
        if not doc_expiry_date or not scholarship_deadline_utc:
            return {'has_conflict': False, 'reason': 'Missing dates'}

        if isinstance(doc_expiry_date, str):
            try:
                doc_expiry_date = date.fromisoformat(doc_expiry_date)
            except Exception:
                return {'has_conflict': False, 'reason': 'Invalid doc expiry format'}

        dead_dt = cls.parse_datetime(scholarship_deadline_utc)
        if not dead_dt:
            return {'has_conflict': False, 'reason': 'Invalid deadline format'}

        deadline_date = dead_dt.date()
        days_diff = (doc_expiry_date - deadline_date).days

        if days_diff < 0:
            return {
                'has_conflict': True,
                'severity': 'critical',
                'rule': 'EXPIRES_BEFORE_DEADLINE',
                'days_difference': days_diff,
                'deadline_date': str(deadline_date),
                'doc_expiry_date': str(doc_expiry_date),
                'message_en': f"Document expires {abs(days_diff)} day(s) BEFORE the scholarship deadline ({deadline_date}). Immediate renewal required!",
                'message_fr': f"Le document expire {abs(days_diff)} jour(s) AVANT la date limite de la bourse ({deadline_date}). Renouvellement impératif !",
                'message_ar': f"تنتهي صلاحية الوثيقة قبل الموعد النهائي للمنحة بـ {abs(days_diff)} يوم ({deadline_date}). يلزم تجديدها فوراً!",
            }
        elif days_diff <= 30:
            return {
                'has_conflict': True,
                'severity': 'warning',
                'rule': 'EXPIRES_NEAR_DEADLINE',
                'days_difference': days_diff,
                'deadline_date': str(deadline_date),
                'doc_expiry_date': str(doc_expiry_date),
                'message_en': f"Document expires only {days_diff} day(s) after deadline. May risk rejection during embassy visa review.",
                'message_fr': f"Le document expire seulement {days_diff} jour(s) après la date limite. Risque de rejet lors du visa consulat.",
                'message_ar': f"تنتهي صلاحية الوثيقة بعد {days_diff} يوم فقط من الموعد النهائي. قد تواجه مشاكل في مراجعة تأشيرة السفارة.",
            }

        return {
            'has_conflict': False,
            'severity': 'ok',
            'days_difference': days_diff,
            'deadline_date': str(deadline_date),
            'doc_expiry_date': str(doc_expiry_date),
            'message_en': f"Valid until {doc_expiry_date} ({days_diff} days beyond deadline).",
        }
