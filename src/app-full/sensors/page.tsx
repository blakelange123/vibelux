"use client"

import { useState, useEffect } from 'react'
import { PermissionWrapper } from '@/components/PermissionWrapper'
import Link from 'next/link'
import { 
  ArrowLeft,
  Activity,
  Wifi,
  Upload,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Grid3x3,
  FileSpreadsheet,
  Target,
  Brain,
  LineChart
} from 'lucide-react'
import { VirtualSensorGrid } from '@/components/VirtualSensorGrid'
import { SensorDataImporter } from '@/components/SensorDataImporter'
import { SpectrumIntegration } from '@/components/SpectrumIntegration'
import { SensorIntegrationDemo } from '@/components/SensorIntegrationDemo'
import { RealTimeSensorMonitor } from '@/components/RealTimeSensorMonitor'
import { SensorAIPredictions } from '@/components/SensorAIPredictions'
import { SensorComparisonTool } from '@/components/SensorComparisonTool'
import { SensorDataVisualization } from '@/components/SensorDataVisualization'
import { SensorCalibrationGuide } from '@/components/SensorCalibrationGuide'
import { SensorAPIDocumentation } from '@/components/SensorAPIDocumentation'
import { useDesignSync } from '@/hooks/useDesignSync'

type TabType = 'virtual' | 'import' | 'spectrum' | 'monitor' | 'predictions' | 'compare'

function SensorsPageComponent() {
  const [activeTab, setActiveTab] = useState<TabType>('virtual')
  const [importedData, setImportedData] = useState<any[]>([])
  const { currentDesign, getFixturesForSensor, roomDimensions } = useDesignSync()
  
  // Ensure dark mode is applied
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.body.style.backgroundColor = '#000000'
    document.body.style.color = '#ffffff'
  }, [])

  // Use fixtures from current design or fall back to examples
  const fixtures = currentDesign ? getFixturesForSensor() : [
    { x: 5, y: 5, z: 8, ppf: 1800, beamAngle: 120 },
    { x: 15, y: 5, z: 8, ppf: 1800, beamAngle: 120 },
    { x: 5, y: 15, z: 8, ppf: 1800, beamAngle: 120 },
    { x: 15, y: 15, z: 8, ppf: 1800, beamAngle: 120 },
  ]

  const roomWidth = roomDimensions?.width || 20
  const roomLength = roomDimensions?.length || 20

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'virtual', label: 'Virtual Grid', icon: Grid3x3 },
    { id: 'import', label: 'Import Data', icon: Upload },
    { id: 'spectrum', label: 'Spectrum', icon: Wifi },
    { id: 'monitor', label: 'Monitor', icon: Activity },
    { id: 'predictions', label: 'Predictions', icon: Brain },
    { id: 'compare', label: 'Compare', icon: BarChart3 }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Add gradient overlay */}
      <div className="gradient-overlay" />
      
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-white">Sensor Integration</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/fixtures"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Fixtures
              </Link>
              <Link 
                href="/calculators"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Calculators
              </Link>
              <Link 
                href="/design/advanced"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Design Studio
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-purple-900/20 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Virtual & Physical Sensor Integration
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Beyond Hardware Limitations
            </h2>
            
            <p className="text-lg text-gray-300 max-w-3xl mb-8">
              Vibelux combines virtual sensor modeling with real hardware integration,
              giving you unprecedented insight into your grow environment.
            </p>

            {/* Key Benefits */}
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full mx-auto">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <Grid3x3 className="w-10 h-10 text-purple-400 mb-4 mx-auto" />
                <h3 className="font-semibold text-white mb-2 text-lg">Unlimited Virtual Sensors</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Place sensors anywhere without hardware costs
                </p>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <FileSpreadsheet className="w-10 h-10 text-green-400 mb-4 mx-auto" />
                <h3 className="font-semibold text-white mb-2 text-lg">Hardware Validation</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Import data from any sensor brand to verify designs
                </p>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <Target className="w-10 h-10 text-blue-400 mb-4 mx-auto" />
                <h3 className="font-semibold text-white mb-2 text-lg">AI Optimization</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Machine learning improves predictions with each validation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center space-x-2 py-2" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group relative px-6 py-3 text-sm font-medium rounded-lg transition-all
                    ${activeTab === tab.id 
                      ? 'text-purple-400 bg-gray-800 shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Design Indicator */}
        {currentDesign && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-600/30 rounded-xl">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Using Current Design</span>
              <span className="text-sm text-green-300">
                ({roomWidth}' × {roomLength}' room with {fixtures.length} fixtures)
              </span>
            </div>
          </div>
        )}

          {/* Tab Content */}
          <div className="w-full">
          {activeTab === 'virtual' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-purple-600/30">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Virtual Sensors: The Future of Grow Monitoring
                    </h3>
                    <p className="text-sm text-gray-300">
                      Why buy hundreds of physical sensors when Vibelux can simulate them all? 
                      Our virtual sensor grid provides instant readings at any point in your grow space, 
                      with accuracy validated by real-world data from thousands of installations.
                    </p>
                  </div>
                </div>
              </div>
              
              <VirtualSensorGrid
                roomWidth={roomWidth}
                roomLength={roomLength}
                fixtures={fixtures}
                gridResolution={2}
              />
              
              {/* Comparison Section */}
              <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center justify-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  Virtual vs Physical Sensors
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <h4 className="font-semibold text-purple-400 mb-4 text-center">Virtual Sensors (Vibelux)</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Unlimited measurement points</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Zero hardware cost</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Instant setup and configuration</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Predictive analytics included</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-400 mb-4 text-center">Physical Sensors (Traditional)</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">$300-500 per sensor</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Limited to sensor locations</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Complex installation required</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Regular calibration needed</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-600/30">
                <div className="flex items-start gap-3">
                  <Upload className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Import & Validate Sensor Data
                    </h3>
                    <p className="text-sm text-gray-300">
                      Import readings from your existing sensors to validate Vibelux predictions. 
                      Our AI learns from every data point, continuously improving accuracy for all users.
                    </p>
                  </div>
                </div>
              </div>
              
              <SensorDataImporter onDataImported={setImportedData} />
            </div>
          )}

          {activeTab === 'spectrum' && (
            <div className="space-y-8">
              <SpectrumIntegration />
              <SensorCalibrationGuide />
            </div>
          )}

          {activeTab === 'monitor' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-600/30">
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Real-Time Monitoring & Alerts
                    </h3>
                    <p className="text-sm text-gray-300">
                      Monitor sensor readings in real-time with intelligent alerts. Track PPFD, temperature, 
                      humidity, CO2, and VPD across all sensor points with historical trending and anomaly detection.
                    </p>
                  </div>
                </div>
              </div>
              
              <RealTimeSensorMonitor />
              <SensorDataVisualization />
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-600/30">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      AI-Powered Predictive Analytics
                    </h3>
                    <p className="text-sm text-gray-300">
                      Our AI analyzes patterns in your sensor data to predict future performance, 
                      identify potential issues before they occur, and recommend optimizations to 
                      maximize yield while minimizing energy costs.
                    </p>
                  </div>
                </div>
              </div>
              
              <SensorAIPredictions />
              <SensorAPIDocumentation />
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-600/30">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Sensor System Comparison
                    </h3>
                    <p className="text-sm text-gray-300">
                      Compare Vibelux's virtual sensor approach with traditional hardware sensor grids. 
                      See real costs, capabilities, and ROI calculations based on your specific room size and requirements.
                    </p>
                  </div>
                </div>
              </div>
              
              <SensorComparisonTool />
            </div>
          )}
        </div>

        {/* Live Demo Section */}
        <div className="mt-12">
          <SensorIntegrationDemo />
        </div>
      </main>

      {/* Call to Action */}
      <section className="relative py-20 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Go Beyond Hardware?
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of growers using Vibelux to design perfect lighting systems 
            with virtual sensors and AI-powered optimization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Free Trial
            </Link>
            <button
              onClick={() => window.dispatchEvent(new Event('openAIAssistant'))}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Try AI Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function SensorsPage() {
  return (
    <PermissionWrapper permission="canAccessSensors">
      <SensorsPageComponent />
    </PermissionWrapper>
  );
}