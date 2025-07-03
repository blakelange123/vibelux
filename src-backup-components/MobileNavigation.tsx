'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  LayoutDashboard,
  Lightbulb,
  Calendar,
  Building2,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react'
import { useUser, useClerk } from '@clerk/nextjs'

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const pathname = usePathname()
  const { user } = useUser()
  const { signOut } = useClerk()
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      subItems: []
    },
    {
      title: 'Designer',
      href: '/designer',
      icon: LayoutDashboard,
      subItems: [
        { title: 'New Project', href: '/designer/new' },
        { title: 'My Projects', href: '/designer/projects' },
        { title: 'Templates', href: '/designer/templates' }
      ]
    },
    {
      title: 'Lighting',
      href: '/lighting',
      icon: Lightbulb,
      subItems: [
        { title: 'Calculator', href: '/calculator' },
        { title: 'Fixture Library', href: '/fixtures' },
        { title: 'Spectrum Analysis', href: '/spectrum' }
      ]
    },
    {
      title: 'Planning',
      href: '/planning',
      icon: Calendar,
      subItems: [
        { title: 'Crop Calendar', href: '/calendar' },
        { title: 'Growth Stages', href: '/growth' },
        { title: 'Yield Predictor', href: '/yield' }
      ]
    },
    {
      title: 'Facility',
      href: '/facility',
      icon: Building2,
      subItems: [
        { title: 'HVAC', href: '/hvac' },
        { title: 'Electrical', href: '/electrical' },
        { title: 'Environmental', href: '/environmental' }
      ]
    }
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-gray-900 border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">VibeLux</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.fullName || user.firstName || 'User'}</p>
                <p className="text-xs text-gray-400">{user.emailAddresses?.[0]?.emailAddress || ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <div key={item.title} className="mb-2">
              {item.subItems.length > 0 ? (
                <>
                  <button
                    onClick={() => toggleSection(item.title)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-200">{item.title}</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        expandedSections.includes(item.title) ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {expandedSections.includes(item.title) && (
                    <div className="bg-gray-800/50">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={onClose}
                          className={`block px-12 py-2 text-sm transition-colors ${
                            pathname === subItem.href
                              ? 'text-purple-400 bg-purple-600/10'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                    pathname === item.href
                      ? 'bg-purple-600/20 text-purple-400 border-l-4 border-purple-600'
                      : 'text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5 text-gray-400" />
                  <span>{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
            <span>Settings</span>
          </Link>
          {user && (
            <button
              onClick={() => {
                signOut()
                onClose()
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// Mobile Header Component
export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 z-30 lg:hidden">
        <div className="flex items-center justify-between h-full px-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-400" />
          </button>
          
          <h1 className="text-xl font-bold text-white">VibeLux</h1>
          
          <Link
            href="/settings"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Settings className="w-6 h-6 text-gray-400" />
          </Link>
        </div>
      </header>

      <MobileNavigation
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  )
}