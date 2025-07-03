"use client"
import { useState, useEffect } from 'react'
import { ChevronDown, Lightbulb } from 'lucide-react'
import { FIXTURE_STYLES, FixtureStyle } from '../utils/fixtureRenderer'
import type { Fixture } from '../context/types'

interface FixtureStyleSelectorProps {
  selectedFixture?: Fixture
  onStyleChange: (style: string) => void
}

export function FixtureStyleSelector({ selectedFixture, onStyleChange }: FixtureStyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState(selectedFixture?.style || 'led_panel')

  const handleStyleSelect = (styleKey: string) => {
    setSelectedStyle(styleKey)
    onStyleChange(styleKey)
    setIsOpen(false)
  }

  // Update selected style when fixture changes
  useEffect(() => {
    if (selectedFixture?.style) {
      setSelectedStyle(selectedFixture.style)
    }
  }, [selectedFixture?.style])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-medium text-white">Fixture Style</span>
      </div>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded border" />
            <span className="text-sm text-white">
              {FIXTURE_STYLES[selectedStyle]?.name || 'LED Panel'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
            {Object.entries(FIXTURE_STYLES).map(([key, style]) => (
              <button
                key={key}
                onClick={() => handleStyleSelect(key)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 transition-colors text-left"
              >
                <FixturePreview style={style} />
                <div>
                  <div className="text-sm font-medium text-white">{style.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{style.category.replace('_', ' ')}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {selectedFixture && (
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>PPFD:</span>
            <span>{selectedFixture.model?.ppfd || 400} μmol/m²/s</span>
          </div>
          <div className="flex justify-between">
            <span>Power:</span>
            <span>{selectedFixture.model?.wattage || 100}W</span>
          </div>
          <div className="flex justify-between">
            <span>Beam Angle:</span>
            <span>{selectedFixture.model?.beamAngle || 120}°</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Mini preview component for fixture styles
function FixturePreview({ style }: { style: FixtureStyle }) {
  return (
    <div className="w-8 h-6 bg-gray-900 rounded border border-gray-600 flex items-center justify-center">
      <svg width="24" height="16" viewBox="0 0 24 16">
        {style.category === 'led_panel' && (
          <rect x="2" y="2" width="20" height="12" fill="#c0c0c0" stroke="#888" strokeWidth="0.5" />
        )}
        {style.category === 'led_strip' && (
          <rect x="1" y="6" width="22" height="4" fill="#2a2a2a" rx="2" />
        )}
        {style.category === 'high_bay' && (
          <circle cx="12" cy="8" r="6" fill="#404040" stroke="#888" strokeWidth="0.5" />
        )}
        {style.category === 'pendant' && (
          <>
            <line x1="12" y1="0" x2="12" y2="4" stroke="#333" strokeWidth="1" />
            <circle cx="12" cy="8" r="4" fill="#e5e5e5" stroke="#999" strokeWidth="0.5" />
          </>
        )}
        {style.category === 'track' && (
          <>
            <rect x="2" y="6" width="20" height="2" fill="#404040" />
            <circle cx="8" cy="10" r="2" fill="#2a2a2a" />
            <circle cx="16" cy="10" r="2" fill="#2a2a2a" />
          </>
        )}
        {style.category === 'flood' && (
          <rect x="4" y="4" width="16" height="8" fill="#2a2a2a" stroke="#666" strokeWidth="0.5" />
        )}
      </svg>
    </div>
  )
}