import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import bn from '@/i18n/bn';
import en from '@/i18n/en';
import type { TranslationKey } from '@/i18n/bn';

type Lang = 'bn' | 'en';
const translations = { bn, en } as const;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) || 'bn';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
