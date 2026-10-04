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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ScholarshipCard from "@/components/ScholarshipCard";
import { useEffect, useState } from "react";
import {
  getScholarships,
  getCurrentUser,
  getToken,
  clearToken,
  logoutUser,
  activatePremium,
  type Scholarship,
  type User,
} from "@/lib/api";

const quickActions = [
  {
    icon: Bookmark,
    label: "Browse Scholarships",
    href: "/scholarships",
    color: "from-cyan to-blue",
  },
  {
    icon: Sparkles,
    label: "AI Assistant",
    href: "/ai-chat",
    color: "from-purple to-pink-500",
  },
  {
    icon: FileText,
    label: "My Documents",
    href: "/documents",
    color: "from-blue to-purple",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.push("/auth/login");
      return;
    }

    async function load() {
      const [schRes, userRes] = await Promise.all([
        getScholarships(),
        getCurrentUser(),
      ]);
      if (schRes.data) {
        setScholarships(schRes.data.slice(0, 4));
      }
      if (userRes.data) {
        setUser(userRes.data);
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link
                href={action.href}
                className="glass rounded-2xl p-6 flex items-center gap-4 card-hover group block"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-cyan transition-colors">
                    {action.label}
                  </h3>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-cyan transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>

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
              <div className="glass rounded-2xl p-6 border border-amber-500/20">
                <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Unlock Full Access
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  You&apos;re on the free plan. Upgrade once to get:
                </p>
                <ul className="space-y-2 mb-5">
                  {[
                    "All 114+ scholarships (not just 5 per type)",
                    "Unlimited AI chat messages",
                    "Application tracking",
                    "Document management",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={async () => {
                    const res = await activatePremium();
                    if (res.data?.is_premium) {
                      const userRes = await getCurrentUser();
                      if (userRes.data) setUser(userRes.data);
                    }
                  }}
                  className="w-full btn-gradient py-3 rounded-xl text-sm"
                >
                  <span>Upgrade Now — One-Time Payment</span>
                </button>
              </div>
            )}

            {/* Profile Card (shown for premium users) */}
            {user?.student_profile?.is_premium && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan" />
                  Your Profile
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Username</span>
                    <span className="text-text-primary">{user?.username}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Email</span>
                    <span className="text-text-primary">{user?.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Premium</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

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
