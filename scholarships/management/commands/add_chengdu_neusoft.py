import json
from datetime import datetime
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils import timezone

from scholarships.models import University, Scholarship, CampusLandmark

DEFAULT_DOCS = [
    'Passport copy',
    'Highest diploma / graduation certificate',
    'Academic transcripts',
    'Recent passport-size photo',
    'Completed application form',
    'Language proficiency certificate (HSK / IELTS / TOEFL)',
]

# Honest descriptions for the two nearby-scenery photos (not campus buildings)
SCENERY = {
    'Mount Qingcheng Backdrop': (
        'Mount Qingcheng rises directly behind the Dujiangyan campus, giving the '
        'university its scenic setting at the foot of the UNESCO-listed mountain.',
        'nature',
    ),
    'Dujiangyan Irrigation System': (
        'The ancient Dujiangyan irrigation system, a UNESCO World Heritage site '
        'minutes from campus and a favourite weekend visit for students.',
        'culture',
    ),
}


class Command(BaseCommand):
    help = 'Add Chengdu Neusoft University with scholarships, landmarks and apply link'

    def handle(self, *args, **options):
        base = Path(__file__).parent / 'campus_data'
        data = json.loads((base / 'neusoft.json').read_text(encoding='utf-8'))
        photos = json.loads((base / 'neusoft_photos.json').read_text(encoding='utf-8'))

        description = data['description'].replace('private本科 university', 'private university')

        uni, created = University.objects.update_or_create(
            name='Chengdu Neusoft University',
            defaults={
                'website': data['website'],
                'city': data['city'],
                'country': data['country'],
                'address': data['address'],
                'founding_year': data['founding_year'],
                'motto': data['motto'],
                'description': description,
                'latitude': data['latitude'],
                'longitude': data['longitude'],
                'tagline': data['tagline'],
                'is_verified': True,
            },
        )
        self.stdout.write(f'University {uni.id}: {uni.name} (created={created})')

        deadline = timezone.make_aware(datetime(2027, 6, 30))
        sch_created = 0
        for s in data['scholarships']:
            instructions = (s.get('application_instructions') or '').replace('awardees公示', 'awardees announced')
            full_desc = (
                f"{s['title']} at Chengdu Neusoft University. Award: {s.get('amount') or 'see details'}. "
                f"Duration: {s.get('duration') or '1 academic year'}."
            )
            _, was = Scholarship.objects.update_or_create(
                university=uni, title=s['title'],
                defaults={
                    'description': full_desc,
                    'type': s.get('type') or 'partial',
                    'level': s.get('level') or 'bachelor',
                    'duration': s.get('duration') or '1 academic year',
                    'application_deadline': deadline,
                    'eligibility_criteria': s.get('eligibility_criteria') or '',
                    'required_documents': s.get('required_documents') or list(DEFAULT_DOCS),
                    'application_instructions': instructions,
                    'application_link': data['admission_url'],
                    'language': 'English',
                    'is_active': True,
                },
            )
            if was:
                sch_created += 1
        self.stdout.write(f'Scholarships created: {sch_created}')

        order = 0
        lm_created = 0
        for p in photos:
            _, was = CampusLandmark.objects.update_or_create(
                university=uni, name=p['name'],
                defaults={
                    'description': p.get('description', ''),
                    'image_url': p['image_url'],
                    'category': p.get('category') or 'academic',
                    'order': order,
                },
            )
            order += 1
            if was:
                lm_created += 1
        for key, (desc, cat) in SCENERY.items():
            src = next((x for x in data['landmarks'] if key in x['name']), None)
            if not src:
                continue
            _, was = CampusLandmark.objects.update_or_create(
                university=uni, name=src['name'],
                defaults={'description': desc, 'image_url': src['image_url'], 'category': cat, 'order': order},
            )
            order += 1
            if was:
                lm_created += 1
        self.stdout.write(self.style.SUCCESS(
            f'Done: university id={uni.id}, scholarships={uni.scholarships.count()}, '
            f'landmarks={uni.landmarks.count()} (new landmarks: {lm_created})'
        ))
