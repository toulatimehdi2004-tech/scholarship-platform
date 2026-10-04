'use client';

import { motion } from "framer-motion";
import { MapPin, GraduationCap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { University } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function UniversityCard({
  university,
  index = 0,
  selectable = false,
  selected = false,
  onSelect,
}: {
  university: University;
  index?: number;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (u: University | null) => void;
}) {
  const { t } = useLang();

  const inner = (
    <>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text-primary group-hover:text-cyan transition-colors line-clamp-1">
            {university.name}
          </h3>
          <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {university.city}, {university.country}
          </p>
        </div>
        {university.is_verified && (
          <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex-shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            {t("com.verified")}
          </span>
        )}
      </div>
      {university.motto && (
        <p className="text-xs text-text-muted italic line-clamp-1 mb-3">
          “{university.motto}”
        </p>
      )}
      <span className="mt-auto text-sm font-medium text-cyan group-hover:text-purple transition-colors">
        {selectable
          ? selected
            ? "✓ " + university.name
            : t("exp.viewScholarships")
          : t("uni.viewDetails") + " →"}
      </span>
    </>
  );

  const cls =
    "glass rounded-2xl p-6 card-hover group h-full flex flex-col cursor-pointer transition-all " +
    (selected ? "border-cyan/50 shadow-[0_0_18px_rgba(6,182,212,0.3)]" : "");

  if (selectable) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04 }}
      >
        <div onClick={() => onSelect?.(selected ? null : university)} className={cls}>
          {inner}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04 }}
    >
      <Link href={"/university/" + university.id} className={cls}>
        {inner}
      </Link>
    </motion.div>
  );
}
