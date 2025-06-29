'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Menu } from 'lucide-react';
import { initViewportHandler } from '@/lib/viewport-utils';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering interactive elements
  useEffect(() => {
    setMounted(true);
    
    // Initialize viewport handler for dev tools support
    const cleanup = initViewportHandler();
    return cleanup;
  }, []);
  
  // Pages that should not show the sidebar
  const fullWidthPages = ['/sign-in', '/sign-up', '/design/advanced'];
  const isFullWidth = fullWidthPages.some(page => pathname.startsWith(page));

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      return !prev;
    });
  };

  // Expose toggle function globally for the emergency toggle button
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).toggleSidebar = toggleSidebar;
    }
  }, []);

  // Add keyboard shortcut and custom event listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Try Cmd/Ctrl + B (common for sidebar toggle)
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    
    // Listen for custom toggle event from emergency button
    const handleCustomToggle = () => {
      toggleSidebar();
    };
    
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('toggleSidebar', handleCustomToggle);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('toggleSidebar', handleCustomToggle);
    };
  }, []);

  if (isFullWidth) {
    return <>{children}</>;
  }

  // Prevent hydration mismatch by not rendering interactive elements until mounted
  if (!mounted) {
    return (
      <div className="relative min-h-screen">
        {/* Static sidebar during SSR */}
        <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 z-50">
          <Navigation />
        </div>
        
        {/* Static main content during SSR */}
        <div className="min-h-screen ml-64">
          <div className="px-6 pt-16">
            <Breadcrumbs />
          </div>
          {children}
        </div>
      </div>
    );
  }

  // Render interactive version after hydration
  return (
    <div className="relative min-h-screen">
      {/* Developer Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gray-900 z-50 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Navigation onClose={toggleSidebar} />
      </div>
      
      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Toggle button - only show when mounted */}
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 left-4 p-2 bg-gray-800/80 backdrop-blur rounded-lg hover:bg-gray-700 transition-colors z-50 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          title={`Current state: ${sidebarOpen ? 'Open' : 'Closed'} - Click to toggle`}
          data-sidebar-toggle="true"
        >
          <Menu className="w-5 h-5 text-white lucide-menu" />
        </button>
        
        <div className="px-6 pt-16">
          <Breadcrumbs />
        </div>
        {children}
      </div>
    </div>
  );
}