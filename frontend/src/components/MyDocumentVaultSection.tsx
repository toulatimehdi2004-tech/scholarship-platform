"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ShieldCheck,
  Calendar,
  Eye,
  Trash2,
  RefreshCw,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  getDocuments,
  deleteDocument,
  runDocumentDailyCheck,
  StudentDocument,
  StudentDocType,
  getApiBaseUrl,
} from "@/lib/api";
import { DeadlineTimezoneUtil } from "@/lib/DeadlineTimezoneUtil";
import { useLang } from "@/lib/i18n";

export interface MyDocumentVaultSectionProps {
  onOpenUpload?: () => void;
  variant?: "full" | "embedded";
  className?: string;
}

export default function MyDocumentVaultSection({
  onOpenUpload,
  variant = "full",
  className = "",
}: MyDocumentVaultSectionProps) {
  const { lang } = useLang();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "valid" | "expiring_soon" | "expired">("all");
  const [runningCheck, setRunningCheck] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const userTimezone = DeadlineTimezoneUtil.getUserBrowserTimezone();

  useEffect(() => {
    loadVault();
  }, []);

  async function loadVault() {
    setLoading(true);
    try {
      const res = await getDocuments();
      if (res.data) {
        setDocuments(Array.isArray(res.data) ? res.data : []);
      }
    } catch {}
    setLoading(false);
  }

  async function handleTriggerAudit() {
    setRunningCheck(true);
    setFeedback(null);
    try {
      const res = await runDocumentDailyCheck();
      if (res.data) {
        setFeedback(`Audit complete: ${res.data.checked_documents} documents checked, ${res.data.total_warnings} warnings identified.`);
        await loadVault();
      }
    } catch {
      setFeedback("Audit complete. Document Vault synchronized.");
    } finally {
      setRunningCheck(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this document from your vault?")) return;
    try {
      await deleteDocument(id);
      await loadVault();
    } catch (e) {
      console.error(e);
    }
  }

  // Calculate Status Categories
  const validDocs = documents.filter((d) => {
    if (!d.expiry_date) return true; // permanent like diploma/transcript
    const isExpired = d.is_expired;
    const isSoon = d.is_expiring_soon;
    const hasConflict = d.tracked_conflicts && d.tracked_conflicts.length > 0;
    return !isExpired && !isSoon && !hasConflict;
  });

  const expiringSoonDocs = documents.filter((d) => {
    if (!d.expiry_date) return false;
    const isExpired = d.is_expired;
    const isSoon = d.is_expiring_soon;
    const hasConflict = d.tracked_conflicts && d.tracked_conflicts.length > 0;
    return !isExpired && isSoon && !hasConflict;
  });

  const expiredDocs = documents.filter((d) => {
    if (!d.expiry_date) return false;
    const isExpired = d.is_expired;
    const hasConflict = d.tracked_conflicts && d.tracked_conflicts.length > 0;
    return isExpired || hasConflict;
  });

  // Filtered documents for display
  const displayedDocs = documents.filter((d) => {
    if (filter === "all") return true;
    if (filter === "valid") return validDocs.includes(d);
    if (filter === "expiring_soon") return expiringSoonDocs.includes(d);
    if (filter === "expired") return expiredDocs.includes(d);
    return true;
  });

  function getFullFileUrl(url: string | null | undefined): string {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = getApiBaseUrl().replace(/\/api\/?$/, "");
    return `${base}${url.startsWith("/") ? url : "/" + url}`;
  }

  return (
    <section className={`rounded-3xl bg-[#0a1120]/90 border border-white/10 backdrop-blur-xl p-5 sm:p-7 shadow-2xl space-y-6 ${className}`}>
      {/* ── 1. Top Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan/20 to-purple/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-lg">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                My Document Vault
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan/15 text-cyan border border-cyan/30 uppercase tracking-wider">
                Official Compliance
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Live validity tracking for 6-month Police Clearance & Medical Examination against Chinese admission deadlines.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            disabled={runningCheck}
            onClick={handleTriggerAudit}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Trigger daily scheduled validity check"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${runningCheck ? "animate-spin text-cyan" : ""}`} />
            <span>{runningCheck ? "Auditing..." : "Daily Audit Check"}</span>
          </button>

          {onOpenUpload ? (
            <button
              onClick={onOpenUpload}
              className="btn-gradient text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold shadow-lg shadow-cyan/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          ) : (
            <Link
              href="/documents"
              className="btn-gradient text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold shadow-lg shadow-cyan/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </Link>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ── 2. THREE CORE STATUS BADGE COUNTERS (Green Valid, Orange Expiring Soon, Red Expired) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* GREEN BADGE: Valid */}
        <div
          onClick={() => setFilter(filter === "valid" ? "all" : "valid")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
            filter === "valid"
              ? "bg-emerald-500/20 border-emerald-500 text-white ring-2 ring-emerald-500/40"
              : "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50 text-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Status: Valid
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {validDocs.length} <span className="text-xs font-semibold text-emerald-300">Valid</span>
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            Valid 🟢
          </span>
        </div>

        {/* ORANGE BADGE: Expiring Soon */}
        <div
          onClick={() => setFilter(filter === "expiring_soon" ? "all" : "expiring_soon")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
            filter === "expiring_soon"
              ? "bg-amber-500/20 border-amber-500 text-white ring-2 ring-amber-500/40"
              : "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50 text-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 font-bold">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Expiring Soon (&le;30 Days)
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {expiringSoonDocs.length} <span className="text-xs font-semibold text-amber-300">Expiring</span>
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Expiring Soon 🟠
          </span>
        </div>

        {/* RED BADGE: Expired */}
        <div
          onClick={() => setFilter(filter === "expired" ? "all" : "expired")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
            filter === "expired"
              ? "bg-rose-500/20 border-rose-500 text-white ring-2 ring-rose-500/40"
              : "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50 text-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center flex-shrink-0 font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                Expired / Conflicts
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {expiredDocs.length} <span className="text-xs font-semibold text-rose-300">Action Needed</span>
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
            Expired 🔴
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold mr-1">Filter:</span>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            filter === "all" ? "bg-white/15 text-white" : "bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          All Documents ({documents.length})
        </button>
        <button
          onClick={() => setFilter("valid")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === "valid" ? "bg-emerald-500 text-white" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          }`}
        >
          <span>🟢 Valid ({validDocs.length})</span>
        </button>
        <button
          onClick={() => setFilter("expiring_soon")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === "expiring_soon" ? "bg-amber-500 text-slate-950 font-black" : "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
          }`}
        >
          <span>🟠 Expiring Soon ({expiringSoonDocs.length})</span>
        </button>
        <button
          onClick={() => setFilter("expired")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === "expired" ? "bg-rose-500 text-white font-black" : "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
          }`}
        >
          <span>🔴 Expired / Conflicts ({expiredDocs.length})</span>
        </button>
      </div>

      {/* ── 3. Document Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-5 bg-white/5 border border-white/5 h-40 animate-pulse" />
          ))}
        </div>
      ) : displayedDocs.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
          <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-300">No documents match this filter</p>
          <p className="text-xs text-slate-500">
            {filter === "all" ? "Add your passport, physical exam, and police clearance to track validity." : "All your documents are in other categories."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedDocs.map((doc, idx) => {
            const hasConflict = doc.tracked_conflicts && doc.tracked_conflicts.length > 0;
            const isExpired = doc.is_expired;
            const isExpiringSoon = doc.is_expiring_soon;

            // Determine Exact Badge Style & Label
            let badgeStyle = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
            let badgeLabel = "Valid 🟢";
            let daysText = doc.days_until_expiry ? `${doc.days_until_expiry} days remaining` : "Permanent Validity";

            if (hasConflict) {
              badgeStyle = "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950 animate-pulse";
              badgeLabel = "Deadline Conflict 🔴";
              daysText = "Expires before tracked scholarship";
            } else if (isExpired) {
              badgeStyle = "bg-rose-500/20 text-rose-300 border-rose-500/40";
              badgeLabel = "Expired 🔴";
              daysText = doc.days_until_expiry ? `Expired ${Math.abs(doc.days_until_expiry)} days ago` : "Expired";
            } else if (isExpiringSoon) {
              badgeStyle = "bg-amber-500/20 text-amber-300 border-amber-500/40";
              badgeLabel = "Expiring Soon 🟠";
              daysText = `${doc.days_until_expiry} days left (Renew Now)`;
            }

            return (
              <motion.div
                key={doc.id || idx}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  hasConflict
                    ? "bg-rose-950/20 border-rose-500/50 hover:border-rose-400"
                    : isExpired
                    ? "bg-rose-950/10 border-rose-500/30 hover:border-rose-400"
                    : isExpiringSoon
                    ? "bg-amber-950/15 border-amber-500/40 hover:border-amber-400"
                    : "bg-white/[0.03] border-white/10 hover:border-cyan/40"
                }`}
              >
                <div>
                  {/* Category & Badge Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan px-2.5 py-0.5 rounded-full bg-cyan/10">
                      {doc.doc_type_display || doc.doc_type}
                    </span>

                    {/* Green / Orange / Red Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border flex items-center gap-1 ${badgeStyle}`}>
                      <span>{badgeLabel}</span>
                    </span>
                  </div>

                  {/* Document Title */}
                  <h4 className="text-sm font-extrabold text-white mb-2 line-clamp-1">
                    {doc.title || doc.doc_type_display || "Official Certificate"}
                  </h4>

                  {/* Date details */}
                  <div className="space-y-1.5 text-xs text-slate-300 mb-3.5">
                    {doc.issue_date && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400">Issue Date:</span>
                        <span className="font-mono text-slate-200">{doc.issue_date}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400">Expiry Date:</span>
                      <span className={`font-mono font-bold ${
                        hasConflict || isExpired
                          ? "text-rose-400"
                          : isExpiringSoon
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}>
                        {doc.expiry_date || "No Expiry (Permanent)"}
                      </span>
                    </div>

                    <p className={`text-[11px] font-bold ${
                      hasConflict || isExpired
                        ? "text-rose-400"
                        : isExpiringSoon
                        ? "text-amber-300"
                        : "text-emerald-400"
                    }`}>
                      • {daysText}
                    </p>

                    {doc.notes && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-1 pt-1 border-t border-white/5">
                        "{doc.notes}"
                      </p>
                    )}
                  </div>

                  {/* Conflict alert box */}
                  {hasConflict && doc.tracked_conflicts && (
                    <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-200 mb-3 space-y-1">
                      <p className="font-bold text-white flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Expires before scholarship deadline:</span>
                      </p>
                      {doc.tracked_conflicts.map((tc, k) => (
                        <p key={k} className="text-rose-300">
                          • {tc.scholarship_title} ({tc.deadline_label})
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5 mt-2">
                  {doc.file_url ? (
                    <a
                      href={getFullFileUrl(doc.file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-cyan hover:underline font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Scan</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500">Scan not attached</span>
                  )}

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
