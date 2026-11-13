"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Crown,
  FileCheck2,
  Headphones,
  Check,
  Zap,
} from "lucide-react";
import { useApplicationMode, type ApplicationMode } from "@/lib/ApplicationModeContext";
import { useLang } from "@/lib/i18n";

interface ApplicationChoiceBarProps {
  variant?: "segmented" | "banner";
  className?: string;
  onModeSelect?: (mode: ApplicationMode) => void;
}

export default function ApplicationChoiceBar({
  variant = "segmented",
  className = "",
  onModeSelect,
}: ApplicationChoiceBarProps) {
  const { mode, setMode } = useApplicationMode();
  const { lang } = useLang();

  const handleSelect = (selectedMode: ApplicationMode) => {
    setMode(selectedMode);
    if (onModeSelect) onModeSelect(selectedMode);
  };

  /* ─────────────────────────────────────────────────────────────
      VARIANT 1: SEGMENTED CONTROL CAPSULE (Header & Compact)
  ───────────────────────────────────────────────────────────── */
  if (variant === "segmented") {
    return (
      <div
        className={`w-full max-w-2xl mx-auto p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-1.5 relative select-none ${className}`}
      >
        {/* Option 1: Self-Apply */}
        <button
          type="button"
          onClick={() => handleSelect("self")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all relative z-10 cursor-pointer ${
            mode === "self"
              ? "text-white shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          {mode === "self" && (
            <motion.div
              layoutId="choiceBarIndicator"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 shadow-md shadow-blue-500/25 -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <User className="w-4 h-4 text-cyan flex-shrink-0" />
          <span className="truncate">
            {lang === "ar"
              ? "التقديم الذاتي (أقدم بنفسي)"
              : lang === "fr"
              ? "Candidature Autonome (Je postule moi-même)"
              : "Self-Apply (I Apply Myself)"}
          </span>
        </button>

        {/* Option 2: We Apply For You */}
        <button
          type="button"
          onClick={() => handleSelect("assisted")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all relative z-10 cursor-pointer ${
            mode === "assisted"
              ? "text-white shadow-lg"
              : "text-amber-300 hover:text-white hover:bg-white/5"
          }`}
        >
          {mode === "assisted" && (
            <motion.div
              layoutId="choiceBarIndicator"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 shadow-md shadow-amber-500/30 -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow flex-shrink-0" />
          <span className="truncate">
            {lang === "ar"
              ? "نحن نقدّم لك (خدمة التكفل)"
              : lang === "fr"
              ? "On Postule Pour Vous (Délégation)"
              : "We Apply For You (Assisted)"}
          </span>
          <span className="hidden sm:inline-block text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-black bg-white/20 text-white">
            {lang === "ar" ? "مضمون" : "VIP"}
          </span>
        </button>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
      VARIANT 2: INTERACTIVE BANNER / CHOICE CARDS (Full Hero)
  ───────────────────────────────────────────────────────────── */
  return (
    <div className={`w-full max-w-5xl mx-auto my-4 space-y-3 ${className}`}>
      {/* Top Banner Tagline */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            {lang === "ar"
              ? "اختر طريقة التقديم المناسبة لك:"
              : lang === "fr"
              ? "Choisissez Votre Méthode de Candidature :"
              : "Choose Your Preferred Application Path:"}
          </span>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          {lang === "ar"
            ? "يمكنك التبديل بين الخيارين في أي وقت"
            : "Vous pouvez basculer entre les deux à tout moment"}
        </span>
      </div>

      {/* Two Choice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: Self-Apply (التقديم الذاتي) */}
        <div
          onClick={() => handleSelect("self")}
          className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-300 cursor-pointer border flex flex-col justify-between overflow-hidden group ${
            mode === "self"
              ? "bg-[#0d172e] border-blue-500/60 shadow-[0_0_30px_rgba(37,99,235,0.22)] ring-1 ring-blue-500/40"
              : "bg-slate-900/60 border-white/10 hover:border-blue-500/30 hover:bg-slate-900/80"
          }`}
        >
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header row */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>

              {mode === "self" ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span>{lang === "ar" ? "الوضع النشط حالياً" : "Mode Actif"}</span>
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">
                  {lang === "ar" ? "مجاني 100%" : "100% Autonome"}
                </span>
              )}
            </div>

            {/* Title & Tagline */}
            <h3 className="text-base sm:text-lg font-black text-white mb-1.5 flex items-center gap-2">
              <span>
                {lang === "ar"
                  ? "التقديم الذاتي (أنا سأقدم بنفسي)"
                  : lang === "fr"
                  ? "Candidature Autonome (Je postule moi-même)"
                  : "Self-Apply (Apply Independently)"}
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {lang === "ar"
                ? "تصفح كتالوج المنح، استكشف الجامعات والمدن الصينية، واستخدم أدوات الفلترة والتقديم المباشر لبوابات الجامعات والـ CSC بنفسك."
                : lang === "fr"
                ? "Explorez le catalogue des bourses CSC et universités chinoises, et déposez vos dossiers directement auprès des facultés par vous-même."
                : "Explore scholarships, compare Chinese universities, and handle your university & CSC applications independently."}
            </p>

            {/* Feature Checkpoints */}
            <ul className="space-y-2 mb-5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>
                  {lang === "ar"
                    ? "تصفح أكثر من 400 منحة و 100 جامعة صينية"
                    : "Accès à plus de 400 bourses et 100 universités"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>
                  {lang === "ar"
                    ? "أكواد الوكالة الرسمية (Agency Numbers) وروابط البوابات"
                    : "Agency Numbers officiels et liens directs de soumission"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>
                  {lang === "ar"
                    ? "محاكي CSCA ودليل الفحص الطبي ومراحل التأشيرة"
                    : "Simulateur CSCA & guides de visite médicale"}
                </span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400">
              {mode === "self"
                ? lang === "ar"
                  ? "أنت تتصفح المنح حالياً ➔"
                  : "Catalogue des Bourses Actif ➔"
                : lang === "ar"
                ? "اختيار التقديم الذاتي"
                : "Basculer en Mode Autonome"}
            </span>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                mode === "self"
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-slate-400 group-hover:bg-blue-600 group-hover:text-white"
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5 rtl-flip" />
            </div>
          </div>
        </div>

        {/* CARD 2: We Apply For You (نحن نتكفل بالتقديم لك) */}
        <div
          onClick={() => handleSelect("assisted")}
          className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-300 cursor-pointer border flex flex-col justify-between overflow-hidden group ${
            mode === "assisted"
              ? "bg-[#231508]/85 border-amber-500/70 shadow-[0_0_35px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50"
              : "bg-slate-900/60 border-amber-500/30 hover:border-amber-400/60 hover:bg-slate-900/80"
          }`}
        >
          {/* Subtle Amber Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header row with VIP badge */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Sparkles className="w-5 h-5 text-amber-100" />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm">
                  {lang === "ar" ? "⭐ الأكثر طلباً" : "⭐ Recommandé"}
                </span>
                {mode === "assisted" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {lang === "ar" ? "نشط" : "Actif"}
                  </span>
                )}
              </div>
            </div>

            {/* Title & Tagline */}
            <h3 className="text-base sm:text-lg font-black text-white mb-1.5 flex items-center gap-2">
              <span>
                {lang === "ar"
                  ? "نحن نقدّم لك (خدمة التكفل والضمان)"
                  : lang === "fr"
                  ? "Délégation Complète (On postule pour vous)"
                  : "We Apply For You (Full Concierge)"}
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {lang === "ar"
                ? "لا تضيع وقتك في الإجراءات المعقدة! مستشارونا المعتمدون يتكفلون بملفك، الترجمة المحلفة للصينية، التقديم، ومتابعة لجنة القبول ببكين حتى استلام القبول الرسمي."
                : lang === "fr"
                ? "Déléguez tout à notre équipe agréée : traduction assermentée, préparation du dossier, soumission auprès de nos universités partenaires et garantie d'admission."
                : "Let our specialized admissions team handle your full application, sworn Mandarin translation, university submissions, and guaranteed acceptance letters."}
            </p>

            {/* Feature Checkpoints */}
            <ul className="space-y-2 mb-5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="font-semibold text-amber-200">
                  {lang === "ar"
                    ? "ضمان القبول الجامعي 100% أو استرجاع الرسوم"
                    : "Garantie d'admission 100% ou remboursement intégral"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>
                  {lang === "ar"
                    ? "الترجمة المحلفة إلى الصينية والتصديق القنصلي شامل"
                    : "Traduction assermentée en mandarin et légalisation incluses"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>
                  {lang === "ar"
                    ? "صياغة احترافية لخطاب الدوافع (SOP) ورسائل التوصية"
                    : "Rédaction sur-mesure du projet d'étude (SOP) et recommandations"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>
                  {lang === "ar"
                    ? "مستشار شخصي مغربي يواكبك في الرباط وبكين"
                    : "Conseiller dédié basé au Maroc et en Chine"}
                </span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">
              {mode === "assisted"
                ? lang === "ar"
                  ? "صفحة الخدمة المدارة نشطة ➔"
                  : "Espace Délégation Actif ➔"
                : lang === "ar"
                ? "دعنا نتكفل بملفك ونضمن قبولك ➔"
                : "Confier Mon Dossier à ScholarChina ➔"}
            </span>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                mode === "assisted"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-white/5 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950"
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5 rtl-flip" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
