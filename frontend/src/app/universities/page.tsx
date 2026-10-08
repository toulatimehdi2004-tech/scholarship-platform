'use client';

import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  GraduationCap,
  CheckCircle2,
  X,
  Crown,
  Lock,
  Sparkles,
  Award,
  Cpu,
  HeartPulse,
  TrendingUp,
  Building,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchApi, getCurrentUser, getToken, type University, type User } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import UniversityCard from "@/components/UniversityCard";
import AuthGateModal from "@/components/AuthGateModal";
import LifetimePassModal from "@/components/LifetimePassModal";

const FREE_TRIAL_LIMIT = 7;

// University Tiers relevant to Moroccan students
const C9_KEYWORDS = [
  "tsinghua", "peking", "fudan", "shanghai jiao tong", "zhejiang",
  "science and technology of china", "ustc", "nanjing university",
  "harbin institute of technology", "xi'an jiaotong"
];

const STEM_KEYWORDS = [
  "technology", "polytechnic", "science", "engineering", "aeronautics",
  "posts", "telecom", "electronic", "scut", "hit", "buaa", "bit", "uestc",
  "xidian", "tongji", "ocean", "maritime", "geosciences"
];

const MED_KEYWORDS = [
  "medical", "medicine", "pharmaceutical", "health", "hospital", "smu",
  "peking union", "fudan med", "sjtu med"
];

const BIZ_KEYWORDS = [
  "finance", "economics", "foreign studies", "trade", "international studies",
  "cufe", "sufe", "swufe", "bfsu", "uibe", "management", "business"
];

export default function UniversitiesPage() {
  const { t } = useLang();
  const [all, setAll] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<"all" | "c9" | "985" | "stem" | "med" | "biz">("all");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [user, setUser] = useState<User | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [res, userRes] = await Promise.all([
        fetchApi<University[]>("/universities/"),
        getToken() ? getCurrentUser() : Promise.resolve({ data: null }),
      ]);
      if (res.data) {
        setAll(Array.isArray(res.data) ? res.data : (res.data as any).results ?? []);
      }
      if (userRes.data) {
        setUser(userRes.data);
      } else if (!getToken()) {
        setShowAuthGate(true);
      }
      setLoading(false);
    }
    load();
  }, []);

  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of all) {
      const c = u.city || "Other";
      counts.set(c, (counts.get(c) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [all]);

  const filtered = useMemo(() => {
    let r = all;

    // Filter by Tier / Category
    if (selectedTier === "c9") {
      r = r.filter((u) => {
        const name = u.name.toLowerCase();
        return C9_KEYWORDS.some((k) => name.includes(k));
      });
    } else if (selectedTier === "985") {
      r = r.filter((u) => {
        const tag = (u.tagline || "").toLowerCase();
        const desc = (u.description || "").toLowerCase();
        const name = u.name.toLowerCase();
        return tag.includes("985") || desc.includes("985") || C9_KEYWORDS.some((k) => name.includes(k));
      });
    } else if (selectedTier === "stem") {
      r = r.filter((u) => {
        const name = u.name.toLowerCase();
        const desc = (u.description || "").toLowerCase();
        return STEM_KEYWORDS.some((k) => name.includes(k) || desc.includes(k));
      });
    } else if (selectedTier === "med") {
      r = r.filter((u) => {
        const name = u.name.toLowerCase();
        const desc = (u.description || "").toLowerCase();
        return MED_KEYWORDS.some((k) => name.includes(k) || desc.includes(k));
      });
    } else if (selectedTier === "biz") {
      r = r.filter((u) => {
        const name = u.name.toLowerCase();
        const desc = (u.description || "").toLowerCase();
        return BIZ_KEYWORDS.some((k) => name.includes(k) || desc.includes(k));
      });
    }

    // Filter by optional city
    if (selectedCity !== "All Cities") {
      r = r.filter((u) => (u.city || "Other") === selectedCity);
    }

    // Filter by text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.city || "").toLowerCase().includes(q) ||
          (u.tagline || "").toLowerCase().includes(q) ||
          (u.motto || "").toLowerCase().includes(q)
      );
    }

    return r;
  }, [all, selectedTier, selectedCity, searchQuery]);

  const isPremium = !!user?.student_profile?.is_premium;
  const visibleUniversities = isPremium ? filtered : filtered.slice(0, FREE_TRIAL_LIMIT);
  const hiddenCount = Math.max(0, filtered.length - FREE_TRIAL_LIMIT);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  🇲🇦 Moroccan Scholar Directory
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan/15 text-cyan border border-cyan/30">
                  102 Elite Universities in China
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-text-primary">
                {t("uni.exploreA")} <span className="gradient-text">{t("uni.exploreB")}</span>
              </h1>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3">
              <div className="glass px-4 py-2 rounded-2xl border border-border-glass text-right">
                <div className="text-xs text-text-muted">Available Institutions</div>
                <div className="text-lg font-bold text-cyan">{filtered.length} Universities</div>
              </div>
            </div>
          </div>
          <p className="text-text-secondary max-w-2xl text-sm sm:text-base">
            Explore 100+ prestigious Chinese institutions accepting Moroccan scholars. Inspect 3D VR campus panoramas, degree programs, and full CSC scholarship quotas.
          </p>
        </motion.div>

        {/* Search & Compact City Dropdown Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-2xl p-2.5 mb-5 flex flex-col sm:flex-row items-center gap-2.5 border border-border-glass shadow-lg"
        >
          <div className="flex-1 flex items-center gap-2 w-full">
            <Search className="w-5 h-5 text-text-muted ml-2.5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by university name, major, or ranking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none py-2 px-1 text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1.5 text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Compact City Dropdown (Made small as Moroccan students don't need prominent city lists) */}
          <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3">
            <MapPin className="w-4 h-4 text-cyan flex-shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="glass rounded-xl px-3 py-2 text-xs font-semibold text-text-primary outline-none border border-white/10 bg-slate-900/80 cursor-pointer w-full sm:w-48"
              title="Filter by City (Optional)"
            >
              <option value="All Cities" className="bg-slate-900 text-white">
                📍 All Cities (Optional)
              </option>
              {cities.map(([c, count]) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c} ({count})
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Moroccan Student Prestige & Discipline Category Filter Chips */}
        <div className="mb-8 overflow-x-auto scrollbar-none flex items-center gap-2 pb-2">
          {[
            { id: "all", label: "🌟 All Universities", count: all.length },
            { id: "c9", label: "🏆 C9 League (Top 9)", count: 9 },
            { id: "985", label: "🎖️ Project 985 (National Elite)", count: 39 },
            { id: "stem", label: "⚡ Tech, AI & Engineering", count: null },
            { id: "med", label: "🏥 Medicine & Health", count: null },
            { id: "biz", label: "📊 Finance & Economics", count: null },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedTier(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedTier === cat.id
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan text-white shadow-lg shadow-emerald-500/25 scale-102"
                  : "glass text-text-secondary hover:text-white hover:bg-white/10 border border-border-glass"
              }`}
            >
              <span>{cat.label}</span>
              {cat.count && <span className="text-[11px] opacity-75">({cat.count})</span>}
            </button>
          ))}
        </div>

        {/* Active Filters Summary Bar */}
        {(selectedTier !== "all" || selectedCity !== "All Cities" || searchQuery) && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-cyan/10 border border-cyan/20 text-xs">
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="font-semibold text-text-primary">Showing:</span>
              <span className="text-cyan font-bold">{filtered.length} universities</span>
              {selectedTier !== "all" && (
                <span className="px-2 py-0.5 rounded bg-cyan/20 text-cyan uppercase font-mono text-[10px]">
                  Tier: {selectedTier.toUpperCase()}
                </span>
              )}
              {selectedCity !== "All Cities" && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  📍 {selectedCity}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedTier("all");
                setSelectedCity("All Cities");
                setSearchQuery("");
              }}
              className="text-cyan hover:underline font-bold"
            >
              Reset Filters ↺
            </button>
          </div>
        )}

        {/* Grid of University Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center max-w-md mx-auto">
            <Building className="w-12 h-12 text-cyan mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-text-primary mb-1">No Universities Found</h3>
            <p className="text-xs text-text-muted mb-4">
              Try adjusting your search criteria or clearing selected filters.
            </p>
            <button
              onClick={() => {
                setSelectedTier("all");
                setSelectedCity("All Cities");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-cyan/20 text-cyan text-xs font-bold hover:bg-cyan/30"
            >
              View All Universities
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {visibleUniversities.map((uni, idx) => (
                <UniversityCard key={uni.id} university={uni} index={idx} />
              ))}
            </div>

            {/* Free Trial Gate banner if user is unauthenticated or free */}
            {!isPremium && hiddenCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 mb-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-purple flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-text-primary mb-2">
                  Unlock All {all.length} Universities with Lifetime Pass
                </h3>
                <p className="text-sm text-text-secondary max-w-xl mx-auto mb-6">
                  You are previewing {FREE_TRIAL_LIMIT} universities. Unlock all {all.length} top Chinese universities, 400+ CSC scholarships, 3D VR campus tours, and AI translation tools forever for just $29.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setShowLifetimeModal(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-purple text-white font-black text-sm shadow-xl shadow-amber-500/25 hover:scale-105 transition-all cursor-pointer"
                  >
                    Get Lifetime VIP Pass ($29)
                  </button>
                  {!user && (
                    <button
                      onClick={() => setShowAuthGate(true)}
                      className="px-6 py-3 rounded-xl glass border border-white/20 text-text-primary font-bold text-sm hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Sign In to Account
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        role="student"
        canClose={true}
        title="Moroccan Student Access"
        subtitle="Sign in or register to explore 100+ Chinese universities and 3D VR campus walkthroughs."
      />

      <LifetimePassModal
        isOpen={showLifetimeModal}
        onClose={() => setShowLifetimeModal(false)}
      />
    </div>
  );
}
