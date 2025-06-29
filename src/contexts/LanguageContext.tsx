'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Language, 
  t as translate, 
  getBrowserLanguage,
  formatNumber as formatNum,
  formatCurrency as formatCurr,
  formatDate as formatDt
} from '@/lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Load saved language or detect browser language
  useEffect(() => {
    const savedLang = localStorage.getItem('vibelux_language') as Language;
    if (savedLang) {
      setLanguageState(savedLang);
    } else {
      const browserLang = getBrowserLanguage();
      setLanguageState(browserLang);
      localStorage.setItem('vibelux_language', browserLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vibelux_language', lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Optionally reload page for full translation update
    // window.location.reload();
  };

  const t = (key: string, params?: Record<string, any>) => {
    return translate(key, language, params);
  };

  const formatNumber = (num: number) => {
    return formatNum(num, language);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return formatCurr(amount, language, currency);
  };

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return formatDt(date, language, options);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatNumber,
        formatCurrency,
        formatDate
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}