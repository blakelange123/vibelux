'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Leaf, 
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building,
  Globe,
  Shield,
  FileText
} from 'lucide-react';
import { ESGDashboard } from '@/components/sustainability/ESGDashboard';
import { DemoModeAlert } from '@/components/ui/DemoModeAlert';

export default function CarbonCreditsPage() {
  const [showTransition, setShowTransition] = useState(true);

  if (!showTransition) {
    return (
      <div className="min-h-screen bg-gray-950">
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-white">ESG & Sustainability</h1>
                    <p className="text-sm text-gray-400">Environmental, Social & Governance Reporting</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ESGDashboard />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-white">Carbon Credits → ESG Reporting</h1>
                <p className="text-sm text-gray-400">Transitioning to comprehensive sustainability tracking</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Announcement */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Important Update: Carbon Credits → ESG Reporting
                </h2>
                <p className="text-gray-300 mb-4">
                  We're replacing our blockchain carbon credits concept with a more practical and comprehensive 
                  ESG (Environmental, Social, and Governance) reporting system that provides real value for your 
                  controlled environment agriculture operations.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• <strong className="text-gray-300">Why the change?</strong> Carbon credit markets for CEA are still developing, and regulatory frameworks are uncertain.</p>
                  <p>• <strong className="text-gray-300">What's better?</strong> ESG reporting provides immediate value for investors, customers, and regulatory compliance.</p>
                  <p>• <strong className="text-gray-300">What's included?</strong> Scope 1, 2, and 3 emissions tracking, resource efficiency metrics, and social impact reporting.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Building className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-400">Previous: Carbon Credits</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-gray-500">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Speculative blockchain implementation</span>
                </li>
                <li className="flex items-start gap-2 text-gray-500">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Limited market for CEA carbon credits</span>
                </li>
                <li className="flex items-start gap-2 text-gray-500">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Complex verification requirements</span>
                </li>
                <li className="flex items-start gap-2 text-gray-500">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Uncertain regulatory landscape</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-green-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-900/50 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-green-400">New: ESG Reporting</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Comprehensive Scope 1, 2, 3 emissions tracking</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>GHG Protocol compliant reporting</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Resource efficiency metrics (water, energy, waste)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Social impact and governance tracking</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Benefits of ESG Reporting</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <Globe className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <h4 className="font-medium text-white mb-2">Investor Ready</h4>
                <p className="text-sm text-gray-400">
                  Meet investor ESG requirements and access sustainable finance
                </p>
              </div>
              <div className="text-center p-4">
                <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h4 className="font-medium text-white mb-2">Compliance</h4>
                <p className="text-sm text-gray-400">
                  Prepare for upcoming sustainability regulations and reporting requirements
                </p>
              </div>
              <div className="text-center p-4">
                <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h4 className="font-medium text-white mb-2">Optimization</h4>
                <p className="text-sm text-gray-400">
                  Identify efficiency opportunities and reduce operational costs
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => setShowTransition(false)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              View ESG Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-400 mt-4">
              Your historical data has been preserved and will be integrated into the new ESG reporting system
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}