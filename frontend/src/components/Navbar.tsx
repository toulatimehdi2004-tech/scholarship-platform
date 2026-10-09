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
  Palette,
  Building2,
  GraduationCap,
  Briefcase,
  ChevronDown,
  ArrowLeftRight,
  Check,
} from "lucide-react";
import { useTheme, COLOR_THEMES } from "@/lib/ThemeContext";
import { useLang } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Logo from "@/components/Logo";
import { getCurrentUser, getToken, clearToken, type User } from "@/lib/api";
import LifetimePassModal from "@/components/LifetimePassModal";
import AuthGateModal from "@/components/AuthGateModal";

const navKeys = [
  { href: "/scholarships", key: "nav.scholarships" },
  { href: "/universities", key: "nav.universities" },
  { href: "/agency-services", key: "nav.agencyServices" },
  { href: "/ai-chat", key: "nav.aiChat" },
  { href: "/dashboard", key: "nav.dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const [portalRole, setPortalRole] = useState<"student" | "university" | "provider">("student");
  const { theme, toggle, colorTheme, setColorTheme, cycleColorTheme } = useTheme();
  const { t } = useLang();
  const [user, setUser] = useState<User | null>(null);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portal_role");
      if (pathname.startsWith("/university-portal") || saved === "university") {
        setPortalRole("university");
      } else if (pathname.startsWith("/provider-portal") || saved === "provider") {
        setPortalRole("provider");
      } else {
        setPortalRole("student");
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (getToken()) {
      getCurrentUser().then((res) => {
        if (res.data) setUser(res.data);
      });
    }
  }, [pathname]);

  const handleLogout = () => {
    clearToken();
    try {
      localStorage.removeItem("user");
    } catch {}
    setUser(null);
    window.location.reload();
  };

  const switchRole = (role: "student" | "university" | "provider" | "choose") => {
    setPortalDropdownOpen(false);
    setMobileOpen(false);
    if (role === "choose") {
      try {
        localStorage.removeItem("portal_role");
      } catch {}
      router.push("/portal");
      return;
    }
    try {
      localStorage.setItem("portal_role", role);
    } catch {}
    setPortalRole(role);
    if (role === "university") {
      router.push("/university-portal");
    } else if (role === "provider") {
      router.push("/provider-portal");
    } else {
      router.push("/");
    }
  };

  const currentColorOption = COLOR_THEMES.find((c) => c.id === colorTheme) || COLOR_THEMES[0];

  const getNavLinks = () => {
    if (portalRole === "university") {
      return [
        { href: "/university-portal", label: "Admissions Desk" },
        { href: "/universities", label: "Campuses" },
        { href: "/scholarships", label: "Scholarships" },
      ];
    }
    if (portalRole === "provider") {
      return [
        { href: "/provider-portal", label: "Orders & Services" },
        { href: "/universities", label: "Campuses" },
        { href: "/scholarships", label: "Scholarships" },
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
            <Link href="/" className="flex items-center gap-2 group">
              <span className="group-hover:glow-cyan-sm transition-all duration-300 rounded-xl block">
                <Logo size={36} />
              </span>
              <span className="text-lg font-bold gradient-text hidden sm:block tracking-tight">
                Moroccan Scholar
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
              {/* Portal Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    portalRole === "university"
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
                      : portalRole === "provider"
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                  }`}
                  title="Switch Portal Role"
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
                      ? "University Desk"
                      : portalRole === "provider"
                      ? "Provider Desk"
                      : "Student Portal"}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {portalDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 glass rounded-2xl p-2 border border-border-glass shadow-2xl z-50 backdrop-blur-2xl animate-fade-in"
                    onMouseLeave={() => setPortalDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                        Active Workspace
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Switch between platform roles
                      </p>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => switchRole("student")}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                          portalRole === "student"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "text-text-secondary hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold">Student Portal</div>
                          <div className="text-[10px] text-text-muted truncate">
                            Scholarships & 3D Tours
                          </div>
                        </div>
                        {portalRole === "student" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>

                      <button
                        onClick={() => switchRole("university")}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                          portalRole === "university"
                            ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                            : "text-text-secondary hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold">University Portal</div>
                          <div className="text-[10px] text-text-muted truncate">
                            Admissions & Edit School Info
                          </div>
                        </div>
                        {portalRole === "university" && <Check className="w-3.5 h-3.5 text-rose-400" />}
                      </button>

                      <button
                        onClick={() => switchRole("provider")}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                          portalRole === "provider"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "text-text-secondary hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold">Service Provider Desk</div>
                          <div className="text-[10px] text-text-muted truncate">
                            Translations & Document Orders
                          </div>
                        </div>
                        {portalRole === "provider" && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    </div>

                    <div className="pt-1.5 mt-1.5 border-t border-white/5">
                      <button
                        onClick={() => switchRole("choose")}
                        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold text-text-muted hover:text-cyan hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        <span>Choose Role Screen</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* Dynamic Theme Color Palette Switcher */}
              <div className="relative">
                <button
                  onClick={() => setPaletteOpen(!paletteOpen)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-all text-text-secondary hover:text-cyan flex items-center gap-1.5"
                  title="Dynamic Color Palette"
                >
                  <Palette className="w-4 h-4" />
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20 transition-all duration-300 shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${currentColorOption.primary}, ${currentColorOption.secondary})`,
                    }}
                  />
                </button>

                {paletteOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 glass rounded-2xl p-2 border border-border-glass shadow-2xl z-50 backdrop-blur-2xl"
                    onMouseLeave={() => setPaletteOpen(false)}
                  >
                    <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted px-2 py-1">
                      Color Vibe
                    </p>
                    <div className="space-y-1">
                      {COLOR_THEMES.map((ct) => (
                        <button
                          key={ct.id}
                          onClick={() => {
                            setColorTheme(ct.id);
                            setPaletteOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            colorTheme === ct.id
                              ? "bg-white/10 text-text-primary shadow-sm"
                              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                            style={{
                              background: `linear-gradient(135deg, ${ct.primary}, ${ct.secondary})`,
                            }}
                          />
                          <span>{ct.name}</span>
                          {colorTheme === ct.id && (
                            <span className="ml-auto text-xs text-cyan font-bold">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                  {user.student_profile?.is_premium ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm shadow-amber-500/20 animate-shimmer">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lifetime VIP</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowLifetimeModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-purple text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 hover:opacity-95 transition-all transform hover:scale-105 cursor-pointer animate-shimmer"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-200" />
                      <span>Lifetime Pass ($29)</span>
                    </button>
                  )}

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-cyan transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{user.username}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Log out"
                    className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAuthGate(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {t("nav.login")}
                  </button>
                  <button
                    onClick={() => setShowAuthGate(true)}
                    className="btn-gradient text-sm px-4 py-2 rounded-lg cursor-pointer"
                  >
                    <span>{t("nav.getStarted")}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={cycleColorTheme}
                className="p-2 rounded-lg hover:bg-white/5 transition-all text-text-secondary"
                title="Cycle Color Palette"
              >
                <Palette className="w-5 h-5 text-cyan" />
              </button>
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
              {/* Mobile Portal Selector */}
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                    Active Workspace
                  </span>
                  <button
                    onClick={() => switchRole("choose")}
                    className="text-[11px] font-bold text-cyan flex items-center gap-1 hover:underline"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => switchRole("student")}
                    className={`p-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                      portalRole === "student"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-white/5 text-text-secondary hover:text-white"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <span className="block text-[11px]">Student</span>
                  </button>
                  <button
                    onClick={() => switchRole("university")}
                    className={`p-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                      portalRole === "university"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-white/5 text-text-secondary hover:text-white"
                    }`}
                  >
                    <Building2 className="w-4 h-4 mx-auto mb-1 text-rose-400" />
                    <span className="block text-[11px]">University</span>
                  </button>
                  <button
                    onClick={() => switchRole("provider")}
                    className={`p-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                      portalRole === "provider"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-white/5 text-text-secondary hover:text-white"
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <span className="block text-[11px]">Provider</span>
                  </button>
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
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs text-text-muted uppercase font-bold">Theme Color</span>
                  <div className="flex items-center gap-1.5">
                    {COLOR_THEMES.map((ct) => (
                      <button
                        key={ct.id}
                        onClick={() => setColorTheme(ct.id)}
                        className={`w-6 h-6 rounded-full transition-all ${
                          colorTheme === ct.id ? "ring-2 ring-white scale-110" : "opacity-70"
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${ct.primary}, ${ct.secondary})`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {user ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm text-text-secondary font-medium">
                        {user.username}
                      </span>
                      {user.student_profile?.is_premium ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" /> Lifetime VIP
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setMobileOpen(false);
                            setShowLifetimeModal(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-purple text-white text-xs font-bold flex items-center gap-1"
                        >
                          <Crown className="w-3 h-3" /> $29 VIP Pass
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-white/5 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <>
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
        title="Sign In to Moroccan Scholar"
        subtitle="Exclusively for Moroccan Students: 100+ Chinese Universities & CSC Scholarships"
      />
    </>
  );
}
