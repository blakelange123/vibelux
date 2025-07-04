'use client'

import React, { useState } from 'react'
import { 
  Thermometer, 
  Fan, 
  AlertTriangle, 
  TrendingUp, 
  Droplets,
  Wind,
  Gauge,
  Activity,
  AlertCircle,
  CheckCircle,
  Settings,
  BarChart3,
  Cpu,
  Zap
} from 'lucide-react'

interface ThermalData {
  fixtureTemp: number
  ambientTemp: number
  junctionTemp: number
  heatOutput: number
  efficiency: number
  airflow: number
  humidity: number
}

export default function ThermalManagementPage() {
  const [wattage, setWattage] = useState(600)
  const [roomTemp, setRoomTemp] = useState(25)
  const [airflowRate, setAirflowRate] = useState(400) // CFM
  const [fixtureCount, setFixtureCount] = useState(10)
  const [roomVolume, setRoomVolume] = useState(1000) // m³
  
  // Calculate thermal metrics
  const calculateThermalMetrics = (): ThermalData => {
    const efficiency = 0.45 // 45% efficiency typical for LED
    const heatOutput = wattage * (1 - efficiency) * fixtureCount
    const btuPerHour = heatOutput * 3.412
    const tonnage = btuPerHour / 12000
    
    // Simplified junction temperature calculation
    const thermalResistance = 0.3 // °C/W typical
    const junctionTemp = roomTemp + (wattage * 0.55 * thermalResistance)
    
    // Fixture case temperature
    const fixtureTemp = roomTemp + (wattage * 0.55 * 0.1)
    
    return {
      fixtureTemp,
      ambientTemp: roomTemp,
      junctionTemp,
      heatOutput,
      efficiency: efficiency * 100,
      airflow: airflowRate,
      humidity: 50
    }
  }
  
  const metrics = calculateThermalMetrics()
  const btuPerHour = metrics.heatOutput * 3.412
  const tonnage = btuPerHour / 12000
  
  // Temperature status
  const getTempStatus = (temp: number, type: 'junction' | 'fixture') => {
    if (type === 'junction') {
      if (temp < 85) return { status: 'good', color: 'text-green-500', message: 'Optimal' }
      if (temp < 105) return { status: 'warning', color: 'text-yellow-500', message: 'Acceptable' }
      return { status: 'danger', color: 'text-red-500', message: 'Too High' }
    } else {
      if (temp < 40) return { status: 'good', color: 'text-green-500', message: 'Good' }
      if (temp < 50) return { status: 'warning', color: 'text-yellow-500', message: 'Warm' }
      return { status: 'danger', color: 'text-red-500', message: 'Hot' }
    }
  }
  
  const junctionStatus = getTempStatus(metrics.junctionTemp, 'junction')
  const fixtureStatus = getTempStatus(metrics.fixtureTemp, 'fixture')

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-gray-950 to-cyan-900/20" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
                <Thermometer className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Thermal Management
                </h1>
                <p className="text-gray-400 mt-1">LED fixture heat analysis and HVAC calculations</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Parameters */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4">System Parameters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Fixture Wattage</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="100"
                        max="1000"
                        value={wattage}
                        onChange={(e) => setWattage(Number(e.target.value))}
                        className="flex-1"
                      />
                      <div className="w-20 text-right">
                        <input
                          type="number"
                          value={wattage}
                          onChange={(e) => setWattage(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-gray-700 rounded text-white text-sm"
                        />
                        <span className="text-xs text-gray-400">W</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Number of Fixtures</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={fixtureCount}
                        onChange={(e) => setFixtureCount(Number(e.target.value))}
                        className="flex-1"
                      />
                      <div className="w-20 text-right">
                        <input
                          type="number"
                          value={fixtureCount}
                          onChange={(e) => setFixtureCount(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-gray-700 rounded text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Ambient Temperature</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="15"
                        max="35"
                        value={roomTemp}
                        onChange={(e) => setRoomTemp(Number(e.target.value))}
                        className="flex-1"
                      />
                      <div className="w-20 text-right">
                        <input
                          type="number"
                          value={roomTemp}
                          onChange={(e) => setRoomTemp(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-gray-700 rounded text-white text-sm"
                        />
                        <span className="text-xs text-gray-400">°C</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Airflow Rate</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="100"
                        max="1000"
                        step="50"
                        value={airflowRate}
                        onChange={(e) => setAirflowRate(Number(e.target.value))}
                        className="flex-1"
                      />
                      <div className="w-20 text-right">
                        <input
                          type="number"
                          value={airflowRate}
                          onChange={(e) => setAirflowRate(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-gray-700 rounded text-white text-sm"
                        />
                        <span className="text-xs text-gray-400">CFM</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Room Volume</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="100"
                        max="5000"
                        step="100"
                        value={roomVolume}
                        onChange={(e) => setRoomVolume(Number(e.target.value))}
                        className="flex-1"
                      />
                      <div className="w-20 text-right">
                        <input
                          type="number"
                          value={roomVolume}
                          onChange={(e) => setRoomVolume(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-gray-700 rounded text-white text-sm"
                        />
                        <span className="text-xs text-gray-400">m³</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4">Quick Presets</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setWattage(645)
                      setFixtureCount(20)
                      setRoomTemp(24)
                      setAirflowRate(600)
                    }}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    Flower Room (20 × 645W)
                  </button>
                  <button
                    onClick={() => {
                      setWattage(320)
                      setFixtureCount(30)
                      setRoomTemp(22)
                      setAirflowRate(400)
                    }}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    Veg Room (30 × 320W)
                  </button>
                  <button
                    onClick={() => {
                      setWattage(150)
                      setFixtureCount(50)
                      setRoomTemp(20)
                      setAirflowRate(800)
                    }}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    Vertical Farm (50 × 150W)
                  </button>
                </div>
              </div>
            </div>

            {/* Main Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Temperature Overview */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-xl rounded-xl p-6 border border-blue-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Junction Temp</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {metrics.junctionTemp.toFixed(1)}°C
                      </p>
                    </div>
                    <Cpu className={`w-8 h-8 ${junctionStatus.color}`} />
                  </div>
                  <div className={`text-sm ${junctionStatus.color}`}>
                    {junctionStatus.message}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    LED chip temperature
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-xl rounded-xl p-6 border border-orange-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Fixture Temp</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {metrics.fixtureTemp.toFixed(1)}°C
                      </p>
                    </div>
                    <Thermometer className={`w-8 h-8 ${fixtureStatus.color}`} />
                  </div>
                  <div className={`text-sm ${fixtureStatus.color}`}>
                    {fixtureStatus.message}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Case temperature
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-xl p-6 border border-green-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Ambient Temp</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {metrics.ambientTemp}°C
                      </p>
                    </div>
                    <Wind className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-sm text-green-400">
                    Room temperature
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Set point
                  </div>
                </div>
              </div>

              {/* Heat Load Analysis */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Heat Load Analysis
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Power Input</span>
                        <span className="text-white font-medium">
                          {(wattage * fixtureCount).toLocaleString()}W
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Light Output (45%)</span>
                        <span className="text-green-400 font-medium">
                          {(wattage * fixtureCount * 0.45).toLocaleString()}W
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Heat Output (55%)</span>
                        <span className="text-orange-400 font-medium">
                          {metrics.heatOutput.toLocaleString()}W
                        </span>
                      </div>
                      <div className="pt-3 border-t border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">BTU/hour</span>
                          <span className="text-white font-medium">
                            {btuPerHour.toLocaleString()} BTU/h
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-400">Cooling Tons Required</span>
                          <span className="text-cyan-400 font-medium">
                            {tonnage.toFixed(2)} tons
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Heat Distribution</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Convection (70%)</span>
                            <span className="text-gray-300">{(metrics.heatOutput * 0.7).toFixed(0)}W</span>
                          </div>
                          <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500" style={{ width: '70%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Radiation (20%)</span>
                            <span className="text-gray-300">{(metrics.heatOutput * 0.2).toFixed(0)}W</span>
                          </div>
                          <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500" style={{ width: '20%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Conduction (10%)</span>
                            <span className="text-gray-300">{(metrics.heatOutput * 0.1).toFixed(0)}W</span>
                          </div>
                          <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: '10%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HVAC Requirements */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Fan className="w-5 h-5 text-blue-400" />
                  HVAC Requirements
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-4 h-4 text-blue-400" />
                      <p className="text-sm text-gray-400">Min Airflow</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {(metrics.heatOutput / 10).toFixed(0)} CFM
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Based on heat load
                    </p>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                      <p className="text-sm text-gray-400">Air Changes/Hour</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {((airflowRate * 60 * 0.0283168) / roomVolume).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Current rate
                    </p>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-4 h-4 text-green-400" />
                      <p className="text-sm text-gray-400">Dehumidification</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {(fixtureCount * 0.5).toFixed(1)} L/day
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Estimated load
                    </p>
                  </div>
                </div>
                
                {/* Recommendations */}
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Recommendations</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {tonnage > 5 && (
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                        <span>Consider multiple AC units for better redundancy</span>
                      </li>
                    )}
                    {metrics.junctionTemp > 85 && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
                        <span>Increase airflow or reduce ambient temperature</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <span>Maintain {(tonnage * 400).toFixed(0)} CFM minimum airflow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <span>Install temperature monitoring at canopy level</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Efficiency Tips */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-xl p-6 border border-purple-700/50">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-400" />
                    Cooling Strategies
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Use water-cooled fixtures for 30% less AC load</li>
                    <li>• Install fixtures with remote drivers</li>
                    <li>• Implement night-time cooling cycles</li>
                    <li>• Use EC fans for variable speed control</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-xl p-6 border border-green-700/50">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    Monitoring Points
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Canopy temperature sensors</li>
                    <li>• Return air temperature</li>
                    <li>• Fixture case temperature</li>
                    <li>• VPD at multiple heights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}