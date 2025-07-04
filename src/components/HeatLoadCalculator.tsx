'use client'

import { useState, useEffect } from 'react'
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Zap,
  AlertTriangle,
  TrendingUp,
  Calculator,
  Snowflake,
  Flame,
  Info,
  Sun
} from 'lucide-react'

interface HeatLoadCalculatorProps {
  roomDimensions?: {
    width: number // feet
    height: number // feet  
    depth: number // feet (ceiling height)
  }
  fixtures?: {
    wattage: number
    enabled: boolean
  }[]
  targetTemperature?: number // °F
  outsideTemperature?: number // °F
}

interface HeatLoadSources {
  lighting: number // BTU/hr
  solarGain: number // BTU/hr
  equipment: number // BTU/hr
  infiltration: number // BTU/hr
  people: number // BTU/hr
  plants: number // BTU/hr (transpiration)
  total: number // BTU/hr
}

interface HVACRequirements {
  coolingCapacity: number // tons
  heatingCapacity: number // BTU/hr
  dehumidification: number // pints/day
  airflow: number // CFM
  recommendations: string[]
}

export function HeatLoadCalculator({
  roomDimensions = { width: 20, height: 40, depth: 10 },
  fixtures = [],
  targetTemperature = 75,
  outsideTemperature: initialOutsideTemp = 95
}: HeatLoadCalculatorProps) {
  const [insulationType, setInsulationType] = useState<'poor' | 'average' | 'good'>('average')
  const [glazingArea, setGlazingArea] = useState(0) // sq ft
  const [glazingType, setGlazingType] = useState<'single' | 'double' | 'triple'>('double')
  const [occupants, setOccupants] = useState(2)
  const [otherEquipment, setOtherEquipment] = useState(500) // watts
  const [plantDensity, setPlantDensity] = useState(0.8) // plants per sq ft
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [airChangesPerHour, setAirChangesPerHour] = useState(1.0)
  const [targetHumidity, setTargetHumidity] = useState(60) // %
  const [outsideHumidity, setOutsideHumidity] = useState(40) // %
  const [outsideTemperature, setOutsideTemperature] = useState(initialOutsideTemp)

  // Calculate room volume
  const roomVolume = roomDimensions.width * roomDimensions.height * roomDimensions.depth
  const roomArea = roomDimensions.width * roomDimensions.height

  // R-values for insulation types
  const rValues = {
    poor: 10,
    average: 20,
    good: 30
  }

  // U-values for glazing (BTU/hr·ft²·°F)
  const uValues = {
    single: 1.04,
    double: 0.48,
    triple: 0.31
  }

  // Calculate heat loads
  const calculateHeatLoads = (): HeatLoadSources => {
    // 1. Lighting heat load (watts to BTU/hr)
    const totalLightingWatts = fixtures
      .filter(f => f.enabled)
      .reduce((sum, f) => sum + f.wattage, 0)
    const lightingBTU = totalLightingWatts * 3.412

    // 2. Solar gain through glazing
    const solarHeatGainCoefficient = {
      single: 0.86,
      double: 0.56,
      triple: 0.40
    }[glazingType]
    
    // Assume 200 BTU/hr/sq ft for direct sun exposure
    const solarGain = glazingArea * 200 * solarHeatGainCoefficient

    // 3. Equipment heat load
    const equipmentBTU = otherEquipment * 3.412

    // 4. Infiltration load
    const tempDifference = Math.abs(outsideTemperature - targetTemperature)
    const infiltrationCFM = (roomVolume * airChangesPerHour) / 60
    const infiltrationBTU = infiltrationCFM * 1.08 * tempDifference

    // 5. People heat load (250 BTU/hr sensible + 200 BTU/hr latent per person)
    const peopleBTU = occupants * 450

    // 6. Plant transpiration load (latent heat)
    const plantCount = roomArea * plantDensity
    const transpirationRate = 0.1 // gallons per plant per day
    const dailyTranspiration = plantCount * transpirationRate
    const plantsBTU = (dailyTranspiration * 8.34 * 970) / 24 // 970 BTU/lb water

    return {
      lighting: lightingBTU,
      solarGain,
      equipment: equipmentBTU,
      infiltration: infiltrationBTU,
      people: peopleBTU,
      plants: plantsBTU,
      total: lightingBTU + solarGain + equipmentBTU + infiltrationBTU + peopleBTU + plantsBTU
    }
  }

  const heatLoads = calculateHeatLoads()

  // Calculate HVAC requirements
  const calculateHVACRequirements = (): HVACRequirements => {
    // Cooling capacity in tons (1 ton = 12,000 BTU/hr)
    const coolingCapacity = heatLoads.total / 12000

    // Add 20% safety factor
    const designCoolingCapacity = coolingCapacity * 1.2

    // Heating capacity (for cold climates)
    const wallArea = 2 * (roomDimensions.width + roomDimensions.height) * roomDimensions.depth
    const ceilingArea = roomArea
    const surfaceArea = wallArea + ceilingArea - glazingArea

    const conductionLoss = (surfaceArea / rValues[insulationType] + glazingArea * uValues[glazingType]) * 
                          Math.abs(targetTemperature - 0) // Assume 0°F worst case

    const heatingCapacity = (conductionLoss + heatLoads.infiltration) * 1.3 // 30% safety factor

    // Recalculate infiltrationCFM for dehumidification
    const roomVolume = roomDimensions.width * roomDimensions.height * roomDimensions.depth
    const infiltrationCFM = (roomVolume * airChangesPerHour) / 60

    // Dehumidification requirements
    const moistureFromPlants = (roomArea * plantDensity * 0.1) // gallons/day
    const moistureFromPeople = occupants * 0.25 // gallons/day
    const infiltrationMoisture = infiltrationCFM * 60 * 24 * 
                                Math.abs(outsideHumidity - targetHumidity) / 100 * 0.00001
    
    const totalMoisture = moistureFromPlants + moistureFromPeople + infiltrationMoisture
    const dehumidification = totalMoisture * 8 // Convert to pints/day

    // Required airflow
    const sensibleHeatRatio = 0.8 // Typical for grow rooms
    const deltaT = 20 // Temperature difference across coil
    const airflow = (heatLoads.total * sensibleHeatRatio) / (1.08 * deltaT)

    // Recommendations
    const recommendations: string[] = []

    if (designCoolingCapacity > 5) {
      recommendations.push('Consider multiple smaller units for better redundancy and control')
    }

    if (heatLoads.lighting > heatLoads.total * 0.6) {
      recommendations.push('Lighting is dominant heat source - consider LED upgrades or remote drivers')
    }

    if (glazingArea > roomArea * 0.2) {
      recommendations.push('High glazing area - consider shade screens or better glass')
    }

    if (dehumidification > 50) {
      recommendations.push('High dehumidification load - standalone dehumidifier recommended')
    }

    if (airflow / roomArea > 2) {
      recommendations.push('High airflow required - ensure proper air distribution')
    }

    return {
      coolingCapacity: designCoolingCapacity,
      heatingCapacity,
      dehumidification,
      airflow,
      recommendations
    }
  }

  const hvacRequirements = calculateHVACRequirements()

  // Calculate operating costs
  const calculateOperatingCosts = () => {
    const coolingHours = 2000 // Annual cooling hours
    const heatingHours = 1000 // Annual heating hours
    const electricRate = 0.12 // $/kWh
    
    // Assume COP of 3.5 for cooling, 3.0 for heating
    const coolingKW = (heatLoads.total / 3412) / 3.5
    const heatingKW = (hvacRequirements.heatingCapacity / 3412) / 3.0
    
    const annualCoolingCost = coolingKW * coolingHours * electricRate
    const annualHeatingCost = heatingKW * heatingHours * electricRate
    
    return {
      cooling: annualCoolingCost,
      heating: annualHeatingCost,
      total: annualCoolingCost + annualHeatingCost
    }
  }

  const operatingCosts = calculateOperatingCosts()

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-red-400" />
          HVAC Heat Load Calculator
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      {/* Room Parameters */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400">Room Volume</div>
          <div className="text-lg font-semibold">{roomVolume.toLocaleString()} ft³</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400">Floor Area</div>
          <div className="text-lg font-semibold">{roomArea.toLocaleString()} ft²</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400">Lighting Load</div>
          <div className="text-lg font-semibold">
            {fixtures.filter(f => f.enabled).reduce((sum, f) => sum + f.wattage, 0).toLocaleString()}W
          </div>
        </div>
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Insulation Quality</label>
          <select
            value={insulationType}
            onChange={(e) => setInsulationType(e.target.value as any)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="poor">Poor (R-10)</option>
            <option value="average">Average (R-20)</option>
            <option value="good">Good (R-30)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Plant Density</label>
          <input
            type="number"
            step="0.1"
            value={plantDensity}
            onChange={(e) => setPlantDensity(Number(e.target.value))}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
          <span className="text-xs text-gray-500">plants/ft²</span>
        </div>
      </div>

      {/* Glazing */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Windows & Glazing</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400">Window Area (ft²)</label>
            <input
              type="number"
              value={glazingArea}
              onChange={(e) => setGlazingArea(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Glazing Type</label>
            <select
              value={glazingType}
              onChange={(e) => setGlazingType(e.target.value as any)}
              className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="single">Single Pane</option>
              <option value="double">Double Pane</option>
              <option value="triple">Triple Pane</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Advanced Parameters</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400">Occupants</label>
              <input
                type="number"
                value={occupants}
                onChange={(e) => setOccupants(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Other Equipment (W)</label>
              <input
                type="number"
                value={otherEquipment}
                onChange={(e) => setOtherEquipment(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Air Changes/Hour</label>
              <input
                type="number"
                step="0.1"
                value={airChangesPerHour}
                onChange={(e) => setAirChangesPerHour(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Outside Temp (°F)</label>
              <input
                type="number"
                value={outsideTemperature}
                onChange={(e) => setOutsideTemperature(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Heat Load Breakdown */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Heat Load Sources (BTU/hr)</h4>
        <div className="space-y-2">
          {Object.entries(heatLoads).filter(([key]) => key !== 'total').map(([source, value]) => (
            <div key={source} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {source === 'lighting' && <Zap className="w-4 h-4 text-yellow-400" />}
                {source === 'solarGain' && <Sun className="w-4 h-4 text-orange-400" />}
                {source === 'infiltration' && <Wind className="w-4 h-4 text-blue-400" />}
                {source === 'plants' && <Droplets className="w-4 h-4 text-green-400" />}
                <span className="text-sm text-gray-300 capitalize">{source.replace(/([A-Z])/g, ' $1')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-red-500"
                    style={{ width: `${(value / heatLoads.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-20 text-right">
                  {value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-gray-600 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">Total Heat Load</span>
            <span className="text-lg font-bold text-white">
              {heatLoads.total.toLocaleString()} BTU/hr
            </span>
          </div>
        </div>
      </div>

      {/* HVAC Requirements */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Snowflake className="w-5 h-5 text-blue-400" />
            <h4 className="text-sm font-medium text-blue-400">Cooling Required</h4>
          </div>
          <div className="text-2xl font-bold text-white">
            {hvacRequirements.coolingCapacity.toFixed(1)} tons
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {(hvacRequirements.coolingCapacity * 12000).toLocaleString()} BTU/hr
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h4 className="text-sm font-medium text-orange-400">Heating Capacity</h4>
          </div>
          <div className="text-2xl font-bold text-white">
            {(hvacRequirements.heatingCapacity / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-gray-400 mt-1">BTU/hr</div>
        </div>
      </div>

      {/* Additional Requirements */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Dehumidification</span>
          </div>
          <div className="text-xl font-semibold">{hvacRequirements.dehumidification.toFixed(0)}</div>
          <div className="text-xs text-gray-400">pints/day</div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Required Airflow</span>
          </div>
          <div className="text-xl font-semibold">{hvacRequirements.airflow.toFixed(0)}</div>
          <div className="text-xs text-gray-400">CFM</div>
        </div>
      </div>

      {/* Operating Costs */}
      <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-green-400">Estimated Annual HVAC Costs</h4>
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-400">Cooling</div>
            <div className="text-lg font-semibold">${operatingCosts.cooling.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Heating</div>
            <div className="text-lg font-semibold">${operatingCosts.heating.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Total</div>
            <div className="text-lg font-semibold text-green-400">
              ${operatingCosts.total.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {hvacRequirements.recommendations.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h4 className="font-medium text-yellow-400">HVAC Recommendations</h4>
          </div>
          <ul className="space-y-1">
            {hvacRequirements.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-300 pl-6 relative">
                <span className="absolute left-0 text-gray-500">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="mb-2">
              This calculator estimates HVAC requirements based on ASHRAE standards. 
              Actual requirements may vary based on local climate, building construction, 
              and specific crop needs.
            </p>
            <p>
              Consider hiring a professional HVAC engineer for detailed system design, 
              especially for facilities over 5,000 sq ft.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}