"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Banknote,
  GraduationCap,
  Home,
  HeartPulse,
  DollarSign,
  Plane,
  FileText,
  Info,
} from "lucide-react";
import type { Scholarship, ScholarshipDetail } from "@/lib/api";
import { useLang } from "@/lib/i18n";

interface FinancialHonestyLedgerProps {
  scholarship: Scholarship | ScholarshipDetail;
  className?: string;
}

export default function FinancialHonestyLedger({
  scholarship,
  className = "",
}: FinancialHonestyLedgerProps) {
  const { lang } = useLang();
  const [currency, setCurrency] = useState<"MAD" | "RMB">("MAD");

  const titleLower = (scholarship.title || "").toLowerCase();
  const typeLower = (scholarship.type || "").toLowerCase();
  const level = (scholarship.level || "master").toLowerCase();
  const isBachelor = level === "bachelor" || level === "licence";
  const isPhd = level === "phd" || level === "doctorat";

  const isFull =
    typeLower === "full" ||
    titleLower.includes("full") ||
    titleLower.includes("csc") ||
    titleLower.includes("cgs") ||
    titleLower.includes("type a") ||
    titleLower.includes("type b") ||
    titleLower.includes("bilateral") ||
    titleLower.includes("high-level") ||
    titleLower.includes("fellowship");

  // Conversion rate: 1 RMB ≈ 1.38 MAD
  const rmbToMad = (rmb: number) => Math.round(rmb * 1.38);

  const formatCost = (rmb: number, labelSuffix = "") => {
    if (currency === "MAD") {
      return `${rmbToMad(rmb).toLocaleString()} DH${labelSuffix}`;
    }
    return `¥${rmb.toLocaleString()} RMB${labelSuffix}`;
  };

  const stipendRmb = isPhd ? 3500 : isBachelor ? 2500 : 3000;
  const tuitionValueRmb = isPhd ? 50000 : isBachelor ? 28000 : 38000;

  return (
    <div
      className={`rounded-3xl bg-[#0b1325]/90 border ${
        isFull ? "border-emerald-500/30" : "border-amber-500/30"
      } p-5 sm:p-7 shadow-2xl backdrop-blur-xl ${className}`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BANNER: HONEST STATUS DECLARATION
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                isFull
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isFull
                ? lang === "ar" ? "منحة كاملة 100% (Full Ride)" : "Bourse 100% Complète (Full Ride)"
                : lang === "ar" ? "منحة جزئية (شفافية كاملة على المصاريف)" : "Bourse Partielle (Transparence Totale)"}
            </span>

            <span className="text-xs text-slate-400 font-semibold uppercase">
              • {level}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white">
            {lang === "ar"
              ? "تفاصيل المصاريف بشفافية تامة (ما تغطيه المنحة وما تدفعه من جيبك)"
              : "Tableau de Transparence Financière (Ce qui est gratuit vs Ce que vous devez payer)"}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === "ar"
              ? "نحن نلتزم بالصدق الكامل مع طلابنا: لا توجد رسوم مخفية، إليك الحساب الدقيق بالدرهم المغربي واليوان."
              : "Engagement d'honnêteté avec nos étudiants marocains : aucun frais caché, voici le budget réel exact."}
          </p>
        </div>

        {/* Currency Switcher Toggle */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl flex-shrink-0 self-start sm:self-center">
          <button
            onClick={() => setCurrency("MAD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currency === "MAD"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🇲🇦 Dirham (DH)
          </button>
          <button
            onClick={() => setCurrency("RMB")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currency === "RMB"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🇨🇳 Yuan (RMB)
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TWO-COLUMN FINANCIAL LEDGER
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {/* ── LEFT COLUMN: What the Scholarship Pays (Green) ── */}
        <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/25 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-300">
                  {lang === "ar" ? "ما تغطيه المنحة (مجاني 100%)" : "Pris en Charge par la Bourse (100% Gratuit)"}
                </h4>
                <p className="text-[11px] text-emerald-400/80">
                  {lang === "ar" ? "أنت معفى تماماً من هذه التكاليف" : "Vous n'avez rien à débourser pour ces postes"}
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-500/5">
                <GraduationCap className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Frais de Scolarité (Tuition Fee)</span>
                    <span className="text-emerald-400 font-black">100% GRATUIT</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Économie directe de {formatCost(tuitionValueRmb, "/an")} prise en charge par l'État/l'université.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-500/5">
                <Home className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Logement / Dortoir sur Campus</span>
                    <span className="text-emerald-400 font-black">
                      {isFull ? "GRATUIT (0 DH)" : "Subventionné"}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isFull
                      ? `Chambre d'étudiant international sur le campus (valeur ~${formatCost(12000, "/an")} offerte).`
                      : "Tarif préférentiel subventionné pour résidents internationaux."}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-500/5">
                <Banknote className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Allocation Mensuelle (Stipend)</span>
                    <span className="text-emerald-400 font-black">
                      {isFull ? `+${formatCost(stipendRmb, "/mois")}` : "Non incluse"}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isFull
                      ? `Argent de poche versé chaque mois sur votre compte bancaire chinois pour vos repas et sorties.`
                      : "Bourse basée sur les frais de cours sans allocation mensuelle."}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-500/5">
                <HeartPulse className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Assurance Médicale Internationale</span>
                    <span className="text-emerald-400 font-black">INCLUSE (800 RMB)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Couverture hospitalisation et urgences en Chine (~{formatCost(800, "/an")}).
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── RIGHT COLUMN: What Student Pays Out-of-Pocket (Amber) ── */}
        <div className="rounded-2xl bg-amber-950/20 border border-amber-500/25 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-300">
                  {lang === "ar" ? "ما تدفعه من جيبك (بكل شفافية)" : "À la Charge de l'Étudiant (En Toute Franchise)"}
                </h4>
                <p className="text-[11px] text-amber-400/80">
                  {lang === "ar" ? "المصاريف الحقيقية التي يجب على الطالب وعائلته توقعها" : "Les dépenses réelles à prévoir sans surprise"}
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-500/5">
                <GraduationCap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Frais de scolarité à votre charge</span>
                    <span className="text-amber-300 font-black">
                      {isFull ? "0 DH (Rien à payer)" : "0 DH (100% exonéré)"}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isFull
                      ? "Zéro frais d'inscription ou de scolarité exigés par l'université."
                      : "Les frais de cours sont couverts par la bourse provinciale/universitaire."}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-500/5">
                <Home className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Loyer du Dortoir sur Campus</span>
                    <span className="text-amber-300 font-black">
                      {isFull ? "0 DH (Inclus)" : `~${formatCost(900, "/mois")}`}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isFull
                      ? "Chambre gratuite fournie sur le campus tout au long de vos études."
                      : `Si bourse partielle : prévoir ~${formatCost(900, "/mois")} (~${formatCost(10800, "/an")}) pour la chambre.`}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-500/5">
                <FileText className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Frais de dossier université (Application fee)</span>
                    <span className="text-slate-200 font-bold">~{formatCost(500)}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Payé directement à l'université lors du dépôt du dossier (une seule fois).
                  </p>
                </div>
              </li>

              {isBachelor && (
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-500/5">
                  <FileText className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>Examen National CSCA (Obligatoire Licence)</span>
                      <span className="text-rose-300 font-bold">~{formatCost(450)}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Frais officiel du test sur csca.cn obligatoire pour tous les bacheliers.
                    </p>
                  </div>
                </li>
              )}

              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-500/5">
                <Plane className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Voyage & Visa X1 au départ du Maroc</span>
                    <span className="text-slate-200 font-bold">~7,500 à 9,000 DH</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Billet d'avion Casablanca-Chine + Frais consulaires de visa à Rabat (une fois au départ).
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. BOTTOM SUMMARY BANNER (VERDICT FOR THE STUDENT)
      ───────────────────────────────────────────────────────────── */}
      <div
        className={`mt-6 p-4 sm:p-5 rounded-2xl border ${
          isFull
            ? "bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 border-emerald-500/40"
            : "bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-slate-900 border-amber-500/40"
        } flex flex-col sm:flex-row items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-xl ${
              isFull ? "bg-emerald-500 text-slate-950" : "bg-amber-500 text-slate-950"
            }`}
          >
            {isFull ? "0" : "💡"}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-300">
              {lang === "ar" ? "الخلاصة المالية الصادقة" : "Le Bilan Financier Réel"}
            </div>
            <div className="text-sm sm:text-base font-extrabold text-white mt-0.5">
              {isFull ? (
                <>
                  <span className="text-emerald-400 font-black">0 DH / an</span> pour les cours et la chambre +{" "}
                  <span className="text-amber-300 font-black">
                    +{formatCost(stipendRmb * 12, "/an")}
                  </span>{" "}
                  versés pour vos repas !
                </>
              ) : (
                <>
                  Budget annuel réel à prévoir :{" "}
                  <span className="text-amber-300 font-black">~20,000 à 28,000 DH / an</span> tout compris (chambre + nourriture).
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span
            className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase ${
              isFull ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            }`}
          >
            {isFull ? "Zéro Frais d'Études" : "Exonération Scolarité 100%"}
          </span>
        </div>
      </div>
    </div>
  );
}
