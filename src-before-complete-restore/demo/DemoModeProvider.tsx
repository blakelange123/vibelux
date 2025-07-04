'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DemoDataGenerator } from '@/lib/demo/demo-data-generator';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bot, X } from 'lucide-react';

interface DemoModeContextType {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  demoData: {
    facilities: ReturnType<typeof DemoDataGenerator.getDemoFacilities>;
    projects: ReturnType<typeof DemoDataGenerator.generateDemoProjects>;
    alerts: ReturnType<typeof DemoDataGenerator.generateAlerts>;
    stats: ReturnType<typeof DemoDataGenerator.generateDashboardStats>;
    yieldData: ReturnType<typeof DemoDataGenerator.generateYieldData>;
  };
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Check for demo mode in URL params
  useEffect(() => {
    const demo = searchParams.get('demo');
    if (demo === 'true' || demo === '1') {
      setIsDemoMode(true);
      setShowBanner(true);
    }
  }, [searchParams]);

  // Generate demo data once
  const [demoData] = useState(() => ({
    facilities: DemoDataGenerator.getDemoFacilities(),
    projects: DemoDataGenerator.generateDemoProjects(12),
    alerts: DemoDataGenerator.generateAlerts(),
    stats: DemoDataGenerator.generateDashboardStats(),
    yieldData: DemoDataGenerator.generateYieldData(365),
  }));

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setShowBanner(true);
    // Add demo param to URL
    const url = new URL(window.location.href);
    url.searchParams.set('demo', 'true');
    router.push(url.pathname + url.search);
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    setShowBanner(false);
    // Remove demo param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('demo');
    router.push(url.pathname + url.search);
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, enableDemoMode, disableDemoMode, demoData }}>
      {children}
      
      {/* Demo Mode Banner */}
      {isDemoMode && showBanner && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5" />
              <span className="font-medium">Demo Mode Active</span>
              <span className="text-sm opacity-90">
                Exploring with sample data • All features unlocked
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/auth/signup')}
                className="text-sm bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg transition-colors"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
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

// Demo mode indicator component
export function DemoModeIndicator() {
  const { isDemoMode, disableDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-40">
      <Bot className="w-4 h-4" />
      <span className="text-sm font-medium">Demo Mode</span>
      <button
        onClick={disableDemoMode}
        className="ml-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
      >
        Exit
      </button>
    </div>
  );
}