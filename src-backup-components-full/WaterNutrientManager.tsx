'use client'

import { useState, useEffect } from 'react'
import { 
  Droplets, 
  Beaker, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  Gauge,
  Activity,
  Settings,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import {
  cropWaterNutrientProfiles,
  calculateWaterRequirement,
  calculateNutrientSolution,
  generateIrrigationSchedule,
  calculateVPD,
  type IrrigationSystem,
  type WaterQuality,
  type WaterSchedule,
  type NutrientProfile
} from '@/lib/water-nutrient-models'

interface WaterNutrientManagerProps {
  cropType: string
  growthStage: string
  growArea: number // m²
  temperature: number
  humidity: number
  lightIntensity: number // PPFD
  co2: number
}

export default function WaterNutrientManager({
  cropType,
  growthStage,
  growArea,
  temperature,
  humidity,
  lightIntensity,
  co2
}: WaterNutrientManagerProps) {
  const [irrigationSystem, setIrrigationSystem] = useState<IrrigationSystem>({
    type: 'drip',
    emittersPerM2: 4,
    emitterFlowRate: 2, // L/hr
    uniformity: 0.9,
    pressure: 30, // psi
    filtration: true,
    automation: 'timer'
  })

  const [waterQuality, setWaterQuality] = useState<WaterQuality>({
    source: 'municipal',
    startingEC: 0.3,
    startingPH: 7.2,
    alkalinity: 80,
    hardness: 120,
    chlorine: 1.5,
    chloramine: 0,
    sodium: 25,
    bicarbonate: 90
  })

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [showNutrientDetails, setShowNutrientDetails] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'water' | 'nutrients' | 'schedule'>('water')

  // Calculate VPD
  const vpd = calculateVPD(temperature, humidity)

  // Calculate water requirements
  const waterRequirements = calculateWaterRequirement(
    cropType,
    growthStage,
    { temperature, humidity, vpd, lightIntensity, co2 },
    growArea
  )

  // Get nutrient profile for current stage
  const cropProfile = cropWaterNutrientProfiles[cropType.toLowerCase()]
  const nutrientProfile = cropProfile?.nutrientProfile[growthStage as keyof typeof cropProfile.nutrientProfile] 
    || cropProfile?.nutrientProfile.vegetative

  // Calculate nutrient solution
  const nutrientSolution = nutrientProfile ? calculateNutrientSolution(
    nutrientProfile,
    waterQuality,
    waterRequirements.dailyWaterRequirement
  ) : null

  // Generate irrigation schedule
  const irrigationSchedule = generateIrrigationSchedule(
    cropType,
    growthStage,
    irrigationSystem,
    waterRequirements.dailyWaterRequirement,
    16 // Default photoperiod
  )

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" />
          Water & Nutrient Manager
        </h3>
        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          <Settings className="w-4 h-4" />
          {showAdvancedSettings ? 'Hide' : 'Show'} Settings
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedTab('water')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === 'water'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Water Requirements
        </button>
        <button
          onClick={() => setSelectedTab('nutrients')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === 'nutrients'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Nutrient Solution
        </button>
        <button
          onClick={() => setSelectedTab('schedule')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === 'schedule'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Irrigation Schedule
        </button>
      </div>

      {/* Advanced Settings */}
      {showAdvancedSettings && (
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Irrigation System</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">System Type</label>
                <select
                  value={irrigationSystem.type}
                  onChange={(e) => setIrrigationSystem({...irrigationSystem, type: e.target.value as any})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                >
                  <option value="drip">Drip Irrigation</option>
                  <option value="ebb-flow">Ebb & Flow</option>
                  <option value="nft">NFT</option>
                  <option value="dwc">DWC</option>
                  <option value="aeroponics">Aeroponics</option>
                  <option value="hand-water">Hand Water</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Automation</label>
                <select
                  value={irrigationSystem.automation}
                  onChange={(e) => setIrrigationSystem({...irrigationSystem, automation: e.target.value as any})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                >
                  <option value="manual">Manual</option>
                  <option value="timer">Timer</option>
                  <option value="sensor-based">Sensor-based</option>
                  <option value="ai-controlled">AI Controlled</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Emitters/m²</label>
                <input
                  type="number"
                  value={irrigationSystem.emittersPerM2}
                  onChange={(e) => setIrrigationSystem({...irrigationSystem, emittersPerM2: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Flow Rate (L/hr)</label>
                <input
                  type="number"
                  value={irrigationSystem.emitterFlowRate}
                  onChange={(e) => setIrrigationSystem({...irrigationSystem, emitterFlowRate: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Water Quality</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400">Source</label>
                <select
                  value={waterQuality.source}
                  onChange={(e) => setWaterQuality({...waterQuality, source: e.target.value as any})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                >
                  <option value="municipal">Municipal</option>
                  <option value="well">Well Water</option>
                  <option value="ro">RO Water</option>
                  <option value="rainwater">Rainwater</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Starting EC</label>
                <input
                  type="number"
                  step="0.1"
                  value={waterQuality.startingEC}
                  onChange={(e) => setWaterQuality({...waterQuality, startingEC: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Starting pH</label>
                <input
                  type="number"
                  step="0.1"
                  value={waterQuality.startingPH}
                  onChange={(e) => setWaterQuality({...waterQuality, startingPH: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Water Requirements Tab */}
      {selectedTab === 'water' && (
        <div className="space-y-4">
          {/* Environmental Conditions */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">VPD</span>
              </div>
              <div className="text-lg font-semibold">{vpd} kPa</div>
              <div className={`text-xs ${
                vpd >= 0.8 && vpd <= 1.2 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {vpd >= 0.8 && vpd <= 1.2 ? 'Optimal' : vpd < 0.8 ? 'Low' : 'High'}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Temperature</div>
              <div className="text-lg font-semibold">{temperature}°C</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Humidity</div>
              <div className="text-lg font-semibold">{humidity}%</div>
            </div>
          </div>

          {/* Water Requirements */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-400 mb-3">Daily Water Requirements</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">
                  {waterRequirements.dailyWaterRequirement.toFixed(1)} L
                </div>
                <div className="text-xs text-gray-400">Total daily requirement</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {waterRequirements.hourlyRate.toFixed(2)} L/hr
                </div>
                <div className="text-xs text-gray-400">Average hourly rate</div>
              </div>
            </div>
            
            {/* Adjustment Factors */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-2">Environmental Adjustments</div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                {Object.entries(waterRequirements.adjustmentFactors).map(([factor, value]) => (
                  <div key={factor} className="text-center">
                    <div className={`font-medium ${
                      value > 1.1 ? 'text-red-400' : 
                      value < 0.9 ? 'text-blue-400' : 
                      'text-green-400'
                    }`}>
                      {(value * 100).toFixed(0)}%
                    </div>
                    <div className="text-gray-500 capitalize">{factor}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crop Water Profile */}
          {cropProfile && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">
                {cropProfile.cropType} Water Requirements
              </h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-gray-400">Minimum</div>
                  <div className="font-medium">{cropProfile.waterRequirement.min} L/m²/day</div>
                </div>
                <div>
                  <div className="text-gray-400">Optimal</div>
                  <div className="font-medium text-green-400">
                    {cropProfile.waterRequirement.optimal} L/m²/day
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Maximum</div>
                  <div className="font-medium">{cropProfile.waterRequirement.max} L/m²/day</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Target Runoff</span>
                  <span className="font-medium">
                    {cropProfile.runoffPercentage.min}-{cropProfile.runoffPercentage.max}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nutrient Solution Tab */}
      {selectedTab === 'nutrients' && nutrientProfile && nutrientSolution && (
        <div className="space-y-4">
          {/* EC and pH Targets */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Target EC</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {nutrientProfile.ec} mS/cm
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Beaker className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Target pH</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {nutrientProfile.ph}
              </div>
            </div>
          </div>

          {/* Fertilizer Mix */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300">Fertilizer Mix</h4>
              <span className="text-xs text-gray-400">
                Per {waterRequirements.dailyWaterRequirement.toFixed(1)}L water
              </span>
            </div>
            <div className="space-y-2">
              {nutrientSolution.fertilizers.map((fert, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-600">
                  <span className="text-sm text-gray-300">{fert.name}</span>
                  <span className="text-sm font-medium text-white">{fert.amount}g</span>
                </div>
              ))}
            </div>
            
            {/* pH Adjustment */}
            {nutrientSolution.phAdjustment.direction !== 'none' && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">pH Adjustment</span>
                  <span className="text-sm font-medium text-yellow-400">
                    {nutrientSolution.phAdjustment.amount.toFixed(1)}ml {nutrientSolution.phAdjustment.product}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Nutrient Profile Details */}
          <button
            onClick={() => setShowNutrientDetails(!showNutrientDetails)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <span className="text-sm text-gray-300">Nutrient Element Details</span>
            {showNutrientDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showNutrientDetails && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="font-medium text-gray-300 mb-2">Macronutrients (ppm)</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">N</span>
                      <span className="font-medium">{nutrientProfile.nitrogen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">P</span>
                      <span className="font-medium">{nutrientProfile.phosphorus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">K</span>
                      <span className="font-medium">{nutrientProfile.potassium}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-300 mb-2">Secondary (ppm)</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ca</span>
                      <span className="font-medium">{nutrientProfile.calcium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mg</span>
                      <span className="font-medium">{nutrientProfile.magnesium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">S</span>
                      <span className="font-medium">{nutrientProfile.sulfur}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-300 mb-2">Micronutrients (ppm)</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fe</span>
                      <span className="font-medium">{nutrientProfile.iron}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mn</span>
                      <span className="font-medium">{nutrientProfile.manganese}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Zn</span>
                      <span className="font-medium">{nutrientProfile.zinc}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {nutrientSolution.warnings.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h4 className="font-medium text-yellow-400">Water Quality Warnings</h4>
              </div>
              <ul className="space-y-1">
                {nutrientSolution.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-gray-300 pl-6 relative">
                    <span className="absolute left-0 text-gray-500">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Irrigation Schedule Tab */}
      {selectedTab === 'schedule' && (
        <div className="space-y-4">
          {/* Schedule Summary */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-400 mb-3">Irrigation Schedule</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Frequency</div>
                <div className="text-lg font-semibold capitalize">
                  {irrigationSchedule.frequency.replace('-', ' ')}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Duration</div>
                <div className="text-lg font-semibold">{irrigationSchedule.duration} min</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Flow Rate</div>
                <div className="text-lg font-semibold">{irrigationSchedule.flowRate.toFixed(1)} L/hr</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Runoff Target</div>
                <div className="text-lg font-semibold">{irrigationSchedule.runoffTarget}%</div>
              </div>
            </div>
          </div>

          {/* Irrigation Times */}
          {irrigationSchedule.startTimes.length > 0 && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-medium text-gray-300">Irrigation Times</h4>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {irrigationSchedule.startTimes.map((time, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400">Irrigation {index + 1}</div>
                    <div className="text-lg font-semibold text-white mt-1">{time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Summary */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Daily Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Water Volume</span>
                <span className="font-medium">{waterRequirements.dailyWaterRequirement.toFixed(1)} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Number of Irrigations</span>
                <span className="font-medium">{irrigationSchedule.startTimes.length || 'Continuous'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Water per Irrigation</span>
                <span className="font-medium">
                  {irrigationSchedule.startTimes.length > 0 
                    ? (waterRequirements.dailyWaterRequirement / irrigationSchedule.startTimes.length).toFixed(1)
                    : 'N/A'
                  } L
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Expected Runoff</span>
                <span className="font-medium">
                  {(waterRequirements.dailyWaterRequirement * irrigationSchedule.runoffTarget / 100).toFixed(1)} L
                </span>
              </div>
            </div>
          </div>

          {/* System Performance */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">System Performance</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Uniformity</span>
                  <span className="font-medium">{(irrigationSystem.uniformity * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${irrigationSystem.uniformity * 100}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-400">System Pressure</div>
                  <div className="font-medium">{irrigationSystem.pressure} psi</div>
                </div>
                <div>
                  <div className="text-gray-400">Filtration</div>
                  <div className="font-medium">{irrigationSystem.filtration ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Automation Info */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400">
                System set to {irrigationSystem.automation} control
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}