"use client"
import { useState } from 'react'
import { PlantIdentifier } from '@/components/PlantIdentifier'
import { VibeluxPlantData } from '@/lib/plantnet-api'
import { 
  Lightbulb, 
  Settings, 
  Database, 
  TrendingUp, 
  Zap,
  ChevronRight,
  Leaf,
  BarChart3
} from 'lucide-react'

export default function PlantIdentifierPage() {
  const [identifiedPlant, setIdentifiedPlant] = useState<VibeluxPlantData | null>(null)
  const [lightingParams, setLightingParams] = useState<any>(null)

  const handlePlantIdentified = (plant: VibeluxPlantData) => {
    setIdentifiedPlant(plant)
  }

  const handleLightingRecommendation = (params: any) => {
    setLightingParams(params)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plant Identification & Lighting Assistant</h1>
        <p className="text-gray-600">
          Use AI-powered plant identification to automatically configure optimal lighting parameters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plant Identifier Component */}
        <div>
          <PlantIdentifier
            onPlantIdentified={handlePlantIdentified}
            onLightingRecommendation={handleLightingRecommendation}
          />

          {/* Feature Benefits */}
          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              How It Works
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-green-700">1</span>
                </div>
                <div>
                  <div className="font-medium text-sm">Upload Plant Photos</div>
                  <div className="text-xs text-gray-600">
                    Take 1-5 photos of different parts (leaf, flower, whole plant)
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-green-700">2</span>
                </div>
                <div>
                  <div className="font-medium text-sm">AI Identifies Species</div>
                  <div className="text-xs text-gray-600">
                    PlantNet's deep learning model identifies your plant
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-green-700">3</span>
                </div>
                <div>
                  <div className="font-medium text-sm">Get Lighting Recipe</div>
                  <div className="text-xs text-gray-600">
                    Automatically receive optimal PPFD, spectrum, and photoperiod
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results and Recommendations */}
        <div className="space-y-6">
          {/* Identified Plant Details */}
          {identifiedPlant && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Identified Plant
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Scientific Name</div>
                  <div className="font-medium">{identifiedPlant.scientificName}</div>
                </div>
                {identifiedPlant.commonNames.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600">Common Names</div>
                    <div className="font-medium">{identifiedPlant.commonNames.join(', ')}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Family</div>
                    <div className="font-medium">{identifiedPlant.family}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Confidence</div>
                    <div className="font-medium text-green-600">
                      {(identifiedPlant.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lighting Recommendations */}
          {lightingParams && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Recommended Lighting Parameters
              </h3>
              
              <div className="space-y-4">
                {/* PPFD */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">PPFD</div>
                    <div className="text-sm text-gray-600">Photosynthetic Photon Flux Density</div>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {lightingParams.ppfd} μmol/m²/s
                  </div>
                </div>

                {/* Photoperiod */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">Photoperiod</div>
                    <div className="text-sm text-gray-600">Daily light hours</div>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {lightingParams.photoperiod} hours
                  </div>
                </div>

                {/* DLI */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">DLI</div>
                    <div className="text-sm text-gray-600">Daily Light Integral</div>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {lightingParams.dli} mol/m²/day
                  </div>
                </div>

                {/* Spectrum */}
                <div>
                  <div className="font-medium mb-2">Spectrum Distribution</div>
                  <div className="space-y-2">
                    {Object.entries(lightingParams.spectrum).map(([color, value]) => (
                      <div key={color} className="flex items-center gap-2">
                        <div className="w-20 text-sm capitalize">{color}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full ${
                              color === 'blue' ? 'bg-blue-500' :
                              color === 'green' ? 'bg-green-500' :
                              color === 'red' ? 'bg-red-500' :
                              color === 'farRed' ? 'bg-red-800' :
                              'bg-purple-500'
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <div className="w-12 text-sm text-right">{value}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-green-700 flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" />
                    Apply to Design
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-2 font-medium hover:bg-gray-200 flex items-center justify-center gap-2">
                    <Database className="w-4 h-4" />
                    Save Recipe
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Integration Benefits */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Integration Benefits
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Reduce setup time by 50-70% with automatic species identification</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Eliminate guesswork with science-based lighting recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Build a comprehensive plant database specific to your operation</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Optimize energy usage with species-specific lighting parameters</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}