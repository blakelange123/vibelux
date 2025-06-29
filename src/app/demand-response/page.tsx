'use client'

import { useState } from 'react'
import { DemandResponseOptimizer } from '@/components/DemandResponseOptimizer'
import { 
  Zap,
  DollarSign,
  Building2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield,
  ChevronRight,
  Battery,
  Sun,
  Activity,
  Users,
  Calculator
} from 'lucide-react'

export default function DemandResponsePage() {
  const [selectedUtility, setSelectedUtility] = useState<'SCE' | 'PGE' | 'SDGE'>('SCE')
  const [facilitySize, setFacilitySize] = useState(2000) // kW
  
  // Utility rate information
  const utilityRates = {
    SCE: {
      peak: 0.45,
      offPeak: 0.12,
      superOffPeak: 0.08,
      demandCharge: 18.50, // $/kW
      peakHours: '4PM - 9PM'
    },
    PGE: {
      peak: 0.42,
      offPeak: 0.14,
      superOffPeak: 0.10,
      demandCharge: 22.00,
      peakHours: '4PM - 8PM'
    },
    SDGE: {
      peak: 0.48,
      offPeak: 0.15,
      superOffPeak: 0.09,
      demandCharge: 20.50,
      peakHours: '4PM - 9PM'
    }
  }
  
  const currentRates = utilityRates[selectedUtility]
  
  // Quick facility presets
  const facilityPresets = [
    { name: 'Small Indoor (500kW)', size: 500, lighting: 300, hvac: 150 },
    { name: 'Medium Indoor (1MW)', size: 1000, lighting: 600, hvac: 300 },
    { name: 'Large Indoor (2MW)', size: 2000, lighting: 1240, hvac: 600 },
    { name: 'XL Facility (5MW)', size: 5000, lighting: 3100, hvac: 1500 }
  ]
  
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-600/20 rounded-xl">
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Demand Response Optimization
              </h1>
              <p className="text-gray-400 mt-1">
                Maximize revenue through grid participation and peak avoidance
              </p>
            </div>
          </div>
          
          {/* Key Benefits */}
          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-800/50">
            <h2 className="text-lg font-semibold text-white mb-4">
              Why Demand Response for Cannabis Cultivation?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">$50K-100K+ Annual Revenue</p>
                  <p className="text-xs text-gray-300 mt-1">
                    From DR programs and peak avoidance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Avoid Peak Charges</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Save $12-18/kW during critical events
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Automated Response</p>
                  <p className="text-xs text-gray-300 mt-1">
                    OpenADR integration for hands-free operation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Grid Resilience</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Support grid stability and earn incentives
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Utility Selection */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Utility Provider
              </h3>
              <div className="space-y-2">
                {(['SCE', 'PGE', 'SDGE'] as const).map((utility) => (
                  <button
                    key={utility}
                    onClick={() => setSelectedUtility(utility)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedUtility === utility
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {utility === 'SCE' ? 'Southern California Edison' :
                           utility === 'PGE' ? 'Pacific Gas & Electric' :
                           'San Diego Gas & Electric'}
                        </p>
                        <p className="text-xs opacity-80 mt-0.5">
                          Peak: {utilityRates[utility].peakHours}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Facility Size */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Facility Configuration
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Total Connected Load (kW)
                </label>
                <input
                  type="number"
                  value={facilitySize}
                  onChange={(e) => setFacilitySize(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  step="100"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-2">Quick Presets:</p>
                {facilityPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setFacilitySize(preset.size)}
                    className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 text-left transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Current Costs */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Current Energy Costs
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Peak Rate</span>
                  <span className="text-lg font-semibold text-white">
                    ${currentRates.peak}/kWh
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Off-Peak Rate</span>
                  <span className="text-lg font-semibold text-white">
                    ${currentRates.offPeak}/kWh
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Demand Charge</span>
                  <span className="text-lg font-semibold text-white">
                    ${currentRates.demandCharge}/kW
                  </span>
                </div>
                
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Monthly Peak Demand Cost</span>
                    <span className="text-xl font-bold text-red-400">
                      ${(facilitySize * currentRates.demandCharge).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Optimization Results */}
          <div className="lg:col-span-2">
            <DemandResponseOptimizer
              facilityProfile={{
                peakDemand: facilitySize,
                averageLoad: facilitySize * 0.8,
                rateSchedule: selectedUtility === 'SCE' ? 'TOU-PA-3' : 'E-20'
              }}
            />
          </div>
        </div>
        
        {/* Additional Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              DR Aggregators
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Partner with aggregators to simplify enrollment:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span className="text-gray-300">Leap Energy</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span className="text-gray-300">CPower</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span className="text-gray-300">Enel X</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span className="text-gray-300">Voltus</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Battery className="w-5 h-5 text-green-400" />
              Technology Stack
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Required equipment for full automation:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                <span className="text-gray-300">OpenADR 2.0b Client</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                <span className="text-gray-300">Smart Lighting Controls</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                <span className="text-gray-300">VFD on HVAC/Pumps</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                <span className="text-gray-300">Energy Management System</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-yellow-400" />
              ROI Calculator
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Implementation Cost</span>
                <span className="text-white">${(facilitySize * 15).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Annual Revenue</span>
                <span className="text-green-400">${(facilitySize * 40).toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-300">Simple Payback</span>
                  <span className="text-lg font-bold text-purple-400">4.5 months</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 border border-purple-800/50 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Ready to Start Earning from Demand Response?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Our experts will help you navigate utility programs, implement controls, 
            and maximize your revenue potential while maintaining optimal growing conditions.
          </p>
          <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
            Schedule DR Assessment
          </button>
        </div>
      </div>
    </div>
  )
}