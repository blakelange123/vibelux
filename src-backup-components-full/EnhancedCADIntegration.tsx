"use client"

import { useState, useRef, useCallback } from 'react'
import { 
  Upload,
  Download,
  FileType,
  Layers,
  Grid3x3,
  Maximize,
  Move,
  Settings,
  Check,
  X,
  AlertCircle,
  Info,
  Loader2,
  FileText,
  Package,
  Ruler,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react'

interface CADLayer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  color: string
  type: 'architectural' | 'lighting' | 'electrical' | 'annotation' | 'other'
  entities: number
}

interface ImportedFile {
  id: string
  name: string
  type: 'dwg' | 'dxf' | 'pdf' | 'ifc' | 'rvt' | 'skp'
  size: number
  status: 'processing' | 'ready' | 'error'
  layers: CADLayer[]
  units: 'mm' | 'cm' | 'm' | 'in' | 'ft'
  scale: number
  bounds: {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
}

interface ExportSettings {
  format: 'dwg' | 'dxf' | 'pdf' | 'ifc' | 'gbxml'
  version: string
  layers: string[]
  includeFixtures: boolean
  includeLighting: boolean
  includeCalculations: boolean
  includeSchedules: boolean
  units: 'metric' | 'imperial'
}

const supportedFormats = [
  { id: 'dwg', name: 'AutoCAD DWG', extensions: ['.dwg'], versions: ['2018', '2013', '2010', '2007'] },
  { id: 'dxf', name: 'AutoCAD DXF', extensions: ['.dxf'], versions: ['R2018', 'R2013', 'R2010', 'R2007'] },
  { id: 'pdf', name: 'PDF Drawing', extensions: ['.pdf'], versions: ['1.7', '1.6', '1.5'] },
  { id: 'ifc', name: 'IFC BIM', extensions: ['.ifc'], versions: ['IFC4', 'IFC2x3'] },
  { id: 'rvt', name: 'Revit', extensions: ['.rvt'], versions: ['2024', '2023', '2022'] },
  { id: 'skp', name: 'SketchUp', extensions: ['.skp'], versions: ['2023', '2022', '2021'] }
]

const exportFormats = [
  { id: 'dwg', name: 'AutoCAD DWG', versions: ['2018', '2013', '2010'] },
  { id: 'dxf', name: 'AutoCAD DXF', versions: ['R2018', 'R2013', 'R2010'] },
  { id: 'pdf', name: 'PDF Drawing', versions: ['1.7'] },
  { id: 'ifc', name: 'IFC BIM', versions: ['IFC4', 'IFC2x3'] },
  { id: 'gbxml', name: 'gbXML Energy', versions: ['0.37'] }
]

export function EnhancedCADIntegration() {
  const [importedFiles, setImportedFiles] = useState<ImportedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<ImportedFile | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'dwg',
    version: '2018',
    layers: [],
    includeFixtures: true,
    includeLighting: true,
    includeCalculations: true,
    includeSchedules: true,
    units: 'imperial'
  })
  const [processing, setProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      const format = supportedFormats.find(f => f.extensions.includes(extension))
      
      if (format) {
        processFile(file, format.id as any)
      }
    })
  }

  const processFile = async (file: File, type: ImportedFile['type']) => {
    setProcessing(true)
    
    // Simulate file processing
    const newFile: ImportedFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      type,
      size: file.size,
      status: 'processing',
      layers: [],
      units: 'ft',
      scale: 1,
      bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 }
    }
    
    setImportedFiles(prev => [...prev, newFile])
    
    // Simulate processing delay and layer extraction
    setTimeout(() => {
      const processedFile: ImportedFile = {
        ...newFile,
        status: 'ready',
        layers: [
          { id: 'l1', name: 'A-WALL', visible: true, locked: false, color: '#ffffff', type: 'architectural', entities: 245 },
          { id: 'l2', name: 'A-DOOR', visible: true, locked: false, color: '#00ff00', type: 'architectural', entities: 32 },
          { id: 'l3', name: 'A-FURN', visible: false, locked: false, color: '#808080', type: 'architectural', entities: 156 },
          { id: 'l4', name: 'E-LITE', visible: true, locked: false, color: '#ffff00', type: 'lighting', entities: 0 },
          { id: 'l5', name: 'E-POWR', visible: false, locked: true, color: '#ff0000', type: 'electrical', entities: 89 },
          { id: 'l6', name: 'A-ANNO', visible: true, locked: false, color: '#00ffff', type: 'annotation', entities: 67 }
        ],
        bounds: {
          minX: 0,
          minY: 0,
          maxX: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 + 100,
          maxY: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 150 + 75
        }
      }
      
      setImportedFiles(prev => 
        prev.map(f => f.id === newFile.id ? processedFile : f)
      )
      setSelectedFile(processedFile)
      setProcessing(false)
    }, 2000)
  }

  const toggleLayer = (fileId: string, layerId: string, property: 'visible' | 'locked') => {
    setImportedFiles(prev => 
      prev.map(file => {
        if (file.id === fileId) {
          return {
            ...file,
            layers: file.layers.map(layer => 
              layer.id === layerId 
                ? { ...layer, [property]: !layer[property] }
                : layer
            )
          }
        }
        return file
      })
    )
  }

  const exportDrawing = () => {
    // In a real implementation, this would generate the export file
    alert(`Exporting as ${exportSettings.format.toUpperCase()} ${exportSettings.version}...`)
    setShowExportDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Enhanced CAD Integration</h2>
            <p className="text-sm text-gray-400">
              Import architectural drawings and export lighting designs with full CAD compatibility
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import CAD
            </button>
            <button
              onClick={() => setShowExportDialog(true)}
              disabled={!selectedFile}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Design
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".dwg,.dxf,.pdf,.ifc,.rvt,.skp"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Import Area */}
      <div
        className={`bg-gray-900 rounded-xl border-2 border-dashed transition-colors ${
          dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700'
        } p-12`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-lg text-gray-300 mb-2">
            Drag and drop CAD files here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supported formats: DWG, DXF, PDF, IFC, RVT, SKP
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* File List */}
      {importedFiles.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Imported Files</h3>
          
          <div className="space-y-3">
            {importedFiles.map(file => (
              <div
                key={file.id}
                onClick={() => file.status === 'ready' && setSelectedFile(file)}
                className={`p-4 bg-gray-800 rounded-lg cursor-pointer transition-all ${
                  selectedFile?.id === file.id ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileType className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-sm text-gray-400">
                        {file.type.toUpperCase()} • {(file.size / 1024 / 1024).toFixed(2)} MB • 
                        {file.status === 'ready' && ` ${file.layers.length} layers`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === 'processing' && (
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    )}
                    {file.status === 'ready' && (
                      <Check className="w-5 h-5 text-green-400" />
                    )}
                    {file.status === 'error' && (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layer Management */}
      {selectedFile && selectedFile.status === 'ready' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Layer Control</h3>
            
            <div className="space-y-2">
              {selectedFile.layers.map(layer => (
                <div
                  key={layer.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div>
                      <p className="font-medium text-white">{layer.name}</p>
                      <p className="text-xs text-gray-400">
                        {layer.type} • {layer.entities} entities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLayer(selectedFile.id, layer.id, 'visible')}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                    >
                      {layer.visible ? (
                        <Eye className="w-4 h-4 text-gray-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleLayer(selectedFile.id, layer.id, 'locked')}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                    >
                      {layer.locked ? (
                        <Lock className="w-4 h-4 text-red-400" />
                      ) : (
                        <Unlock className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Drawing Information</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Units</span>
                <span className="text-white">{selectedFile.units}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Scale</span>
                <span className="text-white">1:{selectedFile.scale}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Width</span>
                <span className="text-white">
                  {(selectedFile.bounds.maxX - selectedFile.bounds.minX).toFixed(2)} {selectedFile.units}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Height</span>
                <span className="text-white">
                  {(selectedFile.bounds.maxY - selectedFile.bounds.minY).toFixed(2)} {selectedFile.units}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Total Entities</span>
                <span className="text-white">
                  {selectedFile.layers.reduce((sum, layer) => sum + layer.entities, 0)}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                <p className="text-xs text-gray-300">
                  This drawing is ready for lighting design. Use the lighting design tools to add fixtures 
                  and the drawing will automatically update with the new lighting layer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Export CAD Drawing</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Export Format</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {exportFormats.map(format => (
                    <button
                      key={format.id}
                      onClick={() => setExportSettings({
                        ...exportSettings,
                        format: format.id as any,
                        version: format.versions[0]
                      })}
                      className={`p-3 rounded-lg border transition-colors ${
                        exportSettings.format === format.id
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {format.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Version</label>
                <select
                  value={exportSettings.version}
                  onChange={(e) => setExportSettings({ ...exportSettings, version: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  {exportFormats
                    .find(f => f.id === exportSettings.format)
                    ?.versions.map(version => (
                      <option key={version} value={version}>{version}</option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Include in Export</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportSettings.includeFixtures}
                      onChange={(e) => setExportSettings({ ...exportSettings, includeFixtures: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-800 text-purple-600"
                    />
                    <span className="text-gray-300">Lighting Fixtures</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportSettings.includeLighting}
                      onChange={(e) => setExportSettings({ ...exportSettings, includeLighting: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-800 text-purple-600"
                    />
                    <span className="text-gray-300">Lighting Calculations</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportSettings.includeCalculations}
                      onChange={(e) => setExportSettings({ ...exportSettings, includeCalculations: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-800 text-purple-600"
                    />
                    <span className="text-gray-300">Calculation Grids</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportSettings.includeSchedules}
                      onChange={(e) => setExportSettings({ ...exportSettings, includeSchedules: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-800 text-purple-600"
                    />
                    <span className="text-gray-300">Fixture Schedules</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Units</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportSettings({ ...exportSettings, units: 'imperial' })}
                    className={`p-3 rounded-lg border transition-colors ${
                      exportSettings.units === 'imperial'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    Imperial (ft/in)
                  </button>
                  <button
                    onClick={() => setExportSettings({ ...exportSettings, units: 'metric' })}
                    className={`p-3 rounded-lg border transition-colors ${
                      exportSettings.units === 'metric'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    Metric (m/mm)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={exportDrawing}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Export Drawing
              </button>
              <button
                onClick={() => setShowExportDialog(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
            <p className="text-white font-medium">Processing CAD file...</p>
            <p className="text-sm text-gray-400 mt-1">Extracting layers and geometry</p>
          </div>
        </div>
      )}
    </div>
  )
}