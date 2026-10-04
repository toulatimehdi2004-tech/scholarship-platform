'use client';

import { Delete, CornerDownLeft } from 'lucide-react';

const ROWS: string[][] = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'ى', 'ة', 'و', 'ز', 'ظ', '؟', '،'],
];

export default function ArabicKeyboard({
  onKey,
  onBackspace,
  onEnter,
}: {
  onKey: (ch: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}) {
  return (
    <div dir="rtl" className="glass rounded-2xl p-2.5 sm:p-3 space-y-1.5 select-none">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1 sm:gap-1.5 justify-center">
          {row.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => onKey(ch)}
              className="flex-1 min-w-0 h-10 sm:h-11 rounded-lg bg-white/5 border border-border-glass text-text-primary text-base sm:text-lg hover:bg-cyan/15 hover:border-cyan/40 active:bg-cyan/25 transition-all"
            >
              {ch}
            </button>
          ))}
        </div>
      ))}
      <div className="flex gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={onBackspace}
          aria-label="Backspace"
          className="h-10 sm:h-11 px-3 sm:px-4 rounded-lg bg-white/5 border border-border-glass text-text-secondary hover:text-red-400 hover:border-red-400/40 transition-all flex items-center justify-center"
        >
          <Delete className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onKey(' ')}
          className="flex-1 h-10 sm:h-11 rounded-lg bg-white/5 border border-border-glass text-text-muted text-xs hover:bg-white/10 transition-all"
        >
          مسافة
        </button>
        <button
          type="button"
          onClick={onEnter}
          aria-label="Send"
          className="h-10 sm:h-11 px-3 sm:px-4 rounded-lg bg-gradient-to-br from-cyan to-purple text-white hover:opacity-90 transition-all flex items-center justify-center"
        >
          <CornerDownLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
