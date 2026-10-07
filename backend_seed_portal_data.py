import os
import django
import random
from decimal import Decimal
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholarship_backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from students.models import Student
from scholarships.models import University, Scholarship
from ai_assistant.models import ApplicationTracker
from providers.models import Provider, Service, ServiceCategory, ServiceOrder
from documents.models import Document

print("--- Seeding Portal Data for University & Service Provider Portals ---")

# 1. Ensure Service Categories
trans_cat, _ = ServiceCategory.objects.get_or_create(
    name="Certified Translation",
    defaults={
        "description": "Sworn translation of official academic diplomas, transcripts and certificates into Chinese.",
        "default_commission": Decimal("10.00"),
        "is_active": True,
    }
)
notary_cat, _ = ServiceCategory.objects.get_or_create(
    name="Notarization & Apostille",
    defaults={
        "description": "Official legal notarization and Embassy authentication for study visas.",
        "default_commission": Decimal("12.00"),
        "is_active": True,
    }
)

# 2. Ensure Provider Accounts
prov_user, _ = User.objects.get_or_create(
    username="moroccan_translator",
    defaults={
        "email": "translator@moroccanscholar.com",
        "first_name": "Karim",
        "last_name": "Bennani",
    }
)
if not prov_user.password:
    prov_user.set_password("provider123456")
    prov_user.save()

provider, _ = Provider.objects.get_or_create(
    user=prov_user,
    defaults={
        "business_name": "Moroccan Scholar Sworn Translation Bureau",
        "business_description": "Certified Arabic / French / English to Chinese sworn translation service for university admissions and CSC scholarship dossiers.",
        "phone": "+212 661 234567",
        "city": "Rabat",
        "country": "Morocco",
        "is_verified": True,
        "average_rating": Decimal("4.9"),
        "total_reviews": 128,
        "is_active": True,
    }
)
provider.categories.add(trans_cat, notary_cat)

# Services
s1, _ = Service.objects.get_or_create(
    provider=provider,
    name="Academic Transcript Sworn Translation (Arabic/FR to Chinese)",
    defaults={
        "category": trans_cat,
        "description": "Certified sworn translation of university semester grades and academic marks into standard Chinese with official red seal stamp.",
        "price": Decimal("35.00"),
        "currency": "USD",
        "delivery_time": "24-48 hours",
        "is_online": True,
        "is_active": True,
    }
)

s2, _ = Service.objects.get_or_create(
    provider=provider,
    name="Degree & Diploma Embassy Legalization Prep",
    defaults={
        "category": notary_cat,
        "description": "Pre-check, sworn notarization and authentication formatting for Chinese Embassy visa submission.",
        "price": Decimal("65.00"),
        "currency": "USD",
        "delivery_time": "3-4 days",
        "is_online": True,
        "is_active": True,
    }
)

s3, _ = Service.objects.get_or_create(
    provider=provider,
    name="Motivation Letter & Recommendation Translation (Chinese)",
    defaults={
        "category": trans_cat,
        "description": "Professional academic translation of recommendation letters and personal statements into academic Mandarin.",
        "price": Decimal("25.00"),
        "currency": "USD",
        "delivery_time": "24 hours",
        "is_online": True,
        "is_active": True,
    }
)

# 3. Create Sample International Students
students_data = [
    {
        "username": "yassine_benali",
        "first_name": "Yassine",
        "last_name": "Benali",
        "email": "yassine.benali@gmail.com",
        "country": "Morocco",
        "city": "Casablanca",
        "gpa": Decimal("3.88"),
        "education_level": "Bachelor Graduate",
        "field_of_study": "Computer Science & AI",
    },
    {
        "username": "amina_chraibi",
        "first_name": "Amina",
        "last_name": "Chraibi",
        "email": "amina.chraibi@outlook.com",
        "country": "Morocco",
        "city": "Rabat",
        "gpa": Decimal("3.94"),
        "education_level": "Master Student",
        "field_of_study": "Data Science & Bioinformatics",
    },
    {
        "username": "lucas_moreau",
        "first_name": "Lucas",
        "last_name": "Moreau",
        "email": "lucas.moreau@sorbonne.fr",
        "country": "France",
        "city": "Paris",
        "gpa": Decimal("3.76"),
        "education_level": "Bachelor Graduate",
        "field_of_study": "International Economics & Trade",
    },
    {
        "username": "tariq_husseini",
        "first_name": "Tariq",
        "last_name": "Al-Husseini",
        "email": "tariq.husseini@cairo.edu.eg",
        "country": "Egypt",
        "city": "Cairo",
        "gpa": Decimal("3.82"),
        "education_level": "Master Graduate",
        "field_of_study": "Civil & Structural Engineering",
    },
    {
        "username": "fatima_idrissi",
        "first_name": "Fatima Zahra",
        "last_name": "Idrissi",
        "email": "fz.idrissi@ump.ac.ma",
        "country": "Morocco",
        "city": "Fes",
        "gpa": Decimal("3.91"),
        "education_level": "Master Graduate",
        "field_of_study": "Biomedical Sciences & Pharmacology",
    },
    {
        "username": "ali_raza",
        "first_name": "Ali",
        "last_name": "Raza",
        "email": "ali.raza@nust.edu.pk",
        "country": "Pakistan",
        "city": "Islamabad",
        "gpa": Decimal("3.80"),
        "education_level": "Bachelor Graduate",
        "field_of_study": "Electrical & Electronic Engineering",
    },
    {
        "username": "salma_amrani",
        "first_name": "Salma",
        "last_name": "Amrani",
        "email": "salma.amrani@gmail.com",
        "country": "Morocco",
        "city": "Marrakech",
        "gpa": Decimal("3.72"),
        "education_level": "High School Graduate",
        "field_of_study": "Clinical Medicine (MBBS)",
    },
    {
        "username": "omar_mansouri",
        "first_name": "Omar",
        "last_name": "Mansouri",
        "email": "omar.mansouri@yahoo.fr",
        "country": "Algeria",
        "city": "Algiers",
        "gpa": Decimal("3.68"),
        "education_level": "Master Graduate",
        "field_of_study": "Renewable Energy & Mechanical Eng",
    },
]

created_students = []
for sdata in students_data:
    u, _ = User.objects.get_or_create(
        username=sdata["username"],
        defaults={
            "email": sdata["email"],
            "first_name": sdata["first_name"],
            "last_name": sdata["last_name"],
        }
    )
    if not u.password:
        u.set_password("student123456")
        u.save()
    
    st, _ = Student.objects.get_or_create(
        user=u,
        defaults={
            "country": sdata["country"],
            "city": sdata["city"],
            "gpa": sdata["gpa"],
            "education_level": sdata["education_level"],
            "field_of_study": sdata["field_of_study"],
            "is_premium": True,
            "is_email_verified": True,
        }
    )
    created_students.append((u, st, sdata))

print(f"Created/Verified {len(created_students)} international students.")

# 4. Seed Applications for Top Universities
top_unis = University.objects.all()[:15]
scholarships = list(Scholarship.objects.filter(is_active=True)[:40])

statuses = [
    'submitted',
    'interview_prep',
    'accepted',
    'documents_gathering',
    'researching',
    'rejected',
]

app_count = 0
for u, st, sdata in created_students:
    # Pick 2-3 scholarships to apply to
    chosen_schols = random.sample(scholarships, min(3, len(scholarships)))
    for sch in chosen_schols:
        step = random.choice(statuses)
        app, created = ApplicationTracker.objects.get_or_create(
            student=u,
            scholarship=sch,
            defaults={
                "current_step": step,
                "notes": f"Applied with GPA {st.gpa} from {st.country}. Degree target: {st.education_level}.",
                "checklist": {
                    "passport": True,
                    "transcript": True,
                    "motivation_letter": True,
                    "recommendations": step in ['submitted', 'interview_prep', 'accepted'],
                    "medical_exam": step in ['interview_prep', 'accepted'],
                },
                "ai_recommendations": [
                    "High academic compatibility score",
                    "Application dossier complete and verified",
                ]
            }
        )
        if created:
            app_count += 1

print(f"Seeded {app_count} student applications into ApplicationTracker.")

# 5. Seed Service Orders for Provider Desk
order_data = [
    {
        "student": created_students[0][1], # Yassine
        "service": s1,
        "status": "in_progress",
        "notes": "Please certify translation with seal stamp for CSC Tsinghua application.",
        "file_name": "Yassine_Benali_Academic_Transcript_EN.pdf",
    },
    {
        "student": created_students[1][1], # Amina
        "service": s2,
        "status": "pending",
        "notes": "Embassy authentication needed before Nov 15 deadline.",
        "file_name": "Amina_Chraibi_Bachelor_Degree.pdf",
    },
    {
        "student": created_students[2][1], # Lucas
        "service": s1,
        "status": "completed",
        "notes": "Translated from French to Mandarin. Delivered to student.",
        "file_name": "Lucas_Moreau_Diplome_Sorbonne.pdf",
    },
    {
        "student": created_students[3][1], # Tariq
        "service": s3,
        "status": "in_progress",
        "notes": "Motivation Letter translation into Chinese for Silk Road Scholarship.",
        "file_name": "Tariq_Husseini_SOP_Letter.pdf",
    },
    {
        "student": created_students[4][1], # Fatima Zahra
        "service": s2,
        "status": "pending",
        "notes": "Pharmacology Master degree notarization check.",
        "file_name": "Fatima_Idrissi_Pharmacy_Certificate.pdf",
    },
]

order_count = 0
for od in order_data:
    st = od["student"]
    srv = od["service"]
    order = ServiceOrder.objects.create(
        service=srv,
        student=st,
        provider=provider,
        quantity=1,
        total_amount=srv.price,
        commission_amount=srv.get_commission_amount(),
        provider_payout=srv.price - srv.get_commission_amount(),
        currency=srv.currency,
        status=od["status"],
        notes=od["notes"],
        requested_date=date.today() - timedelta(days=random.randint(1, 10)),
    )
    # Link a sample document if available or create a document record
    Document.objects.get_or_create(
        student=st,
        order=order,
        defaults={
            "title": f"Document for Order #{order.id} - {od['file_name']}",
            "file_name": od["file_name"],
            "file_size": 154200,
            "document_type": "transcript" if "Transcript" in od["file_name"] else "diploma",
            "file": "student_documents/Simple_Monetization_Plans_Developer_Spec.pdf", # point to existing pdf
            "status": "completed" if od["status"] == "completed" else "processing",
            "is_verified": od["status"] == "completed",
        }
    )
    order_count += 1

print(f"Seeded {order_count} service orders for {provider.business_name}.")
print("--- Seeding Completed Successfully! ---")
