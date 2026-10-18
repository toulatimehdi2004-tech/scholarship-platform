"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Globe,
  Compass,
  Building2,
  Check,
  Copy,
  ChevronDown,
  Info,
  Calendar,
  Sparkles,
} from "lucide-react";

interface VisaRequirementItem {
  id: string;
  title: string;
  titleFr?: string;
  desc: string;
  descFr?: string;
  isMandatory: boolean;
  category: "form" | "medical" | "police" | "financial" | "identity";
}

const VISA_REQUIREMENTS: VisaRequirementItem[] = [
  {
    id: "jw202",
    title: "JW201 / JW202 Visa Application Form",
    titleFr: "Formulaire Officiel JW201 ou JW202",
    desc: "Issued by the Chinese Ministry of Education and your admitting university. Contains the official red seal and electronic bar/QR code. Original + photocopy required.",
    descFr: "Délivré par le Ministère de l'Éducation Chinois et votre université d'accueil. Comporte le cachet rouge institutionnel et le code-barres officiel. Original et copie requis.",
    isMandatory: true,
    category: "form",
  },
  {
    id: "admission_notice",
    title: "Original Admission Notice / Offer Letter",
    titleFr: "Notice d'Admission Originale (Offer Letter)",
    desc: "Official letter issued by the university International Admissions Office confirming your admitted major, program duration, and student ID.",
    descFr: "Lettre d'admission officielle émise par l'Université chinoise précisant la filière, la durée des études et votre identifiant étudiant.",
    isMandatory: true,
    category: "form",
  },
  {
    id: "medical_exam",
    title: "Foreigner Physical Examination Record (外国人体格检查记录)",
    desc: "Completed at an accredited public hospital / CHU. Must include Blood tests (HIV, Syphilis, Hepatitis), Chest X-Ray, ECG, with doctor signature and hospital round seal stamped across the photo. Valid for 6 months.",
    descFr: "Effectué au CHU ou hôpital public accrédité. Comprend analyses sanguines (VIH, Syphilis, Hépatites), radiographie pulmonaire et ECG. Cachet officiel de l'hôpital obligatoire sur la photo. Valide 6 mois.",
    isMandatory: true,
    category: "medical",
  },
  {
    id: "police_certificate",
    title: "Non-Criminal Record Certificate (Casier Judiciaire)",
    desc: "Issued by National Police (Fiche Anthropométrique / Casier Judiciaire). Must be translated to English or Chinese, notarized and Apostilled/Legalized.",
    descFr: "Délivré par la DGSN / Ministère de la Justice (Fiche Anthropométrique ou Casier Judiciaire). Traduit assermenté en anglais ou chinois et légalisé (Apostille).",
    isMandatory: true,
    category: "police",
  },
  {
    id: "passport",
    title: "Valid Passport (Passeport en cours de validité)",
    desc: "Must have at least 6 months remaining validity beyond your planned stay, with at least 2 blank visa pages, plus photocopies of biographical data pages.",
    descFr: "Doit comporter au moins 6 mois de validité restante au-delà de la durée du séjour, au moins 2 pages de visa vierges, et copies de la page d'identité.",
    isMandatory: true,
    category: "identity",
  },
  {
    id: "photos",
    title: "Standard Chinese Visa Photos (2 Photos d'Identité)",
    desc: "Color photos, size 33mm × 48mm, taken within 6 months, white background, neutral expression, no glasses or jewelry.",
    descFr: "Format 33 mm × 48 mm sur fond blanc pur, prises il y a moins de 6 mois, tête nue sans lunettes ni reflets.",
    isMandatory: true,
    category: "identity",
  },
  {
    id: "financial_proof",
    title: "Financial Guarantee / CSC Scholarship Award Certificate",
    desc: "CSC scholarship award certificate / Provincial waiver certificate, OR bank statement showing proof of financial capability (minimum equivalent to $2,500 – $5,000 USD).",
    descFr: "Attestation d'attribution de bourse CSC / Gouvernementale, ou relevé bancaire récent attestant des ressources financières (équivalent min. 25 000 à 50 000 DH).",
    isMandatory: true,
    category: "financial",
  },
];

const OFFICIAL_MOROCCO_VISA_PORTALS = [
  {
    id: "appointment",
    title: "1. Prendre Rendez-vous en Ligne (COVA)",
    subtitle: "China Online Visa Application & Appointment System",
    url: "https://consular.mfa.gov.cn/VISA/",
    badge: "Lien Officiel Rendez-vous",
    desc: "Le seul site officiel pour les Marocains : remplissez le formulaire de visa étudiant et réservez votre date de rendez-vous (choisir « Morocco » puis « Ambassade à Rabat »).",
    buttonText: "Prendre Rendez-vous (COVA)",
    isPrimary: true,
  },
  {
    id: "visa-page",
    title: "2. Page Officielle du Visa (Ambassade à Rabat)",
    subtitle: "Section Consulaire — Ambassade de Chine au Maroc",
    url: "http://ma.china-embassy.gov.cn/fra/lsfw/lsb/qzyw/",
    badge: "Consignes Officielles Visa",
    desc: "Page officielle de l'Ambassade de Chine à Rabat : liste des pièces à fournir, frais consulaires et dépôt physique au 16, Avenue Ahmed Balafrej, Souissi.",
    buttonText: "Page Officielle du Visa",
    isPrimary: false,
  },
];

export default function StudentVisaProcessCard() {
  const [activeVisaType, setActiveVisaType] = useState<"X1" | "X2">("X1");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Load saved checklist from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("scholar_china_visa_checklist");
      if (saved) {
        try {
          setCheckedItems(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  const toggleCheck = (id: string) => {
    const updated = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(updated);
    try {
      localStorage.setItem("scholar_china_visa_checklist", JSON.stringify(updated));
    } catch {}
  };

  const handleCopyLink = async (url: string) => {
    if (typeof window !== "undefined" && navigator?.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2500);
    }
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = VISA_REQUIREMENTS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="glass rounded-3xl p-6 sm:p-8 border border-border-glass shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-black text-text-primary">
                Chinese Student Visa (X1 / X2) Guide
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                Portail Officiel Maroc (COVA)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Comprehensive requirements, mandatory document checklist, and verified submission links.
            </p>
          </div>
        </div>

        {/* Visa Type Selector */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveVisaType("X1")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeVisaType === "X1"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Visa X1 (&gt; 180 Days)
          </button>
          <button
            onClick={() => setActiveVisaType("X2")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeVisaType === "X2"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Visa X2 (≤ 180 Days)
          </button>
        </div>
      </div>

      {/* Visa Type Clarification Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-blue-50/90 dark:bg-gradient-to-r dark:from-blue-900/30 dark:via-slate-900/50 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-500/30 relative z-10 shadow-sm dark:shadow-none">
        {activeVisaType === "X1" ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan" />
              <span>X1 Visa: Long-Term Degree & 1-Year Language Programs</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-text-secondary leading-relaxed">
              Issued for Bachelor (4 yrs), Master (2-3 yrs), PhD (3-4 yrs), or 1-year Mandarin courses.
              <strong className="text-slate-900 dark:text-text-primary ml-1">
                Crucial Rule:
              </strong>{" "}
              The X1 sticker is valid for entry within 30 days. Within 30 days of entering China, you{" "}
              <span className="text-amber-600 dark:text-amber-400 font-semibold">MUST</span> convert it into a{" "}
              <strong className="text-blue-700 dark:text-cyan">Foreigner Residence Permit (居留许可)</strong> with your university at the local PSB Entry-Exit Bureau.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>X2 Visa: Short-Term Exchange & Single-Semester Programs</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-text-secondary leading-relaxed">
              Issued for programs of 180 days or less (1 semester exchange, summer school, short-term research).
              It specifies the exact number of permitted days in China and does not need conversion to a residence permit.
            </p>
          </div>
        )}
      </div>

      {/* Checklist Progress Bar */}
      <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 relative z-10 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="flex items-center gap-2 text-slate-900 dark:text-text-primary">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Visa Readiness Progress</span>
          </span>
          <span className="text-blue-600 dark:text-cyan font-bold">
            {completedCount} / {totalCount} Requirements Ready ({progressPercent}%)
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Document Requirements Grid */}
      <div className="mb-8 relative z-10">
        <h4 className="text-sm font-bold text-slate-900 dark:text-text-primary mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-cyan" />
          <span>7 Mandatory Documents Required for Submission</span>
        </h4>
        <div className="space-y-2.5">
          {VISA_REQUIREMENTS.map((req) => {
            const isChecked = Boolean(checkedItems[req.id]);
            return (
              <div
                key={req.id}
                onClick={() => toggleCheck(req.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                  isChecked
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40 text-slate-900 dark:text-text-primary shadow-sm dark:shadow-none"
                    : "bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.05] border-slate-200 dark:border-white/10 text-slate-700 dark:text-text-secondary shadow-sm dark:shadow-none"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all ${
                    isChecked
                      ? "bg-emerald-500 border-emerald-400 text-white"
                      : "bg-slate-100 dark:bg-white/5 border-slate-300 dark:border-white/20 text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isChecked ? "line-through text-slate-400 dark:text-text-muted" : "text-slate-900 dark:text-text-primary"
                      }`}
                    >
                      {req.title}
                    </span>
                    {req.isMandatory && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30">
                        Obligatoire
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-text-muted mt-1 leading-relaxed">
                    {req.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official 2 Links for Moroccans */}
      <div className="relative z-10 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-text-primary mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-cyan" />
            <span>Liens Officiels Visa Chine — Maroc (2 Liens Uniques)</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-text-muted">
            Les deux seuls liens officiels nécessaires pour votre visa d&apos;études en Chine depuis le Maroc : la prise de rendez-vous en ligne et les consignes officielles de l&apos;Ambassade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFICIAL_MOROCCO_VISA_PORTALS.map((portal) => (
            <div
              key={portal.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                portal.isPrimary
                  ? "bg-white dark:bg-gradient-to-br dark:from-blue-950/40 dark:via-slate-900/60 dark:to-blue-900/30 border-blue-200 dark:border-blue-500/40 shadow-md dark:shadow-xl dark:shadow-blue-500/10"
                  : "bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500/30 shadow-md dark:shadow-none"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                      portal.isPrimary
                        ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-cyan dark:border-blue-500/40"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30"
                    }`}
                  >
                    {portal.badge}
                  </span>
                </div>
                <h5 className="text-sm sm:text-base font-bold text-slate-900 dark:text-text-primary">
                  {portal.title}
                </h5>
                <p className="text-xs text-blue-600 dark:text-cyan font-medium mt-0.5">{portal.subtitle}</p>
                <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed mt-2.5">
                  {portal.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2">
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    portal.isPrimary
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                  }`}
                >
                  <span>{portal.buttonText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleCopyLink(portal.url)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-white/10"
                  title="Copier le lien"
                >
                  {copiedUrl === portal.url ? (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Copié
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips Footer */}
      <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed flex items-start gap-3 relative z-10 shadow-sm dark:shadow-none">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-950 dark:text-amber-300">Crucial Traveler Notice:</strong> Keep your physical JW201/JW202 form and original Admission Notice in your carry-on bag when boarding your flight to China. Border Immigration Officers at Beijing, Shanghai, and Guangzhou airports will ask to inspect them upon arrival!
        </div>
      </div>
    </div>
  );
}
