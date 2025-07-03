"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  Calculator, 
  Lightbulb, 
  Sun, 
  Zap, 
  Clock, 
  TrendingUp,
  DollarSign,
  Leaf,
  Map,
  ArrowRight,
  Sparkles,
  Droplets,
  Wind,
  Grid3x3,
  BarChart3,
  Thermometer,
  Activity,
  Layers,
  Beaker,
  Calendar
} from 'lucide-react'

export default function CalculatorsPage() {
  const [ppfd, setPpfd] = useState(500)
  const [photoperiod, setPhotoperiod] = useState(16)
  const [targetDLI, setTargetDLI] = useState(20)
  const [dliPhotoperiod, setDliPhotoperiod] = useState(16)
  const [currentDLI, setCurrentDLI] = useState(15)
  const [selectedCrop, setSelectedCrop] = useState('lettuce')
  const [wattage, setWattage] = useState(600)
  const [fixtureCount, setFixtureCount] = useState(10)
  const [hoursPerDay, setHoursPerDay] = useState(16)
  const [electricityRate, setElectricityRate] = useState(0.12)
  
  // VPD Calculator states
  const [vpdTemp, setVpdTemp] = useState(25)
  const [vpdHumidity, setVpdHumidity] = useState(60)
  
  // Kozai's SLA Calculator states
  const [leafArea, setLeafArea] = useState(250)
  const [dryWeight, setDryWeight] = useState(2.5)
  
  // LAI Calculator states
  const [totalLeafArea, setTotalLeafArea] = useState(4.5)
  const [groundArea, setGroundArea] = useState(1)
  
  // Light Use Efficiency states
  const [co2Fixed, setCo2Fixed] = useState(0.65)
  const [dliForEfficiency, setDliForEfficiency] = useState(20)

  // Calculations
  const calculatedDLI = (ppfd * photoperiod * 0.0036).toFixed(1)
  const requiredPPFD = Math.round(targetDLI / (dliPhotoperiod * 0.0036))
  const totalPower = wattage * fixtureCount
  const dailyEnergy = (totalPower * hoursPerDay) / 1000
  const dailyCost = dailyEnergy * electricityRate
  const monthlyCost = dailyCost * 30
  const yearlyCost = dailyCost * 365
  
  // VPD Calculation
  const calculateVPD = (temp: number, humidity: number) => {
    const saturationVaporPressure = 0.6108 * Math.exp(17.27 * temp / (temp + 237.3))
    const actualVaporPressure = saturationVaporPressure * (humidity / 100)
    const vpd = saturationVaporPressure - actualVaporPressure
    return Math.round(vpd * 100) / 100
  }
  
  const vpdValue = calculateVPD(vpdTemp, vpdHumidity)
  
  // SLA Calculation
  const slaValue = leafArea / dryWeight
  
  // LAI Calculation
  const laiValue = totalLeafArea / groundArea
  
  // Light Use Efficiency Calculation
  const lightUseEfficiency = (co2Fixed / dliForEfficiency) * 100

  // Crop data
  const cropData: Record<string, { min: number, optimal: number, max: number, photoperiodVeg: number, photoperiodFlower: number }> = {
    lettuce: { min: 12, optimal: 17, max: 25, photoperiodVeg: 16, photoperiodFlower: 12 },
    spinach: { min: 10, optimal: 15, max: 20, photoperiodVeg: 14, photoperiodFlower: 12 },
    kale: { min: 12, optimal: 17, max: 25, photoperiodVeg: 16, photoperiodFlower: 12 },
    basil: { min: 12, optimal: 16, max: 22, photoperiodVeg: 16, photoperiodFlower: 12 },
    tomato: { min: 20, optimal: 30, max: 40, photoperiodVeg: 18, photoperiodFlower: 12 },
    pepper: { min: 20, optimal: 30, max: 40, photoperiodVeg: 18, photoperiodFlower: 12 },
    cucumber: { min: 20, optimal: 30, max: 35, photoperiodVeg: 18, photoperiodFlower: 12 },
    strawberry: { min: 15, optimal: 20, max: 25, photoperiodVeg: 16, photoperiodFlower: 12 },
    cannabis_veg: { min: 18, optimal: 24, max: 35, photoperiodVeg: 18, photoperiodFlower: 12 },
    cannabis_flower: { min: 30, optimal: 45, max: 60, photoperiodVeg: 18, photoperiodFlower: 12 },
    microgreens: { min: 8, optimal: 12, max: 15, photoperiodVeg: 16, photoperiodFlower: 16 },
    wheatgrass: { min: 8, optimal: 12, max: 15, photoperiodVeg: 16, photoperiodFlower: 16 },
    petunia: { min: 10, optimal: 15, max: 20, photoperiodVeg: 14, photoperiodFlower: 12 },
    chrysanthemum: { min: 15, optimal: 20, max: 25, photoperiodVeg: 16, photoperiodFlower: 12 },
    orchid: { min: 5, optimal: 10, max: 15, photoperiodVeg: 12, photoperiodFlower: 12 }
  }

  const currentCropData = cropData[selectedCrop]
  const dliDeficit = currentCropData.optimal - Number(currentDLI)
  const dliPosition = ((Number(currentDLI) - currentCropData.min) / (currentCropData.max - currentCropData.min)) * 100

  const getCropStatus = () => {
    if (Number(currentDLI) < currentCropData.min) return { status: 'Critical', color: 'red', icon: '⚠️' }
    if (Number(currentDLI) < currentCropData.optimal) return { status: 'Deficient', color: 'yellow', icon: '↓' }
    if (Number(currentDLI) > currentCropData.max) return { status: 'Excessive', color: 'orange', icon: '↑' }
    return { status: 'Optimal', color: 'green', icon: '✓' }
  }

  const cropStatus = getCropStatus()

  const getPPFDGradientPosition = () => {
    return (ppfd / 2000) * 100
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Dark gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-green-900/20" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/25">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Lighting Calculators
                </h1>
                <p className="text-gray-400 mt-1">Professional tools for PPFD, DLI, and energy calculations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section - Heat Map */}
        <div className="container mx-auto px-4 py-8">
          <Link href="/calculators/ppfd-map">
            <div className="relative group cursor-pointer">
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
              
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-700 hover:border-gray-600 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                        <Map className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">Advanced Tool</span>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">PPFD Heat Map Visualizer</h2>
                    <p className="text-gray-300 text-lg mb-4">
                      Create interactive 3D heat maps of your lighting layout. Visualize coverage, uniformity, and optimize fixture placement.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span>Multi-fixture support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span>Real-time uniformity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span>Export ready</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Heat map preview */}
                  <div className="hidden lg:block">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-red-500 rounded-xl blur-2xl opacity-50" />
                      <div className="relative bg-gray-900/50 backdrop-blur rounded-xl p-4 border border-gray-700">
                        <div className="grid grid-cols-8 gap-1">
                          {Array.from({ length: 64 }, (_, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-sm animate-pulse"
                              style={{
                                backgroundColor: `hsl(${280 - i * 3}, 70%, ${50 + (i % 8) * 5}%)`,
                                animationDelay: `${i * 50}ms`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-white group-hover:gap-3 transition-all">
                  <span className="font-medium">Open Heat Map Tool</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Calculator Grid */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* PPFD to DLI Calculator */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-br from-purple-600/80 to-pink-600/80 p-6 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">PPFD to DLI Calculator</h2>
                      <p className="text-purple-100 text-sm">Convert photon flux to daily light integral</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">PPFD (μmol/m²/s)</label>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        value={ppfd}
                        onChange={(e) => setPpfd(Number(e.target.value))}
                        className="w-full h-3 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 0%, #8B5CF6 50%, #EF4444 100%)`
                        }}
                      />
                      <div 
                        className="absolute -top-8 transform -translate-x-1/2 bg-purple-600 text-white text-xs rounded py-1 px-2"
                        style={{ left: `${getPPFDGradientPosition()}%` }}
                      >
                        {ppfd}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low Light</span>
                      <span>Seedlings</span>
                      <span>Vegetative</span>
                      <span>Flowering</span>
                      <span>High Light</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Photoperiod (hours)</label>
                    <div className="grid grid-cols-6 gap-2">
                      {[8, 12, 14, 16, 18, 24].map((hours) => (
                        <button
                          key={hours}
                          onClick={() => setPhotoperiod(hours)}
                          className={`py-2 rounded-lg font-medium transition-all ${
                            photoperiod === hours
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                          }`}
                        >
                          {hours}h
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
                    <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white shadow-2xl">
                      <p className="text-purple-100 mb-2">Daily Light Integral</p>
                      <p className="text-6xl font-bold mb-2">{calculatedDLI}</p>
                      <p className="text-purple-100">mol/m²/day</p>
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-sm text-purple-200">
                          {ppfd} μmol/m²/s × {photoperiod} hours × 0.0036
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DLI to PPFD Calculator */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-3xl blur-xl" />
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-br from-green-600/80 to-emerald-600/80 p-6 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                      <Sun className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">DLI to PPFD Calculator</h2>
                      <p className="text-green-100 text-sm">Calculate required PPFD for target DLI</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target DLI (mol/m²/day)</label>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[
                        { label: 'Low', value: 12 },
                        { label: 'Medium', value: 20 },
                        { label: 'High', value: 30 },
                        { label: 'Very High', value: 40 }
                      ].map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => setTargetDLI(preset.value)}
                          className={`py-2 rounded-lg text-xs font-medium transition-all ${
                            targetDLI === preset.value
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                          }`}
                        >
                          {preset.label}
                          <div className="text-xs opacity-80">{preset.value}</div>
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="60"
                        value={targetDLI}
                        onChange={(e) => setTargetDLI(Number(e.target.value))}
                        className="w-full h-3 bg-gradient-to-r from-yellow-600 via-green-600 to-red-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <div 
                        className="absolute -top-8 transform -translate-x-1/2 bg-green-600 text-white text-xs rounded py-1 px-2"
                        style={{ left: `${(targetDLI / 60) * 100}%` }}
                      >
                        {targetDLI}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>15</span>
                      <span>30</span>
                      <span>45</span>
                      <span>60</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Photoperiod (hours)</label>
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {[8, 12, 14, 16, 18, 24].map((hours) => (
                        <button
                          key={hours}
                          onClick={() => setDliPhotoperiod(hours)}
                          className={`py-2 rounded-lg font-medium transition-all ${
                            dliPhotoperiod === hours
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                          }`}
                        >
                          {hours}h
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={dliPhotoperiod}
                        onChange={(e) => setDliPhotoperiod(Number(e.target.value))}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div 
                        className="absolute -top-8 transform -translate-x-1/2 bg-green-600 text-white text-xs rounded py-1 px-2"
                        style={{ left: `${((dliPhotoperiod - 1) / 23) * 100}%` }}
                      >
                        {dliPhotoperiod}h
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1h</span>
                      <span>6h</span>
                      <span>12h</span>
                      <span>18h</span>
                      <span>24h</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
                    <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white shadow-2xl">
                      <p className="text-green-100 mb-2">Required PPFD</p>
                      <p className="text-6xl font-bold mb-2 transition-all duration-300">{requiredPPFD}</p>
                      <p className="text-green-100 mb-4">μmol/m²/s</p>
                      
                      {/* Visual indicator */}
                      <div className="mb-4">
                        {requiredPPFD < 300 && (
                          <p className="text-sm text-green-200 bg-green-800/30 rounded-lg px-3 py-2">💡 Low intensity - Suitable for seedlings</p>
                        )}
                        {requiredPPFD >= 300 && requiredPPFD < 600 && (
                          <p className="text-sm text-green-200 bg-green-800/30 rounded-lg px-3 py-2">🌱 Medium intensity - Good for vegetative growth</p>
                        )}
                        {requiredPPFD >= 600 && requiredPPFD < 1000 && (
                          <p className="text-sm text-green-200 bg-green-800/30 rounded-lg px-3 py-2">🌺 High intensity - Ideal for flowering</p>
                        )}
                        {requiredPPFD >= 1000 && (
                          <p className="text-sm text-green-200 bg-green-800/30 rounded-lg px-3 py-2">☀️ Very high intensity - Maximum production</p>
                        )}
                      </div>
                      
                      <div className="pt-4 border-t border-white/20">
                        <p className="text-sm text-green-200">
                          {targetDLI} mol ÷ ({dliPhotoperiod}h × 0.0036) = {requiredPPFD} μmol/m²/s
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crop DLI Analysis */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-3xl blur-xl" />
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-br from-emerald-600/80 to-teal-600/80 p-6 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                      <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Crop DLI Analysis</h2>
                      <p className="text-emerald-100 text-sm">Compare current DLI to crop requirements</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Crop</label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    >
                      <option value="lettuce" className="bg-gray-900">Lettuce (Leafy Greens)</option>
                      <option value="spinach" className="bg-gray-900">Spinach (Leafy Greens)</option>
                      <option value="kale" className="bg-black">Kale (Leafy Greens)</option>
                      <option value="basil" className="bg-black">Basil (Herbs)</option>
                      <option value="tomato" className="bg-black">Tomato (Fruiting)</option>
                      <option value="pepper" className="bg-black">Pepper (Fruiting)</option>
                      <option value="cucumber" className="bg-black">Cucumber (Fruiting)</option>
                      <option value="strawberry" className="bg-black">Strawberry (Fruiting)</option>
                      <option value="cannabis_veg" className="bg-black">Cannabis Veg (Cannabis)</option>
                      <option value="cannabis_flower" className="bg-black">Cannabis Flower (Cannabis)</option>
                      <option value="microgreens" className="bg-black">Microgreens (Microgreens)</option>
                      <option value="wheatgrass" className="bg-black">Wheatgrass (Microgreens)</option>
                      <option value="petunia" className="bg-black">Petunia (Ornamentals)</option>
                      <option value="chrysanthemum" className="bg-black">Chrysanthemum (Ornamentals)</option>
                      <option value="orchid" className="bg-black">Orchid (Ornamentals)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Current DLI (mol/m²/day)</label>
                    <input
                      type="number"
                      value={currentDLI}
                      onChange={(e) => setCurrentDLI(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <div className="mb-2 flex justify-between text-xs text-gray-400">
                      <span>Minimum ({currentCropData.min})</span>
                      <span className="font-medium text-white">Optimal ({currentCropData.optimal})</span>
                      <span>Maximum ({currentCropData.max})</span>
                    </div>
                    <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-gradient-to-r from-red-500 to-yellow-500"
                        style={{ left: '0%', width: `${(currentCropData.min / currentCropData.max) * 100}%` }}
                      />
                      <div 
                        className="absolute h-full bg-gradient-to-r from-green-500 to-green-600"
                        style={{ 
                          left: `${(currentCropData.min / currentCropData.max) * 100}%`, 
                          width: `${((currentCropData.optimal - currentCropData.min) / currentCropData.max) * 100}%` 
                        }}
                      />
                      <div 
                        className="absolute h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        style={{ 
                          left: `${(currentCropData.optimal / currentCropData.max) * 100}%`, 
                          width: `${((currentCropData.max - currentCropData.optimal) / currentCropData.max) * 100}%` 
                        }}
                      />
                      <div 
                        className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${dliPosition}%` }}
                      >
                        <div className="relative">
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs rounded-full px-2 py-1 font-medium">
                            {currentDLI}
                          </div>
                          <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-xl p-6 border-2 ${
                    cropStatus.color === 'green' ? 'bg-green-500/10 border-green-500/30' :
                    cropStatus.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    cropStatus.color === 'orange' ? 'bg-orange-500/10 border-orange-500/30' :
                    'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        cropStatus.color === 'green' ? 'bg-green-500/20' :
                        cropStatus.color === 'yellow' ? 'bg-yellow-500/20' :
                        cropStatus.color === 'orange' ? 'bg-orange-500/20' :
                        'bg-red-500/20'
                      }`}>
                        {cropStatus.icon}
                      </div>
                      <h4 className={`font-semibold text-lg ${
                        cropStatus.color === 'green' ? 'text-green-400' :
                        cropStatus.color === 'yellow' ? 'text-yellow-400' :
                        cropStatus.color === 'orange' ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {cropStatus.status} Light Levels
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Target DLI:</span>
                        <p className="font-semibold text-lg text-white">{currentCropData.optimal} mol/m²/day</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Deficit:</span>
                        <p className="font-semibold text-lg text-white">
                          {dliDeficit.toFixed(1)} mol ({((dliDeficit / currentCropData.optimal) * 100).toFixed(0)}%)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-xl p-4 border border-blue-500/20">
                    <p className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Photoperiod Recommendation
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <span className="text-gray-400">Vegetative:</span>
                        <p className="font-semibold text-white">{currentCropData.photoperiodVeg} hours</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <span className="text-gray-400">Flowering:</span>
                        <p className="font-semibold text-white">{currentCropData.photoperiodFlower} hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Energy Cost Calculator */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-3xl blur-xl" />
              <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                <div className="bg-gradient-to-br from-yellow-600/80 to-orange-600/80 p-6 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Energy Cost Calculator</h2>
                      <p className="text-yellow-100 text-sm">Estimate lighting electricity costs</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Fixture Wattage</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={wattage}
                          onChange={(e) => setWattage(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
                        />
                        <span className="absolute right-3 top-3 text-gray-500">W</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Number of Fixtures</label>
                      <input
                        type="number"
                        value={fixtureCount}
                        onChange={(e) => setFixtureCount(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Daily Hours</label>
                      <input
                        type="number"
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">$/kWh</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={electricityRate}
                          onChange={(e) => setElectricityRate(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 rounded-xl p-4 text-center border border-yellow-500/20">
                      <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-xs text-yellow-400 mb-1">Daily Cost</p>
                      <p className="text-2xl font-bold text-white">${dailyCost.toFixed(2)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/20 rounded-xl p-4 text-center border border-orange-500/20">
                      <TrendingUp className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <p className="text-xs text-orange-400 mb-1">Monthly Cost</p>
                      <p className="text-2xl font-bold text-white">${monthlyCost.toFixed(2)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-xl p-4 text-center border border-red-500/20">
                      <DollarSign className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <p className="text-xs text-red-400 mb-1">Yearly Cost</p>
                      <p className="text-2xl font-bold text-white">${yearlyCost.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 space-y-2 border border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total System Power:</span>
                      <span className="font-semibold text-white">{totalPower.toLocaleString()}W</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Daily Energy:</span>
                      <span className="font-semibold text-white">{dailyEnergy.toFixed(2)} kWh</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Monthly Energy:</span>
                      <span className="font-semibold text-white">{(dailyEnergy * 30).toFixed(2)} kWh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference Guide */}
        <div className="container mx-auto px-4 py-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-green-900/50 rounded-3xl blur-xl" />
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700 p-8">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400 mb-6 text-center">
                Quick Reference Guide
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Common PPFD Levels
                  </h4>
                  <ul className="text-sm space-y-2 text-gray-300">
                    <li className="flex justify-between">
                      <span>Seedlings:</span>
                      <span className="font-medium text-white">100-300</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Vegetative:</span>
                      <span className="font-medium text-white">300-600</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Flowering:</span>
                      <span className="font-medium text-white">600-1000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>High Light:</span>
                      <span className="font-medium text-white">1000+</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                    <Sun className="w-5 h-5 text-yellow-400" />
                    DLI Categories
                  </h4>
                  <ul className="text-sm space-y-2 text-gray-300">
                    <li className="flex justify-between">
                      <span>Low:</span>
                      <span className="font-medium text-white">5-10</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Medium:</span>
                      <span className="font-medium text-white">10-20</span>
                    </li>
                    <li className="flex justify-between">
                      <span>High:</span>
                      <span className="font-medium text-white">20-30</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Very High:</span>
                      <span className="font-medium text-white">30+</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                    <Calculator className="w-5 h-5 text-yellow-400" />
                    Key Formulas
                  </h4>
                  <ul className="text-sm space-y-2 text-gray-300">
                    <li>DLI = PPFD × Hours × 0.0036</li>
                    <li>PPFD = DLI ÷ (Hours × 0.0036)</li>
                    <li>1 mol = 1,000,000 μmol</li>
                    <li>Hours = DLI ÷ (PPFD × 0.0036)</li>
                  </ul>
                </div>

                <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                    <Leaf className="w-5 h-5 text-green-400" />
                    Common Crop DLI
                  </h4>
                  <ul className="text-sm space-y-2 text-gray-300">
                    <li className="flex justify-between">
                      <span>Leafy Greens:</span>
                      <span className="font-medium text-white">12-17</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Herbs:</span>
                      <span className="font-medium text-white">10-16</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Fruiting:</span>
                      <span className="font-medium text-white">20-30</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Cannabis:</span>
                      <span className="font-medium text-white">25-50</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Advanced Calculators Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-white mb-8">Advanced Calculators</h2>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* VPD Calculator */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-3xl blur-xl" />
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-br from-cyan-600/80 to-blue-600/80 p-6 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">VPD Calculator</h2>
                    <p className="text-cyan-100 text-sm">Vapor Pressure Deficit for optimal growth</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Temperature: {vpdTemp}°C</label>
                  <input
                    type="range"
                    min="10"
                    max="35"
                    value={vpdTemp}
                    onChange={(e) => setVpdTemp(Number(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-blue-600 to-red-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10°C</span>
                    <span>25°C</span>
                    <span>35°C</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Relative Humidity: {vpdHumidity}%</label>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={vpdHumidity}
                    onChange={(e) => setVpdHumidity(Number(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-yellow-600 to-cyan-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>20%</span>
                    <span>60%</span>
                    <span>90%</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl p-8 text-center text-white">
                  <p className="text-cyan-100 mb-2">VPD Value</p>
                  <p className="text-6xl font-bold mb-2">{vpdValue}</p>
                  <p className="text-cyan-100">kPa</p>
                  <p className="text-sm text-cyan-200 mt-4">
                    {vpdValue < 0.8 ? 'Too Low - Increase temperature or decrease humidity' :
                     vpdValue > 1.2 ? 'Too High - Decrease temperature or increase humidity' :
                     'Optimal Range: 0.8-1.2 kPa'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kozai's SLA (Specific Leaf Area) Calculator */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-3xl blur-xl" />
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-600/80 to-green-600/80 p-6 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Kozai's SLA Calculator</h2>
                    <p className="text-green-100 text-sm">Specific Leaf Area for plant efficiency</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Leaf Area (cm²)</label>
                  <input
                    type="number"
                    value={leafArea}
                    onChange={(e) => setLeafArea(Number(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Dry Weight (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dryWeight}
                    onChange={(e) => setDryWeight(Number(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-8 text-center text-white">
                  <p className="text-green-100 mb-2">SLA Value</p>
                  <p className="text-6xl font-bold mb-2">{slaValue.toFixed(1)}</p>
                  <p className="text-green-100">cm²/g</p>
                  <p className="text-sm text-green-200 mt-4">
                    {slaValue < 80 ? 'Low SLA - Thick leaves, slow growth' :
                     slaValue > 150 ? 'High SLA - Very thin leaves, fast growth' :
                     'Optimal SLA - Balanced growth'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LAI (Leaf Area Index) Calculator */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-3xl blur-xl" />
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-600/80 to-purple-600/80 p-6 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                    <Map className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">LAI Calculator</h2>
                    <p className="text-indigo-100 text-sm">Leaf Area Index for canopy optimization</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Total Leaf Area (m²)</label>
                  <input
                    type="number"
                    value={totalLeafArea}
                    onChange={(e) => setTotalLeafArea(Number(e.target.value) || 0)}
                    step="0.1"
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ground Area (m²)</label>
                  <input
                    type="number"
                    value={groundArea}
                    onChange={(e) => setGroundArea(Number(e.target.value) || 1)}
                    step="0.1"
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white">
                  <p className="text-indigo-100 mb-2">LAI</p>
                  <p className="text-6xl font-bold mb-2">{laiValue.toFixed(1)}</p>
                  <p className="text-indigo-100">m²/m²</p>
                  <p className="text-sm text-indigo-200 mt-4">
                    {laiValue < 3 ? 'Low LAI - Increase plant density' :
                     laiValue > 5 ? 'High LAI - Risk of self-shading' :
                     'Optimal LAI for light interception'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Photosynthetic Efficiency Calculator */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-rose-600/20 rounded-3xl blur-xl" />
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-br from-pink-600/80 to-rose-600/80 p-6 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Light Use Efficiency</h2>
                    <p className="text-pink-100 text-sm">Kozai's photosynthetic efficiency model</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">CO₂ Fixed (mol/m²/day)</label>
                  <input
                    type="number"
                    value={co2Fixed}
                    onChange={(e) => setCo2Fixed(Number(e.target.value) || 0)}
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Daily Light Integral (mol/m²/day)</label>
                  <input
                    type="number"
                    value={dliForEfficiency}
                    onChange={(e) => setDliForEfficiency(Number(e.target.value) || 1)}
                    step="0.1"
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl p-8 text-center text-white">
                  <p className="text-pink-100 mb-2">Light Use Efficiency</p>
                  <p className="text-6xl font-bold mb-2">{lightUseEfficiency.toFixed(2)}</p>
                  <p className="text-pink-100">%</p>
                  <p className="text-sm text-pink-200 mt-4">
                    {lightUseEfficiency > 4.6 ? 'Above theoretical max - Check inputs' :
                     lightUseEfficiency < 2 ? 'Low efficiency - Optimize conditions' :
                     'Good efficiency (Max: 4.6% for C3 plants)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Calculators Grid - Organized by Category */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">All Available Calculators</h2>
          <p className="text-gray-400 text-center mb-12">Professional tools for lighting design, analysis, and optimization</p>
          
          {/* Basic Calculators */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Calculator className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Basic Calculators</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Electrical Estimator */}
              <Link href="/calculators/electrical-estimator" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-yellow-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="font-semibold text-white">Electrical Estimator</h3>
                  </div>
                  <p className="text-sm text-gray-400">Complete electrical installation cost estimation</p>
                </div>
              </Link>
              {/* PPFD Map */}
              <Link href="/calculators/ppfd-map" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-purple-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Map className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white">PPFD Heat Map</h3>
                  </div>
                  <p className="text-sm text-gray-400">Visualize light distribution and uniformity in 3D</p>
                </div>
              </Link>

              {/* Coverage Area Calculator */}
              <Link href="/calculators/coverage-area" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-indigo-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Grid3x3 className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="font-semibold text-white">Coverage Area</h3>
                  </div>
                  <p className="text-sm text-gray-400">Optimize fixture layout and calculate spacing</p>
                </div>
              </Link>

              {/* Climate-Integrated Design */}
              <Link href="/design/climate-integrated" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-cyan-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Wind className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-white">Climate Design</h3>
                  </div>
                  <p className="text-sm text-gray-400">Lighting design with environmental analysis</p>
                </div>
              </Link>

              {/* Energy Cost (inline on this page) */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-700 p-6 opacity-90 relative">
                <div className="absolute top-2 right-2 bg-gray-800 px-2 py-1 rounded text-xs text-gray-400">On this page</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="font-semibold text-white">Energy Cost</h3>
                </div>
                <p className="text-sm text-gray-400">Calculate electricity costs for lighting systems</p>
              </div>

              {/* DLI Calculator (inline on this page) */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-700 p-6 opacity-90 relative">
                <div className="absolute top-2 right-2 bg-gray-800 px-2 py-1 rounded text-xs text-gray-400">On this page</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Sun className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white">PPFD ↔ DLI</h3>
                </div>
                <p className="text-sm text-gray-400">Convert between PPFD and DLI values</p>
              </div>
            </div>
          </div>

          {/* Financial Calculators */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Financial Analysis</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Advanced ROI Calculator */}
              <Link href="/calculators/roi" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-yellow-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="font-semibold text-white">Advanced ROI</h3>
                  </div>
                  <p className="text-sm text-gray-400">Detailed payback analysis with seasonal pricing</p>
                </div>
              </Link>

              {/* TCO Calculator */}
              <Link href="/tco-calculator" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-blue-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white">TCO Analysis</h3>
                  </div>
                  <p className="text-sm text-gray-400">Total cost of ownership comparison</p>
                </div>
              </Link>

              {/* Equipment Leasing */}
              <Link href="/equipment-leasing" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-orange-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <DollarSign className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-white">Equipment Leasing</h3>
                  </div>
                  <p className="text-sm text-gray-400">Compare leasing vs buying options</p>
                </div>
              </Link>

              {/* Rebate Calculator */}
              <Link href="/rebate-calculator" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-emerald-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-white">Rebate Calculator</h3>
                  </div>
                  <p className="text-sm text-gray-400">Find utility rebates and incentives</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Environmental Calculators */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Wind className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Environmental Control</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Environmental Control Calculator */}
              <Link href="/calculators/environmental-control" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-cyan-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Wind className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-white">Environmental Control</h3>
                  </div>
                  <p className="text-sm text-gray-400">Complete HVAC sizing and energy analysis</p>
                </div>
              </Link>

              {/* Transpiration Calculator */}
              <Link href="/calculators/transpiration" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-blue-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Droplets className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white">Transpiration</h3>
                  </div>
                  <p className="text-sm text-gray-400">Penman-Monteith water use calculations</p>
                </div>
              </Link>

              {/* Psychrometric Calculator */}
              <Link href="/calculators/psychrometric" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-purple-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white">Psychrometric</h3>
                  </div>
                  <p className="text-sm text-gray-400">Air properties and plant health assessment</p>
                </div>
              </Link>

              {/* CO2 Enrichment Calculator */}
              <Link href="/calculators/co2-enrichment" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-green-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Wind className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-white">CO₂ Enrichment</h3>
                  </div>
                  <p className="text-sm text-gray-400">Calculate CO₂ requirements and costs</p>
                </div>
              </Link>

              {/* Heat Load Calculator */}
              <Link href="/calculators/heat-load" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-red-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Thermometer className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="font-semibold text-white">Heat Load</h3>
                  </div>
                  <p className="text-sm text-gray-400">HVAC and cooling requirements</p>
                </div>
              </Link>

              {/* VPD Calculator */}
              <Link href="/calculators/vpd" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-cyan-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Droplets className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-white">VPD Calculator</h3>
                  </div>
                  <p className="text-sm text-gray-400">Vapor pressure deficit optimization</p>
                </div>
              </Link>

              {/* Environmental Monitoring */}
              <Link href="/calculators/environmental-monitoring" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-green-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-white">Environmental Monitoring</h3>
                  </div>
                  <p className="text-sm text-gray-400">Real-time environmental analysis and alerts</p>
                </div>
              </Link>

              {/* Environmental Simulator */}
              <Link href="/calculators/environmental-simulator" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-purple-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white">Environmental Simulator</h3>
                  </div>
                  <p className="text-sm text-gray-400">Complete 24-hour environmental simulation</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Plant Science Calculators */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Leaf className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Plant Science</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Photosynthetic YPF */}
              <Link href="/photosynthetic-calculator" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-lime-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-lime-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-lime-400" />
                    </div>
                    <h3 className="font-semibold text-white">YPF Calculator</h3>
                  </div>
                  <p className="text-sm text-gray-400">Yield photon flux spectrum analysis</p>
                </div>
              </Link>

              {/* Nutrient Dosing */}
              <Link href="/nutrient-dosing" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-teal-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-teal-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Leaf className="w-6 h-6 text-teal-400" />
                    </div>
                    <h3 className="font-semibold text-white">Nutrient Dosing</h3>
                  </div>
                  <p className="text-sm text-gray-400">Light-based nutrient calculations</p>
                </div>
              </Link>

              {/* Fertilizer Formulator */}
              <Link href="/calculators/fertilizer" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-green-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Beaker className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-white">Fertilizer Formulator</h3>
                  </div>
                  <p className="text-sm text-gray-400">Liquid fertilizer recipe calculator</p>
                </div>
              </Link>

              {/* Production Planner */}
              <Link href="/calculators/production-planner" prefetch={false}>
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-purple-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white">Production Planner</h3>
                  </div>
                  <p className="text-sm text-gray-400">Week-by-week crop scheduling system</p>
                </div>
              </Link>

              {/* SLA Calculator (inline) */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-700 p-6 opacity-90 relative">
                <div className="absolute top-2 right-2 bg-gray-800 px-2 py-1 rounded text-xs text-gray-400">On this page</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Leaf className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white">Kozai's SLA</h3>
                </div>
                <p className="text-sm text-gray-400">Specific leaf area analysis</p>
              </div>

              {/* LAI Calculator (inline) */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-700 p-6 opacity-90 relative">
                <div className="absolute top-2 right-2 bg-gray-800 px-2 py-1 rounded text-xs text-gray-400">On this page</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Layers className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-white">LAI Calculator</h3>
                </div>
                <p className="text-sm text-gray-400">Leaf area index for canopy optimization</p>
              </div>

              {/* Light Use Efficiency (inline) */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-700 p-6 opacity-90 relative">
                <div className="absolute top-2 right-2 bg-gray-800 px-2 py-1 rounded text-xs text-gray-400">On this page</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-pink-500/10 rounded-lg">
                    <Sparkles className="w-6 h-6 text-pink-400" />
                  </div>
                  <h3 className="font-semibold text-white">Light Efficiency</h3>
                </div>
                <p className="text-sm text-gray-400">Photosynthetic efficiency analysis</p>
              </div>

              {/* Crop DLI Analysis (inline) */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-700 p-6 opacity-90 relative">
                <div className="absolute top-2 right-2 bg-gray-800 px-2 py-1 rounded text-xs text-gray-400">On this page</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Leaf className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white">Crop DLI Analysis</h3>
                </div>
                <p className="text-sm text-gray-400">Compare DLI to crop requirements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}