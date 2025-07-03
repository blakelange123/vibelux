"use client"
import { useState, useEffect } from 'react'
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
  Sliders
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

interface MultiZoneControlSystemProps {
  room: { width: number, length: number }
  fixtures: Fixture[]
  sensors?: Array<{
    id: string
    type: 'light' | 'temperature' | 'co2' | 'humidity'
    x: number
    y: number
    value: number
  }>
  onZoneUpdate: (zones: Zone[]) => void
  onFixtureUpdate: (fixtures: Fixture[]) => void
}

export function MultiZoneControlSystem({
  room,
  fixtures,
  sensors = [],
  onZoneUpdate,
  onFixtureUpdate
}: MultiZoneControlSystemProps) {
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [isCreatingZone, setIsCreatingZone] = useState(false)
  const [newZoneBounds, setNewZoneBounds] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [controlMode, setControlMode] = useState<'manual' | 'automatic' | 'scheduled'>('automatic')

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

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

    // Assign fixtures to zone
    const fixturesInZone = fixtures.filter(fixture => 
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
    onZoneUpdate(updatedZones)
    onFixtureUpdate(updatedFixtures)
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

  const updateZoneSchedule = (zoneId: string, time: string, updates: Partial<Zone['lightingSchedule'][string]>) => {
    const updatedZones = zones.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          lightingSchedule: {
            ...zone.lightingSchedule,
            [time]: {
              ...zone.lightingSchedule[time],
              ...updates
            }
          }
        }
      }
      return zone
    })
    
    setZones(updatedZones)
    onZoneUpdate(updatedZones)
  }

  const updateZoneSpectrum = (zoneId: string, wavelength: number, value: number) => {
    const currentHour = currentTime.getHours()
    const timeKey = `${currentHour.toString().padStart(2, '0')}:00`
    
    const updatedZones = zones.map(zone => {
      if (zone.id === zoneId) {
        const currentSchedule = zone.lightingSchedule[timeKey] || {
          intensity: 100,
          spectrum: {},
          enabled: true
        }
        
        return {
          ...zone,
          lightingSchedule: {
            ...zone.lightingSchedule,
            [timeKey]: {
              ...currentSchedule,
              spectrum: {
                ...currentSchedule.spectrum,
                [wavelength]: value
              }
            }
          }
        }
      }
      return zone
    })
    
    setZones(updatedZones)
    onZoneUpdate(updatedZones)
  }

  const copyZoneSettings = (sourceZoneId: string, targetZoneId: string) => {
    const sourceZone = zones.find(z => z.id === sourceZoneId)
    if (!sourceZone) return

    const updatedZones = zones.map(zone => {
      if (zone.id === targetZoneId) {
        return {
          ...zone,
          lightingSchedule: { ...sourceZone.lightingSchedule },
          plantProfile: { ...sourceZone.plantProfile },
          controlParameters: { ...sourceZone.controlParameters }
        }
      }
      return zone
    })
    
    setZones(updatedZones)
    onZoneUpdate(updatedZones)
  }

  const deleteZone = (zoneId: string) => {
    const updatedZones = zones.filter(z => z.id !== zoneId)
    
    // Remove zone assignment from fixtures
    const updatedFixtures = fixtures.map(fixture => ({
      ...fixture,
      zoneId: fixture.zoneId === zoneId ? undefined : fixture.zoneId
    }))

    setZones(updatedZones)
    setSelectedZone(null)
    onZoneUpdate(updatedZones)
    onFixtureUpdate(updatedFixtures)
  }

  const getCurrentZoneValues = (zone: Zone) => {
    const currentHour = currentTime.getHours()
    const timeKey = `${currentHour.toString().padStart(2, '0')}:00`
    const currentSchedule = zone.lightingSchedule[timeKey]
    
    if (!currentSchedule || !currentSchedule.enabled) {
      return { intensity: 0, spectrum: {}, totalPower: 0 }
    }

    const zoneFixtures = fixtures.filter(f => zone.fixtures.includes(f.id))
    const totalPower = zoneFixtures.reduce((sum, f) => sum + f.power, 0) * (currentSchedule.intensity / 100)

    return {
      intensity: currentSchedule.intensity,
      spectrum: currentSchedule.spectrum,
      totalPower
    }
  }

  const renderZoneMap = () => {
    const scaleX = 400 / room.width
    const scaleY = 300 / room.length

    return (
      <div className="relative bg-gray-800 rounded-lg" style={{ width: 400, height: 300 }}>
        <svg className="absolute inset-0 w-full h-full">
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

          {/* Fixtures */}
          {fixtures.map(fixture => (
            <circle
              key={fixture.id}
              cx={fixture.x * scaleX}
              cy={fixture.y * scaleY}
              r="4"
              fill={fixture.zoneId ? 
                zones.find(z => z.id === fixture.zoneId)?.color || '#9CA3AF' : 
                '#9CA3AF'
              }
              stroke="#FFFFFF"
              strokeWidth="1"
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
            <h2 className="text-xl font-bold text-white">Multi-Zone Control System</h2>
            <p className="text-gray-400">Independent lighting control for different growing areas</p>
          </div>
        </div>

        {/* Control Mode Selector */}
        <div className="flex gap-2">
          {['manual', 'automatic', 'scheduled'].map(mode => (
            <button
              key={mode}
              onClick={() => setControlMode(mode as any)}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Map */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Zone Layout</h3>
            <button
              onClick={() => setIsCreatingZone(true)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Zone
            </button>
          </div>

          {renderZoneMap()}

          {/* Zone List */}
          <div className="space-y-2">
            {zones.map(zone => {
              const currentValues = getCurrentZoneValues(zone)
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
                          {zone.fixtures.length} fixtures • {currentValues.totalPower.toFixed(0)}W
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">
                        {currentValues.intensity}%
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        currentValues.intensity > 0 ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Zone Control Panel */}
        {selectedZone && (() => {
          const zone = zones.find(z => z.id === selectedZone)
          if (!zone) return null

          const currentValues = getCurrentZoneValues(zone)
          const currentHour = currentTime.getHours()
          const timeKey = `${currentHour.toString().padStart(2, '0')}:00`

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{zone.name} Control</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const sourceId = prompt('Copy settings from zone ID:')
                      if (sourceId) copyZoneSettings(sourceId, zone.id)
                    }}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteZone(zone.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Current Status
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Intensity:</span>
                    <span className="text-white ml-2">{currentValues.intensity}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Power:</span>
                    <span className="text-white ml-2">{currentValues.totalPower.toFixed(0)}W</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Fixtures:</span>
                    <span className="text-white ml-2">{zone.fixtures.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Target PPFD:</span>
                    <span className="text-white ml-2">{zone.plantProfile.targetPPFD}</span>
                  </div>
                </div>
              </div>

              {/* Manual Controls */}
              {controlMode === 'manual' && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    Manual Control
                  </h4>
                  
                  {/* Intensity Control */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">
                      Intensity: {currentValues.intensity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentValues.intensity}
                      onChange={(e) => updateZoneSchedule(zone.id, timeKey, { 
                        intensity: parseInt(e.target.value) 
                      })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Spectrum Controls */}
                  <div className="space-y-3">
                    <span className="text-sm text-gray-400">Spectrum Control</span>
                    {Object.entries(currentValues.spectrum).map(([wavelength, value]) => (
                      <div key={wavelength} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-12">{wavelength}nm</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={value}
                          onChange={(e) => updateZoneSpectrum(zone.id, parseInt(wavelength), parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-white w-8">{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule Display */}
              {controlMode === 'scheduled' && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    24-Hour Schedule
                  </h4>
                  
                  <div className="grid grid-cols-6 gap-1 text-xs">
                    {Object.entries(zone.lightingSchedule).map(([time, schedule]) => (
                      <div
                        key={time}
                        className={`p-1 rounded text-center ${
                          schedule.enabled
                            ? `bg-opacity-${Math.floor(schedule.intensity / 10) * 10}`
                            : 'bg-gray-700'
                        }`}
                        style={{
                          backgroundColor: schedule.enabled
                            ? `${zone.color}${Math.floor(schedule.intensity / 100 * 255).toString(16).padStart(2, '0')}`
                            : undefined
                        }}
                      >
                        <div className="text-white">{time.split(':')[0]}</div>
                        <div className="text-gray-300">{schedule.intensity}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Plant Profile */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Plant Profile
                </h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-400 mb-1">Species</label>
                    <select
                      value={zone.plantProfile.species}
                      onChange={(e) => {
                        const updatedZones = zones.map(z => 
                          z.id === zone.id 
                            ? { ...z, plantProfile: { ...z.plantProfile, species: e.target.value } }
                            : z
                        )
                        setZones(updatedZones)
                        onZoneUpdate(updatedZones)
                      }}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                    >
                      <option value="lettuce">Lettuce</option>
                      <option value="basil">Basil</option>
                      <option value="tomato">Tomato</option>
                      <option value="cannabis">Cannabis</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-1">Growth Stage</label>
                    <select
                      value={zone.plantProfile.stage}
                      onChange={(e) => {
                        const updatedZones = zones.map(z => 
                          z.id === zone.id 
                            ? { ...z, plantProfile: { ...z.plantProfile, stage: e.target.value } }
                            : z
                        )
                        setZones(updatedZones)
                        onZoneUpdate(updatedZones)
                      }}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                    >
                      <option value="seedling">Seedling</option>
                      <option value="vegetative">Vegetative</option>
                      <option value="flowering">Flowering</option>
                      <option value="harvest">Harvest</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Target PPFD</label>
                    <input
                      type="number"
                      value={zone.plantProfile.targetPPFD}
                      onChange={(e) => {
                        const updatedZones = zones.map(z => 
                          z.id === zone.id 
                            ? { ...z, plantProfile: { ...z.plantProfile, targetPPFD: parseInt(e.target.value) } }
                            : z
                        )
                        setZones(updatedZones)
                        onZoneUpdate(updatedZones)
                      }}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Photoperiod (hrs)</label>
                    <input
                      type="number"
                      value={zone.plantProfile.photoperiod}
                      onChange={(e) => {
                        const updatedZones = zones.map(z => 
                          z.id === zone.id 
                            ? { ...z, plantProfile: { ...z.plantProfile, photoperiod: parseInt(e.target.value) } }
                            : z
                        )
                        setZones(updatedZones)
                        onZoneUpdate(updatedZones)
                      }}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Create Zone Modal */}
      {isCreatingZone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Zone</h3>
            
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const name = formData.get('name') as string
                const x1 = Number(formData.get('x1'))
                const y1 = Number(formData.get('y1'))
                const x2 = Number(formData.get('x2'))
                const y2 = Number(formData.get('y2'))
                
                createZone(name, { x1, y1, x2, y2 })
                setIsCreatingZone(false)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-gray-400 mb-1">Zone Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="e.g., Lettuce Section A"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">X1 (m)</label>
                  <input
                    name="x1"
                    type="number"
                    step="0.1"
                    min="0"
                    max={room.width}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Y1 (m)</label>
                  <input
                    name="y1"
                    type="number"
                    step="0.1"
                    min="0"
                    max={room.length}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">X2 (m)</label>
                  <input
                    name="x2"
                    type="number"
                    step="0.1"
                    min="0"
                    max={room.width}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Y2 (m)</label>
                  <input
                    name="y2"
                    type="number"
                    step="0.1"
                    min="0"
                    max={room.length}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Zone
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingZone(false)}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}