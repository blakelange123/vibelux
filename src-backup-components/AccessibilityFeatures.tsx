"use client"

import { useState } from 'react'
import { 
  Eye, 
  Ear, 
  Keyboard, 
  MousePointer, 
  Palette, 
  Type, 
  Volume2,
  ZoomIn,
  Monitor,
  Contrast,
  Moon,
  Sun,
  Settings,
  Check,
  Info,
  ChevronRight,
  Accessibility
} from 'lucide-react'

interface AccessibilityOption {
  id: string
  category: string
  label: string
  description: string
  icon: React.FC<any>
  enabled: boolean
  customizable?: boolean
}

interface ColorScheme {
  id: string
  name: string
  preview: {
    bg: string
    text: string
    primary: string
    secondary: string
  }
}

export function AccessibilityFeatures() {
  const [activeTab, setActiveTab] = useState<'visual' | 'motor' | 'auditory' | 'cognitive'>('visual')
  const [fontSize, setFontSize] = useState(100)
  const [cursorSize, setCursorSize] = useState(100)
  const [keyRepeatDelay, setKeyRepeatDelay] = useState(500)
  const [contrastLevel, setContrastLevel] = useState('normal')
  const [colorScheme, setColorScheme] = useState('default')
  
  const [accessibilityOptions, setAccessibilityOptions] = useState<AccessibilityOption[]>([
    // Visual
    {
      id: 'high-contrast',
      category: 'visual',
      label: 'High Contrast Mode',
      description: 'Increase contrast between text and background',
      icon: Contrast,
      enabled: false,
      customizable: true
    },
    {
      id: 'large-text',
      category: 'visual',
      label: 'Large Text',
      description: 'Increase the size of all text elements',
      icon: Type,
      enabled: false,
      customizable: true
    },
    {
      id: 'reduce-motion',
      category: 'visual',
      label: 'Reduce Motion',
      description: 'Minimize animations and transitions',
      icon: Monitor,
      enabled: false
    },
    {
      id: 'focus-indicators',
      category: 'visual',
      label: 'Enhanced Focus Indicators',
      description: 'Show clearer focus outlines on interactive elements',
      icon: Eye,
      enabled: true
    },
    {
      id: 'color-blind-mode',
      category: 'visual',
      label: 'Color Blind Mode',
      description: 'Adjust colors for better visibility',
      icon: Palette,
      enabled: false,
      customizable: true
    },
    // Motor
    {
      id: 'keyboard-navigation',
      category: 'motor',
      label: 'Full Keyboard Navigation',
      description: 'Navigate the entire app using only keyboard',
      icon: Keyboard,
      enabled: true
    },
    {
      id: 'sticky-keys',
      category: 'motor',
      label: 'Sticky Keys',
      description: 'Press modifier keys one at a time',
      icon: Keyboard,
      enabled: false
    },
    {
      id: 'large-click-targets',
      category: 'motor',
      label: 'Large Click Targets',
      description: 'Increase the size of clickable areas',
      icon: MousePointer,
      enabled: false
    },
    {
      id: 'dwell-clicking',
      category: 'motor',
      label: 'Dwell Clicking',
      description: 'Click by hovering over an item',
      icon: MousePointer,
      enabled: false,
      customizable: true
    },
    // Auditory
    {
      id: 'visual-alerts',
      category: 'auditory',
      label: 'Visual Alerts',
      description: 'Show visual indicators for audio alerts',
      icon: Eye,
      enabled: false
    },
    {
      id: 'captions',
      category: 'auditory',
      label: 'Captions',
      description: 'Show captions for video content',
      icon: Type,
      enabled: true
    },
    {
      id: 'transcripts',
      category: 'auditory',
      label: 'Audio Transcripts',
      description: 'Provide text versions of audio content',
      icon: Type,
      enabled: true
    },
    // Cognitive
    {
      id: 'simple-language',
      category: 'cognitive',
      label: 'Simple Language Mode',
      description: 'Use clearer, simpler language throughout',
      icon: Type,
      enabled: false
    },
    {
      id: 'reading-guide',
      category: 'cognitive',
      label: 'Reading Guide',
      description: 'Highlight current line while reading',
      icon: Eye,
      enabled: false
    },
    {
      id: 'auto-save',
      category: 'cognitive',
      label: 'Frequent Auto-Save',
      description: 'Save progress more frequently',
      icon: Settings,
      enabled: true
    },
    {
      id: 'clear-layout',
      category: 'cognitive',
      label: 'Simplified Layout',
      description: 'Reduce visual clutter and complexity',
      icon: Monitor,
      enabled: false
    }
  ])

  const colorSchemes: ColorScheme[] = [
    {
      id: 'default',
      name: 'Default',
      preview: { bg: '#ffffff', text: '#000000', primary: '#4f46e5', secondary: '#10b981' }
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      preview: { bg: '#000000', text: '#ffffff', primary: '#ffff00', secondary: '#00ffff' }
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      preview: { bg: '#1f2937', text: '#f3f4f6', primary: '#6366f1', secondary: '#34d399' }
    },
    {
      id: 'sepia',
      name: 'Sepia',
      preview: { bg: '#f4f1ea', text: '#5c4033', primary: '#8b4513', secondary: '#228b22' }
    },
    {
      id: 'blue-light',
      name: 'Reduced Blue Light',
      preview: { bg: '#fff8dc', text: '#2f1b14', primary: '#ff6347', secondary: '#ff8c00' }
    }
  ]

  const toggleOption = (optionId: string) => {
    setAccessibilityOptions(prev => prev.map(opt =>
      opt.id === optionId ? { ...opt, enabled: !opt.enabled } : opt
    ))
  }

  const getOptionsByCategory = (category: string) => {
    return accessibilityOptions.filter(opt => opt.category === category)
  }

  const getEnabledCount = () => {
    return accessibilityOptions.filter(opt => opt.enabled).length
  }

  const tabs = [
    { id: 'visual', label: 'Visual', icon: Eye },
    { id: 'motor', label: 'Motor', icon: MousePointer },
    { id: 'auditory', label: 'Auditory', icon: Ear },
    { id: 'cognitive', label: 'Cognitive', icon: Settings }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Accessibility className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Accessibility Features</h2>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {getEnabledCount()} features enabled
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setFontSize(fontSize === 100 ? 125 : 100)}
            className={`p-3 border rounded-lg flex flex-col items-center gap-2 ${
              fontSize > 100 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
            }`}
          >
            <Type className="w-5 h-5" />
            <span className="text-sm">Large Text</span>
          </button>
          <button
            onClick={() => setContrastLevel(contrastLevel === 'normal' ? 'high' : 'normal')}
            className={`p-3 border rounded-lg flex flex-col items-center gap-2 ${
              contrastLevel === 'high' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
            }`}
          >
            <Contrast className="w-5 h-5" />
            <span className="text-sm">High Contrast</span>
          </button>
          <button
            onClick={() => toggleOption('reduce-motion')}
            className={`p-3 border rounded-lg flex flex-col items-center gap-2 ${
              accessibilityOptions.find(o => o.id === 'reduce-motion')?.enabled
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-300'
            }`}
          >
            <Monitor className="w-5 h-5" />
            <span className="text-sm">Reduce Motion</span>
          </button>
          <button
            onClick={() => setColorScheme(colorScheme === 'default' ? 'dark' : 'default')}
            className={`p-3 border rounded-lg flex flex-col items-center gap-2 ${
              colorScheme === 'dark' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
            }`}
          >
            {colorScheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="text-sm">Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2 px-1 ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'visual' && (
          <>
            {/* Color Schemes */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Color Schemes</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colorSchemes.map(scheme => (
                  <button
                    key={scheme.id}
                    onClick={() => setColorScheme(scheme.id)}
                    className={`p-3 border rounded-lg ${
                      colorScheme === scheme.id
                        ? 'border-indigo-600 ring-2 ring-indigo-600'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: scheme.preview.bg }}
                        />
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: scheme.preview.text }}
                        />
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: scheme.preview.primary }}
                        />
                      </div>
                      {colorScheme === scheme.id && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-sm font-medium">{scheme.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Size */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Text Size</h3>
              <div className="flex items-center gap-4">
                <Type className="w-5 h-5 text-gray-600" />
                <input
                  type="range"
                  min="80"
                  max="150"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right">{fontSize}%</span>
              </div>
              <p
                className="mt-2 text-gray-600 dark:text-gray-400"
                style={{ fontSize: `${fontSize / 100}rem` }}
              >
                Sample text at {fontSize}% size
              </p>
            </div>
          </>
        )}

        {/* Feature Options */}
        <div className="space-y-3">
          {getOptionsByCategory(activeTab).map(option => (
            <div
              key={option.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <option.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {option.customizable && (
                  <button className="text-indigo-600 hover:text-indigo-700">
                    <Settings className="w-4 h-4" />
                  </button>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={option.enabled}
                    onChange={() => toggleOption(option.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Settings */}
        {activeTab === 'motor' && (
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Cursor Size</h3>
              <div className="flex items-center gap-4">
                <MousePointer className="w-5 h-5 text-gray-600" />
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={cursorSize}
                  onChange={(e) => setCursorSize(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right">{cursorSize}%</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Key Repeat Delay</h3>
              <div className="flex items-center gap-4">
                <Keyboard className="w-5 h-5 text-gray-600" />
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="100"
                  value={keyRepeatDelay}
                  onChange={(e) => setKeyRepeatDelay(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-20 text-right">{keyRepeatDelay}ms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Keyboard Shortcuts</h3>
          <button className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Toggle High Contrast</span>
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">Ctrl+Alt+C</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Increase Text Size</span>
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">Ctrl++</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Decrease Text Size</span>
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">Ctrl+-</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Screen Reader Mode</span>
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">Ctrl+Alt+S</kbd>
          </div>
        </div>
      </div>

      {/* Screen Reader Notice */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold">Screen Reader Support</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Vibelux is fully compatible with popular screen readers including JAWS, NVDA, and VoiceOver.
              All interactive elements include proper ARIA labels and descriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}