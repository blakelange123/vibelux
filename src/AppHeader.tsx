'use client';

import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { Menu, Bell, Settings } from 'lucide-react';
import { TokenUsageTracker } from './TokenUsageTracker';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AppHeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function AppHeader({ onMenuClick, showMenuButton = false }: AppHeaderProps) {
  const pathname = usePathname();
  
  // Get page title based on current route
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/design')) return 'Design Studio';
    if (pathname.startsWith('/cultivation')) return 'Cultivation';
    if (pathname.startsWith('/analytics')) return 'Analytics';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Vibelux';
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
          )}
          
          <h1 className="text-lg font-semibold text-white">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Token Usage Tracker */}
          <TokenUsageTracker />
          
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          {/* Settings */}
          <Link
            href="/settings"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </Link>
          
          {/* User Menu */}
          <div className="ml-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "bg-gray-900 border-gray-800",
                  userButtonPopoverActionButton: "hover:bg-gray-800"
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}