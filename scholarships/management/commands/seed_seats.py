import random

from django.core.management.base import BaseCommand

from scholarships.models import Scholarship

RANGES = {
    'full': (10, 30),
    'partial': (25, 60),
    'tuition': (15, 50),
    'living': (15, 50),
    'research': (10, 25),
    'other': (15, 50),
}


class Command(BaseCommand):
    help = 'Seed plausible seat numbers (deterministic per scholarship id)'

    def handle(self, *args, **options):
        updated = full = 0
        for s in Scholarship.objects.filter(total_seats=0).order_by('id'):
            rng = random.Random(s.id)
            lo, hi = RANGES.get(s.type, (15, 50))
            total = rng.randint(lo, hi)
            roll = rng.random()
            if roll < 0.15:
                filled = total  # completely full
                full += 1
            elif roll < 0.35:
                filled = rng.randint(max(0, total - 3), total)  # almost full
            else:
                filled = rng.randint(0, total)
            s.total_seats = total
            s.seats_filled = filled
            s.save(update_fields=['total_seats', 'seats_filled'])
            updated += 1
        self.stdout.write(self.style.SUCCESS(
            f'Done: {updated} seeded, {full} completely full.'
        ))
