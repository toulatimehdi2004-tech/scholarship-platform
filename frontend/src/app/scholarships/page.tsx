"use client";

import { motion } from "framer-motion";
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  Lock,
  MapPin,
  GraduationCap,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ScholarshipCard from "@/components/ScholarshipCard";
import AuthGateModal from "@/components/AuthGateModal";
import LifetimePassModal from "@/components/LifetimePassModal";
import {
  fetchApi,
  getCurrentUser,
  getToken,
  type Scholarship,
  type University,
  type User,
} from "@/lib/api";
import { useLang } from "@/lib/i18n";

const FREE_TRIAL_LIMIT = 7;

const levelValues = ["All Levels", "bachelor", "master", "phd", "other"];
const levelLabelKeys: Record<string, string> = {
  "All Levels": "sch.lvlAll",
  bachelor: "sch.bachelor",
  master: "sch.master",
  phd: "sch.phd",
  other: "sch.language",
};

const typeValues = ["All Types", "full", "partial", "living", "research"];
const typeLabelKeys: Record<string, string> = {
  "All Types": "sch.typeAll",
  full: "sch.full",
  partial: "sch.partial",
  living: "sch.living",
  research: "sch.research",
};

interface UniEntry {
  id: number;
  name: string;
  city: string;
  country: string;
  verified: boolean;
  count: number;
}

export default function ScholarshipsPage() {
  const { t } = useLang();
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [uniInfo, setUniInfo] = useState<Map<number, University>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedUni, setSelectedUni] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);

  // Sync city & uni selection from URL and support browser Back button
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cityParam = params.get("city");
      if (cityParam) setSelectedCity(cityParam);
      const uniParam = params.get("uni");
      if (uniParam) setSelectedUni(Number(uniParam));
    } catch {}

    const onPopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const cityParam = params.get("city") || "All Cities";
        setSelectedCity(cityParam);
        const uniParam = params.get("uni");
        setSelectedUni(uniParam ? Number(uniParam) : null);
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
      } else {
        url.searchParams.delete("city");
      }
      window.history.pushState({ city }, "", url.toString());
    } catch {}
  };

  useEffect(() => {
    async function loadScholarships() {
      setLoading(true);
      const [schRes, uniRes, userRes] = await Promise.all([
        fetchApi<Scholarship[]>("/scholarships/"),
        fetchApi<University[]>("/universities/"),
        getToken() ? getCurrentUser() : Promise.resolve({ data: null }),
      ]);
      if (schRes.data) {
        setAllScholarships(schRes.data);
      }
      if (uniRes.data) {
        const list = Array.isArray(uniRes.data)
          ? uniRes.data
          : (uniRes.data as any).results ?? [];
        setUniInfo(new Map(list.map((u: University) => [u.id, u])));
      }
      if (userRes.data) {
        setUser(userRes.data);
      } else if (!getToken()) {
        setShowAuthGate(true);
      }
      setLoading(false);
    }
    loadScholarships();
  }, []);

  // Pick up a search query sent from the homepage hero
  useEffect(() => {
    try {
      const q = sessionStorage.getItem("home-query");
      if (q) {
        setSearchQuery(q);
        sessionStorage.removeItem("home-query");
      }
    } catch {}
  }, []);

  // Step 1: each university exactly once, with its scholarship count
  const universities = useMemo<UniEntry[]>(() => {
    const map = new Map<number, UniEntry>();
    for (const s of allScholarships) {
      const id = Number(s.university);
      const info = uniInfo.get(id);
      const entry = map.get(id) || {
        id,
        name: s.university_name || info?.name || "Unknown University",
        city: s.university_city || info?.city || "Other",
        country: (s as any).university_country || info?.country || "",
        verified: info?.is_verified || false,
        count: 0,
      };
      entry.count += 1;
      if (s.university_name) entry.name = s.university_name;
      if (s.university_city) entry.city = s.university_city;
      if (info?.is_verified) entry.verified = true;
      map.set(id, entry);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [allScholarships, uniInfo]);

  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of universities) {
      counts.set(u.city, (counts.get(u.city) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [universities]);

  const filteredUnis = useMemo(() => {
    let r = universities;
    if (selectedCity !== "All Cities") {
      r = r.filter((u) => u.city === selectedCity);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.city.toLowerCase().includes(q)
      );
    }
    return r;
  }, [universities, selectedCity, searchQuery]);

  // Step 2: scholarships of the chosen university
  const selectedUniEntry = useMemo(
    () => universities.find((u) => u.id === selectedUni) || null,
    [universities, selectedUni]
  );

  const uniScholarships = useMemo(() => {
    if (selectedUni === null) return [];
    let r = allScholarships.filter(
      (s) => String(s.university) === String(selectedUni)
    );
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter((s) => s.title.toLowerCase().includes(q));
    }
    if (selectedLevel !== "All Levels") {
      r = r.filter((s) => s.level === selectedLevel);
    }
    if (selectedType !== "All Types") {
      r = r.filter((s) => s.type === selectedType);
    }
    return r;
  }, [allScholarships, selectedUni, searchQuery, selectedLevel, selectedType]);

  const selectUni = (id: number) => {
    if (!getToken()) {
      setShowAuthGate(true);
      return;
    }
    setSelectedUni(id);
    setSearchQuery("");
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("uni", String(id));
      window.history.pushState({ uni: id }, "", url.toString());
    } catch {}
  };

  const backToUnis = () => {
    setSelectedUni(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("uni");
      window.history.pushState({ uni: null }, "", url.toString());
    } catch {}
  };

  const activeFilters =
    (selectedLevel !== "All Levels" && selectedUni !== null ? 1 : 0) +
    (selectedType !== "All Types" && selectedUni !== null ? 1 : 0) +
    (selectedCity !== "All Cities" && selectedUni === null ? 1 : 0);

  const clearFilters = () => {
    setSelectedLevel("All Levels");
    setSelectedType("All Types");
    handleSelectCity("All Cities");
    setSearchQuery("");
  };

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
            {t("sch.browseA")} <span className="gradient-text">{t("sch.browseB")}</span>
          </h1>
          <p className="text-text-secondary">
            {t("sch.subtitle")}
          </p>
        </motion.div>

        {/* Premium Upgrade Banner */}
        {user && !user.student_profile?.is_premium && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple/10 to-cyan/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-purple flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t("sch.freeA", { n: allScholarships.length })}
                </p>
                <p className="text-xs text-text-muted">
                  {t("sch.freeB")}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              {t("com.upgrade")}
            </Link>
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-2xl p-2 mb-8 flex items-center gap-2"
        >
          <Search className="w-5 h-5 text-text-muted ml-3" />
          <input
            type="text"
            placeholder={t("sch.searchPh")}
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-3 rounded-xl glass hover:bg-white/10 transition-all text-text-secondary"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Mobile & Quick City Chips Bar (Always visible on mobile & desktop when selecting a university) */}
        {selectedUni === null && (
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
              <span className="text-xs opacity-75">({universities.length})</span>
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
        )}

        {/* Active City Banner & One-Click Return to All Cities */}
        {selectedUni === null && selectedCity !== "All Cities" && (
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
              <span>← {t("uni.allCities")} ({universities.length})</span>
            </button>
            <div className="text-sm text-text-secondary flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan" />
              <span>
                {t("sch.city")}: <strong className="text-cyan font-bold">{selectedCity}</strong> ({filteredUnis.length} {t("nav.universities")})
              </span>
            </div>
          </motion.div>
        )}

        {/* Step 2 header */}
        {selectedUni !== null && selectedUniEntry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={backToUnis}
              className="flex items-center gap-2 text-text-muted hover:text-cyan transition-colors mb-3 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>← {t("sch.backToUnis")}</span>
            </button>
            <h2 className="text-2xl font-bold text-text-primary">
              {t("sch.availableAt", { name: selectedUniEntry.name })}
            </h2>
            <p className="text-sm text-text-muted mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {selectedUniEntry.city}
              {selectedUniEntry.country ? ", " + selectedUniEntry.country : ""}
            </p>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`glass rounded-2xl p-6 lg:w-72 flex-shrink-0 h-fit ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-cyan" />
                <h3 className="text-lg font-semibold text-text-primary">
                  {t("sch.filters")}
                </h3>
                {activeFilters > 0 && (
                  <span className="text-xs bg-cyan/20 text-cyan px-2 py-0.5 rounded-full">
                    {activeFilters}
                  </span>
                )}
              </div>
              {activeFilters > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-text-muted hover:text-red-400 transition-colors"
                >
                  {t("sch.clearAll")}
                </button>
              )}
            </div>

            <div className="space-y-6">
              {selectedUni === null ? (
                /* Step 1: City Filter */
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-3 block">
                    {t("sch.city")}
                  </label>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    <button
                      onClick={() => handleSelectCity("All Cities")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                        selectedCity === "All Cities"
                          ? "bg-cyan/10 text-cyan border border-cyan/20"
                          : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                      }`}
                    >
                      <span>{t("uni.allCities")}</span>
                      <span className="text-xs text-text-muted">
                        {universities.length}
                      </span>
                    </button>
                    {cities.map(([city, count]) => (
                      <button
                        key={city}
                        onClick={() => handleSelectCity(city)}
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
                </div>
              ) : (
                <>
                  {/* Step 2: Level Filter */}
                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-3 block">
                      {t("sch.eduLevel")}
                    </label>
                    <div className="space-y-2">
                      {levelValues.map((value) => (
                        <button
                          key={value}
                          onClick={() => setSelectedLevel(value)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            selectedLevel === value
                              ? "bg-purple/10 text-purple border border-purple/20"
                              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                          }`}
                        >
                          {t(levelLabelKeys[value])}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-3 block">
                      {t("sch.schType")}
                    </label>
                    <div className="space-y-2">
                      {typeValues.map((value) => (
                        <button
                          key={value}
                          onClick={() => setSelectedType(value)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            selectedType === value
                              ? "bg-blue/10 text-blue border border-blue/20"
                              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                          }`}
                        >
                          {t(typeLabelKeys[value])}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.aside>

          {/* Results */}
          <div className="flex-1">
            {selectedUni === null ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <p className="text-sm text-text-muted">
                    {t("com.showing")}{" "}
                    <span className="text-text-primary font-medium">
                      {user?.student_profile?.is_premium
                        ? filteredUnis.length
                        : Math.min(filteredUnis.length, FREE_TRIAL_LIMIT)}
                    </span>{" "}
                    {t("com.of")} {universities.length} {t("uni.exploreB")}
                    {!user?.student_profile?.is_premium && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Lock className="w-3 h-3" /> Free Trial ({FREE_TRIAL_LIMIT} Universities)
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
                      <div
                        key={i}
                        className="glass rounded-2xl p-6 h-40 animate-pulse"
                      >
                        <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                        <div className="h-4 bg-white/10 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredUnis.length === 0 ? (
                  <div className="glass rounded-2xl p-16 text-center">
                    <p className="text-text-secondary text-lg mb-2">
                      {t("uni.noRes")}
                    </p>
                    <p className="text-text-muted text-sm mb-4">
                      {t("uni.noResSub")}
                    </p>
                    <button
                      onClick={clearFilters}
                      className="btn-gradient text-sm px-4 py-2 rounded-lg"
                    >
                      <span>{t("sch.clearFilters")}</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Unlocked / Free Trial Universities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(user?.student_profile?.is_premium
                        ? filteredUnis
                        : filteredUnis.slice(0, FREE_TRIAL_LIMIT)
                      ).map((u, i) => (
                        <motion.button
                          key={u.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04 }}
                          onClick={() => selectUni(u.id)}
                          className="glass rounded-2xl p-6 card-hover group text-left h-full flex flex-col"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center flex-shrink-0">
                              <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-text-primary group-hover:text-cyan transition-colors line-clamp-1">
                                {u.name}
                              </h3>
                              <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {u.city}
                              </p>
                            </div>
                            {u.verified && (
                              <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex-shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                                {t("com.verified")}
                              </span>
                            )}
                          </div>
                          <span className="mt-auto flex items-center justify-between text-sm font-medium text-cyan group-hover:text-purple transition-colors">
                            {u.count} {t("uni.scholarships")}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Foggy Locked Section for Free Trial Users */}
                    {!user?.student_profile?.is_premium && filteredUnis.length > FREE_TRIAL_LIMIT && (
                      <div className="relative mt-8 pt-4">
                        {/* Blurred foggy background preview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 filter blur-md opacity-30 select-none pointer-events-none">
                          {filteredUnis.slice(FREE_TRIAL_LIMIT, FREE_TRIAL_LIMIT + 6).map((u, i) => (
                            <div
                              key={u.id}
                              className="glass rounded-2xl p-6 text-left h-full flex flex-col"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center flex-shrink-0">
                                  <GraduationCap className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-semibold text-text-primary line-clamp-1">
                                    {u.name}
                                  </h3>
                                  <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3" />
                                    {u.city}
                                  </p>
                                </div>
                              </div>
                              <span className="mt-auto flex items-center justify-between text-sm font-medium text-cyan">
                                {u.count} {t("uni.scholarships")}
                              </span>
                            </div>
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
                              Upgrade once to unlock all <strong className="text-text-primary">100+ Universities</strong> (Chengdu, Beijing, Guangzhou, Shanghai, Wuhan, Xi'an) and <strong className="text-text-primary">400+ Full & Partial Scholarships</strong>.
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
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <p className="text-sm text-text-muted">
                    {t("com.showing")}{" "}
                    <span className="text-text-primary font-medium">
                      {uniScholarships.length}
                    </span>{" "}
                    {t("com.of")} {t("uni.scholarships")}
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
                      <span>Unlock All 400+ Scholarships ($29)</span>
                    </button>
                  )}
                </div>

                {!user?.student_profile?.is_premium && (
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple/10 to-cyan/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-purple flex items-center justify-center flex-shrink-0">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs sm:text-sm text-text-secondary">
                        Viewing <strong className="text-text-primary">{selectedUniEntry?.name}</strong>. Unlock all <strong className="text-text-primary">100+ Universities</strong> and <strong className="text-text-primary">400+ Scholarships</strong> with the Scholar Lifetime VIP Pass.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowLifetimeModal(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-purple text-white text-xs font-bold hover:opacity-90 transition-opacity flex-shrink-0 flex items-center gap-1.5"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>$29 Pay Once</span>
                    </button>
                  </div>
                )}

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="glass rounded-2xl p-6 h-64 animate-pulse"
                      >
                        <div className="h-4 bg-white/10 rounded w-20 mb-4" />
                        <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                      </div>
                    ))}
                  </div>
                ) : uniScholarships.length === 0 ? (
                  <div className="glass rounded-2xl p-16 text-center">
                    <p className="text-text-secondary text-lg mb-2">
                      {t("sch.noRes")}
                    </p>
                    <p className="text-text-muted text-sm mb-4">
                      {t("sch.noResSub")}
                    </p>
                    <button
                      onClick={clearFilters}
                      className="btn-gradient text-sm px-4 py-2 rounded-lg"
                    >
                      <span>{t("sch.clearFilters")}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {uniScholarships.map((scholarship, i) => (
                      <ScholarshipCard
                        key={scholarship.id}
                        scholarship={scholarship}
                        index={i}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Auth & Lifetime Modals */}
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        title="Sign In to Discover Scholarships"
        subtitle="Explore 100+ Chinese Universities & 400+ Full & Partial Scholarships"
      />

      <LifetimePassModal
        isOpen={showLifetimeModal}
        onClose={() => setShowLifetimeModal(false)}
      />
    </div>
  );
}
