"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Building2,
  Briefcase,
  ArrowRight,
  Search,
  Bell,
  SlidersHorizontal,
  Layers,
  Heart,
  FileText,
  FileCheck,
  MessageSquare,
  User as UserIcon,
  Settings,
  Headphones,
  Check,
  Calendar,
  ChevronDown,
  Plane,
  Car,
  Sparkles,
  Compass,
  LayoutGrid,
  Home,
  Menu,
  X,
  Award,
} from "lucide-react";
import Logo from "@/components/Logo";
import PortalChooser, { type PortalRole } from "@/components/PortalChooser";
import { getToken, getCurrentUser, clearToken, type User } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function StudentPortalPage() {
  const router = useRouter();
  const { lang, t } = useLang();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedFavorites, setSavedFavorites] = useState<number[]>([1, 3]);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const bgImage = `${basePath}/images/china-night-pagoda.jpeg`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getToken();
      if (!token) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        getCurrentUser().then((res) => {
          if (res.data) setUser(res.data);
        });
      }
    }
  }, []);

  const handleLogout = () => {
    clearToken();
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("portal_role");
    } catch {}
    router.push("/");
  };

  const toggleFavorite = (id: number) => {
    setSavedFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenLiveChat = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open_live_chat"));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        sessionStorage.setItem("home-query", searchQuery.trim());
      } catch {}
      router.push(`/scholarships?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/scholarships");
    }
  };

  // If visitor is unauthenticated, show the redesigned Image 1 "Who are you?" Portal Chooser
  if (isAuthenticated === false) {
    return (
      <PortalChooser
        onSelectRole={(role) => {
          try {
            localStorage.setItem("portal_role", role);
          } catch {}
          if (role === "university") {
            router.push("/university-portal");
          } else if (role === "provider") {
            router.push("/provider-portal");
          } else {
            setIsAuthenticated(true);
          }
        }}
      />
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070c18]">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const studentName = user?.first_name || user?.username || "Hamza";

  const recommendedScholarships = [
    {
      id: 1,
      university: "Chang'an University",
      city: "Xi'an, China",
      scholarship: "Chinese Government Scholarship",
      degree: "Master",
      funding: "Full Funding",
      deadline: "March 15, 2027",
      image: `${basePath}/images/campus/campus-1.jpg`,
      logoBg: "bg-blue-600",
      fundingColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    {
      id: 2,
      university: "Tsinghua University",
      city: "Beijing, China",
      scholarship: "Tsinghua University Scholarship",
      degree: "Master",
      funding: "Partial Funding",
      deadline: "April 30, 2027",
      image: `${basePath}/images/campus/gate-1.jpg`,
      logoBg: "bg-purple-700",
      fundingColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    },
    {
      id: 3,
      university: "Peking University",
      city: "Beijing, China",
      scholarship: "PKU International Scholarship",
      degree: "PhD",
      funding: "Full Funding",
      deadline: "March 31, 2027",
      image: `${basePath}/images/campus/lake-1.jpg`,
      logoBg: "bg-red-700",
      fundingColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    {
      id: 4,
      university: "Zhejiang University",
      city: "Hangzhou, China",
      scholarship: "ZJU Global Scholarship",
      degree: "Bachelor",
      funding: "Partial Funding",
      deadline: "April 15, 2027",
      image: `${basePath}/images/campus/library-1.jpg`,
      logoBg: "bg-blue-800",
      fundingColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-cyan/30">
      {/* ─────────────────────────────────────────────────────────────
          1. LEFT FIXED SIDEBAR (Matching Image 3)
      ───────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-[#0a101d] border-r border-white/5 flex-col justify-between p-4 flex-shrink-0 z-30 min-h-screen sticky top-0">
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
            <Link
              href="/student-portal"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>{lang === "ar" ? "الرئيسية" : "Home"}</span>
            </Link>

            <Link
              href="/scholarships"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>{lang === "ar" ? "استكشاف" : "Discover"}</span>
            </Link>

            <Link
              href="/scholarships"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{lang === "ar" ? "المنح الدراسية" : "Scholarships"}</span>
            </Link>

            <Link
              href="/universities"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>{lang === "ar" ? "الجامعات" : "Universities"}</span>
            </Link>

            <Link
              href="/tracker"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>{lang === "ar" ? "طلباتي" : "My Applications"}</span>
            </Link>

            <Link
              href="/services"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{lang === "ar" ? "الخدمات" : "Services"}</span>
            </Link>

            <Link
              href="/scholarships?saved=true"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Heart className="w-4 h-4" />
              <span>{lang === "ar" ? "المفضلة" : "Saved"}</span>
            </Link>

            {/* Menu Separator */}
            <div className="border-t border-white/5 my-3 pt-2" />

            <Link
              href="/documents"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <FileCheck className="w-4 h-4" />
              <span>{lang === "ar" ? "الوثائق" : "Documents"}</span>
            </Link>

            <Link
              href="/ai-chat"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>{lang === "ar" ? "الرسائل" : "Messages"}</span>
              </div>
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                3
              </span>
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <UserIcon className="w-4 h-4" />
              <span>{lang === "ar" ? "حسابي" : "My Profile"}</span>
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>{lang === "ar" ? "الإعدادات" : "Settings"}</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Help Center Button (Image 3) */}
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

      {/* Mobile Top Header */}
      <div className="lg:hidden w-full bg-[#0a101d] border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Logo size={28} showText={false} />
          <span className="text-xs font-black tracking-widest text-white">
            SCHOLAR<span className="text-blue-400">CHINA</span>
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white"
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
            className="lg:hidden bg-[#0a101d] border-b border-white/10 p-4 space-y-2 text-xs font-bold sticky top-14 z-40"
          >
            <Link
              href="/student-portal"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl bg-blue-600 text-white"
            >
              Home
            </Link>
            <Link
              href="/scholarships"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-slate-300 hover:bg-white/5"
            >
              Scholarships
            </Link>
            <Link
              href="/universities"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-slate-300 hover:bg-white/5"
            >
              Universities
            </Link>
            <Link
              href="/tracker"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-slate-300 hover:bg-white/5"
            >
              My Applications
            </Link>
            <Link
              href="/csca"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-rose-400 font-bold hover:bg-white/5"
            >
              Examen CSCA 2026/2027
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenLiveChat();
              }}
              className="w-full text-left p-2.5 rounded-xl text-cyan hover:bg-white/5 flex items-center justify-between"
            >
              <span>Live Help Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (Matching Image 3)
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header Search & Profile Bar (Image 3) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input Bar with Filter Button */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full sm:max-w-xl px-4 py-2 rounded-2xl bg-[#0d1527] border border-white/10 flex items-center gap-2.5 shadow-sm focus-within:border-blue-500 transition-colors"
          >
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "البحث عن المنح والجامعات والتخصصات..."
                  : "Search scholarships, universities, programs..."
              }
              className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none"
            />
            <button
              type="button"
              onClick={() => router.push("/scholarships")}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "فلترة" : "Filters"}</span>
            </button>
          </form>

          {/* User Profile & Notification Bell Capsule */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Notification Bell with red pulse dot */}
            <div className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>

            {/* Profile Capsule */}
            <Link
              href="/profile"
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="font-bold text-white group-hover:text-cyan transition-colors">
                  {studentName} Ismaili
                </div>
                <div className="text-[10px] text-slate-400">Student</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* CSCA Urgent Notice Banner */}
        <div className="bg-gradient-to-r from-rose-950/70 via-purple-950/60 to-blue-950/70 rounded-2xl border border-rose-500/30 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase animate-pulse">
              🚨 CSCA EXAM 2026/27
            </span>
            <span className="text-rose-200">
              {lang === "ar"
                ? "هل تخطط لدراسة البكالوريوس (Software, E-Commerce, Medicine)؟ تعرف على المواد الإجبارية واحجز موعدك."
                : "Candidat Bachelor ? Découvrez les épreuves obligatoires du test CSCA selon votre filière et prenez RDV."}
            </span>
          </div>
          <Link
            href="/csca"
            className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs whitespace-nowrap shadow-sm transition-all"
          >
            {lang === "ar" ? "محاكي CSCA ➔" : "Simulateur CSCA ➔"}
          </Link>
        </div>

        {/* Hero Banner with Chinese Pagoda Night Background (Image 3) */}
        <section
          className="rounded-3xl overflow-hidden relative p-6 sm:p-10 border border-white/5 shadow-2xl bg-cover bg-center min-h-[200px] flex flex-col justify-center"
          style={{ backgroundImage: `url('${bgImage}')` }}
        >
          {/* Subtle gradient overlay to enhance text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070c18] via-[#070c18]/85 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <span>Hello, {studentName}</span>
              <span className="text-base">👋</span>
            </p>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-2">
              Find your path to{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                China.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Discover scholarships, universities, and opportunities that match your goals.
            </p>
          </div>
        </section>

        {/* 3 Action Cards (Image 3) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Explore scholarships */}
          <Link
            href="/scholarships"
            className="rounded-2xl p-5 bg-[#0d1527] border border-blue-500/20 hover:border-blue-500/60 transition-all flex items-center justify-between gap-4 group cursor-pointer shadow-md hover:shadow-blue-500/10"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan transition-colors">
                  Explore scholarships
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Find full and partial scholarships from Chinese universities.
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600/20 group-hover:bg-blue-600 text-blue-400 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-all">
              <ArrowRight className="w-4 h-4 rtl-flip" />
            </div>
          </Link>

          {/* 2. Discover universities */}
          <Link
            href="/universities"
            className="rounded-2xl p-5 bg-[#0d1527] border border-emerald-500/20 hover:border-emerald-500/60 transition-all flex items-center justify-between gap-4 group cursor-pointer shadow-md hover:shadow-emerald-500/10"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Discover universities
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Explore Chinese universities, programs and campuses.
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 group-hover:bg-emerald-600 text-emerald-400 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-all">
              <ArrowRight className="w-4 h-4 rtl-flip" />
            </div>
          </Link>

          {/* 3. Track applications */}
          <Link
            href="/tracker?view=traceability"
            className="rounded-2xl p-5 bg-[#0d1527] border border-purple-500/20 hover:border-purple-500/60 transition-all flex items-center justify-between gap-4 group cursor-pointer shadow-md hover:shadow-purple-500/10"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Track applications
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Manage your university applications from one place.
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-600/20 group-hover:bg-purple-600 text-purple-400 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-all">
              <ArrowRight className="w-4 h-4 rtl-flip" />
            </div>
          </Link>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. "RECOMMENDED FOR YOU" SECTION (Image 3)
        ───────────────────────────────────────────────────────────── */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Recommended for you
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Opportunities selected based on your profile.
              </p>
            </div>
            <Link
              href="/scholarships"
              className="text-xs font-bold text-cyan hover:underline flex items-center gap-1"
            >
              <span>View all scholarships</span>
              <ArrowRight className="w-3.5 h-3.5 rtl-flip" />
            </Link>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedScholarships.map((item) => {
              const isSaved = savedFavorites.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#0d1527] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between overflow-hidden group shadow-md"
                >
                  <div>
                    {/* University Logo & Info Header */}
                    <div className="p-3.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full ${item.logoBg} flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm`}
                        >
                          {item.university.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan transition-colors">
                            {item.university}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {item.city}
                          </p>
                        </div>
                      </div>

                      {/* Bookmark Favorite Heart */}
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isSaved ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Campus Image */}
                    <div className="relative h-32 w-full overflow-hidden bg-slate-800">
                      <img
                        src={item.image}
                        alt={item.university}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `${basePath}/images/china-night-pagoda.jpeg`;
                        }}
                      />
                    </div>

                    {/* Scholarship Details */}
                    <div className="p-3.5 space-y-2.5">
                      <h5 className="text-xs font-bold text-white line-clamp-1">
                        {item.scholarship}
                      </h5>

                      {/* Degree & Funding Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {item.degree}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.fundingColor}`}
                        >
                          {item.funding}
                        </span>
                      </div>

                      {/* Deadline */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Deadline: {item.deadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* View Scholarship CTA Button */}
                  <div className="p-3.5 pt-0">
                    <Link
                      href={`/scholarships`}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
                    >
                      <span>View Scholarship</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl-flip" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. BOTTOM ROW: APPLICATION JOURNEY & NEED HELP (Image 3)
        ───────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column: Your Application Journey */}
          <div className="rounded-2xl p-5 bg-[#0d1527] border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Your application journey
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    3 applications in progress.
                  </p>
                </div>
                <Link
                  href="/tracker"
                  className="text-xs font-bold text-cyan hover:underline flex items-center gap-1"
                >
                  <span>View all applications</span>
                  <ArrowRight className="w-3 h-3 rtl-flip" />
                </Link>
              </div>

              {/* 5-Step Timeline Pipeline (Image 3) */}
              <div className="flex items-center justify-between mb-6 px-2 text-[10px]">
                {[
                  { id: "wishlist", label: "Wishlist", done: true },
                  { id: "preparing", label: "Preparing", done: true },
                  { id: "applied", label: "Applied", current: true },
                  { id: "review", label: "Under Review", pending: true },
                  { id: "accepted", label: "Accepted", pending: true },
                ].map((step, idx) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        step.current
                          ? "bg-blue-600 text-white ring-4 ring-blue-600/30"
                          : step.done
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500"
                          : "bg-slate-800 text-slate-500 border border-white/5"
                      }`}
                    >
                      {step.done ? "✓" : idx + 1}
                    </div>
                    <span
                      className={`mt-1 font-semibold ${
                        step.current
                          ? "text-blue-400"
                          : step.done
                          ? "text-slate-300"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Active Application Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      CA
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Chang'an University
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Master in Logistics and Supply Chain Management
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Applied
                  </span>
                </div>

                {/* Progress Bar (70%) */}
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-[70%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Next step: Upload recommendation letter</span>
                    <span className="font-bold text-blue-400">70%</span>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/tracker"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all"
            >
              <span>Continue Application</span>
              <ArrowRight className="w-3.5 h-3.5 rtl-flip" />
            </Link>
          </div>

          {/* Right Column: Need help with your application? & Profile (Image 3) */}
          <div className="rounded-2xl p-5 bg-[#0d1527] border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Need help with your application?
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Connect with verified study-abroad service providers.
                  </p>
                </div>
                <Link
                  href="/services"
                  className="text-xs font-bold text-cyan hover:underline flex items-center gap-1"
                >
                  <span>View all services</span>
                  <ArrowRight className="w-3 h-3 rtl-flip" />
                </Link>
              </div>

              {/* 3 Quick Service Provider Cards (Image 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
                {/* 1. Translation */}
                <Link
                  href="/services"
                  className="p-3 rounded-xl bg-slate-900/80 border border-white/5 hover:border-blue-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white mb-1">
                      Translation
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Certified document translation.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 group-hover:underline mt-2 flex items-center gap-0.5">
                    Find a provider ➔
                  </span>
                </Link>

                {/* 2. Visa Support */}
                <Link
                  href="/services"
                  className="p-3 rounded-xl bg-slate-900/80 border border-white/5 hover:border-cyan/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-cyan/20 text-cyan flex items-center justify-center mb-2">
                      <Plane className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white mb-1">
                      Visa Support
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Get help with your visa application.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-cyan group-hover:underline mt-2 flex items-center gap-0.5">
                    Find a provider ➔
                  </span>
                </Link>

                {/* 3. Airport Pickup */}
                <Link
                  href="/services"
                  className="p-3 rounded-xl bg-slate-900/80 border border-white/5 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                      <Car className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white mb-1">
                      Airport Pickup
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Arrange transportation in China.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 group-hover:underline mt-2 flex items-center gap-0.5">
                    Find a provider ➔
                  </span>
                </Link>
              </div>

              {/* Complete Your Profile Box (Image 3) */}
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Complete your profile
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Your profile is 65% complete. Complete your profile to receive better scholarship recommendations.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <div className="w-9 h-9 rounded-full border-2 border-cyan/60 flex items-center justify-center font-bold text-cyan text-xs">
                    65%
                  </div>
                  <Link
                    href="/profile"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs whitespace-nowrap shadow-sm"
                  >
                    Complete Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
