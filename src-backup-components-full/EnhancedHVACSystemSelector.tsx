'use client';

import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Snowflake,
  Flame,
  Settings,
  AlertCircle,
  Info,
  CheckCircle2,
  Calculator,
  TrendingUp,
  DollarSign,
  Zap,
  Leaf,
  BarChart3,
  Filter,
  Download,
  Building,
  CloudRain,
  Sun,
  MapPin,
  Volume2,
  Recycle,
  Shield
} from 'lucide-react';

export interface EnhancedHVACSystemType {
  id: string;
  name: string;
  category: 'packaged' | 'split' | 'hydronic' | 'vrf' | 'dedicated' | 'hybrid';
  description: string;
  features: string[];
  efficiency: {
    cooling: { min: number; max: number; unit: string };
    heating: { min: number; max: number; unit: string };
  };
  capacityRange: { min: number; max: number; unit: string };
  costRange: { min: number; max: number };
  pros: string[];
  cons: string[];
  bestFor: string[];
  components: string[];
  // New enhanced properties
  climateZones: string[]; // suitable climate zones
  controlCapabilities: {
    zoning: boolean;
    humidity: boolean;
    co2: boolean;
    scheduling: boolean;
    remote: boolean;
  };
  maintenance: {
    frequency: 'low' | 'medium' | 'high';
    complexity: 'simple' | 'moderate' | 'complex';
    annualCost: { min: number; max: number };
  };
  sustainability: {
    refrigerant: string;
    gwp: number; // Global Warming Potential
    energyStarRating?: number;
    recyclability: number; // percentage
  };
  noiseLevel: { indoor: number; outdoor: number }; // dB
  lifespan: number; // years
  warranty: number; // years
}

interface FacilityRequirements {
  location: {
    climate: 'hot-humid' | 'hot-dry' | 'mixed' | 'cold' | 'marine';
    altitude: number; // meters
  };
  building: {
    type: 'greenhouse' | 'warehouse' | 'indoor-farm' | 'research' | 'processing';
    insulation: 'poor' | 'average' | 'good' | 'excellent';
    airTightness: 'leaky' | 'average' | 'tight';
  };
  operation: {
    schedule: '24/7' | 'extended' | 'standard';
    criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
    futureExpansion: boolean;
  };
  environmental: {
    tempSetpoint: { cooling: number; heating: number };
    humiditySetpoint: { min: number; max: number };
    co2Enrichment: boolean;
    lightingHeatLoad: number; // W/m²
  };
  budget: {
    initial: number;
    operating: number; // annual
    paybackPeriod: number; // years
  };
}

interface SystemScore {
  overall: number;
  efficiency: number;
  cost: number;
  features: number;
  reliability: number;
  sustainability: number;
}

const ENHANCED_HVAC_SYSTEMS: EnhancedHVACSystemType[] = [
  {
    id: 'pkg-dx-standard',
    name: 'Standard Packaged DX Unit',
    category: 'packaged',
    description: 'Basic rooftop unit for simple applications',
    features: ['Simple controls', 'Gas heat option', 'Economizer capable'],
    efficiency: {
      cooling: { min: 11, max: 13, unit: 'EER' },
      heating: { min: 80, max: 85, unit: '%' }
    },
    capacityRange: { min: 3, max: 50, unit: 'tons' },
    costRange: { min: 3000, max: 30000 },
    pros: ['Low cost', 'Simple installation', 'Reliable'],
    cons: ['Limited efficiency', 'Basic controls', 'No humidity control'],
    bestFor: ['Small facilities', 'Budget projects', 'Non-critical spaces'],
    components: ['Compressor', 'Condenser', 'Evaporator', 'Gas furnace'],
    climateZones: ['hot-dry', 'mixed', 'marine'],
    controlCapabilities: {
      zoning: false,
      humidity: false,
      co2: false,
      scheduling: true,
      remote: false
    },
    maintenance: {
      frequency: 'low',
      complexity: 'simple',
      annualCost: { min: 500, max: 1500 }
    },
    sustainability: {
      refrigerant: 'R-410A',
      gwp: 2088,
      energyStarRating: 3,
      recyclability: 85
    },
    noiseLevel: { indoor: 55, outdoor: 65 },
    lifespan: 15,
    warranty: 5
  },
  {
    id: 'pkg-dx-premium',
    name: 'Premium Packaged Unit with Precise Control',
    category: 'packaged',
    description: 'High-efficiency RTU with advanced environmental controls',
    features: ['Variable capacity', 'Integrated humidity control', 'CO2 monitoring', 'Advanced BMS integration'],
    efficiency: {
      cooling: { min: 16, max: 19, unit: 'EER' },
      heating: { min: 92, max: 96, unit: '%' }
    },
    capacityRange: { min: 5, max: 100, unit: 'tons' },
    costRange: { min: 15000, max: 80000 },
    pros: ['High efficiency', 'Precise control', 'Integrated dehumidification', 'Modular design'],
    cons: ['Higher cost', 'Complex controls', 'Requires skilled maintenance'],
    bestFor: ['Controlled environment agriculture', 'Research facilities', 'Premium growing operations'],
    components: ['Variable speed compressor', 'Hot gas reheat', 'Enthalpy wheel', 'VFD fans'],
    climateZones: ['hot-humid', 'hot-dry', 'mixed', 'marine'],
    controlCapabilities: {
      zoning: true,
      humidity: true,
      co2: true,
      scheduling: true,
      remote: true
    },
    maintenance: {
      frequency: 'medium',
      complexity: 'moderate',
      annualCost: { min: 2000, max: 5000 }
    },
    sustainability: {
      refrigerant: 'R-32',
      gwp: 675,
      energyStarRating: 5,
      recyclability: 92
    },
    noiseLevel: { indoor: 48, outdoor: 58 },
    lifespan: 20,
    warranty: 10
  },
  {
    id: 'chilled-water-ahu',
    name: 'Chilled Water Air Handler with Precise Control',
    category: 'hydronic',
    description: 'Dedicated air handler for precision agriculture applications',
    features: ['Modulating chilled water valves', 'Steam/electric humidification', 'HEPA filtration', 'Heat recovery'],
    efficiency: {
      cooling: { min: 0.45, max: 0.55, unit: 'kW/ton' },
      heating: { min: 95, max: 98, unit: '%' }
    },
    capacityRange: { min: 10, max: 500, unit: 'tons' },
    costRange: { min: 25000, max: 200000 },
    pros: ['Ultimate precision', 'Redundancy options', 'Scalable', 'Superior air quality'],
    cons: ['High complexity', 'Requires chiller plant', 'High maintenance'],
    bestFor: ['Large commercial grows', 'Research facilities', 'Pharmaceutical applications'],
    components: ['Chilled water coils', 'Steam humidifier', 'VFD supply/return fans', 'Energy recovery wheel'],
    climateZones: ['hot-humid', 'hot-dry', 'mixed', 'cold', 'marine'],
    controlCapabilities: {
      zoning: true,
      humidity: true,
      co2: true,
      scheduling: true,
      remote: true
    },
    maintenance: {
      frequency: 'high',
      complexity: 'complex',
      annualCost: { min: 8000, max: 20000 }
    },
    sustainability: {
      refrigerant: 'R-134a',
      gwp: 1430,
      energyStarRating: 4,
      recyclability: 88
    },
    noiseLevel: { indoor: 52, outdoor: 60 },
    lifespan: 25,
    warranty: 15
  },
  {
    id: 'vrf-multi-zone',
    name: 'VRF Multi-Zone System',
    category: 'vrf',
    description: 'Variable refrigerant flow for zone-specific control',
    features: ['Individual zone control', 'Heat recovery', 'Quiet operation', 'Space-saving design'],
    efficiency: {
      cooling: { min: 18, max: 22, unit: 'EER' },
      heating: { min: 3.5, max: 4.2, unit: 'COP' }
    },
    capacityRange: { min: 5, max: 150, unit: 'tons' },
    costRange: { min: 20000, max: 120000 },
    pros: ['Zone control', 'High efficiency', 'Quiet', 'Compact design'],
    cons: ['Limited humidity control', 'Complex piping', 'Specialized service'],
    bestFor: ['Multi-room facilities', 'Retrofit applications', 'Noise-sensitive areas'],
    components: ['Variable capacity outdoor unit', 'Multiple indoor units', 'Branch control units'],
    climateZones: ['hot-dry', 'mixed', 'cold', 'marine'],
    controlCapabilities: {
      zoning: true,
      humidity: false,
      co2: false,
      scheduling: true,
      remote: true
    },
    maintenance: {
      frequency: 'medium',
      complexity: 'moderate',
      annualCost: { min: 3000, max: 8000 }
    },
    sustainability: {
      refrigerant: 'R-32',
      gwp: 675,
      energyStarRating: 4,
      recyclability: 90
    },
    noiseLevel: { indoor: 42, outdoor: 52 },
    lifespan: 20,
    warranty: 12
  },
  {
    id: 'doas-heat-pump',
    name: 'DOAS with Heat Pump',
    category: 'dedicated',
    description: 'Dedicated outdoor air system with heat pump technology',
    features: ['100% outdoor air', 'Heat recovery wheel', 'Dehumidification', 'CO2 control'],
    efficiency: {
      cooling: { min: 14, max: 17, unit: 'EER' },
      heating: { min: 3.2, max: 3.8, unit: 'COP' }
    },
    capacityRange: { min: 2, max: 25, unit: 'tons' },
    costRange: { min: 12000, max: 60000 },
    pros: ['Excellent ventilation', 'Heat recovery', 'Humidity control', 'Energy efficient'],
    cons: ['Limited capacity', 'Requires supplemental cooling', 'Complex controls'],
    bestFor: ['High ventilation requirements', 'Energy-conscious facilities', 'Clean room applications'],
    components: ['Heat recovery wheel', 'Heat pump coils', 'Desiccant wheel option', 'Variable speed fans'],
    climateZones: ['hot-humid', 'mixed', 'cold', 'marine'],
    controlCapabilities: {
      zoning: false,
      humidity: true,
      co2: true,
      scheduling: true,
      remote: true
    },
    maintenance: {
      frequency: 'medium',
      complexity: 'moderate',
      annualCost: { min: 2500, max: 6000 }
    },
    sustainability: {
      refrigerant: 'R-410A',
      gwp: 2088,
      energyStarRating: 4,
      recyclability: 87
    },
    noiseLevel: { indoor: 50, outdoor: 58 },
    lifespan: 18,
    warranty: 8
  },
  {
    id: 'hybrid-solar-hp',
    name: 'Hybrid Solar Heat Pump System',
    category: 'hybrid',
    description: 'Solar-assisted heat pump with backup conventional cooling',
    features: ['Solar thermal assist', 'Grid-tie capability', 'Battery backup option', 'Smart grid integration'],
    efficiency: {
      cooling: { min: 20, max: 28, unit: 'EER' },
      heating: { min: 4.5, max: 6.2, unit: 'COP' }
    },
    capacityRange: { min: 3, max: 30, unit: 'tons' },
    costRange: { min: 35000, max: 150000 },
    pros: ['Ultra-high efficiency', 'Renewable energy', 'Low operating cost', 'Grid independence'],
    cons: ['Very high upfront cost', 'Weather dependent', 'Complex system', 'Emerging technology'],
    bestFor: ['Sustainability-focused operations', 'Remote locations', 'Net-zero energy goals'],
    components: ['Solar thermal collectors', 'Heat pump unit', 'Thermal storage', 'Smart controls'],
    climateZones: ['hot-dry', 'mixed', 'marine'],
    controlCapabilities: {
      zoning: true,
      humidity: true,
      co2: true,
      scheduling: true,
      remote: true
    },
    maintenance: {
      frequency: 'medium',
      complexity: 'complex',
      annualCost: { min: 4000, max: 10000 }
    },
    sustainability: {
      refrigerant: 'R-290',
      gwp: 3,
      energyStarRating: 5,
      recyclability: 95
    },
    noiseLevel: { indoor: 45, outdoor: 50 },
    lifespan: 22,
    warranty: 15
  },
  {
    id: 'evap-cooling-hybrid',
    name: 'Evaporative Cooling Hybrid System',
    category: 'hybrid',
    description: 'Direct/indirect evaporative cooling with DX backup',
    features: ['Water-based cooling', 'Low energy consumption', 'Fresh air ventilation', 'Humidity addition'],
    efficiency: {
      cooling: { min: 25, max: 40, unit: 'EER' },
      heating: { min: 85, max: 92, unit: '%' }
    },
    capacityRange: { min: 10, max: 200, unit: 'tons' },
    costRange: { min: 15000, max: 90000 },
    pros: ['Very low energy', 'Environmentally friendly', 'Natural humidification', 'Low operating cost'],
    cons: ['Climate dependent', 'Water consumption', 'Limited in humid climates', 'Maintenance intensive'],
    bestFor: ['Dry climates', 'Large spaces', 'Cost-sensitive operations', 'Eco-friendly projects'],
    components: ['Evaporative media', 'Water distribution system', 'DX backup coil', 'Variable speed fans'],
    climateZones: ['hot-dry'],
    controlCapabilities: {
      zoning: false,
      humidity: false,
      co2: true,
      scheduling: true,
      remote: false
    },
    maintenance: {
      frequency: 'high',
      complexity: 'moderate',
      annualCost: { min: 3000, max: 8000 }
    },
    sustainability: {
      refrigerant: 'R-410A',
      gwp: 2088,
      energyStarRating: 3,
      recyclability: 80
    },
    noiseLevel: { indoor: 58, outdoor: 62 },
    lifespan: 15,
    warranty: 7
  },
  {
    id: 'geothermal-hp',
    name: 'Geothermal Heat Pump System',
    category: 'hybrid',
    description: 'Ground-source heat pump for ultimate efficiency',
    features: ['Ground loop system', 'Year-round efficiency', 'Quiet operation', 'Long lifespan'],
    efficiency: {
      cooling: { min: 22, max: 30, unit: 'EER' },
      heating: { min: 4.0, max: 5.5, unit: 'COP' }
    },
    capacityRange: { min: 2, max: 100, unit: 'tons' },
    costRange: { min: 40000, max: 300000 },
    pros: ['Highest efficiency', 'Consistent performance', 'Low noise', 'Very long life'],
    cons: ['Very high install cost', 'Site dependent', 'Ground loop required', 'Complex design'],
    bestFor: ['Long-term operations', 'Extreme efficiency goals', 'Suitable geology', 'Premium applications'],
    components: ['Ground heat exchanger', 'Heat pump units', 'Circulation pumps', 'Buffer tanks'],
    climateZones: ['hot-humid', 'hot-dry', 'mixed', 'cold', 'marine'],
    controlCapabilities: {
      zoning: true,
      humidity: false,
      co2: false,
      scheduling: true,
      remote: true
    },
    maintenance: {
      frequency: 'low',
      complexity: 'moderate',
      annualCost: { min: 2000, max: 5000 }
    },
    sustainability: {
      refrigerant: 'R-410A',
      gwp: 2088,
      energyStarRating: 5,
      recyclability: 92
    },
    noiseLevel: { indoor: 40, outdoor: 45 },
    lifespan: 30,
    warranty: 20
  }
];

export function EnhancedHVACSystemSelector({
  coolingLoad = 50,
  heatingLoad = 30,
  roomArea = 1000
}: {
  coolingLoad?: number;
  heatingLoad?: number;
  roomArea?: number;
}) {
  const [requirements, setRequirements] = useState<FacilityRequirements>({
    location: {
      climate: 'mixed',
      altitude: 0
    },
    building: {
      type: 'indoor-farm',
      insulation: 'good',
      airTightness: 'average'
    },
    operation: {
      schedule: '24/7',
      criticalityLevel: 'high',
      futureExpansion: true
    },
    environmental: {
      tempSetpoint: { cooling: 75, heating: 68 },
      humiditySetpoint: { min: 50, max: 70 },
      co2Enrichment: true,
      lightingHeatLoad: 50
    },
    budget: {
      initial: 100000,
      operating: 25000,
      paybackPeriod: 7
    }
  });

  const [filters, setFilters] = useState({
    category: 'all',
    efficiency: 'all',
    budget: 'all',
    features: []
  });

  const [sortBy, setSortBy] = useState<'score' | 'cost' | 'efficiency'>('score');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Calculate system scores based on requirements
  const calculateSystemScore = (system: EnhancedHVACSystemType): SystemScore => {
    let efficiencyScore = 0;
    let costScore = 0;
    let featuresScore = 0;
    let reliabilityScore = 0;
    let sustainabilityScore = 0;

    // Efficiency scoring
    if (system.efficiency.cooling.unit === 'EER') {
      efficiencyScore = Math.min(100, (system.efficiency.cooling.max - 10) * 10);
    } else if (system.efficiency.cooling.unit === 'kW/ton') {
      efficiencyScore = Math.min(100, (1 - system.efficiency.cooling.min) * 200);
    }

    // Cost scoring (inverse - lower cost = higher score)
    const avgCost = (system.costRange.min + system.costRange.max) / 2;
    costScore = Math.max(0, 100 - (avgCost / requirements.budget.initial) * 50);

    // Features scoring
    let featurePoints = 0;
    if (system.controlCapabilities.humidity && requirements.environmental.humiditySetpoint) featurePoints += 20;
    if (system.controlCapabilities.co2 && requirements.environmental.co2Enrichment) featurePoints += 20;
    if (system.controlCapabilities.zoning) featurePoints += 15;
    if (system.controlCapabilities.remote) featurePoints += 15;
    if (system.controlCapabilities.scheduling) featurePoints += 10;
    featuresScore = Math.min(100, featurePoints);

    // Reliability scoring (based on lifespan and warranty)
    reliabilityScore = Math.min(100, (system.lifespan * 2) + (system.warranty * 3));

    // Sustainability scoring
    const gwpScore = Math.max(0, 100 - (system.sustainability.gwp / 30));
    const starScore = (system.sustainability.energyStarRating || 0) * 20;
    const recyclabilityScore = system.sustainability.recyclability;
    sustainabilityScore = (gwpScore + starScore + recyclabilityScore) / 3;

    const overall = (efficiencyScore + costScore + featuresScore + reliabilityScore + sustainabilityScore) / 5;

    return {
      overall,
      efficiency: efficiencyScore,
      cost: costScore,
      features: featuresScore,
      reliability: reliabilityScore,
      sustainability: sustainabilityScore
    };
  };

  // Filter and sort systems
  const filteredSystems = ENHANCED_HVAC_SYSTEMS
    .filter(system => {
      if (filters.category !== 'all' && system.category !== filters.category) return false;
      if (!system.climateZones.includes(requirements.location.climate)) return false;
      
      const avgCost = (system.costRange.min + system.costRange.max) / 2;
      if (avgCost > requirements.budget.initial * 1.5) return false;
      
      return true;
    })
    .map(system => ({
      ...system,
      score: calculateSystemScore(system)
    }))
    .sort((a, b) => {
      switch (sortBy) {
        case 'score': return b.score.overall - a.score.overall;
        case 'cost': return a.costRange.min - b.costRange.min;
        case 'efficiency': return b.score.efficiency - a.score.efficiency;
        default: return b.score.overall - a.score.overall;
      }
    });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/20 mb-4">
          <Wind className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Enhanced HVAC System Selector
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto">
          Advanced system selection with detailed analysis, sustainability metrics, and ROI calculations
        </p>
      </div>

      {/* Requirements Input Section */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" />
            Facility Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Climate Zone</label>
              <select
                value={requirements.location.climate}
                onChange={(e) => setRequirements({
                  ...requirements,
                  location: { ...requirements.location, climate: e.target.value as any }
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="hot-humid">Hot-Humid</option>
                <option value="hot-dry">Hot-Dry</option>
                <option value="mixed">Mixed</option>
                <option value="cold">Cold</option>
                <option value="marine">Marine</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Building Type</label>
              <select
                value={requirements.building.type}
                onChange={(e) => setRequirements({
                  ...requirements,
                  building: { ...requirements.building, type: e.target.value as any }
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="greenhouse">Greenhouse</option>
                <option value="warehouse">Warehouse</option>
                <option value="indoor-farm">Indoor Farm</option>
                <option value="research">Research Facility</option>
                <option value="processing">Processing Facility</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-red-400" />
            Environmental Requirements
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cooling (°F)</label>
                <input
                  type="number"
                  value={requirements.environmental.tempSetpoint.cooling}
                  onChange={(e) => setRequirements({
                    ...requirements,
                    environmental: {
                      ...requirements.environmental,
                      tempSetpoint: {
                        ...requirements.environmental.tempSetpoint,
                        cooling: Number(e.target.value)
                      }
                    }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Heating (°F)</label>
                <input
                  type="number"
                  value={requirements.environmental.tempSetpoint.heating}
                  onChange={(e) => setRequirements({
                    ...requirements,
                    environmental: {
                      ...requirements.environmental,
                      tempSetpoint: {
                        ...requirements.environmental.tempSetpoint,
                        heating: Number(e.target.value)
                      }
                    }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">CO₂ Enrichment</label>
              <select
                value={requirements.environmental.co2Enrichment ? 'yes' : 'no'}
                onChange={(e) => setRequirements({
                  ...requirements,
                  environmental: {
                    ...requirements.environmental,
                    co2Enrichment: e.target.value === 'yes'
                  }
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Budget & Timeline
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Initial Budget ($)</label>
              <input
                type="number"
                value={requirements.budget.initial}
                onChange={(e) => setRequirements({
                  ...requirements,
                  budget: { ...requirements.budget, initial: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Annual Operating Budget ($)</label>
              <input
                type="number"
                value={requirements.budget.operating}
                onChange={(e) => setRequirements({
                  ...requirements,
                  budget: { ...requirements.budget, operating: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Display */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Recommended Systems</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            >
              <option value="score">Overall Score</option>
              <option value="cost">Initial Cost</option>
              <option value="efficiency">Efficiency</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredSystems.slice(0, 6).map((system) => (
            <div key={system.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-lg font-medium text-white">{system.name}</h4>
                  <p className="text-sm text-gray-400">{system.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    Score: {system.score.overall.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-400">
                    ${system.costRange.min.toLocaleString()} - ${system.costRange.max.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-2 mb-3">
                {Object.entries(system.score).filter(([key]) => key !== 'overall').map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-xs text-gray-400 capitalize">{key}</div>
                    <div className={`text-sm font-medium ${
                      value >= 80 ? 'text-green-400' :
                      value >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {value.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {system.features.slice(0, 4).map((feature, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}