"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Cloud, Thermometer, Droplets, Wind, Sun, Activity, Shield, Calculator, Factory, Leaf } from 'lucide-react'
import { PsychrometricCalculator } from '@/components/PsychrometricCalculator'
import { EnvironmentalControlCalculator } from '@/components/EnvironmentalControlCalculator'
import { TranspirationCalculator } from '@/components/TranspirationCalculator'
import { EnhancedHeatLoadCalculator } from '@/components/EnhancedHeatLoadCalculator'
import { EnvironmentalMonitoringCalculatorWrapper } from '@/components/EnvironmentalMonitoringCalculatorWrapper'
import { HVACSystemSelectorWrapper } from '@/components/HVACSystemSelectorWrapper'
import { HeatLoadCalculatorWrapper } from '@/components/HeatLoadCalculatorWrapper'
import { LEDThermalManagementWrapper } from '@/components/LEDThermalManagementWrapper'
import { ClimateIntegratedDesign } from '@/components/ClimateIntegratedDesign'
import { GreenhouseClimateIntegration } from '@/components/GreenhouseClimateIntegration'
import { CFDAnalysisPanelWrapper } from '@/components/CFDAnalysisPanelWrapper'
import { GHGEmissionsCalculator } from '@/components/GHGEmissionsCalculator'
import { SustainabilityDashboard } from '@/components/SustainabilityDashboard'

type Tool = 'psychrometric' | 'environmental-control' | 'transpiration' | 'heat-load' | 'monitoring' | 'hvac-selector' | 'basic-heat-load' | 'led-thermal' | 'climate-design' | 'greenhouse-climate' | 'cfd-analysis' | 'ghg-emissions' | 'sustainability' | null

export default function ClimateToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool>(null)

  const tools = [
    {
      id: 'psychrometric' as Tool,
      name: 'Psychrometric Calculator',
      description: 'Air properties and VPD analysis',
      icon: Droplets,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20'
    },
    {
      id: 'environmental-control' as Tool,
      name: 'Environmental Control',
      description: 'HVAC sizing and energy calculations',
      icon: Thermometer,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/20'
    },
    {
      id: 'heat-load' as Tool,
      name: 'Advanced Heat Load',
      description: 'Enhanced thermal analysis with transpiration',
      icon: Sun,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20'
    },
    {
      id: 'basic-heat-load' as Tool,
      name: 'Basic Heat Load',
      description: 'ASHRAE-based heat load calculator',
      icon: Calculator,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      borderColor: 'border-orange-400/20'
    },
    {
      id: 'hvac-selector' as Tool,
      name: 'HVAC System Selector',
      description: 'Compare and select HVAC systems',
      icon: Wind,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
      borderColor: 'border-cyan-400/20'
    },
    {
      id: 'transpiration' as Tool,
      name: 'Transpiration Model',
      description: 'Water use and plant stress analysis',
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/20'
    },
    {
      id: 'led-thermal' as Tool,
      name: 'LED Thermal Management',
      description: 'LED junction temperature and cooling',
      icon: Thermometer,
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/10',
      borderColor: 'border-pink-400/20'
    },
    {
      id: 'climate-design' as Tool,
      name: 'Climate-Integrated Design',
      description: 'Lighting and climate system integration',
      icon: Cloud,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-400/10',
      borderColor: 'border-indigo-400/20'
    },
    {
      id: 'greenhouse-climate' as Tool,
      name: 'Greenhouse Climate',
      description: 'Greenhouse-specific climate control',
      icon: Sun,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      borderColor: 'border-emerald-400/20'
    },
    {
      id: 'monitoring' as Tool,
      name: 'Environmental Monitoring',
      description: 'Real-time monitoring simulation',
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/20'
    },
    {
      id: 'cfd-analysis' as Tool,
      name: 'CFD Analysis',
      description: 'Computational fluid dynamics simulation',
      icon: Wind,
      color: 'text-teal-400',
      bgColor: 'bg-teal-400/10',
      borderColor: 'border-teal-400/20'
    },
    {
      id: 'ghg-emissions' as Tool,
      name: 'GHG Emissions',
      description: 'Greenhouse gas emissions calculator',
      icon: Factory,
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
      borderColor: 'border-gray-400/20'
    },
    {
      id: 'sustainability' as Tool,
      name: 'Sustainability Metrics',
      description: 'Track environmental performance',
      icon: Leaf,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/20'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-white">Climate Tools</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!activeTool ? (
          <>
            <div className="text-center mb-8">
              <Cloud className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Climate Analysis Tools</h2>
              <p className="text-gray-300 text-lg">
                Professional environmental optimization and climate data analysis
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`p-6 rounded-xl border ${tool.borderColor} ${tool.bgColor} bg-gray-900 hover:bg-gray-800 hover:shadow-lg transition-all group`}
                  >
                    <Icon className={`w-12 h-12 ${tool.color} mb-4 mx-auto group-hover:scale-110 transition-transform`} />
                    <h3 className="text-lg font-semibold text-white mb-2">{tool.name}</h3>
                    <p className="text-sm text-gray-300">{tool.description}</p>
                  </button>
                )
              })}
              
              {/* Link to VPD Calculator */}
              <Link
                href="/calculators/vpd"
                className="p-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 bg-gray-900 hover:bg-gray-800 hover:shadow-lg transition-all group"
              >
                <Calculator className="w-12 h-12 text-cyan-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white mb-2">VPD Calculator</h3>
                <p className="text-sm text-gray-300">Vapor pressure deficit optimization</p>
              </Link>
            </div>
          </>
        ) : (
          <div>
            <button
              onClick={() => setActiveTool(null)}
              className="mb-4 text-gray-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Climate Tools
            </button>
            
            {activeTool === 'psychrometric' && <PsychrometricCalculator />}
            {activeTool === 'environmental-control' && <EnvironmentalControlCalculator />}
            {activeTool === 'heat-load' && <EnhancedHeatLoadCalculator />}
            {activeTool === 'basic-heat-load' && <HeatLoadCalculatorWrapper />}
            {activeTool === 'hvac-selector' && <HVACSystemSelectorWrapper />}
            {activeTool === 'transpiration' && <TranspirationCalculator />}
            {activeTool === 'led-thermal' && <LEDThermalManagementWrapper />}
            {activeTool === 'climate-design' && <ClimateIntegratedDesign />}
            {activeTool === 'greenhouse-climate' && <GreenhouseClimateIntegration />}
            {activeTool === 'monitoring' && <EnvironmentalMonitoringCalculatorWrapper />}
            {activeTool === 'cfd-analysis' && <CFDAnalysisPanelWrapper />}
            {activeTool === 'ghg-emissions' && <GHGEmissionsCalculator />}
            {activeTool === 'sustainability' && <SustainabilityDashboard />}
          </div>
        )}
      </main>
    </div>
  )
}