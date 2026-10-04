"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, GraduationCap, BookOpen, Scale } from "lucide-react";
import { useState } from "react";
import type { Scholarship } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { toggleCompareId, getCompareIds } from "@/lib/compare";
import UniversityModal from "./UniversityModal";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  index?: number;
}

export default function ScholarshipCard({
  scholarship,
  index = 0,
}: ScholarshipCardProps) {
  const [showModal, setShowModal] = useState(false);
  const { t } = useLang();
  const [inCompare, setInCompare] = useState(() =>
    getCompareIds().includes(scholarship.id)
  );

  function onCompare(e: React.MouseEvent) {
    e.stopPropagation();
    const r = toggleCompareId(scholarship.id);
    setInCompare(r.ids.includes(scholarship.id));
  }

  const typeColors: Record<string, string> = {
    full: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    partial: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    living: "bg-blue/20 text-blue border-blue/30",
    research: "bg-purple/20 text-purple border-purple/30",
    tuition: "bg-cyan/20 text-cyan border-cyan/30",
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
    bachelor: "bg-blue/20 text-blue",
    master: "bg-purple/20 text-purple",
    phd: "bg-cyan/20 text-cyan",
    other: "bg-amber-500/20 text-amber-400",
  };

  const badgeClass =
    typeColors[scholarship.type] || "bg-cyan/20 text-cyan border-cyan/30";

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
    levelColors[scholarship.level] || "bg-white/10 text-text-muted";

  const isLanguage = scholarship.level === "other";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="glass rounded-2xl p-6 card-hover cursor-pointer group h-full"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-start justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}
          >
            {typeLabels[scholarship.type] || scholarship.type}
          </span>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {deadline}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 mb-3 text-sm text-text-muted">
          <span className="flex items-center gap-1">
            {isLanguage ? (
              <BookOpen className="w-4 h-4 text-amber-400" />
            ) : (
              <GraduationCap className="w-4 h-4 text-purple" />
            )}
            {scholarship.university_name || "Unknown University"}
          </span>
        </div>

        <h3 className="text-base font-bold text-text-primary group-hover:text-cyan transition-colors leading-snug line-clamp-2 mb-4">
          {scholarship.title}
        </h3>

        <div className="flex items-center justify-between pt-4 border-t border-border-glass mt-auto">
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${levelColor}`}
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
                  ? "text-cyan bg-cyan/15"
                  : "text-text-muted hover:text-cyan hover:bg-white/5")
              }
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <UniversityModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        universityId={scholarship.university}
        universityName={scholarship.university_name || "Unknown University"}
        universityWebsite={(scholarship as any).university_website}
        universityCity={(scholarship as any).university_city}
        universityCountry={(scholarship as any).university_country}
        scholarshipId={scholarship.id}
        scholarshipTitle={scholarship.title}
        applicationLink={scholarship.application_link}
      />
    </>
  );
}
