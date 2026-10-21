import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholarship_backend.settings')
django.setup()

from students.models import SuccessStory

STORIES = [
    {
        "name": "Amina El Fassi",
        "country": "Morocco",
        "city": "Fez",
        "university_name": "Zhejiang University",
        "degree_level": "master",
        "field_of_study": "MSc Computer Science & AI",
        "scholarship_type": "CSC Chinese Government Scholarship (Type A - Full)",
        "year_awarded": 2025,
        "golden_tip": "Don't just write a generic study plan. Pick 2-3 specific labs or professors at your target Chinese university, mention their recent papers, and explain how your background aligns with their research.",
        "story": "Coming from Fez with a bachelor's degree in software engineering, my biggest hurdle was getting certified translations and writing a competitive research proposal. Using ScholarChina, I applied through the CSC Type A bilateral program in January. In April, I had an online interview with the ZJU department. In June, my admission notice and JW201 visa form arrived at the embassy in Rabat! Life in Hangzhou is beyond modern — tech campus, monthly stipend deposited directly on my ICBC card, and free international student dormitory.",
        "rating": 5,
        "avatar_initials": "AF",
        "is_verified": True,
    },
    {
        "name": "Yassine Benali",
        "country": "Morocco",
        "city": "Casablanca",
        "university_name": "Tsinghua University",
        "degree_level": "phd",
        "field_of_study": "PhD Mechanical Engineering & Robotics",
        "scholarship_type": "CSC High-Level Postgraduate Program (Type B - Full)",
        "year_awarded": 2024,
        "golden_tip": "Get your Foreigner Physical Examination Form completed early at a certified clinic in Morocco, and ensure the official hospital stamp is stamped directly across your photograph.",
        "story": "Tsinghua was my dream university. I reached out to my supervisor via official email with my CV and a 2-page research synopsis. He agreed to provide a Pre-Admission / Acceptance Letter within 3 weeks! With that letter, my CSC application had a massive boost. Now I am in my second year researching robotic control systems at Tsinghua's state key laboratory. Everything from tuition to single room accommodation and 3,500 RMB monthly stipend is covered.",
        "rating": 5,
        "avatar_initials": "YB",
        "is_verified": True,
    },
    {
        "name": "Sara Ouazzani",
        "country": "Morocco",
        "city": "Rabat",
        "university_name": "Fudan University",
        "degree_level": "master",
        "field_of_study": "Master of International Business & E-Commerce",
        "scholarship_type": "Shanghai Government Scholarship (SGS Class A - Full)",
        "year_awarded": 2025,
        "golden_tip": "Look into municipal and provincial scholarships! Everyone fights for CSC, but Shanghai Government Scholarship Class A offers full tuition waiver, free housing, comprehensive medical insurance, and 3,000 RMB/month living allowance.",
        "story": "Shanghai is the global trade capital. Fudan's School of Management taught our entire program in English. I prepared 2 strong recommendation letters from Moroccan university professors and an IELTS score of 7.0. The admissions team was responsive, and Fudan's International Students Office helped me with airport pickup and student visa residence permit within my first week.",
        "rating": 5,
        "avatar_initials": "SO",
        "is_verified": True,
    },
    {
        "name": "Hamza Chraibi",
        "country": "Morocco",
        "city": "Marrakech",
        "university_name": "Harbin Institute of Technology (HIT)",
        "degree_level": "master",
        "field_of_study": "MSc Civil & Structural Engineering",
        "scholarship_type": "CSC Silk Road Full Scholarship",
        "year_awarded": 2024,
        "golden_tip": "Apply for the Silk Road Program if you are from North Africa or Belt & Road countries. Deadlines are often in March-April and competition is fair.",
        "story": "HIT is legendary for engineering. Harbin's winter has the world-famous Ice Festival, and university dorms and laboratories are heated to 24°C year-round. The university provided free Chinese language classes during our first semester alongside English engineering courses. I made lifelong friends from Morocco, Algeria, Pakistan, and Europe.",
        "rating": 5,
        "avatar_initials": "HC",
        "is_verified": True,
    },
    {
        "name": "Nour El Houda",
        "country": "Morocco",
        "city": "Tangier",
        "university_name": "Beijing Language and Culture University (BLCU)",
        "degree_level": "language",
        "field_of_study": "1-Year Intensive Chinese Language & Culture",
        "scholarship_type": "International Chinese Language Teachers Scholarship (CIS)",
        "year_awarded": 2025,
        "golden_tip": "Even if you have no Chinese foundation, 1-year language scholarships cover tuition, housing, and 2,500 RMB/month. It's the ultimate gateway before starting a Bachelor or Master degree.",
        "story": "I wanted to learn Mandarin for an international logistics career between Tangier Med and Chinese ports. BLCU is known as the 'Little United Nations'. In just 10 months, I went from HSK 1 to passing HSK 5! The international community in Beijing is vibrant, welcoming, and exceptionally safe.",
        "rating": 5,
        "avatar_initials": "NH",
        "is_verified": True,
    },
    {
        "name": "Khadija Tazi",
        "country": "Morocco",
        "city": "Agadir",
        "university_name": "Central South University (CSU)",
        "degree_level": "bachelor",
        "field_of_study": "MBBS (Bachelor of Medicine & Surgery in English)",
        "scholarship_type": "Hunan Provincial Government & CSU Presidential Scholarship",
        "year_awarded": 2025,
        "golden_tip": "Ensure your high school baccalaureate transcript and police clearance (fiche anthropométrique) are officially translated and stamped.",
        "story": "Studying medicine in China in English is world-class with affiliated top-tier hospitals. The tuition discount and monthly living subsidy made studying abroad much more affordable than private medical schools in Europe. The campus environment is high-tech with clinical simulation labs.",
        "rating": 5,
        "avatar_initials": "KT",
        "is_verified": True,
    },
    {
        "name": "Omar Zeroual",
        "country": "Morocco",
        "city": "Oujda",
        "university_name": "Nanjing University",
        "degree_level": "master",
        "field_of_study": "MSc Artificial Intelligence & Data Science",
        "scholarship_type": "Jiangsu Provincial Jasmine Scholarship (Full)",
        "year_awarded": 2025,
        "golden_tip": "Reach out to Moroccan alumni on LinkedIn or ScholarChina who are already at the university. Their advice on dorm life, professors, and bank cards saves you weeks.",
        "story": "Nanjing is a historic and green city with lower living costs than Shanghai. The Jasmine Scholarship covered all tuition fees and provided a generous accommodation allowance. The laboratories at Nanjing University have high-performance GPU clusters, making research in machine learning fast and productive.",
        "rating": 5,
        "avatar_initials": "OZ",
        "is_verified": True,
    }
]

created_count = 0
for s in STORIES:
    obj, created = SuccessStory.objects.get_or_create(
        name=s['name'],
        university_name=s['university_name'],
        defaults=s
    )
    if created:
        created_count += 1

print(f"Seeded {created_count} new success stories. Total in DB: {SuccessStory.objects.count()}")
