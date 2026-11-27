"use client";

import { useState, useEffect } from "react";
import { Sparkles, AlertTriangle, XCircle, ChevronDown, Check } from "lucide-react";
import type { Scholarship } from "@/lib/api";
import {
  getAcademicProfile,
  evaluateScholarshipMatch,
  onAcademicProfileUpdated,
  type AcademicProfile,
  type MatchEvaluationResult,
} from "@/lib/academicProfile";
import ScholarshipMatchModal from "./ScholarshipMatchModal";

interface ScholarshipMatchBadgeProps {
  scholarship: Scholarship;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
  onOpenProfileForm?: () => void;
}

export default function ScholarshipMatchBadge({
  scholarship,
  size = "md",
  className = "",
  showIcon = true,
  onOpenProfileForm,
}: ScholarshipMatchBadgeProps) {
  const [profile, setProfile] = useState<AcademicProfile>(getAcademicProfile());
  const [evaluation, setEvaluation] = useState<MatchEvaluationResult>(() =>
    evaluateScholarshipMatch(scholarship, getAcademicProfile())
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Recompute when scholarship or mounted
    const current = getAcademicProfile();
    setProfile(current);
    setEvaluation(evaluateScholarshipMatch(scholarship, current));

    // Listen to real-time profile updates across the whole app
    const unsubscribe = onAcademicProfileUpdated((updated) => {
      setProfile(updated);
      setEvaluation(evaluateScholarshipMatch(scholarship, updated));
    });

    return unsubscribe;
  }, [scholarship]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  }

  const colorStyles = {
    green: {
      badge:
        "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10",
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />,
      dot: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
    },
    orange: {
      badge:
        "bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30 shadow-sm shadow-amber-500/10",
      icon: (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
      ),
      dot: "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
    },
    red: {
      badge:
        "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border-rose-500/30 shadow-sm shadow-rose-500/10",
      icon: <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />,
      dot: "bg-rose-400 shadow-[0_0_8px_#f43f5e]",
    },
  }[evaluation.color];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm",
  }[size];

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="Click to view detailed Match & Eligibility rules breakdown"
        className={`group/match inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-wider border transition-all duration-200 cursor-pointer ${colorStyles.badge} ${sizeClasses} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${colorStyles.dot}`} />
        {showIcon && colorStyles.icon}
        <span>{evaluation.badgeLabel}</span>
        <span className="text-[10px] opacity-60 group-hover/match:opacity-100 group-hover/match:translate-y-0.5 transition-all ml-0.5">
          ▾
        </span>
      </button>

      <ScholarshipMatchModal
        scholarship={scholarship}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOpenProfileForm={onOpenProfileForm}
      />
    </>
  );
}
