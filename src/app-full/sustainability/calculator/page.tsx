'use client';

import React from 'react';
import { ESGCalculatorInterface } from '@/components/sustainability/ESGCalculatorInterface';

export default function ESGCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            ESG Carbon Emissions Calculator
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            Calculate your facility's comprehensive carbon footprint including Scope 1, 2, and 3 emissions. 
            Track everything from employee commuting to packaging materials to supply chain impact.
          </p>
        </div>

        <ESGCalculatorInterface />
      </div>
    </div>
  );
}