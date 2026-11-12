"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lock,
  Building2,
  Briefcase,
  ArrowRight,
  GraduationCap,
  Home,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/ThemeContext";

interface PortalComingSoonProps {
  role: "university" | "provider";
}

export default function PortalComingSoon({ role }: PortalComingSoonProps) {
  const { lang } = useLang();
  const { theme, toggle } = useTheme();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const bgImage = `${basePath}/images/china-night-pagoda.jpeg`;

  const isUniversity = role === "university";

  const config = isUniversity
    ? {
        roleKey: "university",
        title:
          lang === "ar"
            ? "بوابة قبول الجامعات الصينية"
            : lang === "fr"
            ? "Portail Admissions Universités Chinoises"
            : "Chinese University Admissions Desk",
        subtitle:
          lang === "ar"
            ? "هذه البوابة مخصصة لمسؤولي القبول بالجامعات الصينية لمراجعة طلبات الطلاب وإصدار منح CSC وقبولات البرامج. سيتم إطلاقها رسمياً في المرحلة القادمة."
            : lang === "fr"
            ? "Ce portail est strictement réservé aux responsables d'admissions des universités chinoises partenaires. L'accès sera déployé dans une prochaine phase."
            : "This workspace is strictly reserved for admissions officers at partner Chinese universities. Public access will launch in a subsequent phase.",
        icon: Building2,
        accentColor: "from-emerald-500 to-teal-600",
        badgeBg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
        glowColor: "from-emerald-600/20 via-teal-900/10 to-transparent",
        features:
          lang === "ar"
            ? [
                "الربط المؤسسي مع مكاتب القبول بالـ 102 جامعة صينية",
                "المراجعة الرقمية المباشرة لملفات وبيانات معدلات الطلاب المغاربة",
                "إصدار خطابات القبول المبدئية ومنح CSC الرسمية",
                "إدارة التخصصات والشواهد وشروط القبول لكل موسم دراسي",
              ]
            : lang === "fr"
            ? [
                "Liaison institutionnelle avec 102 universités chinoises accréditées",
                "Examen direct des dossiers académiques des étudiants marocains",
                "Émission des lettres d'admission et attributions de bourses CSC",
                "Gestion des programmes, quotas et critères de sélection",
              ]
            : [
                "Institutional link with 102 accredited Chinese universities",
                "Direct dossier review for Moroccan student applicants",
                "Issuance of pre-admissions and official CSC scholarship grants",
                "Management of academic majors, quotas, and eligibility criteria",
              ],
      }
    : {
        roleKey: "provider",
        title:
          lang === "ar"
            ? "بوابة مزودي الخدمات والترجمة المعتمدة"
            : lang === "fr"
            ? "Portail Prestataires de Services & Traduction"
            : "Certified Service Providers & Translation Desk",
        subtitle:
          lang === "ar"
            ? "هذه البوابة مخصصة لشبكة المترجمين المحلفين ومقدمي خدمات التأشيرة، التصديق العدلي والاستقبال الجامعي. سيتم تفعيلها في التحديث المقبل."
            : lang === "fr"
            ? "Ce portail est dédié aux traducteurs assermentés, coursiers consulaires et prestataires d'accueil aéroportuaire. L'activation est prévue prochainement."
            : "This workspace is dedicated to sworn translators, consular couriers, and airport pickup partners. Official activation will take place in an upcoming update.",
        icon: Briefcase,
        accentColor: "from-purple-500 to-indigo-600",
        badgeBg: "bg-purple-500/15 border-purple-500/40 text-purple-300",
        glowColor: "from-purple-600/20 via-indigo-900/10 to-transparent",
        features:
          lang === "ar"
            ? [
                "استلام ومتابعة ملفات الترجمة المحلفة إلى الصينية والإنجليزية",
                "تصديق الوثائق والشهادات لدى وزارة الخارجية والقنصلية",
                "تنسيق مواعيد التأشيرة الطلابية X1 / X2 والفحص الطبي",
                "خدمات استقبال الطلاب في مطارات بكين، شنغهاي وغوانغجو",
              ]
            : lang === "fr"
            ? [
                "Traitement des ordres de traduction assermentée (chinois / anglais)",
                "Légalisation des diplômes auprès du Ministère des Affaires Étrangères",
                "Coordination des rendez-vous visa étudiant X1 / X2 et visite médicale",
                "Accueil personnalisé aux aéroports de Pékin, Shanghai et Guangzhou",
              ]
            : [
                "Processing sworn translation orders (Chinese & English)",
                "MOFA and consular legalization for academic diplomas",
                "Coordination of X1/X2 student visa appointments & medical tests",
                "Airport reception & dorm check-in across Beijing, Shanghai, Guangzhou",
              ],
      };

  const RoleIcon = config.icon;

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between overflow-hidden selection:bg-cyan/30">
      {/* Background Pagoda Image matching landing page */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src={bgImage}
          alt="ScholarChina Night Pagoda Skyline"
          className="w-full h-full object-cover object-bottom brightness-[0.75] contrast-[1.1] transition-all duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes("china-night-pagoda.jpeg")) {
              target.src = `${basePath}/china-night-pagoda.jpeg`;
            } else {
              target.src = "/images/china-night-pagoda.jpeg";
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/90 via-[#030712]/60 to-[#030712]/95 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
            <Logo size={36} showText={false} />
          </div>
          <span className="text-base font-black tracking-tight text-white hidden sm:inline">
            Scholar<span className="text-blue-400">China</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/60 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-lg">
          <LanguageSwitcher />
          <button
            onClick={toggle}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center justify-center flex-1 text-center">
        {/* Animated Lock & Role Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-white/15 shadow-2xl flex items-center justify-center mx-auto relative group">
            <RoleIcon className="w-9 h-9 sm:w-11 sm:h-11 text-slate-300 opacity-80" />
            {/* Small lock pill in corner */}
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg font-black border-2 border-slate-900">
              <Lock className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* Coming Soon Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === "ar"
                ? "قريباً • قيد التطوير والتجهيز"
                : lang === "fr"
                ? "Bientôt Disponible • En Cours de Préparation"
                : "Coming Soon • Under Active Preparation"}
            </span>
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4 max-w-xl leading-tight"
        >
          {config.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mb-8"
        >
          {config.subtitle}
        </motion.p>

        {/* What is available right now card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl p-5 sm:p-6 mb-8 text-left text-xs sm:text-sm text-slate-300 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-3 font-bold text-white text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              {lang === "ar"
                ? "الميزات المخطط إطلاقها في هذه البوابة:"
                : lang === "fr"
                ? "Fonctionnalités en cours de finalisation :"
                : "Features scheduled for this portal:"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {config.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] sm:text-xs text-slate-300 leading-snug">
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons: Return to Student Portal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto"
        >
          <Link
            href="/student-portal/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan hover:brightness-110 text-white font-black text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer no-underline"
          >
            <GraduationCap className="w-4 h-4" />
            <span>
              {lang === "ar"
                ? "الانتقال إلى بوابة الطلاب (المتاحة حالياً)"
                : lang === "fr"
                ? "Accéder au Portail Étudiant (Actif)"
                : "Go to Student Portal (Active Now)"}
            </span>
            <ArrowRight className="w-4 h-4 rtl-flip" />
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer no-underline"
          >
            <Home className="w-4 h-4" />
            <span>{lang === "ar" ? "الصفحة الرئيسية" : lang === "fr" ? "Accueil" : "Home"}</span>
          </Link>
        </motion.div>
      </main>

      {/* Footer spacer */}
      <footer className="relative z-10 w-full py-4 text-center text-slate-500 text-[11px]">
        ScholarChina • {new Date().getFullYear()}
      </footer>
    </div>
  );
}
