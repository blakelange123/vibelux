'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { KeyboardShortcuts } from './KeyboardShortcuts'
import {
  Search,
  Home,
  BarChart3,
  Calculator,
  Settings,
  FileText,
  Zap,
  Plus,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Grid,
  Layers,
  Sun,
  Moon,
  HelpCircle,
  Command,
  ArrowRight,
  X
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ElementType
  shortcut?: string
  action: () => void
  category: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'go-home',
      title: 'Go to Dashboard',
      description: 'Navigate to main dashboard',
      icon: Home,
      shortcut: 'G H',
      action: () => router.push('/dashboard'),
      category: 'Navigation'
    },
    {
      id: 'go-designer',
      title: 'Open Advanced Designer',
      description: 'Open the lighting design tool',
      icon: Grid,
      shortcut: 'G D',
      action: () => router.push('/design/advanced'),
      category: 'Navigation'
    },
    {
      id: 'go-analytics',
      title: 'View Analytics',
      description: 'Open analytics dashboard',
      icon: BarChart3,
      shortcut: 'G A',
      action: () => router.push('/analytics'),
      category: 'Navigation'
    },
    {
      id: 'go-fixtures',
      title: 'Browse Fixtures',
      description: 'View DLC fixture database',
      icon: Zap,
      shortcut: 'G F',
      action: () => router.push('/fixtures'),
      category: 'Navigation'
    },
    {
      id: 'go-calculators',
      title: 'Calculators',
      description: 'Access all calculators',
      icon: Calculator,
      shortcut: 'G C',
      action: () => router.push('/calculators'),
      category: 'Navigation'
    },
    {
      id: 'go-settings',
      title: 'Settings',
      description: 'Open settings page',
      icon: Settings,
      shortcut: 'G S',
      action: () => router.push('/settings'),
      category: 'Navigation'
    },
    {
      id: 'go-operations',
      title: 'Operations Center',
      description: 'View operational insights and management',
      icon: BarChart3,
      shortcut: 'G O',
      action: () => router.push('/operations'),
      category: 'Navigation'
    },
    
    // Actions
    {
      id: 'new-project',
      title: 'New Project',
      description: 'Create a new lighting project',
      icon: Plus,
      shortcut: '⌘ N',
      action: () => {
        // Create a new project and navigate to design page
        const projectId = Date.now().toString()
        const newProject = {
          id: projectId,
          name: `Project ${new Date().toLocaleDateString()}`,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          fixtures: [],
          settings: {}
        }
        // Store in localStorage
        const projects = JSON.parse(localStorage.getItem('vibelux-projects') || '[]')
        projects.push(newProject)
        localStorage.setItem('vibelux-projects', JSON.stringify(projects))
        localStorage.setItem('vibelux-current-project', projectId)
        router.push(`/design/advanced?project=${projectId}`)
      },
      category: 'Actions'
    },
    {
      id: 'save-project',
      title: 'Save Project',
      description: 'Save current project',
      icon: Save,
      shortcut: '⌘ S',
      action: () => {
        // Save current project state
        const currentProjectId = localStorage.getItem('vibelux-current-project')
        if (currentProjectId) {
          const projects = JSON.parse(localStorage.getItem('vibelux-projects') || '[]')
          const projectIndex = projects.findIndex((p: any) => p.id === currentProjectId)
          if (projectIndex !== -1) {
            projects[projectIndex].lastModified = new Date().toISOString()
            localStorage.setItem('vibelux-projects', JSON.stringify(projects))
            // Show success notification
            const notification = document.createElement('div')
            notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
            notification.textContent = 'Project saved successfully'
            document.body.appendChild(notification)
            setTimeout(() => notification.remove(), 3000)
          }
        }
      },
      category: 'Actions'
    },
    {
      id: 'export-pdf',
      title: 'Export to PDF',
      description: 'Export current view as PDF',
      icon: Download,
      shortcut: '⌘ E',
      action: () => {
        // Export current page to PDF
        if (typeof window !== 'undefined') {
          window.print()
        }
      },
      category: 'Actions'
    },
    {
      id: 'import-data',
      title: 'Import Data',
      description: 'Import fixture or project data',
      icon: Upload,
      shortcut: '⌘ I',
      action: () => {
        // Create file input and trigger click
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json,.csv'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              try {
                const data = JSON.parse(e.target?.result as string)
                // Handle imported data based on type
                if (data.fixtures) {
                  localStorage.setItem('imported-fixtures', JSON.stringify(data.fixtures))
                } else if (data.projects) {
                  const existing = JSON.parse(localStorage.getItem('vibelux-projects') || '[]')
                  localStorage.setItem('vibelux-projects', JSON.stringify([...existing, ...data.projects]))
                }
                // Show success notification
                const notification = document.createElement('div')
                notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
                notification.textContent = 'Data imported successfully'
                document.body.appendChild(notification)
                setTimeout(() => notification.remove(), 3000)
              } catch (error) {
                alert('Error importing file. Please check the file format.')
              }
            }
            reader.readAsText(file)
          }
        }
        input.click()
      },
      category: 'Actions'
    },
    
    // View Controls
    {
      id: 'toggle-grid',
      title: 'Toggle Grid',
      description: 'Show/hide grid overlay',
      icon: Grid,
      shortcut: 'G',
      action: () => {
        // Toggle grid visibility
        const currentState = localStorage.getItem('show-grid') === 'true'
        localStorage.setItem('show-grid', (!currentState).toString())
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('grid-toggle', { detail: !currentState }))
      },
      category: 'View'
    },
    {
      id: 'toggle-layers',
      title: 'Toggle Layers',
      description: 'Show/hide layer panel',
      icon: Layers,
      shortcut: 'L',
      action: () => {
        // Toggle layers panel visibility
        const currentState = localStorage.getItem('show-layers') === 'true'
        localStorage.setItem('show-layers', (!currentState).toString())
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('layers-toggle', { detail: !currentState }))
      },
      category: 'View'
    },
    {
      id: 'toggle-ppfd',
      title: 'Toggle PPFD Map',
      description: 'Show/hide PPFD heat map',
      icon: Sun,
      shortcut: 'P',
      action: () => {
        // Toggle PPFD heatmap visibility
        const currentState = localStorage.getItem('show-ppfd') === 'true'
        localStorage.setItem('show-ppfd', (!currentState).toString())
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('ppfd-toggle', { detail: !currentState }))
      },
      category: 'View'
    },
    
    // Help
    {
      id: 'help-docs',
      title: 'Documentation',
      description: 'Open help documentation',
      icon: FileText,
      shortcut: '?',
      action: () => window.open('https://docs.vibelux.com', '_blank'),
      category: 'Help'
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'View all keyboard shortcuts',
      icon: Command,
      shortcut: '⌘ /',
      action: () => {
        setIsOpen(false)
        setShowShortcuts(true)
      },
      category: 'Help'
    }
  ]

  // Filter commands based on search
  const filteredCommands = commands.filter(command => {
    const searchLower = search.toLowerCase()
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.category.toLowerCase().includes(searchLower)
    )
  })

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = []
    }
    acc[command.category].push(command)
    return acc
  }, {} as Record<string, CommandItem[]>)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      
      // Open keyboard shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowShortcuts(true)
      }
      
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
      
      // Navigate with arrow keys
      if (isOpen && e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        )
      }
      
      if (isOpen && e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        )
      }
      
      // Execute on Enter
      if (isOpen && e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault()
        filteredCommands[selectedIndex].action()
        setIsOpen(false)
      }
      
      // Global shortcuts when palette is closed
      if (!isOpen) {
        // Navigation shortcuts
        if (e.key === 'g' || e.key === 'G') {
          e.preventDefault()
          // Listen for next key
          const handleNextKey = (e2: KeyboardEvent) => {
            e2.preventDefault()
            switch(e2.key.toLowerCase()) {
              case 'h': router.push('/dashboard'); break
              case 'd': router.push('/design/advanced'); break
              case 'a': router.push('/analytics'); break
              case 'f': router.push('/fixtures'); break
              case 'c': router.push('/calculators'); break
              case 's': router.push('/settings'); break
              case 'o': router.push('/operations'); break
            }
            window.removeEventListener('keydown', handleNextKey)
          }
          window.addEventListener('keydown', handleNextKey)
          setTimeout(() => window.removeEventListener('keydown', handleNextKey), 2000)
        }
        
        // Action shortcuts
        if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
          switch(e.key) {
            case 'n':
              e.preventDefault()
              commands.find(c => c.id === 'new-project')?.action()
              break
            case 's':
              e.preventDefault()
              commands.find(c => c.id === 'save-project')?.action()
              break
            case 'e':
              e.preventDefault()
              commands.find(c => c.id === 'export-pdf')?.action()
              break
            case 'i':
              e.preventDefault()
              commands.find(c => c.id === 'import-data')?.action()
              break
          }
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, router])

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSearch('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex, isOpen])

  return (
    <>
      <KeyboardShortcuts 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
      
      {isOpen && (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative min-h-screen flex items-start justify-center pt-[10vh]">
        <div className="relative w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Command List */}
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
            {Object.entries(groupedCommands).map(([category, items], groupIndex) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  {category}
                </div>
                {items.map((command, itemIndex) => {
                  const globalIndex = Object.entries(groupedCommands)
                    .slice(0, groupIndex)
                    .reduce((acc, [_, items]) => acc + items.length, 0) + itemIndex
                  
                  return (
                    <div
                      key={command.id}
                      data-index={globalIndex}
                      onClick={() => {
                        command.action()
                        setIsOpen(false)
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                        selectedIndex === globalIndex
                          ? 'bg-purple-600/20 text-white'
                          : 'text-gray-300 hover:bg-gray-800/50'
                      }`}
                    >
                      {React.createElement(command.icon, { className: "w-5 h-5 text-gray-400" })}
                      <div className="flex-1">
                        <div className="font-medium">{command.title}</div>
                        {command.description && (
                          <div className="text-sm text-gray-500">{command.description}</div>
                        )}
                      </div>
                      {command.shortcut && (
                        <kbd className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded">
                          {command.shortcut}
                        </kbd>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
            
            {filteredCommands.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                No commands found for "{search}"
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">↵</kbd>
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">esc</kbd>
                to close
              </span>
            </div>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">⌘K</kbd>
              to open
            </span>
          </div>
        </div>
      </div>
    </div>
      )}
    </>
  )
}