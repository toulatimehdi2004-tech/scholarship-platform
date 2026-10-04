'use client';

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, GraduationCap } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useLang } from "@/lib/i18n";

interface MatchItem {
  id: number;
  title: string;
  university_name: string;
  university_city: string;
  type: string;
  level: string;
  score: number;
  breakdown: Record<string, { points: number; met: boolean; note: string }>;
  days_left: number | null;
  application_deadline: string;
  application_link: string;
}

export default function EligibilityPage() {
  const { t } = useLang();
  const [level, setLevel] = useState("master");
  const [gpa, setGpa] = useState("");
  const [scale, setScale] = useState("4");
  const [field, setField] = useState("");
  const [results, setResults] = useState<MatchItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [openWhy, setOpenWhy] = useState<number | null>(null);

  async function check() {
    setLoading(true);
    const q = new URLSearchParams({
      level,
      gpa,
      scale,
      field,
    }).toString();
    const res = await fetchApi<{ count: number; results: MatchItem[] }>(
      "/match/?" + q
    );
    if (res.data) setResults(res.data.results);
    setLoading(false);
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            {t("el.title")}
          </h1>
          <p className="text-text-secondary">{t("el.subtitle")}</p>
        </motion.div>

        <div className="glass rounded-3xl p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">
                {t("el.level")}
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="glass rounded-xl py-2.5 px-4 text-sm text-text-primary outline-none bg-transparent w-full border border-border-glass"
              >
                <option value="bachelor" className="bg-surface">{t("sch.bachelor")}</option>
                <option value="master" className="bg-surface">{t("sch.master")}</option>
                <option value="phd" className="bg-surface">{t("sch.phd")}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">
                {t("el.gpa")}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  placeholder={scale === "4" ? "3.2" : "14"}
                  className="glass rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted outline-none bg-transparent flex-1 border border-border-glass"
                />
                <select
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  className="glass rounded-xl py-2.5 px-3 text-sm text-text-primary outline-none bg-transparent border border-border-glass"
                >
                  <option value="4" className="bg-surface">{t("el.scale4")}</option>
                  <option value="20" className="bg-surface">{t("el.scale20")}</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              {t("el.field")}
            </label>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder={t("el.fieldPh")}
              className="glass rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted outline-none bg-transparent w-full border border-border-glass"
            />
          </div>
          <button
            onClick={check}
            disabled={loading}
            className="btn-gradient px-8 py-3 rounded-xl text-base font-semibold w-full sm:w-auto disabled:opacity-50"
          >
            <span>{loading ? "..." : t("el.check")}</span>
          </button>
        </div>

        {results && (
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-4">
              {t("el.topMatches")} ({results.slice(0, 10).length})
            </h2>
            <div className="space-y-3">
              {results.slice(0, 10).map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 6) * 0.05 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <Link
                        href={"/scholarships/" + r.id}
                        className="text-base font-semibold text-text-primary hover:text-cyan transition-colors line-clamp-1"
                      >
                        {r.title}
                      </Link>
                      <p className="text-xs text-text-muted mt-0.5">
                        {r.university_name}
                        {r.university_city ? " · " + r.university_city : ""}
                      </p>
                    </div>
                    <span
                      className={
                        "text-lg font-bold font-mono flex-shrink-0 " +
                        (r.score >= 70
                          ? "text-emerald-400"
                          : r.score >= 45
                          ? "text-amber-400"
                          : "text-red-400")
                      }
                    >
                      {r.score}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                    <motion.div
                      className={
                        "h-full rounded-full " +
                        (r.score >= 70
                          ? "bg-gradient-to-r from-emerald-400 to-cyan"
                          : r.score >= 45
                          ? "bg-gradient-to-r from-amber-400 to-amber-500"
                          : "bg-gradient-to-r from-red-400 to-red-500")
                      }
                      initial={{ width: 0 }}
                      animate={{ width: r.score + "%" }}
                    />
                  </div>
                  <button
                    onClick={() => setOpenWhy(openWhy === r.id ? null : r.id)}
                    className="text-xs text-cyan hover:text-purple transition-colors"
                  >
                    {t("el.why")}
                  </button>
                  {openWhy === r.id && (
                    <div className="mt-2 space-y-1.5">
                      {Object.entries(r.breakdown).map(([k, b]) => (
                        <div key={k} className="flex items-start gap-2 text-xs">
                          {b.met ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className="text-text-secondary">
                            <span className="font-semibold text-text-primary capitalize">
                              {k}
                            </span>{" "}
                            (+{b.points}) — {b.note}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center gap-3 text-sm text-text-muted">
          <GraduationCap className="w-4 h-4 text-purple flex-shrink-0" />
          <Link href="/scholarships" className="hover:text-cyan transition-colors">
            {t("det.backToSch")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
