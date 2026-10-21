"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Home,
  HeartPulse,
  Banknote,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

type Currency = "RMB" | "MAD" | "USD" | "EUR";

interface CurrencyConfig {
  code: Currency;
  name: string;
  flag: string;
  symbol: string;
  rate: number; // 1 RMB = rate in currency
  format: (val: number) => string;
}

interface FundingBreakdownCardProps {
  scholarshipTitle: string;
  level?: string;
  type?: string;
  stipendAmount?: number | null;
  className?: string;
}

export default function FundingBreakdownCard({
  scholarshipTitle,
  level = "master",
  type = "full",
  stipendAmount,
  className = "",
}: FundingBreakdownCardProps) {
  const { t, lang } = useLang();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("MAD");

  const currencies: Record<Currency, CurrencyConfig> = {
    RMB: {
      code: "RMB",
      name: lang === "ar" ? "اليوان الصيني" : lang === "fr" ? "Yuan Chinois" : "Chinese Yuan",
      flag: "🇨🇳",
      symbol: "¥",
      rate: 1.0,
      format: (v) => `¥${Math.round(v).toLocaleString()}`,
    },
    MAD: {
      code: "MAD",
      name: lang === "ar" ? "الدرهم المغربي" : lang === "fr" ? "Dirham Marocain" : "Moroccan Dirham",
      flag: "🇲🇦",
      symbol: lang === "ar" ? "د.م." : "DH",
      rate: 1.38,
      format: (v) =>
        lang === "ar"
          ? `${Math.round(v).toLocaleString()} د.م.`
          : `${Math.round(v).toLocaleString()} DH`,
    },
    USD: {
      code: "USD",
      name: lang === "ar" ? "الدولار الأمريكي" : lang === "fr" ? "Dollar US" : "US Dollar",
      flag: "🇺🇸",
      symbol: "$",
      rate: 0.14,
      format: (v) => `$${Math.round(v).toLocaleString()}`,
    },
    EUR: {
      code: "EUR",
      name: lang === "ar" ? "اليورو" : lang === "fr" ? "Euro" : "Euro",
      flag: "🇪🇺",
      symbol: "€",
      rate: 0.13,
      format: (v) => `€${Math.round(v).toLocaleString()}`,
    },
  };

  // Determine base values in RMB based on level
  const normLevel = (level || "master").toLowerCase();
  const isFull = type === "full";

  // Tuition annual value in RMB
  const tuitionRmb = normLevel.includes("phd")
    ? 45000
    : normLevel.includes("master")
    ? 35000
    : 28000;

  // Monthly stipend in RMB
  const monthlyStipendRmb =
    stipendAmount && stipendAmount > 500
      ? stipendAmount
      : normLevel.includes("phd")
      ? 3500
      : normLevel.includes("master")
      ? 3000
      : 2500;

  const annualStipendRmb = isFull ? monthlyStipendRmb * 12 : 0;
  const dormAnnualRmb = isFull ? 12000 : 0;
  const insuranceAnnualRmb = 800;

  const totalAnnualRmb = tuitionRmb + annualStipendRmb + dormAnnualRmb + insuranceAnnualRmb;

  const curr = currencies[selectedCurrency];

  // Convert to active currency
  const tuitionDisplay = curr.format(tuitionRmb * curr.rate);
  const monthlyStipendDisplay = curr.format(monthlyStipendRmb * curr.rate);
  const annualStipendDisplay = curr.format(annualStipendRmb * curr.rate);
  const dormDisplay = curr.format(dormAnnualRmb * curr.rate);
  const insuranceDisplay = curr.format(insuranceAnnualRmb * curr.rate);
  const totalDisplay = curr.format(totalAnnualRmb * curr.rate);

  // Percent breakdown
  const tuitionPct = Math.round((tuitionRmb / totalAnnualRmb) * 100);
  const stipendPct = Math.round((annualStipendRmb / totalAnnualRmb) * 100);
  const dormPct = Math.round((dormAnnualRmb / totalAnnualRmb) * 100);
  const insPct = 100 - tuitionPct - stipendPct - dormPct;

  // Degree length and multi-year calculations
  const degreeYears = normLevel.includes("phd") ? 4 : normLevel.includes("master") ? 3 : 4;
  const multiYearDisplay = curr.format(totalAnnualRmb * degreeYears * curr.rate);
  const degDurationLabel = normLevel.includes("phd")
    ? t("funding.degPhd")
    : normLevel.includes("master")
    ? t("funding.degMaster")
    : t("funding.degBachelor");

  const zeroCostDisplay =
    selectedCurrency === "MAD"
      ? (lang === "ar" ? "0 د.م." : "0 DH")
      : `${curr.symbol}0`;

  return (
    <div
      className={`glass rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.07] via-surface to-cyan/[0.03] shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Background glow orb */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header & Currency Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {t("funding.modelBadge")}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-text-secondary">
              {t("funding.verifiedRates")}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary flex items-center gap-2">
            <span>{t("funding.title")}</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            {t("funding.subtitle")}
          </p>
        </div>

        {/* Currency Switcher Toggle */}
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 self-start lg:self-center backdrop-blur-md">
          {(Object.keys(currencies) as Currency[]).map((cKey) => {
            const item = currencies[cKey];
            const active = selectedCurrency === cKey;
            return (
              <button
                key={cKey}
                onClick={() => setSelectedCurrency(cKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-lg shadow-emerald-500/30 font-extrabold"
                    : "text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"
                }`}
              >
                <span>{item.flag}</span>
                <span>{item.code}</span>
                <span className="opacity-70 text-[10px]">({item.symbol})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Financial Value Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
        <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan/10 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-300 mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {t("funding.annualWorth")}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
              ~{totalDisplay} <span className="text-sm font-semibold text-emerald-400">{t("funding.perYear")}</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {t("funding.heroDesc")}
            </p>
          </div>
          <div className="flex-shrink-0 text-start sm:text-end sm:border-s sm:border-white/10 sm:ps-5">
            <div className="text-xs text-text-muted">{t("funding.multiYear")}</div>
            <div className="text-lg font-extrabold text-cyan mt-0.5">
              ~{multiYearDisplay}
            </div>
            <div className="text-[10px] text-text-muted">
              {degDurationLabel}
            </div>
          </div>
        </div>

        {/* Student Out-of-Pocket Highlight */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t("funding.netCost")}</span>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {zeroCostDisplay}
          </div>
          <p className="text-[11px] text-text-secondary mt-1">
            {isFull ? t("funding.fullyFundedDesc") : t("funding.subsidizedDesc")}
          </p>
        </div>
      </div>

      {/* Visual Composition Bar */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
          <span>{t("funding.allocationComposition")}</span>
          <span className="text-text-secondary font-mono">{totalDisplay} {t("funding.total")}</span>
        </div>
        <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${tuitionPct}%` }}
            className="bg-emerald-400 h-full transition-all"
            title={`${t("funding.tuitionWaiver")}: ${tuitionPct}%`}
          />
          <div
            style={{ width: `${stipendPct}%` }}
            className="bg-purple-400 h-full transition-all"
            title={`${t("funding.livingStipend")}: ${stipendPct}%`}
          />
          <div
            style={{ width: `${dormPct}%` }}
            className="bg-cyan h-full transition-all"
            title={`${t("funding.freeDorm")}: ${dormPct}%`}
          />
          <div
            style={{ width: `${insPct}%` }}
            className="bg-blue-400 h-full transition-all"
            title={`${t("funding.medicalCover")}: ${insPct}%`}
          />
        </div>
        <div className="flex flex-wrap gap-4 mt-2.5 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            {t("funding.tuitionWaiver")} ({tuitionPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            {t("funding.livingStipend")} ({stipendPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan" />
            {t("funding.freeDorm")} ({dormPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            {t("funding.medicalCover")} ({insPct}%)
          </span>
        </div>
      </div>

      {/* Line-By-Line Benefit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* 1. Tuition Waiver */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-xs text-text-muted font-medium">{t("funding.card1Title")}</div>
            <div className="text-lg font-black text-emerald-400 mt-1">
              {tuitionDisplay} <span className="text-xs font-normal text-text-muted">{t("funding.perYr")}</span>
            </div>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
              {t("funding.card1Desc")}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-text-muted font-mono">
            {t("funding.card1Stat")}
          </div>
        </motion.div>

        {/* 2. Monthly Living Allowance */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple/40 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-purple/20 text-purple flex items-center justify-center mb-3">
              <Banknote className="w-5 h-5" />
            </div>
            <div className="text-xs text-text-muted font-medium">{t("funding.card2Title")}</div>
            <div className="text-lg font-black text-purple mt-1">
              {monthlyStipendDisplay} <span className="text-xs font-normal text-text-muted">{t("funding.perMo")}</span>
            </div>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
              {t("funding.card2Desc")}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-purple-300 font-mono">
            {t("funding.card2Annual")} {annualStipendDisplay}
          </div>
        </motion.div>

        {/* 3. On-Campus Dormitory */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan/40 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-cyan/20 text-cyan flex items-center justify-center mb-3">
              <Home className="w-5 h-5" />
            </div>
            <div className="text-xs text-text-muted font-medium">{t("funding.card3Title")}</div>
            <div className="text-lg font-black text-cyan mt-1">
              {dormDisplay} <span className="text-xs font-normal text-text-muted">{t("funding.perYr")}</span>
            </div>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
              {t("funding.card3Desc")}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-cyan font-mono">
            {t("funding.card3Stat")} {zeroCostDisplay}
          </div>
        </motion.div>

        {/* 4. Comprehensive Medical Insurance */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-blue-400/40 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="text-xs text-text-muted font-medium">{t("funding.card4Title")}</div>
            <div className="text-lg font-black text-blue-400 mt-1">
              {insuranceDisplay} <span className="text-xs font-normal text-text-muted">{t("funding.perYr")}</span>
            </div>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
              {t("funding.card4Desc")}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-blue-300 font-mono">
            {t("funding.card4Stat")}
          </div>
        </motion.div>
      </div>

      {/* Exchange Rate Disclaimer */}
      <div className="mt-5 text-[11px] text-text-muted flex items-center justify-between flex-wrap gap-2 pt-4 border-t border-white/5">
        <span>{t("funding.liveRef")}</span>
        <span className="text-text-secondary">{t("funding.officialStandard")}</span>
      </div>
    </div>
  );
}
