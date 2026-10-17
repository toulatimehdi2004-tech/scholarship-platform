from rest_framework import serializers
from django.utils import timezone
from .models import ApplicationTracker, Student
from scholarships.models import Scholarship


class ScholarshipSummarySerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name', read_only=True)
    university_city = serializers.CharField(source='university.city', read_only=True)
    university_country = serializers.CharField(source='university.country', read_only=True)
    university_id = serializers.IntegerField(source='university.id', read_only=True)
    days_until_deadline = serializers.SerializerMethodField()
    is_deadline_urgent = serializers.SerializerMethodField()
    is_deadline_passed = serializers.SerializerMethodField()

    class Meta:
        model = Scholarship
        fields = [
            'id', 'title', 'type', 'level', 'amount', 'currency',
            'application_deadline', 'application_link', 'required_documents',
            'university_id', 'university_name', 'university_city', 'university_country',
            'days_until_deadline', 'is_deadline_urgent', 'is_deadline_passed',
        ]

    def get_days_until_deadline(self, obj):
        if not obj.application_deadline:
            return None
        now = timezone.now()
        delta = obj.application_deadline - now
        return delta.days

    def get_is_deadline_urgent(self, obj):
        if not obj.application_deadline:
            return False
        delta = obj.application_deadline - timezone.now()
        return 0 <= delta.days <= 7

    def get_is_deadline_passed(self, obj):
        if not obj.application_deadline:
            return False
        return obj.application_deadline < timezone.now()


class ApplicationTrackerSerializer(serializers.ModelSerializer):
    scholarship_id = serializers.PrimaryKeyRelatedField(
        queryset=Scholarship.objects.all(),
        source='scholarship',
        write_only=True
    )
    scholarship = ScholarshipSummarySerializer(read_only=True)
    checklist_progress = serializers.SerializerMethodField()
    days_until_deadline = serializers.SerializerMethodField()
    is_deadline_urgent = serializers.SerializerMethodField()
    is_deadline_passed = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationTracker
        fields = [
            'id',
            'scholarship_id',
            'scholarship',
            'status',
            'notes',
            'portal_application_id',
            'checklist',
            'checklist_progress',
            'days_until_deadline',
            'is_deadline_urgent',
            'is_deadline_passed',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_checklist_progress(self, obj):
        """Calculates completed vs total documents required"""
        docs = obj.scholarship.required_documents if obj.scholarship else []
        if isinstance(docs, str):
            import json
            try:
                docs = json.loads(docs)
            except Exception:
                docs = [docs]
        total = len(docs) if docs else 0
        checklist = obj.checklist or {}
        completed = sum(1 for k, v in checklist.items() if v is True)
        percentage = round((completed / total) * 100) if total > 0 else 0
        return {
            'total': total,
            'completed': completed,
            'percentage': percentage,
            'all_done': completed >= total if total > 0 else False
        }

    def get_days_until_deadline(self, obj):
        if not obj.scholarship or not obj.scholarship.application_deadline:
            return None
        return (obj.scholarship.application_deadline - timezone.now()).days

    def get_is_deadline_urgent(self, obj):
        if not obj.scholarship or not obj.scholarship.application_deadline:
            return False
        delta = obj.scholarship.application_deadline - timezone.now()
        return 0 <= delta.days <= 7

    def get_is_deadline_passed(self, obj):
        if not obj.scholarship or not obj.scholarship.application_deadline:
            return False
        return obj.scholarship.application_deadline < timezone.now()
