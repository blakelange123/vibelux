"use client"

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { 
  Building,
  Thermometer,
  Leaf,
  BarChart3,
  Layers,
  Activity,
  Calculator,
  Settings,
  Sparkles,
  ChevronLeft,
  TrendingUp,
  Zap,
  Droplets,
  Brain,
  Calendar
} from 'lucide-react'
import { VerticalFarmingOptimizer } from '@/components/VerticalFarmingOptimizer'
import { VerticalFarmEnvironmentalControl } from '@/components/VerticalFarmEnvironmentalControl'
import { VerticalFarmCropRecipes } from '@/components/VerticalFarmCropRecipes'
import { VerticalFarmingAIOptimizer } from '@/components/VerticalFarmingAIOptimizer'
import { VerticalFarmingHarvestScheduler } from '@/components/VerticalFarmingHarvestScheduler'

type TabType = 'optimizer' | 'environment' | 'recipes' | 'ai' | 'harvest'

const tabs: { id: TabType; label: string; icon: any; description: string }[] = [
  { 
    id: 'optimizer', 
    label: 'Layout Optimizer', 
    icon: Building,
    description: '3D visualization and ROI analysis for vertical farm design'
  },
  { 
    id: 'environment', 
    label: 'Environmental Control', 
    icon: Thermometer,
    description: 'Real-time monitoring and automated climate control'
  },
  { 
    id: 'recipes', 
    label: 'Crop Recipes', 
    icon: Leaf,
    description: 'Proven growth recipes with phase-specific parameters'
  },
  { 
    id: 'ai', 
    label: 'AI Optimizer', 
    icon: Brain,
    description: 'Machine learning-powered farm optimization engine'
  },
  { 
    id: 'harvest', 
    label: 'Harvest Scheduler', 
    icon: Calendar,
    description: 'AI-powered harvest prediction and labor planning'
  }
]

function VerticalFarmingSuiteContent() {
  const [activeTab, setActiveTab] = useState<TabType>('optimizer')

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
          <h1 className="text-2xl font-bold text-white">Vertical Farming Suite</h1>
          <p className="text-gray-400 mt-1">Complete tools for indoor vertical farm design and management</p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-900/20 to-transparent py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Professional Vertical Farming Platform
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Design, Optimize, and Manage
            </h2>
            
            <p className="text-lg text-gray-300 max-w-3xl mb-8">
              From initial design to daily operations, our comprehensive suite provides everything 
              you need for successful vertical farming operations.
            </p>

            {/* Key Stats */}
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl w-full">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <Layers className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-2xl font-bold text-white">95%</p>
                <p className="text-sm text-gray-400">Space Efficiency</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <Droplets className="w-8 h-8 text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-white">90%</p>
                <p className="text-sm text-gray-400">Water Savings</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <Zap className="w-8 h-8 text-yellow-400 mb-2" />
                <p className="text-2xl font-bold text-white">40%</p>
                <p className="text-sm text-gray-400">Energy Reduction</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-white">3.2yr</p>
                <p className="text-sm text-gray-400">Avg. Payback</p>
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
                      ? 'text-white bg-green-600 shadow-lg shadow-green-600/20' 
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
            {activeTab === 'optimizer' && <VerticalFarmingOptimizer />}
            {activeTab === 'environment' && <VerticalFarmEnvironmentalControl />}
            {activeTab === 'recipes' && <VerticalFarmCropRecipes />}
            {activeTab === 'ai' && <VerticalFarmingAIOptimizer />}
            {activeTab === 'harvest' && <VerticalFarmingHarvestScheduler />}
          </div>
        </div>
      </main>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-green-900/20 to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Revolutionize Your Growing?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the future of agriculture with data-driven vertical farming solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/case-studies"
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              View Success Stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function VerticalFarmingSuitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <VerticalFarmingSuiteContent />
    </Suspense>
  )
}