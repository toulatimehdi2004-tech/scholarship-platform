"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Sun, Moon, Crown, LogOut, User as UserIcon, Palette } from "lucide-react";
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
  { href: "/ai-chat", key: "nav.aiChat" },
  { href: "/dashboard", key: "nav.dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { theme, toggle, colorTheme, setColorTheme, cycleColorTheme } = useTheme();
  const { t } = useLang();
  const [user, setUser] = useState<User | null>(null);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);

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

  const currentColorOption = COLOR_THEMES.find((c) => c.id === colorTheme) || COLOR_THEMES[0];

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
                ChinaScholar
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navKeys.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    pathname === link.href
                      ? "text-cyan bg-cyan/10 glow-cyan-sm font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  }`}
                >
                  {t(link.key)}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
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
            className="md:hidden glass border-t border-border-glass"
          >
            <div className="px-4 py-4 space-y-2">
              {navKeys.map((link) => (
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
                  {t(link.key)}
                </Link>
              ))}

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
        title="Sign In to ChinaScholar"
        subtitle="Explore 100+ Chinese Universities & 400+ Full & Partial Scholarships"
      />
    </>
  );
}
