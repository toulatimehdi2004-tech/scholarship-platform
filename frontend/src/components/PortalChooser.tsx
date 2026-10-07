"use client";

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
  Languages,
  Compass,
  FileText,
  Users,
  Award,
} from "lucide-react";
import Logo from "./Logo";

export type PortalRole = "student" | "university" | "provider";

interface PortalChooserProps {
  onSelectRole: (role: PortalRole) => void;
  currentRole?: PortalRole | null;
}

export default function PortalChooser({
  onSelectRole,
  currentRole,
}: PortalChooserProps) {
  const portals = [
    {
      id: "student" as PortalRole,
      title: "Student & Candidate",
      titleFr: "Étudiant & Candidat",
      titleAr: "طالب وباحث عن منحة",
      badge: "Study in China • 100+ Universities",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      icon: GraduationCap,
      gradient: "from-emerald-500 via-teal-500 to-cyan",
      borderColor: "border-emerald-500/40 hover:border-emerald-400",
      glowColor: "shadow-emerald-500/20",
      description:
        "Discover 400+ full and partial CSC scholarships, explore campus grounds in 3D VR, get matched by AI, and track your applications.",
      features: [
        "100+ Universities with 3D VR Console Tours",
        "400+ Verified Full & Partial Scholarships",
        "AI Eligibility Matcher & SOP Studio",
        "Live Application Tracker & Deadline Alerts",
      ],
      buttonText: "Enter Student Portal",
    },
    {
      id: "university" as PortalRole,
      title: "University & Admissions",
      titleFr: "Université & Admissions",
      titleAr: "جامعة وإدارة القبول",
      badge: "Faculty Desk • Campus Editor",
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      icon: Building2,
      gradient: "from-amber-400 via-orange-500 to-yellow-500",
      borderColor: "border-amber-500/40 hover:border-amber-400",
      glowColor: "shadow-amber-500/20",
      description:
        "Review international applicants applying through our platform, evaluate dossiers, modify university campus info, and adjust scholarship quotas.",
      features: [
        "Live Applicant Pipeline (Review, Admit, Reject)",
        "Modify School Information & Campus Profile",
        "Manage Listed Scholarships & Seat Quotas",
        "International Student Demographics & Analytics",
      ],
      buttonText: "Enter University Portal",
    },
    {
      id: "provider" as PortalRole,
      title: "Certified Service Provider",
      titleFr: "Prestataire Agréé (Traduction)",
      titleAr: "مترجم محلف وتصديق وثائق",
      badge: "Sworn Translators • Legalization",
      badgeColor: "bg-purple/20 text-purple border-purple/40",
      icon: FileCheck2,
      gradient: "from-purple via-pink-500 to-red-500",
      borderColor: "border-purple/40 hover:border-purple",
      glowColor: "shadow-purple/20",
      description:
        "Manage student document translation orders, inspect uploaded diplomas & transcripts, deliver certified sworn translations, and set service rates.",
      features: [
        "Student Translation & Legalization Queue",
        "Original Document Viewer (Transcripts/Diplomas)",
        "Deliver Certified Sworn Mandarin Translations",
        "Manage Service Offerings & Hourly Rates",
      ],
      buttonText: "Enter Provider Workspace",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-950">
      {/* Background radial ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-emerald-600/15 via-cyan/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto relative z-10 text-center">
        {/* Emblem & Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="mb-3 hover:scale-105 transition-transform duration-300">
            <Logo size={64} />
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Moroccan Scholar Global Platform
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Choose Your Platform Portal
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto">
            Select your role to access tailored tools, real-time pipelines, and personalized workspaces.
          </p>
        </motion.div>

        {/* 3 Portal Cards Grid */}
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
                onClick={() => onSelectRole(p.id)}
                className={`group rounded-3xl p-6 sm:p-7 glass border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden hover:-translate-y-1.5 shadow-xl hover:${p.glowColor} ${
                  isCurrent
                    ? `${p.borderColor} ring-2 ring-emerald-400/50`
                    : `${p.borderColor}`
                }`}
              >
                {/* Top Badge & Corner Glow */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span
                    className={`text-[10px] sm:text-xs font-mono uppercase font-bold px-3 py-1 rounded-full border ${p.badgeColor}`}
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
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-5 text-slate-950 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight group-hover:text-emerald-300 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-white/50 mb-3 italic">
                    {p.titleFr} • {p.titleAr}
                  </p>

                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-6">
                    {p.description}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-white/10">
                    {p.features.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-2 text-xs text-white/80"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRole(p.id);
                  }}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer bg-gradient-to-r ${p.gradient} text-slate-950 hover:opacity-95`}
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
          className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/60"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Seamless role switching available in navigation header anytime
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-cyan" />
            Full bilingual support: English, Français, العربية
          </span>
        </motion.div>
      </div>
    </div>
  );
}
