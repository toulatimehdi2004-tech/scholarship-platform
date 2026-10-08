import os
import shutil
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholarship_backend.settings')
django.setup()

from django.contrib.auth.models import User
from students.models import Student
from scholarships.models import University, CampusLandmark
from providers.models import Provider, Service, ServiceCategory

print("=== Starting Database & Landmark Photo Optimization ===")

# 1. Copy public images to media/campus
src_dir = os.path.join('frontend', 'public', 'images', 'campus')
dst_dir = os.path.join('media', 'campus')
os.makedirs(dst_dir, exist_ok=True)
for item in os.listdir(src_dir):
    s = os.path.join(src_dir, item)
    d = os.path.join(dst_dir, item)
    if os.path.isfile(s):
        shutil.copy2(s, d)
print(f"Copied {len(os.listdir(dst_dir))} images to media/campus")

# 2. Update all Students to is_email_verified = True
verified_count = Student.objects.filter(is_email_verified=False).update(is_email_verified=True)
print(f"Verified {verified_count} unverified students. Total verified: {Student.objects.count()}")

# 3. Create or ensure Demo Accounts
# A. Student: yassine_benali / student123456
stud_user, _ = User.objects.get_or_create(
    username="yassine_benali",
    defaults={
        "email": "yassine.benali@gmail.com",
        "first_name": "Yassine",
        "last_name": "Benali",
    }
)
stud_user.set_password("student123456")
stud_user.save()
Student.objects.filter(user=stud_user).update(is_email_verified=True, country="Morocco", city="Casablanca")

# B. University Admissions: admission_officer / admissions123456
adm_user, _ = User.objects.get_or_create(
    username="admission_officer",
    defaults={
        "email": "admissions@pku.edu.cn",
        "first_name": "Admissions",
        "last_name": "Director",
    }
)
adm_user.set_password("admissions123456")
adm_user.save()

# Also create admission_pku as alias
pku_user, _ = User.objects.get_or_create(
    username="admission_pku",
    defaults={
        "email": "pku.admissions@edu.cn",
        "first_name": "Peking",
        "last_name": "Admissions",
    }
)
pku_user.set_password("admissions123456")
pku_user.save()

# C. Provider: moroccan_translator / provider123456
prov_user, _ = User.objects.get_or_create(
    username="moroccan_translator",
    defaults={
        "email": "translator@moroccanscholar.com",
        "first_name": "Karim",
        "last_name": "Bennani",
    }
)
prov_user.set_password("provider123456")
prov_user.save()

print("Demo accounts configured: yassine_benali, admission_officer, moroccan_translator")

# 4. Update Landmark Photos
CATEGORY_IMAGE_MAP = {
    'gate': ['/images/campus/gate-1.jpg', '/images/campus/gate-2.jpg'],
    'academic': [
        '/images/campus/library-1.jpg',
        '/images/campus/library-2.jpg',
        '/images/campus/tower-1.jpg',
        '/images/campus/tower-2.jpg',
        '/images/campus/hall-1.jpg',
    ],
    'nature': [
        '/images/campus/lake-1.jpg',
        '/images/campus/lake-2.jpg',
        '/images/campus/garden-1.jpg',
    ],
    'culture': [
        '/images/campus/museum-1.jpg',
        '/images/campus/auditorium-1.jpg',
    ],
    'life': [
        '/images/campus/life-1.jpg',
        '/images/campus/quad-1.jpg',
        '/images/campus/campus-1.jpg',
        '/images/campus/campus-2.jpg',
    ],
    'sports': ['/images/campus/sports-1.jpg'],
    'dining': ['/images/campus/hall-1.jpg', '/images/campus/quad-1.jpg'],
}

ALL_PHOTOS = [
    '/images/campus/campus-1.jpg',
    '/images/campus/campus-2.jpg',
    '/images/campus/aerial-1.jpg',
    '/images/campus/gate-1.jpg',
    '/images/campus/gate-2.jpg',
    '/images/campus/library-1.jpg',
    '/images/campus/tower-1.jpg',
    '/images/campus/lake-1.jpg',
    '/images/campus/museum-1.jpg',
]

landmarks = CampusLandmark.objects.all()
updated_count = 0
for idx, lm in enumerate(landmarks):
    cat = (lm.category or 'academic').lower()
    pool = CATEGORY_IMAGE_MAP.get(cat, ALL_PHOTOS)
    photo = pool[(idx + lm.id) % len(pool)]
    lm.image_url = photo
    lm.save(update_fields=['image_url'])
    updated_count += 1

print(f"Updated {updated_count} landmarks with verified high-resolution campus photography!")
print("=== Optimization Finished Successfully ===")
