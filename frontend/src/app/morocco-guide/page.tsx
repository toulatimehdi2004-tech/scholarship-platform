"use client";

import { motion } from "framer-motion";
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Building,
  HelpCircle,
  Copy,
  Check,
  ArrowRight,
  AlertTriangle,
  FileCheck,
  GraduationCap,
  Banknote,
  Stamp,
  Globe2,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/StudentSidebar";

interface Step {
  number: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: any;
  description: string;
  keyPoints: string[];
  links?: { label: string; url: string }[];
  warning?: string;
}

const MOROCCO_STEPS: Step[] = [
  {
    number: "01",
    title: "Traduction Assermentée des Diplômes",
    subtitle: "Baccalauréat, Licences & Relevés de Notes",
    badge: "Indispensable",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: FileText,
    description: "Les universités chinoises et le portail CSC n'acceptent que l'Anglais ou le Chinois. Vos documents officiels marocains (en Français ou Arabe) doivent être traduits par un traducteur assermenté agréé près les cours de justice du Royaume du Maroc.",
    keyPoints: [
      "Traduisez : Baccalauréat original, Relevés de notes de toutes les années (lycée ou fac), Attestations de réussite.",
      "Demandez au traducteur de certifier la conformité de la traduction avec un cachet bilingue.",
      "Conservez toujours les originaux papier intacts ; pour la candidature en ligne, seuls les scans haute résolution (300 DPI) sont requis.",
    ],
  },
  {
    number: "02",
    title: "L'Apostille Maroc (Convention de La Haye)",
    subtitle: "Zéro déplacement à l'Ambassade de Chine à Rabat !",
    badge: "Mise à jour 2024–2026",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: Stamp,
    description: "Depuis le 7 novembre 2023, la République Populaire de Chine applique officiellement la Convention de La Haye sur l'Apostille avec le Maroc. L'ancienne procédure longue et coûteuse (légalisation aux Affaires Étrangères puis file d'attente à l'Ambassade de Chine à Rabat) est DÉFINITIVEMENT TERMINÉE.",
    keyPoints: [
      "Rendez-vous sur le portail officiel marocain : apostille.ma.",
      "Déposez votre demande pour chaque document traduit auprès du Tribunal de Première Instance de votre ville.",
      "Coût minime : uniquement le timbre fiscal légal (environ 20 DH par document).",
      "Le certificat d'Apostille officiel est reconnu directement par toutes les universités chinoises et les consulats.",
    ],
    links: [
      { label: "Portail Officiel Apostille Maroc (apostille.ma)", url: "https://www.apostille.ma" },
    ],
    warning: "Méfiez-vous des agences qui vous réclament encore des milliers de dirhams pour de 'fausses légalisations consulaires'. L'apostille se fait au tribunal de votre propre ville.",
  },
  {
    number: "03",
    title: "Casier Judiciaire & Fiche Anthropométrique",
    subtitle: "Certificat de non-condamnation (Non-Criminal Record)",
    badge: "Exigence Sécuritaire",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: ShieldCheck,
    description: "Toutes les universités en Chine exigent un certificat de casier judiciaire vierge datant de moins de 6 mois pour délivrer l'autorisation d'études et le formulaire de visa d'État (JW202 / DQ).",
    keyPoints: [
      "Obtenez le Bulletin N°3 en ligne sur casierjudiciaire.justice.gov.ma ou retirez la fiche anthropométrique auprès du commissariat de police de votre ville.",
      "Faites traduire le casier judiciaire en Anglais par votre traducteur assermenté.",
      "Faites apostiller la traduction sur apostille.ma au Tribunal de Première Instance.",
    ],
    links: [
      { label: "Demande en ligne du Casier Judiciaire (Ministère de la Justice)", url: "https://casierjudiciaire.justice.gov.ma" },
    ],
  },
  {
    number: "04",
    title: "Candidature Bourse : Type A vs Type B",
    subtitle: "Comprendre les deux voies officielles pour ne rien rater",
    badge: "Stratégie d'Admission",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: GraduationCap,
    description: "Il existe deux canaux distincts pour décrocher la bourse d'État chinoise (CSC) depuis le Maroc. Beaucoup d'étudiants échouent car ils confondent les deux procédures :",
    keyPoints: [
      "Type A (Programme Bilatéral Maroc-Chine) : Géré par le Ministère marocain de l'Enseignement Supérieur (mabourse.enssup.gov.ma) et l'Ambassade de Chine à Rabat. Code Agence : 5041. Date limite : généralement fin janvier / début février.",
      "Type B (Programme Universitaire Direct) : Vous postulez directement sur le portail de l'université chinoise de votre choix avec son propre Agency Number à 5 chiffres (ex: 10614, 10335). Date limite : généralement entre mars et avril.",
      "Conseil d'expert : Vous pouvez postuler à la fois en Type A et en Type B pour doubler vos chances d'acceptation !",
    ],
    links: [
      { label: "Portail Mabourse Maroc (Enssup)", url: "https://mabourse.enssup.gov.ma" },
      { label: "Portail Officiel CSC CampusChina", url: "https://studyinchina.csc.edu.cn" },
    ],
  },
  {
    number: "05",
    title: "Dotation Scolarité & Finances (Office des Changes)",
    subtitle: "Transfert d'argent légal du Maroc vers la Chine",
    badge: "Finances & Banques",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    icon: Banknote,
    description: "Une fois votre lettre d'admission et votre formulaire de visa JW202/DQ reçus, vos parents ou vous-même avez droit à la dotation légale pour études à l'étranger auprès de n'importe quelle banque marocaine.",
    keyPoints: [
      "Présentez à votre banque marocaine : Passeport avec visa X1, Lettre d'admission originale, Formulaire JW202, Attestation de bourse si boursier.",
      "La dotation pour études de l'Office des Changes permet de transférer légalement les frais d'installation et de subsistance sans blocage.",
      "À l'arrivée en Chine, les boursiers CSC reçoivent une carte bancaire chinoise locale (Bank of China ou ICBC) sur laquelle le gouvernement verse mensuellement l'allocation (2 500 à 3 500 RMB / mois).",
    ],
  },
];

const RED_FLAGS_AGENCIES = [
  {
    title: "« Bourse 100% Garantie sans condition »",
    description: "Mensonge absolu. Seul le comité officiel du China Scholarship Council (CSC) et le doyen de l'université chinoise peuvent octroyer une bourse. Aucune agence privée ne possède de quota magique.",
  },
  {
    title: "Confiscation des identifiants (E-mail et mot de passe)",
    description: "L'agence refuse de vous donner les accès au portail universitaire pour vous empêcher de voir ce qui s'y passe réellement ou pour vous réclamer une rançon au moment du visa.",
  },
  {
    title: "Tarifs exorbitants (20 000 à 50 000 DH)",
    description: "Le portail officiel du gouvernement chinois est 100% gratuit (0 DH). Les seuls frais réels au Maroc sont vos traductions, les timbres d'apostille (~20 DH) et votre visite médicale.",
  },
  {
    title: "Faux documents d'admission avec faux tampons",
    description: "Certaines fausses agences impriment des lettres photoshopées. Vérifiez toujours votre admission en écrivant directement au Bureau des Étudiants Internationaux (ISO) avec l'adresse officielle .edu.cn.",
  },
];

export default function MoroccoGuidePage() {
  const [copiedLink, setCopiedLink] = useState(false);

  const copyCurrentUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100">
      <StudentSidebar activeTab="documents" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <Globe2 className="w-3.5 h-3.5" />
              Guide Spécial Étudiants Marocains • Maroc ➔ Chine 🇲🇦 ➔ 🇨🇳
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Démarches Administratives & Apostille Maroc
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Le guide complet et transparent pour postuler aux bourses chinoises en direct, sans intermédiaire et sans tomber dans les pièges des fausses agences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/medical-guide"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              Guide Visite Médicale
            </Link>
            <button
              onClick={copyCurrentUrl}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? "Lien copié !" : "Partager le Guide"}
            </button>
          </div>
        </div>

        {/* Major Highlight: Apostille Convention */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
              <Stamp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Révolution Administrative : La Chine a adhéré à la Convention de La Haye
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  ACTIF
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Depuis le 7 novembre 2023, <strong>vous n'avez plus besoin d'aller à l'Ambassade de Chine à Rabat</strong> pour légaliser vos diplômes. L'Apostille marocaine officielle délivrée par le Tribunal de Première Instance de votre ville via <strong>apostille.ma</strong> est juridiquement reconnue partout en Chine !
              </p>
            </div>
          </div>
        </div>

        {/* 5 Sequential Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Les 5 Étapes Légales pour l'Étudiant Marocain
            </h3>
            <span className="text-xs text-slate-400">Suivez l'ordre chronologique</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {MOROCCO_STEPS.map((step) => {
              const IconComp = step.icon;
              return (
                <div
                  key={step.number}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 text-emerald-400 font-black text-sm flex items-center justify-center shrink-0">
                        {step.number}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{step.title}</h4>
                        <p className="text-xs text-slate-400">{step.subtitle}</p>
                      </div>
                    </div>

                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border self-start sm:self-auto ${step.badgeColor}`}>
                      {step.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>

                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Points Clés & Instructions :
                    </div>
                    <ul className="space-y-1.5">
                      {step.keyPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {step.warning && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{step.warning}</span>
                    </div>
                  )}

                  {step.links && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {step.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Anti-Agency Fraud Shield Section */}
        <div className="p-6 rounded-3xl bg-red-950/20 border border-red-500/40 shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Bouclier Anti-Arnaque : Comment repérer les fausses agences au Maroc
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Chaque année, des dizaines d'étudiants marocains perdent leurs économies auprès d'intermédiaires frauduleux. Voici les signaux d'alerte qui ne trompent pas :
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RED_FLAGS_AGENCIES.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/90 border border-red-500/20 space-y-1.5"
              >
                <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {item.title}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
            <span>
              Besoin de vérifier une université ou son code officiel ? Utilisez directement notre moteur de recherche gratuit.
            </span>
            <Link
              href="/scholarships"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shrink-0 inline-flex items-center gap-1.5"
            >
              Rechercher une Bourse <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
