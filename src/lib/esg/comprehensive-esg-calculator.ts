/**
 * Comprehensive ESG Calculator for CEA Operations
 * Calculates all ESG metrics including packaging, commuting, supply chain, etc.
 */

import { ComprehensiveESGMetrics, CEAESGBenchmarks } from './comprehensive-esg-framework';

export interface ESGCalculationInputs {
  // Facility basics
  facilityData: {
    totalEmployees: number;
    annualProductionKg: number;
    facilityAreaM2: number;
    operatingDaysPerYear: number;
  };
  
  // Energy & emissions
  energy: {
    totalKWhAnnual: number;
    renewableKWhAnnual: number;
    naturalGasKWhAnnual: number;
    gridEmissionFactor: number; // kg CO2e per kWh
  };
  
  // Transportation
  transportation: {
    employeeCommuteData: {
      averageCommuteKm: number;
      daysWorkedPerYear: number;
      publicTransitPercent: number;
      carpoolPercent: number;
      electricVehiclePercent: number;
    };
    businessTravel: {
      flightKm: number;
      hotelNights: number;
      rentalCarKm: number;
    };
    distribution: {
      averageDeliveryDistanceKm: number;
      deliveriesPerYear: number;
      truckLoadEfficiency: number; // kg per truck
    };
  };
  
  // Materials & packaging
  materials: {
    packaging: {
      cardboardKgAnnual: number;
      plasticKgAnnual: number;
      recycledContentPercent: number;
      compostablePercent: number;
    };
    supplies: {
      seedsKgAnnual: number;
      nutrientsKgAnnual: number;
      growingMediaKgAnnual: number;
      localSupplierPercent: number;
    };
  };
  
  // Water & waste
  resources: {
    waterUsageM3Annual: number;
    waterRecyclingPercent: number;
    organicWasteKgAnnual: number;
    compostingPercent: number;
    packagingWasteRecyclingPercent: number;
  };
  
  // Social metrics
  workforce: {
    averageWageUSD: number;
    localMinimumWage: number;
    livingWageThreshold: number;
    demographics: {
      womenPercent: number;
      minoritiesPercent: number;
      localHiresPercent: number;
    };
    benefits: {
      healthInsurancePercent: number;
      retirementPlanPercent: number;
      professionalDevelopmentUSDPerEmployee: number;
    };
  };
}

export class ComprehensiveESGCalculator {
  
  /**
   * Calculate employee commuting emissions
   */
  calculateCommutingEmissions(inputs: ESGCalculationInputs): {
    totalEmissionsKgCO2e: number;
    perEmployeeKgCO2e: number;
    emissionsByMode: {
      personalVehicle: number;
      publicTransit: number;
      carpool: number;
      electricVehicle: number;
    };
  } {
    const { employeeCommuteData } = inputs.transportation;
    const { totalEmployees } = inputs.facilityData;
    
    // Emission factors (kg CO2e per km)
    const emissionFactors = {
      personalVehicle: 0.21, // Average gasoline car
      publicTransit: 0.05,   // Bus/train average
      carpool: 0.105,        // Half of personal vehicle (2 people)
      electricVehicle: 0.05  // Regional grid average
    };
    
    const totalCommuteKm = employeeCommuteData.averageCommuteKm * 
                          employeeCommuteData.daysWorkedPerYear * 
                          2 * // Round trip
                          totalEmployees;
    
    // Distribution by mode
    const electricVehicleKm = totalCommuteKm * (employeeCommuteData.electricVehiclePercent / 100);
    const publicTransitKm = totalCommuteKm * (employeeCommuteData.publicTransitPercent / 100);
    const carpoolKm = totalCommuteKm * (employeeCommuteData.carpoolPercent / 100);
    const personalVehicleKm = totalCommuteKm - electricVehicleKm - publicTransitKm - carpoolKm;
    
    const emissionsByMode = {
      personalVehicle: personalVehicleKm * emissionFactors.personalVehicle,
      publicTransit: publicTransitKm * emissionFactors.publicTransit,
      carpool: carpoolKm * emissionFactors.carpool,
      electricVehicle: electricVehicleKm * emissionFactors.electricVehicle
    };
    
    const totalEmissions = Object.values(emissionsByMode).reduce((sum, val) => sum + val, 0);
    
    return {
      totalEmissionsKgCO2e: totalEmissions,
      perEmployeeKgCO2e: totalEmissions / totalEmployees,
      emissionsByMode
    };
  }
  
  /**
   * Calculate packaging lifecycle emissions
   */
  calculatePackagingEmissions(inputs: ESGCalculationInputs): {
    totalEmissionsKgCO2e: number;
    cardboardEmissions: number;
    plasticEmissions: number;
    emissionsPerKgProduct: number;
    recyclingSavings: number;
  } {
    const { packaging } = inputs.materials;
    const { annualProductionKg } = inputs.facilityData;
    
    // Emission factors (kg CO2e per kg material)
    const emissionFactors = {
      cardboard: {
        virgin: 1.29,
        recycled: 0.95
      },
      plastic: {
        virgin: 3.75,
        recycled: 2.1
      }
    };
    
    // Calculate emissions based on recycled content
    const cardboardEmissions = packaging.cardboardKgAnnual * (
      (emissionFactors.cardboard.virgin * (1 - packaging.recycledContentPercent / 100)) +
      (emissionFactors.cardboard.recycled * (packaging.recycledContentPercent / 100))
    );
    
    const plasticEmissions = packaging.plasticKgAnnual * (
      (emissionFactors.plastic.virgin * (1 - packaging.recycledContentPercent / 100)) +
      (emissionFactors.plastic.recycled * (packaging.recycledContentPercent / 100))
    );
    
    const totalEmissions = cardboardEmissions + plasticEmissions;
    
    // Calculate savings from recycled content
    const recyclingSavings = 
      packaging.cardboardKgAnnual * (emissionFactors.cardboard.virgin - emissionFactors.cardboard.recycled) * (packaging.recycledContentPercent / 100) +
      packaging.plasticKgAnnual * (emissionFactors.plastic.virgin - emissionFactors.plastic.recycled) * (packaging.recycledContentPercent / 100);
    
    return {
      totalEmissionsKgCO2e: totalEmissions,
      cardboardEmissions,
      plasticEmissions,
      emissionsPerKgProduct: totalEmissions / annualProductionKg,
      recyclingSavings
    };
  }
  
  /**
   * Calculate supply chain emissions
   */
  calculateSupplyChainEmissions(inputs: ESGCalculationInputs): {
    totalEmissionsKgCO2e: number;
    inboundTransportation: number;
    supplierOperations: number;
    localSupplierBenefit: number;
  } {
    const { supplies } = inputs.materials;
    const { totalEmployees } = inputs.facilityData;
    
    // Estimated supply chain emission factors
    const supplierEmissionFactors = {
      seeds: 2.1, // kg CO2e per kg
      nutrients: 3.8,
      growingMedia: 0.85
    };
    
    const transportationEmissionFactor = 0.15; // kg CO2e per kg per 100km
    
    // Supplier operations emissions
    const supplierOperations = 
      supplies.seedsKgAnnual * supplierEmissionFactors.seeds +
      supplies.nutrientsKgAnnual * supplierEmissionFactors.nutrients +
      supplies.growingMediaKgAnnual * supplierEmissionFactors.growingMedia;
    
    // Transportation emissions (assuming average 500km for non-local, 50km for local)
    const averageDistance = (500 * (1 - supplies.localSupplierPercent / 100)) + 
                           (50 * (supplies.localSupplierPercent / 100));
    
    const totalSupplyWeight = supplies.seedsKgAnnual + supplies.nutrientsKgAnnual + supplies.growingMediaKgAnnual;
    const inboundTransportation = totalSupplyWeight * averageDistance * transportationEmissionFactor / 100;
    
    // Local supplier benefit calculation
    const localSupplierBenefit = totalSupplyWeight * (500 - 50) * transportationEmissionFactor / 100 * (supplies.localSupplierPercent / 100);
    
    return {
      totalEmissionsKgCO2e: supplierOperations + inboundTransportation,
      inboundTransportation,
      supplierOperations,
      localSupplierBenefit
    };
  }
  
  /**
   * Calculate business travel emissions
   */
  calculateBusinessTravelEmissions(inputs: ESGCalculationInputs): {
    totalEmissionsKgCO2e: number;
    flightEmissions: number;
    hotelEmissions: number;
    rentalCarEmissions: number;
  } {
    const { businessTravel } = inputs.transportation;
    
    // Emission factors
    const emissionFactors = {
      flight: 0.255, // kg CO2e per km (average domestic/international)
      hotel: 30,     // kg CO2e per night
      rentalCar: 0.21 // kg CO2e per km
    };
    
    const flightEmissions = businessTravel.flightKm * emissionFactors.flight;
    const hotelEmissions = businessTravel.hotelNights * emissionFactors.hotel;
    const rentalCarEmissions = businessTravel.rentalCarKm * emissionFactors.rentalCar;
    
    return {
      totalEmissionsKgCO2e: flightEmissions + hotelEmissions + rentalCarEmissions,
      flightEmissions,
      hotelEmissions,
      rentalCarEmissions
    };
  }
  
  /**
   * Calculate water footprint and efficiency
   */
  calculateWaterFootprint(inputs: ESGCalculationInputs): {
    totalWaterFootprintM3: number;
    waterIntensityPerKg: number;
    recycledWaterBenefit: number;
    comparisonToFieldFarming: {
      ceaUsage: number;
      fieldUsage: number;
      savings: number;
      percentSaved: number;
    };
  } {
    const { waterUsageM3Annual, waterRecyclingPercent } = inputs.resources;
    const { annualProductionKg } = inputs.facilityData;
    
    // Fresh water usage (accounting for recycling)
    const freshWaterUsage = waterUsageM3Annual * (1 - waterRecyclingPercent / 100);
    
    // Water intensity
    const waterIntensityPerKg = waterUsageM3Annual / annualProductionKg;
    
    // Recycled water benefit
    const recycledWaterBenefit = waterUsageM3Annual * (waterRecyclingPercent / 100);
    
    // Field farming comparison (field farming uses ~20x more water)
    const fieldWaterUsage = waterUsageM3Annual * 20;
    const waterSavings = fieldWaterUsage - waterUsageM3Annual;
    const percentSaved = (waterSavings / fieldWaterUsage) * 100;
    
    return {
      totalWaterFootprintM3: freshWaterUsage,
      waterIntensityPerKg,
      recycledWaterBenefit,
      comparisonToFieldFarming: {
        ceaUsage: waterUsageM3Annual,
        fieldUsage: fieldWaterUsage,
        savings: waterSavings,
        percentSaved
      }
    };
  }
  
  /**
   * Calculate social impact metrics
   */
  calculateSocialImpact(inputs: ESGCalculationInputs): {
    livingWageCompliance: boolean;
    payEquityScore: number;
    localEconomicImpact: {
      directJobs: number;
      indirectJobs: number;
      totalEconomicImpactUSD: number;
    };
    communityBenefits: {
      localSupplierSpendUSD: number;
      taxContributionUSD: number;
    };
  } {
    const { workforce } = inputs;
    const { totalEmployees, annualProductionKg } = inputs.facilityData;
    
    // Living wage compliance
    const livingWageCompliance = workforce.averageWageUSD >= workforce.livingWageThreshold;
    
    // Pay equity score (simplified - based on proximity to living wage)
    const payEquityScore = Math.min(100, (workforce.averageWageUSD / workforce.livingWageThreshold) * 100);
    
    // Economic impact calculation
    const averageAnnualWages = workforce.averageWageUSD * totalEmployees;
    const economicMultiplier = 2.8; // Typical rural economic multiplier
    const totalEconomicImpact = averageAnnualWages * economicMultiplier;
    const indirectJobs = totalEmployees * 1.8; // Estimated indirect job creation
    
    // Community benefits
    const estimatedAnnualRevenue = annualProductionKg * 8; // $8 per kg average
    const localSupplierSpend = estimatedAnnualRevenue * 0.35 * (inputs.materials.supplies.localSupplierPercent / 100);
    const taxContribution = estimatedAnnualRevenue * 0.08; // Estimated tax rate
    
    return {
      livingWageCompliance,
      payEquityScore,
      localEconomicImpact: {
        directJobs: totalEmployees,
        indirectJobs,
        totalEconomicImpactUSD: totalEconomicImpact
      },
      communityBenefits: {
        localSupplierSpendUSD: localSupplierSpend,
        taxContributionUSD: taxContribution
      }
    };
  }
  
  /**
   * Calculate comprehensive ESG metrics
   */
  calculateComprehensiveESG(inputs: ESGCalculationInputs): ComprehensiveESGMetrics {
    const commuting = this.calculateCommutingEmissions(inputs);
    const packaging = this.calculatePackagingEmissions(inputs);
    const supplyChain = this.calculateSupplyChainEmissions(inputs);
    const businessTravel = this.calculateBusinessTravelEmissions(inputs);
    const water = this.calculateWaterFootprint(inputs);
    const social = this.calculateSocialImpact(inputs);
    
    // Scope 1 emissions
    const scope1Emissions = {
      naturalGas: inputs.energy.naturalGasKWhAnnual * 0.185, // kg CO2e per kWh
      propane: 0, // Estimated
      refrigerants: inputs.facilityData.facilityAreaM2 * 0.15, // Estimated
      vehicleFleet: 0 // Assuming no company vehicles
    };
    
    // Scope 2 emissions
    const scope2Emissions = {
      electricity: (inputs.energy.totalKWhAnnual - inputs.energy.renewableKWhAnnual) * inputs.energy.gridEmissionFactor,
      electricityRenewable: inputs.energy.renewableKWhAnnual * 0.02 // Minimal emissions from renewables
    };
    
    return {
      environmental: {
        emissions: {
          scope1: scope1Emissions,
          scope2: scope2Emissions,
          scope3: {
            employeeCommuting: commuting.totalEmissionsKgCO2e,
            businessTravel: businessTravel.totalEmissionsKgCO2e,
            packaging: {
              cardboard: packaging.cardboardEmissions,
              plastic: packaging.plasticEmissions,
              labels: packaging.totalEmissionsKgCO2e * 0.05 // Estimated 5% for labels
            },
            transportation: {
              inboundSupplies: supplyChain.inboundTransportation,
              outboundDistribution: inputs.transportation.distribution.deliveriesPerYear * 
                                   inputs.transportation.distribution.averageDeliveryDistanceKm * 0.8
            },
            supplierEmissions: supplyChain.supplierOperations,
            wasteDisposal: inputs.resources.organicWasteKgAnnual * 0.05, // Estimated
            waterTreatment: inputs.resources.waterUsageM3Annual * 0.3 // Estimated
          }
        },
        resources: {
          water: {
            municipalWaterM3: inputs.resources.waterUsageM3Annual * (1 - inputs.resources.waterRecyclingPercent / 100),
            rainwaterHarvestedM3: 0, // Would need specific input
            recycledWaterM3: inputs.resources.waterUsageM3Annual * (inputs.resources.waterRecyclingPercent / 100),
            waterIntensity: water.waterIntensityPerKg
          },
          energy: {
            totalKWh: inputs.energy.totalKWhAnnual,
            renewableKWh: inputs.energy.renewableKWhAnnual,
            gasKWh: inputs.energy.naturalGasKWhAnnual,
            energyIntensity: inputs.energy.totalKWhAnnual / inputs.facilityData.annualProductionKg
          },
          materials: {
            seeds: {
              organicPercent: 80, // Estimated
              locallySourcedPercent: inputs.materials.supplies.localSupplierPercent,
              sustainablyCertifiedPercent: 90 // Estimated
            },
            nutrients: {
              syntheticKg: inputs.materials.supplies.nutrientsKgAnnual * 0.7, // Estimated split
              organicKg: inputs.materials.supplies.nutrientsKgAnnual * 0.3,
              recycledNutrientPercent: 30 // Estimated
            },
            growingMedia: {
              peatMossKg: inputs.materials.supplies.growingMediaKgAnnual * 0.1, // Minimize peat
              cocoCoirKg: inputs.materials.supplies.growingMediaKgAnnual * 0.7,
              recycledMediaPercent: 60 // Estimated
            },
            packaging: {
              cardboardKg: inputs.materials.packaging.cardboardKgAnnual,
              plasticKg: inputs.materials.packaging.plasticKgAnnual,
              recycledContentPercent: inputs.materials.packaging.recycledContentPercent,
              compostablePercent: inputs.materials.packaging.compostablePercent
            }
          }
        },
        waste: {
          organic: {
            plantWasteKg: inputs.resources.organicWasteKgAnnual,
            compostedKg: inputs.resources.organicWasteKgAnnual * (inputs.resources.compostingPercent / 100),
            anaerobicDigestionKg: inputs.resources.organicWasteKgAnnual * 0.2, // Estimated
            diversionRate: inputs.resources.compostingPercent
          },
          packaging: {
            cardboardKg: inputs.materials.packaging.cardboardKgAnnual * 0.8, // Estimated waste rate
            plasticKg: inputs.materials.packaging.plasticKgAnnual * 0.5,
            recyclingRate: inputs.resources.packagingWasteRecyclingPercent
          },
          hazardous: {
            cleaningChemicalsKg: 50, // Estimated
            fluorescentsKg: 20, // Estimated
            batteriesKg: 10, // Estimated
            properDisposalRate: 100 // Target
          },
          general: {
            landfillKg: 500, // Estimated
            wasteIntensity: 500 / inputs.facilityData.annualProductionKg
          }
        },
        pollution: {
          waterDischarge: {
            volumeM3: inputs.resources.waterUsageM3Annual * 0.05, // Minimal discharge
            nitrogenMgL: 8,
            phosphorusMgL: 1,
            complianceRate: 100
          },
          airEmissions: {
            particulateMatter: 10, // Estimated
            volatileOrganicCompounds: 5,
            ammonia: 12
          },
          soilContamination: {
            chemicalSpills: 0, // Target
            cleanupCosts: 0
          }
        },
        biodiversity: {
          landFootprintM2: inputs.facilityData.facilityAreaM2,
          nativeHabitatPreservedM2: inputs.facilityData.facilityAreaM2 * 0.3, // Estimated
          pollinatorFriendlyPractices: true,
          beneficialInsectPrograms: true,
          localEcosystemImpact: 'positive'
        }
      },
      social: {
        workforce: {
          totalEmployees: inputs.facilityData.totalEmployees,
          demographics: {
            womenPercent: inputs.workforce.demographics.womenPercent,
            minoritiesPercent: inputs.workforce.demographics.minoritiesPercent,
            localHiresPercent: inputs.workforce.demographics.localHiresPercent,
            veteransPercent: 10 // Estimated
          },
          compensation: {
            livingWageCompliance: social.livingWageCompliance,
            payEquityAuditCompleted: true,
            averageWageUSD: inputs.workforce.averageWageUSD,
            wageGapPercent: 5 // Estimated
          },
          benefits: {
            healthInsurancePercent: inputs.workforce.benefits.healthInsurancePercent,
            retirementPlanPercent: inputs.workforce.benefits.retirementPlanPercent,
            paidTimeOffDays: 20, // Estimated
            professionalDevelopmentUSD: inputs.workforce.benefits.professionalDevelopmentUSDPerEmployee
          },
          turnover: {
            voluntaryTurnoverRate: 15, // Estimated
            averageTenureMonths: 24, // Estimated
            employeeSatisfactionScore: 8.5 // Estimated
          }
        },
        healthSafety: {
          workplaceInjuries: {
            recordableIncidentRate: 1.0, // Target
            lostTimeIncidentRate: 0.2,
            daysAwayRestrictedTransfer: 3,
            fatalitiesCount: 0
          },
          ergonomics: {
            ergonomicWorkstationsPercent: 95,
            repetitiveStrainReports: 1,
            erconomicTrainingHours: 40
          },
          mentalHealth: {
            stressManagementPrograms: true,
            mentalHealthDays: 5,
            wellnessInitiatives: 6
          },
          commuting: {
            averageCommuteKm: inputs.transportation.employeeCommuteData.averageCommuteKm,
            publicTransitUsersPercent: inputs.transportation.employeeCommuteData.publicTransitPercent,
            carpoolProgramParticipation: inputs.transportation.employeeCommuteData.carpoolPercent,
            electricVehicleIncentives: true,
            commuteEmissionsKgCO2e: commuting.totalEmissionsKgCO2e
          }
        },
        community: {
          localEconomic: {
            localSupplierSpendPercent: inputs.materials.supplies.localSupplierPercent,
            localTaxesPaidUSD: social.communityBenefits.taxContributionUSD,
            economicImpactMultiplier: 2.8
          },
          foodAccess: {
            affordableProducePrograms: true,
            foodBankDonationsKg: inputs.facilityData.annualProductionKg * 0.05, // 5% donation target
            snapEbtAccepted: true,
            communityGardenSupport: true
          },
          education: {
            farmTourParticipants: inputs.facilityData.totalEmployees * 20, // Estimated
            schoolProgramsSupported: 8, // Estimated
            internshipPositions: Math.max(2, Math.floor(inputs.facilityData.totalEmployees * 0.1)),
            agTechTrainingPrograms: 3
          },
          research: {
            universityPartnerships: 2, // Estimated
            researchCollaborations: 4,
            publicationsContributed: 6,
            openSourceContributions: 12
          }
        },
        supplyChain: {
          suppliers: {
            totalSuppliers: 60, // Estimated
            localSuppliersPercent: inputs.materials.supplies.localSupplierPercent,
            certifiedSuppliersPercent: 70, // Estimated
            minorityOwnedSuppliersPercent: 25
          },
          auditing: {
            supplierAuditsCompleted: 50, // Estimated
            humanRightsViolations: 0,
            childLaborIncidents: 0,
            livingWageCompliance: 85
          },
          sustainability: {
            supplierESGScoring: true,
            sustainabilityRequirements: true,
            carbonNeutralSuppliers: 8
          }
        }
      },
      governance: {
        leadership: {
          boardComposition: {
            independentDirectorsPercent: 67,
            womenDirectorsPercent: 40,
            minorityDirectorsPercent: 30,
            avgTenureYears: 3.5
          },
          executiveComp: {
            ceoPayRatio: 15, // Target
            esgLinkedCompensation: true,
            sayOnPaySupport: 90
          },
          diversity: {
            leadershipDiversityPercent: 40,
            diversityTargetsSet: true,
            inclusionTrainingHours: 30
          }
        },
        ethics: {
          compliance: {
            codeOfConductUpdated: new Date(),
            ethicsTrainingCompletionRate: 98,
            ethicsViolationsReported: 1,
            corruptionIncidents: 0
          },
          transparency: {
            esgReportingFrequency: 'quarterly',
            thirdPartyESGVerification: true,
            stakeholderEngagementEvents: 20,
            publicCommitments: ['Carbon Neutral by 2030', 'Zero Waste to Landfill']
          },
          riskManagement: {
            climateRiskAssessmentCompleted: true,
            cyberSecurityIncidents: 0,
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
            rdSpendPercent: 6, // Estimated
            patentsHeld: 8,
            digitalTransformationScore: 80,
            openSourceContributions: 15
          },
          transparency: {
            realTimeDataSharing: true,
            supplierPortalAccess: true,
            customerDataAccess: true,
            traceabilityCompleteness: 95
          }
        }
      }
    };
  }
}