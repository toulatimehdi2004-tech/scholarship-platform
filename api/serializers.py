from rest_framework import serializers
from django.contrib.auth.models import User
from students.models import Student
from scholarships.models import University, Scholarship, CampusLandmark, AdmissionAnnouncement
from ai_assistant.models import (
    AIConversation, ApplicationTracker, ScholarshipMatch, AISuggestion
)


# ── Auth / User ──────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        Student.objects.create(user=user)
        return user


# ── Students ─────────────────────────────────────────────────

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'phone', 'date_of_birth', 'country', 'city',
            'education_level', 'field_of_study', 'gpa',
            'is_premium', 'payment_date', 'payment_id',
            'saved_scholarships',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['is_premium', 'payment_date', 'payment_id']


# ── Scholarships & Universities ──────────────────────────────

class CampusLandmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampusLandmark
        fields = ['id', 'name', 'description', 'image_url', 'category', 'order']


class AdmissionAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdmissionAnnouncement
        fields = ['id', 'title', 'date', 'url', 'kind', 'order']


class UniversityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ['id', 'name', 'logo', 'description', 'website', 'country', 'city', 'address', 'founding_year', 'motto', 'latitude', 'longitude', 'tagline', 'is_verified']


class UniversityDetailSerializer(serializers.ModelSerializer):
    scholarships_count = serializers.SerializerMethodField()
    landmarks = CampusLandmarkSerializer(many=True, read_only=True)
    announcements = AdmissionAnnouncementSerializer(many=True, read_only=True)

    class Meta:
        model = University
        fields = [
            'id', 'name', 'logo', 'description', 'website',
            'country', 'city', 'address', 'founding_year', 'motto',
            'latitude', 'longitude', 'tagline', 'about', 'about_ar', 'wikipedia_url',
            'is_verified', 'created_at', 'scholarships_count',
            'landmarks', 'announcements',
        ]

    def get_scholarships_count(self, obj):
        return obj.scholarships.count()


class ScholarshipListSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name', read_only=True)
    university_website = serializers.CharField(source='university.website', read_only=True)
    university_city = serializers.CharField(source='university.city', read_only=True)
    university_country = serializers.CharField(source='university.country', read_only=True)

    class Meta:
        model = Scholarship
        fields = [
            'id', 'title', 'university', 'university_name', 'university_website',
            'university_city', 'university_country', 'type', 'level',
            'amount', 'currency', 'application_deadline', 'application_link', 'is_active',
            'is_featured', 'created_at', 'duration', 'total_seats', 'seats_filled',
        ]


class ScholarshipDetailSerializer(serializers.ModelSerializer):
    university = UniversityListSerializer(read_only=True)
    days_until_deadline = serializers.SerializerMethodField()
    seats_available = serializers.SerializerMethodField()

    class Meta:
        model = Scholarship
        fields = [
            'id', 'title', 'university', 'description', 'type', 'level',
            'amount', 'currency', 'duration', 'tuition_info',
            'total_seats', 'seats_filled', 'seats_available',
            'application_deadline', 'start_date', 'end_date',
            'eligibility_criteria', 'required_education_level',
            'minimum_gpa', 'required_fields_of_study',
            'application_fee', 'application_link', 'required_documents',
            'application_instructions',
            'contact_email', 'contact_phone', 'language',
            'is_active', 'is_featured', 'view_count',
            'created_at', 'updated_at', 'days_until_deadline',
        ]

    def get_days_until_deadline(self, obj):
        return obj.days_until_deadline()

    def get_seats_available(self, obj):
        return obj.seats_left()


# ── AI Assistant ─────────────────────────────────────────────

class ApplicationTrackerSerializer(serializers.ModelSerializer):
    scholarship_title = serializers.CharField(source='scholarship.title', read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    next_step = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationTracker
        fields = [
            'id', 'scholarship', 'scholarship_title', 'current_step',
            'checklist', 'ai_recommendations', 'notes',
            'deadline_reminder_sent', 'last_ai_check',
            'progress_percentage', 'next_step',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['ai_recommendations', 'deadline_reminder_sent',
                            'last_ai_check']

    def get_progress_percentage(self, obj):
        return obj.get_progress_percentage()

    def get_next_step(self, obj):
        return obj.get_next_step()


class ScholarshipMatchSerializer(serializers.ModelSerializer):
    scholarship_title = serializers.CharField(source='scholarship.title', read_only=True)
    university_name = serializers.CharField(source='scholarship.university.name', read_only=True)

    class Meta:
        model = ScholarshipMatch
        fields = [
            'id', 'scholarship', 'scholarship_title', 'university_name',
            'match_score', 'match_reasons', 'generated_at',
        ]


class AISuggestionSerializer(serializers.ModelSerializer):
    scholarship_title = serializers.CharField(
        source='related_scholarship.title', read_only=True, default=None
    )

    class Meta:
        model = AISuggestion
        fields = [
            'id', 'suggestion_type', 'title', 'message',
            'related_scholarship', 'scholarship_title',
            'is_read', 'is_dismissed', 'action_url', 'created_at',
        ]
        read_only_fields = ['is_read', 'is_dismissed']


class AIConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIConversation
        fields = ['id', 'session_id', 'role', 'message', 'intent',
                  'metadata', 'created_at']
        read_only_fields = ['role', 'intent', 'metadata']


class AIChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=2000)
    session_id = serializers.CharField(max_length=64, required=False, allow_blank=True, allow_null=True)
    use_ai = serializers.BooleanField(default=False)
    language = serializers.CharField(max_length=8, required=False, allow_blank=True, default='')


# ── Documents ────────────────────────────────────────────────

from documents.models import Document, DocumentScan

class DocumentScanSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentScan
        fields = ['id', 'full_text', 'name', 'date_of_birth', 'document_number',
                  'issued_date', 'expiry_date', 'nationality', 'address',
                  'extracted_entities', 'confidence_score', 'processed_at']
        read_only_fields = fields


class DocumentSerializer(serializers.ModelSerializer):
    scan_result = DocumentScanSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ['id', 'title', 'document_type', 'file', 'file_url', 'file_name',
                  'file_size', 'extracted_text', 'status', 'is_verified',
                  'created_at', 'updated_at', 'scan_result']
        read_only_fields = ['file_name', 'file_size', 'extracted_text',
                            'status', 'is_verified', 'created_at', 'updated_at']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
