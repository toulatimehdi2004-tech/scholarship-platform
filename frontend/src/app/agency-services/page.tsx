"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Download,
  Plane,
  HeartHandshake,
  CreditCard,
  GraduationCap,
  Users,
  Award,
  Compass,
  Send,
  ExternalLink,
  Printer,
  ChevronRight,
  Globe2,
  DollarSign,
  Briefcase,
  Layers,
  UtensilsCrossed,
  Languages,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import SmartBack from "@/components/SmartBack";
import { useLang } from "@/lib/i18n";
import AuthGateModal from "@/components/AuthGateModal";

export default function AgencyServicesPage() {
  const { t } = useLang();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const [activeTab, setActiveTab] = useState<
    "desks" | "packs" | "toolkit" | "muslim-life" | "mentors" | "calculator"
  >("desks");

  // Appointment Booking State
  const [selectedBranch, setSelectedBranch] = useState("casablanca");
  const [appointmentType, setAppointmentType] = useState<"in_person" | "online">("in_person");
  const [consultationTopic, setConsultationTopic] = useState("csc_audit");
  const [appointmentDate, setAppointmentDate] = useState("2026-10-15");
  const [appointmentSlot, setAppointmentSlot] = useState("10:30");
  const [candidateName, setCandidateName] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [candidateCity, setCandidateCity] = useState("Casablanca");
  const [candidateDegree, setCandidateDegree] = useState("Baccalaureate (Lycée)");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingTicketId, setBookingTicketId] = useState("");

  // Calculator State
  const [calcDegree, setCalcDegree] = useState<"bachelor" | "master" | "phd">("master");
  const [calcCityTier, setCalcCityTier] = useState<"tier1" | "tier2">("tier1");

  // Booking submit handler
  function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!candidateName.trim() || !candidatePhone.trim()) return;
    const ticket = `MA-CN-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingTicketId(ticket);
    setBookingConfirmed(true);
  }

  // Branch data
  const branches = [
    {
      id: "casablanca",
      city: "Casablanca (Siège National)",
      address: "84 Boulevard d'Anfa, 5ème Étage (Angle Bd Moulay Youssef)",
      landmark: "À 200m du Twin Center & Consulat Général",
      hours: "Lundi - Samedi : 09h00 - 18h30",
      phone: "+212 5 22 48 90 12",
      whatsapp: "+212 6 61 89 45 23",
      email: "contact.casa@moroccanscholar.ma",
      badge: "Siège Principal • Pôle Traductions Assermentées",
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400",
      activeAppointments: "28 RDV disponibles cette semaine",
    },
    {
      id: "rabat",
      city: "Rabat (Pôle Diplomatique & Consulaire)",
      address: "22 Avenue Fal Ould Oumeir, Agdal",
      landmark: "À 5 minutes de l'Ambassade de Chine et du MAEC (Affaires Étrangères)",
      hours: "Lundi - Samedi : 09h00 - 18h30",
      phone: "+212 5 37 77 14 85",
      whatsapp: "+212 6 62 14 58 79",
      email: "rabat@moroccanscholar.ma",
      badge: "Pôle Visas & Légalisation Ministère Affaires Étrangères",
      color: "from-cyan/20 to-blue/20 border-cyan/40 text-cyan",
      activeAppointments: "19 RDV disponibles cette semaine",
    },
    {
      id: "marrakech",
      city: "Marrakech (Pôle Sud & Tensift)",
      address: "114 Boulevard Mohammed V, Guéliz",
      landmark: "Centre d'Affaires Guéliz, proche de la Gare ONCF",
      hours: "Lundi - Vendredi : 09h00 - 18h00 | Samedi : 09h00 - 13h00",
      phone: "+212 5 24 43 21 09",
      whatsapp: "+212 6 63 98 74 12",
      email: "marrakech@moroccanscholar.ma",
      badge: "Antenne Régionale Sud & Étudiants Universités Cadi Ayyad",
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400",
      activeAppointments: "14 RDV disponibles cette semaine",
    },
    {
      id: "china_desk",
      city: "Chine (Antenne Locale d'Accueil & Conciergerie)",
      address: "Chaoyang District, Beijing & Tianhe District, Guangzhou",
      landmark: "Équipe marocaine résidente sur place pour l'accueil aéroport et universités",
      hours: "7j / 7 : Permanence 24h/24 pour arrivées d'étudiants marocains",
      phone: "+86 10 8532 9901",
      whatsapp: "+212 6 61 89 45 23",
      email: "welcome.china@moroccanscholar.ma",
      badge: "Accueil Aéroport • ICBC • Dortoirs • Permis PSB",
      color: "from-purple/20 to-pink-500/20 border-purple/40 text-purple",
      activeAppointments: "Assistance sur place 24/7",
    },
  ];

  // Service Packs
  const packs = [
    {
      id: "pack_free",
      name: "Pack Autonomie & Audit CSC",
      priceMAD: "0 MAD",
      priceRMB: "0 RMB",
      badge: "100% Gratuit & Libre d'Accès",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      desc: "Idéal pour les étudiants marocains autonomes souhaitant préparer eux-mêmes leur dossier CSC Type B.",
      features: [
        "Accès complet aux 401 bourses & 102 universités chinoises",
        "Codes d'agences CSC officiels avec copie 1-clic",
        "Guide des 10 documents assermentés marocains",
        "Téléchargement du formulaire médical officiel chinois",
        "Roadmap de candidature en 6 étapes",
        "Recherche de bourses par niveau d'études marocain",
      ],
      btnText: "Accéder au Moteur de Bourses",
      btnHref: "/scholarships",
      popular: false,
    },
    {
      id: "pack_pro",
      name: "Pack Accompagnement & Légalisation",
      priceMAD: "2,900 MAD",
      priceRMB: "≈ 2,050 RMB",
      badge: "Le Plus Populaire au Maroc 🇲🇦",
      badgeClass: "bg-cyan/20 text-cyan border-cyan/40",
      desc: "Prise en charge professionnelle complète de votre dossier académique et des démarches consulaires au Maroc.",
      features: [
        "Audit approfondi du dossier académique par un conseiller agréé",
        "Traduction assermentée arabe/français vers anglais/chinois (jusqu'à 5 pièces officielles)",
        "Assistance au circuit de légalisation : Ministère Justice & MAEC Rabat",
        "Rédaction et optimisation de votre Study Plan & Lettre de motivation selon normes CSC",
        "Revue des 2 lettres de recommandation de professeurs marocains",
        "Création et validation sans faute du compte portail CSC Type B",
        "Prise de rendez-vous en cabinet physique (Casablanca / Rabat / Marrakech)",
      ],
      btnText: "Réserver ce Pack en Agence",
      btnHref: "#booking",
      popular: true,
    },
    {
      id: "pack_vip",
      name: "Pack VIP All-Inclusive Chine",
      priceMAD: "6,900 MAD",
      priceRMB: "≈ 4,890 RMB",
      badge: "Garantie Totale de A à Z 🏆",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      desc: "Accompagnement intégral au Maroc ET accueil physique sur place en Chine jusqu'à votre chambre universitaire.",
      features: [
        "TOUS les services du Pack Accompagnement & Légalisation inclus",
        "Candidature prioritaire auprès de 3 universités chinoises partenaires",
        "Réception express des originaux d'admission et du formulaire officiel JW202/JW201",
        "Dossier de Visa d'Études X1 complet & simulation de l'entretien consulaire",
        "ACCUEIL PHYSIQUE À L'AÉROPORT EN CHINE (Pékin, Shanghai, Guangzhou, Chengdu, Hangzhou, Wuhan)",
        "Navette privée jusqu'au campus et assistance à l'installation en dortoir universitaire",
        "Accompagnement physique à la banque (Bank of China / ICBC) pour ouvrir un compte et recevoir l'allocation mensuelle (2,500 à 3,500 RMB)",
        "Achat de la carte SIM locale chinoise et activation de WeChat Pay / Alipay avec passeport marocain",
        "Assistance à la visite médicale de quarantaine (CIQ) & délivrance du Permis de Séjour (PSB Residence Permit)",
      ],
      btnText: "Prendre RDV Pack VIP",
      btnHref: "#booking",
      popular: false,
    },
  ];

  // Moroccan Mentors
  const mentors = [
    {
      name: "Yassine Benali",
      cityMorocco: "Casablanca",
      university: "Tsinghua University (Pékin)",
      program: "Master en Intelligence Artificielle & Génie Logiciel",
      scholarship: "Bourse Complète CSC Type B (Exemption 100% + 3,000 RMB/mois)",
      year: "2ème année Master (Promotion 2024-2027)",
      quote:
        "L'accueil à l'aéroport et l'aide à l'ouverture de compte chez ICBC ont tout changé. Aujourd'hui, je touche mes 3,000 RMB chaque mois sans aucun retard et les cantines halal sur le campus de Tsinghua sont incroyables.",
    },
    {
      name: "Salma Chraibi",
      cityMorocco: "Rabat (Agdal)",
      university: "Zhejiang University (Hangzhou)",
      program: "Doctorat (PhD) en Médecine Clinique & Pharmacologie",
      scholarship: "Bourse d'Excellence du Gouvernement Chinois (Exemption 100% + 3,500 RMB/mois)",
      year: "1ère année PhD",
      quote:
        "Passer par notre agence à Rabat m'a épargné les erreurs de légalisation au MAEC. Dès mon arrivée à Hangzhou, un tuteur m'attendait à l'aéroport avec ma carte SIM locale prête.",
    },
    {
      name: "Amine Tazi",
      cityMorocco: "Marrakech",
      university: "Fudan University (Shanghai)",
      program: "Master en Finance Internationale & Fintech",
      scholarship: "Bourse Shanghai Municipal Government + CSC",
      year: "Diplômé & Recruté en Chine",
      quote:
        "Venant de Marrakech, le contraste avec Shanghai est immense mais passionnant. Les installations universitaires et les laboratoires sont au niveau mondial. N'hésitez pas une seconde !",
    },
    {
      name: "Imane Berrada",
      cityMorocco: "Fès",
      university: "Harbin Institute of Technology (HIT)",
      program: "Bachelor en Robotique & Mécatronique",
      scholarship: "Bourse Complète HIT Presidential Fellowship",
      year: "3ème année Bachelor",
      quote:
        "HIT est classée top 5 mondial en ingénierie. Même si les hivers sont froids, les dortoirs sont chauffés à 24°C et la communauté d'étudiants marocains est soudée comme une famille.",
    },
  ];

  // Calculator computations
  const degreeMultipliers = {
    bachelor: { years: 4, monthlyStipend: 2500, tuitionPerYear: 28000, dormPerYear: 12000 },
    master: { years: 3, monthlyStipend: 3000, tuitionPerYear: 35000, dormPerYear: 14000 },
    phd: { years: 4, monthlyStipend: 3500, tuitionPerYear: 42000, dormPerYear: 16000 },
  };
  const currentCalc = degreeMultipliers[calcDegree];
  const rmbToMad = 1.41; // 1 RMB ≈ 1.41 MAD
  const totalTuitionSavedRMB = currentCalc.tuitionPerYear * currentCalc.years;
  const totalDormSavedRMB = currentCalc.dormPerYear * currentCalc.years;
  const totalCashStipendRMB = currentCalc.monthlyStipend * 12 * currentCalc.years;
  const totalScholarshipValueRMB = totalTuitionSavedRMB + totalDormSavedRMB + totalCashStipendRMB;
  const totalScholarshipValueMAD = Math.round(totalScholarshipValueRMB * rmbToMad);
  const monthlyStipendMAD = Math.round(currentCalc.monthlyStipend * rmbToMad);

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Smart Back */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <SmartBack fallback="/" label="Retour à l'accueil" />
      </motion.div>

      {/* Main Agency Header Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl p-6 sm:p-10 mb-8 border border-emerald-500/30 relative overflow-hidden bg-gradient-to-b from-[#081f15] via-[#05140e] to-[#020b07] text-white shadow-2xl shadow-emerald-500/15"
      >
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono uppercase">
              <Building2 className="w-3.5 h-3.5" />
              Cabinet d'Orientation & Bureaux Agréés au Maroc
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <span>🇲🇦 Maroc</span>
              <span>⇄</span>
              <span>🇨🇳 Chine</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Services d'Agence Physique & <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan bg-clip-text text-transparent">
              Conciergerie d'Arrivée en Chine
            </span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed max-w-3xl mb-8">
            Bien plus qu'un portail en ligne : bénéficiez d'une présence physique avec nos bureaux à{" "}
            <strong className="text-white">Casablanca (Boulevard d'Anfa)</strong>,{" "}
            <strong className="text-white">Rabat (Agdal)</strong> et{" "}
            <strong className="text-white">Marrakech (Guéliz)</strong>, ainsi que notre antenne d'accueil
            directe à Pékin et Guangzhou. De votre premier dossier jusqu'à votre chambre universitaire en Chine,
            nous vous accompagnons à chaque pas.
          </p>

          {/* Quick Counter Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-emerald-500/25">
            <div className="glass-light p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">3</span>
              <p className="text-xs text-white/70 font-medium">Bureaux Physiques au Maroc</p>
            </div>
            <div className="glass-light p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-cyan">100%</span>
              <p className="text-xs text-white/70 font-medium">Traductions Assermentées</p>
            </div>
            <div className="glass-light p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-amber-300">6 Villes</span>
              <p className="text-xs text-white/70 font-medium">Accueil Aéroport en Chine</p>
            </div>
            <div className="glass-light p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-purple">1,250+</span>
              <p className="text-xs text-white/70 font-medium">Étudiants Marocains Installés</p>
            </div>
          </div>
        </div>

        {/* Ambient radial blur in top corner */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border-glass mb-8 gap-2 overflow-x-auto pb-1">
        {[
          { id: "desks", label: "Bureaux & Prise de RDV", icon: Building2 },
          { id: "packs", label: "Packs de Services Agence", icon: Briefcase },
          { id: "toolkit", label: "Boîte à Outils Documentaire", icon: FileText },
          { id: "calculator", label: "Simulateur d'Économies Bourse", icon: DollarSign },
          { id: "muslim-life", label: "Vie Musulmane & Halal en Chine", icon: UtensilsCrossed },
          { id: "mentors", label: "Réseau Mentors Marocains", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25"
                  : "glass text-text-muted hover:text-text-primary hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: BUREAUX PHYSIQUES & PRISE DE RDV ── */}
      {activeTab === "desks" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Section Description */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">
              Rencontrez Nos Conseillers Spécialisés au Maroc
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Prenez rendez-vous en personne dans l'un de nos cabinets ou planifiez une consultation vidéo avec nos anciens boursiers.
            </p>
          </div>

          {/* 3 Physical Offices Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.slice(0, 3).map((branch) => (
              <div
                key={branch.id}
                className="glass rounded-3xl p-6 border border-border-glass flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
              >
                <div>
                  <span
                    className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border mb-3 uppercase tracking-wider ${branch.color}`}
                  >
                    {branch.badge}
                  </span>
                  <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-cyan transition-colors">
                    {branch.city}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed mb-3 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{branch.address}</span>
                  </p>
                  <p className="text-[11px] text-text-muted italic mb-4 pl-5">
                    📍 {branch.landmark}
                  </p>

                  <div className="space-y-2 pt-3 border-t border-white/10 text-xs text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan" />
                      <span>{branch.hours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{branch.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-teal-400" />
                      <span className="font-mono">WhatsApp : {branch.whatsapp}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2">
                  <a
                    href={`https://wa.me/${branch.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Bonjour, je souhaite prendre rendez-vous au bureau de ${branch.city} pour les bourses d'études en Chine.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Conseiller Direct</span>
                  </a>
                  <button
                    onClick={() => {
                      setSelectedBranch(branch.id);
                      const el = document.getElementById("booking-form");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-2.5 px-3 rounded-xl btn-gradient text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Prendre RDV en Agence</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Booking Form */}
          <div id="booking-form" className="glass rounded-3xl p-6 sm:p-10 border border-emerald-500/30">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider font-mono">
                  Réservation en Ligne
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-text-primary mt-2">
                  Planifier Votre Entretien d'Orientation
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mt-1">
                  Rencontre individuelle de 45 minutes avec un spécialiste des admissions et bourses CSC en Chine.
                </p>
              </div>

              {bookingConfirmed ? (
                <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                  <h4 className="text-2xl font-bold text-text-primary">
                    Rendez-vous Confirmé avec Succès !
                  </h4>
                  <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10 font-mono text-sm">
                    <p className="text-xs text-text-muted">Numéro de Récépissé Officiel :</p>
                    <span className="text-xl font-bold text-emerald-400 tracking-wider">
                      {bookingTicketId}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
                    Un conseiller de notre bureau de{" "}
                    <strong className="text-text-primary uppercase">
                      {branches.find((b) => b.id === selectedBranch)?.city}
                    </strong>{" "}
                    a réservé votre créneau du{" "}
                    <strong className="text-text-primary">{appointmentDate}</strong> à{" "}
                    <strong className="text-text-primary">{appointmentSlot}</strong>. Une confirmation SMS et WhatsApp a été transmise à{" "}
                    <strong className="text-text-primary">{candidatePhone}</strong>.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-2.5 rounded-xl glass hover:bg-white/10 text-xs font-bold flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4 text-cyan" />
                      <span>Imprimer le Récépissé de RDV</span>
                    </button>
                    <button
                      onClick={() => setBookingConfirmed(false)}
                      className="px-5 py-2.5 rounded-xl btn-gradient text-xs font-bold text-white"
                    >
                      <span>Prendre un Autre Rendez-vous</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookAppointment} className="space-y-6">
                  {/* Mode of Consultation */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
                      1. Modalité de Consultation
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAppointmentType("in_person")}
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          appointmentType === "in_person"
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                            : "glass text-text-muted hover:text-text-primary"
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>En Cabinet Physique (Maroc)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppointmentType("online")}
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          appointmentType === "online"
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                            : "glass text-text-muted hover:text-text-primary"
                        }`}
                      >
                        <Globe2 className="w-4 h-4" />
                        <span>Visio à Distance (Google Meet)</span>
                      </button>
                    </div>
                  </div>

                  {/* Branch Selection */}
                  {appointmentType === "in_person" && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
                        2. Sélection du Cabinet
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {branches.slice(0, 3).map((b) => (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBranch(b.id)}
                            className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                              selectedBranch === b.id
                                ? "bg-emerald-500/20 border-emerald-400 text-white shadow-md"
                                : "glass border-border-glass text-text-muted hover:border-white/20"
                            }`}
                          >
                            <p className="font-bold text-sm text-text-primary mb-1">{b.city.split("(")[0]}</p>
                            <p className="text-[11px] leading-tight text-text-muted">{b.address}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Date and Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
                        3. Date Souhaitée
                      </label>
                      <input
                        type="date"
                        required
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full glass rounded-xl px-4 py-2.5 text-xs sm:text-sm text-text-primary border border-border-glass outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
                        4. Créneau Horaire
                      </label>
                      <select
                        value={appointmentSlot}
                        onChange={(e) => setAppointmentSlot(e.target.value)}
                        className="w-full glass rounded-xl px-4 py-2.5 text-xs sm:text-sm text-text-primary border border-border-glass outline-none bg-slate-900"
                      >
                        <option value="09:30" className="bg-slate-900">09:30 - Matinée</option>
                        <option value="10:30" className="bg-slate-900">10:30 - Matinée</option>
                        <option value="11:30" className="bg-slate-900">11:30 - Matinée</option>
                        <option value="14:30" className="bg-slate-900">14:30 - Après-midi</option>
                        <option value="15:30" className="bg-slate-900">15:30 - Après-midi</option>
                        <option value="16:30" className="bg-slate-900">16:30 - Après-midi</option>
                        <option value="17:30" className="bg-slate-900">17:30 - Soirée</option>
                      </select>
                    </div>
                  </div>

                  {/* Candidate Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
                        5. Nom & Prénom du Candidat
                      </label>
                      <input
                        type="text"
                        required
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="ex: Yassine Benali"
                        className="w-full glass rounded-xl px-4 py-2.5 text-xs sm:text-sm text-text-primary border border-border-glass outline-none placeholder:text-text-muted"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
                        6. Numéro Téléphone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        value={candidatePhone}
                        onChange={(e) => setCandidatePhone(e.target.value)}
                        placeholder="ex: +212 6 XX XX XX XX"
                        className="w-full glass rounded-xl px-4 py-2.5 text-xs sm:text-sm text-text-primary border border-border-glass outline-none placeholder:text-text-muted"
                      />
                    </div>
                  </div>

                  {/* Degree & Topic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
                        7. Niveau d'Études Actuel au Maroc
                      </label>
                      <select
                        value={candidateDegree}
                        onChange={(e) => setCandidateDegree(e.target.value)}
                        className="w-full glass rounded-xl px-4 py-2.5 text-xs sm:text-sm text-text-primary border border-border-glass outline-none bg-slate-900"
                      >
                        <option value="Baccalaureate" className="bg-slate-900">Bachelier / Terminale (Lycée)</option>
                        <option value="Licence" className="bg-slate-900">Licence (Bac +3 en cours ou obtenu)</option>
                        <option value="Master" className="bg-slate-900">Master (Bac +5)</option>
                        <option value="Doctorat" className="bg-slate-900">Doctorat / Chercheur</option>
                        <option value="Langue" className="bg-slate-900">Année Préparatoire de Langue Chinoise (HSK)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
                        8. Sujet Principal de l'Entretien
                      </label>
                      <select
                        value={consultationTopic}
                        onChange={(e) => setConsultationTopic(e.target.value)}
                        className="w-full glass rounded-xl px-4 py-2.5 text-xs sm:text-sm text-text-primary border border-border-glass outline-none bg-slate-900"
                      >
                        <option value="csc_audit" className="bg-slate-900">Audit Candidature Bourse Complète CSC</option>
                        <option value="translation" className="bg-slate-900">Traduction Assermentée & Sceau Agréé</option>
                        <option value="visa_x1" className="bg-slate-900">Constitution Dossier Visa X1 (Ambassade Chine Rabat)</option>
                        <option value="pack_arrival" className="bg-slate-900">Pack Arrivée Chine (Aéroport, Banque & Dortoir)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-gradient py-4 rounded-2xl text-sm font-bold text-white shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] transition-transform"
                  >
                    <span>Valider & Réserver Mon Créneau d'Orientation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 2: PACKS DE SERVICES OFFICIELS ── */}
      {activeTab === "packs" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary mb-2">
              Packs d'Accompagnement & Tarifs Transparents
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Tarification officielle en Dirhams Marocains (MAD). Aucun coût caché, facturation claire et reçus officiels avec cachet d'agence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {packs.map((pack) => (
              <div
                key={pack.id}
                className={`glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between border relative transition-all ${
                  pack.popular
                    ? "border-emerald-500 shadow-2xl shadow-emerald-500/20 bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-900 ring-2 ring-emerald-500/30"
                    : "border-border-glass hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${pack.badgeClass}`}>
                      {pack.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                    {pack.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-400">
                      {pack.priceMAD}
                    </span>
                    <span className="text-xs text-text-muted font-mono">{pack.priceRMB}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6 pb-4 border-b border-white/10">
                    {pack.desc}
                  </p>

                  <div className="space-y-3 mb-8">
                    {pack.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-text-secondary">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={pack.btnHref === "#booking" ? "/agency-services#booking-form" : pack.btnHref}
                  onClick={() => {
                    if (pack.btnHref === "#booking") {
                      setActiveTab("desks");
                    }
                  }}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    pack.popular
                      ? "btn-gradient text-white shadow-lg shadow-emerald-500/30"
                      : "glass hover:bg-white/10 text-cyan border border-cyan/30"
                  }`}
                >
                  <span>{pack.btnText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── TAB 3: BOÎTE À OUTILS DOCUMENTAIRE & TÉLÉCHARGEMENTS ── */}
      {activeTab === "toolkit" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">
              Modèles Officiels Téléchargeables (Format Maroc 🇲🇦)
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Téléchargez gratuitement les formulaires et gabarits préformatés conformes aux exigences du China Scholarship Council et des consulats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Toolkit Item 1: Foreigner Physical Exam */}
            <div className="glass rounded-3xl p-6 border border-border-glass flex flex-col justify-between hover:border-cyan/40 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan/20 border border-cyan/40 flex items-center justify-center text-cyan mb-4">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold text-cyan bg-cyan/15 px-2.5 py-0.5 rounded-full">
                  Formulaire Médical Obligatoire
                </span>
                <h3 className="text-lg font-bold text-text-primary mt-2 mb-2">
                  Foreigner Physical Examination Record (外国人体格检查表)
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Gabarit officiel bilingue avec protocole complet pour les hôpitaux publics marocains (Radio thorax, ECG, bilan sérologique VIH/Hépatite, et règles du tampon circulaire sur la photo).
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <a
                  href={`${basePath}/templates/Foreigner_Physical_Exam_Guide_Morocco.txt`}
                  download="Foreigner_Physical_Exam_Guide_Morocco.txt"
                  className="w-full py-2.5 px-4 rounded-xl btn-gradient text-xs font-bold text-white flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le Guide Médical (PDF/TXT)</span>
                </a>
              </div>
            </div>

            {/* Toolkit Item 2: CSC Study Plan */}
            <div className="glass rounded-3xl p-6 border border-border-glass flex flex-col justify-between hover:border-purple/40 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple/20 border border-purple/40 flex items-center justify-center text-purple mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold text-purple bg-purple/15 px-2.5 py-0.5 rounded-full">
                  Projet d'Études Officiel CSC
                </span>
                <h3 className="text-lg font-bold text-text-primary mt-2 mb-2">
                  CSC Study Plan & Research Proposal (Format 800 Mots)
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Modèle structuré en 4 sections indispensables : Parcours académique marocain, Motivation pour la Chine, Plan de recherche par semestre, et contribution aux relations Maroc-Chine.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <a
                  href={`${basePath}/templates/CSC_Study_Plan_Template_Moroccan_Scholar.txt`}
                  download="CSC_Study_Plan_Template_Moroccan_Scholar.txt"
                  className="w-full py-2.5 px-4 rounded-xl btn-gradient text-xs font-bold text-white flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le Modèle Study Plan</span>
                </a>
              </div>
            </div>

            {/* Toolkit Item 3: Academic Recommendation Letter */}
            <div className="glass rounded-3xl p-6 border border-border-glass flex flex-col justify-between hover:border-amber-500/40 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full">
                  Recommandation Académique
                </span>
                <h3 className="text-lg font-bold text-text-primary mt-2 mb-2">
                  Modèle de Lettre de Recommandation de Professeur
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Lettre officielle sur en-tête d'université ou lycée marocain (à faire signer par 2 professeurs de faculté ou de classe préparatoire) avec formule de soutien formelle.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <a
                  href={`${basePath}/templates/Academic_Recommendation_Letter_Template.txt`}
                  download="Academic_Recommendation_Letter_Template.txt"
                  className="w-full py-2.5 px-4 rounded-xl btn-gradient text-xs font-bold text-white flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger la Lettre Modèle</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 4: CALCULATEUR D'ÉCONOMIES & BOURSE CSC ── */}
      {activeTab === "calculator" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="max-w-3xl mx-auto glass rounded-3xl p-6 sm:p-10 border border-amber-500/30">
            <div className="text-center mb-8">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider font-mono">
                Simulateur d'Économies Familiales 🇲🇦
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary mt-2">
                Combien Économise une Famille Marocaine grâce à la Bourse CSC ?
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                La bourse complète du gouvernement chinois prend en charge 100% de la scolarité et du logement, tout en vous versant un salaire étudiant mensuel.
              </p>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
                  Cycle d'Études Visé en Chine
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["bachelor", "master", "phd"] as const).map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setCalcDegree(deg)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                        calcDegree === deg
                          ? "bg-amber-500 text-slate-950 font-black shadow-md"
                          : "glass text-text-muted hover:text-text-primary"
                      }`}
                    >
                      {deg === "bachelor" ? "Licence (4 ans)" : deg === "master" ? "Master (3 ans)" : "Doctorat (4 ans)"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
                  Zone Métropolitaine
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcCityTier("tier1")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      calcCityTier === "tier1"
                        ? "bg-amber-500 text-slate-950 font-black shadow-md"
                        : "glass text-text-muted hover:text-text-primary"
                    }`}
                  >
                    Grandes Métropoles (Pékin, Shanghai)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcCityTier("tier2")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      calcCityTier === "tier2"
                        ? "bg-amber-500 text-slate-950 font-black shadow-md"
                        : "glass text-text-muted hover:text-text-primary"
                    }`}
                  >
                    Hubs Émergents (Chengdu, Wuhan, Xi'an)
                  </button>
                </div>
              </div>
            </div>

            {/* Simulation Results Display */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-purple/10 to-emerald-500/10 border border-amber-500/30 space-y-6">
              <div className="text-center">
                <span className="text-xs uppercase font-bold text-amber-300 font-mono">
                  Valeur Totale Nette Prise en Charge par la Bourse
                </span>
                <div className="text-4xl sm:text-6xl font-black text-emerald-400 mt-1">
                  +{totalScholarshipValueMAD.toLocaleString()} MAD
                </div>
                <p className="text-xs text-text-muted font-mono mt-1">
                  Équivalent à ≈ {totalScholarshipValueRMB.toLocaleString()} RMB sur {currentCalc.years} ans
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-text-muted block">Frais de Scolarité 100% Gratuits</span>
                  <strong className="text-sm font-bold text-text-primary">
                    {Math.round(totalTuitionSavedRMB * rmbToMad).toLocaleString()} MAD
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-text-muted block">Logement Universitaire Offert</span>
                  <strong className="text-sm font-bold text-text-primary">
                    {Math.round(totalDormSavedRMB * rmbToMad).toLocaleString()} MAD
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-text-muted block">Versement en Cash sur Compte</span>
                  <strong className="text-sm font-bold text-emerald-400">
                    {monthlyStipendMAD.toLocaleString()} MAD / Mois
                  </strong>
                </div>
              </div>

              {/* Comparison box against Europe */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-xs text-text-secondary leading-relaxed">
                <p>
                  💡 <strong>Comparatif Études en France / Canada :</strong> Pour un cursus de même niveau, une famille marocaine dépense en moyenne entre <strong>180,000 MAD et 280,000 MAD par an</strong> (loyer, caution, garant, scolarité). En Chine sous Bourse Complète CSC, l'étudiant ne paye <strong>aucun loyer</strong>, reçoit son argent de poche et obtient un diplôme mondialement reconnu dans des universités de rang équivalent à l'Ivy League.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 5: VIE MUSULMANE & HALAL EN CHINE ── */}
      {activeTab === "muslim-life" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">
              Guide de la Vie Musulmane & Pratique Quotidienne en Chine
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Tout ce que les étudiants et parents marocains doivent savoir sur la nourriture halal, les mosquées et le respect des traditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6 border border-border-glass space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Cantines Halal Officielles (清真食堂 Qīngzhēn Shítáng)
                </h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                En Chine, la réglementation du Ministère de l'Éducation impose à <strong>toutes les universités nationales</strong> accueillant des étudiants internationaux de disposer d'une cantine musulmane certifiée (Qingzhen). Gérées par des cuisiniers musulmans Hui ou Ouïghours, ces cantines servent des plats de bœuf, agneau, poulet halal, nouilles fraîches tirées à la main (Lanzhou Lamian), riz sauté et pains traditionnels à des prix subventionnés (10 à 20 RMB par repas).
              </p>
            </div>

            <div className="glass rounded-3xl p-6 border border-border-glass space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan/20 text-cyan flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Mosquées Historiques & Prière du Vendredi (Jumu'ah)
                </h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                La Chine compte plus de 25 millions de musulmans et des dizaines de milliers de mosquées en activité. La <strong>Mosquée de Niujie à Pékin</strong> (construite en 996), la <strong>Mosquée Huaisheng à Guangzhou</strong> (fondée par Sa'd ibn Abi Waqqas au 7ème siècle) et la <strong>Grande Mosquée de Xi'an</strong> accueillent chaque semaine des milliers de fidèles, dont de nombreux étudiants et diplomates arabes et marocains.
              </p>
            </div>

            <div className="glass rounded-3xl p-6 border border-border-glass space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Banques, Cartes & Paiement Mobile (Alipay & WeChat Pay)
                </h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Dès votre arrivée avec notre Pack Accompagnement, un conseiller vous accompagne chez <strong>Bank of China</strong> ou <strong>ICBC</strong> avec votre passeport marocain pour ouvrir votre compte bancaire. Votre bourse mensuelle CSC (2,500 à 3,500 RMB) y sera directement virée. Vous pourrez ensuite lier ce compte à WeChat Pay et Alipay pour payer absolument tout avec votre smartphone sans frais.
              </p>
            </div>

            <div className="glass rounded-3xl p-6 border border-border-glass space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple/20 text-purple flex items-center justify-center font-bold">
                  <Languages className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Dotation Études à l'Étranger (Office des Changes Maroc)
                </h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Grâce à votre lettre d'admission officielle et votre attestation d'inscription visée par notre agence, vos parents au Maroc peuvent activer auprès de leur banque marocaine (CIH, Attijariwafa, Banque Populaire) la dotation scolarité de l'Office des Changes pour envoyer des fonds en cas de besoin en toute légalité.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 6: RÉSEAU DES MENTORS MAROCAINS ── */}
      {activeTab === "mentors" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">
              Réseau des Boursiers Aînés Marocains en Chine
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Découvrez les témoignages et parcours d'étudiants marocains actuellement en poste ou diplômés des meilleures universités chinoises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentors.map((m, idx) => (
              <div key={idx} className="glass rounded-3xl p-6 border border-border-glass flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {m.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-text-primary">{m.name}</h4>
                        <p className="text-xs text-emerald-400 font-semibold">📍 Origine : {m.cityMorocco} 🇲🇦</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white font-mono">
                      {m.year}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 mb-4 text-xs space-y-1">
                    <p className="font-bold text-text-primary">🎓 {m.university}</p>
                    <p className="text-text-muted">📚 {m.program}</p>
                    <p className="text-cyan font-medium">💰 {m.scholarship}</p>
                  </div>

                  <p className="text-xs text-text-secondary italic leading-relaxed mb-4">
                    "{m.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <button
                    onClick={() => {
                      setActiveTab("desks");
                      const el = document.getElementById("booking-form");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-2 px-3 rounded-xl glass hover:bg-white/10 text-xs font-semibold text-cyan flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Demander à échanger avec ce mentor via l'agence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
