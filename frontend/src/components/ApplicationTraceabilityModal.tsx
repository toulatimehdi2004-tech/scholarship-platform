"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  GraduationCap,
  FileCheck,
  Send,
  Search,
  Award,
  Truck,
  Plane,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Save,
  ShieldCheck,
  ChevronRight,
  Info,
  MapPin,
  Sparkles,
  Edit3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { type ApplicationTrackerItem } from "@/lib/api";

export interface TraceabilityMilestone {
  step: number;
  id: string;
  titleFr: string;
  titleEn: string;
  titleAr: string;
  descFr: string;
  descEn: string;
  descAr: string;
  status: "completed" | "current" | "pending" | "action_needed";
  date?: string;
  referenceNo?: string;
  notes?: string;
}

export const OFFICIAL_MILESTONES: Omit<TraceabilityMilestone, "status" | "date" | "referenceNo" | "notes">[] = [
  {
    step: 1,
    id: "selection",
    titleFr: "1. Sélection du Programme & Éligibilité",
    titleEn: "1. Program Selection & Eligibility Check",
    titleAr: "1. اختيار البرنامج والتحقق من الأهلية",
    descFr: "Vérification des critères d'admission, GPA, âge et sélection de la bourse (CSC Type A/B, Provinciale ou Universitaire).",
    descEn: "Verification of university GPA, age limit, language prerequisites, and scholarship category.",
    descAr: "التأكد من شروط السن والمعدل الدراسي واللغة ونوع المنحة الصينية.",
  },
  {
    step: 2,
    id: "docs_csca",
    titleFr: "2. Légalisation Apostille & Examen CSCA",
    titleEn: "2. Apostille Legalization & CSCA Exam",
    titleAr: "2. تصديق الأبوستيل المغربي وامتحان CSCA",
    descFr: "Traductions assermentées (anglais/chinois), apostille.ma (MAEC Rabat) et inscription à l'examen CSCA sur csca.cn pour les bacheliers.",
    descEn: "Sworn translations, Moroccan MFA Apostille legalization, and CSCA exam registration on csca.cn for bachelor candidates.",
    descAr: "الترجمة المحلفة، تصديق الأبوستيل المغربي واجتياز امتحان CSCA للبكالوريوس على csca.cn.",
  },
  {
    step: 3,
    id: "portal_submission",
    titleFr: "3. Soumission sur le Portail Officiel (CSC / Université)",
    titleEn: "3. Official Portal Submission (CSC / University)",
    titleAr: "3. إيداع الطلب على البوابة الرسمية (CSC / الجامعة)",
    descFr: "Dépôt complet des formulaires et documents sur campuschina.org ou le portail universitaire international avec N° de dossier officiel.",
    descEn: "Complete dossier upload on campuschina.org or international university portal with official tracking reference ID generated.",
    descAr: "رفع الاستمارات والملفات على بوابة المنحة الصينية مع استلام رقم الملف الرسمي.",
  },
  {
    step: 4,
    id: "preliminary_review",
    titleFr: "4. Examen Administratif Préliminaire",
    titleEn: "4. Preliminary Document & Compliance Review",
    titleAr: "4. الفحص والتدقيق الإداري الأولي للملف",
    descFr: "Contrôle de conformité et d'authenticité des pièces par le Bureau des Étudiants Internationaux (ISO) de l'université chinoise.",
    descEn: "Document authenticity and requirement verification by the University International Student Office (ISO).",
    descAr: "فحص وتدقيق سلامة الوثائق من قِبل مكتب شؤون الطلاب الدوليين بالجامعة.",
  },
  {
    step: 5,
    id: "academic_interview",
    titleFr: "5. Évaluation Académique & Entretien / Pré-Admission",
    titleEn: "5. Faculty Academic Review & Pre-Admission",
    titleAr: "5. التقييم الأكاديمي والمقابلة / القبول المبدئي",
    descFr: "Revue par le comité professoral du département, entretien oral vidéo ou délivrance de la Lettre de Pré-Admission.",
    descEn: "Academic committee review, faculty supervision agreement, video interview, or Pre-Admission Letter issued.",
    descAr: "تقييم الكلية للقدرات العلمية، إجراء مقابلة عبر الفيديو أو إصدار خطاب القبول المبدئي.",
  },
  {
    step: 6,
    id: "csc_council",
    titleFr: "6. Validation Finale par le Conseil des Bourses (CSC)",
    titleEn: "6. China Scholarship Council (CSC) Final Approval",
    titleAr: "6. الاعتماد النهائي من مجلس المنح الصيني (CSC)",
    descFr: "Approbation définitive de la liste des boursiers officiels par le China Scholarship Council à Pékin.",
    descEn: "Official scholarship award decision and quota confirmation by China Scholarship Council in Beijing.",
    descAr: "الموافقة الرسمية واعتماد قائمة الفائزين بالمنحة من قِبل مجلس المنح الصيني في بكين.",
  },
  {
    step: 7,
    id: "jw202_shipping",
    titleFr: "7. Émission du Formulaire Visa JW201/JW202 & Colis DHL",
    titleEn: "7. JW201/JW202 Visa Form Issued & Document Shipping",
    titleAr: "7. إصدار استمارة الفيزا JW202 وإرسال الطرد البريدي",
    descFr: "Génération du formulaire officiel de visa étudiant JW202 et expédition du paquet d'admission original par courrier express vers le Maroc.",
    descEn: "Official JW202/JW201 visa authorization form generated, original admission package dispatched via express courier to Morocco.",
    descAr: "إصدار استمارة التأشيرة الدراسية الرسمية JW202 وإرسال أصل شهادة القبول إلى المغرب عبر البريد السريع.",
  },
  {
    step: 8,
    id: "embassy_visa_flight",
    titleFr: "8. Visa Étudiant X1 à l'Ambassade à Rabat & Départ",
    titleEn: "8. Student Visa X1 at Chinese Embassy in Rabat & Departure",
    titleAr: "8. استلام فيزا X1 من السفارة بالرباط والسفر إلى الصين",
    descFr: "Dépôt du passeport et du formulaire JW202 au service consulaire de l'Ambassade de Chine à Rabat, délivrance du visa X1 et départ.",
    descEn: "Visa application submission at the Chinese Embassy in Rabat, X1 student visa collection, and flight departure to China.",
    descAr: "إيداع الجواز واستمارة JW202 بسفارة الصين بالرباط، استلام تأشيرة X1 وحجز تذكرة السفر.",
  },
];

interface ApplicationTraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationTrackerItem | null;
  onSave: (updated: ApplicationTrackerItem) => void;
}

export default function ApplicationTraceabilityModal({
  isOpen,
  onClose,
  application,
  onSave,
}: ApplicationTraceabilityModalProps) {
  const { lang } = useLang();
  const [copiedId, setCopiedId] = useState(false);
  const [portalId, setPortalId] = useState("");
  const [dhlCode, setDhlCode] = useState("");
  const [universityNotes, setUniversityNotes] = useState("");
  const [milestones, setMilestones] = useState<TraceabilityMilestone[]>([]);
  const [selectedMilestoneStep, setSelectedMilestoneStep] = useState<number>(3);
  const [editingMilestoneDate, setEditingMilestoneDate] = useState<string>("");
  const [editingMilestoneNotes, setEditingMilestoneNotes] = useState<string>("");

  // Initialize milestones from application data or status
  useEffect(() => {
    if (!application) return;

    setPortalId(application.portal_application_id || "");
    setUniversityNotes(application.notes || "");

    // Load custom traceability from localStorage if present
    let savedTrace: any = null;
    try {
      const raw = localStorage.getItem(`traceability_${application.id}`);
      if (raw) savedTrace = JSON.parse(raw);
    } catch {}

    if (savedTrace && Array.isArray(savedTrace.milestones)) {
      setMilestones(savedTrace.milestones);
      setDhlCode(savedTrace.dhlCode || "");
      setSelectedMilestoneStep(savedTrace.currentStep || 3);
      return;
    }

    // Default determination based on application status
    const status = application.status;
    let currentStep = 2;
    if (status === "wishlist") currentStep = 1;
    else if (status === "preparing_docs") currentStep = 2;
    else if (status === "submitted") currentStep = 4;
    else if (status === "interview") currentStep = 5;
    else if (status === "accepted") currentStep = 7;

    setSelectedMilestoneStep(currentStep);

    const generated: TraceabilityMilestone[] = OFFICIAL_MILESTONES.map((m) => {
      let st: TraceabilityMilestone["status"] = "pending";
      let dt = "";
      if (m.step < currentStep) {
        st = "completed";
        dt = "Étape validée";
      } else if (m.step === currentStep) {
        st = "current";
        dt = "En cours actuellement";
      } else {
        st = "pending";
      }

      return {
        ...m,
        status: st,
        date: dt,
        notes: "",
      };
    });

    setMilestones(generated);
  }, [application]);

  if (!isOpen || !application) return null;

  const handleCopyId = () => {
    if (!portalId) return;
    navigator.clipboard.writeText(portalId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleUpdateMilestoneStatus = (step: number, newStatus: TraceabilityMilestone["status"]) => {
    const updated = milestones.map((m) => {
      if (m.step === step) {
        return {
          ...m,
          status: newStatus,
          date:
            newStatus === "completed"
              ? new Date().toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : m.date,
        };
      }
      return m;
    });
    setMilestones(updated);
  };

  const handleSaveAll = () => {
    const updatedApp: ApplicationTrackerItem = {
      ...application,
      portal_application_id: portalId,
      notes: universityNotes,
      updated_at: new Date().toISOString(),
    };

    // Save to localStorage
    try {
      localStorage.setItem(
        `traceability_${application.id}`,
        JSON.stringify({
          milestones,
          dhlCode,
          currentStep: selectedMilestoneStep,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {}

    onSave(updatedApp);
    onClose();
  };

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const progressPercent = Math.round((completedCount / OFFICIAL_MILESTONES.length) * 100);

  const activeMilestone =
    milestones.find((m) => m.step === selectedMilestoneStep) || milestones[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="glass rounded-3xl p-5 sm:p-8 max-w-4xl w-full border border-cyan/30 shadow-2xl relative my-auto bg-slate-950/95 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-shimmer">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "مسار التتبع والتوثيق المباشر" : "Traçabilité Officielle en Temps Réel"}</span>
          </div>
          <span className="text-xs text-text-muted font-mono">
            ID #{application.id}
          </span>
        </div>

        {/* Scholarship & University Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-border-glass">
          <div>
            <div className="flex items-center gap-2 text-cyan font-bold text-xs sm:text-sm mb-1">
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span>{application.scholarship.university_name || "Université Chinoise"}</span>
              {application.scholarship.university_city && (
                <span className="text-text-muted font-normal">({application.scholarship.university_city})</span>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-text-primary leading-tight">
              {application.scholarship.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-3 py-1 rounded-xl text-xs font-extrabold uppercase bg-cyan/15 text-cyan border border-cyan/30">
              {application.scholarship.level || "Bachelor"}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-extrabold uppercase bg-purple/15 text-purple border border-purple/30">
              {application.scholarship.type || "Full Scholarship"}
            </span>
          </div>
        </div>

        {/* Progress Bar & Key Metric Gauge */}
        <div className="glass rounded-2xl p-4 sm:p-5 border border-border-glass mb-6 bg-gradient-to-r from-cyan/10 via-purple/10 to-emerald-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">
                {lang === "ar" ? "مستوى تقدم الملف :" : "Progression Globale du Dossier :"}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {completedCount} / {OFFICIAL_MILESTONES.length} {lang === "ar" ? "مراحل مكتملة" : "étapes validées"}
              </span>
            </div>
            <span className="text-sm font-black text-cyan">
              {progressPercent}% {lang === "ar" ? "مكتمل" : "Terminé"}
            </span>
          </div>

          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan via-purple to-emerald-400 transition-all duration-500 shadow-sm shadow-cyan/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tracking Numbers & Carrier Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Official Portal Application ID */}
          <div className="glass rounded-2xl p-4 border border-border-glass">
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>{lang === "ar" ? "رقم الطلب الرسمي (CSC / الجامعة)" : "N° de Dossier Officiel (CSC / Univ.)"}</span>
              {portalId && (
                <button
                  onClick={handleCopyId}
                  className="text-cyan hover:underline flex items-center gap-1 cursor-pointer font-bold text-[10px]"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId ? "Copié !" : "Copier"}</span>
                </button>
              )}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ex: CSC-2026-TSI-8912 ou ZJU-2026-4401"
                value={portalId}
                onChange={(e) => setPortalId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm font-mono text-cyan placeholder:text-text-muted focus:outline-none focus:border-cyan"
              />
            </div>
          </div>

          {/* Postal / DHL Parcel Tracking Code */}
          <div className="glass rounded-2xl p-4 border border-border-glass">
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "ar" ? "رقم تتبع طرد استمارة الفيزا JW202 (DHL/SF)" : "N° de Suivi Courrier JW202 (DHL/SF Express)"}</span>
            </label>
            <input
              type="text"
              placeholder="Ex: DHL-9921448-MA ou SF-8921004"
              value={dhlCode}
              onChange={(e) => setDhlCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm font-mono text-amber-300 placeholder:text-text-muted focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* 8-Step Timeline Interactive Journey */}
        <div className="mb-6">
          <div className="text-xs font-black uppercase tracking-wider text-text-primary mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan" />
            <span>{lang === "ar" ? "المسار الزمني الموثق للقبول والفيزا :" : "Chronologie Officielle des 8 Étapes :"}</span>
          </div>

          <div className="space-y-2.5">
            {milestones.map((milestone) => {
              const isSelected = selectedMilestoneStep === milestone.step;
              const isDone = milestone.status === "completed";
              const isCurrent = milestone.status === "current";
              const isAction = milestone.status === "action_needed";

              return (
                <div
                  key={milestone.step}
                  onClick={() => setSelectedMilestoneStep(milestone.step)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-cyan/15 border-cyan shadow-md shadow-cyan/10"
                      : isDone
                      ? "glass border-emerald-500/30 hover:border-emerald-500/50"
                      : isCurrent
                      ? "glass border-amber-500/40 bg-amber-500/5"
                      : isAction
                      ? "glass border-rose-500/40 bg-rose-500/5"
                      : "glass border-border-glass opacity-75 hover:opacity-100"
                  }`}
                >
                  {/* Left: Step number & Title */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 ${
                        isDone
                          ? "bg-emerald-500 text-slate-950"
                          : isCurrent
                          ? "bg-amber-400 text-slate-950 animate-pulse"
                          : isAction
                          ? "bg-rose-500 text-white"
                          : "bg-white/10 text-text-muted"
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : milestone.step}
                    </div>

                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-text-primary">
                        {lang === "ar"
                          ? milestone.titleAr
                          : lang === "en"
                          ? milestone.titleEn
                          : milestone.titleFr}
                      </div>
                      <div className="text-[11px] text-text-secondary mt-0.5 max-w-xl line-clamp-1">
                        {lang === "ar"
                          ? milestone.descAr
                          : lang === "en"
                          ? milestone.descEn
                          : milestone.descFr}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Pill & Action */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    <select
                      value={milestone.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleUpdateMilestoneStatus(
                          milestone.step,
                          e.target.value as TraceabilityMilestone["status"]
                        )
                      }
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer bg-slate-900 ${
                        isDone
                          ? "text-emerald-400 border-emerald-500/40"
                          : isCurrent
                          ? "text-amber-400 border-amber-500/40"
                          : isAction
                          ? "text-rose-400 border-rose-500/40"
                          : "text-text-muted border-white/10"
                      }`}
                    >
                      <option value="completed">{lang === "ar" ? "✓ تم الإنجاز" : "✓ Terminé"}</option>
                      <option value="current">{lang === "ar" ? "⏳ جاري الآن" : "⏳ En Cours"}</option>
                      <option value="pending">{lang === "ar" ? "⏸️ في الانتظار" : "⏸️ En Attente"}</option>
                      <option value="action_needed">{lang === "ar" ? "⚠️ مطلوب إجراء" : "⚠️ Action Requise"}</option>
                    </select>

                    {milestone.date && (
                      <span className="text-[10px] text-text-muted font-mono hidden md:inline">
                        {milestone.date}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* University Remarks & Candidate Notes */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-purple" />
            <span>{lang === "ar" ? "ملاحظات وتحديثات الجامعة (University Remarks) :" : "Retours & Notes du Bureau des Admissions :"}</span>
          </label>
          <textarea
            rows={2}
            value={universityNotes}
            onChange={(e) => setUniversityNotes(e.target.value)}
            placeholder={
              lang === "ar"
                ? "سجل هنا أي رسالة وصلتك من الأستاذ المشرف، أو طلب لتعديل وثيقة، أو موعد المقابلة..."
                : "Notez ici tout message de l'université, demande de document complémentaire, date d'entretien..."
            }
            className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border-glass">
          <div className="text-xs text-text-muted flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan" />
            <span>{lang === "ar" ? "يتم حفظ التحديثات تلقائياً ومزامنتها مع ملفك." : "Toutes les étapes sont sauvegardées et synchronisées."}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl glass hover:bg-white/10 text-xs sm:text-sm font-semibold text-text-secondary transition-colors cursor-pointer"
            >
              {lang === "ar" ? "إلغاء" : "Fermer"}
            </button>
            <button
              onClick={handleSaveAll}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl btn-gradient text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{lang === "ar" ? "حفظ التحديثات" : "Enregistrer la Traçabilité"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
