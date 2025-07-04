"use client"

import { useState, useRef } from 'react'
import { 
  Camera,
  Upload,
  Scan,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  TrendingUp,
  Activity,
  Leaf,
  Bug,
  Droplets,
  Sun,
  Download,
  Share2,
  Clock,
  Target,
  Eye,
  ZoomIn,
  Grid3x3
} from 'lucide-react'

interface HealthIssue {
  id: string
  type: 'nutrient' | 'pest' | 'disease' | 'environmental'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  name: string
  description: string
  location: { x: number; y: number; width: number; height: number }
  recommendations: string[]
}

interface PlantAnalysis {
  id: string
  timestamp: string
  overallHealth: number
  growthStage: string
  issues: HealthIssue[]
  measurements: {
    height: number
    canopyWidth: number
    leafArea: number
    chlorophyllContent: number
    stressIndex: number
  }
  predictions: {
    daysToHarvest: number
    expectedYield: number
    optimalHarvestWindow: string
  }
}

interface CameraZone {
  id: string
  name: string
  cameraCount: number
  lastCapture: string
  healthScore: number
  activeIssues: number
}

export function PlantHealthImaging() {
  const [selectedZone, setSelectedZone] = useState<string>('zone-1')
  const [viewMode, setViewMode] = useState<'live' | 'analysis' | 'history'>('live')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Camera zones
  const cameraZones: CameraZone[] = [
    {
      id: 'zone-1',
      name: 'Flowering A',
      cameraCount: 12,
      lastCapture: '5 min ago',
      healthScore: 94,
      activeIssues: 2
    },
    {
      id: 'zone-2',
      name: 'Vegetative 1',
      cameraCount: 8,
      lastCapture: '12 min ago',
      healthScore: 98,
      activeIssues: 0
    },
    {
      id: 'zone-3',
      name: 'Flowering B',
      cameraCount: 12,
      lastCapture: '3 min ago',
      healthScore: 87,
      activeIssues: 5
    }
  ]

  // Mock analysis data
  const latestAnalysis: PlantAnalysis = {
    id: 'analysis-001',
    timestamp: new Date().toISOString(),
    overallHealth: 92,
    growthStage: 'Late Flowering',
    issues: [
      {
        id: 'issue-1',
        type: 'nutrient',
        severity: 'medium',
        confidence: 87,
        name: 'Calcium Deficiency',
        description: 'Brown spots on upper fan leaves indicate calcium deficiency',
        location: { x: 145, y: 230, width: 80, height: 60 },
        recommendations: [
          'Increase Cal-Mag supplement to 2ml/L',
          'Check pH levels (should be 5.8-6.2)',
          'Ensure proper air circulation'
        ]
      },
      {
        id: 'issue-2',
        type: 'pest',
        severity: 'low',
        confidence: 92,
        name: 'Thrips Damage',
        description: 'Silver streaks on leaves indicate early thrips infestation',
        location: { x: 320, y: 180, width: 100, height: 75 },
        recommendations: [
          'Apply neem oil spray (preventive)',
          'Introduce beneficial insects (Amblyseius cucumeris)',
          'Monitor with sticky traps'
        ]
      }
    ],
    measurements: {
      height: 124, // cm
      canopyWidth: 86, // cm
      leafArea: 2840, // cm²
      chlorophyllContent: 42.3, // SPAD units
      stressIndex: 0.23 // 0-1 scale
    },
    predictions: {
      daysToHarvest: 14,
      expectedYield: 186, // grams
      optimalHarvestWindow: '12-16 days'
    }
  }

  const handleCapture = async () => {
    setIsCapturing(true)
    // Simulate capture delay
    setTimeout(() => {
      setIsCapturing(false)
      setViewMode('analysis')
    }, 2000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Handle file upload
      setViewMode('analysis')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Plant Health Imaging & Analysis</h2>
            <p className="text-sm text-gray-400 mt-1">
              AI-powered visual inspection and early issue detection
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {isCapturing ? 'Capturing...' : 'Capture All Zones'}
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2">
          {(['live', 'analysis', 'history'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                viewMode === mode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {mode} {mode === 'live' ? 'View' : mode === 'analysis' ? 'Results' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Zone Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cameraZones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setSelectedZone(zone.id)}
            className={`p-4 rounded-lg border transition-all ${
              selectedZone === zone.id
                ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-600/20'
                : 'bg-gray-900 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">{zone.name}</h3>
              <span className={`text-2xl font-bold ${
                zone.healthScore >= 95 ? 'text-green-400' :
                zone.healthScore >= 85 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {zone.healthScore}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{zone.cameraCount} cameras</span>
              <span className="text-gray-400">{zone.lastCapture}</span>
            </div>
            {zone.activeIssues > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">{zone.activeIssues} issues detected</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {viewMode === 'live' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((cam) => (
              <div key={cam} className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-600" />
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                  Camera {cam}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-green-500/20 rounded text-xs text-green-400">
                  Live
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors">
                <Grid3x3 className="w-4 h-4 inline mr-1" />
                Grid View
              </button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors">
                <ZoomIn className="w-4 h-4 inline mr-1" />
                Focus Mode
              </button>
            </div>
            <span className="text-sm text-gray-400">
              <Clock className="w-4 h-4 inline mr-1" />
              Auto-capture every 30 minutes
            </span>
          </div>
        </div>
      )}

      {viewMode === 'analysis' && (
        <>
          {/* Analysis Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-white">Overall Health</h4>
              </div>
              <p className="text-3xl font-bold text-white">{latestAnalysis.overallHealth}%</p>
              <p className="text-sm text-gray-400 mt-1">{latestAnalysis.growthStage}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">Expected Yield</h4>
              </div>
              <p className="text-3xl font-bold text-white">{latestAnalysis.predictions.expectedYield}g</p>
              <p className="text-sm text-gray-400 mt-1">per plant average</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h4 className="font-medium text-white">Days to Harvest</h4>
              </div>
              <p className="text-3xl font-bold text-white">{latestAnalysis.predictions.daysToHarvest}</p>
              <p className="text-sm text-gray-400 mt-1">{latestAnalysis.predictions.optimalHarvestWindow}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h4 className="font-medium text-white">Active Issues</h4>
              </div>
              <p className="text-3xl font-bold text-white">{latestAnalysis.issues.length}</p>
              <p className="text-sm text-gray-400 mt-1">Detected problems</p>
            </div>
          </div>

          {/* Image Analysis View */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Visual Analysis</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    showHeatmap
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-4 h-4 inline mr-1" />
                  Stress Heatmap
                </button>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Placeholder for analyzed image */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Scan className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-400">Analyzed plant image would appear here</p>
                  <p className="text-sm text-gray-500 mt-2">With overlays showing detected issues</p>
                </div>
              </div>
              
              {/* Issue markers */}
              {latestAnalysis.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="absolute border-2 border-red-500 rounded"
                  style={{
                    left: `${issue.location.x}px`,
                    top: `${issue.location.y}px`,
                    width: `${issue.location.width}px`,
                    height: `${issue.location.height}px`
                  }}
                >
                  <div className="absolute -top-6 left-0 px-2 py-1 bg-red-500 text-white text-xs rounded">
                    {issue.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detected Issues */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Detected Issues & Recommendations</h3>
            <div className="space-y-4">
              {latestAnalysis.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-4 rounded-lg border ${
                    issue.severity === 'critical' ? 'bg-red-900/20 border-red-800' :
                    issue.severity === 'high' ? 'bg-orange-900/20 border-orange-800' :
                    issue.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-800' :
                    'bg-blue-900/20 border-blue-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {issue.type === 'nutrient' && <Droplets className="w-5 h-5 text-yellow-400 mt-0.5" />}
                      {issue.type === 'pest' && <Bug className="w-5 h-5 text-red-400 mt-0.5" />}
                      {issue.type === 'disease' && <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />}
                      {issue.type === 'environmental' && <Sun className="w-5 h-5 text-blue-400 mt-0.5" />}
                      <div>
                        <h4 className="font-medium text-white">{issue.name}</h4>
                        <p className="text-sm text-gray-300 mt-1">{issue.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {issue.severity} severity
                      </span>
                      <p className="text-sm text-gray-400 mt-1">
                        {issue.confidence}% confidence
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">Recommendations:</p>
                    {issue.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-300">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plant Measurements */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Height</span>
              </div>
              <p className="text-xl font-bold text-white">{latestAnalysis.measurements.height} cm</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Maximize2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Canopy Width</span>
              </div>
              <p className="text-xl font-bold text-white">{latestAnalysis.measurements.canopyWidth} cm</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Leaf Area</span>
              </div>
              <p className="text-xl font-bold text-white">{latestAnalysis.measurements.leafArea} cm²</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Chlorophyll</span>
              </div>
              <p className="text-xl font-bold text-white">{latestAnalysis.measurements.chlorophyllContent}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Stress Index</span>
              </div>
              <p className="text-xl font-bold text-white">{latestAnalysis.measurements.stressIndex}</p>
            </div>
          </div>
        </>
      )}

      {viewMode === 'history' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Analysis History</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Zone Analysis #{idx}</h4>
                    <p className="text-sm text-gray-400">{new Date(Date.now() - idx * 86400000).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{95 - idx * 2}%</p>
                  <p className="text-sm text-gray-400">Health Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Add missing import
import { Maximize2, Ruler } from 'lucide-react'