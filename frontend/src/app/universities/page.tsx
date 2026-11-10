'use client';

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  GraduationCap,
  CheckCircle2,
  X,
  Crown,
  Sparkles,
  Building,
  Filter,
  BookOpen,
  Layers,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import { fetchApi, getCurrentUser, getToken, type University, type User } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import UniversityCard from "@/components/UniversityCard";
import AuthGateModal from "@/components/AuthGateModal";
import LifetimePassModal from "@/components/LifetimePassModal";
import {
  REAL_UNIVERSITIES,
  MAJOR_CATEGORIES,
  DEGREE_OPTIONS,
  type MajorCategory,
  type DegreeOption,
  type EnrichedUniversity,
} from "@/data/universitiesData";

const C9_KEYWORDS = [
  "tsinghua", "peking", "fudan", "shanghai jiao tong", "zhejiang",
  "science and technology of china", "ustc", "nanjing university",
  "harbin institute of technology", "xi'an jiaotong"
];

export default function UniversitiesPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [all, setAll] = useState<University[]>(REAL_UNIVERSITIES as unknown as University[]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState<string>("all");
  const [selectedDegree, setSelectedDegree] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<"all" | "c9" | "985" | "211">("all");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [user, setUser] = useState<User | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [res, userRes] = await Promise.all([
          fetchApi<University[]>("/universities/"),
          getToken() ? getCurrentUser() : Promise.resolve({ data: null }),
        ]);

        if (res.data) {
          const fetched = Array.isArray(res.data) ? res.data : (res.data as any).results ?? [];
          if (fetched.length > 0) {
            // Merge fetched universities with our rich local dataset for degrees, majors, and tiers
            const enrichedMap = new Map<number, EnrichedUniversity>(
              REAL_UNIVERSITIES.map((u) => [u.id, u])
            );
            const merged = fetched.map((f: University) => {
              const local = enrichedMap.get(f.id);
              return {
                ...f,
                degrees: local?.degrees || ["bachelor", "master", "phd"],
                majors: local?.majors || ["cs_ai", "business"],
                major_degrees: local?.major_degrees,
                popular_programs: local?.popular_programs || ["Computer Science", "Business"],
                tier: local?.tier || "national",
                tierLabel: local?.tierLabel || "National Key Institution",
                scholarships_count: local?.scholarships_count || 5,
              };
            });
            setAll(merged);
          }
        }
        if (userRes.data) {
          setUser(userRes.data);
        }
      } catch {
        // Gracefully use local REAL_UNIVERSITIES fallback
        setAll(REAL_UNIVERSITIES as unknown as University[]);
      }
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

  const activeMajorObj = useMemo(
    () => MAJOR_CATEGORIES.find((m) => m.id === selectedMajor) || MAJOR_CATEGORIES[0],
    [selectedMajor]
  );

  const activeDegreeObj = useMemo(
    () => DEGREE_OPTIONS.find((d) => d.id === selectedDegree) || DEGREE_OPTIONS[0],
    [selectedDegree]
  );

  const filtered = useMemo(() => {
    let r = all;

    // 1. Program-level matching: Major and Degree COMBINED
    if (selectedMajor !== "all" && selectedDegree !== "all") {
      r = r.filter((u) => {
        const degs = u.major_degrees?.[selectedMajor];
        // If the university does not offer this degree for this major (e.g. language year for CS or Medicine), reject!
        return Boolean(degs && degs.includes(selectedDegree as any));
      });
    } else if (selectedMajor !== "all") {
      // Only Major selected: check if university offers this major
      r = r.filter((u) => {
        if (u.majors && u.majors.includes(selectedMajor)) return true;
        const cat = MAJOR_CATEGORIES.find((m) => m.id === selectedMajor);
        if (cat) {
          const haystack = (
            u.name +
            " " +
            (u.popular_programs || []).join(" ") +
            " " +
            (u.description || "")
          ).toLowerCase();
          return cat.subMajors.some((sub) => haystack.includes(sub.toLowerCase()));
        }
        return false;
      });
    } else if (selectedDegree !== "all") {
      // Only Degree selected (Major is "all"):
      r = r.filter((u) => {
        if (selectedDegree === "language") {
          // If Language degree is selected, only universities offering Chinese language prep should match
          const langDegs = u.major_degrees?.["language"];
          return Boolean(langDegs && langDegs.includes("language"));
        }
        if (!u.degrees || u.degrees.length === 0) return true;
        return u.degrees.includes(selectedDegree as any);
      });
    }

    // 3. Filter by Tier / Category
    if (selectedTier === "c9") {
      r = r.filter((u) => u.tier === "c9" || C9_KEYWORDS.some((k) => u.name.toLowerCase().includes(k)));
    } else if (selectedTier === "985") {
      r = r.filter(
        (u) =>
          u.tier === "985" ||
          u.tier === "c9" ||
          (u.tagline || "").includes("985") ||
          C9_KEYWORDS.some((k) => u.name.toLowerCase().includes(k))
      );
    } else if (selectedTier === "211") {
      r = r.filter((u) => u.tier === "211" || u.tier === "985" || u.tier === "c9");
    }

    // 4. Filter by optional city
    if (selectedCity !== "All Cities") {
      r = r.filter((u) => (u.city || "Other") === selectedCity);
    }

    // 5. Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      r = r.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.city || "").toLowerCase().includes(q) ||
          (u.popular_programs || []).some((p) => p.toLowerCase().includes(q)) ||
          (u.motto || "").toLowerCase().includes(q)
      );
    }

    return r;
  }, [all, selectedMajor, selectedDegree, selectedTier, selectedCity, searchQuery]);

  const resetAllFilters = () => {
    setSelectedMajor("all");
    setSelectedDegree("all");
    setSelectedTier("all");
    setSelectedCity("All Cities");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedMajor !== "all" ||
    selectedDegree !== "all" ||
    selectedTier !== "all" ||
    selectedCity !== "All Cities" ||
    Boolean(searchQuery.trim());

  return (
    <div className="min-h-screen text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-cyan/30">
      <StudentSidebar activeTab="universities" />
      <div className="flex-1 flex flex-col min-w-0 bg-[#060a14]/65 backdrop-blur-[2px] min-h-screen">
        <div className="px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
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
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    {lang === "ar"
                      ? "🇨🇳 الدليل الرسمي للجامعات الصينية"
                      : lang === "fr"
                      ? "🇨🇳 Répertoire Officiel ScholarChina"
                      : "🇨🇳 ScholarChina Official Directory"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan/15 text-cyan border border-cyan/30">
                    {lang === "ar"
                      ? "102 جامعة رائدة في الصين"
                      : lang === "fr"
                      ? "102 Universités d'élite en Chine"
                      : "102 Elite Universities in China"}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-text-primary">
                  {lang === "ar" ? "استكشف " : lang === "fr" ? "Explorer les " : "Explore "}
                  <span className="gradient-text">
                    {lang === "ar" ? "الجامعات الصينية" : lang === "fr" ? "Universités" : "Universities"}
                  </span>
                </h1>
              </div>

              {/* Quick Stats Pill */}
              <div className="flex items-center gap-3">
                <div className="glass px-4 py-2 rounded-2xl border border-border-glass text-right">
                  <div className="text-xs text-text-muted">
                    {lang === "ar"
                      ? "المؤسسات المتاحة"
                      : lang === "fr"
                      ? "Établissements disponibles"
                      : "Available Institutions"}
                  </div>
                  <div className="text-lg font-bold text-cyan">
                    {filtered.length}{" "}
                    {lang === "ar" ? "جامعة" : lang === "fr" ? "Universités" : "Universities"}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-text-secondary max-w-3xl text-sm sm:text-base">
              {lang === "ar"
                ? "ابحث حسب التخصص المطلوب، والدرجة العلمية (بكالوريوس، ماستر، دكتوراه)، واستكشف أكثر من 100 جامعة صينية معتمدة مع جولات 3D VR الافتراضية وحصص المنح الحكومية CSC."
                : lang === "fr"
                ? "Filtrez par filière, choisissez votre niveau d'études (Licence, Master, Doctorat) et explorez plus de 100 universités chinoises d'élite avec visites 3D VR et quotas de bourses CSC."
                : "Filter by academic major, select your degree level (Bachelor, Master, PhD), and discover 100+ accredited Chinese institutions with 3D VR campus tours and CSC scholarship quotas."}
            </p>
          </motion.div>

          {/* ========================================================================= */}
          {/* SMART MAJOR & DEGREE FINDER (Directly addressing User Request)             */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-gradient-to-br from-[#0c1a33]/90 via-[#0e1726]/90 to-[#08101e]/90 border border-white/10 p-5 sm:p-7 shadow-2xl backdrop-blur-xl mb-8 relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Filter Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan/25">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {lang === "ar"
                        ? "مُطابق الجامعات حسب التخصص والدرجة العلمية"
                        : lang === "fr"
                        ? "Sélecteur d'Universités par Filière & Diplôme"
                        : "University Matcher by Major & Degree Level"}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {lang === "ar"
                        ? "اختر التخصص المطلوب، ثم حدد الدرجة (بكالوريوس / ماستر / دكتوراه) لعرض الجامعات المتاحة"
                        : lang === "fr"
                        ? "Choisissez votre filière puis le diplôme souhaité pour afficher les universités disponibles"
                        : "Select your major first, then specify your target degree to list all available universities"}
                    </p>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan" />
                    <span>{lang === "ar" ? "إعادة ضبط المرشحات" : lang === "fr" ? "Réinitialiser" : "Reset Filters"}</span>
                  </button>
                )}
              </div>

              {/* STEP 1: SELECT MAJOR / DISCIPLINE */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {lang === "ar"
                        ? "الخطوة 1: اختر التخصص الأكاديمي المطلوب"
                        : lang === "fr"
                        ? "Étape 1 : Choisissez votre filière d'études"
                        : "Step 1: Choose Your Academic Major"}
                    </h3>
                  </div>
                  <span className="text-xs text-cyan font-medium">
                    {lang === "ar" ? activeMajorObj.name_ar : lang === "fr" ? activeMajorObj.name_fr : activeMajorObj.name}
                  </span>
                </div>

                {/* Major Categories Carousel / Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {MAJOR_CATEGORIES.map((cat) => {
                    const isSelected = selectedMajor === cat.id;
                    const title = lang === "ar" ? cat.name_ar : lang === "fr" ? cat.name_fr : cat.name;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedMajor(cat.id)}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between min-h-[76px] ${
                          isSelected
                            ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan text-white border-cyan/60 shadow-lg shadow-blue-500/25 scale-[1.02]"
                            : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-slate-300 hover:text-white hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xl">{cat.icon}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-xs font-bold line-clamp-2 leading-tight">
                          {title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-majors Preview Pill */}
                {selectedMajor !== "all" && activeMajorObj.subMajors && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
                    <span className="text-cyan font-bold flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {lang === "ar" ? "تشمل البرامج والتخصصات:" : lang === "fr" ? "Filières incluses :" : "Programs included:"}
                    </span>
                    {activeMajorObj.subMajors.map((sub) => (
                      <span
                        key={sub}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-200"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* STEP 2: SELECT DEGREE LEVEL ("then ask them if bachelor or which degree") */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan/20 text-cyan font-bold text-xs flex items-center justify-center border border-cyan/30">
                      2
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {lang === "ar"
                        ? "الخطوة 2: حدد الدرجة العلمية (بكالوريوس / ماستر / دكتوراه)"
                        : lang === "fr"
                        ? "Étape 2 : Sélectionnez le diplôme (Licence / Master / Doctorat)"
                        : "Step 2: Select Degree Level (Bachelor / Master / PhD)"}
                    </h3>
                  </div>
                  <span className="text-xs text-cyan font-medium">
                    {lang === "ar" ? activeDegreeObj.name_ar : lang === "fr" ? activeDegreeObj.name_fr : activeDegreeObj.name}
                  </span>
                </div>

                {/* Degree Option Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {DEGREE_OPTIONS.map((deg) => {
                    const isSelected = selectedDegree === deg.id;
                    const isLanguageDegree = deg.id === "language";
                    const isNonLanguageMajor = selectedMajor !== "all" && selectedMajor !== "language";
                    const isNotApplicable = isLanguageDegree && isNonLanguageMajor;
                    const title = lang === "ar" ? deg.name_ar : lang === "fr" ? deg.name_fr : deg.name;
                    return (
                      <button
                        key={deg.id}
                        onClick={() => setSelectedDegree(deg.id)}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                          isSelected
                            ? "bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan text-white border-emerald-400/50 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                            : isNotApplicable
                            ? "bg-white/[0.015] border-white/5 text-slate-400 hover:border-white/10 opacity-75"
                            : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-slate-300 hover:text-white hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xl">{deg.icon}</span>
                          <span className="text-[10px] font-mono opacity-80">{deg.duration}</span>
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-bold leading-tight">{title}</span>
                          </div>
                          {isNotApplicable ? (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {lang === "ar" ? "خاص باللغة الصينية فقط" : lang === "fr" ? "Filière langue uniquement" : "Language major only"}
                            </span>
                          ) : (
                            <div className="text-[10px] opacity-75 line-clamp-1">{deg.description}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: SEARCH, CITY & TIER REFINEMENT BAR */}
              <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center gap-2.5">
                {/* Search Input */}
                <div className="flex-1 flex items-center gap-2 w-full bg-slate-900/70 rounded-2xl px-3 py-2 border border-white/10">
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder={
                      lang === "ar"
                        ? "ابحث باسم الجامعة أو المدينة أو البرنامج..."
                        : lang === "fr"
                        ? "Rechercher par université, ville ou programme..."
                        : "Search by university name, city, or program..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder:text-slate-400 outline-none text-xs sm:text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* City Dropdown */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto bg-slate-900/70 rounded-2xl px-3 py-2 border border-white/10">
                  <MapPin className="w-4 h-4 text-cyan flex-shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer w-full sm:w-44"
                  >
                    <option value="All Cities" className="bg-slate-900 text-white">
                      {lang === "ar" ? "📍 جميع المدن" : lang === "fr" ? "📍 Toutes les villes" : "📍 All Cities"}
                    </option>
                    {cities.map(([c, count]) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {c} ({count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tier Quick Filter Buttons */}
                <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto scrollbar-none">
                  {[
                    { id: "all", label: "All Tiers" },
                    { id: "c9", label: "C9 League (Top 9)" },
                    { id: "985", label: "Project 985" },
                    { id: "211", label: "Project 211" },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedTier === tier.id
                          ? "bg-cyan text-slate-950 font-bold shadow-md shadow-cyan/20"
                          : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* RESULTS SUMMARY BAR ("then list for them the universities available")       */}
          {/* ========================================================================= */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-cyan/10 border border-cyan/20 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-300">
              <span className="font-bold text-white text-sm">
                🎯 {lang === "ar" ? "تم العثور على" : lang === "fr" ? "Résultats :" : "Available Institutions:"}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan text-slate-950 font-black text-xs">
                {filtered.length} {lang === "ar" ? "جامعة معتمدة" : lang === "fr" ? "universités disponibles" : "universities available"}
              </span>

              {/* Active Badges */}
              {selectedMajor !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <span>{activeMajorObj.icon}</span>
                  <span>{lang === "ar" ? activeMajorObj.name_ar : lang === "fr" ? activeMajorObj.name_fr : activeMajorObj.name}</span>
                  <button onClick={() => setSelectedMajor("all")} className="hover:text-white">✕</button>
                </span>
              )}

              {selectedDegree !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span>{activeDegreeObj.icon}</span>
                  <span>{lang === "ar" ? activeDegreeObj.name_ar : lang === "fr" ? activeDegreeObj.name_fr : activeDegreeObj.name}</span>
                  <button onClick={() => setSelectedDegree("all")} className="hover:text-white">✕</button>
                </span>
              )}

              {selectedCity !== "All Cities" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple/20 text-purple border border-purple/30">
                  <span>📍 {selectedCity}</span>
                  <button onClick={() => setSelectedCity("All Cities")} className="hover:text-white">✕</button>
                </span>
              )}

              {selectedTier !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-mono text-[10px]">
                  <span>🏆 {selectedTier.toUpperCase()}</span>
                  <button onClick={() => setSelectedTier("all")} className="hover:text-white">✕</button>
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-cyan hover:underline font-bold text-xs cursor-pointer ml-auto"
              >
                {lang === "ar" ? "عرض كل الجامعات ↺" : lang === "fr" ? "Afficher toutes ↺" : "Show All Universities ↺"}
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* GRID OF MATCHING UNIVERSITIES                                             */}
          {/* ========================================================================= */}
          {filtered.length === 0 ? (
            <div className="glass rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 border border-white/10 shadow-2xl">
              <Building className="w-14 h-14 text-cyan mx-auto mb-3 opacity-70" />
              <h3 className="text-xl font-bold text-white mb-2">
                {lang === "ar" ? "لم يتم العثور على جامعات مطابقة" : lang === "fr" ? "Aucune université correspondante" : "No Universities Found"}
              </h3>

              {selectedDegree === "language" && selectedMajor !== "all" && selectedMajor !== "language" ? (
                <div className="my-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-left">
                  <div className="font-bold flex items-center gap-1.5 mb-1.5 text-amber-300 text-sm">
                    <span>💡</span>
                    <span>
                      {lang === "ar"
                        ? "توضيح أكاديمي هام:"
                        : lang === "fr"
                        ? "Clarification académique :"
                        : "Academic Clarification:"}
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    {lang === "ar"
                      ? `السنة التحضيرية للغة الصينية (فصل إلى فصلين) مخصصة فقط لدراسة اللغة الصينية واجتياز HSK، ولا تمنح شهادة جامعية في ${activeMajorObj.name_ar}. للحصول على شهادة أكاديمية في هذا التخصص، يرجى اختيار البكالوريوس، الماستر أو الدكتوراه.`
                      : lang === "fr"
                      ? `L'année préparatoire de langue chinoise (1-2 semestres) est strictement dédiée à l'apprentissage du chinois (HSK) et ne délivre pas de diplôme universitaire en ${activeMajorObj.name_fr}. Pour obtenir un diplôme dans cette filière, veuillez sélectionner Licence, Master ou Doctorat.`
                      : `A Chinese Language & Preparatory year (1-2 semesters) is exclusively dedicated to Chinese language learning (HSK) and does not grant a degree qualification in ${activeMajorObj.name}. To obtain an academic degree in this field, please select Bachelor's, Master's, or PhD.`}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => setSelectedDegree("bachelor")}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan to-blue-600 text-white font-bold text-xs shadow-md shadow-cyan/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      🎓 {lang === "ar" ? "عرض برامج البكالوريوس (Licence)" : lang === "fr" ? "Voir les Licences / Bachelor" : "Switch to Bachelor's Degree"}
                    </button>
                    <button
                      onClick={() => setSelectedDegree("master")}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      📜 {lang === "ar" ? "عرض برامج الماستر (Master)" : lang === "fr" ? "Voir les Masters" : "Switch to Master's Degree"}
                    </button>
                    <button
                      onClick={() => setSelectedMajor("language")}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      🇨🇳 {lang === "ar" ? "تغيير التخصص إلى اللغة الصينية" : lang === "fr" ? "Changer vers Filière Chinois" : "Switch to Chinese Language Major"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  {lang === "ar"
                    ? `لا توجد جامعات تطابق معايير البحث الحالية (${activeMajorObj.name_ar} • ${activeDegreeObj.name_ar} • ${selectedCity}). يرجى توسيع نطاق البحث أو إعادة تعيين المرشحات.`
                    : lang === "fr"
                    ? `Aucune université ne correspond aux filtres actifs (${activeMajorObj.name_fr} • ${activeDegreeObj.name_fr} • ${selectedCity}). Essayez d'élargir vos critères.`
                    : `No universities currently match your active combination (${activeMajorObj.name} • ${activeDegreeObj.name} • ${selectedCity}). Try relaxing your filters.`}
                </p>
              )}
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan/20 hover:scale-105 transition-all cursor-pointer"
              >
                {lang === "ar" ? "عرض جميع الجامعات (102)" : lang === "fr" ? "Voir les 102 universités" : "View All 102 Universities"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {filtered.map((uni, idx) => (
                <UniversityCard key={uni.id} university={uni} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        role="student"
        canClose={true}
        title={
          lang === "ar"
            ? "بوابة الطلاب المغاربة"
            : lang === "fr"
            ? "Portail Étudiants Marocains"
            : "Moroccan Student Access"
        }
        subtitle={
          lang === "ar"
            ? "سجل الدخول أو أنشئ حساباً لاستكشاف أكثر من 100 جامعة صينية والتقديم على منح CSC."
            : lang === "fr"
            ? "Connectez-vous pour explorer plus de 100 universités chinoises et postuler aux bourses CSC."
            : "Sign in or register to explore 100+ Chinese universities and apply for CSC scholarships."
        }
      />

      <LifetimePassModal
        isOpen={showLifetimeModal}
        onClose={() => setShowLifetimeModal(false)}
      />
    </div>
  );
}
