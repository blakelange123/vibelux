'use client';

import Navigation from '@/components/Navigation';
import { TM21LifetimeCalculator } from '@/components/fixtures/TM21LifetimeCalculator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TM21Page() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20 pointer-events-none" />
      
      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <Link 
            href="/fixtures" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Fixtures
          </Link>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">TM-21 LED Lifetime Calculator</h1>
            <p className="text-gray-400">
              Calculate LED fixture lifetime projections based on LM-80 test data using the ANSI/IES TM-21-19 standard
            </p>
          </div>

          {/* Calculator Component */}
          <TM21LifetimeCalculator />
        </div>
      </div>
    </div>
  );
}