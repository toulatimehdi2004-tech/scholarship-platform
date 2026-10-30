"use client";

import React from "react";
import type { Scholarship } from "@/lib/api";

export type ScholarshipThemeKey =
  | "csc"
  | "silk_road"
  | "presidential"
  | "confucius"
  | "municipal"
  | "stem";

export interface ScholarshipThemeInfo {
  key: ScholarshipThemeKey;
  name: string;
  subtitle: string;
  badgeLabel: string;
  badgeClass: string;
  cardGlow: string;
  borderClass: string;
  accentText: string;
  emblemGradient: string;
  tuitionText: string;
  dormText: string;
  stipendText: string;
  insuranceText: string;
  cscaRequired: boolean;
}

export function getScholarshipTheme(s: Scholarship): ScholarshipThemeInfo {
  const t = (s.title || "").toLowerCase();
  const u = (s.university_name || "").toLowerCase();
  const level = (s.level || "").toLowerCase();
  const isBachelor = level === "bachelor" || level === "licence";

  // 1. Silk Road / Belt & Road
  if (
    t.includes("silk road") ||
    t.includes("belt and road") ||
    t.includes("b&r") ||
    t.includes("route de la soie") ||
    t.includes("一带一路")
  ) {
    return {
      key: "silk_road",
      name: "Bourse Route de la Soie • 一带一路",
      subtitle: "Initiative Stratégique Maritime & Terrestre",
      badgeLabel: "Silk Road Priority 🌍",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      cardGlow: "from-emerald-500/15 via-teal-500/5 to-cyan/10",
      borderClass: "border-emerald-500/30 hover:border-emerald-400/60",
      accentText: "text-emerald-400",
      emblemGradient: "from-emerald-600 via-teal-600 to-cyan",
      tuitionText: "Exonération 100% Totale",
      dormText: "Résidence Campus Gratuite",
      stipendText: isBachelor ? "2,500 RMB / mois" : level === "phd" ? "3,500 RMB / mois" : "3,000 RMB / mois",
      insuranceText: "Assurance Santé Complète (800 RMB)",
      cscaRequired: isBachelor,
    };
  }

  // 2. Confucius Institute / Chinese Language (CIS / HSK)
  if (
    t.includes("confucius") ||
    t.includes("cis") ||
    t.includes("clec") ||
    t.includes("chinese language") ||
    t.includes("langue") ||
    t.includes("hsk") ||
    level === "other"
  ) {
    return {
      key: "confucius",
      name: "Bourse Institut Confucius (CIS / CLEC)",
      subtitle: "Immersion Linguistique & Pédagogique",
      badgeLabel: "HSK / Culture Chinoise 📜",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      cardGlow: "from-rose-500/15 via-red-500/5 to-amber-500/10",
      borderClass: "border-rose-500/30 hover:border-rose-400/60",
      accentText: "text-rose-400",
      emblemGradient: "from-rose-600 via-red-600 to-amber-600",
      tuitionText: "Frais de scolarité offerts",
      dormText: "Dortoir International Gratuit",
      stipendText: "2,500 à 3,000 RMB / mois",
      insuranceText: "Assurance médicale internationale",
      cscaRequired: false,
    };
  }

  // 3. Municipal / Provincial Government (Beijing, Shanghai, Zhejiang, Jiangsu Jasmine, etc.)
  if (
    t.includes("municipal") ||
    t.includes("provincial") ||
    t.includes("government scholarship") && !t.includes("chinese government") ||
    t.includes("jasmine") ||
    t.includes("beijing government") ||
    t.includes("shanghai government") ||
    t.includes("zhejiang provincial") ||
    t.includes("guangdong")
  ) {
    return {
      key: "municipal",
      name: "Bourse du Gouvernement Provincial / Municipal",
      subtitle: "Soutien Territorial de la Métropole",
      badgeLabel: "Financement Régional 🏙️",
      badgeClass: "bg-cyan/20 text-cyan border-cyan/40",
      cardGlow: "from-cyan/15 via-sky-500/5 to-blue-600/10",
      borderClass: "border-cyan/30 hover:border-cyan-400/60",
      accentText: "text-cyan",
      emblemGradient: "from-cyan via-sky-500 to-blue-600",
      tuitionText: "Bourse d'études 10,000 à 40,000 RMB/an",
      dormText: "Subvention Logement ou Dortoir",
      stipendText: "Allocation Annuelle de Subsistance",
      insuranceText: "Assurance Accidents & Maladie",
      cscaRequired: isBachelor,
    };
  }

  // 4. STEM / ANSO / Science & High-Tech Innovation
  if (
    t.includes("anso") ||
    t.includes("science") ||
    t.includes("technology") ||
    t.includes("innovation") ||
    t.includes("fellowship") ||
    t.includes("engineering") ||
    t.includes("phd fellowship")
  ) {
    return {
      key: "stem",
      name: "Bourse d'Excellence STEM & Recherche",
      subtitle: "Haute Technologie, IA & Sciences Avancées",
      badgeLabel: "Innovation & Laboratoires ⚡",
      badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      cardGlow: "from-blue-600/15 via-indigo-500/5 to-cyan/10",
      borderClass: "border-blue-500/30 hover:border-blue-400/60",
      accentText: "text-blue-400",
      emblemGradient: "from-blue-600 via-indigo-600 to-cyan",
      tuitionText: "Exonération intégrale laboratoire",
      dormText: "Appartement Chercheur / Campus",
      stipendText: "3,500 à 4,500 RMB / mois",
      insuranceText: "Couverture médicale & recherche",
      cscaRequired: isBachelor,
    };
  }

  // 5. Presidential / Chancellor / University Excellence
  if (
    t.includes("president") ||
    t.includes("excellence") ||
    t.includes("chancellor") ||
    t.includes("pku") ||
    t.includes("tsinghua") ||
    t.includes("zju global") ||
    t.includes("merit")
  ) {
    return {
      key: "presidential",
      name: "Bourse d'Honneur du Président d'Université",
      subtitle: "Attribution aux Meilleurs Profils Académiques",
      badgeLabel: "Prestige Académique 🎖️",
      badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      cardGlow: "from-purple-500/15 via-indigo-500/5 to-pink-500/10",
      borderClass: "border-purple-500/30 hover:border-purple-400/60",
      accentText: "text-purple-300",
      emblemGradient: "from-purple-600 via-indigo-600 to-pink-600",
      tuitionText: "100% Pris en Charge",
      dormText: "Logement Mérite Universitaire",
      stipendText: "Allocation Mensuelle d'Excellence",
      insuranceText: "Assurance Hospitalisation Inclus",
      cscaRequired: isBachelor,
    };
  }

  // 6. Default: CSC Chinese Government Scholarship (Imperial Dragon Emblem)
  return {
    key: "csc",
    name: "Bourse du Gouvernement Chinois (CSC Type A / B)",
    subtitle: "Programme Officiel du Ministère de l'Éducation (MOE)",
    badgeLabel: "CSC Officiel • Full Ride 👑",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    cardGlow: "from-amber-500/15 via-yellow-500/5 to-orange-500/10",
    borderClass: "border-amber-500/30 hover:border-amber-400/60",
    accentText: "text-amber-400",
    emblemGradient: "from-amber-500 via-yellow-500 to-orange-600",
    tuitionText: "100% Exonéré (Frais Inscription & Cours)",
    dormText: "Logement Universitaire Gratuit",
    stipendText: isBachelor ? "2,500 RMB / mois" : level === "phd" ? "3,500 RMB / mois" : "3,000 RMB / mois",
    insuranceText: "Assurance Médicale Complète (800 RMB/an)",
    cscaRequired: isBachelor,
  };
}

interface ScholarshipEmblemProps {
  themeKey: ScholarshipThemeKey;
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export default function ScholarshipEmblem({
  themeKey,
  size = 56,
  className = "",
  showGlow = true,
}: ScholarshipEmblemProps) {
  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Radiant Background Aura */}
      {showGlow && (
        <div
          className={`absolute inset-0 rounded-2xl blur-md opacity-40 transition-opacity duration-300 group-hover:opacity-75 ${
            themeKey === "csc"
              ? "bg-amber-500"
              : themeKey === "silk_road"
              ? "bg-emerald-500"
              : themeKey === "presidential"
              ? "bg-purple-500"
              : themeKey === "confucius"
              ? "bg-rose-500"
              : themeKey === "municipal"
              ? "bg-cyan"
              : "bg-blue-500"
          }`}
        />
      )}

      {/* Emblem Frame Container */}
      <div
        className={`relative w-full h-full rounded-2xl p-2.5 flex items-center justify-center border shadow-xl backdrop-blur-md transition-all duration-300 group-hover:scale-105 ${
          themeKey === "csc"
            ? "bg-gradient-to-br from-amber-500/20 via-yellow-950/40 to-slate-950 border-amber-500/50 shadow-amber-500/20"
            : themeKey === "silk_road"
            ? "bg-gradient-to-br from-emerald-500/20 via-teal-950/40 to-slate-950 border-emerald-500/50 shadow-emerald-500/20"
            : themeKey === "presidential"
            ? "bg-gradient-to-br from-purple-500/20 via-indigo-950/40 to-slate-950 border-purple-500/50 shadow-purple-500/20"
            : themeKey === "confucius"
            ? "bg-gradient-to-br from-rose-500/20 via-red-950/40 to-slate-950 border-rose-500/50 shadow-rose-500/20"
            : themeKey === "municipal"
            ? "bg-gradient-to-br from-cyan/20 via-sky-950/40 to-slate-950 border-cyan/50 shadow-cyan/20"
            : "bg-gradient-to-br from-blue-500/20 via-indigo-950/40 to-slate-950 border-blue-500/50 shadow-blue-500/20"
        }`}
      >
        {/* Render specific custom SVG symbol */}
        {themeKey === "csc" && <CSCDragonSymbol />}
        {themeKey === "silk_road" && <SilkRoadCompassSymbol />}
        {themeKey === "presidential" && <PresidentialShieldSymbol />}
        {themeKey === "confucius" && <ConfuciusScrollSymbol />}
        {themeKey === "municipal" && <MunicipalSkylineSymbol />}
        {themeKey === "stem" && <STEMQuantumSymbol />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. CSC Imperial Dragon & Five Golden Stars Symbol (Gold/Amber)
// ─────────────────────────────────────────────────────────────
function CSCDragonSymbol() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full fill-none">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Decorative Outer Imperial Medallion Ring */}
      <circle cx="24" cy="24" r="21" stroke="url(#goldGrad)" strokeWidth="1.2" strokeDasharray="3 1.5" opacity="0.75" />
      <circle cx="24" cy="24" r="18.5" stroke="url(#goldGrad)" strokeWidth="0.8" opacity="0.5" />

      {/* Central Dragon Crest Silhouette */}
      <path
        d="M24 10C21.5 10 18 11.5 16.5 14C15 16.5 16 19 18 20.5C21 22.5 24 21 27 23C29.5 24.5 30 27 28.5 29C27 31 24.5 32 22 31.5C19 31 18 28.5 16 28C14 27.5 12 29 12 31C12 34 16 37 24 37C32 37 36 32 36 26.5C36 21 31.5 19 28 17.5C25 16 24 14.5 24.5 13C25 11.5 26.5 11 28 11.5"
        stroke="url(#goldGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#goldGlow)"
      />

      {/* Dragon Head Horn & Whiskers */}
      <path d="M16.5 14L13 11M17 12L15 8" stroke="url(#goldGrad)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="18" cy="14" r="1.3" fill="#ffffff" />

      {/* Imperial Flaming Pearl at center top */}
      <circle cx="29" cy="12" r="2.2" fill="url(#goldGrad)" />
      <path d="M29 8V9.5M32 10.5L30.8 11.2M32.5 13.5H31" stroke="url(#goldGrad)" strokeWidth="1.2" strokeLinecap="round" />

      {/* 5 Golden Stars at Bottom Arc */}
      <path d="M24 39L24.5 40.5H26L24.8 41.3L25.2 42.7L24 41.8L22.8 42.7L23.2 41.3L22 40.5H23.5L24 39Z" fill="url(#goldGrad)" />
      <circle cx="18" cy="40.5" r="1" fill="url(#goldGrad)" />
      <circle cx="30" cy="40.5" r="1" fill="url(#goldGrad)" />
      <circle cx="13" cy="38" r="0.8" fill="url(#goldGrad)" />
      <circle cx="35" cy="38" r="0.8" fill="url(#goldGrad)" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Silk Road Astrolabe & Compass Symbol (Emerald/Jade)
// ─────────────────────────────────────────────────────────────
function SilkRoadCompassSymbol() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full fill-none">
      <defs>
        <linearGradient id="jadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      {/* Astrolabe Circular Dial */}
      <circle cx="24" cy="24" r="21" stroke="url(#jadeGrad)" strokeWidth="1.2" strokeDasharray="1.5 2" />
      <circle cx="24" cy="24" r="18" stroke="url(#jadeGrad)" strokeWidth="0.8" opacity="0.6" />

      {/* Four Cardinal Compass Points */}
      <polygon points="24,6 27,21 24,19 21,21" fill="url(#jadeGrad)" />
      <polygon points="24,42 27,27 24,29 21,27" fill="url(#jadeGrad)" opacity="0.75" />
      <polygon points="42,24 27,27 29,24 27,21" fill="url(#jadeGrad)" />
      <polygon points="6,24 21,27 19,24 21,21" fill="url(#jadeGrad)" opacity="0.75" />

      {/* Silk Ribbon Caravan Path crossing compass */}
      <path
        d="M10 32C14 26 19 30 24 24C29 18 34 22 38 16"
        stroke="#6ee7b7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="0 0"
      />
      <circle cx="24" cy="24" r="3.2" fill="#022c22" stroke="url(#jadeGrad)" strokeWidth="1.8" />
      <circle cx="24" cy="24" r="1.4" fill="#ffffff" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Presidential Academic Tower Shield & Laurel (Purple/Indigo)
// ─────────────────────────────────────────────────────────────
function PresidentialShieldSymbol() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full fill-none">
      <defs>
        <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>
      </defs>

      {/* Academic Crest Shield */}
      <path
        d="M24 7L37 12V24C37 32.5 31.5 39 24 42C16.5 39 11 32.5 11 24V12L24 7Z"
        stroke="url(#purpleGrad)"
        strokeWidth="2"
        fill="rgba(168, 85, 247, 0.12)"
      />

      {/* University Tower Silhouette */}
      <path
        d="M21 16H27V21H29V25H19V21H21V16ZM22.5 13H25.5V16H22.5V13Z"
        fill="url(#purpleGrad)"
      />

      {/* Open Knowledge Codex / Book */}
      <path
        d="M17 31C19.5 30 22 30.5 24 32C26 30.5 28.5 30 31 31V35C28.5 34 26 34.5 24 36C22 34.5 19.5 34 17 35V31Z"
        fill="#ffffff"
        opacity="0.9"
      />

      {/* Laurel Crown Sprigs */}
      <path
        d="M8 20C7 24 8 29 11 33M40 20C41 24 40 29 37 33"
        stroke="url(#purpleGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. Confucius Bamboo Scroll & Lotus Seal (Ruby/Rose)
// ─────────────────────────────────────────────────────────────
function ConfuciusScrollSymbol() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full fill-none">
      <defs>
        <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="50%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#9f1239" />
        </linearGradient>
      </defs>

      {/* Hanging Chinese Calligraphy Scroll */}
      <rect x="14" y="8" width="20" height="30" rx="3" fill="rgba(244, 63, 94, 0.15)" stroke="url(#roseGrad)" strokeWidth="1.8" />
      <line x1="12" y1="8" x2="36" y2="8" stroke="url(#roseGrad)" strokeWidth="3" strokeLinecap="round" />
      <line x1="12" y1="38" x2="36" y2="38" stroke="url(#roseGrad)" strokeWidth="3" strokeLinecap="round" />

      {/* Chinese Calligraphy Characters & Brush Strokes */}
      <line x1="18" y1="14" x2="30" y2="14" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      <line x1="24" y1="14" x2="24" y2="24" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      <line x1="19" y1="19" x2="29" y2="19" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      <line x1="18" y1="24" x2="30" y2="24" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />

      {/* Red Imperial Lotus Seal Stamp at bottom right */}
      <rect x="23" y="27" width="8" height="8" rx="1.5" fill="#f43f5e" />
      <path d="M25 31L27 29L29 31L27 33Z" fill="#ffffff" />

      {/* Hanging Silk Tassel cord */}
      <path d="M24 39V44M23 44H25" stroke="url(#roseGrad)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. Municipal Metropolis Skyline & Gateway (Electric Cyan)
// ─────────────────────────────────────────────────────────────
function MunicipalSkylineSymbol() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full fill-none">
      <defs>
        <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>

      {/* Hexagonal City Portal Badge */}
      <polygon
        points="24,6 40,15 40,33 24,42 8,33 8,15"
        stroke="url(#cyanGrad)"
        strokeWidth="1.8"
        fill="rgba(6, 182, 212, 0.12)"
      />

      {/* Illuminated Futuristic Modern Skyline Silhouette */}
      <path
        d="M13 34V26H17V34M17 22H21V34M21 16H27V34M27 24H31V34M31 27H35V34"
        stroke="url(#cyanGrad)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Oriental Pearl / Tower spire */}
      <line x1="24" y1="11" x2="24" y2="16" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="11" r="1.5" fill="#ffffff" />
      <line x1="11" y1="34" x2="37" y2="34" stroke="url(#cyanGrad)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. STEM & High-Tech Quantum Atom (Cobalt Blue)
// ─────────────────────────────────────────────────────────────
function STEMQuantumSymbol() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full fill-none">
      <defs>
        <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
      </defs>

      {/* 3 Intersecting Quantum Orbital Ellipses */}
      <ellipse cx="24" cy="24" rx="18" ry="7" stroke="url(#stemGrad)" strokeWidth="1.6" transform="rotate(0 24 24)" />
      <ellipse cx="24" cy="24" rx="18" ry="7" stroke="url(#stemGrad)" strokeWidth="1.6" transform="rotate(60 24 24)" />
      <ellipse cx="24" cy="24" rx="18" ry="7" stroke="url(#stemGrad)" strokeWidth="1.6" transform="rotate(120 24 24)" />

      {/* Core Glowing Photon Nucleus */}
      <circle cx="24" cy="24" r="4.2" fill="#ffffff" />
      <circle cx="24" cy="24" r="2.2" fill="#2563eb" />

      {/* Orbiting Quantum Particles */}
      <circle cx="41" cy="24" r="1.8" fill="#93c5fd" />
      <circle cx="15.5" cy="9.3" r="1.8" fill="#93c5fd" />
      <circle cx="15.5" cy="38.7" r="1.8" fill="#93c5fd" />
    </svg>
  );
}
