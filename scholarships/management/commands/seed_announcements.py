import json
from datetime import datetime
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils import timezone

from scholarships.models import University, Scholarship, AdmissionAnnouncement

VALID_KINDS = {c for c, _ in AdmissionAnnouncement.KIND_CHOICES}
FALLBACK_DEADLINE = timezone.make_aware(datetime(2027, 6, 30))


def parse_date(raw):
    if not raw:
        return None
    try:
        return datetime.strptime(str(raw)[:10], '%Y-%m-%d').date()
    except Exception:
        return None


class Command(BaseCommand):
    help = 'Seed admission announcements (+ Chang\'an University) from campus_data/ann*.json'

    def handle(self, *args, **options):
        base = Path(__file__).parent / 'campus_data'
        created = skipped = 0

        for path in sorted(base.glob('ann*.json')):
            data = json.loads(path.read_text(encoding='utf-8'))
            self.stdout.write(f'Processing {path.name}: {len(data)} entries')
            for entry in data:
                name = (entry.get('name') or '').strip()
                if not name:
                    continue

                # NEW university (Chang'an)
                if '(NEW)' in name:
                    uni, uni_created = University.objects.update_or_create(
                        name="Chang'an University",
                        defaults={
                            'website': entry['profile'].get('website'),
                            'city': entry['profile'].get('city', "Xi'an"),
                            'country': entry['profile'].get('country', 'China'),
                            'address': entry['profile'].get('address'),
                            'founding_year': entry['profile'].get('founding_year'),
                            'motto': entry['profile'].get('motto'),
                            'description': entry['profile'].get('description'),
                            'latitude': entry['profile'].get('latitude'),
                            'longitude': entry['profile'].get('longitude'),
                            'tagline': entry['profile'].get('tagline'),
                            'is_verified': True,
                        },
                    )
                    self.stdout.write(f'  Chang\'an university id={uni.id} (created={uni_created})')
                    for s in entry.get('scholarships', []):
                        title = (s.get('title') or '').strip()
                        if not title:
                            continue
                        Scholarship.objects.update_or_create(
                            university=uni, title=title,
                            defaults={
                                'description': f"{title} at Chang'an University.",
                                'type': s.get('type') or 'partial',
                                'level': s.get('level') or 'bachelor',
                                'duration': s.get('duration') or '1 academic year',
                                'application_deadline': self._deadline(s.get('application_deadline') or s.get('deadline')),
                                'eligibility_criteria': s.get('eligibility') or s.get('eligibility_criteria') or '',
                                'required_documents': s.get('documents') or s.get('required_documents') or [],
                                'application_instructions': s.get('instructions') or s.get('application_instructions') or '',
                                'application_link': (s.get('apply_url') or s.get('application_link')
                                                     or entry['profile'].get('admission_url')),
                                'language': 'English',
                                'is_active': True,
                            },
                        )
                    uni = uni  # announcements below attach to it
                else:
                    uni = University.objects.filter(name=name).first()
                    if not uni:
                        self.stdout.write(self.style.WARNING(f'  no university for: {name}'))
                        continue

                items = entry.get('announcements', []) or []
                # Most recent first (null dates last), cap at 10 per university
                items = sorted(
                    items,
                    key=lambda x: (parse_date(x.get('date')) is None, parse_date(x.get('date'))),
                    reverse=False,
                )
                # sort: dated desc, then undated
                dated = sorted(
                    [x for x in items if parse_date(x.get('date'))],
                    key=lambda x: parse_date(x.get('date')), reverse=True,
                )
                undated = [x for x in items if not parse_date(x.get('date'))]
                items = (dated + undated)[:10]

                for order, a in enumerate(items):
                    title = (a.get('title') or '').strip()
                    url = (a.get('url') or '').strip()
                    if not title or not url:
                        skipped += 1
                        continue
                    kind = (a.get('kind') or 'notice').lower()
                    if kind not in VALID_KINDS:
                        kind = 'notice'
                    _, was = AdmissionAnnouncement.objects.update_or_create(
                        university=uni, title=title[:300],
                        defaults={
                            'date': parse_date(a.get('date')),
                            'url': url[:1000],
                            'kind': kind,
                            'order': order,
                        },
                    )
                    if was:
                        created += 1

        total = AdmissionAnnouncement.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f'Done: {created} created, {skipped} skipped (no title/url). Total: {total}'
        ))

    def _deadline(self, raw):
        if not raw:
            return FALLBACK_DEADLINE
        try:
            return timezone.make_aware(datetime.strptime(str(raw)[:10], '%Y-%m-%d'))
        except Exception:
            return FALLBACK_DEADLINE
