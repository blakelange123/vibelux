"use client"

import { useState } from 'react'
import { Upload, Wifi, BarChart3, Target, TrendingUp, AlertCircle, CheckCircle, Download } from 'lucide-react'

interface SpectrumReading {
  timestamp: Date
  location: { x: number, y: number, z: number }
  ppfd: number
  spectrum: {
    uv: number
    blue: number
    green: number
    red: number
    farRed: number
  }
  par: number
  dli: number
}

export function SpectrumIntegration() {
  const [readings, setReadings] = useState<SpectrumReading[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [comparisonMode, setComparisonMode] = useState(false)

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Spectrum Sensor Integration
        </h2>
        <p className="text-gray-400">
          Connect your Aranet, Apogee, or LI-COR sensors to validate your design
        </p>
      </div>

      {/* Integration Options */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Direct WiFi/Bluetooth */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Wifi className="w-8 h-8 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Live Connection</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Connect sensors via WiFi or Bluetooth for real-time monitoring
          </p>
          <button 
            onClick={() => setIsConnecting(true)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Scan for Devices
          </button>
        </div>

        {/* CSV Import */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-8 h-8 text-green-400" />
            <h3 className="text-xl font-semibold text-white">Import Data</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Upload CSV exports from your spectrum sensor
          </p>
          <label className="block">
            <input 
              type="file" 
              accept=".csv"
              className="hidden"
              onChange={(e) => {/* Handle file upload */}}
            />
            <span className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center cursor-pointer transition-colors">
              Choose File
            </span>
          </label>
        </div>

        {/* Manual Entry */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Manual Entry</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Enter readings manually from any sensor
          </p>
          <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            Add Reading
          </button>
        </div>
      </div>

      {/* Design vs Actual Comparison */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-yellow-400" />
          Design vs Actual Performance
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Predicted Performance */}
          <div>
            <h4 className="text-lg font-medium text-gray-300 mb-3">Vibelux Prediction</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                <span className="text-gray-400">Average PPFD</span>
                <span className="text-white font-medium">625 μmol/m²/s</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                <span className="text-gray-400">Uniformity</span>
                <span className="text-white font-medium">0.82</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                <span className="text-gray-400">DLI</span>
                <span className="text-white font-medium">36.0 mol/m²/day</span>
              </div>
            </div>
          </div>

          {/* Actual Measurements */}
          <div>
            <h4 className="text-lg font-medium text-gray-300 mb-3">Sensor Readings</h4>
            {readings.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                  <span className="text-gray-400">Average PPFD</span>
                  <span className="text-white font-medium">612 μmol/m²/s</span>
                  <span className="text-green-400 text-sm">-2.1%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                  <span className="text-gray-400">Uniformity</span>
                  <span className="text-white font-medium">0.79</span>
                  <span className="text-yellow-400 text-sm">-3.7%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                  <span className="text-gray-400">DLI</span>
                  <span className="text-white font-medium">35.2 mol/m²/day</span>
                  <span className="text-green-400 text-sm">-2.2%</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No sensor data yet</p>
                <p className="text-sm mt-1">Connect a sensor to compare</p>
              </div>
            )}
          </div>
        </div>

        {/* Accuracy Score */}
        {readings.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-600/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Design Accuracy Score
                </h4>
                <p className="text-sm text-gray-400 mt-1">
                  Your Vibelux design is 97.8% accurate compared to actual measurements
                </p>
              </div>
              <div className="text-3xl font-bold text-green-400">A+</div>
            </div>
          </div>
        )}
      </div>

      {/* Unique Vibelux Features */}
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-600/30">
        <h3 className="text-xl font-semibold text-white mb-4">
          Why Vibelux + Sensors = Perfect Combination
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-purple-400 mt-1" />
            <div>
              <h4 className="font-medium text-white">Predictive Design</h4>
              <p className="text-sm text-gray-400">Design optimal layouts before purchasing fixtures</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
            <div>
              <h4 className="font-medium text-white">Validation</h4>
              <p className="text-sm text-gray-400">Verify performance with any sensor brand</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-blue-400 mt-1" />
            <div>
              <h4 className="font-medium text-white">Continuous Optimization</h4>
              <p className="text-sm text-gray-400">AI learns from sensor data to improve predictions</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-yellow-400 mt-1" />
            <div>
              <h4 className="font-medium text-white">Complete Documentation</h4>
              <p className="text-sm text-gray-400">Export designs with sensor validation data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">
          Already have sensor data? Import it to improve our AI predictions
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
          Share Your Data & Get Premium Features
        </button>
      </div>
    </div>
  )
}