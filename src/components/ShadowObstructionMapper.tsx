"use client"

import { useState, useMemo, useEffect, useRef } from 'react'
import { 
  Box,
  Layers,
  SunDim,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Move3D,
  Download,
  Upload,
  Settings,
  AlertTriangle,
  Info,
  Maximize2
} from 'lucide-react'

interface Obstruction {
  id: string
  type: 'wall' | 'beam' | 'duct' | 'pipe' | 'equipment' | 'custom' | 'tomato' | 'cucumber' | 'lettuce' | 'strawberry' | 'cannabis'
  name: string
  position: { x: number; y: number; z: number }
  dimensions: { width: number; height: number; depth: number }
  rotation: { x: number; y: number; z: number }
  opacity: number // 0-1, where 1 is fully opaque
  color: string
  visible: boolean
}

interface ShadowPoint {
  x: number
  y: number
  intensity: number // 0-1, where 0 is full shadow
}

interface LightFixture {
  id: string
  position: { x: number; y: number; z: number }
  beamAngle: number
  intensity: number
  enabled: boolean
}

interface ShadowObstructionMapperProps {
  roomDimensions: { width: number; height: number; depth: number }
  fixtures: LightFixture[]
  canopyHeight: number
  onObstructionsChange?: (obstructions: Obstruction[]) => void
  onShadowMapUpdate?: (shadowMap: ShadowPoint[]) => void
  className?: string
}

const OBSTRUCTION_PRESETS = {
  // Structural elements
  wall: { width: 0.5, height: 10, depth: 10, opacity: 1, color: '#6B7280' },
  beam: { width: 1, height: 1, depth: 10, opacity: 1, color: '#8B5CF6' },
  duct: { width: 2, height: 1, depth: 10, opacity: 0.9, color: '#3B82F6' },
  pipe: { width: 0.5, height: 0.5, depth: 10, opacity: 0.95, color: '#10B981' },
  equipment: { width: 3, height: 4, depth: 3, opacity: 1, color: '#F59E0B' },
  custom: { width: 2, height: 2, depth: 2, opacity: 1, color: '#EF4444' },
  // Plant presets
  tomato: { width: 1.5, height: 6, depth: 1.5, opacity: 0.7, color: '#DC2626' }, // High wire tomatoes
  cucumber: { width: 1.5, height: 7, depth: 1.5, opacity: 0.65, color: '#65A30D' }, // High wire cucumbers
  lettuce: { width: 1, height: 0.5, depth: 1, opacity: 0.4, color: '#22C55E' }, // Leafy greens
  strawberry: { width: 1.2, height: 1, depth: 1.2, opacity: 0.5, color: '#F472B6' }, // Strawberry towers
  cannabis: { width: 2, height: 4, depth: 2, opacity: 0.8, color: '#16A34A' } // Mature cannabis plants
}

export default function ShadowObstructionMapper({
  roomDimensions,
  fixtures,
  canopyHeight,
  onObstructionsChange,
  onShadowMapUpdate,
  className = ''
}: ShadowObstructionMapperProps) {
  const [obstructions, setObstructions] = useState<Obstruction[]>([])
  const [selectedObstruction, setSelectedObstruction] = useState<string | null>(null)
  const [showShadows, setShowShadows] = useState(true)
  const [showObstructions, setShowObstructions] = useState(true)
  const [shadowResolution, setShadowResolution] = useState<'low' | 'medium' | 'high'>('medium')
  const [viewMode, setViewMode] = useState<'top' | 'side' | '3d'>('top')
  const [highlightSevere, setHighlightSevere] = useState(true)

  // Calculate shadow map based on obstructions and fixtures
  const shadowMap = useMemo(() => {
    if (!showShadows || obstructions.length === 0) return []

    const gridSize = shadowResolution === 'high' ? 50 : shadowResolution === 'medium' ? 30 : 20
    const cellWidth = roomDimensions.width / gridSize
    const cellHeight = roomDimensions.height / gridSize
    const shadowPoints: ShadowPoint[] = []

    // For each grid point at canopy height
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const pointX = (x + 0.5) * cellWidth
        const pointY = (y + 0.5) * cellHeight
        let totalLight = 0
        let blockedLight = 0

        // Check light contribution from each fixture
        fixtures.forEach(fixture => {
          if (!fixture.enabled) return

          // Calculate if this point is within the fixture's cone of light
          const dx = pointX - fixture.position.x
          const dy = pointY - fixture.position.y
          const dz = canopyHeight - fixture.position.z
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
          
          // Simple cone calculation
          const angleToPoint = Math.atan2(Math.sqrt(dx * dx + dy * dy), Math.abs(dz)) * 180 / Math.PI
          if (angleToPoint <= fixture.beamAngle / 2) {
            const lightContribution = fixture.intensity / (1 + distance * distance * 0.01)
            totalLight += lightContribution

            // Check if any obstruction blocks this light path
            let blocked = false
            obstructions.forEach(obs => {
              if (!obs.visible) return

              // Simple AABB intersection test
              const rayStart = fixture.position
              const rayEnd = { x: pointX, y: pointY, z: canopyHeight }
              
              // Check if ray intersects obstruction bounding box
              const minX = obs.position.x - obs.dimensions.width / 2
              const maxX = obs.position.x + obs.dimensions.width / 2
              const minY = obs.position.y - obs.dimensions.depth / 2
              const maxY = obs.position.y + obs.dimensions.depth / 2
              const minZ = obs.position.z - obs.dimensions.height / 2
              const maxZ = obs.position.z + obs.dimensions.height / 2

              // Simplified ray-box intersection
              const t0x = Math.min((minX - rayStart.x) / (rayEnd.x - rayStart.x), (maxX - rayStart.x) / (rayEnd.x - rayStart.x))
              const t1x = Math.max((minX - rayStart.x) / (rayEnd.x - rayStart.x), (maxX - rayStart.x) / (rayEnd.x - rayStart.x))
              const t0y = Math.min((minY - rayStart.y) / (rayEnd.y - rayStart.y), (maxY - rayStart.y) / (rayEnd.y - rayStart.y))
              const t1y = Math.max((minY - rayStart.y) / (rayEnd.y - rayStart.y), (maxY - rayStart.y) / (rayEnd.y - rayStart.y))
              const t0z = Math.min((minZ - rayStart.z) / (rayEnd.z - rayStart.z), (maxZ - rayStart.z) / (rayEnd.z - rayStart.z))
              const t1z = Math.max((minZ - rayStart.z) / (rayEnd.z - rayStart.z), (maxZ - rayStart.z) / (rayEnd.z - rayStart.z))

              const tMin = Math.max(t0x, t0y, t0z)
              const tMax = Math.min(t1x, t1y, t1z)

              if (tMin <= tMax && tMin >= 0 && tMin <= 1) {
                blocked = true
                blockedLight += lightContribution * obs.opacity
              }
            })
          }
        })

        const intensity = totalLight > 0 ? Math.max(0, 1 - (blockedLight / totalLight)) : 0
        shadowPoints.push({ x: pointX, y: pointY, intensity })
      }
    }

    return shadowPoints
  }, [obstructions, fixtures, canopyHeight, showShadows, shadowResolution, roomDimensions])

  // Calculate shadow statistics
  const shadowStats = useMemo(() => {
    if (shadowMap.length === 0) return null

    const totalPoints = shadowMap.length
    const shadowedPoints = shadowMap.filter(p => p.intensity < 0.8).length
    const severelyShadowed = shadowMap.filter(p => p.intensity < 0.5).length
    const avgIntensity = shadowMap.reduce((sum, p) => sum + p.intensity, 0) / totalPoints

    return {
      coveragePercent: ((totalPoints - shadowedPoints) / totalPoints) * 100,
      shadowedPercent: (shadowedPoints / totalPoints) * 100,
      severePercent: (severelyShadowed / totalPoints) * 100,
      avgIntensity: avgIntensity * 100
    }
  }, [shadowMap])

  // Add obstruction
  const addObstruction = (type: keyof typeof OBSTRUCTION_PRESETS) => {
    const preset = OBSTRUCTION_PRESETS[type]
    const newObstruction: Obstruction = {
      id: `obs-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${obstructions.length + 1}`,
      position: { 
        x: roomDimensions.width / 2, 
        y: roomDimensions.height / 2, 
        z: roomDimensions.depth / 2 
      },
      dimensions: { 
        width: preset.width, 
        height: preset.height, 
        depth: preset.depth 
      },
      rotation: { x: 0, y: 0, z: 0 },
      opacity: preset.opacity,
      color: preset.color,
      visible: true
    }

    const updated = [...obstructions, newObstruction]
    setObstructions(updated)
    setSelectedObstruction(newObstruction.id)
    onObstructionsChange?.(updated)
  }

  // Update obstruction
  const updateObstruction = (id: string, updates: Partial<Obstruction>) => {
    const updated = obstructions.map(obs => 
      obs.id === id ? { ...obs, ...updates } : obs
    )
    setObstructions(updated)
    onObstructionsChange?.(updated)
  }

  // Delete obstruction
  const deleteObstruction = (id: string) => {
    const updated = obstructions.filter(obs => obs.id !== id)
    setObstructions(updated)
    if (selectedObstruction === id) setSelectedObstruction(null)
    onObstructionsChange?.(updated)
  }

  // Export obstruction data
  const exportObstructions = () => {
    const data = {
      obstructions,
      roomDimensions,
      shadowStats,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shadow-obstructions-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Use ref to track previous shadow map
  const prevShadowMapRef = useRef<typeof shadowMap | undefined>(undefined)
  
  // Update shadow map only when it actually changes
  useEffect(() => {
    // Check if shadow map actually changed by comparing lengths and some sample points
    const hasChanged = !prevShadowMapRef.current || 
      prevShadowMapRef.current.length !== shadowMap.length ||
      (shadowMap.length > 0 && (
        prevShadowMapRef.current[0]?.intensity !== shadowMap[0]?.intensity ||
        prevShadowMapRef.current[Math.floor(shadowMap.length / 2)]?.intensity !== shadowMap[Math.floor(shadowMap.length / 2)]?.intensity
      ))
    
    if (hasChanged && onShadowMapUpdate) {
      onShadowMapUpdate(shadowMap)
      prevShadowMapRef.current = shadowMap
    }
  }, [shadowMap, onShadowMapUpdate])

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg">
            <SunDim className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Shadow & Obstruction Mapping</h3>
            <p className="text-sm text-gray-400">3D visualization of light blockage</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
          >
            <option value="top">Top View</option>
            <option value="side">Side View</option>
            <option value="3d">3D View</option>
          </select>
          <button
            onClick={exportObstructions}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all"
          >
            <Download className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Shadow Statistics */}
      {shadowStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Clear Coverage</p>
            <p className="text-xl font-bold text-green-400">
              {shadowStats.coveragePercent.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Shadowed Area</p>
            <p className="text-xl font-bold text-yellow-400">
              {shadowStats.shadowedPercent.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Severe Shadow</p>
            <p className="text-xl font-bold text-red-400">
              {shadowStats.severePercent.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Avg Intensity</p>
            <p className="text-xl font-bold text-white">
              {shadowStats.avgIntensity.toFixed(0)}%
            </p>
          </div>
        </div>
      )}

      {/* Visualization Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setShowShadows(!showShadows)}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
            showShadows 
              ? 'bg-gray-600/50 border border-gray-500 text-white' 
              : 'bg-gray-700 border border-gray-600 text-gray-400'
          }`}
        >
          {showShadows ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Shadows
        </button>
        
        <button
          onClick={() => setShowObstructions(!showObstructions)}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
            showObstructions 
              ? 'bg-gray-600/50 border border-gray-500 text-white' 
              : 'bg-gray-700 border border-gray-600 text-gray-400'
          }`}
        >
          {showObstructions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Obstructions
        </button>

        <button
          onClick={() => setHighlightSevere(!highlightSevere)}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
            highlightSevere 
              ? 'bg-red-600/20 border border-red-600/50 text-red-400' 
              : 'bg-gray-700 border border-gray-600 text-gray-400'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Highlight Severe
        </button>
      </div>

      {/* Shadow Resolution */}
      <div className="mb-6">
        <label className="text-sm font-medium text-white mb-2 block">Shadow Resolution</label>
        <div className="flex gap-2">
          {(['low', 'medium', 'high'] as const).map((res) => (
            <button
              key={res}
              onClick={() => setShadowResolution(res)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                shadowResolution === res
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {res.charAt(0).toUpperCase() + res.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Add Obstruction Buttons */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-white mb-3">Add Structural Elements</h4>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(['wall', 'beam', 'duct', 'pipe', 'equipment', 'custom'] as const).map((type) => (
            <button
              key={type}
              onClick={() => addObstruction(type)}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white text-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        
        <h4 className="text-sm font-medium text-white mb-3">Add Plants</h4>
        <div className="grid grid-cols-3 gap-2">
          {(['tomato', 'cucumber', 'lettuce', 'strawberry', 'cannabis'] as const).map((type) => (
            <button
              key={type}
              onClick={() => addObstruction(type)}
              className="px-3 py-2 bg-green-700/30 hover:bg-green-600/30 border border-green-600/50 rounded-lg text-green-300 text-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Obstruction List */}
      {obstructions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white mb-2">Active Obstructions</h4>
          {obstructions.map((obs) => (
            <div
              key={obs.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                selectedObstruction === obs.id
                  ? 'bg-gray-700/50 border-purple-500'
                  : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800/50'
              }`}
              onClick={() => setSelectedObstruction(obs.id)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: obs.color }}
                />
                <div>
                  <p className="text-white font-medium">{obs.name}</p>
                  <p className="text-xs text-gray-400">
                    {obs.dimensions.width}×{obs.dimensions.height}×{obs.dimensions.depth} ft
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    updateObstruction(obs.id, { visible: !obs.visible })
                  }}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  {obs.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteObstruction(obs.id)
                  }}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Obstruction Editor */}
      {selectedObstruction && (
        <div className="mt-6 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-white mb-3">Edit Obstruction</h4>
          {(() => {
            const obs = obstructions.find(o => o.id === selectedObstruction)
            if (!obs) return null

            return (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400">Name</label>
                  <input
                    type="text"
                    value={obs.name}
                    onChange={(e) => updateObstruction(obs.id, { name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">X Position</label>
                    <input
                      type="number"
                      value={obs.position.x}
                      onChange={(e) => updateObstruction(obs.id, { 
                        position: { ...obs.position, x: Number(e.target.value) }
                      })}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Y Position</label>
                    <input
                      type="number"
                      value={obs.position.y}
                      onChange={(e) => updateObstruction(obs.id, { 
                        position: { ...obs.position, y: Number(e.target.value) }
                      })}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Z Position</label>
                    <input
                      type="number"
                      value={obs.position.z}
                      onChange={(e) => updateObstruction(obs.id, { 
                        position: { ...obs.position, z: Number(e.target.value) }
                      })}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400">Opacity ({(obs.opacity * 100).toFixed(0)}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={obs.opacity * 100}
                    onChange={(e) => updateObstruction(obs.id, { opacity: Number(e.target.value) / 100 })}
                    className="w-full mt-1"
                  />
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Info Note */}
      <div className="mt-6 flex items-start gap-2 text-xs text-gray-400">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Shadow calculations use ray-tracing to determine light blockage. Add obstructions 
          like beams, ducts, or equipment to identify problem areas. Export data for CAD integration.
        </p>
      </div>
    </div>
  )
}