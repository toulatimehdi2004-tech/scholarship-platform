"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Search, Layers, Crown, Sparkles, Award } from "lucide-react";
import Logo from "@/components/Logo";

export default function NotFound() {
  // Auto-recovery for GitHub Pages path prefix issues
  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/scholarship-platform";
      
      // If path is missing repo prefix on GitHub Pages (e.g. /tracker -> /scholarship-platform/tracker/)
      if (window.location.hostname.includes("github.io") && !p.startsWith(basePath)) {
        const cleanPath = p === "/" ? "" : p.replace(/\/+$/, "");
        window.location.replace(`${basePath}${cleanPath}/${window.location.search}${window.location.hash}`);
      }
    }
  }, []);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="glass rounded-3xl p-8 sm:p-12 max-w-xl w-full text-center border border-border-glass shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex justify-center mb-6">
          <Logo size={56} />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 mb-4">
          <span>Error 404 • Page Not Found</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-3">
          Looking for something specific?
        </h1>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed max-w-md mx-auto">
          The link you followed may be broken or the page may have been moved. Here are the most popular sections on ScholarChina:
        </p>

        {/* Quick Nav Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
          <Link
            href="/"
            className="p-3.5 rounded-2xl glass hover:bg-white/10 border border-white/5 hover:border-cyan/40 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan/10 text-cyan flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary group-hover:text-cyan transition-colors">Home Page</div>
              <div className="text-[11px] text-text-muted">Return to homepage</div>
            </div>
          </Link>

          <Link
            href="/scholarships"
            className="p-3.5 rounded-2xl glass hover:bg-white/10 border border-white/5 hover:border-cyan/40 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary group-hover:text-cyan transition-colors">400+ Scholarships</div>
              <div className="text-[11px] text-text-muted">Browse CSC & grants</div>
            </div>
          </Link>

          <Link
            href="/tracker"
            className="p-3.5 rounded-2xl glass hover:bg-white/10 border border-white/5 hover:border-emerald-500/40 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary group-hover:text-emerald-400 transition-colors">Application Pipeline</div>
              <div className="text-[11px] text-text-muted">Track your documents</div>
            </div>
          </Link>

          <Link
            href="/pricing"
            className="p-3.5 rounded-2xl glass hover:bg-white/10 border border-white/5 hover:border-amber-500/40 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary group-hover:text-amber-400 transition-colors">Lifetime VIP Pass</div>
              <div className="text-[11px] text-text-muted">$29 One-Time Access</div>
            </div>
          </Link>

          <Link
            href="/csca"
            className="p-3.5 rounded-2xl glass hover:bg-white/10 border border-white/5 hover:border-rose-500/40 transition-all flex items-center gap-3 group sm:col-span-2"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary group-hover:text-rose-400 transition-colors">Examen CSCA & Bourses Chine 2026/2027</div>
              <div className="text-[11px] text-text-muted">Matières requises & Prise de RDV csca.cn</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="btn-gradient text-sm px-6 py-3 rounded-xl flex items-center gap-2 font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back to Main Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
