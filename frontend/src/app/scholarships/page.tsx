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
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ScholarshipCard from "@/components/ScholarshipCard";
import {
  fetchApi,
  getCurrentUser,
  getToken,
  type Scholarship,
  type University,
  type User,
} from "@/lib/api";
import { useLang } from "@/lib/i18n";

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

  useEffect(() => {
    try {
      const v = sessionStorage.getItem("sch-selected-uni");
      if (v) setSelectedUni(Number(v));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (selectedUni !== null) {
        sessionStorage.setItem("sch-selected-uni", String(selectedUni));
      } else {
        sessionStorage.removeItem("sch-selected-uni");
      }
    } catch {}
  }, [selectedUni]);

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
    setSelectedUni(id);
    setSelectedCity("All Cities");
    setSearchQuery("");
  };

  const activeFilters =
    (selectedLevel !== "All Levels" && selectedUni !== null ? 1 : 0) +
    (selectedType !== "All Types" && selectedUni !== null ? 1 : 0) +
    (selectedCity !== "All Cities" && selectedUni === null ? 1 : 0);

  const clearFilters = () => {
    setSelectedLevel("All Levels");
    setSelectedType("All Types");
    setSelectedCity("All Cities");
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

        {/* Step 2 header */}
        {selectedUni !== null && selectedUniEntry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => setSelectedUni(null)}
              className="flex items-center gap-2 text-text-muted hover:text-cyan transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("sch.backToUnis")}
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
                      onClick={() => setSelectedCity("All Cities")}
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
                        onClick={() => setSelectedCity(city)}
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
                <p className="text-sm text-text-muted mb-4">
                  {t("com.showing")}{" "}
                  <span className="text-text-primary font-medium">
                    {filteredUnis.length}
                  </span>{" "}
                  {t("com.of")} {universities.length} {t("uni.exploreB")}
                </p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredUnis.map((u, i) => (
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
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-text-muted mb-4">
                  {t("com.showing")}{" "}
                  <span className="text-text-primary font-medium">
                    {uniScholarships.length}
                  </span>{" "}
                  {t("com.of")} {t("uni.scholarships")}
                </p>
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
    </div>
  );
}
