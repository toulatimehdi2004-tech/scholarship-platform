"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Building2,
  Briefcase,
  ArrowRight,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "@/lib/ThemeContext";
import LanguageSwitcher from "./LanguageSwitcher";
import AuthGateModal from "./AuthGateModal";
import { useLang } from "@/lib/i18n";

export type PortalRole = "student" | "university" | "provider";

interface PortalChooserProps {
  onSelectRole: (role: PortalRole) => void;
  currentRole?: PortalRole | null;
}

export default function PortalChooser({
  onSelectRole,
  currentRole,
}: PortalChooserProps) {
  const { theme, toggle } = useTheme();
  const { lang } = useLang();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedMobileRole, setSelectedMobileRole] = useState<PortalRole>("student");
  const [chosenRoleForAuth, setChosenRoleForAuth] = useState<PortalRole>("student");

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const bgImage = `${basePath}/images/china-night-pagoda.jpeg`;

  const roles = [
    {
      id: "student" as PortalRole,
      href: "/student-portal/",
      title: lang === "ar" ? "طالب (Student)" : "Student",
      desc:
        lang === "ar"
          ? "البحث عن المنح، استكشاف الجامعات، والتقديم للدراسة في الصين."
          : "Find scholarships, discover universities, and apply to study in China.",
      icon: GraduationCap,
      color: "blue",
      badgeBg: "bg-blue-600",
      borderClass: "border-blue-500/30 hover:border-blue-400/80",
      shadowHover: "hover:shadow-[0_0_35px_rgba(37,99,235,0.28)]",
      glowBg: "from-blue-600/20 via-blue-900/10 to-transparent",
      btnTextColor: "text-blue-400 group-hover:text-blue-300",
      btnArrowBg: "bg-blue-600/20 group-hover:bg-blue-600 text-blue-400 group-hover:text-white",
      radioBorder: "border-blue-500",
      radioDot: "bg-blue-500",
    },
    {
      id: "university" as PortalRole,
      href: "/university-portal/",
      title: lang === "ar" ? "جامعة (University)" : "University",
      desc:
        lang === "ar"
          ? "التواصل مع الطلاب الدوليين وإدارة فرص المنح وبرامج القبول."
          : "Connect with international students and manage your scholarship opportunities.",
      icon: Building2,
      color: "teal",
      badgeBg: "bg-emerald-600",
      borderClass: "border-emerald-500/30 hover:border-emerald-400/80",
      shadowHover: "hover:shadow-[0_0_35px_rgba(16,185,129,0.28)]",
      glowBg: "from-emerald-600/20 via-teal-900/10 to-transparent",
      btnTextColor: "text-emerald-400 group-hover:text-emerald-300",
      btnArrowBg: "bg-emerald-600/20 group-hover:bg-emerald-600 text-emerald-400 group-hover:text-white",
      radioBorder: "border-emerald-500",
      radioDot: "bg-emerald-500",
    },
    {
      id: "provider" as PortalRole,
      href: "/provider-portal/",
      title: lang === "ar" ? "مزود خدمات (Service Provider)" : "Service Provider",
      desc:
        lang === "ar"
          ? "تقديم خدمات التأشيرة، الترجمة المحلفة، الوثائق وخدمات الدراسة بالخارج."
          : "Offer visa, translation, document and study-abroad services.",
      icon: Briefcase,
      color: "purple",
      badgeBg: "bg-purple-600",
      borderClass: "border-purple-500/30 hover:border-purple-400/80",
      shadowHover: "hover:shadow-[0_0_35px_rgba(168,85,247,0.28)]",
      glowBg: "from-purple-600/20 via-purple-900/10 to-transparent",
      btnTextColor: "text-purple-400 group-hover:text-purple-300",
      btnArrowBg: "bg-purple-600/20 group-hover:bg-purple-600 text-purple-400 group-hover:text-white",
      radioBorder: "border-purple-500",
      radioDot: "bg-purple-500",
    },
  ];

  function handleRoleClick(role: PortalRole) {
    setChosenRoleForAuth(role);
    try {
      localStorage.setItem("portal_role", role);
    } catch {}
    onSelectRole(role);
  }

  function handleSignInClick() {
    setChosenRoleForAuth("student");
    setAuthModalOpen(true);
  }

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between overflow-hidden selection:bg-cyan/30">
      {/* High-Resolution Chinese Pagoda & Skyline Night Background (Matching Image 1 & 2) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src={bgImage}
          alt="ScholarChina Night Pagoda Skyline"
          className="w-full h-full object-cover object-bottom brightness-[0.92] contrast-[1.08] transition-all duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes("china-night-pagoda.jpeg")) {
              target.src = `${basePath}/china-night-pagoda.jpeg`;
            } else {
              target.src = "/images/china-night-pagoda.jpeg";
            }
          }}
        />

        {/* Delicate Vignettes preserving the glowing pagodas and water reflections */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-[#030712]/15 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/45 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/12 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex items-center justify-between">
        <div />

        {/* Top Right Controls: Language & Theme Toggle */}
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

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center justify-center flex-1">
        {/* Brand Logo & Underline Glow */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 p-0.5 shadow-[0_0_25px_rgba(37,99,235,0.5)] flex items-center justify-center mb-2.5">
            <Logo size={52} showText={false} />
          </div>
          <span className="text-xs sm:text-sm font-black tracking-[0.25em] text-white uppercase">
            SCHOLAR<span className="text-blue-400">CHINA</span>
          </span>
          <div className="w-8 h-0.5 bg-blue-500 rounded-full mt-1.5 shadow-[0_0_10px_rgba(59,130,246,1)]" />
        </motion.div>

        {/* Page Title: Who are you? */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {lang === "ar" ? "من أنت" : "Who are you"}
            <span className="text-cyan drop-shadow-[0_0_20px_rgba(56,189,248,0.9)] ml-0.5">
              ?
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal mt-2.5 max-w-md mx-auto">
            {lang === "ar"
              ? "اختر صفتك للحصول على أفضل تجربة مخصصة لك."
              : "Choose your role to get the right experience."}
          </p>
        </motion.div>

        {/* DESKTOP VIEW: 3 Side-by-Side Cards (Exactly matching Image 1) */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-5 sm:gap-6 w-full">
          {roles.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="h-full"
            >
              <Link
                href={r.href}
                onClick={() => handleRoleClick(r.id)}
                className={`relative h-full rounded-3xl bg-slate-900/65 backdrop-blur-xl border ${r.borderClass} ${r.shadowHover} p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group cursor-pointer overflow-hidden block text-inherit no-underline`}
              >
                {/* Subtle top inner gradient */}
                <div
                  className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${r.glowBg} pointer-events-none rounded-t-3xl`}
                />

                <div className="relative z-10">
                  {/* Role Icon Badge */}
                  <div
                    className={`w-13 h-13 rounded-2xl ${r.badgeBg} text-white flex items-center justify-center shadow-lg shadow-black/40 mb-6 group-hover:scale-105 transition-transform duration-300`}
                  >
                    <r.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Role Title */}
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                    {r.title}
                  </h3>

                  {/* Role Description */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-8">
                    {r.desc}
                  </p>
                </div>

                {/* Bottom Continue Row */}
                <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/5">
                  <span className={`text-xs sm:text-sm font-bold ${r.btnTextColor}`}>
                    {lang === "ar" ? "متابعة" : "Continue"}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full ${r.btnArrowBg} flex items-center justify-center transition-all duration-300`}
                  >
                    <ArrowRight className="w-4 h-4 rtl-flip" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* MOBILE VIEW: Vertical List with Radio Circles (Matching Image 1 iPhone View) */}
        <div className="flex sm:hidden flex-col gap-3 w-full">
          {roles.map((r) => {
            const isSelected = selectedMobileRole === r.id;
            return (
              <Link
                key={r.id}
                href={r.href}
                onClick={() => {
                  setSelectedMobileRole(r.id);
                  handleRoleClick(r.id);
                }}
                className={`p-4 rounded-2xl bg-slate-900/75 backdrop-blur-xl border transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer block text-inherit no-underline ${
                  isSelected ? `${r.borderClass} shadow-lg` : "border-white/10"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl ${r.badgeBg} text-white flex items-center justify-center flex-shrink-0 shadow-md`}
                  >
                    <r.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-white">{r.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {r.desc}
                    </p>
                  </div>
                </div>

                {/* Radio selection circle on the right */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? `${r.radioBorder} ${r.radioDot}` : "border-slate-500"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Already have an account? Sign in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-8 sm:mt-10 text-xs sm:text-sm text-slate-400"
        >
          <span>
            {lang === "ar" ? "هل لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          </span>
          <button
            onClick={handleSignInClick}
            className="text-blue-400 hover:text-blue-300 font-bold hover:underline transition-colors cursor-pointer"
          >
            {lang === "ar" ? "تسجيل الدخول" : "Sign in"}
          </button>
        </motion.div>
      </main>

      {/* Empty bottom spacer for balance */}
      <footer className="relative z-10 w-full py-3" />

      {/* Sign-in / Register Modal Gate */}
      <AuthGateModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        role={chosenRoleForAuth}
        title={
          chosenRoleForAuth === "student"
            ? "Student Sign In"
            : chosenRoleForAuth === "university"
            ? "University Admissions Sign In"
            : "Service Provider Sign In"
        }
        subtitle="Sign in to access your customized ScholarChina workspace."
        onSuccess={() => {
          setAuthModalOpen(false);
          onSelectRole(chosenRoleForAuth);
        }}
      />
    </div>
  );
}
