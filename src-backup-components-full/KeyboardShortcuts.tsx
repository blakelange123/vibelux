'use client'

import { X, Command } from 'lucide-react'

interface ShortcutGroup {
  title: string
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

interface KeyboardShortcutsProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  if (!isOpen) return null

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'General',
      shortcuts: [
        { keys: ['⌘', 'K'], description: 'Open command palette' },
        { keys: ['⌘', 'S'], description: 'Save project' },
        { keys: ['⌘', 'N'], description: 'New project' },
        { keys: ['⌘', 'E'], description: 'Export to PDF' },
        { keys: ['⌘', 'I'], description: 'Import data' },
        { keys: ['⌘', '/'], description: 'Show keyboard shortcuts' },
        { keys: ['Esc'], description: 'Close dialogs/Cancel' }
      ]
    },
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['G', 'H'], description: 'Go to dashboard' },
        { keys: ['G', 'D'], description: 'Go to designer' },
        { keys: ['G', 'A'], description: 'Go to analytics' },
        { keys: ['G', 'F'], description: 'Go to fixtures' },
        { keys: ['G', 'C'], description: 'Go to calculators' },
        { keys: ['G', 'S'], description: 'Go to settings' }
      ]
    },
    {
      title: 'Designer Tools',
      shortcuts: [
        { keys: ['V'], description: 'Select tool' },
        { keys: ['P'], description: 'Place fixture' },
        { keys: ['R'], description: 'Rotate' },
        { keys: ['G'], description: 'Toggle grid' },
        { keys: ['L'], description: 'Toggle layers' },
        { keys: ['H'], description: 'Toggle PPFD heatmap' },
        { keys: ['Delete'], description: 'Delete selected' },
        { keys: ['⌘', 'D'], description: 'Duplicate selected' },
        { keys: ['⌘', 'Z'], description: 'Undo' },
        { keys: ['⌘', 'Shift', 'Z'], description: 'Redo' }
      ]
    },
    {
      title: 'View Controls',
      shortcuts: [
        { keys: ['+'], description: 'Zoom in' },
        { keys: ['-'], description: 'Zoom out' },
        { keys: ['0'], description: 'Reset zoom' },
        { keys: ['Space'], description: 'Pan (hold and drag)' },
        { keys: ['F'], description: 'Fit to screen' },
        { keys: ['Shift', 'G'], description: 'Toggle guides' }
      ]
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-3xl bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Command className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-purple-400 uppercase mb-3">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4 py-2"
                    >
                      <span className="text-sm text-gray-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded font-mono">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-gray-500 text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-700 bg-gray-800/50">
          <p className="text-sm text-gray-400 text-center">
            Press <kbd className="px-2 py-0.5 mx-1 text-xs bg-gray-700 border border-gray-600 rounded">⌘K</kbd> 
            to open the command palette
          </p>
        </div>
      </div>
    </div>
  )
}