"use client"

import { useState, useEffect } from 'react'
import { FixtureLibrary, type FixtureModel } from '@/components/FixtureLibrary'

export default function TestDLCPage() {
  const [selectedFixture, setSelectedFixture] = useState<FixtureModel | null>(null)
  
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-2xl font-bold text-white mb-8">DLC Fixtures Test Page</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fixture Library */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Fixture Library</h2>
          <FixtureLibrary 
            onSelectFixture={setSelectedFixture}
            selectedFixtureId={selectedFixture?.id}
          />
        </div>
        
        {/* Selected Fixture Details */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Selected Fixture Details</h2>
          {selectedFixture ? (
            <div className="bg-gray-800 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">{selectedFixture.brand} {selectedFixture.model}</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-gray-400">ID:</dt>
                  <dd>{selectedFixture.id}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Category:</dt>
                  <dd>{selectedFixture.category}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Wattage:</dt>
                  <dd>{selectedFixture.wattage}W</dd>
                </div>
                <div>
                  <dt className="text-gray-400">PPF:</dt>
                  <dd>{selectedFixture.ppf} μmol/s</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Efficacy:</dt>
                  <dd>{selectedFixture.efficacy} μmol/J</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Spectrum:</dt>
                  <dd>{selectedFixture.spectrum}</dd>
                </div>
                {selectedFixture.dlcData && (
                  <div className="mt-4 p-4 bg-green-900/20 border border-green-700/50 rounded">
                    <p className="text-green-400 font-semibold">DLC Qualified Fixture</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Date Qualified: {selectedFixture.dlcData.dateQualified || 'N/A'}
                    </p>
                  </div>
                )}
              </dl>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-gray-400 text-center">
              Select a fixture to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}