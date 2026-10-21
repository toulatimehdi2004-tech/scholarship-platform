"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Gauge,
  Sliders,
  Award,
  BookOpen,
  Globe2,
  FileCheck,
  Info,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

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

export default function AcceptanceOddsMeter({
  scholarshipTitle,
  universityName,
  level = "master",
  minGpa = 3.0,
  className = "",
}: AcceptanceOddsMeterProps) {
  const { t, lang } = useLang();

  // User profile inputs for odds calculation
  const [gpaScale, setGpaScale] = useState<"4.0" | "20">("4.0");
  const [gpaValue4, setGpaValue4] = useState<number>(3.3);
  const [gpaValue20, setGpaValue20] = useState<number>(14.5);
  const [hasLanguageProof, setHasLanguageProof] = useState<boolean>(true); // English cert or English-medium letter
  const [hasHsk, setHasHsk] = useState<boolean>(false); // Chinese HSK
  const [hasLetters, setHasLetters] = useState<boolean>(true); // 2 Recommendation letters
  const [hasStudyPlan, setHasStudyPlan] = useState<boolean>(true); // Tailored Statement of Purpose
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const pastAdmits: AdmitProfile[] = [
    {
      countryFlag: "🇲🇦",
      countryName: lang === "ar" ? "المغرب" : lang === "fr" ? "Maroc" : "Morocco",
      city: lang === "ar" ? "الدار البيضاء" : "Casablanca",
      degree:
        lang === "ar"
          ? "ماستر في علوم الحاسوب والذكاء الاصطناعي"
          : lang === "fr"
          ? "Master en Informatique & IA"
          : "Master in Computer Science & AI",
      gpaUs: "3.4 / 4.0",
      gpaFr: "15.2 / 20",
      award:
        lang === "ar"
          ? "منحة CSC الكاملة Type B (إعفاء الرسوم + سكن + 3,000 يوان/شهرياً)"
          : lang === "fr"
          ? "Bourse Complète CSC Type B (Scolarité + Logement + 3,000 RMB/mois)"
          : "Full CSC Type B (Tuition + Free Dorm + 3,000 RMB/mo)",
      keyFactor:
        lang === "ar"
          ? "خطة بحثية متقنة من 800 كلمة موجهة لمختبر الأستاذ + شهادة HSK 3"
          : lang === "fr"
          ? "Projet de recherche de 800 mots aligné avec le laboratoire du professeur + HSK 3"
          : "Detailed 800-word research proposal aligned with professor lab + HSK 3",
      year: lang === "ar" ? "مقبول 2025/2026" : "2025/2026 Admit",
    },
    {
      countryFlag: "🇩🇿",
      countryName: lang === "ar" ? "الجزائر" : lang === "fr" ? "Algérie" : "Algeria",
      city: lang === "ar" ? "الجزائر العاصمة" : "Alger",
      degree:
        lang === "ar"
          ? "دكتوراه في الهندسة المدنية"
          : lang === "fr"
          ? "Doctorat en Génie Civil"
          : "PhD in Civil Engineering",
      gpaUs: "3.6 / 4.0",
      gpaFr: "16.1 / 20",
      award:
        lang === "ar"
          ? "منحة الرئاسة الجامعية الكاملة (إعفاء + 3,500 يوان/شهرياً)"
          : lang === "fr"
          ? "Bourse Présidentielle Complète (Scolarité + 3,500 RMB/mois)"
          : "Presidential Full Fellowship (Tuition + 3,500 RMB/mo)",
      keyFactor:
        lang === "ar"
          ? "رسالتا توصية قوية من أساتذة جامعيين + ملخص مقال علمي منشور"
          : lang === "fr"
          ? "2 lettres de recommandation d'enseignants-chercheurs + résumé d'article publié"
          : "2 Academic recommendation letters from associate professors + publication abstract",
      year: lang === "ar" ? "مقبول 2025/2026" : "2025/2026 Admit",
    },
    {
      countryFlag: "🇹🇳",
      countryName: lang === "ar" ? "تونس" : lang === "fr" ? "Tunisie" : "Tunisia",
      city: lang === "ar" ? "تونس" : "Tunis",
      degree:
        lang === "ar"
          ? "بكالوريوس في التجارة والاقتصاد الدولي"
          : lang === "fr"
          ? "Licence en Commerce International"
          : "Bachelor in International Trade",
      gpaUs: "3.2 / 4.0",
      gpaFr: "14.4 / 20",
      award:
        lang === "ar"
          ? "منحة طريق الحرير (إعفاء كامل من الرسوم + سكن بالحرم الجامعي)"
          : lang === "fr"
          ? "Bourse Route de la Soie (Exonération Scolarité + Chambre sur Campus)"
          : "Belt & Road Full Tuition Waiver + On-Campus Room",
      keyFactor:
        lang === "ar"
          ? "التقديم المبكر عبر البوابة في يناير قبل اكتمال الحصة التفضيلية"
          : lang === "fr"
          ? "Dépôt précoce du dossier en janvier avant la clôture du quota prioritaire"
          : "Early portal submission in January before the priority quota closed",
      year: lang === "ar" ? "مقبول 2024/2025" : "2024/2025 Admit",
    },
  ];

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
    let title = t("odds.targetMatch");
    let badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
    let meterGradient = "from-amber-400 to-orange-500";
    let advice = t("odds.targetAdvice");

    if (total >= 80) {
      tier = "safe";
      title = t("odds.safeMatch");
      badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      meterGradient = "from-emerald-400 to-teal-400";
      advice = t("odds.safeAdvice");
    } else if (total < 60) {
      tier = "reach";
      title = t("odds.reachMatch");
      badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
      meterGradient = "from-rose-500 to-pink-500";
      advice = t("odds.reachAdvice");
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
  }, [normalizedGpa, hasLanguageProof, hasHsk, hasLetters, hasStudyPlan, t]);

  return (
    <div
      className={`glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Background glow orb */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple/20 text-purple border border-purple/40 uppercase tracking-wider flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              {t("odds.predictorBadge")}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-text-secondary">
              {t("odds.quotaBadge")}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary flex items-center gap-2">
            <span>{t("odds.title")}</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            {t("odds.subtitle")}
          </p>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold glass hover:bg-white/10 text-cyan border border-cyan/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showConfig ? t("odds.hideCalc") : t("odds.customizeProfile")}</span>
        </button>
      </div>

      {/* Interactive Profile Customizer Dropdown */}
      {showConfig && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 p-5 rounded-2xl bg-white/[0.03] border border-cyan/30 relative z-10 space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-cyan flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              {t("odds.adjustParams")}
            </h4>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setGpaScale("4.0")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  gpaScale === "4.0" ? "bg-cyan text-black" : "text-text-muted hover:text-white"
                }`}
              >
                {t("odds.usScale")}
              </button>
              <button
                onClick={() => setGpaScale("20")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  gpaScale === "20" ? "bg-cyan text-black" : "text-text-muted hover:text-white"
                }`}
              >
                {t("odds.moroccanScale")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GPA Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-text-secondary mb-1.5">
                <span>{t("odds.yourGpa")}</span>
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
                <span>{gpaScale === "4.0" ? "2.0 (Pass)" : "10.0 (Passable)"}</span>
                <span>{gpaScale === "4.0" ? "3.5+ (Very Good)" : "14.0+ (Bien)"}</span>
                <span>{gpaScale === "4.0" ? "4.0 (Top)" : "18.0+ (Très Bien)"}</span>
              </div>
            </div>

            {/* Profile Checkboxes */}
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-text-secondary cursor-pointer hover:text-text-primary">
                <input
                  type="checkbox"
                  checked={hasLanguageProof}
                  onChange={(e) => setHasLanguageProof(e.target.checked)}
                  className="rounded border-white/20 text-cyan accent-cyan"
                />
                <span>{t("odds.englishCert")}</span>
              </label>

              <label className="flex items-center gap-2 text-text-secondary cursor-pointer hover:text-text-primary">
                <input
                  type="checkbox"
                  checked={hasLetters}
                  onChange={(e) => setHasLetters(e.target.checked)}
                  className="rounded border-white/20 text-cyan accent-cyan"
                />
                <span>{t("odds.recomLetters")}</span>
              </label>

              <label className="flex items-center gap-2 text-text-secondary cursor-pointer hover:text-text-primary">
                <input
                  type="checkbox"
                  checked={hasHsk}
                  onChange={(e) => setHasHsk(e.target.checked)}
                  className="rounded border-white/20 text-cyan accent-cyan"
                />
                <span>{t("odds.hskCert")}</span>
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
                className="transition-all duration-700 ease-out"
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
              <span className="text-4xl font-black text-text-primary tracking-tight">
                {oddsCalculation.total}%
              </span>
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                {t("odds.predictedOdds")}
              </span>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-black border ${oddsCalculation.badgeColor} mb-2`}
          >
            {oddsCalculation.title}
          </div>

          <div className="text-[11px] text-text-muted">
            GPA: {normalizedGpa.toFixed(2)}/4.0
          </div>
        </div>

        {/* Right Column: Strategic Admission Feedback */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-2 text-xs uppercase font-extrabold tracking-wider text-text-muted mb-2">
              <Info className="w-4 h-4 text-cyan" />
              <span>{t("odds.scorePillars")}</span>
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
                <span className="truncate">{t("odds.gpaWeight")}</span>
              </div>
              <div className="text-base font-extrabold text-text-primary">
                {oddsCalculation.pillars.gpaScore} / 45
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted uppercase font-bold mb-1">
                <Globe2 className="w-3 h-3 text-purple" />
                <span className="truncate">{t("odds.langWeight")}</span>
              </div>
              <div className="text-base font-extrabold text-text-primary">
                {oddsCalculation.pillars.langScore} / 20
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted uppercase font-bold mb-1">
                <Award className="w-3 h-3 text-emerald-400" />
                <span className="truncate">{t("odds.quotaWeight")}</span>
              </div>
              <div className="text-base font-extrabold text-text-primary">
                {oddsCalculation.pillars.quotaScore} / 15
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted uppercase font-bold mb-1">
                <FileCheck className="w-3 h-3 text-blue-400" />
                <span className="truncate">{t("odds.dossierWeight")}</span>
              </div>
              <div className="text-base font-extrabold text-text-primary">
                {oddsCalculation.pillars.dossierScore} / 20
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Past Admits Benchmark */}
      <div className="relative z-10 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan" />
              <span>{t("odds.pastAdmits")}</span>
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pastAdmits.map((admit, idx) => (
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
                        {admit.city}, {admit.countryName}
                      </div>
                      <div className="text-[10px] text-text-muted">{admit.year}</div>
                    </div>
                  </div>
                </div>

                {/* Degree & GPA */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 mb-3 text-xs space-y-1">
                  <div className="font-semibold text-text-primary truncate">{admit.degree}</div>
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
                <div className="text-[11px] text-text-secondary leading-relaxed bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
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
