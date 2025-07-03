"use client"
import { useState, useEffect } from 'react'
import { Brain, Sparkles } from 'lucide-react'
import { PlantBiologyIntegration } from './PlantBiologyIntegration'
import { PlantBiologyIntegrationEnhanced } from './PlantBiologyIntegrationEnhanced'

export default function PlantBiologyWrapper(props: any = {}) {
  const [useEnhanced, setUseEnhanced] = useState(true)
  const [hyperspectralData, setHyperspectralData] = useState<any>(null)
  
  // Listen for hyperspectral data updates
  useEffect(() => {
    const handleHyperspectralData = (event: CustomEvent) => {
      setHyperspectralData(event.detail)
    }
    
    window.addEventListener('hyperspectralDataUpdate', handleHyperspectralData as EventListener)
    return () => {
      window.removeEventListener('hyperspectralDataUpdate', handleHyperspectralData as EventListener)
    }
  }, [])
  
  // Default environmental conditions if not provided
  const defaultEnvironmentalConditions = {
    co2: 800,
    temperature: 22,
    humidity: 65,
    airflow: 0.3
  }
  
  // Convert basic environmental conditions to enhanced format
  const enhancedEnvironmentalConditions = {
    ...(props.environmentalConditions || defaultEnvironmentalConditions),
    vpd: props.environmentalConditions?.vpd || 1.0,
    waterAvailability: 0.95, // Default high availability
    substrateMoisture: 65, // Default 65%
    irrigationEC: 1.8,
    irrigationPH: 6.0,
    rootZoneTemp: (props.environmentalConditions?.temperature || defaultEnvironmentalConditions.temperature) - 2, // Slightly cooler
    rootZoneOxygen: 8.0, // mg/L - good aeration
    nutrients: {
      nitrogen: 150,
      phosphorus: 50,
      potassium: 200,
      calcium: 150,
      magnesium: 50,
      sulfur: 60,
      iron: 3.0,
      manganese: 0.5,
      zinc: 0.3,
      copper: 0.1,
      boron: 0.5,
      molybdenum: 0.05,
      chloride: 50
    }
  }
  
  // Mock plant health data
  const plantHealthData = {
    overallScore: 95,
    issues: [],
    tissueAnalysis: {
      date: new Date().toISOString(),
      results: enhancedEnvironmentalConditions.nutrients,
      deficiencies: [],
      toxicities: []
    }
  }
  
  // Mock growth history
  const growthHistory = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
    height: 5 + i * 0.8,
    leafCount: 4 + Math.floor(i / 3),
    biomass: 10 + i * 2
  }))
  
  // Default plant species and lighting system
  const defaultSelectedSpecies = {
    id: 'lettuce-butterhead',
    name: 'Butterhead Lettuce',
    category: 'leafy_greens' as const,
    photosynthesis: {
      lightSaturation: 400,
      lightCompensation: 50,
      co2Saturation: 1200,
      quantumEfficiency: 0.08,
      photosystemII_efficiency: 0.85,
      actionSpectrum: []
    },
    morphology: {
      leafAreaIndex: 2.5,
      canopyExtinction: 0.85,
      leafThickness: 0.4,
      chlorophyllContent: 350,
      canopyHeight: 20
    },
    responses: {
      redFarRedRatio: {
        stemElongation: (ratio: number) => 1 + (1 - ratio) * 0.3,
        leafExpansion: (ratio: number) => 1 + ratio * 0.2,
        flowering: (ratio: number) => ratio > 2 ? 0.8 : 1.2
      },
      blueLight: {
        compactness: (percentage: number) => 1 + percentage * 0.02,
        chlorophyll: (percentage: number) => 300 + percentage * 2,
        stomatalConductance: (percentage: number) => 0.05 + percentage * 0.001
      },
      uvResponse: {
        anthocyanins: (intensity: number) => intensity * 15,
        flavonoids: (intensity: number) => intensity * 10,
        morphogenesis: (intensity: number) => 1 - intensity * 0.05
      }
    },
    growthStages: {
      seedling: {
        duration: 14,
        dli_min: 8,
        dli_max: 12,
        photoperiod: 16,
        spectrum_weights: { 450: 0.3, 660: 0.5, 730: 0.1, 550: 0.1 },
        temperature_optimal: 20,
        humidity_optimal: 70
      },
      vegetative: {
        duration: 21,
        dli_min: 14,
        dli_max: 20,
        photoperiod: 16,
        spectrum_weights: { 450: 0.25, 660: 0.55, 730: 0.05, 550: 0.15 },
        temperature_optimal: 22,
        humidity_optimal: 65
      }
    },
    circadianResponse: {
      dawnDuskSensitivity: 0.8,
      phaseShiftCapability: 2,
      entrainmentRange: 6
    }
  }
  
  const defaultLightingSystem = {
    fixtures: [{
      id: 'fixture-1',
      spectrum: { 450: 0.25, 550: 0.15, 660: 0.55, 730: 0.05 },
      ppfd: 300,
      photoperiod: 16,
      position: { x: 5, y: 5, z: 3 }
    }]
  }
  
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Plant Biology Analysis</h3>
        <button
          onClick={() => setUseEnhanced(!useEnhanced)}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
            useEnhanced 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {useEnhanced ? <Sparkles className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
          {useEnhanced ? 'Enhanced Model' : 'Simple Model'}
        </button>
      </div>
      
      {useEnhanced ? (
        <PlantBiologyIntegrationEnhanced
          selectedSpecies={props.selectedSpecies || defaultSelectedSpecies}
          currentStage={props.currentStage || 'vegetative'}
          environmentalConditions={enhancedEnvironmentalConditions}
          lightingSystem={props.lightingSystem || defaultLightingSystem}
          plantHealthData={plantHealthData}
          growthHistory={growthHistory}
          hyperspectralData={hyperspectralData}
          onOptimizationUpdate={(recommendations) => {
            // You can handle the recommendations here, e.g., show notifications or update state
          }}
        />
      ) : (
        <PlantBiologyIntegration 
          selectedSpecies={props.selectedSpecies || defaultSelectedSpecies}
          currentStage={props.currentStage || 'vegetative'}
          environmentalConditions={props.environmentalConditions || defaultEnvironmentalConditions}
          lightingSystem={props.lightingSystem || defaultLightingSystem}
          onOptimizationUpdate={(recommendations) => {
            // Handle the recommendations here
          }}
        />
      )}
    </div>
  )
}