"use client"

import { useState, useMemo } from 'react'
import { 
  Leaf,
  Plus,
  Trash2,
  AlertCircle,
  BarChart3,
  Target,
  Sun,
  TrendingUp,
  Settings,
  Info,
  Save,
  Upload
} from 'lucide-react'

interface CropZone {
  id: string
  name: string
  crop: string
  area: number // sq ft
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting'
  targetDLI: number
  currentDLI: number
  priority: number // 1-5, higher is more important
  color: string
}

interface DLIBalanceResult {
  totalPPFDRequired: number
  zonesOptimized: number
  totalArea: number
  averageEfficiency: number
  recommendations: string[]
  zoneAdjustments: {
    zoneId: string
    recommendedPPFD: number
    adjustmentPercent: number
  }[]
}

const CROP_DLI_TARGETS: Record<string, Record<string, number>> = {
  lettuce: { seedling: 12, vegetative: 17, flowering: 20, fruiting: 20 },
  tomato: { seedling: 15, vegetative: 20, flowering: 25, fruiting: 30 },
  cannabis: { seedling: 20, vegetative: 35, flowering: 45, fruiting: 45 },
  herbs: { seedling: 10, vegetative: 15, flowering: 18, fruiting: 18 },
  strawberry: { seedling: 15, vegetative: 20, flowering: 25, fruiting: 25 },
  cucumber: { seedling: 20, vegetative: 25, flowering: 30, fruiting: 30 },
  pepper: { seedling: 15, vegetative: 20, flowering: 25, fruiting: 28 },
  microgreens: { seedling: 6, vegetative: 12, flowering: 12, fruiting: 12 }
}

const CROP_COLORS = {
  lettuce: '#10B981',
  tomato: '#EF4444',
  cannabis: '#8B5CF6',
  herbs: '#22C55E',
  strawberry: '#EC4899',
  cucumber: '#06B6D4',
  pepper: '#F59E0B',
  microgreens: '#84CC16'
}

interface MultiCropBalancerProps {
  totalPPFD: number
  photoperiod: number
  roomArea: number
  onBalanceChange?: (result: DLIBalanceResult) => void
  className?: string
}

export function MultiCropBalancer({
  totalPPFD,
  photoperiod,
  roomArea,
  onBalanceChange,
  className = ''
}: MultiCropBalancerProps) {
  const [zones, setZones] = useState<CropZone[]>([
    {
      id: 'zone-1',
      name: 'Zone A',
      crop: 'lettuce',
      area: 100,
      growthStage: 'vegetative',
      targetDLI: 17,
      currentDLI: 15,
      priority: 3,
      color: CROP_COLORS.lettuce
    }
  ])
  const [showAddZone, setShowAddZone] = useState(false)
  const [balanceMode, setBalanceMode] = useState<'priority' | 'equal' | 'efficiency'>('priority')

  // Calculate DLI balance optimization
  const balanceResult = useMemo((): DLIBalanceResult => {
    const totalZoneArea = zones.reduce((sum, zone) => sum + zone.area, 0)
    
    if (totalZoneArea === 0) {
      return {
        totalPPFDRequired: 0,
        zonesOptimized: 0,
        totalArea: 0,
        averageEfficiency: 0,
        recommendations: ['Add crop zones to begin optimization'],
        zoneAdjustments: []
      }
    }

    // Calculate total DLI demand
    const totalDLIDemand = zones.reduce((sum, zone) => {
      const targetDLI = CROP_DLI_TARGETS[zone.crop]?.[zone.growthStage] || zone.targetDLI
      return sum + (targetDLI * zone.area)
    }, 0)

    // Available PPFD budget
    const availablePPFD = totalPPFD
    const availableDLI = (availablePPFD * photoperiod * 3.6) / 1000

    // Balance based on mode
    const zoneAdjustments: DLIBalanceResult['zoneAdjustments'] = []
    
    switch (balanceMode) {
      case 'priority':
        // Sort zones by priority
        const sortedZones = [...zones].sort((a, b) => b.priority - a.priority)
        let remainingPPFD = availablePPFD
        
        sortedZones.forEach(zone => {
          const targetDLI = CROP_DLI_TARGETS[zone.crop]?.[zone.growthStage] || zone.targetDLI
          const requiredPPFD = (targetDLI * 1000) / (photoperiod * 3.6)
          const zoneAreaRatio = zone.area / roomArea
          const allocatedPPFD = Math.min(requiredPPFD, remainingPPFD * zoneAreaRatio)
          
          zoneAdjustments.push({
            zoneId: zone.id,
            recommendedPPFD: allocatedPPFD,
            adjustmentPercent: ((allocatedPPFD / requiredPPFD) - 1) * 100
          })
          
          remainingPPFD -= allocatedPPFD
        })
        break
        
      case 'equal':
        // Distribute equally by area
        zones.forEach(zone => {
          const zoneAreaRatio = zone.area / totalZoneArea
          const allocatedPPFD = availablePPFD * zoneAreaRatio
          const targetDLI = CROP_DLI_TARGETS[zone.crop]?.[zone.growthStage] || zone.targetDLI
          const requiredPPFD = (targetDLI * 1000) / (photoperiod * 3.6)
          
          zoneAdjustments.push({
            zoneId: zone.id,
            recommendedPPFD: allocatedPPFD,
            adjustmentPercent: ((allocatedPPFD / requiredPPFD) - 1) * 100
          })
        })
        break
        
      case 'efficiency':
        // Optimize for maximum yield efficiency
        zones.forEach(zone => {
          const targetDLI = CROP_DLI_TARGETS[zone.crop]?.[zone.growthStage] || zone.targetDLI
          const efficiency = zone.currentDLI / targetDLI
          const deficitWeight = 1 - efficiency
          const totalDeficitWeight = zones.reduce((sum, z) => {
            const t = CROP_DLI_TARGETS[z.crop]?.[z.growthStage] || z.targetDLI
            return sum + (1 - (z.currentDLI / t))
          }, 0)
          
          const ppfdShare = totalDeficitWeight > 0 ? (deficitWeight / totalDeficitWeight) * availablePPFD : availablePPFD / zones.length
          const requiredPPFD = (targetDLI * 1000) / (photoperiod * 3.6)
          
          zoneAdjustments.push({
            zoneId: zone.id,
            recommendedPPFD: ppfdShare,
            adjustmentPercent: ((ppfdShare / requiredPPFD) - 1) * 100
          })
        })
        break
    }

    // Calculate metrics
    const zonesOptimized = zoneAdjustments.filter(adj => adj.adjustmentPercent >= -10).length
    const averageEfficiency = zoneAdjustments.reduce((sum, adj) => sum + (100 + adj.adjustmentPercent), 0) / zones.length

    // Generate recommendations
    const recommendations: string[] = []
    
    if (availableDLI < totalDLIDemand / totalZoneArea) {
      recommendations.push('Insufficient lighting for all zones at target DLI')
    }
    
    const underLitZones = zoneAdjustments.filter(adj => adj.adjustmentPercent < -20)
    if (underLitZones.length > 0) {
      recommendations.push(`${underLitZones.length} zone(s) significantly under target DLI`)
    }
    
    if (balanceMode === 'priority' && zones.some(z => z.priority < 3)) {
      recommendations.push('Consider increasing priority for critical crops')
    }
    
    const highDLICrops = zones.filter(z => {
      const target = CROP_DLI_TARGETS[z.crop]?.[z.growthStage] || z.targetDLI
      return target > 30
    })
    if (highDLICrops.length > 0) {
      recommendations.push(`${highDLICrops.length} high-DLI crop(s) may need supplemental lighting`)
    }

    return {
      totalPPFDRequired: totalDLIDemand * 1000 / (photoperiod * 3.6 * totalZoneArea),
      zonesOptimized,
      totalArea: totalZoneArea,
      averageEfficiency,
      recommendations,
      zoneAdjustments
    }
  }, [zones, totalPPFD, photoperiod, roomArea, balanceMode])

  // Add new zone
  const addZone = () => {
    const newZone: CropZone = {
      id: `zone-${Date.now()}`,
      name: `Zone ${String.fromCharCode(65 + zones.length)}`,
      crop: 'lettuce',
      area: 100,
      growthStage: 'vegetative',
      targetDLI: 17,
      currentDLI: 15,
      priority: 3,
      color: CROP_COLORS.lettuce
    }
    setZones([...zones, newZone])
    setShowAddZone(false)
  }

  // Update zone
  const updateZone = (id: string, updates: Partial<CropZone>) => {
    setZones(zones.map(zone => {
      if (zone.id === id) {
        const updatedZone = { ...zone, ...updates }
        if (updates.crop) {
          updatedZone.color = CROP_COLORS[updates.crop as keyof typeof CROP_COLORS] || '#6B7280'
          updatedZone.targetDLI = CROP_DLI_TARGETS[updates.crop]?.[zone.growthStage] || 20
        }
        if (updates.growthStage && zone.crop) {
          updatedZone.targetDLI = CROP_DLI_TARGETS[zone.crop]?.[updates.growthStage] || 20
        }
        return updatedZone
      }
      return zone
    }))
  }

  // Delete zone
  const deleteZone = (id: string) => {
    setZones(zones.filter(zone => zone.id !== id))
  }

  // Export configuration
  const exportConfig = () => {
    const config = {
      zones,
      balanceMode,
      totalPPFD,
      photoperiod,
      roomArea,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `multi-crop-balance-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Multi-Crop DLI Balancer</h3>
            <p className="text-sm text-gray-400">Optimize lighting for multiple crop zones</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={exportConfig}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white text-sm transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Balance Mode Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-white mb-2 block">Balance Mode</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setBalanceMode('priority')}
            className={`px-3 py-2 rounded-lg border transition-all text-sm ${
              balanceMode === 'priority'
                ? 'bg-green-600 border-green-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Priority
          </button>
          <button
            onClick={() => setBalanceMode('equal')}
            className={`px-3 py-2 rounded-lg border transition-all text-sm ${
              balanceMode === 'equal'
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Equal
          </button>
          <button
            onClick={() => setBalanceMode('efficiency')}
            className={`px-3 py-2 rounded-lg border transition-all text-sm ${
              balanceMode === 'efficiency'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Efficiency
          </button>
        </div>
      </div>

      {/* Zone List */}
      <div className="space-y-4 mb-6">
        {zones.map((zone) => {
          const adjustment = balanceResult.zoneAdjustments.find(adj => adj.zoneId === zone.id)
          const recommendedDLI = adjustment 
            ? (adjustment.recommendedPPFD * photoperiod * 3.6) / 1000
            : 0
          
          return (
            <div
              key={zone.id}
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: zone.color }}
                  />
                  <input
                    type="text"
                    value={zone.name}
                    onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                    className="bg-transparent text-white font-medium border-0 p-0 focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  onClick={() => deleteZone(zone.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-400">Crop</label>
                  <select
                    value={zone.crop}
                    onChange={(e) => updateZone(zone.id, { crop: e.target.value })}
                    className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-green-500 focus:outline-none"
                  >
                    {Object.keys(CROP_DLI_TARGETS).map(crop => (
                      <option key={crop} value={crop}>
                        {crop.charAt(0).toUpperCase() + crop.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400">Growth Stage</label>
                  <select
                    value={zone.growthStage}
                    onChange={(e) => updateZone(zone.id, { growthStage: e.target.value as any })}
                    className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-green-500 focus:outline-none"
                  >
                    <option value="seedling">Seedling</option>
                    <option value="vegetative">Vegetative</option>
                    <option value="flowering">Flowering</option>
                    <option value="fruiting">Fruiting</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400">Area (ft²)</label>
                  <input
                    type="number"
                    value={zone.area}
                    onChange={(e) => updateZone(zone.id, { area: Number(e.target.value) })}
                    className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400">Priority (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={zone.priority}
                    onChange={(e) => updateZone(zone.id, { priority: Number(e.target.value) })}
                    className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Zone Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-800/50 rounded p-2">
                  <span className="text-gray-400">Target DLI</span>
                  <p className="text-white font-medium">{zone.targetDLI}</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <span className="text-gray-400">Recommended</span>
                  <p className="text-green-400 font-medium">{recommendedDLI.toFixed(1)}</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <span className="text-gray-400">Adjustment</span>
                  <p className={`font-medium ${
                    adjustment && adjustment.adjustmentPercent > 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {adjustment ? `${adjustment.adjustmentPercent > 0 ? '+' : ''}${adjustment.adjustmentPercent.toFixed(0)}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add Zone Button */}
        <button
          onClick={() => setShowAddZone(!showAddZone)}
          className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Crop Zone
        </button>
      </div>

      {/* Balance Results */}
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-700/50 mb-4">
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Balance Results
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <span className="text-xs text-gray-400">Total PPFD Required</span>
            <p className="text-lg font-bold text-white">
              {balanceResult.totalPPFDRequired.toFixed(0)}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Zones Optimized</span>
            <p className="text-lg font-bold text-white">
              {balanceResult.zonesOptimized}/{zones.length}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Total Area</span>
            <p className="text-lg font-bold text-white">
              {balanceResult.totalArea} ft²
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Avg Efficiency</span>
            <p className="text-lg font-bold text-white">
              {balanceResult.averageEfficiency.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {balanceResult.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Recommendations:</p>
            {balanceResult.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{rec}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-2 text-xs text-gray-400">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          DLI balancing optimizes light distribution across multiple crop zones based on their 
          specific requirements, growth stages, and your selected priority mode.
        </p>
      </div>
    </div>
  )
}