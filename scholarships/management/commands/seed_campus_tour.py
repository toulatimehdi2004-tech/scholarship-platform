from django.core.management.base import BaseCommand
from scholarships.models import University, CampusLandmark
from .campus_data import ALL


class Command(BaseCommand):
    help = 'Seed campus tour data: coordinates, taglines and real landmarks'

    def handle(self, *args, **options):
        by_name = {u.name: u for u in University.objects.all()}
        updated = 0
        created_lms = 0
        skipped = []

        for entry in ALL:
            uni = by_name.get(entry["name"])
            if not uni:
                skipped.append(entry["name"])
                continue

            changed = False
            if uni.latitude != entry["lat"]:
                uni.latitude = entry["lat"]
                changed = True
            if uni.longitude != entry["lng"]:
                uni.longitude = entry["lng"]
                changed = True
            if entry.get("tagline") and uni.tagline != entry["tagline"]:
                uni.tagline = entry["tagline"]
                changed = True
            if changed:
                uni.save()
                updated += 1

            for i, lm in enumerate(entry.get("landmarks", [])):
                obj, was_created = CampusLandmark.objects.update_or_create(
                    university=uni,
                    name=lm["name"],
                    defaults={
                        "description": lm.get("description") or "",
                        "image_url": lm.get("image_url") or None,
                        "order": i,
                    },
                )
                if was_created:
                    created_lms += 1

        # Copy data to duplicate rows (HUST full name, HIT full name)
        aliases = {
            "Huazhong University of Science and Technology": "HUST",
            "Harbin Institute of Technology": "HIT",
        }
        for full, short in aliases.items():
            src = by_name.get(short)
            dst = by_name.get(full)
            if src and dst:
                dst.latitude = src.latitude
                dst.longitude = src.longitude
                dst.tagline = src.tagline
                dst.save()
                updated += 1
                for lm in src.landmarks.all():
                    CampusLandmark.objects.update_or_create(
                        university=dst,
                        name=lm.name,
                        defaults={"description": lm.description, "image_url": lm.image_url, "order": lm.order},
                    )
                    created_lms += 1

        self.stdout.write(self.style.SUCCESS(
            f'Universities updated: {updated}, landmarks created: {created_lms}'
        ))
        if skipped:
            self.stdout.write('No DB match: ' + ', '.join(skipped))
