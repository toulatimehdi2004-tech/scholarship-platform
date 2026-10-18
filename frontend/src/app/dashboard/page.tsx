"use client";

import { motion } from "framer-motion";
import {
  Bookmark,
  FileText,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Circle,
  LogOut,
  Layers,
  Trophy,
  AlertCircle,
  ExternalLink,
  Crown,
  User as UserIcon,
  Briefcase,
  Globe,
  Plane,
  ShieldCheck,
  Scale,
  BadgeCheck,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ScholarshipCard from "@/components/ScholarshipCard";
import { useEffect, useState } from "react";
import {
  getScholarships,
  getCurrentUser,
  getTrackedApplications,
  getToken,
  clearToken,
  logoutUser,
  activatePremium,
  type Scholarship,
  type User,
  type TrackerResponse,
  type ApplicationTrackerItem,
} from "@/lib/api";

const quickActions = [
  {
    icon: Bookmark,
    label: "Browse Scholarships",
    href: "/scholarships",
    color: "from-cyan to-blue",
  },
  {
    icon: Layers,
    label: "Application CRM",
    href: "/tracker",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: UserIcon,
    label: "My Profile",
    href: "/profile",
    color: "from-blue-600 to-indigo-600",
  },
  {
    icon: Sparkles,
    label: "AI Assistant",
    href: "/ai-chat",
    color: "from-purple to-pink-500",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [trackerData, setTrackerData] = useState<TrackerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [restrictedRole, setRestrictedRole] = useState<string | null>(null);

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

    async function load() {
      const [schRes, userRes, trackerRes] = await Promise.all([
        getScholarships(),
        getCurrentUser(),
        getTrackedApplications(),
      ]);
      if (schRes.data) {
        setScholarships(schRes.data.slice(0, 4));
      }
      if (userRes.data) {
        setUser(userRes.data);
      }
      if (trackerRes.data) {
        setTrackerData(trackerRes.data);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const handleLogout = async () => {
    await logoutUser();
    clearToken();
    localStorage.removeItem("user");
    router.push("/");
  };

  // If Service Provider or University: Restricted Isolation View
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
            Candidate dashboards, private notes, and internal application pipelines are confidential to students.
            {restrictedRole === "provider"
              ? " Please use your Service Provider Desk to manage document orders and translations."
              : " Please use your Admissions Desk to review candidate records and campus programs."}
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

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 animate-pulse">
          <div className="h-6 bg-white/10 rounded w-48 mb-4" />
          <div className="h-4 bg-white/10 rounded w-64" />
        </div>
      </div>
    );
  }

  const stats = trackerData?.stats || {
    total: 0,
    wishlist: 0,
    preparing_docs: 0,
    submitted: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
    urgent_deadlines: 0,
  };

  const trackedList = trackerData?.applications || [];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
              Welcome{" "}
              <span className="gradient-text">
                {user?.first_name || user?.username || "Back"}
              </span>
            </h1>
            <p className="text-text-secondary">
              Your scholarship dashboard - track applications and discover new
              opportunities
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="glass rounded-xl p-3 text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link
                href={action.href}
                className="glass rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 card-hover group block"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 shadow-md`}
                >
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-text-primary group-hover:text-cyan transition-colors truncate">
                    {action.label}
                  </h3>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-cyan transition-colors hidden sm:block" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Application Pipeline Kanban Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8 glass rounded-2xl p-6 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm dark:shadow-none"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-text-primary">Application Pipeline CRM</h2>
                  {stats.urgent_deadlines > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 animate-pulse flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {stats.urgent_deadlines} Urgent Deadline{stats.urgent_deadlines > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-text-secondary">Interactive pipeline tracking your active Chinese university applications</p>
              </div>
            </div>
            <Link
              href="/tracker"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-blue-600 dark:text-cyan hover:text-blue-700 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all self-start sm:self-auto cursor-pointer"
            >
              <span>Open Interactive Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 5-Stage Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20 text-center">
              <div className="text-[11px] font-semibold text-text-muted mb-0.5">📌 Wishlist</div>
              <div className="text-xl font-extrabold text-slate-300">{stats.wishlist}</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <div className="text-[11px] font-semibold text-blue-300 mb-0.5">📝 Preparing Docs</div>
              <div className="text-xl font-extrabold text-blue-400">{stats.preparing_docs}</div>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
              <div className="text-[11px] font-semibold text-purple-300 mb-0.5">🚀 Submitted</div>
              <div className="text-xl font-extrabold text-purple-400">{stats.submitted}</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <div className="text-[11px] font-semibold text-amber-300 mb-0.5">🔍 In Review</div>
              <div className="text-xl font-extrabold text-amber-400">{stats.interview}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold text-emerald-300 mb-0.5">🏆 Accepted</div>
              <div className="text-xl font-extrabold text-emerald-400">{stats.accepted}</div>
            </div>
          </div>

          {/* Active Items Preview */}
          {trackedList.length > 0 ? (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Recent In-Flight Applications</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {trackedList.slice(0, 2).map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-white/15 transition-all flex items-start justify-between gap-3 shadow-sm dark:shadow-none">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-text-primary truncate">{item.scholarship.title}</div>
                      <div className="text-xs text-slate-600 dark:text-text-muted truncate mt-0.5">
                        {item.scholarship.university_name} • {item.scholarship.university_city}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-slate-700 dark:text-text-secondary font-medium">
                          Docs: <span className="text-blue-600 dark:text-cyan font-bold">{item.checklist_progress?.completed ?? 0}/{item.checklist_progress?.total ?? 0}</span>
                        </span>
                        {item.scholarship.application_deadline && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                            item.is_deadline_urgent ? "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30" : "text-slate-500 dark:text-text-muted"
                          }`}>
                            <Clock className="w-2.5 h-2.5" />
                            {typeof item.days_until_deadline === "number" && item.days_until_deadline >= 0
                              ? `${item.days_until_deadline}d left`
                              : "Deadline passed"}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href="/tracker"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-medium text-slate-700 dark:text-text-secondary hover:text-blue-600 dark:hover:text-white transition-all flex items-center gap-1 flex-shrink-0 border border-slate-200 dark:border-transparent"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <p className="text-sm font-semibold text-text-primary">Start your application journey</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Save scholarships to your pipeline to track deadlines, manage required document checklists, and store portal IDs.
                </p>
              </div>
              <Link
                href="/scholarships"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan/15 text-cyan hover:bg-cyan/25 border border-cyan/30 transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Browse Scholarships</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Student Academic Services & Interested Hub */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple" />
                <span>My Candidate Services & Tools</span>
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Specialized study-in-China services for your admission and visa journey.
              </p>
            </div>
            <Link
              href="/profile"
              className="text-xs text-cyan hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All Services</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                title: "Visa (X1/X2)",
                desc: "RDV Visa & Embassy",
                href: "/profile",
                icon: Globe,
                color: "from-blue-600 to-cyan",
              },
              {
                title: "SOP Studio",
                desc: "Motivation Letter AI",
                href: "/sop",
                icon: FileText,
                color: "from-purple to-pink-500",
              },
              {
                title: "Pre-Departure",
                desc: "Flight & Packing List",
                href: "/pre-departure",
                icon: Plane,
                color: "from-amber-500 to-orange-500",
              },
              {
                title: "Legalization",
                desc: "Certified Documents",
                href: "/documents",
                icon: ShieldCheck,
                color: "from-emerald-500 to-teal-500",
              },
              {
                title: "AI Matcher",
                desc: "Eligibility Probability",
                href: "/eligibility",
                icon: BadgeCheck,
                color: "from-indigo-600 to-purple",
              },
              {
                title: "Comparison",
                desc: "Side-by-side Grants",
                href: "/compare",
                icon: Scale,
                color: "from-cyan to-blue-500",
              },
            ].map((svc) => (
              <Link
                key={svc.title}
                href={svc.href}
                className="p-3.5 rounded-2xl glass hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-cyan/40 transition-all flex flex-col items-center text-center group cursor-pointer shadow-sm dark:shadow-none"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center text-white mb-2 shadow-md group-hover:scale-105 transition-transform`}
                >
                  <svc.icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-text-primary group-hover:text-blue-600 dark:group-hover:text-cyan transition-colors">
                  {svc.title}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-text-muted mt-0.5 truncate w-full">
                  {svc.desc}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                Available Scholarships
              </h2>
              <Link
                href="/scholarships"
                className="text-sm text-cyan hover:text-purple transition-colors flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {scholarships.length > 0 ? (
                scholarships.map((s, i) => (
                  <ScholarshipCard key={s.id} scholarship={s} index={i} />
                ))
              ) : (
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="glass rounded-2xl p-6 h-48 animate-pulse"
                    >
                      <div className="h-4 bg-white/10 rounded w-20 mb-4" />
                      <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                      <div className="h-4 bg-white/10 rounded w-full" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Premium Upgrade Card (shown for free users) */}
            {!user?.student_profile?.is_premium && (
              <div className="glass rounded-2xl p-6 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-text-primary">
                    Scholar VIP Pass ($29)
                  </h3>
                </div>
                <p className="text-xs text-text-secondary mb-4">
                  Unlock the full database of 100+ universities & 400+ CSC scholarships for life:
                </p>
                <ul className="space-y-2 mb-5">
                  {[
                    "All 100+ universities & 3D VR tours",
                    "Direct official portal application links",
                    "Unlimited AI matching & SOP generator",
                    "ScholarChina Pipeline CRM",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className="w-full btn-gradient py-3 rounded-xl text-xs font-bold block text-center shadow-lg shadow-amber-500/20"
                >
                  <span>Unlock Lifetime VIP ($29)</span>
                </Link>
              </div>
            )}

            {/* Profile Snapshot Card (linking to dedicated /profile page) */}
            <div className="glass rounded-2xl p-6 border border-border-glass">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-glass">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-cyan" />
                  <span>Student Profile</span>
                </h3>
                <Link
                  href="/profile"
                  className="text-xs text-cyan hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Edit Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Username</span>
                  <span className="text-text-primary font-semibold">@{user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Full Name</span>
                  <span className="text-text-primary font-medium">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Location</span>
                  <span className="text-text-secondary">
                    {user?.student_profile?.city ? `${user.student_profile.city}, Morocco` : "Morocco 🇲🇦"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Plan Status</span>
                  {user?.student_profile?.is_premium ? (
                    <span className="text-amber-500 dark:text-amber-400 font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Lifetime VIP
                    </span>
                  ) : (
                    <span className="text-text-muted">Free Explorer</span>
                  )}
                </div>
              </div>
              <Link
                href="/profile"
                className="mt-4 w-full py-2.5 rounded-xl glass text-center text-xs font-bold text-cyan hover:bg-white/10 transition-all border border-border-glass block"
              >
                Open Dedicated Profile Page →
              </Link>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Total Scholarships",
                    value: scholarships.length || 0,
                    color: "text-cyan",
                  },
                  {
                    label: "Featured",
                    value: scholarships.filter((s) => s.is_featured).length,
                    color: "text-purple",
                  },
                  {
                    label: "With Deadlines",
                    value: scholarships.filter(
                      (s) => s.application_deadline
                    ).length,
                    color: "text-blue",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-text-muted">
                      {stat.label}
                    </span>
                    <span className={`text-lg font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
