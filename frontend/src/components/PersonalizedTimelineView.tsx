"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Mail,
  Bell,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Building2,
  GraduationCap,
  Edit3,
  Filter,
  Check,
  ExternalLink,
  FileText,
  Info,
  AlertTriangle,
  Layers,
  Send,
  Trophy,
  BookOpen,
  HeartPulse,
  FileCheck,
  X,
  Search,
  CheckSquare,
  Square,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { type ApplicationTrackerItem } from "@/lib/api";

export interface PersonalizedMilestone {
  id: string;
  title: string;
  titleAr: string;
  category: "admin" | "academic" | "medical" | "legalization" | "submission";
  leadDays: number; // Days before official deadline
  targetDate: string; // YYYY-MM-DD
  isOverdue: boolean;
  isCompleted: boolean;
  isUpcoming: boolean;
  daysRemaining: number;
  officialDesc: string;
  moroccanAdvice: string;
  actionUrl?: string;
  actionLabel?: string;
  requiredFor: string;
  scholarshipTitle?: string;
  universityName?: string;
  appId?: number;
}

interface PersonalizedTimelineViewProps {
  applications: ApplicationTrackerItem[];
  selectedAppId?: number | null;
  onSelectApp?: (appId: number) => void;
  onToggleMilestone: (appId: number, milestoneId: string) => void;
  onUpdateDeadline?: (appId: number, newDeadline: string) => void;
  lang: "fr" | "ar" | "en";
  showToast: (msg: string) => void;
}

// Helper: Format Date string YYYY-MM-DD
function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generate Personalized Milestones for a scholarship application
export function generateApplicationMilestones(
  app: ApplicationTrackerItem,
  todayStr: string = formatDate(new Date())
): PersonalizedMilestone[] {
  const deadlineRaw = app.scholarship.application_deadline || "2026-12-15";
  const deadlineDate = new Date(deadlineRaw);
  const isValidDate = !isNaN(deadlineDate.getTime());
  const baseDeadline = isValidDate ? deadlineDate : new Date(Date.now() + 60 * 24 * 3600 * 1000);

  const level = (app.scholarship.level || "master").toLowerCase();
  const title = (app.scholarship.title || "").toLowerCase();
  const uniName = app.scholarship.university_name || "Université Chinoise";
  const checklist = app.checklist || {};

  const today = new Date(todayStr);
  today.setHours(0, 0, 0, 0);

  // Template base lead-times (days prior to final deadline)
  // Adjusted slightly if total days to deadline is shorter
  const totalDaysRemaining = Math.max(
    10,
    Math.ceil((baseDeadline.getTime() - today.getTime()) / (24 * 3600 * 1000))
  );

  // Compression factor if deadline is tight (<60 days)
  const scale = totalDaysRemaining < 60 ? Math.max(0.4, totalDaysRemaining / 70) : 1;

  const rawMilestones: Array<{
    id: string;
    title: string;
    titleAr: string;
    category: "admin" | "academic" | "medical" | "legalization" | "submission";
    leadDays: number;
    officialDesc: string;
    moroccanAdvice: string;
    actionUrl?: string;
    actionLabel?: string;
    requiredFor: string;
    condition?: boolean;
  }> = [
    {
      id: "passport",
      title: "Passeport Biométrique Marocain (Validité ≥ 18 mois)",
      titleAr: "تجهيز وتجديد جواز السفر المغربي (صلاحية 18 شهراً)",
      category: "admin",
      leadDays: Math.round(65 * scale),
      officialDesc:
        "Numérisation haute définition des pages d'identification et pages de visas antérieurs. Le passeport doit être valide au moins 18 mois après la rentrée en Chine.",
      moroccanAdvice:
        "Procédure Wilaya/Préfecture via passeport.ma (timbre 500 DH). Vérifiez l'orthographe exacte du nom en caractères latins conforme à vos diplômes.",
      actionUrl: "https://www.passeport.ma",
      actionLabel: "Portail Passeport.ma",
      requiredFor: "Obligatoire pour tous les candidats",
    },
    {
      id: "apostille",
      title: "Légalisation & Apostille Marocaine (Apostille.ma)",
      titleAr: "تصديق الأبوستيل للشهادات والوثائق (Apostille.ma)",
      category: "legalization",
      leadDays: Math.round(55 * scale),
      officialDesc:
        "Légalisation officielle selon la Convention de La Haye (applicable en Chine depuis nov. 2023). Remplace la légalisation consulaire de l'Ambassade de Chine à Rabat.",
      moroccanAdvice:
        "Générez la demande sur www.apostille.ma. Faites légaliser préalablement vos diplômes universitaires ou de baccalauréat auprès de votre académie ou tribunal de 1ère instance.",
      actionUrl: "https://www.apostille.ma",
      actionLabel: "Guichet Apostille.ma",
      requiredFor: "Diplômes, relevés de notes et casier judiciaire",
    },
    {
      id: "translation",
      title: "Traduction Assermentée (Cachet Rouge)",
      titleAr: "الترجمة المحلفة الرسمية (الخاتم الأحمر)",
      category: "legalization",
      leadDays: Math.round(45 * scale),
      officialDesc:
        "Traduction officielle des relevés de notes, attestations de réussite et casier judiciaire de l'arabe/français vers l'anglais ou le chinois avec sceau officiel.",
      moroccanAdvice:
        "Exigez le cachet rouge d'un traducteur assermenté agréé près les Cours de Justice du Royaume du Maroc. Ne traduisez que les documents ayant déjà reçu l'Apostille.",
      actionUrl: "/services",
      actionLabel: "Traducteurs Partenaires",
      requiredFor: "Baccalauréat, Licences, Masters et Casier judiciaire",
    },
    {
      id: "csca_exam",
      title: "Inscription et Préparation à l'Examen CSCA",
      titleAr: "التسجيل في امتحان CSCA للمنح الوطنية الصينية",
      category: "academic",
      leadDays: Math.round(40 * scale),
      officialDesc:
        "Examen standardisé d'évaluation académique (Mathématiques, Physique, Anglais ou Chinois) géré par la China Scholarship Council pour les bacheliers.",
      moroccanAdvice:
        "Inscription directe sur csca.cn. Prévoyez 3 à 4 semaines de révision des programmes scientifiques en anglais ou chinois.",
      actionUrl: "https://csca.cn",
      actionLabel: "Portail CSCA.cn",
      requiredFor: "Candidats en Bachelor / Licence (Bourse CSC)",
      condition: level.includes("bachelor") || level.includes("licence"),
    },
    {
      id: "study_plan",
      title: "Projet d'Études / Study Plan (800 - 1500 mots)",
      titleAr: "صياغة خطة الدراسة ومشروع البحث (Study Plan)",
      category: "academic",
      leadDays: Math.round(35 * scale),
      officialDesc:
        "Exposé structuré comprenant : parcours académique, motivation pour la Chine et l'université ciblée, plan d'études semestriel et retombées professionnelles au Maroc.",
      moroccanAdvice:
        "Rédigez en anglais ou chinois. Évitez les formules génériques. Mettez en avant les coopérations économiques Maroc-Chine (la Ceinture et la Route).",
      actionUrl: "/services",
      actionLabel: "Aide à la Rédaction",
      requiredFor: "Critère n°1 d'évaluation du jury d'admission",
    },
    {
      id: "recommendations",
      title: "2 Lettres de Recommandation Académiques",
      titleAr: "رسالتا توصية أكاديميتان من أساتذة جامعيين",
      category: "academic",
      leadDays: Math.round(25 * scale),
      officialDesc:
        "Lettres confidentielles signées par deux Professeurs ou Maîtres de Conférences (Associate Professors) attestant de vos compétences scientifiques et de recherche.",
      moroccanAdvice:
        "Demandez à vos professeurs au moins 3 semaines à l'avance. Doit comporter l'en-tête de votre faculté (ex: UM5, UCA, UH2C), signature manuscrite et email universitaire.",
      requiredFor: "Obligatoire pour Master & Doctorat",
    },
    {
      id: "medical_exam",
      title: "Visite Médicale Étranger (CHU / Hôpital Militaire)",
      titleAr: "الفحص الطبي للأجانب (المستشفى الجامعي CHU)",
      category: "medical",
      leadDays: Math.round(18 * scale),
      officialDesc:
        "Formulaire officiel 'Foreigner Physical Examination Form' complété en anglais avec radiographie pulmonaire, électrocardiogramme (ECG) et analyses sérologiques (VIH, Hépatite).",
      moroccanAdvice:
        "Effectuez la visite dans un CHU public ou Hôpital Militaire. La photo doit être obligatoirement tamponnée en diagonale avec le cachet rond de l'hôpital. Validité : 6 mois.",
      actionUrl: "/services",
      actionLabel: "Télécharger Formulaire Médical",
      requiredFor: "Requis pour le visa étudiant X1 et la bourse",
    },
    {
      id: "submission",
      title: "Soumission Finale & Frais de Dossier (Portail Officiel)",
      titleAr: "الإيداع النهائي عبر البوابة الرسمية ودفع الرسوم",
      category: "submission",
      leadDays: 0,
      officialDesc: `Dépôt complet des pièces scannées en haute résolution sur le portail officiel de ${uniName} ou campuschina.org et règlement des frais de dossier.`,
      moroccanAdvice:
        "Ne soumettez pas à la dernière heure. Notez soigneusement votre N° de candidature (Application ID) et conservez la preuve de paiement bancaire.",
      actionUrl: app.scholarship.application_link || "https://studyinchina.csc.edu.cn/",
      actionLabel: "Accéder au Portail Officiel",
      requiredFor: "Validation définitive de la candidature",
    },
  ];

  return rawMilestones
    .filter((m) => m.condition === undefined || m.condition)
    .map((m) => {
      const targetTime = baseDeadline.getTime() - m.leadDays * 24 * 3600 * 1000;
      const targetDate = new Date(targetTime);
      const targetDateStr = formatDate(targetDate);

      // Check if completed: check either checklist[m.id] or checklist[m.title]
      const isCompleted = Boolean(
        checklist[m.id] ||
          checklist[m.title] ||
          Object.entries(checklist).some(([k, v]) => v && k.toLowerCase().includes(m.id))
      );

      const targetDayObj = new Date(targetDateStr);
      targetDayObj.setHours(0, 0, 0, 0);
      const diffMs = targetDayObj.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffMs / (24 * 3600 * 1000));

      const isOverdue = daysRemaining < 0 && !isCompleted;
      const isUpcoming = daysRemaining >= 0 && !isCompleted;

      return {
        id: m.id,
        title: m.title,
        titleAr: m.titleAr,
        category: m.category,
        leadDays: m.leadDays,
        targetDate: targetDateStr,
        isOverdue,
        isCompleted,
        isUpcoming,
        daysRemaining,
        officialDesc: m.officialDesc,
        moroccanAdvice: m.moroccanAdvice,
        actionUrl: m.actionUrl,
        actionLabel: m.actionLabel,
        requiredFor: m.requiredFor,
        scholarshipTitle: app.scholarship.title,
        universityName: uniName,
        appId: app.id,
      };
    })
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
}

export default function PersonalizedTimelineView({
  applications,
  selectedAppId,
  onSelectApp,
  onToggleMilestone,
  onUpdateDeadline,
  lang,
  showToast,
}: PersonalizedTimelineViewProps) {
  // Current active application
  const [activeAppId, setActiveAppId] = useState<number>(() => {
    if (selectedAppId) return selectedAppId;
    return applications[0]?.id || 0;
  });

  // Switcher: Unified mode vs Single App
  const [isUnifiedMode, setIsUnifiedMode] = useState(false);

  // View: Timeline Roadmap vs Interactive Calendar
  const [subView, setSubView] = useState<"timeline" | "calendar">("timeline");

  // Status Filter: all | overdue | upcoming | completed
  const [statusFilter, setStatusFilter] = useState<"all" | "overdue" | "upcoming" | "completed">("all");

  // Search filter
  const [taskSearch, setTaskSearch] = useState("");

  // Email Notification Modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("etudiant.maroc@gmail.com");
  const [notify14Days, setNotify14Days] = useState(true);
  const [notify7Days, setNotify7Days] = useState(true);
  const [notify3Days, setNotify3Days] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Admin Deadline Override Modal
  const [showAdminDeadlineModal, setShowAdminDeadlineModal] = useState(false);
  const [adminNewDeadline, setAdminNewDeadline] = useState("");
  const [adminExtensionReason, setAdminExtensionReason] = useState("Prolongation officielle annoncée par le CSC / Université");

  // Interactive Calendar state
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);

  // Current selected application object
  const currentApp = useMemo(() => {
    return applications.find((a) => a.id === activeAppId) || applications[0] || null;
  }, [applications, activeAppId]);

  // Compute milestones for the active application
  const currentMilestones = useMemo(() => {
    if (!currentApp) return [];
    return generateApplicationMilestones(currentApp);
  }, [currentApp]);

  // Unified milestones across all applications
  const allMilestonesUnified = useMemo(() => {
    const list: PersonalizedMilestone[] = [];
    applications.forEach((app) => {
      const ms = generateApplicationMilestones(app);
      list.push(...ms);
    });
    return list.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
  }, [applications]);

  // Milestones to display based on single vs unified
  const activeMilestonesPool = isUnifiedMode ? allMilestonesUnified : currentMilestones;

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    let list = activeMilestonesPool;

    if (statusFilter === "overdue") {
      list = list.filter((m) => m.isOverdue);
    } else if (statusFilter === "upcoming") {
      list = list.filter((m) => m.isUpcoming);
    } else if (statusFilter === "completed") {
      list = list.filter((m) => m.isCompleted);
    }

    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.titleAr.includes(q) ||
          m.officialDesc.toLowerCase().includes(q) ||
          m.moroccanAdvice.toLowerCase().includes(q) ||
          (m.universityName && m.universityName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeMilestonesPool, statusFilter, taskSearch]);

  // Stats for the active pool
  const stats = useMemo(() => {
    const total = activeMilestonesPool.length;
    const completed = activeMilestonesPool.filter((m) => m.isCompleted).length;
    const overdue = activeMilestonesPool.filter((m) => m.isOverdue).length;
    const upcoming = activeMilestonesPool.filter((m) => m.isUpcoming).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, overdue, upcoming, percentage };
  }, [activeMilestonesPool]);

  // Interactive Month Calendar calculations
  const calendarMonthData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth(); // 0-indexed

    // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDayRaw = new Date(year, month, 1).getDay();
    // Adjust to Monday start (0 = Mon, 6 = Sun)
    const firstDayIndex = (firstDayRaw + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Map of dates to milestones
    const dateToMilestones: Record<string, PersonalizedMilestone[]> = {};
    activeMilestonesPool.forEach((m) => {
      if (!dateToMilestones[m.targetDate]) {
        dateToMilestones[m.targetDate] = [];
      }
      dateToMilestones[m.targetDate].push(m);
    });

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      milestones: PersonalizedMilestone[];
    }> = [];

    // Previous month filler
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const str = formatDate(prevDate);
      cells.push({
        dateStr: str,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        milestones: dateToMilestones[str] || [],
      });
    }

    // Current month days
    const todayStr = formatDate(new Date());
    for (let day = 1; day <= daysInMonth; day++) {
      const currDate = new Date(year, month, day);
      const str = formatDate(currDate);
      cells.push({
        dateStr: str,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: str === todayStr,
        milestones: dateToMilestones[str] || [],
      });
    }

    // Next month filler to complete 35 or 42 cells grid
    const remainingCells = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      const str = formatDate(nextDate);
      cells.push({
        dateStr: str,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        milestones: dateToMilestones[str] || [],
      });
    }

    const monthNamesFr = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];

    return {
      monthLabel: `${monthNamesFr[month]} ${year}`,
      cells,
      dateToMilestones,
    };
  }, [calendarDate, activeMilestonesPool]);

  // Handle month navigation
  const prevMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const goToToday = () => {
    setCalendarDate(new Date());
    setSelectedCalendarDay(formatDate(new Date()));
  };

  // Toggle milestone completion
  const handleToggle = (m: PersonalizedMilestone) => {
    const targetAppId = m.appId || activeAppId;
    onToggleMilestone(targetAppId, m.id);
    showToast(
      !m.isCompleted
        ? `✓ Étape validée : ${m.title.split("(")[0]}`
        : `↺ Étape réouverte : ${m.title.split("(")[0]}`
    );
  };

  // Admin deadline update submit
  const handleAdminDeadlineSave = () => {
    if (!adminNewDeadline) {
      showToast("Veuillez sélectionner une date valide.");
      return;
    }
    if (onUpdateDeadline && currentApp) {
      onUpdateDeadline(currentApp.id, adminNewDeadline);
      showToast(`✓ Échéance mise à jour au ${adminNewDeadline}. Calendrier recalculé !`);
    }
    setShowAdminDeadlineModal(false);
  };

  // Send instant email summary
  const handleSendEmailSummary = () => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setShowEmailModal(false);
      showToast(`✓ Calendrier personnalisé et rappels programmés avec succès sur ${notificationEmail} !`);
    }, 1200);
  };

  if (applications.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 text-center border border-white/10 max-w-xl mx-auto my-8">
        <GraduationCap className="w-16 h-16 text-cyan mx-auto mb-4 opacity-75" />
        <h3 className="text-xl font-bold text-text-primary mb-2">Aucune candidature active</h3>
        <p className="text-sm text-text-secondary mb-6">
          Ajoutez des bourses à votre tableau de bord pour générer automatiquement votre calendrier personnalisé et vos échéances rétrocalculées.
        </p>
        <Link href="/scholarships" className="px-6 py-3 rounded-xl btn-gradient text-sm font-bold inline-flex items-center gap-2">
          <span>Explorer le Catalogue de Bourses</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Multi-Application Selector & Readiness Gauge */}
      <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan/15 text-cyan border border-cyan/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rétroplanning Intelligent Spécial Maroc</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Apostille.ma & CHU Inclus
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              {lang === "ar"
                ? "الجدول الزمني والتقويم الذكي للتقديم"
                : "Calendrier & Chronogramme Personnalisé des Démarches"}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
              {lang === "ar"
                ? "حساب تنازلي ذكي لكل مرحلة من تحضير الأبوستيل والفحص الطبي والترجمة المحلفة حتى الإيداع النهائي."
                : "Calcul rétroactif automatique basé sur la date limite officielle de votre bourse. Chaque étape est planifiée à rebours pour garantir un dossier complet à temps."}
            </p>
          </div>

          {/* Global Readiness Ring & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Readiness Gauge */}
            <div className="glass px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-3.5 bg-slate-900/40">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-slate-700/50"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * stats.percentage) / 100}
                    strokeLinecap="round"
                    className={`${
                      stats.percentage >= 75
                        ? "text-emerald-400"
                        : stats.percentage >= 40
                        ? "text-cyan"
                        : "text-amber-400"
                    } transition-all duration-700`}
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-xs font-black text-text-primary">
                  {stats.percentage}%
                </span>
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium">Progression Globale</p>
                <p className="text-sm font-bold text-text-primary">
                  {stats.completed} sur {stats.total} étapes
                </p>
              </div>
            </div>

            {/* Email Notification Button */}
            <button
              onClick={() => setShowEmailModal(true)}
              className="px-4 py-3 rounded-2xl glass hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              <Bell className="w-4 h-4 text-cyan" />
              <span>Rappels Email / SMS</span>
            </button>

            {/* Admin Deadline Override Button */}
            <button
              onClick={() => {
                if (currentApp) {
                  setAdminNewDeadline(
                    currentApp.scholarship.application_deadline?.slice(0, 10) || "2026-12-15"
                  );
                }
                setShowAdminDeadlineModal(true);
              }}
              className="px-4 py-3 rounded-2xl glass hover:bg-white/10 border border-purple/30 text-xs sm:text-sm font-bold text-purple-300 flex items-center gap-2 cursor-pointer transition-all shadow-sm"
              title="Modifier la date officielle pour simuler une extension"
            >
              <Edit3 className="w-4 h-4 text-purple" />
              <span>Gérer Date Limite</span>
            </button>
          </div>
        </div>

        {/* Multi-Application Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider mr-1 whitespace-nowrap flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Bourses Actives :</span>
            </span>

            {applications.map((app) => {
              const isSelected = !isUnifiedMode && app.id === activeAppId;
              const appMilestones = generateApplicationMilestones(app);
              const doneCount = appMilestones.filter((m) => m.isCompleted).length;
              const appPercentage = appMilestones.length > 0 ? Math.round((doneCount / appMilestones.length) * 100) : 0;
              const hasOverdue = appMilestones.some((m) => m.isOverdue);

              return (
                <button
                  key={app.id}
                  onClick={() => {
                    setIsUnifiedMode(false);
                    setActiveAppId(app.id);
                    if (onSelectApp) onSelectApp(app.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-cyan text-slate-950 shadow-md shadow-cyan/30 font-extrabold"
                      : "glass text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-white/10"
                  }`}
                >
                  <span>{app.scholarship.university_name || app.scholarship.title.slice(0, 22)}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      isSelected
                        ? "bg-slate-950 text-cyan"
                        : "bg-white/10 text-text-muted"
                    }`}
                  >
                    {appPercentage}%
                  </span>
                  {hasOverdue && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Tâche en retard !" />
                  )}
                </button>
              );
            })}

            {/* Unified Mode Tab */}
            {applications.length > 1 && (
              <button
                onClick={() => setIsUnifiedMode(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isUnifiedMode
                    ? "bg-gradient-to-r from-purple to-pink-500 text-white shadow-md shadow-purple/30 font-extrabold"
                    : "glass text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-white/10"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Toutes les Bourses Réunies ({allMilestonesUnified.length})</span>
              </button>
            )}
          </div>

          {/* Active Scholarship Official Deadline Tag */}
          {!isUnifiedMode && currentApp && (
            <div className="flex items-center gap-2 text-xs text-text-secondary bg-slate-900/30 px-3 py-1.5 rounded-xl border border-white/5 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-cyan" />
              <span>
                Échéance Officielle :{" "}
                <strong className="text-text-primary">
                  {currentApp.scholarship.application_deadline?.slice(0, 10) || "2026-12-15"}
                </strong>
              </span>
              <span className="text-cyan font-bold">
                ({currentApp.scholarship.days_until_deadline ?? "60"} jours restants)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sub-View Switcher (Timeline vs Calendar) & Status Filters */}
      <div className="glass rounded-2xl p-3 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Sub-View Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubView("timeline")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              subView === "timeline"
                ? "btn-gradient text-white shadow-md shadow-cyan/20"
                : "text-slate-600 dark:text-text-secondary hover:bg-white/5"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Vue Chronologique (Timeline)</span>
          </button>

          <button
            onClick={() => setSubView("calendar")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              subView === "calendar"
                ? "btn-gradient text-white shadow-md shadow-cyan/20"
                : "text-slate-600 dark:text-text-secondary hover:bg-white/5"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Vue Calendrier Mensuel</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-cyan/20 text-cyan">
              Grille
            </span>
          </button>
        </div>

        {/* Status Filter Buttons & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/30 p-1 rounded-xl border border-white/5 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white/15 text-text-primary font-bold shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Tous ({stats.total})
            </button>

            <button
              onClick={() => setStatusFilter("overdue")}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === "overdue"
                  ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30"
                  : "text-rose-400 hover:bg-rose-500/10"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>En Retard ({stats.overdue})</span>
            </button>

            <button
              onClick={() => setStatusFilter("upcoming")}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === "upcoming"
                  ? "bg-cyan/20 text-cyan font-bold border border-cyan/30"
                  : "text-cyan hover:bg-cyan/10"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan" />
              <span>À Venir ({stats.upcoming})</span>
            </button>

            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === "completed"
                  ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30"
                  : "text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Validé ({stats.completed})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Rechercher étape..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-cyan/50 w-36 sm:w-44 transition-all"
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: TIMELINE ROADMAP */}
      {subView === "timeline" && (
        <div className="space-y-4">
          {filteredMilestones.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center border border-white/10">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
              <p className="text-base font-bold text-text-primary">Aucune tâche correspondant aux filtres</p>
              <p className="text-xs text-text-secondary mt-1">
                Toutes les démarches de cette catégorie sont à jour ou filtrées.
              </p>
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setTaskSearch("");
                }}
                className="mt-4 px-4 py-2 rounded-xl glass hover:bg-white/10 text-xs font-bold text-cyan"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-cyan before:via-purple before:to-emerald-500">
              {filteredMilestones.map((m, idx) => {
                const targetApp = applications.find((a) => a.id === m.appId) || currentApp;

                return (
                  <motion.div
                    key={`${m.appId}-${m.id}`}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`relative mb-6 p-5 sm:p-6 rounded-3xl glass border transition-all ${
                      m.isCompleted
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : m.isOverdue
                        ? "border-rose-500/40 bg-rose-500/5 shadow-lg shadow-rose-500/5"
                        : "border-slate-200 dark:border-white/10 hover:border-cyan/40"
                    }`}
                  >
                    {/* Node Dot on Rail */}
                    <button
                      onClick={() => handleToggle(m)}
                      title={m.isCompleted ? "Marquer non terminé" : "Valider cette étape"}
                      className={`absolute -left-[35px] sm:-left-[43px] top-6 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-md ${
                        m.isCompleted
                          ? "bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20"
                          : m.isOverdue
                          ? "bg-rose-500 text-white ring-4 ring-rose-500/20 animate-pulse"
                          : "bg-slate-900 border-2 border-cyan text-cyan"
                      }`}
                    >
                      {m.isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : m.isOverdue ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-[10px] font-black">{idx + 1}</span>
                      )}
                    </button>

                    {/* Milestone Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggle(m)}
                          className="mt-0.5 text-text-muted hover:text-cyan transition-colors cursor-pointer"
                        >
                          {m.isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 hover:text-cyan" />
                          )}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-base sm:text-lg font-extrabold ${
                                m.isCompleted
                                  ? "line-through text-text-muted"
                                  : "text-text-primary"
                              }`}
                            >
                              {m.title}
                            </h3>

                            {isUnifiedMode && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple/15 text-purple-300 border border-purple/30">
                                {m.universityName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted font-medium mt-0.5 dir-rtl text-right">
                            {m.titleAr}
                          </p>
                        </div>
                      </div>

                      {/* Status & Deadline Badge */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {m.isCompleted ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            <span>Validé</span>
                          </span>
                        ) : m.isOverdue ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>En retard de {Math.abs(m.daysRemaining)} jours</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan/15 text-cyan border border-cyan/30 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Dans {m.daysRemaining} jours</span>
                          </span>
                        )}

                        <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-900/60 border border-white/10 text-text-secondary whitespace-nowrap">
                          Échéance : <strong>{m.targetDate}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Official Description */}
                    <p className="text-xs sm:text-sm text-text-secondary mb-3 leading-relaxed">
                      {m.officialDesc}
                    </p>

                    {/* Moroccan Procedural Tips Box */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-cyan/5 to-transparent border border-amber-500/20 text-xs space-y-1 mb-3">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <Info className="w-3.5 h-3.5" />
                        <span>Conseil Pratique Étudiant Marocain :</span>
                      </div>
                      <p className="text-text-secondary leading-relaxed pl-5">
                        {m.moroccanAdvice}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <span className="text-[11px] font-medium text-text-muted flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan" />
                        <span>{m.requiredFor}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {m.actionUrl && (
                          <a
                            href={m.actionUrl}
                            target={m.actionUrl.startsWith("http") ? "_blank" : undefined}
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-cyan hover:text-white transition-colors flex items-center gap-1.5"
                          >
                            <span>{m.actionLabel || "Accéder"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <button
                          onClick={() => handleToggle(m)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            m.isCompleted
                              ? "bg-white/5 text-text-muted hover:bg-white/10"
                              : "btn-gradient text-white shadow-sm"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{m.isCompleted ? "Réouvrir l'étape" : "Marquer comme fait"}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: INTERACTIVE CALENDAR GRID */}
      {subView === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Month Grid (2 cols on large) */}
          <div className="lg:col-span-2 glass rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xl">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan/15 text-cyan flex items-center justify-center shadow-md">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-text-primary">
                    {calendarMonthData.monthLabel}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {activeMilestonesPool.length} étapes programmées au total
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 rounded-xl glass hover:bg-white/10 text-xs font-bold text-text-primary transition-colors cursor-pointer"
                >
                  Aujourd&apos;hui
                </button>
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl glass hover:bg-white/10 text-text-primary transition-colors cursor-pointer"
                  title="Mois précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl glass hover:bg-white/10 text-text-primary transition-colors cursor-pointer"
                  title="Mois suivant"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-xs font-bold text-text-muted">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mer</span>
              <span>Jeu</span>
              <span>Ven</span>
              <span>Sam</span>
              <span>Dim</span>
            </div>

            {/* Calendar cells grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarMonthData.cells.map((cell, idx) => {
                const hasMilestones = cell.milestones.length > 0;
                const hasOverdue = cell.milestones.some((m) => m.isOverdue);
                const isAllCompleted =
                  hasMilestones && cell.milestones.every((m) => m.isCompleted);
                const isSelected = selectedCalendarDay === cell.dateStr;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedCalendarDay(cell.dateStr);
                    }}
                    className={`min-h-[75px] sm:min-h-[90px] p-2 rounded-2xl text-left transition-all relative flex flex-col justify-between cursor-pointer border ${
                      cell.isCurrentMonth ? "opacity-100" : "opacity-35"
                    } ${
                      isSelected
                        ? "ring-2 ring-cyan bg-cyan/15 border-cyan"
                        : cell.isToday
                        ? "bg-slate-900/60 border-cyan/50"
                        : hasMilestones
                        ? "glass bg-white/5 border-slate-300 dark:border-white/10 hover:border-cyan/40"
                        : "hover:bg-white/5 border-transparent"
                    }`}
                  >
                    {/* Top Day Number & Today indicator */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black rounded-lg px-1.5 py-0.5 ${
                          cell.isToday
                            ? "bg-cyan text-slate-950"
                            : "text-text-primary"
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {hasOverdue && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </div>

                    {/* Milestones Chips */}
                    {hasMilestones && (
                      <div className="space-y-1 mt-1">
                        {cell.milestones.slice(0, 2).map((m) => (
                          <div
                            key={m.id}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate flex items-center gap-1 ${
                              m.isCompleted
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 line-through"
                                : m.isOverdue
                                ? "bg-rose-500/25 text-rose-300 border border-rose-500/40"
                                : "bg-cyan/20 text-cyan border border-cyan/30"
                            }`}
                            title={m.title}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                m.isCompleted
                                  ? "bg-emerald-400"
                                  : m.isOverdue
                                  ? "bg-rose-400"
                                  : "bg-cyan"
                              }`}
                            />
                            <span className="truncate">{m.title.split("(")[0]}</span>
                          </div>
                        ))}

                        {cell.milestones.length > 2 && (
                          <p className="text-[9px] font-extrabold text-cyan pl-1">
                            +{cell.milestones.length - 2} autres
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-4 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan" />
                <span>À Venir</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>En Retard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Validé</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <Info className="w-3.5 h-3.5 text-cyan" />
                <span>Cliquez sur un jour pour inspecter les échéances associées</span>
              </div>
            </div>
          </div>

          {/* Side Panel: Selected Day Detail */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Détail de la date
                  </p>
                  <h4 className="text-lg font-black text-text-primary">
                    {selectedCalendarDay || formatDate(new Date())}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/10 text-cyan">
                  {selectedCalendarDay && calendarMonthData.dateToMilestones[selectedCalendarDay]
                    ? `${calendarMonthData.dateToMilestones[selectedCalendarDay].length} tâche(s)`
                    : "0 tâche"}
                </span>
              </div>

              {selectedCalendarDay &&
              calendarMonthData.dateToMilestones[selectedCalendarDay] &&
              calendarMonthData.dateToMilestones[selectedCalendarDay].length > 0 ? (
                <div className="space-y-3">
                  {calendarMonthData.dateToMilestones[selectedCalendarDay].map((m) => (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl glass border ${
                        m.isCompleted
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : m.isOverdue
                          ? "border-rose-500/40 bg-rose-500/10"
                          : "border-cyan/30 bg-cyan/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5
                          className={`text-sm font-bold ${
                            m.isCompleted ? "line-through text-text-muted" : "text-text-primary"
                          }`}
                        >
                          {m.title}
                        </h5>
                        <button
                          onClick={() => handleToggle(m)}
                          className="text-text-muted hover:text-cyan transition-colors"
                        >
                          {m.isCompleted ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                        {m.officialDesc}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-bold ${
                            m.isCompleted
                              ? "text-emerald-400"
                              : m.isOverdue
                              ? "text-rose-400"
                              : "text-cyan"
                          }`}
                        >
                          {m.isCompleted
                            ? "✓ Terminé"
                            : m.isOverdue
                            ? `🔴 En retard (${Math.abs(m.daysRemaining)} j)`
                            : `⏳ Dans ${m.daysRemaining} j`}
                        </span>

                        <button
                          onClick={() => handleToggle(m)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold glass hover:bg-white/10 text-cyan cursor-pointer"
                        >
                          {m.isCompleted ? "Réouvrir" : "Cocher"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-text-muted">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">Aucune échéance fixée ce jour</p>
                  <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
                    Sélectionnez un jour surligné en couleur dans le calendrier pour consulter les démarches.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => setSubView("timeline")}
                className="w-full py-2.5 rounded-xl glass hover:bg-white/10 text-xs font-bold text-text-primary flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Basculer vers la Timeline Détaillée</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EMAIL & SMS DEADLINE NOTIFICATIONS */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-cyan/30 shadow-2xl relative"
            >
              <button
                onClick={() => setShowEmailModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl glass hover:bg-white/10 text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan/20 text-cyan flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-text-primary">
                    Alertes & Rappels d&apos;Échéances
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Ne ratez aucun jalon administratif marocain ou chinois
                  </p>
                </div>
              </div>

              <div className="space-y-4 my-6">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">
                    Adresse Email de Notification
                  </label>
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary outline-none focus:border-cyan"
                    placeholder="votre.email@domaine.com"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-text-secondary uppercase mb-2">
                    Fréquence des Rappels Automatiques
                  </p>

                  <label className="flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notify14Days}
                      onChange={(e) => setNotify14Days(e.target.checked)}
                      className="rounded text-cyan focus:ring-0"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-text-primary">J - 14 jours avant l&apos;échéance</p>
                      <p className="text-text-muted">Indispensable pour lancer l&apos;Apostille et la traduction</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notify7Days}
                      onChange={(e) => setNotify7Days(e.target.checked)}
                      className="rounded text-cyan focus:ring-0"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-text-primary">J - 7 jours avant l&apos;échéance</p>
                      <p className="text-text-muted">Alerte pour visite médicale CHU et signatures profs</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notify3Days}
                      onChange={(e) => setNotify3Days(e.target.checked)}
                      className="rounded text-cyan focus:ring-0"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-text-primary">J - 3 jours et J - 24h (Urgence)</p>
                      <p className="text-text-muted">Dernier rappel avant clôture du portail officiel</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyWhatsApp}
                      onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                      className="rounded text-emerald-400 focus:ring-0"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-300">Notification WhatsApp (+212)</p>
                      <p className="text-text-muted">Alerte directe sur votre numéro marocain</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2.5 rounded-xl glass hover:bg-white/10 text-xs font-semibold text-text-secondary cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  onClick={handleSendEmailSummary}
                  disabled={isSendingEmail}
                  className="px-5 py-2.5 rounded-xl btn-gradient text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? "Envoi en cours..." : "Enregistrer & Envoyer Récapitulatif"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADMIN / COUNSELOR DEADLINE UPDATE */}
      <AnimatePresence>
        {showAdminDeadlineModal && currentApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-purple/40 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAdminDeadlineModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl glass hover:bg-white/10 text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple/20 text-purple flex items-center justify-center shadow-lg">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-text-primary">
                    Mettre à Jour la Date Limite Officielle
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Panneau Administration & Conseiller Académique
                  </p>
                </div>
              </div>

              <div className="space-y-4 my-6">
                <div className="p-3.5 rounded-2xl bg-purple/10 border border-purple/20 text-xs">
                  <p className="font-bold text-purple-300 mb-1">
                    Bourse ciblée : {currentApp.scholarship.title}
                  </p>
                  <p className="text-text-secondary">
                    Date actuelle enregistrée :{" "}
                    <strong>
                      {currentApp.scholarship.application_deadline?.slice(0, 10) || "2026-12-15"}
                    </strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">
                    Nouvelle Date Limite Officielle (Deadline)
                  </label>
                  <input
                    type="date"
                    value={adminNewDeadline}
                    onChange={(e) => setAdminNewDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary outline-none focus:border-purple"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    * Toutes les étapes de la timeline et du calendrier seront instantanément recalculées à rebours à partir de cette nouvelle date.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">
                    Motif de la modification
                  </label>
                  <input
                    type="text"
                    value={adminExtensionReason}
                    onChange={(e) => setAdminExtensionReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-text-primary outline-none focus:border-purple"
                    placeholder="Ex: Prorogation officielle du Conseil des Bourses de Chine"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowAdminDeadlineModal(false)}
                  className="px-4 py-2.5 rounded-xl glass hover:bg-white/10 text-xs font-semibold text-text-secondary cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAdminDeadlineSave}
                  className="px-5 py-2.5 rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Recalculer Tout le Calendrier</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
