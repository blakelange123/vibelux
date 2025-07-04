"use client"

import { useState } from 'react'
import { 
  Download,
  Package,
  FileCode,
  Settings,
  Info,
  Check,
  AlertCircle
} from 'lucide-react'
import { exportLightingDesign3D } from '@/lib/3d-exporter'

interface ThreeDExportPanelProps {
  roomDimensions: { width: number; height: number; depth: number }
  fixtures: Array<{
    id: string
    position: { x: number; y: number; z: number }
    dimensions?: { width: number; height: number; depth: number }
    model?: { brand: string; model: string }
  }>
  obstructions?: Array<{
    id: string
    name: string
    position: { x: number; y: number; z: number }
    dimensions: { width: number; height: number; depth: number }
  }>
  className?: string
}

export default function ThreeDExportPanel({
  roomDimensions,
  fixtures,
  obstructions = [],
  className = ''
}: ThreeDExportPanelProps) {
  const [exportFormat, setExportFormat] = useState<'stl' | 'obj'>('obj')
  const [includeRoom, setIncludeRoom] = useState(true)
  const [includeFixtures, setIncludeFixtures] = useState(true)
  const [includeObstructions, setIncludeObstructions] = useState(true)
  const [exportScale, setExportScale] = useState<'feet' | 'meters' | 'millimeters'>('feet')
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const scaleFactors = {
    feet: 1,
    meters: 0.3048,
    millimeters: 304.8
  }

  const handleExport = () => {
    setIsExporting(true)
    setExportSuccess(false)

    // Apply scale factor
    const scaleFactor = scaleFactors[exportScale]
    
    const scaledRoom = {
      width: roomDimensions.width * scaleFactor,
      height: roomDimensions.height * scaleFactor,
      depth: roomDimensions.depth * scaleFactor
    }

    const scaledFixtures = includeFixtures ? fixtures.map(f => ({
      id: f.id,
      position: {
        x: f.position.x * scaleFactor,
        y: f.position.y * scaleFactor,
        z: f.position.z * scaleFactor
      },
      dimensions: f.dimensions ? {
        width: f.dimensions.width * scaleFactor,
        height: f.dimensions.height * scaleFactor,
        depth: f.dimensions.depth * scaleFactor
      } : undefined
    })) : []

    const scaledObstructions = includeObstructions ? obstructions.map(o => ({
      id: o.id,
      name: o.name,
      position: {
        x: o.position.x * scaleFactor,
        y: o.position.y * scaleFactor,
        z: o.position.z * scaleFactor
      },
      dimensions: {
        width: o.dimensions.width * scaleFactor,
        height: o.dimensions.height * scaleFactor,
        depth: o.dimensions.depth * scaleFactor
      }
    })) : []

    try {
      exportLightingDesign3D(
        exportFormat,
        includeRoom ? scaledRoom : { width: 0, height: 0, depth: 0 },
        scaledFixtures,
        scaledObstructions
      )
      setExportSuccess(true)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
      setTimeout(() => setExportSuccess(false), 3000)
    }
  }

  const fixtureCount = fixtures.length
  const obstructionCount = obstructions.length
  const totalObjects = (includeRoom ? 5 : 0) + // Room has 5 meshes (floor + 4 walls)
                      (includeFixtures ? fixtureCount : 0) + 
                      (includeObstructions ? obstructionCount : 0)

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">3D Export</h3>
          <p className="text-sm text-gray-400">Export design to CAD software</p>
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-white mb-3 block">Export Format</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setExportFormat('obj')}
            className={`p-4 rounded-lg border transition-all ${
              exportFormat === 'obj'
                ? 'bg-blue-600/20 border-blue-500 text-white'
                : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:bg-gray-800/50'
            }`}
          >
            <FileCode className="w-6 h-6 mx-auto mb-2" />
            <p className="font-medium">OBJ</p>
            <p className="text-xs mt-1">Universal format</p>
          </button>
          
          <button
            onClick={() => setExportFormat('stl')}
            className={`p-4 rounded-lg border transition-all ${
              exportFormat === 'stl'
                ? 'bg-purple-600/20 border-purple-500 text-white'
                : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:bg-gray-800/50'
            }`}
          >
            <Package className="w-6 h-6 mx-auto mb-2" />
            <p className="font-medium">STL</p>
            <p className="text-xs mt-1">3D printing ready</p>
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-white">Include in Export</h4>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={includeRoom}
            onChange={(e) => setIncludeRoom(e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-300">Room boundaries (floor & walls)</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={includeFixtures}
            onChange={(e) => setIncludeFixtures(e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-300">Light fixtures ({fixtureCount})</span>
        </label>

        {obstructionCount > 0 && (
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={includeObstructions}
              onChange={(e) => setIncludeObstructions(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-300">Obstructions ({obstructionCount})</span>
          </label>
        )}
      </div>

      {/* Scale Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-white mb-2 block">Export Units</label>
        <select
          value={exportScale}
          onChange={(e) => setExportScale(e.target.value as any)}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="feet">Feet (Imperial)</option>
          <option value="meters">Meters (Metric)</option>
          <option value="millimeters">Millimeters (CAD)</option>
        </select>
      </div>

      {/* Export Summary */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
        <h4 className="text-sm font-medium text-white mb-2">Export Summary</h4>
        <div className="space-y-1 text-sm">
          <p className="text-gray-400">
            Format: <span className="text-white font-medium">{exportFormat.toUpperCase()}</span>
          </p>
          <p className="text-gray-400">
            Objects: <span className="text-white font-medium">{totalObjects}</span>
          </p>
          <p className="text-gray-400">
            Room size: <span className="text-white font-medium">
              {roomDimensions.width} × {roomDimensions.height} × {roomDimensions.depth} ft
            </span>
          </p>
          <p className="text-gray-400">
            File size: <span className="text-white font-medium">~{Math.ceil(totalObjects * 2.5)}KB</span>
          </p>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || totalObjects === 0}
        className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
          totalObjects === 0
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : exportSuccess
            ? 'bg-green-600 text-white'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
        }`}
      >
        {isExporting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Exporting...
          </>
        ) : exportSuccess ? (
          <>
            <Check className="w-5 h-5" />
            Export Complete!
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Export 3D Model
          </>
        )}
      </button>

      {/* Format Info */}
      <div className="mt-6 space-y-3">
        <div className="flex items-start gap-2 text-xs text-gray-400">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-white mb-1">Format Details:</p>
            {exportFormat === 'obj' ? (
              <p>
                OBJ format includes material definitions and is compatible with most 3D software 
                including AutoCAD, SketchUp, Blender, and 3ds Max. Two files will be downloaded: 
                .obj (geometry) and .mtl (materials).
              </p>
            ) : (
              <p>
                STL format is ideal for 3D printing and CAD applications. It contains only 
                geometry data (no materials or textures) and is widely supported by engineering 
                software.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Fixtures are exported as simplified box geometries. For detailed fixture models, 
            import manufacturer CAD files separately.
          </p>
        </div>
      </div>
    </div>
  )
}