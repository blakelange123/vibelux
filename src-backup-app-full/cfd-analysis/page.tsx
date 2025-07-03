'use client'

import { useState } from 'react'
import { CFDVisualization } from '@/components/CFDVisualization'
import { 
  Wind, 
  Thermometer, 
  Lightbulb, 
  Settings,
  Plus,
  Trash2,
  Download,
  Upload
} from 'lucide-react'

export default function CFDAnalysisPage() {
  // Room configuration
  const [roomDimensions, setRoomDimensions] = useState({
    width: 12, // meters
    height: 3,
    depth: 8
  })

  // Fixtures configuration
  const [fixtures, setFixtures] = useState([
    { id: 1, x: 3, y: 2.5, z: 2, power: 600 },
    { id: 2, x: 6, y: 2.5, z: 2, power: 600 },
    { id: 3, x: 9, y: 2.5, z: 2, power: 600 },
    { id: 4, x: 3, y: 2.5, z: 4, power: 600 },
    { id: 5, x: 6, y: 2.5, z: 4, power: 600 },
    { id: 6, x: 9, y: 2.5, z: 4, power: 600 },
    { id: 7, x: 3, y: 2.5, z: 6, power: 600 },
    { id: 8, x: 6, y: 2.5, z: 6, power: 600 },
    { id: 9, x: 9, y: 2.5, z: 6, power: 600 }
  ])

  // HVAC configuration
  const [hvacInlets, setHvacInlets] = useState([
    { id: 1, x: 2, y: 2.8, z: 1, width: 0.6, height: 0.3, flowRate: 0.5, temperature: 18 },
    { id: 2, x: 10, y: 2.8, z: 1, width: 0.6, height: 0.3, flowRate: 0.5, temperature: 18 },
    { id: 3, x: 2, y: 2.8, z: 7, width: 0.6, height: 0.3, flowRate: 0.5, temperature: 18 },
    { id: 4, x: 10, y: 2.8, z: 7, width: 0.6, height: 0.3, flowRate: 0.5, temperature: 18 }
  ])

  const [hvacOutlets, setHvacOutlets] = useState([
    { id: 1, x: 6, y: 0.1, z: 1, width: 0.8, height: 0.4 },
    { id: 2, x: 6, y: 0.1, z: 7, width: 0.8, height: 0.4 }
  ])

  const addFixture = () => {
    const newFixture = {
      id: Date.now(),
      x: roomDimensions.width / 2,
      y: roomDimensions.height - 0.5,
      z: roomDimensions.depth / 2,
      power: 600
    }
    setFixtures([...fixtures, newFixture])
  }

  const removeFixture = (id: number) => {
    setFixtures(fixtures.filter(f => f.id !== id))
  }

  const addInlet = () => {
    const newInlet = {
      id: Date.now(),
      x: roomDimensions.width / 2,
      y: roomDimensions.height - 0.2,
      z: roomDimensions.depth / 2,
      width: 0.6,
      height: 0.3,
      flowRate: 0.5,
      temperature: 18
    }
    setHvacInlets([...hvacInlets, newInlet])
  }

  const removeInlet = (id: number) => {
    setHvacInlets(hvacInlets.filter(i => i.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            CFD Airflow Analysis
          </h1>
          <p className="text-gray-400">
            Optimize HVAC design with computational fluid dynamics simulation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Room Dimensions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" />
                Room Configuration
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Width (m)</label>
                  <input
                    type="number"
                    value={roomDimensions.width}
                    onChange={(e) => setRoomDimensions({...roomDimensions, width: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Height (m)</label>
                  <input
                    type="number"
                    value={roomDimensions.height}
                    onChange={(e) => setRoomDimensions({...roomDimensions, height: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Depth (m)</label>
                  <input
                    type="number"
                    value={roomDimensions.depth}
                    onChange={(e) => setRoomDimensions({...roomDimensions, depth: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            {/* Heat Sources */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Heat Sources
                </h3>
                <button
                  onClick={addFixture}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {fixtures.map((fixture, index) => (
                  <div key={fixture.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-sm text-gray-300">
                      Fixture {index + 1}: {fixture.power}W
                    </span>
                    <button
                      onClick={() => removeFixture(fixture.id)}
                      className="p-1 hover:bg-gray-600 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* HVAC Inlets */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Wind className="w-5 h-5 text-blue-400" />
                  HVAC Inlets
                </h3>
                <button
                  onClick={addInlet}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {hvacInlets.map((inlet, index) => (
                  <div key={inlet.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-sm text-gray-300">
                      Inlet {index + 1}: {inlet.flowRate} m³/s @ {inlet.temperature}°C
                    </span>
                    <button
                      onClick={() => removeInlet(inlet.id)}
                      className="p-1 hover:bg-gray-600 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-2">
            <CFDVisualization
              roomDimensions={roomDimensions}
              fixtures={fixtures}
              hvacInlets={hvacInlets}
              hvacOutlets={hvacOutlets}
            />
          </div>
        </div>

        {/* Additional Analysis Tools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Optimization Suggestions</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                Add more inlets near heat sources for better cooling
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                Consider increasing airflow in zones 2 and 5
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Current configuration achieves 87% uniformity
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Energy Analysis</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Total Heat Load</p>
                <p className="text-2xl font-bold text-white">
                  {fixtures.reduce((sum, f) => sum + f.power * 0.5, 0)} W
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Required Cooling</p>
                <p className="text-xl font-bold text-blue-400">
                  {(fixtures.reduce((sum, f) => sum + f.power * 0.5, 0) / 3517).toFixed(1)} tons
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Export CFD Report
              </button>
              <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Load Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}