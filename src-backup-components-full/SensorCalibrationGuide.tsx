"use client"

import { useState } from 'react'
import { Settings2, CheckCircle, AlertCircle, ArrowRight, Zap, Shield, RefreshCw } from 'lucide-react'

interface CalibrationStep {
  id: string
  title: string
  description: string
  icon: any
  duration: string
  frequency: string
  instructions: string[]
  tips?: string[]
}

export function SensorCalibrationGuide() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const calibrationSteps: CalibrationStep[] = [
    {
      id: 'virtual-baseline',
      title: 'Virtual Sensor Baseline',
      description: 'Establish baseline readings using Vibelux virtual sensors',
      icon: Zap,
      duration: '5 minutes',
      frequency: 'Once per setup',
      instructions: [
        'Open your Vibelux design in the Advanced Designer',
        'Enable the Virtual Sensor Grid overlay',
        'Record PPFD values at key measurement points',
        'Export baseline data for future comparison'
      ],
      tips: [
        'Use at least 9 measurement points for rooms under 100 sq ft',
        'Increase to 25+ points for larger spaces',
        'Focus on canopy-level measurements'
      ]
    },
    {
      id: 'physical-validation',
      title: 'Physical Sensor Validation',
      description: 'Validate virtual predictions with 3-5 physical sensors',
      icon: Shield,
      duration: '30 minutes',
      frequency: 'Monthly',
      instructions: [
        'Place physical sensors at corners and center of growing area',
        'Ensure sensors are at canopy height',
        'Allow 10 minutes for temperature stabilization',
        'Record readings during peak lighting hours',
        'Compare with Vibelux predictions'
      ],
      tips: [
        'Clean sensor domes before each measurement',
        'Avoid shadows from fixtures or plants',
        'Use same sensor model for consistency'
      ]
    },
    {
      id: 'fixture-calibration',
      title: 'Fixture Output Calibration',
      description: 'Adjust fixture settings based on sensor feedback',
      icon: Settings2,
      duration: '15 minutes',
      frequency: 'Quarterly',
      instructions: [
        'Check actual PPFD vs design targets',
        'Adjust fixture height if readings are >10% off',
        'Fine-tune dimming levels for optimal coverage',
        'Update Vibelux model with actual fixture performance',
        'Re-run virtual sensor grid to confirm changes'
      ],
      tips: [
        'Most fixtures lose 3-5% output per year',
        'Clean fixtures before calibration',
        'Document all adjustments for tracking'
      ]
    },
    {
      id: 'environmental-sync',
      title: 'Environmental Factor Sync',
      description: 'Calibrate for temperature, humidity, and CO2 effects',
      icon: RefreshCw,
      duration: '20 minutes',
      frequency: 'Seasonal',
      instructions: [
        'Measure PPFD at different times of day',
        'Record corresponding temperature and humidity',
        'Note any correlation between environmental factors and light levels',
        'Update Vibelux environmental settings',
        'Generate adjusted predictions for different conditions'
      ],
      tips: [
        'High humidity can reduce light transmission by 5-8%',
        'Temperature affects LED efficiency',
        'CO2 enrichment may require higher light levels'
      ]
    }
  ]

  const toggleStep = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId)
  }

  const markComplete = (stepId: string) => {
    if (completedSteps.includes(stepId)) {
      setCompletedSteps(completedSteps.filter(id => id !== stepId))
    } else {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  const completionRate = Math.round((completedSteps.length / calibrationSteps.length) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Sensor Calibration Guide
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Completion</span>
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-sm font-medium text-white">{completionRate}%</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-white">{completedSteps.length}/{calibrationSteps.length}</p>
            <p className="text-sm text-gray-400">Steps Complete</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">97.8%</p>
            <p className="text-sm text-gray-400">Typical Accuracy</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">$34k</p>
            <p className="text-sm text-gray-400">Saved vs Grid</p>
          </div>
        </div>

        {/* Calibration Steps */}
        <div className="space-y-4">
          {calibrationSteps.map((step) => {
            const Icon = step.icon
            const isExpanded = expandedStep === step.id
            const isCompleted = completedSteps.includes(step.id)

            return (
              <div
                key={step.id}
                className={`border rounded-lg transition-all ${
                  isCompleted 
                    ? 'bg-green-900/20 border-green-600/30' 
                    : 'bg-gray-800/50 border-gray-700'
                }`}
              >
                <div
                  onClick={() => toggleStep(step.id)}
                  className="p-4 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isCompleted ? 'bg-green-600/20' : 'bg-gray-700'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isCompleted ? 'text-green-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{step.title}</h4>
                        <p className="text-sm text-gray-400">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-300">{step.duration}</p>
                        <p className="text-xs text-gray-500">{step.frequency}</p>
                      </div>
                      <ArrowRight className={`w-5 h-5 text-gray-500 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-700/50">
                    <div className="mt-4 space-y-4">
                      {/* Instructions */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Instructions:</h5>
                        <ol className="space-y-2">
                          {step.instructions.map((instruction, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-purple-400 font-medium mt-0.5">{idx + 1}.</span>
                              <span className="text-gray-300">{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Tips */}
                      {step.tips && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-300 mb-2">Pro Tips:</h5>
                          <ul className="space-y-1">
                            {step.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-yellow-400 mt-0.5">💡</span>
                                <span className="text-gray-400">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markComplete(step.id)
                        }}
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                          isCompleted
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Calibration Benefits */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">
          Why Calibrate Virtual Sensors?
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Maintain 97%+ Accuracy</h4>
              <p className="text-sm text-gray-400 mt-1">
                Regular calibration ensures virtual predictions stay aligned with real-world conditions
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Detect Issues Early</h4>
              <p className="text-sm text-gray-400 mt-1">
                Spot fixture degradation or environmental changes before they impact yield
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Optimize Energy Use</h4>
              <p className="text-sm text-gray-400 mt-1">
                Fine-tune light levels to eliminate waste while maintaining optimal growth
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Document Performance</h4>
              <p className="text-sm text-gray-400 mt-1">
                Build a historical record for compliance and continuous improvement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}