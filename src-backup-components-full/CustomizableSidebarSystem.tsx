"use client"

import { useState, useEffect } from 'react'
import { 
  Plus, X, Settings, ChevronLeft, ChevronRight, 
  Move, Save, RotateCcw, Palette, Layout,
  Grid3x3, Layers, FileText, BarChart3,
  Box, Calculator, Thermometer, Leaf,
  Wifi, Cloud, Zap, Activity
} from 'lucide-react'

export interface SidebarItem {
  id: string
  title: string
  icon: React.ReactNode
  component: React.ComponentType<any>
  category: string
  defaultProps?: any
}

export interface SidebarConfig {
  id: string
  position: 'left' | 'right' | 'floating'
  items: string[] // IDs of sidebar items
  width: number
  isCollapsed: boolean
  order: number
  x?: number // For floating sidebars
  y?: number
}

interface CustomizableSidebarSystemProps {
  availableItems: SidebarItem[]
  onConfigChange?: (config: SidebarConfig[]) => void
  children: React.ReactNode
}

// Available sidebar items catalog
export const DEFAULT_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: 'fixture-library',
    title: 'Fixture Library',
    icon: <Box className="w-4 h-4" />,
    component: () => <div>Fixture Library Component</div>,
    category: 'Design Tools'
  },
  {
    id: 'properties',
    title: 'Properties Panel',
    icon: <Settings className="w-4 h-4" />,
    component: () => <div>Properties Panel</div>,
    category: 'Design Tools'
  },
  {
    id: 'layers',
    title: 'Layer Manager',
    icon: <Layers className="w-4 h-4" />,
    component: () => <div>Layer Manager</div>,
    category: 'Design Tools'
  },
  {
    id: 'calculations',
    title: 'Calculations',
    icon: <Calculator className="w-4 h-4" />,
    component: () => <div>Calculations Panel</div>,
    category: 'Analysis'
  },
  {
    id: 'ppfd-map',
    title: 'PPFD Map',
    icon: <Grid3x3 className="w-4 h-4" />,
    component: () => <div>PPFD Map</div>,
    category: 'Analysis'
  },
  {
    id: 'spectrum',
    title: 'Spectrum Analysis',
    icon: <Activity className="w-4 h-4" />,
    component: () => <div>Spectrum Analysis</div>,
    category: 'Analysis'
  },
  {
    id: 'thermal',
    title: 'Thermal Management',
    icon: <Thermometer className="w-4 h-4" />,
    component: () => <div>Thermal Management</div>,
    category: 'Environmental'
  },
  {
    id: 'plant-biology',
    title: 'Plant Biology',
    icon: <Leaf className="w-4 h-4" />,
    component: () => <div>Plant Biology</div>,
    category: 'Environmental'
  },
  {
    id: 'sensors',
    title: 'Sensor Data',
    icon: <Wifi className="w-4 h-4" />,
    component: () => <div>Sensor Data</div>,
    category: 'Monitoring'
  },
  {
    id: 'energy',
    title: 'Energy Monitor',
    icon: <Zap className="w-4 h-4" />,
    component: () => <div>Energy Monitor</div>,
    category: 'Monitoring'
  },
  {
    id: 'climate',
    title: 'Climate Control',
    icon: <Cloud className="w-4 h-4" />,
    component: () => <div>Climate Control</div>,
    category: 'Environmental'
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: <FileText className="w-4 h-4" />,
    component: () => <div>Reports</div>,
    category: 'Documentation'
  }
]

export function CustomizableSidebarSystem({ 
  availableItems = DEFAULT_SIDEBAR_ITEMS,
  onConfigChange,
  children 
}: CustomizableSidebarSystemProps) {
  const [sidebarConfigs, setSidebarConfigs] = useState<SidebarConfig[]>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vibelux-sidebar-config')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to load sidebar config:', e)
        }
      }
    }
    
    // Default configuration
    return [
      {
        id: 'left-primary',
        position: 'left',
        items: ['fixture-library', 'layers'],
        width: 280,
        isCollapsed: false,
        order: 0
      },
      {
        id: 'right-primary',
        position: 'right',
        items: ['properties', 'calculations'],
        width: 320,
        isCollapsed: false,
        order: 0
      }
    ]
  })

  const [isCustomizing, setIsCustomizing] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [draggedSidebar, setDraggedSidebar] = useState<string | null>(null)

  // Save configuration to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vibelux-sidebar-config', JSON.stringify(sidebarConfigs))
    }
    onConfigChange?.(sidebarConfigs)
  }, [sidebarConfigs, onConfigChange])

  const toggleSidebar = (sidebarId: string) => {
    setSidebarConfigs(prev => prev.map(config => 
      config.id === sidebarId 
        ? { ...config, isCollapsed: !config.isCollapsed }
        : config
    ))
  }

  const addSidebar = (position: 'left' | 'right' | 'floating') => {
    const newSidebar: SidebarConfig = {
      id: `sidebar-${Date.now()}`,
      position,
      items: [],
      width: position === 'floating' ? 320 : 280,
      isCollapsed: false,
      order: sidebarConfigs.filter(s => s.position === position).length,
      ...(position === 'floating' && { x: 100, y: 100 })
    }
    setSidebarConfigs(prev => [...prev, newSidebar])
  }

  const removeSidebar = (sidebarId: string) => {
    setSidebarConfigs(prev => prev.filter(s => s.id !== sidebarId))
  }

  const handleItemDrop = (sidebarId: string, itemId: string) => {
    setSidebarConfigs(prev => prev.map(config => {
      if (config.id === sidebarId) {
        // Remove item from other sidebars first
        const updatedConfigs = prev.map(c => ({
          ...c,
          items: c.items.filter(i => i !== itemId)
        }))
        
        // Add to target sidebar if not already there
        const targetConfig = updatedConfigs.find(c => c.id === sidebarId)!
        if (!targetConfig.items.includes(itemId)) {
          return { ...targetConfig, items: [...targetConfig.items, itemId] }
        }
      }
      return config
    }))
  }

  const removeItemFromSidebar = (sidebarId: string, itemId: string) => {
    setSidebarConfigs(prev => prev.map(config => 
      config.id === sidebarId 
        ? { ...config, items: config.items.filter(i => i !== itemId) }
        : config
    ))
  }

  const resetToDefault = () => {
    const defaultConfig: SidebarConfig[] = [
      {
        id: 'left-primary',
        position: 'left',
        items: ['fixture-library', 'layers'],
        width: 280,
        isCollapsed: false,
        order: 0
      },
      {
        id: 'right-primary',
        position: 'right',
        items: ['properties', 'calculations'],
        width: 320,
        isCollapsed: false,
        order: 0
      }
    ]
    setSidebarConfigs(defaultConfig)
  }

  const renderSidebar = (config: SidebarConfig) => {
    const items = config.items
      .map(itemId => availableItems.find(item => item.id === itemId))
      .filter(Boolean) as SidebarItem[]

    if (config.isCollapsed) {
      return (
        <div className="h-full bg-gray-900 border-gray-700 w-12 relative">
          <button
            onClick={() => toggleSidebar(config.id)}
            className={`absolute top-4 ${
              config.position === 'left' ? '-right-8' : '-left-8'
            } bg-gray-800 p-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors z-10`}
          >
            {config.position === 'left' ? (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <div className="p-2 space-y-2">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => toggleSidebar(config.id)}
                className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700 transition-colors"
                title={item.title}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div 
        className={`h-full bg-gray-900 ${
          config.position === 'left' ? 'border-r' : 'border-l'
        } border-gray-700 relative`}
        style={{ width: `${config.width}px` }}
      >
        {/* Collapse button */}
        <button
          onClick={() => toggleSidebar(config.id)}
          className={`absolute top-4 ${
            config.position === 'left' ? '-right-8' : '-left-8'
          } bg-gray-800 p-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors z-10`}
        >
          {config.position === 'left' ? (
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Customization controls */}
        {isCustomizing && (
          <div className="absolute top-0 right-0 p-2 flex gap-1 z-20">
            <button
              onClick={() => removeSidebar(config.id)}
              className="p-1 bg-red-600 hover:bg-red-700 rounded text-white"
              title="Remove sidebar"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="h-full overflow-y-auto">
          {items.length === 0 && isCustomizing ? (
            <div 
              className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 m-4 rounded-lg"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (draggedItem) {
                  handleItemDrop(config.id, draggedItem)
                  setDraggedItem(null)
                }
              }}
            >
              <div className="text-center">
                <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Drop items here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-px">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="border-b border-gray-800 last:border-0"
                  draggable={isCustomizing}
                  onDragStart={() => setDraggedItem(item.id)}
                >
                  <div className="p-3 bg-gray-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <h3 className="text-sm font-medium text-white">{item.title}</h3>
                      </div>
                      {isCustomizing && (
                        <button
                          onClick={() => removeItemFromSidebar(config.id, item.id)}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      <item.component {...(item.defaultProps || {})} />
                    </div>
                  </div>
                </div>
              ))}
              
              {isCustomizing && (
                <div
                  className="p-4 border-2 border-dashed border-gray-700 m-2 rounded-lg text-center text-gray-500"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedItem) {
                      handleItemDrop(config.id, draggedItem)
                      setDraggedItem(null)
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mx-auto mb-1" />
                  <p className="text-xs">Drop to add</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full relative flex">
      {/* Customization Mode Overlay */}
      {isCustomizing && (
        <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
      )}

      {/* Customization Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-2 flex items-center gap-2">
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
              isCustomizing 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span className="text-sm">{isCustomizing ? 'Done' : 'Customize'}</span>
          </button>

          {isCustomizing && (
            <>
              <div className="w-px h-6 bg-gray-600" />
              <button
                onClick={() => addSidebar('left')}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm"
              >
                + Left
              </button>
              <button
                onClick={() => addSidebar('right')}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm"
              >
                + Right
              </button>
              <button
                onClick={() => addSidebar('floating')}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm"
              >
                + Floating
              </button>
              <div className="w-px h-6 bg-gray-600" />
              <button
                onClick={resetToDefault}
                className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300"
                title="Reset to default"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Item Palette (shown in customization mode) */}
      {isCustomizing && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 max-w-2xl">
            <h3 className="text-sm font-medium text-white mb-3">Available Items</h3>
            <div className="grid grid-cols-4 gap-2">
              {availableItems.map(item => {
                // Check if item is already in use
                const isInUse = sidebarConfigs.some(config => 
                  config.items.includes(item.id)
                )
                
                return (
                  <div
                    key={item.id}
                    draggable={!isInUse}
                    onDragStart={() => !isInUse && setDraggedItem(item.id)}
                    className={`p-3 bg-gray-700 rounded-lg cursor-move flex flex-col items-center gap-2 ${
                      isInUse ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
                    }`}
                  >
                    {item.icon}
                    <span className="text-xs text-gray-300 text-center">{item.title}</span>
                    {isInUse && (
                      <span className="text-xs text-gray-500">In use</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebars */}
      <div className="flex">
        {sidebarConfigs
          .filter(config => config.position === 'left')
          .sort((a, b) => a.order - b.order)
          .map(config => (
            <div key={config.id} className="relative">
              {renderSidebar(config)}
            </div>
          ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {children}
        
        {/* Floating Sidebars */}
        {sidebarConfigs
          .filter(config => config.position === 'floating')
          .map(config => (
            <div
              key={config.id}
              className="absolute bg-gray-900 border border-gray-700 rounded-lg shadow-xl"
              style={{
                left: `${config.x}px`,
                top: `${config.y}px`,
                width: `${config.width}px`,
                height: '400px',
                zIndex: 20
              }}
            >
              <div className="bg-gray-800 rounded-t-lg p-2 flex items-center justify-between cursor-move">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-white">Floating Panel</span>
                </div>
                {isCustomizing && (
                  <button
                    onClick={() => removeSidebar(config.id)}
                    className="p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="h-[calc(100%-40px)] overflow-y-auto">
                {renderSidebar(config)}
              </div>
            </div>
          ))}
      </div>

      {/* Right Sidebars */}
      <div className="flex">
        {sidebarConfigs
          .filter(config => config.position === 'right')
          .sort((a, b) => a.order - b.order)
          .map(config => (
            <div key={config.id} className="relative">
              {renderSidebar(config)}
            </div>
          ))}
      </div>
    </div>
  )
}