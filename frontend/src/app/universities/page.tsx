'use client';

import { motion } from "framer-motion";
import { Search, MapPin, GraduationCap, CheckCircle2, X, ArrowLeft, Crown, Lock, Sparkles, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchApi, getCurrentUser, getToken, type University, type User } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import UniversityCard from "@/components/UniversityCard";
import AuthGateModal from "@/components/AuthGateModal";
import LifetimePassModal from "@/components/LifetimePassModal";

const FREE_TRIAL_LIMIT = 7;

export default function UniversitiesPage() {
  const { t } = useLang();
  const [all, setAll] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
        // Impose sign in modal if not logged in
        setShowAuthGate(true);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Sync city selection from URL and support browser Back button
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cityParam = params.get("city");
      if (cityParam) {
        setSelectedCity(cityParam);
      }
    } catch {}

    const onPopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const cityParam = params.get("city") || "All Cities";
        setSelectedCity(cityParam);
      } catch {}
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    try {
      const url = new URL(window.location.href);
      if (city !== "All Cities") {
        url.searchParams.set("city", city);
        window.history.pushState({ city }, "", url.toString());
      } else {
        url.searchParams.delete("city");
        window.history.pushState({ city: "All Cities" }, "", url.toString());
      }
    } catch {}
  };

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
    if (selectedCity !== "All Cities") {
      r = r.filter((u) => (u.city || "Other") === selectedCity);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.city || "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, selectedCity, searchQuery]);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            {t("uni.exploreA")} <span className="gradient-text">{t("uni.exploreB")}</span>
          </h1>
          <p className="text-text-secondary">{t("uni.subtitle")}</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-2xl p-2 mb-4 flex items-center gap-2"
        >
          <Search className="w-5 h-5 text-text-muted ml-3" />
          <input
            type="text"
            placeholder={t("uni.searchPh")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none py-3 px-2"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-2 text-text-muted hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Mobile & Quick City Chips Bar (Always visible on phone & desktop) */}
        <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none flex items-center gap-2 pb-2">
          <button
            onClick={() => handleSelectCity("All Cities")}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
              selectedCity === "All Cities"
                ? "btn-gradient text-white shadow-md shadow-cyan/20"
                : "glass text-text-secondary hover:text-text-primary hover:bg-white/10"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t("uni.allCities")}</span>
            <span className="text-xs opacity-75">({all.length})</span>
          </button>
          {cities.map(([city, count]) => (
            <button
              key={city}
              onClick={() => handleSelectCity(city === selectedCity ? "All Cities" : city)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
                selectedCity === city
                  ? "btn-gradient text-white shadow-md shadow-cyan/20"
                  : "glass text-text-secondary hover:text-text-primary hover:bg-white/10"
              }`}
            >
              <span>{city}</span>
              <span className="text-xs opacity-75">({count})</span>
            </button>
          ))}
        </div>

        {/* Active City Banner & One-Click Return to All Cities */}
        {selectedCity !== "All Cities" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl glass border border-cyan/20 glow-cyan-sm"
          >
            <button
              onClick={() => handleSelectCity("All Cities")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan/15 hover:bg-cyan/25 text-cyan text-sm font-semibold transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>← {t("uni.allCities")} ({all.length})</span>
            </button>
            <div className="text-sm text-text-secondary flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan" />
              <span>
                {t("sch.city")}: <strong className="text-cyan font-bold">{selectedCity}</strong> ({filtered.length} {t("nav.universities")})
              </span>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar (Desktop) */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:block glass rounded-2xl p-6 lg:w-72 flex-shrink-0 h-fit"
          >
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-cyan" />
              <h3 className="text-lg font-semibold text-text-primary">
                {t("sch.city")}
              </h3>
              {selectedCity !== "All Cities" && (
                <button
                  onClick={() => handleSelectCity("All Cities")}
                  className="ml-auto text-xs text-text-muted hover:text-red-400 transition-colors"
                >
                  {t("sch.clearAll")}
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              <button
                onClick={() => handleSelectCity("All Cities")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                  selectedCity === "All Cities"
                    ? "bg-cyan/10 text-cyan border border-cyan/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                <span>{t("uni.allCities")}</span>
                <span className="text-xs text-text-muted">{all.length}</span>
              </button>
              {cities.map(([city, count]) => (
                <button
                  key={city}
                  onClick={() =>
                    handleSelectCity(city === selectedCity ? "All Cities" : city)
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                    selectedCity === city
                      ? "bg-cyan/10 text-cyan border border-cyan/20"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  }`}
                >
                  <span>{city}</span>
                  <span className="text-xs text-text-muted">{count}</span>
                </button>
              ))}
            </div>
          </motion.aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-sm text-text-muted">
                {t("com.showing")}{" "}
                <span className="text-text-primary font-medium">
                  {user?.student_profile?.is_premium
                    ? filtered.length
                    : Math.min(filtered.length, FREE_TRIAL_LIMIT)}
                </span>{" "}
                {t("com.of")} {all.length} {t("nav.universities")}
                {!user?.student_profile?.is_premium && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Lock className="w-3 h-3" /> Free Trial (7 Universities)
                  </span>
                )}
              </p>

              {!user?.student_profile?.is_premium && (
                <button
                  onClick={() => {
                    if (!user) setShowAuthGate(true);
                    else setShowLifetimeModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400/20 to-purple/20 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-all"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Unlock All 100+ ($29 One-Time)</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass rounded-2xl p-6 h-48 animate-pulse">
                    <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="glass rounded-2xl p-16 text-center">
                <p className="text-text-secondary text-lg mb-2">{t("uni.noRes")}</p>
                <p className="text-text-muted text-sm">{t("uni.noResSub")}</p>
              </div>
            ) : (
              <div>
                {/* 1. Unlocked Universities (First 7 on free trial, all on VIP) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(user?.student_profile?.is_premium
                    ? filtered
                    : filtered.slice(0, FREE_TRIAL_LIMIT)
                  ).map((u, i) => (
                    <UniversityCard key={u.id} university={u} index={i} />
                  ))}
                </div>

                {/* 2. Foggy Locked Section for Free Trial Users */}
                {!user?.student_profile?.is_premium && filtered.length > FREE_TRIAL_LIMIT && (
                  <div className="relative mt-8 pt-4">
                    {/* Blurred foggy background preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 filter blur-md opacity-30 select-none pointer-events-none">
                      {filtered.slice(FREE_TRIAL_LIMIT, FREE_TRIAL_LIMIT + 6).map((u, i) => (
                        <UniversityCard key={u.id} university={u} index={i} />
                      ))}
                    </div>

                    {/* Imposing VIP Upgrade Box Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
                      <div className="glass rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-amber-500/40 shadow-2xl shadow-amber-500/20 text-center bg-slate-950/90 backdrop-blur-xl">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-purple flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
                          <Crown className="w-7 h-7 text-white" />
                        </div>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                          One-Time Payment • No Subscriptions
                        </span>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary mb-2">
                          Unlock All 100+ Universities & 400+ Scholarships
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary mb-5 max-w-md mx-auto leading-relaxed">
                          You are viewing the <strong className="text-cyan">7 Free Trial Universities</strong>.
                          Upgrade once to unlock all <strong className="text-text-primary">100+ Universities</strong> (Beijing, Chengdu, Guangzhou, Shanghai, Wuhan, Shenzhen) and <strong className="text-text-primary">400+ Full & Partial Scholarships</strong>.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                          <div className="text-center sm:text-left">
                            <div className="flex items-baseline justify-center sm:justify-start gap-1">
                              <span className="text-3xl font-black text-text-primary">$29</span>
                              <span className="text-xs text-text-muted line-through">$99</span>
                              <span className="text-xs font-bold text-amber-300 ml-1">Pay Once</span>
                            </div>
                            <p className="text-[11px] text-text-muted">Lifetime access, never pay again</p>
                          </div>

                          <button
                            onClick={() => {
                              if (!user) setShowAuthGate(true);
                              else setShowLifetimeModal(true);
                            }}
                            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-purple text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 hover:opacity-95 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <Crown className="w-4 h-4 text-amber-200" />
                            <span>Unlock Lifetime Access ($29)</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-text-muted pt-3 border-t border-white/10">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100+ Universities
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan" /> 400+ Scholarships
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple" /> Full & Partial Funding
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth & Lifetime Modals */}
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        title="Sign In to Discover Universities"
        subtitle="Access 100+ Top Chinese Universities and start your free trial"
      />

      <LifetimePassModal
        isOpen={showLifetimeModal}
        onClose={() => setShowLifetimeModal(false)}
      />
    </div>
  );
}
