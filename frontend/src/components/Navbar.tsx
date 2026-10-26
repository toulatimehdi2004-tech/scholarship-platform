"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Sun,
  Moon,
  Crown,
  LogOut,
  User as UserIcon,
  Building2,
  GraduationCap,
  Briefcase,
  ChevronDown,
  ArrowLeftRight,
  Check,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { useLang } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Logo from "@/components/Logo";
import { getCurrentUser, getToken, clearToken, type User } from "@/lib/api";
import LifetimePassModal from "@/components/LifetimePassModal";
import AuthGateModal from "@/components/AuthGateModal";

const navKeys = [
  { href: "/student-portal", key: "nav.home" },
  { href: "/scholarships", key: "nav.scholarships" },
  { href: "/universities", key: "nav.universities" },
  { href: "/stories", key: "nav.stories" },
  { href: "/tracker", key: "nav.tracker" },
  { href: "/ai-chat", key: "nav.aiChat" },
  { href: "/dashboard", key: "nav.dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalRole, setPortalRole] = useState<"student" | "university" | "provider">("student");
  const { theme, toggle } = useTheme();
  const { t } = useLang();
  const [user, setUser] = useState<User | null>(null);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);

  const isAccountVip = Boolean(
    user &&
    (user.student_profile?.is_premium === true ||
     (typeof window !== "undefined" && user.username && localStorage.getItem(`vip_active_${user.username.toLowerCase()}`) === "true"))
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      let role = "student";
      try {
        const u = localStorage.getItem("user");
        if (u) {
          const parsed = JSON.parse(u);
          if (parsed.role) role = parsed.role;
        } else {
          const saved = localStorage.getItem("portal_role");
          if (saved === "university" || saved === "provider") role = saved;
        }
      } catch {}
      setPortalRole(role as "student" | "university" | "provider");
    }
  }, [pathname]);

  useEffect(() => {
    if (getToken()) {
      getCurrentUser().then((res) => {
        if (res.data) {
          setUser(res.data);
          if (res.data.role) {
            setPortalRole(res.data.role as "student" | "university" | "provider");
          }
        }
      });
    }
  }, [pathname]);

  const redirectToRoot = () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    window.location.href = `${basePath}/`;
  };

  const handleLogout = () => {
    clearToken();
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("portal_role");
      localStorage.removeItem("is_premium");
      localStorage.removeItem("vip_pass");
    } catch {}
    setUser(null);
    redirectToRoot();
  };

  const getNavLinks = () => {
    if (typeof window !== "undefined" && !getToken()) {
      return [];
    }
    if (portalRole === "university") {
      return [
        { href: "/university-portal", label: t("nav.admissionsDesk") },
        { href: "/universities", label: t("nav.campuses") },
        { href: "/scholarships", label: t("nav.scholarships") },
      ];
    }
    if (portalRole === "provider") {
      return [
        { href: "/provider-portal", label: t("nav.ordersServices") },
        { href: "/services", label: t("nav.services") || "Services" },
        { href: "/universities", label: t("nav.campuses") },
        { href: "/scholarships", label: t("nav.scholarships") },
      ];
    }
    return navKeys.map((link) => ({ href: link.href, label: t(link.key) }));
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border-glass"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="transition-all duration-300 rounded-full block group-hover:scale-105">
                <Logo size={38} />
              </span>
              <span className="text-xl font-black tracking-tight hidden sm:flex items-center">
                <span className="text-text-primary">Scholar</span>
                <span className="text-blue-500">China</span>
              </span>
            </Link>

            {/* Role-Aware Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {getNavLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    pathname === link.href
                      ? "text-cyan bg-cyan/10 glow-cyan-sm font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2.5">
              {/* Active Role Indicator Badge (Fixed - Strict Role Isolation) */}
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm select-none ${
                  portalRole === "university"
                    ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                    : portalRole === "provider"
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                }`}
              >
                {portalRole === "university" ? (
                  <Building2 className="w-3.5 h-3.5 text-rose-400" />
                ) : portalRole === "provider" ? (
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>
                  {portalRole === "university"
                    ? t("nav.uniPortal")
                    : portalRole === "provider"
                    ? t("nav.providerDesk")
                    : t("nav.studentPortal")}
                </span>
              </div>

              <LanguageSwitcher />

              <button
                onClick={toggle}
                className="p-2 rounded-lg hover:bg-white/5 transition-all duration-300 text-text-secondary hover:text-cyan theme-toggle"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="flex items-center gap-2.5">
                  {portalRole === "student" && (
                    isAccountVip ? (
                      <Link
                        href="/pricing"
                        className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm shadow-amber-500/20 animate-shimmer hover:opacity-90 transition-opacity"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t("nav.vipPass")}</span>
                      </Link>
                    ) : (
                      <Link
                        href="/pricing"
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-purple text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 hover:opacity-95 transition-all transform hover:scale-105 cursor-pointer animate-shimmer"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-200" />
                        <span>{t("nav.vipPass")}</span>
                      </Link>
                    )
                  )}

                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-cyan transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                    title={t("nav.myProfile")}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{user.username}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title={t("nav.logout")}
                    className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      clearToken();
                      redirectToRoot();
                    }}
                    className="btn-gradient text-xs sm:text-sm px-4 py-2 rounded-xl font-bold cursor-pointer"
                  >
                    <span>{t("nav.login") || "Sign In"}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex md:hidden items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={toggle}
                className="p-2 rounded-lg hover:bg-white/5 transition-all duration-300 text-text-secondary theme-toggle"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-text-secondary"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border-glass max-h-[85vh] overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-3">
              {/* Mobile Portal Role Indicator (Fixed) */}
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                  {t("nav.workspace")}
                </span>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    portalRole === "university"
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                      : portalRole === "provider"
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {portalRole === "university" ? (
                    <Building2 className="w-3.5 h-3.5 text-rose-400" />
                  ) : portalRole === "provider" ? (
                    <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>
                    {portalRole === "university"
                      ? t("nav.uniPortal")
                      : portalRole === "provider"
                      ? t("nav.providerDesk")
                      : t("nav.studentPortal")}
                  </span>
                </div>
              </div>

              {/* Dynamic Nav Links */}
              <div className="space-y-1">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      pathname === link.href
                        ? "text-cyan bg-cyan/10 font-bold"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-border-glass space-y-2">
                {user ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2">
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="text-sm text-text-primary font-bold flex items-center gap-2 hover:text-cyan"
                      >
                        <UserIcon className="w-4 h-4 text-cyan" />
                        <span>{user.username} ({t("nav.myProfile")})</span>
                      </Link>
                      {portalRole === "student" && (
                        isAccountVip ? (
                          <Link
                            href="/pricing"
                            onClick={() => setMobileOpen(false)}
                            className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"
                          >
                            <Crown className="w-3 h-3 text-amber-400" /> {t("nav.vipPass")}
                          </Link>
                        ) : (
                          <Link
                            href="/pricing"
                            onClick={() => setMobileOpen(false)}
                            className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-purple text-white text-xs font-bold flex items-center gap-1 shadow-sm shadow-amber-500/20"
                          >
                            <Crown className="w-3 h-3" /> {t("nav.vipPass")}
                          </Link>
                        )
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("nav.logout")}</span>
                    </button>
                  </>
                ) : (
                  <>
                    {portalRole === "student" && (
                      <Link
                        href="/pricing"
                        onClick={() => setMobileOpen(false)}
                        className="w-full mb-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-purple text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                      >
                        <Crown className="w-4 h-4 text-amber-200" />
                        <span>{t("nav.vipPass")}</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        setShowAuthGate(true);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5"
                    >
                      {t("nav.login")}
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        setShowAuthGate(true);
                      }}
                      className="w-full block btn-gradient text-sm text-center py-3 rounded-xl"
                    >
                      <span>{t("nav.getStarted")}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Global Lifetime Pass Modal and Auth Gate Modal */}
      <LifetimePassModal
        isOpen={showLifetimeModal}
        onClose={() => setShowLifetimeModal(false)}
      />

      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        title="Sign In to ScholarChina"
        subtitle="Gateway to 100+ Chinese Universities & CSC Full Scholarships"
        onSuccess={() => {
          setShowAuthGate(false);
          router.push("/dashboard");
        }}
      />
    </>
  );
}
