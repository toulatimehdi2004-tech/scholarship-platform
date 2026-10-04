"""
Management command: verify_scholarships
Runs automated verification of all scholarship links and deadlines.
Deactivates expired/broken scholarships.

Usage:
    python manage.py verify_scholarships
    python manage.py verify_scholarships --dry-run
    python manage.py verify_scholarships --summary
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from ai_assistant.verifier import verify_all_scholarships, get_verification_summary
from ai_assistant.models import ScholarshipVerificationLog
from scholarships.models import Scholarship


class Command(BaseCommand):
    help = 'Verify scholarship links and auto-deactivate expired/broken ones'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Check without making changes (no deactivation)',
        )
        parser.add_argument(
            '--summary',
            action='store_true',
            help='Show verification summary without running checks',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=None,
            help='Limit number of scholarships to check',
        )

    def handle(self, *args, **options):
        if options['summary']:
            self._show_summary()
            return

        dry_run = options['dry_run']
        batch_size = options['batch_size']

        mode = "DRY RUN" if dry_run else "LIVE"
        self.stdout.write(
            self.style.WARNING(f"\n=== Scholarship Verification [{mode}] ===\n")
        )

        # Show what will be checked
        active = Scholarship.objects.filter(is_active=True).count()
        expired = Scholarship.objects.filter(
            is_active=True,
            application_deadline__lt=timezone.now()
        ).count()
        self.stdout.write(f"Active scholarships: {active}")
        self.stdout.write(f"Expired deadline (not yet deactivated): {expired}")
        if batch_size:
            self.stdout.write(f"Batch size limit: {batch_size}")
        self.stdout.write("")

        # Run verification
        results = verify_all_scholarships(
            auto_deactivate=not dry_run,
            batch_size=batch_size,
        )

        # Print results
        self.stdout.write(self.style.SUCCESS("\n=== Verification Results ==="))
        self.stdout.write(f"Total checked:      {results['total_checked']}")
        self.stdout.write(f"  Active (healthy): {results['active']}")
        self.stdout.write(f"  Broken links:     {results['broken']}")
        self.stdout.write(f"  Expired:          {results['expired']}")
        self.stdout.write(f"  Redirected:       {results['redirected']}")
        self.stdout.write(f"  Unreachable:      {results['unreachable']}")
        if not dry_run:
            self.stdout.write(
                self.style.WARNING(f"  Auto-deactivated: {results['deactivated']}")
            )

        if results['errors']:
            self.stdout.write(self.style.ERROR(f"\nErrors ({len(results['errors'])}):"))
            for err in results['errors']:
                self.stdout.write(f"  - [{err['scholarship_id']}] {err['title']}: {err['error']}")

        # Also check for scholarships with passed deadlines that are still active
        expired_still_active = Scholarship.objects.filter(
            is_active=True,
            application_deadline__lt=timezone.now()
        )
        if expired_still_active.exists() and not dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"\nDeactivating {expired_still_active.count()} "
                    f"expired scholarships still marked active..."
                )
            )
            for s in expired_still_active:
                s.is_active = False
                s.save(update_fields=['is_active', 'updated_at'])
                ScholarshipVerificationLog.objects.create(
                    scholarship=s,
                    checked_url=s.application_link or '',
                    status='expired',
                    error_message='Deadline passed',
                    action_taken='Auto-deactivated: deadline expired',
                    checked_at=timezone.now(),
                )
                self.stdout.write(f"  Deactivated: {s.title}")

        self.stdout.write(self.style.SUCCESS("\nDone!"))

    def _show_summary(self):
        summary = get_verification_summary()
        self.stdout.write(self.style.SUCCESS("\n=== Verification Summary ==="))
        self.stdout.write(f"Total scholarships:     {summary['total_scholarships']}")
        self.stdout.write(f"Active:                 {summary['active_scholarships']}")
        self.stdout.write(
            f"Expired (not deactivated): {summary['expired_deadline_not_deactivated']}"
        )
        self.stdout.write(f"Verified in last 24h:  {summary['verified_last_24h']}")
