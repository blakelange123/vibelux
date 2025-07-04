'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Activity,
  Settings,
  TrendingUp,
  Zap,
  Target,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Info,
  Download,
  Lightbulb,
  Leaf,
  Flower2,
  Sprout,
  CheckCircle,
  Clock,
  BarChart3,
  Save,
  RefreshCw,
  Sun,
  DollarSign,
  ArrowRight
} from 'lucide-react'
import { PIDController, PIDAutoTuner, MultiZonePIDController } from '@/lib/controls/pid-controller'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Zone {
  id: string
  name: string
  setpoint: number
  currentPPFD: number
  output: number
  sensors: string[]
  cropType?: string
  growthStage?: string
}

interface DLIPreset {
  id: string
  name: string
  icon: any
  description: string
  targetDLI: number
  photoperiod: number
  basePPFD: number
  cropTypes: string[]
  stage: string
  pidParams: { kp: number; ki: number; kd: number }
  tips: string[]
}

const dliPresets: DLIPreset[] = [
  {
    id: 'seedling',
    name: 'Seedling/Clone',
    icon: Sprout,
    description: 'Low DLI to prevent stress in young plants',
    targetDLI: 10,
    photoperiod: 18,
    basePPFD: 150,
    cropTypes: ['All crops'],
    stage: 'propagation',
    pidParams: { kp: 1.5, ki: 0.3, kd: 0.05 },
    tips: [
      'System compensates for natural light variations',
      'Prevents light stress in young plants',
      'Automatically adjusts for cloud cover'
    ]
  },
  {
    id: 'vegetative',
    name: 'Vegetative Growth',
    icon: Leaf,
    description: 'Moderate DLI for healthy leaf development',
    targetDLI: 20,
    photoperiod: 18,
    basePPFD: 300,
    cropTypes: ['Leafy greens', 'Herbs', 'Cannabis', 'Tomatoes'],
    stage: 'vegetative',
    pidParams: { kp: 2.0, ki: 0.5, kd: 0.1 },
    tips: [
      'Dims lights during bright sunny periods',
      'Increases output during cloudy weather',
      'Maintains consistent daily light dose'
    ]
  },
  {
    id: 'flowering',
    name: 'Flowering/Fruiting',
    icon: Flower2,
    description: 'High DLI for maximum flower and fruit production',
    targetDLI: 40,
    photoperiod: 12,
    basePPFD: 950,
    cropTypes: ['Cannabis', 'Tomatoes', 'Peppers', 'Strawberries'],
    stage: 'flowering',
    pidParams: { kp: 2.5, ki: 0.6, kd: 0.15 },
    tips: [
      'Maximizes light during short photoperiods',
      'Compensates for seasonal light changes',
      'Prevents light burn on bright days'
    ]
  },
  {
    id: 'greenhouse-supplement',
    name: 'Greenhouse Supplement',
    icon: Sun,
    description: 'Supplements natural sunlight to hit DLI targets',
    targetDLI: 25,
    photoperiod: 16,
    basePPFD: 400,
    cropTypes: ['All greenhouse crops'],
    stage: 'supplement',
    pidParams: { kp: 3.0, ki: 0.8, kd: 0.2 },
    tips: [
      'Only adds light when needed',
      'Saves energy on sunny days',
      'Perfect for greenhouse operations'
    ]
  }
]

export function PIDControlPanel() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [selectedZone, setSelectedZone] = useState<string>('zone-1')
  const [isAutoTuning, setIsAutoTuning] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPresets, setShowPresets] = useState(true)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [externalZone, setExternalZone] = useState<{ id: string, name: string } | null>(null)
  const [growMode, setGrowMode] = useState<'simple' | 'advanced'>('simple')
  const [currentDLI, setCurrentDLI] = useState(0)
  const [targetDLI, setTargetDLI] = useState(20)
  const [accumulatedDLI, setAccumulatedDLI] = useState(0)
  const [dliDeficit, setDliDeficit] = useState(0)
  const [naturalLight, setNaturalLight] = useState(200) // Simulated natural light PPFD
  const [timeOfDay, setTimeOfDay] = useState(new Date().getHours())
  const [photoperiodStart, setPhotoperiodStart] = useState(6) // 6 AM
  const [photoperiodEnd, setPhotoperiodEnd] = useState(22) // 10 PM
  const [energyRates, setEnergyRates] = useState({
    peak: { rate: 0.35, hours: [14, 15, 16, 17, 18, 19] },
    offPeak: { rate: 0.12, hours: [22, 23, 0, 1, 2, 3, 4, 5, 6] },
    standard: { rate: 0.18, hours: [7, 8, 9, 10, 11, 12, 13, 20, 21] }
  })
  const [spectralStrategy, setSpectralStrategy] = useState<'full' | 'deep-red' | 'energy-saver'>('full')
  const [enableEnergyOptimization, setEnableEnergyOptimization] = useState(true)
  const [enableDLIRamping, setEnableDLIRamping] = useState(true)
  
  // PID Parameters
  const [pidParams, setPidParams] = useState({
    kp: 2.0,
    ki: 0.5,
    kd: 0.1
  })
  
  // Zones
  const [zones, setZones] = useState<Zone[]>([
    {
      id: 'zone-1',
      name: 'Flowering Room A',
      setpoint: 800,
      currentPPFD: 750,
      output: 85,
      sensors: ['sensor-1', 'sensor-2'],
      cropType: 'Cannabis',
      growthStage: 'flowering'
    },
    {
      id: 'zone-2',
      name: 'Vegetative Room',
      setpoint: 400,
      currentPPFD: 420,
      output: 72,
      sensors: ['sensor-3', 'sensor-4'],
      cropType: 'Leafy Greens',
      growthStage: 'vegetative'
    }
  ])
  
  // Performance data for charts
  const [performanceData, setPerformanceData] = useState<{
    time: string[]
    ppfd: number[]
    setpoint: number[]
    output: number[]
  }>({
    time: [],
    ppfd: [],
    setpoint: [],
    output: []
  })
  
  // Controllers
  const controllersRef = useRef(new Map<string, PIDController>())
  const autoTunerRef = useRef<PIDAutoTuner | null>(null)
  
  // Initialize controllers
  useEffect(() => {
    zones.forEach(zone => {
      if (!controllersRef.current.has(zone.id)) {
        const controller = new PIDController({
          setpoint: zone.setpoint,
          ...pidParams
        })
        controllersRef.current.set(zone.id, controller)
      }
    })
  }, [zones, pidParams])
  
  // Listen for external zone integration
  useEffect(() => {
    const handleOpenPIDControl = (event: CustomEvent) => {
      const { zoneId, zoneName } = event.detail
      setExternalZone({ id: zoneId, name: zoneName })
      
      // Add external zone if not exists
      setZones(prevZones => {
        if (!prevZones.find(z => z.id === zoneId)) {
          return [...prevZones, {
            id: zoneId,
            name: zoneName,
            setpoint: 800,
            currentPPFD: 750,
            output: 85,
            sensors: []
          }]
        }
        return prevZones
      })
      
      setSelectedZone(zoneId)
    }
    
    window.addEventListener('openPIDControl', handleOpenPIDControl as EventListener)
    return () => {
      window.removeEventListener('openPIDControl', handleOpenPIDControl as EventListener)
    }
  }, [])
  
  // Update DLI accumulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Update time of day
      setTimeOfDay(new Date().getHours())
      
      // Simulate DLI accumulation
      if (isEnabled) {
        const currentHour = new Date().getHours()
        if (currentHour >= photoperiodStart && currentHour < photoperiodEnd) {
          // Calculate DLI contribution in this interval (1 second)
          const currentPPFD = zones.find(z => z.id === selectedZone)?.currentPPFD || 0
          const dliContribution = (currentPPFD * 1) / 1000000 // 1 second worth
          setAccumulatedDLI(prev => prev + dliContribution)
        }
      }
      
      // Reset DLI at start of new day
      const currentHour = new Date().getHours()
      if (currentHour === photoperiodStart && new Date().getMinutes() === 0) {
        setAccumulatedDLI(0)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isEnabled, zones, selectedZone, photoperiodStart, photoperiodEnd])

  // Simulate sensor readings and update control loop
  useEffect(() => {
    if (!isEnabled) return
    
    const interval = setInterval(() => {
      setZones(prevZones => 
        prevZones.map(zone => {
          const controller = controllersRef.current.get(zone.id)
          if (!controller) return zone
          
          // Simulate sensor reading with noise
          const noise = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20
          const simulatedPPFD = zone.currentPPFD + noise
          
          // Get smart PPFD target based on DLI ramping
          const smartTarget = calculateSmartPPFDTarget(zone.setpoint)
          controller.setSetpoint(smartTarget)
          
          // Update controller
          const output = controller.update(simulatedPPFD)
          
          // Simulate system response (PPFD changes based on dimming)
          const ppfdChange = (output - zone.output) * 0.1
          const newPPFD = zone.currentPPFD + ppfdChange
          
          return {
            ...zone,
            currentPPFD: newPPFD,
            output: output,
            setpoint: smartTarget // Update displayed setpoint
          }
        })
      )
      
      // Update performance data
      const selectedZoneData = zones.find(z => z.id === selectedZone)
      if (selectedZoneData) {
        setPerformanceData(prev => {
          const newData = {
            time: [...prev.time, new Date().toLocaleTimeString()].slice(-50),
            ppfd: [...prev.ppfd, selectedZoneData.currentPPFD].slice(-50),
            setpoint: [...prev.setpoint, selectedZoneData.setpoint].slice(-50),
            output: [...prev.output, selectedZoneData.output].slice(-50)
          }
          return newData
        })
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isEnabled, zones, selectedZone])
  
  // Auto-tuning
  const startAutoTuning = () => {
    const controller = controllersRef.current.get(selectedZone)
    if (!controller) return
    
    const tuner = new PIDAutoTuner(controller)
    autoTunerRef.current = tuner
    tuner.start()
    setIsAutoTuning(true)
  }
  
  const chartData = {
    labels: performanceData.time,
    datasets: [
      {
        label: 'Actual PPFD',
        data: performanceData.ppfd,
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.1
      },
      {
        label: 'Setpoint',
        data: performanceData.setpoint,
        borderColor: 'rgb(34, 197, 94)',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        tension: 0
      },
      {
        label: 'Dimming %',
        data: performanceData.output,
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  }
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)'
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgb(156, 163, 175)' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'PPFD (μmol/m²/s)',
          color: 'rgb(156, 163, 175)'
        },
        ticks: { color: 'rgb(156, 163, 175)' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Dimming %',
          color: 'rgb(156, 163, 175)'
        },
        ticks: { color: 'rgb(156, 163, 175)' },
        grid: { drawOnChartArea: false },
        min: 0,
        max: 100
      }
    }
  }
  
  const getCurrentEnergyRate = () => {
    const currentHour = new Date().getHours()
    if (energyRates.peak.hours.includes(currentHour)) return energyRates.peak
    if (energyRates.offPeak.hours.includes(currentHour)) return energyRates.offPeak
    return energyRates.standard
  }

  // Calculate DLI accumulation and remaining hours
  const calculateDLIMetrics = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // Calculate hours elapsed in photoperiod
    let hoursElapsed = 0
    if (currentHour >= photoperiodStart && currentHour < photoperiodEnd) {
      hoursElapsed = (currentHour - photoperiodStart) + (currentMinute / 60)
    } else if (currentHour >= photoperiodEnd) {
      hoursElapsed = photoperiodEnd - photoperiodStart
    }
    
    // Calculate remaining hours in photoperiod
    const totalPhotoperiodHours = photoperiodEnd - photoperiodStart
    const remainingHours = Math.max(0, totalPhotoperiodHours - hoursElapsed)
    
    // Calculate required PPFD to hit target
    const remainingDLI = targetDLI - accumulatedDLI
    const requiredPPFD = remainingHours > 0 ? (remainingDLI * 1000000) / (remainingHours * 3600) : 0
    
    return {
      hoursElapsed,
      remainingHours,
      totalPhotoperiodHours,
      remainingDLI,
      requiredPPFD,
      progressPercentage: (accumulatedDLI / targetDLI) * 100
    }
  }

  // Smart DLI ramping based on energy rates
  const calculateSmartPPFDTarget = (baseTarget: number) => {
    if (!enableDLIRamping) return baseTarget
    
    const metrics = calculateDLIMetrics()
    const currentRate = getCurrentEnergyRate()
    const currentHour = new Date().getHours()
    
    // Off-peak hours: Ramp up to bank DLI
    if (currentRate === energyRates.offPeak) {
      // Calculate how much we can "bank" for peak hours
      const peakHoursInPhotoperiod = energyRates.peak.hours.filter(
        h => h >= photoperiodStart && h < photoperiodEnd
      ).length
      
      // Increase PPFD by up to 50% during off-peak to compensate for peak reduction
      const rampFactor = 1 + (0.5 * (peakHoursInPhotoperiod / metrics.totalPhotoperiodHours))
      return Math.min(baseTarget * rampFactor, 1200) // Cap at 1200 PPFD
    }
    
    // Peak hours: Reduce but maintain minimum
    if (currentRate === energyRates.peak) {
      // Check if we're ahead or behind on DLI
      const expectedProgress = (metrics.hoursElapsed / metrics.totalPhotoperiodHours) * 100
      const actualProgress = metrics.progressPercentage
      
      if (actualProgress >= expectedProgress) {
        // We're ahead, can reduce more aggressively
        return Math.max(baseTarget * 0.5, 200) // 50% reduction but min 200 PPFD
      } else {
        // We're behind, reduce less
        return Math.max(baseTarget * 0.75, 400) // 25% reduction but min 400 PPFD
      }
    }
    
    // Standard hours: Normal operation with slight adjustment based on progress
    const metrics2 = calculateDLIMetrics()
    if (metrics2.progressPercentage < (metrics2.hoursElapsed / metrics2.totalPhotoperiodHours) * 100) {
      // Behind schedule, increase slightly
      return baseTarget * 1.1
    }
    
    return baseTarget
  }

  const calculateOptimalSpectrum = (targetPPFD: number, energyBudget: number) => {
    const currentRate = getCurrentEnergyRate()
    
    if (enableEnergyOptimization && currentRate.rate > 0.25) {
      // During peak rates, use deep red strategy for efficiency
      return {
        strategy: 'deep-red',
        deepRed: targetPPFD * 0.8, // 80% deep red for photosynthesis
        fullSpectrum: targetPPFD * 0.2, // 20% full spectrum for quality
        energySavings: 0.35 // 35% energy reduction
      }
    } else if (naturalLight > 800) {
      // High natural light - use supplemental strategy
      return {
        strategy: 'supplemental',
        deepRed: targetPPFD * 0.6,
        farRed: targetPPFD * 0.3, // End-of-day far red
        blue: targetPPFD * 0.1,
        energySavings: 0.20
      }
    } else {
      // Normal full spectrum
      return {
        strategy: 'full-spectrum',
        fullSpectrum: targetPPFD,
        energySavings: 0
      }
    }
  }

  const applyDLIPreset = (preset: DLIPreset) => {
    setSelectedPreset(preset.id)
    setPidParams(preset.pidParams)
    setTargetDLI(preset.targetDLI)
    
    // Calculate base setpoint from DLI and photoperiod
    // DLI = PPFD × photoperiod hours × 3600 seconds/hour ÷ 1,000,000
    const calculatedPPFD = (preset.targetDLI * 1000000) / (preset.photoperiod * 3600)
    
    // Apply energy optimization if enabled
    const spectrum = calculateOptimalSpectrum(calculatedPPFD, 1000)
    const optimizedPPFD = enableEnergyOptimization ? calculatedPPFD * (1 - spectrum.energySavings) : calculatedPPFD
    
    // Update selected zone with calculated values
    setZones(zones.map(zone => 
      zone.id === selectedZone 
        ? { ...zone, setpoint: optimizedPPFD, growthStage: preset.stage }
        : zone
    ))
    
    // Update controller
    const controller = controllersRef.current.get(selectedZone)
    if (controller) {
      controller.setSetpoint(optimizedPPFD)
      controller.setTunings(preset.pidParams.kp, preset.pidParams.ki, preset.pidParams.kd)
    }
  }

  const exportData = () => {
    const data = {
      zones: zones.map(zone => ({
        ...zone,
        controller: controllersRef.current.get(zone.id)?.getStatus()
      })),
      performanceData,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pid-control-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/20 mb-4">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            DLI Compensation Control
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Automatically adjust artificial lighting to hit your Daily Light Integral targets, compensating for natural light variations
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800 mb-6">
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${growMode === 'simple' ? 'text-white' : 'text-gray-400'}`}>
              Grower Mode
            </span>
            <button
              onClick={() => setGrowMode(growMode === 'simple' ? 'advanced' : 'simple')}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <span
                className={`${
                  growMode === 'advanced' ? 'translate-x-7' : 'translate-x-1'
                } inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center`}
              >
                {growMode === 'advanced' ? (
                  <Settings className="w-3 h-3 text-gray-600" />
                ) : (
                  <Leaf className="w-3 h-3 text-green-600" />
                )}
              </span>
            </button>
            <span className={`text-sm font-medium ${growMode === 'advanced' ? 'text-white' : 'text-gray-400'}`}>
              Technical Mode
            </span>
          </div>
        </div>

        {/* Energy Savings Banner */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-green-500/20 rounded-xl p-6 border border-yellow-500/30 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Save 30-50% on Electricity Costs</h3>
                <p className="text-gray-300">
                  This DLI optimization tool is part of our revenue-sharing energy program. 
                  We help you save money on electricity while maintaining your yield targets.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  <span className="text-green-400 font-medium">✓ $0 upfront cost</span> • 
                  <span className="text-green-400 font-medium ml-2">✓ We only earn when you save</span> • 
                  <span className="text-green-400 font-medium ml-2">✓ 80/20 split in your favor</span>
                </p>
              </div>
            </div>
            <a 
              href="/energy-setup" 
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Control Status */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isEnabled ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-700/50'}`}>
                {isEnabled ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <Pause className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {isEnabled ? 'DLI Compensation Active' : 'Manual Control'}
                </h2>
                <p className="text-gray-400">
                  {isEnabled ? 'System automatically adjusting lights to hit DLI targets, compensating for natural light' : 'Click start to enable automatic DLI compensation'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={exportData}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Export data"
              >
                <Download className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => setIsEnabled(!isEnabled)}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium ${
                  isEnabled 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isEnabled ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Stop Auto Control
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Auto Control
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* DLI Status Dashboard */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* DLI Progress */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-400">DLI Progress</h4>
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold text-white">{accumulatedDLI.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">/ {targetDLI} mol/m²</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((accumulatedDLI / targetDLI) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {((accumulatedDLI / targetDLI) * 100).toFixed(1)}% complete
                </p>
              </div>
            </div>
            
            {/* Energy Rate Status */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-400">Energy Rate</h4>
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    ${getCurrentEnergyRate().rate}
                  </span>
                  <span className="text-sm text-gray-400">/kWh</span>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getCurrentEnergyRate() === energyRates.peak 
                    ? 'bg-red-500/20 text-red-400'
                    : getCurrentEnergyRate() === energyRates.offPeak
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {getCurrentEnergyRate() === energyRates.peak ? 'Peak Rate' : 
                   getCurrentEnergyRate() === energyRates.offPeak ? 'Off-Peak' : 'Standard'}
                </div>
                <p className="text-xs text-gray-400">
                  {enableDLIRamping && getCurrentEnergyRate() === energyRates.offPeak 
                    ? 'Ramping up to bank DLI' 
                    : enableDLIRamping && getCurrentEnergyRate() === energyRates.peak
                    ? 'Reduced for savings'
                    : 'Normal operation'}
                </p>
              </div>
            </div>
            
            {/* Smart Ramping Control */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-400">DLI Ramping</h4>
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Smart Ramping</span>
                  <button
                    onClick={() => setEnableDLIRamping(!enableDLIRamping)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      enableDLIRamping ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`${
                      enableDLIRamping ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                  </button>
                </div>
                {(() => {
                  const metrics = calculateDLIMetrics()
                  return (
                    <div className="text-xs space-y-1">
                      <p className="text-gray-400">
                        Hours remaining: <span className="text-white font-medium">{metrics.remainingHours.toFixed(1)}h</span>
                      </p>
                      <p className="text-gray-400">
                        Required PPFD: <span className="text-white font-medium">{Math.round(metrics.requiredPPFD)}</span>
                      </p>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* DLI Targets - Only in Grower Mode */}
        {growMode === 'simple' && (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sprout className="w-6 h-6 text-green-400" />
              Daily Light Integral (DLI) Presets
            </h3>
            <p className="text-gray-400 mb-6">Select a preset for your crop type and growth stage. System will automatically adjust throughout the day to hit targets efficiently.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dliPresets.map(preset => {
                const Icon = preset.icon
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyDLIPreset(preset)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedPreset === preset.id
                        ? 'bg-green-500/20 border-green-500'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-3 ${
                      selectedPreset === preset.id ? 'text-green-400' : 'text-gray-400'
                    }`} />
                    <h4 className="font-medium text-white mb-1">{preset.name}</h4>
                    <p className="text-xs text-gray-400 mb-2">{preset.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-blue-400 font-medium">{preset.targetDLI} DLI</span>
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">{preset.photoperiod}h</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {preset.cropTypes.slice(0, 2).join(', ')}
                      {preset.cropTypes.length > 2 && ' +more'}
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedPreset && (
              <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-400 font-medium mb-2">DLI Compensation Benefits</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {dliPresets.find(p => p.id === selectedPreset)?.tips.map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      
        {/* Zone Selection */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4">Growing Zones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedZone === zone.id
                    ? 'bg-emerald-500/20 border-emerald-500'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-left">
                    <h4 className="font-medium text-white text-lg">{zone.name}</h4>
                    <p className="text-sm text-gray-400">{zone.cropType} • {zone.growthStage}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    Math.abs(zone.currentPPFD - zone.setpoint) < 10
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {Math.abs(zone.currentPPFD - zone.setpoint) < 10 ? 'Perfect' : 'Adjusting'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">Target</p>
                    <p className="text-white font-medium">{zone.setpoint}</p>
                    <p className="text-xs text-gray-500">PPFD</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Current</p>
                    <p className="text-white font-medium">{zone.currentPPFD.toFixed(0)}</p>
                    <p className="text-xs text-gray-500">PPFD</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Intensity</p>
                    <p className="text-white font-medium">{zone.output.toFixed(0)}%</p>
                    <p className="text-xs text-gray-500">Output</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Performance Chart */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Live Performance Monitor
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-gray-400">Actual</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-green-500 border-dashed bg-transparent rounded"></div>
                <span className="text-gray-400">Target</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-400">Output</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4" style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        
        {/* Control Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Zone Settings */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-400" />
              DLI Target Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Daily Light Integral (DLI)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetDLI}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setTargetDLI(value)
                      // Recalculate PPFD setpoint based on DLI and current photoperiod
                      const photoperiod = 16 // Could be made configurable
                      const calculatedPPFD = (value * 1000000) / (photoperiod * 3600)
                      setZones(zones.map(z => 
                        z.id === selectedZone ? { ...z, setpoint: calculatedPPFD } : z
                      ))
                      const controller = controllersRef.current.get(selectedZone)
                      controller?.setSetpoint(calculatedPPFD)
                    }}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg font-medium"
                    min="0"
                    max="60"
                  />
                  <span className="absolute right-3 top-3 text-gray-400 text-sm">mol/m²/day</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: Seedlings 5-15, Leafy Greens 12-17, Fruiting 20-30, Cannabis 35-65
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Natural Light
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={naturalLight}
                      onChange={(e) => setNaturalLight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      min="0"
                      max="2000"
                    />
                    <span className="absolute right-3 top-2 text-gray-400 text-sm">PPFD</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Sensor reading or manual input</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Photoperiod
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      defaultValue={16}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      min="8"
                      max="24"
                    />
                    <span className="absolute right-3 top-2 text-gray-400 text-sm">hours</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Daily light duration</p>
                </div>
              </div>

              <div className="space-y-3">
                {growMode === 'simple' && (
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">DLI Compensation Active</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      System automatically adjusts spectrum and intensity based on natural light and energy rates.
                    </p>
                  </div>
                )}
                
                {/* Energy Optimization Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <span className="text-gray-300 font-medium">Energy Optimization</span>
                    <p className="text-xs text-gray-400">Use deep red during peak rate hours</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableEnergyOptimization}
                      onChange={(e) => setEnableEnergyOptimization(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                {/* Current Energy Rate Display */}
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Current Energy Rate</span>
                    <div className="text-right">
                      <span className={`font-medium ${
                        getCurrentEnergyRate().rate > 0.25 ? 'text-red-400' : 
                        getCurrentEnergyRate().rate < 0.15 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        ${getCurrentEnergyRate().rate}/kWh
                      </span>
                      <p className="text-xs text-gray-400">
                        {getCurrentEnergyRate().rate > 0.25 ? 'Peak' : 
                         getCurrentEnergyRate().rate < 0.15 ? 'Off-Peak' : 'Standard'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Advanced PID Tuning - Only in Technical Mode */}
          {growMode === 'advanced' ? (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Settings className="w-6 h-6 text-purple-400" />
                  PID Control Tuning
                </h3>
                <button
                  onClick={startAutoTuning}
                  disabled={isAutoTuning || isEnabled}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
                >
                  {isAutoTuning ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Tuning...
                    </div>
                  ) : (
                    'Auto-Tune'
                  )}
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Proportional (Kp)
                  </label>
                  <input
                    type="number"
                    value={pidParams.kp}
                    onChange={(e) => setPidParams({ ...pidParams, kp: Number(e.target.value) })}
                    step="0.1"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Response speed - higher = faster</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Integral (Ki)
                  </label>
                  <input
                    type="number"
                    value={pidParams.ki}
                    onChange={(e) => setPidParams({ ...pidParams, ki: Number(e.target.value) })}
                    step="0.1"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Eliminates steady-state error</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Derivative (Kd)
                  </label>
                  <input
                    type="number"
                    value={pidParams.kd}
                    onChange={(e) => setPidParams({ ...pidParams, kd: Number(e.target.value) })}
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Reduces overshoot and oscillation</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-400" />
                System Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Control Response</span>
                  <span className="text-green-400 font-medium">Optimal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Stability</span>
                  <span className="text-green-400 font-medium">Excellent</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Energy Efficiency</span>
                  <span className="text-blue-400 font-medium">95%</span>
                </div>
                
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 mt-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-300">
                      <p className="font-medium mb-1">Auto-Optimization Active</p>
                      <p>The system continuously learns and adjusts for optimal plant growth. Switch to Technical Mode for manual control.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}