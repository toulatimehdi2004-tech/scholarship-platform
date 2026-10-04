'use client';

import { motion } from "framer-motion";
import { Search, MapPin, GraduationCap, CheckCircle2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchApi, type University } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import UniversityCard from "@/components/UniversityCard";

export default function UniversitiesPage() {
  const { t } = useLang();
  const [all, setAll] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchApi<University[]>("/universities/");
      if (res.data) {
        setAll(Array.isArray(res.data) ? res.data : (res.data as any).results ?? []);
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
          className="glass rounded-2xl p-2 mb-6 flex items-center gap-2"
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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-6 lg:w-72 flex-shrink-0 h-fit"
          >
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-cyan" />
              <h3 className="text-lg font-semibold text-text-primary">
                {t("sch.city")}
              </h3>
              {selectedCity !== "All Cities" && (
                <button
                  onClick={() => setSelectedCity("All Cities")}
                  className="ml-auto text-xs text-text-muted hover:text-red-400 transition-colors"
                >
                  {t("sch.clearAll")}
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              <button
                onClick={() => setSelectedCity("All Cities")}
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
                    setSelectedCity(city === selectedCity ? "All Cities" : city)
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
            <p className="text-sm text-text-muted mb-4">
              {t("com.showing")}{" "}
              <span className="text-text-primary font-medium">{filtered.length}</span>{" "}
              {t("com.of")} {all.length}
            </p>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((u, i) => (
                  <UniversityCard key={u.id} university={u} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
