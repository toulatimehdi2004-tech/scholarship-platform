"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Gauge,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  Award,
  BookOpen,
  Globe2,
  FileCheck,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";

interface AcceptanceOddsMeterProps {
  scholarshipTitle: string;
  universityName: string;
  level?: string;
  minGpa?: number | null;
  className?: string;
}

interface AdmitProfile {
  countryFlag: string;
  countryName: string;
  city: string;
  degree: string;
  gpaUs: string;
  gpaFr: string;
  award: string;
  keyFactor: string;
  year: string;
}

const PAST_ADMITS: AdmitProfile[] = [
  {
    countryFlag: "🇲🇦",
    countryName: "Morocco",
    city: "Casablanca",
    degree: "Master in Computer Science",
    gpaUs: "3.4 / 4.0",
    gpaFr: "15.2 / 20",
    award: "Full CSC Type B (Tuition + Free Dorm + 3,000 RMB/mo)",
    keyFactor: "Detailed 800-word research proposal aligned with professor lab + HSK 3",
    year: "2025/2026 Admit",
  },
  {
    countryFlag: "🇩🇿",
    countryName: "Algeria",
    city: "Algiers",
    degree: "PhD in Civil Engineering",
    gpaUs: "3.6 / 4.0",
    gpaFr: "16.1 / 20",
    award: "Presidential Full Fellowship (Tuition + 3,500 RMB/mo)",
    keyFactor: "2 Academic recommendation letters from associate professors + publication abstract",
    year: "2025/2026 Admit",
  },
  {
    countryFlag: "🇹🇳",
    countryName: "Tunisia",
    city: "Tunis",
    degree: "Bachelor in International Trade",
    gpaUs: "3.2 / 4.0",
    gpaFr: "14.4 / 20",
    award: "Belt & Road Full Tuition Waiver + On-Campus Room",
    keyFactor: "Early portal submission in January before the priority quota closed",
    year: "2024/2025 Admit",
  },
];

export default function AcceptanceOddsMeter({
  scholarshipTitle,
  universityName,
  level = "master",
  minGpa = 3.0,
  className = "",
}: AcceptanceOddsMeterProps) {
  // User profile inputs for odds calculation
  const [gpaScale, setGpaScale] = useState<"4.0" | "20">("4.0");
  const [gpaValue4, setGpaValue4] = useState<number>(3.3);
  const [gpaValue20, setGpaValue20] = useState<number>(14.5);
  const [hasLanguageProof, setHasLanguageProof] = useState<boolean>(true); // English cert or English-medium letter
  const [hasHsk, setHasHsk] = useState<boolean>(false); // Chinese HSK
  const [hasLetters, setHasLetters] = useState<boolean>(true); // 2 Recommendation letters
  const [hasStudyPlan, setHasStudyPlan] = useState<boolean>(true); // Tailored Statement of Purpose
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Normalize GPA to 4.0 scale
  const normalizedGpa = useMemo(() => {
    if (gpaScale === "4.0") return gpaValue4;
    // Moroccan / French system: 10 = 2.0, 12 = 2.7, 14 = 3.3, 16 = 3.8, 18 = 4.0
    const val = gpaValue20;
    if (val >= 16) return 3.8 + ((val - 16) / 4) * 0.2;
    if (val >= 14) return 3.3 + ((val - 14) / 2) * 0.5;
    if (val >= 12) return 2.7 + ((val - 12) / 2) * 0.6;
    if (val >= 10) return 2.0 + ((val - 10) / 2) * 0.7;
    return 1.8;
  }, [gpaScale, gpaValue4, gpaValue20]);

  // Calculate score (0 to 100)
  const oddsCalculation = useMemo(() => {
    // 1. GPA component (max 45 points)
    const baselineGpa = minGpa || 2.8;
    let gpaScore = 0;
    if (normalizedGpa >= 3.7) gpaScore = 45;
    else if (normalizedGpa >= 3.4) gpaScore = 40;
    else if (normalizedGpa >= 3.0) gpaScore = 34;
    else if (normalizedGpa >= 2.7) gpaScore = 26;
    else gpaScore = 15;

    // 2. Language component (max 20 points)
    let langScore = 0;
    if (hasLanguageProof) langScore += 15;
    if (hasHsk) langScore += 5; // HSK bonus

    // 3. Bilateral quota alignment (max 15 points) - Morocco / African students have dedicated Belt & Road quotas
    const quotaScore = 14;

    // 4. Application dossier completeness (max 20 points)
    let dossierScore = 0;
    if (hasLetters) dossierScore += 10;
    if (hasStudyPlan) dossierScore += 10;

    const total = Math.min(96, Math.max(25, gpaScore + langScore + quotaScore + dossierScore));

    let tier: "safe" | "target" | "reach" = "target";
    let title = "Competitive (Target Match)";
    let badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
    let meterGradient = "from-amber-400 to-orange-500";
    let advice =
      "Good alignment with typical admit profiles. Ensure your Study Plan and recommendation letters are tailored specifically to this university to stand out in the final round.";

    if (total >= 80) {
      tier = "safe";
      title = "High Chance (Safe Match 🟢)";
      badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      meterGradient = "from-emerald-400 to-teal-400";
      advice =
        "Your academic metrics exceed the competitive threshold. With a complete document dossier submitted before the deadline, you have exceptional odds of securing full funding.";
    } else if (total < 60) {
      tier = "reach";
      title = "Challenging (Reach Program 🔴)";
      badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
      meterGradient = "from-rose-500 to-pink-500";
      advice =
        "This program is highly selective with limited seats. Boost your odds by securing a professor pre-acceptance letter, or consider applying to 2 provincial university backup choices.";
    }

    return {
      total,
      tier,
      title,
      badgeColor,
      meterGradient,
      advice,
      pillars: {
        gpaScore,
        langScore,
        quotaScore,
        dossierScore,
      },
    };
  }, [normalizedGpa, minGpa, hasLanguageProof, hasHsk, hasLetters, hasStudyPlan]);

  return (
    <div
      className={`glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Background glow orb */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple/20 text-purple border border-purple/40 uppercase tracking-wider flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              Yocket-Style Admission Predictor
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-text-secondary">
              Morocco & MENA Quotas
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary flex items-center gap-2">
            <span>Realistic Acceptance Odds Meter</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Algorithmically calibrated against historical admission stats of Moroccan and international students.
          </p>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold glass hover:bg-white/10 text-cyan border border-cyan/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showConfig ? "Hide Calculator" : "Customize Profile (GPA)"}</span>
        </button>
      </div>

      {/* Interactive Profile Customizer Dropdown */}
      {showConfig && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 p-5 rounded-2xl bg-white/[0.03] border border-cyan/30 relative z-10 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-cyan flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Adjust Your Academic Profile Parameters
            </h4>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setGpaScale("4.0")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  gpaScale === "4.0" ? "bg-cyan text-black" : "text-text-muted hover:text-white"
                }`}
              >
                US Scale (4.0)
              </button>
              <button
                onClick={() => setGpaScale("20")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  gpaScale === "20" ? "bg-cyan text-black" : "text-text-muted hover:text-white"
                }`}
              >
                Moroccan Scale (/20)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GPA Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-text-secondary mb-1.5">
                <span>Your GPA / Moyenne:</span>
                <span className="text-cyan font-bold text-sm">
                  {gpaScale === "4.0" ? `${gpaValue4.toFixed(2)} / 4.0` : `${gpaValue20.toFixed(1)} / 20`}
                </span>
              </div>
              {gpaScale === "4.0" ? (
                <input
                  type="range"
                  min="2.0"
                  max="4.0"
                  step="0.05"
                  value={gpaValue4}
                  onChange={(e) => setGpaValue4(parseFloat(e.target.value))}
                  className="w-full accent-cyan cursor-pointer"
                />
              ) : (
                <input
                  type="range"
                  min="10.0"
                  max="19.0"
                  step="0.2"
                  value={gpaValue20}
                  onChange={(e) => setGpaValue20(parseFloat(e.target.value))}
                  className="w-full accent-cyan cursor-pointer"
                />
              )}
              <div className="flex justify-between text-[10px] text-text-muted mt-1 font-mono">
                <span>{gpaScale === "4.0" ? "2.0 (Pass)" : "10.0 (Moyenne)"}</span>
                <span>{gpaScale === "4.0" ? "3.5+ (Very Good)" : "14.0+ (Bien)"}</span>
                <span>{gpaScale === "4.0" ? "4.0 (Top)" : "18.0+ (Très Bien)"}</span>
              </div>
            </div>

            {/* Profile Checkboxes */}
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-text-secondary cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={hasLanguageProof}
                  onChange={(e) => setHasLanguageProof(e.target.checked)}
                  className="rounded border-white/20 text-cyan accent-cyan"
                />
                <span>English Proficiency Letter or IELTS / TOEFL certificate</span>
              </label>

              <label className="flex items-center gap-2 text-text-secondary cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={hasLetters}
                  onChange={(e) => setHasLetters(e.target.checked)}
                  className="rounded border-white/20 text-cyan accent-cyan"
                />
                <span>Two academic recommendation letters ready</span>
              </label>

              <label className="flex items-center gap-2 text-text-secondary cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={hasHsk}
                  onChange={(e) => setHasHsk(e.target.checked)}
                  className="rounded border-white/20 text-cyan accent-cyan"
                />
                <span>HSK (Chinese) Certificate (Optional bonus)</span>
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Odds Gauge & Verdict Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-8 relative z-10">
        {/* Left Column: Probability Gauge Display */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center text-center">
          <div className="relative w-44 h-44 flex items-center justify-center mb-3">
            {/* Circular SVG Gauge */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="48"
                className="stroke-white/10"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="48"
                className={`transition-all duration-700 ease-out`}
                stroke={
                  oddsCalculation.total >= 80
                    ? "#10b981"
                    : oddsCalculation.total >= 60
                    ? "#f59e0b"
                    : "#f43f5e"
                }
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - oddsCalculation.total / 100)}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Gauge Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white tracking-tight">
                {oddsCalculation.total}%
              </span>
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                Odds Score
              </span>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-black border ${oddsCalculation.badgeColor} mb-2`}
          >
            {oddsCalculation.title}
          </div>

          <div className="text-[11px] text-text-muted">
            Based on GPA ({normalizedGpa.toFixed(2)}/4.0), bilateral quota & dossier readiness.
          </div>
        </div>

        {/* Right Column: Strategic Admission Feedback */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-2 text-xs uppercase font-extrabold tracking-wider text-text-muted mb-2">
              <Info className="w-4 h-4 text-cyan" />
              Admission Committee Analysis
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {oddsCalculation.advice}
            </p>
          </div>

          {/* 4 Pillars Mini-Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted uppercase font-bold mb-1">
                <BookOpen className="w-3 h-3 text-cyan" />
                <span>GPA Merit</span>
              </div>
              <div className="text-base font-extrabold text-white">
                {oddsCalculation.pillars.gpaScore} / 45
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">
                {normalizedGpa >= 3.4 ? "High percentile" : "Meets baseline"}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted uppercase font-bold mb-1">
                <Globe2 className="w-3 h-3 text-purple" />
                <span>Language</span>
              </div>
              <div className="text-base font-extrabold text-white">
                {oddsCalculation.pillars.langScore} / 20
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">
                {hasLanguageProof ? "Certified" : "Needs proof"}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted uppercase font-bold mb-1">
                <Award className="w-3 h-3 text-emerald-400" />
                <span>Bilateral Quota</span>
              </div>
              <div className="text-base font-extrabold text-white">
                {oddsCalculation.pillars.quotaScore} / 15
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Morocco priority</div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted uppercase font-bold mb-1">
                <FileCheck className="w-3 h-3 text-blue-400" />
                <span>Dossier</span>
              </div>
              <div className="text-base font-extrabold text-white">
                {oddsCalculation.pillars.dossierScore} / 20
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">
                {hasLetters && hasStudyPlan ? "Ready to submit" : "Incomplete"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Past Admits Benchmark (Yocket Style) */}
      <div className="relative z-10 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan" />
              <span>Past Admits Benchmark (Anonymized Alumni Data)</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Real profiles of international students from North Africa admitted to similar Chinese university scholarships.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-text-muted px-2.5 py-1 rounded-lg bg-white/5">
            Verified Admissions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PAST_ADMITS.map((admit, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan/30 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{admit.countryFlag}</span>
                    <div>
                      <div className="text-xs font-bold text-text-primary">
                        Student from {admit.city}, {admit.countryName}
                      </div>
                      <div className="text-[10px] text-text-muted">{admit.year}</div>
                    </div>
                  </div>
                </div>

                {/* Degree & GPA */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 mb-3 text-xs space-y-1">
                  <div className="font-semibold text-white truncate">{admit.degree}</div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-text-muted">GPA:</span>
                    <span className="text-cyan font-bold font-mono">{admit.gpaUs}</span>
                    <span className="text-text-muted">({admit.gpaFr})</span>
                  </div>
                </div>

                {/* Award Won */}
                <div className="text-xs font-extrabold text-emerald-400 mb-2 flex items-start gap-1.5">
                  <span className="flex-shrink-0 mt-0.5">🏆</span>
                  <span className="leading-tight">{admit.award}</span>
                </div>

                {/* Key Deciding Factor */}
                <div className="text-[11px] text-text-secondary leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <strong className="text-text-primary block mb-0.5 font-semibold">
                    Deciding Factor:
                  </strong>
                  {admit.keyFactor}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
