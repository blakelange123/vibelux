'use client';

import { CropPlanningSimulator } from '@/components/CropPlanningSimulator';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

export default function CropPlanningSimulatorPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Dark gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
      
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
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Crop Planning & Profitability Simulator
                </h1>
                <p className="text-gray-400 max-w-2xl">
                  Forward-looking intelligence for your cultivation facility. Simulate environmental conditions, 
                  predict crop performance, and forecast profitability over multiple growth cycles.
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-purple-300 mt-1 block">Predictive</span>
                </div>
                <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-xs text-green-300 mt-1 block">Economics</span>
                </div>
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-xs text-blue-300 mt-1 block">Multi-Cycle</span>
                </div>
                <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <span className="text-xs text-orange-300 mt-1 block">Risk Analysis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Simulator Content */}
        <div className="container mx-auto px-4 py-8">
          <CropPlanningSimulator />
        </div>
      </div>
    </div>
  );
}