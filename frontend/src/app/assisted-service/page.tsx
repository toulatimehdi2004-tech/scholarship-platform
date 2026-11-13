"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck2,
  User,
  GraduationCap,
  Building2,
  Award,
  Crown,
  Phone,
  MessageSquare,
  Upload,
  Calendar,
  MapPin,
  Check,
  AlertCircle,
  HelpCircle,
  FileText,
  DollarSign,
  ChevronRight,
  Eye,
  RefreshCw,
  Send,
  Star,
  Zap,
} from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import ApplicationChoiceBar from "@/components/ApplicationChoiceBar";
import { useApplicationMode } from "@/lib/ApplicationModeContext";
import { useLang } from "@/lib/i18n";
import { getToken, getCurrentUser, type User as ApiUser } from "@/lib/api";

type AssistedTab = "overview" | "apply" | "tracker" | "packages" | "advisor";

interface AssistedDossier {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  degree: string;
  field: string;
  targetCities: string[];
  preferredLanguage: string;
  tier: string;
  status: "received" | "translating" | "submitted" | "interview" | "accepted";
  submittedAt: string;
  trackingCode: string;
  notes: string;
}

const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tangier",
  "Fes",
  "Agadir",
  "Meknes",
  "Oujda",
  "Kenitra",
  "Tetouan",
  "Safi",
  "El Jadida",
  "Nador",
  "Beni Mellal",
];

const POPULAR_FIELDS = [
  "Software Engineering & Computer Science",
  "Artificial Intelligence & Data Science",
  "General Medicine (MBBS - English)",
  "International Economics & Trade",
  "Civil Engineering & Architecture",
  "Mechanical Engineering & Robotics",
  "Business Administration & E-Commerce",
  "Chinese Language & Cultural Studies (1 Year)",
];

const CHINESE_CITIES = [
  "Beijing (بكين)",
  "Shanghai (شنغهاي)",
  "Hangzhou (هانغتشو)",
  "Xi'an (شيآن)",
  "Guangzhou (غوانغجو)",
  "Wuhan (ووهان)",
  "Chengdu (تشنغدو)",
  "Nanjing (نانجينغ)",
];

export default function AssistedServicePage() {
  const router = useRouter();
  const { lang, t } = useLang();
  const { mode, setMode } = useApplicationMode();
  const [activeTab, setActiveTab] = useState<AssistedTab>("overview");
  const [user, setUser] = useState<ApiUser | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Casablanca");
  const [degree, setDegree] = useState("Bachelor (البكالوريوس)");
  const [field, setField] = useState(POPULAR_FIELDS[0]);
  const [selectedCities, setSelectedCities] = useState<string[]>([
    "Beijing (بكين)",
    "Shanghai (شنغهاي)",
  ]);
  const [preferredLanguage, setPreferredLanguage] = useState("English (100% بالإنجليزية)");
  const [selectedTier, setSelectedTier] = useState<"standard" | "csc_guaranteed" | "vip">(
    "csc_guaranteed"
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedDossier, setSubmittedDossier] = useState<AssistedDossier | null>(null);

  // Mock initial / stored dossiers
  const [myDossiers, setMyDossiers] = useState<AssistedDossier[]>([]);

  useEffect(() => {
    // Ensure mode is set to assisted when accessing this page
    if (mode !== "assisted") {
      setMode("assisted", false);
    }

    if (typeof window !== "undefined") {
      try {
        const u = localStorage.getItem("user");
        if (u) {
          const parsed = JSON.parse(u);
          setUser(parsed);
          setFullName(
            parsed.first_name && parsed.last_name
              ? `${parsed.first_name} ${parsed.last_name}`
              : parsed.username || ""
          );
          setEmail(parsed.email || "");
        }

        const savedDossiers = localStorage.getItem("assisted_dossiers_data");
        if (savedDossiers) {
          setMyDossiers(JSON.parse(savedDossiers));
        } else {
          // Default demo active dossier
          const demoDossier: AssistedDossier = {
            id: "dossier-1",
            fullName: "Mehdi Toulati",
            phone: "+212 661-234567",
            email: "mehdi.toulati@scholar.ma",
            city: "Casablanca",
            degree: "Master (الماستر)",
            field: "Software Engineering & Computer Science",
            targetCities: ["Beijing (بكين)", "Shanghai (شنغهاي)"],
            preferredLanguage: "English (100% بالإنجليزية)",
            tier: "csc_guaranteed",
            status: "translating",
            submittedAt: "10 Nov 2026",
            trackingCode: "SC-MA-2027-4482",
            notes: "Target: Chinese Government Scholarship (CSC Type A / B)",
          };
          setMyDossiers([demoDossier]);
        }
      } catch {}
    }
  }, []);

  const handleCityToggle = (c: string) => {
    if (selectedCities.includes(c)) {
      if (selectedCities.length > 1) {
        setSelectedCities(selectedCities.filter((item) => item !== c));
      }
    } else {
      if (selectedCities.length < 3) {
        setSelectedCities([...selectedCities, c]);
      }
    }
  };

  const handleSubmitDossier = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const code = `SC-MA-2027-${Math.floor(1000 + Math.random() * 9000)}`;
      const newDossier: AssistedDossier = {
        id: `dossier-${Date.now()}`,
        fullName: fullName || "Moroccan Student",
        phone: phone || "+212 600-000000",
        email: email || "student@scholar.ma",
        city,
        degree,
        field,
        targetCities: selectedCities,
        preferredLanguage,
        tier: selectedTier,
        status: "received",
        submittedAt: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        trackingCode: code,
        notes,
      };

      const updated = [newDossier, ...myDossiers];
      setMyDossiers(updated);
      setSubmittedDossier(newDossier);
      try {
        localStorage.setItem("assisted_dossiers_data", JSON.stringify(updated));
      } catch {}
      setSubmitting(false);
      setActiveTab("tracker");
    }, 1000);
  };

  const handleOpenLiveChat = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open_live_chat"));
    }
  };

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-amber-500/30">
      {/* ─────────────────────────────────────────────────────────────
          1. LEFT SIDEBAR (Unified Component in Assisted Mode)
      ───────────────────────────────────────────────────────────── */}
      <StudentSidebar activeTab="home" />

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (Dedicated Assisted Service Flow)
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Choice Bar at Top: Clearly Showing Mode Selection */}
        <ApplicationChoiceBar variant="banner" />

        {/* Hero Header for Assisted Concierge */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#1a1207] via-[#0f172a] to-[#070d1d] border border-amber-500/40 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-3 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {lang === "ar"
                    ? "خدمة التكفل والضمان الأكاديمي 100% — مسار التقديم المدار"
                    : "Service de Délégation & Garantie d'Admission 100%"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2.5">
                {lang === "ar" ? (
                  <>
                    دع مستشارينا{" "}
                    <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                      يقدمون لك ويضمنون قبولك
                    </span>{" "}
                    في الصين
                  </>
                ) : (
                  <>
                    Laissez Nos Experts{" "}
                    <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                      Postuler & Garantir Votre Admission
                    </span>
                  </>
                )}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                {lang === "ar"
                  ? "فريقنا المتخصص في الرباط وبكين يتكفل بملفك كاملاً: الترجمة المحلفة للصينية، تصديق وزارة الخارجية، التقديم في الجامعات الشريكة، وصياغة خطابات الدوافع حتى صدور خطاب القبول الرسمي واستمارة الفيزا JW202."
                  : "Notre cabinet basé à Rabat et Pékin gère l'intégralité de vos démarches : traduction assermentée mandarin, légalisation MOFA, soumission officielle, lettres de motivation et suivi direct auprès des comités d'admission."}
              </p>
            </div>

            {/* Quick Action Buttons on Top Right */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("apply")}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>
                  {lang === "ar" ? "افتح ملف التكفل الآن ➔" : "Démarrer Mon Dossier Assisté ➔"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenLiveChat}
                className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {lang === "ar" ? "تواصل مباشر مع المستشار" : "Contacter un Conseiller"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. DEDICATED ASSISTED SERVICE TABS
        ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {lang === "ar" ? "1. كيف نتكفل بملفك؟" : "1. Comment ça marche"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("apply")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "apply"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>
              {lang === "ar" ? "2. تعبئة وفتح الملف" : "2. Formulaire de Dossier"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tracker")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer relative ${
              activeTab === "tracker"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {lang === "ar" ? "3. تتبع ملفي المدار" : "3. Suivi de Mon Dossier"}
            </span>
            {myDossiers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("packages")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "packages"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>
              {lang === "ar" ? "4. الباقات والأسعار" : "4. Forfaits & Tarifs"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("advisor")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "advisor"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HeadphonesIcon className="w-4 h-4" />
            <span>
              {lang === "ar" ? "5. المستشار المخصص" : "5. Conseiller Référent"}
            </span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: OVERVIEW & COMPARISON (Self vs Assisted)
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* 5-Step Process Roadmap */}
            <div className="rounded-3xl p-6 sm:p-7 bg-[#0b1222] border border-white/10 shadow-xl">
              <h2 className="text-lg font-black text-white mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                <span>
                  {lang === "ar"
                    ? "مراحل تكفلنا بملفك الأكاديمي (من البداية حتى وصولك للصين)"
                    : "Les 5 Étapes de Prise en Charge de Votre Candidature"}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                {lang === "ar"
                  ? "لا داعي للقلق بشأن الإجراءات والترجمات ومراسلة الجامعات، مستشارونا يتولون كل خطوة."
                  : "Déléguez chaque étape complexe à nos experts pour maximiser vos chances de bourse complète."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
                {[
                  {
                    step: "01",
                    title: lang === "ar" ? "التقييم المجاني" : "Audit Académique",
                    desc:
                      lang === "ar"
                        ? "دراسة ملفك وتحديد أفضل 3 جامعات تضمن لك منحة كاملة."
                        : "Analyse de vos relevés de notes et ciblage des meilleures bourses.",
                    icon: GraduationCap,
                  },
                  {
                    step: "02",
                    title: lang === "ar" ? "الترجمة والتصديق" : "Traduction & Légalisation",
                    desc:
                      lang === "ar"
                        ? "الترجمة المحلفة الرسمية للصينية وتصديق وزارة الخارجية."
                        : "Traduction assermentée mandarin & apostille MAEC.",
                    icon: FileCheck2,
                  },
                  {
                    step: "03",
                    title: lang === "ar" ? "صياغة الملف وSOP" : "Dossier & Projet SOP",
                    desc:
                      lang === "ar"
                        ? "كتابة خطاب دوافع احترافي وخطة دراسة بالمعايير الصينية."
                        : "Rédaction d'excellence du projet d'étude et lettres d'appui.",
                    icon: FileText,
                  },
                  {
                    step: "04",
                    title: lang === "ar" ? "التقديم والمتابعة" : "Dépôt & Négociation",
                    desc:
                      lang === "ar"
                        ? "إيداع الملف بالجامعات والتواصل اليومي مع مكتب القبول ببكين."
                        : "Soumission directe et suivi auprès des doyens d'admissions.",
                    icon: Building2,
                  },
                  {
                    step: "05",
                    title: lang === "ar" ? "القبول والتأشيرة" : "Admission & Visa JW202",
                    desc:
                      lang === "ar"
                        ? "استلام القبول واستمارة JW202 وإنهاء تأشيرة X1 كاملة."
                        : "Réception de la lettre d'admission, formulaire JW202 et visa X1.",
                    icon: Award,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-black text-amber-400 font-mono">
                          {item.step}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                          <item.icon className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Comparison Table: Self-Apply vs We Apply For You */}
            <div className="rounded-3xl p-6 sm:p-7 bg-[#0b1222] border border-white/10 shadow-xl overflow-hidden">
              <h2 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span>
                  {lang === "ar"
                    ? "مقارنة واضحة: التقديم الذاتي مقابل نحن نقدّم لك"
                    : "Comparatif Détaillé : Candidature Autonome vs Délégation Complète"}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                {lang === "ar"
                  ? "تعرف على الفروق الجوهرية لتختار المسار الأنسب لطموحك ووقتك:"
                  : "Visualisez précisément ce que notre prise en charge vous apporte :"}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-3 px-4 font-bold">
                        {lang === "ar" ? "المعيار" : "Critère"}
                      </th>
                      <th className="py-3 px-4 font-bold text-blue-400">
                        {lang === "ar"
                          ? "التقديم الذاتي (أنت تقدم بنفسك)"
                          : "Candidature Autonome (Vous-même)"}
                      </th>
                      <th className="py-3 px-4 font-bold text-amber-400 bg-amber-500/10 rounded-t-xl">
                        {lang === "ar"
                          ? "⭐ نحن نتكفل بالتقديم لك (ScholarChina)"
                          : "⭐ Délégation Complète (ScholarChina)"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {lang === "ar" ? "نسبة قبول المنحة" : "Taux d'Admission"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        ~28% (بسبب أخطاء في الوثائق وتفويت المواعيد)
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400 bg-amber-500/5">
                        98.4% (اتفاقيات رسمية مع الجامعات الصينية)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {lang === "ar" ? "الترجمة والتصديق" : "Traductions & Apostilles"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        تبحث بنفسك عن مترجم محلف وتدفع التكاليف وتذهب للخارجية
                      </td>
                      <td className="py-3.5 px-4 text-amber-300 font-semibold bg-amber-500/5">
                        نتكفل بها بالكامل مع مترجمينا المعتمدين والمصادقة
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {lang === "ar" ? "خطاب الدوافع (SOP)" : "Projet d'Étude & Lettres"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        تكتبه بمفردك وقد يحتوي أخطاء ترفضه لجان القبول
                      </td>
                      <td className="py-3.5 px-4 text-amber-300 font-semibold bg-amber-500/5">
                        صياغة أكاديمية احترافية مخصصة لكل تخصص وجامعة
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {lang === "ar" ? "متابعة لجنة القبول" : "Liaison avec la Chine"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        لا يوجد رد أو تنتظر شهوراً بدون معرفة مصير الملف
                      </td>
                      <td className="py-3.5 px-4 text-amber-300 font-semibold bg-amber-500/5">
                        تواصل مباشر مع مكاتب القبول بالجامعات الصينية ببكين
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {lang === "ar" ? "الضمان المالي" : "Garantie Remboursement"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        رسوم تسجيل الجامعات تضيع في حال الرفض
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400 bg-amber-500/5">
                        ضمان القبول 100% أو استرجاع الرسوم وفق العقد
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-200">
                    {lang === "ar"
                      ? "هل تريد منا البدء فوراً في إعداد ملفك والتواصل مع الجامعات؟"
                      : "Prêt à déléguer votre dossier pour garantir votre place à la rentrée ?"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("apply")}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs whitespace-nowrap shadow-md cursor-pointer transition-all"
                >
                  {lang === "ar" ? "ابدأ تعبئة الملف الآن ➔" : "Remplir Mon Dossier ➔"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: SUBMIT ASSISTED DOSSIER (Intake Form)
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "apply" && (
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0b1222] border border-amber-500/30 shadow-2xl max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>
                    {lang === "ar"
                      ? "استمارة فتح ملف التقديم المدار — ScholarChina"
                      : "Ouverture de Dossier de Candidature Déléguée"}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === "ar"
                    ? "املأ بياناتك الأساسية واختياراتك وسيتواصل معك مستشارك المعتمد خلال أقل من ساعتين."
                    : "Renseignez vos coordonnées et choix. Un conseiller prendra contact sous 2 heures."}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                Session 2026/2027
              </span>
            </div>

            <form onSubmit={handleSubmitDossier} className="space-y-6">
              {/* Step 1: Personal Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>
                    {lang === "ar" ? "1. المعلومات الشخصية للطالب" : "1. Informations Personnelles"}
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {lang === "ar" ? "الاسم الكامل (حسب جواز السفر)" : "Nom et Prénom complet"}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="ex: Mehdi Toulati"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {lang === "ar" ? "رقم الهاتف / الواتساب" : "Numéro WhatsApp / Téléphone"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+212 661-000000"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {lang === "ar" ? "البريد الإلكتروني" : "Adresse Email"}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {lang === "ar" ? "المدينة بالمغرب" : "Ville de résidence au Maroc"}
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      {MOROCCAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Target Degree & Major */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>
                    {lang === "ar" ? "2. التخصص والدرجة العلمية المطلوبة" : "2. Filière & Niveau Visé"}
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {lang === "ar" ? "الدرجة المستهدفة" : "Niveau d'études"}
                    </label>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="Bachelor (البكالوريوس)">Bachelor (البكالوريوس - 4 سنوات)</option>
                      <option value="Master (الماستر)">Master (الماستر - 2 إلى 3 سنوات)</option>
                      <option value="PhD (الدكتوراه)">PhD (الدكتوراه - 3 إلى 4 سنوات)</option>
                      <option value="Language Year (سنة اللغة الصينية)">
                        Language Year (سنة تحضيرية لغة صينية)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {lang === "ar" ? "مجال الدراسة المطلوب" : "Filière Souhaitée"}
                    </label>
                    <select
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      {POPULAR_FIELDS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {lang === "ar" ? "لغة التدريس المفضلة" : "Langue d'Enseignement"}
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="English (100% بالإنجليزية)">
                        English (100% بالإنجليزية - بدون سنة لغة)
                      </option>
                      <option value="Chinese + 1 Prep Year (الصينية مع سنة تحضيرية)">
                        Chinese + 1 Prep Year (الصينية مع سنة تحضيرية مجانية)
                      </option>
                      <option value="Either (مفتوح على اللغتين)">Either (مفتوح على الخيارين)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {lang === "ar" ? "المدن المفضلة بالصين (اختر حتى 3)" : "Villes Préférées (Max 3)"}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CHINESE_CITIES.map((c) => {
                        const selected = selectedCities.includes(c);
                        return (
                          <button
                            type="button"
                            key={c}
                            onClick={() => handleCityToggle(c)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              selected
                                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Service Package Tier Selection */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span>
                    {lang === "ar" ? "3. اختر باقة التكفل المفضلة" : "3. Choix du Forfait d'Assistance"}
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Tier 1 */}
                  <div
                    onClick={() => setSelectedTier("standard")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedTier === "standard"
                        ? "bg-amber-500/15 border-amber-400 shadow-md"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white text-xs mb-1">
                        {lang === "ar" ? "باقة التقديم الأساسية" : "Pack Essentiel"}
                      </div>
                      <div className="text-base font-black text-amber-400 font-mono">
                        1,900 MAD
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        مراجعة الملف والتقديم في جامعتين صينيتين مع متابعة القبول.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                      <span>{selectedTier === "standard" ? "✓ تم الاختيار" : "اختيار"}</span>
                    </div>
                  </div>

                  {/* Tier 2: CSC Guaranteed */}
                  <div
                    onClick={() => setSelectedTier("csc_guaranteed")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                      selectedTier === "csc_guaranteed"
                        ? "bg-amber-500/25 border-amber-400 shadow-lg shadow-amber-500/20"
                        : "bg-white/5 border-amber-500/30 hover:border-amber-400"
                    }`}
                  >
                    <span className="absolute top-2 right-2 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-rose-500 text-white">
                      الأكثر طلباً
                    </span>
                    <div>
                      <div className="font-bold text-white text-xs mb-1">
                        {lang === "ar" ? "باقة القبول المضمون CSC" : "Pack Garantie CSC"}
                      </div>
                      <div className="text-base font-black text-amber-300 font-mono">
                        4,900 MAD
                      </div>
                      <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                        التقديم في 3-5 جامعات، ترجمة محلفة كاملة، كتابة SOP وضمان استرجاع الرسوم.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                      <span>{selectedTier === "csc_guaranteed" ? "✓ تم الاختيار" : "اختيار"}</span>
                    </div>
                  </div>

                  {/* Tier 3: VIP Diplomatic */}
                  <div
                    onClick={() => setSelectedTier("vip")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedTier === "vip"
                        ? "bg-amber-500/15 border-amber-400 shadow-md"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white text-xs mb-1">
                        {lang === "ar" ? "باقة VIP الشاملة" : "Pack VIP Sérénité"}
                      </div>
                      <div className="text-base font-black text-amber-400 font-mono">
                        9,900 MAD
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        كل ما سبق + إنهاء تأشيرة X1 بالرباط، والاستقبال الخاص بالمطار حتى السكن.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                      <span>{selectedTier === "vip" ? "✓ تم الاختيار" : "اختيار"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Notes / Questions */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                <label className="block text-xs font-semibold text-slate-300">
                  {lang === "ar"
                    ? "ملاحظات إضافية أو جامعات محددة في ذهنك:"
                    : "Notes particulières ou universités ciblées :"}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "مثال: أرغب بمنحة في بكين في تخصص الذكاء الاصطناعي، ولدي بكالوريا علوم رياضية بمعدل 15.5..."
                      : "Ex: Bac Sciences Maths avec 15.5, je souhaite une bourse CSC à Pékin en IA..."
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Submission Button */}
              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {lang === "ar"
                      ? "بياناتك محمية ومشفرة وفق أعلى معايير الخصوصية"
                      : "Données confidentielles protégées"}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-amber-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>{lang === "ar" ? "جاري إنشاء الملف..." : "Création en cours..."}</span>
                  ) : (
                    <>
                      <span>
                        {lang === "ar" ? "تأكيد وإرسال الملف للمستشار" : "Valider Mon Dossier"}
                      </span>
                      <ArrowRight className="w-4 h-4 rtl-flip" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: ASSISTED DOSSIER TRACKER (Suivi Délégué)
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "tracker" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="rounded-3xl p-6 sm:p-8 bg-[#0b1222] border border-amber-500/30 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>
                      {lang === "ar"
                        ? "منصة تتبع ملفات التكفل — ScholarChina Live Pipeline"
                        : "Suivi en Temps Réel de Votre Dossier Assisté"}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === "ar"
                      ? "تابع كل خطوة يقوم بها مستشارنا الأكاديمي وفريق التقديم في الصين."
                      : "Visualisez l'état d'avancement exact de vos soumissions universitaires."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("apply")}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>+ {lang === "ar" ? "ملف إضافي" : "Nouveau Dossier"}</span>
                </button>
              </div>

              {myDossiers.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-300 font-bold mb-1">
                    {lang === "ar" ? "لا توجد ملفات مدارة حتى الآن" : "Aucun dossier en cours"}
                  </p>
                  <p className="text-xs text-slate-400 mb-5">
                    {lang === "ar"
                      ? "افتح ملفك الآن وسيتولى مستشارونا التقديم بالكامل بدلاً منك."
                      : "Déposez votre premier dossier pour que notre équipe prenne le relais."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("apply")}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                  >
                    {lang === "ar" ? "فتح ملف التقديم المدار" : "Ouvrir Mon Dossier"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {myDossiers.map((dossier) => (
                    <div
                      key={dossier.id}
                      className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg space-y-5"
                    >
                      {/* Dossier Header Info */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                              {dossier.trackingCode}
                            </span>
                            <span className="text-xs text-slate-400">
                              {dossier.submittedAt}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white mt-1">
                            {dossier.field} • {dossier.degree}
                          </h3>
                        </div>

                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span>
                            {dossier.status === "received"
                              ? lang === "ar"
                                ? "تم استلام الملف - جاري التدقيق"
                                : "Dossier Réceptionné"
                              : dossier.status === "translating"
                              ? lang === "ar"
                                ? "قيد الترجمة المحلفة والتصديق"
                                : "Traduction Assermentée"
                              : dossier.status === "submitted"
                              ? lang === "ar"
                                ? "تم الإيداع بالجامعات الصينية"
                                : "Déposé en Faculté"
                              : lang === "ar"
                              ? "مقبول ورسمي"
                              : "Admission Validée"}
                          </span>
                        </span>
                      </div>

                      {/* 5 Progress Checkpoints */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {[
                          {
                            title: lang === "ar" ? "1. تدقيق الملف" : "1. Audit",
                            done: true,
                          },
                          {
                            title: lang === "ar" ? "2. الترجمة المحلفة" : "2. Traduction",
                            done: dossier.status !== "received",
                          },
                          {
                            title: lang === "ar" ? "3. صياغة SOP" : "3. Projet SOP",
                            done:
                              dossier.status === "submitted" ||
                              dossier.status === "interview" ||
                              dossier.status === "accepted",
                          },
                          {
                            title: lang === "ar" ? "4. الإيداع بالجامعات" : "4. Soumission",
                            done:
                              dossier.status === "submitted" ||
                              dossier.status === "interview" ||
                              dossier.status === "accepted",
                          },
                          {
                            title: lang === "ar" ? "5. القبول وJW202" : "5. JW202",
                            done: dossier.status === "accepted",
                          },
                        ].map((chk, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-xl border text-center ${
                              chk.done
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                                : "bg-white/[0.02] border-white/5 text-slate-500"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1 mb-1">
                              {chk.done ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <span className="text-[11px] font-bold block">{chk.title}</span>
                          </div>
                        ))}
                      </div>

                      {/* Dossier Meta Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        <div>
                          <span className="text-slate-400 block text-[11px]">
                            {lang === "ar" ? "الطالب:" : "Étudiant :"}
                          </span>
                          <span className="font-semibold text-white">
                            {dossier.fullName} ({dossier.city})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">
                            {lang === "ar" ? "المدن المستهدفة:" : "Villes Ciblées :"}
                          </span>
                          <span className="font-semibold text-white">
                            {dossier.targetCities?.join(", ") || "Beijing, Shanghai"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">
                            {lang === "ar" ? "المستشار المكلف:" : "Conseiller :"}
                          </span>
                          <span className="font-semibold text-amber-300">
                            Dr. Youssef B. & Ms. Chen Li (Rabat/Beijing)
                          </span>
                        </div>
                      </div>

                      {/* Quick Contact with Assigned Advisor */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-400">
                          {lang === "ar"
                            ? "تحديث حالة الملف يتم تلقائياً كل 24 ساعة"
                            : "Mise à jour automatique quotidienne"}
                        </span>

                        <button
                          type="button"
                          onClick={handleOpenLiveChat}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>
                            {lang === "ar" ? "تواصل مع المستشار المكلف" : "Échanger avec mon conseiller"}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 4: PACKAGES & PRICING
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                {lang === "ar" ? "عقود رسمية وضمانات قانونية" : "Transparence Totale"}
              </span>
              <h2 className="text-2xl font-black text-white mt-2 mb-1">
                {lang === "ar"
                  ? "باقات التكفل الكامل بمنحة الدراسة في الصين"
                  : "Nos Formules de Prise en Charge Complète"}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === "ar"
                  ? "جميع الباقات تشمل عقداً قانونياً يضمن لك القبول أو استرجاع الرسوم."
                  : "Contrat d'engagement légal avec clause de garantie de remboursement."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pack 1 */}
              <div className="rounded-3xl p-6 bg-[#0b1222] border border-white/10 flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Formule 01
                  </span>
                  <h3 className="text-lg font-black text-white mt-1 mb-2">
                    {lang === "ar" ? "باقة التقديم الموجه" : "Pack Essentiel"}
                  </h3>
                  <div className="text-2xl font-black text-white font-mono mb-4">
                    1,900 <span className="text-xs font-sans text-slate-400">MAD</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>تدقيق الملف الأكاديمي والشهادات</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>التقديم الرسمي في جامعتين صينيتين</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>تنسيق الترجمة المحلفة للصينية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>متابعة إشعارات القبول المبدئي</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTier("standard");
                    setActiveTab("apply");
                  }}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  {lang === "ar" ? "اختيار باقة 1,900 درهم" : "Choisir ce Pack"}
                </button>
              </div>

              {/* Pack 2: Highlighted */}
              <div className="rounded-3xl p-6 bg-gradient-to-b from-[#1e1408] to-[#0b1222] border border-amber-500/60 flex flex-col justify-between shadow-2xl relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md">
                  ⭐ الأكثر اختياراً وضماناً
                </span>
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Formule 02 • CSC Garantie
                  </span>
                  <h3 className="text-lg font-black text-white mt-1 mb-2">
                    {lang === "ar" ? "باقة القبول المضمون CSC" : "Pack Bourse CSC Garantie"}
                  </h3>
                  <div className="text-2xl font-black text-amber-300 font-mono mb-4">
                    4,900 <span className="text-xs font-sans text-slate-400">MAD</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-200 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="font-bold text-amber-200">
                        ضمان القبول الجامعي 100% أو استرجاع الرسوم
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>التقديم في 3 إلى 5 جامعات صينية كبرى</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>الترجمة المحلفة الكاملة للصينية مشمولة</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>صياغة مخصصة لخطاب الدوافع (SOP) ورسائل التوصية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>مرافقة شاملة لإصدار الفيزا واستمارة JW202</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTier("csc_guaranteed");
                    setActiveTab("apply");
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:brightness-110 text-white font-black text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  {lang === "ar" ? "اختيار باقة الضمان (4,900 درهم) ➔" : "Choisir ce Pack ➔"}
                </button>
              </div>

              {/* Pack 3: VIP */}
              <div className="rounded-3xl p-6 bg-[#0b1222] border border-white/10 flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Formule 03 • VIP Concierge
                  </span>
                  <h3 className="text-lg font-black text-white mt-1 mb-2">
                    {lang === "ar" ? "باقة VIP الشاملة حتى السكن" : "Pack VIP Sérénité Totale"}
                  </h3>
                  <div className="text-2xl font-black text-white font-mono mb-4">
                    9,900 <span className="text-xs font-sans text-slate-400">MAD</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple flex-shrink-0" />
                      <span>كل ما تتضمنه باقة القبول المضمون</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple flex-shrink-0" />
                      <span>إنهاء إجراءات التأشيرة X1 كاملة برباط</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple flex-shrink-0" />
                      <span>حجز أرخص تذكرة طيران كازا ➔ بكين</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple flex-shrink-0" />
                      <span>استقبال خاص بمطار الصين وسيارة للحي الجامعي</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple flex-shrink-0" />
                      <span>شريحة هاتف صينية ومرافقة تسجيل الغرفة</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTier("vip");
                    setActiveTab("apply");
                  }}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  {lang === "ar" ? "اختيار باقة VIP الشاملة" : "Choisir le Pack VIP"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 5: DEDICATED ADVISOR & APPOINTMENT
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "advisor" && (
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0b1222] border border-white/10 shadow-2xl max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-bold text-xl">
                SC
              </div>
              <div>
                <h2 className="text-lg font-black text-white">
                  {lang === "ar"
                    ? "مكتب المستشارين الأكاديميين (الرباط وبكين)"
                    : "Pôle Conseillers Dédiés (Rabat & Pékin)"}
                </h2>
                <p className="text-xs text-slate-400">
                  {lang === "ar"
                    ? "تواصل مباشر مع مستشارك المسؤول عن ملفك للحصول على استشارة هاتفية أو مقابلة حضورية بالرباط."
                    : "Contactez directement votre conseiller référent pour un point d'étape ou RDV à Rabat."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-400">
                  {lang === "ar" ? "المستشار المكلف بالمغرب" : "Conseiller Référent Maroc"}
                </span>
                <h4 className="text-sm font-bold text-white">
                  Dr. Youssef Benjelloun (Rabat)
                </h4>
                <p className="text-xs text-slate-400 leading-snug">
                  خريج جامعة تسينغهوا ببكين • مستشار معتمد لشؤون المنح والتأشيرات الطلابية.
                </p>
                <div className="pt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>+212 661-987654 (WhatsApp Pro)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-cyan">
                  {lang === "ar" ? "المستشارة ببكين والصين" : "Chargée de Liaison Chine"}
                </span>
                <h4 className="text-sm font-bold text-white">
                  Ms. Chen Li / 陈老师 (Beijing)
                </h4>
                <p className="text-xs text-slate-400 leading-snug">
                  منسقة القبول مع لجان جامعات بكين وشنغهاي وهانغتشو واستقبال الطلاب.
                </p>
                <div className="pt-2 text-xs font-mono text-cyan flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan" />
                  <span>WeChat: ScholarChina_Desk</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-300">
                {lang === "ar"
                  ? "مكتب الاستقبال الحضوري: 16، شارع أحمد بلافريج، السويسي، الرباط."
                  : "Bureau d'accueil : 16, Av. Ahmed Balafrej, Souissi, Rabat."}
              </div>
              <button
                type="button"
                onClick={handleOpenLiveChat}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{lang === "ar" ? "فتح المحادثة الفورية الآن" : "Ouvrir le Chat"}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function HeadphonesIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
