/**
 * Fixture Comparison Component
 * Side-by-side comparison of LED grow lights with detailed analysis
 */

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  X, 
  BarChart3, 
  Zap, 
  DollarSign, 
  Thermometer,
  Eye,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
  Leaf
} from 'lucide-react'

interface FixtureData {
  id: string
  name: string
  brand: string
  model: string
  wattage: number
  ppfd: number
  coverage: {
    bloom: string
    veg: string
  }
  spectrum: {
    fullSpectrum: boolean
    peakWavelengths: number[]
    redBlueRatio: number
  }
  efficiency: number
  price: number
  lifespan: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  weight: number
  cooling: string
  dimmable: boolean
  warranty: number
  features: string[]
  growStages: string[]
  coverageArea: number
  ppfdPerWatt: number
  costPerPPFD: number
  heatOutput: number
}

interface ComparisonMetrics {
  efficiency: {
    winner: string
    score: number
    analysis: string
  }
  value: {
    winner: string
    score: number
    analysis: string
  }
  coverage: {
    winner: string
    score: number
    analysis: string
  }
  spectrum: {
    winner: string
    score: number
    analysis: string
  }
  overall: {
    winner: string
    score: number
    recommendation: string
  }
}

export function FixtureComparison() {
  const [selectedFixtures, setSelectedFixtures] = useState<FixtureData[]>([])
  const [availableFixtures, setAvailableFixtures] = useState<FixtureData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetrics | null>(null)

  useEffect(() => {
    loadFixtures()
  }, [])

  useEffect(() => {
    if (selectedFixtures.length >= 2) {
      calculateComparison()
    } else {
      setComparisonMetrics(null)
    }
  }, [selectedFixtures])

  const loadFixtures = async () => {
    try {
      const response = await fetch('/api/fixtures')
      if (response.ok) {
        const data = await response.json()
        
        // Transform DLC data to comparison format
        const fixtures = data.fixtures.map((fixture: any) => ({
          id: fixture.id,
          name: fixture.name,
          brand: fixture.manufacturer,
          model: fixture.model,
          wattage: fixture.wattage,
          ppfd: fixture.ppfd,
          coverage: {
            bloom: `${Math.round(fixture.coverageArea * 0.8)} sq ft`,
            veg: `${Math.round(fixture.coverageArea)} sq ft`
          },
          spectrum: {
            fullSpectrum: fixture.spectrum?.includes('full') || true,
            peakWavelengths: [660, 450, 730], // Default peaks
            redBlueRatio: 1.2
          },
          efficiency: fixture.efficiency,
          price: fixture.price,
          lifespan: 50000,
          dimensions: {
            length: fixture.dimensions?.length || 24,
            width: fixture.dimensions?.width || 12,
            height: fixture.dimensions?.height || 3
          },
          weight: fixture.weight || 15,
          cooling: fixture.cooling || 'Passive',
          dimmable: fixture.dimmable || false,
          warranty: fixture.warranty || 3,
          features: fixture.features || ['Full Spectrum', 'Energy Efficient'],
          growStages: ['Seedling', 'Vegetative', 'Flowering'],
          coverageArea: fixture.coverageArea,
          ppfdPerWatt: fixture.ppfd / fixture.wattage,
          costPerPPFD: fixture.price / fixture.ppfd,
          heatOutput: fixture.wattage * 0.15 // Estimate 15% heat conversion
        }))
        
        setAvailableFixtures(fixtures)
      }
    } catch (error) {
      console.error('Error loading fixtures:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateComparison = () => {
    if (selectedFixtures.length < 2) return

    const fixtures = selectedFixtures
    
    // Calculate efficiency comparison
    const efficiencyScores = fixtures.map(f => f.ppfdPerWatt)
    const maxEfficiency = Math.max(...efficiencyScores)
    const efficiencyWinner = fixtures[efficiencyScores.indexOf(maxEfficiency)]

    // Calculate value comparison  
    const valueScores = fixtures.map(f => 1 / f.costPerPPFD) // Lower cost per PPFD is better
    const maxValue = Math.max(...valueScores)
    const valueWinner = fixtures[valueScores.indexOf(maxValue)]

    // Calculate coverage comparison
    const coverageScores = fixtures.map(f => f.coverageArea)
    const maxCoverage = Math.max(...coverageScores)
    const coverageWinner = fixtures[coverageScores.indexOf(maxCoverage)]

    // Calculate spectrum comparison (simplified)
    const spectrumScores = fixtures.map(f => f.spectrum.fullSpectrum ? 100 : 70)
    const maxSpectrum = Math.max(...spectrumScores)
    const spectrumWinner = fixtures[spectrumScores.indexOf(maxSpectrum)]

    // Calculate overall winner
    const overallScores = fixtures.map((f, i) => {
      const effScore = (efficiencyScores[i] / maxEfficiency) * 30
      const valScore = (valueScores[i] / maxValue) * 25
      const covScore = (coverageScores[i] / maxCoverage) * 25
      const specScore = (spectrumScores[i] / maxSpectrum) * 20
      return effScore + valScore + covScore + specScore
    })
    const maxOverall = Math.max(...overallScores)
    const overallWinner = fixtures[overallScores.indexOf(maxOverall)]

    setComparisonMetrics({
      efficiency: {
        winner: efficiencyWinner.name,
        score: maxEfficiency,
        analysis: `${efficiencyWinner.name} delivers ${maxEfficiency.toFixed(2)} PPFD per watt, making it the most efficient option.`
      },
      value: {
        winner: valueWinner.name,
        score: valueWinner.costPerPPFD,
        analysis: `${valueWinner.name} offers the best value at $${valueWinner.costPerPPFD.toFixed(2)} per PPFD.`
      },
      coverage: {
        winner: coverageWinner.name,
        score: maxCoverage,
        analysis: `${coverageWinner.name} covers the largest area at ${maxCoverage} sq ft.`
      },
      spectrum: {
        winner: spectrumWinner.name,
        score: maxSpectrum,
        analysis: `${spectrumWinner.name} provides the most comprehensive spectrum for plant growth.`
      },
      overall: {
        winner: overallWinner.name,
        score: maxOverall,
        recommendation: `Based on efficiency, value, coverage, and spectrum, ${overallWinner.name} is the recommended choice for most growers.`
      }
    })
  }

  const addFixture = (fixture: FixtureData) => {
    if (selectedFixtures.length < 4 && !selectedFixtures.find(f => f.id === fixture.id)) {
      setSelectedFixtures(prev => [...prev, fixture])
      setShowSearch(false)
      setSearchTerm('')
    }
  }

  const removeFixture = (fixtureId: string) => {
    setSelectedFixtures(prev => prev.filter(f => f.id !== fixtureId))
  }

  const filteredFixtures = availableFixtures.filter(fixture =>
    fixture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fixture.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fixture.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getWinnerClass = (fixtureName: string, winnerName: string) => {
    return fixtureName === winnerName 
      ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
      : 'bg-gray-50 dark:bg-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Fixture Comparison Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare LED grow lights side-by-side to find the perfect match for your growing needs
        </p>
      </div>

      {/* Add Fixtures Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select Fixtures to Compare ({selectedFixtures.length}/4)
          </h2>
          <button
            onClick={() => setShowSearch(true)}
            disabled={selectedFixtures.length >= 4}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={16} />
            <span>Add Fixture</span>
          </button>
        </div>

        {/* Selected Fixtures Pills */}
        {selectedFixtures.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedFixtures.map((fixture) => (
              <div
                key={fixture.id}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {fixture.name}
                </span>
                <button
                  onClick={() => removeFixture(fixture.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Modal */}
        {showSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Fixture
                </h3>
                <button
                  onClick={() => setShowSearch(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search fixtures..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
              
              <div className="overflow-y-auto max-h-64">
                {filteredFixtures.map((fixture) => (
                  <div
                    key={fixture.id}
                    onClick={() => addFixture(fixture)}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-lg border-b border-gray-100 dark:border-gray-600"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {fixture.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {fixture.wattage}W • {fixture.ppfd} PPFD • {formatCurrency(fixture.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Analysis */}
      {comparisonMetrics && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <BarChart3 className="mr-2" size={20} />
            Comparison Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center mb-2">
                <Zap className="text-blue-600 mr-2" size={16} />
                <span className="font-medium text-blue-900 dark:text-blue-100">Efficiency</span>
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>{comparisonMetrics.efficiency.winner}</strong>
                <br />
                {comparisonMetrics.efficiency.score.toFixed(2)} PPFD/W
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center mb-2">
                <DollarSign className="text-green-600 mr-2" size={16} />
                <span className="font-medium text-green-900 dark:text-green-100">Best Value</span>
              </div>
              <div className="text-sm text-green-800 dark:text-green-200">
                <strong>{comparisonMetrics.value.winner}</strong>
                <br />
                ${comparisonMetrics.value.score.toFixed(2)}/PPFD
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center mb-2">
                <Eye className="text-purple-600 mr-2" size={16} />
                <span className="font-medium text-purple-900 dark:text-purple-100">Coverage</span>
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-200">
                <strong>{comparisonMetrics.coverage.winner}</strong>
                <br />
                {comparisonMetrics.coverage.score} sq ft
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center mb-2">
                <Lightbulb className="text-orange-600 mr-2" size={16} />
                <span className="font-medium text-orange-900 dark:text-orange-100">Spectrum</span>
              </div>
              <div className="text-sm text-orange-800 dark:text-orange-200">
                <strong>{comparisonMetrics.spectrum.winner}</strong>
                <br />
                Full spectrum available
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Award className="text-yellow-600 mr-2" size={20} />
              <span className="font-semibold text-gray-900 dark:text-white">Overall Recommendation</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {comparisonMetrics.overall.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selectedFixtures.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Detailed Comparison
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Specification
                  </th>
                  {selectedFixtures.map((fixture) => (
                    <th key={fixture.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {fixture.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Basic Info */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Brand
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fixture.brand}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Model
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fixture.model}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Price
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(fixture.price)}
                    </td>
                  ))}
                </tr>
                
                {/* Performance */}
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Wattage
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fixture.wattage}W
                    </td>
                  ))}
                </tr>
                
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    PPFD
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ${
                      comparisonMetrics && getWinnerClass(fixture.name, comparisonMetrics.efficiency.winner)
                    }`}>
                      {fixture.ppfd} μmol/m²/s
                    </td>
                  ))}
                </tr>
                
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Efficiency (PPFD/W)
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ${
                      comparisonMetrics && getWinnerClass(fixture.name, comparisonMetrics.efficiency.winner)
                    }`}>
                      {fixture.ppfdPerWatt.toFixed(2)}
                      {comparisonMetrics && fixture.name === comparisonMetrics.efficiency.winner && (
                        <CheckCircle className="inline ml-2 text-green-600" size={16} />
                      )}
                    </td>
                  ))}
                </tr>
                
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Coverage Area
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ${
                      comparisonMetrics && getWinnerClass(fixture.name, comparisonMetrics.coverage.winner)
                    }`}>
                      {fixture.coverageArea} sq ft
                      {comparisonMetrics && fixture.name === comparisonMetrics.coverage.winner && (
                        <CheckCircle className="inline ml-2 text-green-600" size={16} />
                      )}
                    </td>
                  ))}
                </tr>
                
                {/* Value */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Cost per PPFD
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ${
                      comparisonMetrics && getWinnerClass(fixture.name, comparisonMetrics.value.winner)
                    }`}>
                      ${fixture.costPerPPFD.toFixed(2)}
                      {comparisonMetrics && fixture.name === comparisonMetrics.value.winner && (
                        <CheckCircle className="inline ml-2 text-green-600" size={16} />
                      )}
                    </td>
                  ))}
                </tr>
                
                {/* Physical */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Dimensions (L×W×H)
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fixture.dimensions.length}"×{fixture.dimensions.width}"×{fixture.dimensions.height}"
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Weight
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fixture.weight} lbs
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Heat Output
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fixture.heatOutput.toFixed(1)} BTU/hr
                    </td>
                  ))}
                </tr>
                
                {/* Features */}
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Dimmable
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fixture.dimmable ? (
                        <CheckCircle className="text-green-600" size={16} />
                      ) : (
                        <X className="text-red-600" size={16} />
                      )}
                    </td>
                  ))}
                </tr>
                
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Cooling
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fixture.cooling}
                    </td>
                  ))}
                </tr>
                
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Warranty
                  </td>
                  {selectedFixtures.map((fixture) => (
                    <td key={fixture.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fixture.warranty} years
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedFixtures.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No fixtures selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add 2-4 fixtures to start comparing their specifications and performance.
          </p>
          <button
            onClick={() => setShowSearch(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Add Your First Fixture
          </button>
        </div>
      )}
    </div>
  )
}