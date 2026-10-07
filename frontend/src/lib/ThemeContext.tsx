'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
export type ColorTheme = 'cyber' | 'aurora' | 'cosmic' | 'solar';

export interface ColorThemeOption {
  id: ColorTheme;
  name: string;
  icon: string;
  primary: string;
  secondary: string;
}

export const COLOR_THEMES: ColorThemeOption[] = [
  { id: 'cyber', name: 'Cyber Cyan', icon: '⚡', primary: '#06b6d4', secondary: '#8b5cf6' },
  { id: 'aurora', name: 'Aurora Emerald', icon: '🌿', primary: '#10b981', secondary: '#06b6d4' },
  { id: 'cosmic', name: 'Cosmic Orchid', icon: '🌌', primary: '#ec4899', secondary: '#8b5cf6' },
  { id: 'solar', name: 'Solar Amber', icon: '☀️', primary: '#f59e0b', secondary: '#ef4444' },
];

interface ThemeContextType {
  theme: Theme;
  toggle: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (ct: ColorTheme) => void;
  cycleColorTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggle: () => {},
  colorTheme: 'cyber',
  setColorTheme: () => {},
  cycleColorTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('cyber');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }

    const savedColor = localStorage.getItem('colorTheme') as ColorTheme;
    if (savedColor && ['cyber', 'aurora', 'cosmic', 'solar'].includes(savedColor)) {
      setColorThemeState(savedColor);
      document.documentElement.setAttribute('data-color-theme', savedColor);
    } else {
      document.documentElement.setAttribute('data-color-theme', 'cyber');
    }
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('light', next === 'light');
  };

  const setColorTheme = (ct: ColorTheme) => {
    setColorThemeState(ct);
    localStorage.setItem('colorTheme', ct);
    document.documentElement.setAttribute('data-color-theme', ct);
  };

  const cycleColorTheme = () => {
    const ids: ColorTheme[] = ['cyber', 'aurora', 'cosmic', 'solar'];
    const nextIdx = (ids.indexOf(colorTheme) + 1) % ids.length;
    setColorTheme(ids[nextIdx]);
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle,
        colorTheme,
        setColorTheme,
        cycleColorTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
