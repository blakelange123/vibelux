"use client"
import { useEffect, useState } from 'react'
import { 
  Thermometer,
  Zap,
  Wind,
  AlertTriangle,
  TrendingDown,
  Activity,
  Settings,
  Target,
  Fan,
  Droplets
} from 'lucide-react'

interface LEDChip {
  id: string
  type: string
  maxPower: number
  efficiency: number
  thermalResistance: number // °C/W
  maxJunctionTemp: number // °C
  currentPower: number
  junctionTemp: number
  lifespan: number // hours
  degradationRate: number // %/1000hrs
}

interface ThermalSystem {
  heatSink: {
    type: 'passive' | 'active'
    thermalResistance: number // °C/W
    surfaceArea: number // cm²
    material: 'aluminum' | 'copper' | 'ceramic'
  }
  cooling: {
    type: 'natural' | 'forced' | 'liquid'
    airflow: number // CFM
    coolantTemp: number // °C
    efficiency: number
  }
  ambientTemp: number // °C
  enclosure: {
    ip_rating: string
    ventilation: number // %
    thermalMass: number // J/°C
  }
}

interface Fixture {
  id: string
  x: number
  y: number
  z?: number
  power: number
  chips: LEDChip[]
  thermalSystem: ThermalSystem
  powerDensity: number // W/cm²
  thermalHotspots: { x: number, y: number, temp: number }[]
}

interface LEDThermalManagementProps {
  fixtures?: Fixture[]
  ambientTemp?: number
  onFixtureUpdate?: (fixtureId: string, updates: Partial<Fixture>) => void
}

export function LEDThermalManagement({
  fixtures = [],
  ambientTemp = 25,
  onFixtureUpdate
}: LEDThermalManagementProps) {
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null)
  const [thermalAnalysis, setThermalAnalysis] = useState<{
    [fixtureId: string]: {
      maxJunctionTemp: number
      avgJunctionTemp: number
      thermalEfficiency: number
      lifeExpectancy: number
      powerDerating: number
      coolingRequired: number
      thermalRisk: 'low' | 'medium' | 'high' | 'critical'
    }
  }>({})

  // Calculate thermal performance for each fixture
  useEffect(() => {
    const analysis: typeof thermalAnalysis = {}

    fixtures.forEach(fixture => {
      const results = calculateThermalPerformance(fixture, ambientTemp)
      analysis[fixture.id] = results
    })

    setThermalAnalysis(analysis)
  }, [fixtures, ambientTemp])

  const calculateThermalPerformance = (fixture: Fixture, ambient: number) => {
    let maxJunctionTemp = 0
    let totalJunctionTemp = 0
    let totalPowerDissipated = 0
    let minLifeExpectancy = Infinity

    fixture.chips.forEach(chip => {
      // Calculate junction temperature using thermal resistance network
      const heatGenerated = chip.currentPower * (1 - chip.efficiency / 100)
      const junctionToCase = chip.thermalResistance
      const caseToHeatSink = 0.5 // Typical thermal interface resistance
      const heatSinkToAmbient = fixture.thermalSystem.heatSink.thermalResistance
      
      // Apply cooling efficiency
      const coolingFactor = fixture.thermalSystem.cooling.efficiency / 100
      const effectiveHeatSinkResistance = heatSinkToAmbient * (1 - coolingFactor)
      
      const totalThermalResistance = junctionToCase + caseToHeatSink + effectiveHeatSinkResistance
      const junctionTemp = ambient + (heatGenerated * totalThermalResistance)
      
      chip.junctionTemp = junctionTemp
      maxJunctionTemp = Math.max(maxJunctionTemp, junctionTemp)
      totalJunctionTemp += junctionTemp
      totalPowerDissipated += heatGenerated

      // Calculate LED lifespan based on junction temperature
      // Arrhenius equation for LED degradation
      const activationEnergy = 0.7 // eV (typical for LEDs)
      const boltzmannConstant = 8.617e-5 // eV/K
      const referenceTemp = 25 + 273.15 // K
      const junctionTempK = junctionTemp + 273.15 // K
      
      const accelerationFactor = Math.exp(
        (activationEnergy / boltzmannConstant) * 
        ((1 / referenceTemp) - (1 / junctionTempK))
      )
      
      const baseLifespan = 50000 // hours at 25°C
      const adjustedLifespan = baseLifespan / accelerationFactor
      chip.lifespan = adjustedLifespan
      
      minLifeExpectancy = Math.min(minLifeExpectancy, adjustedLifespan)
    })

    const avgJunctionTemp = totalJunctionTemp / fixture.chips.length
    
    // Calculate power derating needed if over temperature
    const maxAllowableTemp = Math.min(...fixture.chips.map(c => c.maxJunctionTemp))
    const powerDerating = maxJunctionTemp > maxAllowableTemp 
      ? ((maxJunctionTemp - maxAllowableTemp) / maxAllowableTemp) * 100 
      : 0

    // Calculate additional cooling required
    const excessHeat = Math.max(0, totalPowerDissipated - 
      (maxAllowableTemp - ambient) / fixture.thermalSystem.heatSink.thermalResistance)
    const coolingRequired = excessHeat // Watts to remove

    // Determine thermal risk level
    let thermalRisk: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (maxJunctionTemp > maxAllowableTemp * 0.95) thermalRisk = 'critical'
    else if (maxJunctionTemp > maxAllowableTemp * 0.85) thermalRisk = 'high'
    else if (maxJunctionTemp > maxAllowableTemp * 0.75) thermalRisk = 'medium'

    const thermalEfficiency = totalPowerDissipated > 0 
      ? ((fixture.power - totalPowerDissipated) / fixture.power) * 100 
      : 0

    return {
      maxJunctionTemp,
      avgJunctionTemp,
      thermalEfficiency,
      lifeExpectancy: minLifeExpectancy,
      powerDerating,
      coolingRequired,
      thermalRisk
    }
  }

  const generateThermalRecommendations = (fixture: Fixture) => {
    const analysis = thermalAnalysis[fixture.id]
    if (!analysis) return []

    const recommendations = []

    if (analysis.thermalRisk === 'critical' || analysis.thermalRisk === 'high') {
      recommendations.push({
        priority: 'high',
        category: 'Cooling',
        title: 'Increase Heat Dissipation',
        description: `Junction temperature (${analysis.maxJunctionTemp.toFixed(1)}°C) exceeds safe limits. Consider upgrading heat sink or adding active cooling.`,
        action: 'thermal_upgrade'
      })
    }

    if (analysis.powerDerating > 5) {
      recommendations.push({
        priority: 'medium',
        category: 'Power Management',
        title: 'Reduce Operating Power',
        description: `Consider reducing power by ${analysis.powerDerating.toFixed(1)}% to maintain safe operating temperature.`,
        action: 'power_reduction'
      })
    }

    if (fixture.thermalSystem.cooling.type === 'natural' && analysis.coolingRequired > 5) {
      recommendations.push({
        priority: 'medium',
        category: 'Cooling System',
        title: 'Add Active Cooling',
        description: `Natural convection insufficient. Add ${analysis.coolingRequired.toFixed(1)}W cooling capacity.`,
        action: 'active_cooling'
      })
    }

    if (analysis.lifeExpectancy < 25000) {
      recommendations.push({
        priority: 'low',
        category: 'Maintenance',
        title: 'Frequent Replacement Required',
        description: `Expected lifespan is only ${Math.round(analysis.lifeExpectancy)} hours. Monitor for early degradation.`,
        action: 'maintenance_schedule'
      })
    }

    return recommendations
  }

  const optimizeHeatSink = (fixture: Fixture) => {
    const currentAnalysis = thermalAnalysis[fixture.id]
    if (!currentAnalysis) return

    // Calculate required heat sink thermal resistance
    const maxAllowableTemp = Math.min(...fixture.chips.map(c => c.maxJunctionTemp))
    const totalHeatGenerated = fixture.chips.reduce((sum, chip) => 
      sum + chip.currentPower * (1 - chip.efficiency / 100), 0)
    
    const junctionToCase = Math.max(...fixture.chips.map(c => c.thermalResistance))
    const caseToHeatSink = 0.5
    const allowableTempRise = maxAllowableTemp - ambientTemp - 10 // 10°C safety margin
    
    const requiredHeatSinkResistance = (allowableTempRise / totalHeatGenerated) - junctionToCase - caseToHeatSink

    // Suggest heat sink upgrade
    const recommendations = {
      currentResistance: fixture.thermalSystem.heatSink.thermalResistance,
      requiredResistance: requiredHeatSinkResistance,
      improvementNeeded: requiredHeatSinkResistance < fixture.thermalSystem.heatSink.thermalResistance,
      suggestedType: requiredHeatSinkResistance < 1 ? 'active' : 'passive',
      surfaceAreaMultiplier: fixture.thermalSystem.heatSink.thermalResistance / Math.max(0.1, requiredHeatSinkResistance)
    }

    return recommendations
  }

  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Thermometer className="w-6 h-6 text-red-400" />
          <div>
            <h2 className="text-xl font-bold text-white">LED Thermal Management</h2>
            <p className="text-gray-400">Junction temperature analysis and cooling optimization</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          Ambient: {ambientTemp}°C
        </div>
      </div>

      {/* Thermal Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {fixtures.map(fixture => {
          const analysis = thermalAnalysis[fixture.id]
          if (!analysis) return null

          return (
            <div 
              key={fixture.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedFixture === fixture.id 
                  ? 'border-purple-500 bg-purple-900/20' 
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
              onClick={() => setSelectedFixture(fixture.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Fixture {fixture.id}</span>
                <div className={`w-3 h-3 rounded-full ${
                  analysis.thermalRisk === 'critical' ? 'bg-red-500' :
                  analysis.thermalRisk === 'high' ? 'bg-orange-500' :
                  analysis.thermalRisk === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Tj:</span>
                  <span className="text-white">{analysis.maxJunctionTemp.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Efficiency:</span>
                  <span className="text-white">{analysis.thermalEfficiency.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Life:</span>
                  <span className="text-white">{Math.round(analysis.lifeExpectancy/1000)}k hrs</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Analysis for Selected Fixture */}
      {selectedFixture && (() => {
        const fixture = fixtures.find(f => f.id === selectedFixture)
        const analysis = thermalAnalysis[selectedFixture]
        if (!fixture || !analysis) return null

        const heatSinkOpt = optimizeHeatSink(fixture)
        const recommendations = generateThermalRecommendations(fixture)

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature Analysis */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Temperature Analysis
              </h3>
              
              <div className="space-y-4">
                {/* Junction Temperature Distribution */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Junction Temperature Range</span>
                    <span className="text-white">
                      {Math.min(...fixture.chips.map(c => c.junctionTemp)).toFixed(1)}°C - {analysis.maxJunctionTemp.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        analysis.thermalRisk === 'critical' ? 'bg-red-500' :
                        analysis.thermalRisk === 'high' ? 'bg-orange-500' :
                        analysis.thermalRisk === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (analysis.maxJunctionTemp / 150) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Chip-level breakdown */}
                <div className="space-y-2">
                  <span className="text-sm text-gray-400">Individual LED Chips</span>
                  {fixture.chips.map((chip, index) => (
                    <div key={chip.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Chip {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{chip.junctionTemp.toFixed(1)}°C</span>
                        <div className={`w-2 h-2 rounded-full ${
                          chip.junctionTemp > chip.maxJunctionTemp * 0.9 ? 'bg-red-500' :
                          chip.junctionTemp > chip.maxJunctionTemp * 0.8 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Power Dissipation */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Power Input</span>
                      <div className="text-white font-semibold">{fixture.power}W</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Heat Generated</span>
                      <div className="text-white font-semibold">
                        {fixture.chips.reduce((sum, chip) => 
                          sum + chip.currentPower * (1 - chip.efficiency / 100), 0).toFixed(1)}W
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Thermal Efficiency</span>
                      <div className="text-white font-semibold">{analysis.thermalEfficiency.toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Life Expectancy</span>
                      <div className="text-white font-semibold">{Math.round(analysis.lifeExpectancy/1000)}k hrs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cooling System Optimization */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Wind className="w-5 h-5 text-cyan-400" />
                Cooling System
              </h3>

              <div className="space-y-4">
                {/* Current System */}
                <div>
                  <span className="text-sm text-gray-400 mb-2 block">Current Configuration</span>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Heat Sink:</span>
                      <span className="text-white capitalize">{fixture.thermalSystem.heatSink.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Material:</span>
                      <span className="text-white capitalize">{fixture.thermalSystem.heatSink.material}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Thermal R:</span>
                      <span className="text-white">{fixture.thermalSystem.heatSink.thermalResistance}°C/W</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Cooling:</span>
                      <span className="text-white capitalize">{fixture.thermalSystem.cooling.type}</span>
                    </div>
                  </div>
                </div>

                {/* Heat Sink Optimization */}
                {heatSinkOpt && (
                  <div className="pt-4 border-t border-gray-700">
                    <span className="text-sm text-gray-400 mb-2 block">Heat Sink Optimization</span>
                    {heatSinkOpt.improvementNeeded ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-orange-400">
                          <AlertTriangle className="w-4 h-4" />
                          Heat sink upgrade recommended
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Required R:</span>
                            <span className="text-white">{heatSinkOpt.requiredResistance.toFixed(2)}°C/W</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Suggested:</span>
                            <span className="text-white capitalize">{heatSinkOpt.suggestedType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Area Increase:</span>
                            <span className="text-white">{heatSinkOpt.surfaceAreaMultiplier.toFixed(1)}x</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <Target className="w-4 h-4" />
                        Heat sink adequately sized
                      </div>
                    )}
                  </div>
                )}

                {/* Cooling Controls */}
                <div className="pt-4 border-t border-gray-700">
                  <span className="text-sm text-gray-400 mb-3 block">Thermal Controls</span>
                  <div className="space-y-3">
                    <button 
                      className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center justify-center gap-2"
                      onClick={() => {
                        // Add active cooling
                        const updatedSystem = {
                          ...fixture.thermalSystem,
                          cooling: {
                            ...fixture.thermalSystem.cooling,
                            type: 'forced' as const,
                            airflow: 50,
                            efficiency: 80
                          }
                        }
                        onFixtureUpdate?.(fixture.id, { thermalSystem: updatedSystem })
                      }}
                    >
                      <Fan className="w-4 h-4" />
                      Add Active Cooling
                    </button>
                    
                    <button 
                      className="w-full p-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm flex items-center justify-center gap-2"
                      onClick={() => {
                        // Upgrade heat sink
                        const updatedSystem = {
                          ...fixture.thermalSystem,
                          heatSink: {
                            ...fixture.thermalSystem.heatSink,
                            thermalResistance: Math.max(0.5, fixture.thermalSystem.heatSink.thermalResistance * 0.7),
                            surfaceArea: fixture.thermalSystem.heatSink.surfaceArea * 1.5
                          }
                        }
                        onFixtureUpdate?.(fixture.id, { thermalSystem: updatedSystem })
                      }}
                    >
                      <TrendingDown className="w-4 h-4" />
                      Upgrade Heat Sink
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-400" />
                  Thermal Recommendations
                </h3>
                
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className={`p-3 rounded border ${
                      rec.priority === 'high' ? 'border-red-500 bg-red-500/10' :
                      rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                      'border-blue-500 bg-blue-500/10'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              rec.priority === 'high' ? 'bg-red-500 text-white' :
                              rec.priority === 'medium' ? 'bg-yellow-500 text-black' :
                              'bg-blue-500 text-white'
                            }`}>
                              {rec.priority.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-400">{rec.category}</span>
                          </div>
                          <h4 className="text-white font-medium">{rec.title}</h4>
                          <p className="text-sm text-gray-300 mt-1">{rec.description}</p>
                        </div>
                        {rec.priority === 'high' && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}