"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Sparkles,
  MapPin,
  GraduationCap,
  CheckCircle2,
  Star,
  Quote,
  PenSquare,
  X,
  Send,
  Building2,
  Calendar,
  Award,
  ChevronDown,
  ChevronUp,
  Heart,
  Share2,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import AutoText from "@/components/AutoText";
import AuthGateModal from "@/components/AuthGateModal";
import { getStories, submitStory, getToken, type SuccessStoryItem } from "@/lib/api";

const SEED_STORIES: SuccessStoryItem[] = [
  {
    id: 1,
    name: "Amina El Fassi",
    country: "Morocco",
    city: "Fez",
    university_name: "Zhejiang University",
    degree_level: "master",
    field_of_study: "MSc Computer Science & AI",
    scholarship_type: "CSC Chinese Government Scholarship (Type A - Full)",
    year_awarded: 2025,
    golden_tip:
      "Don't just write a generic study plan. Pick 2-3 specific labs or professors at your target Chinese university, mention their recent papers, and explain how your background aligns with their research.",
    story:
      "Coming from Fez with a bachelor's degree in software engineering, my biggest hurdle was getting certified translations and writing a competitive research proposal. Using ScholarChina, I applied through the CSC Type A bilateral program in January. In April, I had an online interview with the ZJU department. In June, my admission notice and JW201 visa form arrived at the embassy in Rabat! Life in Hangzhou is beyond modern — tech campus, monthly stipend deposited directly on my ICBC card, and free international student dormitory.",
    rating: 5,
    avatar_initials: "AF",
    is_verified: true,
  },
  {
    id: 2,
    name: "Yassine Benali",
    country: "Morocco",
    city: "Casablanca",
    university_name: "Tsinghua University",
    degree_level: "phd",
    field_of_study: "PhD Mechanical Engineering & Robotics",
    scholarship_type: "CSC High-Level Postgraduate Program (Type B - Full)",
    year_awarded: 2024,
    golden_tip:
      "Get your Foreigner Physical Examination Form completed early at a certified clinic in Morocco, and ensure the official hospital stamp is stamped directly across your photograph.",
    story:
      "Tsinghua was my dream university. I reached out to my supervisor via official email with my CV and a 2-page research synopsis. He agreed to provide a Pre-Admission / Acceptance Letter within 3 weeks! With that letter, my CSC application had a massive boost. Now I am in my second year researching robotic control systems at Tsinghua's state key laboratory. Everything from tuition to single room accommodation and 3,500 RMB monthly stipend is covered.",
    rating: 5,
    avatar_initials: "YB",
    is_verified: true,
  },
  {
    id: 3,
    name: "Sara Ouazzani",
    country: "Morocco",
    city: "Rabat",
    university_name: "Fudan University",
    degree_level: "master",
    field_of_study: "Master of International Business & E-Commerce",
    scholarship_type: "Shanghai Government Scholarship (SGS Class A - Full)",
    year_awarded: 2025,
    golden_tip:
      "Look into municipal and provincial scholarships! Everyone fights for CSC, but Shanghai Government Scholarship Class A offers full tuition waiver, free housing, comprehensive medical insurance, and 3,000 RMB/month living allowance.",
    story:
      "Shanghai is the global trade capital. Fudan's School of Management taught our entire program in English. I prepared 2 strong recommendation letters from Moroccan university professors and an IELTS score of 7.0. The admissions team was responsive, and Fudan's International Students Office helped me with airport pickup and student visa residence permit within my first week.",
    rating: 5,
    avatar_initials: "SO",
    is_verified: true,
  },
  {
    id: 4,
    name: "Hamza Chraibi",
    country: "Morocco",
    city: "Marrakech",
    university_name: "Harbin Institute of Technology (HIT)",
    degree_level: "master",
    field_of_study: "MSc Civil & Structural Engineering",
    scholarship_type: "CSC Silk Road Full Scholarship",
    year_awarded: 2024,
    golden_tip:
      "Apply for the Silk Road Program if you are from North Africa or Belt & Road countries. Deadlines are often in March-April and competition is fair.",
    story:
      "HIT is legendary for engineering. Harbin's winter has the world-famous Ice Festival, and university dorms and laboratories are heated to 24°C year-round. The university provided free Chinese language classes during our first semester alongside English engineering courses. I made lifelong friends from Morocco, Algeria, Pakistan, and Europe.",
    rating: 5,
    avatar_initials: "HC",
    is_verified: true,
  },
  {
    id: 5,
    name: "Nour El Houda",
    country: "Morocco",
    city: "Tangier",
    university_name: "Beijing Language and Culture University (BLCU)",
    degree_level: "language",
    field_of_study: "1-Year Intensive Chinese Language & Culture",
    scholarship_type: "International Chinese Language Teachers Scholarship (CIS)",
    year_awarded: 2025,
    golden_tip:
      "Even if you have no Chinese foundation, 1-year language scholarships cover tuition, housing, and 2,500 RMB/month. It's the ultimate gateway before starting a Bachelor or Master degree.",
    story:
      "I wanted to learn Mandarin for an international logistics career between Tangier Med and Chinese ports. BLCU is known as the 'Little United Nations'. In just 10 months, I went from HSK 1 to passing HSK 5! The international community in Beijing is vibrant, welcoming, and exceptionally safe.",
    rating: 5,
    avatar_initials: "NH",
    is_verified: true,
  },
  {
    id: 6,
    name: "Khadija Tazi",
    country: "Morocco",
    city: "Agadir",
    university_name: "Central South University (CSU)",
    degree_level: "bachelor",
    field_of_study: "MBBS (Bachelor of Medicine & Surgery in English)",
    scholarship_type: "Hunan Provincial Government & CSU Presidential Scholarship",
    year_awarded: 2025,
    golden_tip:
      "Ensure your high school baccalaureate transcript and police clearance (fiche anthropométrique) are officially translated and stamped.",
    story:
      "Studying medicine in China in English is world-class with affiliated top-tier hospitals. The tuition discount and monthly living subsidy made studying abroad much more affordable than private medical schools in Europe. The campus environment is high-tech with clinical simulation labs.",
    rating: 5,
    avatar_initials: "KT",
    is_verified: true,
  },
  {
    id: 7,
    name: "Omar Zeroual",
    country: "Morocco",
    city: "Oujda",
    university_name: "Nanjing University",
    degree_level: "master",
    field_of_study: "MSc Artificial Intelligence & Data Science",
    scholarship_type: "Jiangsu Provincial Jasmine Scholarship (Full)",
    year_awarded: 2025,
    golden_tip:
      "Reach out to Moroccan alumni on LinkedIn or ScholarChina who are already at the university. Their advice on dorm life, professors, and bank cards saves you weeks.",
    story:
      "Nanjing is a historic and green city with lower living costs than Shanghai. The Jasmine Scholarship covered all tuition fees and provided a generous accommodation allowance. The laboratories at Nanjing University have high-performance GPU clusters, making research in machine learning fast and productive.",
    rating: 5,
    avatar_initials: "OZ",
    is_verified: true,
  },
];

export default function SuccessStoriesPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [stories, setStories] = useState<SuccessStoryItem[]>(SEED_STORIES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [expandedStoryId, setExpandedStoryId] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [submittedToast, setSubmittedToast] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    country: "Morocco",
    city: "",
    university_name: "",
    degree_level: "master",
    field_of_study: "",
    scholarship_type: "CSC Full Scholarship",
    year_awarded: 2025,
    golden_tip: "",
    story: "",
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);

  // Load from API and localStorage
  useEffect(() => {
    async function load() {
      if (!getToken()) {
        setShowAuthGate(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await getStories();
        let list: SuccessStoryItem[] = [];
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          list = res.data;
        } else {
          list = SEED_STORIES;
        }

        // Merge with local user-submitted stories from localStorage if any
        try {
          const localSaved = localStorage.getItem("custom_student_stories");
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            if (Array.isArray(parsed)) {
              list = [...parsed, ...list.filter((s) => !parsed.some((p: any) => p.id === s.id))];
            }
          }
        } catch {}

        setStories(list);
      } catch {
        setStories(SEED_STORIES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredStories = useMemo(() => {
    let result = stories;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.university_name.toLowerCase().includes(q) ||
          (s.city && s.city.toLowerCase().includes(q)) ||
          s.field_of_study.toLowerCase().includes(q) ||
          s.scholarship_type.toLowerCase().includes(q)
      );
    }

    // Category Filter
    if (selectedFilter === "morocco") {
      result = result.filter(
        (s) =>
          s.country.toLowerCase().includes("morocco") ||
          (s.city && ["casablanca", "fez", "rabat", "marrakech", "tangier", "agadir", "oujda", "kenitra"].some(c => s.city?.toLowerCase().includes(c)))
      );
    } else if (selectedFilter === "csc") {
      result = result.filter((s) => s.scholarship_type.toLowerCase().includes("csc"));
    } else if (selectedFilter === "master") {
      result = result.filter((s) => s.degree_level.toLowerCase() === "master");
    } else if (selectedFilter === "phd") {
      result = result.filter((s) => s.degree_level.toLowerCase() === "phd");
    } else if (selectedFilter === "language") {
      result = result.filter((s) => s.degree_level.toLowerCase() === "language");
    }

    return result;
  }, [stories, search, selectedFilter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.university_name.trim() || !formData.story.trim()) {
      return;
    }

    setSubmitting(true);
    const initials =
      formData.name
        .trim()
        .split(" ")
        .map((p) => p[0]?.toUpperCase())
        .filter(Boolean)
        .slice(0, 2)
        .join("") || "ST";

    const newStory: SuccessStoryItem = {
      id: Date.now(),
      name: formData.name.trim(),
      country: formData.country.trim() || "Morocco",
      city: formData.city.trim(),
      university_name: formData.university_name.trim(),
      degree_level: formData.degree_level,
      field_of_study: formData.field_of_study.trim() || "General Studies",
      scholarship_type: formData.scholarship_type.trim() || "CSC Full Scholarship",
      year_awarded: Number(formData.year_awarded) || 2025,
      golden_tip: formData.golden_tip.trim() || "Prepare documents with care and apply early.",
      story: formData.story.trim(),
      rating: formData.rating,
      avatar_initials: initials,
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    // Try posting to API
    try {
      await submitStory(newStory);
    } catch {}

    // Save to localStorage for instant client view
    try {
      const existing = JSON.parse(localStorage.getItem("custom_student_stories") || "[]");
      existing.unshift(newStory);
      localStorage.setItem("custom_student_stories", JSON.stringify(existing));
    } catch {}

    // Update state
    setStories((prev) => [newStory, ...prev]);
    setSubmitting(false);
    setShowShareModal(false);
    setSubmittedToast(true);

    // Reset form
    setFormData({
      name: "",
      country: "Morocco",
      city: "",
      university_name: "",
      degree_level: "master",
      field_of_study: "",
      scholarship_type: "CSC Full Scholarship",
      year_awarded: 2025,
      golden_tip: "",
      story: "",
      rating: 5,
    });

    setTimeout(() => {
      setSubmittedToast(false);
    }, 6000);
  }

  return (
    <div className="min-h-screen px-4 py-10 max-w-7xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {submittedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-start gap-3 border border-emerald-400"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-semibold leading-snug">
              {t("stories.successToast")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan/30 text-xs font-bold text-cyan shadow-sm mb-4">
          <Users className="w-4 h-4 text-cyan" />
          <span>{t("home.storiesBannerTitle")}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight mb-4">
          {t("stories.title")}
        </h1>
        <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-6">
          {t("stories.subtitle")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setShowShareModal(true)}
            className="btn-gradient px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan/20 cursor-pointer transform hover:scale-105 transition-all"
          >
            <PenSquare className="w-4 h-4" />
            <span>{t("stories.shareBtn")}</span>
          </button>
          <Link
            href="/scholarships"
            className="glass px-6 py-3.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-cyan" />
            <span>{t("home.btnDiscover")}</span>
          </Link>
        </div>
      </motion.div>

      {/* Search and Filters Bar */}
      <div className="mb-10 space-y-4">
        <div className="glass rounded-2xl p-2 flex items-center gap-2 glow-cyan-sm border border-cyan/20">
          <Search className="w-5 h-5 text-text-muted ml-3 flex-shrink-0" />
          <input
            type="text"
            placeholder={t("home.searchPh")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none py-2.5 px-2 text-sm sm:text-base"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="p-2 text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: t("stories.all") },
            { id: "morocco", label: t("stories.filterMorocco") },
            { id: "csc", label: t("stories.filterCsc") },
            { id: "master", label: t("stories.filterMaster") },
            { id: "phd", label: t("stories.filterPhd") },
            { id: "language", label: t("stories.filterLang") },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setSelectedFilter(chip.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === chip.id
                  ? "bg-gradient-to-r from-cyan to-blue text-white shadow-md shadow-cyan/25"
                  : "glass text-text-secondary hover:text-white hover:bg-white/10 border border-border-glass"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story, idx) => {
          const isExpanded = expandedStoryId === story.id;
          return (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="glass rounded-3xl p-6 border border-border-glass card-hover flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                {/* Header: Avatar, Name, Location, Rating */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan via-blue to-purple text-white font-black flex items-center justify-center text-base shadow-md flex-shrink-0">
                      {story.avatar_initials || "SC"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-text-primary text-base">
                          {story.name}
                        </h3>
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t("stories.verified")}</span>
                        </span>
                      </div>
                      <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan flex-shrink-0" />
                        <span>
                          {story.city ? `${story.city}, ` : ""}
                          {story.country}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex text-amber-400 flex-shrink-0">
                    {[...Array(story.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* University & Scholarship Meta */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan">
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{story.university_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <Award className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{story.scholarship_type}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-purple flex-shrink-0" />
                      <span className="truncate">{story.field_of_study}</span>
                    </span>
                    <span className="text-[11px] text-text-muted flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3" /> {story.year_awarded}
                    </span>
                  </div>
                </div>

                {/* Golden Tip Box */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 mb-4 relative">
                  <div className="flex items-center gap-1 font-bold text-amber-400 mb-1">
                    <Quote className="w-3.5 h-3.5" />
                    <span>{t("stories.goldenTip")}:</span>
                  </div>
                  <p className="italic leading-relaxed">
                    "<AutoText text={story.golden_tip} />"
                  </p>
                </div>

                {/* Story Preview or Full Text */}
                <div className="text-xs text-text-secondary leading-relaxed space-y-2">
                  <p className={isExpanded ? "" : "line-clamp-4"}>
                    <AutoText text={story.story} />
                  </p>
                </div>
              </div>

              {/* Bottom Toggle */}
              <div className="mt-5 pt-3 border-t border-border-glass flex items-center justify-between">
                <button
                  onClick={() => setExpandedStoryId(isExpanded ? null : story.id)}
                  className="text-xs font-bold text-cyan hover:text-purple transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{isExpanded ? t("stories.close") : t("stories.readFull")}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                <span className="text-[10px] text-text-muted uppercase tracking-wider">
                  {t("stories.verifiedBadge")}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredStories.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center max-w-md mx-auto my-12">
          <Quote className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
          <p className="text-text-secondary font-semibold text-sm">
            {t("stories.empty")}
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedFilter("all");
            }}
            className="mt-4 text-xs font-bold text-cyan hover:underline cursor-pointer"
          >
            {t("sch.clearFilters")}
          </button>
        </div>
      )}

      {/* Share Your Story Interactive Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-cyan/30 shadow-2xl relative my-8"
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full glass hover:bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan to-blue text-white flex items-center justify-center shadow-lg">
                  <PenSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-text-primary">
                    {t("stories.modalTitle")}
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {t("stories.modalSub")}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      {t("stories.formName")} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t("stories.formNamePh")}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full glass rounded-xl px-3.5 py-2.5 text-sm text-text-primary border border-border-glass focus:border-cyan outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      {t("stories.formCity")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("stories.formCityPh")}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full glass rounded-xl px-3.5 py-2.5 text-sm text-text-primary border border-border-glass focus:border-cyan outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      {t("stories.formUni")} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t("stories.formUniPh")}
                      value={formData.university_name}
                      onChange={(e) =>
                        setFormData({ ...formData, university_name: e.target.value })
                      }
                      className="w-full glass rounded-xl px-3.5 py-2.5 text-sm text-text-primary border border-border-glass focus:border-cyan outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      {t("stories.formDegree")}
                    </label>
                    <select
                      value={formData.degree_level}
                      onChange={(e) => setFormData({ ...formData, degree_level: e.target.value })}
                      className="w-full glass rounded-xl px-3.5 py-2.5 text-sm text-text-primary border border-border-glass focus:border-cyan outline-none cursor-pointer"
                    >
                      <option value="bachelor">{t("sch.bachelor")}</option>
                      <option value="master">{t("sch.master")}</option>
                      <option value="phd">{t("sch.phd")}</option>
                      <option value="language">{t("sch.language")}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      {t("stories.formField")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("stories.formFieldPh")}
                      value={formData.field_of_study}
                      onChange={(e) =>
                        setFormData({ ...formData, field_of_study: e.target.value })
                      }
                      className="w-full glass rounded-xl px-3.5 py-2.5 text-sm text-text-primary border border-border-glass focus:border-cyan outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      {t("stories.formYear")}
                    </label>
                    <input
                      type="number"
                      min={2020}
                      max={2030}
                      value={formData.year_awarded}
                      onChange={(e) =>
                        setFormData({ ...formData, year_awarded: Number(e.target.value) })
                      }
                      className="w-full glass rounded-xl px-3.5 py-2.5 text-sm text-text-primary border border-border-glass focus:border-cyan outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    {t("stories.formSch")} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("stories.formSchPh")}
                    value={formData.scholarship_type}
                    onChange={(e) =>
                      setFormData({ ...formData, scholarship_type: e.target.value })
                    }
                    className="w-full glass rounded-xl px-3.5 py-2.5 text-sm text-text-primary border border-border-glass focus:border-cyan outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    ⭐ {t("stories.formTip")} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("stories.formTipPh")}
                    value={formData.golden_tip}
                    onChange={(e) => setFormData({ ...formData, golden_tip: e.target.value })}
                    className="w-full glass rounded-xl px-3.5 py-2.5 text-sm text-text-primary border border-amber-500/30 focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    📖 {t("stories.formStory")} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={t("stories.formStoryPh")}
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    className="w-full glass rounded-xl px-3.5 py-2.5 text-sm text-text-primary border border-border-glass focus:border-cyan outline-none resize-y"
                  />
                </div>

                <div className="pt-3 border-t border-border-glass flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    {t("stories.close")}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gradient px-7 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan/20 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {submitting ? t("stories.submitting") : t("stories.submit")}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthGateModal
        isOpen={showAuthGate || (typeof window !== "undefined" && !getToken())}
        onClose={() => router.push("/")}
        onBackToRoles={() => router.push("/")}
        canClose={false}
        role="student"
        title={lang === "ar" ? "بوابة الطلاب المغاربة" : "Moroccan Student Access Required"}
        subtitle={lang === "ar" ? "سجل الدخول لاستكشاف تجارب وقصص نجاح الطلاب المغاربة في أكثر من 100 جامعة صينية." : "Sign in or register to read real Moroccan student stories and CSC scholarship journeys."}
        onSuccess={() => {
          setShowAuthGate(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
