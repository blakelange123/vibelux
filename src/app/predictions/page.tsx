"use client"

import { useState, useEffect } from 'react'
import { MachineLearningPredictions } from '@/components/MachineLearningPredictions'
import { Brain, TrendingUp, Activity, Sparkles } from 'lucide-react'
import { PermissionWrapper } from '@/components/PermissionWrapper'

function PredictionsPageComponent() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden">
      {/* Dark background with subtle gradient */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20" />
      </div>
      
      <div className="relative z-10">
        {/* Dark header */}
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-purple-400" />
                <h1 className="text-2xl font-bold text-gray-100">AI Predictions</h1>
                <div className="hidden md:flex items-center gap-4 ml-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-gray-300">Active</span>
                  </div>
                  <div className="text-gray-600">|</div>
                  <span className="text-gray-300">7 Models</span>
                  <div className="text-gray-600">|</div>
                  <span className="text-gray-300">94.5% Accuracy</span>
                  <div className="text-gray-600">|</div>
                  <span className="text-gray-300">247/hr</span>
                </div>
              </div>
              
              {/* Mobile stats */}
              <div className="md:hidden flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-gray-300">94.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <MachineLearningPredictions />
        </div>
      </div>
    </div>
  )
}

export default function PredictionsPage() {
  return (
    <PermissionWrapper permission="canAccessPredictions">
      <PredictionsPageComponent />
    </PermissionWrapper>
  );
}