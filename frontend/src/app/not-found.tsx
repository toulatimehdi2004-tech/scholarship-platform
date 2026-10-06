'use client';

import Link from 'next/link';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export default function NotFound() {
  const { t } = useLang();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="glass rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center glow-cyan-sm">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center mx-auto mb-6">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold text-text-secondary mb-4">Page Not Found</h2>
        <p className="text-sm text-text-muted mb-8 leading-relaxed">
          The page you are looking for might have moved or the address may have a slight typo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/universities"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-gradient text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Browse Universities</span>
          </Link>
          <Link
            href="/scholarships"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl glass hover:bg-white/10 text-sm font-semibold text-text-primary flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-cyan" />
            <span>Browse Scholarships</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
