'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, CheckCircle, Settings, Shield } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveCookiePreferences(allAccepted);
  };

  const handleAcceptSelected = () => {
    saveCookiePreferences(preferences);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveCookiePreferences(onlyNecessary);
  };

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      preferences: prefs,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));
    setShowBanner(false);
    
    // Trigger cookie preference update event
    window.dispatchEvent(new CustomEvent('cookiePreferencesUpdated', { 
      detail: prefs 
    }));

    // Initialize or disable analytics based on preferences
    if (prefs.analytics) {
      // Initialize analytics services
    } else {
      // Disable analytics
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900 border-t border-gray-800 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 bg-purple-600 rounded-lg flex-shrink-0">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  We use cookies to enhance your experience
                </h3>
                <p className="text-gray-400 text-sm">
                  We use cookies and similar technologies to analyze traffic, enhance your 
                  experience and allow our partners to serve tailored advertisements. By 
                  clicking "Accept All", you consent to our use of cookies.{' '}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                    Learn more in our Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-4 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Preferences</span>
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Accept All
              </button>
            </div>
          </div>

          {/* Detailed Cookie Settings */}
          {showDetails && (
            <div className="mt-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4">Cookie Preferences</h4>
              
              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-900 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-white mb-1">Necessary Cookies</h5>
                    <p className="text-sm text-gray-400">
                      These cookies are essential for the website to function properly. They 
                      enable basic functions like page navigation and access to secure areas.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="w-5 h-5 text-purple-600 rounded cursor-not-allowed opacity-50"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-900 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-white mb-1">Analytics Cookies</h5>
                    <p className="text-sm text-gray-400">
                      These cookies help us understand how visitors interact with our website 
                      by collecting and reporting information anonymously.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        analytics: e.target.checked
                      })}
                      className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-900 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-white mb-1">Marketing Cookies</h5>
                    <p className="text-sm text-gray-400">
                      These cookies track visitors across websites to display ads that are 
                      relevant and engaging for individual users.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        marketing: e.target.checked
                      })}
                      className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Preference Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-900 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-white mb-1">Preference Cookies</h5>
                    <p className="text-sm text-gray-400">
                      These cookies allow the website to remember choices you make (such as 
                      language or region) and provide enhanced, personalized features.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        preferences: e.target.checked
                      })}
                      className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleAcceptSelected}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Shield Badge */}
      <button
        onClick={() => setShowBanner(true)}
        className="fixed bottom-4 left-4 p-2 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-40 group"
        title="Cookie Settings"
      >
        <Shield className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
      </button>
    </>
  );
}