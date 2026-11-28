"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Plane,
  Home,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Sparkles,
  HelpCircle,
  Coins,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Wallet,
} from "lucide-react";
import type { ScholarshipDetail, CostBreakdownResult } from "@/lib/api";
import { getScholarshipCostBreakdown } from "@/lib/api";

interface RealCostCalculatorTabProps {
  scholarship: ScholarshipDetail;
}

// Exchange rates for live multi-currency display
const CNY_TO_MAD = 1.40;
const CNY_TO_USD = 0.139;
const USD_TO_CNY = 7.20;

type DisplayCurrency = "MAD" | "CNY" | "USD";

export default function RealCostCalculatorTab({
  scholarship,
}: RealCostCalculatorTabProps) {
  // ── Two Required Switches ───────────────────────────────────
  const [includeFlight, setIncludeFlight] = useState(true);
  const [liveOnCampus, setLiveOnCampus] = useState(true);
  const [currency, setCurrency] = useState<DisplayCurrency>("MAD");
  const [apiData, setApiData] = useState<CostBreakdownResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch breakdown from backend API
  useEffect(() => {
    let isCancelled = false;
    async function loadBreakdown() {
      if (!scholarship?.id) return;
      setLoading(true);
      try {
        const res = await getScholarshipCostBreakdown(scholarship.id, {
          includeFlight,
          liveOnCampus,
        });
        if (!isCancelled && res.data) {
          setApiData(res.data);
        }
      } catch (err) {
        console.error("Failed to load cost breakdown:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadBreakdown();
    return () => {
      isCancelled = true;
    };
  }, [scholarship?.id, includeFlight, liveOnCampus]);

  // Client-side instant calculation fallback
  const calculatedData = useMemo(() => {
    const cityName = scholarship.university_city || scholarship.university?.city || "Beijing";
    const isTier1 = ["beijing", "shanghai", "guangzhou", "shenzhen"].some((c) =>
      cityName.toLowerCase().includes(c)
    );

    const dormRate = isTier1 ? 900 : 550;
    const offcampusRate = isTier1 ? 3500 : 1800;
    const foodRate = isTier1 ? 1800 : 1200;

    // 1. Upfront Cash
    let rawAppFee = parseFloat(scholarship.application_fee as any) || 0;
    const curr = (scholarship.currency || "USD").toUpperCase();
    const appFeeCny = curr === "USD" ? rawAppFee * USD_TO_CNY : rawAppFee;
    const visaDocsCny = parseFloat(scholarship.estimated_visa_medical_docs_cost as any) || 1500;
    const coversFlight = Boolean(scholarship.covers_flight);
    const flightCny = coversFlight ? 0 : includeFlight ? 5500 : 0;

    const totalUpfrontCny = appFeeCny + visaDocsCny + flightCny;

    // 2. Monthly Living
    const stipendCny = parseFloat(scholarship.monthly_stipend as any) || (scholarship.type === "full" ? 3000 : 0);
    const coversDorm = scholarship.covers_dorm !== undefined ? Boolean(scholarship.covers_dorm) : scholarship.type === "full";
    const rentCny = liveOnCampus ? (coversDorm ? 0 : dormRate) : offcampusRate;
    const expensesCny = rentCny + foodRate;
    const balanceCny = stipendCny - expensesCny;

    return {
      cityName,
      coversFlight,
      coversDorm,
      appFeeCny,
      visaDocsCny,
      flightCny,
      totalUpfrontCny,
      stipendCny,
      dormRate,
      rentCny,
      foodRate,
      expensesCny,
      balanceCny,
      isSurplus: balanceCny >= 0,
    };
  }, [scholarship, includeFlight, liveOnCampus]);

  // Currency Formatter Helper
  function formatMoney(amountCny: number): string {
    if (currency === "MAD") {
      const val = amountCny * CNY_TO_MAD;
      return `${Math.abs(val).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} MAD`;
    }
    if (currency === "USD") {
      const val = amountCny * CNY_TO_USD;
      return `$${Math.abs(val).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
    return `${Math.abs(amountCny).toLocaleString("en-US", { maximumFractionDigits: 0 })} RMB`;
  }

  const {
    cityName,
    coversFlight,
    coversDorm,
    appFeeCny,
    visaDocsCny,
    flightCny,
    totalUpfrontCny,
    stipendCny,
    dormRate,
    rentCny,
    foodRate,
    balanceCny,
    isSurplus,
  } = calculatedData;

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & CONTROLS: TWO SWITCHES + CURRENCY PICKER
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0c152a] via-[#091020] to-[#0d1830] border border-cyan/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan/15 text-cyan border border-cyan/30 mb-2">
              <Coins className="w-3.5 h-3.5" />
              <span>Financial Honesty & Transparency Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Real Cost & Living Balance Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Explore your exact out-of-pocket budget for studying in <strong>{cityName}</strong>.
              Toggle flight tickets and housing to reveal the real numbers before you apply.
            </p>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-2 self-start lg:self-auto bg-black/40 p-1 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-slate-400 pl-2 pr-1 hidden sm:inline">
              Devise :
            </span>
            {(["MAD", "CNY", "USD"] as DisplayCurrency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currency === c
                    ? "bg-cyan text-slate-950 shadow-md shadow-cyan/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {c === "MAD" ? "🇲🇦 MAD (Dirham)" : c === "CNY" ? "🇨🇳 CNY (Yuan)" : "🇺🇸 USD ($)"}
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            THE TWO MAIN SWITCHES
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          {/* Switch 1: Include Flight Ticket? */}
          <div
            onClick={() => setIncludeFlight(!includeFlight)}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
              includeFlight
                ? "bg-cyan/10 border-cyan/40 shadow-lg shadow-cyan/5"
                : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  includeFlight
                    ? "bg-cyan text-slate-950 font-black shadow-md shadow-cyan/20"
                    : "bg-white/10 text-slate-400"
                }`}
              >
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  Include Flight Ticket?
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {coversFlight
                    ? "👑 Airfare is 100% covered by this scholarship!"
                    : includeFlight
                    ? `Adds ~${formatMoney(5500)} for flight ticket`
                    : "Excluded (Ticket paid or booked separately)"}
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <div
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center flex-shrink-0 ${
                includeFlight ? "bg-cyan justify-end" : "bg-slate-700 justify-start"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-slate-950 shadow-md" />
            </div>
          </div>

          {/* Switch 2: Live in Campus Dorm? */}
          <div
            onClick={() => setLiveOnCampus(!liveOnCampus)}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
              liveOnCampus
                ? "bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/5"
                : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  liveOnCampus
                    ? "bg-purple-500 text-white font-black shadow-md shadow-purple-500/20"
                    : "bg-white/10 text-slate-400"
                }`}
              >
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  Live in Campus Dorm?
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {liveOnCampus
                    ? coversDorm
                      ? "👑 0 DH Dormitory (Covered by scholarship)"
                      : "On-campus subsidized dorm"
                    : `Private off-campus rental in ${cityName}`}
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <div
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center flex-shrink-0 ${
                liveOnCampus ? "bg-purple-500 justify-end" : "bg-slate-700 justify-start"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-slate-950 shadow-md" />
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TWO PRIMARY SUMMARY CARDS (Large, Bold, Easy-to-Read)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── CARD 1: Cash Needed Before Travel ─────────────────────── */}
        <div className="rounded-3xl bg-[#0a1122]/95 border border-amber-500/30 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Wallet className="w-3.5 h-3.5" />
                <span>Upfront Preparation Budget</span>
              </span>
              <span className="text-xs text-slate-400">One-time payment</span>
            </div>

            <h3 className="text-base font-bold text-slate-300">
              Cash Needed Before Travel
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Out-of-pocket cash required before boarding your flight to China.
            </p>

            {/* Big Main Number */}
            <div className="my-5 p-5 rounded-2xl bg-black/40 border border-amber-500/20 text-center sm:text-left flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                  {formatMoney(totalUpfrontCny)}
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  ({totalUpfrontCny.toLocaleString()} RMB • ~${(totalUpfrontCny * CNY_TO_USD).toFixed(0)} USD)
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider self-center sm:self-auto">
                Total Initial Cash
              </span>
            </div>

            {/* Itemized Line Items */}
            <div className="space-y-2.5">
              {/* Line 1: Application Fee */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan" />
                  <span className="text-slate-200 font-medium">Application Fee:</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">
                    {appFeeCny === 0 ? "0 DH (Free Application 👑)" : formatMoney(appFeeCny)}
                  </span>
                </div>
              </div>

              {/* Line 2: Visa, Medical & Legalization */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <div>
                    <span className="text-slate-200 font-medium block">
                      Visa, Medical & Apostille:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      X1 Visa, Foreigner Physical Exam, Notarization
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">{formatMoney(visaDocsCny)}</span>
                </div>
              </div>

              {/* Line 3: Flight Ticket */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <div>
                    <span className="text-slate-200 font-medium block">
                      Flight Ticket (e.g. Morocco ➔ China):
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {coversFlight
                        ? "Airfare included in scholarship"
                        : includeFlight
                        ? "One-way ticket to China"
                        : "Toggle switch turned OFF"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">
                    {coversFlight ? "0 DH (Free Airfare 👑)" : formatMoney(flightCny)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Official embassy rates. No third-party agency markup.</span>
          </div>
        </div>

        {/* ── CARD 2: Monthly Balance (Surplus or Deficit) ──────────── */}
        <div
          className={`rounded-3xl bg-[#0a1122]/95 border p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group ${
            isSurplus ? "border-emerald-500/40" : "border-rose-500/40"
          }`}
        >
          <div
            className={`absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
              isSurplus ? "bg-emerald-500/10" : "bg-rose-500/10"
            }`}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  isSurplus
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                {isSurplus ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Monthly Surplus (Pocket Savings)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Monthly Deficit (Self-Funding)</span>
                  </>
                )}
              </span>
              <span className="text-xs text-slate-400">Every 30 days in China</span>
            </div>

            <h3 className="text-base font-bold text-slate-300">
              Monthly Balance (Surplus or Deficit)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Net balance after university rent, daily meals, and city transport in {cityName}.
            </p>

            {/* Big Main Number */}
            <div
              className={`my-5 p-5 rounded-2xl border text-center sm:text-left flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 ${
                isSurplus
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : "bg-rose-950/20 border-rose-500/30"
              }`}
            >
              <div>
                <span
                  className={`text-3xl sm:text-4xl font-black tracking-tight ${
                    isSurplus ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isSurplus ? "+" : "-"}
                  {formatMoney(Math.abs(balanceCny))}
                  <span className="text-lg font-bold text-slate-400"> / month</span>
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  ({Math.abs(balanceCny).toLocaleString()} RMB/mo • ~${(Math.abs(balanceCny) * CNY_TO_USD).toFixed(0)} USD/mo)
                </span>
              </div>
              <span
                className={`text-[11px] font-black uppercase tracking-wider self-center sm:self-auto px-2.5 py-1 rounded-lg ${
                  isSurplus
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300"
                }`}
              >
                {isSurplus ? "Money Saved" : "Money to Provide"}
              </span>
            </div>

            {/* Itemized Line Items */}
            <div className="space-y-2.5">
              {/* Line 1: Monthly Stipend */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-200 font-medium">Monthly Living Stipend:</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400">
                    +{formatMoney(stipendCny)} / mo
                  </span>
                </div>
              </div>

              {/* Line 2: Accommodation / Rent */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan" />
                  <div>
                    <span className="text-slate-200 font-medium block">
                      {liveOnCampus ? "On-Campus Dormitory:" : "Off-Campus Apartment:"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {liveOnCampus && coversDorm
                        ? "100% Free on-campus room provided by scholarship"
                        : `Estimated housing cost in ${cityName}`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">
                    {liveOnCampus && coversDorm
                      ? "0 DH (Free 👑)"
                      : `-${formatMoney(rentCny)} / mo`}
                  </span>
                </div>
              </div>

              {/* Line 3: Food & Transit */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <div>
                    <span className="text-slate-200 font-medium block">
                      Canteen Food & Transit ({cityName}):
                    </span>
                    <span className="text-[10px] text-slate-400">
                      3 meals/day in campus dining hall + city metro
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">
                    -{formatMoney(foodRate)} / mo
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-cyan flex-shrink-0" />
            <span>
              {isSurplus
                ? "Full scholarship protection: No need to ask family for living money!"
                : "Plan monthly allowances from family to cover living expenses."}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. HONEST ANNUAL BUDGET TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-[#0b1324] border border-white/10 p-6 sm:p-7 shadow-xl">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-cyan" />
          <span>Complete 1-Year Financial Forecast for {cityName}</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Expense Category</th>
                <th className="pb-3 font-semibold">Coverage Status</th>
                <th className="pb-3 font-semibold text-right">Student Out-of-Pocket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-3 font-medium text-white">Tuition & Enrollment Fees</td>
                <td className="py-3 text-emerald-400 font-bold">100% Free Waiver (0 DH)</td>
                <td className="py-3 text-right font-black text-emerald-400">0 DH</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Accommodation (Campus Dorm)</td>
                <td className="py-3">
                  {coversDorm ? (
                    <span className="text-emerald-400 font-bold">Included Free in Scholarship</span>
                  ) : (
                    <span className="text-amber-400 font-bold">Student Paid (~{dormRate} RMB/mo)</span>
                  )}
                </td>
                <td className="py-3 text-right font-bold">
                  {coversDorm && liveOnCampus ? "0 DH" : formatMoney(rentCny * 12)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Health & Medical Insurance</td>
                <td className="py-3 text-emerald-400 font-bold">Included Free (800 RMB/yr)</td>
                <td className="py-3 text-right font-black text-emerald-400">0 DH</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Yearly Food & Living Transit</td>
                <td className="py-3 text-slate-400">Paid from Monthly Stipend</td>
                <td className="py-3 text-right font-bold text-slate-200">
                  {formatMoney(foodRate * 12)}
                </td>
              </tr>
              <tr className="bg-white/[0.02]">
                <td className="py-3.5 font-bold text-white">Total 1st Year Out-of-Pocket Cash</td>
                <td className="py-3.5 text-slate-400">Upfront + Living Deficit (if any)</td>
                <td className="py-3.5 text-right font-black text-cyan text-sm">
                  {isSurplus
                    ? formatMoney(totalUpfrontCny)
                    : formatMoney(totalUpfrontCny + Math.abs(balanceCny) * 12)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
