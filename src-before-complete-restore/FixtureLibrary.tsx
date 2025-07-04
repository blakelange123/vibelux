"use client"

import { useState, useEffect } from 'react'
import { Search, Filter, ChevronRight, FileText, Download } from 'lucide-react'
import { dlcFixturesParser } from '@/lib/dlc-fixtures-parser'
import type { ParsedIESFile } from '@/lib/ies-parser'
import type { IESPhotometry } from '@/lib/ies-generator'

export interface FixtureModel {
  id: string
  brand: string
  model: string
  category: string
  wattage: number
  ppf: number
  efficacy: number
  spectrum: string
  spectrumData: {
    blue: number      // 400-500nm percentage
    green: number     // 500-600nm percentage
    red: number       // 600-700nm percentage
    farRed: number    // 700-800nm percentage
  }
  coverage: number
  price?: number
  image?: string
  voltage?: string
  dimmable?: boolean
  warranty?: number
  customIES?: {
    parsedData: ParsedIESFile
    photometry: IESPhotometry
  }
  dlcData?: any // DLC specific data
}

const fixtureDatabase: FixtureModel[] = [
  {
    id: 'fl-001',
    brand: 'Fluence',
    model: 'SPYDR 2p',
    category: 'LED Bar',
    wattage: 645,
    ppf: 1700,
    efficacy: 2.6,
    spectrum: 'Full Spectrum',
    spectrumData: {
      blue: 18,
      green: 8,
      red: 68,
      farRed: 6
    },
    coverage: 16
  },
  {
    id: 'fl-002',
    brand: 'Gavita',
    model: 'Pro 1700e LED',
    category: 'LED Panel',
    wattage: 645,
    ppf: 1700,
    efficacy: 2.6,
    spectrum: 'Full Spectrum',
    spectrumData: {
      blue: 20,
      green: 10,
      red: 65,
      farRed: 5
    },
    coverage: 20
  },
  {
    id: 'fl-003',
    brand: 'California Lightworks',
    model: 'MegaDrive 1000',
    category: 'LED Panel',
    wattage: 1000,
    ppf: 2200,
    efficacy: 2.2,
    spectrum: 'Variable Spectrum',
    spectrumData: {
      blue: 22,
      green: 12,
      red: 60,
      farRed: 6
    },
    coverage: 25
  },
  {
    id: 'fl-004',
    brand: 'Black Dog',
    model: 'PhytoMAX-2 1000',
    category: 'LED Panel',
    wattage: 1050,
    ppf: 2150,
    efficacy: 2.05,
    spectrum: 'Full Spectrum',
    spectrumData: {
      blue: 25,
      green: 15,
      red: 55,
      farRed: 5
    },
    coverage: 25
  },
  {
    id: 'fl-005',
    brand: 'ChilLED',
    model: 'X6 600W',
    category: 'LED Bar',
    wattage: 600,
    ppf: 1620,
    efficacy: 2.7,
    spectrum: 'Full Spectrum',
    spectrumData: {
      blue: 19,
      green: 9,
      red: 67,
      farRed: 5
    },
    coverage: 16
  },
  {
    id: 'fl-006',
    brand: 'Mars Hydro',
    model: 'FC-E6500',
    category: 'LED Bar',
    wattage: 650,
    ppf: 1711,
    efficacy: 2.6,
    spectrum: 'Full Spectrum',
    spectrumData: {
      blue: 17,
      green: 7,
      red: 70,
      farRed: 6
    },
    coverage: 20
  },
  {
    id: 'fl-007',
    brand: 'Spider Farmer',
    model: 'SF7000',
    category: 'LED Bar',
    wattage: 650,
    ppf: 1676,
    efficacy: 2.58,
    spectrum: 'Full Spectrum',
    spectrumData: {
      blue: 21,
      green: 11,
      red: 63,
      farRed: 5
    },
    coverage: 20
  },
  {
    id: 'fl-008',
    brand: 'Growers Choice',
    model: 'ROI-E720',
    category: 'LED Bar',
    wattage: 720,
    ppf: 1944,
    efficacy: 2.7,
    spectrum: 'Full Spectrum',
    spectrumData: {
      blue: 18,
      green: 8,
      red: 69,
      farRed: 5
    },
    coverage: 20
  },
  {
    id: 'fl-009',
    brand: 'Signify',
    model: 'GreenPower LED TL',
    category: 'LED Bar',
    wattage: 320,
    ppf: 850,
    efficacy: 2.65,
    spectrum: 'Red/Blue',
    spectrumData: {
      blue: 15,
      green: 5,
      red: 75,
      farRed: 5
    },
    coverage: 12
  },
  {
    id: 'fl-010',
    brand: 'Heliospectra',
    model: 'MITRA X60',
    category: 'LED Panel',
    wattage: 600,
    ppf: 1550,
    efficacy: 2.58,
    spectrum: 'Adjustable',
    spectrumData: {
      blue: 20,
      green: 10,
      red: 65,
      farRed: 5
    },
    coverage: 16
  },
  {
    id: 'fl-011',
    brand: 'Lumigrow',
    model: 'TopLight 634',
    category: 'LED Panel',
    wattage: 634,
    ppf: 1650,
    efficacy: 2.6,
    spectrum: 'Full Spectrum',
    spectrumData: {
      blue: 18,
      green: 12,
      red: 64,
      farRed: 6
    },
    coverage: 18
  },
  {
    id: 'fl-012',
    brand: 'Thrive Agritech',
    model: 'Pinnacle 1000',
    category: 'LED Panel',
    wattage: 1000,
    ppf: 2750,
    efficacy: 2.75,
    spectrum: 'Full Spectrum',
    spectrumData: {
      blue: 19,
      green: 9,
      red: 66,
      farRed: 6
    },
    coverage: 25
  },
  {
    id: 'fl-013',
    brand: 'Fohse',
    model: 'A3i',
    category: 'LED Panel',
    wattage: 1500,
    ppf: 4200,
    efficacy: 2.8,
    spectrum: 'Full Spectrum',
    spectrumData: {
      blue: 18,
      green: 8,
      red: 68,
      farRed: 6
    },
    coverage: 30
  },
  {
    id: 'fl-014',
    brand: 'TSRgrow',
    model: 'TOTALgrow TG-1000',
    category: 'LED Bar',
    wattage: 320,
    ppf: 864,
    efficacy: 2.7,
    spectrum: 'Broad Spectrum',
    spectrumData: {
      blue: 20,
      green: 15,
      red: 60,
      farRed: 5
    },
    coverage: 10
  },
  {
    id: 'fl-015',
    brand: 'P.L. Light Systems',
    model: 'HortiLED Top 1000',
    category: 'LED Panel',
    wattage: 1000,
    ppf: 2700,
    efficacy: 2.7,
    spectrum: 'Broad Spectrum',
    spectrumData: {
      blue: 17,
      green: 10,
      red: 67,
      farRed: 6
    },
    coverage: 24
  },
  {
    id: 'fl-016',
    brand: 'Osram',
    model: 'Zelion HL300',
    category: 'LED Bar',
    wattage: 300,
    ppf: 810,
    efficacy: 2.7,
    spectrum: 'Full Spectrum',
    spectrumData: {
      blue: 20,
      green: 8,
      red: 66,
      farRed: 6
    },
    coverage: 10
  },
  {
    id: 'fl-017',
    brand: 'Valoya',
    model: 'RX-GH 500',
    category: 'LED Panel',
    wattage: 500,
    ppf: 1375,
    efficacy: 2.75,
    spectrum: 'NS1 Spectrum',
    spectrumData: {
      blue: 16,
      green: 12,
      red: 65,
      farRed: 7
    },
    coverage: 15
  },
  {
    id: 'fl-018',
    brand: 'NextLight',
    model: 'Mega Pro',
    category: 'LED Panel',
    wattage: 640,
    ppf: 1696,
    efficacy: 2.65,
    spectrum: 'Full Spectrum',
    spectrumData: {
      blue: 19,
      green: 11,
      red: 64,
      farRed: 6
    },
    coverage: 20
  },
  {
    id: 'fl-019',
    brand: 'Illumitex',
    model: 'PowerHarvest X600',
    category: 'LED Bar',
    wattage: 600,
    ppf: 1620,
    efficacy: 2.7,
    spectrum: 'Variable',
    spectrumData: {
      blue: 18,
      green: 10,
      red: 66,
      farRed: 6
    },
    coverage: 18
  },
  {
    id: 'fl-020',
    brand: 'Lighting Science',
    model: 'VividGro V2',
    category: 'LED Panel',
    wattage: 200,
    ppf: 520,
    efficacy: 2.6,
    spectrum: 'Balanced',
    spectrumData: {
      blue: 22,
      green: 13,
      red: 60,
      farRed: 5
    },
    coverage: 6
  }
]

interface FixtureLibraryProps {
  onSelectFixture: (fixture: FixtureModel) => void
  selectedFixtureId?: string
  customFixtures?: FixtureModel[]
}

export function FixtureLibrary({ onSelectFixture, selectedFixtureId, customFixtures = [] }: FixtureLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [dlcFixtures, setDlcFixtures] = useState<FixtureModel[]>([])
  const [isLoadingDLC, setIsLoadingDLC] = useState(false)
  const [dlcLoadError, setDlcLoadError] = useState<string | null>(null)

  // Load DLC fixtures on mount (only on client side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadDLCFixtures();
    }
  }, []);

  const loadDLCFixtures = async () => {
    setIsLoadingDLC(true);
    setDlcLoadError(null);
    try {
      // Load from public directory
      const response = await fetch('/dlc_hort_full_2025-05-29.csv');
      if (!response.ok) {
        // Silently fail if file doesn't exist - DLC fixtures are optional
        console.log('DLC fixtures file not found, using default fixtures only');
        return;
      }
      const csvText = await response.text();
      await dlcFixturesParser.parseCSV(csvText);
      const fixtures = dlcFixturesParser.getFixtureModels();
      setDlcFixtures(fixtures);
      console.log(`Loaded ${fixtures.length} DLC qualified fixtures`);
    } catch (error: any) {
      console.error('Error loading DLC fixtures:', error);
      // Don't show error to user if it's just a missing file
      if (!error.message?.includes('404')) {
        setDlcLoadError('DLC fixtures unavailable');
      }
    } finally {
      setIsLoadingDLC(false);
    }
  };

  const allFixtures = [...fixtureDatabase, ...customFixtures, ...dlcFixtures]
  const categories = ['all', ...Array.from(new Set(allFixtures.map(f => f.category)))]

  const filteredFixtures = allFixtures.filter(fixture => {
    const matchesSearch = fixture.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fixture.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || fixture.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Show fixtures if expanded or if there's a search term
  const shouldShowFixtures = isExpanded || searchTerm.length > 0

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-700" style={{ backgroundColor: '#1f2937' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">Fixture Library</h3>
            {dlcFixtures.length > 0 && (
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                {dlcFixtures.length} DLC
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
        
        {/* DLC Loading Status */}
        {isLoadingDLC && (
          <div className="mb-3 p-2 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
              Loading DLC qualified fixtures...
            </div>
          </div>
        )}
        
        {dlcLoadError && (
          <div className="mb-3 p-2 bg-red-900/20 border border-red-700/50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-400">{dlcLoadError}</p>
              <button
                onClick={loadDLCFixtures}
                className="text-xs text-red-300 hover:text-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Type to search luminaires..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20" style={{ backgroundColor: '#111827' }}
          />
        </div>

        {/* Show expanded state hint when collapsed */}
        {!shouldShowFixtures && (
          <div className="text-center text-gray-500 text-xs">
            Type to search or click arrow to browse all fixtures
          </div>
        )}

        {/* Filters - only show when expanded or searching */}
        {shouldShowFixtures && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronRight className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
          </button>
        )}

        {shouldShowFixtures && showFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Only show fixture list when expanded or searching */}
      {shouldShowFixtures && (
        <>
          {/* Selected Fixture Indicator */}
          {selectedFixtureId && (
            <div className="px-4 py-2 bg-purple-900/30 border-b border-purple-700/50">
              <p className="text-xs text-purple-300">
                ✓ Selected - Click on canvas to place fixture
              </p>
            </div>
          )}

          {/* Fixture List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar" style={{ backgroundColor: '#030712' }}>
            {filteredFixtures.map(fixture => (
          <button
            key={fixture.id}
            onClick={() => onSelectFixture(fixture)}
            className={`w-full px-3 py-2 border-b transition-all text-left ${
              selectedFixtureId === fixture.id ? 'border-l-4 border-l-purple-500' : ''
            }`}
            style={{
              backgroundColor: selectedFixtureId === fixture.id ? 'rgba(88, 28, 135, 0.4)' : '#111827',
              borderBottomColor: '#374151'
            }}
            onMouseEnter={(e) => {
              if (selectedFixtureId !== fixture.id) {
                e.currentTarget.style.backgroundColor = '#1f2937'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedFixtureId !== fixture.id) {
                e.currentTarget.style.backgroundColor = '#111827'
              }
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate" style={{ color: '#f3f4f6' }}>{fixture.brand} {fixture.model}</span>
                  {fixture.customIES && (
                    <span className="text-xs text-blue-400">IES</span>
                  )}
                  {fixture.dlcData && (
                    <span className="text-xs text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">DLC</span>
                  )}
                </div>
                <div className="flex gap-4 text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                  <span>{fixture.wattage}W</span>
                  <span>{fixture.ppf} PPF</span>
                  <span>{fixture.efficacy} μmol/J</span>
                </div>
              </div>
              <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} />
            </div>
          </button>
        ))}

            {filteredFixtures.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <p>No fixtures found matching your criteria.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}