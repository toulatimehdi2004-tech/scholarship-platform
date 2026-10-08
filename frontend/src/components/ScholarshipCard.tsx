"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, GraduationCap, BookOpen, Scale, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Scholarship } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { toggleCompareId, getCompareIds } from "@/lib/compare";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  index?: number;
}

export default function ScholarshipCard({
  scholarship,
  index = 0,
}: ScholarshipCardProps) {
  const router = useRouter();
  const { t } = useLang();
  const [inCompare, setInCompare] = useState(() =>
    getCompareIds().includes(scholarship.id)
  );

  function onCompare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const r = toggleCompareId(scholarship.id);
    setInCompare(r.ids.includes(scholarship.id));
  }

  const typeColors: Record<string, string> = {
    full: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10",
    partial: "bg-cyan/15 text-cyan border-cyan/30 shadow-sm shadow-cyan/10",
    living: "bg-blue/15 text-blue border-blue/30",
    research: "bg-purple/15 text-purple border-purple/30",
    tuition: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };

  const typeLabels: Record<string, string> = {
    full: t("sch.full"),
    partial: t("sch.partial"),
    living: t("sch.living"),
    research: t("sch.research"),
  };

  const levelLabels: Record<string, string> = {
    bachelor: t("sch.bachelor"),
    master: t("sch.master"),
    phd: t("sch.phd"),
    all: t("sch.lvlAll"),
    other: t("sch.language"),
    postdoc: "Postdoc",
    exchange: "Exchange",
    summer: "Summer School",
  };

  const levelColors: Record<string, string> = {
    bachelor: "bg-blue/15 text-blue border border-blue/25",
    master: "bg-purple/15 text-purple border border-purple/25",
    phd: "bg-cyan/15 text-cyan border border-cyan/25",
    other: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  };

  const badgeClass =
    typeColors[scholarship.type] || "bg-cyan/15 text-cyan border-cyan/30";

  const deadline = scholarship.application_deadline
    ? new Date(scholarship.application_deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Rolling";

  const levelLabel =
    levelLabels[scholarship.level] || scholarship.level || "All Levels";
  const levelColor =
    levelColors[scholarship.level] || "bg-white/10 text-text-muted border border-white/10";

  const isLanguage = scholarship.level === "other";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="h-full"
    >
      <Link
        href={`/scholarships/${scholarship.id}`}
        className="glass rounded-2xl p-6 card-hover cursor-pointer group h-full flex flex-col border border-border-glass relative overflow-hidden block"
      >
        <div className="flex items-start justify-between mb-3.5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeClass} uppercase tracking-wider`}
          >
            {typeLabels[scholarship.type] || scholarship.type}
          </span>
          <span className="text-xs text-text-muted flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            {deadline}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-text-secondary font-medium">
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/university/${scholarship.university}`);
            }}
            className="flex items-center gap-1.5 hover:text-cyan transition-colors"
          >
            {isLanguage ? (
              <BookOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
            )}
            <span className="line-clamp-1 underline-offset-2 hover:underline">
              {scholarship.university_name || "Unknown University"}
            </span>
          </span>
          {scholarship.university_city && (
            <span className="flex items-center gap-1 text-text-muted">
              • <MapPin className="w-3 h-3 text-cyan" /> {scholarship.university_city}
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-text-primary group-hover:text-cyan transition-colors leading-snug line-clamp-2 mb-4 tracking-tight">
          {scholarship.title}
        </h3>

        <div className="flex items-center justify-between pt-3.5 border-t border-border-glass mt-auto">
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${levelColor}`}
          >
            {levelLabel}
          </span>
          <div className="flex items-center gap-2">
            {scholarship.duration && (
              <span className="text-xs text-text-muted">
                {scholarship.duration}
              </span>
            )}
            <button
              onClick={onCompare}
              title="+ Compare"
              className={
                "p-1.5 rounded-lg transition-all " +
                (inCompare
                  ? "text-cyan bg-cyan/15 ring-1 ring-cyan/30"
                  : "text-text-muted hover:text-cyan hover:bg-white/5")
              }
            >
              <Scale className="w-4 h-4" />
            </button>
            <span className="p-1 rounded-lg text-text-muted group-hover:text-cyan group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
