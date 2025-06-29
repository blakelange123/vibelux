"use client"
import { useEffect, useRef, useState } from 'react'
import { 
  Target,
  BarChart3,
  Crosshair,
  Grid3x3,
  Zap,
  TrendingUp,
  Eye,
  Settings,
  Sun
} from 'lucide-react'

interface Fixture {
  id: string
  x: number
  y: number
  z?: number
  power: number
  ppfd: number
  beamAngle?: number
  photometricData?: {
    ies?: string
    luminousIntensity?: number[][]
    beamDistribution?: 'lambertian' | 'focused' | 'uniform'
  }
  spectrum?: {
    channels: number[]
    wavelengths: number[]
  }
}

interface Room {
  width: number
  length: number
  height: number
  reflectances: {
    ceiling: number
    walls: number
    floor: number
  }
}

interface PPFDPoint {
  x: number
  y: number
  ppfd: number
  uniformity: number
  spectralDistribution: number[]
}

interface AdvancedPPFDMappingProps {
  room: Room
  fixtures: Fixture[]
  resolution?: number
  showUniformityMap?: boolean
  showSpectralMap?: boolean
  targetPPFD?: number
  workingPlaneHeight?: number
  onPointSelect?: (point: PPFDPoint) => void
}

export function AdvancedPPFDMapping({
  room,
  fixtures,
  resolution = 100,
  showUniformityMap = false,
  showSpectralMap = false,
  targetPPFD = 400,
  workingPlaneHeight = 0.8,
  onPointSelect
}: AdvancedPPFDMappingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ppfdGrid, setPpfdGrid] = useState<PPFDPoint[][]>([])
  const [stats, setStats] = useState({
    minPPFD: 0,
    maxPPFD: 0,
    avgPPFD: 0,
    uniformity: 0,
    efficacy: 0,
    totalPower: 0
  })
  const [selectedPoint, setSelectedPoint] = useState<PPFDPoint | null>(null)
  const [viewMode, setViewMode] = useState<'ppfd' | 'uniformity' | 'spectral'>('ppfd')

  // Advanced photometric calculations
  const calculateAdvancedPPFD = () => {
    if (!room?.width || !room?.length) return;
    
    const stepX = room.width / resolution
    const stepY = room.length / resolution
    const newGrid: PPFDPoint[][] = []
    const allValues: number[] = []

    for (let i = 0; i < resolution; i++) {
      const row: PPFDPoint[] = []
      for (let j = 0; j < resolution; j++) {
        const x = j * stepX + stepX / 2
        const y = i * stepY + stepY / 2
        let totalPPFD = 0
        let totalDirectPPFD = 0
        const spectralDistribution = new Array(31).fill(0) // 400-700nm in 10nm steps

        fixtures.forEach(fixture => {
          const fixtureHeight = fixture.z || room.height * 0.9
          const distance3D = Math.sqrt(
            Math.pow(x - fixture.x, 2) + 
            Math.pow(y - fixture.y, 2) + 
            Math.pow(fixtureHeight - workingPlaneHeight, 2)
          )

          if (distance3D > 0) {
            // Calculate angle from fixture to point
            const verticalDistance = fixtureHeight - workingPlaneHeight
            const horizontalDistance = Math.sqrt(
              Math.pow(x - fixture.x, 2) + Math.pow(y - fixture.y, 2)
            )
            const angle = Math.atan2(horizontalDistance, verticalDistance)
            const cosAngle = Math.cos(angle)

            // Advanced beam distribution calculation
            let beamIntensity = 1
            const beamAngle = (fixture.beamAngle || 120) * Math.PI / 180
            
            if (fixture.photometricData?.beamDistribution === 'lambertian') {
              beamIntensity = Math.pow(cosAngle, 1)
            } else if (fixture.photometricData?.beamDistribution === 'focused') {
              beamIntensity = angle <= beamAngle / 2 ? Math.pow(cosAngle, 3) : 0
            } else { // uniform or default
              beamIntensity = angle <= beamAngle / 2 ? cosAngle : 0
            }

            // Direct illumination (inverse square law with beam pattern)
            const directPPFD = (fixture.ppfd || 400) * beamIntensity * Math.pow(cosAngle, 2) / Math.pow(distance3D, 2)
            totalDirectPPFD += directPPFD

            // Inter-reflected illumination (simplified)
            const reflectedPPFD = calculateInterReflection(x, y, fixture, room) * 0.1
            
            const pointPPFD = directPPFD + reflectedPPFD
            totalPPFD += pointPPFD

            // Spectral distribution calculation
            if (fixture.spectrum) {
              fixture.spectrum.channels.forEach((intensity, channelIndex) => {
                const wavelengthIndex = Math.floor((fixture.spectrum!.wavelengths[channelIndex] - 400) / 10)
                if (wavelengthIndex >= 0 && wavelengthIndex < 31) {
                  spectralDistribution[wavelengthIndex] += pointPPFD * (intensity / 100)
                }
              })
            } else {
              // Default white spectrum distribution
              for (let k = 0; k < 31; k++) {
                spectralDistribution[k] += pointPPFD / 31
              }
            }
          }
        })

        const point: PPFDPoint = {
          x,
          y,
          ppfd: totalPPFD,
          uniformity: 0, // Will be calculated after grid completion
          spectralDistribution
        }

        row.push(point)
        allValues.push(totalPPFD)
      }
      newGrid.push(row)
    }

    // Calculate uniformity for each point
    const avgPPFD = allValues.reduce((sum, val) => sum + val, 0) / allValues.length
    const minPPFD = Math.min(...allValues)
    const maxPPFD = Math.max(...allValues)

    newGrid.forEach(row => {
      row.forEach(point => {
        // Local uniformity (9-point average around each point)
        let localSum = 0
        let localCount = 0
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            const ni = Math.floor((point.y / stepY) + di)
            const nj = Math.floor((point.x / stepX) + dj)
            if (ni >= 0 && ni < resolution && nj >= 0 && nj < resolution) {
              localSum += newGrid[ni][nj].ppfd
              localCount++
            }
          }
        }
        const localAvg = localSum / localCount
        point.uniformity = localCount > 0 ? (minPPFD / localAvg) : 0
      })
    })

    const totalPower = fixtures.reduce((sum, f) => sum + f.power, 0)
    const uniformityRatio = minPPFD / avgPPFD
    const efficacy = totalPower > 0 ? (avgPPFD * room.width * room.length) / totalPower : 0

    setStats({
      minPPFD,
      maxPPFD,
      avgPPFD,
      uniformity: uniformityRatio,
      efficacy,
      totalPower
    })

    setPpfdGrid(newGrid)
  }

  const calculateInterReflection = (x: number, y: number, fixture: Fixture, room: Room): number => {
    // Simplified inter-reflection calculation using flux transfer method
    const fixtureHeight = fixture.z || room.height * 0.9
    const ceilingReflectance = room.reflectances.ceiling
    const wallReflectance = room.reflectances.walls
    
    // Calculate view factors to surfaces
    const distanceToFixture = Math.sqrt(
      Math.pow(x - fixture.x, 2) + 
      Math.pow(y - fixture.y, 2) + 
      Math.pow(fixtureHeight - workingPlaneHeight, 2)
    )

    // Simplified: assume 10% of direct light bounces once from ceiling
    const reflectedFlux = (fixture.ppfd || 400) * ceilingReflectance * 0.1
    return reflectedFlux / (4 * Math.PI * Math.pow(distanceToFixture, 2))
  }

  const drawPPFDMap = () => {
    const canvas = canvasRef.current
    if (!canvas || ppfdGrid.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    const scaleX = width / room.width
    const scaleY = height / room.length

    // Draw PPFD grid
    ppfdGrid.forEach((row, i) => {
      row.forEach((point, j) => {
        let value = 0
        let colorScale = ''

        if (viewMode === 'ppfd') {
          value = Math.min(point.ppfd / (stats.maxPPFD || 1000), 1)
          colorScale = 'ppfd'
        } else if (viewMode === 'uniformity') {
          value = point.uniformity
          colorScale = 'uniformity'
        } else if (viewMode === 'spectral') {
          // Show dominant wavelength as color
          const maxSpectralIndex = point.spectralDistribution.indexOf(Math.max(...point.spectralDistribution))
          const wavelength = 400 + maxSpectralIndex * 10
          value = wavelength / 700 // Normalize
          colorScale = 'spectral'
        }

        const color = getColorForValue(value, colorScale)
        
        ctx.fillStyle = color
        ctx.fillRect(
          j * (width / resolution),
          i * (height / resolution),
          width / resolution + 1,
          height / resolution + 1
        )
      })
    })

    // Draw fixtures
    fixtures.forEach((fixture, index) => {
      const x = fixture.x * scaleX
      const y = fixture.y * scaleY
      
      ctx.fillStyle = '#FFD700'
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 2
      
      const fixtureSize = 12
      ctx.fillRect(x - fixtureSize/2, y - fixtureSize/2, fixtureSize, fixtureSize)
      ctx.strokeRect(x - fixtureSize/2, y - fixtureSize/2, fixtureSize, fixtureSize)
      
      // Draw beam angle
      const beamAngle = (fixture.beamAngle || 120) * Math.PI / 180
      const fixtureHeight = fixture.z || room.height * 0.9
      const beamRadius = (fixtureHeight - workingPlaneHeight) * Math.tan(beamAngle / 2) * scaleX
      
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(x, y, beamRadius, 0, 2 * Math.PI)
      ctx.stroke()
      
      // Label
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '12px Inter'
      ctx.fillText(`F${index + 1}`, x + 8, y - 8)
    })

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width
      const y = (i / 10) * height
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw target PPFD contour lines
    if (targetPPFD > 0 && viewMode === 'ppfd') {
      ctx.strokeStyle = '#EF4444'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      // Simple contour approximation
      ppfdGrid.forEach((row, i) => {
        row.forEach((point, j) => {
          if (Math.abs(point.ppfd - targetPPFD) < targetPPFD * 0.1) {
            ctx.strokeRect(
              j * (width / resolution),
              i * (height / resolution),
              width / resolution,
              height / resolution
            )
          }
        })
      })
      ctx.setLineDash([])
    }
  }

  const getColorForValue = (value: number, scale: string): string => {
    if (scale === 'ppfd') {
      // Blue -> Green -> Yellow -> Red scale
      if (value < 0.25) {
        const t = value / 0.25
        return `rgb(${Math.floor(t * 255)}, 0, ${Math.floor((1 - t) * 255)})`
      } else if (value < 0.5) {
        const t = (value - 0.25) / 0.25
        return `rgb(0, ${Math.floor(t * 255)}, ${Math.floor((1 - t) * 255)})`
      } else if (value < 0.75) {
        const t = (value - 0.5) / 0.25
        return `rgb(${Math.floor(t * 255)}, 255, 0)`
      } else {
        const t = (value - 0.75) / 0.25
        return `rgb(255, ${Math.floor((1 - t) * 255)}, 0)`
      }
    } else if (scale === 'uniformity') {
      // Green for good uniformity, red for poor
      const r = Math.floor((1 - value) * 255)
      const g = Math.floor(value * 255)
      return `rgb(${r}, ${g}, 0)`
    } else if (scale === 'spectral') {
      // Spectral color representation
      const wavelength = 400 + value * 300
      return wavelengthToRGB(wavelength)
    }
    return 'rgb(128, 128, 128)'
  }

  const wavelengthToRGB = (wavelength: number): string => {
    let r = 0, g = 0, b = 0
    
    if (wavelength >= 400 && wavelength < 410) {
      r = -(wavelength - 410) / (410 - 400)
      g = 0
      b = 1
    } else if (wavelength >= 410 && wavelength < 475) {
      r = 0
      g = (wavelength - 410) / (475 - 410)
      b = 1
    } else if (wavelength >= 475 && wavelength < 510) {
      r = 0
      g = 1
      b = -(wavelength - 510) / (510 - 475)
    } else if (wavelength >= 510 && wavelength < 580) {
      r = (wavelength - 510) / (580 - 510)
      g = 1
      b = 0
    } else if (wavelength >= 580 && wavelength < 645) {
      r = 1
      g = -(wavelength - 645) / (645 - 580)
      b = 0
    } else if (wavelength >= 645 && wavelength < 781) {
      r = 1
      g = 0
      b = 0
    }

    return `rgb(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)})`
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas || ppfdGrid.length === 0) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * room.width
    const y = ((e.clientY - rect.top) / rect.height) * room.length

    const gridX = Math.floor((x / room.width) * resolution)
    const gridY = Math.floor((y / room.length) * resolution)

    if (gridY >= 0 && gridY < ppfdGrid.length && gridX >= 0 && gridX < ppfdGrid[0].length) {
      const point = ppfdGrid[gridY][gridX]
      setSelectedPoint(point)
      onPointSelect?.(point)
    }
  }

  useEffect(() => {
    calculateAdvancedPPFD()
  }, [room, fixtures, resolution, workingPlaneHeight])

  useEffect(() => {
    drawPPFDMap()
  }, [ppfdGrid, viewMode, targetPPFD])

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Advanced PPFD Analysis</h3>
          <div className="flex gap-2">
            {[
              { id: 'ppfd', label: 'PPFD', icon: Sun },
              { id: 'uniformity', label: 'Uniformity', icon: Grid3x3 },
              { id: 'spectral', label: 'Spectral', icon: BarChart3 }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
                  viewMode === mode.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <mode.icon className="w-3 h-3" />
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400 text-xs">Min PPFD</div>
            <div className="text-white font-semibold">{stats.minPPFD.toFixed(0)}</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400 text-xs">Avg PPFD</div>
            <div className="text-white font-semibold">{stats.avgPPFD.toFixed(0)}</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400 text-xs">Max PPFD</div>
            <div className="text-white font-semibold">{stats.maxPPFD.toFixed(0)}</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400 text-xs">Uniformity</div>
            <div className="text-white font-semibold">{(stats.uniformity * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400 text-xs">Efficacy</div>
            <div className="text-white font-semibold">{stats.efficacy.toFixed(1)} μmol/J</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400 text-xs">Total Power</div>
            <div className="text-white font-semibold">{stats.totalPower.toFixed(0)}W</div>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
        />

        {/* Color Scale Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-300 mb-2">
            {viewMode === 'ppfd' && 'PPFD (μmol/m²/s)'}
            {viewMode === 'uniformity' && 'Uniformity Ratio'}
            {viewMode === 'spectral' && 'Dominant Wavelength'}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-20 h-4 rounded ${
              viewMode === 'ppfd' ? 'bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500' :
              viewMode === 'uniformity' ? 'bg-gradient-to-r from-red-500 to-green-500' :
              'bg-gradient-to-r from-violet-500 via-blue-500 via-green-500 via-yellow-500 to-red-500'
            }`}></div>
            <div className="text-xs text-gray-400">
              {viewMode === 'ppfd' && `0 → ${stats.maxPPFD.toFixed(0)}`}
              {viewMode === 'uniformity' && '0 → 100%'}
              {viewMode === 'spectral' && '400 → 700nm'}
            </div>
          </div>
        </div>

        {/* Selected Point Info */}
        {selectedPoint && (
          <div className="absolute top-4 right-4 bg-gray-800 rounded-lg p-3 min-w-48">
            <div className="text-sm text-white font-semibold mb-2">Point Analysis</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Position:</span>
                <span className="text-white">{selectedPoint.x.toFixed(1)}, {selectedPoint.y.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">PPFD:</span>
                <span className="text-white">{selectedPoint.ppfd.toFixed(0)} μmol/m²/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uniformity:</span>
                <span className="text-white">{(selectedPoint.uniformity * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">vs Target:</span>
                <span className={selectedPoint.ppfd >= targetPPFD ? 'text-green-400' : 'text-red-400'}>
                  {((selectedPoint.ppfd / targetPPFD - 1) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}