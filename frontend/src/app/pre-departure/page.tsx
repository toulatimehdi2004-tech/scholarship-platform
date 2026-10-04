'use client';

import { motion } from "framer-motion";
import {
  Plane,
  FileCheck,
  Home,
  Wallet,
  ShieldCheck,
  Luggage,
  MapPinned,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { translateCached } from "@/components/AutoText";

const SECTIONS: { key: string; icon: any; items: string[] }[] = [
  {
    key: "visa",
    icon: FileCheck,
    items: [
      "X1/X2 student visa approved and in passport",
      "JW201/JW202 form received from the university",
      "Admission letter printed (carry the original)",
      "Foreigner physical examination record (original + copy)",
      "Passport valid 12+ months with blank pages",
    ],
  },
  {
    key: "flights",
    icon: Plane,
    items: [
      "Flight booked to arrive 2-3 days before registration",
      "University airport pickup requested (if offered)",
      "Luggage within airline allowance (usually 2 x 23kg)",
      "Travel insurance covering the flight dates",
      "Arrival address saved offline (Chinese + English)",
    ],
  },
  {
    key: "housing",
    icon: Home,
    items: [
      "Dormitory room reserved via the university portal",
      "Off-campus housing registered with local police plan",
      "Bedding pack plan (buy on campus vs bring)",
      "Roommate contacts exchanged",
      "First-night essentials in carry-on",
    ],
  },
  {
    key: "money",
    icon: Wallet,
    items: [
      "Tuition payment method confirmed (transfer/card/cash)",
      "Some RMB cash for the first week (~2000 RMB)",
      "Bank card that works abroad + backup card",
      "Scholarship stipend collection process understood",
      "Budget plan for the first semester",
    ],
  },
  {
    key: "insurance",
    icon: ShieldCheck,
    items: [
      "Comprehensive medical insurance purchased",
      "Vaccination records translated to English",
      "Prescription medicines with doctor letter",
      "Emergency contacts saved in phone",
      "University clinic location noted",
    ],
  },
  {
    key: "packing",
    icon: Luggage,
    items: [
      "20+ passport photos (33x48mm white background)",
      "Degree certificates + transcripts (originals + copies)",
      "Power adapters (China uses 220V, type A/C/I)",
      "Medicines + glasses spares",
      "Small gifts from home for new friends",
    ],
  },
  {
    key: "arrival",
    icon: MapPinned,
    items: [
      "Register at the university on arrival day",
      "Police registration within 24 hours of arrival",
      "Residence permit applied within 30 days (X1 visa)",
      "Campus SIM card + bank account opened",
      "Medical re-check at the entry-exit bureau clinic",
    ],
  },
];

const SECTION_TITLES: Record<string, Record<string, string>> = {
  visa: { en: "Visa & Documents", fr: "Visa et documents", ar: "التأشيرة والمستندات" },
  flights: { en: "Flights & Arrival", fr: "Vols et arrivée", ar: "الطيران والوصول" },
  housing: { en: "Housing", fr: "Logement", ar: "السكن" },
  money: { en: "Money & Bank", fr: "Argent et banque", ar: "المال والبنك" },
  insurance: { en: "Health & Insurance", fr: "Santé et assurance", ar: "الصحة والتأمين" },
  packing: { en: "Packing", fr: "Bagages", ar: "التجهيز" },
  arrival: { en: "First Week on Campus", fr: "Première semaine", ar: "الأسبوع الأول" },
};

function Section({
  sec,
  checked,
  toggle,
  lang,
}: {
  sec: (typeof SECTIONS)[number];
  checked: Record<string, boolean>;
  toggle: (key: string) => void;
  lang: string;
}) {
  const [translated, setTranslated] = useState<string[] | null>(null);

  useEffect(() => {
    if (lang === "en") {
      setTranslated(null);
      return;
    }
    let cancelled = false;
    translateCached(sec.items.join("\n"), lang).then((r) => {
      if (!cancelled && r) setTranslated(r.split("\n"));
    });
    return () => {
      cancelled = true;
    };
  }, [sec.items, lang]);

  const Title = SECTION_TITLES[sec.key]?.[lang] || SECTION_TITLES[sec.key]?.en || sec.key;
  const Icon = sec.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-6"
    >
      <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan/20 to-purple/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-cyan" />
        </span>
        {Title}
      </h3>
      <div className="space-y-2">
        {sec.items.map((item, i) => {
          const key = sec.key + ":" + i;
          const isChecked = !!checked[key];
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={
                "w-full flex items-center gap-3 text-sm rounded-xl px-3 py-2.5 border transition-all text-left " +
                (isChecked
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-border-glass bg-white/[0.02] hover:border-purple/40")
              }
            >
              <span
                className={
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all " +
                  (isChecked ? "bg-emerald-500 border-emerald-500" : "border-white/25")
                }
              >
                {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </span>
              <span
                dir="auto"
                className={isChecked ? "line-through text-text-muted" : "text-text-secondary"}
              >
                {translated?.[i] ?? item}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function PreDeparturePage() {
  const { t, lang } = useLang();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dep-checklist");
      if (raw) setChecked(JSON.parse(raw));
    } catch {}
  }, []);

  function toggle(key: string) {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("dep-checklist", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function reset() {
    setChecked({});
    try {
      localStorage.removeItem("dep-checklist");
    } catch {}
  }

  const total = SECTIONS.reduce((n, s) => n + s.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <Plane className="w-8 h-8 text-cyan" />
            {t("dep.title")}
          </h1>
          <p className="text-text-secondary">{t("dep.subtitle")}</p>
        </motion.div>

        <div className="glass rounded-2xl p-5 mb-8">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-text-muted">
              {t("dep.progress", { done, total })}
            </span>
            <span className="text-cyan font-semibold">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-purple"
              animate={{ width: pct + "%" }}
            />
          </div>
          <button
            onClick={reset}
            className="mt-3 text-xs text-text-muted hover:text-cyan transition-colors"
          >
            {t("com.reset")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SECTIONS.map((sec) => (
            <Section
              key={sec.key}
              sec={sec}
              checked={checked}
              toggle={toggle}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
