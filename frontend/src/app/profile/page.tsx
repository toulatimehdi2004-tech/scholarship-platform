"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Award,
  Crown,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Layers,
  FileText,
  Sparkles,
  Globe,
  Languages,
} from "lucide-react";
import {
  getToken,
  getCurrentUser,
  getStudentProfile,
  updateStudentProfile,
  type User,
  type StudentProfile,
} from "@/lib/api";
import LifetimePassModal from "@/components/LifetimePassModal";

const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fes",
  "Tangier",
  "Agadir",
  "Oujda",
  "Tetouan",
  "Kenitra",
  "Meknes",
  "Nador",
  "Safi",
  "El Jadida",
  "Mohammedia",
  "Beni Mellal",
  "Khouribga",
  "Taza",
  "Settat",
  "Other Moroccan City",
];

const EDUCATION_LEVELS = [
  { value: "high_school", label: "High School / Baccalauréat" },
  { value: "bachelor", label: "Bachelor's Degree / Licence" },
  { value: "master", label: "Master's Degree / Master" },
  { value: "phd", label: "Doctorate / PhD" },
  { value: "other", label: "Other / Vocational" },
];

const TARGET_DEGREES = [
  { value: "bachelor", label: "Bachelor's Degree (4 years)" },
  { value: "master", label: "Master's Degree (2-3 years)" },
  { value: "phd", label: "PhD / Doctorate (3-4 years)" },
  { value: "language", label: "Non-Degree Chinese Language (1 year)" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Casablanca");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [educationLevel, setEducationLevel] = useState("bachelor");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [gpa, setGpa] = useState("");
  const [gpaScale, setGpaScale] = useState<"20" | "4">("20");

  useEffect(() => {
    if (!getToken()) {
      router.push("/auth/login");
      return;
    }

    async function loadData() {
      setLoading(true);
      const [userRes, profileRes] = await Promise.all([
        getCurrentUser(),
        getStudentProfile(),
      ]);

      if (userRes.data) {
        setUser(userRes.data);
        setFirstName(userRes.data.first_name || "");
        setLastName(userRes.data.last_name || "");
        setEmail(userRes.data.email || "");
      }

      if (profileRes.data) {
        const p = profileRes.data;
        setPhone(p.phone || "");
        if (p.city) setCity(p.city);
        if (p.date_of_birth) setDateOfBirth(p.date_of_birth);
        if (p.education_level) setEducationLevel(p.education_level);
        if (p.field_of_study) setFieldOfStudy(p.field_of_study);
        if (p.gpa) {
          const numGpa = Number(p.gpa);
          if (numGpa > 4.5) {
            setGpaScale("20");
            setGpa(String(numGpa));
          } else {
            setGpaScale("4");
            setGpa(String(numGpa));
          }
        }
      } else if (userRes.data?.student_profile) {
        const p = userRes.data.student_profile;
        if (p.city) setCity(p.city);
        if (p.education_level) setEducationLevel(p.education_level);
        if (p.field_of_study) setFieldOfStudy(p.field_of_study);
      }

      setLoading(false);
    }

    loadData();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      let gpaValue: number | undefined = undefined;
      if (gpa.trim()) {
        const parsed = parseFloat(gpa);
        if (!isNaN(parsed)) {
          // If in 20 scale, normalize or store as is
          gpaValue = parsed;
        }
      }

      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        date_of_birth: dateOfBirth || null,
        education_level: educationLevel,
        field_of_study: fieldOfStudy.trim(),
        gpa: gpaValue,
      };

      const res = await updateStudentProfile(payload);
      if (res.data) {
        setSaveSuccess(true);
        // Refresh local user info
        const u = await getCurrentUser();
        if (u.data) {
          setUser(u.data);
          try {
            localStorage.setItem("user", JSON.stringify(u.data));
          } catch {}
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError(res.error || "Failed to save profile. Please check the fields.");
      }
    } catch (err: any) {
      setSaveError(err?.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 max-w-md w-full animate-pulse border border-border-glass">
          <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-4" />
          <div className="h-6 bg-white/10 rounded w-40 mx-auto mb-3" />
          <div className="h-4 bg-white/10 rounded w-56 mx-auto mb-6" />
          <div className="space-y-3">
            <div className="h-10 bg-white/10 rounded-xl" />
            <div className="h-10 bg-white/10 rounded-xl" />
            <div className="h-10 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const isPremium = user?.student_profile?.is_premium;

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <Link href="/dashboard" className="hover:text-cyan transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-text-primary font-bold">My Student Profile</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary">
              Scholar Profile & Preferences
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold glass text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all border border-border-glass flex items-center gap-1.5"
            >
              <span>Dashboard</span>
            </Link>
            <Link
              href="/tracker"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan/15 text-cyan hover:bg-cyan/25 border border-cyan/30 transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Application CRM</span>
            </Link>
          </div>
        </div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 glass rounded-3xl p-6 sm:p-8 border border-border-glass relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan/20 flex-shrink-0">
                {firstName ? firstName[0].toUpperCase() : user?.username[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                    {firstName && lastName ? `${firstName} ${lastName}` : user?.username}
                  </h2>
                  {isPremium ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lifetime VIP</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-text-muted">
                      Free Explorer
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  @{user?.username} • {email}
                </p>
                <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan" />
                  <span>{city}, Morocco</span>
                </p>
              </div>
            </div>

            {/* VIP Status or Upgrade Callout */}
            <div className="w-full sm:w-auto">
              {isPremium ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-primary">Scholar VIP Pass Active</div>
                    <div className="text-[11px] text-text-muted">Lifetime unlimited access to 100+ universities</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-purple/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-500 dark:text-amber-300 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" />
                      <span>Upgrade to Lifetime VIP Pass</span>
                    </div>
                    <div className="text-[11px] text-text-secondary mt-0.5">
                      Unlock all 100+ universities & 400+ scholarships for life ($29 once)
                    </div>
                  </div>
                  <Link
                    href="/pricing"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple text-white text-xs font-bold shadow-md shadow-amber-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>View Plan</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Edit Form */}
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Section 1: Personal & Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 glass rounded-3xl p-6 sm:p-8 border border-border-glass space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-cyan" />
                  <span>Personal & Contact Information</span>
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Keep your basic contact and identity details updated for application submissions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Mehdi"
                    className="w-full px-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary focus:outline-none focus:border-cyan input-glow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Alaoui"
                    className="w-full px-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary focus:outline-none focus:border-cyan input-glow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary focus:outline-none focus:border-cyan input-glow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    WhatsApp / Phone (Morocco)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+212 600 000 000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary focus:outline-none focus:border-cyan input-glow"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    City in Morocco
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary focus:outline-none focus:border-cyan input-glow cursor-pointer"
                    >
                      {MOROCCAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary focus:outline-none focus:border-cyan input-glow"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Profile */}
              <div className="pt-6 border-t border-border-glass">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-1">
                  <GraduationCap className="w-5 h-5 text-purple" />
                  <span>Academic Qualifications & GPA</span>
                </h3>
                <p className="text-xs text-text-secondary mb-6">
                  Used by our AI to compute realistic acceptance odds and match CSC scholarship criteria.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Current Education Level
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary focus:outline-none focus:border-cyan input-glow cursor-pointer"
                    >
                      {EDUCATION_LEVELS.map((lvl) => (
                        <option key={lvl.value} value={lvl.value}>
                          {lvl.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Field of Study / Major
                    </label>
                    <input
                      type="text"
                      value={fieldOfStudy}
                      onChange={(e) => setFieldOfStudy(e.target.value)}
                      placeholder="e.g. Computer Science, Mechanical Eng, MBBS"
                      className="w-full px-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary focus:outline-none focus:border-cyan input-glow"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-text-secondary">
                        Overall GPA / Score
                      </label>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan">
                        <button
                          type="button"
                          onClick={() => setGpaScale("20")}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            gpaScale === "20" ? "bg-cyan text-white" : "text-text-muted hover:text-text-primary"
                          }`}
                        >
                          / 20 (Morocco)
                        </button>
                        <span>|</span>
                        <button
                          type="button"
                          onClick={() => setGpaScale("4")}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            gpaScale === "4" ? "bg-cyan text-white" : "text-text-muted hover:text-text-primary"
                          }`}
                        >
                          / 4.0 (Global)
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <Award className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={gpaScale === "20" ? "20" : "4.0"}
                        value={gpa}
                        onChange={(e) => setGpa(e.target.value)}
                        placeholder={gpaScale === "20" ? "e.g. 15.5" : "e.g. 3.5"}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary focus:outline-none focus:border-cyan input-glow"
                      />
                    </div>
                    {gpa && !isNaN(Number(gpa)) && (
                      <p className="text-[11px] text-text-muted mt-1">
                        {gpaScale === "20"
                          ? `≈ ${(Number(gpa) / 5).toFixed(2)} on 4.0 scale`
                          : `≈ ${(Number(gpa) * 5).toFixed(1)} / 20 on Moroccan scale`}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Country of Citizenship
                    </label>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary bg-white/5">
                      <span>🇲🇦</span>
                      <span className="font-semibold">Morocco (المملكة المغربية)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 3: Sidebar Summary & Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Profile Completeness Card */}
              <div className="glass rounded-3xl p-6 border border-border-glass">
                <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan" />
                  <span>Profile Strength</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>Profile Completeness</span>
                    <span className="font-bold text-cyan">
                      {[firstName, phone, fieldOfStudy, gpa].filter(Boolean).length * 25}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan to-purple rounded-full transition-all duration-500"
                      style={{
                        width: `${[firstName, phone, fieldOfStudy, gpa].filter(Boolean).length * 25}%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-text-muted mt-3">
                  A complete profile improves your AI scholarship matching precision and generates better Statement of Purpose drafts.
                </p>
              </div>

              {/* Quick Navigation Card */}
              <div className="glass rounded-3xl p-6 border border-border-glass space-y-3">
                <h4 className="text-sm font-bold text-text-primary mb-2">
                  Quick Actions
                </h4>
                <Link
                  href="/tracker"
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-semibold text-text-primary group"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan" />
                    <span>ScholarTrack Kanban CRM</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-cyan group-hover:translate-x-0.5 transition-all" />
                </Link>
                <Link
                  href="/pricing"
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-semibold text-text-primary group"
                >
                  <span className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>Lifetime VIP Plan ($29)</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
                <Link
                  href="/sop"
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-semibold text-text-primary group"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple" />
                    <span>Motivation Letter (SOP) Writer</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-purple group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Feedback Alerts */}
          {saveSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Profile updated successfully! Your academic preferences have been saved.</span>
            </div>
          )}

          {saveError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 font-bold text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border-glass">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl glass text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all border border-border-glass"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-gradient px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan/20"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Profile Changes"}</span>
            </button>
          </div>
        </form>
      </div>

      <LifetimePassModal
        isOpen={showLifetimeModal}
        onClose={() => setShowLifetimeModal(false)}
        onSuccess={() => {
          getCurrentUser().then((res) => {
            if (res.data) setUser(res.data);
          });
        }}
      />
    </div>
  );
}
