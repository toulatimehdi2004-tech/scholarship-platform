"""
ScholarChina Academic Evaluation & Matching Services
====================================================
1. GpaConversionService:
   Converts different international grading scales (/20, /4.0, /100, UK Class)
   into a unified standard 0-100 score for fair scholarship comparison.

2. EligibilityService:
   Performs rigorous rule-based evaluation of a student profile against
   scholarship criteria, returning matchScore, isEligible, passedRules, and failedReasons.

3. CostCalculatorService:
   Calculates upfront out-of-pocket cash needed before arriving and monthly living balance
   comparing stipend against city living costs and accommodation coverage.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple, Union


class GpaConversionService:
    """
    Standardizes international grading scales into a fair, unified 0-100 score.
    Supported Scales:
      - SCALE_20  : Morocco, France, Tunisia, Algeria, Senegal, Francophone Africa (/20)
      - SCALE_4   : US, Canada, Global International (/4.0)
      - SCALE_100 : China, India, Percentage systems (/100)
      - UK_CLASS  : UK Honours degree classification (1st, 2:1, 2:2, 3rd)
    """

    SCALE_20 = 'SCALE_20'
    SCALE_4 = 'SCALE_4'
    SCALE_100 = 'SCALE_100'
    UK_CLASS = 'UK_CLASS'

    SUPPORTED_SCALES = [SCALE_20, SCALE_4, SCALE_100, UK_CLASS]

    UK_CLASS_MAP = {
        'FIRST': 88.0,
        '1ST': 88.0,
        'FIRST CLASS': 88.0,
        '2:1': 76.0,
        'UPPER SECOND': 76.0,
        'UPPER SECOND CLASS': 76.0,
        '2:2': 64.0,
        'LOWER SECOND': 64.0,
        'LOWER SECOND CLASS': 64.0,
        'THIRD': 54.0,
        '3RD': 54.0,
        'THIRD CLASS': 54.0,
    }

    @classmethod
    def to_scale_100(
        cls,
        raw_value: Union[int, float, str, Decimal, None],
        scale: Optional[str] = None
    ) -> Optional[float]:
        """
        Converts any given raw grade and scale to a normalized 0-100 score.
        Returns float rounded to 2 decimal places, or None if invalid.
        """
        if raw_value is None:
            return None

        # Clean string inputs
        raw_str = str(raw_value).strip().replace(',', '.')
        if not raw_str:
            return None

        # Detect slash format like "16/20" or "3.8/4.0" or "85/100"
        if '/' in raw_str:
            parts = raw_str.split('/')
            try:
                num = float(parts[0].strip())
                denom = float(parts[1].strip())
                if denom > 0:
                    score = (num / denom) * 100.0
                    return round(min(100.0, max(0.0, score)), 2)
            except (ValueError, IndexError):
                pass

        # Check UK classification string
        uk_key = raw_str.upper()
        for k, val in cls.UK_CLASS_MAP.items():
            if k in uk_key:
                return float(val)

        # Parse numeric float
        try:
            numeric_val = float(raw_str)
        except ValueError:
            return None

        # Normalize scale name
        clean_scale = (scale or '').upper().strip()
        if '20' in clean_scale:
            clean_scale = cls.SCALE_20
        elif '4' in clean_scale:
            clean_scale = cls.SCALE_4
        elif '100' in clean_scale or '%' in clean_scale:
            clean_scale = cls.SCALE_100
        elif 'UK' in clean_scale:
            clean_scale = cls.UK_CLASS

        # Auto-infer scale if unspecified
        if not clean_scale:
            if numeric_val <= 4.0:
                clean_scale = cls.SCALE_4
            elif numeric_val <= 20.0:
                clean_scale = cls.SCALE_20
            else:
                clean_scale = cls.SCALE_100

        # Execute conversion
        if clean_scale == cls.SCALE_20:
            score = (numeric_val / 20.0) * 100.0
        elif clean_scale == cls.SCALE_4:
            score = (numeric_val / 4.0) * 100.0
        elif clean_scale == cls.SCALE_100:
            score = numeric_val
        elif clean_scale == cls.UK_CLASS:
            if numeric_val >= 70.0:
                score = 88.0
            elif numeric_val >= 60.0:
                score = 76.0
            elif numeric_val >= 50.0:
                score = 64.0
            else:
                score = 54.0
        else:
            # Fallback to scale 100
            score = numeric_val

        # Bound to [0.0, 100.0]
        return round(min(100.0, max(0.0, score)), 2)

    @classmethod
    def get_grade_bracket(cls, score_100: Optional[float]) -> str:
        """Returns standard academic honors classification."""
        if score_100 is None:
            return 'N/A'
        if score_100 >= 85.0:
            return 'Excellent / Très Bien (Top Honors)'
        if score_100 >= 75.0:
            return 'Very Good / Bien'
        if score_100 >= 65.0:
            return 'Good / Assez Bien'
        if score_100 >= 50.0:
            return 'Satisfactory / Passable'
        return 'Below Threshold'


class EligibilityService:
    """
    Evaluates candidate academic profile against scholarship eligibility rules.
    Returns:
      - matchScore: int (0 to 100)
      - isEligible: bool (True only if all mandatory criteria are satisfied)
      - passedRules: List[str]
      - failedReasons: List[str]
      - details: Dict[str, Any]
    """

    COUNTRY_SYNONYMS = {
        'MA': ['morocco', 'maroc', 'المغرب', 'ma'],
        'DZ': ['algeria', 'algérie', 'الجزائر', 'dz'],
        'TN': ['tunisia', 'tunisie', 'تونس', 'tn'],
        'SN': ['senegal', 'sénégal', 'السنغال', 'sn'],
        'FR': ['france', 'fr'],
        'CI': ["cote d'ivoire", "côte d'ivoire", 'ci'],
        'EG': ['egypt', 'égypte', 'مصر', 'eg'],
        'MR': ['mauritania', 'mauritanie', 'موريتانيا', 'mr'],
    }

    DEGREE_PREREQUISITES = {
        'bachelor': ['high school', 'bac', 'baccalauréat', 'baccalaureate', 'lycée', 'secondary'],
        'master': ['bachelor', 'licence', 'license', 'undergraduate', 'b.sc', 'b.a', 'bac+3', 'bac+4'],
        'phd': ['master', 'master of science', 'm.sc', 'm.a', 'magistère', 'ingénieur', 'bac+5', 'postgraduate'],
        'language': ['all', 'high school', 'bac', 'bachelor', 'licence', 'master'],
        'exchange': ['all', 'bachelor', 'licence', 'master'],
    }

    @classmethod
    def evaluate(
        cls,
        student_data: Union[Any, Dict[str, Any]],
        scholarship: Any
    ) -> Dict[str, Any]:
        """
        Evaluates a student against a single scholarship.
        student_data can be:
          - A dictionary with student attributes
          - A Django User, Student, or StudentProfile instance
        scholarship can be:
          - A Scholarship model instance or dictionary
        """
        data = cls._extract_student_attributes(student_data)

        passed_rules: List[str] = []
        failed_reasons: List[str] = []

        # -------------------------------------------------------------
        # 1. Rule: Academic Degree Prerequisite & Target Degree
        # -------------------------------------------------------------
        sch_target = getattr(scholarship, 'target_degree', None) or getattr(scholarship, 'level', None) or ''
        sch_req_deg = getattr(scholarship, 'required_education_level', None) or ''
        stu_deg = (data.get('current_degree') or data.get('education_level') or '').strip().lower()

        target_key = sch_target.lower().strip()
        prereqs = cls.DEGREE_PREREQUISITES.get(target_key, [])

        if sch_target:
            if not stu_deg:
                passed_rules.append(f"Target Program: {sch_target} (Prerequisite verification pending)")
            elif any(p in stu_deg for p in prereqs) or 'all' in prereqs:
                passed_rules.append(f"Degree Requirement: Holding '{data.get('current_degree') or data.get('education_level')}' qualifies for {sch_target} admissions")
            elif sch_req_deg and (sch_req_deg.lower() in stu_deg or stu_deg in sch_req_deg.lower()):
                passed_rules.append(f"Degree Requirement: '{data.get('current_degree') or data.get('education_level')}' matches required {sch_req_deg}")
            else:
                failed_reasons.append(
                    f"Degree Prerequisite: This {sch_target} program requires holding a prerequisite degree (e.g. {', '.join(prereqs[:2]) or sch_target}), candidate currently holds '{data.get('current_degree') or data.get('education_level')}'"
                )
        else:
            passed_rules.append("Degree Requirement: Open to all academic degree levels")

        # -------------------------------------------------------------
        # 2. Rule: Maximum Age Limit
        # -------------------------------------------------------------
        max_age = getattr(scholarship, 'max_age', None)
        stu_age = data.get('age')

        if max_age is not None and max_age > 0:
            if stu_age is not None:
                if stu_age <= max_age:
                    passed_rules.append(f"Age Limit: Candidate age {stu_age} is within the required limit (maximum allowed: {max_age} years)")
                else:
                    failed_reasons.append(f"Age Limit: Maximum age for this scholarship is {max_age} years (applicant is {stu_age} years old)")
            else:
                passed_rules.append(f"Age Limit: Maximum {max_age} years (applicant birth date not specified on file)")
        else:
            passed_rules.append("Age Limit: No maximum age restriction specified")

        # -------------------------------------------------------------
        # 3. Rule: Normalized GPA Requirement (0-100 Standard)
        # -------------------------------------------------------------
        sch_min_gpa = getattr(scholarship, 'min_gpa_100', None)
        if sch_min_gpa is None:
            # Fallback to minimum_gpa on 4.0 scale if present
            raw_min_gpa = getattr(scholarship, 'minimum_gpa', None)
            if raw_min_gpa:
                sch_min_gpa = GpaConversionService.to_scale_100(raw_min_gpa, 'SCALE_4')

        stu_gpa_100 = data.get('gpa_normalized_100')
        if stu_gpa_100 is None and data.get('gpa_raw'):
            stu_gpa_100 = GpaConversionService.to_scale_100(data.get('gpa_raw'), data.get('gpa_scale'))

        if sch_min_gpa is not None and float(sch_min_gpa) > 0:
            min_float = float(sch_min_gpa)
            if stu_gpa_100 is not None:
                if float(stu_gpa_100) >= min_float:
                    passed_rules.append(
                        f"Academic GPA: Candidate score of {stu_gpa_100:.1f}/100 exceeds the minimum threshold of {min_float:.1f}/100"
                    )
                else:
                    failed_reasons.append(
                        f"Academic GPA: Requires minimum normalized score of {min_float:.1f}/100 (applicant score is {stu_gpa_100:.1f}/100)"
                    )
            else:
                failed_reasons.append(f"Academic GPA: Requires minimum score of {min_float:.1f}/100 (GPA not specified in candidate profile)")
        else:
            passed_rules.append("Academic GPA: No minimum GPA threshold enforced")

        # -------------------------------------------------------------
        # 4. Rule: English Language Proficiency
        # -------------------------------------------------------------
        min_eng = getattr(scholarship, 'min_english_score', None)
        stu_eng_score = data.get('english_score')
        stu_eng_type = (data.get('english_test_type') or 'NONE').upper()

        if min_eng is not None and float(min_eng) > 0:
            min_eng_float = float(min_eng)
            if stu_eng_score is not None and float(stu_eng_score) > 0:
                eng_val = float(stu_eng_score)
                # Normalize Duolingo (DET out of 160) or TOEFL (out of 120) to IELTS approx 0-9
                normalized_ielts_equiv = cls._normalize_english_to_ielts(stu_eng_type, eng_val)
                target_ielts = min_eng_float if min_eng_float <= 9.0 else (min_eng_float / 120.0) * 9.0

                if normalized_ielts_equiv >= target_ielts or eng_val >= min_eng_float:
                    passed_rules.append(
                        f"English Language: Score of {stu_eng_type} {eng_val} satisfies minimum requirement of {min_eng_float}"
                    )
                else:
                    failed_reasons.append(
                        f"English Language: Requires minimum proficiency equivalent to IELTS {target_ielts:.1f} (candidate score: {stu_eng_type} {eng_val})"
                    )
            else:
                failed_reasons.append(f"English Language: Requires official language test certificate of min {min_eng_float} (e.g. IELTS 6.0+ / TOEFL 80+)")
        else:
            passed_rules.append("English Language: No mandatory test certificate required (English instruction or university waiver applicable)")

        # -------------------------------------------------------------
        # 5. Rule: Chinese HSK Proficiency Level
        # -------------------------------------------------------------
        min_hsk = getattr(scholarship, 'min_hsk_level', 0) or 0
        stu_hsk = int(data.get('hsk_level') or 0)

        if min_hsk > 0:
            if stu_hsk >= min_hsk:
                passed_rules.append(f"Chinese HSK: Level {stu_hsk} satisfies Chinese proficiency requirement (minimum HSK {min_hsk})")
            else:
                failed_reasons.append(f"Chinese HSK: Requires minimum HSK Level {min_hsk} (applicant has HSK {stu_hsk})")
        else:
            passed_rules.append("Chinese HSK: No HSK certification required for this program")

        # -------------------------------------------------------------
        # 6. Rule: Nationality & Country Eligibility
        # -------------------------------------------------------------
        stu_nat = (data.get('nationality') or data.get('country') or '').strip()
        eligible_countries = getattr(scholarship, 'eligible_countries', []) or []
        excluded_countries = getattr(scholarship, 'excluded_countries', []) or []

        if isinstance(eligible_countries, str):
            eligible_countries = [c.strip() for c in eligible_countries.split(',') if c.strip()]
        if isinstance(excluded_countries, str):
            excluded_countries = [c.strip() for c in excluded_countries.split(',') if c.strip()]

        if excluded_countries and stu_nat:
            if cls._country_in_list(stu_nat, excluded_countries):
                failed_reasons.append(f"Country Restriction: Candidates from '{stu_nat}' are not eligible for this bilateral quota")
            else:
                passed_rules.append(f"Country Eligibility: Nationality '{stu_nat}' is not subject to country restrictions")

        if eligible_countries:
            if not stu_nat:
                failed_reasons.append("Country Eligibility: Nationality not provided in profile")
            elif cls._country_in_list(stu_nat, eligible_countries):
                passed_rules.append(f"Country Eligibility: Nationality '{stu_nat}' is eligible for this scholarship")
            else:
                failed_reasons.append(f"Country Eligibility: Nationality '{stu_nat}' is not in the list of eligible countries")
        elif not excluded_countries:
            passed_rules.append(f"Country Eligibility: Open to all international candidates ({stu_nat or 'International'})")

        # -------------------------------------------------------------
        # 7. Compute Match Score (0 - 100%)
        # -------------------------------------------------------------
        is_eligible = (len(failed_reasons) == 0)
        match_score = cls._compute_match_score(
            data=data,
            scholarship=scholarship,
            is_eligible=is_eligible,
            passed_count=len(passed_rules),
            failed_count=len(failed_reasons),
        )

        return {
            'isEligible': is_eligible,
            'matchScore': match_score,
            'passedRules': passed_rules,
            'failedReasons': failed_reasons,
            'details': {
                'scholarshipId': getattr(scholarship, 'id', None),
                'scholarshipTitle': getattr(scholarship, 'title', ''),
                'studentNationality': stu_nat or 'Not specified',
                'studentAge': stu_age,
                'normalizedGpa100': stu_gpa_100,
                'englishScore': stu_eng_score,
                'englishTestType': stu_eng_type,
                'hskLevel': stu_hsk,
            }
        }

    @classmethod
    def _extract_student_attributes(cls, student_data: Any) -> Dict[str, Any]:
        """Extracts normalized candidate fields from varied inputs."""
        res: Dict[str, Any] = {}

        if isinstance(student_data, dict):
            res = dict(student_data)
        else:
            # Check if it has student_academic_profile or student_profile
            acad = getattr(student_data, 'student_academic_profile', None)
            stud = getattr(student_data, 'student_profile', None)

            # Try direct attributes
            for field in [
                'nationality', 'birth_date', 'current_degree', 'gpa_raw',
                'gpa_scale', 'gpa_normalized_100', 'english_test_type',
                'english_score', 'hsk_level', 'country', 'city', 'education_level'
            ]:
                val = getattr(student_data, field, None)
                if val is not None:
                    res[field] = val
                elif acad and getattr(acad, field, None) is not None:
                    res[field] = getattr(acad, field)
                elif stud and getattr(stud, field, None) is not None:
                    res[field] = getattr(stud, field)

            if hasattr(student_data, 'date_of_birth') and not res.get('birth_date'):
                res['birth_date'] = getattr(student_data, 'date_of_birth')

        # Compute age if birth_date is present
        b_date = res.get('birth_date') or res.get('date_of_birth')
        if b_date:
            parsed_b_date: Optional[date] = None
            if isinstance(b_date, (datetime, date)):
                parsed_b_date = b_date if isinstance(b_date, date) else b_date.date()
            elif isinstance(b_date, str):
                for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%Y/%m/%d'):
                    try:
                        parsed_b_date = datetime.strptime(b_date.strip(), fmt).date()
                        break
                    except ValueError:
                        pass
            if parsed_b_date:
                today = date.today()
                age = today.year - parsed_b_date.year - (
                    (today.month, today.day) < (parsed_b_date.month, parsed_b_date.day)
                )
                res['age'] = age
                res['birth_date'] = parsed_b_date

        # Compute normalized GPA if missing
        if res.get('gpa_normalized_100') is None and (res.get('gpa_raw') or res.get('gpa')):
            raw = res.get('gpa_raw') or res.get('gpa')
            scale = res.get('gpa_scale')
            res['gpa_normalized_100'] = GpaConversionService.to_scale_100(raw, scale)

        return res

    @classmethod
    def _normalize_english_to_ielts(cls, test_type: str, score: float) -> float:
        """Converts diverse test types (TOEFL, DET) to approximate IELTS 0-9 scale."""
        tt = test_type.upper()
        if 'TOEFL' in tt:
            if score >= 100:
                return 7.5
            if score >= 90:
                return 7.0
            if score >= 80:
                return 6.5
            if score >= 70:
                return 6.0
            if score >= 60:
                return 5.5
            return 5.0
        elif 'DUOLINGO' in tt or 'DET' in tt:
            if score >= 130:
                return 7.5
            if score >= 120:
                return 7.0
            if score >= 110:
                return 6.5
            if score >= 100:
                return 6.0
            if score >= 90:
                return 5.5
            return 5.0
        return score

    @classmethod
    def _country_in_list(cls, candidate_country: str, country_list: List[str]) -> bool:
        """Flexible matching for country ISO codes, English, French, and Arabic names."""
        clean_c = candidate_country.strip().lower()
        if not clean_c:
            return False

        # Direct search
        for item in country_list:
            if not item:
                continue
            item_clean = str(item).strip().lower()
            if clean_c == item_clean or clean_c in item_clean or item_clean in clean_c:
                return True

        # Check synonym table
        for iso, synonyms in cls.COUNTRY_SYNONYMS.items():
            if clean_c in synonyms:
                for item in country_list:
                    item_clean = str(item).strip().lower()
                    if item_clean in synonyms:
                        return True

        return False

    @classmethod
    def _compute_match_score(
        cls,
        data: Dict[str, Any],
        scholarship: Any,
        is_eligible: bool,
        passed_count: int,
        failed_count: int
    ) -> int:
        """
        Calculates a refined 0-100% match score:
          - If Eligible (all hard rules passed): score ranges from 60 to 100 based on academic strength.
          - If Ineligible (failed rules): score is capped at 45% proportional to satisfied criteria.
        """
        if not is_eligible:
            total_rules = max(1, passed_count + failed_count)
            ratio = passed_count / total_rules
            return int(round(ratio * 45))

        # Base score for fulfilling all mandatory rules
        score = 65.0

        # 1. GPA bonus (+0 to +20)
        gpa_100 = data.get('gpa_normalized_100')
        if gpa_100 is not None:
            min_gpa = getattr(scholarship, 'min_gpa_100', None) or 70.0
            excess = float(gpa_100) - float(min_gpa)
            if excess > 0:
                score += min(20.0, excess * 0.8)
            elif float(gpa_100) >= 85.0:
                score += 15.0

        # 2. Language bonus (+0 to +10)
        eng_score = data.get('english_score')
        if eng_score and float(eng_score) >= 7.0:
            score += 5.0

        hsk = int(data.get('hsk_level') or 0)
        if hsk >= 4:
            score += 5.0

        # 3. Target Degree & Field alignment (+0 to +5)
        req_fields = getattr(scholarship, 'required_fields_of_study', []) or []
        stu_field = (data.get('field_of_study') or '').strip().lower()
        if stu_field and req_fields:
            if any(f.lower() in stu_field or stu_field in f.lower() for f in req_fields):
                score += 5.0

        return int(min(100, round(score)))


class CostCalculatorService:
    """
    Cost & Living Expense Calculator for Scholarships.
    Calculates:
      1) Upfront Out-of-Pocket Cash Needed Before Arriving
         (application fee + visa/medical/legalization fees + flight estimate if not covered)
      2) Monthly Living Balance
         (monthly_stipend minus city living cost, subtracting rent if dorm is already covered)
    """

    CNY_TO_MAD_RATE = 1.40
    CNY_TO_USD_RATE = 0.139
    USD_TO_CNY_RATE = 7.20
    DEFAULT_FLIGHT_COST_CNY = 5500.00  # Casablanca/International to China one-way
    DEFAULT_VISA_MEDICAL_DOCS_CNY = 1500.00  # JW202, visa, foreigner physical exam, Apostille

    # Fallback city costs by tier if city not in CityLivingCost table
    TIER_DEFAULTS = {
        'tier1': {
            'dorm': 900.00,
            'offcampus': 3500.00,
            'food_transport': 1800.00,
        },
        'tier2': {
            'dorm': 550.00,
            'offcampus': 1800.00,
            'food_transport': 1200.00,
        },
    }

    @classmethod
    def calculate(
        cls,
        scholarship: Any,
        include_flight: bool = True,
        live_on_campus: bool = True
    ) -> Dict[str, Any]:
        """
        Calculates upfront cash requirement and monthly living balance.
        """
        # 1. Resolve university and city
        university = getattr(scholarship, 'university', None)
        uni_name = university.name if university else "Chinese University"
        city_name = (university.city if university else "") or "General China"

        # 2. Look up CityLivingCost
        city_cost_obj = None
        try:
            from scholarships.models import CityLivingCost
            if city_name:
                city_cost_obj = CityLivingCost.objects.filter(city_name__iexact=city_name.strip()).first()
        except Exception:
            city_cost_obj = None

        if city_cost_obj:
            dorm_cost = float(city_cost_obj.monthly_dorm_cost or 0)
            offcampus_cost = float(city_cost_obj.monthly_offcampus_rent or 0)
            food_transport_cost = float(city_cost_obj.monthly_food_transport or 0)
        else:
            tier_key = 'tier1' if any(t in city_name.lower() for t in ['beijing', 'shanghai', 'guangzhou', 'shenzhen']) else 'tier2'
            dorm_cost = cls.TIER_DEFAULTS[tier_key]['dorm']
            offcampus_cost = cls.TIER_DEFAULTS[tier_key]['offcampus']
            food_transport_cost = cls.TIER_DEFAULTS[tier_key]['food_transport']

        # 3. Upfront Costs Calculation
        # Application fee
        raw_app_fee = float(getattr(scholarship, 'application_fee', 0) or 0)
        curr = (getattr(scholarship, 'currency', 'USD') or 'USD').upper()
        if curr == 'USD':
            app_fee_cny = round(raw_app_fee * cls.USD_TO_CNY_RATE, 2)
        else:
            app_fee_cny = round(raw_app_fee, 2)

        # Visa / Medical / Legalization
        visa_docs_cny = float(getattr(scholarship, 'estimated_visa_medical_docs_cost', None) or cls.DEFAULT_VISA_MEDICAL_DOCS_CNY)

        # Flight estimate
        covers_flight = bool(getattr(scholarship, 'covers_flight', False))
        if covers_flight:
            flight_cny = 0.0
            flight_status = "Covered by Scholarship (Free Airfare Provided)"
        elif include_flight:
            flight_cny = cls.DEFAULT_FLIGHT_COST_CNY
            flight_status = "Not covered (Applicant pays estimated international flight)"
        else:
            flight_cny = 0.0
            flight_status = "Excluded from upfront cash (Applicant manages flight separately)"

        total_upfront_cny = round(app_fee_cny + visa_docs_cny + flight_cny, 2)
        total_upfront_mad = round(total_upfront_cny * cls.CNY_TO_MAD_RATE, 2)
        total_upfront_usd = round(total_upfront_cny * cls.CNY_TO_USD_RATE, 2)

        upfront_items = [
            {
                "id": "application_fee",
                "name": "University Application & Processing Fee",
                "amount_cny": app_fee_cny,
                "amount_mad": round(app_fee_cny * cls.CNY_TO_MAD_RATE, 2),
                "is_covered": app_fee_cny == 0,
                "note": "0 RMB / Free Application" if app_fee_cny == 0 else f"{raw_app_fee:.2f} {curr} registration fee",
            },
            {
                "id": "visa_medical_docs",
                "name": "X1 Visa, Medical Checkup & Legalization (Apostille)",
                "amount_cny": visa_docs_cny,
                "amount_mad": round(visa_docs_cny * cls.CNY_TO_MAD_RATE, 2),
                "is_covered": False,
                "note": "Official JW202 / DQ form, Foreigner Physical Exam stamp, Apostille & translation",
            },
        ]

        if include_flight or covers_flight:
            upfront_items.append({
                "id": "flight_ticket",
                "name": "International Flight Ticket (e.g. Morocco to China)",
                "amount_cny": flight_cny,
                "amount_mad": round(flight_cny * cls.CNY_TO_MAD_RATE, 2),
                "is_covered": covers_flight,
                "note": flight_status,
            })

        # 4. Monthly Living Balance Calculation
        monthly_stipend_cny = float(getattr(scholarship, 'monthly_stipend', 0) or 0)
        covers_dorm = bool(getattr(scholarship, 'covers_dorm', True))
        covers_tuition = bool(getattr(scholarship, 'covers_tuition', True))
        covers_insurance = bool(getattr(scholarship, 'covers_insurance', True))

        monthly_items = []

        if live_on_campus:
            if covers_dorm:
                rent_cost = 0.0
                rent_note = f"100% Free on-campus dormitory provided by scholarship (Value: ~{dorm_cost:.0f} RMB/mo)"
                is_rent_covered = True
            else:
                rent_cost = dorm_cost
                rent_note = f"On-campus student dormitory in {city_name}"
                is_rent_covered = False

            monthly_items.append({
                "id": "dorm_rent",
                "name": "University On-Campus Dormitory",
                "amount_cny": rent_cost,
                "amount_mad": round(rent_cost * cls.CNY_TO_MAD_RATE, 2),
                "is_covered": is_rent_covered,
                "note": rent_note,
            })
        else:
            rent_cost = offcampus_cost
            monthly_items.append({
                "id": "offcampus_rent",
                "name": f"Private Off-Campus Apartment Rental ({city_name})",
                "amount_cny": rent_cost,
                "amount_mad": round(rent_cost * cls.CNY_TO_MAD_RATE, 2),
                "is_covered": False,
                "note": f"Estimated single-room / studio rent in {city_name}",
            })

        # Food & transport
        monthly_items.append({
            "id": "food_transport",
            "name": f"Food, Campus Dining & Public Transit ({city_name})",
            "amount_cny": food_transport_cost,
            "amount_mad": round(food_transport_cost * cls.CNY_TO_MAD_RATE, 2),
            "is_covered": False,
            "note": "Standard university canteen meals & public metro/bus",
        })

        total_monthly_expenses_cny = round(rent_cost + food_transport_cost, 2)
        total_monthly_expenses_mad = round(total_monthly_expenses_cny * cls.CNY_TO_MAD_RATE, 2)

        monthly_balance_cny = round(monthly_stipend_cny - total_monthly_expenses_cny, 2)
        monthly_balance_mad = round(monthly_balance_cny * cls.CNY_TO_MAD_RATE, 2)
        monthly_balance_usd = round(monthly_balance_cny * cls.CNY_TO_USD_RATE, 2)

        is_surplus = monthly_balance_cny >= 0
        if is_surplus:
            status = "surplus"
            status_label = "Monthly Savings (Surplus)"
            status_description = (
                f"Your scholarship stipend fully covers your daily life with "
                f"+{monthly_balance_cny:.2f} CNY/month (+{monthly_balance_mad:.2f} MAD/month) in pocket savings."
            )
        else:
            status = "deficit"
            status_label = "Out-of-Pocket Monthly Support Needed"
            status_description = (
                f"You will need ~{abs(monthly_balance_cny):.2f} CNY/month "
                f"(~{abs(monthly_balance_mad):.2f} MAD/month) to cover remaining housing and living expenses."
            )

        return {
            "scholarship_id": getattr(scholarship, 'id', None),
            "scholarship_title": getattr(scholarship, 'title', ''),
            "university_name": uni_name,
            "city": city_name,
            "parameters": {
                "includeFlight": include_flight,
                "liveOnCampus": live_on_campus,
            },
            "financial_coverage": {
                "covers_tuition": covers_tuition,
                "covers_dorm": covers_dorm,
                "covers_flight": covers_flight,
                "covers_insurance": covers_insurance,
                "monthly_stipend_cny": monthly_stipend_cny,
                "monthly_stipend_mad": round(monthly_stipend_cny * cls.CNY_TO_MAD_RATE, 2),
                "application_fee_cny": app_fee_cny,
            },
            "upfront_out_of_pocket": {
                "total_cny": total_upfront_cny,
                "total_mad": total_upfront_mad,
                "total_usd": total_upfront_usd,
                "summary": f"{total_upfront_cny:,.2f} CNY (~{total_upfront_mad:,.2f} MAD / ~${total_upfront_usd:,.2f} USD)",
                "breakdown": upfront_items,
            },
            "monthly_living_balance": {
                "stipend_cny": monthly_stipend_cny,
                "stipend_mad": round(monthly_stipend_cny * cls.CNY_TO_MAD_RATE, 2),
                "total_expenses_cny": total_monthly_expenses_cny,
                "total_expenses_mad": total_monthly_expenses_mad,
                "balance_cny": monthly_balance_cny,
                "balance_mad": monthly_balance_mad,
                "balance_usd": monthly_balance_usd,
                "status": status,
                "status_label": status_label,
                "status_description": status_description,
                "living_mode": "On-Campus Dormitory" if live_on_campus else "Private Off-Campus Rental",
                "breakdown": monthly_items,
            },
            "city_baseline": {
                "city_name": city_name,
                "monthly_dorm_cost_cny": dorm_cost,
                "monthly_offcampus_rent_cny": offcampus_cost,
                "monthly_food_transport_cny": food_transport_cost,
            },
        }

