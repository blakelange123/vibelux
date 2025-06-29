'use client';

import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { supportedLanguages, useTranslation, saveLanguagePreference } from '@/lib/i18n';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full';
  showFlag?: boolean;
  className?: string;
}

export default function LanguageSelector({ 
  variant = 'compact', 
  showFlag = true,
  className = '' 
}: LanguageSelectorProps) {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = supportedLanguages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    saveLanguagePreference(langCode);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
        >
          {showFlag && currentLanguage && (
            <span className="text-lg">{currentLanguage.flag}</span>
          )}
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-white">{currentLanguage?.code.toUpperCase()}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[200px]">
              <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                {supportedLanguages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      language === lang.code
                        ? 'bg-purple-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {showFlag && (
                      <span className="text-lg">{lang.flag}</span>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{lang.nativeName}</p>
                      <p className="text-xs opacity-70">{lang.name}</p>
                    </div>
                    {language === lang.code && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Full variant for settings page
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-medium text-white">{t('common.language')}</h3>
      <p className="text-sm text-gray-400">
        {t('settings.languageDescription')}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {supportedLanguages.map(lang => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
              language === lang.code
                ? 'border-purple-500 bg-purple-500/20 text-white'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600 text-gray-300'
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <div className="flex-1 text-left">
              <p className="font-medium">{lang.nativeName}</p>
              <p className="text-sm opacity-70">{lang.name}</p>
            </div>
            {language === lang.code && (
              <Check className="w-5 h-5 text-purple-400" />
            )}
          </button>
        ))}
      </div>
      
      {/* RTL Notice */}
      {currentLanguage?.rtl && (
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3">
          <p className="text-sm text-blue-300">
            {t('settings.rtlNotice')}
          </p>
        </div>
      )}
    </div>
  );
}