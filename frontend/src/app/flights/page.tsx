"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Calendar as CalendarIcon,
  Search,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Luggage,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Filter,
  DollarSign,
  Building2,
  MapPin,
  ChevronRight,
  Compass,
  ArrowLeftRight,
  Check,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import SmartBack from "@/components/SmartBack";
import { useLang } from "@/lib/i18n";
import {
  ORIGIN_AIRPORTS,
  DEST_AIRPORTS,
  REAL_SCHEDULED_FLIGHTS,
  RealScheduledFlight,
  buildSkyscannerUrl,
  buildTripComUrl,
} from "@/data/flightsData";

export default function FlightsPage() {
  const { lang } = useLang();

  // Search & Flexible Date States
  const [selectedOrigin, setSelectedOrigin] = useState("CMN");
  const [selectedDest, setSelectedDest] = useState("PEK");
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");

  // Default to upcoming August 2026 departure (typical student arrival window)
  const [departureDate, setDepartureDate] = useState("2026-08-25");
  const [returnDate, setReturnDate] = useState("2027-07-15");
  const [activeFilterTag, setActiveFilterTag] = useState<"all" | "student_fav" | "baggage_pro" | "fastest">("all");

  const currentOrigin = ORIGIN_AIRPORTS.find((o) => o.code === selectedOrigin) || ORIGIN_AIRPORTS[0];
  const currentDest = DEST_AIRPORTS.find((d) => d.code === selectedDest) || DEST_AIRPORTS[0];

  // Filter flights matching the destination
  const matchedFlights = useMemo(() => {
    return REAL_SCHEDULED_FLIGHTS.filter((flight) => {
      // Origin match
      if (flight.originCode !== selectedOrigin && selectedOrigin !== "all") {
        return false;
      }
      // Destination match
      if (selectedDest !== "all" && flight.destCode !== selectedDest) {
        return false;
      }
      // Tag filter
      if (activeFilterTag !== "all" && flight.tag !== activeFilterTag) {
        return false;
      }
      return true;
    });
  }, [selectedOrigin, selectedDest, activeFilterTag]);

  // Formatted human-readable date
  const formattedDateDisplay = useMemo(() => {
    if (!departureDate) return "";
    try {
      const d = new Date(departureDate + "T00:00:00");
      return d.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return departureDate;
    }
  }, [departureDate]);

  // Quick Date adjusters (+/- 1 day, +/- 3 days)
  const adjustDays = (days: number) => {
    try {
      const current = new Date(departureDate + "T00:00:00");
      current.setDate(current.getDate() + days);
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const dd = String(current.getDate()).padStart(2, "0");
      setDepartureDate(`${yyyy}-${mm}-${dd}`);
    } catch {}
  };

  // Live Deep Search Links
  const liveTripUrl = buildTripComUrl({
    originCode: selectedOrigin,
    destCode: selectedDest,
    originCity: currentOrigin.city,
    destCity: currentDest.city,
    departureDate,
    returnDate: tripType === "roundtrip" ? returnDate : undefined,
    tripType,
  });

  const liveSkyscannerUrl = buildSkyscannerUrl({
    originCode: selectedOrigin,
    destCode: selectedDest,
    departureDate,
    returnDate: tripType === "roundtrip" ? returnDate : undefined,
    tripType,
  });

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & HONEST TRANSPARENCY NOTICE
      ───────────────────────────────────────────────────────────── */}
      <div>
        <SmartBack fallback="/" label={lang === "ar" ? "الرئيسية" : "Retour"} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan/15 text-cyan border border-cyan/30 mb-2.5">
              <Plane className="w-3.5 h-3.5" />
              <span>
                {lang === "ar"
                  ? "البحث الحي لرحلات الطيران — المغرب إلى الصين"
                  : "Moteur de Vols Direct & Flexible — Maroc ➔ Chine"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {lang === "ar"
                ? "رحلات الطيران الحقيقية وأسعارها اللحظية (Trip.com & Skyscanner)"
                : "Trouvez les Vrais Vols Disponibles pour Votre Date Exacte"}
            </h1>
            <p className="text-xs sm:text-base text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
              {lang === "ar"
                ? "اختر اليوم والشهر بدقة لعرض جداول الرحلات المعتمدة والخطوط الجوية العاملة فعلياً، وافتح الرابط المباشر في Trip.com و Skyscanner لمعرفة السعر الحقيقي دون تزييف."
                : "Choisissez librement votre jour et mois de voyage. Nous listons les compagnies réelles opérant sur cet itinéraire avec redirection directe vers Trip.com & Skyscanner pour obtenir le prix réel du jour à la seconde près."}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. HONESTY GUARANTEE BANNER (Zero Fake Fixed Prices)
      ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-blue-950/40 to-slate-900 border border-amber-500/30 backdrop-blur-xl flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-xs sm:text-sm font-black text-white">
            {lang === "ar"
              ? "التزامنا بالشفافية المطلقة حول أسعار التذاكر"
              : "Notre Engagement de Transparence sur les Prix des Billets"}
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {lang === "ar"
              ? "أسعار تذاكر الطيران تتغير باستمرار حسب يوم السفر، وموسم الذروة الجامعية (غشت وشتنبر)، ومستوى امتلاء الطائرة. نحن لا نعرض أسعاراً ثابتة وهمية : بمجرد اختيار تاريخك، تفتح الروابط الرسمية المحدثة في Trip.com و Skyscanner لحجز التذكرة بالسعر الحقيقي الرسمي."
              : "Les prix des billets varient d'heure en heure selon le jour précis, la saisonnalité (haute saison de rentrée fin août/début septembre) et le remplissage des vols. Aucun faux prix statique : choisissez votre jour, et les liens officiels Trip.com et Skyscanner vous affichent le tarif 100% réel en temps réel."}
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. INTERACTIVE FLEXIBLE SEARCH WIDGET (Day + Month + Year)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#091122]/95 border border-cyan/40 backdrop-blur-xl shadow-2xl space-y-6">
        {/* Top Controls: Trip Type (One-way / Round-trip) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTripType("oneway")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                tripType === "oneway"
                  ? "bg-cyan text-slate-950 shadow-md shadow-cyan/20"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {lang === "ar" ? "ذهاب فقط (Aller Simple)" : "Aller Simple (Étudiants)"}
            </button>
            <button
              onClick={() => setTripType("roundtrip")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                tripType === "roundtrip"
                  ? "bg-cyan text-slate-950 shadow-md shadow-cyan/20"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {lang === "ar" ? "ذهاب وعودة (Aller-Retour)" : "Aller-Retour"}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <CalendarIcon className="w-3.5 h-3.5 text-cyan" />
            <span>Date sélectionnée : <strong className="text-white">{formattedDateDisplay}</strong></span>
          </div>
        </div>

        {/* Origin / Destination / Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Origin */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan" />
              <span>{lang === "ar" ? "من (المغرب) :" : "Départ (Maroc) :"}</span>
            </label>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-white/[0.05] border border-white/15 text-white font-bold text-xs focus:outline-none focus:border-cyan transition-all"
            >
              {ORIGIN_AIRPORTS.map((o) => (
                <option key={o.code} value={o.code} className="bg-slate-900 text-white">
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === "ar" ? "إلى (الصين) :" : "Destination (Chine) :"}</span>
            </label>
            <select
              value={selectedDest}
              onChange={(e) => setSelectedDest(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-white/[0.05] border border-white/15 text-white font-bold text-xs focus:outline-none focus:border-cyan transition-all"
            >
              {DEST_AIRPORTS.map((d) => (
                <option key={d.code} value={d.code} className="bg-slate-900 text-white">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Exact Departure Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>{lang === "ar" ? "تاريخ السفر (اليوم والشهر) :" : "Date de Départ :"}</span>
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.05] border border-white/15 text-white font-bold text-xs focus:outline-none focus:border-cyan transition-all cursor-pointer"
            />
          </div>

          {/* Return Date (if Round-trip) or Quick Day Adjusters */}
          {tripType === "roundtrip" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === "ar" ? "تاريخ العودة :" : "Date de Retour :"}</span>
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.05] border border-white/15 text-white font-bold text-xs focus:outline-none focus:border-cyan transition-all cursor-pointer"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-cyan" />
                <span>Flexibilité (+/- Jours) :</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => adjustDays(-3)}
                  className="py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
                  title="3 jours plus tôt"
                >
                  -3j
                </button>
                <button
                  type="button"
                  onClick={() => adjustDays(-1)}
                  className="py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
                  title="1 jour plus tôt"
                >
                  -1j
                </button>
                <button
                  type="button"
                  onClick={() => adjustDays(1)}
                  className="py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
                  title="1 jour plus tard"
                >
                  +1j
                </button>
                <button
                  type="button"
                  onClick={() => adjustDays(3)}
                  className="py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
                  title="3 jours plus tard"
                >
                  +3j
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            DIRECT LIVE REDIRECTION BUTTONS (Trip.com & Skyscanner)
        ───────────────────────────────────────────────────────────── */}
        <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-300">
            Itinéraire sélectionné : <strong className="text-cyan">{currentOrigin.city} ({currentOrigin.code})</strong> ➔{" "}
            <strong className="text-emerald-400">{currentDest.city} ({currentDest.code})</strong> le{" "}
            <strong className="text-white">{departureDate}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Trip.com Real Live Button */}
            <a
              href={liveTripUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-xl shadow-blue-600/30 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan" />
              <span>Voir le Prix Réel sur Trip.com</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Skyscanner Real Live Button */}
            <a
              href={liveSkyscannerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-cyan/20 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Plane className="w-4 h-4 text-slate-950" />
              <span>Comparer les Prix sur Skyscanner</span>
              <ExternalLink className="w-4 h-4 text-slate-950" />
            </a>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. REAL OPERATING AIRLINES & ROUTE SCHEDULES
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Compagnies Aériennes Régulières Opérant sur cette Ligne</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan/15 text-cyan border border-cyan/30">
                {matchedFlights.length} compagnies disponibles
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ces vols sont programmés régulièrement. Cliquez sur chaque compagnie pour vérifier la place disponible pour votre date :
            </p>
          </div>

          {/* Tag filters */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setActiveFilterTag("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilterTag === "all"
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setActiveFilterTag("student_fav")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilterTag === "student_fav"
                  ? "bg-cyan text-slate-950 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎓 Favoris Étudiants
            </button>
            <button
              onClick={() => setActiveFilterTag("baggage_pro")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilterTag === "baggage_pro"
                  ? "bg-emerald-500 text-slate-950 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🧳 46 kg Garantis
            </button>
            <button
              onClick={() => setActiveFilterTag("fastest")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilterTag === "fastest"
                  ? "bg-amber-400 text-slate-950 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ⚡ Plus Rapide
            </button>
          </div>
        </div>

        {/* Flight Cards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {matchedFlights.map((flight) => {
            const flightTripUrl = buildTripComUrl({
              originCode: flight.originCode,
              destCode: flight.destCode,
              originCity: flight.originCity,
              destCity: flight.destCity,
              departureDate,
              returnDate: tripType === "roundtrip" ? returnDate : undefined,
              tripType,
            });

            const flightSkyscannerUrl = buildSkyscannerUrl({
              originCode: flight.originCode,
              destCode: flight.destCode,
              departureDate,
              returnDate: tripType === "roundtrip" ? returnDate : undefined,
              tripType,
            });

            return (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl p-5 sm:p-6 bg-[#091122]/90 border border-white/10 hover:border-cyan/40 backdrop-blur-xl shadow-xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group"
              >
                {/* Airline & Itinerary details */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-2xl select-none">{flight.airlineLogo}</span>
                    <h3 className="text-base font-black text-white">{flight.airline}</h3>
                    <span className="text-xs font-mono font-bold text-cyan bg-cyan/15 border border-cyan/30 px-2.5 py-0.5 rounded-md">
                      {flight.flightNumbers}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold bg-white/5 px-2 py-0.5 rounded-md">
                      {flight.operatingDays}
                    </span>

                    {flight.tag === "student_fav" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        🎓 Coup de Cœur Étudiant
                      </span>
                    )}
                    {flight.tag === "baggage_pro" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        🧳 46 kg en Soute
                      </span>
                    )}
                    {flight.tag === "fastest" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ⚡ Temps de Vol Réduit
                      </span>
                    )}
                  </div>

                  {/* Route & Hub */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Aéroport de Départ
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        {flight.originCity} ({flight.originCode})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Escale de Correspondance
                      </span>
                      <span className="text-sm font-bold text-cyan">
                        {flight.hub}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{flight.layoverDuration}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Arrivée en Chine
                      </span>
                      <span className="text-sm font-extrabold text-emerald-400">
                        {flight.destCity} ({flight.destAirportName})
                      </span>
                    </div>
                  </div>

                  {/* Baggage & Student Perks */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 font-bold">
                      <Luggage className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{flight.baggageAllowance}</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200">
                      <Sparkles className="w-3.5 h-3.5 text-cyan" />
                      <span>{flight.studentPerk}</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{flight.transitVisaNote}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Live Price Check Action */}
                <div className="flex flex-col items-start lg:items-end justify-between gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10 flex-shrink-0">
                  <div className="text-left lg:text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-block mb-1">
                      Tarif Live du {departureDate}
                    </span>
                    <div className="text-xs text-slate-300">
                      Vérification en 1 clic :
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* Trip.com */}
                    <a
                      href={flightTripUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                      title={`Vérifier le vol ${flight.airline} sur Trip.com`}
                    >
                      <span>Vérifier sur Trip.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Skyscanner */}
                    <a
                      href={flightSkyscannerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan hover:bg-cyan/90 text-slate-950 font-black text-xs shadow-lg shadow-cyan/20 transition-all cursor-pointer"
                      title={`Comparer le vol ${flight.airline} sur Skyscanner`}
                    >
                      <span>Comparer sur Skyscanner</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Airline Official website link */}
                  <a
                    href={flight.airlineOfficialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-400 hover:text-cyan flex items-center gap-1 transition-colors self-end"
                  >
                    <span>Site officiel de {flight.airline}</span>
                    <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. REALISTIC SEASONAL PRICE GUIDE (Honest benchmarks)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#091122]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-cyan/20 text-cyan flex items-center justify-center font-bold">
            📊
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Repères Réels de Prix Selon la Saison (Maroc ➔ Chine)
            </h3>
            <p className="text-xs text-slate-400">
              Pour vous aider à prévoir votre budget réel sans mauvaise surprise.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
              Basse Saison (Novembre à Mars)
            </span>
            <div className="text-lg font-black text-white">~6 000 à 8 500 DH</div>
            <p className="text-xs text-slate-300">
              Période la plus économique de l'année. Les compagnies proposent des promotions régulières avec escales courtes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan/30 space-y-1">
            <span className="text-[10px] font-black uppercase text-cyan tracking-wider block">
              Moyenne Saison (Avril à Juin)
            </span>
            <div className="text-lg font-black text-white">~7 500 à 9 800 DH</div>
            <p className="text-xs text-slate-300">
              Période intermédiaire avec bonne disponibilité sur Saudia, Etihad et Qatar Airways.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/30 space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider block">
              Haute Saison Rentrée (Août à Mi-Septembre)
            </span>
            <div className="text-lg font-black text-white">~9 500 à 15 000+ DH</div>
            <p className="text-xs text-slate-300">
              Période de rentrée scolaire mondiale. La demande explose. Réservez impérativement 45 à 60 jours avant pour éviter les tarifs de dernière minute.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
