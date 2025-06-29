/**
 * Advanced Fixture Search Interface
 * Comprehensive search and filtering for lighting fixtures
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useFixtureSearch, useCropRecommendations, useFixtureComparison } from '@/hooks/useFixtureSearch'
import { SearchFilters } from '@/lib/fixture-search-engine'
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Zap, 
  DollarSign, 
  BarChart3,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Compare,
  Star,
  Info
} from 'lucide-react'

interface AdvancedFixtureSearchProps {
  initialFilters?: Partial<SearchFilters>
  onFixtureSelect?: (fixture: any) => void
  showComparison?: boolean
}

export function AdvancedFixtureSearch({ 
  initialFilters = {}, 
  onFixtureSelect,
  showComparison = true 
}: AdvancedFixtureSearchProps) {
  const { results, isLoading, error, search, clearResults, recentSearches } = useFixtureSearch()
  const { addToComparison, fixtures: comparedFixtures } = useFixtureComparison()
  
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    limit: 20,
    ...initialFilters
  })
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'recommendations'>('search')

  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      search(filters)
    }
  }, [])

  const handleSearch = () => {
    search(filters)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleRangeChange = (key: 'wattageRange' | 'efficacyRange' | 'priceRange', index: 0 | 1, value: number) => {
    setFilters(prev => {
      const currentRange = prev[key] || [0, 0]
      const newRange = [...currentRange] as [number, number]
      newRange[index] = value
      return { ...prev, [key]: newRange }
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 75) return 'text-blue-600 bg-blue-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fixture Search & Recommendations
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Find optimal lighting solutions with AI-powered compatibility scoring
          </p>
        </div>
        
        {showComparison && comparedFixtures.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
            <Compare size={16} />
            <span>{comparedFixtures.length} fixtures selected for comparison</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Search size={16} />
              <span>Advanced Search</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recommendations'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Lightbulb size={16} />
              <span>Crop Recommendations</span>
            </div>
          </button>
        </nav>
      </div>

      {activeTab === 'search' && (
        <>
          {/* Search Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Filters */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Basic Filters</h3>
                
                {/* Wattage Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Wattage Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.wattageRange?.[0] || ''}
                      onChange={(e) => handleRangeChange('wattageRange', 0, parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.wattageRange?.[1] || ''}
                      onChange={(e) => handleRangeChange('wattageRange', 1, parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range ($)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange?.[0] || ''}
                      onChange={(e) => handleRangeChange('priceRange', 0, parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange?.[1] || ''}
                      onChange={(e) => handleRangeChange('priceRange', 1, parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Coverage Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Coverage Area (sq ft)
                  </label>
                  <input
                    type="number"
                    value={filters.coverageArea || ''}
                    onChange={(e) => handleFilterChange('coverageArea', parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 100"
                  />
                </div>
              </div>

              {/* Application Filters */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Application</h3>
                
                {/* Crop Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Crop Type
                  </label>
                  <select
                    value={filters.cropType || ''}
                    onChange={(e) => handleFilterChange('cropType', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Any crop</option>
                    <option value="lettuce">Lettuce</option>
                    <option value="tomato">Tomato</option>
                    <option value="basil">Basil</option>
                    <option value="strawberry">Strawberry</option>
                    <option value="cucumber">Cucumber</option>
                    <option value="pepper">Pepper</option>
                    <option value="kale">Kale</option>
                    <option value="spinach">Spinach</option>
                  </select>
                </div>

                {/* Growth Stage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Growth Stage
                  </label>
                  <select
                    value={filters.growthStage || ''}
                    onChange={(e) => handleFilterChange('growthStage', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All stages</option>
                    <option value="seedling">Seedling</option>
                    <option value="vegetative">Vegetative</option>
                    <option value="flowering">Flowering</option>
                    <option value="fruiting">Fruiting</option>
                  </select>
                </div>

                {/* Indoor Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Facility Type
                  </label>
                  <select
                    value={filters.indoorType || ''}
                    onChange={(e) => handleFilterChange('indoorType', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Any facility</option>
                    <option value="greenhouse">Greenhouse</option>
                    <option value="vertical-farm">Vertical Farm</option>
                    <option value="grow-tent">Grow Tent</option>
                    <option value="warehouse">Warehouse</option>
                  </select>
                </div>

                {/* Spectrum Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Spectrum Type
                  </label>
                  <select
                    value={filters.spectrumType || ''}
                    onChange={(e) => handleFilterChange('spectrumType', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Any spectrum</option>
                    <option value="full-spectrum">Full Spectrum</option>
                    <option value="red-blue">Red-Blue</option>
                    <option value="white-supplemented">White + Supplemented</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Performance & Sorting */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Performance & Options</h3>
                
                {/* Efficacy Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Efficacy Range (μmol/J)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Min"
                      value={filters.efficacyRange?.[0] || ''}
                      onChange={(e) => handleRangeChange('efficacyRange', 0, parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Max"
                      value={filters.efficacyRange?.[1] || ''}
                      onChange={(e) => handleRangeChange('efficacyRange', 1, parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Dimmable */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="dimmable"
                    checked={filters.dimmable || false}
                    onChange={(e) => handleFilterChange('dimmable', e.target.checked ? true : undefined)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="dimmable" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Dimmable fixtures only
                  </label>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy || 'relevance'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price">Price (Low to High)</option>
                    <option value="efficacy">Efficiency</option>
                    <option value="ppfd">Light Output</option>
                    <option value="wattage">Wattage</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      <span>Search Fixtures</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="text-red-600 dark:text-red-400">
                {error}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Search Results ({results.length} fixtures)
                </h3>
                <button
                  onClick={clearResults}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Clear results
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.map((recommendation, index) => (
                  <FixtureRecommendationCard
                    key={recommendation.fixture.id}
                    recommendation={recommendation}
                    onSelect={onFixtureSelect}
                    onAddToComparison={showComparison ? addToComparison : undefined}
                    isInComparison={comparedFixtures.some(f => f.id === recommendation.fixture.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'recommendations' && (
        <CropRecommendationsTab />
      )}
    </div>
  )
}

interface FixtureRecommendationCardProps {
  recommendation: any
  onSelect?: (fixture: any) => void
  onAddToComparison?: (fixture: any) => void
  isInComparison?: boolean
}

function FixtureRecommendationCard({
  recommendation,
  onSelect,
  onAddToComparison,
  isInComparison
}: FixtureRecommendationCardProps) {
  const { fixture, score, reasoning, estimatedCoverage, costAnalysis } = recommendation

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
    if (score >= 75) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
    return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            {fixture.manufacturer} {fixture.model}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {fixture.type} • {fixture.specifications.wattage}W
          </p>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score.overall)}`}>
          {score.overall}% Match
        </div>
      </div>

      {/* Key Specifications */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {fixture.specifications.efficacy}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">μmol/J</div>
        </div>
        
        <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${fixture.pricing.msrp.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">MSRP</div>
        </div>
      </div>

      {/* Compatibility Scores */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Spectrum</div>
          <div className={`text-sm ${getScoreColor(score.spectrum)}`}>
            {score.spectrum}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Efficiency</div>
          <div className={`text-sm ${getScoreColor(score.efficiency)}`}>
            {score.efficiency}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Value</div>
          <div className={`text-sm ${getScoreColor(score.cost)}`}>
            {score.cost}%
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {reasoning}
      </p>

      {/* Warnings */}
      {score.warnings.length > 0 && (
        <div className="mb-4">
          {score.warnings.map((warning, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        {onSelect && (
          <button
            onClick={() => onSelect(fixture)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Select Fixture
          </button>
        )}
        
        {onAddToComparison && (
          <button
            onClick={() => onAddToComparison(fixture)}
            disabled={isInComparison}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isInComparison
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Compare size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

function CropRecommendationsTab() {
  const { recommendations, insights, isLoading, getRecommendations } = useCropRecommendations()
  const [cropName, setCropName] = useState('')
  const [facilityParams, setFacilityParams] = useState({
    growthStage: 'all',
    facilityType: '',
    coverageArea: '',
    budget: '',
    priority: 'performance'
  })

  const handleGetRecommendations = () => {
    if (!cropName) return
    
    getRecommendations({
      cropName,
      growthStage: facilityParams.growthStage === 'all' ? undefined : facilityParams.growthStage,
      facilityType: facilityParams.facilityType || undefined,
      coverageArea: facilityParams.coverageArea ? parseInt(facilityParams.coverageArea) : undefined,
      budget: facilityParams.budget ? parseInt(facilityParams.budget) : undefined,
      priority: facilityParams.priority
    })
  }

  return (
    <div className="space-y-6">
      {/* Crop Recommendation Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Get Crop-Specific Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Crop Type *
            </label>
            <input
              type="text"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="e.g., lettuce, tomato, basil"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Growth Stage
            </label>
            <select
              value={facilityParams.growthStage}
              onChange={(e) => setFacilityParams(prev => ({ ...prev, growthStage: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All stages</option>
              <option value="seedling">Seedling</option>
              <option value="vegetative">Vegetative</option>
              <option value="flowering">Flowering</option>
              <option value="fruiting">Fruiting</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Facility Type
            </label>
            <select
              value={facilityParams.facilityType}
              onChange={(e) => setFacilityParams(prev => ({ ...prev, facilityType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Any facility</option>
              <option value="greenhouse">Greenhouse</option>
              <option value="vertical-farm">Vertical Farm</option>
              <option value="grow-tent">Grow Tent</option>
              <option value="warehouse">Warehouse</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Coverage Area (sq ft)
            </label>
            <input
              type="number"
              value={facilityParams.coverageArea}
              onChange={(e) => setFacilityParams(prev => ({ ...prev, coverageArea: e.target.value }))}
              placeholder="e.g., 100"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Budget ($)
            </label>
            <input
              type="number"
              value={facilityParams.budget}
              onChange={(e) => setFacilityParams(prev => ({ ...prev, budget: e.target.value }))}
              placeholder="e.g., 5000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={facilityParams.priority}
              onChange={(e) => setFacilityParams(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="performance">Performance</option>
              <option value="efficiency">Efficiency</option>
              <option value="cost">Cost</option>
              <option value="spectrum">Spectrum Match</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleGetRecommendations}
          disabled={!cropName || isLoading}
          className="mt-4 flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Getting recommendations...</span>
            </>
          ) : (
            <>
              <Lightbulb size={16} />
              <span>Get Recommendations</span>
            </>
          )}
        </button>
      </div>

      {/* Recommendations Results */}
      {insights && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Recommendations for {cropName}
          </h3>
          
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200">
              {insights.summary}
            </p>
          </div>

          {insights.considerations.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Important Considerations
              </h4>
              <ul className="space-y-1">
                {insights.considerations.map((consideration, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <Info size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{consideration}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.slice(0, 6).map((recommendation, index) => (
                <FixtureRecommendationCard
                  key={recommendation.fixture.id}
                  recommendation={recommendation}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}