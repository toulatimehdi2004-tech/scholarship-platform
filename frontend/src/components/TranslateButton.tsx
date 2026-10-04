'use client';

import { useState } from 'react';
import { Languages } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { translateCached } from '@/components/AutoText';

function hashStr(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return String(h);
}

/** On-demand translation of a text block via the backend (cached in localStorage). */
export default function TranslateButton({ text }: { text: string }) {
  const { lang } = useLang();
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (lang === 'en' || !text) return null;

  const label = lang === 'fr' ? 'Traduire en français' : 'ترجم إلى العربية';

  async function translate() {
    if (translated) {
      setTranslated(null);
      return;
    }
    setLoading(true);
    const out = await translateCached(text, lang);
    setLoading(false);
    if (out) setTranslated(out);
  }

  return (
    <div className="mt-2">
      <button
        onClick={translate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs text-cyan hover:text-purple transition-colors disabled:opacity-50"
      >
        <Languages className="w-3.5 h-3.5" />
        {loading ? '...' : translated ? '×' : label}
      </button>
      {translated && (
        <p className="mt-1.5 text-sm text-text-secondary leading-relaxed whitespace-pre-line border-l-2 border-cyan/40 pl-3">
          {translated}
        </p>
      )}
    </div>
  );
}
