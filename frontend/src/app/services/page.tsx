"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileCheck2,
  Plane,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  Building2,
  Star,
  Languages,
  Check,
  Car,
  AlertCircle,
  HelpCircle,
  Phone,
  DollarSign,
  Award,
} from "lucide-react";
import Link from "next/link";
import SmartBack from "@/components/SmartBack";
import { useLang } from "@/lib/i18n";

export default function ServicesPage() {
  const { lang } = useLang();
  const [selectedCity, setSelectedCity] = useState("all");

  const services = [
    {
      id: "pickup",
      name:
        lang === "ar"
          ? "خدمة الاستقبال في المطار والتوجيه الجامعي"
          : lang === "fr"
          ? "Service Accueil Aéroport & Installation Campus"
          : "Airport Pickup & University Dorm Arrival Escort",
      category: "Arrival & Logistics",
      badge:
        lang === "ar"
          ? "شرط: سنة إقامة سابقة بالصين 🇨🇳"
          : "Exclusif: Résident 1+ An en Chine 🇨🇳",
      price: "$65.00",
      priceAr: "65 دولار / 650 درهم",
      desc:
        lang === "ar"
          ? "استقبال شخصي عند بوابة الخروج من المطار، المساعدة في الأمتعة، حجز القطار السريع أو سيارة التوصيل، شراء وتفعيل شريحة الهاتف الصينية، ومرافقة الطالب حتى بوابة الحي الجامعي واستلام الغرفة."
          : "Accueil direct au terminal des arrivées, gestion des valises, transfert TGV/taxi jusqu'au campus, achat carte SIM chinoise & enregistrement au dortoir universitaire.",
      highlight:
        lang === "ar"
          ? "مقدمو الخدمة ملزمون بالإقامة سنة كاملة على الأقل في الصين لضمان سلامة وخبرة المرافقة."
          : "Chaque chauffeur/accompagnateur a au minimum 1 an de résidence en Chine pour maîtriser le chinois, le réseau TGV et les formalités campus.",
      cities: ["Beijing (PEK/PKX)", "Shanghai (PVG/SHA)", "Hangzhou (HGH)", "Guangzhou (CAN)", "Wuhan (WUH)", "Chengdu (TFU)"],
      icon: Plane,
      color: "from-blue-500 to-indigo-600",
      accent: "border-blue-500/40 text-blue-400",
    },
    {
      id: "translation",
      name:
        lang === "ar"
          ? "الترجمة المحلفة الصينية (عربي/فرنسي ➔ صيني)"
          : "Traduction Assermentée avec Cachet Rouge (Ar/Fr ➔ Zh)",
      category: "Legal & Notary",
      badge:
        lang === "ar"
          ? "معتمد لدى السفارة الصينية"
          : "Agréé Ambassade de Chine & CSC",
      price: "$35.00",
      priceAr: "35 دولار / 350 درهم",
      desc:
        lang === "ar"
          ? "ترجمة محلفة رسمية لكشوف النقاط والدبلومات مع الختم الأحمر الصيني الرسمي المعتمد لدى وزارة التعليم والجامعات الصينية وسفارة بكين بالرباط."
          : "Traduction certifiée avec cachet rouge officiel (Red Seal) des relevés de notes et diplômes pour admission universitaire et visa d'études.",
      highlight:
        lang === "ar"
          ? "جاهزية التسليم خلال 24 إلى 48 ساعة بصيغة PDF عالية الدقة وأصلية."
          : "Délivrance rapide en 24-48h avec validation conforme aux exigences du portail CSC.",
      cities: ["Maroc & International"],
      icon: FileCheck2,
      color: "from-purple-500 to-pink-600",
      accent: "border-purple-500/40 text-purple-400",
    },
    {
      id: "legalization",
      name:
        lang === "ar"
          ? "تجهيز وتصديق ملف التأشيرة الدراسية X1 / X2"
          : "Préparation & Légalisation Dossier Visa X1 / X2",
      category: "Embassy Support",
      badge:
        lang === "ar"
          ? "تنسيق الرباط حي السويسي"
          : "Assistance Consulaire Rabat Souissi",
      price: "$65.00",
      priceAr: "65 دولار / 650 درهم",
      desc:
        lang === "ar"
          ? "مراجعة شاملة لنموذج JW202/JW201 وإشعار القبول، وتنسيق الفحص الطبي للأجانب CHU، والتحقق من صلاحية الجواز والتأمين."
          : "Audit préalable de la lettre d'admission, formulaire JW202, examen médical pour étranger et liste des pièces pour le dépôt consulaire à Rabat.",
      highlight:
        lang === "ar"
          ? "نسبة قبول الملفات تبلغ 99.4% بفضل التدقيق الدقيق."
          : "Taux de conformité de 99.4% auprès des services consulaires chinois.",
      cities: ["Rabat", "Casablanca", "Tanger", "Marrakech"],
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-600",
      accent: "border-emerald-500/40 text-emerald-400",
    },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <SmartBack fallback="/" label={lang === "ar" ? "الرئيسية" : "Home"} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {lang === "ar"
                  ? "خدمات الطلاب المعتمدة والمرافقة"
                  : "Certified Academic & Arrival Services"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-text-primary tracking-tight">
              {lang === "ar"
                ? "خدمات الترجمة المحلفة والاستقبال بالمطار الصيني"
                : "Sworn Translation & China Airport Arrival Support"}
            </h1>
            <p className="text-xs sm:text-base text-slate-600 dark:text-text-secondary mt-1 max-w-3xl">
              {lang === "ar"
                ? "حلول متكاملة ومعتمدة لمرافقة الطلاب المغاربة والدوليين من ترجمة الوثائق بالرباط حتى الوصول إلى غرفتك الجامعية في الصين."
                : "Official partner services designed for Moroccan & international students, from certified document translations to airport reception and dorm check-in."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/provider-portal"
              className="px-4 py-2 rounded-xl text-xs font-bold glass hover:bg-white/10 text-purple-600 dark:text-purple border border-purple-500/30 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>💼 Provider Bureau Desk</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {services.map((srv) => {
          const Icon = srv.icon;
          return (
            <motion.div
              key={srv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-white/10 hover:border-blue-500/40 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${srv.color} text-white flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 text-lg">
                    {lang === "ar" ? srv.priceAr : srv.price}
                  </span>
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-text-muted mb-2">
                  {srv.badge}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-text-primary leading-snug mb-2">
                  {srv.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed mb-4">
                  {srv.desc}
                </p>

                {/* Requirement / Highlight Box */}
                <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-white/[0.03] border border-blue-200/70 dark:border-white/5 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed mb-4 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{srv.highlight}</span>
                </div>

                {/* Cities Covered */}
                <div className="space-y-1 mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {lang === "ar" ? "المدن والمطارات المغطاة:" : "Covered Hubs & Airports:"}
                  </p>
                  <div className="flex flex-wrap gap-1 text-[11px] text-slate-600 dark:text-text-muted">
                    {srv.cities.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <Link
                  href="/ai-chat"
                  className="w-full py-2.5 rounded-xl btn-gradient text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>{lang === "ar" ? "حجز الخدمة الآن" : "Book This Service"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Airport Pickup 1-Year Residency Explanatory Notice */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-slate-50 to-purple/5 dark:from-blue-500/10 dark:via-transparent dark:to-purple/5 mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-text-primary">
              {lang === "ar"
                ? "لماذا يشترط سنة كاملة من الإقامة في الصين لمقدمي خدمة التوصيل؟"
                : "Why does ScholarChina require 1 full year of China residency for Airport Pickup providers?"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary mt-1 leading-relaxed">
              {lang === "ar"
                ? "وصول الطالب لأول مرة إلى الصين يرافقه تحديات لغوية، وإجراءات جمركية، وتغيير العملة وشراء شريحة اتصال صينية. المشرفون الذين عاشوا سنة كاملة على الأقل في الصين يمتلكون المعرفة التامة بمحطات القطار السريع، وتطبيقات النقل (Didi)، وإجراءات التسجيل في السكن الجامعي، مما يضمن أمان وراحة الطالب وعائلته."
                : "First-time arrivals in China face customs inspection, language hurdles, local taxi booking, and Chinese SIM registration. Only residents with at least 1 year in China have proven familiarity with high-speed rail, airport terminals, and campus dorm check-in procedures, ensuring complete peace of mind for students and families."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
