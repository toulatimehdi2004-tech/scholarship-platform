"use client";

import React, { useState, useMemo, useRef } from "react";
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
  Users,
  ChevronDown,
  X,
  Wifi,
  Coffee,
  GraduationCap,
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

// Helper: Calculate 7-day strip centered on departureDate
function getNearbyDays(baseDateStr: string) {
  try {
    const parts = baseDateStr.split("-").map(Number);
    if (parts.length !== 3) return [];
    const [y, m, d] = parts;
    const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const days = [];
    for (let offset = -3; offset <= 3; offset++) {
      const target = new Date(base.getTime() + offset * 86400000);
      const yyyy = target.getUTCFullYear();
      const mm = String(target.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(target.getUTCDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const dayName = target.toLocaleDateString("fr-FR", { weekday: "short", timeZone: "UTC" });
      const monthName = target.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" });
      const isSelected = dateStr === baseDateStr;
      const dayOfWeek = target.getUTCDay(); // 2 is Tue, 3 is Wed
      const isBestDay = dayOfWeek === 2 || dayOfWeek === 3;

      days.push({
        dateStr,
        dayNum: dd,
        dayName,
        monthName,
        isSelected,
        isBestDay,
        label: isSelected ? "Sélectionné" : isBestDay ? "Moins cher" : undefined,
      });
    }
    return days;
  } catch {
    return [];
  }
}

export default function FlightsPage() {
  const { lang } = useLang();

  // Search & Flexible Date States
  const [selectedOrigin, setSelectedOrigin] = useState("CMN");
  const [selectedDest, setSelectedDest] = useState("TFU"); // Default to Chengdu Tianfu
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");

  // Default to upcoming August 2026 departure (typical student arrival window)
  const [departureDate, setDepartureDate] = useState("2026-08-25");
  const [returnDate, setReturnDate] = useState("2027-07-15");
  const [activeFilterTag, setActiveFilterTag] = useState<"all" | "student_fav" | "baggage_pro" | "fastest">("all");

  // Selection Modal states
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);
  const [destSearchQuery, setDestSearchQuery] = useState("");
  const [destCategoryFilter, setDestCategoryFilter] = useState<"all" | "multi" | "hubs" | "univ">("all");

  // Hidden native date input ref for direct trigger
  const dateInputRef = useRef<HTMLInputElement>(null);
  const returnDateInputRef = useRef<HTMLInputElement>(null);

  const currentOrigin = ORIGIN_AIRPORTS.find((o) => o.code === selectedOrigin) || ORIGIN_AIRPORTS[0];
  const currentDest = DEST_AIRPORTS.find((d) => d.code === selectedDest) || DEST_AIRPORTS[0];

  // 7-day fare matrix strip
  const nearbyDays = useMemo(() => getNearbyDays(departureDate), [departureDate]);

  // Swap Origin and Destination
  const handleSwapAirports = () => {
    const prevOrigin = selectedOrigin;
    const prevDest = selectedDest;
    setSelectedOrigin(prevDest);
    setSelectedDest(prevOrigin);
  };

  // Filter flights matching the destination
  const matchedFlights = useMemo(() => {
    return REAL_SCHEDULED_FLIGHTS.filter((flight) => {
      // Origin match
      if (flight.originCode !== selectedOrigin && selectedOrigin !== "all") {
        return false;
      }
      // Destination match (handle multi-airport city grouping)
      if (selectedDest !== "all") {
        if (flight.destCode === selectedDest) return true;
        // Group Chengdu airports (Tianfu TFU & Shuangliu CTU)
        if (
          (selectedDest === "TFU" || selectedDest === "CTU") &&
          (flight.destCode === "TFU" || flight.destCode === "CTU")
        ) {
          return true;
        }
        // Group Beijing airports (Daxing PKX & Capital PEK)
        if (
          (selectedDest === "PKX" || selectedDest === "PEK") &&
          (flight.destCode === "PKX" || flight.destCode === "PEK")
        ) {
          return true;
        }
        // Group Shanghai airports (Pudong PVG & Hongqiao SHA)
        if (
          (selectedDest === "PVG" || selectedDest === "SHA") &&
          (flight.destCode === "PVG" || flight.destCode === "SHA")
        ) {
          return true;
        }
        return false;
      }
      // Tag filter
      if (activeFilterTag !== "all" && flight.tag !== activeFilterTag) {
        return false;
      }
      return true;
    });
  }, [selectedOrigin, selectedDest, activeFilterTag]);

  // Filter destination airports for the modal
  const filteredDestAirports = useMemo(() => {
    return DEST_AIRPORTS.filter((d) => {
      // category filter
      if (destCategoryFilter === "multi" && !d.isMultiAirport) return false;
      if (
        destCategoryFilter === "hubs" &&
        (d.isMultiAirport ||
          (d.province !== "Guangdong" &&
            d.province !== "Chongqing" &&
            d.province !== "Hubei" &&
            d.province !== "Zhejiang"))
      ) {
        return false;
      }
      if (destCategoryFilter === "univ" && d.isMultiAirport) return false;

      // search query
      if (destSearchQuery.trim()) {
        const q = destSearchQuery.toLowerCase();
        const matchCity = d.city.toLowerCase().includes(q);
        const matchName = d.name.toLowerCase().includes(q);
        const matchCode = d.code.toLowerCase().includes(q);
        const matchChinese = d.chineseName.toLowerCase().includes(q);
        const matchUniv = (d.majorUniversities || "").toLowerCase().includes(q);
        const matchProv = (d.province || "").toLowerCase().includes(q);
        return matchCity || matchName || matchCode || matchChinese || matchUniv || matchProv;
      }
      return true;
    });
  }, [destSearchQuery, destCategoryFilter]);

  // Formatted human-readable date
  const formattedDateDisplay = useMemo(() => {
    if (!departureDate) return "";
    try {
      const parts = departureDate.split("-").map(Number);
      const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
      return d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return departureDate;
    }
  }, [departureDate]);

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
          1. HEADER & AIRLINE BOOKING TITLE
      ───────────────────────────────────────────────────────────── */}
      <div>
        <SmartBack fallback="/" label={lang === "ar" ? "الرئيسية" : "Retour"} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan/15 text-cyan border border-cyan/30 mb-2.5">
              <Plane className="w-3.5 h-3.5" />
              <span>
                {lang === "ar"
                  ? "محرك حجز وبحث الطيران المباشر — المغرب إلى الصين"
                  : "Moteur de Vols Direct & Dynamique — Maroc ➔ Chine"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {lang === "ar"
                ? "ابحث عن رحلتك الحقيقية إلى الصين للتاريخ والمطار المحدد"
                : "Recherchez Votre Vol pour la Chine à Votre Date Exacte"}
            </h1>
            <p className="text-xs sm:text-base text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
              {lang === "ar"
                ? "تشمل الصين مدناً كبرى تمتلك أكثر من مطار دولي (مثل تشنغدو التي تضم تيانفو وشوانغليو، وبكين وشانغهاي). اختر المطار الدقيق لجامعتك وتحقق من الأسعار الحية على Trip.com و Skyscanner."
                : "Les métropoles chinoises disposent de plusieurs aéroports majeurs (ex: Chengdu avec Tianfu TFU & Shuangliu CTU, Pékin avec Daxing & Capital, Shanghai avec Pudong & Hongqiao). Sélectionnez l'aéroport le plus proche de votre campus et obtenez le tarif réel en direct."}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. THE AIRLINE-STYLE INTERACTIVE BOOKING CONSOLE
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0e1c38] via-[#091122] to-[#070d1a] border border-cyan/40 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative overflow-hidden">
        {/* Glow ambient background accent */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        {/* Top Control Bar: Tabs & Cabin Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
          {/* Trip Type Radios */}
          <div className="flex items-center gap-2 p-1 bg-white/[0.04] border border-white/10 rounded-2xl">
            <button
              onClick={() => setTripType("oneway")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                tripType === "oneway"
                  ? "bg-cyan text-slate-950 shadow-lg shadow-cyan/25"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>{lang === "ar" ? "ذهاب فقط" : "Aller Simple"}</span>
              <span className="text-[10px] opacity-75 font-bold">(Étudiants)</span>
            </button>
            <button
              onClick={() => setTripType("roundtrip")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                tripType === "roundtrip"
                  ? "bg-cyan text-slate-950 shadow-lg shadow-cyan/25"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>{lang === "ar" ? "ذهاب وعودة" : "Aller-Retour"}</span>
            </button>
          </div>

          {/* Multi-Airport City Badge */}
          {currentDest.isMultiAirport && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
              <span>🏙️ Ville Multi-Aéroports ({currentDest.city})</span>
            </div>
          )}

          {/* Passenger & Baggage Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-slate-200">
              <Users className="w-4 h-4 text-cyan" />
              <span>1 Étudiant (Tarif Boursier)</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300">
              <Luggage className="w-4 h-4 text-emerald-400" />
              <span>Franchise 2 x 23 kg en Soute</span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MAIN AIRLINE TILES GRID (From ⇄ To ➔ Dates)
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 relative z-10 items-stretch">
          {/* Tile 1: Departure Airport (CMN) */}
          <div
            onClick={() => setShowOriginModal(true)}
            className="lg:col-span-3 rounded-2xl p-4 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-cyan/40 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <span className="flex items-center gap-1 text-cyan">
                <MapPin className="w-3 h-3" />
                <span>Départ (Maroc)</span>
              </span>
              <span className="text-[10px] group-hover:text-cyan transition-colors">Modifier ▾</span>
            </div>
            <div className="my-1.5">
              <div className="text-3xl font-black text-white font-mono tracking-wider group-hover:text-cyan transition-colors">
                {currentOrigin.code}
              </div>
              <div className="text-xs font-bold text-slate-200 truncate">{currentOrigin.city}</div>
            </div>
            <div className="text-[10px] text-slate-400 truncate">{currentOrigin.name}</div>
          </div>

          {/* Swap Button (Floating Center Icon) */}
          <div className="lg:col-span-1 flex items-center justify-center -my-2 lg:my-0">
            <button
              type="button"
              onClick={handleSwapAirports}
              title="Inverser Départ et Destination"
              className="w-10 h-10 rounded-full bg-cyan/20 hover:bg-cyan/30 border border-cyan/50 text-cyan flex items-center justify-center transition-all hover:scale-110 active:rotate-180 duration-300 shadow-lg shadow-cyan/20 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tile 2: Arrival Airport (PEK / PVG / TFU / CTU / CAN...) */}
          <div
            onClick={() => setShowDestModal(true)}
            className="lg:col-span-3 rounded-2xl p-4 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-emerald-400/40 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <span className="flex items-center gap-1 text-emerald-400">
                <Building2 className="w-3 h-3" />
                <span>Arrivée (Chine)</span>
              </span>
              <span className="text-[10px] group-hover:text-emerald-400 transition-colors">
                Choisir ({DEST_AIRPORTS.length} aéroports) ▾
              </span>
            </div>
            <div className="my-1.5">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-emerald-400 font-mono tracking-wider group-hover:text-white transition-colors">
                  {currentDest.code}
                </span>
                {currentDest.isMultiAirport && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Multi-Hub
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-200 truncate">{currentDest.city}</div>
            </div>
            <div className="text-[10px] text-slate-400 truncate">{currentDest.name}</div>
          </div>

          {/* Tile 3: Departure Date (Day + Month + Year) */}
          <div
            onClick={() =>
              dateInputRef.current?.showPicker
                ? dateInputRef.current?.showPicker()
                : dateInputRef.current?.focus()
            }
            className={`${
              tripType === "roundtrip" ? "lg:col-span-3" : "lg:col-span-5"
            } rounded-2xl p-4 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-purple/40 transition-all cursor-pointer flex flex-col justify-between group relative`}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <span className="flex items-center gap-1 text-purple-400">
                <CalendarIcon className="w-3 h-3" />
                <span>Date de Départ (Aller)</span>
              </span>
              <span className="text-[10px] text-purple-300 group-hover:text-white transition-colors">
                Choisir le jour ▾
              </span>
            </div>

            <div className="my-1.5">
              <div className="text-xl sm:text-2xl font-black text-white group-hover:text-purple-300 transition-colors">
                {departureDate}
              </div>
              <div className="text-xs font-bold text-slate-300 capitalize">{formattedDateDisplay}</div>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Cliquez pour changer librement le jour ou le mois</span>
            </div>

            {/* Hidden native date input to trigger calendar picker */}
            <input
              ref={dateInputRef}
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer pointer-events-auto w-full h-full"
            />
          </div>

          {/* Tile 4 (Optional): Return Date for Round-Trip */}
          {tripType === "roundtrip" && (
            <div
              onClick={() =>
                returnDateInputRef.current?.showPicker
                  ? returnDateInputRef.current?.showPicker()
                  : returnDateInputRef.current?.focus()
              }
              className="lg:col-span-2 rounded-2xl p-4 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer flex flex-col justify-between group relative"
            >
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1 text-amber-400">
                  <CalendarIcon className="w-3 h-3" />
                  <span>Retour</span>
                </span>
                <span className="text-[10px] text-amber-300">Modifier ▾</span>
              </div>
              <div className="my-1.5">
                <div className="text-lg font-black text-white">{returnDate}</div>
                <div className="text-xs text-slate-300">Juillet 2027</div>
              </div>
              <div className="text-[10px] text-slate-400 truncate">Vacances d'été</div>

              <input
                ref={returnDateInputRef}
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer pointer-events-auto w-full h-full"
              />
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. DYNAMIC 7-DAY FARE STRIP (Like Google Flights / Skyscanner)
        ───────────────────────────────────────────────────────────── */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2.5">
            <span className="flex items-center gap-1.5 text-white font-extrabold">
              <Clock className="w-3.5 h-3.5 text-cyan" />
              <span>Matrice Dynamique des 7 Jours (+/- 3 jours) :</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline-block">
              Cliquez sur un jour pour mettre à jour instantanément les vols
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-1">
            {nearbyDays.map((day) => (
              <button
                key={day.dateStr}
                onClick={() => setDepartureDate(day.dateStr)}
                className={`rounded-2xl p-2.5 sm:p-3 text-center border transition-all duration-200 cursor-pointer flex flex-col items-center justify-between min-w-[75px] ${
                  day.isSelected
                    ? "bg-cyan text-slate-950 font-black border-cyan shadow-xl shadow-cyan/30 scale-105 z-10"
                    : day.isBestDay
                    ? "bg-white/[0.05] hover:bg-white/[0.08] border-emerald-500/40 text-white"
                    : "bg-white/[0.02] hover:bg-white/[0.06] border-white/10 text-slate-300"
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block ${
                    day.isSelected ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {day.dayName}
                </span>
                <span className="text-base sm:text-lg font-black my-0.5 block">
                  {day.dayNum} {day.monthName}
                </span>
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md mt-1 block truncate w-full ${
                    day.isSelected
                      ? "bg-slate-950 text-cyan"
                      : day.isBestDay
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {day.label || "Vol dispo"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            DIRECT LIVE REDIRECTION BUTTONS (Trip.com & Skyscanner)
        ───────────────────────────────────────────────────────────── */}
        <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-300">
            Itinéraire sélectionné :{" "}
            <strong className="text-cyan">
              {currentOrigin.city} ({currentOrigin.code})
            </strong>{" "}
            ➔{" "}
            <strong className="text-emerald-400">
              {currentDest.name}
            </strong>{" "}
            le <strong className="text-white">{departureDate}</strong>
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
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. AIRLINE CARDS (Boarding Pass Ticket Style)
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Compagnies Aériennes Régulières pour {currentDest.city}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan/15 text-cyan border border-cyan/30">
                {matchedFlights.length} liaisons disponibles
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ces vols sont programmés régulièrement. Cliquez sur chaque compagnie pour vérifier la disponibilité exacte à votre date :
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
                      <span className="text-sm font-bold text-cyan">{flight.hub}</span>
                      <span className="text-[10px] text-slate-400 block">{flight.layoverDuration}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Arrivée en Chine
                      </span>
                      <span className="text-sm font-extrabold text-emerald-400">
                        {flight.destAirportName}
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
                    <div className="text-xs text-slate-300">Vérification en 1 clic :</div>
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
          5. MODALS FOR SELECTING ORIGIN & DESTINATION AIRPORTS
      ───────────────────────────────────────────────────────────── */}
      {/* Origin Airport Modal */}
      <AnimatePresence>
        {showOriginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-[#0b1426] border border-cyan/40 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan" />
                  <h3 className="text-base font-black text-white">Sélectionnez l'Aéroport de Départ (Maroc)</h3>
                </div>
                <button
                  onClick={() => setShowOriginModal(false)}
                  className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {ORIGIN_AIRPORTS.map((o) => (
                  <button
                    key={o.code}
                    onClick={() => {
                      setSelectedOrigin(o.code);
                      setShowOriginModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                      selectedOrigin === o.code
                        ? "bg-cyan/15 border-cyan text-white ring-2 ring-cyan/30"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-cyan font-black flex items-center justify-center font-mono">
                        {o.code}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{o.city}</div>
                        <div className="text-xs text-slate-400">{o.name}</div>
                      </div>
                    </div>
                    {selectedOrigin === o.code && <Check className="w-5 h-5 text-cyan" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Destination Airport Modal (With Search & Multi-Airport Categorization) */}
      <AnimatePresence>
        {showDestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-[#0b1426] border border-emerald-500/40 p-6 shadow-2xl space-y-4 max-h-[88vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-base font-black text-white">Sélectionnez la Destination en Chine</h3>
                    <p className="text-[11px] text-slate-400">
                      Villes avec plusieurs aéroports (Chengdu, Pékin, Shanghai) et grands hubs universitaires
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDestModal(false)}
                  className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instant Search Bar */}
              <div className="relative flex-shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par ville, aéroport ou université (ex: Chengdu, Shuangliu, Tianfu, Daxing, Harbin, HIT...)"
                  value={destSearchQuery}
                  onChange={(e) => setDestSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
                {[
                  { id: "all", label: `Tous (${DEST_AIRPORTS.length})` },
                  { id: "multi", label: "🏙️ Multi-Aéroports (Chengdu, Pékin, Shanghai)" },
                  { id: "hubs", label: "🌟 Grands Hubs (Guangzhou, Shenzhen, Wuhan, Hangzhou)" },
                  { id: "univ", label: "🎓 Villes Universitaires (Xi'an, Harbin, Changsha...)" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setDestCategoryFilter(cat.id as any)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      destCategoryFilter === cat.id
                        ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/25"
                        : "bg-white/[0.03] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Airports List */}
              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {filteredDestAirports.length > 0 ? (
                  filteredDestAirports.map((d) => (
                    <button
                      key={d.code}
                      onClick={() => {
                        setSelectedDest(d.code);
                        setShowDestModal(false);
                      }}
                      className={`w-full flex items-start justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                        selectedDest === d.code
                          ? "bg-emerald-500/15 border-emerald-400 text-white ring-2 ring-emerald-500/30"
                          : "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-black flex items-center justify-center font-mono text-base flex-shrink-0">
                          {d.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-white">{d.name}</span>
                            <span className="text-xs text-slate-400 font-normal">({d.chineseName})</span>
                            {d.isMultiAirport && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Multi-Aéroport
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-300 mt-0.5">
                            Ville : <strong>{d.city}</strong> {d.province ? `• Province du ${d.province}` : ""}
                          </div>
                          {d.majorUniversities && (
                            <div className="text-[11px] text-cyan mt-1 flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate max-w-md">Universités : {d.majorUniversities}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedDest === d.code && (
                        <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-1">
                          ✓
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Aucun aéroport trouvé pour "{destSearchQuery}". Essayez un autre mot-clé (ex: Chengdu, Tianfu, Shuangliu, Pékin, Harbin...).
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
