'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Remembers in-app navigation so Back buttons can return to the true previous page. */
export default function RouteTracker() {
  const path = usePathname();

  useEffect(() => {
    try {
      const last = sessionStorage.getItem('cur-path');
      if (last && last !== path) {
        sessionStorage.setItem('prev-path', last);
      }
      sessionStorage.setItem('cur-path', path);
    } catch {}
  }, [path]);

  return null;
}
