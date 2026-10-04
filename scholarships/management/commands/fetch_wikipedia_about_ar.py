import json
import time
import urllib.parse
import urllib.request
import urllib.error

from django.core.management.base import BaseCommand

from scholarships.models import University

EN_API = 'https://en.wikipedia.org/w/api.php'
AR_API = 'https://ar.wikipedia.org/w/api.php'

SKIP = {'scholars4dev.com', 'China Scholarship Council', 'Various Chinese Universities'}


def api_get(base, params):
    url = base + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(
        url, headers={'User-Agent': 'ScholarshipPlatform/1.0 (education info)'})
    last_err = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code == 429:
                time.sleep(10 * (attempt + 1))
                continue
            raise
    raise last_err


def ar_title_for(en_title):
    """Arabic interlanguage title for an English article, or None."""
    data = api_get(EN_API, {
        'action': 'query', 'format': 'json', 'prop': 'langlinks',
        'lllang': 'ar', 'redirects': 1, 'titles': en_title,
    })
    pages = data.get('query', {}).get('pages', {})
    for pid, page in pages.items():
        if pid == '-1':
            return None
        for ll in page.get('langlinks', []):
            if ll.get('lang') == 'ar':
                return ll.get('*')
    return None


def ar_extract(ar_title):
    data = api_get(AR_API, {
        'action': 'query', 'format': 'json', 'prop': 'extracts',
        'explaintext': 1, 'redirects': 1, 'titles': ar_title,
    })
    pages = data.get('query', {}).get('pages', {})
    for pid, page in pages.items():
        if pid == '-1' or 'missing' in page:
            return ''
        return page.get('extract', '')
    return ''


def pick_paragraphs(extract, max_paras=5, max_chars=3200):
    paras = [p.strip() for p in (extract or '').split('\n') if len(p.strip()) > 80]
    chosen, total = [], 0
    for p in paras:
        if len(chosen) >= max_paras:
            break
        if total + len(p) > max_chars and chosen:
            break
        chosen.append(p)
        total += len(p)
    return '\n\n'.join(chosen)


def en_title_of(u):
    if u.wikipedia_url:
        seg = (u.wikipedia_url or '').rstrip('/').split('/')[-1]
        return urllib.parse.unquote(seg).replace('_', ' ')
    return u.name


class Command(BaseCommand):
    help = 'Fetch native Arabic Wikipedia summaries via interlanguage links'

    def handle(self, *args, **options):
        ok = no_ar = short = 0
        for u in University.objects.order_by('id'):
            if u.name in SKIP:
                continue
            if u.about_ar and len(u.about_ar) > 200:
                continue
            try:
                ar_title = ar_title_for(en_title_of(u))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  ERR link {u.name}: {e}'))
                no_ar += 1
                continue
            if not ar_title:
                no_ar += 1
                continue
            try:
                extract = ar_extract(ar_title)
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  ERR text {u.name}: {e}'))
                no_ar += 1
                continue
            about = pick_paragraphs(extract)
            if len(about) < 200:
                short += 1
                continue
            u.about_ar = about
            u.save(update_fields=['about_ar'])
            ok += 1
            self.stdout.write(f'  ok {u.name}: {len(about)} chars')
            time.sleep(2)
        self.stdout.write(self.style.SUCCESS(
            f'Done: {ok} Arabic summaries, {no_ar} no Arabic article, {short} too short.'
        ))
