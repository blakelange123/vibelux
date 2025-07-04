"use client";

import { useState, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  Leaf, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  X,
  ChevronRight,
  Info,
  Search,
  Lightbulb
} from 'lucide-react';
import { plantNetAPI, PlantNetResult, VibeluxPlantData } from '@/lib/plantnet-api';

interface PlantIdentifierProps {
  onPlantIdentified?: (plant: VibeluxPlantData) => void;
  onLightingRecommendation?: (params: any) => void;
}

export function PlantIdentifier({ onPlantIdentified, onLightingRecommendation }: PlantIdentifierProps) {
  const [images, setImages] = useState<{ file: File; preview: string; organ?: string }[]>([]);
  const [identifying, setIdentifying] = useState(false);
  const [results, setResults] = useState<PlantNetResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<PlantNetResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed')
      return
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      organ: 'auto' // Default to auto-detect
    }))

    setImages(prev => [...prev, ...newImages])
    setError(null)
  }, [images])

  // Remove image
  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }, [])

  // Update organ type for an image
  const updateOrgan = useCallback((index: number, organ: string) => {
    setImages(prev => {
      const updated = [...prev]
      updated[index].organ = organ
      return updated
    })
  }, [])

  // Identify plant
  const identifyPlant = useCallback(async () => {
    if (images.length === 0) {
      setError('Please upload at least one image')
      return
    }

    setIdentifying(true)
    setError(null)
    setResults([])

    try {
      const files = images.map(img => img.file)
      const organs = images.map(img => img.organ || 'auto')
      
      const response = await plantNetAPI.identify(files, organs)
      
      setResults(response.results)
      setRemainingRequests(response.remainingIdentificationRequests)

      if (response.results.length === 0) {
        setError('No plants identified. Try different images or angles.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to identify plant')
    } finally {
      setIdentifying(false)
    }
  }, [images])

  // Select a result and get lighting recommendations
  const selectResult = useCallback(async (result: PlantNetResult) => {
    setSelectedResult(result)
    
    // Convert to Vibelux format
    const vibeluxData = plantNetAPI.formatForVibelux([result])[0]
    
    // Notify parent component
    onPlantIdentified?.(vibeluxData)
    
    // Get lighting recommendations based on species
    // This would typically call another service or database
    const lightingParams = await getLightingRecommendations(result.species.scientificNameWithoutAuthor)
    onLightingRecommendation?.(lightingParams)
  }, [onPlantIdentified, onLightingRecommendation])

  // Mock function to get lighting recommendations
  // In production, this would query a cultivation database
  const getLightingRecommendations = async (scientificName: string) => {
    // Simulated database lookup
    const recommendations: { [key: string]: any } = {
      'Lactuca sativa': {
        ppfd: 250,
        photoperiod: 16,
        dli: 14.4,
        spectrum: { blue: 20, green: 10, red: 65, farRed: 5, uv: 0 }
      },
      'Solanum lycopersicum': {
        ppfd: 400,
        photoperiod: 14,
        dli: 20.2,
        spectrum: { blue: 15, green: 10, red: 70, farRed: 5, uv: 0 }
      },
      'Cannabis sativa': {
        ppfd: 800,
        photoperiod: 12,
        dli: 34.6,
        spectrum: { blue: 18, green: 12, red: 65, farRed: 5, uv: 0 }
      }
    }
    
    // Default recommendation if species not found
    return recommendations[scientificName] || {
      ppfd: 300,
      photoperiod: 14,
      dli: 15.1,
      spectrum: { blue: 20, green: 10, red: 65, farRed: 5, uv: 0 }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600" />
          Plant Identification
        </h3>
        <p className="text-sm text-gray-600">
          Upload photos of your plant to automatically identify species and get lighting recommendations
        </p>
      </div>

      {/* Image Upload Area */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="plant-images"
            disabled={identifying}
          />
          <label
            htmlFor="plant-images"
            className="cursor-pointer inline-flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              Click to upload images (max 5)
            </span>
            <span className="text-xs text-gray-500 mt-1">
              For best results, include leaf, flower, and whole plant photos
            </span>
          </label>
        </div>

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img.preview}
                  alt={`Plant ${idx + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <select
                  value={img.organ}
                  onChange={(e) => updateOrgan(idx, e.target.value)}
                  className="absolute bottom-1 left-1 right-1 text-xs bg-white/90 rounded px-1"
                >
                  <option value="auto">Auto</option>
                  <option value="leaf">Leaf</option>
                  <option value="flower">Flower</option>
                  <option value="fruit">Fruit</option>
                  <option value="bark">Bark</option>
                  <option value="habit">Whole</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Identify Button */}
      <button
        onClick={identifyPlant}
        disabled={images.length === 0 || identifying}
        className="w-full bg-green-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {identifying ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Identifying...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Identify Plant
          </>
        )}
      </button>

      {/* API Quota Display */}
      {remainingRequests !== null && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {remainingRequests} identifications remaining today
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Identification Results
          </h4>
          <div className="space-y-2">
            {results.slice(0, 5).map((result, idx) => (
              <div
                key={idx}
                onClick={() => selectResult(result)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedResult === result
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {result.species.scientificNameWithoutAuthor}
                    </div>
                    {result.species.commonNames.length > 0 && (
                      <div className="text-xs text-gray-600">
                        {result.species.commonNames.slice(0, 2).join(', ')}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Family: {result.species.family.scientificNameWithoutAuthor}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-sm font-medium text-green-600">
                      {(result.score * 100).toFixed(1)}%
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedResult && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-blue-900 mb-1">
                    Lighting Recommendation Available
                  </div>
                  <div className="text-xs text-blue-700">
                    Click "Apply to Design" in the lighting designer to use recommended parameters
                    for {selectedResult.species.commonNames[0] || selectedResult.species.scientificNameWithoutAuthor}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}