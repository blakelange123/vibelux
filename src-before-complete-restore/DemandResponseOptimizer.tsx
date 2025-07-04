'use client'

import React, { useState, useEffect } from 'react'
import { 
  DemandResponseOptimizer as DROptimizer,
  type FacilityProfile,
  type DRAssessment,
  type DREvent,
  type DRStrategy
} from '@/lib/demand-response/dr-optimizer'
import { 
  Zap, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Clock,
  Battery,
  Sun,
  TrendingUp,
  Settings,
  ChevronRight,
  Shield,
  Lightbulb,
  Thermometer,
  Activity
} from 'lucide-react'
import { motion } from 'framer-motion'

interface DemandResponseOptimizerProps {
  facilityProfile?: Partial<FacilityProfile>
  onStrategySelect?: (strategy: DRStrategy) => void
}

export function DemandResponseOptimizer({ 
  facilityProfile,
  onStrategySelect 
}: DemandResponseOptimizerProps) {
  const [optimizer] = useState(() => new DROptimizer())
  const [assessment, setAssessment] = useState<DRAssessment | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [simulatedEvent, setSimulatedEvent] = useState<DREvent | null>(null)
  const [strategy, setStrategy] = useState<DRStrategy | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Default profile for 2MW facility
  const defaultProfile: FacilityProfile = {
    utilityAccount: 'SCE-123456',
    rateSchedule: 'TOU-PA-3',
    location: 'California',
    facilityType: 'indoor',
    peakDemand: 2000, // 2MW
    averageLoad: 1600,
    annualConsumption: 14016000, // 1600kW * 8760h
    loadFactor: 0.8,
    lighting: {
      totalCapacity: 1240, // 1000 HPS + 240 LED
      dimmable: true,
      zones: 3
    },
    hvac: {
      totalCapacity: 600,
      stages: 2
    },
    pumps: {
      totalCapacity: 160,
      vfd: true
    },
    sheddableLoad: 800, // 40% of peak
    shiftableLoad: 600, // 30% of peak
    criticalLoad: 600, // 30% of peak
    ...facilityProfile
  }
  
  // Load staggering schedule
  const lightingBanks = [
    { name: 'Bank A (333 HPS)', start: 6, end: 14, load: 333 },
    { name: 'Bank B (333 HPS)', start: 14, end: 22, load: 333 },
    { name: 'Bank C (334 HPS)', start: 22, end: 6, load: 334 },
    { name: 'LED Undercanopy', start: 21, end: 5, load: 240 }
  ]
  
  // Run assessment on mount
  useEffect(() => {
    const result = optimizer.assessFacility(defaultProfile)
    setAssessment(result)
  }, [])
  
  // Simulate DR event
  const simulateEvent = (programId: string) => {
    const event: DREvent = {
      programId,
      startTime: new Date(Date.now() + 3600000), // 1 hour from now
      endTime: new Date(Date.now() + 14400000), // 4 hours from now
      targetReduction: 500, // 500kW target
      type: 'economic',
      priceSignal: programId === 'sce-cpp' ? 0.95 : undefined
    }
    
    setSimulatedEvent(event)
    
    const response = optimizer.optimizeEventResponse(defaultProfile, event, {
      maxImpact: 6, // Medium impact tolerance
      minLightLevel: 50 // Maintain 50% minimum light
    })
    
    setStrategy(response)
    onStrategySelect?.(response)
  }
  
  // Calculate monthly savings
  const calculateMonthlySavings = () => {
    const peakDemandCharge = 15 // $/kW/month
    const peakReduction = 500 // kW avoided during peak
    const demandSavings = peakReduction * peakDemandCharge
    
    const touSavings = 2500 // Estimated from TOU optimization
    const drRevenue = assessment?.annualRevenuePotential 
      ? assessment.annualRevenuePotential / 12 
      : 0
    
    return {
      demand: demandSavings,
      tou: touSavings,
      dr: drRevenue,
      total: demandSavings + touSavings + drRevenue
    }
  }
  
  const savings = calculateMonthlySavings()
  
  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-xl p-6 border border-green-800/50">
        <h3 className="text-xl font-bold text-white mb-4">
          Annual Revenue Potential
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-gray-400">ELRP Participation</p>
            </div>
            <p className="text-2xl font-bold text-white">
              $10K-20K
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ~$2/kWh curtailed
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-blue-400" />
              <p className="text-sm text-gray-400">Auto-DR Incentives</p>
            </div>
            <p className="text-2xl font-bold text-white">
              $5K-15K
            </p>
            <p className="text-xs text-gray-500 mt-1">
              $300-500/kW enrolled
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-gray-400">CPP Avoidance</p>
            </div>
            <p className="text-2xl font-bold text-white">
              $25K-50K
            </p>
            <p className="text-xs text-gray-500 mt-1">
              $12-18/kW avoided
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <p className="text-sm text-gray-400">TOU Optimization</p>
            </div>
            <p className="text-2xl font-bold text-white">
              $10K-25K
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Off-peak shifting
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <p className="text-lg text-gray-300">Total Annual Potential</p>
            <p className="text-3xl font-bold text-green-400">
              $50K-$100K+
            </p>
          </div>
        </div>
      </div>
      
      {/* Load Staggering Schedule */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Optimized Lighting Schedule
        </h3>
        
        <div className="space-y-3">
          {lightingBanks.map((bank, idx) => (
            <div key={idx} className="relative">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-300">{bank.name}</p>
                <p className="text-sm text-gray-500">{bank.load}kW</p>
              </div>
              <div className="h-8 bg-gray-700 rounded-lg relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className="absolute inset-y-0 bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg"
                  style={{
                    left: `${(bank.start / 24) * 100}%`,
                    width: `${((bank.end > bank.start ? bank.end - bank.start : 24 - bank.start + bank.end) / 24) * 100}%`
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xs font-medium text-white">
                    {bank.start}:00 - {bank.end}:00
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-800/50">
          <p className="text-sm text-yellow-300">
            💡 Staggering avoids 1MW+ simultaneous load during peak hours (4-9 PM)
          </p>
        </div>
      </div>
      
      {/* Eligible Programs */}
      {assessment && (
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Eligible DR Programs
            </h3>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              {showAdvanced ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          <div className="space-y-3">
            {assessment.eligiblePrograms.map((program) => (
              <div
                key={program.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedProgram === program.id
                    ? 'bg-purple-900/30 border-purple-600'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => {
                  setSelectedProgram(program.id)
                  simulateEvent(program.id)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{program.name}</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {program.description}
                    </p>
                    
                    {showAdvanced && (
                      <div className="mt-3 space-y-2 text-xs">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">Type:</span>
                          <span className="text-gray-300">{program.type}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">Events/Year:</span>
                          <span className="text-gray-300">{program.events.maxPerYear}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">Max Duration:</span>
                          <span className="text-gray-300">{program.events.maxDuration}h</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-lg font-semibold text-green-400">
                      ${Math.round(optimizer['estimateProgramRevenue'](defaultProfile, program) / 1000)}K
                    </p>
                    <p className="text-xs text-gray-500">per year</p>
                  </div>
                </div>
                
                {assessment.recommendedPrograms.includes(program.id) && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                    <Shield className="w-3 h-3" />
                    Recommended
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Event Response Strategy */}
      {strategy && simulatedEvent && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-400" />
            DR Event Response Strategy
          </h3>
          
          <div className="mb-4 p-4 bg-red-900/20 rounded-lg border border-red-800/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">
                  Simulated {simulatedEvent.type === 'emergency' ? 'Emergency' : 'Economic'} Event
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Target Reduction: {simulatedEvent.targetReduction}kW for {
                    Math.round((simulatedEvent.endTime.getTime() - simulatedEvent.startTime.getTime()) / 3600000)
                  } hours
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-300">Estimated Reduction</span>
              <span className="text-lg font-semibold text-white">
                {Math.round(strategy.estimatedReduction)} kW
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-300">Event Revenue</span>
              <span className="text-lg font-semibold text-green-400">
                ${strategy.estimatedRevenue.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-300">Operational Impact</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-4 rounded-sm ${
                        i < strategy.impactScore
                          ? i < 3 ? 'bg-green-500' : i < 6 ? 'bg-yellow-500' : 'bg-red-500'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  {strategy.impactScore <= 3 ? 'Low' : strategy.impactScore <= 6 ? 'Medium' : 'High'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Load Shed Priority:</h4>
            <div className="space-y-2">
              {strategy.actions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">{action.priority}.</span>
                  <span className="flex-1 text-gray-300">{action.equipment}</span>
                  <span className="text-gray-400">{Math.round(action.amount)}kW</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Implementation Requirements */}
      {assessment && assessment.requiredUpgrades.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Required Upgrades
          </h3>
          
          <div className="space-y-3">
            {assessment.requiredUpgrades.map((upgrade, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <ChevronRight className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">{upgrade}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Total Implementation Cost</span>
              <span className="text-lg font-semibold text-white">
                ${assessment.implementationCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-400">Payback Period</span>
              <span className="text-lg font-semibold text-green-400">
                {Math.round(assessment.paybackPeriod)} months
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* HVAC Pre-cooling Strategy */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-400" />
          HVAC Pre-cooling Strategy
        </h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">10AM</p>
            <p className="text-xs text-gray-500">Start pre-cool</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">3PM</p>
            <p className="text-xs text-gray-500">End pre-cool</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">4-9PM</p>
            <p className="text-xs text-gray-500">Coast on thermal mass</p>
          </div>
        </div>
        
        <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800/50">
          <p className="text-sm text-blue-300">
            Pre-cooling saves ~200kW during peak hours by leveraging building thermal mass
          </p>
        </div>
      </div>
    </div>
  )
}