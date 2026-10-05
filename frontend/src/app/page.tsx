"use client";

import { motion } from "framer-motion";
import { Search, Sparkles, Target, Bell, ArrowRight, BadgeCheck, Scale, PenLine, Plane } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib/api";

const FALLBACK_STATS = [
  { label: "Scholarships", value: 368, suffix: "+" },
  { label: "Universities", value: 79, suffix: "+" },
  { label: "Cities", value: 23, suffix: "+" },
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
    <span ref={ref} className="text-4xl sm:text-5xl font-bold gradient-text">
      {count}
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState(FALLBACK_STATS);

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

  function doSearch() {
    try {
      sessionStorage.setItem("home-query", query.trim());
    } catch {}
    router.push("/scholarships");
  }

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 bg-grid">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-2 rounded-full glass text-sm text-cyan mb-6 font-medium">
              AI-Powered Scholarship Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-text-primary">Discover Your Future</span>
            <br />
            <span className="gradient-text">in China</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10"
          >
            Find, apply, and track scholarships at top Chinese universities.
            Powered by AI to match you with the perfect opportunity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-xl mx-auto mb-12"
          >
            <div className="glass rounded-2xl p-2 flex items-center gap-2 glow-cyan-sm">
              <Search className="w-5 h-5 text-text-muted ml-3" />
              <input
                type="text"
                placeholder="Search scholarships by name, university, or field..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none py-3 px-2"
              />
              <button
                onClick={doSearch}
                className="btn-gradient px-6 py-3 rounded-xl text-sm"
              >
                <span>Search</span>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/scholarships"
              className="btn-gradient px-8 py-4 rounded-xl text-base flex items-center gap-2"
            >
              <span>Browse Scholarships</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </Link>
            <Link
              href="/ai-chat"
              className="glass px-8 py-4 rounded-xl text-base font-semibold text-text-primary hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple" />
              Try AI Assistant
            </Link>
          </motion.div>
        </div>
      </section>

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
                className="text-center glass rounded-2xl p-8 card-hover"
              >
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <p className="text-text-secondary mt-2 text-sm font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Everything You Need
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
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
                className="glass rounded-2xl p-8 card-hover group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:${feature.glowClass} transition-all duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">
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

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
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
                  className="glass rounded-2xl p-6 card-hover group block h-full"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}
                  >
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-cyan transition-colors">
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

      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 sm:p-16 glow-purple"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            Join thousands of students who have found their perfect scholarship
            in China.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/register"
              className="btn-gradient px-8 py-4 rounded-xl text-base"
            >
              <span>Create Free Account</span>
            </Link>
            <Link
              href="/scholarships"
              className="glass px-8 py-4 rounded-xl text-base font-semibold text-text-primary hover:bg-white/10 transition-all"
            >
              Explore Scholarships
            </Link>
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
            <Link href="/ai-chat" className="hover:text-cyan transition-colors">
              AI Chat
            </Link>
            <Link href="/dashboard" className="hover:text-cyan transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
