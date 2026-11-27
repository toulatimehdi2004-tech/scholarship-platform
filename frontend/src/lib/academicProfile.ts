/**
 * Academic Profile & Client-side Scholarship Match Evaluation
 * Mirrors the backend GpaConversionService & EligibilityService
 * Provides 0ms instant calculation as the student edits their GPA.
 */

import type { Scholarship } from "./api";

export type GpaScale = "SCALE_20" | "SCALE_100" | "SCALE_4";

export interface AcademicProfile {
  gpaRaw: string;
  gpaScale: GpaScale;
  currentDegree: "high_school" | "bachelor" | "master" | "phd";
  nationality: string;
  age: number;
  birthDate?: string;
  fieldOfStudy?: string;
  englishTestType?: "NONE" | "IELTS" | "TOEFL" | "DUOLINGO";
  englishScore?: number;
  hskLevel?: number;
}

export interface RuleEvaluation {
  id: string;
  title: string;
  passed: boolean;
  message: string;
  details?: string;
}

export interface MatchEvaluationResult {
  matchScore: number; // 0-100%
  isEligible: boolean;
  color: "green" | "orange" | "red";
  badgeLabel: string;
  rules: RuleEvaluation[];
  passedRules: string[];
  failedReasons: string[];
  normalizedGpa100: number;
}

const STORAGE_KEY = "scholar_academic_profile";
const PROFILE_UPDATED_EVENT = "scholar_academic_profile_updated";

export const DEFAULT_ACADEMIC_PROFILE: AcademicProfile = {
  gpaRaw: "15.0",
  gpaScale: "SCALE_20",
  currentDegree: "bachelor",
  nationality: "Morocco",
  age: 22,
  birthDate: "2004-06-15",
  fieldOfStudy: "Computer Science",
  englishTestType: "NONE",
  englishScore: 0,
  hskLevel: 0,
};

/**
 * Converts a raw GPA from /20, /100, or /4.0 into a 0-100 scale.
 */
export function convertGpaTo100(
  raw: string | number | undefined | null,
  scale: GpaScale = "SCALE_20"
): number {
  if (raw === undefined || raw === null) return 0;
  const str = String(raw).trim().replace(",", ".");
  if (!str) return 0;

  // Slash notation e.g. "16/20" or "3.8/4"
  if (str.includes("/")) {
    const [numStr, denStr] = str.split("/");
    const num = parseFloat(numStr);
    const den = parseFloat(denStr);
    if (!isNaN(num) && !isNaN(den) && den > 0) {
      return Math.round(Math.min(100, Math.max(0, (num / den) * 100)) * 10) / 10;
    }
  }

  const val = parseFloat(str);
  if (isNaN(val)) return 0;

  if (scale === "SCALE_20") {
    return Math.round(Math.min(100, Math.max(0, (val / 20) * 100)) * 10) / 10;
  }
  if (scale === "SCALE_4") {
    return Math.round(Math.min(100, Math.max(0, (val / 4) * 100)) * 10) / 10;
  }
  return Math.round(Math.min(100, Math.max(0, val)) * 10) / 10;
}

/**
 * Loads the student's academic profile from localStorage or user session.
 */
export function getAcademicProfile(): AcademicProfile {
  if (typeof window === "undefined") {
    return DEFAULT_ACADEMIC_PROFILE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ACADEMIC_PROFILE,
        ...parsed,
      };
    }

    // Fallback: extract from student_profile or user in localStorage
    const userStored = localStorage.getItem("user");
    if (userStored) {
      const u = JSON.parse(userStored);
      const sp = u.student_profile || {};
      let gpaScale: GpaScale = "SCALE_20";
      let gpaRaw = "";

      if (sp.gpa) {
        gpaRaw = String(sp.gpa);
        if (parseFloat(gpaRaw) <= 4.0) gpaScale = "SCALE_4";
        else if (parseFloat(gpaRaw) <= 20.0) gpaScale = "SCALE_20";
        else gpaScale = "SCALE_100";
      }

      let age = 22;
      if (sp.date_of_birth) {
        const birthYear = new Date(sp.date_of_birth).getFullYear();
        if (!isNaN(birthYear)) {
          age = new Date().getFullYear() - birthYear;
        }
      }

      let degree: "high_school" | "bachelor" | "master" | "phd" = "bachelor";
      const lvl = (sp.education_level || "").toLowerCase();
      if (lvl.includes("high") || lvl.includes("bac")) degree = "high_school";
      else if (lvl.includes("master") || lvl.includes("ing")) degree = "master";
      else if (lvl.includes("phd") || lvl.includes("doc")) degree = "phd";

      if (gpaRaw) {
        return {
          gpaRaw,
          gpaScale,
          currentDegree: degree,
          nationality: sp.country || "Morocco",
          age,
          birthDate: sp.date_of_birth,
          fieldOfStudy: sp.field_of_study || "",
          englishTestType: "NONE",
          englishScore: 0,
          hskLevel: 0,
        };
      }
    }
  } catch (err) {
    console.error("Error reading academic profile:", err);
  }

  return DEFAULT_ACADEMIC_PROFILE;
}

/**
 * Saves the academic profile and notifies all subscribers across the application.
 */
export function saveAcademicProfile(profile: AcademicProfile): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    // Also sync to user object if present
    const userStored = localStorage.getItem("user");
    if (userStored) {
      const u = JSON.parse(userStored);
      u.student_profile = {
        ...(u.student_profile || {}),
        gpa: parseFloat(profile.gpaRaw) || 0,
        education_level: profile.currentDegree,
        country: profile.nationality,
        field_of_study: profile.fieldOfStudy,
      };
      localStorage.setItem("user", JSON.stringify(u));
    }
  } catch (err) {
    console.error("Error saving academic profile:", err);
  }

  // Dispatch custom event for real-time reactivity
  window.dispatchEvent(
    new CustomEvent(PROFILE_UPDATED_EVENT, { detail: profile })
  );
}

/**
 * Subscribe to academic profile updates in any React component.
 */
export function onAcademicProfileUpdated(callback: (p: AcademicProfile) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent<AcademicProfile>;
    callback(custom.detail || getAcademicProfile());
  };
  window.addEventListener(PROFILE_UPDATED_EVENT, handler);
  return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
}

/**
 * Checks whether the user has customized their profile (or is still using unset default).
 */
export function hasCustomAcademicProfile(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(STORAGE_KEY));
}

/**
 * Evaluates a scholarship against the applicant's academic profile.
 * Computes matchScore (0-100%), isEligible, color code, and checkmarks/X breakdown.
 */
export function evaluateScholarshipMatch(
  scholarship: Scholarship,
  profile?: AcademicProfile
): MatchEvaluationResult {
  const p = profile || getAcademicProfile();
  const normalizedGpa = convertGpaTo100(p.gpaRaw, p.gpaScale);

  const rules: RuleEvaluation[] = [];
  const passedRules: string[] = [];
  const failedReasons: string[] = [];

  // ── 1. Degree Prerequisite Rule ──────────────────────────
  const schLevel = (scholarship.level || scholarship.target_degree || "all").toLowerCase();
  let degreePassed = true;
  let degreeMsg = "";

  if (schLevel === "phd") {
    if (p.currentDegree === "master" || p.currentDegree === "phd") {
      degreePassed = true;
      degreeMsg = "Eligible for PhD (Master's degree prerequisite met)";
    } else {
      degreePassed = false;
      degreeMsg = "PhD requires a completed Master's degree (applicant holds " + p.currentDegree + ")";
    }
  } else if (schLevel === "master") {
    if (p.currentDegree === "bachelor" || p.currentDegree === "master" || p.currentDegree === "phd") {
      degreePassed = true;
      degreeMsg = "Eligible for Master's degree (Bachelor prerequisite met)";
    } else {
      degreePassed = false;
      degreeMsg = "Master's requires a completed Bachelor's degree / Licence";
    }
  } else if (schLevel === "bachelor") {
    degreePassed = true;
    degreeMsg = "Eligible for Bachelor's degree (High School Baccalauréat met)";
  } else {
    // all / language / other
    degreePassed = true;
    degreeMsg = "Open to all degree levels (Bachelor, Master, PhD, & Language)";
  }

  rules.push({
    id: "degree",
    title: "Academic Degree Prerequisite",
    passed: degreePassed,
    message: degreeMsg,
  });
  if (degreePassed) passedRules.push(degreeMsg);
  else failedReasons.push(degreeMsg);

  // ── 2. Age Limit Rule ────────────────────────────────────
  let maxAge = scholarship.max_age;
  if (!maxAge) {
    if (schLevel === "bachelor") maxAge = 25;
    else if (schLevel === "master") maxAge = 35;
    else if (schLevel === "phd") maxAge = 40;
    else maxAge = 45;
  }

  const agePassed = p.age <= maxAge;
  const ageMsg = agePassed
    ? `Age requirement met (${p.age} years old ≤ max ${maxAge} years)`
    : `Age limit exceeded: Maximum age is ${maxAge} (applicant is ${p.age} years old)`;

  rules.push({
    id: "age",
    title: "Maximum Age Limit",
    passed: agePassed,
    message: ageMsg,
  });
  if (agePassed) passedRules.push(ageMsg);
  else failedReasons.push(ageMsg);

  // ── 3. Minimum GPA Threshold ─────────────────────────────
  let minGpa100 = scholarship.min_gpa_100;
  if (!minGpa100) {
    if (schLevel === "phd") minGpa100 = 75;
    else if (schLevel === "master") minGpa100 = 70;
    else if (schLevel === "bachelor") minGpa100 = 65;
    else minGpa100 = 55;
  }

  const gpaPassed = normalizedGpa >= minGpa100;
  const scaleDisplay =
    p.gpaScale === "SCALE_20" ? `${p.gpaRaw}/20` : p.gpaScale === "SCALE_4" ? `${p.gpaRaw}/4.0` : `${p.gpaRaw}%`;
  
  const gpaMsg = gpaPassed
    ? `GPA score meets threshold (${scaleDisplay} = ${normalizedGpa}/100, min required: ${minGpa100}/100)`
    : `GPA is below minimum: Requires ${minGpa100}/100 (applicant score is ${scaleDisplay} = ${normalizedGpa}/100)`;

  rules.push({
    id: "gpa",
    title: "Minimum Academic GPA",
    passed: gpaPassed,
    message: gpaMsg,
  });
  if (gpaPassed) passedRules.push(gpaMsg);
  else failedReasons.push(gpaMsg);

  // ── 4. Nationality / Country Eligibility ─────────────────
  let countryPassed = true;
  let countryMsg = `${p.nationality} is eligible for this scholarship`;

  const excluded = scholarship.excluded_countries || [];
  const eligible = scholarship.eligible_countries || [];

  const natLower = p.nationality.toLowerCase().trim();
  const isExcluded = excluded.some((c) => natLower.includes(c.toLowerCase()));
  if (isExcluded) {
    countryPassed = false;
    countryMsg = `${p.nationality} is in the excluded countries list`;
  } else if (eligible.length > 0) {
    const isEligible = eligible.some(
      (c) =>
        natLower.includes(c.toLowerCase()) ||
        c.toLowerCase().includes(natLower) ||
        (natLower === "morocco" && (c.toLowerCase() === "ma" || c.toLowerCase() === "maroc"))
    );
    if (!isEligible) {
      countryPassed = false;
      countryMsg = `${p.nationality} is not currently listed among partner eligible nations`;
    }
  }

  rules.push({
    id: "nationality",
    title: "Country / Nationality Eligibility",
    passed: countryPassed,
    message: countryMsg,
  });
  if (countryPassed) passedRules.push(countryMsg);
  else failedReasons.push(countryMsg);

  // ── 5. Overall Eligibility & Match Score Calculation ─────
  const isEligible = degreePassed && agePassed && gpaPassed && countryPassed;

  let matchScore = 0;
  if (isEligible) {
    // Base 65 for passing all hard requirements
    let score = 65;
    // GPA bonus: up to +25 points
    const gpaBuffer = normalizedGpa - minGpa100;
    if (gpaBuffer > 0) {
      score += Math.min(25, Math.round((gpaBuffer / 20) * 25));
    }
    // High distinction bonus for top GPAs
    if (normalizedGpa >= 85) score += 5;
    // Degree alignment bonus
    score += 4;
    matchScore = Math.min(99, Math.max(70, score));
  } else {
    // Ineligible: proportional to passed rules, capped strictly at 45%
    const passedCount = [degreePassed, agePassed, gpaPassed, countryPassed].filter(Boolean).length;
    matchScore = Math.round((passedCount / 4) * 45);
  }

  let color: "green" | "orange" | "red" = "green";
  let badgeLabel = `${matchScore}% Match`;

  if (isEligible && matchScore >= 80) {
    color = "green";
    badgeLabel = `${matchScore}% Match`;
  } else if (isEligible || matchScore >= 60) {
    color = "orange";
    badgeLabel = `${matchScore}% Match`;
  } else {
    color = "red";
    badgeLabel = isEligible ? `${matchScore}% Match` : `${matchScore}% Ineligible`;
  }

  return {
    matchScore,
    isEligible,
    color,
    badgeLabel,
    rules,
    passedRules,
    failedReasons,
    normalizedGpa100: normalizedGpa,
  };
}
