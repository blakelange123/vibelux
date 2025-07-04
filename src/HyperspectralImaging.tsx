'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Camera,
  Activity,
  AlertTriangle,
  Droplets,
  Leaf,
  Sun,
  Thermometer,
  Target,
  Download,
  Upload,
  Play,
  Pause,
  Settings,
  Info,
  ChevronRight,
  Zap,
  TrendingUp
} from 'lucide-react'
import { HyperspectralAnalyzer } from '@/lib/hyperspectral/hyperspectral-analyzer'
import type { 
  HyperspectralData, 
  VegetationIndex, 
  StressIndicator,
  NutrientStatus 
} from '@/lib/hyperspectral/hyperspectral-analyzer'

interface HyperspectralImagingProps {
  onDataCapture?: (data: HyperspectralData[]) => void
}

export function HyperspectralImaging({ onDataCapture }: HyperspectralImagingProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<'NDVI' | 'EVI' | 'WBI' | 'PRI'>('NDVI')
  const [capturedData, setCapturedData] = useState<HyperspectralData[]>([])
  const [vegetationIndices, setVegetationIndices] = useState<VegetationIndex[]>([])
  const [stressIndicators, setStressIndicators] = useState<StressIndicator[]>([])
  const [nutrientStatus, setNutrientStatus] = useState<NutrientStatus | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyzer = new HyperspectralAnalyzer()
  
  // Settings
  const [settings, setSettings] = useState({
    captureInterval: 5000, // ms
    spectralResolution: 10, // nm
    spatialResolution: 100, // pixels
    wavelengthRange: { min: 400, max: 1000 }
  })
  
  // Simulate hyperspectral data capture
  const simulateDataCapture = () => {
    const width = settings.spatialResolution
    const height = settings.spatialResolution
    const data: HyperspectralData[] = []
    
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        // Simulate varying plant health across the area
        const healthGradient = 1 - (Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2)) / (width/2))
        const randomVariation = 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4
        
        const bands = []
        for (let wl = settings.wavelengthRange.min; wl <= settings.wavelengthRange.max; wl += settings.spectralResolution) {
          let reflectance = 0
          
          // Simulate vegetation spectral signature
          if (wl < 500) reflectance = 0.05 // Low in blue
          else if (wl < 600) reflectance = 0.10 + (wl - 500) * 0.0005 // Slight rise in green
          else if (wl < 700) reflectance = 0.05 // Low in red (chlorophyll absorption)
          else if (wl < 750) reflectance = 0.05 + (wl - 700) * 0.008 // Red edge
          else reflectance = 0.45 // High in NIR
          
          // Apply health gradient and variation
          reflectance *= healthGradient * randomVariation
          
          bands.push({
            wavelength: wl,
            reflectance: Math.max(0, Math.min(1, reflectance)),
            absorbance: 1 - reflectance
          })
        }
        
        data.push({
          bands,
          timestamp: new Date(),
          temperature: 22 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
          humidity: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
          coordinates: { x, y }
        })
      }
    }
    
    setCapturedData(data)
    
    // Analyze a sample point
    if (data.length > 0) {
      const sampleData = data[Math.floor(data.length / 2)]
      const indices = analyzer.calculateVegetationIndices(sampleData)
      const stress = analyzer.detectStress(sampleData)
      const nutrients = analyzer.analyzeNutrientStatus(sampleData)
      
      setVegetationIndices(indices)
      setStressIndicators(stress)
      setNutrientStatus(nutrients)
    }
    
    // Render hyperspectral map
    renderHyperspectralMap(data)
    
    // Callback
    onDataCapture?.(data)
  }
  
  // Render hyperspectral visualization
  const renderHyperspectralMap = (data: HyperspectralData[]) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = settings.spatialResolution
    const height = settings.spatialResolution
    
    // Generate hyperspectral map
    const map = analyzer.generateHyperspectralMap(data, width, height, selectedIndex)
    
    // Create image data
    const imageData = ctx.createImageData(width, height)
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const value = map[y][x]
        const color = getColorForIndex(selectedIndex, value)
        
        const index = (y * width + x) * 4
        imageData.data[index] = color.r
        imageData.data[index + 1] = color.g
        imageData.data[index + 2] = color.b
        imageData.data[index + 3] = 255
      }
    }
    
    // Scale up for better visibility
    const scaledCanvas = document.createElement('canvas')
    scaledCanvas.width = canvas.width
    scaledCanvas.height = canvas.height
    const scaledCtx = scaledCanvas.getContext('2d')!
    
    // Put image data on temporary canvas
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.putImageData(imageData, 0, 0)
    
    // Scale up to main canvas
    scaledCtx.imageSmoothingEnabled = false
    scaledCtx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height)
    
    ctx.drawImage(scaledCanvas, 0, 0)
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = (canvas.width / 10) * i
      const y = (canvas.height / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    
    // Draw selected point
    if (selectedPoint) {
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(
        selectedPoint.x * (canvas.width / width),
        selectedPoint.y * (canvas.height / height),
        10,
        0,
        Math.PI * 2
      )
      ctx.stroke()
    }
  }
  
  // Get color for vegetation index value
  const getColorForIndex = (index: string, value: number): { r: number; g: number; b: number } => {
    switch (index) {
      case 'NDVI':
        // Red to green gradient
        if (value < 0) return { r: 139, g: 0, b: 0 } // Dark red
        if (value < 0.2) return { r: 255, g: 0, b: 0 } // Red
        if (value < 0.4) return { r: 255, g: 165, b: 0 } // Orange
        if (value < 0.6) return { r: 255, g: 255, b: 0 } // Yellow
        if (value < 0.8) return { r: 0, g: 255, b: 0 } // Green
        return { r: 0, g: 100, b: 0 } // Dark green
        
      case 'WBI':
        // Blue gradient for water
        const intensity = Math.floor(value * 255)
        return { r: 0, g: intensity, b: 255 }
        
      case 'PRI':
        // Purple to yellow for photosynthetic efficiency
        if (value < 0) return { r: 128, g: 0, b: 128 } // Purple
        if (value < 0.05) return { r: 255, g: 255, b: 0 } // Yellow
        return { r: 0, g: 255, b: 0 } // Green
        
      case 'EVI':
        // Similar to NDVI but different scale
        const evi = Math.max(0, Math.min(1, value))
        return {
          r: Math.floor(255 * (1 - evi)),
          g: Math.floor(255 * evi),
          b: 0
        }
        
      default:
        return { r: 128, g: 128, b: 128 }
    }
  }
  
  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || capturedData.length === 0) return
    
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(((event.clientX - rect.left) / canvas.width) * settings.spatialResolution)
    const y = Math.floor(((event.clientY - rect.top) / canvas.height) * settings.spatialResolution)
    
    setSelectedPoint({ x, y })
    
    // Find nearest data point
    const nearestData = capturedData.find(d => 
      d.coordinates && 
      Math.abs(d.coordinates.x - x) < 10 && 
      Math.abs(d.coordinates.y - y) < 10
    )
    
    if (nearestData) {
      const indices = analyzer.calculateVegetationIndices(nearestData)
      const stress = analyzer.detectStress(nearestData)
      const nutrients = analyzer.analyzeNutrientStatus(nearestData)
      
      setVegetationIndices(indices)
      setStressIndicators(stress)
      setNutrientStatus(nutrients)
    }
  }
  
  // Auto-capture
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isCapturing) {
      simulateDataCapture() // Initial capture
      interval = setInterval(simulateDataCapture, settings.captureInterval)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCapturing, settings])
  
  // Export data
  const exportData = () => {
    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        settings,
        totalPoints: capturedData.length
      },
      summary: {
        vegetationIndices,
        stressIndicators,
        nutrientStatus
      },
      rawData: capturedData.slice(0, 100) // Limit raw data size
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hyperspectral-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Hyperspectral Imaging Analysis</h1>
          <p className="text-gray-400">Advanced plant health monitoring and stress detection</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={exportData}
            disabled={capturedData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setIsCapturing(!isCapturing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isCapturing 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isCapturing ? (
              <>
                <Pause className="w-4 h-4" />
                Stop Capture
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Start Capture
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hyperspectral Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100">Spectral Map</h2>
              <div className="flex gap-2">
                {(['NDVI', 'EVI', 'WBI', 'PRI'] as const).map(index => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedIndex === index
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {index}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                onClick={handleCanvasClick}
                className="w-full border border-gray-700 rounded cursor-crosshair bg-gray-900"
              />
              
              {capturedData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">Click "Start Capture" to begin analysis</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Scale:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-600" />
                  <span className="text-gray-500">Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-yellow-500" />
                  <span className="text-gray-500">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-500" />
                  <span className="text-gray-500">High</span>
                </div>
              </div>
              {selectedPoint && (
                <span className="text-gray-400">
                  Point: ({selectedPoint.x}, {selectedPoint.y})
                </span>
              )}
            </div>
          </div>
          
          {/* Stress Indicators */}
          {stressIndicators.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Stress Detection</h2>
              <div className="space-y-3">
                {stressIndicators.map((stress, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      stress.severity > 70
                        ? 'bg-red-500/10 border-red-500/30'
                        : stress.severity > 40
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {stress.type === 'water' && <Droplets className="w-5 h-5 text-blue-400" />}
                        {stress.type === 'nutrient' && <Leaf className="w-5 h-5 text-green-400" />}
                        {stress.type === 'light' && <Sun className="w-5 h-5 text-yellow-400" />}
                        {stress.type === 'temperature' && <Thermometer className="w-5 h-5 text-orange-400" />}
                        {stress.type === 'disease' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                        <span className="font-medium text-gray-100 capitalize">
                          {stress.type} Stress
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-100">
                          {stress.severity.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-400">
                          Confidence: {stress.confidence}%
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{stress.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Analysis Results */}
        <div className="space-y-6">
          {/* Vegetation Indices */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Vegetation Indices</h2>
            <div className="space-y-3">
              {vegetationIndices.map((index, idx) => (
                <div key={idx} className="border-b border-gray-700 pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300">{index.name}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      index.healthStatus === 'excellent' ? 'bg-green-600/20 text-green-400' :
                      index.healthStatus === 'good' ? 'bg-blue-600/20 text-blue-400' :
                      index.healthStatus === 'fair' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                      {index.healthStatus}
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-100 mb-1">
                    {index.value.toFixed(3)}
                  </div>
                  <p className="text-xs text-gray-400">{index.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Nutrient Status */}
          {nutrientStatus && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Nutrient Analysis</h2>
              <div className="space-y-3">
                {Object.entries(nutrientStatus).map(([nutrient, data]) => (
                  <div key={nutrient} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300 capitalize">
                      {nutrient}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            data.level >= 80 ? 'bg-green-500' :
                            data.level >= 60 ? 'bg-blue-500' :
                            data.level >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${data.level}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-20 text-right">
                        {data.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* System Status */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">System Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <span className={`flex items-center gap-1 ${
                  isCapturing ? 'text-green-400' : 'text-gray-500'
                }`}>
                  <Activity className="w-4 h-4" />
                  {isCapturing ? 'Capturing' : 'Idle'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Data Points</span>
                <span className="text-gray-100">{capturedData.length.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Resolution</span>
                <span className="text-gray-100">{settings.spatialResolution}×{settings.spatialResolution}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Spectral Bands</span>
                <span className="text-gray-100">
                  {Math.floor((settings.wavelengthRange.max - settings.wavelengthRange.min) / settings.spectralResolution)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-100">Capture Settings</h3>
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
                  Capture Interval (seconds)
                </label>
                <input
                  type="number"
                  value={settings.captureInterval / 1000}
                  onChange={(e) => setSettings({
                    ...settings,
                    captureInterval: Number(e.target.value) * 1000
                  })}
                  min="1"
                  max="60"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Spectral Resolution (nm)
                </label>
                <input
                  type="number"
                  value={settings.spectralResolution}
                  onChange={(e) => setSettings({
                    ...settings,
                    spectralResolution: Number(e.target.value)
                  })}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Spatial Resolution (pixels)
                </label>
                <select
                  value={settings.spatialResolution}
                  onChange={(e) => setSettings({
                    ...settings,
                    spatialResolution: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value={50}>50×50</option>
                  <option value={100}>100×100</option>
                  <option value={200}>200×200</option>
                  <option value={500}>500×500</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Wavelength Range (nm)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={settings.wavelengthRange.min}
                    onChange={(e) => setSettings({
                      ...settings,
                      wavelengthRange: {
                        ...settings.wavelengthRange,
                        min: Number(e.target.value)
                      }
                    })}
                    min="300"
                    max="700"
                    placeholder="Min"
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <input
                    type="number"
                    value={settings.wavelengthRange.max}
                    onChange={(e) => setSettings({
                      ...settings,
                      wavelengthRange: {
                        ...settings.wavelengthRange,
                        max: Number(e.target.value)
                      }
                    })}
                    min="700"
                    max="1100"
                    placeholder="Max"
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  // Send hyperspectral data to Plant Biology Integration
                  if (capturedData.length > 0 && vegetationIndices.length > 0) {
                    const avgIndices = vegetationIndices.reduce((acc, vi) => {
                      if (vi.name === 'NDVI') acc.ndvi += vi.value || 0
                      if (vi.name === 'EVI') acc.evi += vi.value || 0
                      if (vi.name === 'SAVI') acc.savi += vi.value || 0
                      if (vi.name === 'PRI') acc.pri += vi.value || 0
                      if (vi.name === 'WBI') acc.wbi += vi.value || 0
                      if (vi.name === 'MCARI') acc.mcari += vi.value || 0
                      return acc
                    }, { ndvi: 0, evi: 0, savi: 0, pri: 0, wbi: 0, mcari: 0 })
                    
                    // Average the values
                    const count = vegetationIndices.length
                    Object.keys(avgIndices).forEach(key => {
                      avgIndices[key as keyof typeof avgIndices] /= count
                    })
                    
                    // Determine stress indicators based on indices
                    const stressIndicatorsData = {
                      waterStress: (avgIndices.wbi < 0.9) || stressIndicators.some(s => s.type === 'water' && s.severity > 50),
                      nutrientDeficiency: (avgIndices.ndvi < 0.4) || stressIndicators.some(s => s.type === 'nutrient' && s.severity > 50),
                      diseasePresence: stressIndicators.some(s => s.type === 'disease' && s.severity > 30),
                      pestInfestation: false // Would need pest-specific spectral signatures
                    }
                    
                    // Estimate pigment content from indices
                    const chlorophyllContent = avgIndices.ndvi * 50 // Rough estimate
                    const carotenoidContent = avgIndices.pri * 20 + 5 // Rough estimate
                    const anthocyaninContent = Math.max(0, (0.5 - avgIndices.ndvi) * 10) // Rough estimate
                    
                    // Dispatch event with hyperspectral data
                    window.dispatchEvent(new CustomEvent('hyperspectralDataUpdate', {
                      detail: {
                        timestamp: new Date().toISOString(),
                        vegetationIndices: avgIndices,
                        stressIndicators: stressIndicatorsData,
                        chlorophyllContent,
                        carotenoidContent,
                        anthocyaninContent
                      }
                    }))
                    
                    alert('Hyperspectral data sent to Plant Biology Integration')
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Send to Plant Biology
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Apply Settings
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
            <p className="font-medium mb-1">About Hyperspectral Imaging</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• Captures hundreds of spectral bands for detailed plant analysis</li>
              <li>• NDVI measures overall vegetation health and vigor</li>
              <li>• WBI indicates plant water status and stress levels</li>
              <li>• PRI shows photosynthetic efficiency and light use</li>
              <li>• Click on the map to analyze specific points</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add missing import
import { X } from 'lucide-react'