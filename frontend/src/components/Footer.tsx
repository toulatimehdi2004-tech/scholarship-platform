"use client";

import Link from "next/link";
import {
  GraduationCap,
  Building2,
  ListTodo,
  ShieldCheck,
  Sparkles,
  MapPin,
  ChevronUp,
  Globe,
  Award,
  FileCheck2,
  Heart,
  Bot,
  ExternalLink,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { lang, setLang, t } = useLang();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative z-10 mt-20 border-t border-slate-200/90 dark:border-white/10 bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-300">
      {/* Decorative top accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Top Branding & Verification Ribbon */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-200/80 dark:border-white/10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Logo size={42} showText={false} />
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
                  <span>Scholar</span>
                  <span className="text-blue-600 dark:text-cyan">China</span>
                  <span className="ml-1.5 text-[11px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-700 dark:text-cyan dark:bg-cyan/10 border border-blue-500/20 dark:border-cyan/30">
                    2026/27
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-text-muted font-medium">
                  Morocco 🇲🇦 ➔ China 🇨🇳 Academic Gateway
                </p>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary leading-relaxed max-w-md">
              {t("footer.brandTagline")}
            </p>

            {/* Verification Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{t("footer.badgeCsc")}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{t("footer.statusLive")}</span>
              </div>
            </div>
          </div>

          {/* Rabat Embassy & Academic Notice Box */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>{t("footer.supEmbassy")}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed">
                16, Avenue Ahmed Balafrej, Souissi, Rabat, Maroc.
                <br />
                <span className="text-[11px] text-slate-500 dark:text-text-muted">
                  Service Culturel & Éducation • Visas Étudiants X1 / X2
                </span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{t("footer.badgeAdmissions")}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed">
                Direct integration with official CSC portals, Chinese university admissions desks, and certified Moroccan sworn translators.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {/* Col 1: Scholarships */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-cyan" />
              <span>{t("footer.colSch")}</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/scholarships?type=full"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.schFull")}
                </Link>
              </li>
              <li>
                <Link
                  href="/scholarships?type=provincial"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.schProvincial")}
                </Link>
              </li>
              <li>
                <Link
                  href="/scholarships?level=master"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.schMastersPhd")}
                </Link>
              </li>
              <li>
                <Link
                  href="/scholarships?level=language"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.schLanguage")}
                </Link>
              </li>
              <li>
                <Link
                  href="/scholarships/compare"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors flex items-center gap-1"
                >
                  <span>{t("footer.schCompare")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/acceptance-odds"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.schOdds")}
                </Link>
              </li>
              <li>
                <Link
                  href="/csca"
                  className="text-amber-600 dark:text-amber-400 font-bold hover:underline transition-colors flex items-center gap-1.5"
                >
                  <span>{lang === "ar" ? "امتحان CSCA (البكالوريوس)" : "Examen CSCA (Bachelor)"}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded font-black bg-rose-500 text-white">NEW</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Universities */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              <Building2 className="w-4 h-4 text-purple-600 dark:text-purple" />
              <span>{t("footer.colUnis")}</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/universities"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.uniTop100")}
                </Link>
              </li>
              <li>
                <Link
                  href="/universities/3d-tour"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors flex items-center gap-1 font-semibold text-blue-600 dark:text-cyan"
                >
                  <span>{t("footer.uni3dTour")}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan/15 text-cyan">3D</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/scholarships?city=Beijing"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.uniBeijing")}
                </Link>
              </li>
              <li>
                <Link
                  href="/scholarships?city=Shanghai"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.uniShanghai")}
                </Link>
              </li>
              <li>
                <Link
                  href="/scholarships?city=Hangzhou"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.uniHangzhou")}
                </Link>
              </li>
              <li>
                <Link
                  href="/university-portal"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.uniAdmissions")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Tools & CRM */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              <ListTodo className="w-4 h-4 text-blue-500" />
              <span>{t("footer.colTools")}</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/tracker"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors font-semibold"
                >
                  {t("footer.toolsTracker")}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.toolsDashboard")}
                </Link>
              </li>
              <li>
                <Link
                  href="/stories"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.toolsStories")}
                </Link>
              </li>
              <li>
                <Link
                  href="/sop-builder"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.toolsSop")}
                </Link>
              </li>
              <li>
                <Link
                  href="/provider-portal"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.toolsTranslations")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pre-departure"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.toolsPreDeparture")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Embassy */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              <Bot className="w-4 h-4 text-emerald-500" />
              <span>{t("footer.colSupport")}</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("open_live_chat"));
                    }
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{lang === "ar" ? "تواصل مباشر مع المستشار (الآن)" : "Assistance Directe en Temps Réel (LIVE)"}</span>
                </button>
              </li>
              <li>
                <Link
                  href="/ai-chat"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t("footer.supAi")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.supServices")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {lang === "ar" ? "باقات الدعم الأكاديمي VIP" : lang === "fr" ? "Accompagnement VIP Étudiant" : "VIP Student Support Plan"}
                </Link>
              </li>
              <li>
                <a
                  href="https://studyinchina.csc.edu.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors flex items-center gap-1"
                >
                  <span>CSC Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-colors"
                >
                  {t("footer.supFaq")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-text-muted">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>
              &copy; {new Date().getFullYear()} <strong className="text-slate-700 dark:text-text-secondary">ScholarChina</strong>. {t("footer.rights")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language quick switcher */}
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => setLang("en")}
                className={`hover:text-blue-600 dark:hover:text-cyan transition-colors ${lang === "en" ? "text-blue-600 dark:text-cyan font-bold" : ""}`}
              >
                EN
              </button>
              <span>•</span>
              <button
                onClick={() => setLang("fr")}
                className={`hover:text-blue-600 dark:hover:text-cyan transition-colors ${lang === "fr" ? "text-blue-600 dark:text-cyan font-bold" : ""}`}
              >
                FR
              </button>
              <span>•</span>
              <button
                onClick={() => setLang("ar")}
                className={`hover:text-blue-600 dark:hover:text-cyan transition-colors ${lang === "ar" ? "text-blue-600 dark:text-cyan font-bold" : ""}`}
              >
                العربية
              </button>
            </div>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-200/80 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-text-secondary hover:text-blue-600 dark:hover:text-cyan transition-all flex items-center gap-1 cursor-pointer"
              title={t("footer.backToTop")}
            >
              <ChevronUp className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px] font-semibold">{t("footer.backToTop")}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
