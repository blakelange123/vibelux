'use client';

import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';

export interface HVACSystemType {
  id: string;
  name: string;
  category: 'packaged' | 'split' | 'hydronic' | 'vrf' | 'dedicated';
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
}

const HVAC_SYSTEMS: HVACSystemType[] = [
  {
    id: 'pkg-dx',
    name: 'Packaged DX Unit',
    category: 'packaged',
    description: 'Self-contained rooftop or ground-mounted unit with direct expansion cooling',
    features: ['Integrated cooling and heating', 'Simple installation', 'Low first cost'],
    efficiency: {
      cooling: { min: 11, max: 15, unit: 'EER' },
      heating: { min: 80, max: 95, unit: '%' }
    },
    capacityRange: { min: 3, max: 150, unit: 'tons' },
    costRange: { min: 3000, max: 50000 },
    pros: [
      'Lower initial cost',
      'Simple maintenance',
      'Quick installation',
      'Space-saving (no indoor equipment room)'
    ],
    cons: [
      'Limited zone control',
      'Less efficient than split systems',
      'Outdoor equipment exposure',
      'Potential noise issues'
    ],
    bestFor: ['Small to medium facilities', 'Single zone applications', 'Budget-conscious projects'],
    components: ['Compressor', 'Condenser', 'Evaporator', 'Supply fan', 'Gas/electric heat']
  },
  {
    id: 'pkg-reheat',
    name: 'Packaged Unit with Hot Gas Reheat',
    category: 'packaged',
    description: 'DX unit with hot gas reheat for precise temperature and humidity control',
    features: ['Dehumidification without overcooling', 'Precise humidity control', 'Energy recovery'],
    efficiency: {
      cooling: { min: 12, max: 16, unit: 'EER' },
      heating: { min: 85, max: 95, unit: '%' }
    },
    capacityRange: { min: 5, max: 100, unit: 'tons' },
    costRange: { min: 8000, max: 75000 },
    pros: [
      'Excellent humidity control',
      'No overcooling issues',
      'Energy efficient dehumidification',
      'Good for grow rooms'
    ],
    cons: [
      'Higher initial cost',
      'More complex controls',
      'Requires skilled maintenance',
      'Limited manufacturers'
    ],
    bestFor: ['Cannabis cultivation', 'Controlled environment agriculture', 'High humidity applications'],
    components: ['DX cooling', 'Hot gas reheat coil', 'Modulating reheat valve', 'Advanced controls']
  },
  {
    id: 'chilled-water-ahu',
    name: 'Chilled Water Air Handler',
    category: 'hydronic',
    description: 'Central air handler with chilled water cooling and hot water heating',
    features: ['Flexible zoning', 'High efficiency potential', 'Quiet operation', 'Long equipment life'],
    efficiency: {
      cooling: { min: 0.6, max: 0.4, unit: 'kW/ton' },
      heating: { min: 85, max: 98, unit: '%' }
    },
    capacityRange: { min: 10, max: 1000, unit: 'tons' },
    costRange: { min: 20000, max: 500000 },
    pros: [
      'Excellent zone control',
      'High efficiency with proper design',
      'Quiet indoor operation',
      'Long equipment life',
      'Flexible capacity'
    ],
    cons: [
      'High initial cost',
      'Requires mechanical room',
      'Complex system design',
      'Potential for water damage'
    ],
    bestFor: ['Large facilities', 'Multi-zone applications', 'Premium efficiency projects'],
    components: ['Chiller', 'Boiler', 'Cooling tower', 'Pumps', 'Air handlers', 'Piping']
  },
  {
    id: 'chilled-water-fcus',
    name: 'Chilled Water with Fan Coil Units',
    category: 'hydronic',
    description: 'Central plant with distributed fan coil units for individual zone control',
    features: ['Individual room control', 'Scalable system', 'Quiet operation', 'Flexible layout'],
    efficiency: {
      cooling: { min: 0.5, max: 0.35, unit: 'kW/ton' },
      heating: { min: 85, max: 98, unit: '%' }
    },
    capacityRange: { min: 20, max: 2000, unit: 'tons' },
    costRange: { min: 30000, max: 1000000 },
    pros: [
      'Excellent individual zone control',
      'Very quiet operation',
      'High efficiency potential',
      'Easy to expand',
      'No refrigerant in occupied space'
    ],
    cons: [
      'Highest initial cost',
      'Complex controls',
      'Requires significant mechanical space',
      'Higher maintenance requirements'
    ],
    bestFor: ['Multi-room grow facilities', 'Research facilities', 'Premium installations'],
    components: ['Chiller', 'Boiler', 'FCUs', 'Primary/secondary pumps', 'Controls', 'Piping network']
  },
  {
    id: 'split-dx',
    name: 'Split DX System',
    category: 'split',
    description: 'Separate indoor and outdoor units connected by refrigerant piping',
    features: ['Flexible installation', 'Good efficiency', 'Quiet indoor operation'],
    efficiency: {
      cooling: { min: 13, max: 23, unit: 'SEER' },
      heating: { min: 8, max: 10, unit: 'HSPF' }
    },
    capacityRange: { min: 1.5, max: 60, unit: 'tons' },
    costRange: { min: 5000, max: 100000 },
    pros: [
      'Flexible equipment placement',
      'Quiet indoor operation',
      'Good efficiency',
      'No ductwork losses if ductless'
    ],
    cons: [
      'Refrigerant piping limitations',
      'Multiple outdoor units for large spaces',
      'Moderate zone control',
      'Aesthetic concerns with wall units'
    ],
    bestFor: ['Small to medium rooms', 'Retrofit applications', 'Noise-sensitive areas'],
    components: ['Outdoor condensing unit', 'Indoor air handler/evaporator', 'Refrigerant piping', 'Controls']
  },
  {
    id: 'vrf',
    name: 'Variable Refrigerant Flow (VRF)',
    category: 'vrf',
    description: 'Advanced multi-zone system with variable capacity control',
    features: ['Simultaneous heating/cooling', 'Excellent part-load efficiency', 'Precise control'],
    efficiency: {
      cooling: { min: 15, max: 25, unit: 'EER' },
      heating: { min: 3.5, max: 4.5, unit: 'COP' }
    },
    capacityRange: { min: 6, max: 200, unit: 'tons' },
    costRange: { min: 25000, max: 500000 },
    pros: [
      'Excellent zone control',
      'High efficiency at part load',
      'Heat recovery between zones',
      'Compact equipment',
      'Quiet operation'
    ],
    cons: [
      'High initial cost',
      'Complex refrigerant piping',
      'Specialized maintenance required',
      'Limited North American support'
    ],
    bestFor: ['Multi-zone facilities', 'Variable load applications', 'Energy-conscious projects'],
    components: ['Outdoor unit', 'Multiple indoor units', 'Branch controllers', 'Refrigerant piping', 'Advanced controls']
  },
  {
    id: 'doas-dx',
    name: 'Dedicated Outdoor Air System (DOAS) with DX',
    category: 'dedicated',
    description: 'Separate system for ventilation with energy recovery and conditioning',
    features: ['Energy recovery', 'Precise humidity control', 'Improved IAQ', 'Decoupled loads'],
    efficiency: {
      cooling: { min: 3.0, max: 5.0, unit: 'COP' },
      heating: { min: 85, max: 95, unit: '%' }
    },
    capacityRange: { min: 500, max: 50000, unit: 'CFM' },
    costRange: { min: 15000, max: 200000 },
    pros: [
      'Excellent humidity control',
      'Energy recovery from exhaust',
      'Improved air quality',
      'Right-sized for ventilation'
    ],
    cons: [
      'Requires separate sensible cooling',
      'Higher system complexity',
      'Additional equipment cost',
      'More design coordination'
    ],
    bestFor: ['High ventilation requirements', 'Humidity-critical applications', 'Energy recovery opportunities'],
    components: ['Energy recovery wheel/plate', 'DX cooling', 'Heating coil', 'Filters', 'VFD fans']
  },
  {
    id: 'geothermal',
    name: 'Geothermal Heat Pump System',
    category: 'hydronic',
    description: 'Ground-source heat pump for highest efficiency heating and cooling',
    features: ['Highest efficiency', 'Stable ground temperatures', 'Long life', 'Low operating cost'],
    efficiency: {
      cooling: { min: 20, max: 30, unit: 'EER' },
      heating: { min: 3.5, max: 5.0, unit: 'COP' }
    },
    capacityRange: { min: 3, max: 500, unit: 'tons' },
    costRange: { min: 20000, max: 1000000 },
    pros: [
      'Lowest operating costs',
      'Highest efficiency',
      'Long equipment life (25+ years)',
      'Environmentally friendly',
      'Quiet operation'
    ],
    cons: [
      'Very high initial cost',
      'Requires suitable land/geology',
      'Complex installation',
      'Long payback period'
    ],
    bestFor: ['Long-term installations', 'Sustainability-focused projects', 'Stable load applications'],
    components: ['Water-source heat pumps', 'Ground loop', 'Circulation pumps', 'Air handlers', 'Controls']
  },
  {
    id: 'quest-dual-dry',
    name: 'Quest Dual Dry System',
    category: 'dedicated',
    description: 'Purpose-built cultivation dehumidification with integrated cooling and air distribution',
    features: ['Dual-path air flow', 'Independent dehumidification', 'No overcooling', 'Cultivation-specific'],
    efficiency: {
      cooling: { min: 14, max: 18, unit: 'EER' },
      heating: { min: 90, max: 98, unit: '%' }
    },
    capacityRange: { min: 10, max: 100, unit: 'tons' },
    costRange: { min: 20000, max: 150000 },
    pros: [
      'Designed for cultivation',
      'Superior humidity control',
      'Energy-efficient dehumidification',
      'Prevents mold/mildew',
      'Integrated air distribution'
    ],
    cons: [
      'Higher initial cost',
      'Limited to Quest brand',
      'Requires proper sizing',
      'May need supplemental cooling'
    ],
    bestFor: ['Cannabis cultivation', 'High humidity grow rooms', 'Precision environment control'],
    components: ['Dual refrigeration circuits', 'Variable speed compressors', 'Reheat capability', 'MERV filtration']
  },
  {
    id: 'desert-aire-growaire',
    name: 'Desert Aire GrowAire™',
    category: 'dedicated',
    description: 'Cultivation-specific climate control with adaptive dehumidification technology',
    features: ['Adaptive dehumidification', 'Crop-specific programming', 'Remote monitoring', 'Energy recovery'],
    efficiency: {
      cooling: { min: 15, max: 20, unit: 'EER' },
      heating: { min: 92, max: 98, unit: '%' }
    },
    capacityRange: { min: 15, max: 200, unit: 'tons' },
    costRange: { min: 30000, max: 250000 },
    pros: [
      'Purpose-built for agriculture',
      'Advanced control algorithms',
      'Handles extreme latent loads',
      'Integrated CO2 management',
      'Proven track record'
    ],
    cons: [
      'Premium pricing',
      'Complex installation',
      'Requires trained technicians',
      'Limited distribution network'
    ],
    bestFor: ['Commercial cultivation', 'Multi-tier growing', 'Research facilities', 'Vertical farms'],
    components: ['Variable capacity compressors', 'Hot gas reheat', 'Enthalpy wheel', 'Advanced controls']
  },
  {
    id: 'surna-hybrid',
    name: 'Surna Hybrid Building System',
    category: 'hydronic',
    description: 'Integrated chilled water system designed specifically for cannabis cultivation',
    features: ['Redundant cooling', 'Scalable design', 'Biosecurity features', 'Data analytics'],
    efficiency: {
      cooling: { min: 0.5, max: 0.35, unit: 'kW/ton' },
      heating: { min: 90, max: 98, unit: '%' }
    },
    capacityRange: { min: 50, max: 1000, unit: 'tons' },
    costRange: { min: 100000, max: 2000000 },
    pros: [
      'Cannabis industry leader',
      'Integrated automation',
      'N+1 redundancy options',
      'Biosecurity considerations',
      'Proven cultivation results'
    ],
    cons: [
      'Very high initial cost',
      'Complex installation',
      'Requires mechanical room',
      'Long lead times'
    ],
    bestFor: ['Large commercial grows', 'Multi-room facilities', 'GMP operations', 'High-value crops'],
    components: ['Chillers', 'Fan coils', 'Dehumidification units', 'Controls platform', 'Air sanitization']
  },
  {
    id: 'anden-grow',
    name: 'Anden Grow-Optimized Dehumidifiers',
    category: 'dedicated',
    description: 'Industrial dehumidification systems with integrated environmental controls',
    features: ['Grow-optimized controls', 'EPRI tested', 'Remote monitoring', 'Variable capacity'],
    efficiency: {
      cooling: { min: 4.5, max: 6.5, unit: 'L/kWh' },
      heating: { min: 85, max: 95, unit: '%' }
    },
    capacityRange: { min: 70, max: 710, unit: 'pints/day' },
    costRange: { min: 2000, max: 15000 },
    pros: [
      'Cost-effective solution',
      'Easy installation',
      'Reliable operation',
      'Good customer support',
      'Energy Star rated options'
    ],
    cons: [
      'Limited cooling capacity',
      'Multiple units for large spaces',
      'Basic control features',
      'Supplemental cooling needed'
    ],
    bestFor: ['Small to medium grows', 'Supplemental dehumidification', 'Budget-conscious operations'],
    components: ['Refrigeration system', 'Internal condensate pump', 'Auto-restart', 'Digital controls']
  },
  {
    id: 'modine-vertical-unit-ventilator',
    name: 'Modine Vertical Unit Ventilator',
    category: 'packaged',
    description: 'Vertical discharge units ideal for greenhouse and indoor growing applications',
    features: ['Vertical air discharge', 'Steam/hot water compatible', 'Corrosion resistant', 'High CFM'],
    efficiency: {
      cooling: { min: 12, max: 16, unit: 'EER' },
      heating: { min: 80, max: 95, unit: '%' }
    },
    capacityRange: { min: 5, max: 50, unit: 'tons' },
    costRange: { min: 8000, max: 40000 },
    pros: [
      'Ideal air distribution pattern',
      'Greenhouse-proven design',
      'Multiple fuel options',
      'Durable construction',
      'Good value'
    ],
    cons: [
      'Limited dehumidification',
      'Basic controls',
      'Noise considerations',
      'Regular maintenance needed'
    ],
    bestFor: ['Greenhouses', 'High-ceiling grow rooms', 'Supplemental heating/cooling'],
    components: ['Vertical discharge fan', 'Cooling/heating coils', 'Filters', 'Motorized dampers']
  },
  {
    id: 'innovair-horticulture',
    name: 'InnovAir Horticulture Series',
    category: 'packaged',
    description: 'Purpose-built air handlers for controlled environment horticulture',
    features: ['Horticulture-specific', 'UV-C sterilization', 'HEPA filtration options', 'Modular design'],
    efficiency: {
      cooling: { min: 13, max: 18, unit: 'EER' },
      heating: { min: 90, max: 97, unit: '%' }
    },
    capacityRange: { min: 10, max: 150, unit: 'tons' },
    costRange: { min: 25000, max: 200000 },
    pros: [
      'Purpose-built for growing',
      'Advanced filtration options',
      'Pathogen mitigation features',
      'Flexible configurations',
      'Good technical support'
    ],
    cons: [
      'Higher cost than standard units',
      'Custom lead times',
      'Limited availability',
      'Specialized maintenance'
    ],
    bestFor: ['Clean room cultivation', 'Research facilities', 'High-value crops', 'GMP compliance'],
    components: ['EC fans', 'UV-C lamps', 'HEPA/MERV filtration', 'Cooling/heating coils', 'BMS integration']
  },
  {
    id: 'climate-control-vflex',
    name: 'Climate Control V-Flex System',
    category: 'split',
    description: 'Variable capacity split systems with cultivation-optimized controls',
    features: ['Variable capacity', 'Tight temperature control', 'Modbus integration', 'Multiple zones'],
    efficiency: {
      cooling: { min: 16, max: 23, unit: 'SEER' },
      heating: { min: 9, max: 11, unit: 'HSPF' }
    },
    capacityRange: { min: 3, max: 40, unit: 'tons' },
    costRange: { min: 10000, max: 80000 },
    pros: [
      'Excellent part-load efficiency',
      'Precise temperature control',
      'Quiet operation',
      'Flexible installation',
      'Good zone control'
    ],
    cons: [
      'Limited humidity control',
      'Multiple units for large spaces',
      'Refrigerant piping limits',
      'Higher maintenance'
    ],
    bestFor: ['Multi-zone facilities', 'Retrofit applications', 'Variable load rooms'],
    components: ['Variable speed compressor', 'Indoor fan coils', 'Advanced controls', 'Refrigerant piping']
  },
  {
    id: 'stulz-precision-air',
    name: 'STULZ Precision Air Control',
    category: 'dedicated',
    description: 'Data center technology adapted for precision cultivation environments',
    features: ['±0.5°C precision', 'Redundancy options', 'High sensible cooling', 'Free cooling capable'],
    efficiency: {
      cooling: { min: 20, max: 30, unit: 'EER' },
      heating: { min: 95, max: 99, unit: '%' }
    },
    capacityRange: { min: 5, max: 200, unit: 'tons' },
    costRange: { min: 30000, max: 300000 },
    pros: [
      'Extreme precision control',
      'High reliability',
      'Efficient operation',
      'Advanced monitoring',
      'Global support'
    ],
    cons: [
      'Very high cost',
      'Overkill for many applications',
      'Complex commissioning',
      'Specialized maintenance'
    ],
    bestFor: ['Research facilities', 'Tissue culture', 'Pharmaceutical cultivation', 'Critical environments'],
    components: ['EC fans', 'Electronic expansion valves', 'Precision sensors', 'Redundant controls']
  }
];

interface HVACSystemSelectorProps {
  coolingLoad?: number; // kW
  heatingLoad?: number; // kW
  roomArea?: number; // m²
  onSystemSelect?: (system: HVACSystemType) => void;
}

export function HVACSystemSelector({ 
  coolingLoad = 10, 
  heatingLoad = 8, 
  roomArea = 100, 
  onSystemSelect = () => {} 
}: HVACSystemSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSystem, setSelectedSystem] = useState<HVACSystemType | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);

  // Convert kW to tons for display
  const coolingTons = (coolingLoad || 0) * 0.2843; // 1 kW = 0.2843 tons

  // Filter systems by capacity
  const suitableSystems = HVAC_SYSTEMS.filter(system => {
    const capacity = system.capacityRange;
    if (capacity.unit === 'tons') {
      return coolingTons >= capacity.min && coolingTons <= capacity.max;
    }
    return true; // For CFM-based systems, always show
  });

  // Further filter by category
  const filteredSystems = selectedCategory === 'all' 
    ? suitableSystems 
    : suitableSystems.filter(s => s.category === selectedCategory);

  // Calculate estimated costs
  const calculateOperatingCost = (system: HVACSystemType) => {
    const avgCoolingEff = (system.efficiency.cooling.min + system.efficiency.cooling.max) / 2;
    let annualCost = 0;
    
    if (system.efficiency.cooling.unit === 'EER') {
      // EER = BTU/hr / Watts, so Watts = BTU/hr / EER
      // 1 ton = 12,000 BTU/hr
      const coolingPower = (coolingTons * 12000) / avgCoolingEff;
      annualCost = (coolingPower / 1000) * 4000 * 0.12; // 4000 hours/year, $0.12/kWh
    } else if (system.efficiency.cooling.unit === 'kW/ton') {
      const coolingPower = coolingTons * avgCoolingEff * 1000; // Convert to watts
      annualCost = (coolingPower / 1000) * 4000 * 0.12;
    } else if (system.efficiency.cooling.unit === 'COP') {
      const coolingPower = (coolingLoad * 1000) / avgCoolingEff;
      annualCost = (coolingPower / 1000) * 4000 * 0.12;
    }
    
    return annualCost;
  };

  const handleSystemSelect = (system: HVACSystemType) => {
    setSelectedSystem(system);
    onSystemSelect(system);
  };

  const toggleCompare = (systemId: string) => {
    if (compareList.includes(systemId)) {
      setCompareList(compareList.filter(id => id !== systemId));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, systemId]);
    }
  };

  const categories = [
    { id: 'all', name: 'All Systems' },
    { id: 'packaged', name: 'Packaged Units' },
    { id: 'split', name: 'Split Systems' },
    { id: 'hydronic', name: 'Hydronic Systems' },
    { id: 'vrf', name: 'VRF Systems' },
    { id: 'dedicated', name: 'Dedicated Systems' }
  ];

  return (
    <div className="space-y-6">
      {/* System Requirements Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-400" />
          System Requirements
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400">Cooling Load</p>
            <p className="text-xl font-bold text-white">{coolingTons.toFixed(1)} tons</p>
            <p className="text-sm text-gray-500">({coolingLoad ? coolingLoad.toFixed(1) : '0.0'} kW)</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Heating Load</p>
            <p className="text-xl font-bold text-white">{heatingLoad ? heatingLoad.toFixed(1) : '0.0'} kW</p>
            <p className="text-sm text-gray-500">({heatingLoad ? (heatingLoad * 3412).toFixed(0) : '0'} BTU/hr)</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Room Area</p>
            <p className="text-xl font-bold text-white">{roomArea ? roomArea.toFixed(0) : '0'} m²</p>
            <p className="text-sm text-gray-500">({roomArea ? (roomArea * 10.764).toFixed(0) : '0'} ft²)</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Filter by System Type</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* System Cards */}
      <div className="grid gap-4">
        {filteredSystems.map(system => {
          const isSelected = selectedSystem?.id === system.id;
          const isInCompare = compareList.includes(system.id);
          const operatingCost = calculateOperatingCost(system);

          return (
            <div
              key={system.id}
              className={`bg-gray-800 rounded-lg border-2 transition-all ${
                isSelected 
                  ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{system.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{system.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleCompare(system.id)}
                      disabled={!isInCompare && compareList.length >= 3}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        isInCompare
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {isInCompare ? 'Remove' : 'Compare'}
                    </button>
                    <button
                      onClick={() => handleSystemSelect(system)}
                      className={`px-4 py-1 rounded text-sm transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>

                {/* Key Specifications */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Cooling Efficiency</p>
                    <p className="text-sm font-medium text-white">
                      {system.efficiency.cooling.min}-{system.efficiency.cooling.max} {system.efficiency.cooling.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Capacity Range</p>
                    <p className="text-sm font-medium text-white">
                      {system.capacityRange.min}-{system.capacityRange.max} {system.capacityRange.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Initial Cost</p>
                    <p className="text-sm font-medium text-white">
                      ${system.costRange.min.toLocaleString()}-${system.costRange.max.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Est. Annual Energy</p>
                    <p className="text-sm font-medium text-white">
                      ${operatingCost.toLocaleString()}/yr
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Key Features</p>
                  <div className="flex flex-wrap gap-2">
                    {system.features.map((feature, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expand for more details */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Advantages
                        </h4>
                        <ul className="space-y-1">
                          {system.pros.map((pro, idx) => (
                            <li key={idx} className="text-xs text-gray-300">• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Considerations
                        </h4>
                        <ul className="space-y-1">
                          {system.cons.map((con, idx) => (
                            <li key={idx} className="text-xs text-gray-300">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-blue-400 mb-2">Best For</h4>
                      <div className="flex flex-wrap gap-2">
                        {system.bestFor.map((use, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-blue-600/20 border border-blue-600/50 rounded text-xs text-blue-300"
                          >
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Major Components</h4>
                      <div className="flex flex-wrap gap-2">
                        {system.components.map((comp, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      {compareList.length > 0 && (
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">System Comparison</h3>
            <button
              onClick={() => setCompareList([])}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear Comparison
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-sm text-gray-400">Feature</th>
                  {compareList.map(id => {
                    const system = HVAC_SYSTEMS.find(s => s.id === id);
                    return (
                      <th key={id} className="text-left py-2 text-sm text-white px-4">
                        {system?.name}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-700">
                  <td className="py-2 text-gray-400">Cooling Efficiency</td>
                  {compareList.map(id => {
                    const system = HVAC_SYSTEMS.find(s => s.id === id);
                    return (
                      <td key={id} className="py-2 px-4 text-gray-300">
                        {system?.efficiency.cooling.min}-{system?.efficiency.cooling.max} {system?.efficiency.cooling.unit}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 text-gray-400">Initial Cost Range</td>
                  {compareList.map(id => {
                    const system = HVAC_SYSTEMS.find(s => s.id === id);
                    return (
                      <td key={id} className="py-2 px-4 text-gray-300">
                        ${system?.costRange.min.toLocaleString()}-${system?.costRange.max.toLocaleString()}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 text-gray-400">Est. Annual Energy Cost</td>
                  {compareList.map(id => {
                    const system = HVAC_SYSTEMS.find(s => s.id === id);
                    if (system) {
                      const cost = calculateOperatingCost(system);
                      return (
                        <td key={id} className="py-2 px-4 text-gray-300">
                          ${cost.toLocaleString()}/yr
                        </td>
                      );
                    }
                    return <td key={id} />;
                  })}
                </tr>
                <tr>
                  <td className="py-2 text-gray-400">Best For</td>
                  {compareList.map(id => {
                    const system = HVAC_SYSTEMS.find(s => s.id === id);
                    return (
                      <td key={id} className="py-2 px-4 text-gray-300 text-xs">
                        {system?.bestFor.join(', ')}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-600/10 border border-blue-600/50 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-blue-400 mb-1">System Selection Tips</p>
            <ul className="space-y-1 text-xs">
              <li>• Consider both initial cost and operating efficiency for total lifecycle cost</li>
              <li>• Hot gas reheat is essential for cannabis and high-humidity grow rooms</li>
              <li>• Chilled water systems offer the best flexibility but highest complexity</li>
              <li>• VRF systems excel at part-load efficiency and zone control</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}