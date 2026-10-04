"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { useLang } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Logo from "@/components/Logo";

const navKeys = [
  { href: "/scholarships", key: "nav.scholarships" },
  { href: "/universities", key: "nav.universities" },
  { href: "/ai-chat", key: "nav.aiChat" },
  { href: "/dashboard", key: "nav.dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { t } = useLang();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="group-hover:glow-cyan-sm transition-all duration-300 rounded-xl block">
              <Logo size={36} />
            </span>
            <span className="text-lg font-bold gradient-text hidden sm:block">
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
                    ? "text-cyan bg-cyan/10 glow-cyan-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-white/5 transition-all duration-300 text-text-secondary hover:text-cyan theme-toggle"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/auth/register"
              className="btn-gradient text-sm px-4 py-2 rounded-lg"
            >
              <span>{t("nav.getStarted")}</span>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-white/5 transition-all duration-300 text-text-secondary theme-toggle"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
                    ? "text-cyan bg-cyan/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
            <div className="pt-2 border-t border-border-glass space-y-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="block btn-gradient text-sm text-center py-3"
              >
                <span>{t("nav.getStarted")}</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
