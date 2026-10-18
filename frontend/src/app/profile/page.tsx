"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Briefcase,
  Plane,
  Scale,
  BadgeCheck,
  ShieldCheck,
  Languages,
  Bookmark,
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
import StudentVisaProcessCard from "@/components/StudentVisaProcessCard";

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

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "visa" | "services">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);

  // Role Access Isolation: providers or universities cannot see private student pages
  const [restrictedRole, setRestrictedRole] = useState<string | null>(null);

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
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("portal_role");
      if (role === "provider" || role === "university") {
        setRestrictedRole(role);
        setLoading(false);
        return;
      }
    }

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

  // If active role is Service Provider or University: Restricted Isolation View
  if (restrictedRole) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 max-w-lg w-full text-center border border-rose-500/30 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
            {restrictedRole === "provider" ? (
              <Briefcase className="w-8 h-8" />
            ) : (
              <GraduationCap className="w-8 h-8" />
            )}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 mb-3">
            <span>Confidential Student Privacy Gate</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary mb-2">
            {restrictedRole === "provider"
              ? "Service Provider Workspace Active"
              : "University Admissions Desk Active"}
          </h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Personal student profiles, academic GPAs, and internal application pipelines are private to candidates.
            {restrictedRole === "provider"
              ? " Please use your Service Provider Desk to fulfill translation orders and client documents."
              : " Please use your University Desk to view admitted candidates and campus programs."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={restrictedRole === "provider" ? "/provider-portal" : "/university-portal"}
              className="w-full sm:w-auto px-6 py-3 rounded-xl btn-gradient text-sm font-bold flex items-center justify-center gap-2"
            >
              <span>
                {restrictedRole === "provider"
                  ? "Go to Provider Orders Desk"
                  : "Go to Admissions Desk"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                localStorage.setItem("portal_role", "student");
                setRestrictedRole(null);
                window.location.reload();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl glass hover:bg-white/10 text-sm font-semibold text-text-primary cursor-pointer transition-colors"
            >
              Switch to Student Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <Link href="/dashboard" className="hover:text-cyan transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-text-primary font-bold">Student Profile & Services</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary">
              Scholar Profile & Services
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

        {/* Profile Header Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 glass rounded-3xl p-6 sm:p-8 border border-border-glass relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20 flex-shrink-0">
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
                  <span>{city}, Morocco (المملكة المغربية)</span>
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
                      Unlock all 100+ universities & 400+ scholarships ($29 once)
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

        {/* Feature Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Academic Profile & Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab("visa")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "visa"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe className="w-4 h-4 text-cyan" />
            <span>Visa Process & Official Links</span>
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "services"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple" />
            <span>My Services & Interested Hub</span>
          </button>
        </div>

        {/* Tab 1: Academic Profile & Preferences */}
        {activeTab === "profile" && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-2 space-y-6"
              >
                <div className="glass rounded-3xl p-6 sm:p-8 border border-border-glass space-y-5">
                  <div className="border-b border-border-glass pb-3">
                    <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-cyan" />
                      <span>Personal & Contact Information</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Keep your contact and identity details updated for application submissions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                        First Name / Prénom
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
                        Last Name / Nom
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Alami"
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
                          placeholder="your.email@example.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary focus:outline-none focus:border-cyan input-glow"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                        Phone / WhatsApp (Maroc +212)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                        <input
                          type="text"
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
                        Current City (Morocco)
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary bg-bg-primary focus:outline-none focus:border-cyan input-glow cursor-pointer"
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
                </div>

                {/* Academic Background */}
                <div className="glass rounded-3xl p-6 sm:p-8 border border-border-glass space-y-5">
                  <div className="border-b border-border-glass pb-3">
                    <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-purple" />
                      <span>Academic Background & Eligibility Factors</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Your GPA and education level are algorithmically matched against Chinese scholarship minimum thresholds.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                        Highest Completed Degree
                      </label>
                      <select
                        value={educationLevel}
                        onChange={(e) => setEducationLevel(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary bg-bg-primary focus:outline-none focus:border-cyan input-glow cursor-pointer"
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
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={fieldOfStudy}
                          onChange={(e) => setFieldOfStudy(e.target.value)}
                          placeholder="e.g. Computer Science, Medicine, Civil Eng."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-glass text-sm text-text-primary focus:outline-none focus:border-cyan input-glow"
                        />
                      </div>
                    </div>
                  </div>

                  {/* GPA Conversion */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-text-secondary">
                        Grade Point Average (GPA / Moyenne)
                      </label>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setGpaScale("20")}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            gpaScale === "20" ? "bg-cyan text-white" : "text-text-muted hover:text-text-primary"
                          }`}
                        >
                          / 20 (Maroc)
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
              </motion.div>

              {/* Sidebar Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
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
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan rounded-full transition-all duration-500"
                        style={{
                          width: `${[firstName, phone, fieldOfStudy, gpa].filter(Boolean).length * 25}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-text-muted mt-3">
                    A complete profile gives higher AI acceptance prediction accuracy and tailored Chinese university matches.
                  </p>
                </div>

                {/* Quick Navigation Card */}
                <div className="glass rounded-3xl p-6 border border-border-glass space-y-3">
                  <h4 className="text-sm font-bold text-text-primary mb-2">
                    Candidate Quick Links
                  </h4>
                  <Link
                    href="/tracker"
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-semibold text-text-primary group"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan" />
                      <span>ScholarChina Pipeline CRM</span>
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
                  <button
                    type="button"
                    onClick={() => setActiveTab("visa")}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-semibold text-text-primary group cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span>Chinese Visa (X1/X2) Guide</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
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
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Profile updated successfully! Your academic preferences have been saved.</span>
              </div>
            )}

            {saveError && (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-sm flex items-center gap-2">
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
        )}

        {/* Tab 2: Chinese Visa Process & Requirements */}
        {activeTab === "visa" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <StudentVisaProcessCard />
          </motion.div>
        )}

        {/* Tab 3: My Student Services & Interested Hub */}
        {activeTab === "services" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Section 1: My Interested Pages */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-cyan" />
                  <span>My Interested Pages & Application Flow</span>
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Direct access to your curated programs and application pipelines.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "Application Pipeline (CRM)",
                    desc: "Interactive 5-column Kanban tracking your document checklist, deadlines, and portal IDs.",
                    href: "/tracker",
                    badge: "ScholarChina Pipeline",
                    color: "from-blue-600 to-cyan",
                    icon: Layers,
                  },
                  {
                    title: "400+ Verified Scholarships",
                    desc: "CSC Type A & B, Provincial Government, and University Presidential full waivers.",
                    href: "/scholarships",
                    badge: "100% Live Directory",
                    color: "from-purple to-indigo-600",
                    icon: BookOpen,
                  },
                  {
                    title: "100+ Chinese Universities & 3D Tours",
                    desc: "Verified campuses across Beijing, Shanghai, Wuhan, Chengdu with virtual tours.",
                    href: "/universities",
                    badge: "Verified Campuses",
                    color: "from-emerald-500 to-teal-500",
                    icon: GraduationCap,
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="p-5 rounded-3xl glass hover:bg-white/10 border border-white/10 hover:border-cyan/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md`}
                        >
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-text-muted border border-white/10">
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-text-primary group-hover:text-cyan transition-colors mb-1.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-cyan">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Section 2: Student Services Suite */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple" />
                  <span>Academic & Pre-Departure Services</span>
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Essential tools built to maximize your acceptance chance and make moving to China smooth.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "Motivation Letter & SOP Studio",
                    desc: "AI-generated Statement of Purpose tailored to Chinese university formats with DOCX export.",
                    href: "/sop",
                    badge: "AI Studio",
                    icon: FileText,
                  },
                  {
                    title: "Pre-Departure & Flying Checklist",
                    desc: "40-point checklist: visa, health declaration, Chinese SIM card, Alipay/WeChat, and dorm prep.",
                    href: "/pre-departure",
                    badge: "Essential",
                    icon: Plane,
                  },
                  {
                    title: "Certified Documents & Notarization",
                    desc: "Legalize your Moroccan Bac, Licence, or Master transcripts for Chinese university portals.",
                    href: "/documents",
                    badge: "Verification",
                    icon: ShieldCheck,
                  },
                  {
                    title: "AI Eligibility Matcher",
                    desc: "Calculates match percentage against official admission criteria and past applicant GPAs.",
                    href: "/eligibility",
                    badge: "Match Engine",
                    icon: BadgeCheck,
                  },
                  {
                    title: "Side-by-Side Scholarship Comparison",
                    desc: "Compare funding amounts, monthly stipends, deadlines, and requirements side-by-side.",
                    href: "/compare",
                    badge: "Matrix Tool",
                    icon: Scale,
                  },
                  {
                    title: "24/7 AI Admissions Advisor",
                    desc: "Ask any question about CSC deadlines, professor supervisors, and Chinese visa policies.",
                    href: "/ai-chat",
                    badge: "Live AI",
                    icon: Sparkles,
                  },
                ].map((serv) => (
                  <Link
                    key={serv.href}
                    href={serv.href}
                    className="p-5 rounded-3xl glass hover:bg-white/10 border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-cyan flex items-center justify-center group-hover:scale-105 transition-transform">
                          <serv.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          {serv.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-text-primary group-hover:text-cyan transition-colors mb-1.5">
                        {serv.title}
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {serv.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-text-secondary group-hover:text-white">
                      <span>Launch Service</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-cyan" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
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
