"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Award,
  GraduationCap,
  Building2,
  Languages,
  Check,
  Info,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import ScholarshipCard from "@/components/ScholarshipCard";
import SmartBack from "@/components/SmartBack";
import LanguageHonestySelector, {
  type LanguageProfile,
} from "@/components/LanguageHonestySelector";
import { fetchApi, type Scholarship } from "@/lib/api";
import { useLang } from "@/lib/i18n";

interface ApplyUniversity {
  id: number;
  name: string;
  website: string;
  country: string;
  city: string;
}

export default function ApplyClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { t, lang } = useLang();

  const [university, setUniversity] = useState<ApplyUniversity | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [languageProfile, setLanguageProfile] = useState<LanguageProfile>("beginner");
  const [hasConfirmedHonesty, setHasConfirmedHonesty] = useState(false);

  const uniId = params?.id;
  const targetedSchId = searchParams?.get("scholarshipId");

  useEffect(() => {
    if (!uniId) return;
    async function load() {
      setLoading(true);
      const [uniRes, schRes] = await Promise.all([
        fetchApi<ApplyUniversity>("/universities/" + uniId + "/"),
        fetchApi<Scholarship[]>("/scholarships/"),
      ]);
      if (uniRes.data) setUniversity(uniRes.data);
      if (schRes.data) {
        setScholarships(
          schRes.data.filter(
            (s) =>
              String(s.university) === String(uniId) ||
              (s as any).university?.id === Number(uniId)
          )
        );
      }
      setLoading(false);
    }
    load();
  }, [uniId]);

  const targetedScholarship = useMemo(() => {
    if (!targetedSchId || !scholarships.length) return null;
    return scholarships.find((s) => String(s.id) === String(targetedSchId)) || null;
  }, [targetedSchId, scholarships]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-3xl p-8 animate-pulse text-center max-w-sm w-full mx-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan/20 mx-auto mb-4 animate-spin" />
          <div className="h-5 bg-white/10 rounded w-48 mx-auto mb-3" />
          <div className="h-3.5 bg-white/10 rounded w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-3xl p-8 sm:p-12 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">{t("ud.notFound")}</h2>
          <p className="text-slate-400 text-xs mb-6">
            L'université demandée n'a pas pu être chargée ou n'existe pas.
          </p>
          <Link
            href="/scholarships"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan text-white text-xs font-bold shadow-lg"
          >
            {t("ud.backToSch")}
          </Link>
        </div>
      </div>
    );
  }

  const applyUrl =
    targetedScholarship?.application_link ||
    scholarships.find((s) => s.application_link)?.application_link ||
    university.website ||
    "#";

  const applicationSteps = [
    {
      step: 0,
      icon: <Languages className="w-5 h-5" />,
      title: lang === "ar" ? "التشخيص اللغوي والمالي" : "Diagnostic Linguistique & Financier",
      description:
        languageProfile === "beginner"
          ? lang === "ar"
            ? "مبتدئ: سنة اللغة مجانية فقط إذا ارتبطت بتخصص جامعي CSC (يجب اجتياز HSK 4 في 10 أشهر). أما سنة اللغة المنفردة فبدون منحة وتكلف ~40,000 درهم."
            : "Débutant : Année préparatoire 100% offerte si rattachée à un cursus diplômant CSC (HSK 4 requis en 10 mois). Année de langue seule sans diplôme = 100% payante (~40,000 DH/an)."
          : languageProfile === "hsk_holder"
          ? lang === "ar"
            ? "حامل HSK 3/4: مؤهل لمنحة معهد كونفوشيوس 100% مجاناً أو الدخول المباشر للسنة الأولى الجامعية دون سنة تحضيرية."
            : "Titulaire HSK 3/4 : Admissible à la Bourse Complète Confucius (CIS/CLEC) ou dispense d'année préparatoire pour entrée directe en 1ère année."
          : lang === "ar"
          ? "مسار إنجليزي 100%: 0 لغة صينية مطلوبة. بداية مباشرة في شتنبر بواسطة شهادة الإنجليزية من كليتك أو الآيلتس."
          : "Filière 100% Anglophone : 0 chinois requis. Rentrée directe en Septembre avec attestation d'anglais de faculté ou test IELTS.",
      color: "from-cyan to-blue-600",
      borderColor: "border-cyan/40",
      bgColor: "bg-cyan/10",
      highlight: true,
    },
    {
      step: 1,
      icon: <BookOpen className="w-5 h-5" />,
      title: t("ud.s1t"),
      description: t("ud.s1d", { name: university.name }),
      color: "from-blue-600 to-indigo-600",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/10",
    },
    {
      step: 2,
      icon: <FileText className="w-5 h-5" />,
      title: t("ud.s2t"),
      description: t("ud.s2d"),
      color: "from-purple to-pink-500",
      borderColor: "border-purple/30",
      bgColor: "bg-purple/10",
    },
    {
      step: 3,
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: t("ud.s3t"),
      description: t("ud.s3d"),
      color: "from-emerald-500 to-teal-500",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-500/10",
    },
    {
      step: 4,
      icon: <Send className="w-5 h-5" />,
      title: t("ud.s4t"),
      description: t("ud.s4d"),
      color: "from-amber-500 to-orange-500",
      borderColor: "border-amber-500/30",
      bgColor: "bg-amber-500/10",
    },
    {
      step: 5,
      icon: <Clock className="w-5 h-5" />,
      title: t("ud.s5t"),
      description: t("ud.s5d"),
      color: "from-blue to-purple",
      borderColor: "border-blue/30",
      bgColor: "bg-blue/10",
    },
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4"
        >
          <SmartBack
            fallback={uniId ? "/university/" + uniId : "/universities"}
            label={t("ud.back")}
          />

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transparence Garantie</span>
            </span>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────────────
            TARGETED SCHOLARSHIP BANNER (IF APPLIED FROM SPECIFIC SCHOLARSHIP)
        ───────────────────────────────────────────────────────────── */}
        {targetedScholarship && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900 border border-cyan/40 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan/20 border border-cyan/40 text-cyan flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan/20 text-cyan border border-cyan/40">
                    Bourse Ciblée
                  </span>
                  <span className="text-xs text-slate-400 font-bold uppercase">
                    • {targetedScholarship.level}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                  {targetedScholarship.title}
                </h2>
                <p className="text-xs text-slate-300">
                  {university.name} — {university.city}, {university.country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                {targetedScholarship.type.toUpperCase() === "FULL" ? "100% Complète" : "Partielle"}
              </span>
            </div>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MAIN APPLICATION HERO CARD
        ───────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-[#091122]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-3.5 pb-6 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan/20 flex-shrink-0">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {lang === "ar"
                  ? `دليل التقديم والشفافية المالية — ${university.name}`
                  : `Dépôt de Candidature & Transparence — ${university.name}`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {lang === "ar"
                  ? "اختر وضعك اللغوي الحقيقي لمعرفة التكاليف الدقيقة وشروط المنحة قبل الدخول للموقع الرسمي."
                  : "Chaque étudiant marocain a des droits et des coûts différents. Choisissez votre profil pour calculer votre budget réel."}
              </p>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 1: THE INTERACTIVE LANGUAGE HONESTY SELECTOR
          ───────────────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan/20 border border-cyan/40 text-cyan text-xs font-black flex items-center justify-center">
                0
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                {lang === "ar"
                  ? "الخطوة 0 : حدد وضعك اللغوي لحساب التكاليف الحقيقية"
                  : "Étape 0 : Déclarez votre Profil Linguistique & Calcul des Frais"}
              </h3>
            </div>

            {/* LanguageHonestySelector component */}
            <LanguageHonestySelector
              initialProfile={languageProfile}
              universityName={university.name}
              degreeLevel={targetedScholarship?.level || "bachelor"}
              onProfileChange={(p) => {
                setLanguageProfile(p);
                setHasConfirmedHonesty(false); // require re-check on profile change
              }}
            />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 2: HONESTY PACT & STUDENT CONFIRMATION CHECKBOX
          ───────────────────────────────────────────────────────────── */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/50 via-slate-900 to-[#091122] border border-cyan/30 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan/20 text-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">
                  {lang === "ar"
                    ? "ميثاق الشفافية والصدق المالي قبل التقديم"
                    : "Pacte de Transparence & Accord Préalable de Candidature"}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {languageProfile === "beginner" ? (
                    <>
                      Vous avez sélectionné le profil{" "}
                      <strong className="text-cyan">Débutant en Chinois</strong>. Vous confirmez
                      avoir compris : l'année préparatoire de chinois est 100% offerte par le CSC
                      si vous vous inscrivez en cursus diplômant complet (avec obligation de valider
                      le HSK 4 en 10 mois). En revanche, une année de langue seule sans diplôme n'a
                      pas de bourse complète et coûte environ <strong>40,000 DH/an</strong> à votre
                      charge.
                    </>
                  ) : languageProfile === "hsk_holder" ? (
                    <>
                      Vous avez sélectionné le profil{" "}
                      <strong className="text-emerald-400">Titulaire HSK 3 ou 4</strong>. Vous
                      confirmez être en possession de votre attestation officielle pour bénéficier
                      soit de la Bourse Confucius 100% gratuite (0 DH + 2,500 RMB/mois), soit de
                      l'entrée directe en 1ère année universitaire.
                    </>
                  ) : (
                    <>
                      Vous avez sélectionné le profil{" "}
                      <strong className="text-purple-300">Cursus 100% en Anglais</strong>. Aucun cours
                      de chinois préparatoire n'est exigé. Vous devez fournir une attestation d'anglais
                      délivrée par votre établissement marocain ou un score de test (IELTS / Duolingo).
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Checkbox agreement */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan/40 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={hasConfirmedHonesty}
                onChange={(e) => setHasConfirmedHonesty(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-white/30 text-cyan focus:ring-cyan bg-slate-900 cursor-pointer"
              />
              <div className="text-xs text-slate-200 leading-snug">
                <span className="font-black text-white block mb-0.5">
                  {lang === "ar"
                    ? "أشهد أنني اطلعت على التكاليف الحقيقية والشروط بدقة"
                    : "Je certifie avoir pris connaissance des conditions réelles et des coûts éventuels."}
                </span>
                {lang === "ar"
                  ? "أفهم تماماً ما تغطيه المنحة وما سأدفعه من مالي الخاص دون أي رسوم مخفية."
                  : "Aucun frais caché : j'ai vérifié ce qui est pris en charge et ce qui reste à ma charge selon mon choix."}
              </div>
            </label>

            {/* Action button unlocked by confirmation */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              {hasConfirmedHonesty ? (
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan to-blue-600 text-slate-950 font-black text-sm shadow-xl shadow-cyan/25 hover:opacity-95 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>
                    {lang === "ar"
                      ? `الانتقال إلى البوابة الرسمية لـ ${university.name}`
                      : `Accéder au Portail Officiel de ${university.name}`}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-950" />
                </a>
              ) : (
                <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-cyan" />
                  <span>Cochez la case ci-dessus pour débloquer l'accès au portail officiel</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Lien direct vers la plateforme officielle de dépôt</span>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 3: STEP-BY-STEP APPLICATION ROADMAP
          ───────────────────────────────────────────────────────────── */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-base sm:text-lg font-black text-white mb-6 flex items-center gap-2.5">
              <Send className="w-5 h-5 text-cyan" />
              <span>
                {lang === "ar"
                  ? "المراحل الرسمية للتقديم خطوة بخطوة"
                  : "Les 6 Étapes Officielles de Candidature"}
              </span>
            </h3>

            {/* Steps Timeline */}
            <div className="relative">
              <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-cyan via-purple to-amber-500 hidden sm:block" />

              <div className="space-y-4 sm:space-y-6">
                {applicationSteps.map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
                    className="relative flex gap-4 sm:gap-6"
                  >
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg font-black text-sm`}
                      >
                        {item.icon}
                      </div>
                    </div>

                    <div
                      className={`flex-1 rounded-2xl p-4 sm:p-5 border ${item.borderColor} bg-white/[0.02] hover:bg-white/[0.04] transition-all`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${item.bgColor} text-cyan uppercase tracking-wider border border-cyan/30`}
                        >
                          {lang === "ar" ? `المرحلة ${item.step}` : `Étape ${item.step}`}
                        </span>

                        {item.step === 0 && (
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Sélectionné</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <h4 className="text-xs sm:text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t("ud.quickTips")}</span>
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
              {[t("ud.tip1"), t("ud.tip2"), t("ud.tip3"), t("ud.tip4")].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 4: ALL AVAILABLE SCHOLARSHIPS AT THIS UNIVERSITY
        ───────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-cyan" />
              <span>
                {t("ud.available")} ({scholarships.length})
              </span>
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              {university.name}
            </span>
          </div>

          {scholarships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {scholarships.map((s, i) => (
                <ScholarshipCard key={s.id} scholarship={s} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-[#091122]/80 border border-white/10 p-10 text-center">
              <p className="text-slate-400 text-xs sm:text-sm">{t("ud.noSch")}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
