"use client"
import { useState, useEffect } from 'react'
import { 
  Sun,
  Cloud,
  Eye,
  Thermometer,
  Droplets,
  Wind,
  Calendar,
  BarChart3,
  Settings,
  Target,
  Activity,
  Globe
} from 'lucide-react'

interface SolarData {
  month: number
  day: number
  hour: number
  altitude: number // degrees
  azimuth: number // degrees
  directNormalIrradiance: number // W/m²
  diffuseHorizontalIrradiance: number // W/m²
  globalHorizontalIrradiance: number // W/m²
}

interface GlazingProperties {
  material: 'glass' | 'polycarbonate' | 'acrylic' | 'polyethylene'
  thickness: number // mm
  transmittance: {
    visible: number // 0-1
    par: number // 0-1
    infrared: number // 0-1
    uv: number // 0-1
  }
  angularDependence: (angle: number) => number
  weathering: number // 0-1, degradation factor
  condensation: number // 0-1, reduction due to condensation
}

interface GreenhouseStructure {
  type: 'gutter_connected' | 'multi_span' | 'single_span' | 'tunnel'
  orientation: number // degrees from north
  roofAngle: number // degrees
  sidewallHeight: number // meters
  gutterHeight: number // meters
  bayWidth: number // meters
  glazingProperties: GlazingProperties
  shadingSystem: {
    type: 'internal' | 'external' | 'none'
    transmittance: number // 0-1
    reflectance: number // 0-1
    automated: boolean
    triggers: {
      solarRadiation: number // W/m²
      temperature: number // °C
      lightLevel: number // lux
    }
  }
  ventilation: {
    type: 'natural' | 'forced' | 'hybrid'
    openingArea: number // % of floor area
    efficiency: number // 0-1
  }
}

interface WeatherConditions {
  temperature: number // °C
  humidity: number // %
  windSpeed: number // m/s
  cloudCover: number // 0-1
  precipitation: number // mm/hr
  visibility: number // km
}

interface Location {
  latitude: number
  longitude: number
  timezone: string
  elevation: number // meters
}

interface EnvironmentalIntegrationProps {
  location: Location
  greenhouse: GreenhouseStructure
  currentWeather: WeatherConditions
  artificialLighting: {
    fixtures: Array<{
      id: string
      power: number
      ppfd: number
      spectrum: { [wavelength: number]: number }
      position: { x: number, y: number, z: number }
    }>
  }
  onLightingAdjustment?: (adjustments: any) => void
}

export function EnvironmentalIntegration({
  location,
  greenhouse,
  currentWeather,
  artificialLighting,
  onLightingAdjustment
}: EnvironmentalIntegrationProps) {
  const [currentSolar, setCurrentSolar] = useState<SolarData | null>(null)
  const [naturalLightLevels, setNaturalLightLevels] = useState({
    directPPFD: 0,
    diffusePPFD: 0,
    totalPPFD: 0,
    transmittedPPFD: 0
  })
  const [seasonalData, setSeasonalData] = useState<SolarData[]>([])
  const [lightingRecommendations, setLightingRecommendations] = useState<any[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'current' | 'daily' | 'seasonal'>('current')

  // Calculate solar position using astronomical algorithms
  const calculateSolarPosition = (date: Date): SolarData => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours() + date.getMinutes() / 60

    // Julian day calculation
    const a = Math.floor((14 - month) / 12)
    const y = year - a
    const m = month + 12 * a - 3
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119

    // Time corrections
    const n = jd - 2451545.0
    const L = (280.460 + 0.9856474 * n) % 360
    const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180
    const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180

    // Declination
    const epsilon = 23.439 * Math.PI / 180
    const declination = Math.asin(Math.sin(epsilon) * Math.sin(lambda))

    // Hour angle
    const hourAngle = (15 * (hour - 12)) * Math.PI / 180

    // Solar position
    const lat = location.latitude * Math.PI / 180
    const altitude = Math.asin(
      Math.sin(lat) * Math.sin(declination) + 
      Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle)
    )

    const azimuth = Math.atan2(
      -Math.sin(hourAngle),
      Math.tan(declination) * Math.cos(lat) - Math.sin(lat) * Math.cos(hourAngle)
    )

    // Solar irradiance (simplified clear sky model)
    const airMass = 1 / (Math.sin(altitude) + 0.50572 * Math.pow(Math.sin(altitude) + 6.07995, -1.6364))
    const directNormal = altitude > 0 ? 900 * Math.exp(-0.7 * Math.pow(airMass, 0.678)) : 0
    const diffuseHorizontal = altitude > 0 ? 0.3 * directNormal * Math.sin(altitude) : 0
    const globalHorizontal = directNormal * Math.sin(altitude) + diffuseHorizontal

    // Apply weather effects
    const cloudFactor = 1 - 0.75 * Math.pow(currentWeather.cloudCover, 3.4)
    const visibilityFactor = Math.min(1, currentWeather.visibility / 10)

    return {
      month,
      day,
      hour,
      altitude: altitude * 180 / Math.PI,
      azimuth: azimuth * 180 / Math.PI,
      directNormalIrradiance: directNormal * cloudFactor * visibilityFactor,
      diffuseHorizontalIrradiance: diffuseHorizontal * cloudFactor,
      globalHorizontalIrradiance: globalHorizontal * cloudFactor * visibilityFactor
    }
  }

  // Calculate natural light transmission through greenhouse
  const calculateNaturalLightTransmission = (solarData: SolarData): typeof naturalLightLevels => {
    if (!solarData || solarData.altitude <= 0) {
      return { directPPFD: 0, diffusePPFD: 0, totalPPFD: 0, transmittedPPFD: 0 }
    }

    // Convert solar irradiance to PPFD (approximate conversion: 1 W/m² ≈ 4.6 μmol/m²/s for sunlight)
    const conversionFactor = 4.6
    const directPPFD = solarData.directNormalIrradiance * conversionFactor
    const diffusePPFD = solarData.diffuseHorizontalIrradiance * conversionFactor
    const totalPPFD = solarData.globalHorizontalIrradiance * conversionFactor

    // Calculate glazing transmission
    const incidenceAngle = Math.abs(90 - solarData.altitude - greenhouse.roofAngle)
    const angularTransmittance = greenhouse.glazingProperties.angularDependence(incidenceAngle)
    
    // Account for glazing properties
    let transmittance = greenhouse.glazingProperties.transmittance.par * angularTransmittance
    transmittance *= greenhouse.glazingProperties.weathering // Weathering effects
    transmittance *= (1 - greenhouse.glazingProperties.condensation) // Condensation effects

    // Shading system effects
    if (greenhouse.shadingSystem.type !== 'none') {
      const shadingActive = 
        solarData.globalHorizontalIrradiance > greenhouse.shadingSystem.triggers.solarRadiation ||
        currentWeather.temperature > greenhouse.shadingSystem.triggers.temperature

      if (shadingActive) {
        transmittance *= greenhouse.shadingSystem.transmittance
      }
    }

    // Structural shading (simplified)
    const structuralShading = 0.85 // Account for frame, supports, etc.
    transmittance *= structuralShading

    const transmittedPPFD = totalPPFD * transmittance

    return {
      directPPFD,
      diffusePPFD,
      totalPPFD,
      transmittedPPFD
    }
  }

  // Generate lighting recommendations based on natural light availability
  const generateLightingRecommendations = (naturalLight: typeof naturalLightLevels): any[] => {
    const recommendations = []
    const targetPPFD = 400 // Base target, should be plant-specific
    const currentArtificialPPFD = artificialLighting.fixtures.reduce((sum, f) => sum + f.ppfd, 0) / artificialLighting.fixtures.length

    const totalAvailablePPFD = naturalLight.transmittedPPFD + currentArtificialPPFD
    const deficiency = Math.max(0, targetPPFD - totalAvailablePPFD)

    if (deficiency > 50) {
      recommendations.push({
        type: 'increase_artificial',
        priority: 'high',
        title: 'Insufficient Light Levels',
        description: `Total PPFD (${totalAvailablePPFD.toFixed(0)}) is ${deficiency.toFixed(0)} μmol/m²/s below target. Increase artificial lighting.`,
        action: {
          type: 'intensity_increase',
          amount: deficiency,
          cost: `$${(deficiency * 0.12).toFixed(2)}/day` // Rough energy cost estimate
        }
      })
    }

    if (naturalLight.transmittedPPFD > targetPPFD * 0.8) {
      const energySavings = currentArtificialPPFD * 0.15 * 24 // kWh per day
      recommendations.push({
        type: 'reduce_artificial',
        priority: 'medium',
        title: 'High Natural Light Available',
        description: `Natural light provides ${naturalLight.transmittedPPFD.toFixed(0)} μmol/m²/s. Consider reducing artificial lighting.`,
        action: {
          type: 'intensity_decrease',
          amount: Math.min(currentArtificialPPFD * 0.5, naturalLight.transmittedPPFD * 0.3),
          savings: `$${(energySavings * 0.12).toFixed(2)}/day`
        }
      })
    }

    // Spectrum optimization based on natural light
    const naturalSpectralQuality = calculateNaturalSpectrumQuality(currentSolar)
    if (naturalSpectralQuality.rFrRatio < 1.0) {
      recommendations.push({
        type: 'spectrum_adjustment',
        priority: 'medium',
        title: 'Optimize Spectrum Balance',
        description: 'Natural light R:FR ratio is low. Increase red spectrum in artificial lighting.',
        action: {
          type: 'spectrum_increase',
          wavelength: 660,
          adjustment: '+20%'
        }
      })
    }

    // Weather-based recommendations
    if (currentWeather.cloudCover > 0.7) {
      recommendations.push({
        type: 'weather_compensation',
        priority: 'high',
        title: 'Cloudy Weather Detected',
        description: `Cloud cover is ${(currentWeather.cloudCover * 100).toFixed(0)}%. Activate supplemental lighting.`,
        action: {
          type: 'weather_mode',
          duration: 'until_clear'
        }
      })
    }

    return recommendations
  }

  // Calculate natural spectrum quality (simplified)
  const calculateNaturalSpectrumQuality = (solarData: SolarData | null) => {
    if (!solarData) return { rFrRatio: 1.2, blueRatio: 0.15 }

    // Solar spectrum changes with sun angle and atmospheric conditions
    const airMass = solarData.altitude > 0 ? 1 / Math.sin(solarData.altitude * Math.PI / 180) : 5
    
    // Red light is less affected by atmosphere than blue
    const blueAttenuation = Math.exp(-0.8 * airMass)
    const redAttenuation = Math.exp(-0.3 * airMass)
    
    const rFrRatio = (redAttenuation / 0.8) / (1.0 / 0.2) // Simplified R:FR calculation
    const blueRatio = blueAttenuation * 0.15 // Blue portion of spectrum

    return { rFrRatio, blueRatio }
  }

  // Generate seasonal data for the year
  const generateSeasonalData = () => {
    const data: SolarData[] = []
    const currentDate = new Date()
    
    // Sample data for each month at solar noon
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentDate.getFullYear(), month, 15, 12, 0) // 15th of each month at noon
      const solarData = calculateSolarPosition(date)
      data.push(solarData)
    }
    
    setSeasonalData(data)
  }

  // Update calculations when inputs change
  useEffect(() => {
    const now = new Date()
    const solar = calculateSolarPosition(now)
    const naturalLight = calculateNaturalLightTransmission(solar)
    const recommendations = generateLightingRecommendations(naturalLight)

    setCurrentSolar(solar)
    setNaturalLightLevels(naturalLight)
    setLightingRecommendations(recommendations)
  }, [location, greenhouse, currentWeather, artificialLighting])

  useEffect(() => {
    generateSeasonalData()
  }, [location])

  const glazingMaterials = {
    glass: { name: 'Glass', transmittance: 0.90, cost: 'High', durability: 'Excellent' },
    polycarbonate: { name: 'Polycarbonate', transmittance: 0.83, cost: 'Medium', durability: 'Good' },
    acrylic: { name: 'Acrylic', transmittance: 0.92, cost: 'Medium', durability: 'Good' },
    polyethylene: { name: 'Polyethylene', transmittance: 0.85, cost: 'Low', durability: 'Poor' }
  }

  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Environmental Integration</h2>
            <p className="text-gray-400">Natural light modeling and greenhouse optimization</p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {[
            { id: 'current', label: 'Current', icon: Activity },
            { id: 'daily', label: 'Daily', icon: Calendar },
            { id: 'seasonal', label: 'Seasonal', icon: BarChart3 }
          ].map(timeframe => (
            <button
              key={timeframe.id}
              onClick={() => setSelectedTimeframe(timeframe.id as any)}
              className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
                selectedTimeframe === timeframe.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <timeframe.icon className="w-3 h-3" />
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Conditions */}
      {selectedTimeframe === 'current' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solar Position & Natural Light */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-400" />
              Solar Conditions
            </h3>
            
            <div className="space-y-4">
              {currentSolar && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Solar Elevation:</span>
                      <span className="text-white ml-2">{currentSolar.altitude.toFixed(1)}°</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Solar Azimuth:</span>
                      <span className="text-white ml-2">{currentSolar.azimuth.toFixed(1)}°</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Global Irradiance:</span>
                      <span className="text-white ml-2">{currentSolar.globalHorizontalIrradiance.toFixed(0)} W/m²</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Cloud Cover:</span>
                      <span className="text-white ml-2">{(currentWeather.cloudCover * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Solar Path Visualization */}
                  <div className="mt-4">
                    <span className="text-sm text-gray-400 mb-2 block">Sun Position</span>
                    <div className="h-32 bg-gray-700 rounded relative overflow-hidden">
                      <svg className="w-full h-full">
                        {/* Sky dome background */}
                        <defs>
                          <radialGradient id="skyGradient" cx="50%" cy="100%" r="50%">
                            <stop offset="0%" stopColor="#87CEEB" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#191970" stopOpacity="0.8"/>
                          </radialGradient>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#skyGradient)"/>
                        
                        {/* Sun position */}
                        <circle
                          cx={((currentSolar.azimuth + 180) % 360) / 360 * 300}
                          cy={128 - (currentSolar.altitude / 90) * 64}
                          r="8"
                          fill="#FFD700"
                          stroke="#FFA500"
                          strokeWidth="2"
                        />
                        
                        {/* Horizon line */}
                        <line x1="0" y1="128" x2="300" y2="128" stroke="#666" strokeWidth="1" strokeDasharray="2,2"/>
                      </svg>
                      
                      <div className="absolute bottom-1 left-2 text-xs text-gray-400">W</div>
                      <div className="absolute bottom-1 right-2 text-xs text-gray-400">E</div>
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">S</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Natural Light Analysis */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-400" />
              Natural Light Analysis
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Outdoor PPFD:</span>
                  <span className="text-white ml-2">{naturalLightLevels.totalPPFD.toFixed(0)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Transmitted PPFD:</span>
                  <span className="text-white ml-2">{naturalLightLevels.transmittedPPFD.toFixed(0)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Transmission:</span>
                  <span className="text-white ml-2">
                    {naturalLightLevels.totalPPFD > 0 ? 
                      ((naturalLightLevels.transmittedPPFD / naturalLightLevels.totalPPFD) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Glazing Material:</span>
                  <span className="text-white ml-2 capitalize">{greenhouse.glazingProperties.material}</span>
                </div>
              </div>

              {/* Light contribution breakdown */}
              <div className="mt-4">
                <span className="text-sm text-gray-400 mb-2 block">Light Contribution</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Natural Light</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (naturalLightLevels.transmittedPPFD / 1000) * 100)}%` }}
                        />
                      </div>
                      <span className="text-white text-xs">{naturalLightLevels.transmittedPPFD.toFixed(0)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Artificial Light</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (artificialLighting.fixtures.reduce((sum, f) => sum + f.ppfd, 0) / artificialLighting.fixtures.length / 1000) * 100)}%` }}
                        />
                      </div>
                      <span className="text-white text-xs">
                        {(artificialLighting.fixtures.reduce((sum, f) => sum + f.ppfd, 0) / artificialLighting.fixtures.length).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Greenhouse Configuration */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Greenhouse Configuration
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Structure Type:</span>
                  <span className="text-white ml-2 capitalize">{greenhouse.type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Orientation:</span>
                  <span className="text-white ml-2">{greenhouse.orientation}° from N</span>
                </div>
                <div>
                  <span className="text-gray-400">Roof Angle:</span>
                  <span className="text-white ml-2">{greenhouse.roofAngle}°</span>
                </div>
                <div>
                  <span className="text-gray-400">Gutter Height:</span>
                  <span className="text-white ml-2">{greenhouse.gutterHeight}m</span>
                </div>
              </div>

              {/* Glazing Properties */}
              <div className="pt-4 border-t border-gray-700">
                <span className="text-sm text-gray-400 mb-2 block">Glazing Properties</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-300">PAR Transmittance:</span>
                    <span className="text-white">{(greenhouse.glazingProperties.transmittance.par * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">UV Transmittance:</span>
                    <span className="text-white">{(greenhouse.glazingProperties.transmittance.uv * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Thickness:</span>
                    <span className="text-white">{greenhouse.glazingProperties.thickness}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Weathering:</span>
                    <span className="text-white">{(greenhouse.glazingProperties.weathering * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Shading System */}
              {greenhouse.shadingSystem.type !== 'none' && (
                <div className="pt-4 border-t border-gray-700">
                  <span className="text-sm text-gray-400 mb-2 block">Shading System</span>
                  <div className="text-xs text-gray-300">
                    <div className="flex justify-between mb-1">
                      <span>Type:</span>
                      <span className="text-white capitalize">{greenhouse.shadingSystem.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transmittance:</span>
                      <span className="text-white">{(greenhouse.shadingSystem.transmittance * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Environmental Recommendations
            </h3>
            
            <div className="space-y-3">
              {lightingRecommendations.length > 0 ? (
                lightingRecommendations.map((rec, index) => (
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
                        </div>
                        <h4 className="text-white font-medium">{rec.title}</h4>
                        <p className="text-sm text-gray-300 mt-1">{rec.description}</p>
                        {rec.action.cost && (
                          <p className="text-xs text-gray-400 mt-1">Cost: {rec.action.cost}</p>
                        )}
                        {rec.action.savings && (
                          <p className="text-xs text-green-400 mt-1">Savings: {rec.action.savings}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-green-400 font-medium">Optimal Conditions</p>
                  <p className="text-sm text-gray-400">Environmental integration is working well</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seasonal Analysis */}
      {selectedTimeframe === 'seasonal' && seasonalData.length > 0 && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Annual Solar Analysis</h3>
            
            {/* Seasonal chart */}
            <div className="h-64 bg-gray-700 rounded relative overflow-hidden">
              <svg className="w-full h-full">
                {/* Chart background */}
                <defs>
                  <linearGradient id="seasonalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#065F46" stopOpacity="0.8"/>
                  </linearGradient>
                </defs>
                
                {/* Solar altitude curve */}
                <path
                  d={`M ${seasonalData.map((data, index) => 
                    `${(index / 11) * 300},${256 - (data.altitude / 90) * 200}`
                  ).join(' L ')}`}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                />
                
                {/* Irradiance area */}
                <path
                  d={`M 0,256 L ${seasonalData.map((data, index) => 
                    `${(index / 11) * 300},${256 - (data.globalHorizontalIrradiance / 1000) * 200}`
                  ).join(' L ')} L 300,256 Z`}
                  fill="url(#seasonalGradient)"
                />

                {/* Month labels */}
                {seasonalData.map((data, index) => (
                  <text
                    key={index}
                    x={(index / 11) * 300}
                    y="250"
                    fill="#9CA3AF"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {new Date(2024, data.month - 1, 1).toLocaleDateString('en-US', { month: 'short' })}
                  </text>
                ))}
              </svg>
              
              <div className="absolute top-2 left-2 text-xs text-gray-400">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-0.5 bg-green-500"></div>
                  <span>Solar Altitude</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 opacity-30 rounded"></div>
                  <span>Solar Irradiance</span>
                </div>
              </div>
            </div>

            {/* Seasonal recommendations */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <h4 className="text-blue-400 font-medium mb-2">Winter Optimization</h4>
                <p className="text-sm text-gray-300">
                  Low solar angles require maximum artificial lighting. Consider upgrading to higher PPFD fixtures.
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <h4 className="text-yellow-400 font-medium mb-2">Summer Management</h4>
                <p className="text-sm text-gray-300">
                  High natural light allows for significant energy savings. Implement automated dimming.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}