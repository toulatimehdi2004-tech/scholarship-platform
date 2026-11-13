"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Crown,
  FileCheck2,
  Building2,
  Check,
  Star,
  Lock,
} from "lucide-react";
import Logo from "./Logo";
import { useApplicationMode, type ApplicationMode } from "@/lib/ApplicationModeContext";
import { useLang } from "@/lib/i18n";

export default function MandatoryChoiceGateModal() {
  const { showChoiceModal, chooseMode } = useApplicationMode();
  const { lang } = useLang();

  if (!showChoiceModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Darkened backdrop (Un-dismissible: click does not close) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#020611]/92 backdrop-blur-2xl"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 25 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-4xl rounded-3xl p-6 sm:p-9 bg-[#080e1c] border border-amber-500/35 text-white shadow-2xl shadow-amber-500/20 z-10 overflow-hidden my-auto"
        >
          {/* Subtle Ambient Glows */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

          {/* Top Brand & Announcement */}
          <div className="text-center mb-7 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/5 border border-white/10 text-cyan mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {lang === "ar"
                  ? "بوابة التقديم للدراسة في الصين 2026/2027"
                  : "Portail Candidatures Chine 2026/2027"}
              </span>
            </div>

            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan p-0.5 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
              <Logo size={42} showText={false} />
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-2">
              {lang === "ar"
                ? "كيف ترغب في متابعة التقديم للدراسة في الصين؟"
                : lang === "fr"
                ? "Comment Souhaitez-vous Postuler en Chine ?"
                : "How Would You Like to Apply to Chinese Universities?"}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              {lang === "ar"
                ? "مرحباً بك! لتقديم التجربة الأنسب لك، يرجى اختيار مسار التقديم الخاص بك للمتابعة:"
                : lang === "fr"
                ? "Bienvenue ! Afin de personnaliser votre interface, veuillez choisir votre méthode de candidature pour continuer :"
                : "Welcome! To provide the right workspace, please select your application pathway to continue:"}
            </p>
          </div>

          {/* TWO MANDATORY DECISION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10 mb-6">
            {/* OPTION 1: Self-Apply (التقديم الذاتي) */}
            <div
              onClick={() => chooseMode("self")}
              className="rounded-3xl p-5 sm:p-6 bg-slate-900/80 hover:bg-slate-900 border border-blue-500/30 hover:border-blue-400 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                {/* Header icon and badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shadow-md">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300">
                    {lang === "ar" ? "مسار مستقل 100%" : "100% Autonome"}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white mb-1.5 group-hover:text-cyan transition-colors">
                  {lang === "ar"
                    ? "التقديم الذاتي (أنا سأقدم بنفسي)"
                    : lang === "fr"
                    ? "Candidature Autonome (Je postule moi-même)"
                    : "Self-Apply (I Apply Myself)"}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  {lang === "ar"
                    ? "أنا سأبحث عن المنح والجامعات بنفسي، وسأتولى تعبئة استمارات التقديم ومراسلة بوابات الجامعات والـ CSC مباشرة."
                    : lang === "fr"
                    ? "Vous explorez les bourses, préparez votre dossier et postulez de façon autonome directement sur les sites des facultés."
                    : "Explore Chinese universities, manage your dossier, and apply independently to official university & CSC portals."}
                </p>

                {/* Feature checkpoints */}
                <ul className="space-y-2 mb-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>
                      {lang === "ar"
                        ? "تصفح كتالوج المنح والجامعات الـ 100+"
                        : "Accès au catalogue des bourses et universités"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>
                      {lang === "ar"
                        ? "أكواد الوكالة الرسمية (Agency Numbers) وروابط البوابات"
                        : "Agency Numbers et portails officiels"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>
                      {lang === "ar"
                        ? "محاكي CSCA ودليل الفحص الطبي والتأشيرة"
                        : "Simulateur CSCA & guides de visite médicale"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  chooseMode("self");
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>
                  {lang === "ar"
                    ? "اختيار التقديم الذاتي والمتابعة"
                    : "Choisir la Candidature Autonome"}
                </span>
                <ArrowRight className="w-4 h-4 rtl-flip" />
              </button>
            </div>

            {/* OPTION 2: We Apply For You (نحن نتكفل بالتقديم لك) */}
            <div
              onClick={() => chooseMode("assisted")}
              className="rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#211508] via-[#121c2e] to-[#0a1220] hover:border-amber-400 border border-amber-500/60 shadow-xl shadow-amber-500/15 transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1 relative overflow-hidden ring-1 ring-amber-500/40"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

              <div>
                {/* Header icon and badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Sparkles className="w-6 h-6 text-slate-950" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm">
                    {lang === "ar" ? "⭐ الأكثر طلباً • ضمان 100%" : "⭐ Recommandé • Garantie 100%"}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white mb-1.5 group-hover:text-amber-300 transition-colors">
                  {lang === "ar"
                    ? "نحن نقدّم لك (خدمة التكفل والضمان)"
                    : lang === "fr"
                    ? "Délégation Complète (On postule pour vous)"
                    : "We Apply For You (Full Concierge)"}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  {lang === "ar"
                    ? "مستشارونا المعتمدون يتكفلون بملفك بالكامل: الترجمة المحلفة للصينية، تصديق الخارجية، صياغة SOP، والتقديم مع ضمان القبول."
                    : lang === "fr"
                    ? "Notre équipe d'experts prend tout en charge : traduction assermentée, projet d'étude, soumission auprès de nos universités et garantie d'admission."
                    : "Our accredited admissions team manages your entire application, sworn translation, SOP drafting, and guaranteed university admission."}
                </p>

                {/* Feature checkpoints */}
                <ul className="space-y-2 mb-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="font-bold text-amber-200">
                      {lang === "ar"
                        ? "ضمان القبول الجامعي 100% أو استرجاع الرسوم"
                        : "Garantie d'admission 100% ou remboursement"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>
                      {lang === "ar"
                        ? "الترجمة المحلفة الكاملة للصينية والتصديق القنصلي"
                        : "Traduction assermentée mandarin & apostille MAEC"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>
                      {lang === "ar"
                        ? "متابعة مباشرة مع لجان القبول واستلام استمارة JW202"
                        : "Suivi en direct avec Pékin & délivrance du visa JW202"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  chooseMode("assisted");
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>
                  {lang === "ar"
                    ? "اختيار خدمة التكفل والضمان ➔"
                    : "Confier Mon Dossier & Garantie ➔"}
                </span>
              </button>
            </div>
          </div>

          {/* Footer note: Choice is mandatory to proceed */}
          <div className="text-center pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-center gap-2 relative z-10">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === "ar"
                ? "يجب اختيار أحد المسارين للمتابعة • يمكنك تغيير مسارك لاحقاً في أي وقت من القائمة"
                : "Choix obligatoire pour continuer • Vous pourrez changer de mode à tout moment"}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
