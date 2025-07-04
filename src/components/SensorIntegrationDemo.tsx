"use client"

import { useState, useEffect } from 'react'
import { Wifi, CheckCircle, AlertCircle, TrendingUp, Zap, DollarSign } from 'lucide-react'

export function SensorIntegrationDemo() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedSensors, setConnectedSensors] = useState<string[]>([])
  const [demoStep, setDemoStep] = useState(0)

  useEffect(() => {
    if (isConnecting) {
      // Simulate sensor discovery
      const timeout = setTimeout(() => {
        setConnectedSensors(['Aranet-001', 'Apogee-SQ520', 'LI-COR-190R'])
        setIsConnecting(false)
        setDemoStep(1)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [isConnecting])

  const startDemo = () => {
    setIsConnecting(true)
  }

  const demoSteps = [
    {
      title: "Scanning for Sensors",
      description: "Discovering nearby spectrum sensors via Bluetooth and WiFi...",
      icon: Wifi,
      color: "text-blue-400"
    },
    {
      title: "Sensors Connected",
      description: "Found 3 compatible sensors. Ready to validate your design.",
      icon: CheckCircle,
      color: "text-green-400"
    },
    {
      title: "Validating Design",
      description: "Comparing Vibelux predictions with actual sensor readings...",
      icon: TrendingUp,
      color: "text-purple-400"
    },
    {
      title: "Results",
      description: "Design accuracy: 97.8% - Your Vibelux design is highly accurate!",
      icon: Zap,
      color: "text-yellow-400"
    }
  ]

  return (
    <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800/50 p-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Live Sensor Integration Demo
      </h3>

      {demoStep === 0 && !isConnecting && (
        <div className="text-center py-8">
          <Wifi className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            Connect your hardware sensors to validate Vibelux predictions
          </p>
          <button
            onClick={startDemo}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Start Sensor Discovery
          </button>
        </div>
      )}

      {(isConnecting || demoStep > 0) && (
        <div className="space-y-4">
          {demoSteps.slice(0, demoStep + (isConnecting ? 1 : 0)).map((step, idx) => {
            const Icon = step.icon
            const isActive = isConnecting ? idx === 0 : idx === demoStep - 1
            const isComplete = !isConnecting && idx < demoStep - 1

            return (
              <div
                key={idx}
                className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                  isActive ? 'bg-gray-800/50 border border-gray-700' : ''
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-gray-700' : isComplete ? 'bg-green-900/20' : 'bg-gray-800'
                }`}>
                  <Icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{step.title}</h4>
                  <p className="text-sm text-gray-400">{step.description}</p>
                  
                  {idx === 1 && demoStep > 1 && (
                    <div className="mt-2 space-y-1">
                      {connectedSensors.map(sensor => (
                        <div key={sensor} className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {sensor}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {idx === 3 && demoStep === 4 && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Predicted PPFD</p>
                        <p className="text-lg font-semibold text-white">625 μmol</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Actual PPFD</p>
                        <p className="text-lg font-semibold text-green-400">612 μmol</p>
                      </div>
                    </div>
                  )}
                </div>
                {isActive && isConnecting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent" />
                )}
              </div>
            )
          })}

          {demoStep < 4 && !isConnecting && (
            <button
              onClick={() => setDemoStep(prev => Math.min(prev + 1, 4))}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Continue Demo
            </button>
          )}

          {demoStep === 4 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-600/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-white">Cost Savings Achieved</h4>
              </div>
              <p className="text-sm text-gray-300">
                By using Vibelux's virtual sensors instead of a physical grid:
              </p>
              <p className="text-2xl font-bold text-green-400 mt-2">
                Saved $34,712
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Physical sensor grid: $38,000 | Vibelux + 3 validation sensors: $3,288
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}