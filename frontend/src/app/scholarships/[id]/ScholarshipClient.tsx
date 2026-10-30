"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  GraduationCap,
  MapPin,
  ExternalLink,
  FileText,
  DollarSign,
  Calendar,
  BookOpen,
  Mail,
  Phone,
  CheckCircle2,
  Upload,
  Camera,
  Trash2,
  X,
  Sparkles,
  Users,
  Copy,
  Check,
  Building2,
  Award,
  Globe,
  Home,
  HeartPulse,
  Banknote,
  Send,
  Plane,
  Layers,
  ChevronRight,
  ShieldCheck,
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchApi,
  getToken,
  clearToken,
  getApiBaseUrl,
  addToTracker,
  getTrackedApplications,
  type ScholarshipDetail,
  type Scholarship,
  type ApplicationTrackerItem,
  type User,
} from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { REAL_SCHOLARSHIP_DETAILS } from "@/data/scholarshipsData";
import AutoText from "@/components/AutoText";
import ScholarshipCard from "@/components/ScholarshipCard";
import StudentSidebar from "@/components/StudentSidebar";
import ScholarshipEmblem, {
  getScholarshipTheme,
  type ScholarshipThemeInfo,
} from "@/components/ScholarshipEmblem";
import FinancialHonestyLedger from "@/components/FinancialHonestyLedger";
import LanguageHonestySelector from "@/components/LanguageHonestySelector";
import AdmissionAnnouncements, {
  type Announcement,
} from "@/components/AdmissionAnnouncements";
import ContactInformationCard from "@/components/ContactInformationCard";
import FundingBreakdownCard from "@/components/FundingBreakdownCard";
import AcceptanceOddsMeter from "@/components/AcceptanceOddsMeter";

const ANN_STOP = new Set([
  "the", "a", "an", "at", "for", "of", "and", "in", "on", "to",
  "2026", "2027", "2025", "scholarship", "scholarships", "program",
  "programme", "international", "students", "student", "university",
  "college", "school",
]);

function annTokens(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !ANN_STOP.has(w));
}

// ─────────────────────────────────────────────────────────────
// SMART TEXT PARSERS (Breaks down heavy text into eye-pleasing cards)
// ─────────────────────────────────────────────────────────────
interface ParsedBenefits {
  tuition: string;
  dorm: string;
  stipend: string;
  insurance: string;
}

function parseScholarshipDescription(desc: string, type: string): {
  cleanIntro: string;
  agencyCode: string | null;
  benefits: ParsedBenefits;
} {
  if (!desc) {
    return {
      cleanIntro: "Official Chinese Government and University Scholarship program providing academic funding and tuition support for Moroccan candidates.",
      agencyCode: null,
      benefits: {
        tuition: "100% Free Tuition Covered",
        dorm: "Free On-Campus Student Residence",
        stipend: type === "full" ? "2,500 - 3,500 RMB / month" : "Partial / Merit Subsidy",
        insurance: "800 RMB / year Comprehensive Medical Insurance",
      },
    };
  }

  // Extract CSC Agency Code (e.g. 【 13612 】 or "Agency Code: 10001")
  const codeMatch = desc.match(/【\s*(\d+)\s*】/) || desc.match(/Agency Code[:\s]+(\d+)/i);
  const agencyCode = codeMatch ? codeMatch[1] : null;

  // Clean Intro: isolate main introductory statement before emoji package or bullets
  let cleanIntro = desc
    .split(/💰|•|Step 1|Bourse Partielle|Partial Scholarship Package/i)[0]
    .replace(/\(CSC Agency Code:.*?\)/i, "")
    .replace(/【\s*\d+\s*】/g, "")
    .trim();

  if (cleanIntro.length < 15) {
    cleanIntro = "Official scholarship program providing academic funding, living support, and campus facilities in China.";
  }

  const lower = desc.toLowerCase();
  const tuition =
    lower.includes("tuition") && (lower.includes("100%") || lower.includes("free") || lower.includes("waiver") || lower.includes("pris en charge"))
      ? "100% Free Tuition (0 DH / 0 RMB)"
      : type === "full"
      ? "100% Full Tuition Waiver"
      : "Partial Tuition Exemption";

  const dorm =
    lower.includes("dormitory") || lower.includes("logement") || lower.includes("dorm")
      ? lower.includes("free") || lower.includes("gratuit")
        ? "Free On-Campus International Dorm"
        : "Subsidized Campus Student Housing"
      : type === "full"
      ? "Free University Dormitory"
      : "Subsidized Student Dorm";

  const stipend =
    lower.includes("stipend") || lower.includes("monthly") || lower.includes("allocation")
      ? lower.includes("3,500") || lower.includes("3500")
        ? "3,500 RMB / month (Doctorat/PhD)"
        : lower.includes("3,000") || lower.includes("3000")
        ? "3,000 RMB / month (Master)"
        : lower.includes("2,500") || lower.includes("2500")
        ? "2,500 RMB / month (Licence/Bachelor)"
        : "Monthly Living Allowance"
      : lower.includes("self-funded") || type === "partial"
      ? "Self-Funded Monthly Meals & Expenses"
      : "2,500 à 3,500 RMB / month";

  const insurance =
    lower.includes("insurance") || lower.includes("assurance") || lower.includes("800")
      ? "800 RMB / yr Comprehensive Health Insurance"
      : "Comprehensive Medical Coverage Included";

  return {
    cleanIntro,
    agencyCode,
    benefits: { tuition, dorm, stipend, insurance },
  };
}

interface EligibilityCardItem {
  icon: string;
  title: string;
  desc: string;
}

function parseEligibilityCriteria(text: string): EligibilityCardItem[] {
  if (!text) return [];
  const parts = text.split(/(?=\d+\.\s+)/);
  if (parts.length <= 1) {
    return [
      {
        icon: "🎓",
        title: "Conditions Générales",
        desc: text.replace(/🇲🇦.*?Criteria.*?:/i, "").trim(),
      },
    ];
  }

  const items: EligibilityCardItem[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(\d+\.\s*[^:\n]+):?([\s\S]*)$/);
    if (match) {
      const rawTitle = match[1].replace(/^\d+\.\s*/, "").trim();
      const rawDesc = match[2].trim();
      let icon = "📋";
      if (rawTitle.toLowerCase().includes("nationality") || rawTitle.toLowerCase().includes("nationalité")) icon = "🇲🇦";
      else if (rawTitle.toLowerCase().includes("qualif") || rawTitle.toLowerCase().includes("education") || rawTitle.toLowerCase().includes("academic")) icon = "🎓";
      else if (rawTitle.toLowerCase().includes("age")) icon = "🎂";
      else if (rawTitle.toLowerCase().includes("language") || rawTitle.toLowerCase().includes("langue")) icon = "🗣️";
      items.push({ icon, title: rawTitle, desc: rawDesc });
    } else {
      items.push({ icon: "📌", title: "Condition d'Admission", desc: trimmed });
    }
  }
  return items;
}

interface ParsedStep {
  number: number;
  title: string;
  bullets: string[];
}

function parseApplicationInstructions(text: string): ParsedStep[] {
  if (!text) return [];
  const parts = text.split(/(?=Step\s+\d+:?|Étape\s+\d+:?)/i);
  const steps: ParsedStep[] = [];
  let idx = 1;
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed || trimmed.startsWith("📋")) continue;
    const match = trimmed.match(/^(?:Step|Étape)\s+(\d+):?\s*([^:\n]+):?([\s\S]*)$/i);
    if (match) {
      const stepNumber = parseInt(match[1], 10) || idx++;
      const title = match[2].trim();
      const body = match[3].trim();
      const bullets = body
        .split(/•|\n-/)
        .map((s) => s.trim())
        .filter((s) => s.length > 3);
      steps.push({
        number: stepNumber,
        title,
        bullets: bullets.length > 0 ? bullets : [body],
      });
    }
  }
  return steps;
}

type DetailTab = "overview" | "eligibility" | "documents" | "roadmap" | "contact";

export default function ScholarshipClient() {
  const params = useParams();
  const router = useRouter();
  const { t, lang } = useLang();
  const schId = params?.id;

  const [scholarship, setScholarship] = useState<ScholarshipDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});
  const [showDocs, setShowDocs] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("passport");
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [related, setRelated] = useState<Scholarship[]>([]);
  const [mounted, setMounted] = useState(false);
  const [trackedItem, setTrackedItem] = useState<ApplicationTrackerItem | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackSuccessMsg, setTrackSuccessMsg] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  // Check document checklist from localStorage
  useEffect(() => {
    if (!schId) return;
    try {
      const raw = localStorage.getItem(`sch-checklist-${schId}`);
      setCheckedDocs(raw ? JSON.parse(raw) : {});
    } catch {
      setCheckedDocs({});
    }
  }, [schId]);

  // Check if scholarship is already in application tracker
  useEffect(() => {
    if (!schId) return;
    const numId = Number(schId);
    if (isNaN(numId)) return;

    if (getToken()) {
      getTrackedApplications().then((res) => {
        if (res.data?.applications) {
          const match = res.data.applications.find((a) => a.scholarship.id === numId);
          if (match) setTrackedItem(match);
        }
      });
    } else {
      try {
        const local = localStorage.getItem("demo_application_tracker");
        if (local) {
          const list: ApplicationTrackerItem[] = JSON.parse(local);
          const match = list.find((a) => a.scholarship.id === numId);
          if (match) setTrackedItem(match);
        }
      } catch {}
    }
  }, [schId]);

  // Load scholarship details
  useEffect(() => {
    async function loadDetail() {
      if (!schId) return;
      setLoading(true);
      const res = await fetchApi<ScholarshipDetail>(`/scholarships/${schId}/`);
      if (res.data) {
        setScholarship(res.data);
      } else {
        const local = (REAL_SCHOLARSHIP_DETAILS as any)[String(schId)];
        if (local) {
          setScholarship(local);
        }
      }
      setLoading(false);
    }
    loadDetail();
  }, [schId]);

  // Load related scholarships at the same university
  useEffect(() => {
    async function loadRelated() {
      if (!scholarship?.university?.id) return;
      const res = await fetchApi<Scholarship[]>(
        `/scholarships/?university=${scholarship.university.id}`
      );
      if (res.data) {
        setRelated(res.data.filter((s) => s.id !== scholarship.id).slice(0, 3));
      }
    }
    loadRelated();
  }, [scholarship]);

  // Load university announcements
  useEffect(() => {
    async function loadAnn() {
      if (!scholarship?.university?.name) return;
      try {
        const res = await fetchApi<Announcement[]>(
          `/announcements/?university=${encodeURIComponent(scholarship.university.name)}`
        );
        if (res.data) {
          setAnnouncements(res.data);
        }
      } catch {}
    }
    loadAnn();
  }, [scholarship]);

  const toggleDoc = (idx: number) => {
    const next = { ...checkedDocs, [idx]: !checkedDocs[idx] };
    setCheckedDocs(next);
    if (schId) {
      try {
        localStorage.setItem(`sch-checklist-${schId}`, JSON.stringify(next));
      } catch {}
    }
  };

  const resetChecklist = () => {
    setCheckedDocs({});
    if (schId) {
      try {
        localStorage.removeItem(`sch-checklist-${schId}`);
      } catch {}
    }
  };

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setToastMessage(`✅ Code d'Agence [${code}] copié dans le presse-papier !`);
      setTimeout(() => setCopiedCode(false), 2500);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleAddToTracker = async () => {
    if (!scholarship) return;
    setTrackingLoading(true);
    setTrackSuccessMsg(null);
    const res = await addToTracker(scholarship.id);
    setTrackingLoading(false);
    if (res.data) {
      setTrackedItem(res.data);
      setTrackSuccessMsg("Ajouté avec succès à vos candidatures !");
      setToastMessage("✅ Bourse enregistrée dans votre pipeline de candidatures !");
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const relevantAnnouncements = useMemo(() => {
    if (!scholarship || !announcements.length) return [];
    const tokens = new Set([
      ...annTokens(scholarship.title),
      ...annTokens(scholarship.university?.name || ""),
      (scholarship.level || "").toLowerCase(),
    ]);
    return announcements.filter((a) => {
      const matchText = (a.title + " " + (a.kind || "")).toLowerCase();
      let hits = 0;
      tokens.forEach((t) => {
        if (matchText.includes(t)) hits++;
      });
      return hits >= 1;
    });
  }, [scholarship, announcements]);

  if (loading) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-cyan/30">
        <StudentSidebar activeTab="scholarships" />
        <div className="flex-1 flex items-center justify-center min-h-screen bg-[#060a14]/65">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan/30 border-t-cyan rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Chargement de la bourse...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col lg:flex-row antialiased">
        <StudentSidebar activeTab="scholarships" />
        <div className="flex-1 flex items-center justify-center min-h-screen bg-[#060a14]/65 p-6">
          <div className="rounded-3xl bg-[#0c1527]/90 border border-white/10 p-10 max-w-md text-center">
            <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Bourse introuvable</h2>
            <p className="text-xs text-slate-400 mb-6">
              Cette opportunité n'est plus disponible ou a été déplacée.
            </p>
            <Link
              href="/scholarships"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux bourses</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const theme: ScholarshipThemeInfo = getScholarshipTheme(scholarship as any);
  const parsed = parseScholarshipDescription(scholarship.description, scholarship.type);
  const eligibilityItems = parseEligibilityCriteria(scholarship.eligibility_criteria);
  const parsedSteps = parseApplicationInstructions(scholarship.application_instructions);

  const hasDeadline = Boolean(scholarship.application_deadline);
  const deadlineTs = hasDeadline ? new Date(scholarship.application_deadline) : null;
  const diffMs = deadlineTs ? deadlineTs.getTime() - Date.now() : NaN;
  const daysLeft = Math.ceil(diffMs / 86400000);
  const isDeadlineSoon = diffMs > 0 && diffMs <= 14 * 86400000;
  const isDeadlinePassed = hasDeadline && diffMs <= 0;
  const showCountdown = hasDeadline && diffMs > 0;

  const docs = scholarship.required_documents || [];
  const doneCount = docs.filter((_, i) => checkedDocs[i]).length;
  const docsPct = docs.length ? Math.round((doneCount / docs.length) * 100) : 0;
  const allDocsDone = docs.length > 0 && doneCount === docs.length;

  const deadlineFormatted = deadlineTs
    ? deadlineTs.toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Admissions Ouvertes 2026/27";

  return (
    <div className="min-h-screen text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-cyan/30">
      {/* ─────────────────────────────────────────────────────────────
          1. LEFT SIDEBAR (Identical to Student Portal)
      ───────────────────────────────────────────────────────────── */}
      <StudentSidebar activeTab="scholarships" />

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (Translucent Glass Shell)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060a14]/65 backdrop-blur-[2px] min-h-screen">
        {/* Sticky Top Header Navigation */}
        <header className="sticky top-0 z-30 w-full px-4 sm:px-8 py-3 bg-[#0a101d]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/scholarships"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-xs font-bold transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>{lang === "ar" ? "العودة للمنح" : "Retour aux bourses"}</span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <span className="text-xs text-slate-400 truncate max-w-xs hidden sm:block">
              {scholarship.university?.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {parsed.agencyCode && (
              <button
                onClick={() => handleCopyCode(parsed.agencyCode!)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                title="Copier le code officiel de l'agence pour le portail CSC"
              >
                <span>Code CSC: <strong>{parsed.agencyCode}</strong></span>
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                {(user?.username || "M").charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-200 hidden md:block">
                {user?.username || "mehdi12"}
              </span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl mx-auto w-full">
          {/* ─────────────────────────────────────────────────────────────
              3. HERO CARD (Clean, Eye-Friendly Header with Emblem)
          ───────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl bg-gradient-to-br ${theme.cardGlow} bg-[#0c1424]/90 backdrop-blur-xl border ${theme.borderClass} p-6 sm:p-8 shadow-2xl mb-6 relative overflow-hidden`}
          >
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                {/* Custom Vector Emblem */}
                <ScholarshipEmblem themeKey={theme.key} size={64} className="mt-1" />

                <div className="flex-1 min-w-0">
                  {/* Category & Eligibility Pills */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${theme.badgeClass}`}
                    >
                      {theme.badgeLabel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple/20 text-purple-300 border border-purple/30 uppercase">
                      🎓 {scholarship.level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <span>🇲🇦</span>
                      <span>Éligible Candidats Marocains</span>
                    </span>
                  </div>

                  {/* Scholarship Title */}
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight mb-2">
                    {scholarship.title}
                  </h1>

                  {/* University & City */}
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
                    <Link
                      href={`/university/${scholarship.university?.id || ""}`}
                      className="flex items-center gap-1.5 text-cyan hover:underline font-semibold"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>{scholarship.university?.name || scholarship.university_name}</span>
                    </Link>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-cyan" />
                      {scholarship.university?.city || scholarship.university_city}, China
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Deadline & Availability Capsule */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
                {/* Deadline pill */}
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 sm:px-4 text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Clock className="w-3.5 h-3.5 text-cyan" />
                    <span>Date Limite</span>
                  </div>
                  <div className="text-sm font-extrabold text-white">{deadlineFormatted}</div>
                  {showCountdown && (
                    <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
                      ⏳ {daysLeft > 0 ? `${daysLeft} jours restants` : "Clôture imminente"}
                    </div>
                  )}
                </div>

                {/* Seat availability */}
                {scholarship.total_seats && (
                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 sm:px-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">Disponibilité</span>
                      <span className="text-emerald-400 font-bold">
                        {scholarship.seats_available} places libres
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan to-emerald-400 rounded-full"
                        style={{
                          width: `${Math.round(
                            ((scholarship.seats_filled || 0) / scholarship.total_seats) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4 Clean Visual Financial Benefit Cards (No dense walls of text!) */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-3.5 text-left hover:border-emerald-500/30 transition-all">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Frais de Scolarité</div>
                <div className="text-xs sm:text-sm font-black text-white mt-0.5">{parsed.benefits.tuition}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Pris en charge à 100%</div>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-3.5 text-left hover:border-cyan/30 transition-all">
                <div className="w-8 h-8 rounded-xl bg-cyan/20 text-cyan flex items-center justify-center mb-2">
                  <Home className="w-4 h-4" />
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hébergement Campus</div>
                <div className="text-xs sm:text-sm font-black text-white mt-0.5">{parsed.benefits.dorm}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Chambre universitaire</div>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-3.5 text-left hover:border-amber-500/30 transition-all">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                  <Banknote className="w-4 h-4" />
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Allocation Mensuelle</div>
                <div className="text-xs sm:text-sm font-black text-white mt-0.5">{parsed.benefits.stipend}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Versée chaque mois</div>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-3.5 text-left hover:border-purple/30 transition-all">
                <div className="w-8 h-8 rounded-xl bg-purple/20 text-purple-300 flex items-center justify-center mb-2">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Assurance Santé</div>
                <div className="text-xs sm:text-sm font-black text-white mt-0.5">{parsed.benefits.insurance}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Hospitalisation & soins</div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {parsed.cleanIntro}
              </p>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                {trackedItem ? (
                  <Link
                    href="/tracker"
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/30 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Dans votre suivi ({trackedItem.status})</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleAddToTracker}
                    disabled={trackingLoading}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-cyan" />
                    <span>{trackingLoading ? "Sauvegarde..." : "Ajouter à mes candidatures"}</span>
                  </button>
                )}

                <Link
                  href={`/apply/${scholarship.university?.id || 1}?scholarshipId=${scholarship.id}`}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan text-white text-xs font-extrabold shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Postuler & Diagnostic Réel</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                {scholarship.application_link && (
                  <a
                    href={scholarship.application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Accès direct au portail officiel"
                  >
                    <span>Portail Officiel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────
              4. EYE-FRIENDLY TAB NAVIGATION (Zero Cognitive Overload)
          ───────────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 overflow-x-auto scrollbar-none">
            {[
              { id: "overview", label: "🌟 Aperçu & Financement", icon: DollarSign },
              { id: "eligibility", label: "🎯 Critères d'Éligibilité", icon: CheckCircle2 },
              { id: "documents", label: `📋 Pièces & Dossier (${docs.length})`, icon: FileText },
              { id: "roadmap", label: "🗺️ Étapes de Candidature", icon: Send },
              { id: "contact", label: "🏛️ Université & Contacts", icon: Building2 },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DetailTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: OVERVIEW & FUNDING
          ───────────────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Program Quick Facts */}
              <div className="rounded-3xl bg-[#0c1424]/80 backdrop-blur-xl border border-white/10 p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan" />
                  <span>Détails Clés du Programme</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Durée</span>
                    <span className="text-sm font-extrabold text-white mt-1 block">
                      {scholarship.duration || "3 à 4 années académiques"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Langue d'Enseignement</span>
                    <span className="text-sm font-extrabold text-white mt-1 block">
                      {scholarship.language || "Anglais / Chinois"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Niveau d'Études Requis</span>
                    <span className="text-sm font-extrabold text-white mt-1 block">
                      {scholarship.required_education_level || "Baccalauréat / Licence"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Statut Examen CSCA</span>
                    <span className="text-sm font-extrabold text-cyan mt-1 block">
                      {theme.cscaRequired ? "🚨 CSCA Requis (Licence)" : "✅ CSCA Non Requis"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Complete Financial Honesty & Out-of-Pocket Cost Ledger */}
              <FinancialHonestyLedger scholarship={scholarship} />

              {/* Language Diagnostic & Real Cost Honesty (Moroccan Students) */}
              <LanguageHonestySelector
                degreeLevel={scholarship.level}
                universityName={scholarship.university?.name || scholarship.university_name || ""}
                className="mt-6"
              />

              {/* Interactive Currency Converter & Detailed Breakdown */}
              <FundingBreakdownCard
                scholarshipTitle={scholarship.title}
                level={scholarship.level}
                type={scholarship.type}
                stipendAmount={scholarship.stipend_amount}
              />
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: ELIGIBILITY CRITERIA
          ───────────────────────────────────────────────────────────── */}
          {activeTab === "eligibility" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Structured Requirement Cards */}
              <div className="rounded-3xl bg-[#0c1424]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Conditions & Critères d'Admission</h3>
                    <p className="text-xs text-slate-400">
                      Vérifiez votre conformité avant de soumettre votre dossier officiel.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eligibilityItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 sm:p-5 flex items-start gap-3.5 hover:border-cyan/30 transition-all"
                    >
                      <span className="text-2xl select-none flex-shrink-0 mt-0.5">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language Transparency & Requirements Diagnostic */}
              <LanguageHonestySelector
                degreeLevel={scholarship.level}
                universityName={scholarship.university?.name || scholarship.university_name || ""}
              />

              {/* Realistic Acceptance Odds Meter */}
              <AcceptanceOddsMeter
                scholarshipTitle={scholarship.title}
                universityName={scholarship.university?.name || scholarship.university_name || ""}
                level={scholarship.level}
                minGpa={scholarship.minimum_gpa}
              />
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: REQUIRED DOCUMENTS & CHECKLIST
          ───────────────────────────────────────────────────────────── */}
          {activeTab === "documents" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-[#0c1424]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span>Dossier de Candidature Requis</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cochez chaque pièce justificative préparée pour suivre l'avancement de votre dossier.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300">
                    {doneCount}/{docs.length} prêts ({docsPct}%)
                  </span>
                  <button
                    onClick={resetChecklist}
                    className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${docsPct}%` }}
                />
              </div>

              {/* Document List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {docs.map((doc, idx) => {
                  const isChecked = !!checkedDocs[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleDoc(idx)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? "bg-emerald-500/10 border-emerald-500/40 text-slate-300"
                          : "bg-white/[0.02] border-white/5 hover:border-white/20 text-white"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                          isChecked
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-white/30"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={`text-xs leading-relaxed ${isChecked ? "line-through text-slate-400" : ""}`}>
                        {doc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Ready banner */}
              {allDocsDone && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-bold">
                  <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>
                    Félicitations ! Toutes les pièces requises sont prêtes. Vous pouvez procéder au dépôt officiel sur le portail CSC.
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 4: HOW TO APPLY (Step-by-Step Roadmap)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === "roadmap" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-[#0c1424]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-cyan flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Guide des Étapes Officielles</h3>
                  <p className="text-xs text-slate-400">
                    Marche à suivre pas à pas pour les étudiants marocains (CSC Type A / Type B).
                  </p>
                </div>
              </div>

              {/* Step 0: Language Honesty Diagnostic Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 via-cyan/10 to-transparent border border-cyan/30 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-cyan/20 border border-cyan/40 text-cyan flex items-center justify-center flex-shrink-0 font-black text-sm">
                  0
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan block mb-0.5">
                    Étape Préalable Obligatoire • Transparence
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Validation du Profil Linguistique & Calcul des Frais Réels
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Avant de commencer votre dossier, choisissez votre profil : débutant complet (bénéficiant de l'année préparatoire CSC gratuite si rattachée à un diplôme), détenteur HSK 3/4 (bourse Confucius 100% ou entrée directe), ou cursus 100% en anglais.
                  </p>
                </div>
              </div>

              {parsedSteps.length > 0 ? (
                <div className="space-y-4">
                  {parsedSteps.map((step) => (
                    <div
                      key={step.number}
                      className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 sm:p-5 hover:border-cyan/30 transition-all flex items-start gap-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-cyan/20 border border-cyan/40 text-cyan font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                        {step.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white mb-2">{step.title}</h4>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {step.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2">
                              <span className="text-cyan font-bold">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback clean 5 steps */
                <div className="space-y-4">
                  {[
                    {
                      num: 1,
                      title: "Inscription sur le portail officiel CSC (campus china)",
                      desc: "Créez votre compte sur studyinchina.csc.edu.cn et sélectionnez la Catégorie Type B.",
                    },
                    {
                      num: 2,
                      title: "Renseignement du Code de l'Agence Universitaire",
                      desc: `Indiquez le code officiel de l'université ${parsed.agencyCode ? `(Code: ${parsed.agencyCode})` : ""} pour lier votre dossier.`,
                    },
                    {
                      num: 3,
                      title: "Légalisation et Traduction Assermentée",
                      desc: "Préparez les traductions assermentées de vos diplômes et relevés de notes marocains en anglais ou chinois.",
                    },
                    {
                      num: 4,
                      title: "Entretien Académique & Évaluation",
                      desc: "Passage de l'entretien en ligne avec les professeurs de l'université sélectionnée.",
                    },
                    {
                      num: 5,
                      title: "Visa X1 & Départ",
                      desc: "Réception de l'Admission Notice & JW201/JW202, puis dépôt du visa à l'Ambassade de Chine à Rabat.",
                    },
                  ].map((s) => (
                    <div
                      key={s.num}
                      className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 flex items-start gap-3.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-cyan/20 text-cyan font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {s.num}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{s.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Direct links row */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
                {scholarship.application_link && (
                  <a
                    href={scholarship.application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan/20 border border-cyan/40 text-cyan hover:bg-cyan/30 transition-all"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Portail de l'Université</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <a
                  href="https://studyinchina.csc.edu.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple/20 border border-purple/40 text-purple-300 hover:bg-purple/30 transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span>Portail Officiel CSC</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="http://ma.china-embassy.gov.cn/fra/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
                >
                  <Plane className="w-4 h-4" />
                  <span>Ambassade de Chine à Rabat</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 5: UNIVERSITY & CONTACT DESK
          ───────────────────────────────────────────────────────────── */}
          {activeTab === "contact" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <ContactInformationCard
                universityName={scholarship.university?.name || scholarship.university_name || ""}
                universityId={
                  typeof scholarship.university === "object"
                    ? scholarship.university?.id
                    : undefined
                }
                contactEmail={scholarship.contact_email}
                contactPhone={scholarship.contact_phone}
                scholarshipTitle={scholarship.title}
              />

              {/* Related scholarships at same university */}
              {related.length > 0 && (
                <div className="rounded-3xl bg-[#0c1424]/80 backdrop-blur-xl border border-white/10 p-6">
                  <h3 className="text-base font-bold text-white mb-4">
                    Autres bourses disponibles dans cette université
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {related.map((s, i) => (
                      <ScholarshipCard key={s.id} scholarship={s} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
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
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
