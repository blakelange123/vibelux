'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Building,
  Zap,
  Truck,
  Package,
  Droplets,
  Users,
  Save,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { ComprehensiveESGCalculator, ESGCalculationInputs } from '@/lib/esg/comprehensive-esg-calculator';
import { ComprehensiveESGMetrics } from '@/lib/esg/comprehensive-esg-framework';

interface CalculationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
}

export function ESGCalculatorInterface() {
  const [currentStep, setCurrentStep] = useState(0);
  const [calculationInputs, setCalculationInputs] = useState<Partial<ESGCalculationInputs>>({});
  const [calculatedResults, setCalculatedResults] = useState<ComprehensiveESGMetrics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculator = new ComprehensiveESGCalculator();

  const steps: CalculationStep[] = [
    {
      id: 'facility',
      title: 'Facility Basics',
      description: 'Basic facility information and production data',
      icon: Building,
      completed: !!calculationInputs.facilityData
    },
    {
      id: 'energy',
      title: 'Energy & Emissions',
      description: 'Electricity, gas usage, and emission factors',
      icon: Zap,
      completed: !!calculationInputs.energy
    },
    {
      id: 'transportation',
      title: 'Transportation',
      description: 'Employee commuting, business travel, and distribution',
      icon: Truck,
      completed: !!calculationInputs.transportation
    },
    {
      id: 'materials',
      title: 'Materials & Packaging',
      description: 'Packaging materials, supplies, and sourcing',
      icon: Package,
      completed: !!calculationInputs.materials
    },
    {
      id: 'resources',
      title: 'Water & Waste',
      description: 'Water usage, recycling, and waste management',
      icon: Droplets,
      completed: !!calculationInputs.resources
    },
    {
      id: 'workforce',
      title: 'Workforce & Social',
      description: 'Employee data, compensation, and benefits',
      icon: Users,
      completed: !!calculationInputs.workforce
    }
  ];

  const updateInputs = (stepData: any) => {
    setCalculationInputs(prev => ({ ...prev, ...stepData }));
  };

  const calculateESG = async () => {
    if (!isComplete()) return;
    
    setIsCalculating(true);
    try {
      const results = calculator.calculateComprehensiveESG(calculationInputs as ESGCalculationInputs);
      setCalculatedResults(results);
    } catch (error) {
      console.error('ESG calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const isComplete = () => {
    return steps.every(step => step.completed);
  };

  const exportResults = () => {
    if (!calculatedResults) return;
    
    const exportData = {
      inputs: calculationInputs,
      results: calculatedResults,
      timestamp: new Date().toISOString(),
      facilityName: calculationInputs.facilityData?.facilityAreaM2 ? 'CEA Facility' : 'Unknown'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esg-calculation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const FacilityStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Facility Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Total Employees
          </label>
          <input
            type="number"
            value={calculationInputs.facilityData?.totalEmployees || ''}
            onChange={(e) => updateInputs({
              facilityData: {
                ...calculationInputs.facilityData,
                totalEmployees: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 45"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Annual Production (kg)
          </label>
          <input
            type="number"
            value={calculationInputs.facilityData?.annualProductionKg || ''}
            onChange={(e) => updateInputs({
              facilityData: {
                ...calculationInputs.facilityData,
                annualProductionKg: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 50000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Facility Area (m²)
          </label>
          <input
            type="number"
            value={calculationInputs.facilityData?.facilityAreaM2 || ''}
            onChange={(e) => updateInputs({
              facilityData: {
                ...calculationInputs.facilityData,
                facilityAreaM2: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 4000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Operating Days per Year
          </label>
          <input
            type="number"
            value={calculationInputs.facilityData?.operatingDaysPerYear || ''}
            onChange={(e) => updateInputs({
              facilityData: {
                ...calculationInputs.facilityData,
                operatingDaysPerYear: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 365"
          />
        </div>
      </div>
    </div>
  );

  const EnergyStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Energy & Emissions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Total Annual kWh
          </label>
          <input
            type="number"
            value={calculationInputs.energy?.totalKWhAnnual || ''}
            onChange={(e) => updateInputs({
              energy: {
                ...calculationInputs.energy,
                totalKWhAnnual: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 180000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Renewable Energy kWh
          </label>
          <input
            type="number"
            value={calculationInputs.energy?.renewableKWhAnnual || ''}
            onChange={(e) => updateInputs({
              energy: {
                ...calculationInputs.energy,
                renewableKWhAnnual: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 63000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Natural Gas kWh
          </label>
          <input
            type="number"
            value={calculationInputs.energy?.naturalGasKWhAnnual || ''}
            onChange={(e) => updateInputs({
              energy: {
                ...calculationInputs.energy,
                naturalGasKWhAnnual: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 8500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Grid Emission Factor (kg CO₂e/kWh)
          </label>
          <input
            type="number"
            step="0.001"
            value={calculationInputs.energy?.gridEmissionFactor || ''}
            onChange={(e) => updateInputs({
              energy: {
                ...calculationInputs.energy,
                gridEmissionFactor: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 0.385 (US average)"
          />
          <p className="text-xs text-gray-400 mt-1">
            Check your local utility's emission factor or use EPA eGRID data
          </p>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-blue-400 font-medium">Renewable Energy Percentage</p>
            <p className="text-sm text-gray-300">
              {calculationInputs.energy?.totalKWhAnnual && calculationInputs.energy?.renewableKWhAnnual
                ? `${Math.round((calculationInputs.energy.renewableKWhAnnual / calculationInputs.energy.totalKWhAnnual) * 100)}% of your energy is renewable`
                : 'Enter values to see renewable percentage'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const TransportationStep = () => (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-white mb-4">Transportation</h3>
      
      {/* Employee Commuting */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-4">Employee Commuting</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Average Commute Distance (km)
            </label>
            <input
              type="number"
              value={calculationInputs.transportation?.employeeCommuteData?.averageCommuteKm || ''}
              onChange={(e) => updateInputs({
                transportation: {
                  ...calculationInputs.transportation,
                  employeeCommuteData: {
                    ...calculationInputs.transportation?.employeeCommuteData,
                    averageCommuteKm: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 18"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Work Days per Year
            </label>
            <input
              type="number"
              value={calculationInputs.transportation?.employeeCommuteData?.daysWorkedPerYear || ''}
              onChange={(e) => updateInputs({
                transportation: {
                  ...calculationInputs.transportation,
                  employeeCommuteData: {
                    ...calculationInputs.transportation?.employeeCommuteData,
                    daysWorkedPerYear: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 250"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Public Transit Users (%)
            </label>
            <input
              type="number"
              value={calculationInputs.transportation?.employeeCommuteData?.publicTransitPercent || ''}
              onChange={(e) => updateInputs({
                transportation: {
                  ...calculationInputs.transportation,
                  employeeCommuteData: {
                    ...calculationInputs.transportation?.employeeCommuteData,
                    publicTransitPercent: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Carpool Participants (%)
            </label>
            <input
              type="number"
              value={calculationInputs.transportation?.employeeCommuteData?.carpoolPercent || ''}
              onChange={(e) => updateInputs({
                transportation: {
                  ...calculationInputs.transportation,
                  employeeCommuteData: {
                    ...calculationInputs.transportation?.employeeCommuteData,
                    carpoolPercent: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 35"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Electric Vehicle Users (%)
            </label>
            <input
              type="number"
              value={calculationInputs.transportation?.employeeCommuteData?.electricVehiclePercent || ''}
              onChange={(e) => updateInputs({
                transportation: {
                  ...calculationInputs.transportation,
                  employeeCommuteData: {
                    ...calculationInputs.transportation?.employeeCommuteData,
                    electricVehiclePercent: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 15"
            />
          </div>
        </div>
      </div>

      {/* Business Travel */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-4">Business Travel</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Annual Flight km
            </label>
            <input
              type="number"
              value={calculationInputs.transportation?.businessTravel?.flightKm || ''}
              onChange={(e) => updateInputs({
                transportation: {
                  ...calculationInputs.transportation,
                  businessTravel: {
                    ...calculationInputs.transportation?.businessTravel,
                    flightKm: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 25000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hotel Nights
            </label>
            <input
              type="number"
              value={calculationInputs.transportation?.businessTravel?.hotelNights || ''}
              onChange={(e) => updateInputs({
                transportation: {
                  ...calculationInputs.transportation,
                  businessTravel: {
                    ...calculationInputs.transportation?.businessTravel,
                    hotelNights: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rental Car km
            </label>
            <input
              type="number"
              value={calculationInputs.transportation?.businessTravel?.rentalCarKm || ''}
              onChange={(e) => updateInputs({
                transportation: {
                  ...calculationInputs.transportation,
                  businessTravel: {
                    ...calculationInputs.transportation?.businessTravel,
                    rentalCarKm: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 5000"
            />
          </div>
        </div>
      </div>

      {/* Distribution */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-4">Product Distribution</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Average Delivery Distance (km)
            </label>
            <input
              type="number"
              value={calculationInputs.transportation?.distribution?.averageDeliveryDistanceKm || ''}
              onChange={(e) => updateInputs({
                transportation: {
                  ...calculationInputs.transportation,
                  distribution: {
                    ...calculationInputs.transportation?.distribution,
                    averageDeliveryDistanceKm: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Deliveries per Year
            </label>
            <input
              type="number"
              value={calculationInputs.transportation?.distribution?.deliveriesPerYear || ''}
              onChange={(e) => updateInputs({
                transportation: {
                  ...calculationInputs.transportation,
                  distribution: {
                    ...calculationInputs.transportation?.distribution,
                    deliveriesPerYear: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Truck Load Efficiency (kg)
            </label>
            <input
              type="number"
              value={calculationInputs.transportation?.distribution?.truckLoadEfficiency || ''}
              onChange={(e) => updateInputs({
                transportation: {
                  ...calculationInputs.transportation,
                  distribution: {
                    ...calculationInputs.transportation?.distribution,
                    truckLoadEfficiency: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 1000"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const MaterialsStep = () => (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-white mb-4">Materials & Packaging</h3>
      
      {/* Packaging */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-4">Packaging Materials</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cardboard Usage (kg/year)
            </label>
            <input
              type="number"
              value={calculationInputs.materials?.packaging?.cardboardKgAnnual || ''}
              onChange={(e) => updateInputs({
                materials: {
                  ...calculationInputs.materials,
                  packaging: {
                    ...calculationInputs.materials?.packaging,
                    cardboardKgAnnual: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 8500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plastic Usage (kg/year)
            </label>
            <input
              type="number"
              value={calculationInputs.materials?.packaging?.plasticKgAnnual || ''}
              onChange={(e) => updateInputs({
                materials: {
                  ...calculationInputs.materials,
                  packaging: {
                    ...calculationInputs.materials?.packaging,
                    plasticKgAnnual: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 2400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recycled Content (%)
            </label>
            <input
              type="number"
              value={calculationInputs.materials?.packaging?.recycledContentPercent || ''}
              onChange={(e) => updateInputs({
                materials: {
                  ...calculationInputs.materials,
                  packaging: {
                    ...calculationInputs.materials?.packaging,
                    recycledContentPercent: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 65"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Compostable Packaging (%)
            </label>
            <input
              type="number"
              value={calculationInputs.materials?.packaging?.compostablePercent || ''}
              onChange={(e) => updateInputs({
                materials: {
                  ...calculationInputs.materials,
                  packaging: {
                    ...calculationInputs.materials?.packaging,
                    compostablePercent: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 30"
            />
          </div>
        </div>
      </div>

      {/* Supplies */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-4">Production Supplies</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Seeds (kg/year)
            </label>
            <input
              type="number"
              value={calculationInputs.materials?.supplies?.seedsKgAnnual || ''}
              onChange={(e) => updateInputs({
                materials: {
                  ...calculationInputs.materials,
                  supplies: {
                    ...calculationInputs.materials?.supplies,
                    seedsKgAnnual: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nutrients (kg/year)
            </label>
            <input
              type="number"
              value={calculationInputs.materials?.supplies?.nutrientsKgAnnual || ''}
              onChange={(e) => updateInputs({
                materials: {
                  ...calculationInputs.materials,
                  supplies: {
                    ...calculationInputs.materials?.supplies,
                    nutrientsKgAnnual: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 3250"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Growing Media (kg/year)
            </label>
            <input
              type="number"
              value={calculationInputs.materials?.supplies?.growingMediaKgAnnual || ''}
              onChange={(e) => updateInputs({
                materials: {
                  ...calculationInputs.materials,
                  supplies: {
                    ...calculationInputs.materials?.supplies,
                    growingMediaKgAnnual: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 1920"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Local Suppliers (%)
            </label>
            <input
              type="number"
              value={calculationInputs.materials?.supplies?.localSupplierPercent || ''}
              onChange={(e) => updateInputs({
                materials: {
                  ...calculationInputs.materials,
                  supplies: {
                    ...calculationInputs.materials?.supplies,
                    localSupplierPercent: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 60"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const ResourcesStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Water & Waste Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Annual Water Usage (m³)
          </label>
          <input
            type="number"
            value={calculationInputs.resources?.waterUsageM3Annual || ''}
            onChange={(e) => updateInputs({
              resources: {
                ...calculationInputs.resources,
                waterUsageM3Annual: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 2400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Water Recycling Rate (%)
          </label>
          <input
            type="number"
            value={calculationInputs.resources?.waterRecyclingPercent || ''}
            onChange={(e) => updateInputs({
              resources: {
                ...calculationInputs.resources,
                waterRecyclingPercent: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 95"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Organic Waste (kg/year)
          </label>
          <input
            type="number"
            value={calculationInputs.resources?.organicWasteKgAnnual || ''}
            onChange={(e) => updateInputs({
              resources: {
                ...calculationInputs.resources,
                organicWasteKgAnnual: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 12000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Composting Rate (%)
          </label>
          <input
            type="number"
            value={calculationInputs.resources?.compostingPercent || ''}
            onChange={(e) => updateInputs({
              resources: {
                ...calculationInputs.resources,
                compostingPercent: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 80"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Packaging Waste Recycling (%)
          </label>
          <input
            type="number"
            value={calculationInputs.resources?.packagingWasteRecyclingPercent || ''}
            onChange={(e) => updateInputs({
              resources: {
                ...calculationInputs.resources,
                packagingWasteRecyclingPercent: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., 85"
          />
        </div>
      </div>
    </div>
  );

  const WorkforceStep = () => (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-white mb-4">Workforce & Social Impact</h3>
      
      {/* Compensation */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-4">Compensation</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Average Annual Wage ($)
            </label>
            <input
              type="number"
              value={calculationInputs.workforce?.averageWageUSD || ''}
              onChange={(e) => updateInputs({
                workforce: {
                  ...calculationInputs.workforce,
                  averageWageUSD: parseInt(e.target.value) || 0
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 55000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Local Minimum Wage ($)
            </label>
            <input
              type="number"
              value={calculationInputs.workforce?.localMinimumWage || ''}
              onChange={(e) => updateInputs({
                workforce: {
                  ...calculationInputs.workforce,
                  localMinimumWage: parseInt(e.target.value) || 0
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 32000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Living Wage Threshold ($)
            </label>
            <input
              type="number"
              value={calculationInputs.workforce?.livingWageThreshold || ''}
              onChange={(e) => updateInputs({
                workforce: {
                  ...calculationInputs.workforce,
                  livingWageThreshold: parseInt(e.target.value) || 0
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 48000"
            />
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-4">Demographics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Women Employees (%)
            </label>
            <input
              type="number"
              value={calculationInputs.workforce?.demographics?.womenPercent || ''}
              onChange={(e) => updateInputs({
                workforce: {
                  ...calculationInputs.workforce,
                  demographics: {
                    ...calculationInputs.workforce?.demographics,
                    womenPercent: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 42"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minority Employees (%)
            </label>
            <input
              type="number"
              value={calculationInputs.workforce?.demographics?.minoritiesPercent || ''}
              onChange={(e) => updateInputs({
                workforce: {
                  ...calculationInputs.workforce,
                  demographics: {
                    ...calculationInputs.workforce?.demographics,
                    minoritiesPercent: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 38"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Local Hires (%)
            </label>
            <input
              type="number"
              value={calculationInputs.workforce?.demographics?.localHiresPercent || ''}
              onChange={(e) => updateInputs({
                workforce: {
                  ...calculationInputs.workforce,
                  demographics: {
                    ...calculationInputs.workforce?.demographics,
                    localHiresPercent: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 78"
            />
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-4">Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Health Insurance Coverage (%)
            </label>
            <input
              type="number"
              value={calculationInputs.workforce?.benefits?.healthInsurancePercent || ''}
              onChange={(e) => updateInputs({
                workforce: {
                  ...calculationInputs.workforce,
                  benefits: {
                    ...calculationInputs.workforce?.benefits,
                    healthInsurancePercent: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Retirement Plan Coverage (%)
            </label>
            <input
              type="number"
              value={calculationInputs.workforce?.benefits?.retirementPlanPercent || ''}
              onChange={(e) => updateInputs({
                workforce: {
                  ...calculationInputs.workforce,
                  benefits: {
                    ...calculationInputs.workforce?.benefits,
                    retirementPlanPercent: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 95"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Professional Development ($/employee)
            </label>
            <input
              type="number"
              value={calculationInputs.workforce?.benefits?.professionalDevelopmentUSDPerEmployee || ''}
              onChange={(e) => updateInputs({
                workforce: {
                  ...calculationInputs.workforce,
                  benefits: {
                    ...calculationInputs.workforce?.benefits,
                    professionalDevelopmentUSDPerEmployee: parseInt(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., 2500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return <FacilityStep />;
      case 1: return <EnergyStep />;
      case 2: return <TransportationStep />;
      case 3: return <MaterialsStep />;
      case 4: return <ResourcesStep />;
      case 5: return <WorkforceStep />;
      default: return <FacilityStep />;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-8 h-8 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">ESG Carbon Emissions Calculator</h2>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = step.completed;
          
          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs opacity-75">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-gray-700 mx-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex items-center gap-3">
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={calculateESG}
              disabled={!isComplete() || isCalculating}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Calculate ESG Metrics
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {calculatedResults && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Calculation Results</h3>
            <button
              onClick={exportResults}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <h4 className="text-lg font-medium text-gray-300 mb-2">Total Scope 1 Emissions</h4>
              <p className="text-2xl font-bold text-red-400">
                {(Object.values(calculatedResults.environmental.emissions.scope1).reduce((a, b) => a + b, 0) / 1000).toFixed(1)} tCO₂e
              </p>
            </div>

            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <h4 className="text-lg font-medium text-gray-300 mb-2">Total Scope 2 Emissions</h4>
              <p className="text-2xl font-bold text-yellow-400">
                {(Object.values(calculatedResults.environmental.emissions.scope2).reduce((a, b) => a + b, 0) / 1000).toFixed(1)} tCO₂e
              </p>
            </div>

            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <h4 className="text-lg font-medium text-gray-300 mb-2">Total Scope 3 Emissions</h4>
              <p className="text-2xl font-bold text-blue-400">
                {(Object.values(calculatedResults.environmental.emissions.scope3).reduce((a, b) => 
                  a + (typeof b === 'object' ? Object.values(b).reduce((c, d) => c + d, 0) : b), 0) / 1000).toFixed(1)} tCO₂e
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
            <p className="text-green-400 font-medium mb-2">Key Insights:</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Employee commuting represents {calculatedResults.environmental.emissions.scope3.employeeCommuting.toLocaleString()} kg CO₂e annually</li>
              <li>• Packaging materials contribute {(calculatedResults.environmental.emissions.scope3.packaging.cardboard + calculatedResults.environmental.emissions.scope3.packaging.plastic).toLocaleString()} kg CO₂e</li>
              <li>• Water recycling saves significant environmental impact compared to field farming</li>
              <li>• Local supplier sourcing reduces transportation emissions</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}