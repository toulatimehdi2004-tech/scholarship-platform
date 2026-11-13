"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Compass,
  GraduationCap,
  Building2,
  Layers,
  LayoutGrid,
  Heart,
  FileCheck,
  MessageSquare,
  User as UserIcon,
  Settings,
  Headphones,
  ArrowRight,
  Menu,
  X,
  Stethoscope,
  Stamp,
  Plane,
  Sparkles,
  ShieldCheck,
  Clock,
  Crown,
  FileText,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useLang } from "@/lib/i18n";
import { useApplicationMode } from "@/lib/ApplicationModeContext";
import { motion, AnimatePresence } from "framer-motion";

export type SidebarActiveTab =
  | "home"
  | "discover"
  | "scholarships"
  | "universities"
  | "tracker"
  | "services"
  | "flights"
  | "saved"
  | "documents"
  | "medical"
  | "morocco"
  | "messages"
  | "profile"
  | "settings"
  | "assisted-home"
  | "assisted-apply"
  | "assisted-tracker"
  | "assisted-packages";

interface StudentSidebarProps {
  activeTab?: SidebarActiveTab;
}

interface SidebarItem {
  id: string;
  href: string;
  label: string;
  icon: any;
  badge?: string;
}

export default function StudentSidebar({ activeTab = "home" }: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLang();
  const { mode, setMode } = useApplicationMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenLiveChat = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open_live_chat"));
    }
  };

  // Dynamic Navigation Links based on Application Mode
  const isAssisted = mode === "assisted";

  const selfNavLinks: SidebarItem[] = [
    {
      id: "home",
      href: "/student-portal",
      label: lang === "ar" ? "الرئيسية" : "Home",
      icon: Home,
    },
    {
      id: "discover",
      href: "/universities",
      label: lang === "ar" ? "استكشاف" : "Discover",
      icon: Compass,
    },
    {
      id: "scholarships",
      href: "/scholarships",
      label: lang === "ar" ? "المنح الدراسية" : "Scholarships",
      icon: GraduationCap,
    },
    {
      id: "universities",
      href: "/universities",
      label: lang === "ar" ? "دليل الجامعات" : "Universities",
      icon: Building2,
    },
    {
      id: "tracker",
      href: "/tracker",
      label: lang === "ar" ? "طلباتي الذاتية" : "My Applications",
      icon: Layers,
    },
    {
      id: "services",
      href: "/services",
      label: lang === "ar" ? "الخدمات الإضافية" : "Services",
      icon: LayoutGrid,
    },
    {
      id: "saved",
      href: "/scholarships?saved=true",
      label: lang === "ar" ? "المفضلة" : "Saved",
      icon: Heart,
    },
  ];

  const assistedNavLinks: SidebarItem[] = [
    {
      id: "home",
      href: "/assisted-service",
      label: lang === "ar" ? "خطة التكفل والضمان" : "Overview & Concierge",
      icon: Sparkles,
      badge: "VIP",
    },
    {
      id: "assisted-apply",
      href: "/assisted-service",
      label: lang === "ar" ? "فتح وتعبئة ملفي" : "Start My Dossier",
      icon: FileText,
    },
    {
      id: "tracker",
      href: "/assisted-service",
      label: lang === "ar" ? "تتبع ملف التكفل" : "Assisted Tracker",
      icon: Clock,
    },
    {
      id: "packages",
      href: "/assisted-service",
      label: lang === "ar" ? "باقات القبول المضمون" : "Guaranteed Packages",
      icon: Crown,
    },
    {
      id: "universities",
      href: "/universities",
      label: lang === "ar" ? "الجامعات الصينية الشريكة" : "Partner Universities",
      icon: Building2,
    },
    {
      id: "flights",
      href: "/flights",
      label: lang === "ar" ? "رحلات الصين" : "Student Flights",
      icon: Plane,
    },
  ];

  const currentNavLinks = isAssisted ? assistedNavLinks : selfNavLinks;

  const secondaryLinks: SidebarItem[] = [
    {
      id: "documents",
      href: "/documents",
      label: lang === "ar" ? "الوثائق والشروط" : "Documents",
      icon: FileCheck,
    },
    {
      id: "messages",
      href: "/ai-chat",
      label: lang === "ar" ? "المستشار والرسائل" : "Advisors & Messages",
      icon: MessageSquare,
      badge: "LIVE",
    },
    {
      id: "profile",
      href: "/profile",
      label: lang === "ar" ? "حسابي الشخصي" : "My Profile",
      icon: UserIcon,
    },
    {
      id: "settings",
      href: "/profile",
      label: lang === "ar" ? "الإعدادات" : "Settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP FIXED LEFT SIDEBAR (Unified Component)
      ───────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-[#0a101d]/90 backdrop-blur-xl border-r border-white/5 flex-col justify-between p-4 flex-shrink-0 z-30 min-h-screen sticky top-0">
        <div>
          {/* Logo Brand Header */}
          <Link href="/" className="flex items-center gap-2.5 px-3 py-3 mb-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan p-0.5 flex items-center justify-center shadow-md">
              <Logo size={28} showText={false} />
            </div>
            <span className="text-xs font-black tracking-[0.2em] text-white">
              SCHOLAR<span className="text-blue-400">CHINA</span>
            </span>
          </Link>

          {/* APPLICATION MODE TOGGLE PILL IN SIDEBAR */}
          <div className="px-1 mb-4">
            <div className="p-1 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMode("self")}
                className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                  !isAssisted
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-black"
                    : "text-slate-400 hover:text-white"
                }`}
                title="التقديم الذاتي - أنت تقدم بنفسك"
              >
                {lang === "ar" ? "تقديم ذاتي" : "Autonome"}
              </button>
              <button
                type="button"
                onClick={() => setMode("assisted")}
                className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  isAssisted
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                    : "text-amber-300 hover:text-white"
                }`}
                title="نحن نقدّم لك - خدمة مدارة وضمان القبول"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{lang === "ar" ? "نحن نقدّم لك" : "Assisté"}</span>
              </button>
            </div>
          </div>

          {/* Primary Navigation Menu */}
          <nav className="space-y-1 text-xs font-semibold">
            {currentNavLinks.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? isAssisted
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-md shadow-amber-500/20"
                        : "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                        isAssisted
                          ? "bg-amber-400 text-slate-950"
                          : "bg-blue-500/30 text-cyan"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Menu Separator */}
            <div className="border-t border-white/5 my-3 pt-2" />

            {secondaryLinks.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Help Center Button */}
        <div className="pt-4 border-t border-white/5">
          <button
            onClick={handleOpenLiveChat}
            className="w-full py-2.5 px-3 rounded-2xl bg-white/[0.04] hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-cyan group-hover:scale-110 transition-transform" />
              <span>{lang === "ar" ? "مركز المساعدة والمستشار" : "Help Desk & Advisors"}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white rtl-flip" />
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE TOP HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden w-full bg-[#0a101d]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Logo size={28} showText={false} />
          <span className="text-xs font-black tracking-widest text-white">
            SCHOLAR<span className="text-blue-400">CHINA</span>
          </span>
        </div>

        {/* Compact Mobile Mode Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMode("self")}
            className={`px-2 py-1 rounded-md transition-all ${
              !isAssisted ? "bg-blue-600 text-white" : "text-slate-400"
            }`}
          >
            {lang === "ar" ? "ذاتي" : "Auto"}
          </button>
          <button
            type="button"
            onClick={() => setMode("assisted")}
            className={`px-2 py-1 rounded-md transition-all ${
              isAssisted
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black"
                : "text-amber-400"
            }`}
          >
            {lang === "ar" ? "مدار" : "Assisté"}
          </button>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0a101d]/95 backdrop-blur-2xl border-b border-white/10 p-4 space-y-2 text-xs font-bold sticky top-14 z-40"
          >
            {/* Mode selection in mobile drawer */}
            <div className="p-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1 mb-2">
              <button
                type="button"
                onClick={() => {
                  setMode("self");
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 rounded-lg text-center font-bold ${
                  !isAssisted ? "bg-blue-600 text-white" : "text-slate-400"
                }`}
              >
                {lang === "ar" ? "التقديم الذاتي" : "Candidature Autonome"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("assisted");
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 rounded-lg text-center font-bold flex items-center justify-center gap-1 ${
                  isAssisted
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "text-amber-400"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "نحن نقدّم لك" : "On Postule Pour Vous"}</span>
              </button>
            </div>

            {[...currentNavLinks, ...secondaryLinks].map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl ${
                    isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenLiveChat();
              }}
              className="w-full mt-2 p-2.5 rounded-xl bg-cyan/15 text-cyan border border-cyan/30 flex items-center justify-between"
            >
              <span>Live Help Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
