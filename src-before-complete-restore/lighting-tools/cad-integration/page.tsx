'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Upload, Download, FileText, Grid, Layers, 
  Cpu, Zap, Sun, Sparkles, CheckCircle, AlertCircle,
  RotateCcw, Settings, Play, Pause, Save, Share2,
  Eye, EyeOff, Maximize2, ZoomIn, ZoomOut, Move
} from 'lucide-react'

interface FixtureData {
  id: string
  brand: string
  model: string
  ppf: number
  wattage: number
  efficacy: number
  dimensions: { length: number; width: number; height: number }
  iesFile?: string
  position: { x: number; y: number; z: number }
  rotation: number
  enabled: boolean
}

interface RoomLayout {
  dimensions: { length: number; width: number; height: number }
  growArea: { length: number; width: number }
  fixtures: FixtureData[]
  ppfdGrid: number[][]
  uniformity: number
  avgPPFD: number
  minPPFD: number
  maxPPFD: number
}

export default function CADIntegrationPage() {
  const [fileUploaded, setFileUploaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'heatmap'>('2d')
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [showMeasurements, setShowMeasurements] = useState(true)
  const [simulationRunning, setSimulationRunning] = useState(false)
  
  const [roomLayout, setRoomLayout] = useState<RoomLayout>({
    dimensions: { length: 40, width: 30, height: 12 },
    growArea: { length: 36, width: 26 },
    fixtures: [],
    ppfdGrid: [],
    uniformity: 0,
    avgPPFD: 0,
    minPPFD: 0,
    maxPPFD: 0
  })

  const dlcFixtures = [
    {
      id: 'dlc-1',
      brand: 'Fluence',
      model: 'SPYDR 2p',
      ppf: 1870,
      wattage: 645,
      efficacy: 2.9,
      dlcListed: true
    },
    {
      id: 'dlc-2',
      brand: 'Gavita',
      model: 'Pro 1700e LED',
      ppf: 1700,
      wattage: 645,
      efficacy: 2.6,
      dlcListed: true
    },
    {
      id: 'dlc-3',
      brand: 'California Lightworks',
      model: 'MegaDrive 1000',
      ppf: 1551,
      wattage: 600,
      efficacy: 2.585,
      dlcListed: true
    }
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsProcessing(true)
      // Simulate CAD file processing
      setTimeout(() => {
        setFileUploaded(true)
        setIsProcessing(false)
        // Simulate fixture detection from CAD
        const detectedFixtures: FixtureData[] = [
          {
            id: '1',
            brand: 'Fluence',
            model: 'SPYDR 2p',
            ppf: 1870,
            wattage: 645,
            efficacy: 2.9,
            dimensions: { length: 44, width: 44, height: 3 },
            position: { x: 10, y: 7.5, z: 10 },
            rotation: 0,
            enabled: true
          },
          {
            id: '2',
            brand: 'Fluence',
            model: 'SPYDR 2p',
            ppf: 1870,
            wattage: 645,
            efficacy: 2.9,
            dimensions: { length: 44, width: 44, height: 3 },
            position: { x: 20, y: 7.5, z: 10 },
            rotation: 0,
            enabled: true
          },
          {
            id: '3',
            brand: 'Fluence',
            model: 'SPYDR 2p',
            ppf: 1870,
            wattage: 645,
            efficacy: 2.9,
            dimensions: { length: 44, width: 44, height: 3 },
            position: { x: 30, y: 7.5, z: 10 },
            rotation: 0,
            enabled: true
          }
        ]
        setRoomLayout(prev => ({
          ...prev,
          fixtures: detectedFixtures,
          avgPPFD: 850,
          minPPFD: 720,
          maxPPFD: 980,
          uniformity: 0.85
        }))
      }, 3000)
    }
  }

  const runSimulation = () => {
    setSimulationRunning(true)
    // Simulate PPFD calculation
    setTimeout(() => {
      setSimulationRunning(false)
      // Update results
      setRoomLayout(prev => ({
        ...prev,
        avgPPFD: 875,
        minPPFD: 745,
        maxPPFD: 1005,
        uniformity: 0.85
      }))
    }, 2000)
  }

  const exportReport = () => {
    // Generate PDF report
    // Exporting CAD integration report
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/lighting-tools"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Lighting Tools
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">CAD Integration</h1>
              <p className="text-gray-400">
                Import CAD files and simulate lighting layouts with DLC fixtures
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportReport}
                className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button
                onClick={runSimulation}
                disabled={!fileUploaded || simulationRunning}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {simulationRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Simulation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!fileUploaded ? (
          /* File Upload Section */
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900/50 rounded-xl border border-white/10 p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-purple-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Import CAD File</h2>
                <p className="text-gray-400 mb-6">
                  Upload your facility CAD file (.dwg, .dxf, or .rvt) to begin
                </p>

                <input
                  type="file"
                  id="cad-upload"
                  accept=".dwg,.dxf,.rvt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="cad-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  Choose CAD File
                </label>

                {isProcessing && (
                  <div className="mt-8">
                    <div className="flex items-center justify-center gap-3 text-purple-400">
                      <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                      <span>Processing CAD file...</span>
                    </div>
                    <div className="mt-4 w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}

                <div className="mt-8 text-left">
                  <h3 className="text-sm font-medium text-white mb-3">Supported Formats:</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      AutoCAD DWG files (.dwg)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      DXF Exchange files (.dxf)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Revit files (.rvt)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CAD Viewer and Analysis */
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-gray-900/50 rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* View Mode Toggles */}
                  <div className="flex items-center bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('2d')}
                      className={`px-3 py-1 rounded ${viewMode === '2d' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      2D
                    </button>
                    <button
                      onClick={() => setViewMode('3d')}
                      className={`px-3 py-1 rounded ${viewMode === '3d' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      3D
                    </button>
                    <button
                      onClick={() => setViewMode('heatmap')}
                      className={`px-3 py-1 rounded ${viewMode === 'heatmap' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Heatmap
                    </button>
                  </div>

                  <div className="h-6 w-px bg-gray-700" />

                  {/* View Options */}
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-2 rounded ${showGrid ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                    title="Toggle Grid"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowMeasurements(!showMeasurements)}
                    className={`p-2 rounded ${showMeasurements ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                    title="Toggle Measurements"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <div className="h-6 w-px bg-gray-700" />

                  {/* Zoom Controls */}
                  <button className="p-2 text-gray-400 hover:text-white">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    Room: {roomLayout.dimensions.length}' × {roomLayout.dimensions.width}' × {roomLayout.dimensions.height}'
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CAD Viewer */}
              <div className="lg:col-span-2">
                <div className="bg-gray-900/50 rounded-xl border border-white/10 p-6">
                  <div className="bg-gray-950 rounded-lg h-96 relative overflow-hidden">
                    {/* Placeholder for CAD viewer */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {viewMode === 'heatmap' ? (
                        <div className="text-center">
                          <div className="grid grid-cols-10 gap-1 mb-4">
                            {[...Array(100)].map((_, i) => (
                              <div
                                key={i}
                                className="w-8 h-8 rounded"
                                style={{
                                  backgroundColor: `hsl(${120 - (i % 20) * 6}, 70%, 50%)`,
                                  opacity: 0.8
                                }}
                              />
                            ))}
                          </div>
                          <p className="text-gray-400 text-sm">PPFD Heatmap View</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Layers className="w-16 h-16 text-gray-600 mb-4" />
                          <p className="text-gray-400">
                            {viewMode === '3d' ? '3D View' : '2D Floor Plan'}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            {roomLayout.fixtures.length} fixtures detected
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Grid Overlay */}
                    {showGrid && (
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full">
                          <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.3" />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* PPFD Results */}
                  <div className="mt-6 grid grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">Average PPFD</p>
                      <p className="text-2xl font-bold text-white">{roomLayout.avgPPFD}</p>
                      <p className="text-xs text-gray-500">μmol/m²/s</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">Min PPFD</p>
                      <p className="text-2xl font-bold text-orange-400">{roomLayout.minPPFD}</p>
                      <p className="text-xs text-gray-500">μmol/m²/s</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">Max PPFD</p>
                      <p className="text-2xl font-bold text-green-400">{roomLayout.maxPPFD}</p>
                      <p className="text-xs text-gray-500">μmol/m²/s</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">Uniformity</p>
                      <p className="text-2xl font-bold text-blue-400">{(roomLayout.uniformity * 100).toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">min/avg</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixture List and Controls */}
              <div className="space-y-6">
                {/* Detected Fixtures */}
                <div className="bg-gray-900/50 rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Detected Fixtures</h3>
                  
                  <div className="space-y-3">
                    {roomLayout.fixtures.map((fixture) => (
                      <div
                        key={fixture.id}
                        className={`p-4 bg-gray-800/50 rounded-lg cursor-pointer transition-all ${
                          selectedFixture === fixture.id ? 'ring-2 ring-purple-500' : ''
                        }`}
                        onClick={() => setSelectedFixture(fixture.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-medium">{fixture.brand} {fixture.model}</p>
                            <p className="text-sm text-gray-400">
                              Position: ({fixture.position.x}', {fixture.position.y}', {fixture.position.z}')
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setRoomLayout(prev => ({
                                ...prev,
                                fixtures: prev.fixtures.map(f =>
                                  f.id === fixture.id ? { ...f, enabled: !f.enabled } : f
                                )
                              }))
                            }}
                            className={`p-1 rounded ${fixture.enabled ? 'text-green-400' : 'text-gray-600'}`}
                          >
                            {fixture.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">PPF</p>
                            <p className="text-white font-medium">{fixture.ppf} μmol/s</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Power</p>
                            <p className="text-white font-medium">{fixture.wattage}W</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Efficacy</p>
                            <p className="text-white font-medium">{fixture.efficacy} μmol/J</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DLC Fixture Library */}
                <div className="bg-gray-900/50 rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">DLC Fixture Library</h3>
                  
                  <div className="space-y-3">
                    {dlcFixtures.map((fixture) => (
                      <div key={fixture.id} className="p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium text-sm">{fixture.brand} {fixture.model}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs">
                              <span className="text-gray-400">{fixture.ppf} μmol/s</span>
                              <span className="text-gray-400">{fixture.wattage}W</span>
                              <span className="text-green-400">{fixture.efficacy} μmol/J</span>
                            </div>
                          </div>
                          {fixture.dlcListed && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              DLC Listed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      // Navigate to DLC fixture database
                      window.open('/lighting-tools/spectrum-optimization', '_blank');
                    }}
                    className="w-full mt-4 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
                  >
                    Browse All 2000+ DLC Fixtures
                  </button>
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/20 p-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Lighting Analysis Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Coverage Analysis:</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Total fixtures: {roomLayout.fixtures.length}</li>
                        <li>• Coverage area: {roomLayout.growArea.length * roomLayout.growArea.width} sq ft</li>
                        <li>• Fixture density: {(roomLayout.fixtures.length / (roomLayout.growArea.length * roomLayout.growArea.width / 100)).toFixed(2)} per 100 sq ft</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2">Energy Analysis:</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Total power: {roomLayout.fixtures.reduce((sum, f) => sum + (f.enabled ? f.wattage : 0), 0)}W</li>
                        <li>• Power density: {(roomLayout.fixtures.reduce((sum, f) => sum + (f.enabled ? f.wattage : 0), 0) / (roomLayout.growArea.length * roomLayout.growArea.width)).toFixed(1)} W/sq ft</li>
                        <li>• Daily energy: {(roomLayout.fixtures.reduce((sum, f) => sum + (f.enabled ? f.wattage : 0), 0) * 12 / 1000).toFixed(1)} kWh</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2">Recommendations:</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• {roomLayout.uniformity < 0.8 ? 'Improve uniformity by adjusting fixture spacing' : 'Good uniformity achieved'}</li>
                        <li>• {roomLayout.avgPPFD < 800 ? 'Consider adding fixtures for higher PPFD' : 'PPFD levels are optimal'}</li>
                        <li>• Estimated DLI: {(roomLayout.avgPPFD * 0.0036 * 12).toFixed(1)} mol/m²/d</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}