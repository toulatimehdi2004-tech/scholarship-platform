"use client";

import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  Target,
  Bell,
  ArrowRight,
  BadgeCheck,
  Scale,
  PenLine,
  Plane,
  MapPin,
  GraduationCap,
  Building2,
  CheckCircle2,
  Flame,
  Crown,
  Quote,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { fetchApi, getToken, clearToken } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import AuthGateModal from "@/components/AuthGateModal";
import AutoText from "@/components/AutoText";
import PortalChooser, { type PortalRole } from "@/components/PortalChooser";

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = target;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="text-4xl sm:text-5xl font-black gradient-text tracking-tight">
      {count}
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [query, setQuery] = useState("");
  const [scholarshipCount, setScholarshipCount] = useState(401);
  const [universityCount, setUniversityCount] = useState(102);
  const [cityCount, setCityCount] = useState(24);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [portalRole, setPortalRole] = useState<PortalRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication & stored role on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getToken();
      const savedRole = localStorage.getItem("portal_role") as PortalRole | null;
      if (!token) {
        setIsAuthenticated(false);
        router.push("/");
      } else {
        setIsAuthenticated(true);
        setPortalRole(savedRole || "student");
      }
    }
  }, [router]);

  // Redirect if authenticated non-student role
  useEffect(() => {
    if (isAuthenticated) {
      if (portalRole === "university") {
        router.push("/university-portal");
      } else if (portalRole === "provider") {
        router.push("/provider-portal");
      }
    }
  }, [isAuthenticated, portalRole, router]);

  // Load stats from API
  useEffect(() => {
    fetchApi<{ scholarships: number; universities: number; cities: number }>("/stats/")
      .then((res) => {
        if (res.data) {
          if (res.data.scholarships) setScholarshipCount(res.data.scholarships);
          if (res.data.universities) setUniversityCount(res.data.universities);
          if (res.data.cities) setCityCount(res.data.cities);
        }
      })
      .catch(() => {});
  }, []);

  function handleDiscover() {
    router.push("/scholarships");
  }

  function doSearch() {
    if (query.trim()) {
      try {
        sessionStorage.setItem("home-query", query.trim());
      } catch {}
    }
    router.push("/scholarships");
  }

  const features = [
    {
      icon: Sparkles,
      title: t("home.featAiTitle"),
      description: t("home.featAiDesc"),
      color: "from-cyan to-blue",
      glowClass: "glow-cyan",
    },
    {
      icon: Target,
      title: t("home.featTrackerTitle"),
      description: t("home.featTrackerDesc"),
      color: "from-purple to-pink-500",
      glowClass: "glow-purple",
    },
    {
      icon: Bell,
      title: t("home.featAlertTitle"),
      description: t("home.featAlertDesc"),
      color: "from-blue to-purple",
      glowClass: "glow-blue",
    },
  ];

  const studentTools = [
    {
      href: "/eligibility",
      icon: BadgeCheck,
      title: t("home.toolElTitle"),
      desc: t("home.toolElDesc"),
      color: "from-cyan to-blue",
    },
    {
      href: "/compare",
      icon: Scale,
      title: t("home.toolCmpTitle"),
      desc: t("home.toolCmpDesc"),
      color: "from-purple to-pink-500",
    },
    {
      href: "/sop",
      icon: PenLine,
      title: t("home.toolSopTitle"),
      desc: t("home.toolSopDesc"),
      color: "from-blue to-purple",
    },
    {
      href: "/pre-departure",
      icon: Plane,
      title: t("home.toolDepTitle"),
      desc: t("home.toolDepDesc"),
      color: "from-amber-500 to-purple",
    },
  ];

  const featuredStories = [
    {
      name: "Amina El Fassi",
      city: "Fez, Morocco",
      uni: "Zhejiang University",
      scholarship: "CSC Type A Full Scholarship",
      degree: "MSc Computer Science",
      tip: "Pick 2-3 specific labs or professors at your target university and connect your background to their current papers.",
      initials: "AF",
    },
    {
      name: "Yassine Benali",
      city: "Casablanca, Morocco",
      uni: "Tsinghua University",
      scholarship: "CSC Bilateral Program",
      degree: "PhD Robotics",
      tip: "Reach out to potential supervisors with a 2-page research synopsis to secure a Pre-Admission Letter early.",
      initials: "YB",
    },
    {
      name: "Sara Ouazzani",
      city: "Rabat, Morocco",
      uni: "Fudan University",
      scholarship: "Shanghai Government Scholarship",
      degree: "Master of International Business",
      tip: "Explore municipal scholarships in Shanghai and Jiangsu — full funding with less competition than central CSC.",
      initials: "SO",
    },
  ];

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050e09]">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  // FIRST PAGE ALWAYS: "Who Are You?" Portal Chooser for unauthenticated visitors
  if (isAuthenticated === false) {
    return (
      <PortalChooser
        onSelectRole={(role) => {
          try {
            localStorage.setItem("portal_role", role);
          } catch {}
          setPortalRole(role);
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

  return (
    <div className="min-h-screen">
      {/* Active Portal Banner with quick role switch */}
      <div className="bg-emerald-950/60 border-b border-emerald-500/20 py-2 px-4 text-center text-xs text-emerald-300 font-medium flex items-center justify-center gap-2">
        <span className="flex items-center gap-1.5 font-bold">
          🎓 {t("home.workspace")}
        </span>
        <span className="opacity-40">•</span>
        <button
          onClick={() => {
            clearToken();
            try {
              localStorage.removeItem("portal_role");
              localStorage.removeItem("user");
            } catch {}
            router.push("/");
          }}
          className="text-white hover:text-cyan underline font-bold cursor-pointer"
        >
          {t("home.switchRole")}
        </button>
      </div>

      <section className="relative min-h-[90vh] flex items-center justify-center px-4 bg-grid py-12">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs sm:text-sm text-cyan font-bold border border-cyan/30 shadow-lg shadow-cyan/15 animate-shimmer mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan" />
              </span>
              <span>{t("home.badge")}</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight"
          >
            <span className="text-text-primary">{t("home.heroTitle1")}</span>
            <br />
            <span className="gradient-text drop-shadow-[0_0_40px_rgba(37,99,235,0.35)]">
              {t("home.heroTitle2")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t("home.heroSubtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-xl mx-auto mb-8"
          >
            <div className="glass rounded-2xl p-2 flex items-center gap-2 glow-cyan-sm border border-cyan/30 focus-within:border-cyan focus-within:shadow-[0_0_35px_rgba(37,99,235,0.35)] transition-all">
              <Search className="w-5 h-5 text-cyan ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder={t("home.searchPh")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none py-3 px-2 text-sm sm:text-base"
              />
              <button
                onClick={doSearch}
                className="btn-gradient px-6 py-3 rounded-xl text-sm font-bold flex-shrink-0 cursor-pointer"
              >
                <span>{t("home.searchBtn")}</span>
              </button>
            </div>

            {/* Quick interactive search suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-text-muted">
              <span className="flex items-center gap-1 font-semibold text-text-secondary">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> {t("home.hot")}
              </span>
              {[
                { tag: "Chengdu", label: lang === "ar" ? "تشنغدو" : "Chengdu" },
                { tag: "Beijing", label: lang === "ar" ? "بكين" : "Beijing" },
                { tag: "Guangzhou", label: lang === "ar" ? "غوانزو" : "Guangzhou" },
                { tag: "Full Scholarship", label: t("home.tagFull") },
                { tag: "Computer Science", label: t("home.tagCs") },
                { tag: "Medicine", label: t("home.tagMed") },
              ].map((item) => (
                <button
                  key={item.tag}
                  onClick={() => {
                    setQuery(item.tag);
                    try {
                      sessionStorage.setItem("home-query", item.tag);
                    } catch {}
                    router.push("/scholarships");
                  }}
                  className="px-2.5 py-1 rounded-lg glass text-text-secondary hover:text-cyan hover:border-cyan/40 transition-all cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={handleDiscover}
              className="btn-gradient px-8 py-4 rounded-xl text-base flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan/20 transform hover:scale-105 transition-transform"
            >
              <span>{t("home.btnDiscover")}</span>
              <ArrowRight className="w-4 h-4 relative z-10 rtl-flip" />
            </button>
            <Link
              href="/pricing"
              className="px-6 py-4 rounded-xl text-base font-bold bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-300 hover:bg-amber-500/25 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 transform hover:scale-105 cursor-pointer"
            >
              <Crown className="w-5 h-5 text-amber-400" />
              <span>{t("home.btnVip")}</span>
            </Link>
            <button
              onClick={() => {
                if (!getToken()) setShowAuthGate(true);
                else router.push("/ai-chat");
              }}
              className="glass px-8 py-4 rounded-xl text-base font-semibold text-text-primary hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple" />
              {t("home.btnAi")}
            </button>
          </motion.div>

          {/* Top Cities Showcase Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-14 pt-8 border-t border-border-glass max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan" /> {t("home.hubsTitle")}
              </span>
              <Link
                href="/universities"
                className="text-xs font-semibold text-cyan hover:text-purple transition-colors flex items-center gap-1"
              >
                {t("home.viewAllCities")}
              </Link>
            </div>
            <div className="flex items-center justify-center flex-wrap gap-2.5">
              {[
                { city: "Beijing", count: "18" },
                { city: "Guangzhou", count: "10" },
                { city: "Chengdu", count: "9" },
                { city: "Shanghai", count: "8" },
                { city: "Wuhan", count: "8" },
                { city: "Nanjing", count: "8" },
                { city: "Xi'an", count: "5" },
                { city: "Shenzhen", count: "3" },
              ].map((c) => (
                <button
                  key={c.city}
                  onClick={() => router.push(`/scholarships/?city=${c.city}`)}
                  className="px-3.5 py-2 rounded-xl glass hover:bg-white/10 hover:border-cyan/40 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span className="text-xs font-bold text-text-primary group-hover:text-cyan transition-colors">
                    {c.city}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan/15 text-cyan font-semibold">
                    {c.count}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center glass rounded-3xl p-8 card-hover relative overflow-hidden group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan/20 to-purple/20 border border-cyan/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-cyan/10">
                <GraduationCap className="w-6 h-6 text-cyan" />
              </div>
              <AnimatedCounter target={scholarshipCount} suffix="+" />
              <p className="text-text-secondary mt-2 text-sm font-semibold">
                {t("home.statSch")}
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> {t("home.liveDb")}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center glass rounded-3xl p-8 card-hover relative overflow-hidden group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan/20 to-purple/20 border border-cyan/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-cyan/10">
                <Building2 className="w-6 h-6 text-purple" />
              </div>
              <AnimatedCounter target={universityCount} suffix="+" />
              <p className="text-text-secondary mt-2 text-sm font-semibold">
                {t("home.statUni")}
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> {t("home.liveDb")}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center glass rounded-3xl p-8 card-hover relative overflow-hidden group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan/20 to-purple/20 border border-cyan/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-cyan/10">
                <MapPin className="w-6 h-6 text-emerald-400" />
              </div>
              <AnimatedCounter target={cityCount} suffix="+" />
              <p className="text-text-secondary mt-2 text-sm font-semibold">
                {t("home.statCities")}
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> {t("home.liveDb")}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
              {t("home.needTitle")}
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto text-base">
              {t("home.needSub")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass rounded-3xl p-8 card-hover group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:${feature.glowClass} transition-all duration-300 shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Tools Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
              {t("home.toolsTitle")}
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              {t("home.toolsSub")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentTools.map((tool, i) => (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href={tool.href}
                  className="glass rounded-2xl p-6 card-hover group block h-full border border-border-glass"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 shadow-md`}
                  >
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-cyan transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {tool.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Featured Preview Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
                <Users className="w-3.5 h-3.5" />
                <span>{t("home.storiesBannerTitle")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                {t("stories.title")}
              </h2>
              <p className="text-text-secondary max-w-2xl mt-2 text-sm sm:text-base">
                {t("home.storiesBannerSub")}
              </p>
            </div>
            <Link
              href="/stories"
              className="btn-gradient px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 flex-shrink-0 cursor-pointer self-start md:self-auto"
            >
              <span>{t("home.storiesBannerBtn")}</span>
              <ArrowRight className="w-4 h-4 rtl-flip" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredStories.map((story, i) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass rounded-3xl p-6 card-hover flex flex-col justify-between border border-border-glass relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan to-purple text-white font-black flex items-center justify-center text-sm shadow-md">
                        {story.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary text-sm sm:text-base">
                          {story.name}
                        </h4>
                        <p className="text-xs text-text-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan" /> {story.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="text-xs font-bold text-cyan bg-cyan/10 px-2.5 py-1 rounded-lg inline-block">
                      🏛️ {story.uni}
                    </div>
                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{story.scholarship}</span>
                    </div>
                    <div className="text-xs text-text-muted">
                      🎓 <AutoText text={story.degree} />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-text-secondary leading-relaxed relative">
                    <Quote className="w-4 h-4 text-cyan/30 absolute -top-2 left-2" />
                    <p className="italic pt-1">&ldquo;<AutoText text={story.tip} />&rdquo;</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border-glass">
                  <Link
                    href="/stories"
                    className="text-xs font-bold text-cyan hover:text-purple transition-colors flex items-center justify-between group"
                  >
                    <span>{t("stories.readFull")}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 rtl-flip transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 sm:p-16 glow-purple border border-purple/30 relative overflow-hidden"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto text-base">
            {t("home.ctaSub")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                if (!getToken()) setShowAuthGate(true);
                else router.push("/scholarships");
              }}
              className="btn-gradient px-8 py-4 rounded-xl text-base cursor-pointer shadow-lg shadow-purple/20 transform hover:scale-105 transition-transform"
            >
              <span>{t("home.ctaBtnAccount")}</span>
            </button>
            <button
              onClick={handleDiscover}
              className="glass px-8 py-4 rounded-xl text-base font-semibold text-text-primary hover:bg-white/10 transition-all cursor-pointer"
            >
              {t("home.ctaBtnExplore")}
            </button>
          </div>
        </motion.div>
      </section>

      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={showAuthGate && !getToken()}
        onClose={() => setShowAuthGate(false)}
        onBackToRoles={() => {
          setShowAuthGate(false);
          setPortalRole(null);
        }}
        role="student"
        canClose={true}
        title={lang === "ar" ? "ScholarChina • بوابة الطلاب المغاربة" : "ScholarChina • Student Access"}
        subtitle={lang === "ar" ? "سجل الدخول أو أنشئ حساباً لاستكشاف أكثر من 100 جامعة صينية وأكثر من 400 منحة CSC للطلاب المغاربة" : "Sign in or create an account to explore 100+ Chinese Universities & 400+ CSC Scholarships"}
        onSuccess={() => {
          setShowAuthGate(false);
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
