import re

from django.core.management.base import BaseCommand

from scholarships.models import University, Scholarship

# (duplicate acronym row -> surviving full-name row)
PAIRS = [
    ('HUST', 'Huazhong University of Science and Technology'),
    ('HIT', 'Harbin Institute of Technology'),
    ('SWJTU', 'Southwest Jiaotong University'),
]

FILL_FIELDS = [
    'website', 'city', 'country', 'address', 'founding_year',
    'motto', 'description', 'latitude', 'longitude', 'tagline',
]


def norm_title(t):
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', (t or '').lower())).strip()


def richness(s):
    return sum([
        len(s.description or ''),
        len(s.eligibility_criteria or ''),
        len(str(s.required_documents or '')),
        len(s.application_instructions or ''),
        50 if s.application_link else 0,
        20 if s.tuition_info else 0,
    ])


class Command(BaseCommand):
    help = 'Merge duplicate acronym university rows into full-name rows'

    def handle(self, *args, **options):
        for dup_name, keep_name in PAIRS:
            dup = University.objects.filter(name=dup_name).first()
            keep = University.objects.filter(name=keep_name).first()
            if not dup or not keep:
                self.stdout.write(f'  skip pair {dup_name}/{keep_name} (missing)')
                continue

            # Fill empty profile fields on survivor
            for f in FILL_FIELDS:
                if not getattr(keep, f) and getattr(dup, f):
                    setattr(keep, f, getattr(dup, f))
            keep.is_verified = keep.is_verified or dup.is_verified
            keep.save()

            # Move related objects (per-object to respect unique_together)
            n_sch = dup.scholarships.update(university=keep)
            n_lm = n_lm_dup = 0
            for lm in dup.landmarks.all():
                if keep.landmarks.filter(name=lm.name).exists():
                    old = keep.landmarks.filter(name=lm.name).first()
                    # keep the richer record
                    if len(lm.description or '') > len(old.description or ''):
                        old.description = lm.description
                    if not old.image_url and lm.image_url:
                        old.image_url = lm.image_url
                    old.save()
                    lm.delete()
                    n_lm_dup += 1
                else:
                    lm.university = keep
                    lm.save(update_fields=['university'])
                    n_lm += 1
            n_ann = n_ann_dup = 0
            for an in dup.announcements.all():
                if keep.announcements.filter(title=an.title).exists():
                    an.delete()
                    n_ann_dup += 1
                else:
                    an.university = keep
                    an.save(update_fields=['university'])
                    n_ann += 1
            self.stdout.write(
                f'  {dup_name} (id={dup.id}) -> {keep_name} (id={keep.id}): '
                f'{n_sch} scholarships, {n_lm} landmarks (+{n_lm_dup} dupes merged), '
                f'{n_ann} announcements (+{n_ann_dup} dupes dropped) moved'
            )
            dup.delete()

            # Dedupe identical scholarship titles within survivor
            seen = {}
            removed = 0
            for s in Scholarship.objects.filter(university=keep).order_by('id'):
                key = norm_title(s.title)
                if key in seen:
                    other = seen[key]
                    drop, stay = (s, other) if richness(s) >= richness(other) else (other, s)
                    # move nothing (same university); keep richer
                    self.stdout.write(f'    dup title: drop #{drop.id} "{drop.title[:50]}" keep #{stay.id}')
                    drop.delete()
                    seen[key] = stay
                    removed += 1
                else:
                    seen[key] = s
            self.stdout.write(f'  removed {removed} duplicate-titled scholarships')

        self.stdout.write(self.style.SUCCESS(
            f"Done: {University.objects.count()} universities, "
            f"{Scholarship.objects.count()} scholarships."
        ))
