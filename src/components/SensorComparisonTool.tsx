"use client"

import { useState } from 'react'
import { BarChart3, TrendingUp, DollarSign, Clock, Shield, Cpu, Award } from 'lucide-react'

interface SensorSystem {
  name: string
  type: 'hardware' | 'virtual' | 'hybrid'
  coverage: number // sq ft
  dataPoints: number
  cost: {
    hardware: number
    installation: number
    monthly: number
  }
  features: string[]
  limitations: string[]
  accuracy: number
  setupTime: string
  maintenanceFreq: string
}

export function SensorComparisonTool() {
  const [selectedSystems, setSelectedSystems] = useState<string[]>(['vibelux', 'aranet'])
  const [roomSize, setRoomSize] = useState(1000) // sq ft

  const sensorSystems: Record<string, SensorSystem> = {
    vibelux: {
      name: 'Vibelux Virtual + 3 Validators',
      type: 'hybrid',
      coverage: 10000,
      dataPoints: Infinity,
      cost: {
        hardware: 900,
        installation: 0,
        monthly: 299
      },
      features: [
        'Unlimited virtual measurement points',
        'AI-powered predictions',
        'No hardware grid needed',
        'Real-time design validation',
        'Predictive maintenance',
        'Historical data analysis',
        'Integration with all sensor brands'
      ],
      limitations: [
        'Requires 3 physical sensors for validation',
        'Internet connection needed'
      ],
      accuracy: 97.8,
      setupTime: '30 minutes',
      maintenanceFreq: 'None (virtual)'
    },
    aranet: {
      name: 'Aranet Full Grid',
      type: 'hardware',
      coverage: 1000,
      dataPoints: 25,
      cost: {
        hardware: 12500,
        installation: 2500,
        monthly: 0
      },
      features: [
        'Direct physical measurements',
        'No subscription required',
        'Works offline',
        'Certified accuracy'
      ],
      limitations: [
        'Fixed measurement points only',
        'High upfront cost',
        'Installation complexity',
        'Regular calibration needed',
        'No predictive capabilities',
        'Limited to sensor locations'
      ],
      accuracy: 99.5,
      setupTime: '2-3 days',
      maintenanceFreq: 'Quarterly'
    },
    apogee: {
      name: 'Apogee Quantum Grid',
      type: 'hardware',
      coverage: 1000,
      dataPoints: 16,
      cost: {
        hardware: 9600,
        installation: 2000,
        monthly: 0
      },
      features: [
        'Research-grade accuracy',
        'Quantum sensor technology',
        'Durable construction',
        'USB/SDI-12 connectivity'
      ],
      limitations: [
        'Expensive per point',
        'Complex wiring required',
        'No network capabilities',
        'Manual data collection',
        'No real-time monitoring'
      ],
      accuracy: 99.9,
      setupTime: '1-2 days',
      maintenanceFreq: 'Annual'
    },
    licor: {
      name: 'LI-COR Sensor Array',
      type: 'hardware',
      coverage: 1000,
      dataPoints: 12,
      cost: {
        hardware: 18000,
        installation: 3000,
        monthly: 0
      },
      features: [
        'Scientific-grade precision',
        'Spectral analysis',
        'Environmental sensors included',
        'Research standard'
      ],
      limitations: [
        'Very expensive',
        'Requires expertise',
        'Limited coverage',
        'No cloud features',
        'Heavy and bulky'
      ],
      accuracy: 99.9,
      setupTime: '3-4 days',
      maintenanceFreq: 'Bi-annual'
    }
  }

  const calculateCosts = (system: SensorSystem) => {
    const scaleFactor = roomSize / system.coverage
    const hardwareCost = system.cost.hardware * Math.max(1, scaleFactor)
    const installCost = system.cost.installation * Math.max(1, scaleFactor)
    const yearlyOpCost = system.cost.monthly * 12
    const fiveYearTotal = hardwareCost + installCost + (yearlyOpCost * 5)
    
    return {
      initial: hardwareCost + installCost,
      yearly: yearlyOpCost,
      fiveYear: fiveYearTotal
    }
  }

  const selectedSystemData = selectedSystems.map(id => ({
    id,
    system: sensorSystems[id],
    costs: calculateCosts(sensorSystems[id])
  }))

  return (
    <div className="space-y-6">
      {/* Room Size Selector */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Configure Your Space</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room Size (sq ft)
            </label>
            <input
              type="number"
              value={roomSize}
              onChange={(e) => setRoomSize(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              min={100}
              max={50000}
              step={100}
            />
          </div>
          
          {/* System Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Compare Systems
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(sensorSystems).map(([id, system]) => (
                <button
                  key={id}
                  onClick={() => {
                    if (selectedSystems.includes(id)) {
                      setSelectedSystems(selectedSystems.filter(s => s !== id))
                    } else if (selectedSystems.length < 3) {
                      setSelectedSystems([...selectedSystems, id])
                    }
                  }}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedSystems.includes(id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {system.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
        <h3 className="text-xl font-semibold text-white mb-6">System Comparison</h3>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Feature</th>
              {selectedSystemData.map(({ id, system }) => (
                <th key={id} className="text-left py-3 px-4">
                  <div className="text-white font-semibold">{system.name}</div>
                  <div className={`text-xs mt-1 ${
                    system.type === 'hybrid' ? 'text-purple-400' :
                    system.type === 'virtual' ? 'text-blue-400' :
                    'text-green-400'
                  }`}>
                    {system.type.charAt(0).toUpperCase() + system.type.slice(1)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Cost Row */}
            <tr className="border-b border-gray-800/50">
              <td className="py-4 px-4 text-gray-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Initial Cost
              </td>
              {selectedSystemData.map(({ id, costs }) => (
                <td key={id} className="py-4 px-4">
                  <span className={`text-lg font-semibold ${
                    costs.initial === Math.min(...selectedSystemData.map(d => d.costs.initial))
                      ? 'text-green-400'
                      : 'text-white'
                  }`}>
                    ${costs.initial.toLocaleString()}
                  </span>
                </td>
              ))}
            </tr>

            {/* 5-Year Total */}
            <tr className="border-b border-gray-800/50">
              <td className="py-4 px-4 text-gray-400">5-Year Total</td>
              {selectedSystemData.map(({ id, costs }) => (
                <td key={id} className="py-4 px-4">
                  <span className={`font-medium ${
                    costs.fiveYear === Math.min(...selectedSystemData.map(d => d.costs.fiveYear))
                      ? 'text-green-400'
                      : 'text-white'
                  }`}>
                    ${costs.fiveYear.toLocaleString()}
                  </span>
                </td>
              ))}
            </tr>

            {/* Data Points */}
            <tr className="border-b border-gray-800/50">
              <td className="py-4 px-4 text-gray-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Measurement Points
              </td>
              {selectedSystemData.map(({ id, system }) => {
                const points = system.dataPoints === Infinity 
                  ? 'Unlimited' 
                  : Math.ceil(system.dataPoints * (roomSize / system.coverage))
                return (
                  <td key={id} className="py-4 px-4">
                    <span className={`font-medium ${
                      system.dataPoints === Infinity ? 'text-purple-400' : 'text-white'
                    }`}>
                      {points}
                    </span>
                  </td>
                )
              })}
            </tr>

            {/* Accuracy */}
            <tr className="border-b border-gray-800/50">
              <td className="py-4 px-4 text-gray-400 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Accuracy
              </td>
              {selectedSystemData.map(({ id, system }) => (
                <td key={id} className="py-4 px-4">
                  <span className="font-medium text-white">{system.accuracy}%</span>
                </td>
              ))}
            </tr>

            {/* Setup Time */}
            <tr className="border-b border-gray-800/50">
              <td className="py-4 px-4 text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Setup Time
              </td>
              {selectedSystemData.map(({ id, system }) => (
                <td key={id} className="py-4 px-4">
                  <span className={`text-sm ${
                    system.setupTime.includes('minutes') ? 'text-green-400' : 'text-white'
                  }`}>
                    {system.setupTime}
                  </span>
                </td>
              ))}
            </tr>

            {/* Maintenance */}
            <tr className="border-b border-gray-800/50">
              <td className="py-4 px-4 text-gray-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Maintenance
              </td>
              {selectedSystemData.map(({ id, system }) => (
                <td key={id} className="py-4 px-4">
                  <span className={`text-sm ${
                    system.maintenanceFreq === 'None (virtual)' ? 'text-green-400' : 'text-white'
                  }`}>
                    {system.maintenanceFreq}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Feature Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedSystemData.map(({ id, system }) => (
          <div key={id} className="bg-gray-900 rounded-xl p-6">
            <h4 className="font-semibold text-white mb-4">{system.name}</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-green-400 mb-2">Advantages</h5>
                <ul className="space-y-1">
                  {system.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-red-400 mb-2">Limitations</h5>
                <ul className="space-y-1">
                  {system.limitations.slice(0, 3).map((limitation, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Winner Badge */}
      {selectedSystemData.length > 1 && (
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-600/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Best Value: Vibelux Hybrid Solution</h3>
              <p className="text-gray-300 mt-1">
                {selectedSystemData.find(d => d.id === 'vibelux') ? (
                  `Saves ${Math.round((1 - selectedSystemData.find(d => d.id === 'vibelux')!.costs.fiveYear / 
                    Math.max(...selectedSystemData.filter(d => d.id !== 'vibelux').map(d => d.costs.fiveYear))) * 100)}% 
                    over 5 years while providing unlimited measurement points and AI optimization.`
                ) : (
                  'Provides the best balance of cost, features, and future-proofing for most applications.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}