import json
import time
import urllib.parse
import urllib.request
import urllib.error

from django.core.management.base import BaseCommand

from scholarships.models import University

WIKI_TITLE_OVERRIDES = {
    'UCAS': 'University of Chinese Academy of Sciences',
    'CUFE': 'Central University of Finance and Economics',
    'BFSU': 'Beijing Foreign Studies University',
    'CUGB': 'China University of Geosciences (Beijing)',
    'ECNU': 'East China Normal University',
    'SISU': 'Shanghai International Studies University',
    'SCUT': 'South China University of Technology',
    'SCNU': 'South China Normal University',
    'GDUT': 'Guangdong University of Technology',
    'GMU': 'Guangdong Medical University',
    'NJUST': 'Nanjing University of Science and Technology',
    'NJUPT': 'Nanjing University of Posts and Telecommunications',
    'NNU': 'Nanjing Normal University',
    'CCNU': 'Central China Normal University',
    'WHUT': 'Wuhan University of Technology',
    'HZAU': 'Huazhong Agricultural University',
    'ZUEL': 'Zhongnan University of Economics and Law',
    'UESTC': 'University of Electronic Science and Technology of China',
    'SUFE': 'Shanghai University of Finance and Economics',
    'CDUT': 'Chengdu University of Technology',
    'HEU': 'Harbin Engineering University',
    'NEFU': 'Northeast Forestry University',
    'HLJU': 'Heilongjiang University',
    'NPU': 'Northwestern Polytechnical University',
    'NWAFU': 'Northwest A&F University',
    'TMU': 'Tianjin Medical University',
    'NUDT': 'National University of Defense Technology',
    'DMU': 'Dalian Maritime University',
    'OUC': 'Ocean University of China',
    'KMUST': 'Kunming University of Science and Technology',
    'USTC': 'University of Science and Technology of China',
    'HFUT': 'Hefei University of Technology',
    'GDUFS': 'Guangdong University of Foreign Studies',
    'Soochow University': 'Soochow University (Suzhou)',
}

SKIP = {'scholars4dev.com', 'China Scholarship Council', 'Various Chinese Universities'}

API = 'https://en.wikipedia.org/w/api.php'


def fetch_extract(title):
    params = urllib.parse.urlencode({
        'action': 'query',
        'format': 'json',
        'prop': 'extracts|info',
        'inprop': 'url',
        'explaintext': 1,
        'redirects': 1,
        'titles': title,
    })
    req = urllib.request.Request(
        API + '?' + params,
        headers={'User-Agent': 'ScholarshipPlatform/1.0 (education info)'},
    )
    last_err = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.load(r)
            break
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code == 429:
                time.sleep(10 * (attempt + 1))
                continue
            raise
    else:
        raise last_err
    pages = data.get('query', {}).get('pages', {})
    for pid, page in pages.items():
        if pid == '-1' or 'missing' in page:
            return None, None
        return page.get('extract', ''), page.get('canonicalurl')
    return None, None


def pick_paragraphs(extract, max_paras=5, max_chars=3200):
    paras = [p.strip() for p in (extract or '').split('\n') if len(p.strip()) > 120]
    chosen, total = [], 0
    for p in paras:
        if len(chosen) >= max_paras:
            break
        if total + len(p) > max_chars and chosen:
            break
        chosen.append(p)
        total += len(p)
    return '\n\n'.join(chosen)


class Command(BaseCommand):
    help = 'Fetch 4-5 paragraph Wikipedia background summaries for all universities'

    def handle(self, *args, **options):
        ok = missing = short = 0
        for u in University.objects.order_by('id'):
            if u.name in SKIP:
                continue
            if u.about and len(u.about) > 500:
                continue  # already have it
            title = WIKI_TITLE_OVERRIDES.get(u.name, u.name)
            try:
                extract, url = fetch_extract(title)
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  ERR {u.name}: {e}'))
                missing += 1
                continue
            if not extract:
                self.stdout.write(self.style.WARNING(f'  no article: {u.name} (tried "{title}")'))
                missing += 1
                continue
            about = pick_paragraphs(extract)
            if len(about) < 400:
                self.stdout.write(self.style.WARNING(f'  too short: {u.name}'))
                short += 1
                continue
            u.about = about
            u.wikipedia_url = url
            u.save(update_fields=['about', 'wikipedia_url'])
            ok += 1
            self.stdout.write(f'  ok {u.name}: {len(about)} chars')
            time.sleep(2)
        self.stdout.write(self.style.SUCCESS(
            f'Done: {ok} fetched, {missing} missing/failed, {short} too short.'
        ))
