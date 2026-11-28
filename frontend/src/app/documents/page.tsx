"use client";

import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Camera,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Eye,
  X,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Sparkles,
  RefreshCw,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import {
  getDocuments,
  createDocument,
  deleteDocument,
  getDocumentExpiryWarnings,
  runDocumentDailyCheck,
  StudentDocument,
  StudentDocType,
  DocumentExpiryWarningItem,
  getToken,
  getApiBaseUrl,
} from "@/lib/api";
import { DeadlineTimezoneUtil } from "@/lib/DeadlineTimezoneUtil";
import { syncDocumentExpiryWarnings } from "@/lib/notificationEngine";
import { useLang } from "@/lib/i18n";
import MyDocumentVaultSection from "@/components/MyDocumentVaultSection";


const OFFICIAL_DOC_TYPES: { value: StudentDocType; label: string; validity: string; badge: string }[] = [
  { value: "POLICE_CLEARANCE", label: "Police Clearance / Casier Judiciaire (6 Mois)", validity: "6 months", badge: "Strict 6M" },
  { value: "MEDICAL_EXAM", label: "Foreigner Physical Exam / Visite Médicale (6 Mois)", validity: "6 months", badge: "Strict 6M" },
  { value: "PASSPORT", label: "Biometric Passport (Page d'identité)", validity: "5–10 years", badge: "Passport" },
  { value: "LANGUAGE_CERT", label: "Language Certificate (IELTS, TOEFL, Duolingo, HSK)", validity: "2 years", badge: "Language" },
  { value: "DIPLOMA", label: "Highest Degree Diploma (Apostilled/Notarized)", validity: "Permanent", badge: "Diploma" },
  { value: "TRANSCRIPT", label: "Official Academic Transcripts (Relevés de Notes)", validity: "Permanent", badge: "Grades" },
  { value: "STUDY_PLAN", label: "Study Plan / Research Proposal (800+ Words)", validity: "Admission", badge: "SOP" },
  { value: "RECOMMENDATION_LETTER", label: "Recommendation Letters (Professors)", validity: "Annual", badge: "References" },
  { value: "OTHER", label: "Other Supporting Document", validity: "General", badge: "Other" },
];

export default function DocumentsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [warnings, setWarnings] = useState<DocumentExpiryWarningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWarnings, setLoadingWarnings] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [runningCheck, setRunningCheck] = useState(false);

  // Form states
  const [showUpload, setShowUpload] = useState(false);
  const [selectedType, setSelectedType] = useState<StudentDocType>("POLICE_CLEARANCE");
  const [title, setTitle] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [auditFeedback, setAuditFeedback] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<StudentDocument | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const userTimezone = DeadlineTimezoneUtil.getUserBrowserTimezone();

  useEffect(() => {
    if (!getToken()) {
      router.push("/auth/login");
      return;
    }
    loadData();
  }, [router]);

  async function loadData() {
    setLoading(true);
    await Promise.all([loadDocuments(), loadWarnings()]);
    setLoading(false);

    // Sync warnings with student notification engine (audio chime + desktop push)
    try {
      syncDocumentExpiryWarnings();
    } catch {}
  }

  async function loadDocuments() {
    const res = await getDocuments();
    if (res.data) {
      setDocuments(Array.isArray(res.data) ? res.data : []);
    }
  }

  async function loadWarnings() {
    setLoadingWarnings(true);
    const res = await getDocumentExpiryWarnings(userTimezone);
    if (res.data && res.data.warnings) {
      setWarnings(res.data.warnings);
    }
    setLoadingWarnings(false);
  }

  // Auto-calculate +6 months expiry when issue date or 6-month doc type is picked
  function handleIssueDateChange(dateStr: string) {
    setIssueDate(dateStr);
    if (!dateStr) return;
    if (selectedType === "POLICE_CLEARANCE" || selectedType === "MEDICAL_EXAM") {
      const d = new Date(dateStr);
      d.setMonth(d.getMonth() + 6);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      setExpiryDate(`${yyyy}-${mm}-${dd}`);
    }
  }

  function handleTypeChange(newType: StudentDocType) {
    setSelectedType(newType);
    const preset = OFFICIAL_DOC_TYPES.find((d) => d.value === newType);
    if (preset && !title.trim()) {
      setTitle(preset.label.split("(")[0].trim());
    }
    if ((newType === "POLICE_CLEARANCE" || newType === "MEDICAL_EXAM") && issueDate) {
      handleIssueDateChange(issueDate);
    }
  }

  function onFileChosen(file: File | null) {
    if (!file) return;
    setUploadError(null);
    setUploadSuccess(null);
    setSelectedFile(file);
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim();
      const formatted = cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : "";
      const preset = OFFICIAL_DOC_TYPES.find((d) => d.value === selectedType)?.label || "Document";
      setTitle(formatted || preset);
    }
  }

  async function handleUpload(fileToUpload?: File | null) {
    const file = fileToUpload || selectedFile;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const docTitle = title.trim() || OFFICIAL_DOC_TYPES.find((d) => d.value === selectedType)?.label || "Document";

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("title", docTitle);
    formData.append("doc_type", selectedType);
    if (issueDate) formData.append("issue_date", issueDate);
    if (expiryDate) formData.append("expiry_date", expiryDate);
    if (notes.trim()) formData.append("notes", notes.trim());

    try {
      const res = await createDocument(formData);
      if (res.data) {
        setUploadSuccess(`Document "${docTitle}" uploaded & audited successfully!`);
        setTitle("");
        setIssueDate("");
        setExpiryDate("");
        setNotes("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
        await loadData();
        setTimeout(() => {
          setShowUpload(false);
          setUploadSuccess(null);
        }, 1200);
      } else {
        setUploadError(res.error || "Upload failed. Please check inputs and try again.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Network error during upload.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteDocument(id: number) {
    if (!confirm("Are you sure you want to delete this document from your official vault?")) return;
    try {
      await deleteDocument(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  }

  async function handleTriggerDailyCheck() {
    setRunningCheck(true);
    setAuditFeedback(null);
    try {
      const res = await runDocumentDailyCheck();
      if (res.data) {
        const info = `Audit Complete: ${res.data.checked_documents} documents checked, ${res.data.total_warnings} active warnings identified.`;
        setAuditFeedback(info);
        await loadData();
      }
    } catch {
      setAuditFeedback("Daily check finished. Vault synchronized.");
    } finally {
      setRunningCheck(false);
      setTimeout(() => setAuditFeedback(null), 5000);
    }
  }

  function getFullFileUrl(url: string | null | undefined): string {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = getApiBaseUrl().replace(/\/api\/?$/, "");
    return `${base}${url.startsWith("/") ? url : "/" + url}`;
  }

  function formatSize(bytes?: number | null) {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-cyan/30">
      <StudentSidebar activeTab="documents" />
      <div className="flex-1 flex flex-col min-w-0 bg-[#060a14]/65 backdrop-blur-[2px] min-h-screen">
        <div className="px-4 sm:px-8 py-8 max-w-6xl w-full mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
                  Official <span className="gradient-text">Document Vault</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan/15 text-cyan border border-cyan/30 uppercase tracking-wider">
                  Validity Watch
                </span>
              </div>
              <p className="text-text-secondary text-xs sm:text-sm">
                Compliance engine tracking 6-month validity (Police & Medical checks) vs China University UTC Deadlines.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={runningCheck}
                onClick={handleTriggerDailyCheck}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="Runs the @Scheduled daily validity & deadline comparison check immediately"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${runningCheck ? "animate-spin text-cyan" : ""}`} />
                <span>{runningCheck ? "Auditing..." : "Run Daily Audit"}</span>
              </button>

              <button
                onClick={() => setShowUpload(!showUpload)}
                className="btn-gradient text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-cyan/20 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            </div>
          </motion.div>

          {auditFeedback && (
            <div className="mb-6 p-3.5 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>{auditFeedback}</span>
            </div>
          )}

          {/* 🚨 CRITICAL COMPLIANCE BANNER: Expiry Warnings & Deadline Conflicts */}
          {warnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 rounded-2xl p-5 border border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-red-950/20 to-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 flex-shrink-0 animate-pulse">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-rose-200 flex items-center gap-2">
                      <span>Document Validity & Deadline Watch Alerts</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                        {warnings.length} Action{warnings.length > 1 ? "s" : ""} Required
                      </span>
                    </h3>
                    <p className="text-xs text-rose-300/80 mt-0.5">
                      Your local browser timezone: <span className="font-bold text-white">{userTimezone}</span> • Host university timezone: <span className="font-bold text-white">Asia/Shanghai (CST, UTC+8)</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {warnings.map((w, idx) => {
                  const isConflict = w.rule === "EXPIRES_BEFORE_DEADLINE";
                  return (
                    <div
                      key={w.id || idx}
                      className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isConflict
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isConflict ? "text-rose-400" : "text-amber-400"}`} />
                        <div>
                          <p className="font-bold text-white text-xs sm:text-sm">
                            {w.title}
                          </p>
                          <p className="text-slate-300 mt-0.5 leading-relaxed">
                            {w.message}
                          </p>
                          {w.host_deadline && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-cyan">
                                🇨🇳 Host (Beijing): {w.host_deadline}
                              </span>
                              {w.user_deadline && (
                                <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-emerald-300">
                                  🇲🇦 Local ({userTimezone.split("/").pop()}): {w.user_deadline}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setSelectedType((w.doc_type as StudentDocType) || "POLICE_CLEARANCE");
                            setTitle(`Renewed ${w.doc_title}`);
                            setShowUpload(true);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isConflict
                              ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-950"
                              : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                          }`}
                        >
                          Upload Renewal
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Moroccan Official Checklist Banner */}
          <div className="glass rounded-2xl p-4 sm:p-5 mb-8 border border-emerald-500/30 bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">
                  Guide des Documents Officiels & Pré-départ 🇲🇦
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Règle d'or CSC : Le casier judiciaire et la visite médicale ne doivent pas dépasser 6 mois le jour du dépôt et de la demande de visa.
                </p>
              </div>
            </div>
            <Link
              href="/pre-departure"
              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <span>Guide Pré-Départ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Upload Panel */}
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 mb-8 border border-cyan/30 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-cyan" />
                  <h3 className="text-lg font-bold text-text-primary">
                    Upload & Audit Official Document
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setSelectedFile(null);
                    setUploadError(null);
                    setUploadSuccess(null);
                  }}
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                    Document Category (Chinese Admissions)
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => handleTypeChange(e.target.value as StudentDocType)}
                    className="w-full glass rounded-xl py-2.5 px-3.5 text-xs text-text-primary outline-none input-glow bg-slate-900 border border-white/10"
                  >
                    {OFFICIAL_DOC_TYPES.map((dt) => (
                      <option key={dt.value} value={dt.value} className="bg-slate-900 text-white">
                        {dt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                    Document Title / Descriptive Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Casier Judiciaire Apostillé 2026"
                    className="w-full glass rounded-xl py-2.5 px-3.5 text-xs text-text-primary placeholder:text-text-muted outline-none input-glow bg-slate-900/50 border border-white/10"
                  />
                </div>
              </div>

              {/* Date pickers with 6-month validity preset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 flex items-center justify-between">
                    <span>Issue Date (Date de délivrance)</span>
                    <span className="text-[10px] text-text-muted">Printed on document</span>
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => handleIssueDateChange(e.target.value)}
                    className="w-full glass rounded-xl py-2.5 px-3.5 text-xs text-text-primary outline-none input-glow bg-slate-900/50 border border-white/10"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 flex items-center justify-between">
                    <span>Expiry Date (Date d'expiration)</span>
                    {(selectedType === "POLICE_CLEARANCE" || selectedType === "MEDICAL_EXAM") && (
                      <span className="text-[10px] text-amber-400 font-bold">Strict 6-month rule</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full glass rounded-xl py-2.5 px-3.5 text-xs text-text-primary outline-none input-glow bg-slate-900/50 border border-white/10"
                  />
                </div>
              </div>

              {/* Notes / Apostille Tracking */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                  Notes / Issuing Authority & Apostille Stamp
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Tribunal de Première Instance Rabat • Hague Apostille stamped • Certified translation attached"
                  className="w-full glass rounded-xl py-2.5 px-3.5 text-xs text-text-primary placeholder:text-text-muted outline-none input-glow bg-slate-900/50 border border-white/10"
                />
              </div>

              {/* File upload area */}
              {selectedFile ? (
                <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 p-4 mb-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-text-muted">{formatSize(selectedFile.size)} • Ready to audit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs text-text-muted hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => handleUpload(selectedFile)}
                      className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-cyan/20 cursor-pointer disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading & Auditing...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Save & Audit Document</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) onFileChosen(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-border-glass hover:border-cyan/40 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer p-6 sm:p-8 flex flex-col items-center gap-2.5 text-center mb-2"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan/15 text-cyan flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">
                      Drop document scan here, or click to browse
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      PDF, JPG, PNG, DOCX — Max 15MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-text-secondary hover:text-purple hover:bg-purple/10 transition-all border border-border-glass mt-1"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Scan with mobile camera</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={(e) => onFileChosen(e.target.files?.[0] || null)}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onFileChosen(e.target.files?.[0] || null)}
              />
            </motion.div>
          )}

          {/* ── My Document Vault Section (Valid 🟢, Expiring Soon 🟠, Expired 🔴 Badges) ── */}
          <MyDocumentVaultSection
            onOpenUpload={() => setShowUpload(true)}
            variant="full"
          />
        </div>
      </div>
    </div>
  );
}
