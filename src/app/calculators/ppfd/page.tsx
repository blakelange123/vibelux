'use client'

import { useState } from 'react'
import { calculatePPFD } from '@/lib/lighting-calculations'
import Link from 'next/link'

export default function PPFDCalculator() {
  const [inputs, setInputs] = useState({
    fixtureWattage: 320,
    efficacy: 2.7,
    mountingHeight: 2.4,
    roomArea: 100,
    numberOfFixtures: 4
  })
  
  const [results, setResults] = useState(calculatePPFD(320, 2.7, 2.4, 100, 4))

  const handleInputChange = (field: string, value: number) => {
    const newInputs = { ...inputs, [field]: value }
    setInputs(newInputs)
    
    const newResults = calculatePPFD(
      newInputs.fixtureWattage,
      newInputs.efficacy,
      newInputs.mountingHeight,
      newInputs.roomArea,
      newInputs.numberOfFixtures
    )
    setResults(newResults)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/calculators" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Calculators
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PPFD Calculator</h1>
            <p className="text-gray-600">
              Calculate Photosynthetic Photon Flux Density and Daily Light Integral for your growing environment
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Input Parameters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fixture Wattage (W)
                  </label>
                  <input
                    type="number"
                    value={inputs.fixtureWattage}
                    onChange={(e) => handleInputChange('fixtureWattage', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photon Efficacy (µmol/J)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.efficacy}
                    onChange={(e) => handleInputChange('efficacy', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mounting Height (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.mountingHeight}
                    onChange={(e) => handleInputChange('mountingHeight', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Area (m²)
                  </label>
                  <input
                    type="number"
                    value={inputs.roomArea}
                    onChange={(e) => handleInputChange('roomArea', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Fixtures
                  </label>
                  <input
                    type="number"
                    value={inputs.numberOfFixtures}
                    onChange={(e) => handleInputChange('numberOfFixtures', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">PPFD</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(results.ppfd)} µmol/m²/s
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {results.ppfd < 200 ? 'Low light' : 
                     results.ppfd < 600 ? 'Medium light' : 
                     results.ppfd < 1000 ? 'High light' : 'Very high light'}
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Daily Light Integral (DLI)</div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(results.dli * 10) / 10} mol/m²/day
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {results.dli < 20 ? 'Low DLI' : 
                     results.dli < 40 ? 'Medium DLI' : 
                     results.dli < 60 ? 'High DLI' : 'Very high DLI'}
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Monthly Energy Cost</div>
                  <div className="text-2xl font-bold text-orange-600">
                    ${Math.round(results.energyCost)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    At $0.12/kWh, 18h/day
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {results.ppfd < 400 && <div>• Consider adding more fixtures for better coverage</div>}
                  {results.ppfd > 800 && <div>• High PPFD may require CO₂ supplementation</div>}
                  {results.dli > 50 && <div>• Consider reducing photoperiod to save energy</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}