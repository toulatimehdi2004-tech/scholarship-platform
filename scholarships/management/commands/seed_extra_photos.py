import json
from pathlib import Path

from django.core.management.base import BaseCommand

from scholarships.models import University, CampusLandmark

ALIASES = {
    'Central China Normal University': 'CCNU',
    'Central University of Finance and Economics': 'CUFE',
    'China University of Geosciences (Beijing)': 'CUGB',
    'East China Normal University': 'ECNU',
    'Guangdong University of Foreign Studies': 'GDUFS',
    'Guangdong University of Technology': 'GDUT',
    'Huazhong Agricultural University': 'HZAU',
    'Nanjing Normal University': 'NNU',
    'Nanjing University of Posts and Telecommunications': 'NJUPT',
    'Nanjing University of Science and Technology': 'NJUST',
    'Shanghai International Studies University': 'SISU',
    'South China Normal University': 'SCNU',
    'South China University of Technology': 'SCUT',
    'University of Electronic Science and Technology of China': 'UESTC',
    'Wuhan University of Technology': 'WHUT',
    'Zhongnan University of Economics and Law': 'ZUEL',
}

SKIP = {'Guangzhou Medical University'}

DUP_ALIASES = {
    'HUST': ['Huazhong University of Science and Technology'],
    'HIT': ['Harbin Institute of Technology'],
}

CATEGORY_ALIASES = {
    'academic_building': 'academic',
    'building': 'academic',
    'library': 'academic',
    'classroom': 'academic',
    'canteen': 'dining',
    'restaurant': 'dining',
    'food': 'dining',
    'market': 'life',
    'student_life': 'life',
    'dorm': 'life',
    'dormitory': 'life',
    'residence': 'life',
    'street': 'life',
    'gate_entrance': 'gate',
    'entrance': 'gate',
    'scenery': 'nature',
    'garden': 'nature',
    'stadium': 'sports',
    'gym': 'sports',
    'gymnasium': 'sports',
    'museum': 'culture',
    'art': 'culture',
}

VALID_CATEGORIES = {c for c, _ in CampusLandmark.CATEGORY_CHOICES}


def normalize_category(raw):
    if not raw:
        return 'life'
    cat = str(raw).strip().lower().replace(' ', '_').replace('-', '_')
    cat = CATEGORY_ALIASES.get(cat, cat)
    return cat if cat in VALID_CATEGORIES else 'life'


class Command(BaseCommand):
    help = 'Seed extra campus photos (gates, canteens, markets, student life) from campus_data/extras*.json'

    def handle(self, *args, **options):
        base = Path(__file__).parent / 'campus_data'
        created = updated = skipped = 0

        for path in sorted(base.glob('extras*.json')):
            data = json.loads(path.read_text(encoding='utf-8'))
            self.stdout.write(f'Processing {path.name}: {len(data)} universities')
            for entry in data:
                raw = (entry.get('name') or entry.get('university') or '').strip()
                if not raw or raw in SKIP:
                    skipped += 1
                    continue
                db_name = ALIASES.get(raw, raw)
                targets = [db_name] + DUP_ALIASES.get(db_name, [])
                unis = list(University.objects.filter(name__in=targets))
                if not unis:
                    self.stdout.write(self.style.WARNING(f'  no university for: {raw}'))
                    skipped += 1
                    continue
                max_order = {u.id: (u.landmarks.order_by('-order').values_list('order', flat=True).first() or 0) for u in unis}
                for photo in entry.get('photos', []):
                    name = str(photo.get('name', '')).strip()
                    url = photo.get('image_url')
                    if not name or not url:
                        continue
                    for u in unis:
                        defaults = {
                            'description': photo.get('description', ''),
                            'image_url': url,
                            'category': normalize_category(photo.get('category')),
                        }
                        qs = CampusLandmark.objects.filter(university=u, name=name)
                        if qs.exists():
                            qs.update(**defaults)
                            updated += 1
                        else:
                            max_order[u.id] += 1
                            CampusLandmark.objects.create(
                                university=u, name=name, order=max_order[u.id], **defaults
                            )
                            created += 1

        total = CampusLandmark.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f'Done: {created} created, {updated} updated, {skipped} skipped entries. '
            f'Total landmarks in DB: {total}'
        ))
