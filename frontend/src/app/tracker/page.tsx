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
} from "lucide-react";
import Link from "next/link";
import SmartBack from "@/components/SmartBack";
import { useLang } from "@/lib/i18n";
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
    color: "from-cyan/20 to-blue-500/10",
    borderHover: "hover:border-cyan/50",
    badgeBg: "bg-cyan/10 border-cyan/30 text-cyan",
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
    badgeBg: "bg-purple/10 border-purple/30 text-purple",
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
    badgeBg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
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
    badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
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
    badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
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
  const { t, lang } = useLang();
  const [applications, setApplications] = useState<ApplicationTrackerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Note & ID Modal State
  const [editingItem, setEditingItem] = useState<ApplicationTrackerItem | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editPortalId, setEditPortalId] = useState("");
  const [savingNote, setSavingNote] = useState(false);

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
    async function load() {
      const token = getToken();
      if (!token) {
        // Load from localStorage or use demo
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

    const stageTitle = STAGES.find((s) => s.key === newStage)?.titleFr || newStage;
    showToast(`✓ Déplacé vers « ${stageTitle} »`);

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
          <SmartBack fallback="/scholarships" label="Retour" />
          <div className="flex items-center gap-3 mt-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-white shadow-lg">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  Application Tracker & CRM
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan/15 text-cyan border border-cyan/30">
                  ScholarTrack™
                </span>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                Gérez vos candidatures universitaires étape par étape, de la wishlist à l&apos;admission 🏆
              </p>
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer université ou bourse..."
              className="pl-9 pr-4 py-2 rounded-xl glass border border-white/10 text-xs sm:text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-cyan/50 transition-colors w-48 sm:w-64"
            />
          </div>
          <Link
            href="/scholarships"
            className="px-4 py-2 rounded-xl btn-gradient text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-cyan/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Bourse</span>
          </Link>
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
                Mode Démo Interactif Activé
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Vous pouvez déplacer des bourses et cocher des documents. Connectez-vous gratuitement pour synchroniser votre CRM sur tous vos appareils.
              </p>
            </div>
          </div>
          <Link
            href="/auth/register"
            className="px-4 py-2 rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-bold whitespace-nowrap shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Créer mon Compte Gratuit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {/* Stats KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <div className="glass rounded-2xl p-3.5 border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan/15 text-cyan flex items-center justify-center font-bold text-sm">
            {stats.total}
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Total Suivies</div>
            <div className="text-sm font-bold text-text-primary">{stats.total} Candidatures</div>
          </div>
        </div>

        <div className="glass rounded-2xl p-3.5 border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple/15 text-purple flex items-center justify-center font-bold text-sm">
            {stats.preparing}
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">En Préparation</div>
            <div className="text-sm font-bold text-purple">{stats.preparing} En Cours</div>
          </div>
        </div>

        <div className="glass rounded-2xl p-3.5 border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-sm">
            {stats.submitted}
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Déposées</div>
            <div className="text-sm font-bold text-blue-400">{stats.submitted} Aux Portails</div>
          </div>
        </div>

        <div className="glass rounded-2xl p-3.5 border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-sm">
            {stats.interview}
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Examen / Oral</div>
            <div className="text-sm font-bold text-amber-400">{stats.interview} En Revue</div>
          </div>
        </div>

        <div className="glass rounded-2xl p-3.5 border border-white/5 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            {stats.won}
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Bourses Obtenues</div>
            <div className="text-sm font-bold text-emerald-400">{stats.won} Admis 🏆</div>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {STAGES.map((stage) => {
          const items = grouped[stage.key] || [];

          return (
            <div
              key={stage.key}
              className="glass rounded-3xl p-3.5 border border-white/10 flex flex-col min-h-[580px] bg-slate-950/40 relative"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stage.icon}</span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                      {stage.titleFr}
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
                  <div className="h-44 rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs text-text-muted">Aucune candidature</p>
                    <p className="text-[11px] text-text-muted/60 mt-0.5">
                      Glissez ou déplacez des bourses ici
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
                        className={`rounded-2xl p-4 bg-slate-900/90 border border-white/10 hover:border-white/25 shadow-lg transition-all group relative overflow-hidden ${
                          isUrgent ? "border-red-500/60 ring-1 ring-red-500/30" : ""
                        }`}
                      >
                        {/* Urgent Pulse Ribbon */}
                        {isUrgent && (
                          <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-red-500/20 text-red-400 border-b border-l border-red-500/40 text-[10px] font-bold rounded-bl-xl flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>URGENT (J-{days})</span>
                          </div>
                        )}

                        {/* Top: University & Degree Level */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 text-xs text-cyan font-semibold truncate">
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{app.scholarship.university_name || "Université Chinoise"}</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-text-muted flex-shrink-0">
                            {app.scholarship.level || "Master"}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs sm:text-sm font-bold text-text-primary leading-snug line-clamp-2 mb-3">
                          <Link
                            href={`/scholarships/${app.scholarship.id}`}
                            className="hover:text-cyan transition-colors"
                          >
                            {app.scholarship.title}
                          </Link>
                        </h4>

                        {/* Deadline tag */}
                        <div className="flex items-center justify-between text-[11px] mb-3">
                          <span className="text-text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Limite :</span>
                          </span>
                          <span
                            className={`font-semibold ${
                              isUrgent
                                ? "text-red-400 font-bold"
                                : isUpcoming
                                ? "text-amber-400"
                                : isPassed
                                ? "text-text-muted"
                                : "text-text-secondary"
                            }`}
                          >
                            {days !== null
                              ? isPassed
                                ? "Expiré"
                                : `J-${days} jours`
                              : "En cours"}
                          </span>
                        </div>

                        {/* Checklist Progress Bar */}
                        {docEntries.length > 0 && (
                          <div className="mb-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                              <button
                                onClick={() =>
                                  setChecklistOpenId(isChecklistOpen ? null : app.id)
                                }
                                className="font-semibold text-text-secondary hover:text-cyan flex items-center gap-1 transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>
                                  {app.checklist_progress?.completed ?? 0} /{" "}
                                  {app.checklist_progress?.total ?? docEntries.length} docs prêts
                                </span>
                              </button>
                              <span className="text-[10px] font-bold text-cyan">
                                {app.checklist_progress?.percentage ?? 0}%
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan to-emerald-400 transition-all duration-300"
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
                                className="mt-2.5 pt-2 border-t border-white/5 space-y-1.5"
                              >
                                {docEntries.map(([docName, isDone]) => (
                                  <label
                                    key={docName}
                                    className="flex items-center gap-2 text-[11px] text-text-secondary cursor-pointer hover:text-text-primary transition-colors select-none"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isDone}
                                      onChange={() =>
                                        handleToggleChecklist(app.id, docName)
                                      }
                                      className="rounded border-white/20 bg-white/5 text-cyan focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span
                                      className={
                                        isDone
                                          ? "line-through text-text-muted"
                                          : ""
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
                          <div className="mb-2 text-[10px] font-mono px-2 py-1 rounded bg-white/5 border border-white/5 text-cyan truncate flex items-center justify-between">
                            <span className="truncate">N° {app.portal_application_id}</span>
                            <span className="text-text-muted text-[9px]">Portail</span>
                          </div>
                        )}

                        {app.notes && (
                          <p className="text-[11px] text-text-muted italic line-clamp-1 mb-3 pl-1 border-l-2 border-purple/40">
                            &quot;{app.notes}&quot;
                          </p>
                        )}

                        {/* Action buttons footer */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1 text-xs">
                          {/* Portal external link */}
                          {app.scholarship.application_link ? (
                            <a
                              href={app.scholarship.application_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-cyan transition-colors"
                              title="Ouvrir le portail officiel de candidature"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <Link
                              href={`/scholarships/${app.scholarship.id}`}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-cyan transition-colors"
                              title="Voir la fiche complète"
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
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-purple transition-colors"
                            title="Ajouter des notes ou N° de dossier"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete from CRM */}
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-red-400 transition-colors"
                            title="Retirer du tracker"
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
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-text-secondary hover:text-text-primary transition-colors"
                                title="Déplacer vers l'étape précédente"
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
                                className="px-2 py-1 rounded-lg bg-cyan/20 hover:bg-cyan/30 text-cyan text-[11px] font-bold flex items-center gap-1 transition-all"
                                title="Passer à l'étape suivante"
                              >
                                <span>Avancer</span>
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

      {/* Quick Note & Application ID Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 shadow-2xl relative"
            >
              <button
                onClick={() => setEditingItem(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple/20 text-purple flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">
                    Notes & Références de Candidature
                  </h3>
                  <p className="text-xs text-text-muted truncate max-w-xs sm:max-w-sm">
                    {editingItem.scholarship.title}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    N° d&apos;inscription ou Identifiant Portail
                  </label>
                  <input
                    type="text"
                    value={editPortalId}
                    onChange={(e) => setEditPortalId(e.target.value)}
                    placeholder="Ex: CSC2026-TSI-8912 ou PKU-ADM-4482"
                    className="w-full px-4 py-2.5 rounded-xl glass border border-white/15 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-cyan/50 font-mono transition-colors"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Numéro fourni lors de votre inscription sur le portail officiel de l&apos;université ou CSC.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Notes personnelles & Rappels
                  </label>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Notes de suivi, contacts du professeur superviseur, dates de relance, identifiants..."
                    className="w-full px-4 py-2.5 rounded-xl glass border border-white/15 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-cyan/50 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl glass text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNote}
                    className="px-5 py-2 rounded-xl btn-gradient text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan/20"
                  >
                    {savingNote ? (
                      <span>Enregistrement...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Enregistrer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
