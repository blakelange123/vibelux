'use client';

import React, { useState } from 'react';
import {
  Droplets,
  Leaf,
  Building,
  Truck,
  Sun,
  Shield,
  TrendingUp,
  Award,
  BarChart3,
  Users,
  Car,
  Package,
  Recycle,
  Zap,
  Factory,
  TreePine,
  Heart,
  Scale,
  Eye,
  Lock,
  GraduationCap,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Target,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { ComprehensiveESGMetrics, CEAESGBenchmarks } from '@/lib/esg/comprehensive-esg-framework';

export function ComprehensiveESGDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<'environmental' | 'social' | 'governance'>('environmental');
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('year');

  // Mock comprehensive ESG data
  const esgMetrics: ComprehensiveESGMetrics = {
    environmental: {
      emissions: {
        scope1: {
          naturalGas: 2100,
          propane: 450,
          refrigerants: 680,
          vehicleFleet: 1200
        },
        scope2: {
          electricity: 58400,
          electricityRenewable: 20440
        },
        scope3: {
          employeeCommuting: 8500,
          businessTravel: 2100,
          packaging: {
            cardboard: 3200,
            plastic: 1800,
            labels: 450
          },
          transportation: {
            inboundSupplies: 1200,
            outboundDistribution: 4500
          },
          supplierEmissions: 12000,
          wasteDisposal: 890,
          waterTreatment: 340
        }
      },
      resources: {
        water: {
          municipalWaterM3: 2400,
          rainwaterHarvestedM3: 180,
          recycledWaterM3: 2280,
          waterIntensity: 2.5
        },
        energy: {
          totalKWh: 180000,
          renewableKWh: 63000,
          gasKWh: 8500,
          energyIntensity: 45
        },
        materials: {
          seeds: {
            organicPercent: 85,
            locallySourcedPercent: 60,
            sustainablyCertifiedPercent: 95
          },
          nutrients: {
            syntheticKg: 2400,
            organicKg: 850,
            recycledNutrientPercent: 35
          },
          growingMedia: {
            peatMossKg: 120,
            cocoCoirKg: 1800,
            recycledMediaPercent: 75
          },
          packaging: {
            cardboardKg: 8500,
            plasticKg: 2400,
            recycledContentPercent: 65,
            compostablePercent: 30
          }
        }
      },
      waste: {
        organic: {
          plantWasteKg: 12000,
          compostedKg: 9600,
          anaerobicDigestionKg: 2400,
          diversionRate: 100
        },
        packaging: {
          cardboardKg: 6800,
          plasticKg: 1200,
          recyclingRate: 85
        },
        hazardous: {
          cleaningChemicalsKg: 45,
          fluorescentsKg: 85,
          batteriesKg: 25,
          properDisposalRate: 100
        },
        general: {
          landfillKg: 1200,
          wasteIntensity: 0.03
        }
      },
      pollution: {
        waterDischarge: {
          volumeM3: 120,
          nitrogenMgL: 8.5,
          phosphorusMgL: 1.2,
          complianceRate: 100
        },
        airEmissions: {
          particulateMatter: 12,
          volatileOrganicCompounds: 8,
          ammonia: 15
        },
        soilContamination: {
          chemicalSpills: 0,
          cleanupCosts: 0
        }
      },
      biodiversity: {
        landFootprintM2: 4000,
        nativeHabitatPreservedM2: 1200,
        pollinatorFriendlyPractices: true,
        beneficialInsectPrograms: true,
        localEcosystemImpact: 'positive'
      }
    },
    social: {
      workforce: {
        totalEmployees: 45,
        demographics: {
          womenPercent: 42,
          minoritiesPercent: 38,
          localHiresPercent: 78,
          veteransPercent: 12
        },
        compensation: {
          livingWageCompliance: true,
          payEquityAuditCompleted: true,
          averageWageUSD: 55000,
          wageGapPercent: 3.2
        },
        benefits: {
          healthInsurancePercent: 100,
          retirementPlanPercent: 95,
          paidTimeOffDays: 25,
          professionalDevelopmentUSD: 2500
        },
        turnover: {
          voluntaryTurnoverRate: 12,
          averageTenureMonths: 28,
          employeeSatisfactionScore: 8.6
        }
      },
      healthSafety: {
        workplaceInjuries: {
          recordableIncidentRate: 0.8,
          lostTimeIncidentRate: 0.2,
          daysAwayRestrictedTransfer: 5,
          fatalitiesCount: 0
        },
        ergonomics: {
          ergonomicWorkstationsPercent: 95,
          repetitiveStrainReports: 2,
          erconomicTrainingHours: 40
        },
        mentalHealth: {
          stressManagementPrograms: true,
          mentalHealthDays: 5,
          wellnessInitiatives: 8
        },
        commuting: {
          averageCommuteKm: 18,
          publicTransitUsersPercent: 25,
          carpoolProgramParticipation: 35,
          electricVehicleIncentives: true,
          commuteEmissionsKgCO2e: 8500
        }
      },
      community: {
        localEconomic: {
          localSupplierSpendPercent: 65,
          localTaxesPaidUSD: 185000,
          economicImpactMultiplier: 2.8
        },
        foodAccess: {
          affordableProducePrograms: true,
          foodBankDonationsKg: 2400,
          snapEbtAccepted: true,
          communityGardenSupport: true
        },
        education: {
          farmTourParticipants: 850,
          schoolProgramsSupported: 12,
          internshipPositions: 8,
          agTechTrainingPrograms: 3
        },
        research: {
          universityPartnerships: 4,
          researchCollaborations: 7,
          publicationsContributed: 12,
          openSourceContributions: 15
        }
      },
      supplyChain: {
        suppliers: {
          totalSuppliers: 85,
          localSuppliersPercent: 55,
          certifiedSuppliersPercent: 72,
          minorityOwnedSuppliersPercent: 28
        },
        auditing: {
          supplierAuditsCompleted: 68,
          humanRightsViolations: 0,
          childLaborIncidents: 0,
          livingWageCompliance: 85
        },
        sustainability: {
          supplierESGScoring: true,
          sustainabilityRequirements: true,
          carbonNeutralSuppliers: 12
        }
      }
    },
    governance: {
      leadership: {
        boardComposition: {
          independentDirectorsPercent: 67,
          womenDirectorsPercent: 44,
          minorityDirectorsPercent: 33,
          avgTenureYears: 3.2
        },
        executiveComp: {
          ceoPayRatio: 18,
          esgLinkedCompensation: true,
          sayOnPaySupport: 92
        },
        diversity: {
          leadershipDiversityPercent: 40,
          diversityTargetsSet: true,
          inclusionTrainingHours: 32
        }
      },
      ethics: {
        compliance: {
          codeOfConductUpdated: new Date('2024-01-15'),
          ethicsTrainingCompletionRate: 98,
          ethicsViolationsReported: 2,
          corruptionIncidents: 0
        },
        transparency: {
          esgReportingFrequency: 'quarterly',
          thirdPartyESGVerification: true,
          stakeholderEngagementEvents: 24,
          publicCommitments: ['Carbon Neutral by 2030', 'Zero Waste to Landfill', '100% Renewable Energy']
        },
        riskManagement: {
          climateRiskAssessmentCompleted: true,
          cyberSecurityIncidents: 1,
          businessContinuityPlanning: true,
          insuranceCoverage: 'comprehensive'
        }
      },
      data: {
        privacy: {
          dataBreaches: 0,
          gdprCompliance: true,
          ccpaCompliance: true,
          dataMinimizationPractices: true
        },
        innovation: {
          rdSpendPercent: 8.5,
          patentsHeld: 15,
          digitalTransformationScore: 85,
          openSourceContributions: 28
        },
        transparency: {
          realTimeDataSharing: true,
          supplierPortalAccess: true,
          customerDataAccess: true,
          traceabilityCompleteness: 98
        }
      }
    }
  };

  const getPerformanceIndicator = (value: number, benchmark: { excellent: number; good: number; average: number }, reverse = false) => {
    const { excellent, good, average } = benchmark;
    
    if (!reverse) {
      if (value >= excellent) return { icon: ArrowUp, color: 'text-green-400', text: 'Excellent' };
      if (value >= good) return { icon: Minus, color: 'text-yellow-400', text: 'Good' };
      if (value >= average) return { icon: ArrowDown, color: 'text-orange-400', text: 'Average' };
      return { icon: ArrowDown, color: 'text-red-400', text: 'Below Average' };
    } else {
      if (value <= excellent) return { icon: ArrowUp, color: 'text-green-400', text: 'Excellent' };
      if (value <= good) return { icon: Minus, color: 'text-yellow-400', text: 'Good' };
      if (value <= average) return { icon: ArrowDown, color: 'text-orange-400', text: 'Average' };
      return { icon: ArrowDown, color: 'text-red-400', text: 'Below Average' };
    }
  };

  const EnvironmentalTab = () => (
    <div className="space-y-6">
      {/* Emissions Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Factory className="w-5 h-5 text-red-400" />
            Scope 1 Emissions
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Natural Gas</span>
              <span className="text-white">{esgMetrics.environmental.emissions.scope1.naturalGas.toLocaleString()} kg CO₂e</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Vehicle Fleet</span>
              <span className="text-white">{esgMetrics.environmental.emissions.scope1.vehicleFleet.toLocaleString()} kg CO₂e</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Refrigerants</span>
              <span className="text-white">{esgMetrics.environmental.emissions.scope1.refrigerants.toLocaleString()} kg CO₂e</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Scope 2 Emissions
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Grid Electricity</span>
              <span className="text-white">{esgMetrics.environmental.emissions.scope2.electricity.toLocaleString()} kg CO₂e</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Renewable Energy</span>
              <span className="text-green-400">{esgMetrics.environmental.emissions.scope2.electricityRenewable.toLocaleString()} kg CO₂e</span>
            </div>
            <div className="text-xs text-yellow-400">
              {Math.round((esgMetrics.environmental.resources.energy.renewableKWh / esgMetrics.environmental.resources.energy.totalKWh) * 100)}% renewable
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            Scope 3 Emissions
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Employee Commuting</span>
              <span className="text-white">{esgMetrics.environmental.emissions.scope3.employeeCommuting.toLocaleString()} kg CO₂e</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Supply Chain</span>
              <span className="text-white">{esgMetrics.environmental.emissions.scope3.supplierEmissions.toLocaleString()} kg CO₂e</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Outbound Distribution</span>
              <span className="text-white">{esgMetrics.environmental.emissions.scope3.transportation.outboundDistribution.toLocaleString()} kg CO₂e</span>
            </div>
          </div>
        </div>
      </div>

      {/* Packaging Impact */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-brown-400" />
          Packaging Environmental Impact
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-300 mb-3">Material Usage</h5>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cardboard</span>
                <span className="text-white">{esgMetrics.environmental.resources.materials.packaging.cardboardKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Plastic</span>
                <span className="text-white">{esgMetrics.environmental.resources.materials.packaging.plasticKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Recycled Content</span>
                <span className="text-green-400">{esgMetrics.environmental.resources.materials.packaging.recycledContentPercent}%</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-300 mb-3">Carbon Footprint</h5>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cardboard Emissions</span>
                <span className="text-white">{esgMetrics.environmental.emissions.scope3.packaging.cardboard.toLocaleString()} kg CO₂e</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Plastic Emissions</span>
                <span className="text-white">{esgMetrics.environmental.emissions.scope3.packaging.plastic.toLocaleString()} kg CO₂e</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Packaging</span>
                <span className="text-white">{(esgMetrics.environmental.emissions.scope3.packaging.cardboard + esgMetrics.environmental.emissions.scope3.packaging.plastic + esgMetrics.environmental.emissions.scope3.packaging.labels).toLocaleString()} kg CO₂e</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Water & Waste Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            Water Management
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Water Recycling Rate</span>
                <span className="text-white">95%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '95%' }} />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Municipal Water</span>
              <span className="text-white">{esgMetrics.environmental.resources.water.municipalWaterM3.toLocaleString()} m³</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Rainwater Harvested</span>
              <span className="text-green-400">{esgMetrics.environmental.resources.water.rainwaterHarvestedM3.toLocaleString()} m³</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Recycle className="w-5 h-5 text-green-400" />
            Waste Management
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Waste Diversion Rate</span>
                <span className="text-white">{esgMetrics.environmental.waste.organic.diversionRate}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: `${esgMetrics.environmental.waste.organic.diversionRate}%` }} />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Composted</span>
              <span className="text-green-400">{esgMetrics.environmental.waste.organic.compostedKg.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Packaging Recycled</span>
              <span className="text-blue-400">{esgMetrics.environmental.waste.packaging.recyclingRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SocialTab = () => (
    <div className="space-y-6">
      {/* Employee Commuting & Transportation */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Car className="w-5 h-5 text-blue-400" />
          Employee Transportation Impact
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h5 className="font-medium text-gray-300 mb-3">Commuting Patterns</h5>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Average Commute</span>
                <span className="text-white">{esgMetrics.social.healthSafety.commuting.averageCommuteKm} km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Public Transit Users</span>
                <span className="text-green-400">{esgMetrics.social.healthSafety.commuting.publicTransitUsersPercent}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Carpool Participants</span>
                <span className="text-blue-400">{esgMetrics.social.healthSafety.commuting.carpoolProgramParticipation}%</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-300 mb-3">Emissions Impact</h5>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {esgMetrics.social.healthSafety.commuting.commuteEmissionsKgCO2e.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">kg CO₂e annually</div>
              <div className="text-xs text-blue-400 mt-1">From employee commuting</div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-300 mb-3">Sustainability Programs</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">EV Incentives</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Bike-to-Work Program</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Remote Work Options</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workforce Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Workforce Diversity
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Women</span>
                <span className="text-white">{esgMetrics.social.workforce.demographics.womenPercent}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${esgMetrics.social.workforce.demographics.womenPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Minorities</span>
                <span className="text-white">{esgMetrics.social.workforce.demographics.minoritiesPercent}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${esgMetrics.social.workforce.demographics.minoritiesPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Local Hires</span>
                <span className="text-white">{esgMetrics.social.workforce.demographics.localHiresPercent}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: `${esgMetrics.social.workforce.demographics.localHiresPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Health & Safety
          </h4>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {esgMetrics.social.healthSafety.workplaceInjuries.recordableIncidentRate}
              </div>
              <div className="text-sm text-gray-400">Recordable incident rate</div>
              <div className="text-xs text-green-400 mt-1">per 200k hours worked</div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Days without injury</span>
              <span className="text-green-400">365+</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Ergonomic workstations</span>
              <span className="text-white">{esgMetrics.social.healthSafety.ergonomics.ergonomicWorkstationsPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Community Impact */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-orange-400" />
          Community & Economic Impact
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">
              ${esgMetrics.social.community.localEconomic.localTaxesPaidUSD.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Local taxes paid</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {esgMetrics.social.community.localEconomic.localSupplierSpendPercent}%
            </div>
            <div className="text-sm text-gray-400">Local supplier spend</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {esgMetrics.social.community.foodAccess.foodBankDonationsKg.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">kg donated to food banks</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {esgMetrics.social.community.education.farmTourParticipants}
            </div>
            <div className="text-sm text-gray-400">Farm tour participants</div>
          </div>
        </div>
      </div>
    </div>
  );

  const GovernanceTab = () => (
    <div className="space-y-6">
      {/* Leadership & Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            Board Composition
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Independent Directors</span>
                <span className="text-white">{esgMetrics.governance.leadership.boardComposition.independentDirectorsPercent}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${esgMetrics.governance.leadership.boardComposition.independentDirectorsPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Women Directors</span>
                <span className="text-white">{esgMetrics.governance.leadership.boardComposition.womenDirectorsPercent}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${esgMetrics.governance.leadership.boardComposition.womenDirectorsPercent}%` }} />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Average Tenure</span>
              <span className="text-white">{esgMetrics.governance.leadership.boardComposition.avgTenureYears} years</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-400" />
            Transparency & Ethics
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Ethics Training Completion</span>
              <span className="text-white">{esgMetrics.governance.ethics.compliance.ethicsTrainingCompletionRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">ESG Reporting</span>
              <span className="text-green-400">{esgMetrics.governance.ethics.transparency.esgReportingFrequency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Third-party Verification</span>
              <span className="text-green-400">{esgMetrics.governance.ethics.transparency.thirdPartyESGVerification ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Data Breaches</span>
              <span className="text-green-400">{esgMetrics.governance.data.privacy.dataBreaches}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Management */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Risk Management & Innovation
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h5 className="font-medium text-gray-300 mb-3">Cybersecurity</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Security Incidents</span>
                <span className="text-white">{esgMetrics.governance.ethics.riskManagement.cyberSecurityIncidents}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Business Continuity Plan</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-300 mb-3">Innovation Investment</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">R&D Spend</span>
                <span className="text-white">{esgMetrics.governance.data.innovation.rdSpendPercent}% of revenue</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Patents Held</span>
                <span className="text-white">{esgMetrics.governance.data.innovation.patentsHeld}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Open Source Contributions</span>
                <span className="text-green-400">{esgMetrics.governance.data.innovation.openSourceContributions}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-300 mb-3">Traceability</h5>
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {esgMetrics.governance.data.transparency.traceabilityCompleteness}%
                </div>
                <div className="text-sm text-gray-400">Products traceable</div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Real-time Data Sharing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Public Commitments */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          Public ESG Commitments
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {esgMetrics.governance.ethics.transparency.publicCommitments.map((commitment, index) => (
            <div key={index} className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium text-white">{commitment}</span>
              </div>
              <div className="text-xs text-gray-400">
                {index === 0 && 'Target: 2030'}
                {index === 1 && 'Target: 2026'}
                {index === 2 && 'Target: 2028'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Leaf className="w-8 h-8 text-green-400" />
          Comprehensive ESG Dashboard
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="year">Annual</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
        {(['environmental', 'social', 'governance'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedCategory === 'environmental' && <EnvironmentalTab />}
      {selectedCategory === 'social' && <SocialTab />}
      {selectedCategory === 'governance' && <GovernanceTab />}

      {/* Overall Score Summary */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Overall ESG Score</h3>
          <div className="text-5xl font-bold mb-4">A-</div>
          <p className="text-blue-100 mb-4">
            Strong performance across all ESG categories with particular excellence in environmental impact and social responsibility.
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-2xl font-bold">92</div>
              <div className="text-blue-100">Environmental</div>
            </div>
            <div>
              <div className="text-2xl font-bold">88</div>
              <div className="text-blue-100">Social</div>
            </div>
            <div>
              <div className="text-2xl font-bold">85</div>
              <div className="text-blue-100">Governance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}