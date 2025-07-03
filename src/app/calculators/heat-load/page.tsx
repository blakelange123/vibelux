'use client'

import { useState } from 'react'
import { calculateHeatLoad } from '@/lib/lighting-calculations'
import Link from 'next/link'

export default function HeatLoadCalculator() {
  const [inputs, setInputs] = useState({
    fixtureWattage: 320,
    numberOfFixtures: 4,
    roomArea: 100,
    ambientTemp: 25
  })
  
  const [results, setResults] = useState(calculateHeatLoad(320, 4, 100, 25))

  const handleInputChange = (field: string, value: number) => {
    const newInputs = { ...inputs, [field]: value }
    setInputs(newInputs)
    
    const newResults = calculateHeatLoad(
      newInputs.fixtureWattage,
      newInputs.numberOfFixtures,
      newInputs.roomArea,
      newInputs.ambientTemp
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Heat Load Calculator</h1>
            <p className="text-gray-600">
              Calculate thermal management requirements for your LED lighting system
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
                    Number of Fixtures
                  </label>
                  <input
                    type="number"
                    value={inputs.numberOfFixtures}
                    onChange={(e) => handleInputChange('numberOfFixtures', Number(e.target.value))}
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
                    Ambient Temperature (°C)
                  </label>
                  <input
                    type="number"
                    value={inputs.ambientTemp}
                    onChange={(e) => handleInputChange('ambientTemp', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">System Summary</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>Total Power: {inputs.fixtureWattage * inputs.numberOfFixtures}W</div>
                  <div>Power Density: {Math.round((inputs.fixtureWattage * inputs.numberOfFixtures) / inputs.roomArea * 10) / 10} W/m²</div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Thermal Analysis</h2>
              
              <div className="space-y-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Heat Generation</div>
                  <div className="text-2xl font-bold text-red-600">
                    {Math.round(results.totalHeat)} BTU/hr
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {Math.round(results.totalHeat / 3.412)} W thermal
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Cooling Requirement</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(results.cooling)} BTU/hr
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    With 20% safety factor
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Ventilation Required</div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(results.ventilation)} CFM
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Minimum air changes
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {results.totalHeat > 5000 && <div>• Consider distributed cooling system</div>}
                  {results.cooling / inputs.roomArea > 100 && <div>• High cooling load - optimize fixture efficiency</div>}
                  <div>• Install temperature monitoring at canopy level</div>
                  <div>• Consider variable speed fans for efficiency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}