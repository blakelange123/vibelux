'use client'

import React, { useState, useEffect } from 'react'
import {
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Activity,
  Shield,
  Calculator,
  Download,
  Filter,
  X
} from 'lucide-react'
import { THDAnalyzer } from '@/lib/power-quality/thd-analyzer'

interface FixtureInput {
  id: string
  name: string
  quantity: number
  powerRating: number
  driverType: 'constant-current' | 'constant-voltage' | 'programmable'
  hasActivePFC: boolean
  dimmingLevel: number
  thd?: number
  powerFactor?: number
}

export function THDComplianceChecker() {
  const [fixtures, setFixtures] = useState<FixtureInput[]>([
    {
      id: '1',
      name: 'Main Flowering Room',
      quantity: 50,
      powerRating: 645,
      driverType: 'programmable',
      hasActivePFC: true,
      dimmingLevel: 100,
      thd: undefined,
      powerFactor: undefined
    }
  ])
  const [selectedFixtureFromLibrary, setSelectedFixtureFromLibrary] = useState<any>(null)
  
  const [transformerRating, setTransformerRating] = useState(200) // kVA
  const [targetTHD, setTargetTHD] = useState(15)
  const [showMitigation, setShowMitigation] = useState(false)
  
  const analyzer = new THDAnalyzer()
  
  // Listen for fixture analysis from the library
  useEffect(() => {
    const handleAnalyzeTHD = (event: CustomEvent) => {
      const { fixture, driverType, powerRating, hasActivePFC } = event.detail
      
      // Add the fixture to analysis
      const newFixture: FixtureInput = {
        id: `lib-${Date.now()}`,
        name: `${fixture.brand} ${fixture.model}`,
        quantity: 1,
        powerRating: powerRating,
        driverType: driverType,
        hasActivePFC: hasActivePFC,
        dimmingLevel: 100,
        thd: fixture.thd,
        powerFactor: fixture.powerFactor
      }
      
      setFixtures(prev => [...prev, newFixture])
      setSelectedFixtureFromLibrary(fixture)
      
      // Scroll to the fixture in the list
      setTimeout(() => {
        const element = document.getElementById(`fixture-${newFixture.id}`)
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
    
    window.addEventListener('analyzeTHD', handleAnalyzeTHD as EventListener)
    return () => {
      window.removeEventListener('analyzeTHD', handleAnalyzeTHD as EventListener)
    }
  }, [])
  
  // Calculate THD for each fixture group
  const fixturesWithTHD = fixtures.map(fixture => {
    const analysis = analyzer.analyzeFixtureTHD(
      fixture.driverType,
      fixture.powerRating,
      fixture.dimmingLevel,
      fixture.hasActivePFC
    )
    
    return {
      ...fixture,
      thd: fixture.thd || analysis.thdCurrent,
      powerFactor: fixture.powerFactor || analysis.powerFactor,
      analysis
    }
  })
  
  // Calculate system-wide THD
  const systemAnalysis = analyzer.analyzeSystemTHD(
    fixturesWithTHD.map(f => ({
      quantity: f.quantity,
      powerRating: f.powerRating,
      thd: f.thd!,
      powerFactor: f.powerFactor!
    })),
    transformerRating * 1000 // Convert to VA
  )
  
  // Calculate harmonic filter recommendation if needed
  const filterRecommendation = systemAnalysis.systemTHD > targetTHD
    ? analyzer.recommendHarmonicFilter(
        systemAnalysis.systemTHD,
        systemAnalysis.totalPower / 1000, // Convert to kW
        targetTHD
      )
    : null
  
  const addFixtureGroup = () => {
    const newFixture: FixtureInput = {
      id: Date.now().toString(),
      name: `Zone ${fixtures.length + 1}`,
      quantity: 10,
      powerRating: 600,
      driverType: 'constant-current',
      hasActivePFC: true,
      dimmingLevel: 100
    }
    setFixtures([...fixtures, newFixture])
  }
  
  const updateFixture = (id: string, updates: Partial<FixtureInput>) => {
    setFixtures(fixtures.map(f => f.id === id ? { ...f, ...updates } : f))
  }
  
  const removeFixture = (id: string) => {
    setFixtures(fixtures.filter(f => f.id !== id))
  }
  
  const exportReport = () => {
    const report = {
      fixtures: fixturesWithTHD,
      systemAnalysis,
      filterRecommendation,
      transformerRating,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `thd-compliance-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">THD Compliance Checker</h1>
          <p className="text-gray-400">Analyze Total Harmonic Distortion for DLC Premium compliance</p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>
      
      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">System THD</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className={`text-2xl font-semibold ${
            systemAnalysis.systemTHD < 20 ? 'text-green-400' : 'text-red-400'
          }`}>
            {systemAnalysis.systemTHD.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {systemAnalysis.dlcCompliant ? 'DLC Compliant' : 'Non-compliant'}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Load</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {(systemAnalysis.totalPower / 1000).toFixed(1)} kW
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {((systemAnalysis.totalPower / (transformerRating * 1000)) * 100).toFixed(0)}% of transformer
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Power Factor</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className={`text-2xl font-semibold ${
            systemAnalysis.avgPowerFactor >= 0.9 ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {systemAnalysis.avgPowerFactor.toFixed(3)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {systemAnalysis.avgPowerFactor >= 0.9 ? 'Good' : 'Needs improvement'}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Fixtures</span>
            <Shield className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {fixturesWithTHD.reduce((sum, f) => sum + f.quantity, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {fixtures.length} groups
          </p>
        </div>
      </div>
      
      {/* Fixture Groups */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Fixture Groups</h2>
          <button
            onClick={addFixtureGroup}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
          >
            Add Group
          </button>
        </div>
        
        <div className="space-y-4">
          {fixturesWithTHD.map(fixture => (
            <div key={fixture.id} id={`fixture-${fixture.id}`} className="bg-gray-800 rounded-lg p-4">
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-center">
                <div className="lg:col-span-2">
                  <input
                    type="text"
                    value={fixture.name}
                    onChange={(e) => updateFixture(fixture.id, { name: e.target.value })}
                    className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="Zone name"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={fixture.quantity}
                    onChange={(e) => updateFixture(fixture.id, { quantity: Number(e.target.value) })}
                    className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Watts/Fixture</label>
                  <input
                    type="number"
                    value={fixture.powerRating}
                    onChange={(e) => updateFixture(fixture.id, { powerRating: Number(e.target.value) })}
                    className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Driver Type</label>
                  <select
                    value={fixture.driverType}
                    onChange={(e) => updateFixture(fixture.id, { driverType: e.target.value as any })}
                    className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="programmable">Programmable</option>
                    <option value="constant-current">Constant Current</option>
                    <option value="constant-voltage">Constant Voltage</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Dimming %</label>
                  <input
                    type="number"
                    value={fixture.dimmingLevel}
                    onChange={(e) => updateFixture(fixture.id, { dimmingLevel: Number(e.target.value) })}
                    min="10"
                    max="100"
                    className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={fixture.hasActivePFC}
                      onChange={(e) => updateFixture(fixture.id, { hasActivePFC: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-700 text-purple-600"
                    />
                    <span className="text-gray-300">PFC</span>
                  </label>
                  
                  <button
                    onClick={() => removeFixture(fixture.id)}
                    className="p-1 hover:bg-gray-700 rounded text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Analysis Results */}
              <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">THD:</span>
                  <span className={`ml-2 font-medium ${
                    fixture.thd! < 20 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {fixture.thd!.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Power Factor:</span>
                  <span className="ml-2 text-gray-100">{fixture.powerFactor!.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Power:</span>
                  <span className="ml-2 text-gray-100">
                    {((fixture.quantity * fixture.powerRating) / 1000).toFixed(1)} kW
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className={`ml-2 ${
                    fixture.analysis.dlcCompliant ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {fixture.analysis.dlcCompliant ? 'Compliant' : 'Non-compliant'}
                  </span>
                </div>
              </div>
              
              {fixture.analysis.recommendations.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  {fixture.analysis.recommendations[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* System Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-100 mb-3">System Configuration</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Transformer Rating (kVA)</label>
              <input
                type="number"
                value={transformerRating}
                onChange={(e) => setTransformerRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Target THD %</label>
              <input
                type="number"
                value={targetTHD}
                onChange={(e) => setTargetTHD(Number(e.target.value))}
                max="20"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        </div>
        
        {/* Compliance Status */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-100 mb-3">Compliance Status</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {systemAnalysis.systemTHD < 20 ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm text-gray-300">
                DLC Premium THD Requirement (&lt; 20%)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {systemAnalysis.avgPowerFactor >= 0.9 ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              )}
              <span className="text-sm text-gray-300">
                Power Factor Requirement (≥ 0.9)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {systemAnalysis.systemTHD < 5 ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Info className="w-5 h-5 text-blue-400" />
              )}
              <span className="text-sm text-gray-300">
                IEEE 519 Voltage THD (&lt; 5%)
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mitigation Options */}
      {(systemAnalysis.mitigationOptions.length > 0 || filterRecommendation) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-100">Mitigation Options</h3>
            <button
              onClick={() => setShowMitigation(!showMitigation)}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              {showMitigation ? 'Hide' : 'Show'} details
            </button>
          </div>
          
          {showMitigation && (
            <div className="space-y-4">
              {filterRecommendation && (
                <div className="bg-gray-700/50 rounded p-3">
                  <h4 className="text-sm font-medium text-purple-400 mb-2">
                    Recommended Harmonic Filter
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <span className="ml-2 text-gray-100 capitalize">
                        {filterRecommendation.filterType}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Rating:</span>
                      <span className="ml-2 text-gray-100">
                        {filterRecommendation.rating} kW
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Expected THD:</span>
                      <span className="ml-2 text-green-400">
                        {filterRecommendation.expectedTHD}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Est. Cost:</span>
                      <span className="ml-2 text-gray-100">
                        ${filterRecommendation.cost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {systemAnalysis.mitigationOptions.map((option, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">About THD Compliance</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• DLC Premium requires THD &lt; 20% for qualification</li>
              <li>• Lower THD improves power quality and reduces losses</li>
              <li>• Dimming typically increases THD, especially below 50%</li>
              <li>• Active PFC significantly reduces THD</li>
              <li>• Multiple fixtures can benefit from harmonic cancellation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add missing import
