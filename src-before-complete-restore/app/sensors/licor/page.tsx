'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sun, 
  Activity,
  Gauge,
  Settings,
  Plus,
  Info,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { LICORMonitor } from '@/components/sensors/LICORMonitor';

export default function LICORSensorsPage() {
  const [showCalibration, setShowCalibration] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="gradient-overlay" />
      
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/sensors" 
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Sun className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">LI-COR Sensors</h1>
                  <p className="text-sm text-gray-400">Research-grade quantum sensors</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSetup(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Sensor
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-b from-green-900/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Scientific-Grade Light Measurement
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                LI-COR quantum sensors provide the most accurate PAR measurements available, 
                with NIST-traceable calibration and industry-leading stability.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="font-medium">±5% Accuracy</div>
                    <div className="text-sm text-gray-400">NIST-traceable calibration</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="font-medium">True Quantum Response</div>
                    <div className="text-sm text-gray-400">400-700nm spectral range</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="font-medium">Automated DLI Tracking</div>
                    <div className="text-sm text-gray-400">Real-time accumulation monitoring</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-4">Why LI-COR?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Gauge className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <div className="font-medium">Validate Your Design</div>
                    <div className="text-sm text-gray-400">
                      Compare calculated PPFD with actual measurements
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-yellow-400 mt-1" />
                  <div>
                    <div className="font-medium">Optimize Energy Use</div>
                    <div className="text-sm text-gray-400">
                      Dim fixtures based on real-time light levels
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <div className="font-medium">Track Performance</div>
                    <div className="text-sm text-gray-400">
                      Monitor fixture degradation over time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-8 p-4 bg-blue-900/20 border border-blue-600/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">
                Integration with Vibelux Design
              </h3>
              <p className="text-sm text-gray-300">
                LI-COR sensor readings automatically validate and calibrate your lighting designs. 
                Place sensors at critical points to ensure your calculated PPFD values match reality.
              </p>
            </div>
          </div>
        </div>

        {/* Monitor Component */}
        <LICORMonitor />

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="font-semibold text-white mb-3">Supported Models</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• LI-190R Quantum Sensor (PAR)</li>
              <li>• LI-200R Pyranometer (Solar)</li>
              <li>• LI-210R Photometric (Lux)</li>
              <li>• LI-250A Light Meter</li>
              <li>• LI-1500 Data Logger</li>
            </ul>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="font-semibold text-white mb-3">Key Metrics</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Real-time PPFD monitoring</li>
              <li>• Daily Light Integral (DLI)</li>
              <li>• Peak & average light levels</li>
              <li>• Photoperiod tracking</li>
              <li>• Historical trending</li>
            </ul>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="font-semibold text-white mb-3">Integration Features</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Auto-validation of designs</li>
              <li>• Fixture dimming control</li>
              <li>• CSV data export</li>
              <li>• API access for automation</li>
              <li>• Alert notifications</li>
            </ul>
          </div>
        </div>

        {/* Calibration Section */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Calibration & Maintenance</h3>
            <button
              onClick={() => setShowCalibration(!showCalibration)}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Calibration Tools
            </button>
          </div>
          
          {showCalibration && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300">
                    LI-COR sensors should be recalibrated every 2 years or when readings drift 
                    more than 5% from expected values. Use a calibrated light source for best results.
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-white mb-2">Last Calibration</h4>
                  <p className="text-sm text-gray-400">January 15, 2024</p>
                  <p className="text-xs text-gray-500 mt-1">Next due: January 15, 2026</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Calibration Constant</h4>
                  <p className="text-sm text-gray-400">199.8 μmol·m⁻²·s⁻¹ per mA</p>
                  <p className="text-xs text-gray-500 mt-1">Factory: 200.0</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}