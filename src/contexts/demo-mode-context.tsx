import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DemoDisclaimer } from '@/components/ui/demo-disclaimer';
import { DEMO_FEATURES, getDemoNotice, isFeatureDemo } from '@/lib/demo-mode-config';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DemoModeContextType {
  isDemoMode: boolean;
  dismissedNotices: Set<string>;
  dismissNotice: (noticeId: string) => void;
  resetDismissed: () => void;
  isFeatureDemo: (featureId: string) => boolean;
  showDemoBanner: boolean;
  setShowDemoBanner: (show: boolean) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isDemoMode, setIsDemoMode] = useState(true); // Default to true for demo
  const [dismissedNotices, setDismissedNotices] = useState<Set<string>>(new Set());
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  useEffect(() => {
    // Check if we're in demo mode based on environment or URL params
    const urlParams = new URLSearchParams(window.location.search);
    const demoParam = urlParams.get('demo');
    const envDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    
    setIsDemoMode(demoParam === 'true' || envDemo);
    
    // Load dismissed notices from localStorage
    const saved = localStorage.getItem('vibelux-dismissed-demo-notices');
    if (saved) {
      setDismissedNotices(new Set(JSON.parse(saved)));
    }
  }, []);

  const dismissNotice = (noticeId: string) => {
    const newDismissed = new Set(dismissedNotices);
    newDismissed.add(noticeId);
    setDismissedNotices(newDismissed);
    localStorage.setItem('vibelux-dismissed-demo-notices', JSON.stringify(Array.from(newDismissed)));
  };

  const resetDismissed = () => {
    setDismissedNotices(new Set());
    localStorage.removeItem('vibelux-dismissed-demo-notices');
  };

  const contextValue: DemoModeContextType = {
    isDemoMode,
    dismissedNotices,
    dismissNotice,
    resetDismissed,
    isFeatureDemo,
    showDemoBanner,
    setShowDemoBanner,
  };

  return (
    <DemoModeContext.Provider value={contextValue}>
      {isDemoMode && showDemoBanner && !dismissedNotices.has('global-banner') && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="font-semibold">Welcome to VibeLux Demo</p>
                  <p className="text-sm text-blue-100">
                    You're exploring our platform with simulated data. Contact sales to see how VibeLux works with your actual facility.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/contact-sales')}
                >
                  Get Started
                </Button>
                <button
                  onClick={() => dismissNotice('global-banner')}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}

// HOC to wrap pages with demo disclaimers
export function withDemoDisclaimer(Component: React.ComponentType<any>, featureId: string) {
  return function WrappedComponent(props: any) {
    const { isDemoMode, dismissedNotices, dismissNotice } = useDemoMode();
    const feature = DEMO_FEATURES.find(f => f.id === featureId);
    
    if (!isDemoMode || !feature || dismissedNotices.has(featureId)) {
      return <Component {...props} />;
    }

    const notice = getDemoNotice(feature.category);

    return (
      <>
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <span className="text-2xl">{notice.icon}</span>
                <div>
                  <h3 className="font-semibold text-blue-900">{notice.title}</h3>
                  <p className="text-sm text-blue-700 mt-1">{notice.message}</p>
                  {feature.productionRequirements && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-blue-800">Production requirements:</p>
                      <ul className="text-xs text-blue-600 mt-1">
                        {feature.productionRequirements.map((req, idx) => (
                          <li key={idx}>• {req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => dismissNotice(featureId)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <Component {...props} />
      </>
    );
  };
}