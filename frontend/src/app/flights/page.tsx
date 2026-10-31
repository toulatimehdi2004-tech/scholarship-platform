"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
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
  Calendar,
  Filter,
  DollarSign,
  Building2,
  MapPin,
  ChevronRight,
  Compass,
} from "lucide-react";
import Link from "next/link";
import SmartBack from "@/components/SmartBack";
import { useLang } from "@/lib/i18n";
import {
  REAL_STUDENT_FLIGHTS,
  ORIGIN_AIRPORTS,
  DEST_AIRPORTS,
  FlightOffer,
  buildSkyscannerUrl,
  buildTripComUrl,
} from "@/data/flightsData";

export default function FlightsPage() {
  const { lang } = useLang();

  // Search & Filter States
  const [selectedOrigin, setSelectedOrigin] = useState("CMN");
  const [selectedDest, setSelectedDest] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("sep2026");
  const [currency, setCurrency] = useState<"MAD" | "RMB" | "USD">("MAD");
  const [activeFilterTag, setActiveFilterTag] = useState<"all" | "cheapest" | "fastest" | "student_choice">("all");

  // Filtered flights
  const filteredFlights = useMemo(() => {
    return REAL_STUDENT_FLIGHTS.filter((flight) => {
      // Origin match
      if (selectedOrigin !== "all" && flight.originCode !== selectedOrigin) {
        return false;
      }
      // Destination match
      if (selectedDest !== "all" && flight.destCode !== selectedDest) {
        return false;
      }
      // Tag filter
      if (activeFilterTag !== "all") {
        if (activeFilterTag === "cheapest" && flight.dealTag !== "cheapest") return false;
        if (activeFilterTag === "fastest" && flight.dealTag !== "fastest") return false;
        if (activeFilterTag === "student_choice" && flight.dealTag !== "student_choice") return false;
      }
      return true;
    }).sort((a, b) => {
      if (activeFilterTag === "cheapest") return a.priceMad - b.priceMad;
      return a.priceMad - b.priceMad;
    });
  }, [selectedOrigin, selectedDest, activeFilterTag]);

  // Format price based on active currency
  const formatPrice = (f: FlightOffer) => {
    if (currency === "MAD") return `${f.priceMad.toLocaleString()} DH`;
    if (currency === "RMB") return `¥${f.priceRmb.toLocaleString()} RMB`;
    return `$${f.priceUsd.toLocaleString()} USD`;
  };

  const currentOriginAirport = ORIGIN_AIRPORTS.find((o) => o.code === selectedOrigin);
  const currentDestAirport = DEST_AIRPORTS.find((d) => d.code === selectedDest);

  // Dynamic global links
  const globalSkyscannerUrl = buildSkyscannerUrl({
    originCode: selectedOrigin === "all" ? "CMN" : selectedOrigin,
    destCode: selectedDest === "all" ? "PEK" : selectedDest,
  });

  const globalTripUrl = buildTripComUrl({
    originCode: selectedOrigin === "all" ? "CMN" : selectedOrigin,
    destCode: selectedDest === "all" ? "PEK" : selectedDest,
    originCity: currentOriginAirport?.city || "Casablanca",
    destCity: currentDestAirport?.city || "Beijing",
  });

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & BREADCRUMB
      ───────────────────────────────────────────────────────────── */}
      <div>
        <SmartBack fallback="/" label={lang === "ar" ? "الرئيسية" : "Retour"} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan/15 text-cyan border border-cyan/30 mb-2.5">
              <Plane className="w-3.5 h-3.5" />
              <span>
                {lang === "ar"
                  ? "مقارنة تذاكر الطيران للطلاب المغاربة"
                  : "Comparateur Vols Étudiants Maroc ➔ Chine"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {lang === "ar"
                ? "أرخص رحلات الطيران إلى الصين (Trip.com & Skyscanner)"
                : "Les Vols les Moins Chers vers la Chine pour Étudiants"}
            </h1>
            <p className="text-xs sm:text-base text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
              {lang === "ar"
                ? "قارن أفضل أسعار الرحلات من الدار البيضاء ومراكش والرباط إلى بكين، شنغهاي، غوانزو وتشنغدو. روابط حجز مباشرة على Trip.com و Skyscanner مع ضمان أمتعة الطلاب (2 × 23 كغ)."
                : "Trouvez les meilleurs tarifs d'avion vérifiés pour la rentrée universitaire en Chine. Redirection directe vers Trip.com & Skyscanner pour réserver au tarif officiel avec franchise bagage de 46 kg."}
            </p>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl flex-shrink-0 self-start sm:self-center">
            <button
              onClick={() => setCurrency("MAD")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currency === "MAD" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              🇲🇦 Dirham
            </button>
            <button
              onClick={() => setCurrency("RMB")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currency === "RMB" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              🇨🇳 Yuan
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currency === "USD" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              💵 USD
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. INTERACTIVE SEARCH & ROUTE SELECTOR
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl p-6 sm:p-7 bg-[#091122]/90 border border-cyan/30 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan/20 text-cyan flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {lang === "ar" ? "حدد مسار رحلتك إلى الصين" : "Configurez votre Itinéraire de Vol"}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === "ar"
                  ? "اختر مطار الانطلاق والوجهة لتحديث الأسعار وروابط الحجز فوراً."
                  : "Mise à jour instantanée des tarifs réels et des liens Trip.com & Skyscanner."}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full hidden sm:inline-block">
            {lang === "ar" ? "أرخص الأسعار مؤكدة" : "Tarifs Négociés Étudiants"}
          </span>
        </div>

        {/* Origin / Destination / Intake Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Origin */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan" />
              <span>{lang === "ar" ? "مطار الإقلاع (المغرب):" : "Départ (Maroc):"}</span>
            </label>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-cyan transition-all"
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
              <span>{lang === "ar" ? "مطار الوصول في الصين:" : "Arrivée (Chine):"}</span>
            </label>
            <select
              value={selectedDest}
              onChange={(e) => setSelectedDest(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-cyan transition-all"
            >
              <option value="all" className="bg-slate-900 text-white">
                🇨🇳 {lang === "ar" ? "جميع مدن الصين (Pékin, Shanghai, Canton...)" : "Toutes les villes (Pékin, Shanghai, Canton...)"}
              </option>
              {DEST_AIRPORTS.map((d) => (
                <option key={d.code} value={d.code} className="bg-slate-900 text-white">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period / Intake */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>{lang === "ar" ? "فترة السفر والالتحاق:" : "Période de départ:"}</span>
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-cyan transition-all"
            >
              <option value="aug2026" className="bg-slate-900 text-white">
                Août 2026 (Arrivée Précoce)
              </option>
              <option value="sep2026" className="bg-slate-900 text-white">
                Septembre 2026 (Rentrée Universitaire Principale)
              </option>
              <option value="oct2026" className="bg-slate-900 text-white">
                Octobre 2026 / Hiver
              </option>
              <option value="anytime" className="bg-slate-900 text-white">
                Dates flexibles toute l'année
              </option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[11px] font-black uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres :</span>
          </span>
          {[
            { id: "all", label: "Tous les vols vérifiés" },
            { id: "cheapest", label: "🏷️ Moins Cher (~4 190 à 4 450 DH)" },
            { id: "student_choice", label: "🎓 Choix Étudiant (Baggage 46kg + Wifi)" },
            { id: "fastest", label: "⚡ Escale la plus courte (15h50)" },
          ].map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveFilterTag(tag.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilterTag === tag.id
                  ? "bg-cyan text-slate-950 font-black shadow-md shadow-cyan/20"
                  : "bg-white/[0.04] border border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. DIRECT TRIP.COM & SKYSCANNER SEARCH BANNER
      ───────────────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-blue-500/30 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan/20 border border-cyan/40 text-cyan flex items-center justify-center flex-shrink-0 font-black text-xl">
            ✈️
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-cyan">
              Recherche Live Pré-Remplie • 0 Commission Cachée
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
              Comparez en direct sur Trip.com et Skyscanner
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Cliquez pour voir les disponibilités en temps réel sur les plateformes officielles :
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-shrink-0 w-full md:w-auto">
          {/* Trip.com Global Link */}
          <a
            href={globalTripUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <span>Ouvrir sur Trip.com</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Skyscanner Global Link */}
          <a
            href={globalSkyscannerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan/25 hover:opacity-95 transition-all cursor-pointer"
          >
            <span>Ouvrir sur Skyscanner</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. FLIGHTS DEALS CARDS LIST
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span>Vols Recommandés pour Étudiants</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan/15 text-cyan border border-cyan/30">
              {filteredFlights.length} options disponibles
            </span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            Franchise bagage 2x23kg vérifiée
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredFlights.map((flight) => {
            const skyscannerLink = buildSkyscannerUrl({
              originCode: flight.originCode,
              destCode: flight.destCode,
            });
            const tripLink = buildTripComUrl({
              originCode: flight.originCode,
              destCode: flight.destCode,
              originCity: flight.originCity,
              destCity: flight.destCity,
            });

            return (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl p-5 sm:p-6 bg-[#091122]/90 border border-white/10 hover:border-cyan/40 backdrop-blur-xl shadow-xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 group"
              >
                {/* Left: Airline + Schedule */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-2xl select-none">{flight.airlineLogo}</span>
                    <span className="text-sm font-black text-white">{flight.airline}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                      Code: {flight.airlineCode}
                    </span>

                    {/* Tag badge */}
                    {flight.dealTag === "cheapest" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        🏷️ Tarif Le Moins Cher
                      </span>
                    )}
                    {flight.dealTag === "student_choice" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        🎓 Coup de Cœur Étudiant
                      </span>
                    )}
                    {flight.dealTag === "fastest" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ⚡ Trajet Le Plus Rapide
                      </span>
                    )}
                    {flight.dealTag === "best_value" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan/20 text-cyan border border-cyan/40">
                        ⭐ Meilleur Rapport Qualité/Prix
                      </span>
                    )}
                  </div>

                  {/* Flight itinerary visualization */}
                  <div className="flex items-center gap-3 sm:gap-6 pt-1">
                    <div>
                      <div className="text-lg sm:text-xl font-black text-white">
                        {flight.departureTime}
                      </div>
                      <div className="text-xs text-slate-400 font-bold">
                        {flight.originCity} ({flight.originCode})
                      </div>
                    </div>

                    {/* Route arrow */}
                    <div className="flex-1 max-w-[180px] text-center">
                      <div className="text-[10px] font-bold text-cyan">{flight.duration}</div>
                      <div className="relative flex items-center justify-center my-1">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
                        <Plane className="w-3.5 h-3.5 text-cyan absolute rotate-90" />
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">{flight.layover}</div>
                    </div>

                    <div>
                      <div className="text-lg sm:text-xl font-black text-white">
                        {flight.arrivalTime}
                      </div>
                      <div className="text-xs text-slate-400 font-bold">
                        {flight.destCity} ({flight.destCode})
                      </div>
                    </div>
                  </div>

                  {/* Baggage & Perks */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                      <Luggage className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{flight.baggage}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 text-[11px]">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{flight.studentPerk}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Price & CTA buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Tarif Estimé Aller Simple
                    </span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                      {formatPrice(flight)}
                    </div>
                    <span className="text-[11px] text-slate-400">Taxes et 2 bagages inclus</span>
                  </div>

                  {/* Booking Links */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Trip.com button */}
                    <a
                      href={tripLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                      title="Voir sur Trip.com"
                    >
                      <span>Trip.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Skyscanner button */}
                    <a
                      href={skyscannerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan hover:bg-cyan/90 text-slate-950 font-black text-xs shadow-md shadow-cyan/25 transition-all cursor-pointer"
                      title="Comparer sur Skyscanner"
                    >
                      <span>Skyscanner</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. STUDENT ADVICE & RULES FOR MOROCCAN TRAVELERS
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#091122]/90 border border-blue-500/30 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-cyan flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Guide & Conseils Pratiques pour les Étudiants Voyageant en Chine
            </h3>
            <p className="text-xs text-slate-400">
              À lire impérativement avant d'acheter votre billet d'avion pour éviter les mauvaises surprises.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tip 1: Baggage */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2">
              <Luggage className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                1. Les 46 kg de Bagages en Soute sont Indispensables
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pour une installation d'un an ou plus en Chine, vous aurez besoin de vos vêtements d'hiver et d'été, documents traduits et effets personnels. Privilégiez <strong>Saudia, Qatar Airways, Turkish ou Etihad</strong> qui accordent d'office <strong>2 valises de 23 kg</strong>.
            </p>
          </div>

          {/* Tip 2: Transit Visa */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                2. Aucun Visa de Transit Requis pour les Escales
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pour les escales à <strong>Djeddah (JED), Abu Dhabi (AUH), Doha (DOH), Dubaï (DXB) ou Istanbul (IST)</strong>, les citoyens marocains n'ont besoin d'aucun visa de transit tant qu'ils restent dans la zone internationale de correspondance.
            </p>
          </div>

          {/* Tip 3: Student Club perks */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                3. Clubs Étudiants Gratuits (Qatar Airways & Emirates)
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dès réception de votre lettre d'admission ou formulaire JW202, inscrivez-vous au <strong>Qatar Airways Student Club</strong> ou à l'offre étudiante <strong>Emirates</strong> pour bénéficier de <strong>+10 kg de bagages supplémentaires gratuits</strong> et de réductions de 10%.
            </p>
          </div>

          {/* Tip 4: Booking timing */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                4. Réservez 45 à 60 Jours à l'Avance
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              La rentrée universitaire en Chine a lieu début septembre. Les prix augmentent fortement après le 10 août. En réservant entre mi-juin et mi-juillet, vous économiserez en moyenne <strong>1 500 à 2 500 DH</strong> par billet sur Trip.com et Skyscanner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
