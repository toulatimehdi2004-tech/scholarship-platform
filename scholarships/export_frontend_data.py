import os
import sys
import json
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholarship_backend.settings')
django.setup()

from scholarships.models import Scholarship, University

schs = []
details = {}

for s in Scholarship.objects.select_related('university').all():
    u = s.university
    item = {
        'id': s.id,
        'title': s.title,
        'university': u.id,
        'university_name': u.name,
        'university_city': u.city,
        'university_country': u.country or 'China',
        'type': s.type,
        'level': s.level,
        'amount': str(s.amount) if s.amount else '36000.00',
        'currency': s.currency or 'CNY',
        'duration': s.duration or '2-4 Years',
        'application_deadline': s.application_deadline.isoformat(),
        'application_link': s.application_link,
        'total_seats': s.total_seats,
        'seats_filled': s.seats_filled,
        'is_active': s.is_active,
        'is_featured': s.is_featured,
        'created_at': s.created_at.isoformat(),
    }
    schs.append(item)
    
    det = dict(item)
    det.update({
        'description': s.description,
        'tuition_info': s.tuition_info,
        'seats_available': max(0, (s.total_seats or 25) - (s.seats_filled or 0)),
        'start_date': str(s.start_date or '2027-09-01'),
        'end_date': str(s.end_date or '2028-07-15'),
        'eligibility_criteria': s.eligibility_criteria,
        'required_education_level': s.required_education_level or 'High School / Bachelor',
        'minimum_gpa': float(s.minimum_gpa) if s.minimum_gpa else 3.0,
        'required_fields_of_study': str(s.required_fields_of_study or 'All Disciplines'),
        'application_fee': str(s.application_fee or '0.00'),
        'required_documents': s.required_documents if isinstance(s.required_documents, list) else [],
        'application_instructions': s.application_instructions,
        'contact_email': s.contact_email or u.admissions_email or '',
        'contact_phone': s.contact_phone or '',
        'language': s.language or 'English / Chinese',
        'view_count': s.view_count,
        'days_until_deadline': s.days_until_deadline(),
        'university': {
            'id': u.id,
            'name': u.name,
            'logo': u.logo.url if u.logo else '',
            'country': u.country or 'China',
            'city': u.city or '',
            'is_verified': u.is_verified,
        }
    })
    details[s.id] = det

os.makedirs('frontend/src/data', exist_ok=True)
with open('frontend/src/data/scholarshipsData.ts', 'w', encoding='utf-8') as f:
    f.write('import type { Scholarship, ScholarshipDetail } from "@/lib/api";\n\n')
    f.write('export const REAL_SCHOLARSHIPS: Scholarship[] = ' + json.dumps(schs, indent=2) + ';\n\n')
    f.write('export const REAL_SCHOLARSHIP_DETAILS: Record<number, ScholarshipDetail> = ' + json.dumps(details, indent=2) + ';\n')

print(f"Successfully exported {len(schs)} real scholarships and {len(details)} details to frontend/src/data/scholarshipsData.ts")
