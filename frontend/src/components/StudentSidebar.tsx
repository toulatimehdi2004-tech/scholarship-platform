"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Logo from "@/components/Logo";
import { useLang } from "@/lib/i18n";
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
  | "settings";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenLiveChat = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open_live_chat"));
    }
  };

  const navLinks: SidebarItem[] = [
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
      label: lang === "ar" ? "الجامعات" : "Universities",
      icon: Building2,
    },
    {
      id: "tracker",
      href: "/tracker",
      label: lang === "ar" ? "طلباتي" : "My Applications",
      icon: Layers,
    },
    {
      id: "services",
      href: "/services",
      label: lang === "ar" ? "الخدمات" : "Services",
      icon: LayoutGrid,
    },
    {
      id: "flights",
      href: "/flights",
      label: lang === "ar" ? "تذاكر الطيران" : "Vols Chine",
      icon: Plane,
      badge: "Cheapest",
    },
    {
      id: "saved",
      href: "/scholarships?saved=true",
      label: lang === "ar" ? "المفضلة" : "Saved",
      icon: Heart,
    },
  ];

  const secondaryLinks: SidebarItem[] = [
    {
      id: "documents",
      href: "/documents",
      label: lang === "ar" ? "الوثائق" : "Documents",
      icon: FileCheck,
    },
    {
      id: "medical",
      href: "/medical-guide",
      label: lang === "ar" ? "الفحص الطبي" : "Visite Médicale",
      icon: Stethoscope,
      badge: "CSC",
    },
    {
      id: "morocco",
      href: "/morocco-guide",
      label: lang === "ar" ? "دليل المغرب" : "Guide Maroc (Apostille)",
      icon: Stamp,
    },
    {
      id: "messages",
      href: "/ai-chat",
      label: lang === "ar" ? "الرسائل" : "Messages",
      icon: MessageSquare,
      badge: "3",
    },
    {
      id: "profile",
      href: "/profile",
      label: lang === "ar" ? "حسابي" : "My Profile",
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
          1. DESKTOP FIXED LEFT SIDEBAR (Matching Screenshot 1)
      ───────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-[#0a101d]/90 backdrop-blur-xl border-r border-white/5 flex-col justify-between p-4 flex-shrink-0 z-30 min-h-screen sticky top-0">
        <div>
          {/* Logo Brand Header */}
          <Link href="/" className="flex items-center gap-2.5 px-3 py-3 mb-4 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan p-0.5 flex items-center justify-center shadow-md">
              <Logo size={28} showText={false} />
            </div>
            <span className="text-xs font-black tracking-[0.2em] text-white">
              SCHOLAR<span className="text-blue-400">CHINA</span>
            </span>
          </Link>

          {/* Primary Navigation Menu */}
          <nav className="space-y-1 text-xs font-semibold">
            {navLinks.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
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
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
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
              <span>{lang === "ar" ? "مركز المساعدة" : "Help Center"}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white rtl-flip" />
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE TOP HEADER (Matching Screenshot 1)
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden w-full bg-[#0a101d]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Logo size={28} showText={false} />
          <span className="text-xs font-black tracking-widest text-white">
            SCHOLAR<span className="text-blue-400">CHINA</span>
          </span>
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
            {[...navLinks, ...secondaryLinks].map((item) => {
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
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
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
