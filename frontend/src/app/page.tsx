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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { fetchApi, getToken } from "@/lib/api";
import AuthGateModal from "@/components/AuthGateModal";

const FALLBACK_STATS = [
  { label: "Scholarships", value: 401, suffix: "+" },
  { label: "Universities", value: 102, suffix: "+" },
  { label: "Cities", value: 24, suffix: "+" },
];

const features = [
  {
    icon: Sparkles,
    title: "AI Matching",
    description:
      "Our AI analyzes your profile to find the perfect scholarship match for your academic background and goals.",
    color: "from-cyan to-blue",
    glowClass: "glow-cyan",
  },
  {
    icon: Target,
    title: "Application Tracker",
    description:
      "Track all your scholarship applications in one place. Never miss a deadline again.",
    color: "from-purple to-pink-500",
    glowClass: "glow-purple",
  },
  {
    icon: Bell,
    title: "Deadline Alerts",
    description:
      "Get smart notifications before deadlines approach. Stay ahead of every opportunity.",
    color: "from-blue to-purple",
    glowClass: "glow-blue",
  },
];

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
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [showAuthGate, setShowAuthGate] = useState(false);

  // Impose login modal on visitors as the first experience
  useEffect(() => {
    if (!getToken()) {
      const timer = setTimeout(() => {
        setShowAuthGate(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    fetchApi<{ scholarships: number; universities: number; cities: number }>("/stats/")
      .then((res) => {
        if (res.data) {
          setStats([
            { label: "Scholarships", value: res.data.scholarships, suffix: "+" },
            { label: "Universities", value: res.data.universities, suffix: "+" },
            { label: "Cities", value: res.data.cities, suffix: "+" },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  function handleDiscover() {
    if (!getToken()) {
      setShowAuthGate(true);
      return;
    }
    router.push("/scholarships");
  }

  function doSearch() {
    if (!getToken()) {
      setShowAuthGate(true);
      return;
    }
    try {
      sessionStorage.setItem("home-query", query.trim());
    } catch {}
    router.push("/scholarships");
  }

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 bg-grid py-12">
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
              <span>Next-Gen AI Matching • 102 Universities Verified</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight"
          >
            <span className="text-text-primary">Discover Your Future</span>
            <br />
            <span className="gradient-text drop-shadow-[0_0_40px_rgba(6,182,212,0.35)]">
              in China
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Find, apply, and track scholarships at top Chinese universities.
            Powered by AI to match you with the perfect full and partial funding opportunity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-xl mx-auto mb-8"
          >
            <div className="glass rounded-2xl p-2 flex items-center gap-2 glow-cyan-sm border border-cyan/30 focus-within:border-cyan focus-within:shadow-[0_0_35px_rgba(6,182,212,0.35)] transition-all">
              <Search className="w-5 h-5 text-cyan ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search scholarships by name, university, or field..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none py-3 px-2 text-sm sm:text-base"
              />
              <button
                onClick={doSearch}
                className="btn-gradient px-6 py-3 rounded-xl text-sm font-bold flex-shrink-0 cursor-pointer"
              >
                <span>Search</span>
              </button>
            </div>

            {/* Quick interactive search suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-text-muted">
              <span className="flex items-center gap-1 font-semibold text-text-secondary">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Hot:
              </span>
              {["Chengdu", "Beijing", "Guangzhou", "Full Scholarship", "Computer Science", "Medicine"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setQuery(tag);
                    try {
                      sessionStorage.setItem("home-query", tag);
                    } catch {}
                    router.push("/scholarships");
                  }}
                  className="px-2.5 py-1 rounded-lg glass text-text-secondary hover:text-cyan hover:border-cyan/40 transition-all cursor-pointer"
                >
                  {tag}
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
              <span>Discover Scholarships</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </button>
            <button
              onClick={() => {
                if (!getToken()) setShowAuthGate(true);
                else router.push("/ai-chat");
              }}
              className="glass px-8 py-4 rounded-xl text-base font-semibold text-text-primary hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple" />
              Try AI Assistant
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
                <MapPin className="w-3.5 h-3.5 text-cyan" /> Explore Academic Hubs
              </span>
              <Link
                href="/universities"
                className="text-xs font-semibold text-cyan hover:text-purple transition-colors flex items-center gap-1"
              >
                View all 24 cities →
              </Link>
            </div>
            <div className="flex items-center justify-center flex-wrap gap-2.5">
              {[
                { city: "Beijing", count: "18 Unis" },
                { city: "Guangzhou", count: "10 Unis" },
                { city: "Chengdu", count: "9 Unis" },
                { city: "Shanghai", count: "8 Unis" },
                { city: "Wuhan", count: "8 Unis" },
                { city: "Nanjing", count: "8 Unis" },
                { city: "Xi'an", count: "5 Unis" },
                { city: "Shenzhen", count: "3 Unis" },
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
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center glass rounded-3xl p-8 card-hover relative overflow-hidden group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan/20 to-purple/20 border border-cyan/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-cyan/10">
                  {i === 0 ? (
                    <GraduationCap className="w-6 h-6 text-cyan" />
                  ) : i === 1 ? (
                    <Building2 className="w-6 h-6 text-purple" />
                  ) : (
                    <MapPin className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <p className="text-text-secondary mt-2 text-sm font-semibold">
                  {stat.label}
                </p>
                <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> 100% Live Database
                </div>
              </motion.div>
            ))}
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
              Everything You Need
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto text-base">
              From discovery to application, we provide the tools to make your
              scholarship journey seamless.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
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
              Free <span className="gradient-text">Student Tools</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Interactive helpers built from what the best scholarship platforms offer.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                href: "/eligibility",
                icon: BadgeCheck,
                title: "Eligibility Checker",
                desc: "Answer 3 questions, get a % match with reasons for every scholarship.",
                color: "from-cyan to-blue",
              },
              {
                href: "/compare",
                icon: Scale,
                title: "Compare Scholarships",
                desc: "Side-by-side funding, deadlines, tuition and places. Tap + on any card.",
                color: "from-purple to-pink-500",
              },
              {
                href: "/sop",
                icon: PenLine,
                title: "Motivation Letter Studio",
                desc: "AI-written statement of purpose, downloadable as PDF or Word.",
                color: "from-blue to-purple",
              },
              {
                href: "/pre-departure",
                icon: Plane,
                title: "Pre-Departure Checklist",
                desc: "Visa, housing, money, packing — tick everything before you fly.",
                color: "from-amber-500 to-purple",
              },
            ].map((tool, i) => (
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
            Ready to Start Your Journey?
          </h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto text-base">
            Join thousands of students who have found their perfect full and partial scholarship
            in China.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                if (!getToken()) setShowAuthGate(true);
                else router.push("/scholarships");
              }}
              className="btn-gradient px-8 py-4 rounded-xl text-base cursor-pointer shadow-lg shadow-purple/20 transform hover:scale-105 transition-transform"
            >
              <span>Create Free Account</span>
            </button>
            <button
              onClick={handleDiscover}
              className="glass px-8 py-4 rounded-xl text-base font-semibold text-text-primary hover:bg-white/10 transition-all cursor-pointer"
            >
              Explore Scholarships
            </button>
          </div>
        </motion.div>
      </section>

      <footer className="py-8 px-4 border-t border-border-glass">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <span>ChinaScholar - AI-Powered Scholarship Platform</span>
          <div className="flex gap-6">
            <Link href="/scholarships" className="hover:text-cyan transition-colors">
              Scholarships
            </Link>
            <Link href="/universities" className="hover:text-cyan transition-colors">
              Universities
            </Link>
            <Link href="/ai-chat" className="hover:text-cyan transition-colors">
              AI Chat
            </Link>
            <Link href="/dashboard" className="hover:text-cyan transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>

      {/* Foggy Auth Gate Modal */}
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        title="Welcome to ChinaScholar"
        subtitle="Sign in to explore 100+ Chinese Universities & 400+ Full & Partial Scholarships"
        onSuccess={() => router.push("/scholarships")}
      />
    </div>
  );
}
