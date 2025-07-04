"use client"
import { useState } from 'react'
import {
  Brain,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Target,
  Gauge,
  Beaker,
  DollarSign,
  Loader2,
  Activity
} from 'lucide-react'
import { OptimizationEngine, FarmConfiguration, OptimizationChange } from '@/lib/vertical-farming/optimization-engine'

interface OptimizationResult {
  score: number
  improvements: {
    category: string
    current: number
    optimized: number
    improvement: string
    impact: 'high' | 'medium' | 'low'
  }[]
  recommendations: {
    title: string
    description: string
    priority: 'critical' | 'high' | 'medium' | 'low'
    estimatedROI: string
  }[]
}

export function VerticalFarmingAIOptimizer() {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [appliedChanges, setAppliedChanges] = useState<OptimizationChange[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Mock current farm configuration
  const currentConfig: FarmConfiguration = {
    lighting: {
      intensity: 180,
      photoperiod: 16,
      spectrum: { red: 30, blue: 30, farRed: 10, white: 30 }
    },
    environment: {
      temperature: 22,
      humidity: 65,
      co2: 800,
      airflow: 0.5
    },
    irrigation: {
      frequency: 6,
      duration: 5,
      ec: 1.8,
      ph: 6.0
    },
    racking: {
      tiers: 5,
      spacing: 60,
      depth: 120
    }
  }
  const [selectedStrategy, setSelectedStrategy] = useState('balanced')

  const strategies = [
    { id: 'yield', name: 'Maximum Yield', icon: TrendingUp, description: 'Optimize for highest crop production' },
    { id: 'efficiency', name: 'Energy Efficiency', icon: Zap, description: 'Minimize energy consumption' },
    { id: 'profit', name: 'Profit Maximization', icon: DollarSign, description: 'Balance yield and costs' },
    { id: 'balanced', name: 'Balanced Growth', icon: Gauge, description: 'Optimize all parameters equally' },
    { id: 'quality', name: 'Premium Quality', icon: Beaker, description: 'Focus on crop quality metrics' }
  ]

  const runOptimization = () => {
    setIsOptimizing(true)
    
    // Simulate AI optimization
    setTimeout(() => {
      setOptimizationResult({
        score: 87,
        improvements: [
          {
            category: 'Light Intensity',
            current: 180,
            optimized: 220,
            improvement: '+22%',
            impact: 'high'
          },
          {
            category: 'Energy Usage',
            current: 145,
            optimized: 118,
            improvement: '-19%',
            impact: 'high'
          },
          {
            category: 'Space Utilization',
            current: 72,
            optimized: 89,
            improvement: '+24%',
            impact: 'medium'
          },
          {
            category: 'Water Efficiency',
            current: 85,
            optimized: 92,
            improvement: '+8%',
            impact: 'low'
          },
          {
            category: 'Crop Cycle Time',
            current: 42,
            optimized: 38,
            improvement: '-10%',
            impact: 'medium'
          }
        ],
        recommendations: [
          {
            title: 'Adjust Light Spectrum',
            description: 'Increase red:far-red ratio to 4.5:1 during flowering stage for 15% yield boost',
            priority: 'critical',
            estimatedROI: '+$12,500/month'
          },
          {
            title: 'Implement Dynamic Photoperiod',
            description: 'Use 18/6 for vegetative, 12/12 for flowering with 30-min sunrise/sunset simulation',
            priority: 'high',
            estimatedROI: '+$8,200/month'
          },
          {
            title: 'Optimize Rack Spacing',
            description: 'Reduce vertical spacing by 15cm for leafy greens to add one more growing tier',
            priority: 'medium',
            estimatedROI: '+$6,500/month'
          },
          {
            title: 'Install CO2 Enrichment',
            description: 'Maintain 1200ppm CO2 during photoperiod for 20% growth acceleration',
            priority: 'high',
            estimatedROI: '+$9,800/month'
          },
          {
            title: 'Upgrade to Smart Fertigation',
            description: 'AI-controlled nutrient dosing based on real-time plant uptake monitoring',
            priority: 'medium',
            estimatedROI: '+$4,200/month'
          }
        ]
      })
      setIsOptimizing(false)
    }, 3000)
  }
  
  const applyOptimizations = async () => {
    if (!optimizationResult) return;
    
    setIsApplying(true);
    setShowSuccess(false);
    
    // Create optimization engine with current config
    const engine = new OptimizationEngine(currentConfig);
    const changes: OptimizationChange[] = [];
    
    // Apply optimizations based on AI recommendations
    // 1. Light intensity optimization
    const lightImprovement = optimizationResult.improvements.find(i => i.category === 'Light Intensity');
    if (lightImprovement) {
      changes.push(engine.applyLightOptimization(lightImprovement.optimized));
    }
    
    // 2. Spectrum optimization (4.5:1 red:far-red ratio)
    changes.push(engine.applySpectrumOptimization(4.5));
    
    // 3. Dynamic photoperiod
    changes.push(engine.applyPhotoperiodOptimization(18, 12, 'vegetative'));
    
    // 4. CO2 enrichment
    changes.push(engine.applyCO2Optimization(1200));
    
    // 5. Rack spacing optimization
    const spaceImprovement = optimizationResult.improvements.find(i => i.category === 'Space Utilization');
    if (spaceImprovement) {
      changes.push(engine.applyRackOptimization(15)); // Reduce by 15cm as recommended
    }
    
    // 6. Fertigation optimization
    changes.push(engine.applyFertigationOptimization(2.0, 5.8));
    
    // Simulate sending commands to control system
    const commands = engine.generateControlCommands();
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Log commands that would be sent
    
    setAppliedChanges(changes);
    setIsApplying(false);
    setShowSuccess(true);
    
    // Calculate improvements
    const improvements = engine.calculateImprovements();
    
    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">AI Farm Optimizer</h2>
            <p className="text-gray-400">Machine learning-powered optimization engine</p>
          </div>
        </div>
        <button
          onClick={runOptimization}
          disabled={isOptimizing}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Run Optimization
            </>
          )}
        </button>
      </div>

      {/* Strategy Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Optimization Strategy</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {strategies.map(strategy => (
            <button
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy.id)}
              className={`p-3 rounded-lg border transition-all ${
                selectedStrategy === strategy.id
                  ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <strategy.icon className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs font-medium">{strategy.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Optimization Results */}
      {optimizationResult && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-3">Optimization Score</h3>
            <div className="relative w-32 h-32 mx-auto">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - optimizationResult.score / 100)}`}
                  className="text-purple-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{optimizationResult.score}%</span>
              </div>
            </div>
            <p className="text-gray-400 mt-3">Excellent optimization potential</p>
          </div>

          {/* Improvements */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Performance Improvements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {optimizationResult.improvements.map((improvement, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white">{improvement.category}</h4>
                    <span className={`text-sm px-2 py-1 rounded ${
                      improvement.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                      improvement.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {improvement.impact} impact
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-purple-400">{improvement.improvement}</span>
                    <span className="text-sm text-gray-500">
                      {improvement.current} → {improvement.optimized}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">AI Recommendations</h3>
            <div className="space-y-3">
              {optimizationResult.recommendations.map((rec, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      rec.priority === 'critical' ? 'bg-red-500/20' :
                      rec.priority === 'high' ? 'bg-orange-500/20' :
                      rec.priority === 'medium' ? 'bg-yellow-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      {rec.priority === 'critical' ? <AlertCircle className="w-5 h-5 text-red-400" /> :
                       rec.priority === 'high' ? <Target className="w-5 h-5 text-orange-400" /> :
                       <CheckCircle className="w-5 h-5 text-yellow-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-white">{rec.title}</h4>
                        <span className="text-green-400 font-semibold">{rec.estimatedROI}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Apply Optimizations Button */}
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={applyOptimizations}
              disabled={isApplying}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Applying Changes...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Apply All Optimizations
                </>
              )}
            </button>
            
            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 max-w-md">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-medium">Optimizations Applied Successfully!</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {appliedChanges.length} changes have been sent to your control system.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Applied Changes Log */}
            {appliedChanges.length > 0 && (
              <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Applied Changes
                </h4>
                <div className="space-y-2">
                  {appliedChanges.map((change, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-700 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-purple-400 font-medium capitalize">{change.system}</span>
                        <span className="text-gray-400">{change.parameter}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{change.currentValue}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-green-400">{change.newValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}