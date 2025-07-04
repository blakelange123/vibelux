"use client"

import { useState } from 'react'
import { AdvancedAnalyticsDashboard } from '@/components/AdvancedAnalyticsDashboard'
import { SpectralCorrelationDashboard } from '@/components/analytics/SpectralCorrelationDashboard'
import { CannabisCompoundAnalysis } from '@/components/analytics/CannabisCompoundAnalysis'
import InteractiveYieldDashboard from '@/components/analytics/InteractiveYieldDashboard'
import { Brain, BarChart3, Leaf, TrendingUp } from 'lucide-react'

export default function AnalyticsPage() {
  const [activeView, setActiveView] = useState<'yield' | 'general' | 'spectral' | 'cannabis'>('yield')

  return (
    <div className="min-h-screen bg-[#0f0d1f]">
      <div className="container mx-auto px-4 py-8">
        {/* View Toggle */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setActiveView('yield')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeView === 'yield'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Yield Analytics
          </button>
          <button
            onClick={() => setActiveView('general')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeView === 'general'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            General Analytics
          </button>
          <button
            onClick={() => setActiveView('spectral')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeView === 'spectral'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Brain className="w-5 h-5" />
            Spectral Learning
          </button>
          <button
            onClick={() => setActiveView('cannabis')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeView === 'cannabis'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Leaf className="w-5 h-5" />
            Cannabis Analytics
          </button>
        </div>

        {/* Content */}
        {activeView === 'yield' ? (
          <InteractiveYieldDashboard />
        ) : activeView === 'general' ? (
          <AdvancedAnalyticsDashboard />
        ) : activeView === 'spectral' ? (
          <SpectralCorrelationDashboard />
        ) : (
          <CannabisCompoundAnalysis />
        )}
      </div>
    </div>
  )
}