"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquareHeart,
  CheckCircle2,
  Sparkles,
  Send,
  Edit3,
  ThumbsUp,
  Award,
  Heart,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  submitExperienceReview,
  getExperienceReviews,
  type ExperienceReviewItem,
  type User,
} from "@/lib/api";

interface StudentExperienceReviewProps {
  user?: User | null;
  className?: string;
  onReviewSubmitted?: (review: ExperienceReviewItem) => void;
}

export default function StudentExperienceReview({
  user,
  className = "",
  onReviewSubmitted,
}: StudentExperienceReviewProps) {
  const { t, lang } = useLang();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [submittedReview, setSubmittedReview] = useState<ExperienceReviewItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Storage key specific to student
  const storageKey = user?.id
    ? `scholar_experience_review_${user.id}`
    : "scholar_experience_review_guest";

  // Quick experience chips
  const tags = [
    { id: "fast", label: t("rev.tagFast") },
    { id: "ai", label: t("rev.tagAi") },
    { id: "sch", label: t("rev.tagSch") },
    { id: "tracker", label: t("rev.tagTracker") },
    { id: "verified", label: t("rev.tagVerified") },
  ];

  // Load existing saved review on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as ExperienceReviewItem;
        setSubmittedReview(parsed);
        setRating(parsed.rating || 5);
        setComment(parsed.comment || "");
        setSelectedTag(parsed.category || "");
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  const activeRating = hoverRating || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || rating < 1) return;

    setIsSubmitting(true);
    const authorName =
      user?.first_name
        ? `${user.first_name} ${user.last_name || ""}`.trim()
        : user?.username || "ScholarChina Candidate";

    const payload: ExperienceReviewItem = {
      name: authorName,
      rating,
      comment: comment.trim(),
      category: selectedTag || "General Platform Experience",
    };

    try {
      // Submit to backend
      const res = await submitExperienceReview(payload);
      const savedItem: ExperienceReviewItem = res.data || {
        ...payload,
        id: Date.now(),
        created_at: new Date().toISOString(),
      };

      // Persist in localStorage
      localStorage.setItem(storageKey, JSON.stringify(savedItem));
      setSubmittedReview(savedItem);
      setIsEditing(false);
      setShowSuccessToast(true);

      if (onReviewSubmitted) {
        onReviewSubmitted(savedItem);
      }

      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch {
      // Local fallback in case of network issue
      const fallbackItem: ExperienceReviewItem = {
        ...payload,
        id: Date.now(),
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(fallbackItem));
      setSubmittedReview(fallbackItem);
      setIsEditing(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingDescription = (r: number) => {
    switch (r) {
      case 1:
        return t("rev.star1");
      case 2:
        return t("rev.star2");
      case 3:
        return t("rev.star3");
      case 4:
        return t("rev.star4");
      case 5:
      default:
        return t("rev.star5");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-white/10 relative overflow-hidden shadow-sm dark:shadow-none ${className}`}
    >
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      {/* Toast Alert */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{t("rev.successToast")}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 flex-shrink-0">
            <Star className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-text-primary">
                {t("rev.title")}
              </h3>
              {submittedReview && !isEditing && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  {t("rev.yourReviewBadge")}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-text-secondary mt-0.5">
              {t("rev.subtitle")}
            </p>
          </div>
        </div>

        {submittedReview && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1 flex-shrink-0"
            title={t("rev.editReview")}
          >
            <Edit3 className="w-3 h-3" />
            <span className="hidden sm:inline">{t("rev.editReview")}</span>
          </button>
        )}
      </div>

      {/* View Mode: Already Submitted Review */}
      {submittedReview && !isEditing ? (
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= submittedReview.rating
                      ? "text-amber-400 fill-amber-400 filter drop-shadow-[0_1px_4px_rgba(251,191,36,0.5)]"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              ))}
              <span className="ml-1 text-xs font-bold text-amber-500 dark:text-amber-400">
                {submittedReview.rating}.0 / 5.0
              </span>
            </div>

            {submittedReview.category && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                {submittedReview.category}
              </span>
            )}
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal italic">
            &ldquo;{submittedReview.comment}&rdquo;
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span className="font-medium">
              {submittedReview.name || user?.username || "Verified Student"}
            </span>
            <span>
              {submittedReview.created_at
                ? new Date(submittedReview.created_at).toLocaleDateString(
                    lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-US",
                    { year: "numeric", month: "short", day: "numeric" }
                  )
                : "Recently submitted"}
            </span>
          </div>
        </div>
      ) : (
        /* Edit / Create Form */
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* 1. Star Rating Experience Picker */}
          <div className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
              <span>{t("rev.ratingLabel")}</span>
              <span className="text-xs font-bold text-amber-500 dark:text-amber-400">
                {getRatingDescription(activeRating)}
              </span>
            </div>

            {/* Stars row */}
            <div className="flex items-center gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isLit = starVal <= activeRating;
                return (
                  <motion.button
                    type="button"
                    key={starVal}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-lg hover:bg-amber-500/10 transition-colors focus:outline-none"
                    aria-label={`${starVal} star`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-all ${
                        isLit
                          ? "text-amber-400 fill-amber-400 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]"
                          : "text-slate-300 dark:text-slate-600 hover:text-amber-300"
                      }`}
                    />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Quick sentiment chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.map((tg) => {
              const isSelected = selectedTag === tg.label;
              return (
                <button
                  type="button"
                  key={tg.id}
                  onClick={() =>
                    setSelectedTag(isSelected ? "" : tg.label)
                  }
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all border ${
                    isSelected
                      ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                      : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-amber-400/50"
                  }`}
                >
                  {tg.label}
                </button>
              );
            })}
          </div>

          {/* 2. Place under it to write a comment */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label htmlFor="student-comment-box" className="flex items-center gap-1.5">
                <MessageSquareHeart className="w-3.5 h-3.5 text-amber-500" />
                <span>{t("rev.commentLabel")}</span>
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {comment.length}/500
              </span>
            </div>

            <textarea
              id="student-comment-box"
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("rev.commentPh")}
              required
              className="w-full p-3 rounded-xl bg-white dark:bg-white/[0.04] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-amber-400 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none shadow-2xs"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {submittedReview && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !comment.trim() || rating < 1}
              className={`w-full ${
                submittedReview ? "sm:w-auto" : ""
              } px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t("rev.submitting")}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{t("rev.submitBtn")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
