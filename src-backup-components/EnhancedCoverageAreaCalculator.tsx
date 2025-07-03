"use client"

import { useState, useEffect } from 'react'
import { 
  Grid3x3, 
  Lightbulb, 
  Square, 
  Circle,
  Pentagon,
  Ruler,
  Target,
  AlertCircle,
  CheckCircle,
  Maximize,
  Search,
  Filter,
  Database,
  Zap,
  TrendingUp,
  Shield,
  Calendar
} from 'lucide-react'
import { dlcFixturesParser } from '@/lib/dlc-fixtures-parser'
import type { FixtureModel } from '@/components/FixtureLibrary'
import { CoverageVisualization } from '@/components/CoverageVisualization'

interface PhotometricData {
  ppf: number
  beamAngle: number
  recommendedHeight: number
  price: number
  efficacy: number
  wattage: number
  brand: string
  model: string
  dlcQualified: boolean
  dateQualified?: string
}

export function EnhancedCoverageAreaCalculator() {
  // Primary calculation method
  const [calculationMethod, setCalculationMethod] = useState<'ppfd-first' | 'room-first' | 'budget-first'>('ppfd-first')
  
  // Room configuration
  const [roomWidth, setRoomWidth] = useState(20) // feet
  const [roomLength, setRoomLength] = useState(20) // feet
  const [roomShape, setRoomShape] = useState<'rectangle' | 'square' | 'circle'>('rectangle')
  const [aisleSpace, setAisleSpace] = useState(3) // feet
  const [mountingHeight, setMountingHeight] = useState(3) // feet
  
  // PPFD-first inputs (primary method)
  const [targetPPFD, setTargetPPFD] = useState(600) // μmol/m²/s
  const [cropType, setCropType] = useState('leafy-greens') // influences PPFD recommendations
  const [growthStage, setGrowthStage] = useState('flowering') // influences PPFD recommendations
  
  // Budget-first inputs
  const [totalBudget, setTotalBudget] = useState(10000)
  const [installationBudget, setInstallationBudget] = useState(2000)
  
  // Advanced settings
  const [selectedFixtureId, setSelectedFixtureId] = useState('dlc-default')
  const [overlapPercentage, setOverlapPercentage] = useState(20) // %
  const [uniformityTarget, setUniformityTarget] = useState(0.8) // 80%
  const [photoperiod, setPhotoperiod] = useState(12) // hours per day
  
  // DLC Fixtures state
  const [dlcFixtures, setDlcFixtures] = useState<FixtureModel[]>([])
  const [isLoadingDLC, setIsLoadingDLC] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBrand, setFilterBrand] = useState('all')
  const [filterWattageMin, setFilterWattageMin] = useState(0)
  const [filterWattageMax, setFilterWattageMax] = useState(2000)
  const [showDLCOnly, setShowDLCOnly] = useState(true)
  
  // Load DLC fixtures on mount
  useEffect(() => {
    const loadDLCFixtures = async () => {
      try {
        setIsLoadingDLC(true)
        await dlcFixturesParser.loadFromFile('/dlc_hort_full_2025-05-29.csv')
        const fixtures = dlcFixturesParser.getFixtureModels()
        setDlcFixtures(fixtures)
        if (fixtures.length > 0) {
          setSelectedFixtureId(fixtures[0].id)
        }
      } catch (error) {
        console.error('Error loading DLC fixtures:', error)
        // Fallback to default fixtures if DLC loading fails
        setDlcFixtures(defaultFixtures)
        setSelectedFixtureId(defaultFixtures[0].id)
      } finally {
        setIsLoadingDLC(false)
      }
    }
    
    loadDLCFixtures()
  }, [])
  
  // Default fixtures as fallback
  const defaultFixtures: FixtureModel[] = [
    {
      id: 'dlc-default',
      brand: 'Gavita',
      model: 'Pro 1700e',
      category: 'LED Top Light',
      wattage: 645,
      ppf: 1700,
      efficacy: 2.6,
      spectrum: 'Full Spectrum',
      spectrumData: { blue: 20, green: 10, red: 65, farRed: 5 },
      coverage: 16,
      price: 1299,
      voltage: '120-277V',
      dimmable: true,
      warranty: 5
    }
  ]
  
  // Get all available fixtures (filtered)
  const getFilteredFixtures = () => {
    let fixtures = [...dlcFixtures]
    
    // Apply search filter
    if (searchTerm) {
      fixtures = fixtures.filter(f => 
        f.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply brand filter
    if (filterBrand !== 'all') {
      fixtures = fixtures.filter(f => f.brand === filterBrand)
    }
    
    // Apply wattage filter
    fixtures = fixtures.filter(f => 
      f.wattage >= filterWattageMin && f.wattage <= filterWattageMax
    )
    
    // Sort by efficacy (highest first)
    fixtures.sort((a, b) => b.efficacy - a.efficacy)
    
    return fixtures
  }
  
  const filteredFixtures = getFilteredFixtures()
  const currentFixture = filteredFixtures.find(f => f.id === selectedFixtureId) || filteredFixtures[0] || defaultFixtures[0]
  
  // Get unique brands for filter
  const brands = Array.from(new Set(dlcFixtures.map(f => f.brand))).sort()
  
  // PPFD recommendations based on crop type and growth stage
  const ppfdRecommendations = {
    'leafy-greens': {
      'seedling': { min: 100, optimal: 200, max: 300 },
      'vegetative': { min: 200, optimal: 300, max: 400 },
      'flowering': { min: 300, optimal: 400, max: 500 }
    },
    'tomatoes': {
      'seedling': { min: 200, optimal: 300, max: 400 },
      'vegetative': { min: 300, optimal: 500, max: 700 },
      'flowering': { min: 500, optimal: 800, max: 1200 }
    },
    'cannabis': {
      'seedling': { min: 200, optimal: 300, max: 400 },
      'vegetative': { min: 300, optimal: 600, max: 800 },
      'flowering': { min: 600, optimal: 1000, max: 1500 }
    },
    'strawberries': {
      'seedling': { min: 150, optimal: 250, max: 350 },
      'vegetative': { min: 250, optimal: 400, max: 600 },
      'flowering': { min: 400, optimal: 600, max: 800 }
    },
    'herbs': {
      'seedling': { min: 100, optimal: 200, max: 300 },
      'vegetative': { min: 200, optimal: 350, max: 500 },
      'flowering': { min: 300, optimal: 450, max: 600 }
    }
  }
  
  const currentRecommendation = ppfdRecommendations[cropType as keyof typeof ppfdRecommendations]?.[growthStage as keyof typeof ppfdRecommendations['leafy-greens']]
  
  // Auto-adjust target PPFD based on crop selection
  useEffect(() => {
    if (currentRecommendation && calculationMethod === 'ppfd-first') {
      setTargetPPFD(currentRecommendation.optimal)
    }
  }, [cropType, growthStage, calculationMethod])
  
  // Calculate photometric properties
  const photometry = currentFixture ? dlcFixturesParser.calculatePhotometry(currentFixture, mountingHeight) : null
  const beamAngle = photometry?.beamAngle || 120
  
  // Calculate coverage per fixture
  const coverageRadius = mountingHeight * Math.tan((beamAngle / 2) * Math.PI / 180) * 2
  const coverageArea = Math.PI * Math.pow(coverageRadius, 2)
  const effectiveCoverage = coverageArea * (1 - overlapPercentage / 100)
  
  // Calculate room area
  const roomArea = roomShape === 'circle' 
    ? Math.PI * Math.pow(roomWidth / 2, 2)
    : roomWidth * roomLength
  
  // Calculate usable area (minus aisles)
  const usableArea = roomArea - (aisleSpace * roomWidth + aisleSpace * roomLength - aisleSpace * aisleSpace)
  
  // Calculate fixtures needed based on method
  let fixturesNeeded: number
  let suggestedBudget: number = 0
  
  // Estimate fixture price if not available (industry standard: $2-3 per watt for LED)
  const estimatedPrice = currentFixture.price || Math.round(currentFixture.wattage * 2.5)
  
  if (calculationMethod === 'budget-first') {
    const availableBudget = totalBudget - installationBudget
    const maxFixtures = Math.floor(availableBudget / estimatedPrice)
    fixturesNeeded = Math.min(maxFixtures, Math.ceil(usableArea / effectiveCoverage))
  } else if (calculationMethod === 'ppfd-first') {
    // Calculate based on target PPFD
    const requiredPPF = targetPPFD * usableArea * 10.764 // Convert ft² to m²
    fixturesNeeded = Math.ceil(requiredPPF / currentFixture.ppf)
    suggestedBudget = fixturesNeeded * estimatedPrice + installationBudget
  } else {
    // Room-first (original method)
    fixturesNeeded = Math.ceil(usableArea / effectiveCoverage)
    suggestedBudget = fixturesNeeded * estimatedPrice + installationBudget
  }
  
  // Calculate PPFD
  const avgPPFD = (currentFixture.ppf * fixturesNeeded) / (usableArea * 10.764) // Convert to m²
  const maxPPFD = photometry?.maxPPFD || avgPPFD * 1.3
  
  // Calculate power metrics
  const totalPower = fixturesNeeded * currentFixture.wattage
  const powerDensity = totalPower / roomArea
  
  // Grid layout optimization
  const cols = Math.ceil(Math.sqrt(fixturesNeeded * (roomWidth / roomLength)))
  const rows = Math.ceil(fixturesNeeded / cols)
  const spacingX = roomWidth / (cols + 1)
  const spacingY = roomLength / (rows + 1)
  
  // Cost calculations
  const totalCost = fixturesNeeded * estimatedPrice
  const costPerSqFt = totalCost / roomArea
  
  // Energy calculations
  const dailyEnergy = totalPower * photoperiod / 1000 // Custom photoperiod, kWh
  const monthlyEnergy = dailyEnergy * 30
  const yearlyEnergy = dailyEnergy * 365
  const energyCost = yearlyEnergy * 0.12 // $0.12/kWh average
  const dailyLightIntegral = (avgPPFD * photoperiod * 3600) / 1000000 // DLI mol/m²/day

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
          Enhanced Coverage Calculator
        </h1>
        <p className="text-gray-400">
          Calculate optimal layout using multiple approaches with DLC-qualified fixtures
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Database className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-500">
            {isLoadingDLC ? 'Loading DLC database...' : `${dlcFixtures.length} DLC fixtures loaded`}
          </span>
        </div>
      </div>

      {/* Calculation Method Selector */}
      <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          Choose Your Approach
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setCalculationMethod('ppfd-first')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              calculationMethod === 'ppfd-first'
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="font-medium text-white">PPFD First</span>
            </div>
            <p className="text-sm text-gray-300">
              Start with your crop's light requirements and find the optimal layout
            </p>
          </button>
          
          <button
            onClick={() => setCalculationMethod('room-first')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              calculationMethod === 'room-first'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Square className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-white">Room First</span>
            </div>
            <p className="text-sm text-gray-300">
              Start with room dimensions and maximize coverage efficiency
            </p>
          </button>
          
          <button
            onClick={() => setCalculationMethod('budget-first')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              calculationMethod === 'budget-first'
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <span className="font-medium text-white">Budget First</span>
            </div>
            <p className="text-sm text-gray-300">
              Set your budget and optimize for best value and performance
            </p>
          </button>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Inputs - Changes based on method */}
        {calculationMethod === 'ppfd-first' && (
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-green-800/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Crop Requirements
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Crop Type</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
                >
                  <option value="leafy-greens">Leafy Greens</option>
                  <option value="tomatoes">Tomatoes</option>
                  <option value="cannabis">Cannabis</option>
                  <option value="strawberries">Strawberries</option>
                  <option value="herbs">Herbs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Growth Stage</label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
                >
                  <option value="seedling">Seedling</option>
                  <option value="vegetative">Vegetative</option>
                  <option value="flowering">Flowering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target PPFD (μmol/m²/s)
                </label>
                <input
                  type="number"
                  value={targetPPFD}
                  onChange={(e) => setTargetPPFD(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
                />
                {currentRecommendation && (
                  <div className="mt-2 p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                    <p className="text-xs text-green-400">
                      Recommended: {currentRecommendation.optimal} μmol/m²/s 
                      <br />
                      Range: {currentRecommendation.min}-{currentRecommendation.max}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Photoperiod (hours/day)
                </label>
                <input
                  type="number"
                  value={photoperiod}
                  onChange={(e) => setPhotoperiod(Number(e.target.value))}
                  min="6"
                  max="24"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">
                  DLI: {dailyLightIntegral.toFixed(1)} mol/m²/day
                </p>
              </div>
            </div>
          </div>
        )}

        {calculationMethod === 'budget-first' && (
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-yellow-800/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              Budget Planning
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Budget ($)
                </label>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Installation Budget ($)
                </label>
                <input
                  type="number"
                  value={installationBudget}
                  onChange={(e) => setInstallationBudget(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <p className="text-xs text-yellow-400">
                  Available for fixtures: ${(totalBudget - installationBudget).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Can afford: {Math.floor((totalBudget - installationBudget) / estimatedPrice)} fixtures
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target PPFD (μmol/m²/s)
                </label>
                <input
                  type="number"
                  value={targetPPFD}
                  onChange={(e) => setTargetPPFD(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Room Configuration - Always visible but smaller for non-room-first */}
        <div className={`bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6 ${
          calculationMethod === 'room-first' ? 'lg:col-span-1' : ''
        }`}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Square className="w-5 h-5 text-purple-400" />
            Room Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Room Shape</label>
              <div className="grid grid-cols-3 gap-2">
                {(['rectangle', 'square', 'circle'] as const).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setRoomShape(shape)}
                    className={`p-3 rounded-lg transition-all flex flex-col items-center gap-2 ${
                      roomShape === shape
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {shape === 'rectangle' && <Square className="w-5 h-5" />}
                    {shape === 'square' && <Square className="w-5 h-5" />}
                    {shape === 'circle' && <Circle className="w-5 h-5" />}
                    <span className="text-xs capitalize">{shape}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {roomShape === 'circle' ? 'Diameter' : 'Width'} (ft)
                </label>
                <input
                  type="number"
                  value={roomWidth}
                  onChange={(e) => setRoomWidth(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              {roomShape !== 'circle' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Length (ft)
                  </label>
                  <input
                    type="number"
                    value={roomLength}
                    onChange={(e) => setRoomLength(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aisle Space (ft)
              </label>
              <input
                type="number"
                value={aisleSpace}
                onChange={(e) => setAisleSpace(Number(e.target.value))}
                step="0.5"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mounting Height (ft)
              </label>
              <input
                type="number"
                value={mountingHeight}
                onChange={(e) => setMountingHeight(Number(e.target.value))}
                step="0.5"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* DLC Fixture Selection */}
        <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            DLC Fixture Selection
          </h3>
          
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fixtures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="all">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            
            {/* Wattage Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Wattage Range: {filterWattageMin}W - {filterWattageMax}W
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={filterWattageMin}
                  onChange={(e) => setFilterWattageMin(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={filterWattageMax}
                  onChange={(e) => setFilterWattageMax(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            {/* Fixture List */}
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {isLoadingDLC ? (
                <div className="text-center py-8 text-gray-400">
                  Loading DLC fixtures...
                </div>
              ) : filteredFixtures.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No fixtures match your filters
                </div>
              ) : (
                filteredFixtures.slice(0, 50).map((fixture) => (
                  <div
                    key={fixture.id}
                    onClick={() => setSelectedFixtureId(fixture.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedFixtureId === fixture.id
                        ? 'bg-purple-600/20 border-purple-500'
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{fixture.brand} {fixture.model}</h4>
                          {fixture.dlcData && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                              DLC Qualified
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-gray-500">Power:</span>{' '}
                            <span className="text-gray-300">{fixture.wattage}W</span>
                          </div>
                          <div>
                            <span className="text-gray-500">PPF:</span>{' '}
                            <span className="text-gray-300">{fixture.ppf} μmol/s</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Efficacy:</span>{' '}
                            <span className="text-gray-300">{fixture.efficacy.toFixed(1)} μmol/J</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Price:</span>{' '}
                            <span className="text-gray-300">${fixture.price || Math.round(fixture.wattage * 2.5)} {!fixture.price && <span className="text-xs text-gray-500">(est.)</span>}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Light Planning Controls */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target PPFD (μmol/m²/s)
                </label>
                <input
                  type="number"
                  value={targetPPFD}
                  onChange={(e) => setTargetPPFD(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Coverage Overlap: {overlapPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={overlapPercentage}
                  onChange={(e) => setOverlapPercentage(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Grid3x3 className="w-5 h-5 text-purple-400" />
            <p className="text-sm text-gray-400">Fixtures Needed</p>
          </div>
          <p className="text-3xl font-bold text-white">{fixturesNeeded}</p>
          <p className="text-xs text-gray-400 mt-1">{cols} × {rows} grid</p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-xl rounded-xl border border-blue-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-gray-400">Average PPFD</p>
          </div>
          <p className="text-3xl font-bold text-white">{Math.round(avgPPFD)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {avgPPFD >= targetPPFD ? (
              <span className="text-green-400">✓ Meets target ({targetPPFD})</span>
            ) : (
              <span className="text-yellow-400">Below target ({targetPPFD})</span>
            )}
          </p>
        </div>

        {calculationMethod === 'budget-first' ? (
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-xl rounded-xl border border-green-500/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <p className="text-sm text-gray-400">Budget Used</p>
            </div>
            <p className="text-3xl font-bold text-white">{((totalCost + installationBudget) / totalBudget * 100).toFixed(0)}%</p>
            <p className="text-xs text-gray-400 mt-1">${(totalCost + installationBudget).toLocaleString()} / ${totalBudget.toLocaleString()}</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-xl rounded-xl border border-green-500/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-400" />
              <p className="text-sm text-gray-400">Power Density</p>
            </div>
            <p className="text-3xl font-bold text-white">{powerDensity.toFixed(1)}</p>
            <p className="text-xs text-gray-400 mt-1">W/ft²</p>
          </div>
        )}

        {calculationMethod === 'ppfd-first' ? (
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-xl rounded-xl border border-yellow-500/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-gray-400">Daily Light Integral</p>
            </div>
            <p className="text-3xl font-bold text-white">{dailyLightIntegral.toFixed(1)}</p>
            <p className="text-xs text-gray-400 mt-1">mol/m²/day</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-xl rounded-xl border border-yellow-500/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-gray-400">System Efficacy</p>
            </div>
            <p className="text-3xl font-bold text-white">{currentFixture.efficacy.toFixed(1)}</p>
            <p className="text-xs text-gray-400 mt-1">μmol/J</p>
          </div>
        )}
      </div>
      
      {/* Budget Analysis for non-budget-first methods */}
      {calculationMethod !== 'budget-first' && suggestedBudget > 0 && (
        <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            Budget Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">Equipment Cost</p>
              <p className="text-2xl font-bold text-white">${totalCost.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">Installation Est.</p>
              <p className="text-2xl font-bold text-white">${installationBudget.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
              <p className="text-sm text-yellow-400">Total Budget Needed</p>
              <p className="text-2xl font-bold text-white">${suggestedBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Layout Visualization */}
      <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">PPFD Heatmap Visualization</h3>
        
        {/* Generate fixture positions */}
        {(() => {
          const fixtures = []
          for (let idx = 0; idx < fixturesNeeded; idx++) {
            const rowIdx = Math.floor(idx / cols)
            const colIdx = idx % cols
            
            if (rowIdx < rows) {
              const x = (colIdx + 1) * spacingX
              const y = (rowIdx + 1) * spacingY
              fixtures.push({ x, y })
            }
          }
          
          return (
            <CoverageVisualization
              roomWidth={roomWidth}
              roomLength={roomLength}
              fixtures={fixtures}
              coverageRadius={coverageRadius}
              mountingHeight={mountingHeight}
              targetPPFD={targetPPFD}
              actualPPFD={avgPPFD}
            />
          )
        })()}
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-400">Grid Layout</p>
            <p className="text-white font-medium">{rows} × {cols} fixtures</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-400">Spacing</p>
            <p className="text-white font-medium">{spacingX.toFixed(1)}' × {spacingY.toFixed(1)}'</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-400">Coverage Overlap</p>
            <p className="text-white font-medium">{overlapPercentage}%</p>
          </div>
        </div>
      </div>

      {/* Enhanced Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area & Coverage Analysis */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Area Analysis</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Total Room Area</span>
              <span className="text-white font-medium">{roomArea.toFixed(0)} ft²</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Usable Grow Area</span>
              <span className="text-white font-medium">{usableArea.toFixed(0)} ft²</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Coverage/Fixture</span>
              <span className="text-white font-medium">{effectiveCoverage.toFixed(0)} ft²</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <span className="text-purple-400">Uniformity Target</span>
              <span className="text-white font-bold">{(uniformityTarget * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Analysis</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Fixture Cost {!currentFixture.price && <span className="text-xs">(est.)</span>}</span>
              <span className="text-white font-medium">${estimatedPrice}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Total Equipment</span>
              <span className="text-white font-medium">${totalCost.toFixed(0)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Cost per ft²</span>
              <span className="text-white font-medium">${costPerSqFt.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <span className="text-green-400">ROI Period</span>
              <span className="text-white font-bold">{(totalCost / (energyCost * 0.3)).toFixed(1)} years</span>
            </div>
          </div>
        </div>

        {/* Energy Analysis */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Energy Analysis</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Total Power</span>
              <span className="text-white font-medium">{(totalPower / 1000).toFixed(1)} kW</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Daily Energy</span>
              <span className="text-white font-medium">{dailyEnergy.toFixed(1)} kWh</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Monthly Energy</span>
              <span className="text-white font-medium">{monthlyEnergy.toFixed(0)} kWh</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <span className="text-yellow-400">Annual Cost</span>
              <span className="text-white font-bold">${energyCost.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixture Details */}
      {currentFixture && (
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Selected Fixture Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Model</p>
              <p className="text-white font-medium">{currentFixture.brand} {currentFixture.model}</p>
              {currentFixture.dlcData && (
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">DLC Qualified</span>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-1">Spectrum</p>
              <p className="text-white font-medium">{currentFixture.spectrum}</p>
              <div className="flex gap-1 mt-1">
                <div className="h-2 bg-blue-500 rounded" style={{ width: `${currentFixture.spectrumData.blue}%` }} />
                <div className="h-2 bg-green-500 rounded" style={{ width: `${currentFixture.spectrumData.green}%` }} />
                <div className="h-2 bg-red-500 rounded" style={{ width: `${currentFixture.spectrumData.red}%` }} />
                <div className="h-2 bg-red-700 rounded" style={{ width: `${currentFixture.spectrumData.farRed}%` }} />
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-1">Voltage</p>
              <p className="text-white font-medium">{currentFixture.voltage || '120-277V'}</p>
              {currentFixture.dimmable && (
                <p className="text-xs text-purple-400 mt-1">Dimmable</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-1">Warranty</p>
              <p className="text-white font-medium">{currentFixture.warranty || 5} years</p>
              {currentFixture.dlcData?.dateQualified && (
                <p className="text-xs text-gray-500 mt-1">
                  Qualified: {new Date(currentFixture.dlcData.dateQualified).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Photometric Data */}
          {photometry && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Photometric Properties</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Beam Angle:</span>{' '}
                  <span className="text-white">{photometry.beamAngle}°</span>
                </div>
                <div>
                  <span className="text-gray-500">Max PPFD:</span>{' '}
                  <span className="text-white">{Math.round(maxPPFD)} μmol/m²/s</span>
                </div>
                <div>
                  <span className="text-gray-500">Distribution:</span>{' '}
                  <span className="text-white capitalize">{photometry.distribution}</span>
                </div>
                <div>
                  <span className="text-gray-500">Uniformity:</span>{' '}
                  <span className="text-white">{(photometry.uniformity * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Layout Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {avgPPFD >= targetPPFD ? (
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 font-medium">PPFD Target Met</p>
                <p className="text-sm text-gray-300 mt-1">
                  Your layout achieves {Math.round(avgPPFD)} μmol/m²/s, exceeding the target of {targetPPFD}.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">PPFD Below Target</p>
                <p className="text-sm text-gray-300 mt-1">
                  Consider adding {Math.ceil((targetPPFD - avgPPFD) * usableArea * 10.764 / currentFixture.ppf)} more fixtures.
                </p>
              </div>
            </div>
          )}
          
          {currentFixture.dlcData && (
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 font-medium">DLC Qualified Fixture</p>
                <p className="text-sm text-gray-300 mt-1">
                  Using verified photometric data for accurate calculations.
                </p>
              </div>
            </div>
          )}
          
          {overlapPercentage < 15 && (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Low Overlap</p>
                <p className="text-sm text-gray-300 mt-1">
                  Increase overlap to 15-25% for better uniformity.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 font-medium">Grid Layout</p>
              <p className="text-sm text-gray-300 mt-1">
                {cols} × {rows} grid with {spacingX.toFixed(1)}' × {spacingY.toFixed(1)}' spacing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}