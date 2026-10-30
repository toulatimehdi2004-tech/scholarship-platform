"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Languages,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Banknote,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Check,
  ArrowRight,
  Info,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

export type LanguageProfile = "beginner" | "hsk_holder" | "english_track";

interface LanguageHonestySelectorProps {
  initialProfile?: LanguageProfile;
  degreeLevel?: string;
  universityName?: string;
  onProfileChange?: (profile: LanguageProfile) => void;
  className?: string;
}

export default function LanguageHonestySelector({
  initialProfile = "beginner",
  degreeLevel = "bachelor",
  universityName = "Université Chinoise",
  onProfileChange,
  className = "",
}: LanguageHonestySelectorProps) {
  const { lang } = useLang();
  const [selectedProfile, setSelectedProfile] = useState<LanguageProfile>(initialProfile);
  const [currency, setCurrency] = useState<"MAD" | "RMB">("MAD");

  const isBachelor = degreeLevel.toLowerCase() === "bachelor" || degreeLevel.toLowerCase() === "licence";
  const isMasterOrPhd = degreeLevel.toLowerCase() === "master" || degreeLevel.toLowerCase() === "phd";

  const handleSelect = (profile: LanguageProfile) => {
    setSelectedProfile(profile);
    if (onProfileChange) onProfileChange(profile);
  };

  const rmbToMad = (rmb: number) => Math.round(rmb * 1.38);
  const fmt = (rmb: number, suffix = "") => {
    if (currency === "MAD") return `${rmbToMad(rmb).toLocaleString()} DH${suffix}`;
    return `¥${rmb.toLocaleString()} RMB${suffix}`;
  };

  return (
    <div
      className={`rounded-3xl bg-[#091122]/95 border border-cyan/30 p-5 sm:p-7 shadow-2xl backdrop-blur-xl ${className}`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & EXPLANATION
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan/30 via-blue-600/30 to-purple/30 border border-cyan/40 text-cyan flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan/20">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan/20 text-cyan border border-cyan/40">
                {lang === "ar" ? "الشفافية اللغوية والمالية" : "Transparence Linguistique & Financière"}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                • {lang === "ar" ? "اختر وضعك الحقيقي" : "Sélectionnez votre situation réelle"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              {lang === "ar"
                ? "هل تملك شهادة لغة صينية أم تبدأ من الصفر ؟"
                : "Quel est votre niveau actuel en chinois pour cette candidature ?"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === "ar"
                ? "نحن نوضح لك الشروط الدقيقة والمصاريف الحقيقية حسب مستواك دون أي مفاجآت."
                : "Chaque profil a des règles et des coûts très différents. Cliquez sur votre profil pour voir vos droits réels :"}
            </p>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl flex-shrink-0 self-start sm:self-center">
          <button
            onClick={() => setCurrency("MAD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currency === "MAD" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            🇲🇦 Dirham
          </button>
          <button
            onClick={() => setCurrency("RMB")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currency === "RMB" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            🇨🇳 Yuan
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. THE 3 SELECTABLE SITUATION CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Profile 1: Complete Beginner (Zero Chinese) */}
        <button
          type="button"
          onClick={() => handleSelect("beginner")}
          className={`rounded-2xl p-4 sm:p-5 text-left border transition-all duration-300 relative cursor-pointer flex flex-col justify-between ${
            selectedProfile === "beginner"
              ? "bg-gradient-to-b from-blue-600/25 via-[#0e1d3d] to-[#091122] border-cyan shadow-xl shadow-cyan/20 ring-2 ring-cyan/40"
              : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🇨🇳</span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedProfile === "beginner" ? "border-cyan bg-cyan text-slate-950" : "border-white/30"
                }`}
              >
                {selectedProfile === "beginner" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
            <h4 className="text-sm font-black text-white">
              {lang === "ar" ? "أنا مبتدئ تماماً (صفر صينية)" : "Je pars de Zéro en chinois"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {lang === "ar"
                ? "ليس لدي أي شهادة HSK ولم أدرس اللغة الصينية من قبل."
                : "Aucun certificat HSK. Débutant complet qui souhaite étudier en Chine."}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <span className="text-[10px] font-black uppercase text-cyan block">
              {lang === "ar" ? "الحل المتاح لك ➔" : "Options & Conditions ➔"}
            </span>
          </div>
        </button>

        {/* Profile 2: HSK 3 / 4 Holder */}
        <button
          type="button"
          onClick={() => handleSelect("hsk_holder")}
          className={`rounded-2xl p-4 sm:p-5 text-left border transition-all duration-300 relative cursor-pointer flex flex-col justify-between ${
            selectedProfile === "hsk_holder"
              ? "bg-gradient-to-b from-emerald-600/25 via-[#0b241c] to-[#091122] border-emerald-400 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/40"
              : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">📜</span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedProfile === "hsk_holder" ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-white/30"
                }`}
              >
                {selectedProfile === "hsk_holder" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
            <h4 className="text-sm font-black text-white">
              {lang === "ar" ? "لدي شهادة HSK 3 أو HSK 4" : "J'ai déjà le HSK 3 ou HSK 4"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {lang === "ar"
                ? "درست بمعهد كونفوشيوس بالمغرب ولدي شهادة رسمية سارية."
                : "Étudié à l'Institut Confucius (Rabat, Casa, Tanger) avec score officiel."}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <span className="text-[10px] font-black uppercase text-emerald-400 block">
              {lang === "ar" ? "أولوية البورصات الكاملة ➔" : "Bourse Confucius 100% ➔"}
            </span>
          </div>
        </button>

        {/* Profile 3: 100% English Taught Track */}
        <button
          type="button"
          onClick={() => handleSelect("english_track")}
          className={`rounded-2xl p-4 sm:p-5 text-left border transition-all duration-300 relative cursor-pointer flex flex-col justify-between ${
            selectedProfile === "english_track"
              ? "bg-gradient-to-b from-purple-600/25 via-[#21123a] to-[#091122] border-purple-400 shadow-xl shadow-purple-500/20 ring-2 ring-purple-500/40"
              : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🇬🇧</span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedProfile === "english_track" ? "border-purple-400 bg-purple-400 text-slate-950" : "border-white/30"
                }`}
              >
                {selectedProfile === "english_track" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
            <h4 className="text-sm font-black text-white">
              {lang === "ar" ? "سأدرس 100% بالإنجليزية" : "Je veux étudier en Anglais"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {lang === "ar"
                ? "لا أحتاج سنة لغة صينية، أريد بدء تخصصي الجامعي بالإنجليزية فوراً."
                : "Programmes internationaux dispensés en anglais. Pas d'année de chinois."}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <span className="text-[10px] font-black uppercase text-purple-300 block">
              {lang === "ar" ? "مباشرة بدون سنة لغة ➔" : "Direct Degree Track ➔"}
            </span>
          </div>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. DYNAMIC EXPLANATION & EXACT BUDGET BASED ON CHOICE
      ───────────────────────────────────────────────────────────── */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {/* ── CASE 1: BEGINNER (ZERO CHINESE) ── */}
          {selectedProfile === "beginner" && (
            <motion.div
              key="beginner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl bg-blue-950/40 border border-blue-500/30 p-5 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🇨🇳</span>
                <h4 className="text-sm sm:text-base font-black text-white">
                  {lang === "ar"
                    ? "التحليل المالي الصادق إذا كنت مبتدئاً (بدون HSK) :"
                    : "Diagnostic Officiel : Vous partez de zéro en chinois"}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Degree Track with Free Foundation */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-black text-emerald-300">
                      Option A : Cursus Diplômant CSC (Licence / Master / PhD)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Si vous postulez à un cursus complet en chinois, le gouvernement vous accorde{" "}
                    <strong className="text-white">l'Année Préparatoire Gratuite (CSC Foundation Year)</strong>.
                  </p>
                  <ul className="mt-2.5 space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-center gap-1.5 text-emerald-300 font-bold">
                      ✓ Frais de cours de langue : 0 DH (100% Exonérés)
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-300 font-bold">
                      ✓ Dortoir sur campus : 0 DH (Gratuit)
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-300 font-bold">
                      ✓ Argent de poche mensuel : {fmt(2500, "/mois")} (Licence) ou {fmt(3000, "/mois")} (Master) versés chaque mois
                    </li>
                    <li className="flex items-start gap-1.5 text-amber-300 font-semibold pt-1">
                      ⚠️ Condition obligatoire : Vous devez impérativement valider le test HSK 4 en fin d'année pour commencer vos cours de spécialité.
                    </li>
                  </ul>
                </div>

                {/* Standalone Language Year (No degree) */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-xs font-black text-amber-300">
                      Option B : 1 An de Langue Seule (Sans Cursus Universitaire)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Si vous voulez partir faire <strong className="text-white">uniquement 1 an de langue</strong> sans vous inscrire en licence :
                  </p>
                  <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-300">
                    <p className="font-bold text-amber-200">
                      ⚠️ Aucune bourse d'État complète n'existe pour un débutant complet voulant faire de la langue seule !
                    </p>
                    <p className="mt-1">
                      Coût réel officiel à payer à l'université :
                    </p>
                    <ul className="mt-1 space-y-1 font-semibold text-white">
                      <li>• Frais de cours : ~{fmt(15000, "/an")}</li>
                      <li>• Dortoir campus : ~{fmt(10000, "/an")}</li>
                      <li>• Nourriture au resto U : ~{fmt(15000, "/an")}</li>
                      <li className="text-amber-300 font-bold pt-1">
                        Budget total réel : ~{fmt(40000, "/an")} tout compris.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── CASE 2: HSK 3 / 4 HOLDER ── */}
          {selectedProfile === "hsk_holder" && (
            <motion.div
              key="hsk_holder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl bg-emerald-950/40 border border-emerald-500/40 p-5 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📜</span>
                <h4 className="text-sm sm:text-base font-black text-white">
                  {lang === "ar"
                    ? "ممتاز ! شهادة HSK 3 أو HSK 4 تفتح لك الأبواب الذهبية :"
                    : "Excellent ! Votre certificat HSK vous donne accès aux bourses directes :"}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-emerald-500/30">
                  <span className="text-xs font-black text-emerald-300 block mb-1">
                    1. Bourse Institut Confucius CIS (1 An de Langue 100% Gratuite)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Vous êtes admissible à la bourse d'immersion linguistique du CLEC :
                  </p>
                  <ul className="mt-2 space-y-1 text-[11px] text-emerald-300 font-bold">
                    <li>✓ Frais de scolarité : 0 DH (Offert à 100%)</li>
                    <li>✓ Logement international : 0 DH (Offert)</li>
                    <li>✓ Allocation mensuelle : {fmt(2500, "/mois")} versés sur votre compte</li>
                    <li>✓ Assurance maladie : Incluse (800 RMB/an)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-cyan/30">
                  <span className="text-xs font-black text-cyan block mb-1">
                    2. Entrée Directe en Licence / Master (Sans Perdre 1 An)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Grâce à votre HSK 4, vous n'avez pas besoin d'année préparatoire : vous entrez directement en 1ère année de spécialité (Médecine, Ingénierie, Commerce, IA) sous Bourse Complète CSC !
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── CASE 3: 100% ENGLISH TAUGHT ── */}
          {selectedProfile === "english_track" && (
            <motion.div
              key="english_track"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl bg-purple-950/40 border border-purple-500/40 p-5 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🇬🇧</span>
                <h4 className="text-sm sm:text-base font-black text-white">
                  {lang === "ar"
                    ? "المسار الإنجليزي 100% (بدون لغة صينية) :"
                    : "Cursus Anglophone International : 0 Chinois Requis"}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-purple-500/30">
                  <span className="text-xs font-black text-purple-300 block mb-1">
                    Avantages du Parcours Anglophone
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-center gap-1.5 font-bold text-white">
                      ✓ Aucun cours préparatoire de chinois obligatoire
                    </li>
                    <li className="flex items-center gap-1.5">
                      ✓ Début direct des cours universitaires en Septembre
                    </li>
                    <li className="flex items-center gap-1.5">
                      ✓ Diplôme international 100% en langue anglaise
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-xs font-black text-slate-200 block mb-1">
                    Ce que vous devez fournir pour l'anglais :
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    <li>• Attestation de langue anglaise délivrée par votre lycée/faculté marocaine</li>
                    <li>• OU score officiel : IELTS 6.0+, TOEFL iBT 80+, ou Duolingo 105+</li>
                    <li>• Les bacheliers scientifiques marocains (Sciences Maths, PC, SVT) sont acceptés avec attestation d'anglais</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
