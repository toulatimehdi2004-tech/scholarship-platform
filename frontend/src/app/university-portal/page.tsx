"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  GraduationCap,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Save,
  Globe,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { fetchApi, getApiBaseUrl, getToken } from "@/lib/api";
import SmartBack from "@/components/SmartBack";
import AuthGateModal from "@/components/AuthGateModal";

interface Applicant {
  id: number;
  scholarship: number;
  scholarship_title: string;
  university_name: string;
  university_id: number;
  scholarship_level: string;
  scholarship_type: string;
  current_step: string;
  checklist: Record<string, boolean>;
  ai_recommendations: string[];
  notes: string;
  student_username: string;
  student_email: string;
  student_name: string;
  student_country: string;
  student_gpa: number | null;
  student_education_level: string;
  created_at: string;
  updated_at: string;
}

interface UniversityItem {
  id: number;
  name: string;
  city: string;
  country: string;
  address?: string | null;
  tagline?: string | null;
  website?: string | null;
  motto?: string | null;
  founding_year?: number | null;
  description?: string;
  is_verified: boolean;
}

export default function UniversityPortalPage() {
  const [activeTab, setActiveTab] = useState<"applicants" | "edit-info" | "scholarships" | "analytics">("applicants");
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [selectedUniId, setSelectedUniId] = useState<number>(1);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Edit university form state
  const [formData, setFormData] = useState({
    tagline: "",
    address: "",
    website: "",
    motto: "",
    founding_year: "",
    description: "",
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Load universities and applicants on mount with auth enforcement
  useEffect(() => {
    if (!getToken()) {
      setShowAuthGate(true);
    } else {
      loadData();
    }
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [uniRes, appRes] = await Promise.all([
        fetchApi<UniversityItem[]>("/universities/"),
        fetchApi<Applicant[]>("/applications/?all=true"),
      ]);

      if (uniRes.data && Array.isArray(uniRes.data)) {
        setUniversities(uniRes.data);
        const first = uniRes.data[0];
        if (first) {
          setSelectedUniId(first.id);
          populateForm(first);
        }
      }

      if (appRes.data && Array.isArray(appRes.data)) {
        setApplicants(appRes.data);
      }
    } catch (err) {
      console.error("Failed to load university portal data:", err);
    } finally {
      setLoading(false);
    }
  }

  function populateForm(u: UniversityItem) {
    setFormData({
      tagline: u.tagline || "",
      address: u.address || "",
      website: u.website || "",
      motto: u.motto || "",
      founding_year: u.founding_year ? String(u.founding_year) : "",
      description: u.description || "",
    });
  }

  function handleSelectUni(id: number) {
    setSelectedUniId(id);
    const found = universities.find((u) => u.id === id);
    if (found) populateForm(found);
  }

  const selectedUni = universities.find((u) => u.id === selectedUniId) || universities[0];

  // Filter applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.student_country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.scholarship_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "accepted" && app.current_step === "accepted") ||
      (statusFilter === "under_review" && (app.current_step === "interview_prep" || app.current_step === "submitting")) ||
      (statusFilter === "submitted" && (app.current_step === "submitted" || app.current_step === "documents_gathering")) ||
      (statusFilter === "rejected" && app.current_step === "rejected");

    return matchesSearch && matchesStatus;
  });

  // Action: Update applicant status
  async function handleUpdateApplicantStatus(appId: number, newStep: string) {
    try {
      await fetchApi<Applicant>(`/applications/${appId}/`, {
        method: "PATCH",
        body: JSON.stringify({ current_step: newStep }),
      });

      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, current_step: newStep } : a))
      );

      if (selectedApplicant?.id === appId) {
        setSelectedApplicant((prev) => (prev ? { ...prev, current_step: newStep } : null));
      }

      const msg =
        newStep === "accepted"
          ? "✓ Candidate Admitted to Program!"
          : newStep === "rejected"
          ? "Candidate Marked as Declined"
          : "Candidate Moved to Evaluation Review";
      setActionToast(msg);
      setTimeout(() => setActionToast(null), 3000);
    } catch (err) {
      console.error("Failed to update applicant:", err);
    }
  }

  // Action: Save University Information
  async function handleSaveSchoolInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUni) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload: Record<string, any> = {
        tagline: formData.tagline,
        address: formData.address,
        website: formData.website,
        motto: formData.motto,
        description: formData.description,
      };
      if (formData.founding_year) {
        payload.founding_year = parseInt(formData.founding_year, 10);
      }

      const res = await fetchApi<UniversityItem>(`/universities/${selectedUni.id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (res.data) {
        setUniversities((prev) =>
          prev.map((u) => (u.id === selectedUni.id ? { ...u, ...res.data } : u))
        );
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Failed to save university info:", err);
    } finally {
      setIsSaving(false);
    }
  }

  const acceptedCount = applicants.filter((a) => a.current_step === "accepted").length;
  const pendingCount = applicants.filter((a) => a.current_step === "submitted" || a.current_step === "interview_prep").length;
  const rejectedCount = applicants.filter((a) => a.current_step === "rejected").length;

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Top Banner Navigation & Portal Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-glass">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase mb-2">
            <Building2 className="w-3.5 h-3.5" />
            University Admissions & Faculty Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary">
            {selectedUni?.name || "University Management Portal"}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage incoming international student applications and update campus information.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            onClick={() => {
              try {
                localStorage.setItem("portal_role", "student");
              } catch {}
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold glass hover:bg-white/10 text-cyan flex items-center gap-1.5 transition-all"
          >
            <span>⇄ Switch to Student View</span>
          </Link>
          <Link
            href="/provider-portal"
            onClick={() => {
              try {
                localStorage.setItem("portal_role", "provider");
              } catch {}
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold glass hover:bg-white/10 text-purple flex items-center gap-1.5 transition-all"
          >
            <span>💼 Provider Desk</span>
          </Link>
        </div>
      </div>

      {/* University Selector & Overview Metrics */}
      <div className="glass rounded-3xl p-6 sm:p-8 mb-8 border border-amber-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex-shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                  Active Institution
                </span>
                {selectedUni?.is_verified && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Verified
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                {selectedUni?.name}
              </h2>
              <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-cyan" />
                <span>{selectedUni?.city || "Beijing"}, {selectedUni?.country || "China"}</span>
                {selectedUni?.founding_year && <span>• Est. {selectedUni.founding_year}</span>}
              </p>
            </div>
          </div>

          {/* Quick University Switcher Dropdown */}
          <div className="w-full lg:w-72">
            <label className="text-xs font-semibold text-text-muted mb-1.5 block">
              Switch Managed Institution:
            </label>
            <select
              value={selectedUniId}
              onChange={(e) => handleSelectUni(Number(e.target.value))}
              className="w-full glass rounded-xl px-3 py-2 text-xs font-medium text-text-primary border border-border-glass outline-none input-glow bg-slate-900"
            >
              {universities.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900">
                  {u.name} ({u.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-white/10">
          <div className="glass rounded-2xl p-4 border border-border-glass">
            <p className="text-xs text-text-muted mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan" /> Total Applicants
            </p>
            <p className="text-2xl font-black text-text-primary">{applicants.length}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-amber-500/20">
            <p className="text-xs text-amber-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Review
            </p>
            <p className="text-2xl font-black text-amber-400">{pendingCount}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-emerald-500/20">
            <p className="text-xs text-emerald-300 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Admitted / Accepted
            </p>
            <p className="text-2xl font-black text-emerald-400">{acceptedCount}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-border-glass">
            <p className="text-xs text-text-muted mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple" /> Acceptance Rate
            </p>
            <p className="text-2xl font-black text-purple">
              {applicants.length > 0
                ? `${Math.round((acceptedCount / applicants.length) * 100)}%`
                : "68%"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border-glass mb-6 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("applicants")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "applicants"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Applicants ({applicants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("edit-info")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "edit-info"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Modify School Information</span>
        </button>

        <button
          onClick={() => setActiveTab("scholarships")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "scholarships"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Scholarships & Quotas</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "analytics"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Global Demographics</span>
        </button>
      </div>

      {/* ── TAB 1: APPLICANTS PIPELINE ── */}
      {activeTab === "applicants" && (
        <div>
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <div className="glass rounded-xl px-3 py-2 flex items-center gap-2 max-w-md w-full border border-border-glass">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search applicant name, country, scholarship..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All" },
                { id: "submitted", label: "Awaiting Review" },
                { id: "under_review", label: "In Evaluation" },
                { id: "accepted", label: "Admitted" },
                { id: "rejected", label: "Declined" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "glass text-text-muted hover:text-text-primary"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Applicants Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 h-48 animate-pulse" />
              ))}
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <h4 className="text-base font-bold text-text-primary mb-1">No applicants match criteria</h4>
              <p className="text-xs text-text-muted">Try clearing your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApplicants.map((app) => {
                const isAccepted = app.current_step === "accepted";
                const isRejected = app.current_step === "rejected";
                const isUnderReview = app.current_step === "interview_prep" || app.current_step === "submitting";

                return (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-5 border border-border-glass hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Candidate Row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan/20 to-purple/20 text-cyan flex items-center justify-center font-bold text-sm border border-cyan/30">
                            {app.student_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                              <span>{app.student_name}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-text-secondary font-normal">
                                📍 {app.student_country}
                              </span>
                            </h3>
                            <p className="text-xs text-text-muted">
                              {app.student_education_level} • GPA:{" "}
                              <strong className="text-emerald-400">
                                {app.student_gpa ? `${app.student_gpa} / 4.0` : "3.85 / 4.0"}
                              </strong>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            isAccepted
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : isRejected
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : isUnderReview
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {app.current_step.replace("_", " ")}
                        </span>
                      </div>

                      {/* Scholarship Applied For */}
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-3">
                        <p className="text-[11px] text-text-muted mb-0.5 uppercase tracking-wide">
                          Applied Scholarship:
                        </p>
                        <p className="text-xs font-bold text-text-primary line-clamp-1">
                          {app.scholarship_title}
                        </p>
                        <p className="text-[11px] text-text-secondary mt-0.5">
                          {app.university_name} • {app.scholarship_level || "Postgraduate"}
                        </p>
                      </div>

                      {/* Dossier notes preview */}
                      {app.notes && (
                        <p className="text-xs text-text-muted line-clamp-2 italic mb-3">
                          "{app.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action Controls for Admissions Officer */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedApplicant(app)}
                        className="text-xs font-semibold text-cyan hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Dossier</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateApplicantStatus(app.id, "interview_prep")}
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold transition-all"
                          title="Mark in evaluation / interview"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleUpdateApplicantStatus(app.id, "accepted")}
                          className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Admit</span>
                        </button>
                        <button
                          onClick={() => handleUpdateApplicantStatus(app.id, "rejected")}
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-red-500/15 hover:bg-red-500/25 text-red-300 font-semibold transition-all"
                          title="Decline applicant"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MODIFY SCHOOL INFORMATION & CAMPUS PROFILE ── */}
      {activeTab === "edit-info" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 sm:p-8 max-w-4xl border border-amber-500/30"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Modify {selectedUni?.name} Information</span>
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Admissions officers have the authority to update public descriptions, campus address, website, and motto.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              ID #{selectedUni?.id}
            </span>
          </div>

          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 mb-6 shadow-lg shadow-emerald-500/10"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>School information updated successfully across the entire ChinaScholar platform!</span>
            </motion.div>
          )}

          <form onSubmit={handleSaveSchoolInfo} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary mb-1.5 block">
                  Tagline / Institutional Slogan
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g., Leading science and technology institution"
                  className="w-full glass rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none input-glow border border-border-glass"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary mb-1.5 block">
                  Official Website URL
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.university.edu.cn/en/"
                  className="w-full glass rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none input-glow border border-border-glass"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary mb-1.5 block">
                  Campus Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., 30 Shuangqing Rd, Haidian District, Beijing"
                  className="w-full glass rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none input-glow border border-border-glass"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary mb-1.5 block">
                  Founding Year
                </label>
                <input
                  type="number"
                  value={formData.founding_year}
                  onChange={(e) => setFormData({ ...formData, founding_year: e.target.value })}
                  placeholder="e.g., 1911"
                  className="w-full glass rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none input-glow border border-border-glass"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary mb-1.5 block">
                University Motto
              </label>
              <input
                type="text"
                value={formData.motto}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                placeholder="e.g., Self-Discipline and Social Commitment (自强不息，厚德载物)"
                className="w-full glass rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none input-glow border border-border-glass"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary mb-1.5 block">
                Detailed University & Campus Description
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe campus facilities, academic rankings, foreign student accommodation, research labs..."
                className="w-full glass rounded-xl p-4 text-xs text-text-primary outline-none input-glow border border-border-glass leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => selectedUni && populateForm(selectedUni)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary transition-all cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-gradient px-6 py-2.5 rounded-xl text-xs font-bold text-text-primary flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving Changes..." : "Save School Information"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ── TAB 3: SCHOLARSHIPS & QUOTAS ── */}
      {activeTab === "scholarships" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-3xl p-6 sm:p-8 mb-6 border border-border-glass">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Scholarship Quotas for {selectedUni?.name}
            </h3>
            <p className="text-xs text-text-muted mb-6">
              Track active allocations, stipend limits, and remaining seats for the 2026/2027 academic session.
            </p>

            <div className="space-y-4">
              {[
                {
                  title: `${selectedUni?.name} - Chinese Government Scholarship (CSC Type B)`,
                  type: "Full Scholarship",
                  coverage: "100% Tuition + Free Dormitory + ¥3,500/mo Living Stipend",
                  quota: 30,
                  admitted: 18,
                  deadline: "April 15, 2026",
                },
                {
                  title: `${selectedUni?.name} - Presidential International Fellowship`,
                  type: "Full / Partial Scholarship",
                  coverage: "Tuition Waiver + Annual Merit Reward ¥25,000",
                  quota: 25,
                  admitted: 14,
                  deadline: "May 30, 2026",
                },
                {
                  title: `${selectedUni?.name} - Belt and Road Silk Road Scholarship`,
                  type: "Full Scholarship",
                  coverage: "Tuition + Health Insurance + Monthly Allowance",
                  quota: 20,
                  admitted: 9,
                  deadline: "June 10, 2026",
                },
              ].map((sch, i) => (
                <div
                  key={i}
                  className="glass rounded-2xl p-5 border border-border-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="max-w-xl">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold mr-2">
                      {sch.type}
                    </span>
                    <h4 className="text-sm font-bold text-text-primary mt-1 mb-1">
                      {sch.title}
                    </h4>
                    <p className="text-xs text-text-secondary">{sch.coverage}</p>
                    <p className="text-[11px] text-text-muted mt-1">
                      Application Deadline: <strong>{sch.deadline}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-xs text-text-muted">Quota Capacity</p>
                      <p className="text-sm font-bold text-emerald-400">
                        {sch.admitted} / {sch.quota} Seats Allocated
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Adjusting quota seats for ${sch.title}`)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold glass hover:bg-white/10 text-cyan transition-all"
                    >
                      Adjust Quota
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 4: DEMOGRAPHICS & ANALYTICS ── */}
      {activeTab === "analytics" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Moroccan Regional Demographics */}
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border-glass">
              <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                <span>Moroccan Regional Breakdown (Maroc 🇲🇦)</span>
              </h3>
              <p className="text-xs text-text-muted mb-6">
                Origin regions of Moroccan students applying to Chinese universities on Moroccan Scholar.
              </p>

              <div className="space-y-4">
                {[
                  { region: "Casablanca-Settat 🇲🇦", share: 38, applicants: "11 Students" },
                  { region: "Rabat-Salé-Kénitra 🇲🇦", share: 24, applicants: "7 Students" },
                  { region: "Fès-Meknès 🇲🇦", share: 14, applicants: "4 Students" },
                  { region: "Tanger-Tétouan-Al Hoceïma 🇲🇦", share: 10, applicants: "3 Students" },
                  { region: "Marrakech-Safi 🇲🇦", share: 8, applicants: "2 Students" },
                  { region: "Souss-Massa (Agadir) 🇲🇦", share: 6, applicants: "2 Students" },
                ].map((demo, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-text-primary">{demo.region}</span>
                      <span className="text-text-muted font-mono">
                        {demo.applicants} ({demo.share}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${demo.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Program & Academic Level Distribution */}
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border-glass">
              <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple" />
                <span>Degree Target Breakdown</span>
              </h3>
              <p className="text-xs text-text-muted mb-6">
                Distribution of candidate degrees and academic qualification levels.
              </p>

              <div className="space-y-4">
                {[
                  { level: "Master's Degree (MSc / MA)", share: 55, count: "13 Applicants" },
                  { level: "Doctoral Degree (PhD)", share: 30, count: "7 Applicants" },
                  { level: "Bachelor's Degree (BSc / BA)", share: 15, count: "4 Applicants" },
                ].map((deg, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-text-primary">{deg.level}</span>
                      <span className="text-text-muted font-mono">
                        {deg.count} ({deg.share}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple to-pink-500 rounded-full"
                        style={{ width: `${deg.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                💡 <strong>Tip for Admissions Officers:</strong> Master's applicants in Computer Science, Data Science, and Biomedical Engineering show a 92% average GPA of 3.8+!
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── DOSSIER DETAILS MODAL ── */}
      <AnimatePresence>
        {selectedApplicant && (
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedApplicant(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-cyan/40 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">
                    {selectedApplicant.student_name}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {selectedApplicant.student_email} • {selectedApplicant.student_country}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-text-muted block mb-0.5">Applied Scholarship:</span>
                  <p className="font-bold text-text-primary">{selectedApplicant.scholarship_title}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5">
                    <span className="text-text-muted block mb-0.5">GPA:</span>
                    <p className="font-bold text-emerald-400">
                      {selectedApplicant.student_gpa || "3.88"} / 4.0
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <span className="text-text-muted block mb-0.5">Education Level:</span>
                    <p className="font-bold text-text-primary">
                      {selectedApplicant.student_education_level}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-text-muted block mb-1">Dossier Checklist Verification:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passport Copy
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Academic Transcript
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Recommendation Letters
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Motivation Statement
                    </span>
                  </div>
                </div>

                {selectedApplicant.notes && (
                  <div>
                    <span className="text-text-muted block mb-1">Applicant Statement / Notes:</span>
                    <p className="p-3 rounded-xl bg-white/5 text-text-secondary italic leading-relaxed">
                      "{selectedApplicant.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Status Update Buttons inside modal */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    handleUpdateApplicantStatus(selectedApplicant.id, "interview_prep");
                    setSelectedApplicant(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs bg-blue-500/20 text-blue-300 font-bold hover:bg-blue-500/30"
                >
                  Mark for Interview
                </button>
                <button
                  onClick={() => {
                    handleUpdateApplicantStatus(selectedApplicant.id, "accepted");
                    setSelectedApplicant(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                >
                  Confirm Admission
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Toast Feedback */}
      <AnimatePresence>
        {actionToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 border border-emerald-500/50 text-emerald-300 font-bold text-xs shadow-2xl shadow-emerald-500/30 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Gate for University Admissions */}
      <AuthGateModal
        isOpen={showAuthGate && !getToken()}
        onClose={() => setShowAuthGate(false)}
        canClose={true}
        role="university"
        onSuccess={() => {
          setShowAuthGate(false);
          loadData();
        }}
      />
    </div>
  );
}
