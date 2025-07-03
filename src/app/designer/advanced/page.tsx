'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createRoom, generateFixtureLayout, analyzeDesign, optimizeLayout, Room, Fixture, DesignResult } from '@/lib/design-utils'
import DesignCanvas from '@/components/DesignCanvas'
import Room3DVisualization from '@/components/Room3DVisualization'

export default function AdvancedDesigner() {
  const [roomDimensions, setRoomDimensions] = useState({ width: 10, length: 8, height: 3 })
  const [room, setRoom] = useState<Room>(createRoom(10, 8, 3))
  const [fixtures, setFixtures] = useState<Fixture[]>(generateFixtureLayout(room, 2.5))
  const [analysis, setAnalysis] = useState<DesignResult>(analyzeDesign(room, fixtures))
  const [targetPPFD, setTargetPPFD] = useState(400)
  const [activeTab, setActiveTab] = useState<'2d' | '3d' | 'analysis'>('2d')

  const updateRoom = () => {
    const newRoom = createRoom(roomDimensions.width, roomDimensions.length, roomDimensions.height)
    setRoom(newRoom)
    const newFixtures = generateFixtureLayout(newRoom, 2.5)
    setFixtures(newFixtures)
    setAnalysis(analyzeDesign(newRoom, newFixtures))
  }

  const handleOptimize = () => {
    const optimized = optimizeLayout(room, targetPPFD)
    setFixtures(optimized.fixtures)
    setAnalysis(optimized)
  }

  const handleFixtureMove = (fixtureId: string, x: number, y: number) => {
    const newFixtures = fixtures.map(fixture => 
      fixture.id === fixtureId ? { ...fixture, x, y } : fixture
    )
    setFixtures(newFixtures)
    setAnalysis(analyzeDesign(room, newFixtures))
  }

  const getUniformityColor = (uniformity: number) => {
    if (uniformity >= 0.8) return 'text-green-600'
    if (uniformity >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPPFDColor = (ppfd: number) => {
    const diff = Math.abs(ppfd - targetPPFD) / targetPPFD
    if (diff <= 0.1) return 'text-green-600'
    if (diff <= 0.25) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link href="/designer" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Designer
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Lighting Designer</h1>
            <p className="text-gray-600">
              Professional lighting layout design with real-time analysis and optimization
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Control Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Room Dimensions</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width (m)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={roomDimensions.width}
                      onChange={(e) => setRoomDimensions({...roomDimensions, width: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Length (m)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={roomDimensions.length}
                      onChange={(e) => setRoomDimensions({...roomDimensions, length: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={roomDimensions.height}
                      onChange={(e) => setRoomDimensions({...roomDimensions, height: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <button
                    onClick={updateRoom}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Update Room
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Optimization</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target PPFD (µmol/m²/s)
                    </label>
                    <input
                      type="number"
                      value={targetPPFD}
                      onChange={(e) => setTargetPPFD(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <button
                    onClick={handleOptimize}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  >
                    Auto Optimize
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Room Area:</span>
                    <span className="font-medium">{room.area}m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fixtures:</span>
                    <span className="font-medium">{fixtures.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Power:</span>
                    <span className="font-medium">{analysis.totalPower}W</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Power Density:</span>
                    <span className="font-medium">{Math.round(analysis.powerDensity)}W/m²</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Design Area */}
            <div className="lg:col-span-3">
              {/* Tab Navigation */}
              <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="border-b border-gray-200">
                  <div className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('2d')}
                      className={`py-4 text-sm font-medium border-b-2 ${
                        activeTab === '2d' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      2D Layout
                    </button>
                    <button
                      onClick={() => setActiveTab('3d')}
                      className={`py-4 text-sm font-medium border-b-2 ${
                        activeTab === '3d' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      3D Visualization
                    </button>
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className={`py-4 text-sm font-medium border-b-2 ${
                        activeTab === 'analysis' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Analysis
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === '2d' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">2D Layout Designer</h3>
                      <p className="text-gray-600 mb-4">Click and drag fixtures to reposition them</p>
                      <DesignCanvas 
                        room={room} 
                        fixtures={fixtures} 
                        onFixtureMove={handleFixtureMove}
                      />
                    </div>
                  )}

                  {activeTab === '3d' && (
                    <Room3DVisualization room={room} fixtures={fixtures} />
                  )}

                  {activeTab === 'analysis' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-6">Performance Analysis</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600">Average PPFD</div>
                          <div className={`text-2xl font-bold ${getPPFDColor(analysis.averagePPFD)}`}>
                            {Math.round(analysis.averagePPFD)}
                          </div>
                          <div className="text-xs text-gray-500">µmol/m²/s</div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600">Uniformity</div>
                          <div className={`text-2xl font-bold ${getUniformityColor(analysis.uniformity)}`}>
                            {Math.round(analysis.uniformity * 100)}%
                          </div>
                          <div className="text-xs text-gray-500">min/avg ratio</div>
                        </div>
                        
                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600">Power Density</div>
                          <div className="text-2xl font-bold text-orange-600">
                            {Math.round(analysis.powerDensity)}
                          </div>
                          <div className="text-xs text-gray-500">W/m²</div>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600">Total Power</div>
                          <div className="text-2xl font-bold text-purple-600">
                            {analysis.totalPower}
                          </div>
                          <div className="text-xs text-gray-500">watts</div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-semibold mb-4">Recommendations</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          {analysis.averagePPFD < targetPPFD * 0.9 && (
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                              PPFD is below target - consider adding more fixtures or increasing power
                            </div>
                          )}
                          {analysis.uniformity < 0.7 && (
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                              Poor uniformity - adjust fixture spacing or positioning
                            </div>
                          )}
                          {analysis.powerDensity > 50 && (
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                              High power density may require additional cooling
                            </div>
                          )}
                          {analysis.averagePPFD >= targetPPFD * 0.9 && analysis.uniformity >= 0.7 && (
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Design looks good! Consider the heat load and energy efficiency
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}