"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  FileText,
  Send,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Edit3,
  Plus,
  AlertCircle,
  Building2,
  Check,
  X,
  Sparkles,
  Trophy,
  Compass,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  ListTodo,
  Briefcase,
  Activity,
  MapPin,
  Truck,
  Copy,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SmartBack from "@/components/SmartBack";
import { useLang } from "@/lib/i18n";
import AuthGateModal from "@/components/AuthGateModal";
import ApplicationTraceabilityModal, {
  OFFICIAL_MILESTONES,
  type TraceabilityMilestone,
} from "@/components/ApplicationTraceabilityModal";
import {
  getToken,
  getTrackedApplications,
  updateTrackedApplication,
  deleteTrackedApplication,
  addToTracker,
  type ApplicationTrackerItem,
  type TrackerResponse,
} from "@/lib/api";

type StageKey = "wishlist" | "preparing_docs" | "submitted" | "interview" | "accepted" | "rejected";

interface StageConfig {
  key: StageKey;
  title: string;
  titleFr: string;
  titleAr: string;
  icon: string;
  color: string;
  borderHover: string;
  badgeBg: string;
  badgeText: string;
}

const STAGES: StageConfig[] = [
  {
    key: "wishlist",
    title: "Saved / Wishlist",
    titleFr: "Favoris & Wishlist",
    titleAr: "قائمة الرغبات",
    icon: "📌",
    color: "from-blue-500/20 to-indigo-500/10",
    borderHover: "hover:border-blue-400/50",
    badgeBg: "bg-blue-50 dark:bg-cyan/10 border-blue-200 dark:border-cyan/30 text-blue-700 dark:text-cyan",
    badgeText: "Wishlist",
  },
  {
    key: "preparing_docs",
    title: "Preparing Documents",
    titleFr: "Dossier & Traductions",
    titleAr: "تجهيز الوثائق",
    icon: "📝",
    color: "from-purple/20 to-pink-500/10",
    borderHover: "hover:border-purple/50",
    badgeBg: "bg-purple-50 dark:bg-purple/10 border-purple-200 dark:border-purple/30 text-purple-700 dark:text-purple",
    badgeText: "En Préparation",
  },
  {
    key: "submitted",
    title: "Submitted to Portal",
    titleFr: "Candidature Déposée",
    titleAr: "تم التقديم في البوابة",
    icon: "🚀",
    color: "from-blue-500/20 to-indigo-500/10",
    borderHover: "hover:border-blue-400/50",
    badgeBg: "bg-indigo-50 dark:bg-blue-500/10 border-indigo-200 dark:border-blue-500/30 text-indigo-700 dark:text-blue-400",
    badgeText: "Soumis",
  },
  {
    key: "interview",
    title: "Under Review / Interview",
    titleFr: "Examen / Entretien",
    titleAr: "قيد المراجعة والمقابلة",
    icon: "🔍",
    color: "from-amber-500/20 to-orange-500/10",
    borderHover: "hover:border-amber-400/50",
    badgeBg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400",
    badgeText: "En Examen",
  },
  {
    key: "accepted",
    title: "Accepted (Won 🏆)",
    titleFr: "Admis avec Bourse 🏆",
    titleAr: "مقبول مع منحة 🏆",
    icon: "🏆",
    color: "from-emerald-500/20 to-teal-500/10",
    borderHover: "hover:border-emerald-400/50",
    badgeBg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400",
    badgeText: "Gagné !",
  },
];

// Demo sample cards for unauthenticated or first-time students
const DEMO_APPLICATIONS: ApplicationTrackerItem[] = [
  {
    id: 991,
    status: "preparing_docs",
    notes: "Rendez-vous fixé pour la traduction assermentée des relevés de notes. Formulaire médical CHU complété.",
    portal_application_id: "CSC-2026-TSI-8912",
    checklist: {
      "Passeport légalisé": true,
      "Examen Médical Étranger (CHU)": true,
      "Traduction assermentée du Bac/Licence": false,
      "Plan d'études (Study Plan 800 mots)": false,
      "2 Lettres de Recommandation": false,
    },
    scholarship: {
      id: 3,
      title: "Tsinghua University International Graduate CSC Scholarship 2026",
      level: "master",
      type: "full",
      amount: "Exemption 100% + 3,000 RMB/mois",
      currency: "RMB",
      application_deadline: "2026-12-15T23:59:59Z",
      application_link: "https://studyinchina.csc.edu.cn/",
      university_name: "Tsinghua University",
      university_city: "Beijing",
      university_country: "China",
      days_until_deadline: 60,
      is_deadline_urgent: false,
      is_deadline_passed: false,
    },
    checklist_progress: { total: 5, completed: 2, percentage: 40, all_done: false },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 992,
    status: "submitted",
    notes: "Dossier soumis le 10 janvier sur le portail international PKU. Frais de dossier 800 RMB payés par carte.",
    portal_application_id: "PKU-INT-2026-4410",
    checklist: {
      "Passeport": true,
      "Diplôme légalisé": true,
      "Casier judiciaire traduit": true,
      "Study Plan": true,
      "Lettres de recommandation": true,
    },
    scholarship: {
      id: 4,
      title: "Peking University Presidential Fellowship 2026",
      level: "phd",
      type: "full",
      amount: "Exemption 100% + 3,500 RMB/mois",
      currency: "RMB",
      application_deadline: "2026-12-01T23:59:59Z",
      application_link: "https://www.isd.pku.edu.cn/",
      university_name: "Peking University",
      university_city: "Beijing",
      university_country: "China",
      days_until_deadline: 45,
      is_deadline_urgent: false,
      is_deadline_passed: false,
    },
    checklist_progress: { total: 5, completed: 5, percentage: 100, all_done: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 993,
    status: "wishlist",
    notes: "Bourse d'excellence municipale pour Shanghai. À postuler en priorité avant mars.",
    portal_application_id: "",
    checklist: {
      "Relevés de notes": false,
      "Certificat d'anglais (IELTS ou Attestation)": false,
    },
    scholarship: {
      id: 2,
      title: "Shanghai Jiao Tong University International Excellence Scholarship",
      level: "bachelor",
      type: "full",
      amount: "Exemption 100% + 2,500 RMB/mois",
      currency: "RMB",
      application_deadline: "2027-01-15T23:59:59Z",
      application_link: "https://isc.sjtu.edu.cn/",
      university_name: "Shanghai Jiao Tong University",
      university_city: "Shanghai",
      university_country: "China",
      days_until_deadline: 90,
      is_deadline_urgent: false,
      is_deadline_passed: false,
    },
    checklist_progress: { total: 2, completed: 0, percentage: 0, all_done: false },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function ApplicationTrackerPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [applications, setApplications] = useState<ApplicationTrackerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restrictedRole, setRestrictedRole] = useState<string | null>(null);

  // View Mode: Kanban vs Traceability
  const [viewMode, setViewMode] = useState<"kanban" | "traceability">("kanban");
  const [traceabilityApp, setTraceabilityApp] = useState<ApplicationTrackerItem | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  // Quick Note & ID Modal State
  const [editingItem, setEditingItem] = useState<ApplicationTrackerItem | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editPortalId, setEditPortalId] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Check URL query param for view=traceability
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("view") === "traceability") {
          setViewMode("traceability");
        }
      } catch {}
    }
  }, []);

  // Expanded Checklist Drawer
  const [checklistOpenId, setChecklistOpenId] = useState<number | null>(null);

  // Toast notification
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load applications
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("portal_role");
      if (role === "provider" || role === "university") {
        setRestrictedRole(role);
        setLoading(false);
        return;
      }
    }

    async function load() {
      const token = getToken();
      if (!token) {
        setShowAuthGate(true);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      const res = await getTrackedApplications();
      if (res.data && Array.isArray(res.data.applications)) {
        setApplications(res.data.applications);
      } else {
        // Fallback to local storage
        const local = localStorage.getItem("moroccan_scholar_tracker");
        if (local) {
          try {
            setApplications(JSON.parse(local));
          } catch {
            setApplications(DEMO_APPLICATIONS);
          }
        } else {
          setApplications(DEMO_APPLICATIONS);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  // Save to localStorage when in demo / unauthenticated mode
  const syncLocal = (updated: ApplicationTrackerItem[]) => {
    setApplications(updated);
    if (!isAuthenticated) {
      localStorage.setItem("moroccan_scholar_tracker", JSON.stringify(updated));
    }
  };

  // Move application between stages
  const handleMoveStage = async (id: number, newStage: StageKey) => {
    const target = applications.find((a) => a.id === id);
    if (!target) return;

    // Optimistic UI update
    const updated = applications.map((a) =>
      a.id === id ? { ...a, status: newStage, updated_at: new Date().toISOString() } : a
    );
    syncLocal(updated);

    const stageObj = STAGES.find((s) => s.key === newStage);
    const stageTitle = lang === "ar" ? stageObj?.titleAr : lang === "fr" ? stageObj?.titleFr : stageObj?.title || newStage;
    showToast(lang === "ar" ? `✓ تم النقل إلى « ${stageTitle} »` : `✓ Déplacé vers « ${stageTitle} »`);

    if (isAuthenticated) {
      await updateTrackedApplication(id, { status: newStage });
    }
  };

  // Toggle document checklist item
  const handleToggleChecklist = async (appId: number, docName: string) => {
    const target = applications.find((a) => a.id === appId);
    if (!target) return;

    const currentChecklist = { ...(target.checklist || {}) };
    currentChecklist[docName] = !currentChecklist[docName];

    // Compute new progress
    const total = Object.keys(currentChecklist).length;
    const completed = Object.values(currentChecklist).filter(Boolean).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const updated = applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            checklist: currentChecklist,
            checklist_progress: {
              total,
              completed,
              percentage,
              all_done: completed >= total,
            },
          }
        : a
    );
    syncLocal(updated);

    if (isAuthenticated) {
      await updateTrackedApplication(appId, { checklist: currentChecklist });
    }
  };

  // Save notes and portal application ID
  const handleSaveNotes = async () => {
    if (!editingItem) return;
    setSavingNote(true);

    const updated = applications.map((a) =>
      a.id === editingItem.id
        ? { ...a, notes: editNotes, portal_application_id: editPortalId }
        : a
    );
    syncLocal(updated);

    if (isAuthenticated) {
      await updateTrackedApplication(editingItem.id, {
        notes: editNotes,
        portal_application_id: editPortalId,
      });
    }

    setSavingNote(false);
    setEditingItem(null);
    showToast("✓ Notes et numéro de dossier sauvegardés");
  };

  // Remove application from tracker
  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous retirer cette bourse de votre pipeline de candidature ?")) return;
    const updated = applications.filter((a) => a.id !== id);
    syncLocal(updated);
    showToast("✓ Bourse retirée du pipeline");

    if (isAuthenticated) {
      await deleteTrackedApplication(id);
    }
  };

  // Filtered applications
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter(
      (a) =>
        a.scholarship.title.toLowerCase().includes(q) ||
        (a.scholarship.university_name && a.scholarship.university_name.toLowerCase().includes(q)) ||
        (a.portal_application_id && a.portal_application_id.toLowerCase().includes(q))
    );
  }, [applications, searchQuery]);

  // Group by stage
  const grouped = useMemo(() => {
    const res: Record<StageKey, ApplicationTrackerItem[]> = {
      wishlist: [],
      preparing_docs: [],
      submitted: [],
      interview: [],
      accepted: [],
      rejected: [],
    };
    for (const app of filteredApps) {
      if (res[app.status]) {
        res[app.status].push(app);
      } else {
        res.wishlist.push(app);
      }
    }
    return res;
  }, [filteredApps]);

  // Overall stats
  const stats = useMemo(() => {
    return {
      total: applications.length,
      wishlist: applications.filter((a) => a.status === "wishlist").length,
      preparing: applications.filter((a) => a.status === "preparing_docs").length,
      submitted: applications.filter((a) => a.status === "submitted").length,
      interview: applications.filter((a) => a.status === "interview").length,
      won: applications.filter((a) => a.status === "accepted").length,
    };
  }, [applications]);

  // If Service Provider or University: Restricted Isolation View
  if (restrictedRole) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 max-w-lg w-full text-center border border-rose-500/30 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
            {restrictedRole === "provider" ? (
              <Briefcase className="w-8 h-8" />
            ) : (
              <GraduationCap className="w-8 h-8" />
            )}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 mb-3">
            <span>Confidential Student Privacy Gate</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary mb-2">
            {restrictedRole === "provider"
              ? "Service Provider Workspace Active"
              : "University Admissions Desk Active"}
          </h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Candidate CRM pipelines, document checklists, and personal application notes are strictly confidential to students.
            {restrictedRole === "provider"
              ? " Please use your Service Provider Desk to fulfill translation orders and client documents."
              : " Please use your Admissions Desk to review candidate records and campus programs."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={restrictedRole === "provider" ? "/provider-portal" : "/university-portal"}
              className="w-full sm:w-auto px-6 py-3 rounded-xl btn-gradient text-sm font-bold flex items-center justify-center gap-2"
            >
              <span>
                {restrictedRole === "provider"
                  ? "Go to Provider Orders Desk"
                  : "Go to Admissions Desk"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                localStorage.setItem("portal_role", "student");
                setRestrictedRole(null);
                window.location.reload();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl glass hover:bg-white/10 text-sm font-semibold text-text-primary cursor-pointer transition-colors"
            >
              Switch to Student Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-[1600px] mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 text-emerald-300 border border-emerald-500/50 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-sm font-semibold"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <SmartBack fallback="/scholarships" label={lang === "ar" ? "رجوع" : lang === "fr" ? "Retour" : "Back"} />
          <div className="flex items-center gap-3 mt-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-white shadow-lg">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  {lang === "ar" ? "متتبع ومسار تقديم الطلبات" : "Application Tracker & CRM"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  {lang === "ar" ? "مسار ScholarChina" : "ScholarChina Pipeline"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                {lang === "ar"
                  ? "إدارة طلباتك الجامعية خطوة بخطوة، من قائمة الرغبات حتى القبول النهائي 🏆"
                  : lang === "fr"
                  ? "Gérez vos candidatures universitaires étape par étape, de la wishlist à l'admission 🏆"
                  : "Manage your university applications step by step, from wishlist to admission 🏆"}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "ar" ? "تصفية حسب الجامعة أو المنحة..." : lang === "fr" ? "Filtrer université ou bourse..." : "Filter university or scholarship..."}
              className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-text-primary placeholder:text-slate-400 dark:placeholder:text-text-muted outline-none focus:border-blue-500 dark:focus:border-cyan/50 shadow-sm transition-colors w-48 sm:w-64"
            />
          </div>
          <Link
            href="/scholarships"
            className="px-4 py-2 rounded-xl btn-gradient text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-cyan/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === "ar" ? "إضافة منحة" : lang === "fr" ? "Ajouter une Bourse" : "Add Scholarship"}</span>
          </Link>
        </div>
      </div>

      {/* View Switcher: Kanban vs Traceability */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-2 rounded-2xl glass border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === "kanban"
                ? "btn-gradient text-white shadow-md shadow-cyan/20"
                : "text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>{lang === "ar" ? "لوحة كانبان (المراحل)" : "Pipeline Kanban"}</span>
          </button>

          <button
            onClick={() => setViewMode("traceability")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === "traceability"
                ? "btn-gradient text-white shadow-md shadow-cyan/20"
                : "text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>{lang === "ar" ? "مسار التتبع والتوثيق (Traçabilité)" : "Traçabilité Détaillée & Chronologie"}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wider animate-pulse">
              LIVE
            </span>
          </button>
        </div>

        <div className="text-xs text-text-muted px-2">
          {viewMode === "kanban" ? (
            <span>💡 {lang === "ar" ? "اسحب وانقل بين المراحل" : "Déplacez vos candidatures d'une phase à l'autre"}</span>
          ) : (
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "المسار الرسمي الموثق من التقديم حتى فيزا X1" : "Suivi officiel de la soumission jusqu'au visa X1 à Rabat"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Unauthenticated Demo Banner */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple/20 via-cyan/15 to-emerald-500/15 border border-purple/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple/20 flex items-center justify-center text-purple flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">
                {lang === "ar" ? "وضع العرض التوضيحي التفاعلي مفعّل" : lang === "fr" ? "Mode Démo Interactif Activé" : "Interactive Demo Mode Active"}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {lang === "ar"
                  ? "يمكنك نقل المنح ومتابعة تجهيز الوثائق. سجّل مجاناً لحفظ ومزامنة ملفك عبر كل أجهزتك."
                  : lang === "fr"
                  ? "Vous pouvez déplacer des bourses et cocher des documents. Connectez-vous gratuitement pour synchroniser votre CRM sur tous vos appareils."
                  : "You can move scholarships and check off documents. Sign in for free to sync your pipeline across devices."}
              </p>
            </div>
          </div>
          <Link
            href="/auth/register"
            className="px-4 py-2 rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-bold whitespace-nowrap shadow-md transition-all flex items-center gap-1.5"
          >
            <span>{lang === "ar" ? "إنشاء حساب مجاني" : lang === "fr" ? "Créer mon Compte Gratuit" : "Create Free Account"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {/* Stats KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <div className="bg-white dark:glass rounded-2xl p-3.5 border border-slate-200/90 dark:border-white/5 shadow-sm dark:shadow-none flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-cyan/15 text-blue-700 dark:text-cyan flex items-center justify-center font-bold text-sm">
            {stats.total}
          </div>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-text-muted uppercase tracking-wider font-semibold">
              {lang === "ar" ? "إجمالي المتابعة" : lang === "fr" ? "Total Suivies" : "Total Tracked"}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-text-primary">
              {stats.total} {lang === "ar" ? "طلبات" : lang === "fr" ? "Candidatures" : "Applications"}
            </div>
          </div>
        </div>

        <div className="bg-white dark:glass rounded-2xl p-3.5 border border-slate-200/90 dark:border-white/5 shadow-sm dark:shadow-none flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple/15 text-purple-700 dark:text-purple flex items-center justify-center font-bold text-sm">
            {stats.preparing}
          </div>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-text-muted uppercase tracking-wider font-semibold">
              {lang === "ar" ? "تجهيز الوثائق" : lang === "fr" ? "En Préparation" : "In Preparation"}
            </div>
            <div className="text-sm font-bold text-purple-700 dark:text-purple">
              {stats.preparing} {lang === "ar" ? "جارية" : lang === "fr" ? "En Cours" : "Active"}
            </div>
          </div>
        </div>

        <div className="bg-white dark:glass rounded-2xl p-3.5 border border-slate-200/90 dark:border-white/5 shadow-sm dark:shadow-none flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-blue-500/15 text-indigo-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            {stats.submitted}
          </div>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-text-muted uppercase tracking-wider font-semibold">
              {lang === "ar" ? "تم التقديم" : lang === "fr" ? "Déposées" : "Submitted"}
            </div>
            <div className="text-sm font-bold text-indigo-700 dark:text-blue-400">
              {stats.submitted} {lang === "ar" ? "في البوابات" : lang === "fr" ? "Aux Portails" : "Portals"}
            </div>
          </div>
        </div>

        <div className="bg-white dark:glass rounded-2xl p-3.5 border border-slate-200/90 dark:border-white/5 shadow-sm dark:shadow-none flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
            {stats.interview}
          </div>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-text-muted uppercase tracking-wider font-semibold">
              {lang === "ar" ? "مراجعة / مقابلة" : lang === "fr" ? "Examen / Oral" : "Interview / Review"}
            </div>
            <div className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {stats.interview} {lang === "ar" ? "قيد التدقيق" : lang === "fr" ? "En Revue" : "Reviewing"}
            </div>
          </div>
        </div>

        <div className="bg-white dark:glass rounded-2xl p-3.5 border border-slate-200/90 dark:border-white/5 shadow-sm dark:shadow-none flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            {stats.won}
          </div>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-text-muted uppercase tracking-wider font-semibold">
              {lang === "ar" ? "المنح المحصول عليها" : lang === "fr" ? "Bourses Obtenues" : "Won Scholarships"}
            </div>
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {stats.won} {lang === "ar" ? "مقبول 🏆" : lang === "fr" ? "Admis 🏆" : "Won 🏆"}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban or Traceability View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {STAGES.map((stage) => {
            const items = grouped[stage.key] || [];

            return (
              <div
                key={stage.key}
                className="rounded-3xl p-3.5 border border-slate-200/90 dark:border-white/10 flex flex-col min-h-[580px] bg-slate-100/80 dark:bg-slate-950/40 relative shadow-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/90 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{stage.icon}</span>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-text-primary">
                        {lang === "ar" ? stage.titleAr : lang === "fr" ? stage.titleFr : stage.title}
                      </h3>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${stage.badgeBg}`}>
                    {items.length}
                  </span>
                </div>

                {/* Cards list */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[720px] pr-1">
                  {items.length === 0 ? (
                    <div className="h-44 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center p-4 text-center bg-white/40 dark:bg-transparent">
                      <p className="text-xs text-slate-500 dark:text-text-muted font-medium">{lang === "ar" ? "لا توجد طلبات هنا" : lang === "fr" ? "Aucune candidature" : "No applications"}</p>
                      <p className="text-[11px] text-slate-400 dark:text-text-muted/60 mt-0.5">
                        {lang === "ar" ? "اسحب أو انقل المنح إلى هذه الخانة" : lang === "fr" ? "Glissez ou déplacez des bourses ici" : "Drag or move scholarships here"}
                      </p>
                    </div>
                  ) : (
                    items.map((app) => {
                      const days = app.days_until_deadline ?? app.scholarship.days_until_deadline ?? null;
                      const isUrgent = days !== null && days >= 0 && days <= 7;
                      const isUpcoming = days !== null && days > 7 && days <= 30;
                      const isPassed = days !== null && days < 0;
                      const checklist = app.checklist || {};
                      const docEntries = Object.entries(checklist);
                      const isChecklistOpen = checklistOpenId === app.id;

                      return (
                        <motion.div
                          key={app.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`rounded-2xl p-4 bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/10 hover:border-blue-400/60 dark:hover:border-white/25 shadow-sm hover:shadow-md dark:shadow-lg transition-all group relative overflow-hidden ${
                            isUrgent ? "border-red-400 dark:border-red-500/60 ring-1 ring-red-400/30 dark:ring-red-500/30" : ""
                          }`}
                        >
                          {/* Urgent Pulse Ribbon */}
                          {isUrgent && (
                            <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-b border-l border-red-200 dark:border-red-500/40 text-[10px] font-bold rounded-bl-xl flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" />
                              <span>{lang === "ar" ? `عاجل (متبقي ${days} أيام)` : `URGENT (J-${days})`}</span>
                            </div>
                          )}

                          {/* Top: University & Degree Level */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-cyan font-bold truncate">
                              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{app.scholarship.university_name || (lang === "ar" ? "جامعة صينية" : "Université Chinoise")}</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-slate-700 dark:text-text-muted flex-shrink-0">
                              {app.scholarship.level || "Master"}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-text-primary leading-snug line-clamp-2 mb-3">
                            <Link
                              href={`/scholarships/${app.scholarship.id}`}
                              className="hover:text-blue-600 dark:hover:text-cyan transition-colors"
                            >
                              {app.scholarship.title}
                            </Link>
                          </h4>

                          {/* Deadline tag */}
                          <div className="flex items-center justify-between text-[11px] mb-3">
                            <span className="text-slate-500 dark:text-text-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{lang === "ar" ? "الموعد النهائي:" : lang === "fr" ? "Limite :" : "Deadline:"}</span>
                            </span>
                            <span
                              className={`font-semibold ${
                                isUrgent
                                  ? "text-red-600 dark:text-red-400 font-bold"
                                  : isUpcoming
                                  ? "text-amber-600 dark:text-amber-400"
                                  : isPassed
                                  ? "text-slate-400 dark:text-text-muted"
                                  : "text-slate-600 dark:text-text-secondary"
                              }`}
                            >
                              {days !== null
                                ? isPassed
                                  ? (lang === "ar" ? "منتهي" : lang === "fr" ? "Expiré" : "Expired")
                                  : (lang === "ar" ? `متبقي ${days} يوم` : lang === "fr" ? `J-${days} jours` : `${days} days left`)
                                : (lang === "ar" ? "جاري" : lang === "fr" ? "En cours" : "Ongoing")}
                            </span>
                          </div>

                          {/* Checklist Progress Bar */}
                          {docEntries.length > 0 && (
                            <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
                              <div className="flex items-center justify-between text-[11px] mb-1.5">
                                <button
                                  onClick={() =>
                                    setChecklistOpenId(isChecklistOpen ? null : app.id)
                                  }
                                  className="font-semibold text-slate-700 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan flex items-center gap-1 transition-colors"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                                  <span>
                                    {app.checklist_progress?.completed ?? 0} /{" "}
                                    {app.checklist_progress?.total ?? docEntries.length} {lang === "ar" ? "وثائق جاهزة" : lang === "fr" ? "docs prêts" : "docs ready"}
                                  </span>
                                </button>
                                <span className="text-[10px] font-bold text-blue-600 dark:text-cyan">
                                  {app.checklist_progress?.percentage ?? 0}%
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 dark:from-cyan dark:to-emerald-400 transition-all duration-300"
                                  style={{
                                    width: `${app.checklist_progress?.percentage ?? 0}%`,
                                  }}
                                />
                              </div>

                              {/* Expandable document toggles */}
                              {isChecklistOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-white/5 space-y-1.5"
                                >
                                  {docEntries.map(([docName, isDone]) => (
                                    <label
                                      key={docName}
                                      className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-text-secondary cursor-pointer hover:text-slate-900 dark:hover:text-text-primary transition-colors select-none"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isDone}
                                        onChange={() =>
                                          handleToggleChecklist(app.id, docName)
                                        }
                                        className="rounded border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 text-blue-600 dark:text-cyan focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                      />
                                      <span
                                        className={
                                          isDone
                                            ? "line-through text-slate-400 dark:text-text-muted"
                                            : "font-medium"
                                        }
                                      >
                                        {docName}
                                      </span>
                                    </label>
                                  ))}
                                </motion.div>
                              )}
                            </div>
                          )}

                          {/* Portal ID / Note Snippet */}
                          {app.portal_application_id && (
                            <div className="mb-2 text-[10px] font-mono px-2 py-1 rounded bg-blue-50/80 dark:bg-white/5 border border-blue-200/70 dark:border-white/5 text-blue-700 dark:text-cyan truncate flex items-center justify-between">
                              <span className="truncate">N° {app.portal_application_id}</span>
                              <span className="text-slate-500 dark:text-text-muted text-[9px]">{lang === "ar" ? "البوابة" : "Portail"}</span>
                            </div>
                          )}

                          {app.notes && (
                            <p className="text-[11px] text-slate-600 dark:text-text-muted italic line-clamp-1 mb-3 pl-2 py-0.5 rounded-r bg-purple-50/60 dark:bg-transparent border-l-2 border-purple-500 dark:border-purple/40">
                              &quot;{app.notes}&quot;
                            </p>
                          )}

                          {/* Quick Traceability Status Snippet */}
                          <button
                            onClick={() => setTraceabilityApp(app)}
                            className="w-full text-left mb-2.5 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-cyan/10 hover:border-cyan/40 border border-slate-200/80 dark:border-white/5 transition-all group/trace cursor-pointer"
                          >
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="font-extrabold text-slate-700 dark:text-text-primary flex items-center gap-1 group-hover/trace:text-cyan transition-colors">
                                <Activity className="w-3 h-3 text-emerald-500" />
                                <span>{lang === "ar" ? "مسار التتبع والتوثيق" : "Traçabilité Officielle"}</span>
                              </span>
                              <span className="font-mono text-cyan font-bold text-[10px]">
                                {app.status === "wishlist"
                                  ? "Étape 1/8"
                                  : app.status === "preparing_docs"
                                  ? "Étape 2/8"
                                  : app.status === "submitted"
                                  ? "Étape 3/8"
                                  : app.status === "interview"
                                  ? "Étape 5/8"
                                  : "Étape 7/8"}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-text-muted truncate">
                              {app.status === "wishlist"
                                ? lang === "ar"
                                  ? "اختيار البرنامج والأهلية"
                                  : "Sélection du Programme & Éligibilité"
                                : app.status === "preparing_docs"
                                ? lang === "ar"
                                ? "تجهيز الوثائق وامتحان CSCA"
                                : "Apostille & Examen CSCA"
                                : app.status === "submitted"
                                ? lang === "ar"
                                ? "تم التقديم في البوابة الرسمية"
                                : "Soumis sur Portail CSC / Univ"
                                : app.status === "interview"
                                ? lang === "ar"
                                ? "التقييم الأكاديمي والمقابلة"
                                : "Examen Académique & Oral"
                                : lang === "ar"
                                ? "إصدار استمارة JW202 والفيزا"
                                : "JW202 & Visa X1"}
                            </div>
                          </button>

                          {/* Action buttons footer */}
                          <div className="pt-2 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-1 text-xs">
                            {/* Live Traceability Button */}
                            <button
                              onClick={() => setTraceabilityApp(app)}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 transition-colors border border-emerald-200/80 dark:border-emerald-500/30 flex items-center gap-1 font-bold cursor-pointer"
                              title={lang === "ar" ? "عرض مسار التتبع والتوثيق المباشر" : "Ouvrir la traçabilité détaillée en direct"}
                            >
                              <Activity className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="hidden xl:inline text-[10px]">{lang === "ar" ? "تتبع" : "Traçabilité"}</span>
                            </button>

                            {/* Portal external link */}
                            {app.scholarship.application_link ? (
                              <a
                                href={app.scholarship.application_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors border border-slate-200/60 dark:border-transparent"
                                title={lang === "ar" ? "فتح بوابة التقديم الرسمية" : "Ouvrir le portail officiel de candidature"}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <Link
                                href={`/scholarships/${app.scholarship.id}`}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors border border-slate-200/60 dark:border-transparent"
                                title={lang === "ar" ? "عرض تفاصيل المنحة" : "Voir la fiche complète"}
                              >
                                <Compass className="w-3.5 h-3.5" />
                              </Link>
                            )}

                            {/* Quick Edit Note Button */}
                            <button
                              onClick={() => {
                                setEditingItem(app);
                                setEditNotes(app.notes || "");
                                setEditPortalId(app.portal_application_id || "");
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-text-secondary hover:text-purple-600 dark:hover:text-purple transition-colors border border-slate-200/60 dark:border-transparent"
                              title={lang === "ar" ? "إضافة ملاحظات أو رقم الطلب" : "Ajouter des notes ou N° de dossier"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete from CRM */}
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-text-secondary hover:text-red-500 dark:hover:text-red-400 transition-colors border border-slate-200/60 dark:border-transparent"
                              title={lang === "ar" ? "حذف من المتتبع" : "Retirer du tracker"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Move stage controls */}
                            <div className="flex items-center gap-1 ml-auto">
                              {/* Prev stage */}
                              {stage.key !== "wishlist" && (
                                <button
                                  onClick={() => {
                                    const idx = STAGES.findIndex(
                                      (s) => s.key === stage.key
                                    );
                                    if (idx > 0)
                                      handleMoveStage(app.id, STAGES[idx - 1].key);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/15 text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary transition-colors border border-slate-200/60 dark:border-transparent"
                                  title={lang === "ar" ? "نقل إلى المرحلة السابقة" : "Déplacer vers l'étape précédente"}
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Next stage */}
                              {stage.key !== "accepted" && (
                                <button
                                  onClick={() => {
                                    const idx = STAGES.findIndex(
                                      (s) => s.key === stage.key
                                    );
                                    if (idx < STAGES.length - 1)
                                      handleMoveStage(app.id, STAGES[idx + 1].key);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-cyan/20 dark:hover:bg-cyan/30 text-blue-700 dark:text-cyan text-[11px] font-bold flex items-center gap-1 transition-all border border-blue-200/80 dark:border-transparent"
                                  title={lang === "ar" ? "الانتقال إلى المرحلة التالية" : "Passer à l'étape suivante"}
                                >
                                  <span>{lang === "ar" ? "تقدم" : lang === "fr" ? "Avancer" : "Next"}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dedicated Traceability Timeline View */
        <div className="space-y-6">
          {filteredApps.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-white/10 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-cyan/15 text-cyan flex items-center justify-center mx-auto mb-4">
                <Activity className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                {lang === "ar" ? "لا توجد طلبات لتتبعها حالياً" : "Aucune candidature dans votre traçabilité"}
              </h3>
              <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                {lang === "ar"
                  ? "ابدأ بإضافة منحة إلى قائمة تتبعك لتتمكن من رصد كافة خطوات القبول خطوة بخطوة."
                  : "Ajoutez une bourse à votre pipeline pour suivre l'évolution de votre dossier étape par étape."}
              </p>
              <Link href="/scholarships" className="btn-gradient px-6 py-3 rounded-xl text-xs font-bold inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>{lang === "ar" ? "استكشاف المنح وإضافتها للتتبع" : "Explorer les bourses"}</span>
              </Link>
            </div>
          ) : (
            filteredApps.map((app) => {
              // Determine current step
              let currentStep = 2;
              let dhlNumber = "";
              if (app.status === "wishlist") currentStep = 1;
              else if (app.status === "preparing_docs") currentStep = 2;
              else if (app.status === "submitted") currentStep = 4;
              else if (app.status === "interview") currentStep = 5;
              else if (app.status === "accepted") currentStep = 7;

              if (typeof window !== "undefined") {
                try {
                  const saved = localStorage.getItem(`traceability_${app.id}`);
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.currentStep) currentStep = parsed.currentStep;
                    if (parsed.dhlCode) dhlNumber = parsed.dhlCode;
                  }
                } catch {}
              }

              const progress = Math.round((currentStep / 8) * 100);

              return (
                <div
                  key={app.id}
                  className="glass rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-white/10 hover:border-cyan/40 shadow-md transition-all relative overflow-hidden"
                >
                  {/* Top Bar: Uni, Title, ID and Status Badge */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/90 dark:border-white/10">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan mb-1.5">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span>{app.scholarship.university_name || "Université Chinoise"}</span>
                        {app.scholarship.university_city && (
                          <span className="text-text-muted font-normal">({app.scholarship.university_city})</span>
                        )}
                        <span className="opacity-40">•</span>
                        <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-cyan/15 text-cyan font-extrabold">
                          {app.scholarship.level || "Bachelor"}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-text-primary">
                        <Link href={`/scholarships/${app.scholarship.id}`} className="hover:text-cyan transition-colors">
                          {app.scholarship.title}
                        </Link>
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {app.portal_application_id ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 text-xs font-mono text-blue-700 dark:text-cyan">
                          <span className="font-bold">N° {app.portal_application_id}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(app.portal_application_id || "");
                              setCopiedTrackingId(app.portal_application_id || "");
                              setTimeout(() => setCopiedTrackingId(null), 2000);
                            }}
                            className="text-text-muted hover:text-cyan ml-1 cursor-pointer"
                            title="Copier le N° de dossier"
                          >
                            {copiedTrackingId === app.portal_application_id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setTraceabilityApp(app)}
                          className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-text-muted hover:text-cyan transition-colors cursor-pointer"
                        >
                          + {lang === "ar" ? "إضافة رقم الطلب" : "Ajouter N° dossier"}
                        </button>
                      )}

                      {dhlNumber && (
                        <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300">
                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                          <span>{dhlNumber}</span>
                        </div>
                      )}

                      <span className="px-3 py-1.5 rounded-xl text-xs font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {app.status === "wishlist"
                          ? "Étape 1 : Wishlist"
                          : app.status === "preparing_docs"
                          ? "Étape 2 : Dossier & CSCA"
                          : app.status === "submitted"
                          ? "Étape 4 : Examen Préliminaire"
                          : app.status === "interview"
                          ? "Étape 5 : Revue Académique"
                          : "Étape 7 : JW202 Émis 🏆"}
                      </span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="my-5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-extrabold text-text-primary flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>
                          {lang === "ar"
                            ? `المرحلة الحالية: ${OFFICIAL_MILESTONES[currentStep - 1]?.titleAr || ""}`
                            : `Étape actuelle : ${OFFICIAL_MILESTONES[currentStep - 1]?.titleFr || ""}`}
                        </span>
                      </span>
                      <span className="font-black text-cyan">
                        {progress}% {lang === "ar" ? "مكتمل" : "du parcours validé"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan via-purple to-emerald-400 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* 8 Connected Steps Stepper */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 my-6">
                    {OFFICIAL_MILESTONES.map((milestone) => {
                      const isPast = milestone.step < currentStep;
                      const isNow = milestone.step === currentStep;
                      return (
                        <div
                          key={milestone.step}
                          onClick={() => setTraceabilityApp(app)}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                            isPast
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : isNow
                              ? "bg-cyan/15 border-cyan text-text-primary shadow-lg shadow-cyan/10 ring-1 ring-cyan"
                              : "glass border-border-glass text-text-muted opacity-60 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                                isPast
                                  ? "bg-emerald-500 text-slate-950"
                                  : isNow
                                  ? "bg-cyan text-slate-950 animate-pulse font-extrabold"
                                  : "bg-white/10 text-text-muted"
                              }`}
                            >
                              {isPast ? "✓" : milestone.step}
                            </div>
                          </div>
                          <div className="text-[11px] font-bold line-clamp-2 leading-tight">
                            {lang === "ar"
                              ? milestone.titleAr.replace(/^\d+\.\s*/, "")
                              : lang === "en"
                              ? milestone.titleEn.replace(/^\d+\.\s*/, "")
                              : milestone.titleFr.replace(/^\d+\.\s*/, "")}
                          </div>
                          <div className="text-[9px] font-semibold mt-2 uppercase tracking-wider">
                            {isPast
                              ? (lang === "ar" ? "مكتمل" : "Validé")
                              : isNow
                              ? (lang === "ar" ? "جاري الآن" : "En cours")
                              : (lang === "ar" ? "قادم" : "À venir")}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/90 dark:border-white/10 text-xs">
                    <div className="text-text-secondary flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      <span>
                        {lang === "ar"
                          ? `آخر تحديث للحالة: ${new Date(app.updated_at || app.created_at).toLocaleDateString()}`
                          : `Dernier horodatage enregistré : ${new Date(app.updated_at || app.created_at).toLocaleDateString()}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={() => setTraceabilityApp(app)}
                        className="flex-1 sm:flex-none btn-gradient px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan/20 cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>{lang === "ar" ? "إدارة وتحديث المسار" : "Gérer la Traçabilité en Direct"}</span>
                      </button>

                      {app.scholarship.application_link && (
                        <a
                          href={app.scholarship.application_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl glass hover:bg-white/10 text-text-secondary hover:text-cyan transition-colors"
                          title="Portail Officiel"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Quick Note & Application ID Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-white/20 shadow-2xl relative"
            >
              <button
                onClick={() => setEditingItem(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:text-text-muted dark:hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple/20 text-purple-600 dark:text-purple flex items-center justify-center border border-purple-200 dark:border-transparent">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-text-primary">
                    {lang === "ar" ? "ملاحظات وبيانات مرجعية للطلب" : lang === "fr" ? "Notes & Références de Candidature" : "Application Notes & Reference"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-text-muted truncate max-w-xs sm:max-w-sm">
                    {editingItem.scholarship.title}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                    {lang === "ar" ? "رقم التسجيل أو معرّف البوابة الرسمية" : lang === "fr" ? "N° d'inscription ou Identifiant Portail" : "Application N° or Portal ID"}
                  </label>
                  <input
                    type="text"
                    value={editPortalId}
                    onChange={(e) => setEditPortalId(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: CSC2026-TSI-8912 أو PKU-ADM-4482" : "Ex: CSC2026-TSI-8912 ou PKU-ADM-4482"}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-sm text-slate-900 dark:text-text-primary placeholder:text-slate-400 dark:placeholder:text-text-muted outline-none focus:border-blue-500 dark:focus:border-cyan/50 focus:bg-white dark:focus:bg-white/10 font-mono transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-text-muted mt-1">
                    {lang === "ar" ? "الرقم الممنوح لك عند التسجيل على البوابة الرسمية للجامعة أو موقع CSC." : lang === "fr" ? "Numéro fourni lors de votre inscription sur le portail officiel de l'université ou CSC." : "Number provided when registering on official university or CSC portal."}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                    {lang === "ar" ? "ملاحظات شخصية وتذكيرات" : lang === "fr" ? "Notes personnelles & Rappels" : "Personal Notes & Reminders"}
                  </label>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder={lang === "ar" ? "ملاحظات المتابعة، بيانات الأستاذ المشرف، مواعيد الرد..." : lang === "fr" ? "Notes de suivi, contacts du professeur superviseur, dates de relance, identifiants..." : "Follow-up notes, professor contact info, interview reminders..."}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-sm text-slate-900 dark:text-text-primary placeholder:text-slate-400 dark:placeholder:text-text-muted outline-none focus:border-blue-500 dark:focus:border-cyan/50 focus:bg-white dark:focus:bg-white/10 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary border border-slate-200 dark:border-transparent transition-colors"
                  >
                    {lang === "ar" ? "إلغاء" : lang === "fr" ? "Annuler" : "Cancel"}
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNote}
                    className="px-5 py-2 rounded-xl btn-gradient text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    {savingNote ? (
                      <span>{lang === "ar" ? "جاري الحفظ..." : lang === "fr" ? "Enregistrement..." : "Saving..."}</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{lang === "ar" ? "حفظ" : lang === "fr" ? "Enregistrer" : "Save"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Traceability & Lifecycle Progress Modal */}
      <ApplicationTraceabilityModal
        isOpen={Boolean(traceabilityApp)}
        onClose={() => setTraceabilityApp(null)}
        application={traceabilityApp}
        onSave={(updated) => {
          setApplications((prev) =>
            prev.map((app) => (app.id === updated.id ? updated : app))
          );
        }}
      />

      <AuthGateModal
        isOpen={showAuthGate || (typeof window !== "undefined" && !getToken())}
        onClose={() => router.push("/")}
        onBackToRoles={() => router.push("/")}
        canClose={false}
        role="student"
        title={lang === "ar" ? "بوابة الطلاب المغاربة" : "Moroccan Student Access Required"}
        subtitle={lang === "ar" ? "سجل الدخول لإدارة ومتابعة طلبات التقديم على المنح والجامعات الصينية." : "Sign in to track your applications, manage document checklists, and view acceptance deadlines."}
        onSuccess={() => {
          setShowAuthGate(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
