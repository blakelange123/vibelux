"use client"

import { useState, useEffect } from 'react'
import { TrendingUp, Leaf, DollarSign, AlertCircle, BarChart3, Calendar, Droplets, Sun } from 'lucide-react'

interface CropYieldPredictorProps {
  averagePPFD: number
  photoperiod: number
  temperature?: number
  humidity?: number
  co2?: number
  spectrum?: {
    red: number
    blue: number
    farRed: number
  }
  energyCostPerKWh?: number
}

interface CropModel {
  name: string
  scientificName: string
  baseYield: number // kg/m²/year
  optimalPPFD: number
  optimalDLI: number
  optimalTemp: number
  optimalHumidity: number
  optimalCO2: number
  pricePerKg: number
  growthDays: number
  waterUsage: number // L/kg
}

const cropModels: CropModel[] = [
  {
    name: 'Lettuce',
    scientificName: 'Lactuca sativa',
    baseYield: 20,
    optimalPPFD: 200,
    optimalDLI: 12,
    optimalTemp: 20,
    optimalHumidity: 65,
    optimalCO2: 800,
    pricePerKg: 4.5,
    growthDays: 35,
    waterUsage: 20
  },
  {
    name: 'Tomatoes',
    scientificName: 'Solanum lycopersicum',
    baseYield: 60,
    optimalPPFD: 400,
    optimalDLI: 20,
    optimalTemp: 24,
    optimalHumidity: 70,
    optimalCO2: 1000,
    pricePerKg: 3.2,
    growthDays: 90,
    waterUsage: 15
  },
  {
    name: 'Cannabis',
    scientificName: 'Cannabis sativa',
    baseYield: 0.5,
    optimalPPFD: 800,
    optimalDLI: 40,
    optimalTemp: 26,
    optimalHumidity: 55,
    optimalCO2: 1200,
    pricePerKg: 2000,
    growthDays: 120,
    waterUsage: 600
  },
  {
    name: 'Strawberries',
    scientificName: 'Fragaria × ananassa',
    baseYield: 8,
    optimalPPFD: 300,
    optimalDLI: 17,
    optimalTemp: 22,
    optimalHumidity: 70,
    optimalCO2: 900,
    pricePerKg: 12,
    growthDays: 60,
    waterUsage: 40
  },
  {
    name: 'Basil',
    scientificName: 'Ocimum basilicum',
    baseYield: 15,
    optimalPPFD: 250,
    optimalDLI: 15,
    optimalTemp: 25,
    optimalHumidity: 60,
    optimalCO2: 800,
    pricePerKg: 20,
    growthDays: 28,
    waterUsage: 25
  }
]

export function CropYieldPredictor({
  averagePPFD,
  photoperiod,
  temperature = 22,
  humidity = 65,
  co2 = 400,
  spectrum,
  energyCostPerKWh = 0.12
}: CropYieldPredictorProps) {
  const [selectedCrop, setSelectedCrop] = useState<CropModel>(cropModels[0])
  const [yieldPrediction, setYieldPrediction] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [energyCost, setEnergyCost] = useState(0)
  const [profit, setProfit] = useState(0)
  const [cyclesPerYear, setCyclesPerYear] = useState(0)

  const calculateDLI = () => {
    return (averagePPFD * photoperiod * 3600) / 1000000
  }

  useEffect(() => {
    // Calculate yield based on environmental factors
    const dli = calculateDLI()
    
    // DLI factor (0-1)
    const dliFactor = Math.min(dli / selectedCrop.optimalDLI, 1.2)
    
    // Temperature factor (0-1)
    const tempDiff = Math.abs(temperature - selectedCrop.optimalTemp)
    const tempFactor = Math.max(0, 1 - (tempDiff / 20))
    
    // Humidity factor (0-1)
    const humidityDiff = Math.abs(humidity - selectedCrop.optimalHumidity)
    const humidityFactor = Math.max(0, 1 - (humidityDiff / 40))
    
    // CO2 factor (0-1.5)
    const co2Factor = Math.min(co2 / selectedCrop.optimalCO2, 1.5)
    
    // Spectrum factor (0-1.2)
    let spectrumFactor = 1
    if (spectrum) {
      const redBlueRatio = spectrum.red / (spectrum.blue || 1)
      const idealRatio = selectedCrop.name === 'Cannabis' ? 3 : 2
      spectrumFactor = Math.max(0.8, 1 - Math.abs(redBlueRatio - idealRatio) * 0.1)
    }
    
    // Calculate final yield
    const environmentalFactor = (dliFactor * 0.4 + tempFactor * 0.2 + humidityFactor * 0.2 + co2Factor * 0.2) * spectrumFactor
    const adjustedYield = selectedCrop.baseYield * environmentalFactor
    
    // Calculate cycles per year
    const cycles = Math.floor(365 / selectedCrop.growthDays)
    setCyclesPerYear(cycles)
    
    // Calculate annual yield
    const annualYield = adjustedYield * cycles
    setYieldPrediction(annualYield)
    
    // Calculate revenue
    const annualRevenue = annualYield * selectedCrop.pricePerKg
    setRevenue(annualRevenue)
    
    // Calculate energy cost (simplified)
    const dailyEnergy = (averagePPFD / 5) * photoperiod * 0.001 // kWh
    const annualEnergyCost = dailyEnergy * 365 * energyCostPerKWh
    setEnergyCost(annualEnergyCost)
    
    // Calculate profit
    setProfit(annualRevenue - annualEnergyCost)
  }, [selectedCrop, averagePPFD, photoperiod, temperature, humidity, co2, spectrum, energyCostPerKWh])

  const getYieldIndicator = () => {
    const efficiency = yieldPrediction / selectedCrop.baseYield / cyclesPerYear
    if (efficiency > 0.9) return { color: 'text-green-600', label: 'Excellent' }
    if (efficiency > 0.7) return { color: 'text-yellow-600', label: 'Good' }
    return { color: 'text-red-600', label: 'Suboptimal' }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold">Crop Yield Predictor</h3>
      </div>

      {/* Crop Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Crop</label>
        <select
          value={selectedCrop.name}
          onChange={(e) => setSelectedCrop(cropModels.find(c => c.name === e.target.value) || cropModels[0])}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          {cropModels.map(crop => (
            <option key={crop.name} value={crop.name}>
              {crop.name} ({crop.scientificName})
            </option>
          ))}
        </select>
      </div>

      {/* Environmental Conditions */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Sun className="w-4 h-4" />
            <span>DLI</span>
          </div>
          <p className="text-lg font-semibold">{calculateDLI().toFixed(1)} mol/m²/day</p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Droplets className="w-4 h-4" />
            <span>CO₂</span>
          </div>
          <p className="text-lg font-semibold">{co2} ppm</p>
        </div>
      </div>

      {/* Yield Prediction */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Annual Yield Prediction</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Yield per m²</p>
                <p className="text-2xl font-bold text-green-600">{yieldPrediction.toFixed(1)} kg</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
            </div>
            <p className="text-sm mt-2">{cyclesPerYear} cycles/year</p>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Water Usage</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(yieldPrediction * selectedCrop.waterUsage).toFixed(0)} L
                </p>
              </div>
              <Droplets className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
            <p className="text-sm mt-2">{selectedCrop.waterUsage} L/kg</p>
          </div>
        </div>
      </div>

      {/* Financial Analysis */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Financial Analysis (per m²)</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Revenue
            </span>
            <span className="font-semibold text-green-600">
              ${revenue.toFixed(2)}/year
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-red-600" />
              Energy Cost
            </span>
            <span className="font-semibold text-red-600">
              -${energyCost.toFixed(2)}/year
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              Net Profit
            </span>
            <span className="font-bold text-indigo-600 text-lg">
              ${profit.toFixed(2)}/year
            </span>
          </div>
        </div>
      </div>

      {/* Optimization Tips */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
              Yield Status: <span className={getYieldIndicator().color}>{getYieldIndicator().label}</span>
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getYieldIndicator().label === 'Suboptimal' && 
                `Increase DLI to ${selectedCrop.optimalDLI} for optimal yields`}
              {getYieldIndicator().label === 'Good' && 
                'Environmental conditions are good but could be optimized'}
              {getYieldIndicator().label === 'Excellent' && 
                'Environmental conditions are optimal for this crop'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}