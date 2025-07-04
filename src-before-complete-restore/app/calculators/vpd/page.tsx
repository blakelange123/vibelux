'use client'

import { useState } from 'react'
import { calculateVPD } from '@/lib/lighting-calculations'
import Link from 'next/link'

export default function VPDCalculator() {
  const [inputs, setInputs] = useState({
    temperature: 26,
    humidity: 70
  })
  
  const [vpd, setVPD] = useState(calculateVPD(26, 70))

  const handleInputChange = (field: string, value: number) => {
    const newInputs = { ...inputs, [field]: value }
    setInputs(newInputs)
    
    const newVPD = calculateVPD(newInputs.temperature, newInputs.humidity)
    setVPD(newVPD)
  }

  const getVPDCategory = (vpd: number) => {
    if (vpd < 0.4) return { category: 'Too Low', color: 'blue', description: 'May cause calcium deficiency' }
    if (vpd < 0.8) return { category: 'Low', color: 'green', description: 'Good for seedlings' }
    if (vpd < 1.2) return { category: 'Optimal', color: 'green', description: 'Ideal for most plants' }
    if (vpd < 1.6) return { category: 'High', color: 'yellow', description: 'Good for mature plants' }
    return { category: 'Too High', color: 'red', description: 'May cause stress' }
  }

  const vpdInfo = getVPDCategory(vpd)

  // Generate VPD chart data
  const generateChartData = () => {
    const data = []
    for (let temp = 18; temp <= 32; temp += 2) {
      for (let rh = 40; rh <= 90; rh += 10) {
        const chartVPD = calculateVPD(temp, rh)
        data.push({ temp, rh, vpd: chartVPD })
      }
    }
    return data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/calculators" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Calculators
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">VPD Calculator</h1>
            <p className="text-gray-600">
              Calculate Vapor Pressure Deficit for optimal plant growth conditions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Environmental Conditions</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature: {inputs.temperature}°C
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="35"
                    step="0.5"
                    value={inputs.temperature}
                    onChange={(e) => handleInputChange('temperature', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>15°C</span>
                    <span>35°C</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relative Humidity: {inputs.humidity}%
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    step="1"
                    value={inputs.humidity}
                    onChange={(e) => handleInputChange('humidity', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>30%</span>
                    <span>90%</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">VPD Guidelines</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Seedlings:</span>
                    <span className="font-medium">0.4-0.8 kPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vegetative:</span>
                    <span className="font-medium">0.8-1.2 kPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flowering:</span>
                    <span className="font-medium">1.0-1.4 kPa</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">VPD Analysis</h2>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {vpd} kPa
                </div>
                <div className={`inline-block px-4 py-2 rounded-full text-white font-medium ${
                  vpdInfo.color === 'green' ? 'bg-green-500' :
                  vpdInfo.color === 'yellow' ? 'bg-yellow-500' :
                  vpdInfo.color === 'red' ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  {vpdInfo.category}
                </div>
                <p className="text-gray-600 mt-2">{vpdInfo.description}</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Transpiration Rate</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {vpd < 0.8 ? 'Low' : vpd < 1.2 ? 'Moderate' : 'High'}
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Nutrient Uptake</div>
                  <div className="text-lg font-semibold text-green-600">
                    {vpd < 0.4 ? 'Slow' : vpd < 1.6 ? 'Active' : 'Stressed'}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {vpd < 0.4 && (
                    <>
                      <div>• Increase temperature or decrease humidity</div>
                      <div>• Improve air circulation</div>
                    </>
                  )}
                  {vpd > 1.6 && (
                    <>
                      <div>• Increase humidity or decrease temperature</div>
                      <div>• Monitor for stress signs</div>
                    </>
                  )}
                  {vpd >= 0.4 && vpd <= 1.6 && (
                    <div>• Conditions are optimal for growth</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}