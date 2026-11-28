"use client";

import React, { useMemo } from "react";
import { Clock, Globe, Calendar, AlertTriangle } from "lucide-react";
import { DeadlineTimezoneUtil, ConvertedDeadlines } from "@/lib/DeadlineTimezoneUtil";
import { useLang } from "@/lib/i18n";

export interface ScholarshipDualDeadlineProps {
  embassyDeadline?: string | null;
  universityDeadline?: string | null;
  generalDeadline?: string | null;
  hostTimezone?: string;
  variant?: "badge" | "card" | "hero" | "compact";
  className?: string;
}

/**
 * ScholarshipDualDeadlineBadge
 * Displays both the Home Country/Embassy deadline and University deadline,
 * along with the user's local browser time:
 * e.g., "Closes March 15, 23:59 Beijing Time / 16:59 Your Local Time"
 */
export default function ScholarshipDualDeadlineBadge({
  embassyDeadline,
  universityDeadline,
  generalDeadline,
  hostTimezone = "Asia/Shanghai",
  variant = "badge",
  className = "",
}: ScholarshipDualDeadlineProps) {
  const { lang } = useLang();
  const userTz = DeadlineTimezoneUtil.getUserBrowserTimezone();
  const userCity = userTz.split("/").pop()?.replace("_", " ") || "Local";

  // Convert deadlines using DeadlineTimezoneUtil
  const embassyConv = useMemo<ConvertedDeadlines | null>(() => {
    if (!embassyDeadline) return null;
    return DeadlineTimezoneUtil.convertDeadline(embassyDeadline, hostTimezone, userTz);
  }, [embassyDeadline, hostTimezone, userTz]);

  const universityConv = useMemo<ConvertedDeadlines | null>(() => {
    if (!universityDeadline) return null;
    return DeadlineTimezoneUtil.convertDeadline(universityDeadline, hostTimezone, userTz);
  }, [universityDeadline, hostTimezone, userTz]);

  const generalConv = useMemo<ConvertedDeadlines | null>(() => {
    if (embassyConv || universityConv) return null;
    if (!generalDeadline) return null;
    return DeadlineTimezoneUtil.convertDeadline(generalDeadline, hostTimezone, userTz);
  }, [generalDeadline, embassyConv, universityConv, hostTimezone, userTz]);

  // Helper string formatter: "Closes March 15, 23:59 Beijing Time / 16:59 Your Local Time"
  const formatDeadlineString = (conv: ConvertedDeadlines) => {
    const hostDateStr = conv.host.dateStr;
    const hostTime = conv.host.timeStr;
    const userTime = conv.user.timeStr;
    const isPassed = conv.isPassed;

    if (isPassed) {
      return `Closed ${hostDateStr}, ${hostTime} Beijing Time / ${userTime} Your Local Time (${userCity})`;
    }
    return `Closes ${hostDateStr}, ${hostTime} Beijing Time / ${userTime} Your Local Time (${userCity})`;
  };

  // ── VARIANT: Compact (Used on small cards or lists) ──
  if (variant === "compact") {
    const active = embassyConv || universityConv || generalConv;
    if (!active || !active.isSet) {
      return (
        <span className={`text-[10px] text-slate-400 flex items-center gap-1 ${className}`}>
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Rolling Admissions</span>
        </span>
      );
    }

    return (
      <div className={`text-[10px] flex items-center gap-1 text-slate-300 ${className}`}>
        <Clock className={`w-3 h-3 ${active.isUrgent ? "text-rose-400 animate-pulse" : "text-cyan"}`} />
        <span className="font-semibold text-slate-200">
          {formatDeadlineString(active)}
        </span>
      </div>
    );
  }

  // ── VARIANT: Hero (Used on Scholarship Details Page) ──
  if (variant === "hero") {
    return (
      <div className={`rounded-2xl p-4 bg-gradient-to-br from-slate-900/90 to-[#0b1222]/90 border border-white/10 shadow-xl space-y-3 ${className}`}>
        <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === "ar" ? "المواعيد الرسمية للمنحة والتوقيت المحلي" : "Official Deadlines & Local Time Synchronization"}
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
            Detected Local: <strong className="text-white">{userCity}</strong>
          </span>
        </div>

        {/* Embassy Deadline */}
        {embassyConv && embassyConv.isSet && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                <span>🏛️</span>
                <span>Home Country / Embassy Deadline (CSC Type A / Bilateral)</span>
              </div>
              <p className="text-xs font-bold text-white mt-1">
                {formatDeadlineString(embassyConv)}
              </p>
            </div>
            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg self-start sm:self-center ${
              embassyConv.isPassed
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : embassyConv.isUrgent
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-amber-500/20 text-amber-200 border border-amber-500/30"
            }`}>
              {embassyConv.humanCountdown}
            </span>
          </div>
        )}

        {/* University Deadline */}
        {universityConv && universityConv.isSet && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-blue-300">
                <span>🎓</span>
                <span>University Direct Portal Deadline (CSC Type B / Direct Admissions)</span>
              </div>
              <p className="text-xs font-bold text-white mt-1">
                {formatDeadlineString(universityConv)}
              </p>
            </div>
            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg self-start sm:self-center ${
              universityConv.isPassed
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : universityConv.isUrgent
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-blue-500/20 text-blue-200 border border-blue-500/30"
            }`}>
              {universityConv.humanCountdown}
            </span>
          </div>
        )}

        {/* General Deadline Fallback */}
        {!embassyConv && !universityConv && generalConv && generalConv.isSet && (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-cyan">
                <span>📅</span>
                <span>Scholarship Application Deadline</span>
              </div>
              <p className="text-xs font-bold text-white mt-1">
                {formatDeadlineString(generalConv)}
              </p>
            </div>
            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg self-start sm:self-center ${
              generalConv.isPassed
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : generalConv.isUrgent
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-cyan/20 text-cyan border border-cyan/30"
            }`}>
              {generalConv.humanCountdown}
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── VARIANT: Badge / Card (Used on Scholarship Cards across the platform) ──
  return (
    <div className={`space-y-1.5 text-xs ${className}`}>
      {/* 1. Home Country / Embassy Deadline */}
      {embassyConv && embassyConv.isSet && (
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-amber-400 font-bold flex-shrink-0">🏛️ Embassy:</span>
            <span className="text-white font-semibold truncate">
              {formatDeadlineString(embassyConv)}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold self-start sm:self-center flex-shrink-0 ${
            embassyConv.isPassed ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-200"
          }`}>
            {embassyConv.humanCountdown}
          </span>
        </div>
      )}

      {/* 2. University Portal Deadline */}
      {universityConv && universityConv.isSet && (
        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-blue-400 font-bold flex-shrink-0">🎓 University:</span>
            <span className="text-white font-semibold truncate">
              {formatDeadlineString(universityConv)}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold self-start sm:self-center flex-shrink-0 ${
            universityConv.isPassed ? "bg-rose-500/20 text-rose-300" : "bg-blue-500/20 text-blue-200"
          }`}>
            {universityConv.humanCountdown}
          </span>
        </div>
      )}

      {/* 3. General Fallback */}
      {!embassyConv && !universityConv && generalConv && generalConv.isSet && (
        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-cyan font-bold flex-shrink-0">📅 Deadline:</span>
            <span className="text-white font-semibold truncate">
              {formatDeadlineString(generalConv)}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold self-start sm:self-center flex-shrink-0 ${
            generalConv.isPassed ? "bg-rose-500/20 text-rose-300" : "bg-cyan/20 text-cyan"
          }`}>
            {generalConv.humanCountdown}
          </span>
        </div>
      )}
    </div>
  );
}
