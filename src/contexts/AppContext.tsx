import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const refreshCrisisMode = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('crisis_mode')
        .select('*')
        .order('activated_at', { ascending: false })
        .limit(1)
        .single();
      if (data) {
        setCrisisMode({
          active: data.active,
          activatedBy: data.activated_by ?? undefined,
          activatedAt: data.activated_at ?? undefined,
          reason: data.reason ?? undefined,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshCrisisMode();
  }, [refreshCrisisMode]);

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
