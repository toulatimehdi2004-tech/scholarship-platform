'use client';

const KEY = 'compare-ids';
const MAX = 3;

export function getCompareIds(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

/** Toggle an id. Returns {ids, added} — added=false when tray full. */
export function toggleCompareId(id: number): { ids: number[]; added: boolean; full: boolean } {
  const ids = getCompareIds();
  if (ids.includes(id)) {
    const next = ids.filter((x) => x !== id);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    return { ids: next, added: false, full: false };
  }
  if (ids.length >= MAX) return { ids, added: false, full: true };
  const next = [...ids, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return { ids: next, added: true, full: false };
}

export function clearCompareIds() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
