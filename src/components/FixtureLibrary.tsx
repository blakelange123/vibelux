"use client"

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  ChevronRight, 
  FileText, 
  Download, 
  X, 
  SlidersHorizontal,
  Grid3X3,
  List,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  DollarSign,
  Target
} from 'lucide-react'
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
  cct?: number // Correlated Color Temperature in Kelvin
  customIES?: {
    parsedData: ParsedIESFile
    photometry: IESPhotometry
  }
  dlcData?: any // DLC specific data
}

interface FilterOptions {
  wattageRange: [number, number]
  ppfRange: [number, number]
  efficacyRange: [number, number]
  priceRange: [number, number]
  dimmable: 'all' | 'yes' | 'no'
  voltage: string[]
  spectrumTypes: string[]
}

interface SortOption {
  key: keyof FixtureModel
  label: string
  direction: 'asc' | 'desc'
}

interface FixtureLibraryProps {
  onSelectFixture?: (fixture: FixtureModel) => void
  selectedFixtureId?: string
  showDetails?: boolean
  customFilter?: (fixtures: FixtureModel[]) => FixtureModel[]
}

export function FixtureLibrary({ 
  onSelectFixture, 
  selectedFixtureId,
  showDetails = true,
  customFilter
}: FixtureLibraryProps) {
  const [fixtures, setFixtures] = useState<FixtureModel[]>([])
  const [filteredFixtures, setFilteredFixtures] = useState<FixtureModel[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [sortBy, setSortBy] = useState<SortOption>({ key: 'efficacy', label: 'Efficacy', direction: 'desc' })
  
  // Advanced filter state
  const [filters, setFilters] = useState<FilterOptions>({
    wattageRange: [0, 1000],
    ppfRange: [0, 3000],
    efficacyRange: [0, 4],
    priceRange: [0, 5000],
    dimmable: 'all',
    voltage: [],
    spectrumTypes: []
  })
  
  // Calculate filter ranges from fixtures
  const [filterRanges, setFilterRanges] = useState({
    wattageRange: [0, 1000],
    ppfRange: [0, 3000],
    efficacyRange: [0, 4],
    priceRange: [0, 5000]
  })

  // Load DLC fixtures on mount
  useEffect(() => {
    const loadDLCFixtures = async () => {
      try {
        setIsLoading(true)
        
        // Load fixtures from API
        const response = await fetch('/api/fixtures?limit=1000')
        const data = await response.json()
        
        let loadedFixtures: FixtureModel[] = []
        
        if (data.fixtures && data.fixtures.length > 0) {
          // Convert API fixtures to FixtureModel format
          loadedFixtures = data.fixtures.map((f: any) => {
            // Calculate spectrum data
            const totalFlux = (f.blueFlux || 0) + (f.greenFlux || 0) + 
                             (f.redFlux || 0) + (f.farRedFlux || 0)
            
            let spectrumData = {
              blue: 20,   // Default values if no spectrum data
              green: 10,
              red: 65,
              farRed: 5
            }
            
            if (totalFlux > 0) {
              spectrumData = {
                blue: Math.round(((f.blueFlux || 0) / totalFlux) * 100),
                green: Math.round(((f.greenFlux || 0) / totalFlux) * 100),
                red: Math.round(((f.redFlux || 0) / totalFlux) * 100),
                farRed: Math.round(((f.farRedFlux || 0) / totalFlux) * 100)
              }
            }
            
            // Categorize spectrum
            let spectrum = 'Full Spectrum'
            if (spectrumData.red > 70) spectrum = 'Flowering'
            else if (spectrumData.blue > 30) spectrum = 'Vegetative'
            else if (spectrumData.farRed > 5) spectrum = 'Full Spectrum + Far Red'
            
            return {
              id: `dlc-${f.id}`,
              brand: f.brand || f.manufacturer,
              model: f.modelNumber,
              category: f.category || 'DLC Qualified',
              wattage: f.reportedWattage,
              ppf: f.reportedPPF,
              efficacy: f.reportedPPE,
              spectrum,
              spectrumData,
              coverage: Math.round(f.reportedPPF / 125), // Estimate coverage
              price: undefined, // No price data available
              voltage: f.minVoltage && f.maxVoltage ? `${f.minVoltage}-${f.maxVoltage}V` : '120-277V',
              dimmable: f.dimmable,
              warranty: f.warranty,
              dlcData: f
            } as FixtureModel
          })
        } else {
          // Fallback to sample fixtures if API fails
          loadedFixtures = getSampleFixtures()
        }
        
        setFixtures(loadedFixtures)
        setFilteredFixtures(loadedFixtures)
        
        // Calculate filter ranges based on loaded fixtures
        const wattages = loadedFixtures.map(f => f.wattage)
        const ppfs = loadedFixtures.map(f => f.ppf)
        const efficacies = loadedFixtures.map(f => f.efficacy)
        const prices = loadedFixtures.map(f => f.price || 0).filter(p => p > 0)
        
        const newRanges = {
          wattageRange: [Math.min(...wattages), Math.max(...wattages)] as [number, number],
          ppfRange: [Math.min(...ppfs), Math.max(...ppfs)] as [number, number],
          efficacyRange: [Math.min(...efficacies), Math.max(...efficacies)] as [number, number],
          priceRange: prices.length > 0 ? [Math.min(...prices), Math.max(...prices)] as [number, number] : [0, 5000] as [number, number]
        }
        
        setFilterRanges(newRanges)
        setFilters({
          wattageRange: newRanges.wattageRange,
          ppfRange: newRanges.ppfRange,
          efficacyRange: newRanges.efficacyRange,
          priceRange: newRanges.priceRange,
          dimmable: 'all',
          voltage: [],
          spectrumTypes: []
        })
        
      } catch (err) {
        console.error('Error loading DLC fixtures:', err)
        setError('Failed to load DLC fixtures. Using sample data.')
        // Use sample fixtures as fallback
        const sampleFixtures = getSampleFixtures()
        setFixtures(sampleFixtures)
        setFilteredFixtures(sampleFixtures)
      } finally {
        setIsLoading(false)
      }
    }

    loadDLCFixtures()
  }, [])

  // Advanced filtering and sorting
  useEffect(() => {
    let filtered = fixtures

    // Apply custom filter if provided
    if (customFilter) {
      filtered = customFilter(filtered)
    } else {
      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(f => 
          f.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.spectrum.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // Category filter
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(f => f.category === selectedCategory)
      }

      // Advanced filters
      filtered = filtered.filter(f => {
        // Wattage range
        if (f.wattage < filters.wattageRange[0] || f.wattage > filters.wattageRange[1]) return false
        
        // PPF range
        if (f.ppf < filters.ppfRange[0] || f.ppf > filters.ppfRange[1]) return false
        
        // Efficacy range
        if (f.efficacy < filters.efficacyRange[0] || f.efficacy > filters.efficacyRange[1]) return false
        
        // Price range (if price is available)
        if (f.price && (f.price < filters.priceRange[0] || f.price > filters.priceRange[1])) return false
        
        // Dimmable filter
        if (filters.dimmable === 'yes' && !f.dimmable) return false
        if (filters.dimmable === 'no' && f.dimmable) return false
        
        // Voltage filter
        if (filters.voltage.length > 0 && f.voltage && !filters.voltage.includes(f.voltage)) return false
        
        // Spectrum types filter
        if (filters.spectrumTypes.length > 0 && !filters.spectrumTypes.includes(f.spectrum)) return false
        
        return true
      })

      // Sorting
      filtered.sort((a, b) => {
        const aVal = a[sortBy.key]
        const bVal = b[sortBy.key]
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortBy.direction === 'asc' ? aVal - bVal : bVal - aVal
        }
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortBy.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        
        return 0
      })
    }

    setFilteredFixtures(filtered)
  }, [searchTerm, selectedCategory, fixtures, filters, sortBy, customFilter])

  const categories = ['all', ...Array.from(new Set(fixtures.map(f => f.category)))]
  const spectrumTypes = Array.from(new Set(fixtures.map(f => f.spectrum)))
  const voltageTypes = Array.from(new Set(fixtures.map(f => f.voltage).filter(Boolean)))
  
  const sortOptions: SortOption[] = [
    { key: 'efficacy', label: 'Efficacy (PPE)', direction: 'desc' },
    { key: 'wattage', label: 'Wattage', direction: 'asc' },
    { key: 'ppf', label: 'PPF', direction: 'desc' },
    { key: 'price', label: 'Price', direction: 'asc' },
    { key: 'brand', label: 'Brand', direction: 'asc' }
  ]
  
  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setFilters({
      wattageRange: filterRanges.wattageRange as [number, number],
      ppfRange: filterRanges.ppfRange as [number, number],
      efficacyRange: filterRanges.efficacyRange as [number, number],
      priceRange: filterRanges.priceRange as [number, number],
      dimmable: 'all',
      voltage: [],
      spectrumTypes: []
    })
  }
  
  const hasActiveFilters = () => {
    return searchTerm !== '' ||
           selectedCategory !== 'all' ||
           filters.wattageRange[0] !== filterRanges.wattageRange[0] ||
           filters.wattageRange[1] !== filterRanges.wattageRange[1] ||
           filters.ppfRange[0] !== filterRanges.ppfRange[0] ||
           filters.ppfRange[1] !== filterRanges.ppfRange[1] ||
           filters.efficacyRange[0] !== filterRanges.efficacyRange[0] ||
           filters.efficacyRange[1] !== filterRanges.efficacyRange[1] ||
           filters.dimmable !== 'all' ||
           filters.voltage.length > 0 ||
           filters.spectrumTypes.length > 0
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <p className="text-gray-400 mt-2">Loading DLC fixtures...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={customFilter ? "" : "bg-gray-800/50 rounded-xl p-4 border border-gray-700"}>
      {/* Header - only show if not using custom filter */}
      {!customFilter && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            DLC Fixture Library
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {viewMode === 'list' ? <Grid3X3 className="w-4 h-4 text-gray-300" /> : <List className="w-4 h-4 text-gray-300" />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                showFilters ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {hasActiveFilters() && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-700 rounded-lg">
          <p className="text-yellow-400 text-xs">{error}</p>
        </div>
      )}
      
      {/* Search and Sort - only show if not using custom filter */}
      {!customFilter && (
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search fixtures, brands, models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
          <select
            value={`${sortBy.key}-${sortBy.direction}`}
            onChange={(e) => {
              const [key, direction] = e.target.value.split('-')
              const option = sortOptions.find(opt => opt.key === key && opt.direction === direction)
              if (option) setSortBy(option)
            }}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
          >
            {sortOptions.map(option => (
              <option key={`${option.key}-${option.direction}`} value={`${option.key}-${option.direction}`}>
                {option.label} {option.direction === 'asc' ? '↑' : '↓'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quick Category Filter - only show if not using custom filter */}
      {!customFilter && (
        <div className="flex flex-wrap gap-1 mb-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filters Panel - only show if not using custom filter */}
      {showFilters && !customFilter && (
        <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium text-sm">Advanced Filters</h4>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="px-2 py-1 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Wattage Range */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Wattage: {filters.wattageRange[0]}W - {filters.wattageRange[1]}W</label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min={filterRanges.wattageRange[0]}
                  max={filterRanges.wattageRange[1]}
                  value={filters.wattageRange[0]}
                  onChange={(e) => setFilters({...filters, wattageRange: [Number(e.target.value), filters.wattageRange[1]]})}
                  className="flex-1"
                />
                <input
                  type="range"
                  min={filterRanges.wattageRange[0]}
                  max={filterRanges.wattageRange[1]}
                  value={filters.wattageRange[1]}
                  onChange={(e) => setFilters({...filters, wattageRange: [filters.wattageRange[0], Number(e.target.value)]})}
                  className="flex-1"
                />
              </div>
            </div>

            {/* PPF Range */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">PPF: {filters.ppfRange[0]} - {filters.ppfRange[1]} μmol/s</label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min={filterRanges.ppfRange[0]}
                  max={filterRanges.ppfRange[1]}
                  value={filters.ppfRange[0]}
                  onChange={(e) => setFilters({...filters, ppfRange: [Number(e.target.value), filters.ppfRange[1]]})}
                  className="flex-1"
                />
                <input
                  type="range"
                  min={filterRanges.ppfRange[0]}
                  max={filterRanges.ppfRange[1]}
                  value={filters.ppfRange[1]}
                  onChange={(e) => setFilters({...filters, ppfRange: [filters.ppfRange[0], Number(e.target.value)]})}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Efficacy Range */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Efficacy: {filters.efficacyRange[0].toFixed(1)} - {filters.efficacyRange[1].toFixed(1)} μmol/J</label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min={filterRanges.efficacyRange[0]}
                  max={filterRanges.efficacyRange[1]}
                  step="0.1"
                  value={filters.efficacyRange[0]}
                  onChange={(e) => setFilters({...filters, efficacyRange: [Number(e.target.value), filters.efficacyRange[1]]})}
                  className="flex-1"
                />
                <input
                  type="range"
                  min={filterRanges.efficacyRange[0]}
                  max={filterRanges.efficacyRange[1]}
                  step="0.1"
                  value={filters.efficacyRange[1]}
                  onChange={(e) => setFilters({...filters, efficacyRange: [filters.efficacyRange[0], Number(e.target.value)]})}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Dimmable Filter */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Dimmable</label>
              <select
                value={filters.dimmable}
                onChange={(e) => setFilters({...filters, dimmable: e.target.value as 'all' | 'yes' | 'no'})}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
              >
                <option value="all">All</option>
                <option value="yes">Dimmable Only</option>
                <option value="no">Non-Dimmable Only</option>
              </select>
            </div>

            {/* Spectrum Types */}
            {spectrumTypes.length > 0 && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Spectrum Types</label>
                <div className="flex flex-wrap gap-1">
                  {spectrumTypes.map(spectrum => (
                    <button
                      key={spectrum}
                      onClick={() => {
                        const newTypes = filters.spectrumTypes.includes(spectrum)
                          ? filters.spectrumTypes.filter(s => s !== spectrum)
                          : [...filters.spectrumTypes, spectrum]
                        setFilters({...filters, spectrumTypes: newTypes})
                      }}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        filters.spectrumTypes.includes(spectrum)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {spectrum}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="text-gray-400">
          {filteredFixtures.length} of {fixtures.length} fixtures
        </span>
        {hasActiveFilters() && (
          <span className="text-orange-400 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filtered
          </span>
        )}
      </div>

      {/* Fixture List/Grid */}
      <div className={`max-h-96 overflow-y-auto ${
        viewMode === 'grid' 
          ? 'grid grid-cols-2 gap-2' 
          : 'space-y-2'
      }`}>
        {filteredFixtures.map((fixture) => (
          <div
            key={fixture.id}
            onClick={() => onSelectFixture?.(fixture)}
            className={`p-3 bg-gray-900/50 rounded-lg border transition-all cursor-pointer ${
              selectedFixtureId === fixture.id
                ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{fixture.brand}</h4>
                <p className="text-gray-400 text-xs">{fixture.model}</p>
                <p className="text-gray-500 text-xs">{fixture.spectrum}</p>
                {showDetails && (
                  <div className={`mt-2 text-xs ${viewMode === 'grid' ? 'space-y-1' : 'grid grid-cols-3 gap-2'}`}>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span className="text-gray-300">{fixture.wattage}W</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-green-500" />
                      <span className="text-gray-300">{fixture.ppf} PPF</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-blue-500" />
                      <span className="text-gray-300">{fixture.efficacy.toFixed(1)} PPE</span>
                    </div>
                    {/* Display fixture dimensions if available */}
                    {(fixture.dlcData?.width || fixture.dlcData?.length || fixture.dimensions) && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" />
                          <path d="M9 9h6v6h-6z"/>
                        </svg>
                        <span className="text-gray-300">
                          {fixture.dlcData?.width ? `${Math.round(fixture.dlcData.width)}"` : 
                           fixture.dimensions?.width ? `${Math.round(fixture.dimensions.width * 12)}"` : '24"'} ×{' '}
                          {fixture.dlcData?.length ? `${Math.round(fixture.dlcData.length)}"` :
                           fixture.dimensions?.length ? `${Math.round(fixture.dimensions.length * 12)}"` : '48"'}
                        </span>
                      </div>
                    )}
                    {fixture.price && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-purple-500" />
                        <span className="text-gray-300">${fixture.price}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                selectedFixtureId === fixture.id ? 'rotate-90 text-purple-400' : 'text-gray-600'
              }`} />
            </div>
          </div>
        ))}
      </div>

      {filteredFixtures.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No fixtures match your criteria</p>
          <button
            onClick={clearAllFilters}
            className="mt-2 px-3 py-1 text-purple-400 hover:text-purple-300 text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {!customFilter && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            DLC Qualified Products • {filteredFixtures.length} results
          </p>
        </div>
      )}
    </div>
  )
}

// Sample fixtures as fallback
function getSampleFixtures(): FixtureModel[] {
  return [
    {
      id: 'sample-1',
      brand: 'Fluence',
      model: 'SPYDR 2p',
      category: 'LED Bar',
      wattage: 645,
      ppf: 1700,
      efficacy: 2.64,
      spectrum: 'Full Spectrum',
      spectrumData: {
        blue: 18,
        green: 8,
        red: 66,
        farRed: 8
      },
      coverage: 16
    },
    {
      id: 'sample-2',
      brand: 'Gavita',
      model: 'Pro 1700e LED',
      category: 'LED Panel',
      wattage: 645,
      ppf: 1700,
      efficacy: 2.64,
      spectrum: 'Full Spectrum',
      spectrumData: {
        blue: 15,
        green: 10,
        red: 65,
        farRed: 10
      },
      coverage: 16
    },
    {
      id: 'sample-3',
      brand: 'Growers Choice',
      model: 'ROI-E680',
      category: 'LED Bar',
      wattage: 680,
      ppf: 1836,
      efficacy: 2.7,
      spectrum: 'Full Spectrum',
      spectrumData: {
        blue: 20,
        green: 12,
        red: 62,
        farRed: 6
      },
      coverage: 16
    }
  ]
}