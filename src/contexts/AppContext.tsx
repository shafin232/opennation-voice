import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import apiClient from '@/lib/apiClient';
import type { CrisisMode } from '@/types';

type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  crisisMode: CrisisMode;
  refreshCrisisMode: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [crisisMode, setCrisisMode] = useState<CrisisMode>({ active: false });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for 403 crisis-mode events from apiClient
  useEffect(() => {
    const handler = () => setCrisisMode({ active: true });
    window.addEventListener('crisis-mode-notice', handler);
    return () => window.removeEventListener('crisis-mode-notice', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const refreshCrisisMode = useCallback(async () => {
    try {
      const { data } = await apiClient.get<CrisisMode>('/admin/crisis-mode');
      setCrisisMode(data);
    } catch {
      // ignore — crisis mode check is optional
    }
  }, []);

  return (
    <AppContext.Provider value={{ theme, toggleTheme, crisisMode, refreshCrisisMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
