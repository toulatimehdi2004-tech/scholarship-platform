"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  GraduationCap,
  MapPin,
  ExternalLink,
  FileText,
  DollarSign,
  Calendar,
  BookOpen,
  Mail,
  Phone,
  CheckCircle2,
  Upload,
  Camera,
  Trash2,
  X,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi, getToken, type ScholarshipDetail, type Scholarship } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import AutoText, { translateCached } from "@/components/AutoText";
import ScholarshipCard from "@/components/ScholarshipCard";
import SmartBack from "@/components/SmartBack";
import AdmissionAnnouncements, {
  type Announcement,
} from "@/components/AdmissionAnnouncements";

const ANN_STOP = new Set([
  "the", "a", "an", "at", "for", "of", "and", "in", "on", "to",
  "2026", "2027", "2025", "scholarship", "scholarships", "program",
  "programme", "international", "students", "student", "university",
  "college", "school",
]);

function annTokens(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !ANN_STOP.has(w));
}

export default function ScholarshipClient() {
  const params = useParams();
  const router = useRouter();
  const { t, lang } = useLang();
  const [scholarship, setScholarship] = useState<ScholarshipDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDocs, setShowDocs] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("passport");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const schId = params?.id;
  const [now, setNow] = useState(() => Date.now());
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});
  const [translatedDocs, setTranslatedDocs] = useState<string[] | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [related, setRelated] = useState<Scholarship[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!schId) return;
    try {
      const raw = localStorage.getItem(`sch-checklist-${schId}`);
      setCheckedDocs(raw ? JSON.parse(raw) : {});
    } catch {
      setCheckedDocs({});
    }
  }, [schId]);

  function toggleDoc(i: number) {
    setCheckedDocs((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try {
        localStorage.setItem(`sch-checklist-${schId}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function resetChecklist() {
    setCheckedDocs({});
    try {
      localStorage.removeItem(`sch-checklist-${schId}`);
    } catch {}
  }

  // Load the university's announcements + related scholarships
  const uniId = scholarship?.university?.id;
  useEffect(() => {
    if (!uniId) return;
    let cancelled = false;
    fetchApi<{ announcements: Announcement[] }>(`/universities/${uniId}/`).then(
      (res) => {
        if (!cancelled && res.data?.announcements) {
          setAnnouncements(res.data.announcements);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [uniId]);

  useEffect(() => {
    if (!uniId) return;
    let cancelled = false;
    fetchApi<Scholarship[]>(`/scholarships/?university=${uniId}`).then((res) => {
      if (!cancelled && res.data) {
        setRelated(
          res.data.filter((s) => String(s.id) !== String(schId)).slice(0, 3)
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [uniId, schId]);
  const docsForLang = scholarship?.required_documents || [];
  useEffect(() => {
    if (lang === "en" || docsForLang.length === 0) {
      setTranslatedDocs(null);
      return;
    }
    let cancelled = false;
    translateCached(docsForLang.join("\n"), lang).then((r) => {
      if (!cancelled && r) setTranslatedDocs(r.split("\n"));
    });
    return () => {
      cancelled = true;
    };
  }, [docsForLang, lang]);

  // Most relevant announcements for THIS scholarship (keyword overlap + kind boost)
  const relevantAnnouncements = useMemo(() => {
    if (!scholarship || announcements.length === 0) return [];
    const st = new Set(annTokens(scholarship.title));
    return announcements
      .map((a) => {
        const overlap = annTokens(a.title).filter((w) => st.has(w)).length;
        const boost =
          a.kind === "scholarship" ? 2 : a.kind === "brochure" || a.kind === "guide" ? 1 : 0;
        return { a, score: overlap * 2 + boost };
      })
      .sort((x, y) => y.score - x.score)
      .slice(0, 6)
      .map((x) => x.a);
  }, [announcements, scholarship]);

  useEffect(() => {
    if (!schId) return;

    async function load() {
      setLoading(true);
      const res = await fetchApi<ScholarshipDetail>("/scholarships/" + schId + "/");
      if (res.data) {
        setScholarship(res.data);
      }
      setLoading(false);
    }
    load();
  }, [schId]);

  async function loadDocs() {
    const token = getToken();
    if (!token) return;
    const res = await fetchApi<any[]>("/documents/", {
      headers: { Authorization: "Token " + token },
    });
    if (res.data) {
      setDocuments(Array.isArray(res.data) ? res.data : []);
    }
  }

  async function handleUpload(file: File | null) {
    if (!file || !docTitle.trim()) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", docTitle.trim());
    formData.append("document_type", docType);
    try {
      const token = getToken();
      await fetch("http://localhost:8000/api/documents/", {
        method: "POST",
        headers: { Authorization: "Token " + token },
        body: formData,
      });
      setDocTitle("");
      loadDocs();
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
  }

  async function deleteDoc(id: number) {
    const token = getToken();
    await fetch("http://localhost:8000/api/documents/" + id + "/", {
      method: "DELETE",
      headers: { Authorization: "Token " + token },
    });
    loadDocs();
  }

  const docTypes = [
    { value: "passport", label: "Passport" },
    { value: "id_card", label: "ID Card" },
    { value: "transcript", label: "Transcript" },
    { value: "diploma", label: "Diploma" },
    { value: "recommendation", label: "Recommendation Letter" },
    { value: "motivation", label: "Motivation Letter" },
    { value: "cv", label: "CV / Resume" },
    { value: "other", label: "Other" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 animate-pulse">
          <div className="h-6 bg-white/10 rounded w-48 mb-4" />
          <div className="h-4 bg-white/10 rounded w-64" />
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-text-secondary text-lg mb-4">
            {t("det.notFound")}
          </p>
          <Link
            href="/scholarships"
            className="text-cyan hover:text-purple transition-colors"
          >
            {t("det.backToSch")}
          </Link>
        </div>
      </div>
    );
  }

  const hasDeadline = !!scholarship.application_deadline;
  const deadlineTs = hasDeadline
    ? new Date(scholarship.application_deadline)
    : null;
  if (deadlineTs) deadlineTs.setHours(23, 59, 59, 999);
  const diffMs = deadlineTs ? deadlineTs.getTime() - now : NaN;
  const daysLeft = Math.ceil(diffMs / 86400000);
  const isDeadlineSoon = diffMs > 0 && diffMs <= 14 * 86400000;
  const isDeadlinePassed = hasDeadline && diffMs <= 0;
  const showCountdown = hasDeadline && diffMs > 0;
  const countdown = [
    { label: t("det.days"), value: Math.floor(diffMs / 86400000) },
    { label: t("det.hours"), value: Math.floor(diffMs / 3600000) % 24 },
    { label: t("det.minutes"), value: Math.floor(diffMs / 60000) % 60 },
    { label: t("det.seconds"), value: Math.floor(diffMs / 1000) % 60 },
  ];

  const docs = scholarship.required_documents || [];
  const doneCount = docs.filter((_, i) => checkedDocs[i]).length;
  const docsPct = docs.length
    ? Math.round((doneCount / docs.length) * 100)
    : 0;
  const allDocsDone = docs.length > 0 && doneCount === docs.length;

  const levelLabels: Record<string, string> = {
    bachelor: t("sch.bachelor"),
    master: t("sch.master"),
    phd: t("sch.phd"),
    all: t("sch.lvlAll"),
    other: t("sch.language"),
    postdoc: "Postdoc",
    exchange: "Exchange",
    summer: "Summer School",
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <SmartBack fallback="/scholarships" />
        </motion.div>

        {/* Main Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-8 sm:p-10 mb-6"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {scholarship.type === "full"
                ? t("det.fullSch")
                : scholarship.type === "partial"
                ? t("det.partial")
                : scholarship.type}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple/20 text-purple border border-purple/30">
              {levelLabels[scholarship.level] || scholarship.level}
            </span>
            {scholarship.is_featured && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {t("det.featured")}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
            {scholarship.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-6">
            <Link
              href={"/university/" + scholarship.university.id}
              className="flex items-center gap-1 hover:text-cyan transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-purple" />
              {scholarship.university.name}
            </Link>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-cyan" />
              {scholarship.university.city}, {scholarship.university.country}
            </span>
          </div>

          {/* Deadline Banner */}
          {isDeadlinePassed ? (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
              {t("det.passed")}
            </div>
          ) : isDeadlineSoon && mounted ? (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("det.daysLeft", { n: daysLeft })}
            </div>
          ) : null}

          {/* Live countdown */}
          {mounted && showCountdown && (
            <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6 max-w-md">
              {countdown.map((unit) => (
                <motion.div
                  key={unit.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-light rounded-xl py-3 text-center border border-border-glass"
                >
                  <div
                    className={
                      "text-2xl sm:text-3xl font-bold font-mono " +
                      (isDeadlineSoon
                        ? "text-amber-400"
                        : "bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent")
                    }
                  >
                    {String(Math.max(0, unit.value)).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-text-muted mt-0.5">
                    {unit.label}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Scholarship Availability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="glass rounded-2xl p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan" />
              {t("seat.title")}
            </h3>
            {scholarship.total_seats ? (
              scholarship.seats_available === 0 ? (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
                  {t("seat.fullMsg")}
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span
                      className={
                        (scholarship.seats_available ?? 0) <= 5
                          ? "text-amber-400 font-semibold"
                          : "text-emerald-400 font-semibold"
                      }
                    >
                      {scholarship.seats_available === 1
                        ? t("seat.oneLeft")
                        : t("seat.left", {
                            n: scholarship.seats_available ?? 0,
                          })}
                    </span>
                    <span className="text-text-muted">
                      {scholarship.seats_filled}/{scholarship.total_seats}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={
                        "h-full rounded-full " +
                        ((scholarship.seats_available ?? 0) <= 5
                          ? "bg-gradient-to-r from-amber-400 to-red-400"
                          : "bg-gradient-to-r from-cyan to-emerald-400")
                      }
                      style={{
                        width:
                          Math.round(
                            ((scholarship.seats_filled || 0) /
                              scholarship.total_seats) *
                              100
                          ) + "%",
                      }}
                    />
                  </div>
                </>
              )
            ) : (
              <p className="text-sm text-text-muted">{t("seat.unknown")}</p>
            )}
          </motion.div>

          {scholarship.description && (
            <p className="text-text-secondary leading-relaxed mb-6">
              <AutoText text={scholarship.description} />
            </p>
          )}

          {/* Apply & Documents Section */}
          {!isDeadlinePassed && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-3">
                {scholarship.application_link && (
                  <a
                    href={scholarship.application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 btn-gradient px-6 py-3 rounded-xl"
                  >
                    <span className="flex items-center gap-2">
                      {t("det.applyNow")}
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </a>
                )}
                <button
                  onClick={() => {
                    setShowDocs(!showDocs);
                    if (!showDocs) loadDocs();
                  }}
                  className="inline-flex items-center gap-2 glass px-6 py-3 rounded-xl text-text-primary hover:bg-white/5 transition-all border border-border-glass"
                >
                  <Upload className="w-4 h-4 text-cyan" />
                  {t("det.attachDocs")}
                </button>
              </div>

              {/* Document Upload Panel */}
              {showDocs && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 glass rounded-2xl p-6"
                >
                  <h3 className="text-base font-semibold text-text-primary mb-4">
                    {t("det.uploadTitle")}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder={t("det.docTitlePh")}
                      className="glass rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted outline-none input-glow"
                    />
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="glass rounded-xl py-2.5 px-4 text-sm text-text-primary outline-none input-glow bg-transparent"
                    >
                      {docTypes.map((dt) => (
                        <option key={dt.value} value={dt.value} className="bg-surface">
                          {dt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleUpload(file);
                    }}
                    onClick={() => fileRef.current?.click()}
                    className="mb-4 rounded-xl border-2 border-dashed border-border-glass hover:border-cyan/40 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer p-8 flex flex-col items-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan/20 to-purple/20 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-cyan" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-text-primary font-medium">
                        {uploading ? t("det.uploading") : t("det.dropFiles")}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {t("det.fileHint")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cameraRef.current?.click();
                        }}
                        disabled={!docTitle.trim() || uploading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-purple hover:bg-purple/10 transition-all"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {t("det.scanCamera")}
                      </button>
                    </div>
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files?.[0] || null)}
                  />
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files?.[0] || null)}
                  />

                  {/* Uploaded docs list */}
                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-text-muted">
                        {t("det.yourDocs")}
                      </p>
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between glass-light rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-cyan" />
                            <span className="text-text-primary">{doc.title}</span>
                            <span className="text-xs text-text-muted">
                              ({doc.file_name})
                            </span>
                          </div>
                          <button
                            onClick={() => deleteDoc(doc.id)}
                            className="text-text-muted hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Program Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan" />
              {t("det.programDetails")}
            </h3>
            <div className="space-y-3">
              {scholarship.duration && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{t("det.duration")}</span>
                  <span className="text-text-primary">
                    {scholarship.duration}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{t("det.language")}</span>
                <span className="text-text-primary">
                  {scholarship.language || t("det.english")}
                </span>
              </div>
              {scholarship.required_education_level && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{t("det.requiredLevel")}</span>
                  <span className="text-text-primary">
                    {scholarship.required_education_level}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Dates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan" />
              {t("det.dates")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{t("det.deadline")}</span>
                <span
                  className={
                    isDeadlineSoon || isDeadlinePassed
                      ? "text-amber-400 font-semibold"
                      : "text-text-primary"
                  }
                >
                  {hasDeadline
                    ? new Date(
                        scholarship.application_deadline
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : t("det.rolling")}
                </span>
              </div>
              {scholarship.start_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{t("det.startDate")}</span>
                  <span className="text-text-primary">
                    {new Date(scholarship.start_date).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long" }
                    )}
                  </span>
                </div>
              )}
              {scholarship.end_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{t("det.endDate")}</span>
                  <span className="text-text-primary">
                    {new Date(scholarship.end_date).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long" }
                    )}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Eligibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {t("det.eligibility")}
          </h3>
          <div className="text-text-secondary leading-relaxed whitespace-pre-line">
            <AutoText
              text={scholarship.eligibility_criteria || t("det.notSpecified")}
            />
          </div>
          {scholarship.minimum_gpa && (
            <div className="mt-3 text-sm">
              <span className="text-text-muted">{t("det.minGpa")}</span>
              <span className="text-cyan font-semibold">
                {scholarship.minimum_gpa}
              </span>
            </div>
          )}
        </motion.div>

        {/* Tuition & Fees */}
        {scholarship.tuition_info && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="glass rounded-2xl p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-cyan" />
              {t("det.tuition")}
            </h3>
            <div className="text-text-secondary leading-relaxed whitespace-pre-line">
              <AutoText text={scholarship.tuition_info} />
            </div>
          </motion.div>
        )}

        {/* Relevant Admission Announcements */}
        {relevantAnnouncements.length > 0 && (
          <AdmissionAnnouncements announcements={relevantAnnouncements} />
        )}

        {/* Required Documents â€” interactive checklist */}
        {docs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple" />
                {t("det.checklist")}
              </h3>
              <button
                onClick={resetChecklist}
                className="text-xs text-text-muted hover:text-cyan transition-colors"
              >
                {t("com.reset")}
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-muted">
                  {t("det.ofReady", { done: doneCount, total: docs.length })}
                </span>
                <span
                  className={
                    allDocsDone
                      ? "text-emerald-400 font-bold"
                      : "text-cyan font-semibold"
                  }
                >
                  {docsPct}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className={
                    "h-full rounded-full " +
                    (allDocsDone
                      ? "bg-gradient-to-r from-emerald-400 to-cyan"
                      : "bg-gradient-to-r from-cyan to-purple")
                  }
                  initial={{ width: 0 }}
                  animate={{ width: docsPct + "%" }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {docs.map((doc, i) => {
                const isChecked = !!checkedDocs[i];
                return (
                  <button
                    key={i}
                    onClick={() => toggleDoc(i)}
                    className={
                      "flex items-center gap-3 text-sm rounded-xl px-3 py-2.5 border transition-all text-left " +
                      (isChecked
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : "border-border-glass bg-white/[0.02] hover:border-purple/40 hover:bg-white/[0.04]")
                    }
                  >
                    <span
                      className={
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all " +
                        (isChecked
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-white/25")
                      }
                    >
                      {isChecked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                    </span>
                    <span
                      className={
                        isChecked
                          ? "line-through text-text-muted"
                          : "text-text-secondary"
                      }
                    >
                      {translatedDocs?.[i] ?? doc}
                    </span>
                  </button>
                );
              })}
            </div>

            {allDocsDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"
              >
                <Sparkles className="w-4 h-4" />
                {t("det.allReady")}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Application Instructions */}
        {scholarship.application_instructions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass rounded-2xl p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan" />
              {t("det.instructions")}
            </h3>
            <div className="text-text-secondary leading-relaxed whitespace-pre-line">
              <AutoText text={scholarship.application_instructions} />
            </div>
          </motion.div>
        )}

        {/* More at this university */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mb-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t("sch.moreAt", { name: scholarship.university.name })}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((s, i) => (
                <ScholarshipCard key={s.id} scholarship={s} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Contact Info */}
        {(scholarship.contact_email || scholarship.contact_phone) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t("det.contact")}
            </h3>
            <div className="space-y-2">
              {scholarship.contact_email && (
                <a
                  href={"mailto:" + scholarship.contact_email}
                  className="flex items-center gap-2 text-sm text-cyan hover:text-purple transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {scholarship.contact_email}
                </a>
              )}
              {scholarship.contact_phone && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Phone className="w-4 h-4" />
                  {scholarship.contact_phone}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
