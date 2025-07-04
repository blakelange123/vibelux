"use client"

import { ProductionPlanner } from '@/components/ProductionPlanner'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProductionPlannerPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Dark gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-pink-900/20" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <Link 
              href="/calculators" 
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Calculators
            </Link>
          </div>
        </div>
        
        {/* Calculator Content */}
        <div className="container mx-auto px-4 py-8">
          <ProductionPlanner />
        </div>
      </div>
    </div>
  )
}