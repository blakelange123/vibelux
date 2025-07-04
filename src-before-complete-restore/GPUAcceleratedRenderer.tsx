'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import {
  Zap,
  Activity,
  Settings,
  Download,
  Info,
  Monitor,
  Cpu,
  TrendingUp,
  AlertCircle,
  Play,
  Pause,
  RotateCw
} from 'lucide-react'
import { GPURayTracer, SpectralGPURayTracer } from '@/lib/gpu/gpu-raytracer'
import type { GPUScene, GPUFixture } from '@/lib/gpu/gpu-raytracer'

interface GPUAcceleratedRendererProps {
  fixtures?: any[]
  room?: {
    width: number
    length: number
    height: number
  }
  workingHeight?: number
  onCalculationComplete?: (results: any) => void
}

export function GPUAcceleratedRenderer({
  fixtures = [],
  room = { width: 20, length: 40, height: 14 },
  workingHeight = 3,
  onCalculationComplete
}: GPUAcceleratedRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const raytracerRef = useRef<GPURayTracer | null>(null)
  const animationFrameRef = useRef<number>()
  
  const [isGPUAvailable, setIsGPUAvailable] = useState(true)
  const [isRendering, setIsRendering] = useState(false)
  const [renderMode, setRenderMode] = useState<'realtime' | 'quality'>('realtime')
  const [showFalseColor, setShowFalseColor] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 0,
    renderTime: 0,
    gpuMemory: 0,
    samples: 0
  })
  
  // Calculation results
  const [results, setResults] = useState({
    min: 0,
    max: 0,
    average: 0,
    uniformity: 0
  })
  
  // Render settings
  const [settings, setSettings] = useState({
    resolution: 256,
    samplesPerPixel: renderMode === 'realtime' ? 1 : 16,
    maxBounces: renderMode === 'realtime' ? 2 : 5,
    enableSpectral: false
  })
  
  // Initialize GPU ray tracer
  useEffect(() => {
    if (!canvasRef.current) return
    
    try {
      const raytracer = settings.enableSpectral
        ? new SpectralGPURayTracer(canvasRef.current, {
            resolution: { width: settings.resolution, height: settings.resolution },
            samplesPerPixel: settings.samplesPerPixel,
            maxBounces: settings.maxBounces,
            enableSpectral: true,
            wavelengths: [450, 500, 550, 600, 650, 700]
          })
        : new GPURayTracer(canvasRef.current, {
            resolution: { width: settings.resolution, height: settings.resolution },
            samplesPerPixel: settings.samplesPerPixel,
            maxBounces: settings.maxBounces,
            enableSpectral: false
          })
      
      raytracerRef.current = raytracer
      setIsGPUAvailable(true)
    } catch (error) {
      console.error('GPU initialization failed:', error)
      setIsGPUAvailable(false)
    }
    
    return () => {
      raytracerRef.current?.dispose()
    }
  }, [settings])
  
  // Convert fixtures to GPU format
  const prepareScene = useCallback((): GPUScene => {
    const gpuFixtures: GPUFixture[] = fixtures.map(fixture => ({
      position: [fixture.x || 0, fixture.y || 0, fixture.z || (room?.height || 10) - 2],
      direction: [0, 0, -1], // Pointing down
      intensity: (fixture.model?.ppf || 1000) * 4.6, // Convert PPF to lumens (rough)
      beamAngle: fixture.model?.beamAngle || 120,
      fieldAngle: (fixture.model?.beamAngle || 120) + 10,
      spectrum: undefined // Could add spectral data here
    }))
    
    return {
      fixtures: gpuFixtures,
      surfaces: [], // Simplified for now
      room,
      workingPlane: workingHeight
    }
  }, [fixtures, room, workingHeight])
  
  // Render frame
  const renderFrame = useCallback(() => {
    if (!raytracerRef.current || !isRendering) return
    
    const startTime = performance.now()
    
    try {
      // Upload scene
      const scene = prepareScene()
      raytracerRef.current.uploadScene(scene)
      
      // Render
      raytracerRef.current.render(showFalseColor)
      
      // Calculate statistics
      const stats = raytracerRef.current.calculateStatistics()
      setResults(stats)
      
      // Update performance metrics
      const renderTime = performance.now() - startTime
      setPerformanceMetrics(prev => ({
        fps: Math.round(1000 / renderTime),
        renderTime: Math.round(renderTime),
        gpuMemory: prev.gpuMemory, // Would need WebGL extension for real memory usage
        samples: prev.samples + settings.samplesPerPixel
      }))
      
      // Callback with results
      onCalculationComplete?.(stats)
      
    } catch (error) {
      console.error('Render error:', error)
      setIsRendering(false)
    }
    
    // Continue rendering if in realtime mode
    if (renderMode === 'realtime') {
      animationFrameRef.current = requestAnimationFrame(renderFrame)
    } else {
      setIsRendering(false)
    }
  }, [isRendering, prepareScene, showFalseColor, settings, renderMode, onCalculationComplete])
  
  // Start/stop rendering
  useEffect(() => {
    if (isRendering) {
      renderFrame()
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRendering, renderFrame])
  
  // Export results
  const exportResults = () => {
    if (!raytracerRef.current) return
    
    const data = {
      timestamp: new Date().toISOString(),
      room,
      fixtures: fixtures.length,
      settings,
      results,
      performance
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gpu-raytracing-results-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  // Reset performance counters
  const resetPerformance = () => {
    setPerformanceMetrics({
      fps: 0,
      renderTime: 0,
      gpuMemory: 0,
      samples: 0
    })
  }
  
  if (!isGPUAvailable) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">GPU Acceleration Not Available</h3>
            <p className="text-sm text-gray-400">WebGL2 is required for GPU ray tracing</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100">GPU Ray Tracing</h2>
            <p className="text-sm text-gray-400">Hardware-accelerated photometric calculations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={exportResults}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setIsRendering(!isRendering)}
            disabled={fixtures.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isRendering
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500'
            }`}
          >
            {isRendering ? (
              <>
                <Pause className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Render
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Render View */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Render Output</h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showFalseColor}
                    onChange={(e) => setShowFalseColor(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-purple-600"
                  />
                  <span className="text-gray-300">False Color</span>
                </label>
                <select
                  value={renderMode}
                  onChange={(e) => setRenderMode(e.target.value as any)}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                >
                  <option value="realtime">Real-time</option>
                  <option value="quality">Quality</option>
                </select>
              </div>
            </div>
            
            <div className="relative bg-gray-900 rounded overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full"
              />
              
              {!isRendering && fixtures.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">Add fixtures to begin ray tracing</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Color scale */}
            {showFalseColor && (
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-gray-400">PPFD Scale:</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-blue-600" />
                    <span className="text-gray-500">0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-500" />
                    <span className="text-gray-500">{Math.round(results.average)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-500" />
                    <span className="text-gray-500">{Math.round(results.max)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Metrics Panel */}
        <div className="space-y-6">
          {/* Performance */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-100">Performance</h3>
              <button
                onClick={resetPerformance}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Reset counters"
              >
                <RotateCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">FPS</span>
                </div>
                <span className="text-lg font-semibold text-gray-100">
                  {performanceMetrics.fps}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Render Time</span>
                </div>
                <span className="text-lg font-semibold text-gray-100">
                  {performanceMetrics.renderTime}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Total Samples</span>
                </div>
                <span className="text-lg font-semibold text-gray-100">
                  {performanceMetrics.samples.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-100 mb-4">Calculation Results</h3>
            
            <div className="space-y-3">
              <div className="pb-3 border-b border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Average PPFD</span>
                  <span className="text-sm text-gray-500">µmol/m²/s</span>
                </div>
                <p className="text-2xl font-semibold text-gray-100">
                  {results.average.toFixed(0)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Min</span>
                  <p className="text-lg font-medium text-gray-100">
                    {results.min.toFixed(0)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Max</span>
                  <p className="text-lg font-medium text-gray-100">
                    {results.max.toFixed(0)}
                  </p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Uniformity</span>
                  <span className={`text-sm ${
                    results.uniformity > 0.7 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {(results.uniformity * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      results.uniformity > 0.7 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${results.uniformity * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* System Info */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-100 mb-4">System Info</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Renderer</span>
                <span className="text-gray-100">WebGL2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Resolution</span>
                <span className="text-gray-100">{settings.resolution}×{settings.resolution}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Fixtures</span>
                <span className="text-gray-100">{fixtures.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Room</span>
                <span className="text-gray-100">{room?.width || 0}×{room?.length || 0} ft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-100">Render Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-800 rounded"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Resolution
                </label>
                <select
                  value={settings.resolution}
                  onChange={(e) => setSettings({
                    ...settings,
                    resolution: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value={128}>128×128 (Fast)</option>
                  <option value={256}>256×256 (Balanced)</option>
                  <option value={512}>512×512 (Quality)</option>
                  <option value={1024}>1024×1024 (High)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Samples Per Pixel
                </label>
                <input
                  type="number"
                  value={settings.samplesPerPixel}
                  onChange={(e) => setSettings({
                    ...settings,
                    samplesPerPixel: Number(e.target.value)
                  })}
                  min="1"
                  max="256"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher values reduce noise but increase render time
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Max Bounces
                </label>
                <input
                  type="number"
                  value={settings.maxBounces}
                  onChange={(e) => setSettings({
                    ...settings,
                    maxBounces: Number(e.target.value)
                  })}
                  min="0"
                  max="10"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of light bounces for indirect illumination
                </p>
              </div>
              
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.enableSpectral}
                    onChange={(e) => setSettings({
                      ...settings,
                      enableSpectral: e.target.checked
                    })}
                    className="rounded border-gray-600 bg-gray-700 text-purple-600"
                  />
                  <span className="text-sm text-gray-300">Enable Spectral Rendering</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Calculate separate wavelengths for accurate PAR
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSettings(renderMode === 'realtime' ? {
                    resolution: 256,
                    samplesPerPixel: 1,
                    maxBounces: 2,
                    enableSpectral: false
                  } : {
                    resolution: 512,
                    samplesPerPixel: 16,
                    maxBounces: 5,
                    enableSpectral: false
                  })
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">GPU Ray Tracing Benefits</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• 100-1000x faster than CPU-based calculations</li>
              <li>• Real-time visualization of lighting changes</li>
              <li>• Accurate indirect lighting through multiple bounces</li>
              <li>• Spectral rendering for precise PAR calculations</li>
              <li>• Scales to thousands of fixtures without slowdown</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add missing import
import { X } from 'lucide-react'