'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
export type ColorTheme = 'morocco' | 'royal-gold' | 'sahara' | 'mediterranean';

export interface ColorThemeOption {
  id: ColorTheme;
  name: string;
  icon: string;
  primary: string;
  secondary: string;
}

export const COLOR_THEMES: ColorThemeOption[] = [
  { id: 'morocco', name: 'Moroccan Scholar (Emerald & Ruby)', icon: '🇲🇦', primary: '#059669', secondary: '#c2171a' },
  { id: 'royal-gold', name: 'Imperial Gold & Emerald', icon: '👑', primary: '#f59e0b', secondary: '#059669' },
  { id: 'sahara', name: 'Sahara Crimson & Amber', icon: '☀️', primary: '#c2171a', secondary: '#f59e0b' },
  { id: 'mediterranean', name: 'Atlas Sky & Jade', icon: '🌊', primary: '#0ea5e9', secondary: '#10b981' },
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
  colorTheme: 'morocco',
  setColorTheme: () => {},
  cycleColorTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('morocco');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    document.documentElement.classList.toggle('light', savedTheme === 'light');

    const savedColor = localStorage.getItem('colorTheme') as ColorTheme;
    if (savedColor && ['morocco', 'royal-gold', 'sahara', 'mediterranean'].includes(savedColor)) {
      setColorThemeState(savedColor);
      document.documentElement.setAttribute('data-color-theme', savedColor);
    } else {
      document.documentElement.setAttribute('data-color-theme', 'morocco');
    }
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.classList.toggle('light', next === 'light');
  };

  const setColorTheme = (ct: ColorTheme) => {
    setColorThemeState(ct);
    localStorage.setItem('colorTheme', ct);
    document.documentElement.setAttribute('data-color-theme', ct);
  };

  const cycleColorTheme = () => {
    const ids: ColorTheme[] = ['morocco', 'royal-gold', 'sahara', 'mediterranean'];
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
