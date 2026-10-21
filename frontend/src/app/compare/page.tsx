'use client';

import { motion } from "framer-motion";
import { X, ExternalLink, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi, type ScholarshipDetail } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { getCompareIds, clearCompareIds } from "@/lib/compare";
import AutoText from "@/components/AutoText";

export default function ComparePage() {
  const { t, lang } = useLang();
  const [ids, setIds] = useState<number[]>([]);
  const [items, setItems] = useState<ScholarshipDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const list = getCompareIds();
      setIds(list);
      setLoading(true);
      const out: ScholarshipDetail[] = [];
      for (const id of list.slice(0, 3)) {
        const res = await fetchApi<ScholarshipDetail>(`/scholarships/${id}/`);
        if (res.data) out.push(res.data);
      }
      setItems(out);
      setLoading(false);
    }
    load();
  }, []);

  function remove(id: number) {
    const next = ids.filter((x) => x !== id);
    try {
      localStorage.setItem("compare-ids", JSON.stringify(next));
    } catch {}
    setIds(next);
    setItems((prev) => prev.filter((s) => s.id !== id));
  }

  function clear() {
    clearCompareIds();
    setIds([]);
    setItems([]);
  }

  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t("cmp.title")}
          </h1>
          <p className="text-text-secondary mb-6">{t("cmp.subtitle")}</p>
          <div className="glass rounded-2xl p-12">
            <Scale className="w-10 h-10 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">{t("cmp.empty")}</p>
            <Link
              href="/scholarships"
              className="btn-gradient text-sm px-4 py-2 rounded-lg inline-block mt-6"
            >
              <span>{t("det.backToSch")}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const levelLabels: Record<string, string> = {
    bachelor: t("sch.bachelor"),
    master: t("sch.master"),
    phd: t("sch.phd"),
    all: t("sch.lvlAll"),
    other: t("sch.language"),
    postdoc: t("sch.postdoc"),
    exchange: t("sch.exchange"),
    summer: t("sch.summer"),
  };

  const rows: { label: string; get: (s: ScholarshipDetail) => React.ReactNode }[] = [
    { label: t("cmp.university"), get: (s) => s.university?.name || "—" },
    { label: t("cmp.city"), get: (s) => s.university?.city || "—" },
    {
      label: t("cmp.type"),
      get: (s) =>
        s.type === "full"
          ? t("det.fullSch")
          : s.type === "partial"
          ? t("det.partial")
          : s.type,
    },
    { label: t("cmp.level"), get: (s) => levelLabels[s.level] || s.level },
    {
      label: t("cmp.deadline"),
      get: (s) =>
        s.application_deadline
          ? new Date(s.application_deadline).toLocaleDateString(
              lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )
          : t("cmp.rolling"),
    },
    {
      label: t("cmp.tuition"),
      get: (s) => (
        <span className="text-xs leading-relaxed whitespace-pre-line">
          {s.tuition_info ? <AutoText text={s.tuition_info} /> : "—"}
        </span>
      ),
    },
    {
      label: t("cmp.seats"),
      get: (s) =>
        s.total_seats
          ? `${Math.max(0, (s.total_seats || 0) - (s.seats_filled || 0))}/${s.total_seats}`
          : "—",
    },
    {
      label: t("cmp.amount"),
      get: (s) =>
        s.amount
          ? `${s.amount} ${
              s.currency === "MAD" || s.currency === "DH"
                ? lang === "ar"
                  ? "د.م."
                  : "DH"
                : s.currency
            }`
          : s.duration
          ? <AutoText text={s.duration} />
          : "—",
    },
    {
      label: t("cmp.documents"),
      get: (s) => String(s.required_documents?.length || 0),
    },
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              {t("cmp.title")}
            </h1>
            <p className="text-text-secondary text-sm mt-1">{t("cmp.subtitle")}</p>
          </div>
          <button
            onClick={clear}
            className="text-xs text-text-muted hover:text-red-400 transition-colors"
          >
            {t("cmp.clear")}
          </button>
        </div>

        {loading ? (
          <div className="glass rounded-2xl p-12 animate-pulse">
            <div className="h-5 bg-white/10 rounded w-1/3" />
          </div>
        ) : (
          <div className="glass rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border-glass">
                    <th className="text-left p-4 w-32" />
                    {items.map((s) => (
                      <th key={s.id} className="text-left p-4 align-top">
                        <Link
                          href={"/scholarships/" + s.id}
                          className="text-text-primary hover:text-cyan transition-colors font-semibold leading-snug line-clamp-3"
                        >
                          <AutoText text={s.title} />
                        </Link>
                        <button
                          onClick={() => remove(s.id)}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" /> {t("cmp.remove")}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row.label}
                      className={i % 2 ? "bg-white/[0.02]" : ""}
                    >
                      <td className="p-4 text-text-muted font-medium whitespace-nowrap">
                        {row.label}
                      </td>
                      {items.map((s) => (
                        <td key={s.id} className="p-4 text-text-secondary align-top">
                          {row.get(s)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-4" />
                    {items.map((s) =>
                      s.application_link ? (
                        <td key={s.id} className="p-4">
                          <a
                            href={s.application_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan hover:text-purple transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {t("cmp.apply")}
                          </a>
                        </td>
                      ) : (
                        <td key={s.id} className="p-4" />
                      )
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
