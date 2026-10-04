"""
Management command: generate_matches
Generate AI scholarship matches for all students or a specific student.

Usage:
    python manage.py generate_matches
    python manage.py generate_matches --username john
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from ai_assistant.matcher import generate_matches


class Command(BaseCommand):
    help = 'Generate AI scholarship matches for students'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            help='Generate matches for a specific student username',
        )

    def handle(self, *args, **options):
        username = options.get('username')

        if username:
            try:
                user = User.objects.get(username=username)
                matches = generate_matches(user)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Generated {len(matches)} matches for {username}"
                    )
                )
                for m in matches[:5]:
                    self.stdout.write(
                        f"  {m.match_score}% - {m.scholarship.title} "
                        f"({m.scholarship.university.name})"
                    )
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"User '{username}' not found"))
        else:
            users = User.objects.filter(student_profile__isnull=False)
            total = 0
            for user in users:
                matches = generate_matches(user, max_results=10)
                total += len(matches)
                self.stdout.write(f"  {user.username}: {len(matches)} matches")

            self.stdout.write(
                self.style.SUCCESS(f"\nGenerated {total} total matches for {users.count()} students")
            )
