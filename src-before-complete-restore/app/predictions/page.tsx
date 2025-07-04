"use client"

import { MachineLearningPredictions } from '@/components/MachineLearningPredictions'

export default function PredictionsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <MachineLearningPredictions />
      </div>
    </div>
  )
}