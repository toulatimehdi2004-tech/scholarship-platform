"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  GraduationCap,
  Award,
  ChevronRight,
  Sliders,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Scholarship } from "@/lib/api";
import {
  getAcademicProfile,
  saveAcademicProfile,
  evaluateScholarshipMatch,
  convertGpaTo100,
  type AcademicProfile,
  type MatchEvaluationResult,
  type GpaScale,
} from "@/lib/academicProfile";

interface ScholarshipMatchModalProps {
  scholarship: Scholarship;
  isOpen: boolean;
  onClose: () => void;
  onOpenProfileForm?: () => void;
}

export default function ScholarshipMatchModal({
  scholarship,
  isOpen,
  onClose,
  onOpenProfileForm,
}: ScholarshipMatchModalProps) {
  const [profile, setProfile] = useState<AcademicProfile>(getAcademicProfile());
  const [evaluation, setEvaluation] = useState<MatchEvaluationResult>(() =>
    evaluateScholarshipMatch(scholarship, getAcademicProfile())
  );
  const [isEditingGpa, setIsEditingGpa] = useState(false);
  const [gpaInput, setGpaInput] = useState(profile.gpaRaw);
  const [gpaScale, setGpaScale] = useState<GpaScale>(profile.gpaScale);

  useEffect(() => {
    if (isOpen) {
      const current = getAcademicProfile();
      setProfile(current);
      setGpaInput(current.gpaRaw);
      setGpaScale(current.gpaScale);
      setEvaluation(evaluateScholarshipMatch(scholarship, current));
    }
  }, [isOpen, scholarship]);

  function handleSaveQuickGpa() {
    const updated: AcademicProfile = {
      ...profile,
      gpaRaw: gpaInput.trim() || "15.0",
      gpaScale,
    };
    saveAcademicProfile(updated);
    setProfile(updated);
    setEvaluation(evaluateScholarshipMatch(scholarship, updated));
    setIsEditingGpa(false);
  }

  if (!isOpen) return null;

  const colorStyles = {
    green: {
      badgeBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
      glowBg: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      text: "text-emerald-400",
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      tag: "Strong Match — Highly Eligible",
    },
    orange: {
      badgeBg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
      glowBg: "from-amber-500/20 via-amber-500/5 to-transparent",
      text: "text-amber-400",
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      tag: "Moderate Match — Review Requirements",
    },
    red: {
      badgeBg: "bg-rose-500/15 border-rose-500/30 text-rose-400",
      glowBg: "from-rose-500/20 via-rose-500/5 to-transparent",
      text: "text-rose-400",
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
      tag: "Ineligible — Criteria Not Satisfied",
    },
  }[evaluation.color];

  const normalizedPreview = convertGpaTo100(gpaInput, gpaScale);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl rounded-3xl bg-[#0c1424] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Ambient Glow */}
          <div
            className={`absolute top-0 inset-x-0 h-36 bg-gradient-to-b ${colorStyles.glowBg} pointer-events-none`}
          />

          {/* Modal Header */}
          <div className="relative p-6 pb-4 flex items-start justify-between border-b border-white/10">
            <div className="pr-8">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${colorStyles.badgeBg}`}
                >
                  {colorStyles.icon}
                  <span>{evaluation.badgeLabel}</span>
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  • {colorStyles.tag}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                {scholarship.title}
              </h3>
              <p className="text-xs text-cyan font-medium mt-0.5">
                {scholarship.university_name || "Chinese Partner University"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Match Score Meter */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Algorithmic Match Score
                </span>
                <span className={`text-2xl font-black ${colorStyles.text}`}>
                  {evaluation.matchScore}%
                </span>
              </div>
              {/* Progress Track */}
              <div className="h-3 w-full rounded-full bg-slate-800/80 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    evaluation.color === "green"
                      ? "bg-gradient-to-r from-emerald-500 to-cyan"
                      : evaluation.color === "orange"
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                      : "bg-gradient-to-r from-rose-600 to-rose-400"
                  }`}
                  style={{ width: `${evaluation.matchScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>0% Ineligible</span>
                <span>65% Min Threshold</span>
                <span>100% Full Ride Pick</span>
              </div>
            </div>

            {/* Criteria Breakdown: Green Checks & Red Xs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-cyan" />
                  <span>Eligibility Rules Breakdown</span>
                </h4>
                <span className="text-xs text-slate-400">
                  {evaluation.rules.filter((r) => r.passed).length} of{" "}
                  {evaluation.rules.length} criteria satisfied
                </span>
              </div>

              <div className="space-y-2.5">
                {evaluation.rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`rounded-xl p-3.5 border transition-all flex items-start gap-3 ${
                      rule.passed
                        ? "bg-emerald-500/[0.07] border-emerald-500/20 text-slate-200"
                        : "bg-rose-500/[0.08] border-rose-500/25 text-slate-200"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {rule.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {rule.title}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            rule.passed
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {rule.passed ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {rule.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick-Adjust Academic GPA Bar */}
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple" />
                    <span>Your Academic GPA Setting</span>
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Currently:{" "}
                    <span className="text-cyan font-bold">
                      {profile.gpaRaw}{" "}
                      {profile.gpaScale === "SCALE_20"
                        ? "/ 20 (Maroc)"
                        : profile.gpaScale === "SCALE_4"
                        ? "/ 4.0 (Global)"
                        : "/ 100%"}
                    </span>{" "}
                    (Normalized: {evaluation.normalizedGpa100}/100)
                  </p>
                </div>

                <button
                  onClick={() => setIsEditingGpa(!isEditingGpa)}
                  className="px-3 py-1.5 rounded-xl bg-cyan/15 hover:bg-cyan/25 text-cyan border border-cyan/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isEditingGpa ? "Cancel" : "Quick Adjust"}</span>
                </button>
              </div>

              {/* Inline Quick GPA Editor */}
              {isEditingGpa && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Scale:</span>
                    <div className="inline-flex rounded-lg bg-black/40 p-0.5 border border-white/10 text-xs">
                      <button
                        type="button"
                        onClick={() => setGpaScale("SCALE_20")}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                          gpaScale === "SCALE_20"
                            ? "bg-cyan text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        / 20 (Maroc)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGpaScale("SCALE_100")}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                          gpaScale === "SCALE_100"
                            ? "bg-cyan text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        / 100 (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGpaScale("SCALE_4")}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                          gpaScale === "SCALE_4"
                            ? "bg-cyan text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        / 4.0 (US)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={gpaInput}
                        onChange={(e) => setGpaInput(e.target.value)}
                        placeholder={
                          gpaScale === "SCALE_20"
                            ? "e.g. 15.5"
                            : gpaScale === "SCALE_4"
                            ? "e.g. 3.6"
                            : "e.g. 82"
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <button
                      onClick={handleSaveQuickGpa}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan to-blue-500 hover:from-cyan/90 hover:to-blue-500/90 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Recalculate</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Live Normalized Score:{" "}
                    <span className="text-emerald-400 font-bold">
                      {normalizedPreview} / 100
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-black/30 flex items-center justify-between gap-3">
            {onOpenProfileForm ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenProfileForm();
                }}
                className="text-xs text-cyan hover:underline font-bold flex items-center gap-1"
              >
                <span>Edit Full Profile (Degree, Age, Country)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                href="/profile"
                className="text-xs text-cyan hover:underline font-bold flex items-center gap-1"
              >
                <span>Edit Full Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}

            <div className="flex items-center gap-2">
              <Link
                href={`/scholarships/${scholarship.id}`}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>View Scholarship</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/apply/${scholarship.id}`}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan hover:opacity-95 text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-500/20"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
