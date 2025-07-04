"use client"
import { useEffect, useState } from 'react'
import { 
  Leaf,
  Sun,
  TrendingUp,
  Clock,
  Target,
  BarChart3,
  Activity,
  Zap,
  Droplets,
  Thermometer,
  Brain,
  ChevronRight
} from 'lucide-react'
import { predictYield } from '@/lib/ml-yield-predictor'

interface PhotosyntheticCurve {
  wavelength: number
  absorptance: number
  quantumYield: number
}

interface PlantSpecies {
  id: string
  name: string
  category: 'leafy_greens' | 'herbs' | 'fruiting' | 'flowers' | 'cannabis'
  photosynthesis: {
    lightSaturation: number // μmol/m²/s
    lightCompensation: number // μmol/m²/s
    co2Saturation: number // ppm
    quantumEfficiency: number // mol CO2/mol photons
    photosystemII_efficiency: number
    actionSpectrum: PhotosyntheticCurve[]
  }
  morphology: {
    leafAreaIndex: number
    canopyExtinction: number
    leafThickness: number // mm
    chlorophyllContent: number // mg/m²
    canopyHeight: number // cm
  }
  responses: {
    redFarRedRatio: {
      stemElongation: (ratio: number) => number
      leafExpansion: (ratio: number) => number
      flowering: (ratio: number) => number
    }
    blueLight: {
      compactness: (percentage: number) => number
      chlorophyll: (percentage: number) => number
      stomatalConductance: (percentage: number) => number
    }
    uvResponse: {
      anthocyanins: (intensity: number) => number
      flavonoids: (intensity: number) => number
      morphogenesis: (intensity: number) => number
    }
  }
  growthStages: {
    [stage: string]: {
      duration: number // days
      dli_min: number
      dli_max: number
      photoperiod: number
      spectrum_weights: { [wavelength: number]: number }
      temperature_optimal: number
      humidity_optimal: number
    }
  }
  circadianResponse: {
    dawnDuskSensitivity: number
    phaseShiftCapability: number
    entrainmentRange: number // hours
  }
}

interface EnvironmentalConditions {
  co2: number // ppm
  temperature: number // °C
  humidity: number // %
  airflow: number // m/s
}

interface LightingSystem {
  fixtures: Array<{
    id: string
    spectrum: { [wavelength: number]: number }
    ppfd: number
    photoperiod: number
    position: { x: number, y: number, z: number }
  }>
}

interface PlantBiologyIntegrationProps {
  selectedSpecies: PlantSpecies
  currentStage: string
  environmentalConditions: EnvironmentalConditions
  lightingSystem: LightingSystem
  onOptimizationUpdate: (recommendations: any) => void
}

export function PlantBiologyIntegration({
  selectedSpecies,
  currentStage,
  environmentalConditions,
  lightingSystem,
  onOptimizationUpdate
}: PlantBiologyIntegrationProps) {
  const [biologicalAnalysis, setBiologicalAnalysis] = useState<{
    photosyntheticRate: number
    morphogenicResponse: any
    growthPrediction: any
    optimizations: any[]
  } | null>(null)

  const [realTimeMetrics, setRealTimeMetrics] = useState({
    currentDLI: 0,
    photosyntheticEfficiency: 0,
    morphogenicIndex: 0,
    stressLevel: 0,
    growthRate: 0
  })

  const [yieldPrediction, setYieldPrediction] = useState<{
    predicted: number
    confidence: number
    limitingFactors: Array<{ factor: string; impact: number }>
    optimizations: Array<{ factor: string; suggestion: string; potentialIncrease: number }>
  } | null>(null)

  // Advanced photosynthetic modeling using Farquhar-von Caemmerer-Berry model
  const calculatePhotosyntheticRate = (
    ppfd: number, 
    co2: number, 
    temperature: number, 
    species: PlantSpecies
  ) => {
    // Constants for C3 photosynthesis
    const R = 8.314 // Gas constant
    const Kc25 = 404.9 // Michaelis constant for CO2 at 25°C (μbar)
    const Ko25 = 278.4 // Michaelis constant for O2 at 25°C (mbar)
    const Gamma25 = 42.75 // CO2 compensation point at 25°C (μbar)
    const O = 210 // Oxygen concentration (mbar)
    
    // Temperature dependencies
    const tempK = temperature + 273.15
    const Kc = Kc25 * Math.exp(79430 * (tempK - 298.15) / (R * tempK * 298.15))
    const Ko = Ko25 * Math.exp(36380 * (tempK - 298.15) / (R * tempK * 298.15))
    const Gamma = Gamma25 * Math.exp(37830 * (tempK - 298.15) / (R * tempK * 298.15))
    
    // Rubisco-limited carboxylation rate
    const Vcmax = species.photosynthesis.quantumEfficiency * 100 // Simplified
    const Wc = (Vcmax * (co2 - Gamma)) / (co2 + Kc * (1 + O / Ko))
    
    // Light-limited carboxylation rate
    const J = (species.photosynthesis.photosystemII_efficiency * ppfd * 4.57) / 
              (1 + (species.photosynthesis.photosystemII_efficiency * ppfd * 4.57) / 
               (species.photosynthesis.lightSaturation * 2.1))
    const Wj = (J * (co2 - Gamma)) / (4 * (co2 + 2 * Gamma))
    
    // Net photosynthetic rate
    const Rd = 0.015 * Vcmax // Dark respiration
    const netPhotosynthesis = Math.min(Wc, Wj) - Rd
    
    return Math.max(0, netPhotosynthesis)
  }

  // Photomorphogenesis modeling
  const calculateMorphogenicResponse = (spectrum: { [wavelength: number]: number }) => {
    const red = (spectrum[660] || 0) + (spectrum[665] || 0)
    const farRed = (spectrum[730] || 0) + (spectrum[735] || 0)
    const blue = (spectrum[450] || 0) + (spectrum[470] || 0)
    const green = (spectrum[530] || 0) + (spectrum[550] || 0)
    const uv = (spectrum[365] || 0) + (spectrum[385] || 0)
    
    const rFrRatio = farRed > 0 ? red / farRed : 10
    const bluePercentage = blue / (red + green + blue + farRed) * 100
    
    // Calculate morphogenic responses
    const stemElongation = selectedSpecies.responses.redFarRedRatio.stemElongation(rFrRatio)
    const leafExpansion = selectedSpecies.responses.redFarRedRatio.leafExpansion(rFrRatio)
    const flowering = selectedSpecies.responses.redFarRedRatio.flowering(rFrRatio)
    const compactness = selectedSpecies.responses.blueLight.compactness(bluePercentage)
    const chlorophyllSynthesis = selectedSpecies.responses.blueLight.chlorophyll(bluePercentage)
    const secondaryMetabolites = selectedSpecies.responses.uvResponse.anthocyanins(uv)
    
    return {
      rFrRatio,
      bluePercentage,
      responses: {
        stemElongation,
        leafExpansion,
        flowering,
        compactness,
        chlorophyllSynthesis,
        secondaryMetabolites
      },
      morphogenicIndex: (compactness + chlorophyllSynthesis + flowering) / 3
    }
  }

  // Growth stage progression simulation
  const simulateGrowthProgression = () => {
    const currentStageData = selectedSpecies.growthStages[currentStage]
    if (!currentStageData) return null

    const avgPPFD = lightingSystem.fixtures.reduce((sum, f) => sum + f.ppfd, 0) / lightingSystem.fixtures.length
    const currentDLI = (avgPPFD * lightingSystem.fixtures[0]?.photoperiod || 0) * 3.6 / 1000

    // Growth rate calculation based on DLI efficiency
    const dliEfficiency = Math.min(
      currentDLI / currentStageData.dli_max,
      currentStageData.dli_max / Math.max(currentDLI, 0.1)
    )
    
    // Environmental stress factors
    const tempStress = 1 - Math.abs(environmentalConditions.temperature - currentStageData.temperature_optimal) / 10
    const humidityStress = 1 - Math.abs(environmentalConditions.humidity - currentStageData.humidity_optimal) / 20
    const co2Enhancement = Math.min(environmentalConditions.co2 / selectedSpecies.photosynthesis.co2Saturation, 2)
    
    const overallGrowthRate = dliEfficiency * tempStress * humidityStress * co2Enhancement
    
    // Predict stage completion
    const daysToCompletion = currentStageData.duration / Math.max(overallGrowthRate, 0.1)
    
    return {
      currentDLI,
      dliEfficiency,
      environmentalStress: (tempStress + humidityStress) / 2,
      co2Enhancement,
      overallGrowthRate,
      daysToCompletion,
      stageProgress: Math.min(100, (1 - daysToCompletion / currentStageData.duration) * 100)
    }
  }

  // Circadian rhythm optimization
  const optimizeCircadianLighting = () => {
    const dawnTime = 6 // 6 AM
    const duskTime = 18 // 6 PM
    const transitionDuration = 1 // 1 hour
    
    // Calculate optimal photoperiod for current stage
    const currentStageData = selectedSpecies.growthStages[currentStage]
    const targetPhotoperiod = currentStageData?.photoperiod || 16
    
    // Generate 24-hour lighting schedule
    const schedule = []
    for (let hour = 0; hour < 24; hour++) {
      let intensity = 0
      let spectrum = { ...selectedSpecies.growthStages[currentStage]?.spectrum_weights || {} }
      
      if (hour >= dawnTime && hour < dawnTime + transitionDuration) {
        // Dawn simulation - gradual increase with more red
        intensity = ((hour - dawnTime) / transitionDuration) * 100
        spectrum = { ...spectrum, 660: (spectrum[660] || 0) * 1.5 }
      } else if (hour >= dawnTime + transitionDuration && hour < duskTime - transitionDuration) {
        // Full photoperiod
        intensity = 100
      } else if (hour >= duskTime - transitionDuration && hour < duskTime) {
        // Dusk simulation - gradual decrease with more far-red
        intensity = (1 - (hour - (duskTime - transitionDuration)) / transitionDuration) * 100
        spectrum = { ...spectrum, 730: (spectrum[730] || 0) * 2 }
      } else {
        // Night period
        intensity = 0
      }
      
      schedule.push({ hour, intensity, spectrum })
    }
    
    return {
      schedule,
      photoperiod: targetPhotoperiod,
      dawnDuskTransitions: true,
      circadianOptimization: selectedSpecies.circadianResponse.entrainmentRange
    }
  }

  // Generate optimization recommendations
  const generateOptimizations = () => {
    const morphogenic = calculateMorphogenicResponse(
      lightingSystem.fixtures[0]?.spectrum || {}
    )
    const growth = simulateGrowthProgression()
    const circadian = optimizeCircadianLighting()
    
    if (!growth) return []

    const recommendations = []

    // DLI optimization
    if (growth.currentDLI < selectedSpecies.growthStages[currentStage]?.dli_min) {
      recommendations.push({
        type: 'dli_increase',
        priority: 'high',
        title: 'Increase Daily Light Integral',
        description: `Current DLI (${growth.currentDLI.toFixed(1)}) is below optimal range. Increase photoperiod or intensity.`,
        action: {
          type: 'intensity_adjustment',
          target: selectedSpecies.growthStages[currentStage]?.dli_min * 1.1
        }
      })
    }

    // Spectrum optimization
    if (morphogenic.rFrRatio < 1.2 && selectedSpecies.category === 'leafy_greens') {
      recommendations.push({
        type: 'spectrum_adjustment',
        priority: 'medium',
        title: 'Increase Red:Far-Red Ratio',
        description: 'Low R:FR ratio may cause excessive stem elongation. Increase red or reduce far-red.',
        action: {
          type: 'spectrum_adjustment',
          wavelength: 660,
          adjustment: '+20%'
        }
      })
    }

    if (morphogenic.bluePercentage < 10) {
      recommendations.push({
        type: 'spectrum_adjustment',
        priority: 'medium',
        title: 'Increase Blue Light Percentage',
        description: 'Insufficient blue light may reduce compactness and chlorophyll synthesis.',
        action: {
          type: 'spectrum_adjustment',
          wavelength: 450,
          adjustment: '+15%'
        }
      })
    }

    // Environmental optimization
    if (growth.environmentalStress < 0.8) {
      recommendations.push({
        type: 'environmental',
        priority: 'high',
        title: 'Optimize Environmental Conditions',
        description: 'Temperature or humidity stress detected. Adjust climate control.',
        action: {
          type: 'climate_adjustment',
          temperature: selectedSpecies.growthStages[currentStage]?.temperature_optimal,
          humidity: selectedSpecies.growthStages[currentStage]?.humidity_optimal
        }
      })
    }

    // CO2 enhancement
    if (environmentalConditions.co2 < selectedSpecies.photosynthesis.co2Saturation * 0.8) {
      recommendations.push({
        type: 'co2_enhancement',
        priority: 'low',
        title: 'CO2 Enrichment Opportunity',
        description: `CO2 levels could be increased to ${selectedSpecies.photosynthesis.co2Saturation}ppm for enhanced photosynthesis.`,
        action: {
          type: 'co2_adjustment',
          target: selectedSpecies.photosynthesis.co2Saturation
        }
      })
    }

    return recommendations
  }

  // Update analysis when inputs change
  useEffect(() => {
    const avgPPFD = lightingSystem.fixtures.reduce((sum, f) => sum + f.ppfd, 0) / lightingSystem.fixtures.length
    
    const photosyntheticRate = calculatePhotosyntheticRate(
      avgPPFD,
      environmentalConditions.co2,
      environmentalConditions.temperature,
      selectedSpecies
    )
    
    const morphogenicResponse = calculateMorphogenicResponse(
      lightingSystem.fixtures[0]?.spectrum || {}
    )
    
    const growthPrediction = simulateGrowthProgression()
    const optimizations = generateOptimizations()
    
    setBiologicalAnalysis({
      photosyntheticRate,
      morphogenicResponse,
      growthPrediction,
      optimizations
    })

    if (growthPrediction) {
      setRealTimeMetrics({
        currentDLI: growthPrediction.currentDLI,
        photosyntheticEfficiency: photosyntheticRate / selectedSpecies.photosynthesis.lightSaturation,
        morphogenicIndex: morphogenicResponse.morphogenicIndex,
        stressLevel: 1 - growthPrediction.environmentalStress,
        growthRate: growthPrediction.overallGrowthRate
      })
      
      // Calculate ML yield prediction
      const prediction = predictYield({
        crop: selectedSpecies.name.toLowerCase() as any,
        ppfd: avgPPFD,
        dli: growthPrediction.currentDLI,
        temperature: environmentalConditions.temperature,
        co2: environmentalConditions.co2,
        vpd: (environmentalConditions as any).vpd || 1.2,
        spectrum: {
          red: 30,
          blue: morphogenicResponse.bluePercentage || 20,
          green: 10,
          farRed: 5,
          white: 35
        }
      })
      
      setYieldPrediction(prediction)
    }

    onOptimizationUpdate(optimizations)
  }, [selectedSpecies, currentStage, environmentalConditions, lightingSystem])

  if (!biologicalAnalysis) return <div>Loading biological analysis...</div>

  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Leaf className="w-6 h-6 text-green-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Plant Biology Integration</h2>
            <p className="text-gray-400">{selectedSpecies.name} - {currentStage} stage</p>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">DLI</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {realTimeMetrics.currentDLI.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">mol/m²/day</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Photosynthesis</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {(realTimeMetrics.photosyntheticEfficiency * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">efficiency</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Growth Rate</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {(realTimeMetrics.growthRate * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">of optimal</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Morphogenic</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {(realTimeMetrics.morphogenicIndex * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">index</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Stress Level</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {(realTimeMetrics.stressLevel * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">environmental</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photosynthetic Analysis */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Photosynthetic Performance
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Net Photosynthetic Rate</span>
              <span className="text-white font-semibold">
                {biologicalAnalysis.photosyntheticRate.toFixed(2)} μmol CO₂/m²/s
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Light Saturation Point</span>
              <span className="text-white font-semibold">
                {selectedSpecies.photosynthesis.lightSaturation} μmol/m²/s
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Quantum Efficiency</span>
              <span className="text-white font-semibold">
                {selectedSpecies.photosynthesis.quantumEfficiency.toFixed(3)} mol CO₂/mol photons
              </span>
            </div>

            {/* Light Response Curve Visualization */}
            <div className="mt-4">
              <span className="text-sm text-gray-400 mb-2 block">Light Response</span>
              <div className="h-24 bg-gray-700 rounded relative overflow-hidden">
                <svg className="w-full h-full">
                  <defs>
                    <linearGradient id="lightResponse" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                      <stop offset="50%" stopColor="#059669" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="#065F46" stopOpacity="0.8"/>
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0,90 Q 150,20 300,15 L 300,96 L 0,96 Z`}
                    fill="url(#lightResponse)"
                  />
                  <line
                    x1={`${(realTimeMetrics.currentDLI / 50) * 300}`}
                    y1="0"
                    x2={`${(realTimeMetrics.currentDLI / 50) * 300}`}
                    y2="96"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                  />
                </svg>
                <div className="absolute bottom-1 left-2 text-xs text-gray-500">0</div>
                <div className="absolute bottom-1 right-2 text-xs text-gray-500">50 DLI</div>
                <div className="absolute top-1 right-2 text-xs text-red-400">Current</div>
              </div>
            </div>
          </div>
        </div>

        {/* Morphogenic Response */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Morphogenic Response
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">R:FR Ratio</span>
              <span className="text-white font-semibold">
                {biologicalAnalysis.morphogenicResponse.rFrRatio.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Blue Light %</span>
              <span className="text-white font-semibold">
                {biologicalAnalysis.morphogenicResponse.bluePercentage.toFixed(1)}%
              </span>
            </div>

            {/* Response indicators */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Stem Elongation</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, biologicalAnalysis.morphogenicResponse.responses.stemElongation * 100)}%` }}
                    />
                  </div>
                  <span className="text-white text-xs">
                    {(biologicalAnalysis.morphogenicResponse.responses.stemElongation * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Compactness</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, biologicalAnalysis.morphogenicResponse.responses.compactness * 100)}%` }}
                    />
                  </div>
                  <span className="text-white text-xs">
                    {(biologicalAnalysis.morphogenicResponse.responses.compactness * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Flowering Response</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, biologicalAnalysis.morphogenicResponse.responses.flowering * 100)}%` }}
                    />
                  </div>
                  <span className="text-white text-xs">
                    {(biologicalAnalysis.morphogenicResponse.responses.flowering * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Prediction */}
        {biologicalAnalysis.growthPrediction && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Growth Progression
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Stage Progress</span>
                <span className="text-white font-semibold">
                  {biologicalAnalysis.growthPrediction.stageProgress.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Days to Completion</span>
                <span className="text-white font-semibold">
                  {biologicalAnalysis.growthPrediction.daysToCompletion.toFixed(1)} days
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Growth Rate</span>
                <span className={`font-semibold ${
                  biologicalAnalysis.growthPrediction.overallGrowthRate >= 0.8 ? 'text-green-400' :
                  biologicalAnalysis.growthPrediction.overallGrowthRate >= 0.6 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {(biologicalAnalysis.growthPrediction.overallGrowthRate * 100).toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                    style={{ width: `${biologicalAnalysis.growthPrediction.stageProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ML Yield Prediction */}
        {yieldPrediction && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              ML Yield Prediction
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm text-gray-400">Predicted Yield</div>
                    <div className="text-2xl font-bold text-white">
                      {yieldPrediction.predicted.toFixed(1)} g/m²/day
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Confidence</div>
                    <div className="text-lg font-semibold text-green-400">
                      {(yieldPrediction.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Based on current environmental conditions and plant characteristics
                </div>
              </div>

              {/* Limiting Factors */}
              {yieldPrediction.limitingFactors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Limiting Factors</h4>
                  <div className="space-y-2">
                    {yieldPrediction.limitingFactors.map((factor, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{factor.factor}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-600 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                factor.impact > 0.2 ? 'bg-red-500' : 
                                factor.impact > 0.1 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(100, factor.impact * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            -{(factor.impact * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ML Optimizations */}
              {yieldPrediction.optimizations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">ML-Suggested Optimizations</h4>
                  <div className="space-y-2">
                    {yieldPrediction.optimizations.slice(0, 3).map((opt, idx) => (
                      <div key={idx} className="bg-gray-700 rounded p-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm text-white font-medium">{opt.factor}</div>
                            <div className="text-xs text-gray-400 mt-1">{opt.suggestion}</div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-sm font-semibold text-green-400">
                              +{opt.potentialIncrease}%
                            </div>
                            <div className="text-xs text-gray-500">yield</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Optimization Recommendations */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            AI Recommendations
          </h3>
          
          <div className="space-y-3">
            {biologicalAnalysis.optimizations.length > 0 ? (
              biologicalAnalysis.optimizations.map((opt, index) => (
                <div key={index} className={`p-3 rounded border ${
                  opt.priority === 'high' ? 'border-red-500 bg-red-500/10' :
                  opt.priority === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                  'border-blue-500 bg-blue-500/10'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          opt.priority === 'high' ? 'bg-red-500 text-white' :
                          opt.priority === 'medium' ? 'bg-yellow-500 text-black' :
                          'bg-blue-500 text-white'
                        }`}>
                          {opt.priority.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-white font-medium">{opt.title}</h4>
                      <p className="text-sm text-gray-300 mt-1">{opt.description}</p>
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
                <p className="text-sm text-gray-400">No adjustments needed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}