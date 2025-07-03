"use client"

import { useState, useEffect } from 'react'
import { Globe, Check, ChevronDown, Languages, Download, Upload, Type, Settings } from 'lucide-react'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  translationProgress: number
  isDefault?: boolean
}

interface TranslationStatus {
  category: string
  total: number
  translated: number
  reviewed: number
}

export function MultiLanguageSupport() {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [autoDetect, setAutoDetect] = useState(true)
  const [showRegionalVariants, setShowRegionalVariants] = useState(false)
  
  const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', translationProgress: 100, isDefault: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', translationProgress: 95 },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', translationProgress: 88 },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', translationProgress: 92 },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', translationProgress: 85 },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', translationProgress: 90 },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', translationProgress: 87 },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', translationProgress: 82 },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', translationProgress: 78 },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', translationProgress: 75 },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', translationProgress: 80 },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', translationProgress: 70 },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', translationProgress: 65 },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', translationProgress: 68 },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', translationProgress: 60 }
  ]

  const translationStatus: TranslationStatus[] = [
    { category: 'User Interface', total: 450, translated: 450, reviewed: 445 },
    { category: 'Help Documentation', total: 1200, translated: 1150, reviewed: 1100 },
    { category: 'Technical Terms', total: 800, translated: 780, reviewed: 750 },
    { category: 'Error Messages', total: 200, translated: 195, reviewed: 190 },
    { category: 'Tutorial Content', total: 600, translated: 550, reviewed: 500 }
  ]

  const regionalVariants = {
    en: [
      { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
      { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
      { code: 'en-CA', name: 'English (Canada)', flag: '🇨🇦' },
      { code: 'en-AU', name: 'English (Australia)', flag: '🇦🇺' }
    ],
    es: [
      { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
      { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
      { code: 'es-AR', name: 'Spanish (Argentina)', flag: '🇦🇷' }
    ],
    pt: [
      { code: 'pt-PT', name: 'Portuguese (Portugal)', flag: '🇵🇹' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' }
    ]
  }

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0]
  }

  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode)
    setShowLanguageMenu(false)
    
    // In a real app, this would update the UI language
  }

  const calculateOverallProgress = () => {
    const current = getCurrentLanguage()
    return current.translationProgress
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(currentLanguage).format(num)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(currentLanguage, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Language Settings</h2>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span className="text-2xl">{getCurrentLanguage().flag}</span>
            <span>{getCurrentLanguage().name}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showLanguageMenu && (
            <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="text-left">
                      <p className="font-medium">{lang.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{lang.nativeName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{lang.translationProgress}%</span>
                    {currentLanguage === lang.code && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Language Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Translation Progress</h3>
          <span className="text-2xl font-bold text-indigo-600">{calculateOverallProgress()}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${calculateOverallProgress()}%` }}
          />
        </div>
        {getCurrentLanguage().translationProgress < 100 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Some content may still appear in English
          </p>
        )}
      </div>

      {/* Translation Status by Category */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Translation Status</h3>
        <div className="space-y-3">
          {translationStatus.map(status => (
            <div key={status.category} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{status.category}</h4>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {status.translated}/{status.total} translated
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(status.reviewed / status.total) * 100}%` }}
                  />
                  <div
                    className="bg-yellow-600 h-2 rounded-full -mt-2"
                    style={{ 
                      width: `${(status.translated / status.total) * 100}%`,
                      opacity: 0.5
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {Math.round((status.reviewed / status.total) * 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {status.reviewed} reviewed
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Language Options */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Language Options</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Auto-detect Language</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically select language based on browser settings
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoDetect}
              onChange={(e) => setAutoDetect(e.target.checked)}
              className="toggle"
            />
          </label>

          <label className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Show Regional Variants</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Display regional language options (e.g., US/UK English)
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={showRegionalVariants}
              onChange={(e) => setShowRegionalVariants(e.target.checked)}
              className="toggle"
            />
          </label>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Type className="w-5 h-5 text-gray-600" />
              <p className="font-medium">Units & Formatting</p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Numbers: {formatNumber(1234567.89)}</p>
              <p>Date: {formatDate(new Date())}</p>
              <p>Currency: {formatCurrency(1234.56)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Translation Tools */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Translation Tools</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-5 h-5" />
            <span>Export Translations</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Upload className="w-5 h-5" />
            <span>Import Translations</span>
          </button>
        </div>
      </div>

      {/* Community Translations */}
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <div className="flex items-center gap-3">
          <Languages className="w-5 h-5 text-indigo-600" />
          <div className="flex-1">
            <h4 className="font-semibold">Help Improve Translations</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Join our community translation program and help make Vibelux available in more languages
            </p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
            Learn More
          </button>
        </div>
      </div>

      {/* Language-specific Settings */}
      {(currentLanguage === 'ar' || currentLanguage === 'he') && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-semibold">Right-to-Left (RTL) Layout</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The interface will automatically adjust for RTL languages
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}