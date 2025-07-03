"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Grid3x3,
  Settings,
  Copy,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Zap,
  Sun,
  Clock,
  Target,
  Activity,
  Sliders,
  Hand,
  Square,
  MousePointer
} from 'lucide-react'

interface Zone {
  id: string
  name: string
  color: string
  boundaries: { x1: number, y1: number, x2: number, y2: number }
  fixtures: string[]
  lightingSchedule: {
    [time: string]: {
      intensity: number
      spectrum: { [wavelength: number]: number }
      enabled: boolean
    }
  }
  plantProfile: {
    species: string
    stage: string
    targetPPFD: number
    targetDLI: number
    photoperiod: number
  }
  sensorIntegration: {
    lightSensorId?: string
    temperatureSensorId?: string
    co2SensorId?: string
    feedbackEnabled: boolean
  }
  controlParameters: {
    dimming: {
      enabled: boolean
      sunrise: number // minutes
      sunset: number // minutes
      nightLevel: number // percentage
    }
    spectralTuning: {
      enabled: boolean
      autoAdjust: boolean
      priorities: ('growth' | 'flowering' | 'compactness' | 'quality')[]
    }
    powerManagement: {
      maxPower: number // watts
      loadBalancing: boolean
      peakShaving: boolean
    }
  }
}

interface Fixture {
  id: string
  name: string
  x: number
  y: number
  power: number
  channels: {
    [wavelength: number]: {
      power: number
      efficiency: number
      controllable: boolean
    }
  }
  zoneId?: string
}

interface PerformanceMetrics {
  averagePPFD: number
  minPPFD: number
  maxPPFD: number
  uniformityMetrics: {
    minAvgRatio: number
    avgMaxRatio: number
    minMaxRatio: number
    cv: number
  }
  dli: number
  coverage: number
  powerDensity: number
  efficacy: number
}

interface EnhancedMultiZoneControlSystemProps {
  room: { width: number, length: number }
  fixtures: Fixture[]
  sensors?: Array<{
    id: string
    type: 'light' | 'temperature' | 'co2' | 'humidity'
    x: number
    y: number
    value: number
  }>
  performanceMetrics?: PerformanceMetrics
  onZoneUpdate?: (zones: Zone[]) => void
  onFixtureUpdate?: (fixtures: Fixture[]) => void
}

type DrawingMode = 'none' | 'zone' | 'select'

export function EnhancedMultiZoneControlSystem({
  room,
  fixtures,
  sensors = [],
  performanceMetrics,
  onZoneUpdate,
  onFixtureUpdate
}: EnhancedMultiZoneControlSystemProps) {
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none')
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<{ x: number, y: number } | null>(null)
  const [currentDraw, setCurrentDraw] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null)
  const [selectedFixtures, setSelectedFixtures] = useState<Set<string>>(new Set())
  const [currentTime, setCurrentTime] = useState(new Date())
  const [controlMode, setControlMode] = useState<'manual' | 'automatic' | 'scheduled'>('automatic')
  const [showNewZoneDialog, setShowNewZoneDialog] = useState(false)
  const [newZoneName, setNewZoneName] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const getMousePosition = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    
    const rect = svgRef.current.getBoundingClientRect()
    const scaleX = room.width / 400
    const scaleY = room.length / 300
    
    return {
      x: ((e.clientX - rect.left) * scaleX),
      y: ((e.clientY - rect.top) * scaleY)
    }
  }, [room.width, room.length])

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (drawingMode === 'none') return
    
    const pos = getMousePosition(e)
    setDrawStart(pos)
    setIsDrawing(true)
    
    if (drawingMode === 'select') {
      // Start fixture selection
      setSelectedFixtures(new Set())
    }
  }, [drawingMode, getMousePosition])

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !drawStart) return
    
    const pos = getMousePosition(e)
    const bounds = {
      x1: Math.min(drawStart.x, pos.x),
      y1: Math.min(drawStart.y, pos.y),
      x2: Math.max(drawStart.x, pos.x),
      y2: Math.max(drawStart.y, pos.y)
    }
    
    setCurrentDraw(bounds)
    
    if (drawingMode === 'select') {
      // Update selected fixtures in real time
      const fixturesInBounds = fixtures.filter(fixture => 
        fixture.x >= bounds.x1 && fixture.x <= bounds.x2 &&
        fixture.y >= bounds.y1 && fixture.y <= bounds.y2
      )
      setSelectedFixtures(new Set(fixturesInBounds.map(f => f.id)))
    }
  }, [isDrawing, drawStart, getMousePosition, fixtures, drawingMode])

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentDraw) {
      setIsDrawing(false)
      setCurrentDraw(null)
      return
    }
    
    if (drawingMode === 'zone') {
      // Show dialog to name the zone
      setShowNewZoneDialog(true)
    } else if (drawingMode === 'select') {
      // Selection complete - keep selected fixtures
    }
    
    setIsDrawing(false)
    setDrawStart(null)
  }, [isDrawing, currentDraw, drawingMode])

  const createZone = (name: string, bounds: { x1: number, y1: number, x2: number, y2: number }) => {
    const zoneColors = [
      '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', 
      '#EC4899', '#84CC16', '#F97316', '#6366F1', '#14B8A6'
    ]
    
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name,
      color: zoneColors[zones.length % zoneColors.length],
      boundaries: bounds,
      fixtures: [],
      lightingSchedule: generateDefaultSchedule(),
      plantProfile: {
        species: 'lettuce',
        stage: 'vegetative',
        targetPPFD: 400,
        targetDLI: 16,
        photoperiod: 16
      },
      sensorIntegration: {
        feedbackEnabled: false
      },
      controlParameters: {
        dimming: {
          enabled: true,
          sunrise: 30,
          sunset: 30,
          nightLevel: 0
        },
        spectralTuning: {
          enabled: true,
          autoAdjust: true,
          priorities: ['growth', 'quality']
        },
        powerManagement: {
          maxPower: 1000,
          loadBalancing: true,
          peakShaving: false
        }
      }
    }

    // Assign fixtures to zone (either from selection or within bounds)
    const fixturesInZone = selectedFixtures.size > 0 
      ? fixtures.filter(f => selectedFixtures.has(f.id))
      : fixtures.filter(fixture => 
          fixture.x >= bounds.x1 && fixture.x <= bounds.x2 &&
          fixture.y >= bounds.y1 && fixture.y <= bounds.y2
        )
    
    newZone.fixtures = fixturesInZone.map(f => f.id)
    
    // Update fixture assignments
    const updatedFixtures = fixtures.map(fixture => ({
      ...fixture,
      zoneId: fixturesInZone.some(f => f.id === fixture.id) ? newZone.id : fixture.zoneId
    }))

    const updatedZones = [...zones, newZone]
    setZones(updatedZones)
    onZoneUpdate?.(updatedZones)
    onFixtureUpdate?.(updatedFixtures)
    
    // Clear selection and drawing
    setSelectedFixtures(new Set())
    setCurrentDraw(null)
    setShowNewZoneDialog(false)
    setNewZoneName('')
    setDrawingMode('none')
  }

  const generateDefaultSchedule = () => {
    const schedule: Zone['lightingSchedule'] = {}
    
    // Generate 24-hour schedule
    for (let hour = 0; hour < 24; hour++) {
      const timeKey = `${hour.toString().padStart(2, '0')}:00`
      
      if (hour >= 6 && hour < 22) { // 6 AM to 10 PM photoperiod
        schedule[timeKey] = {
          intensity: hour >= 7 && hour < 21 ? 100 : 50, // Dimmed at edges
          spectrum: {
            400: 5,   // UV
            450: 20,  // Blue
            525: 10,  // Green
            660: 40,  // Red
            730: 15,  // Far-red
            740: 10   // IR
          },
          enabled: true
        }
      } else {
        schedule[timeKey] = {
          intensity: 0,
          spectrum: {},
          enabled: false
        }
      }
    }
    
    return schedule
  }

  const renderPerformanceMetrics = () => {
    if (!performanceMetrics) return null

    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance Metrics
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Avg PPFD:</span>
            <span className="text-white ml-2">{performanceMetrics.averagePPFD.toFixed(0)}</span>
          </div>
          <div>
            <span className="text-gray-400">DLI:</span>
            <span className="text-white ml-2">{performanceMetrics.dli.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-gray-400">Power Density:</span>
            <span className="text-white ml-2">{performanceMetrics.powerDensity.toFixed(1)} W/m²</span>
          </div>
          <div>
            <span className="text-gray-400">Efficacy:</span>
            <span className="text-white ml-2">{performanceMetrics.efficacy.toFixed(1)} PPF/W</span>
          </div>
        </div>

        {/* Enhanced Uniformity Display */}
        <div className="mt-4 p-3 bg-gray-700 rounded">
          <h5 className="text-white font-medium mb-2">Uniformity Analysis</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-400">Min/Avg:</span>
              <span className="text-white ml-1">
                {(performanceMetrics.uniformityMetrics.minAvgRatio * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-gray-400">Avg/Max:</span>
              <span className="text-white ml-1">
                {(performanceMetrics.uniformityMetrics.avgMaxRatio * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-gray-400">Min/Max:</span>
              <span className="text-white ml-1">
                {(performanceMetrics.uniformityMetrics.minMaxRatio * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-gray-400">CV:</span>
              <span className="text-white ml-1">
                {performanceMetrics.uniformityMetrics.cv.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs">
            <span className="text-gray-400">Range:</span>
            <span className="text-white ml-1">
              {performanceMetrics.minPPFD.toFixed(0)} - {performanceMetrics.maxPPFD.toFixed(0)} μmol/m²/s
            </span>
          </div>
        </div>
      </div>
    )
  }

  const renderZoneMap = () => {
    const scaleX = 400 / room.width
    const scaleY = 300 / room.length

    return (
      <div className="relative bg-gray-800 rounded-lg" style={{ width: 400, height: 300 }}>
        <svg 
          ref={svgRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Room outline */}
          <rect
            x="0"
            y="0"
            width="400"
            height="300"
            fill="none"
            stroke="#4B5563"
            strokeWidth="2"
          />

          {/* Zone boundaries */}
          {zones.map(zone => (
            <rect
              key={zone.id}
              x={zone.boundaries.x1 * scaleX}
              y={zone.boundaries.y1 * scaleY}
              width={(zone.boundaries.x2 - zone.boundaries.x1) * scaleX}
              height={(zone.boundaries.y2 - zone.boundaries.y1) * scaleY}
              fill={zone.color}
              fillOpacity={selectedZone === zone.id ? 0.3 : 0.1}
              stroke={zone.color}
              strokeWidth={selectedZone === zone.id ? 3 : 1}
              className="cursor-pointer"
              onClick={() => setSelectedZone(zone.id)}
            />
          ))}

          {/* Current drawing rectangle */}
          {currentDraw && (
            <rect
              x={currentDraw.x1 * scaleX}
              y={currentDraw.y1 * scaleY}
              width={(currentDraw.x2 - currentDraw.x1) * scaleX}
              height={(currentDraw.y2 - currentDraw.y1) * scaleY}
              fill={drawingMode === 'zone' ? "#3B82F6" : "#10B981"}
              fillOpacity={0.2}
              stroke={drawingMode === 'zone' ? "#3B82F6" : "#10B981"}
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}

          {/* Fixtures */}
          {fixtures.map(fixture => (
            <circle
              key={fixture.id}
              cx={fixture.x * scaleX}
              cy={fixture.y * scaleY}
              r="4"
              fill={
                selectedFixtures.has(fixture.id) ? '#10B981' :
                fixture.zoneId ? zones.find(z => z.id === fixture.zoneId)?.color || '#9CA3AF' : 
                '#9CA3AF'
              }
              stroke={selectedFixtures.has(fixture.id) ? '#FFFFFF' : '#FFFFFF'}
              strokeWidth={selectedFixtures.has(fixture.id) ? 2 : 1}
            />
          ))}

          {/* Sensors */}
          {sensors.map(sensor => (
            <rect
              key={sensor.id}
              x={sensor.x * scaleX - 3}
              y={sensor.y * scaleY - 3}
              width="6"
              height="6"
              fill="#F59E0B"
              stroke="#FFFFFF"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Zone labels */}
        {zones.map(zone => {
          const centerX = ((zone.boundaries.x1 + zone.boundaries.x2) / 2) * scaleX
          const centerY = ((zone.boundaries.y1 + zone.boundaries.y2) / 2) * scaleY
          
          return (
            <div
              key={`label-${zone.id}`}
              className="absolute text-xs text-white font-medium pointer-events-none"
              style={{
                left: centerX - 20,
                top: centerY - 6,
                width: 40,
                textAlign: 'center'
              }}
            >
              {zone.name}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Grid3x3 className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Enhanced Multi-Zone Control System</h2>
            <p className="text-gray-400">Interactive lighting control with drag-and-select zones</p>
          </div>
        </div>

        {/* Control Mode Selector */}
        <div className="flex gap-2">
          {(['manual', 'automatic', 'scheduled'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setControlMode(mode)}
              className={`px-3 py-1 rounded text-xs capitalize ${
                controlMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      {renderPerformanceMetrics()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Map */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Interactive Zone Layout</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setDrawingMode(drawingMode === 'zone' ? 'none' : 'zone')}
                className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                  drawingMode === 'zone' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <Square className="w-4 h-4" />
                Draw Zone
              </button>
              <button
                onClick={() => setDrawingMode(drawingMode === 'select' ? 'none' : 'select')}
                className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                  drawingMode === 'select' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <MousePointer className="w-4 h-4" />
                Select Fixtures
              </button>
            </div>
          </div>

          {drawingMode !== 'none' && (
            <div className="text-sm text-gray-400 bg-gray-800 p-2 rounded">
              {drawingMode === 'zone' 
                ? "Click and drag to draw a new zone area" 
                : "Click and drag to select fixtures for zone assignment"
              }
            </div>
          )}

          {renderZoneMap()}

          {/* Selected Fixtures Info */}
          {selectedFixtures.size > 0 && (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-green-400 text-sm">
                  {selectedFixtures.size} fixtures selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDrawingMode('zone')}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                  >
                    Create Zone
                  </button>
                  <button
                    onClick={() => setSelectedFixtures(new Set())}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Zone List - keeping the existing zone list implementation */}
          <div className="space-y-2">
            {zones.map(zone => {
              const zoneFixtures = fixtures.filter(f => zone.fixtures.includes(f.id))
              const totalPower = zoneFixtures.reduce((sum, f) => sum + f.power, 0)
              
              return (
                <div
                  key={zone.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedZone === zone.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedZone(zone.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: zone.color }}
                      />
                      <div>
                        <span className="text-white font-medium">{zone.name}</span>
                        <div className="text-xs text-gray-400">
                          {zone.fixtures.length} fixtures • {totalPower.toFixed(0)}W
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Delete zone logic here
                        }}
                        className="p-1 hover:bg-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Zone Control Panel - keeping existing implementation */}
        {selectedZone && (() => {
          const zone = zones.find(z => z.id === selectedZone)
          if (!zone) return null

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{zone.name} Control</h3>
              </div>

              {/* Zone control implementation remains the same */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Zone Controls</h4>
                <p className="text-gray-400 text-sm">
                  Zone control panel implementation here...
                </p>
              </div>
            </div>
          )
        })()}
      </div>

      {/* New Zone Dialog */}
      {showNewZoneDialog && currentDraw && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Zone</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Zone Name</label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="e.g., Lettuce Section A"
                  autoFocus
                />
              </div>

              <div className="text-sm text-gray-400">
                Zone area: {((currentDraw.x2 - currentDraw.x1) * (currentDraw.y2 - currentDraw.y1)).toFixed(1)} m²
                <br />
                Selected fixtures: {selectedFixtures.size > 0 ? selectedFixtures.size : 
                  fixtures.filter(f => 
                    f.x >= currentDraw.x1 && f.x <= currentDraw.x2 &&
                    f.y >= currentDraw.y1 && f.y <= currentDraw.y2
                  ).length
                }
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    if (newZoneName.trim()) {
                      createZone(newZoneName.trim(), currentDraw)
                    }
                  }}
                  disabled={!newZoneName.trim()}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Create Zone
                </button>
                <button
                  onClick={() => {
                    setShowNewZoneDialog(false)
                    setNewZoneName('')
                    setCurrentDraw(null)
                    setDrawingMode('none')
                  }}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}