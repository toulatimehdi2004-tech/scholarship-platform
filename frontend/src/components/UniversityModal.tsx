"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  GraduationCap,
  BookOpen,
  ExternalLink,
  MapPin,
  ArrowRight,
  FileText,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface UniversityModalProps {
  isOpen: boolean;
  onClose: () => void;
  universityId: number;
  universityName: string;
  universityWebsite?: string;
  universityCity?: string;
  universityCountry?: string;
  scholarshipId?: number;
  scholarshipTitle?: string;
  applicationLink?: string | null;
}

export default function UniversityModal(props: UniversityModalProps & { initialScholarshipId?: number }) {
  const {
    isOpen,
    onClose,
    universityId,
    universityName,
    universityWebsite,
    universityCity,
    universityCountry,
    scholarshipId,
    scholarshipTitle,
    applicationLink,
    initialScholarshipId,
  } = props;
  if (!isOpen) return null;

  const effectiveSchId = scholarshipId || initialScholarshipId;
  const location = [universityCity, universityCountry].filter(Boolean).join(", ");
  const applyUrl = applicationLink || universityWebsite || "#";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg glass rounded-3xl p-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-8 pt-8 pb-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary line-clamp-1">
                    {universityName}
                  </h2>
                  {location && (
                    <p className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {location}
                    </p>
                  )}
                </div>
              </div>

              {scholarshipTitle && (
                <div className="px-4 py-2.5 rounded-xl bg-cyan/10 border border-cyan/20">
                  <p className="text-xs text-text-muted">Viewing from scholarship:</p>
                  <p className="text-sm font-medium text-text-primary line-clamp-1 mt-0.5">
                    {scholarshipTitle}
                  </p>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="px-8 pb-8 space-y-3">
              {/* Option 1: View Scholarship Details */}
              {effectiveSchId && (
                <Link
                  href={"/scholarships/" + effectiveSchId}
                  onClick={onClose}
                  className="group flex items-center gap-4 p-4 rounded-2xl glass-light border border-border-glass hover:border-cyan/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan/20 to-blue/20 flex items-center justify-center flex-shrink-0 group-hover:from-cyan/30 group-hover:to-blue/30 transition-all">
                    <FileText className="w-6 h-6 text-cyan" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-text-primary group-hover:text-cyan transition-colors">
                      View Scholarship Details
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      See full info, eligibility, documents, and deadlines
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-cyan group-hover:translate-x-1 transition-all" />
                </Link>
              )}

              {/* Option 2: View University Details */}
              <Link
                href={"/university/" + universityId}
                onClick={onClose}
                className="group flex items-center gap-4 p-4 rounded-2xl glass-light border border-border-glass hover:border-purple/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple/20 to-blue/20 flex items-center justify-center flex-shrink-0 group-hover:from-purple/30 group-hover:to-blue/30 transition-all">
                  <BookOpen className="w-6 h-6 text-purple" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-text-primary group-hover:text-purple transition-colors">
                    View University Details
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Browse all scholarships, programs, and university info
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-purple group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Option 3: How to Apply */}
              <Link
                href={"/apply/" + universityId}
                onClick={onClose}
                className="group flex items-center gap-4 p-4 rounded-2xl glass-light border border-border-glass hover:border-emerald-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan/20 flex items-center justify-center flex-shrink-0 group-hover:from-emerald-500/30 group-hover:to-cyan/30 transition-all">
                  <Send className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-text-primary group-hover:text-emerald-400 transition-colors">
                    How to Apply
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Step-by-step guide and application link
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Option 4: Visit Official Website → direct to apply page */}
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="group flex items-center gap-4 p-4 rounded-2xl glass-light border border-border-glass hover:border-amber-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple/20 flex items-center justify-center flex-shrink-0 group-hover:from-amber-500/30 group-hover:to-purple/30 transition-all">
                  <ExternalLink className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-text-primary group-hover:text-amber-400 transition-colors">
                    Visit Official Website
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {applicationLink
                      ? "Opens the application page directly"
                      : "Go directly to the university's admissions page"}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </a>
            </div>

            {/* Bottom glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
