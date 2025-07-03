'use client';

import { useState } from 'react';
import { ClimateComputerAutoDiscovery } from '@/components/ClimateComputerAutoDiscovery';
import { ClimateIntegrationManager } from '@/components/ClimateIntegrationManager';
import { 
  Server, 
  Network, 
  Shield, 
  Zap, 
  Activity,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight
} from 'lucide-react';

export default function ClimateComputersPage() {
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showManager, setShowManager] = useState(false);

  const supportedBrands = [
    { name: 'Priva', description: 'Connext & Compact CC', protocols: ['Modbus', 'REST API'] },
    { name: 'Hortimax', description: 'Synopta & CX500', protocols: ['Modbus', 'BACnet'] },
    { name: 'Argus Controls', description: 'Titan & AFCON', protocols: ['Modbus', 'BACnet'] },
    { name: 'Trolmaster', description: 'Hydro-X Pro', protocols: ['REST API', 'MQTT'] },
    { name: 'Growlink', description: 'Climate Controllers', protocols: ['REST API'] },
    { name: 'Autogrow', description: 'IntelliClimate', protocols: ['Modbus', 'REST API'] },
    { name: 'Netafim', description: 'NetBeat', protocols: ['REST API', 'MQTT'] }
  ];

  const features = [
    {
      icon: Network,
      title: 'Auto-Discovery',
      description: 'Automatically find climate computers on your network with intelligent protocol detection'
    },
    {
      icon: Zap,
      title: 'One-Click Setup',
      description: 'Configure discovered devices instantly with optimized default settings'
    },
    {
      icon: Activity,
      title: 'Real-Time Monitoring',
      description: 'View live data from all connected climate computers in a unified dashboard'
    },
    {
      icon: Shield,
      title: 'Secure Connection',
      description: 'Enterprise-grade security with encrypted communications and authentication'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Climate Computer Integration</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Connect and manage all your greenhouse climate control systems from one unified platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <button
              onClick={() => setShowDiscovery(true)}
              className="bg-purple-600 hover:bg-purple-700 rounded-lg p-6 transition-all transform hover:scale-105"
            >
              <Server className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Discover Devices</h3>
              <p className="text-purple-200">
                Scan your network to find compatible climate computers
              </p>
              <ArrowRight className="w-5 h-5 mt-4 ml-auto" />
            </button>

            <button
              onClick={() => setShowManager(true)}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-all transform hover:scale-105"
            >
              <Activity className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Manage Integrations</h3>
              <p className="text-gray-400">
                Monitor and control your connected climate systems
              </p>
              <ArrowRight className="w-5 h-5 mt-4 ml-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Advanced Integration Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6">
                <feature.icon className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supported Brands */}
      <div className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Supported Climate Computer Brands</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedBrands.map((brand, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">{brand.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{brand.description}</p>
                <div className="flex flex-wrap gap-2">
                  {brand.protocols.map((protocol, pIndex) => (
                    <span 
                      key={pIndex}
                      className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                    >
                      {protocol}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't see your climate computer? Contact us for custom integration support.
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
                <ol className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">1.</span>
                    Ensure your climate computer is connected to the same network as Vibelux
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">2.</span>
                    Click "Discover Devices" to automatically find compatible systems
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">3.</span>
                    Select a discovered device and use "Quick Setup" for instant configuration
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">4.</span>
                    Monitor all your climate data in the Integration Manager
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discovery Modal */}
      {showDiscovery && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Climate Computer Discovery</h2>
              <button
                onClick={() => setShowDiscovery(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <ClimateComputerAutoDiscovery />
          </div>
        </div>
      )}

      {/* Manager Modal */}
      {showManager && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Climate Integration Manager</h2>
              <button
                onClick={() => setShowManager(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <ClimateIntegrationManager />
          </div>
        </div>
      )}
    </div>
  );
}