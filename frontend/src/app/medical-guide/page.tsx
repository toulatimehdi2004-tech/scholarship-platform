"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Activity,
  Calendar,
  Info,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Copy,
  Check,
  BadgeAlert,
  Sparkles,
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/StudentSidebar";

interface CheckItem {
  id: string;
  category: "form" | "doctor" | "labs" | "validity";
  label: string;
  detail: string;
  required: boolean;
}

const CHECKLIST_ITEMS: CheckItem[] = [
  {
    id: "stamp_photo",
    category: "doctor",
    label: "Tampon officiel rond de l'hôpital chevauchant la photo d'identité",
    detail: "Le cachet rond de l'hôpital ou du médecin DOIT obligatoirement mordre à la fois sur la photo d'identité et sur le papier en haut de la page 1. Sans ce chevauchement, le formulaire est rejeté immédiatement.",
    required: true,
  },
  {
    id: "bilingual_form",
    category: "form",
    label: "Formulaire standard officiel bilingue (Anglais / Chinois)",
    detail: "Ne pas utiliser un certificat médical classique marocain. Il faut obligatoirement le formulaire officiel de 2 pages 'Foreigner Physical Examination Form (外国人体格检查表)'.",
    required: true,
  },
  {
    id: "blood_hiv",
    category: "labs",
    label: "Résultats sérologiques complets du laboratoire (VIH / SIDA)",
    detail: "Test de dépistage VIH négatif avec compte-rendu imprimé sur papier à en-tête du laboratoire d'analyses médicales.",
    required: true,
  },
  {
    id: "blood_syphilis",
    category: "labs",
    label: "Sérologie de la Syphilis (TPHA / VDRL)",
    detail: "Rapport d'analyses sanguines confirmant la négativité de la syphilis (obligatoire selon la loi sanitaire chinoise).",
    required: true,
  },
  {
    id: "blood_hepatitis",
    category: "labs",
    label: "Sérologie Hépatite B (Ag HBs)",
    detail: "Test de dépistage de l'antigène HBs négatif joint au dossier médical.",
    required: true,
  },
  {
    id: "chest_xray",
    category: "labs",
    label: "Rapport de Radiographie Pulmonaire (Chest X-Ray) joint",
    detail: "Compte-rendu signé par le radiologue marocain (concluant à l'absence de tuberculose active ou d'anomalie cardio-pulmonaire). Joindre le compte-rendu papier.",
    required: true,
  },
  {
    id: "ecg_report",
    category: "labs",
    label: "Tracé ou rapport d'Électrocardiogramme (ECG)",
    detail: "Compte-rendu ECG normal signé par le médecin ou cardiologue, joint au formulaire.",
    required: true,
  },
  {
    id: "doctor_signature",
    category: "doctor",
    label: "Signature manuscrite du médecin et conclusion 'Healthy'",
    detail: "En bas de la page 2, le médecin doit obligatoirement cocher ou écrire que le candidat est en bonne santé ('Healthy / Normal') et signer de manière manuscrite.",
    required: true,
  },
  {
    id: "hospital_stamp_page2",
    category: "doctor",
    label: "Cachet officiel de l'hôpital en bas de la page 2",
    detail: "Le tampon rond de l'établissement hospitalier ou de la clinique doit être apposé à côté de la signature du médecin avec la date de la visite.",
    required: true,
  },
  {
    id: "validity_window",
    category: "validity",
    label: "Date de consultation dans la fenêtre des 6 mois (180 jours)",
    detail: "Les autorités chinoises n'acceptent les examens que s'ils datent de moins de 6 mois au moment de la demande de visa d'études X1 (généralement entre juillet et août).",
    required: true,
  },
];

export default function MedicalGuidePage() {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [examDate, setExamDate] = useState<string>("");
  const [showDoctorNoticeModal, setShowDoctorNoticeModal] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const progress = useMemo(() => {
    return Math.round((checkedIds.length / CHECKLIST_ITEMS.length) * 100);
  }, [checkedIds]);

  // Validity calculation
  const validityInfo = useMemo(() => {
    if (!examDate) return null;
    const date = new Date(examDate);
    if (isNaN(date.getTime())) return null;

    const expiryDate = new Date(date);
    expiryDate.setDate(expiryDate.getDate() + 180);

    const now = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      expiryDate: expiryDate.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      daysLeft,
      isExpired: daysLeft <= 0,
      isClose: daysLeft > 0 && daysLeft < 30,
    };
  }, [examDate]);

  const doctorInstructionsText = `NOTE IMPORTANTE À L'ATTENTION DU MÉDECIN EXAMINATEUR ET DU LABORATOIRE
Objet : Formulaire d'examen médical pour étudiant étranger postulant en Chine (Foreigner Physical Examination Record - 外国人体格检查表)

Conformément à la réglementation sanitaire stricte du Ministère de l'Éducation Chinois (CSC / MoE) et de l'Administration des Entrées-Sorties :

1. TAMPON CHEVAUCHANT LA PHOTO (Page 1) :
Le cachet officiel de l'hôpital/dispensaire DOIT impérativement mordre sur le bord de la photo d'identité collée sur le formulaire. Tout document sans tampon sur la photo est automatiquement rejeté sans instruction.

2. ATTACHEMENTS OBLIGATOIRES DU LABORATOIRE D'ANALYSES :
Le formulaire seul ne suffit pas. L'étudiant doit impérativement joindre :
- Sérologie VIH (HIV) négative sur papier à en-tête du laboratoire.
- Sérologie Syphilis (TPHA / VDRL) négative sur papier à en-tête.
- Sérologie Hépatite B (Ag HBs) sur papier à en-tête.
- Compte-rendu de Radiographie Pulmonaire (Chest X-Ray) concluant à l'absence de pathologie évolutive.
- Compte-rendu d'Électrocardiogramme (ECG) normal.

3. VALIDATION EN BAS DE PAGE 2 :
- Cocher les cases d'absence de contre-indication.
- Mentionner expressément en conclusion : "Healthy / Normal".
- Date de l'examen, Signature manuscrite et Cachet rond de l'établissement.

Durée de validité du document : 6 mois (180 jours) à compter de la date de signature.`;

  const copyDoctorNotice = () => {
    navigator.clipboard.writeText(doctorInstructionsText);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100">
      <StudentSidebar activeTab="documents" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              Procédure Médicale Officielle CSC & Visas Chine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Guide & Validateur de la Visite Médicale
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Évitez le motif de rejet n°1 des universités chinoises au Maroc : formulaires mal tamponnés, analyses oubliées ou expiration des 6 mois.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowDoctorNoticeModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              Fiche pour mon Médecin
            </button>
            <a
              href="https://www.campuschina.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger Formulaire Officiel (PDF)
            </a>
          </div>
        </div>

        {/* Big Alert Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Attention : Le piège du tampon sur la photo !
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                  CRITIQUE
                </span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Au Maroc, beaucoup de médecins apposent le cachet en bas de page sans tamponner la photo d'identité. Pour la Chine, le tampon de l'hôpital <strong>DOIT OBLIGATOIREMENT chevaucher le bord de votre photo</strong> collée en haut à droite de la page 1. Sans ce détail, votre candidature est automatiquement invalidée.
              </p>
            </div>
          </div>
        </div>

        {/* 180 Days Validity Calculator Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Calculateur de Validité (Fenêtre des 180 Jours)</h3>
                <p className="text-xs text-slate-400">
                  La visite médicale n'est valable que 6 mois. Ne la faites pas trop tôt (avant janvier/février) si votre rentrée est en septembre.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-300 font-semibold whitespace-nowrap">
                Date de la visite :
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {validityInfo && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[10px] uppercase font-bold text-slate-400">Date d'Expiration</div>
                <div className="text-sm font-black text-white mt-0.5">{validityInfo.expiryDate}</div>
                <div className="text-[11px] text-slate-400">Exactement 180 jours après consultation</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[10px] uppercase font-bold text-slate-400">Jours Restants</div>
                <div
                  className={`text-sm font-black mt-0.5 ${
                    validityInfo.isExpired
                      ? "text-red-400"
                      : validityInfo.isClose
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {validityInfo.isExpired
                    ? "Expiré !"
                    : `${validityInfo.daysLeft} jours valides`}
                </div>
                <div className="text-[11px] text-slate-400">
                  {validityInfo.isExpired
                    ? "Vous devez refaire la visite médicale"
                    : "Suffisant pour le visa X1 d'été"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[10px] uppercase font-bold text-slate-400">Période Recommandée</div>
                <div className="text-sm font-black text-cyan-400 mt-0.5">Fin Janvier ➔ Fin Mars</div>
                <div className="text-[11px] text-slate-400">Couvre la sélection et le visa jusqu'en août</div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Pre-Submission Checklist */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Checklist de Conformité Pré-Téléversement</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                  {checkedIds.length} / {CHECKLIST_ITEMS.length} validés
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cochez chaque élément en inspectant vos scans médicaux avant de soumettre sur le portail CSC ou de l'université.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-48 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Taux de conformité</span>
                <span className="text-emerald-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {CHECKLIST_ITEMS.map((item, idx) => {
              const isChecked = checkedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isChecked
                      ? "bg-emerald-950/20 border-emerald-500/50 text-white"
                      : "bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isChecked
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 border border-slate-600 text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-bold flex items-center gap-2">
                      <span className={isChecked ? "text-white" : "text-slate-200"}>
                        {item.label}
                      </span>
                      {item.required && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                          Exigé
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {progress === 100 && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h5 className="text-sm font-bold text-white">Dossier médical 100% conforme aux normes CSC !</h5>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Vos documents respectent scrupuleusement la réglementation sanitaire chinoise. Vous pouvez les fusionner en un seul PDF propre et lisible pour votre candidature.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FAQ & Pro-Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Où faire cette visite au Maroc ?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vous pouvez effectuer la visite soit dans un <strong>hôpital public</strong> (centre hospitalier provincial / régional), soit en <strong>clinique privée / dispensaire agréé</strong>. Le plus important n'est pas le prestige de l'établissement, mais la présence du tampon rond officiel, de la signature manuscrite du médecin, et de la radio pulmonaire + bilans de sang joints.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Faut-il faire l'Apostille sur la visite médicale ?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Non, pas pour la candidature en ligne !</strong> Les universités chinoises et le portail CSC demandent uniquement les scans originaux tamponnés et signés. L'Apostille est réservée à vos diplômes, relevés de notes et casier judiciaire. Ne gaspillez ni temps ni argent à apostiller votre visite médicale.
            </p>
          </div>
        </div>

        {/* Modal: Notice Imprimable pour le Médecin */}
        {showDoctorNoticeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Instructions pour votre Médecin au Maroc</h3>
                </div>
                <button
                  onClick={() => setShowDoctorNoticeModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Copiez ou imprimez cette note d'instructions et présentez-la au médecin et au laboratoire d'analyses au Maroc pour garantir qu'aucune mention obligatoire ne soit omise.
              </p>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto font-mono">
                {doctorInstructionsText}
              </pre>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={copyDoctorNotice}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-950/40"
                >
                  {copiedNotice ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedNotice ? "Copié dans le presse-papier !" : "Copier le texte"}
                </button>
                <button
                  onClick={() => setShowDoctorNoticeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
