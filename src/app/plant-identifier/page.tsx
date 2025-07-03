'use client';

import { useState } from 'react';
import { PlantIdentifier } from '@/components/PlantIdentifier';
import { VibeluxPlantData } from '@/lib/plantnet-api';
import { 
  Lightbulb, 
  Settings, 
  Database, 
  TrendingUp, 
  Zap,
  ChevronRight,
  Leaf,
  BarChart3
} from 'lucide-react';

export default function PlantIdentifierPage() {
  const [identifiedPlant, setIdentifiedPlant] = useState<VibeluxPlantData | null>(null);
  const [lightingParams, setLightingParams] = useState<any>(null);

  const handlePlantIdentified = (plant: VibeluxPlantData) => {
    setIdentifiedPlant(plant);
  };

  const handleLightingRecommendation = (params: any) => {
    setLightingParams(params);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Plant Identification &amp; Lighting Assistant</h1>
          <p className="text-gray-400">
            Use AI-powered plant identification to automatically configure optimal lighting parameters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plant Identification Section */}
          <div>
            <PlantIdentifier 
              onPlantIdentified={handlePlantIdentified}
              onLightingRecommendation={handleLightingRecommendation}
            />
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Identified Plant Info */}
            {identifiedPlant && (
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-500" />
                  Plant Identified
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Common Name</p>
                    <p className="text-lg font-medium">{identifiedPlant.commonName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Scientific Name</p>
                    <p className="text-lg font-medium italic">{identifiedPlant.scientificName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Family</p>
                    <p className="text-lg">{identifiedPlant.family}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${identifiedPlant.score * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{(identifiedPlant.score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lighting Recommendations */}
            {lightingParams && (
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Recommended Lighting Parameters
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded p-3">
                      <p className="text-sm text-gray-400 mb-1">PPFD Target</p>
                      <p className="text-2xl font-bold">{lightingParams.ppfd || '200-400'}</p>
                      <p className="text-xs text-gray-500">μmol/m²/s</p>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <p className="text-sm text-gray-400 mb-1">DLI Target</p>
                      <p className="text-2xl font-bold">{lightingParams.dli || '12-20'}</p>
                      <p className="text-xs text-gray-500">mol/m²/day</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded p-3">
                    <p className="text-sm text-gray-400 mb-2">Photoperiod</p>
                    <p className="text-lg">{lightingParams.photoperiod || '16/8 (Light/Dark)'}</p>
                  </div>

                  <div className="bg-gray-800 rounded p-3">
                    <p className="text-sm text-gray-400 mb-2">Spectrum Preferences</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Red (660nm)</span>
                        <span className="text-red-500">{lightingParams.redRatio || '35%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blue (450nm)</span>
                        <span className="text-blue-500">{lightingParams.blueRatio || '25%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Green (520nm)</span>
                        <span className="text-green-500">{lightingParams.greenRatio || '20%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Far Red (730nm)</span>
                        <span className="text-orange-500">{lightingParams.farRedRatio || '10%'}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      // Apply the plant identification recommendations to lighting system
                      alert('Applying lighting recommendations to your system...');
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Apply to Lighting System
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* System Integration Features */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                System Integration
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Database className="w-4 h-4 text-blue-500 mt-0.5" />
                  <span>Store plant profiles in your database for quick access</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Track growth performance with automatic parameter adjustments</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Integrate with VibeLux controllers for automatic configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-500 mt-0.5" />
                  <span>Compare energy usage across different lighting profiles</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}