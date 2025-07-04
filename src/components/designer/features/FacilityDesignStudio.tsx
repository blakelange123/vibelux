'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Sun,
  Thermometer,
  Droplets,
  Wind,
  Zap,
  Layers,
  Building,
  Calculator,
  TrendingUp,
  BarChart3,
  Settings,
  Download,
  Eye,
  Grid3x3,
  Target,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  DollarSign,
  Leaf,
  ArrowUp,
  ArrowDown,
  RotateCw
} from 'lucide-react';
import { 
  HORTICULTURAL_CROP_DATABASE, 
  getCropsByCategory, 
  getCropById,
  type CropVariety 
} from '../../../lib/horticultural-database';
import { 
  SolarDLICalculator, 
  getAvailableLocations,
  type LocationData,
  type SeasonalDLIData
} from '../../../lib/solar-dli-calculator';

interface FacilityZone {
  id: string;
  name: string;
  type: 'propagation' | 'vegetative' | 'flowering' | 'finishing' | 'storage';
  area: number; // square feet
  height: number; // feet
  cropId: string;
  plantCount: number;
  layerCount: number;
  environmentalSettings: {
    temperature: { day: number; night: number };
    humidity: number;
    co2: number;
    airflow: number;
  };
  lightingDesign: {
    fixtureType: string;
    fixtureCount: number;
    ppfd: number;
    dli: number;
    photoperiod: number;
    powerConsumption: number; // watts
  };
  hvacRequirements: {
    coolingLoad: number; // BTU/hr
    heatingLoad: number; // BTU/hr
    dehumidification: number; // pints/day
    ventilation: number; // CFM
  };
}

interface FacilityDesign {
  id: string;
  name: string;
  location: LocationData;
  facilityType: 'greenhouse' | 'indoor' | 'warehouse' | 'shipping-container' | 'vertical-farm';
  totalArea: number; // square feet
  zones: FacilityZone[];
  orientation: number; // degrees from north
  constructionType: 'steel-frame' | 'wood-frame' | 'concrete' | 'modular';
  energySource: 'grid' | 'solar' | 'hybrid';
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
}

interface PerformanceAnalysis {
  totalPowerConsumption: number; // kW
  annualEnergyUse: number; // kWh/year
  annualEnergyCost: number; // $/year
  cropYieldProjection: number; // lbs/year
  revenueProjection: number; // $/year
  roi: number; // %
  paybackPeriod: number; // months
  carbonFootprint: number; // tons CO2/year
  waterUsage: number; // gallons/day
  laborRequirements: number; // FTE
}

export function FacilityDesignStudio() {
  const [currentDesign, setCurrentDesign] = useState<FacilityDesign | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [designMode, setDesignMode] = useState<'layout' | 'environmental' | 'lighting' | 'analysis'>('layout');
  const [seasonalDLI, setSeasonalDLI] = useState<SeasonalDLIData[]>([]);
  const [performance, setPerformance] = useState<PerformanceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize with default facility design
  useEffect(() => {
    const defaultLocation: LocationData = {
      latitude: 34.0522,
      longitude: -118.2437,
      elevation: 71,
      timezone: 'America/Los_Angeles',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      zipCode: '90210'
    };

    const defaultDesign: FacilityDesign = {
      id: 'facility-001',
      name: 'Commercial Cannabis Facility',
      location: defaultLocation,
      facilityType: 'indoor',
      totalArea: 10000,
      orientation: 180,
      constructionType: 'steel-frame',
      energySource: 'hybrid',
      automationLevel: 'semi-automated',
      zones: [
        {
          id: 'zone-1',
          name: 'Propagation',
          type: 'propagation',
          area: 500,
          height: 8,
          cropId: 'cannabis-gorilla-glue-4',
          plantCount: 1000,
          layerCount: 3,
          environmentalSettings: {
            temperature: { day: 24, night: 20 },
            humidity: 70,
            co2: 800,
            airflow: 0.3
          },
          lightingDesign: {
            fixtureType: 'LED Full Spectrum',
            fixtureCount: 20,
            ppfd: 200,
            dli: 12,
            photoperiod: 18,
            powerConsumption: 8000
          },
          hvacRequirements: {
            coolingLoad: 32000,
            heatingLoad: 15000,
            dehumidification: 200,
            ventilation: 1500
          }
        },
        {
          id: 'zone-2',
          name: 'Vegetative Growth',
          type: 'vegetative',
          area: 3000,
          height: 12,
          cropId: 'cannabis-gorilla-glue-4',
          plantCount: 500,
          layerCount: 2,
          environmentalSettings: {
            temperature: { day: 26, night: 22 },
            humidity: 65,
            co2: 1000,
            airflow: 0.5
          },
          lightingDesign: {
            fixtureType: 'LED Full Spectrum',
            fixtureCount: 100,
            ppfd: 500,
            dli: 30,
            photoperiod: 18,
            powerConsumption: 60000
          },
          hvacRequirements: {
            coolingLoad: 240000,
            heatingLoad: 80000,
            dehumidification: 800,
            ventilation: 9000
          }
        },
        {
          id: 'zone-3',
          name: 'Flowering',
          type: 'flowering',
          area: 5000,
          height: 14,
          cropId: 'cannabis-gorilla-glue-4',
          plantCount: 400,
          layerCount: 1,
          environmentalSettings: {
            temperature: { day: 24, night: 20 },
            humidity: 50,
            co2: 1200,
            airflow: 0.8
          },
          lightingDesign: {
            fixtureType: 'LED Full Spectrum',
            fixtureCount: 200,
            ppfd: 800,
            dli: 45,
            photoperiod: 12,
            powerConsumption: 160000
          },
          hvacRequirements: {
            coolingLoad: 640000,
            heatingLoad: 120000,
            dehumidification: 1500,
            ventilation: 15000
          }
        },
        {
          id: 'zone-4',
          name: 'Drying & Curing',
          type: 'finishing',
          area: 1000,
          height: 10,
          cropId: 'cannabis-gorilla-glue-4',
          plantCount: 0,
          layerCount: 1,
          environmentalSettings: {
            temperature: { day: 18, night: 16 },
            humidity: 45,
            co2: 400,
            airflow: 1.0
          },
          lightingDesign: {
            fixtureType: 'None',
            fixtureCount: 0,
            ppfd: 0,
            dli: 0,
            photoperiod: 0,
            powerConsumption: 0
          },
          hvacRequirements: {
            coolingLoad: 40000,
            heatingLoad: 60000,
            dehumidification: 600,
            ventilation: 3000
          }
        }
      ]
    };

    setCurrentDesign(defaultDesign);
    
    // Calculate seasonal DLI for location
    try {
      const dliData = SolarDLICalculator.calculateSeasonalDLI(defaultLocation);
      setSeasonalDLI(dliData);
    } catch (error) {
      console.error('Error calculating seasonal DLI:', error);
    }
  }, []);

  // Calculate facility performance
  const calculatePerformance = async (): Promise<PerformanceAnalysis> => {
    if (!currentDesign) throw new Error('No design loaded');

    // Calculate total power consumption
    const totalPowerConsumption = currentDesign.zones.reduce((total, zone) => 
      total + zone.lightingDesign.powerConsumption + (zone.hvacRequirements.coolingLoad / 3.412), 0
    ) / 1000; // Convert to kW

    // Annual energy use (considering photoperiods and HVAC)
    const lightingHours = currentDesign.zones.reduce((total, zone) => 
      total + (zone.lightingDesign.powerConsumption * zone.lightingDesign.photoperiod * 365), 0
    ) / 1000; // kWh

    const hvacHours = totalPowerConsumption * 0.6 * 24 * 365; // 60% HVAC load factor
    const annualEnergyUse = lightingHours + hvacHours;

    // Energy cost calculation ($0.12/kWh average commercial)
    const energyRate = 0.12;
    const annualEnergyCost = annualEnergyUse * energyRate;

    // Crop yield projection
    const totalPlants = currentDesign.zones.reduce((total, zone) => total + zone.plantCount, 0);
    const cropYieldProjection = totalPlants * 0.5 * 4; // 0.5 lbs per plant, 4 cycles per year

    // Revenue projection ($8/gram average)
    const revenueProjection = cropYieldProjection * 453.592 * 8; // Convert lbs to grams * $8/gram

    // Financial metrics
    const grossProfit = revenueProjection - annualEnergyCost;
    const initialInvestment = currentDesign.totalArea * 200; // $200/sq ft estimate
    const roi = (grossProfit / initialInvestment) * 100;
    const paybackPeriod = initialInvestment / (grossProfit / 12);

    // Environmental metrics
    const carbonFootprint = annualEnergyUse * 0.0004; // 0.4 lbs CO2/kWh
    const waterUsage = totalPlants * 2; // 2 gallons per plant per day
    const laborRequirements = Math.ceil(currentDesign.totalArea / 2000); // 1 FTE per 2000 sq ft

    return {
      totalPowerConsumption,
      annualEnergyUse,
      annualEnergyCost,
      cropYieldProjection,
      revenueProjection,
      roi,
      paybackPeriod,
      carbonFootprint,
      waterUsage,
      laborRequirements
    };
  };

  // Run performance analysis
  const runPerformanceAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate analysis
      const performanceData = await calculatePerformance();
      setPerformance(performanceData);
    } catch (error) {
      console.error('Performance analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Draw facility layout
  const drawFacilityLayout = () => {
    if (!canvasRef.current || !currentDesign) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scale
    const maxDimension = Math.sqrt(currentDesign.totalArea);
    const scale = Math.min(canvas.width, canvas.height) * 0.8 / maxDimension;
    const offsetX = (canvas.width - maxDimension * scale) / 2;
    const offsetY = (canvas.height - maxDimension * scale) / 2;

    // Draw zones
    let currentX = offsetX;
    let currentY = offsetY;
    const zoneColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    currentDesign.zones.forEach((zone, index) => {
      const zoneWidth = Math.sqrt(zone.area) * scale;
      const zoneHeight = Math.sqrt(zone.area) * scale;

      // Zone background
      ctx.fillStyle = zoneColors[index % zoneColors.length] + '40';
      ctx.fillRect(currentX, currentY, zoneWidth, zoneHeight);

      // Zone border
      ctx.strokeStyle = zoneColors[index % zoneColors.length];
      ctx.lineWidth = 2;
      ctx.strokeRect(currentX, currentY, zoneWidth, zoneHeight);

      // Zone label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(zone.name, currentX + zoneWidth / 2, currentY + zoneHeight / 2);
      ctx.fillText(`${zone.area} sq ft`, currentX + zoneWidth / 2, currentY + zoneHeight / 2 + 15);

      // Lighting indicators
      if (zone.lightingDesign.fixtureCount > 0) {
        ctx.fillStyle = '#fbbf24';
        for (let i = 0; i < Math.min(zone.lightingDesign.fixtureCount / 10, 20); i++) {
          const x = currentX + 10 + (i % 5) * 8;
          const y = currentY + 10 + Math.floor(i / 5) * 8;
          ctx.fillRect(x, y, 4, 4);
        }
      }

      // Move to next zone position
      currentX += zoneWidth + 20;
      if (currentX + zoneWidth > canvas.width - offsetX) {
        currentX = offsetX;
        currentY += zoneHeight + 20;
      }
    });

    // Draw facility outline
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX - 10, offsetY - 10, maxDimension * scale + 20, currentY - offsetY + 100);
  };

  // Update layout drawing when design changes
  useEffect(() => {
    drawFacilityLayout();
  }, [currentDesign, designMode]);

  const selectedZoneData = selectedZone ? currentDesign?.zones.find(z => z.id === selectedZone) : null;
  const selectedCrop = selectedZoneData ? getCropById(selectedZoneData.cropId) : null;

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Building className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Facility Design Studio</h2>
              <p className="text-sm text-gray-400">Professional horticultural facility design and optimization</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={runPerformanceAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Analyze Performance
                </>
              )}
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Design
            </button>
          </div>
        </div>

        {/* Design Mode Tabs */}
        <div className="mt-4 flex gap-2">
          {[
            { id: 'layout', name: 'Layout Design', icon: Grid3x3 },
            { id: 'environmental', name: 'Environmental', icon: Thermometer },
            { id: 'lighting', name: 'Lighting Design', icon: Sun },
            { id: 'analysis', name: 'Performance', icon: BarChart3 }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setDesignMode(mode.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                designMode === mode.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Design Area */}
        <div className="flex-1 flex flex-col">
          {designMode === 'layout' && (
            <div className="flex-1 p-6">
              <div className="bg-gray-800 rounded-lg h-full flex">
                {/* Facility Layout Canvas */}
                <div className="flex-1 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Facility Layout</h3>
                    <div className="flex gap-2">
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className="w-full h-full bg-gray-900 rounded border border-gray-600"
                  />
                </div>

                {/* Zone List */}
                <div className="w-80 border-l border-gray-700 p-4">
                  <h4 className="font-medium text-white mb-3">Facility Zones</h4>
                  <div className="space-y-2">
                    {currentDesign?.zones.map(zone => (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZone(zone.id)}
                        className={`p-3 rounded border cursor-pointer transition-colors ${
                          selectedZone === zone.id 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white text-sm">{zone.name}</div>
                            <div className="text-xs text-gray-400">{zone.type}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-white">{zone.area} ft²</div>
                            <div className="text-xs text-gray-400">{zone.plantCount} plants</div>
                          </div>
                        </div>
                        {zone.layerCount > 1 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-purple-400">
                            <Layers className="w-3 h-3" />
                            {zone.layerCount} layers
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {designMode === 'environmental' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                {/* Climate Control */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-red-400" />
                    Climate Control
                  </h3>
                  
                  {selectedZoneData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Day Temp (°C)</label>
                          <input
                            type="number"
                            value={selectedZoneData.environmentalSettings.temperature.day}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Night Temp (°C)</label>
                          <input
                            type="number"
                            value={selectedZoneData.environmentalSettings.temperature.night}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Humidity (%)</label>
                          <input
                            type="number"
                            value={selectedZoneData.environmentalSettings.humidity}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">CO₂ (ppm)</label>
                          <input
                            type="number"
                            value={selectedZoneData.environmentalSettings.co2}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </div>
                      </div>

                      {/* HVAC Requirements */}
                      <div className="mt-6">
                        <h4 className="font-medium text-white mb-3">HVAC Requirements</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Cooling Load:</span>
                            <span className="text-white">{selectedZoneData.hvacRequirements.coolingLoad.toLocaleString()} BTU/hr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Heating Load:</span>
                            <span className="text-white">{selectedZoneData.hvacRequirements.heatingLoad.toLocaleString()} BTU/hr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Dehumidification:</span>
                            <span className="text-white">{selectedZoneData.hvacRequirements.dehumidification} pints/day</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Ventilation:</span>
                            <span className="text-white">{selectedZoneData.hvacRequirements.ventilation.toLocaleString()} CFM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Crop Requirements */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-400" />
                    Crop Requirements
                  </h3>
                  
                  {selectedCrop && selectedZoneData && (
                    <div className="space-y-4">
                      <div>
                        <div className="font-medium text-white">{selectedCrop.name}</div>
                        <div className="text-sm text-gray-400">{selectedCrop.scientificName}</div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Optimal Temperature Range</div>
                          <div className="text-white text-sm">
                            {selectedCrop.environmentalRequirements.temperature.optimal[0]}°C - {selectedCrop.environmentalRequirements.temperature.optimal[1]}°C
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-400 mb-1">Humidity Range (Current Stage)</div>
                          <div className="text-white text-sm">
                            {selectedCrop.environmentalRequirements.humidity.vegetative[0]}% - {selectedCrop.environmentalRequirements.humidity.vegetative[1]}%
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-400 mb-1">CO₂ Requirements</div>
                          <div className="text-white text-sm">
                            Ambient: {selectedCrop.environmentalRequirements.co2.ambient} ppm<br/>
                            Enriched: {selectedCrop.environmentalRequirements.co2.enriched} ppm
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-400 mb-1">Plant Spacing</div>
                          <div className="text-white text-sm">
                            {selectedCrop.spacing.plantsPerSqFt.toFixed(1)} plants/sq ft<br/>
                            ({selectedCrop.spacing.inRow} × {selectedCrop.spacing.betweenRows} cm spacing)
                          </div>
                        </div>
                      </div>

                      {/* Compliance Check */}
                      <div className="mt-4 p-3 rounded border">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium text-white">Environment Compliance</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-gray-300">Temperature within optimal range</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-yellow-400" />
                            <span className="text-gray-300">Humidity slightly high for flowering stage</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-gray-300">CO₂ levels appropriate for growth</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Solar Data & Location */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-yellow-400" />
                    Solar Analysis
                  </h3>
                  
                  {seasonalDLI.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Location: {currentDesign?.location.city}, {currentDesign?.location.state}</div>
                        <div className="text-xs text-gray-500">
                          {currentDesign?.location.latitude.toFixed(3)}°N, {currentDesign?.location.longitude.toFixed(3)}°W
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {seasonalDLI.slice(0, 12).map(month => (
                          <div key={month.month} className="text-center p-2 bg-gray-700 rounded">
                            <div className="text-xs text-gray-400">{new Date(2024, month.month - 1).toLocaleDateString('en', { month: 'short' })}</div>
                            <div className="text-sm font-medium text-white">{month.averageDLI.toFixed(1)}</div>
                            <div className="text-xs text-gray-500">mol/m²/day</div>
                          </div>
                        ))}
                      </div>

                      <div className="text-xs text-gray-400">
                        <Info className="w-3 h-3 inline mr-1" />
                        Natural sunlight DLI for supplemental lighting calculations
                      </div>
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                {performance && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      Performance Metrics
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Power:</span>
                        <span className="text-white">{performance.totalPowerConsumption.toFixed(0)} kW</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Annual Energy:</span>
                        <span className="text-white">{(performance.annualEnergyUse / 1000).toFixed(0)} MWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Energy Cost:</span>
                        <span className="text-white">${performance.annualEnergyCost.toLocaleString()}/yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Projected Yield:</span>
                        <span className="text-white">{performance.cropYieldProjection.toFixed(0)} lbs/yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Revenue Projection:</span>
                        <span className="text-white">${(performance.revenueProjection / 1000).toFixed(0)}k/yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ROI:</span>
                        <span className={`${performance.roi > 20 ? 'text-green-400' : performance.roi > 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {performance.roi.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {designMode === 'lighting' && (
            <div className="flex-1 p-6">
              <div className="bg-gray-800 rounded-lg h-full p-4">
                <h3 className="text-lg font-medium text-white mb-4">Lighting Design</h3>
                <p className="text-gray-400">Advanced lighting design tools coming soon...</p>
              </div>
            </div>
          )}

          {designMode === 'analysis' && performance && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-3 gap-6">
                {/* Financial Analysis */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Financial Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">{performance.roi.toFixed(1)}%</div>
                      <div className="text-sm text-gray-400">Annual ROI</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Annual Revenue:</span>
                        <span className="text-white">${(performance.revenueProjection / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Energy Costs:</span>
                        <span className="text-white">${(performance.annualEnergyCost / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Payback Period:</span>
                        <span className="text-white">{performance.paybackPeriod.toFixed(1)} months</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Environmental Impact */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-400" />
                    Environmental Impact
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">{performance.carbonFootprint.toFixed(1)}</div>
                      <div className="text-sm text-gray-400">tons CO₂/year</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Water Usage:</span>
                        <span className="text-white">{performance.waterUsage.toLocaleString()} gal/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Energy Intensity:</span>
                        <span className="text-white">{(performance.annualEnergyUse / performance.cropYieldProjection).toFixed(0)} kWh/lb</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operational Metrics */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-400" />
                    Operations
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">{performance.laborRequirements}</div>
                      <div className="text-sm text-gray-400">FTE Required</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Productivity:</span>
                        <span className="text-white">{(performance.cropYieldProjection / currentDesign!.totalArea).toFixed(2)} lbs/sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Power Density:</span>
                        <span className="text-white">{(performance.totalPowerConsumption * 1000 / currentDesign!.totalArea).toFixed(0)} W/sq ft</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Zone Details */}
        {selectedZoneData && (
          <div className="w-80 border-l border-gray-700 p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-white">{selectedZoneData.name}</h3>
              <p className="text-sm text-gray-400 capitalize">{selectedZoneData.type} zone</p>
            </div>

            <div className="space-y-4">
              {/* Zone Specifications */}
              <div className="bg-gray-800 rounded p-3">
                <h4 className="font-medium text-white mb-2">Specifications</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Area:</span>
                    <span className="text-white">{selectedZoneData.area} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Height:</span>
                    <span className="text-white">{selectedZoneData.height} ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plants:</span>
                    <span className="text-white">{selectedZoneData.plantCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Layers:</span>
                    <span className="text-white">{selectedZoneData.layerCount}</span>
                  </div>
                </div>
              </div>

              {/* Lighting Configuration */}
              <div className="bg-gray-800 rounded p-3">
                <h4 className="font-medium text-white mb-2">Lighting</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">PPFD:</span>
                    <span className="text-white">{selectedZoneData.lightingDesign.ppfd} µmol/m²/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">DLI:</span>
                    <span className="text-white">{selectedZoneData.lightingDesign.dli} mol/m²/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Photoperiod:</span>
                    <span className="text-white">{selectedZoneData.lightingDesign.photoperiod}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Power:</span>
                    <span className="text-white">{(selectedZoneData.lightingDesign.powerConsumption / 1000).toFixed(1)} kW</span>
                  </div>
                </div>
              </div>

              {/* Environmental Settings */}
              <div className="bg-gray-800 rounded p-3">
                <h4 className="font-medium text-white mb-2">Environment</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Day Temp:</span>
                    <span className="text-white">{selectedZoneData.environmentalSettings.temperature.day}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Night Temp:</span>
                    <span className="text-white">{selectedZoneData.environmentalSettings.temperature.night}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Humidity:</span>
                    <span className="text-white">{selectedZoneData.environmentalSettings.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CO₂:</span>
                    <span className="text-white">{selectedZoneData.environmentalSettings.co2} ppm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}