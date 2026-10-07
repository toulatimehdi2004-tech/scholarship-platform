"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Building2,
  FileCheck2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Globe2,
  Sun,
  Moon,
} from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "@/lib/ThemeContext";
import LanguageSwitcher from "./LanguageSwitcher";
import AuthGateModal from "./AuthGateModal";
import { getToken } from "@/lib/api";

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [chosenRole, setChosenRole] = useState<PortalRole>("student");

  function handleTriggerRole(role: PortalRole) {
    if (getToken()) {
      onSelectRole(role);
      return;
    }
    setChosenRole(role);
    try {
      localStorage.setItem("portal_role", role);
    } catch {}
    setAuthModalOpen(true);
  }

  const portals = [
    {
      id: "student" as PortalRole,
      title: "Moroccan Student & Candidate",
      titleFr: "Étudiant Marocain • Candidat",
      titleAr: "طالب مغربي وباحث عن منحة",
      badge: "Maroc 🇲🇦 • 100+ Chinese Universities",
      icon: GraduationCap,
      cardClass:
        "bg-gradient-to-b from-emerald-50 via-white to-emerald-50/90 dark:from-emerald-950/85 dark:via-slate-900/90 dark:to-slate-950 border-2 border-emerald-500 shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-400",
      badgeClass:
        "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-bold",
      iconBoxClass:
        "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30",
      titleClass:
        "text-emerald-950 dark:text-white font-black group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors",
      subClass: "text-emerald-700 dark:text-emerald-300/90 font-medium italic",
      descClass: "text-slate-700 dark:text-emerald-100/85",
      checkClass: "text-emerald-600 dark:text-emerald-400",
      featTextClass: "text-slate-800 dark:text-white/90 font-medium",
      btnClass:
        "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black shadow-lg shadow-emerald-600/30",
      description:
        "Exclusively for Moroccan students: discover 400+ full and partial CSC scholarships, explore campus grounds in 3D VR, get matched by AI, and track your applications.",
      features: [
        "100+ Chinese Universities with 3D VR Console Tours",
        "400+ Verified Full & Partial Scholarships",
        "AI Eligibility Matcher & SOP Studio for Moroccans",
        "Moroccan Baccalaureate / Licence / Master Pathways",
      ],
      buttonText: "Enter Student Portal (Morocco 🇲🇦)",
    },
    {
      id: "university" as PortalRole,
      title: "University & Admissions",
      titleFr: "Université & Admissions",
      titleAr: "جامعة وإدارة القبول",
      badge: "Institutional Desk • Moroccan Candidates",
      icon: Building2,
      cardClass:
        "bg-gradient-to-b from-amber-50 via-white to-amber-50/90 dark:from-amber-950/85 dark:via-slate-900/90 dark:to-slate-950 border-2 border-amber-500 shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 hover:border-amber-400",
      badgeClass:
        "bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-bold",
      iconBoxClass:
        "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30",
      titleClass:
        "text-amber-950 dark:text-white font-black group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors",
      subClass: "text-amber-700 dark:text-amber-300/90 font-medium italic",
      descClass: "text-slate-700 dark:text-amber-100/85",
      checkClass: "text-amber-600 dark:text-amber-400",
      featTextClass: "text-slate-800 dark:text-white/90 font-medium",
      btnClass:
        "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/30",
      description:
        "Review Moroccan applicants applying through our platform, evaluate academic dossiers, modify university campus info, and adjust scholarship quotas.",
      features: [
        "Live Moroccan Applicant Pipeline (Review, Admit, Reject)",
        "Modify School Information & Campus Profile",
        "Manage Listed Scholarships & Seat Quotas",
        "Demographics by Moroccan Cities & Qualifications",
      ],
      buttonText: "Enter University Admissions Desk",
    },
    {
      id: "provider" as PortalRole,
      title: "Certified Service Provider",
      titleFr: "Prestataire Agréé (Traduction)",
      titleAr: "مترجم محلف وتصديق وثائق",
      badge: "Sworn Translators • Legalization Desk",
      icon: FileCheck2,
      cardClass:
        "bg-gradient-to-b from-rose-50 via-white to-rose-50/90 dark:from-rose-950/85 dark:via-slate-900/90 dark:to-slate-950 border-2 border-red-500 shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/30 hover:border-red-400",
      badgeClass:
        "bg-rose-500/15 text-rose-900 dark:text-rose-300 border border-rose-500/40 font-bold",
      iconBoxClass:
        "bg-gradient-to-br from-rose-600 via-red-600 to-pink-600 text-white shadow-lg shadow-rose-600/30",
      titleClass:
        "text-rose-950 dark:text-white font-black group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors",
      subClass: "text-rose-700 dark:text-rose-300/90 font-medium italic",
      descClass: "text-slate-700 dark:text-rose-100/85",
      checkClass: "text-rose-600 dark:text-rose-400",
      featTextClass: "text-slate-800 dark:text-white/90 font-medium",
      btnClass:
        "bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 hover:to-red-500 text-white font-black shadow-lg shadow-rose-600/30",
      description:
        "Manage Moroccan student document translation orders, inspect uploaded diplomas & transcripts, deliver certified sworn translations, and set service rates.",
      features: [
        "Moroccan Student Translation & Legalization Queue",
        "Original Document Viewer (Transcripts / Diplomas / Bac)",
        "Deliver Certified Sworn Mandarin Translations",
        "Manage Service Offerings & Hourly Rates",
      ],
      buttonText: "Enter Provider Workspace",
    },
  ];

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-50 dark:bg-[#050e09] transition-colors duration-300">
        {/* Top Controls: Language & Theme Switcher */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={toggle}
            className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 transition-all cursor-pointer"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-700" />
            )}
          </button>
        </div>

        {/* Radial ambient glow in background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-emerald-500/10 via-cyan/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl w-full mx-auto relative z-10 text-center">
          {/* Emblem & Brand Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="mb-3 hover:scale-105 transition-transform duration-300">
              <Logo size={68} />
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold tracking-wide uppercase mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Moroccan Scholar Global Platform • Maroc 🇲🇦
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight mb-3">
              Choose Your Platform Portal
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-white/70 max-w-2xl mx-auto">
              Select your role to access tailored tools, real-time pipelines, and personalized workspaces.
            </p>
          </motion.div>

          {/* 3 Portal Cards Grid with vibrant edge-matching colors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-10 text-left">
            {portals.map((p, idx) => {
              const Icon = p.icon;
              const isCurrent = currentRole === p.id;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  onClick={() => handleTriggerRole(p.id)}
                  className={`group rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden hover:-translate-y-2 ${p.cardClass} ${
                    isCurrent ? "ring-4 ring-emerald-400" : ""
                  }`}
                >
                  {/* Top Badge & Active Indicator */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span
                      className={`text-[10px] sm:text-xs font-mono uppercase px-3 py-1 rounded-full ${p.badgeClass}`}
                    >
                      {p.badge}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Role Icon & Title */}
                  <div>
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${p.iconBoxClass} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>

                    <h3 className={`text-xl sm:text-2xl mb-1 tracking-tight ${p.titleClass}`}>
                      {p.title}
                    </h3>
                    <p className={`text-xs mb-3 ${p.subClass}`}>
                      {p.titleFr} • {p.titleAr}
                    </p>

                    <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${p.descClass}`}>
                      {p.description}
                    </p>

                    {/* Bullet Highlights */}
                    <div className="space-y-2.5 mb-6 pt-4 border-t border-slate-200/80 dark:border-white/10">
                      {p.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs">
                          <CheckCircle2
                            className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.checkClass}`}
                          />
                          <span className={p.featTextClass}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerRole(p.id);
                    }}
                    className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer hover:brightness-110 ${p.btnClass}`}
                  >
                    <span>{p.buttonText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Switcher Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 dark:text-white/60"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Exclusively dedicated to Moroccan scholars applying to Chinese universities
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Globe2 className="w-4 h-4 text-teal-600 dark:text-cyan" />
              Full bilingual support: English, Français, العربية
            </span>
          </motion.div>
        </div>
      </div>

      {/* Imposed Auth Gate Modal upon role selection */}
      <AuthGateModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        role={chosenRole}
        canClose={true}
        onSuccess={() => {
          setAuthModalOpen(false);
          onSelectRole(chosenRole);
        }}
      />
    </>
  );
}
