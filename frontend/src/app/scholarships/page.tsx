"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  Award,
  ExternalLink,
  Heart,
  Bell,
  Clock,
  Layers,
  Building2,
  ChevronDown,
  User as UserIcon,
  BookOpen,
  DollarSign,
  Home as HomeIcon,
  ShieldCheck,
  Check,
  Info,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import ScholarshipEmblem, {
  getScholarshipTheme,
  type ScholarshipThemeInfo,
} from "@/components/ScholarshipEmblem";
import AuthGateModal from "@/components/AuthGateModal";
import LifetimePassModal from "@/components/LifetimePassModal";
import {
  fetchApi,
  getCurrentUser,
  getToken,
  clearToken,
  type Scholarship,
  type University,
  type User,
} from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { REAL_SCHOLARSHIPS } from "@/data/scholarshipsData";

const FREE_TRIAL_LIMIT = 4;

interface UniEntry {
  id: number;
  name: string;
  city: string;
  country: string;
  verified: boolean;
  count: number;
}

const CAMPUS_PHOTO_MAP: Record<string, string> = {
  "chang'an": "campus-1.jpg",
  "tsinghua": "gate-1.jpg",
  "peking": "lake-1.jpg",
  "zhejiang": "library-1.jpg",
  "fudan": "tower-1.jpg",
  "beihang": "aerial-1.jpg",
  "shanghai jiao tong": "auditorium-1.jpg",
  "nanjing": "garden-1.jpg",
  "wuhan": "lake-2.jpg",
  "harbin": "quad-1.jpg",
  "tongji": "hall-1.jpg",
  "sun yat-sen": "gate-2.jpg",
  "beijing normal": "library-2.jpg",
  "sichuan": "life-1.jpg",
  "xiamen": "museum-1.jpg",
  "tianjin": "sports-1.jpg",
  "xi'an jiaotong": "tower-2.jpg",
  "huazhong": "campus-2.jpg",
};

const CAMPUS_PHOTOS_LIST = [
  "campus-1.jpg",
  "gate-1.jpg",
  "lake-1.jpg",
  "library-1.jpg",
  "tower-1.jpg",
  "auditorium-1.jpg",
  "quad-1.jpg",
  "aerial-1.jpg",
  "garden-1.jpg",
  "campus-2.jpg",
  "gate-2.jpg",
  "hall-1.jpg",
  "lake-2.jpg",
  "library-2.jpg",
  "life-1.jpg",
  "museum-1.jpg",
  "sports-1.jpg",
  "tower-2.jpg",
];

function getUniversityCampusPhoto(name: string, id: number, basePath: string): string {
  const lower = (name || "").toLowerCase();
  for (const [key, filename] of Object.entries(CAMPUS_PHOTO_MAP)) {
    if (lower.includes(key)) {
      return `${basePath}/images/campus/${filename}`;
    }
  }
  const index = Math.abs(id) % CAMPUS_PHOTOS_LIST.length;
  return `${basePath}/images/campus/${CAMPUS_PHOTOS_LIST[index]}`;
}

function getUniversityAvatarColor(name: string): { bg: string; letter: string } {
  const cleanName = (name || "U").trim();
  const letter = cleanName.charAt(0).toUpperCase();
  const colors = [
    "from-blue-600 to-cyan",
    "from-purple-600 to-indigo-600",
    "from-rose-600 to-red-600",
    "from-indigo-600 to-blue-700",
    "from-emerald-600 to-teal-600",
    "from-amber-600 to-orange-600",
    "from-sky-500 to-blue-600",
    "from-pink-600 to-rose-600",
    "from-teal-500 to-emerald-600",
    "from-violet-600 to-purple-700",
  ];
  const charCode = letter.charCodeAt(0) || 65;
  const bg = colors[charCode % colors.length];
  return { bg, letter };
}

export default function ScholarshipsPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [uniInfo, setUniInfo] = useState<Map<number, University>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedUni, setSelectedUni] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);
  const [savedFavorites, setSavedFavorites] = useState<number[]>([1, 2, 3]);
  const [filterSavedOnly, setFilterSavedOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  // Load Saved Favorites from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("saved_favorite_unis");
        if (saved) {
          setSavedFavorites(JSON.parse(saved));
        }
      } catch {}
    }
  }, []);

  // Sync city, uni & saved selection from URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cityParam = params.get("city");
      if (cityParam) setSelectedCity(cityParam);
      const uniParam = params.get("uni");
      if (uniParam) setSelectedUni(Number(uniParam));
      const savedParam = params.get("saved");
      if (savedParam === "true") setFilterSavedOnly(true);
      const queryParam = params.get("query");
      if (queryParam) setSearchQuery(queryParam);
    } catch {}

    const onPopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const cityParam = params.get("city") || "All Cities";
        setSelectedCity(cityParam);
        const uniParam = params.get("uni");
        setSelectedUni(uniParam ? Number(uniParam) : null);
        setFilterSavedOnly(params.get("saved") === "true");
      } catch {}
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Load scholarships & user
  useEffect(() => {
    async function loadScholarships() {
      setLoading(true);
      const [schRes, uniRes, userRes] = await Promise.all([
        fetchApi<Scholarship[]>("/scholarships/"),
        fetchApi<University[]>("/universities/"),
        getToken() ? getCurrentUser() : Promise.resolve({ data: null }),
      ]);
      if (schRes.data && schRes.data.length > 0) {
        setAllScholarships(schRes.data);
      } else {
        setAllScholarships(REAL_SCHOLARSHIPS);
      }
      if (uniRes.data) {
        const list = Array.isArray(uniRes.data)
          ? uniRes.data
          : (uniRes.data as any).results ?? [];
        setUniInfo(new Map(list.map((u: University) => [u.id, u])));
      }
      if (userRes.data) {
        setUser(userRes.data);
      } else if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {}
        }
      }
      setLoading(false);
    }
    loadScholarships();
  }, []);

  // Unique list of universities
  const universities = useMemo<UniEntry[]>(() => {
    const map = new Map<number, UniEntry>();
    for (const s of allScholarships) {
      const id = Number(s.university);
      const info = uniInfo.get(id);
      const entry = map.get(id) || {
        id,
        name: s.university_name || info?.name || "Chinese University",
        city: s.university_city || info?.city || "China",
        country: (s as any).university_country || info?.country || "China",
        verified: info?.is_verified || true,
        count: 0,
      };
      entry.count += 1;
      if (s.university_name) entry.name = s.university_name;
      if (s.university_city) entry.city = s.university_city;
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
    if (filterSavedOnly) {
      r = r.filter((u) => savedFavorites.includes(u.id));
    }
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
  }, [universities, filterSavedOnly, savedFavorites, selectedCity, searchQuery]);

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
      r = r.filter((s) => s.level.toLowerCase() === selectedLevel.toLowerCase());
    }
    if (selectedType !== "All Types") {
      r = r.filter((s) => s.type.toLowerCase() === selectedType.toLowerCase());
    }
    return r;
  }, [allScholarships, selectedUni, searchQuery, selectedLevel, selectedType]);

  const isPremium = Boolean(
    getToken() &&
    user &&
    typeof window !== "undefined" &&
    (() => {
      try {
        const paid = JSON.parse(localStorage.getItem("paid_vip_accounts") || "[]");
        return paid.includes(user.username?.toLowerCase());
      } catch {
        return false;
      }
    })()
  );

  const selectUni = (id: number) => {
    setSelectedUni(id);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("uni", String(id));
      window.history.pushState({ uni: id }, "", url.toString());
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToUnis = () => {
    setSelectedUni(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("uni");
      window.history.pushState({ uni: null }, "", url.toString());
    } catch {}
  };

  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSavedFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("saved_favorite_unis", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addToTracker = (sch: Scholarship, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const existing = JSON.parse(localStorage.getItem("student_applications") || "[]");
      const found = existing.some((item: any) => item.id === sch.id);
      if (!found) {
        existing.push({
          id: sch.id,
          title: sch.title,
          university: sch.university_name || selectedUniEntry?.name,
          city: sch.university_city || selectedUniEntry?.city,
          deadline: sch.application_deadline,
          status: "In Progress",
          dateAdded: new Date().toISOString(),
        });
        localStorage.setItem("student_applications", JSON.stringify(existing));
        setToastMessage(`✅ ${lang === "ar" ? "أضيفت المنحة إلى قائمة طلباتي بنجاح!" : "Bourse ajoutée avec succès à vos candidatures !"}`);
      } else {
        setToastMessage(`ℹ️ ${lang === "ar" ? "هذه المنحة موجودة بالفعل في ملف المتابعة" : "Cette bourse est déjà dans votre suivi de candidatures"}`);
      }
      setTimeout(() => setToastMessage(null), 3500);
    } catch {}
  };

  const handleLogout = () => {
    clearToken();
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("portal_role");
    } catch {}
    router.push("/");
  };

  const studentUsername = user?.username || "mehdi12";

  return (
    <div className="min-h-screen text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-cyan/30">
      {/* ─────────────────────────────────────────────────────────────
          1. LEFT SIDEBAR MENU (Identical to Screenshot 1)
      ───────────────────────────────────────────────────────────── */}
      <StudentSidebar activeTab={filterSavedOnly ? "saved" : "scholarships"} />

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (Translucent Glass Shell)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060a14]/65 backdrop-blur-[2px] min-h-screen">
        {/* TOP SEARCH & USER BAR (Matching Screenshot 1) */}
        <header className="sticky top-0 z-30 w-full px-4 sm:px-8 py-3.5 bg-[#0a101d]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between gap-4">
          {/* Search Box with Inline Filters Button */}
          <div className="relative flex-1 max-w-2xl">
            <div className="flex items-center w-full bg-[#111927]/90 hover:bg-[#152033] border border-white/10 focus-within:border-cyan/50 focus-within:ring-2 focus-within:ring-cyan/20 rounded-2xl px-3.5 py-2 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                placeholder={lang === "ar" ? "ابحث عن المنح، الجامعات، التخصصات..." : "Search scholarships, universities, programs..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-slate-400 hover:text-white mr-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                  showFilters
                    ? "bg-cyan text-slate-950 font-black"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Right Header Capsule: Notifications Bell & User Profile */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notification Bell with Red Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0a101d]" />
              </button>

              {/* Notifications Popover */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0a101d]/95 backdrop-blur-2xl border border-white/10 p-4 shadow-2xl z-50 text-xs"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="font-bold text-white text-sm">Notifications</span>
                      <span className="text-[10px] text-cyan font-semibold">3 New Updates</span>
                    </div>
                    <div className="space-y-3 mt-3">
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <p className="font-bold text-rose-300 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" /> CSCA Exam 2026/27
                        </p>
                        <p className="text-slate-300 text-[11px] mt-0.5">
                          Test obligatoire pour les bacheliers. Simulateur disponible sur ScholarChina.
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <p className="font-bold text-amber-300 flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5" /> Bourses CSC Type B
                        </p>
                        <p className="text-slate-300 text-[11px] mt-0.5">
                          Appels à candidatures ouverts dans plus de 100 universités partenaires.
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-cyan/10 border border-cyan/20">
                        <p className="font-bold text-cyan flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Route de la Soie
                        </p>
                        <p className="text-slate-300 text-[11px] mt-0.5">
                          Exemption 100% + allocation 3,000 RMB/mois pour les étudiants internationaux.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Capsule (Avatar 'M' + mehdi12 / Student + Chevron) */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                  {studentUsername.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">{studentUsername}</div>
                  <div className="text-[10px] text-slate-400 font-medium leading-tight">Student</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#0a101d]/95 backdrop-blur-2xl border border-white/10 p-2 shadow-2xl z-50 text-xs font-semibold"
                  >
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-white font-bold">{studentUsername}</p>
                      <p className="text-[10px] text-slate-400">Moroccan Applicant</p>
                    </div>
                    <Link
                      href="/student-portal"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <HomeIcon className="w-3.5 h-3.5" /> Student Dashboard
                    </Link>
                    <Link
                      href="/tracker"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <Layers className="w-3.5 h-3.5" /> My Applications
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <UserIcon className="w-3.5 h-3.5" /> Profile Settings
                    </Link>
                    <div className="border-t border-white/5 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 cursor-pointer text-left"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            3. CSCA NOTICE BANNER (Matching Screenshot 1)
        ───────────────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-8 pt-5">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-r from-rose-950/80 via-purple-950/60 to-[#0c152b]/90 border border-rose-500/30 p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg shadow-rose-950/40 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[11px] font-black tracking-wider uppercase flex items-center gap-1">
                🚨 CSCA EXAM 2026/27
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {lang === "ar"
                  ? "مرشح للبكالوريوس (Licence)؟ اكتشف المواد الإلزامية لاختبار CSCA الوطني حسب شعبتك واحجز موعدك."
                  : "Candidat Bachelor ? Découvrez les épreuves obligatoires du test CSCA selon votre filière et prenez RDV."}
              </p>
            </div>
            <Link
              href="/csca"
              className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/30 flex items-center gap-1.5 transition-all transform hover:scale-102"
            >
              <span>{lang === "ar" ? "محاكي CSCA ➔" : "Simulateur CSCA ➔"}</span>
            </Link>
          </motion.div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. COLLAPSIBLE FILTERS PANEL
        ───────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 sm:px-8 pt-4 overflow-hidden"
            >
              <div className="rounded-2xl bg-[#0a101d]/95 backdrop-blur-2xl border border-white/10 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-cyan" />
                    <span className="text-sm font-bold text-white">Filter Opportunities</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLevel("All Levels");
                      setSelectedType("All Types");
                      setSelectedCity("All Cities");
                      setFilterSavedOnly(false);
                      setSearchQuery("");
                    }}
                    className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Reset all filters
                  </button>
                </div>

                {/* City chips */}
                <div>
                  <span className="text-xs text-slate-400 block mb-2 font-medium">Select City:</span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scrollbar-none">
                    <button
                      onClick={() => setSelectedCity("All Cities")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedCity === "All Cities"
                          ? "bg-cyan text-slate-950 font-bold"
                          : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                      }`}
                    >
                      All Cities ({universities.length})
                    </button>
                    {cities.map(([c, count]) => (
                      <button
                        key={c}
                        onClick={() => setSelectedCity(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          selectedCity === c
                            ? "bg-cyan text-slate-950 font-bold"
                            : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                        }`}
                      >
                        {c} ({count})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─────────────────────────────────────────────────────────────
            5. MAIN BODY CONTENT
        ───────────────────────────────────────────────────────────── */}
        <main className="flex-1 px-4 sm:px-8 py-6">
          {selectedUni === null ? (
            /* ─────────────────────────────────────────────────────────
               STEP 1: UNIVERSITIES DIRECTORY (Matching Screenshot 1)
            ───────────────────────────────────────────────────────── */
            <div>
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {filterSavedOnly
                      ? lang === "ar" ? "جامعاتي المفضلة" : "My Saved Universities"
                      : "Recommended for you"}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {filterSavedOnly
                      ? lang === "ar" ? "قائمة الجامعات التي قمت بحفظها للمقارنة والتقديم." : "Opportunities you saved to your favorites."
                      : "Opportunities selected based on your profile & official Moroccan-China CSC agreements."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterSavedOnly(!filterSavedOnly)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      filterSavedOnly
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-white/5 text-slate-300 hover:bg-white/10 border-white/5"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${filterSavedOnly ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>{filterSavedOnly ? "Show All Universities" : `Saved (${savedFavorites.length})`}</span>
                  </button>

                  {!isPremium && (
                    <button
                      onClick={() => setShowLifetimeModal(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400/20 to-purple/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Unlock All 100+ ($29)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Degree / Funding Pills Bar */}
              <div className="mb-6 overflow-x-auto scrollbar-none flex items-center gap-2 pb-2">
                {[
                  { value: "All Levels", label: "🌟 All Levels" },
                  { value: "bachelor", label: "🎓 Bachelor" },
                  { value: "master", label: "🎓 Master" },
                  { value: "phd", label: "🎓 PhD" },
                  { value: "other", label: "🇨🇳 Chinese Language / Other" },
                ].map((lvl) => (
                  <button
                    key={lvl.value}
                    onClick={() => setSelectedLevel(lvl.value)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer ${
                      selectedLevel === lvl.value
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    <span>{lvl.label}</span>
                  </button>
                ))}
                <div className="h-5 w-px bg-white/10 mx-1 flex-shrink-0" />
                {[
                  { value: "All Types", label: "All Types" },
                  { value: "full", label: "💰 Full Scholarship" },
                  { value: "partial", label: "💎 Partial Scholarship" },
                ].map((tp) => (
                  <button
                    key={tp.value}
                    onClick={() => setSelectedType(tp.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer ${
                      selectedType === tp.value
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                        : "bg-white/5 text-slate-400 hover:text-white border border-white/5"
                    }`}
                  >
                    <span>{tp.label}</span>
                  </button>
                ))}
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 h-72 animate-pulse flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-white/10 rounded w-3/4" />
                          <div className="h-3 bg-white/10 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-36 bg-white/10 rounded-xl" />
                      <div className="h-4 bg-white/10 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : filteredUnis.length === 0 ? (
                /* Empty state */
                <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-16 text-center max-w-lg mx-auto">
                  <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-white font-bold text-lg mb-1">No universities found</p>
                  <p className="text-xs text-slate-400 mb-5">
                    No results matched your search or filters. Try adjusting your search query.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCity("All Cities");
                      setSearchQuery("");
                      setSelectedLevel("All Levels");
                      setSelectedType("All Types");
                      setFilterSavedOnly(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                /* Universities Grid (Cards matching Screenshot 1) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredUnis.map((uni, idx) => {
                    const avatar = getUniversityAvatarColor(uni.name);
                    const campusPhoto = getUniversityCampusPhoto(uni.name, uni.id, basePath);
                    const isFav = savedFavorites.includes(uni.id);

                    return (
                      <motion.div
                        key={uni.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(idx, 12) * 0.03 }}
                        onClick={() => selectUni(uni.id)}
                        className="rounded-2xl bg-[#0d1527]/80 hover:bg-[#111c33]/90 border border-white/10 hover:border-cyan/50 hover:shadow-2xl hover:shadow-cyan/10 transition-all duration-300 group flex flex-col cursor-pointer overflow-hidden relative"
                      >
                        {/* Top Row: Avatar Initial, University Name, City, Heart Favorite */}
                        <div className="p-4 pb-3 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Dual-Gradient Initial Badge */}
                            <div
                              className={`w-9 h-9 rounded-full bg-gradient-to-tr ${avatar.bg} flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md`}
                            >
                              {avatar.letter}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-white group-hover:text-cyan transition-colors truncate leading-tight">
                                {uni.name}
                              </h3>
                              <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-cyan flex-shrink-0" />
                                {uni.city}, {uni.country || "China"}
                              </p>
                            </div>
                          </div>

                          {/* Heart Favorite Button */}
                          <button
                            onClick={(e) => toggleFavorite(uni.id, e)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 transition-colors flex-shrink-0 cursor-pointer"
                            title={isFav ? "Remove from saved" : "Save to favorites"}
                          >
                            <Heart
                              className={`w-4 h-4 transition-colors ${
                                isFav
                                  ? "fill-rose-500 text-rose-500"
                                  : "text-slate-400 group-hover:text-rose-400"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Middle: Real High-Res Campus Photo */}
                        <div className="relative px-3">
                          <div className="relative h-44 sm:h-48 w-full rounded-xl overflow-hidden bg-slate-900">
                            <img
                              src={campusPhoto}
                              alt={uni.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `${basePath}/images/campus/campus-1.jpg`;
                              }}
                            />
                            {/* Dark gradient overlay for bottom badge visibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a101d]/90 via-transparent to-black/20" />

                            {/* Top Left: Verified / Tier Tag */}
                            <div className="absolute top-2.5 left-2.5">
                              <span className="px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-cyan flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Double First Class
                              </span>
                            </div>

                            {/* Bottom: Scholarship count badge */}
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
                              <span className="px-2.5 py-1 rounded-xl bg-blue-600/90 text-white font-extrabold text-[11px] backdrop-blur-md shadow-md">
                                ✨ {uni.count} {lang === "ar" ? "منح متاحة" : "Scholarships"}
                              </span>
                              <span className="text-[11px] font-bold text-white/90 drop-shadow flex items-center gap-0.5">
                                Explore ➔
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Degree Level Tags & Action */}
                        <div className="p-3 pt-3 mt-auto flex items-center justify-between border-t border-white/5 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                            <span className="px-2 py-0.5 rounded-md bg-white/5">Bachelor</span>
                            <span className="px-2 py-0.5 rounded-md bg-white/5">Master</span>
                            <span className="px-2 py-0.5 rounded-md bg-white/5">PhD</span>
                          </div>
                          <span className="text-cyan font-bold group-hover:underline flex items-center gap-0.5">
                            Details <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────
               STEP 2: SCHOLARSHIPS OF CHOSEN UNIVERSITY (With Emblems)
            ───────────────────────────────────────────────────────── */
            <div>
              {/* Back button & Selected University Spotlight Banner */}
              <div className="mb-6">
                <button
                  onClick={backToUnis}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-xs font-bold transition-all mb-4 group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>{lang === "ar" ? "← العودة إلى قائمة الجامعات" : "← Back to all universities"}</span>
                </button>

                {selectedUniEntry && (
                  <div className="rounded-3xl bg-gradient-to-r from-[#0c1a33]/90 via-[#101f3d]/80 to-[#0c1527]/90 border border-white/10 p-5 sm:p-7 relative overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        {(() => {
                          const av = getUniversityAvatarColor(selectedUniEntry.name);
                          return (
                            <div
                              className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${av.bg} flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-lg`}
                            >
                              {av.letter}
                            </div>
                          );
                        })()}
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-white">
                              {selectedUniEntry.name}
                            </h2>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Accredited
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan" />
                            {selectedUniEntry.city}, {selectedUniEntry.country || "China"}
                            <span className="text-slate-500">•</span>
                            <span className="text-amber-300 font-semibold">
                              {uniScholarships.length} Official Scholarships Available
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleFavorite(selectedUniEntry.id, e)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            savedFavorites.includes(selectedUniEntry.id)
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              savedFavorites.includes(selectedUniEntry.id) ? "fill-rose-500 text-rose-500" : ""
                            }`}
                          />
                          <span>{savedFavorites.includes(selectedUniEntry.id) ? "Saved" : "Save University"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-Filters for scholarships */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                  {[
                    { value: "All Levels", label: "All Levels" },
                    { value: "bachelor", label: "🎓 Bachelor" },
                    { value: "master", label: "🎓 Master" },
                    { value: "phd", label: "🎓 PhD" },
                    { value: "other", label: "🇨🇳 Language" },
                  ].map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setSelectedLevel(l.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedLevel === l.value
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                  <div className="h-4 w-px bg-white/10 mx-1" />
                  {[
                    { value: "All Types", label: "All Types" },
                    { value: "full", label: "💰 Full Funding" },
                    { value: "partial", label: "💎 Partial" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setSelectedType(t.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedType === t.value
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-slate-400 font-medium">
                  Showing <strong className="text-white">{uniScholarships.length}</strong> scholarship opportunities
                </span>
              </div>

              {/* Scholarships List with Unique Symbols & Emblems */}
              {uniScholarships.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-12 text-center max-w-md mx-auto">
                  <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-white font-bold text-sm">No scholarships match the selected filters</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Try clearing the level or funding filters.</p>
                  <button
                    onClick={() => {
                      setSelectedLevel("All Levels");
                      setSelectedType("All Types");
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {uniScholarships.map((sch, i) => {
                    const theme = getScholarshipTheme(sch);
                    const deadlineFormatted = sch.application_deadline
                      ? new Date(sch.application_deadline).toLocaleDateString(
                          lang === "ar" ? "ar-MA" : "fr-FR",
                          { month: "short", day: "numeric", year: "numeric" }
                        )
                      : "Rolling Admission 2026/27";

                    return (
                      <motion.div
                        key={sch.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.04 }}
                        className={`rounded-3xl bg-gradient-to-br ${theme.cardGlow} bg-[#0c1424]/90 backdrop-blur-xl border ${theme.borderClass} p-5 sm:p-6 shadow-xl flex flex-col justify-between group transition-all duration-300 hover:shadow-2xl relative overflow-hidden`}
                      >
                        <div>
                          {/* Top Header: Unique Emblem Symbol, Prestige Badge, Deadline */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              {/* Dedicated SVG Symbol Emblem */}
                              <ScholarshipEmblem themeKey={theme.key} size={54} />

                              <div>
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${theme.badgeClass}`}
                                >
                                  {theme.badgeLabel}
                                </span>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                  {theme.name}
                                </p>
                              </div>
                            </div>

                            {/* Deadline Capsule */}
                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] text-slate-300 font-medium flex items-center gap-1 flex-shrink-0">
                              <Clock className="w-3 h-3 text-cyan" />
                              {deadlineFormatted}
                            </span>
                          </div>

                          {/* Scholarship Title */}
                          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan transition-colors leading-snug mb-2">
                            {sch.title}
                          </h3>

                          {/* Subtitle / Program scope */}
                          <p className="text-xs text-slate-400 font-medium mb-4 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-bold uppercase text-[10px]">
                              {sch.level}
                            </span>
                            <span>•</span>
                            <span className="text-slate-300">{selectedUniEntry?.name}</span>
                          </p>

                          {/* 4 Financial Coverage Metric Capsules */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                            <div className="rounded-xl bg-white/[0.04] border border-white/5 p-2.5 text-center">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tuition</span>
                              <span className="text-xs font-black text-emerald-400 mt-0.5 block truncate">
                                100% Free
                              </span>
                            </div>

                            <div className="rounded-xl bg-white/[0.04] border border-white/5 p-2.5 text-center">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dorm / Logement</span>
                              <span className="text-xs font-black text-cyan mt-0.5 block truncate">
                                {sch.type === "full" ? "Campus Free" : "Subventionné"}
                              </span>
                            </div>

                            <div className="rounded-xl bg-white/[0.04] border border-white/5 p-2.5 text-center">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Stipend / Bourse</span>
                              <span className="text-xs font-black text-amber-300 mt-0.5 block truncate">
                                {sch.type === "full" ? theme.stipendText.split("/")[0] : "Bourse Mérite"}
                              </span>
                            </div>

                            <div className="rounded-xl bg-white/[0.04] border border-white/5 p-2.5 text-center">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Assurance</span>
                              <span className="text-xs font-black text-purple-300 mt-0.5 block truncate">
                                800 RMB Inclus
                              </span>
                            </div>
                          </div>

                          {/* Honest Transparency Out-of-Pocket Pill */}
                          <div className="mb-4">
                            {sch.type === "full" ? (
                              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
                                <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px]">
                                  <span>👑</span> Bourse Complète : Zéro DH à payer pour les cours & la chambre
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold uppercase">
                                  0 DH / an
                                </span>
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs">
                                <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                                  <span>⚠️</span> Bourse Partielle : Cours gratuits • Reste ~1,200 DH/mois à prévoir (vie & dortoir)
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold uppercase">
                                  Frais de vie
                                </span>
                              </div>
                            )}
                          </div>

                          {/* CSCA Status Indicator */}
                          <div className="mb-4">
                            {theme.cscaRequired ? (
                              <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-2.5 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-rose-400 flex-shrink-0" />
                                  <span className="text-rose-200 font-semibold text-[11px]">
                                    🚨 CSCA Requis (Examen National Obligatoire pour Bacheliers)
                                  </span>
                                </div>
                                <Link
                                  href="/csca"
                                  className="text-[11px] font-bold text-cyan hover:underline flex-shrink-0 ml-2"
                                >
                                  Simulateur ➔
                                </Link>
                              </div>
                            ) : (
                              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-center gap-2 text-xs text-emerald-300">
                                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                <span className="text-[11px] font-medium">
                                  ✅ CSCA Non Requis pour ce cycle (Admission sur dossier académique)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5 mt-auto">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => addToTracker(sch, e)}
                              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Layers className="w-3.5 h-3.5 text-cyan" />
                              <span>{lang === "ar" ? "إضافة للمتابعة" : "Add to Tracker"}</span>
                            </button>

                            <Link
                              href={`/scholarships/${sch.id}`}
                              className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-all hover:bg-white/5"
                            >
                              Details & Guide ➔
                            </Link>
                          </div>

                          <div className="flex items-center gap-2">
                            {sch.application_link ? (
                              <a
                                href={sch.application_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan text-white text-xs font-extrabold shadow-md shadow-blue-600/30 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>{lang === "ar" ? "تقديم رسمي" : "Apply Now"}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <Link
                                href={`/scholarships/${sch.id}`}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan text-white text-xs font-extrabold shadow-md shadow-blue-600/30 hover:opacity-95 transition-all flex items-center gap-1.5"
                              >
                                <span>{lang === "ar" ? "دليل التقديم" : "Application Dossier"}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOAST NOTIFICATION CONFIRMATION
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-950/95 border border-cyan/40 text-white text-xs font-bold shadow-2xl shadow-cyan/20 backdrop-blur-xl flex items-center gap-2"
          >
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          AUTH GATE & LIFETIME MODALS
      ───────────────────────────────────────────────────────────── */}
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        onBackToRoles={() => router.push("/")}
        canClose={true}
        role="student"
        title={lang === "ar" ? "تسجيل دخول الطلاب المغاربة" : "Moroccan Student Sign In"}
        subtitle={lang === "ar" ? "سجل الدخول لاستكشاف أكثر من 100 جامعة صينية وأكثر من 400 منحة CSC" : "Sign in or register your account to explore 100+ Chinese Universities & 400+ CSC Scholarships for Moroccans"}
      />

      <LifetimePassModal
        isOpen={showLifetimeModal}
        onClose={() => setShowLifetimeModal(false)}
      />
    </div>
  );
}
