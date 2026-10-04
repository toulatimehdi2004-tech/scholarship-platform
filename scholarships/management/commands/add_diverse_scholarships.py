from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from scholarships.models import University, Scholarship


class Command(BaseCommand):
    help = 'Add diverse scholarships including bachelor, language programs, and various types'

    def handle(self, *args, **options):
        created = 0

        # ── New Universities ──────────────────────────────────────
        unis_data = [
            ('Beijing Language and Culture University', 'Beijing', 'Specializes in Chinese language and culture education for international students.'),
            ('Dalian University of Technology', 'Dalian', 'One of the top engineering universities in China with strong international programs.'),
            ('Southwest Jiaotong University', 'Chengdu', 'Known for transportation engineering, offers diverse programs for international students.'),
            ('Harbin Institute of Technology', 'Harbin', 'Top-tier engineering university with strong research programs.'),
            ('Nanjing University', 'Nanjing', 'One of the oldest and most prestigious universities in China.'),
            ('Xiamen University', 'Xiamen', 'Beautiful coastal campus with strong liberal arts and science programs.'),
            ('Lanzhou University', 'Lanzhou', 'Key university in western China with competitive scholarships.'),
            ('Shandong University', 'Jinan', 'Comprehensive university with a wide range of programs.'),
            ('Jilin University', 'Changchun', 'One of the largest universities in China with diverse programs.'),
            ('Central South University', 'Changsha', 'Strong in engineering, medicine, and mining.'),
            ('Tongji University', 'Shanghai', 'Top university for architecture, civil engineering, and urban planning.'),
            ('Beijing International Studies University', 'Beijing', 'Specializes in languages, tourism, and international business.'),
        ]

        universities = {}
        for name, city, desc in unis_data:
            uni, _ = University.objects.get_or_create(
                name=name,
                defaults={
                    'country': 'China',
                    'city': city,
                    'description': desc,
                    'is_verified': True,
                }
            )
            universities[name] = uni

        # ── Bachelor Degree Scholarships ──────────────────────────
        bachelor_scholarships = [
            {
                'title': 'BLCU Chinese Language Bachelor Scholarship',
                'university': 'Beijing Language and Culture University',
                'description': 'Full scholarship for international students pursuing a Bachelor degree in Chinese Language and Literature. Includes tuition, accommodation, and monthly stipend.',
                'type': 'full',
                'level': 'bachelor',
                'amount': 40000,
                'duration': '4 years',
                'deadline_months': 4,
                'eligibility': 'High school diploma, HSK 4 or above, age 18-25',
                'documents': ['High school diploma', 'HSK certificate', 'Passport copy', 'Medical exam', 'Application form'],
                'instructions': 'Apply online through BLCU international student portal. Submit all documents before deadline.',
                'language': 'Chinese',
                'gpa': 3.0,
                'featured': True,
            },
            {
                'title': 'DUT Undergraduate Excellence Scholarship',
                'university': 'Dalian University of Technology',
                'description': 'Merit-based scholarship for bachelor degree students in engineering and science programs. Covers tuition and provides living allowance.',
                'type': 'full',
                'level': 'bachelor',
                'amount': 35000,
                'duration': '4 years',
                'deadline_months': 3,
                'eligibility': 'High school diploma with good grades, IELTS 6.0 or equivalent',
                'documents': ['High school transcript', 'IELTS certificate', 'Recommendation letters', 'Personal statement'],
                'instructions': 'Submit application through DUT international admissions portal.',
                'language': 'English',
                'gpa': 3.2,
                'featured': True,
            },
            {
                'title': 'SWJTU Belt and Road Bachelor Scholarship',
                'university': 'Southwest Jiaotong University',
                'description': 'Scholarship for students from Belt and Road Initiative countries pursuing undergraduate studies in transportation, engineering, or business.',
                'type': 'full',
                'level': 'bachelor',
                'amount': 30000,
                'duration': '4 years',
                'deadline_months': 5,
                'eligibility': 'High school diploma, age 18-25, from BRI country',
                'documents': ['High school diploma', 'Passport copy', 'Medical certificate', 'Non-criminal record'],
                'instructions': 'Apply through SWJTU international student system.',
                'language': 'English',
                'gpa': 2.8,
                'featured': False,
            },
            {
                'title': 'HIT Future Engineers Bachelor Award',
                'university': 'Harbin Institute of Technology',
                'description': 'Prestigious scholarship for outstanding international students in engineering and technology bachelor programs.',
                'type': 'full',
                'level': 'bachelor',
                'amount': 45000,
                'duration': '4 years',
                'deadline_months': 3,
                'eligibility': 'Excellent high school results, mathematics and physics background',
                'documents': ['High school transcript', 'Math/Physics certificates', 'Recommendation letter', 'Study plan'],
                'instructions': 'Apply online with all required documents. Interview may be required.',
                'language': 'English',
                'gpa': 3.5,
                'featured': True,
            },
            {
                'title': 'Nanjing University Global Scholar Program',
                'university': 'Nanjing University',
                'description': 'Comprehensive scholarship for international bachelor students in humanities, social sciences, or natural sciences.',
                'type': 'full',
                'level': 'bachelor',
                'amount': 42000,
                'duration': '4 years',
                'deadline_months': 4,
                'eligibility': 'High school diploma, strong academic record, good health',
                'documents': ['High school diploma', 'Academic transcripts', 'Personal statement', 'Recommendation letter'],
                'instructions': 'Submit application through NJU international admissions.',
                'language': 'English',
                'gpa': 3.3,
                'featured': True,
            },
            {
                'title': 'Xiamen University Coastal Scholar Award',
                'university': 'Xiamen University',
                'description': 'Scholarship for international undergraduate students. Covers tuition, accommodation, and provides monthly living stipend.',
                'type': 'full',
                'level': 'bachelor',
                'amount': 38000,
                'duration': '4 years',
                'deadline_months': 5,
                'eligibility': 'High school diploma, good health, age under 25',
                'documents': ['High school diploma', 'Passport copy', 'Physical exam record', 'Financial guarantee'],
                'instructions': 'Apply online through XMU international student portal.',
                'language': 'English',
                'gpa': 3.0,
                'featured': False,
            },
            {
                'title': 'SDU Outstanding Student Bachelor Scholarship',
                'university': 'Shandong University',
                'description': 'Merit-based scholarship for high-achieving international students pursuing bachelor degrees.',
                'type': 'partial',
                'level': 'bachelor',
                'amount': 20000,
                'duration': '4 years',
                'deadline_months': 4,
                'eligibility': 'High school diploma, minimum GPA 3.0',
                'documents': ['High school transcript', 'Application form', 'Passport copy'],
                'instructions': 'Apply through SDU online portal.',
                'language': 'English',
                'gpa': 3.0,
                'featured': False,
            },
            {
                'title': 'JLU International Undergraduate Program',
                'university': 'Jilin University',
                'description': 'Scholarship for international students in various bachelor programs including engineering, medicine, and business.',
                'type': 'full',
                'level': 'bachelor',
                'amount': 32000,
                'duration': '4 years',
                'deadline_months': 6,
                'eligibility': 'High school diploma, good health',
                'documents': ['High school diploma', 'Medical exam', 'Passport', 'Application form'],
                'instructions': 'Submit application to JLU International Office.',
                'language': 'English',
                'gpa': 2.8,
                'featured': False,
            },
            {
                'title': 'CSU Engineering Excellence Bachelor Award',
                'university': 'Central South University',
                'description': 'Full scholarship for international students in engineering and mining-related bachelor programs.',
                'type': 'full',
                'level': 'bachelor',
                'amount': 33000,
                'duration': '4 years',
                'deadline_months': 5,
                'eligibility': 'High school diploma with science background',
                'documents': ['High school transcript', 'Recommendation letter', 'Study plan'],
                'instructions': 'Apply through CSU international admissions portal.',
                'language': 'English',
                'gpa': 3.0,
                'featured': False,
            },
            {
                'title': 'Tongji University Architecture Bachelor Scholarship',
                'university': 'Tongji University',
                'description': 'Specialized scholarship for international students pursuing architecture and urban planning bachelor degrees.',
                'type': 'full',
                'level': 'bachelor',
                'amount': 40000,
                'duration': '5 years',
                'deadline_months': 3,
                'eligibility': 'High school diploma, portfolio required, mathematics background',
                'documents': ['High school diploma', 'Art portfolio', 'Math certificate', 'Personal statement'],
                'instructions': 'Submit portfolio and application through Tongji international portal.',
                'language': 'English',
                'gpa': 3.2,
                'featured': True,
            },
        ]

        # ── Language Year / Chinese Language Programs ──────────────
        language_scholarships = [
            {
                'title': 'BLCU Chinese Language Program Scholarship',
                'university': 'Beijing Language and Culture University',
                'description': 'One-year intensive Chinese language program. No degree required. Perfect for students who want to learn Chinese before pursuing higher education in China.',
                'type': 'full',
                'level': 'other',
                'amount': 15000,
                'duration': '1 year',
                'deadline_months': 3,
                'eligibility': 'High school diploma, age 18-30, good health',
                'documents': ['High school diploma', 'Passport copy', 'Medical exam', 'Application form'],
                'instructions': 'Apply through BLCU language program portal. No HSK required for beginners.',
                'language': 'Chinese',
                'gpa': 0,
                'featured': True,
            },
            {
                'title': 'Beijing International Studies University Language Year',
                'university': 'Beijing International Studies University',
                'description': 'One-year Chinese language and culture immersion program. Learn Mandarin while experiencing Chinese culture. No prior Chinese knowledge needed.',
                'type': 'full',
                'level': 'other',
                'amount': 12000,
                'duration': '1 year',
                'deadline_months': 4,
                'eligibility': 'High school diploma, age 18-35',
                'documents': ['High school diploma', 'Passport', 'Application form'],
                'instructions': 'Apply online. Beginner to advanced levels accepted.',
                'language': 'Chinese',
                'gpa': 0,
                'featured': True,
            },
            {
                'title': 'Nanjing University Chinese Language Certificate Program',
                'university': 'Nanjing University',
                'description': 'Intensive Chinese language program with optional HSK preparation. Includes cultural activities and field trips.',
                'type': 'partial',
                'level': 'other',
                'amount': 8000,
                'duration': '1 year',
                'deadline_months': 5,
                'eligibility': 'High school diploma, age 18-30',
                'documents': ['High school diploma', 'Passport copy'],
                'instructions': 'Apply through NJU international office.',
                'language': 'Chinese',
                'gpa': 0,
                'featured': False,
            },
            {
                'title': 'Xiamen University Mandarin Program',
                'university': 'Xiamen University',
                'description': 'Study Mandarin Chinese in beautiful Xiamen. Program includes language courses, cultural activities, and optional HSK exam preparation.',
                'type': 'partial',
                'level': 'other',
                'amount': 6000,
                'duration': '1 year',
                'deadline_months': 6,
                'eligibility': 'High school diploma, age 16-35',
                'documents': ['High school diploma', 'Passport copy', 'Application form'],
                'instructions': 'Apply online through XMU language program portal.',
                'language': 'Chinese',
                'gpa': 0,
                'featured': False,
            },
            {
                'title': 'BISU Intensive Chinese Program with Homestay',
                'university': 'Beijing International Studies University',
                'description': 'Premium language program including homestay with Chinese family for immersive experience. Best for serious language learners.',
                'type': 'full',
                'level': 'other',
                'amount': 18000,
                'duration': '1 year',
                'deadline_months': 3,
                'eligibility': 'High school diploma, age 18-30, motivation letter required',
                'documents': ['High school diploma', 'Passport', 'Motivation letter', 'Medical exam'],
                'instructions': 'Limited spots available. Apply early.',
                'language': 'Chinese',
                'gpa': 0,
                'featured': True,
            },
            {
                'title': 'DUT Pre-Degree Chinese Language Program',
                'university': 'Dalian University of Technology',
                'description': 'One-year Chinese language preparation for students planning to pursue degree programs at DUT or other Chinese universities.',
                'type': 'full',
                'level': 'other',
                'amount': 10000,
                'duration': '1 year',
                'deadline_months': 4,
                'eligibility': 'High school diploma, age 18-28',
                'documents': ['High school diploma', 'Passport copy'],
                'instructions': 'Apply through DUT international portal.',
                'language': 'Chinese',
                'gpa': 0,
                'featured': False,
            },
            {
                'title': 'HIT Harbin Winter Chinese Program',
                'university': 'Harbin Institute of Technology',
                'description': 'Unique Chinese language program in Harbin. Combine language learning with experiencing the famous Harbin Ice Festival and winter culture.',
                'type': 'partial',
                'level': 'other',
                'amount': 5000,
                'duration': '6 months',
                'deadline_months': 2,
                'eligibility': 'High school diploma, age 18-30',
                'documents': ['High school diploma', 'Passport copy', 'Application form'],
                'instructions': 'Apply through HIT international office.',
                'language': 'Chinese',
                'gpa': 0,
                'featured': False,
            },
        ]

        # ── Partial Scholarships ──────────────────────────────────
        partial_scholarships = [
            {
                'title': 'Tsinghua University Partial Tuition Waiver',
                'university': 'Tsinghua University',
                'description': 'Partial tuition waiver for international master and bachelor students. Covers 50% of tuition fees.',
                'type': 'partial',
                'level': 'master',
                'amount': 15000,
                'duration': '2 years',
                'deadline_months': 3,
                'eligibility': 'Bachelor degree (for master), good academic record',
                'documents': ['Degree certificate', 'Transcripts', 'Recommendation letters', 'Research proposal'],
                'instructions': 'Apply through Tsinghua international admissions.',
                'language': 'English',
                'gpa': 3.3,
                'featured': True,
            },
            {
                'title': 'Shanghai Jiao Tong Living Stipend Award',
                'university': 'Shanghai Jiao Tong University',
                'description': 'Monthly living stipend for international students in Shanghai. Helps cover accommodation and daily expenses.',
                'type': 'living',
                'level': 'master',
                'amount': 8000,
                'duration': '2 years',
                'deadline_months': 4,
                'eligibility': 'Admitted to SJTU graduate program',
                'documents': ['Admission letter', 'Passport copy', 'Bank statement'],
                'instructions': 'Apply after receiving admission offer.',
                'language': 'English',
                'gpa': 3.0,
                'featured': False,
            },
            {
                'title': 'GDUT Research Assistant Grant',
                'university': 'Guangdong University of Technology',
                'description': 'Research assistant position with monthly stipend for master and PhD students in engineering fields.',
                'type': 'research',
                'level': 'master',
                'amount': 10000,
                'duration': '2 years',
                'deadline_months': 5,
                'eligibility': 'Engineering background, research experience preferred',
                'documents': ['CV', 'Research proposal', 'Recommendation letters'],
                'instructions': 'Contact department directly or apply through GDUT portal.',
                'language': 'English',
                'gpa': 3.0,
                'featured': False,
            },
            {
                'title': 'ZUEL International Business Partial Scholarship',
                'university': 'Zhongnan University of Economics and Law',
                'description': 'Partial scholarship for international students in business, economics, and law programs.',
                'type': 'partial',
                'level': 'master',
                'amount': 12000,
                'duration': '2 years',
                'deadline_months': 4,
                'eligibility': 'Bachelor degree in related field, good English',
                'documents': ['Degree certificate', 'Transcripts', 'English proficiency proof'],
                'instructions': 'Apply through ZUEL international portal.',
                'language': 'English',
                'gpa': 3.0,
                'featured': False,
            },
            {
                'title': 'BLCU Language Teaching Assistant Program',
                'university': 'Beijing Language and Culture University',
                'description': 'Work as a language teaching assistant while studying Chinese. Includes partial tuition waiver and monthly stipend.',
                'type': 'partial',
                'level': 'other',
                'amount': 6000,
                'duration': '1 year',
                'deadline_months': 3,
                'eligibility': 'Native English speaker, HSK 3+ preferred',
                'documents': ['Passport copy', 'Resume', 'Teaching certificate if available'],
                'instructions': 'Apply through BLCU international office.',
                'language': 'Chinese',
                'gpa': 0,
                'featured': False,
            },
        ]

        all_scholarships = bachelor_scholarships + language_scholarships + partial_scholarships

        for s in all_scholarships:
            uni = universities.get(s['university'])
            if not uni:
                continue

            existing = Scholarship.objects.filter(
                title=s['title'],
                university=uni
            ).first()

            if existing:
                continue

            now = timezone.now()
            deadline = now + timedelta(days=30 * s['deadline_months'])

            Scholarship.objects.create(
                title=s['title'],
                university=uni,
                description=s['description'],
                type=s['type'],
                level=s['level'],
                amount=s['amount'],
                currency='USD',
                duration=s['duration'],
                application_deadline=deadline,
                eligibility_criteria=s['eligibility'],
                required_education_level=s['level'].title() if s['level'] != 'other' else 'Any',
                minimum_gpa=s['gpa'] if s['gpa'] > 0 else None,
                required_documents=s['documents'],
                application_instructions=s['instructions'],
                language=s['language'],
                is_active=True,
                is_featured=s.get('featured', False),
            )
            created += 1

        total = Scholarship.objects.count()
        bachelor = Scholarship.objects.filter(level='bachelor').count()
        language = Scholarship.objects.filter(level='other').count()
        master = Scholarship.objects.filter(level='master').count()
        phd = Scholarship.objects.filter(level='phd').count()
        partial = Scholarship.objects.filter(type='partial').count()
        living = Scholarship.objects.filter(type='living').count()
        research = Scholarship.objects.filter(type='research').count()

        self.stdout.write(self.style.SUCCESS(
            f'\nAdded {created} new scholarships!\n'
            f'Total: {total} scholarships\n'
            f'  Bachelor: {bachelor}\n'
            f'  Master: {master}\n'
            f'  PhD: {phd}\n'
            f'  Language/Other: {language}\n'
            f'  Types - Full: {Scholarship.objects.filter(type="full").count()}, '
            f'Partial: {partial}, Living: {living}, Research: {research}'
        ))
