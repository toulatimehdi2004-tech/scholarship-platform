"""
Smart Scholarship Matching Engine
Matches students with scholarships based on their profile,
generates match scores, and provides personalized recommendations.
"""

import logging
from datetime import timedelta

from django.utils import timezone
from django.db.models import Q, F

from scholarships.models import Scholarship
from students.models import Student
from .models import ScholarshipMatch

logger = logging.getLogger(__name__)

# Weight factors for matching
WEIGHTS = {
    'level_match': 25,
    'field_match': 25,
    'country_preference': 15,
    'funding_type_match': 10,
    'gpa_eligible': 15,
    'deadline_valid': 10,
}


def calculate_match_score(student, scholarship):
    """
    Calculate a 0-100 match score between a student and a scholarship.
    Returns (score, reasons_list).
    """
    score = 0
    reasons = []

    # Level match (25 points)
    if student.education_level and scholarship.level:
        if student.education_level.lower() == scholarship.level.lower():
            score += WEIGHTS['level_match']
            reasons.append(f"Matches your education level ({scholarship.get_level_display()})")
        elif _level_compatible(student.education_level, scholarship.level):
            score += WEIGHTS['level_match'] // 2
            reasons.append(f"Partially compatible level ({scholarship.get_level_display()})")

    # Field of study match (25 points)
    if student.field_of_study and scholarship.required_fields_of_study:
        student_field = student.field_of_study.lower()
        match_fields = [f.lower() for f in scholarship.required_fields_of_study]

        if any(student_field in f or f in student_field for f in match_fields):
            score += WEIGHTS['field_match']
            reasons.append(f"Matches your field ({student.field_of_study})")
        elif any(_fields_related(student_field, f) for f in match_fields):
            score += WEIGHTS['field_match'] // 2
            reasons.append(f"Related to your field ({student.field_of_study})")
    elif not scholarship.required_fields_of_study:
        # No field restriction = open to all = partial credit
        score += WEIGHTS['field_match'] // 2
        reasons.append("Open to all fields of study")

    # Country preference (15 points)
    if student.country and scholarship.university.country:
        if student.country.lower() != scholarship.university.country.lower():
            score += WEIGHTS['country_preference']
            reasons.append(f"Study in {scholarship.university.country}")
        else:
            score += WEIGHTS['country_preference'] // 2
            reasons.append(f"Local university ({scholarship.university.country})")

    # Funding type match (10 points)
    if scholarship.type == 'full':
        score += WEIGHTS['funding_type_match']
        reasons.append("Fully funded scholarship")
    elif scholarship.type == 'partial':
        score += WEIGHTS['funding_type_match'] // 2
        reasons.append("Partial funding available")

    # GPA eligibility (15 points)
    if student.gpa and scholarship.minimum_gpa:
        if student.gpa >= scholarship.minimum_gpa:
            score += WEIGHTS['gpa_eligible']
            reasons.append(f"Meets GPA requirement ({scholarship.minimum_gpa}+)")
        else:
            gap = scholarship.minimum_gpa - student.gpa
            if gap <= 0.3:
                score += WEIGHTS['gpa_eligible'] // 3
                reasons.append(f"Close to GPA requirement (need +{gap:.2f})")
    elif not scholarship.minimum_gpa:
        score += WEIGHTS['gpa_eligible']
        reasons.append("No minimum GPA required")

    # Deadline validity (10 points)
    if not scholarship.is_deadline_passed():
        days_left = scholarship.days_until_deadline()
        score += WEIGHTS['deadline_valid']
        if days_left <= 7:
            reasons.append(f"Urgent: {days_left} days left!")
        elif days_left <= 30:
            reasons.append(f"{days_left} days until deadline")
        else:
            reasons.append(f"Deadline: {days_left} days away")
    else:
        reasons.append("Deadline has passed")

    return min(score, 100), reasons


def _level_compatible(student_level, scholarship_level):
    """Check if education levels are compatible"""
    compatibility = {
        'bachelor': ['bachelor'],
        'master': ['master', 'bachelor'],
        'phd': ['phd', 'master'],
        'postdoc': ['postdoc', 'phd'],
    }
    s_level = student_level.lower()
    sp_level = scholarship_level.lower()
    return sp_level in compatibility.get(s_level, [])


def _fields_related(field1, field2):
    """Check if two fields of study are related"""
    related_groups = [
        {'computer science', 'information technology', 'software engineering',
         'data science', 'artificial intelligence', 'cybersecurity'},
        {'engineering', 'mechanical engineering', 'electrical engineering',
         'civil engineering', 'chemical engineering'},
        {'business', 'business administration', 'mba', 'finance',
         'accounting', 'economics'},
        {'medicine', 'nursing', 'public health', 'pharmacy', 'dentistry'},
        {'law', 'international law', 'human rights'},
        {'education', 'teaching', 'pedagogy'},
    ]

    f1, f2 = field1.lower(), field2.lower()
    for group in related_groups:
        if f1 in group and f2 in group:
            return True
    return False


def generate_matches(user, max_results=10):
    """
    Generate scholarship matches for a student based on their profile.
    Creates/updates ScholarshipMatch records and returns the top matches.
    """
    try:
        profile = user.student_profile
    except Student.DoesNotExist:
        return []

    # Get active scholarships that haven't passed deadline
    scholarships = Scholarship.objects.filter(
        is_active=True,
        application_deadline__gte=timezone.now(),
    )

    matches = []
    for scholarship in scholarships:
        score, reasons = calculate_match_score(profile, scholarship)

        # Only include matches above 20%
        if score > 20:
            match, created = ScholarshipMatch.objects.update_or_create(
                student=user,
                scholarship=scholarship,
                defaults={
                    'match_score': score,
                    'match_reasons': reasons,
                    'generated_at': timezone.now(),
                }
            )
            matches.append(match)

    # Sort by score and return top results
    matches.sort(key=lambda m: m.match_score, reverse=True)
    return matches[:max_results]


def get_top_matches_for_scholarship(scholarship, max_results=10):
    """
    Find the best-matching students for a given scholarship.
    Useful for universities to see who's likely to apply.
    """
    students = Student.objects.filter(
        is_premium=True,
        education_level__isnull=False,
    )

    matches = []
    for student in students:
        score, reasons = calculate_match_score(student, scholarship)
        if score > 30:
            matches.append({
                'student': student,
                'score': score,
                'reasons': reasons,
            })

    matches.sort(key=lambda m: m['score'], reverse=True)
    return matches[:max_results]
