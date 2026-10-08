'use client';

import { motion } from "framer-motion";
import { MapPin, GraduationCap, CheckCircle2, ChevronRight, Glasses } from "lucide-react";
import Link from "next/link";
import type { University } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { getUniversityCoverImage } from "@/lib/campusImages";
import { useState } from "react";

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
  const [imgError, setImgError] = useState(false);
  const coverUrl = getUniversityCoverImage(university.id);

  const inner = (
    <>
      {/* Campus Photography Cover Banner */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 group-hover:opacity-95 transition-all">
        <img
          src={imgError ? getUniversityCoverImage(university.id + 1) : coverUrl}
          alt={university.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Ambient Top & Bottom Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {university.is_verified ? (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-md backdrop-blur-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{t("com.verified")}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-900/80 text-slate-300 border border-white/20 px-2 py-0.5 rounded-full shadow-md backdrop-blur-md">
              <GraduationCap className="w-3 h-3 text-cyan" />
              <span>Top University</span>
            </span>
          )}

          <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-950/85 text-cyan border border-cyan/40 px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-md">
            <Glasses className="w-3 h-3 text-emerald-400" />
            <span>3D VR Tour</span>
          </span>
        </div>

        {/* Bottom Location Floating Pill */}
        <div className="absolute bottom-2.5 left-3 pointer-events-none">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/15 shadow-sm">
            <MapPin className="w-3 h-3 text-cyan flex-shrink-0" />
            <span>{university.city || "China"}{university.country ? `, ${university.country}` : ""}</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-text-primary group-hover:text-cyan transition-colors line-clamp-1 tracking-tight mb-1.5">
            {university.name}
          </h3>

          {university.motto && (
            <p className="text-xs text-text-muted italic line-clamp-1 mb-3 pl-2 border-l-2 border-cyan/40">
              “{university.motto}”
            </p>
          )}

          {university.address && (
            <p className="text-[11px] text-text-muted line-clamp-1 mb-2">
              {university.address}
            </p>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-3 pt-3 border-t border-border-glass flex items-center justify-between text-xs font-bold text-cyan group-hover:text-purple transition-colors">
          <span>
            {selectable
              ? selected
                ? "✓ " + university.name
                : t("exp.viewScholarships")
              : t("uni.viewDetails")}
          </span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </>
  );

  const cls =
    "glass rounded-2xl overflow-hidden card-hover group h-full flex flex-col cursor-pointer transition-all border border-border-glass relative " +
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
