"use client"
import { useState, useEffect } from 'react'
import { plantNetAPI, VibeluxPlantData } from '@/lib/plantnet-api'
import { cultivationDB, CultivationData } from '@/lib/cultivation-database'
import {
  Leaf,
  Search,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react'

interface PlantNetIntegrationProps {
  onLightingConfigured?: (config: any) => void
  projectArea?: number // m²
  electricityRate?: number // $/kWh
}

export function PlantNetIntegration({ 
  onLightingConfigured,
  projectArea = 100,
  electricityRate = 0.12
}: PlantNetIntegrationProps) {
  const [workflow, setWorkflow] = useState<'identify' | 'configure' | 'optimize'>('identify')
  const [identifiedPlant, setIdentifiedPlant] = useState<VibeluxPlantData | null>(null)
  const [cultivationData, setCultivationData] = useState<CultivationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Demo: Simulate plant identification
  const simulateIdentification = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock identified plant (in real app, this would come from PlantNet API)
      const mockPlant: VibeluxPlantData = {
        scientificName: 'Lactuca sativa',
        commonNames: ['Lettuce', 'Garden Lettuce'],
        genus: 'Lactuca',
        family: 'Asteraceae',
        confidence: 0.92,
        lightingRequirements: null,
        growthParameters: null
      }
      
      setIdentifiedPlant(mockPlant)
      
      // Fetch cultivation data
      const cultivation = await cultivationDB.lookup(mockPlant.scientificName)
      if (cultivation) {
        setCultivationData(cultivation)
        setWorkflow('configure')
      } else {
        setError('Plant identified but no cultivation data available')
      }
    } catch (err) {
      setError('Failed to identify plant')
    } finally {
      setLoading(false)
    }
  }

  // Calculate costs and metrics
  const calculateMetrics = () => {
    if (!cultivationData) return null
    
    const fixtureEfficacy = 2.7 // μmol/J (typical LED efficiency)
    const costs = cultivationDB.calculateLightingCost(
      cultivationData,
      projectArea,
      electricityRate,
      fixtureEfficacy
    )
    
    return costs
  }

  // Generate lighting schedule
  const getLightingSchedule = () => {
    if (!cultivationData) return []
    return cultivationDB.generateLightingSchedule(cultivationData)
  }

  const costs = calculateMetrics()
  const schedule = getLightingSchedule()

  return (
    <div className="space-y-6">
      {/* Workflow Steps */}
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center gap-2 ${workflow === 'identify' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            workflow === 'identify' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Search className="w-4 h-4" />
          </div>
          <span className="font-medium">Identify</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <div className={`flex items-center gap-2 ${workflow === 'configure' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            workflow === 'configure' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Lightbulb className="w-4 h-4" />
          </div>
          <span className="font-medium">Configure</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <div className={`flex items-center gap-2 ${workflow === 'optimize' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            workflow === 'optimize' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="font-medium">Optimize</span>
        </div>
      </div>

      {/* Identification Step */}
      {workflow === 'identify' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            Smart Plant Identification
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Use PlantNet AI to identify your crop and automatically configure optimal lighting parameters.
          </p>
          
          <button
            onClick={simulateIdentification}
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Identifying Plant...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Start Plant Identification
              </>
            )}
          </button>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Demo Mode</div>
                <div>In production, this would open a camera interface to capture plant images for real-time identification.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Step */}
      {workflow === 'configure' && identifiedPlant && cultivationData && (
        <>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Plant Identified Successfully
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-600">Species</div>
                <div className="font-medium">{identifiedPlant.scientificName}</div>
                <div className="text-sm text-gray-500">{identifiedPlant.commonNames[0]}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Confidence</div>
                <div className="font-medium text-green-600">
                  {(identifiedPlant.confidence * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Optimal PPFD</span>
                  <span className="font-bold text-green-600">
                    {cultivationData.lighting.optimalPPFD} μmol/m²/s
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Photoperiod</span>
                  <span className="font-bold text-green-600">
                    {cultivationData.lighting.photoperiod} hours
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Daily Light Integral</span>
                  <span className="font-bold text-green-600">
                    {cultivationData.lighting.dli} mol/m²/day
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setWorkflow('optimize')}
              className="w-full mt-6 bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700"
            >
              Continue to Optimization
            </button>
          </div>

          {/* Growing Conditions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Environmental Requirements</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Temperature</div>
                <div className="font-medium">
                  {cultivationData.growth.temperature.optimal}°C
                </div>
                <div className="text-xs text-gray-500">
                  ({cultivationData.growth.temperature.min}-{cultivationData.growth.temperature.max}°C)
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Humidity</div>
                <div className="font-medium">
                  {cultivationData.growth.humidity.optimal}%
                </div>
                <div className="text-xs text-gray-500">
                  ({cultivationData.growth.humidity.min}-{cultivationData.growth.humidity.max}%)
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">CO₂</div>
                <div className="font-medium">
                  {cultivationData.growth.co2} ppm
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Optimization Step */}
      {workflow === 'optimize' && cultivationData && costs && (
        <>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Cost Analysis
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Project Area</div>
              <div className="font-medium">{projectArea} m²</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Daily Energy Usage</span>
                <span className="font-medium">{costs.dailyEnergy.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Daily Cost</span>
                <span className="font-medium">${costs.dailyCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Monthly Cost</span>
                <span className="font-medium">${costs.monthlyCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Annual Cost</span>
                <span className="font-bold text-green-600">${costs.annualCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Growth Stage Schedule
            </h3>
            
            <div className="space-y-3">
              {schedule.map((stage, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium capitalize">{stage.stage}</div>
                      <div className="text-sm text-gray-600">{stage.duration}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stage.ppfd} PPFD</div>
                      <div className="text-sm text-gray-600">{stage.photoperiod}h photoperiod</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => {
                onLightingConfigured?.({
                  plant: identifiedPlant,
                  cultivation: cultivationData,
                  costs,
                  schedule
                })
              }}
              className="w-full mt-6 bg-green-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-green-700"
            >
              Apply Configuration to Project
            </button>
          </div>
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}
    </div>
  )
}