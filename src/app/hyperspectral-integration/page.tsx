'use client'

import { useState } from 'react'
import { HyperspectralImaging } from '@/components/HyperspectralImaging'
import PlantBiologyWrapper from '@/components/designer/PlantBiologyWrapper'
import { Microscope, Leaf, ArrowRight } from 'lucide-react'

export default function HyperspectralIntegrationPage() {
  const [showIntegration, setShowIntegration] = useState(true)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">
            Hyperspectral & Plant Biology Integration
          </h1>
          <p className="text-gray-400">
            Real-time plant health monitoring with advanced spectral analysis
          </p>
          
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Microscope className="w-5 h-5 text-purple-400" />
              <span>Hyperspectral Imaging</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500" />
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-400" />
              <span>Plant Biology Analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hyperspectral Imaging Panel */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Hyperspectral Capture & Analysis
            </h2>
            <HyperspectralImaging />
          </div>

          {/* Plant Biology Integration Panel */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Plant Biology Integration
            </h2>
            <PlantBiologyWrapper />
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-6 bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Integration Workflow</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-white">Capture Hyperspectral Data</h4>
                <p className="text-sm text-gray-400">
                  Use the hyperspectral imaging panel to capture and analyze plant spectral signatures
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-white">Calculate Vegetation Indices</h4>
                <p className="text-sm text-gray-400">
                  Automatic calculation of NDVI, EVI, SAVI, PRI, WBI, and MCARI indices
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-white">Send to Plant Biology</h4>
                <p className="text-sm text-gray-400">
                  Click "Send to Plant Biology" to integrate spectral data with biological analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h4 className="font-medium text-white">Integrated Analysis</h4>
                <p className="text-sm text-gray-400">
                  View combined analysis with stress detection, yield predictions, and optimization recommendations
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-blue-400">Pro Tip:</span> After capturing hyperspectral data,
              the system will automatically detect water stress, nutrient deficiencies, and chlorophyll content.
              This data enhances the accuracy of yield predictions and optimization recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}