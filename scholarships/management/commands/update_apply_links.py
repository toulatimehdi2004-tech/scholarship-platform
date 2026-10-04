import json
from pathlib import Path
from urllib.parse import urlparse

from django.core.management.base import BaseCommand

from scholarships.models import University, Scholarship

CSC_PORTAL = 'https://www.campuschina.org/'

OVERRIDES = {
    # Batch B agent researched the wrong "GMU" (Guangzhou instead of Guangdong Medical University)
    'GMU': 'https://en.gdmu.edu.cn/index/Global/International_Students.htm',
}

HOME_PATHS = {'', '/', '/en', '/en/', '/english', '/english/', '/index.html', '/index.htm'}


def norm(url):
    return (url or '').strip().rstrip('/').lower()


def is_homepage_link(link, uni_website):
    if not link:
        return True
    if not uni_website:
        return False
    try:
        l, w = urlparse(link), urlparse(uni_website)
        if (l.netloc or '').lower() != (w.netloc or '').lower():
            return False
        return (l.path or '').rstrip('/').lower() in {p.rstrip('/') for p in HOME_PATHS}
    except Exception:
        return False


class Command(BaseCommand):
    help = 'Replace homepage-style application_link values with researched admission/apply page URLs'

    def handle(self, *args, **options):
        base = Path(__file__).parent / 'campus_data'
        mapping = {}
        for path in sorted(base.glob('admission*.json')):
            for entry in json.loads(path.read_text(encoding='utf-8')):
                mapping[entry['name']] = entry['admission_url']
        mapping.update(OVERRIDES)

        replaced = kept = missing_uni = 0

        for name, admission_url in mapping.items():
            uni = University.objects.filter(name=name).first()
            if not uni:
                self.stdout.write(self.style.WARNING(f'  no university for: {name}'))
                missing_uni += 1
                continue
            for s in uni.scholarships.all():
                if not s.application_link or is_homepage_link(s.application_link, uni.website):
                    old = s.application_link
                    s.application_link = admission_url
                    s.save(update_fields=['application_link'])
                    replaced += 1
                    self.stdout.write(f'  {s.id} {uni.name}: {norm(old) or "(empty)"} -> {admission_url}')
                else:
                    kept += 1

        # CSC-type placeholder rows -> CSC online application portal
        for row_name in ['China Scholarship Council', 'Various Chinese Universities']:
            uni = University.objects.filter(name=row_name).first()
            if uni:
                for s in uni.scholarships.all():
                    if not s.application_link or 'campuschina' not in (s.application_link or ''):
                        s.application_link = CSC_PORTAL
                        s.save(update_fields=['application_link'])
                        replaced += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done: {replaced} replaced, {kept} already-specific links kept, {missing_uni} universities not found.'
        ))
