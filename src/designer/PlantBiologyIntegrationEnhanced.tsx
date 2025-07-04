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
  ChevronRight,
  AlertTriangle,
  Eye,
  FlaskConical,
  Bug,
  Microscope,
  CheckCircle,
  Heart,
  Gauge,
  Beaker,
  TreePine,
  Waves,
  Wind
} from 'lucide-react'
import { predictYield } from '@/lib/ml-yield-predictor'
import { enhancedYieldPredictor } from '@/lib/ml-yield-predictor-enhanced'

// Import the original interfaces and extend them
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
    lightSaturation: number
    lightCompensation: number
    co2Saturation: number
    quantumEfficiency: number
    photosystemII_efficiency: number
    actionSpectrum: PhotosyntheticCurve[]
  }
  morphology: {
    leafAreaIndex: number
    canopyExtinction: number
    leafThickness: number
    chlorophyllContent: number
    canopyHeight: number
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
  }
  growthStages: {
    [stage: string]: {
      duration: number
      dli_requirement: number
      temperature_optimal: number
      humidity_optimal: number
      nutrient_ec_optimal: number
      spectrum_requirements: { red: number; blue: number }
    }
  }
  circadianBiology: {
    photoperiodicResponse: 'short-day' | 'long-day' | 'day-neutral'
    criticalPhotoperiod: number
    dawnDuskResponse: boolean
    phaseShiftCapability: number
    entrainmentRange: number
  }
}

// Enhanced Environmental Conditions
interface EnhancedEnvironmentalConditions {
  // Basic atmospheric
  temperature: number
  humidity: number
  co2: number
  vpd?: number
  airflow: number
  
  // Water relations
  waterAvailability: number // 0-1 scale
  substrateMoisture: number // %
  irrigationEC: number
  irrigationPH: number
  runoffEC?: number
  runoffPH?: number
  
  // Root zone
  rootZoneTemp: number
  rootZoneOxygen: number // mg/L
  
  // Nutrients in solution
  nutrients: {
    nitrogen: number
    phosphorus: number
    potassium: number
    calcium: number
    magnesium: number
    sulfur: number
    // Micronutrients
    iron?: number
    manganese?: number
    zinc?: number
    copper?: number
    boron?: number
    molybdenum?: number
    chloride?: number
  }
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

interface PlantHealthData {
  overallScore: number
  issues: Array<{
    type: 'disease' | 'pest' | 'nutrient' | 'environmental'
    name: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    description: string
    recommendations: string[]
  }>
  tissueAnalysis?: {
    date: string
    results: { [nutrient: string]: number }
    deficiencies: string[]
    toxicities: string[]
  }
  pestMonitoring?: {
    populations: { [pest: string]: number }
    beneficials: { [beneficial: string]: number }
    ipmScore: number
  }
}

// Hyperspectral data interface for integration
interface HyperspectralData {
  timestamp: string
  vegetationIndices: {
    ndvi: number
    evi: number
    savi: number
    pri: number
    wbi: number
    mcari: number
  }
  stressIndicators: {
    waterStress: boolean
    nutrientDeficiency: boolean
    diseasePresence: boolean
    pestInfestation: boolean
  }
  chlorophyllContent: number
  carotenoidContent: number
  anthocyaninContent: number
}

interface PlantBiologyIntegrationEnhancedProps {
  selectedSpecies: PlantSpecies
  currentStage: string
  environmentalConditions: EnhancedEnvironmentalConditions
  lightingSystem: LightingSystem
  plantHealthData?: PlantHealthData
  growthHistory?: Array<{ date: string; height: number; leafCount: number; biomass?: number }>
  hyperspectralData?: HyperspectralData
  onOptimizationUpdate?: (recommendations: any) => void
}

export function PlantBiologyIntegrationEnhanced({
  selectedSpecies,
  currentStage,
  environmentalConditions,
  lightingSystem,
  plantHealthData,
  growthHistory,
  hyperspectralData,
  onOptimizationUpdate
}: PlantBiologyIntegrationEnhancedProps) {
  
  // State for various analyses
  const [biologicalAnalysis, setBiologicalAnalysis] = useState<any>(null)
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    currentDLI: 0,
    photosyntheticEfficiency: 0,
    morphogenicIndex: 0,
    stressLevel: 0,
    growthRate: 0,
    waterUseEfficiency: 0,
    nutrientUseEfficiency: 0
  })
  
  // Enhanced yield predictions
  const [simplePrediction, setSimplePrediction] = useState<any>(null)
  const [enhancedPrediction, setEnhancedPrediction] = useState<any>(null)
  const [predictionMode, setPredictionMode] = useState<'simple' | 'enhanced'>('enhanced')
  
  // Additional monitoring states
  const [phenologyStatus, setPhenologyStatus] = useState<any>(null)
  const [stressFactors, setStressFactors] = useState<any[]>([])
  const [growthRateAnalysis, setGrowthRateAnalysis] = useState<any>(null)
  
  // Calculate Growing Degree Days
  const calculateGDD = (baseTemp: number = 10) => {
    const avgTemp = environmentalConditions.temperature
    return Math.max(0, avgTemp - baseTemp)
  }
  
  // Calculate comprehensive stress index
  const calculateStressIndex = () => {
    const stresses = []
    
    // Temperature stress
    const tempOptimal = selectedSpecies.growthStages[currentStage]?.temperature_optimal || 22
    const tempStress = Math.abs(environmentalConditions.temperature - tempOptimal) / 10
    if (tempStress > 0.2) {
      stresses.push({ 
        type: 'temperature', 
        severity: tempStress,
        description: environmentalConditions.temperature > tempOptimal ? 'Too hot' : 'Too cold'
      })
    }
    
    // VPD stress
    const vpdOptimal = 1.0
    const vpdStress = Math.abs((environmentalConditions.vpd || 1.0) - vpdOptimal) / 2
    if (vpdStress > 0.2) {
      stresses.push({ 
        type: 'vpd', 
        severity: vpdStress,
        description: (environmentalConditions.vpd || 1.0) > vpdOptimal ? 'VPD too high' : 'VPD too low'
      })
    }
    
    // Nutrient stress (EC deviation)
    const ecOptimal = selectedSpecies.growthStages[currentStage]?.nutrient_ec_optimal || 1.8
    const ecStress = Math.abs(environmentalConditions.irrigationEC - ecOptimal) / 2
    if (ecStress > 0.2) {
      stresses.push({ 
        type: 'nutrients', 
        severity: ecStress,
        description: environmentalConditions.irrigationEC > ecOptimal ? 'EC too high' : 'EC too low'
      })
    }
    
    // pH stress
    const phOptimal = 6.0
    const phStress = Math.abs(environmentalConditions.irrigationPH - phOptimal) / 2
    if (phStress > 0.2) {
      stresses.push({ 
        type: 'ph', 
        severity: phStress,
        description: `pH ${environmentalConditions.irrigationPH.toFixed(1)} (optimal: ${phOptimal})`
      })
    }
    
    // Water stress
    const waterStress = 1 - environmentalConditions.waterAvailability
    if (waterStress > 0.2) {
      stresses.push({ 
        type: 'water', 
        severity: waterStress,
        description: 'Water stress detected'
      })
    }
    
    // Oxygen stress
    const o2Stress = environmentalConditions.rootZoneOxygen < 6 ? (6 - environmentalConditions.rootZoneOxygen) / 6 : 0
    if (o2Stress > 0.2) {
      stresses.push({ 
        type: 'oxygen', 
        severity: o2Stress,
        description: 'Root zone oxygen low'
      })
    }
    
    // Health-related stress
    if (plantHealthData && plantHealthData.overallScore < 90) {
      const healthStress = (100 - plantHealthData.overallScore) / 100
      stresses.push({ 
        type: 'health', 
        severity: healthStress,
        description: `Health issues detected (${plantHealthData.issues.length})`
      })
    }
    
    // Hyperspectral-based stress detection
    if (hyperspectralData) {
      // Water stress from hyperspectral data
      if (hyperspectralData.stressIndicators.waterStress) {
        stresses.push({
          type: 'water_hyperspectral',
          severity: 0.7,
          description: 'Water stress detected by hyperspectral imaging'
        })
      }
      
      // Nutrient stress from hyperspectral data
      if (hyperspectralData.stressIndicators.nutrientDeficiency) {
        stresses.push({
          type: 'nutrient_hyperspectral',
          severity: 0.6,
          description: 'Nutrient deficiency detected by hyperspectral imaging'
        })
      }
      
      // Chlorophyll stress (if below optimal)
      if (hyperspectralData.chlorophyllContent < 30) {
        stresses.push({
          type: 'chlorophyll',
          severity: (30 - hyperspectralData.chlorophyllContent) / 30,
          description: `Low chlorophyll content: ${hyperspectralData.chlorophyllContent.toFixed(1)} mg/g`
        })
      }
    }
    
    setStressFactors(stresses)
    return stresses.reduce((total, stress) => total + stress.severity, 0) / (stresses.length || 1)
  }
  
  // Enhanced photosynthesis calculation using Farquhar model
  const calculateEnhancedPhotosynthesis = () => {
    const avgPPFD = lightingSystem.fixtures.reduce((sum, f) => sum + f.ppfd, 0) / lightingSystem.fixtures.length
    
    // This would use the Farquhar model from enhanced predictor
    // For now, simplified version
    const lightResponse = avgPPFD / (avgPPFD + 200) // Michaelis-Menten
    const co2Response = environmentalConditions.co2 / (environmentalConditions.co2 + 300)
    const tempResponse = Math.exp(-0.5 * Math.pow((environmentalConditions.temperature - 22) / 5, 2))
    
    return lightResponse * co2Response * tempResponse
  }
  
  // Calculate phenological status
  const calculatePhenology = () => {
    if (!growthHistory || growthHistory.length < 2) return null
    
    // Calculate growth rates
    const recentGrowth = growthHistory.slice(-7) // Last week
    const heightGrowthRate = recentGrowth.length > 1 ? 
      (recentGrowth[recentGrowth.length - 1].height - recentGrowth[0].height) / recentGrowth.length : 0
    
    const leafGrowthRate = recentGrowth.length > 1 ?
      (recentGrowth[recentGrowth.length - 1].leafCount - recentGrowth[0].leafCount) / recentGrowth.length : 0
    
    // Estimate days to next stage
    const stageProgress = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 // This would be calculated based on GDD
    const daysToNextStage = Math.round((100 - stageProgress) / 5)
    
    return {
      currentStage,
      stageProgress,
      daysToNextStage,
      heightGrowthRate,
      leafGrowthRate,
      gddAccumulated: calculateGDD() * growthHistory.length,
      photoperiodResponse: selectedSpecies.circadianBiology?.photoperiodicResponse || 'day-neutral'
    }
  }
  
  // Main analysis effect
  useEffect(() => {
    const avgPPFD = lightingSystem.fixtures.reduce((sum, f) => sum + f.ppfd, 0) / lightingSystem.fixtures.length
    const photoperiod = lightingSystem.fixtures[0]?.photoperiod || 16
    const currentDLI = avgPPFD * photoperiod * 0.0036
    
    // Calculate stress index
    const stressIndex = calculateStressIndex()
    
    // Enhanced photosynthesis
    const photosynthesisRate = calculateEnhancedPhotosynthesis()
    
    // Calculate spectrum percentages
    const spectrum = lightingSystem.fixtures[0]?.spectrum || {}
    const totalIntensity = Object.values(spectrum).reduce((sum, val) => sum + val, 0) || 1
    const spectrumPercentages = {
      red: ((spectrum[660] || 0) / totalIntensity) * 100,
      blue: ((spectrum[450] || 0) / totalIntensity) * 100,
      green: ((spectrum[530] || 0) / totalIntensity) * 100,
      farRed: ((spectrum[730] || 0) / totalIntensity) * 100,
      uv: ((spectrum[380] || 0) / totalIntensity) * 100,
      white: 100 - ((spectrum[660] || 0) + (spectrum[450] || 0) + (spectrum[530] || 0) + (spectrum[730] || 0) + (spectrum[380] || 0)) / totalIntensity * 100
    }
    
    // Simple yield prediction
    const simplePred = predictYield({
      crop: selectedSpecies.name.toLowerCase(),
      ppfd: avgPPFD,
      dli: currentDLI,
      temperature: environmentalConditions.temperature,
      co2: environmentalConditions.co2,
      vpd: environmentalConditions.vpd || 1.0,
      spectrum: spectrumPercentages
    })
    setSimplePrediction(simplePred)
    
    // Enhanced yield prediction
    try {
      const enhancedPred = enhancedYieldPredictor.predictYieldEnhanced({
        ppfd: avgPPFD,
        dli: currentDLI,
        temperature: environmentalConditions.temperature,
        co2: environmentalConditions.co2,
        vpd: environmentalConditions.vpd || 1.0,
        spectrum: spectrumPercentages,
        waterAvailability: environmentalConditions.waterAvailability,
        substrateMoisture: environmentalConditions.substrateMoisture,
        relativeHumidity: environmentalConditions.humidity,
        ec: environmentalConditions.irrigationEC,
        ph: environmentalConditions.irrigationPH,
        nutrients: environmentalConditions.nutrients,
        leafAreaIndex: selectedSpecies.morphology.leafAreaIndex,
        growthStage: currentStage as any,
        plantAge: growthHistory?.length || 30,
        photoperiod: photoperiod,
        rootZoneTemp: environmentalConditions.rootZoneTemp,
        oxygenLevel: environmentalConditions.rootZoneOxygen,
        airFlow: environmentalConditions.airflow
      })
      setEnhancedPrediction(enhancedPred)
    } catch (error) {
      console.error('Enhanced prediction error:', error)
    }
    
    // Update real-time metrics
    setRealTimeMetrics({
      currentDLI,
      photosyntheticEfficiency: photosynthesisRate,
      morphogenicIndex: spectrumPercentages.red / (spectrumPercentages.farRed + 0.1),
      stressLevel: stressIndex,
      growthRate: 1 - stressIndex,
      waterUseEfficiency: enhancedPrediction?.waterUseEfficiency || 3.0,
      nutrientUseEfficiency: environmentalConditions.nutrients.nitrogen / (environmentalConditions.irrigationEC * 100)
    })
    
    // Calculate phenology
    setPhenologyStatus(calculatePhenology())
    
    // Generate comprehensive recommendations
    const recommendations = generateComprehensiveRecommendations()
    if (onOptimizationUpdate) {
      onOptimizationUpdate(recommendations)
    }
    
  }, [selectedSpecies, currentStage, environmentalConditions, lightingSystem, plantHealthData, growthHistory, hyperspectralData])
  
  const generateComprehensiveRecommendations = () => {
    const recommendations = []
    
    // Stress-based recommendations
    stressFactors.forEach(stress => {
      if (stress.severity > 0.3) {
        recommendations.push({
          type: stress.type,
          priority: stress.severity > 0.5 ? 'critical' : 'high',
          title: `Address ${stress.type} stress`,
          description: stress.description,
          action: getStressRemediation(stress.type)
        })
      }
    })
    
    // Health-based recommendations
    if (plantHealthData && plantHealthData.issues.length > 0) {
      plantHealthData.issues.forEach(issue => {
        if (issue.severity === 'high' || issue.severity === 'critical') {
          recommendations.push({
            type: 'health',
            priority: issue.severity,
            title: `Treat ${issue.name}`,
            description: issue.description,
            action: issue.recommendations[0] || 'Consult IPM protocols'
          })
        }
      })
    }
    
    // Yield optimization recommendations
    if (enhancedPrediction && enhancedPrediction.predictedYield < 4.0) {
      recommendations.push({
        type: 'yield',
        priority: 'medium',
        title: 'Optimize yield potential',
        description: `Current yield ${enhancedPrediction.predictedYield.toFixed(1)} kg/m²/cycle below optimal`,
        action: 'Review environmental setpoints and nutrient program'
      })
    }
    
    return recommendations
  }
  
  const getStressRemediation = (stressType: string) => {
    const remediations: { [key: string]: string } = {
      temperature: 'Adjust HVAC setpoints or increase ventilation',
      vpd: 'Adjust temperature/humidity balance',
      nutrients: 'Adjust fertilizer concentration',
      ph: 'Add pH adjustment to irrigation',
      water: 'Increase irrigation frequency or volume',
      oxygen: 'Improve drainage or reduce irrigation frequency',
      health: 'Implement IPM protocols',
      water_hyperspectral: 'Immediate irrigation needed - hyperspectral analysis shows cellular water stress',
      nutrient_hyperspectral: 'Perform tissue analysis and adjust nutrient program based on spectral deficiency',
      chlorophyll: 'Increase nitrogen availability or check for root/disease issues affecting chlorophyll synthesis'
    }
    return remediations[stressType] || 'Monitor and adjust'
  }
  
  if (!biologicalAnalysis && !simplePrediction) return <div>Loading enhanced biological analysis...</div>
  
  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Leaf className="w-6 h-6 text-green-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Enhanced Plant Biology Integration</h2>
            <p className="text-gray-400">{selectedSpecies.name} - {currentStage} stage</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPredictionMode(predictionMode === 'simple' ? 'enhanced' : 'simple')}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            {predictionMode === 'enhanced' ? 'Enhanced Model' : 'Simple Model'}
          </button>
        </div>
      </div>

      {/* Real-time Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
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
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">WUE</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {realTimeMetrics.waterUseEfficiency.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">g/L</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Beaker className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">NUE</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {(realTimeMetrics.nutrientUseEfficiency * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">efficiency</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-400">Stress</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {(realTimeMetrics.stressLevel * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">index</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Growth</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {(realTimeMetrics.growthRate * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">of optimal</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Health</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {plantHealthData?.overallScore || 95}%
          </div>
          <div className="text-xs text-gray-500">score</div>
        </div>
      </div>

      {/* Active Stress Factors */}
      {stressFactors.length > 0 && (
        <div className="bg-red-900/20 rounded-lg border border-red-800 p-4 mb-6">
          <h3 className="text-sm font-semibold text-red-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Active Stress Factors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {stressFactors.map((stress, idx) => (
              <div key={idx} className="flex items-center justify-between bg-red-900/30 rounded p-2">
                <span className="text-sm text-red-200">{stress.description}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-red-900 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, stress.severity * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-red-300">
                    {(stress.severity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phenology Status */}
      {phenologyStatus && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Phenological Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-400">Stage Progress</div>
              <div className="text-lg font-semibold text-white">{phenologyStatus.stageProgress.toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Days to Next Stage</div>
              <div className="text-lg font-semibold text-white">{phenologyStatus.daysToNextStage}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Height Growth</div>
              <div className="text-lg font-semibold text-white">{phenologyStatus.heightGrowthRate.toFixed(1)} cm/day</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">GDD Accumulated</div>
              <div className="text-lg font-semibold text-white">{phenologyStatus.gddAccumulated.toFixed(0)}°C</div>
            </div>
          </div>
        </div>
      )}

      {/* Yield Prediction Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Simple Model */}
        {simplePrediction && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Simple ML Prediction
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-400">Predicted Yield</div>
                    <div className="text-2xl font-bold text-white">
                      {simplePrediction.predicted.toFixed(1)} g/m²/day
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Confidence</div>
                    <div className="text-lg font-semibold text-green-400">
                      {(simplePrediction.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Model */}
        {enhancedPrediction && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Microscope className="w-5 h-5 text-green-400" />
              Enhanced Scientific Prediction
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-400">Predicted Yield</div>
                    <div className="text-2xl font-bold text-white">
                      {enhancedPrediction.predictedYield.toFixed(1)} kg/m²/cycle
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Confidence</div>
                    <div className="text-lg font-semibold text-green-400">
                      {(enhancedPrediction.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional enhanced metrics */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-600 rounded p-2">
                  <div className="text-gray-400">Photosynthesis</div>
                  <div className="text-white font-medium">
                    {enhancedPrediction.photosynthesisRate?.toFixed(1) || 'N/A'} μmol/m²/s
                  </div>
                </div>
                <div className="bg-gray-600 rounded p-2">
                  <div className="text-gray-400">Transpiration</div>
                  <div className="text-white font-medium">
                    {enhancedPrediction.transpirationRate?.toFixed(1) || 'N/A'} mm/day
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hyperspectral Analysis */}
      {hyperspectralData && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Microscope className="w-5 h-5 text-purple-400" />
            Hyperspectral Analysis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Vegetation Indices */}
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400 mb-2">Vegetation Indices</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">NDVI:</span>
                  <span className={`font-medium ${
                    hyperspectralData.vegetationIndices.ndvi > 0.6 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {hyperspectralData.vegetationIndices.ndvi.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">EVI:</span>
                  <span className="text-white">{hyperspectralData.vegetationIndices.evi.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">PRI:</span>
                  <span className="text-white">{hyperspectralData.vegetationIndices.pri.toFixed(3)}</span>
                </div>
              </div>
            </div>
            
            {/* Pigment Content */}
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400 mb-2">Pigment Content</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Chlorophyll:</span>
                  <span className={`font-medium ${
                    hyperspectralData.chlorophyllContent > 30 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {hyperspectralData.chlorophyllContent.toFixed(1)} mg/g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Carotenoids:</span>
                  <span className="text-white">{hyperspectralData.carotenoidContent.toFixed(1)} mg/g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Anthocyanins:</span>
                  <span className="text-white">{hyperspectralData.anthocyaninContent.toFixed(1)} mg/g</span>
                </div>
              </div>
            </div>
            
            {/* Stress Indicators */}
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400 mb-2">Stress Detection</div>
              <div className="space-y-1">
                {Object.entries(hyperspectralData.stressIndicators).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    {value ? (
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                    ) : (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    )}
                    <span className="text-gray-300">
                      {key.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() + 
                       key.replace(/([A-Z])/g, ' $1').slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integrated Health Monitoring */}
      {plantHealthData && plantHealthData.issues.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bug className="w-5 h-5 text-orange-400" />
            Plant Health Issues
          </h3>
          <div className="space-y-2">
            {plantHealthData.issues.map((issue, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${
                issue.severity === 'critical' ? 'bg-red-900/20 border-red-800' :
                issue.severity === 'high' ? 'bg-orange-900/20 border-orange-800' :
                'bg-yellow-900/20 border-yellow-800'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-white">{issue.name}</div>
                    <div className="text-sm text-gray-400 mt-1">{issue.description}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    issue.severity === 'critical' ? 'bg-red-600 text-white' :
                    issue.severity === 'high' ? 'bg-orange-600 text-white' :
                    'bg-yellow-600 text-black'
                  }`}>
                    {issue.severity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comprehensive Optimization Recommendations */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          Integrated Optimization Plan
        </h3>
        <div className="space-y-3">
          {stressFactors.length === 0 && (!plantHealthData || plantHealthData.issues.length === 0) ? (
            <div className="text-center py-6 text-gray-400">
              <TreePine className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p>All systems optimal! Plant is thriving.</p>
            </div>
          ) : (
            <div className="text-sm text-gray-300">
              <p className="mb-2">Priority actions based on integrated analysis:</p>
              <ul className="space-y-2">
                {generateComprehensiveRecommendations().slice(0, 5).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className={`w-4 h-4 mt-0.5 ${
                      rec.priority === 'critical' ? 'text-red-400' :
                      rec.priority === 'high' ? 'text-orange-400' :
                      'text-yellow-400'
                    }`} />
                    <div>
                      <div className="font-medium">{rec.title}</div>
                      <div className="text-xs text-gray-400">{rec.action}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}