"use client"

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { 
  Calculator,
  FileType,
  Lightbulb,
  Activity,
  Zap,
  Building,
  Layers,
  Sparkles,
  ChevronLeft
} from 'lucide-react'
import { LPDCalculator } from '@/components/LPDCalculator'
import { EnhancedCADIntegration } from '@/components/EnhancedCADIntegration'
import { AdvancedSpectralOptimization } from '@/components/AdvancedSpectralOptimization'

type TabType = 'lpd' | 'cad' | 'spectrum'

const tabs: { id: TabType; label: string; icon: any; description: string }[] = [
  { 
    id: 'lpd', 
    label: 'LPD Calculator', 
    icon: Calculator,
    description: 'Calculate Lighting Power Density with code compliance checking for ASHRAE, IECC, and Title 24'
  },
  { 
    id: 'cad', 
    label: 'CAD Integration', 
    icon: FileType,
    description: 'Import architectural drawings and export lighting designs with full CAD compatibility'
  },
  { 
    id: 'spectrum', 
    label: 'Spectrum Optimization', 
    icon: Lightbulb,
    description: 'Multi-channel LED spectrum tuning for optimal plant growth and energy efficiency'
  }
]

function LightingToolsContent() {
  const [activeTab, setActiveTab] = useState<TabType>('lpd')

  return (
    <div className="min-h-screen bg-gray-950 -mt-16">
      {/* Page Header */}
      <div className="bg-gray-900 border-b border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white">Advanced Lighting Tools</h1>
          <p className="text-gray-400 mt-1">Professional tools for lighting design and optimization</p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-900/20 to-transparent py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Professional Lighting Design Suite
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Advanced Design & Compliance Tools
            </h2>
            
            <p className="text-lg text-gray-300 max-w-3xl mb-8">
              Professional-grade tools for lighting designers and engineers. Ensure code compliance, 
              integrate with CAD workflows, and optimize spectrum for any application.
            </p>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <Building className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-lg font-bold text-white">Code Compliance</p>
                <p className="text-sm text-gray-400">ASHRAE, IECC, Title 24</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <Layers className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-lg font-bold text-white">CAD Integration</p>
                <p className="text-sm text-gray-400">DWG, DXF, IFC, PDF</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <Activity className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-lg font-bold text-white">Spectrum Control</p>
                <p className="text-sm text-gray-400">9-Channel Optimization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center space-x-2 py-2" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group relative px-6 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'text-white bg-purple-600 shadow-lg shadow-purple-600/20' 
                      : 'text-gray-300 bg-gray-800 hover:text-white hover:bg-gray-700 border border-gray-700'
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
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Description */}
          <div className="mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-sm text-gray-300 text-center">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>

          {/* Tab Content */}
          <div className="w-full">
            {activeTab === 'lpd' && <LPDCalculator />}
            {activeTab === 'cad' && <EnhancedCADIntegration />}
            {activeTab === 'spectrum' && <AdvancedSpectralOptimization />}
          </div>
        </div>
      </main>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Professional Tools for Professional Results
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of lighting designers using Vibelux to create 
            code-compliant, energy-efficient lighting systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/case-studies"
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              View Case Studies
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function LightingToolsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <LightingToolsContent />
    </Suspense>
  )
}