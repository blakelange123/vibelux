"use client"

import { useState, useEffect } from 'react'
import { Code, X, ChevronLeft } from 'lucide-react'
import { DeveloperToolsSidebar } from './DeveloperToolsSidebar'

export function DevToolsToggle() {
  const [isOpen, setIsOpen] = useState(false)

  // Listen for toggle events
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => !prev)
    }

    window.addEventListener('toggleDeveloperNav', handleToggle)
    
    // Also expose global function
    ;(window as any).toggleDeveloperNav = handleToggle

    return () => {
      window.removeEventListener('toggleDeveloperNav', handleToggle)
    }
  }, [])

  // Add keyboard shortcut (Alt+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'd') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-20 right-0 z-[9999] bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-l-lg shadow-lg transition-all duration-300 ${
          isOpen ? 'translate-x-full' : 'translate-x-0'
        }`}
        aria-label="Open Developer Tools"
      >
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          <span className="text-sm font-medium">Dev Tools</span>
        </div>
      </button>

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full z-[10000] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Panel Content */}
        <div className="relative h-full w-80 bg-gray-950 shadow-2xl">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 left-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
            aria-label="Close Developer Tools"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-1/2 -left-10 transform -translate-y-1/2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white p-2 rounded-l-lg shadow-lg transition-colors"
            aria-label="Collapse Developer Tools"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Developer Tools Sidebar */}
          <div className="h-full overflow-hidden">
            <DeveloperToolsSidebar />
          </div>
        </div>
      </div>
    </>
  )
}