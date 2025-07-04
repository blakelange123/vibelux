"use client"

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, Calendar, Zap, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'

interface Prediction {
  metric: string
  current: number
  predicted: number
  timeframe: string
  confidence: number
  recommendation?: string
  impact?: 'positive' | 'negative' | 'neutral'
}

interface AnomalyPrediction {
  type: string
  probability: number
  timeToEvent: string
  severity: 'low' | 'medium' | 'high'
  preventionSteps: string[]
}

export function SensorAIPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyPrediction[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h')

  useEffect(() => {
    // Simulate AI analysis
    const analyzeSensorData = () => {
      setIsAnalyzing(true)
      
      setTimeout(() => {
        // Generate predictions based on timeframe
        const basePredictions: Prediction[] = [
          {
            metric: 'Average PPFD',
            current: 625,
            predicted: selectedTimeframe === '24h' ? 615 : selectedTimeframe === '7d' ? 598 : 580,
            timeframe: selectedTimeframe,
            confidence: 92,
            recommendation: 'Consider increasing fixture height by 2" to maintain optimal PPFD',
            impact: 'negative'
          },
          {
            metric: 'Energy Efficiency',
            current: 2.8,
            predicted: selectedTimeframe === '24h' ? 2.8 : selectedTimeframe === '7d' ? 2.75 : 2.7,
            timeframe: selectedTimeframe,
            confidence: 88,
            recommendation: 'Schedule fixture cleaning to maintain efficiency',
            impact: 'negative'
          },
          {
            metric: 'Uniformity',
            current: 0.82,
            predicted: selectedTimeframe === '24h' ? 0.83 : selectedTimeframe === '7d' ? 0.84 : 0.85,
            timeframe: selectedTimeframe,
            confidence: 95,
            recommendation: 'Current fixture spacing is optimal',
            impact: 'positive'
          },
          {
            metric: 'Daily Light Integral',
            current: 36.0,
            predicted: selectedTimeframe === '24h' ? 35.5 : selectedTimeframe === '7d' ? 34.8 : 33.5,
            timeframe: selectedTimeframe,
            confidence: 90,
            recommendation: 'Extend photoperiod by 30 minutes to compensate',
            impact: 'negative'
          }
        ]

        // Generate anomaly predictions
        const baseAnomalies: AnomalyPrediction[] = [
          {
            type: 'Fixture Degradation',
            probability: selectedTimeframe === '30d' ? 78 : selectedTimeframe === '7d' ? 45 : 12,
            timeToEvent: selectedTimeframe === '30d' ? '2-3 weeks' : selectedTimeframe === '7d' ? '4-6 weeks' : '8+ weeks',
            severity: selectedTimeframe === '30d' ? 'high' : 'medium',
            preventionSteps: [
              'Clean fixture lenses and heat sinks',
              'Check driver temperatures',
              'Verify all connections are secure',
              'Consider preventive replacement of older fixtures'
            ]
          },
          {
            type: 'Hot Spot Formation',
            probability: 32,
            timeToEvent: '3-5 days',
            severity: 'medium',
            preventionSteps: [
              'Adjust fixture angles slightly',
              'Increase airflow in affected areas',
              'Monitor canopy temperature closely'
            ]
          },
          {
            type: 'Coverage Gap',
            probability: 15,
            timeToEvent: 'Immediate',
            severity: 'low',
            preventionSteps: [
              'Review fixture spacing',
              'Consider adding supplemental lighting',
              'Rotate plants if possible'
            ]
          }
        ]

        setPredictions(basePredictions)
        setAnomalies(baseAnomalies.filter(a => 
          (selectedTimeframe === '24h' && a.probability < 40) ||
          (selectedTimeframe === '7d' && a.probability < 60) ||
          selectedTimeframe === '30d'
        ))
        setIsAnalyzing(false)
      }, 1500)
    }

    analyzeSensorData()
  }, [selectedTimeframe])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI-Powered Predictions
          </h3>
          
          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {(['24h', '7d', '30d'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === tf
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tf === '24h' ? '24 Hours' : tf === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        {isAnalyzing ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 text-purple-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-400 border-t-transparent" />
              <span>Analyzing sensor patterns...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Metric Predictions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map((pred, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{pred.metric}</h4>
                    <div className={`flex items-center gap-1 text-sm ${
                      pred.impact === 'positive' ? 'text-green-400' :
                      pred.impact === 'negative' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${
                        pred.impact === 'negative' ? 'rotate-180' : ''
                      }`} />
                      {Math.abs(((pred.predicted - pred.current) / pred.current) * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Current</p>
                      <p className="text-lg font-semibold text-white">
                        {pred.metric.includes('PPFD') || pred.metric.includes('DLI') 
                          ? pred.current 
                          : pred.current.toFixed(2)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 mb-2" />
                    <div>
                      <p className="text-xs text-gray-400">Predicted</p>
                      <p className="text-lg font-semibold text-purple-400">
                        {pred.metric.includes('PPFD') || pred.metric.includes('DLI')
                          ? pred.predicted
                          : pred.predicted.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Confidence Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Confidence</span>
                      <span className="text-gray-300">{pred.confidence}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                        style={{ width: `${pred.confidence}%` }}
                      />
                    </div>
                  </div>
                  
                  {pred.recommendation && (
                    <div className="mt-3 p-2 bg-gray-900 rounded text-xs text-gray-300">
                      💡 {pred.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Anomaly Detection */}
      {anomalies.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Predicted Anomalies
          </h3>
          
          <div className="space-y-4">
            {anomalies.map((anomaly, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-lg border ${
                  anomaly.severity === 'high' 
                    ? 'bg-red-900/20 border-red-600/30'
                    : anomaly.severity === 'medium'
                    ? 'bg-yellow-900/20 border-yellow-600/30'
                    : 'bg-blue-900/20 border-blue-600/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{anomaly.type}</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Expected in {anomaly.timeToEvent}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{anomaly.probability}%</p>
                    <p className="text-xs text-gray-400">probability</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-300">Prevention Steps:</p>
                  {anomaly.preventionSteps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-600/30">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          AI Optimization Insights
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-400">1</span>
            </div>
            <div>
              <p className="text-sm text-white font-medium">Energy Savings Opportunity</p>
              <p className="text-sm text-gray-400 mt-1">
                Implementing adaptive dimming based on natural light could save 12-15% on energy costs
                without affecting crop yield.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-400">2</span>
            </div>
            <div>
              <p className="text-sm text-white font-medium">Spectrum Optimization</p>
              <p className="text-sm text-gray-400 mt-1">
                Increasing far-red by 5% during the last 2 hours of photoperiod could improve 
                stem elongation and overall biomass by 8%.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-400">3</span>
            </div>
            <div>
              <p className="text-sm text-white font-medium">Maintenance Schedule</p>
              <p className="text-sm text-gray-400 mt-1">
                Based on degradation patterns, scheduling bi-monthly cleaning could maintain 
                95%+ of initial light output for 5+ years.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-purple-600/10 rounded-lg">
          <p className="text-xs text-purple-300">
            🚀 These insights are based on analysis of 10,000+ similar installations and 
            continuously improve as more data is collected.
          </p>
        </div>
      </div>
    </div>
  )
}