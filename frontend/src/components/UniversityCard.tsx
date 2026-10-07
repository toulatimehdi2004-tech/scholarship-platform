'use client';

import { motion } from "framer-motion";
import { MapPin, GraduationCap, CheckCircle2, ChevronRight, ArrowRight } from "lucide-react";
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
      <div className="flex items-start gap-3.5 mb-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan via-blue to-purple flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan/20 group-hover:scale-105 transition-transform">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <h3 className="text-base font-bold text-text-primary group-hover:text-cyan transition-colors line-clamp-1 tracking-tight">
              {university.name}
            </h3>
            {university.is_verified && (
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                {t("com.verified")}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-cyan/15 text-cyan border border-cyan/30 px-2 py-0.5 rounded-full flex-shrink-0">
              🥽 3D VR Tour
            </span>
          </div>
          <p className="text-xs text-text-muted flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
            <span>{university.city || "China"}{university.country ? `, ${university.country}` : ""}</span>
          </p>
        </div>
      </div>

      {university.motto && (
        <p className="text-xs text-text-muted italic line-clamp-1 mb-3.5 pl-1 border-l-2 border-cyan/40">
          “{university.motto}”
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-border-glass flex items-center justify-between text-xs font-semibold text-cyan group-hover:text-purple transition-colors">
        <span>
          {selectable
            ? selected
              ? "✓ " + university.name
              : t("exp.viewScholarships")
            : t("uni.viewDetails")}
        </span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </>
  );

  const cls =
    "glass rounded-2xl p-6 card-hover group h-full flex flex-col cursor-pointer transition-all border border-border-glass relative overflow-hidden " +
    (selected ? "border-cyan shadow-[0_0_24px_rgba(6,182,212,0.35)]" : "");

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
