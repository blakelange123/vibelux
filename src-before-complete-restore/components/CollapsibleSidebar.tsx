"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

export interface SidebarSection {
  id: string
  title: string
  icon: React.ReactNode
  component: React.ReactNode
  category: 'analysis' | 'optimization' | 'monitoring' | 'advanced'
  enabled?: boolean
}

interface CollapsibleSidebarProps {
  sections: SidebarSection[]
  onSectionToggle?: (sectionId: string, enabled: boolean) => void
  width?: number
}

export function CollapsibleSidebar({ sections, onSectionToggle, width = 400 }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const categories = [
    { id: 'all', label: 'All Features', color: 'gray' },
    { id: 'analysis', label: 'Analysis', color: 'blue' },
    { id: 'optimization', label: 'Optimization', color: 'green' },
    { id: 'monitoring', label: 'Monitoring', color: 'yellow' },
    { id: 'advanced', label: 'Advanced', color: 'purple' }
  ]

  const filteredSections = sections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const enabledSections = sections.filter(s => s.enabled)

  if (isCollapsed) {
    return (
      <div className="bg-gray-900 border-l border-gray-700 relative">
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute -left-8 top-4 bg-gray-800 p-2 rounded-l-lg border border-gray-700 border-r-0 hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
        <div className="p-2 space-y-2">
          {enabledSections.map(section => (
            <button
              key={section.id}
              onClick={() => {
                setIsCollapsed(false)
                toggleSection(section.id)
              }}
              className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
              title={section.title}
            >
              <div className="text-gray-400">{section.icon}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900 border-l border-gray-700 relative transition-all duration-300`} style={{ width: `${width}px` }}>
      <button
        onClick={() => setIsCollapsed(true)}
        className="absolute -left-8 top-4 bg-gray-800 p-2 rounded-l-lg border border-gray-700 border-r-0 hover:bg-gray-700 transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </button>

      <div className="p-4 space-y-4 h-full overflow-y-auto">
        {/* Header */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Features & Tools</h3>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  selectedCategory === cat.id
                    ? `bg-${cat.color}-600 text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-2">
          {filteredSections.map(section => (
            <div key={section.id} className="bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">{section.icon}</div>
                  <span className="text-sm font-medium text-white">{section.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={section.enabled || false}
                    onChange={(e) => {
                      e.stopPropagation()
                      onSectionToggle?.(section.id, e.target.checked)
                    }}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ChevronRight 
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedSections.has(section.id) ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {expandedSections.has(section.id) && section.enabled && (
                <div className="border-t border-gray-700 p-3">
                  {section.component}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">No features found</p>
          </div>
        )}
      </div>
    </div>
  )
}