'use client';

import React, { useState, useEffect } from 'react';
import {
  Factory, Zap, Truck, Leaf, TrendingUp, AlertCircle,
  Calculator, Download, Info, ChevronDown, ChevronUp
} from 'lucide-react';

interface EmissionsData {
  scope1: {
    heating: number;
    generators: number;
    vehicles: number;
    refrigerants: number;
    total: number;
  };
  scope2: {
    electricity: number;
    heating: number;
    cooling: number;
    total: number;
  };
  scope3: {
    supplies: number;
    waste: number;
    transport: number;
    water: number;
    total: number;
  };
  total: number;
  intensity: number; // kg CO2e per kg product
}

interface FacilityData {
  area: number; // m²
  energyUse: {
    electricity: number; // kWh/month
    naturalGas: number; // m³/month
    propane: number; // L/month
  };
  production: number; // kg/month
  transport: {
    deliveries: number; // per month
    avgDistance: number; // km
  };
  waste: {
    organic: number; // kg/month
    plastic: number; // kg/month
    recycling: number; // kg/month
  };
}

export function GHGEmissionsCalculator() {
  const [facilityData, setFacilityData] = useState<FacilityData>({
    area: 1000,
    energyUse: {
      electricity: 50000,
      naturalGas: 2000,
      propane: 0
    },
    production: 10000,
    transport: {
      deliveries: 20,
      avgDistance: 100
    },
    waste: {
      organic: 500,
      plastic: 50,
      recycling: 100
    }
  });

  const [emissions, setEmissions] = useState<EmissionsData>({
    scope1: { heating: 0, generators: 0, vehicles: 0, refrigerants: 0, total: 0 },
    scope2: { electricity: 0, heating: 0, cooling: 0, total: 0 },
    scope3: { supplies: 0, waste: 0, transport: 0, water: 0, total: 0 },
    total: 0,
    intensity: 0
  });

  const [expandedSection, setExpandedSection] = useState<string | null>('scope2');
  const [comparisonMode, setComparisonMode] = useState(false);

  // Emission factors (kg CO2e per unit)
  const emissionFactors = {
    electricity: 0.4, // per kWh (grid average)
    naturalGas: 1.9, // per m³
    propane: 1.5, // per L
    diesel: 2.7, // per L
    transport: 0.12, // per km-ton
    organicWaste: 0.5, // per kg
    plasticWaste: 2.5, // per kg
    water: 0.0003, // per L
    refrigerantLeak: 1430 // per kg (R-134a)
  };

  // Calculate emissions whenever facility data changes
  useEffect(() => {
    calculateEmissions();
  }, [facilityData]);

  const calculateEmissions = () => {
    // Scope 1: Direct emissions
    const scope1Heating = facilityData.energyUse.naturalGas * emissionFactors.naturalGas +
                         facilityData.energyUse.propane * emissionFactors.propane;
    const scope1Generators = 0; // Placeholder for generator emissions
    const scope1Vehicles = facilityData.transport.deliveries * facilityData.transport.avgDistance * 0.3; // Estimated
    const scope1Refrigerants = facilityData.area * 0.001 * emissionFactors.refrigerantLeak; // Estimated leak rate
    const scope1Total = scope1Heating + scope1Generators + scope1Vehicles + scope1Refrigerants;

    // Scope 2: Indirect emissions from purchased energy
    const scope2Electricity = facilityData.energyUse.electricity * emissionFactors.electricity;
    const scope2Heating = 0; // If district heating is used
    const scope2Cooling = facilityData.energyUse.electricity * 0.3 * emissionFactors.electricity; // Estimated cooling portion
    const scope2Total = scope2Electricity + scope2Heating + scope2Cooling;

    // Scope 3: Other indirect emissions
    const scope3Supplies = facilityData.production * 0.1; // Estimated supply chain emissions
    const scope3Waste = (facilityData.waste.organic * emissionFactors.organicWaste) +
                       (facilityData.waste.plastic * emissionFactors.plasticWaste);
    const scope3Transport = facilityData.transport.deliveries * facilityData.transport.avgDistance * 
                           emissionFactors.transport * 5; // Estimated cargo weight
    const scope3Water = facilityData.production * 100 * emissionFactors.water; // Estimated water use
    const scope3Total = scope3Supplies + scope3Waste + scope3Transport + scope3Water;

    const totalEmissions = scope1Total + scope2Total + scope3Total;
    const emissionsIntensity = facilityData.production > 0 ? totalEmissions / facilityData.production : 0;

    setEmissions({
      scope1: {
        heating: scope1Heating,
        generators: scope1Generators,
        vehicles: scope1Vehicles,
        refrigerants: scope1Refrigerants,
        total: scope1Total
      },
      scope2: {
        electricity: scope2Electricity,
        heating: scope2Heating,
        cooling: scope2Cooling,
        total: scope2Total
      },
      scope3: {
        supplies: scope3Supplies,
        waste: scope3Waste,
        transport: scope3Transport,
        water: scope3Water,
        total: scope3Total
      },
      total: totalEmissions,
      intensity: emissionsIntensity
    });
  };

  const getEmissionLevel = (value: number, total: number) => {
    const percentage = (value / total) * 100;
    if (percentage > 40) return 'high';
    if (percentage > 20) return 'medium';
    return 'low';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400 bg-red-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const exportReport = () => {
    const report = {
      facilityData,
      emissions,
      timestamp: new Date().toISOString(),
      recommendations: getRecommendations()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghg-emissions-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (emissions.scope2.electricity > emissions.total * 0.4) {
      recommendations.push('Consider renewable energy sources or PPAs to reduce Scope 2 emissions');
    }
    if (emissions.scope1.heating > emissions.total * 0.2) {
      recommendations.push('Upgrade to more efficient heating systems or improve insulation');
    }
    if (emissions.intensity > 1) {
      recommendations.push('Focus on production efficiency to reduce emissions intensity');
    }
    if (emissions.scope3.waste > emissions.scope3.total * 0.3) {
      recommendations.push('Implement waste reduction and recycling programs');
    }

    return recommendations;
  };

  const ScopeSection = ({ 
    scope, 
    title, 
    icon: Icon, 
    color, 
    data 
  }: { 
    scope: string; 
    title: string; 
    icon: any; 
    color: string; 
    data: any 
  }) => {
    const isExpanded = expandedSection === scope;
    
    return (
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : scope)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${color}`} />
            <div className="text-left">
              <h3 className="font-semibold text-gray-100">{title}</h3>
              <p className="text-sm text-gray-400">
                {data.total.toFixed(1)} kg CO₂e/month
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-100">
                {((data.total / emissions.total) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-400">of total</p>
            </div>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3">
            {Object.entries(data).filter(([key]) => key !== 'total').map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2 border-t border-gray-700">
                <span className="text-sm text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${getLevelColor(getEmissionLevel(value as number, data.total))}`}>
                    {getEmissionLevel(value as number, data.total)}
                  </span>
                  <span className="text-sm font-medium text-gray-200">
                    {(value as number).toFixed(1)} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Factory className="w-6 h-6 text-gray-400" />
          GHG Emissions Calculator
        </h3>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Facility Input Section */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-200 mb-4">Facility Data</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Facility Area (m²)
            </label>
            <input
              type="number"
              value={facilityData.area}
              onChange={(e) => setFacilityData({...facilityData, area: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Electricity (kWh/month)
            </label>
            <input
              type="number"
              value={facilityData.energyUse.electricity}
              onChange={(e) => setFacilityData({
                ...facilityData, 
                energyUse: {...facilityData.energyUse, electricity: Number(e.target.value)}
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Production (kg/month)
            </label>
            <input
              type="number"
              value={facilityData.production}
              onChange={(e) => setFacilityData({...facilityData, production: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Total Emissions Overview */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Total Emissions</p>
            <p className="text-3xl font-bold text-gray-100">
              {(emissions.total / 1000).toFixed(1)}
            </p>
            <p className="text-sm text-gray-400">tons CO₂e/month</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Emissions Intensity</p>
            <p className="text-3xl font-bold text-gray-100">
              {emissions.intensity.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400">kg CO₂e/kg product</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Annual Projection</p>
            <p className="text-3xl font-bold text-gray-100">
              {(emissions.total * 12 / 1000).toFixed(0)}
            </p>
            <p className="text-sm text-gray-400">tons CO₂e/year</p>
          </div>
        </div>
      </div>

      {/* Emissions by Scope */}
      <div className="space-y-4 mb-6">
        <ScopeSection
          scope="scope1"
          title="Scope 1: Direct Emissions"
          icon={Factory}
          color="text-red-600"
          data={emissions.scope1}
        />
        <ScopeSection
          scope="scope2"
          title="Scope 2: Purchased Energy"
          icon={Zap}
          color="text-yellow-600"
          data={emissions.scope2}
        />
        <ScopeSection
          scope="scope3"
          title="Scope 3: Value Chain"
          icon={Truck}
          color="text-blue-600"
          data={emissions.scope3}
        />
      </div>

      {/* Recommendations */}
      {getRecommendations().length > 0 && (
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Recommendations for Reducing Emissions
          </h4>
          <ul className="space-y-2">
            {getRecommendations().map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <Leaf className="w-4 h-4 text-green-600 mt-0.5" />
                <span className="text-sm text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}