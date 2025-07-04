"use client"

import { useState, useEffect, useRef } from 'react'
import { Grid3x3, Download, Play, Pause, RotateCw, Eye, EyeOff, Save, Cloud } from 'lucide-react'

interface VirtualSensorProps {
  roomWidth: number
  roomLength: number
  fixtures: Array<{
    x: number
    y: number
    z: number
    ppf: number
    beamAngle: number
  }>
  gridResolution?: number // sensors per foot
}

interface SensorPoint {
  x: number
  y: number
  ppfd: number
  uniformity: number
}

export function VirtualSensorGrid({ 
  roomWidth, 
  roomLength, 
  fixtures,
  gridResolution = 1 
}: VirtualSensorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentTime, setCurrentTime] = useState(0) // 0-24 hours
  const [showGrid, setShowGrid] = useState(true)
  const [sensorData, setSensorData] = useState<SensorPoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<{ x: number, y: number } | null>(null)
  
  // Calculate PPFD at a specific point
  const calculatePPFD = (x: number, y: number, z: number = 2) => {
    let totalPPFD = 0
    
    fixtures.forEach(fixture => {
      const distance = Math.sqrt(
        Math.pow(x - fixture.x, 2) + 
        Math.pow(y - fixture.y, 2) +
        Math.pow(z - fixture.z, 2)
      )
      
      // Simple inverse square law
      const intensity = fixture.ppf / (4 * Math.PI * Math.pow(distance, 2))
      
      // Apply beam angle
      const angle = Math.atan2(
        Math.sqrt(Math.pow(x - fixture.x, 2) + Math.pow(y - fixture.y, 2)),
        fixture.z - z
      ) * 180 / Math.PI
      
      if (angle <= fixture.beamAngle / 2) {
        totalPPFD += intensity * Math.cos(angle * Math.PI / 180)
      }
    })
    
    return totalPPFD * 10000 // Convert to μmol/m²/s
  }
  
  // Generate virtual sensor grid
  useEffect(() => {
    const points: SensorPoint[] = []
    const cols = Math.ceil(roomWidth * gridResolution)
    const rows = Math.ceil(roomLength * gridResolution)
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col + 0.5) / gridResolution
        const y = (row + 0.5) / gridResolution
        const ppfd = calculatePPFD(x, y)
        
        points.push({ x, y, ppfd, uniformity: 0 })
      }
    }
    
    // Calculate uniformity for each point
    points.forEach((point, idx) => {
      const neighbors = points.filter(p => 
        Math.abs(p.x - point.x) <= 1/gridResolution && 
        Math.abs(p.y - point.y) <= 1/gridResolution
      )
      
      const avgPPFD = neighbors.reduce((sum, n) => sum + n.ppfd, 0) / neighbors.length
      const minPPFD = Math.min(...neighbors.map(n => n.ppfd))
      point.uniformity = minPPFD / avgPPFD
    })
    
    setSensorData(points)
  }, [roomWidth, roomLength, fixtures, gridResolution])
  
  // Animate through 24-hour cycle
  useEffect(() => {
    if (!isAnimating) return
    
    const interval = setInterval(() => {
      setCurrentTime(t => (t + 0.5) % 24)
    }, 100)
    
    return () => clearInterval(interval)
  }, [isAnimating])
  
  // Draw visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Get container width for responsive sizing
    const containerWidth = canvas.parentElement?.clientWidth || 600
    const maxWidth = Math.min(containerWidth - 40, 600) // Leave some padding
    const maxHeight = 400
    
    const scale = Math.min(maxWidth / roomWidth, maxHeight / roomLength)
    canvas.width = roomWidth * scale
    canvas.height = roomLength * scale
    
    // Clear canvas
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw sensor readings
    sensorData.forEach(sensor => {
      const x = sensor.x * scale
      const y = sensor.y * scale
      
      // Apply photoperiod
      let intensity = sensor.ppfd
      if (currentTime < 6 || currentTime > 22) {
        intensity = 0 // Lights off
      } else if (currentTime < 7) {
        intensity *= (currentTime - 6) // Sunrise
      } else if (currentTime > 21) {
        intensity *= (22 - currentTime) // Sunset
      }
      
      // Color based on intensity
      const normalized = Math.min(intensity / 800, 1)
      const r = normalized > 0.5 ? 255 : normalized * 2 * 255
      const g = normalized > 0.5 ? (1 - (normalized - 0.5) * 2) * 255 : 255
      const b = 0
      
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`
      ctx.fillRect(x - 5, y - 5, 10, 10)
      
      // Show grid points
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.strokeRect(x - 5, y - 5, 10, 10)
      }
    })
    
    // Draw fixtures
    fixtures.forEach(fixture => {
      const x = fixture.x * scale
      const y = fixture.y * scale
      
      ctx.fillStyle = currentTime >= 6 && currentTime <= 22 ? '#fbbf24' : '#4b5563'
      ctx.fillRect(x - 10, y - 5, 20, 10)
    })
    
    // Draw selected point info
    if (selectedPoint) {
      const ppfd = calculatePPFD(selectedPoint.x, selectedPoint.y)
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(selectedPoint.x * scale - 50, selectedPoint.y * scale - 40, 100, 30)
      
      ctx.fillStyle = '#fff'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(
        `${ppfd.toFixed(0)} μmol/m²/s`,
        selectedPoint.x * scale,
        selectedPoint.y * scale - 20
      )
    }
    
    // Time display
    ctx.fillStyle = '#fff'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`Time: ${currentTime.toFixed(0).padStart(2, '0')}:00`, 10, 20)
    
  }, [sensorData, currentTime, showGrid, selectedPoint, fixtures, roomWidth, roomLength])
  
  // Export sensor data
  const exportData = () => {
    const csv = [
      'X,Y,PPFD,Uniformity,Time',
      ...sensorData.map(s => 
        `${s.x.toFixed(2)},${s.y.toFixed(2)},${s.ppfd.toFixed(0)},${s.uniformity.toFixed(2)},${currentTime.toFixed(0)}`
      )
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `virtual-sensor-data-${Date.now()}.csv`
    a.click()
  }

  return (
    <div className="w-full">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-purple-400" />
            Virtual Sensor Grid
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors ${
                showGrid ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
              title="Toggle grid"
            >
              {showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`p-2 rounded-lg transition-colors ${
                isAnimating ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
              }`}
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setCurrentTime(0)}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={exportData}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Export data"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="rounded-lg cursor-crosshair"
            style={{ maxWidth: '100%', height: 'auto' }}
            onClick={(e) => {
              const canvas = canvasRef.current
              const rect = canvas?.getBoundingClientRect()
              if (!rect || !canvas) return
              
              const scale = canvas.width / roomWidth
              const x = (e.clientX - rect.left) * (canvas.width / rect.width) / scale
              const y = (e.clientY - rect.top) * (canvas.height / rect.height) / scale
              
              setSelectedPoint({ x, y })
            }}
          />
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-gray-400">Sensor Points</p>
            <p className="text-xl font-semibold text-white">{sensorData.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-gray-400">Grid Resolution</p>
            <p className="text-xl font-semibold text-white">{gridResolution}/ft</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-gray-400">Coverage</p>
            <p className="text-xl font-semibold text-white">{(roomWidth * roomLength).toFixed(0)} ft²</p>
          </div>
        </div>
      </div>
      
      {/* Feature Highlight */}
      <div className="mt-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-600/30">
        <h4 className="font-medium text-white mb-2">
          Why Virtual Sensors Beat Physical Ones
        </h4>
        <ul className="space-y-1 text-sm text-gray-300">
          <li>• Measure at unlimited points instantly</li>
          <li>• Simulate 24-hour photoperiods</li>
          <li>• Test "what-if" scenarios before buying</li>
          <li>• Export data in any sensor format</li>
          <li>• Zero hardware cost</li>
        </ul>
      </div>
    </div>
  )
}