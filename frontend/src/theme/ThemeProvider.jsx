/*
  ThemeProvider — manages mode (light/dark) and accent (blue/emerald/violet/amber/rose).
  Persists to localStorage. Applies class + data-attribute on <html>.
  Any component can read/change theme via useTheme().
*/

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MODES = ['light', 'dark'];
const ACCENTS = ['blue', 'emerald', 'violet', 'amber', 'rose'];

const STORAGE_KEY_MODE = 'ik-theme-mode';
const STORAGE_KEY_ACCENT = 'ik-theme-accent';

const ThemeContext = createContext(undefined);

function getInitialMode() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY_MODE);
  if (stored && MODES.includes(stored)) return stored;
  // Respect OS preference
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function getInitialAccent() {
  if (typeof window === 'undefined') return 'blue';
  const stored = localStorage.getItem(STORAGE_KEY_ACCENT);
  if (stored && ACCENTS.includes(stored)) return stored;
  return 'blue';
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(getInitialMode);
  const [accent, setAccentState] = useState(getInitialAccent);

  // Apply mode class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    localStorage.setItem(STORAGE_KEY_MODE, mode);
  }, [mode]);

  // Apply accent data-attribute to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accent);
    localStorage.setItem(STORAGE_KEY_ACCENT, accent);
  }, [accent]);

  const setMode = useCallback((m) => {
    if (MODES.includes(m)) setModeState(m);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setAccent = useCallback((a) => {
    if (ACCENTS.includes(a)) setAccentState(a);
  }, []);

  const value = {
    mode,
    accent,
    setMode,
    toggleMode,
    setAccent,
    modes: MODES,
    accents: ACCENTS,
    isDark: mode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}

export default ThemeProvider;
