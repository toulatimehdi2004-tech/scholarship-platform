'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '@/lib/i18n';

/** Back button that returns to the true previous in-app page.
 *  Falls back to a parent page when opened directly (new tab/refresh). */
export default function SmartBack({
  fallback,
  label,
}: {
  fallback: string;
  label?: string;
}) {
  const router = useRouter();
  const { t } = useLang();

  function go() {
    try {
      const prev = sessionStorage.getItem('prev-path');
      const cur = window.location.pathname;
      if (prev && prev !== cur) {
        router.back();
        return;
      }
    } catch {}
    router.push(fallback);
  }

  return (
    <button
      onClick={go}
      className="flex items-center gap-2 text-text-muted hover:text-cyan transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      {label ?? t('com.back')}
    </button>
  );
}
