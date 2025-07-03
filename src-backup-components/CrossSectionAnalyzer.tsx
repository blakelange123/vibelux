"use client"

import { useState, useMemo } from 'react'
import { 
  Layers,
  Scissors,
  RotateCw,
  Grid3X3,
  BarChart3,
  TrendingUp,
  Target,
  Eye,
  EyeOff
} from 'lucide-react'

interface PPFDDataPoint {
  x: number
  y: number
  z: number
  ppfd: number
}

interface CrossSectionAnalyzerProps {
  ppfdData: PPFDDataPoint[]
  roomDimensions: { width: number; height: number; depth: number }
  onCrossSectionChange?: (section: { 
    axis: 'x' | 'y' | 'z'
    position: number
    data: PPFDDataPoint[]
  }) => void
  className?: string
}

export function CrossSectionAnalyzer({
  ppfdData,
  roomDimensions,
  onCrossSectionChange,
  className = ''
}: CrossSectionAnalyzerProps) {
  const [sectionAxis, setSectionAxis] = useState<'x' | 'y' | 'z'>('z')
  const [sectionPosition, setSectionPosition] = useState(0)
  const [showUniformityAnalysis, setShowUniformityAnalysis] = useState(true)
  const [tolerance, setTolerance] = useState(0.2) // 20cm tolerance for slice

  // Calculate cross-section data
  const crossSectionData = useMemo(() => {
    const maxDimension = sectionAxis === 'x' ? roomDimensions.width :
                        sectionAxis === 'y' ? roomDimensions.height :
                        roomDimensions.depth

    const normalizedPosition = (sectionPosition / 100) * maxDimension

    // Filter points within tolerance of the slice
    const sliceData = ppfdData.filter(point => {
      const coord = point[sectionAxis]
      return Math.abs(coord - normalizedPosition) <= tolerance
    })

    return sliceData
  }, [ppfdData, sectionAxis, sectionPosition, tolerance, roomDimensions])

  // Calculate uniformity metrics for the cross-section
  const uniformityMetrics = useMemo(() => {
    if (crossSectionData.length === 0) return null

    const ppfdValues = crossSectionData.map(p => p.ppfd)
    const min = Math.min(...ppfdValues)
    const max = Math.max(...ppfdValues)
    const avg = ppfdValues.reduce((sum, val) => sum + val, 0) / ppfdValues.length

    const uniformity = min / max
    const cv = Math.sqrt(ppfdValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / ppfdValues.length) / avg

    // Calculate gradient (rate of change)
    const sortedData = [...crossSectionData].sort((a, b) => {
      const primaryAxis = sectionAxis === 'x' ? 'y' : 
                         sectionAxis === 'y' ? 'z' : 'x'
      return a[primaryAxis] - b[primaryAxis]
    })

    let maxGradient = 0
    for (let i = 1; i < sortedData.length; i++) {
      const gradient = Math.abs(sortedData[i].ppfd - sortedData[i-1].ppfd)
      maxGradient = Math.max(maxGradient, gradient)
    }

    return {
      min,
      max,
      avg,
      uniformity,
      cv: cv * 100, // Convert to percentage
      maxGradient,
      dataPoints: crossSectionData.length
    }
  }, [crossSectionData, sectionAxis])

  // Get axis info
  const getAxisInfo = (axis: 'x' | 'y' | 'z') => {
    switch (axis) {
      case 'x': return { name: 'Width', max: roomDimensions.width, unit: 'ft', color: 'text-red-400' }
      case 'y': return { name: 'Height', max: roomDimensions.height, unit: 'ft', color: 'text-green-400' }
      case 'z': return { name: 'Depth', max: roomDimensions.depth, unit: 'ft', color: 'text-blue-400' }
      default: return { name: 'Unknown', max: 10, unit: 'ft', color: 'text-gray-400' }
    }
  }

  const axisInfo = getAxisInfo(sectionAxis)

  // Create 2D visualization of the cross-section
  const visualizationData = useMemo(() => {
    if (crossSectionData.length === 0) return []

    // Project data to 2D based on section axis
    return crossSectionData.map(point => {
      let x, y
      switch (sectionAxis) {
        case 'x': // YZ plane
          x = point.y
          y = point.z
          break
        case 'y': // XZ plane  
          x = point.x
          y = point.z
          break
        case 'z': // XY plane
          x = point.x
          y = point.y
          break
        default:
          x = point.x
          y = point.y
      }
      return { x, y, ppfd: point.ppfd }
    })
  }, [crossSectionData, sectionAxis])

  // Handle section change
  const handleSectionChange = (axis: 'x' | 'y' | 'z', position: number) => {
    setSectionAxis(axis)
    setSectionPosition(position)
    
    onCrossSectionChange?.({
      axis,
      position,
      data: crossSectionData
    })
  }

  const getUniformityColor = (uniformity: number) => {
    if (uniformity >= 0.9) return 'text-green-400'
    if (uniformity >= 0.8) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getUniformityStatus = (uniformity: number) => {
    if (uniformity >= 0.9) return 'Excellent'
    if (uniformity >= 0.8) return 'Good'
    if (uniformity >= 0.7) return 'Fair'
    return 'Poor'
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Cross-Section Analysis</h3>
            <p className="text-sm text-gray-400">Analyze light distribution in 2D slices</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowUniformityAnalysis(!showUniformityAnalysis)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all"
        >
          {showUniformityAnalysis ? <Eye className="w-4 h-4 text-gray-300" /> : <EyeOff className="w-4 h-4 text-gray-300" />}
        </button>
      </div>

      {/* Axis Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-white mb-3 block">Cross-Section Plane</label>
        <div className="grid grid-cols-3 gap-2">
          {(['x', 'y', 'z'] as const).map(axis => {
            const info = getAxisInfo(axis)
            return (
              <button
                key={axis}
                onClick={() => handleSectionChange(axis, sectionPosition)}
                className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                  sectionAxis === axis
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className={`font-bold ${info.color}`}>{axis.toUpperCase()}</span>
                <span className="text-xs">{info.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Position Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white">
            Position along {axisInfo.name} axis
          </label>
          <span className={`text-sm font-medium ${axisInfo.color}`}>
            {((sectionPosition / 100) * axisInfo.max).toFixed(1)} {axisInfo.unit}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={sectionPosition}
          onChange={(e) => handleSectionChange(sectionAxis, Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0 {axisInfo.unit}</span>
          <span>{axisInfo.max} {axisInfo.unit}</span>
        </div>
      </div>

      {/* Tolerance Setting */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white">Slice Thickness</label>
          <span className="text-sm text-gray-300">{tolerance.toFixed(1)} ft</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={tolerance}
          onChange={(e) => setTolerance(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Cross-Section Visualization */}
      <div className="mb-6">
        <h4 className="font-medium text-white mb-3">2D Cross-Section View</h4>
        <div className="relative bg-gray-900 rounded-lg h-48 overflow-hidden">
          {visualizationData.length > 0 ? (
            <div className="relative w-full h-full">
              {/* Grid */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={`v-${i}`} className="absolute top-0 bottom-0 w-px bg-gray-600" style={{ left: `${i * 10}%` }} />
                ))}
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={`h-${i}`} className="absolute left-0 right-0 h-px bg-gray-600" style={{ top: `${i * 10}%` }} />
                ))}
              </div>
              
              {/* Data points */}
              {visualizationData.map((point, index) => {
                const maxX = sectionAxis === 'x' ? roomDimensions.height : roomDimensions.width
                const maxY = sectionAxis === 'z' ? roomDimensions.height : roomDimensions.depth
                
                const normalizedX = (point.x / maxX) * 100
                const normalizedY = 100 - (point.y / maxY) * 100 // Flip Y for screen coordinates
                
                const ppfdNormalized = point.ppfd / (uniformityMetrics?.max || 1000)
                const size = Math.max(2, ppfdNormalized * 8)
                
                return (
                  <div
                    key={index}
                    className="absolute rounded-full"
                    style={{
                      left: `${normalizedX}%`,
                      top: `${normalizedY}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: `hsl(${(1 - ppfdNormalized) * 240}, 100%, 60%)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    title={`PPFD: ${point.ppfd.toFixed(0)}`}
                  />
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Grid3X3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No data points in this slice</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Uniformity Analysis */}
      {showUniformityAnalysis && uniformityMetrics && (
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Uniformity Analysis
          </h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Min PPFD:</span>
                <span className="text-white">{uniformityMetrics.min.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max PPFD:</span>
                <span className="text-white">{uniformityMetrics.max.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average:</span>
                <span className="text-white">{uniformityMetrics.avg.toFixed(0)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Uniformity:</span>
                <span className={`font-medium ${getUniformityColor(uniformityMetrics.uniformity)}`}>
                  {(uniformityMetrics.uniformity * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CV:</span>
                <span className="text-white">{uniformityMetrics.cv.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data Points:</span>
                <span className="text-white">{uniformityMetrics.dataPoints}</span>
              </div>
            </div>
          </div>
          
          {/* Uniformity Status */}
          <div className={`text-center p-2 rounded-lg border ${
            uniformityMetrics.uniformity >= 0.9 ? 'bg-green-900/30 border-green-700/50' :
            uniformityMetrics.uniformity >= 0.8 ? 'bg-yellow-900/30 border-yellow-700/50' :
            'bg-red-900/30 border-red-700/50'
          }`}>
            <span className={`font-medium ${getUniformityColor(uniformityMetrics.uniformity)}`}>
              {getUniformityStatus(uniformityMetrics.uniformity)} Uniformity
            </span>
          </div>
        </div>
      )}
    </div>
  )
}