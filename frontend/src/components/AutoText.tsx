'use client';

import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n';
import { fetchApi } from '@/lib/api';

export function hashStr(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return String(h);
}

export async function translateCached(
  text: string,
  lang: string
): Promise<string | null> {
  if (!text || lang === 'en') return null;
  const key = `tr-${hashStr(text)}-${lang}`;
  try {
    const cached = localStorage.getItem(key);
    if (cached) return cached;
  } catch {}
  // Split long texts into sentence chunks so each request stays fast/reliable
  const chunks = splitChunks(text, 700);
  try {
    const parts = await Promise.all(chunks.map((c) => translateOne(c, lang)));
    if (parts.some((p) => !p)) return null;
    const out = parts.join(' ');
    try {
      localStorage.setItem(key, out);
    } catch {}
    return out;
  } catch {
    return null;
  }
}

function splitChunks(text: string, maxLen: number): string[] {
  const sentences = text.split(/(?<=[.!?。！？])\s+/);
  const chunks: string[] = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + ' ' + s).trim().length > maxLen && cur) {
      chunks.push(cur.trim());
      cur = s;
    } else {
      cur = (cur + ' ' + s).trim();
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.length ? chunks : [text];
}

async function translateOne(
  chunk: string,
  lang: string
): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchApi<{ translated_text: string }>('/translate/', {
        method: 'POST',
        body: JSON.stringify({ text: chunk.slice(0, 3000), target_lang: lang }),
      });
      if (res.data?.translated_text) return res.data.translated_text;
    } catch {}
  }
  return null;
}

/** Renders text, automatically translated when the site language isn't English.
 *  Shows the original while loading, then swaps (result cached in localStorage). */
export default function AutoText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { lang } = useLang();
  const [out, setOut] = useState<string | null>(null);

  useEffect(() => {
    if (lang === 'en' || !text) {
      setOut(null);
      return;
    }
    let cancelled = false;
    translateCached(text, lang).then((r) => {
      if (!cancelled && r) setOut(r);
    });
    return () => {
      cancelled = true;
    };
  }, [text, lang]);

  return (
    <span dir="auto" className={className}>
      {out ?? text}
    </span>
  );
}
