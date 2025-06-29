'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { 
  I18nContext, 
  translations, 
  getTranslation, 
  detectLanguage, 
  getLanguageConfig 
} from '@/lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect and set initial language
    const detectedLanguage = detectLanguage();
    setLanguage(detectedLanguage);
    
    // Apply RTL if needed
    const langConfig = getLanguageConfig(detectedLanguage);
    if (langConfig?.rtl) {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = detectedLanguage;
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = detectedLanguage;
    }
    
    setIsLoading(false);
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    
    // Update document attributes
    const langConfig = getLanguageConfig(newLanguage);
    if (langConfig?.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    document.documentElement.lang = newLanguage;
  };

  const t = (key: string, params?: Record<string, string>) => {
    const languageTranslations = translations[language] || translations.en;
    return getTranslation(languageTranslations, key, params);
  };

  const langConfig = getLanguageConfig(language);
  const isRTL = langConfig?.rtl || false;

  const contextValue = {
    language,
    setLanguage: handleLanguageChange,
    t,
    isRTL
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}