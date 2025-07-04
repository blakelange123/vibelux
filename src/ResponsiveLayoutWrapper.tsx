'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import UnifiedNavigation from '@/components/UnifiedNavigation';
import { MobileHeader } from '@/components/MobileNavigation';
import { AppHeader } from '@/components/AppHeader';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Menu } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';

export function ResponsiveLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isMobile, isTablet } = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering interactive elements
  useEffect(() => {
    setMounted(true);
    // Auto-close sidebar on mobile
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [isMobile, isTablet]);
  
  // Pages that should not show the sidebar
  const fullWidthPages = ['/', '/sign-in', '/sign-up', '/design/advanced'];
  const isFullWidth = fullWidthPages.some(page => pathname === page || pathname.startsWith(page));

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile, isTablet]);

  // Add keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (isFullWidth) {
    return <>{children}</>;
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="relative min-h-screen">
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="relative min-h-screen bg-gray-950">
        <MobileHeader />
        <main className="pt-16 pb-20">
          {children}
        </main>
      </div>
    );
  }

  // Tablet layout
  if (isTablet) {
    return (
      <div className="relative min-h-screen">
        {/* Overlay for tablet when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-full w-64 bg-gray-900 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <UnifiedNavigation onClose={() => setSidebarOpen(false)} />
        </div>
        
        {/* Main Content */}
        <div className="min-h-screen pl-0">
          {/* Toggle button */}
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 p-2 bg-gray-800/80 backdrop-blur rounded-lg hover:bg-gray-700 transition-colors z-30"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          
          <div className="px-4 sm:px-6 pt-16">
            <Breadcrumbs />
          </div>
          <div className="px-4 sm:px-6">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="relative min-h-screen">
      {/* Desktop Header */}
      <AppHeader onMenuClick={toggleSidebar} showMenuButton={!sidebarOpen} />
      
      {/* Desktop Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gray-900 z-30 transition-transform duration-300 pt-16 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <UnifiedNavigation onClose={toggleSidebar} />
      </div>
      
      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 left-4 p-2 bg-gray-800/80 backdrop-blur rounded-lg hover:bg-gray-700 transition-colors z-50 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
        
        <div className="px-6 pt-16">
          <Breadcrumbs />
        </div>
        {children}
      </div>
    </div>
  );
}