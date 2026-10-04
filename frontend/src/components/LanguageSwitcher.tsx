'use client';

import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLang, type Lang } from '@/lib/i18n';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-semibold text-text-secondary hover:text-cyan hover:bg-white/5 transition-all"
        title="Language / Langue / اللغة"
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase text-xs">{lang}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-32 glass rounded-xl border border-border-glass overflow-hidden z-50">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onMouseDown={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-all hover:bg-white/5 ${
                lang === l.code ? 'text-cyan' : 'text-text-secondary'
              }`}
            >
              <span>
                {l.code === 'en' ? 'English' : l.code === 'fr' ? 'Français' : 'العربية'}
              </span>
              {lang === l.code && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
