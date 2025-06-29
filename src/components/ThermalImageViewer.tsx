'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Camera,
  Maximize2,
  Minimize2,
  Palette,
  Download,
  Target,
  Thermometer,
  AlertTriangle
} from 'lucide-react'
import { ThermalReading } from '@/lib/sensor-interfaces'

interface ThermalImageViewerProps {
  reading: ThermalReading | null
  onSpotSelect?: (x: number, y: number, temp: number) => void
}

// Color palettes for thermal visualization
const thermalPalettes = {
  iron: [
    { pos: 0, color: [0, 0, 0] },
    { pos: 0.25, color: [128, 0, 128] },
    { pos: 0.5, color: [255, 0, 0] },
    { pos: 0.75, color: [255, 255, 0] },
    { pos: 1, color: [255, 255, 255] }
  ],
  rainbow: [
    { pos: 0, color: [0, 0, 255] },
    { pos: 0.25, color: [0, 255, 255] },
    { pos: 0.5, color: [0, 255, 0] },
    { pos: 0.75, color: [255, 255, 0] },
    { pos: 1, color: [255, 0, 0] }
  ],
  hot: [
    { pos: 0, color: [0, 0, 0] },
    { pos: 0.33, color: [255, 0, 0] },
    { pos: 0.66, color: [255, 255, 0] },
    { pos: 1, color: [255, 255, 255] }
  ],
  cold: [
    { pos: 0, color: [0, 0, 0] },
    { pos: 0.33, color: [0, 0, 255] },
    { pos: 0.66, color: [0, 255, 255] },
    { pos: 1, color: [255, 255, 255] }
  ]
}

export default function ThermalImageViewer({ 
  reading, 
  onSpotSelect 
}: ThermalImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof thermalPalettes>('iron')
  const [showOverlay, setShowOverlay] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState<{ x: number; y: number; temp: number } | null>(null)
  const [hotSpots, setHotSpots] = useState<{ x: number; y: number; temp: number }[]>([])

  // Draw thermal image on canvas
  useEffect(() => {
    if (!reading || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { matrix, min, max } = reading.value
    const height = matrix.length
    const width = matrix[0]?.length || 0

    // Set canvas size
    canvas.width = width * 4 // Scale up for better visualization
    canvas.height = height * 4

    // Create image data
    const imageData = ctx.createImageData(canvas.width, canvas.height)
    const data = imageData.data

    // Temperature range
    const range = max - min || 1

    // Draw each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const temp = matrix[y][x]
        const normalized = (temp - min) / range
        const color = getColorForValue(normalized, thermalPalettes[selectedPalette])

        // Scale up each pixel (4x4)
        for (let dy = 0; dy < 4; dy++) {
          for (let dx = 0; dx < 4; dx++) {
            const pixelIndex = ((y * 4 + dy) * canvas.width + (x * 4 + dx)) * 4
            data[pixelIndex] = color[0]     // R
            data[pixelIndex + 1] = color[1] // G
            data[pixelIndex + 2] = color[2] // B
            data[pixelIndex + 3] = 255      // A
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Find hot spots (top 5% temperatures)
    const threshold = min + range * 0.95
    const spots: { x: number; y: number; temp: number }[] = []
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (matrix[y][x] >= threshold) {
          spots.push({ x, y, temp: matrix[y][x] })
        }
      }
    }
    
    // Sort by temperature and keep top 5
    spots.sort((a, b) => b.temp - a.temp)
    setHotSpots(spots.slice(0, 5))

  }, [reading, selectedPalette])

  // Get color for normalized value (0-1)
  const getColorForValue = (value: number, palette: typeof thermalPalettes.iron) => {
    // Find the two colors to interpolate between
    let lower = palette[0]
    let upper = palette[palette.length - 1]

    for (let i = 0; i < palette.length - 1; i++) {
      if (value >= palette[i].pos && value <= palette[i + 1].pos) {
        lower = palette[i]
        upper = palette[i + 1]
        break
      }
    }

    // Interpolate between colors
    const range = upper.pos - lower.pos
    const factor = range > 0 ? (value - lower.pos) / range : 0

    return [
      Math.round(lower.color[0] + (upper.color[0] - lower.color[0]) * factor),
      Math.round(lower.color[1] + (upper.color[1] - lower.color[1]) * factor),
      Math.round(lower.color[2] + (upper.color[2] - lower.color[2]) * factor)
    ]
  }

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!reading || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / rect.width * reading.value.matrix[0].length)
    const y = Math.floor((e.clientY - rect.top) / rect.height * reading.value.matrix.length)

    if (y >= 0 && y < reading.value.matrix.length && x >= 0 && x < reading.value.matrix[0].length) {
      const temp = reading.value.matrix[y][x]
      setSelectedSpot({ x, y, temp })
      
      if (onSpotSelect) {
        onSpotSelect(x, y, temp)
      }
    }
  }

  // Export thermal image
  const exportImage = () => {
    if (!canvasRef.current) return

    // Create a new canvas with overlay
    const exportCanvas = document.createElement('canvas')
    const exportCtx = exportCanvas.getContext('2d')
    if (!exportCtx || !reading) return

    exportCanvas.width = canvasRef.current.width
    exportCanvas.height = canvasRef.current.height

    // Copy thermal image
    exportCtx.drawImage(canvasRef.current, 0, 0)

    // Add temperature scale
    const scaleWidth = 40
    const scaleHeight = exportCanvas.height - 40
    const gradient = exportCtx.createLinearGradient(
      exportCanvas.width - scaleWidth - 20, 
      20, 
      exportCanvas.width - scaleWidth - 20, 
      20 + scaleHeight
    )

    // Add gradient stops
    thermalPalettes[selectedPalette].forEach(stop => {
      const color = `rgb(${stop.color.join(',')})`
      gradient.addColorStop(1 - stop.pos, color) // Invert for top-to-bottom
    })

    exportCtx.fillStyle = gradient
    exportCtx.fillRect(exportCanvas.width - scaleWidth - 20, 20, 30, scaleHeight)

    // Add temperature labels
    exportCtx.fillStyle = 'white'
    exportCtx.font = '12px monospace'
    exportCtx.textAlign = 'right'
    exportCtx.fillText(`${reading.value.max.toFixed(1)}°C`, exportCanvas.width - 55, 30)
    exportCtx.fillText(`${reading.value.min.toFixed(1)}°C`, exportCanvas.width - 55, scaleHeight + 15)

    // Convert to blob and download
    exportCanvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `thermal-${new Date().getTime()}.png`
      a.click()
    })
  }

  if (!reading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No thermal data available</p>
      </div>
    )
  }

  return (
    <div className={`bg-gray-800 rounded-lg ${isFullscreen ? 'fixed inset-0 z-50' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5 text-red-400" />
          Thermal Image
        </h3>
        <div className="flex gap-2">
          <select
            value={selectedPalette}
            onChange={(e) => setSelectedPalette(e.target.value as keyof typeof thermalPalettes)}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
          >
            <option value="iron">Iron</option>
            <option value="rainbow">Rainbow</option>
            <option value="hot">Hot</option>
            <option value="cold">Cold</option>
          </select>
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showOverlay ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Overlay
          </button>
          <button
            onClick={exportImage}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Temperature Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4 text-sm">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-400">Min</div>
          <div className="text-lg font-semibold text-blue-400">
            {reading.value.min.toFixed(1)}°C
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-400">Max</div>
          <div className="text-lg font-semibold text-red-400">
            {reading.value.max.toFixed(1)}°C
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-400">Average</div>
          <div className="text-lg font-semibold">
            {reading.value.average.toFixed(1)}°C
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-400">Range</div>
          <div className="text-lg font-semibold">
            {(reading.value.max - reading.value.min).toFixed(1)}°C
          </div>
        </div>
      </div>

      {/* Thermal Image Canvas */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full cursor-crosshair"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Overlay */}
        {showOverlay && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Hot spots */}
            {hotSpots.map((spot, index) => (
              <div
                key={index}
                className="absolute w-4 h-4 border-2 border-yellow-400 rounded-full"
                style={{
                  left: `${(spot.x / reading.value.matrix[0].length) * 100}%`,
                  top: `${(spot.y / reading.value.matrix.length) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-yellow-400 text-xs px-1 rounded whitespace-nowrap">
                  {spot.temp.toFixed(1)}°C
                </div>
              </div>
            ))}

            {/* Selected spot */}
            {selectedSpot && (
              <div
                className="absolute w-6 h-6 border-2 border-white rounded-full"
                style={{
                  left: `${(selectedSpot.x / reading.value.matrix[0].length) * 100}%`,
                  top: `${(selectedSpot.y / reading.value.matrix.length) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-1 rounded whitespace-nowrap">
                  {selectedSpot.temp.toFixed(1)}°C
                </div>
              </div>
            )}

            {/* Temperature scale */}
            <div className="absolute right-4 top-4 bottom-4 w-8">
              <div 
                className="w-full h-full rounded"
                style={{
                  background: `linear-gradient(to bottom, ${
                    thermalPalettes[selectedPalette].map(stop => 
                      `rgb(${stop.color.join(',')}) ${(1 - stop.pos) * 100}%`
                    ).join(', ')
                  })`
                }}
              />
              <div className="absolute -right-8 top-0 text-xs text-white">
                {reading.value.max.toFixed(0)}°
              </div>
              <div className="absolute -right-8 bottom-0 text-xs text-white">
                {reading.value.min.toFixed(0)}°
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hot Spot Analysis */}
      {hotSpots.length > 0 && (
        <div className="mt-4 bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-medium text-yellow-400">Hot Spots Detected</h4>
          </div>
          <p className="text-xs text-gray-300">
            {hotSpots.length} areas above {(reading.value.min + (reading.value.max - reading.value.min) * 0.95).toFixed(1)}°C
          </p>
        </div>
      )}
    </div>
  )
}