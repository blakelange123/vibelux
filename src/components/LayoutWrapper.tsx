'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Menu, X } from 'lucide-react';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Pages that should not show the sidebar
  const fullWidthPages = ['/', '/sign-in', '/sign-up'];
  const isFullWidth = fullWidthPages.includes(pathname);

  // Check for sidebar preference in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setSidebarOpen(JSON.parse(savedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', JSON.stringify(newState));
  };

  if (isFullWidth) {
    return <>{children}</>;
  }

  return (
    <>
      {sidebarOpen && <Navigation />}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : ''}`}>
        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <Menu className="w-5 h-5 text-white" />
          )}
        </button>
        <div className="px-6 pt-6">
          <Breadcrumbs />
        </div>
        {children}
      </main>
    </>
  );
}