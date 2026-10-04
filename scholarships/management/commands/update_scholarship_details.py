import json
import re
from datetime import datetime
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils import timezone

from scholarships.models import University, Scholarship

STOPWORDS = {
    'the', 'a', 'an', 'at', 'for', 'of', 'and', 'in', 'on', 'to', '2026',
    '2027', '2025', 'scholarship', 'scholarships', 'program', 'programme',
    'international', 'students', 'student', 'university', 'college', 'school',
}

HOME_PATHS = {'', '/', '/en', '/en/', '/english', '/english/', '/index.html', '/index.htm'}


def tokens(title):
    return {
        t for t in re.sub(r'[^a-z0-9 ]', ' ', (title or '').lower()).split()
        if t and t not in STOPWORDS
    }


def overlap(a, b):
    ta, tb = tokens(a), tokens(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / max(len(ta), len(tb))


def norm_link(url):
    return (url or '').strip()


def is_homepage_link(link, uni_website):
    if not link:
        return True
    if not uni_website:
        return False
    try:
        from urllib.parse import urlparse
        l, w = urlparse(link), urlparse(uni_website)
        if (l.netloc or '').lower() != (w.netloc or '').lower():
            return False
        return (l.path or '').rstrip('/').lower() in {p.rstrip('/') for p in HOME_PATHS}
    except Exception:
        return False


def map_level(item):
    lvl = (item.get('level') or '').lower()
    title = (item.get('title') or '').lower()
    if lvl in ('bachelor', 'master', 'phd'):
        return lvl
    if re.search(r'master|mba|postgrad', title):
        return 'master'
    if re.search(r'\bphd\b|doctoral|\bdoctor\b', title):
        return 'phd'
    if re.search(r'bachelor|undergrad', title):
        return 'bachelor'
    if re.search(r'chinese language|language program|confucius|\bhsk\b', title):
        return 'other'
    return 'all'


def parse_deadline(raw):
    if not raw:
        return None
    try:
        return timezone.make_aware(datetime.strptime(str(raw)[:10], '%Y-%m-%d'))
    except Exception:
        return None


FALLBACK_DEADLINE = timezone.make_aware(datetime(2027, 6, 30))


class Command(BaseCommand):
    help = 'Enrich scholarships with researched details + tuition fees (campus_data/sch*.json)'

    def handle(self, *args, **options):
        base = Path(__file__).parent / 'campus_data'
        enriched = created = tuition_set = 0
        skipped_apply = 0

        for path in sorted(base.glob('sch*.json')):
            data = json.loads(path.read_text(encoding='utf-8'))
            self.stdout.write(f'Processing {path.name}: {len(data)} universities')
            for entry in data:
                uni = University.objects.filter(name=entry.get('name')).first()
                if not uni:
                    self.stdout.write(self.style.WARNING(f"  no university for: {entry.get('name')}"))
                    continue

                # University-level tuition info -> all its scholarships
                tuition = (entry.get('tuition_info') or '').strip()
                if tuition:
                    n = uni.scholarships.exclude(tuition_info=tuition).update(tuition_info=tuition)
                    tuition_set += n

                existing = list(uni.scholarships.all())
                for item in entry.get('scholarships', []):
                    title = (item.get('title') or '').strip()
                    if not title:
                        continue
                    # Find best existing match by token overlap
                    best, best_score = None, 0.0
                    for s in existing:
                        sc = overlap(title, s.title)
                        if sc > best_score:
                            best, best_score = s, sc
                    if best and best_score >= 0.35:
                        changed = []
                        if len(best.description or '') < 80:
                            cov = item.get('amount_text') or 'see details'
                            best.description = (
                                f"{title}. Coverage: {cov}. "
                                f"Duration: {item.get('duration') or 'see details'}."
                            )
                            changed.append('description')
                        if len(best.eligibility_criteria or '') < 50 and item.get('eligibility'):
                            best.eligibility_criteria = item['eligibility']
                            changed.append('eligibility')
                        if not best.required_documents and item.get('documents'):
                            best.required_documents = item['documents']
                            changed.append('documents')
                        if not best.application_instructions and item.get('instructions'):
                            best.application_instructions = item['instructions']
                            changed.append('instructions')
                        new_link = norm_link(item.get('apply_url'))
                        if new_link and is_homepage_link(best.application_link, uni.website):
                            best.application_link = new_link
                            changed.append('apply_link')
                        if changed:
                            best.save()
                            enriched += 1
                    else:
                        cov = item.get('amount_text') or 'see details'
                        Scholarship.objects.create(
                            university=uni,
                            title=title,
                            description=(
                                f"{title} at {uni.name}. Coverage: {cov}. "
                                f"Duration: {item.get('duration') or 'see details'}."
                            ),
                            type=item.get('type') or 'partial',
                            level=map_level(item),
                            duration=item.get('duration') or '1 academic year',
                            tuition_info=tuition or None,
                            application_deadline=parse_deadline(item.get('application_deadline')) or FALLBACK_DEADLINE,
                            eligibility_criteria=item.get('eligibility') or '',
                            required_documents=item.get('documents') or [],
                            application_instructions=item.get('instructions') or '',
                            application_link=norm_link(item.get('apply_url')) or None,
                            language='English',
                            is_active=True,
                        )
                        created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done: {enriched} enriched, {created} created, tuition set on {tuition_set} rows.'
        ))
