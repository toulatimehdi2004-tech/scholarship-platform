"""
Django Management Command: check_document_expiries
Runs the @scheduled daily document expiration and scholarship deadline compliance audit.
Usage:
    python manage.py check_document_expiries
"""
from django.core.management.base import BaseCommand
from documents.services import DocumentExpiryCheckService


class Command(BaseCommand):
    help = "Runs daily scheduled check for expiring documents (<= 30 days) and scholarship deadline conflicts."

    def add_arguments(self, parser):
        parser.add_argument(
            '--user',
            type=str,
            default=None,
            help='Run check only for a specific username',
        )

    def handle(self, *args, **options):
        username = options.get('user')
        target_user = None
        if username:
            from django.contrib.auth.models import User
            try:
                target_user = User.objects.get(username=username)
                self.stdout.write(f"Targeting user: {target_user.username}")
            except User.DoesNotExist:
                self.stderr.write(f"User '{username}' not found.")
                return

        self.stdout.write("Starting daily document expiration & deadline check...")
        result = DocumentExpiryCheckService.run_daily_expiry_check(target_user=target_user)

        self.stdout.write(self.style.SUCCESS(
            f"Audit Complete! Checked: {result['checked_documents']}, "
            f"Alerts created: {result['alerts_created']}, "
            f"Alerts updated: {result['alerts_updated']}, "
            f"Active warnings: {result['total_warnings']}"
        ))

        for w in result['warnings']:
            prefix = "[CRITICAL]" if w.get('severity') == 'critical' else "[WARNING]"
            self.stdout.write(f"  {prefix} {w['username']} | {w.get('doc_title')} | {w.get('type')}")
