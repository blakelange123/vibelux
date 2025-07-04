/**
 * Comprehensive ESG Framework for CEA Operations
 * Covers all material ESG topics including packaging, commuting, supply chain, etc.
 */

export interface ComprehensiveESGMetrics {
  environmental: {
    // Emissions (All Scopes)
    emissions: {
      scope1: {
        naturalGas: number; // kg CO2e - heating/cooling
        propane: number; // kg CO2e - backup generators
        refrigerants: number; // kg CO2e - HVAC leaks
        vehicleFleet: number; // kg CO2e - company vehicles
      };
      scope2: {
        electricity: number; // kg CO2e - grid electricity
        electricityRenewable: number; // kg CO2e - from renewable sources
      };
      scope3: {
        employeeCommuting: number; // kg CO2e - daily commute
        businessTravel: number; // kg CO2e - flights, hotels
        packaging: {
          cardboard: number; // kg CO2e - shipping boxes
          plastic: number; // kg CO2e - clamshells, bags
          labels: number; // kg CO2e - stickers, bands
        };
        transportation: {
          inboundSupplies: number; // kg CO2e - seeds, nutrients delivered
          outboundDistribution: number; // kg CO2e - produce delivery
        };
        supplierEmissions: number; // kg CO2e - upstream supply chain
        wasteDisposal: number; // kg CO2e - waste processing
        waterTreatment: number; // kg CO2e - municipal water treatment
      };
    };
    
    // Resource Consumption
    resources: {
      water: {
        municipalWaterM3: number; // cubic meters
        rainwaterHarvestedM3: number; // cubic meters
        recycledWaterM3: number; // cubic meters
        waterIntensity: number; // L per kg produce
      };
      energy: {
        totalKWh: number;
        renewableKWh: number;
        gasKWh: number; // heating
        energyIntensity: number; // kWh per kg produce
      };
      materials: {
        seeds: {
          organicPercent: number;
          locallySourcedPercent: number;
          sustainablyCertifiedPercent: number;
        };
        nutrients: {
          syntheticKg: number;
          organicKg: number;
          recycledNutrientPercent: number;
        };
        growingMedia: {
          peatMossKg: number; // avoid due to carbon impact
          cocoCoirKg: number; // renewable alternative
          recycledMediaPercent: number;
        };
        packaging: {
          cardboardKg: number; // primary packaging
          plasticKg: number; // clamshells, bags
          recycledContentPercent: number;
          compostablePercent: number;
        };
      };
    };
    
    // Waste Generation
    waste: {
      organic: {
        plantWasteKg: number; // trimmings, roots
        compostedKg: number;
        anaerobicDigestionKg: number;
        diversionRate: number; // % diverted from landfill
      };
      packaging: {
        cardboardKg: number;
        plasticKg: number;
        recyclingRate: number; // %
      };
      hazardous: {
        cleaningChemicalsKg: number;
        fluorescentsKg: number; // old lighting
        batteriesKg: number;
        properDisposalRate: number; // %
      };
      general: {
        landfillKg: number;
        wasteIntensity: number; // kg per kg produce
      };
    };
    
    // Pollution Prevention
    pollution: {
      waterDischarge: {
        volumeM3: number;
        nitrogenMgL: number; // concentration
        phosphorusMgL: number;
        complianceRate: number; // % meeting discharge limits
      };
      airEmissions: {
        particulateMatter: number; // kg
        volatileOrganicCompounds: number; // kg
        ammonia: number; // kg from decomposition
      };
      soilContamination: {
        chemicalSpills: number; // incidents
        cleanupCosts: number; // USD
      };
    };
    
    // Biodiversity & Land Use
    biodiversity: {
      landFootprintM2: number;
      nativeHabitatPreservedM2: number;
      pollinatorFriendlyPractices: boolean;
      beneficialInsectPrograms: boolean;
      localEcosystemImpact: 'positive' | 'neutral' | 'negative';
    };
  };
  
  social: {
    // Workforce
    workforce: {
      totalEmployees: number;
      demographics: {
        womenPercent: number;
        minoritiesPercent: number;
        localHiresPercent: number; // within 25 miles
        veteransPercent: number;
      };
      compensation: {
        livingWageCompliance: boolean;
        payEquityAuditCompleted: boolean;
        averageWageUSD: number;
        wageGapPercent: number; // gender/racial pay gaps
      };
      benefits: {
        healthInsurancePercent: number; // employees covered
        retirementPlanPercent: number;
        paidTimeOffDays: number;
        professionalDevelopmentUSD: number; // per employee
      };
      turnover: {
        voluntaryTurnoverRate: number; // %
        averageTenureMonths: number;
        employeeSatisfactionScore: number; // 1-10
      };
    };
    
    // Health & Safety
    healthSafety: {
      workplaceInjuries: {
        recordableIncidentRate: number; // per 200k hours
        lostTimeIncidentRate: number;
        daysAwayRestrictedTransfer: number;
        fatalitiesCount: number;
      };
      ergonomics: {
        ergonomicWorkstationsPercent: number;
        repetitiveStrainReports: number;
        erconomicTrainingHours: number;
      };
      mentalHealth: {
        stressManagementPrograms: boolean;
        mentalHealthDays: number;
        wellnessInitiatives: number;
      };
      commuting: {
        averageCommuteKm: number;
        publicTransitUsersPercent: number;
        carpoolProgramParticipation: number;
        electricVehicleIncentives: boolean;
        commuteEmissionsKgCO2e: number;
      };
    };
    
    // Community Impact
    community: {
      localEconomic: {
        localSupplierSpendPercent: number;
        localTaxesPaidUSD: number;
        economicImpactMultiplier: number;
      };
      foodAccess: {
        affordableProducePrograms: boolean;
        foodBankDonationsKg: number;
        snapEbtAccepted: boolean;
        communityGardenSupport: boolean;
      };
      education: {
        farmTourParticipants: number;
        schoolProgramsSupported: number;
        internshipPositions: number;
        agTechTrainingPrograms: number;
      };
      research: {
        universityPartnerships: number;
        researchCollaborations: number;
        publicationsContributed: number;
        openSourceContributions: number;
      };
    };
    
    // Supply Chain
    supplyChain: {
      suppliers: {
        totalSuppliers: number;
        localSuppliersPercent: number; // within 100 miles
        certifiedSuppliersPercent: number; // B-Corp, Fair Trade, etc.
        minorityOwnedSuppliersPercent: number;
      };
      auditing: {
        supplierAuditsCompleted: number;
        humanRightsViolations: number;
        childLaborIncidents: number;
        livingWageCompliance: number; // suppliers meeting standard
      };
      sustainability: {
        supplierESGScoring: boolean;
        sustainabilityRequirements: boolean;
        carbonNeutralSuppliers: number;
      };
    };
  };
  
  governance: {
    // Leadership & Governance
    leadership: {
      boardComposition: {
        independentDirectorsPercent: number;
        womenDirectorsPercent: number;
        minorityDirectorsPercent: number;
        avgTenureYears: number;
      };
      executiveComp: {
        ceoPayRatio: number; // CEO to median worker
        esgLinkedCompensation: boolean;
        sayOnPaySupport: number; // shareholder approval %
      };
      diversity: {
        leadershipDiversityPercent: number;
        diversityTargetsSet: boolean;
        inclusionTrainingHours: number;
      };
    };
    
    // Ethics & Compliance
    ethics: {
      compliance: {
        codeOfConductUpdated: Date;
        ethicsTrainingCompletionRate: number; // %
        ethicsViolationsReported: number;
        corruptionIncidents: number;
      };
      transparency: {
        esgReportingFrequency: 'annual' | 'quarterly' | 'monthly';
        thirdPartyESGVerification: boolean;
        stakeholderEngagementEvents: number;
        publicCommitments: string[];
      };
      riskManagement: {
        climateRiskAssessmentCompleted: boolean;
        cyberSecurityIncidents: number;
        businessContinuityPlanning: boolean;
        insuranceCoverage: 'adequate' | 'comprehensive' | 'limited';
      };
    };
    
    // Data & Technology
    data: {
      privacy: {
        dataBreaches: number;
        gdprCompliance: boolean;
        ccpaCompliance: boolean;
        dataMinimizationPractices: boolean;
      };
      innovation: {
        rdSpendPercent: number; // % of revenue
        patentsHeld: number;
        digitalTransformationScore: number; // 1-100
        openSourceContributions: number;
      };
      transparency: {
        realTimeDataSharing: boolean;
        supplierPortalAccess: boolean;
        customerDataAccess: boolean;
        traceabilityCompleteness: number; // % of products traceable
      };
    };
  };
}

export interface ESGBenchmarks {
  environmental: {
    scope1Emissions: { excellent: number; good: number; average: number }; // kg CO2e per kg produce
    scope2Emissions: { excellent: number; good: number; average: number };
    scope3Emissions: { excellent: number; good: number; average: number };
    waterIntensity: { excellent: number; good: number; average: number }; // L per kg
    wasteIntensity: { excellent: number; good: number; average: number }; // kg waste per kg produce
    renewableEnergyPercent: { excellent: number; good: number; average: number };
    packagingRecycledContent: { excellent: number; good: number; average: number };
  };
  social: {
    recordableIncidentRate: { excellent: number; good: number; average: number };
    voluntaryTurnoverRate: { excellent: number; good: number; average: number };
    livingWageCompliance: { excellent: number; good: number; average: number };
    diversityPercent: { excellent: number; good: number; average: number };
    localSupplierPercent: { excellent: number; good: number; average: number };
    communityInvestmentPercent: { excellent: number; good: number; average: number }; // % revenue
  };
  governance: {
    boardIndependence: { excellent: number; good: number; average: number };
    womenInLeadership: { excellent: number; good: number; average: number };
    ethicsTrainingCompletion: { excellent: number; good: number; average: number };
    supplierAuditCoverage: { excellent: number; good: number; average: number };
    esgReportingQuality: { excellent: string; good: string; average: string };
  };
}

export const CEAESGBenchmarks: ESGBenchmarks = {
  environmental: {
    scope1Emissions: { excellent: 0.05, good: 0.1, average: 0.2 }, // kg CO2e per kg produce
    scope2Emissions: { excellent: 1.5, good: 3.0, average: 5.0 },
    scope3Emissions: { excellent: 0.8, good: 1.5, average: 3.0 },
    waterIntensity: { excellent: 2, good: 5, average: 10 }, // L per kg
    wasteIntensity: { excellent: 0.02, good: 0.05, average: 0.1 },
    renewableEnergyPercent: { excellent: 80, good: 50, average: 20 },
    packagingRecycledContent: { excellent: 80, good: 50, average: 25 }
  },
  social: {
    recordableIncidentRate: { excellent: 1.0, good: 2.0, average: 3.5 },
    voluntaryTurnoverRate: { excellent: 10, good: 20, average: 35 },
    livingWageCompliance: { excellent: 100, good: 90, average: 70 },
    diversityPercent: { excellent: 40, good: 30, average: 20 },
    localSupplierPercent: { excellent: 60, good: 40, average: 20 },
    communityInvestmentPercent: { excellent: 2.0, good: 1.0, average: 0.5 }
  },
  governance: {
    boardIndependence: { excellent: 80, good: 60, average: 40 },
    womenInLeadership: { excellent: 40, good: 30, average: 20 },
    ethicsTrainingCompletion: { excellent: 100, good: 95, average: 85 },
    supplierAuditCoverage: { excellent: 100, good: 80, average: 50 },
    esgReportingQuality: { excellent: 'GRI+SASB+TCFD', good: 'GRI+SASB', average: 'Basic' }
  }
};

// Material ESG Topics for CEA Industry
export const CEAMaterialTopics = {
  highMaterial: [
    'Energy Management',
    'Water & Wastewater Management', 
    'Waste & Hazardous Materials Management',
    'Employee Health & Safety',
    'Food Safety',
    'Supply Chain Management',
    'Data Security & Privacy'
  ],
  mediumMaterial: [
    'GHG Emissions',
    'Labor Practices',
    'Community Relations',
    'Product Quality & Safety',
    'Innovation Management',
    'Business Ethics'
  ],
  lowMaterial: [
    'Air Quality',
    'Biodiversity Impacts',
    'Competitive Behavior',
    'Critical Incident Risk Management',
    'Customer Privacy'
  ]
};

export interface ESGRiskAssessment {
  climateRisks: {
    physical: {
      extremeWeather: 'low' | 'medium' | 'high'; // CEA advantage - indoor protection
      waterScarcity: 'low' | 'medium' | 'high';
      temperatureRise: 'low' | 'medium' | 'high';
    };
    transition: {
      carbonPricing: 'low' | 'medium' | 'high';
      energyCosts: 'low' | 'medium' | 'high'; // High for CEA due to energy intensity
      regulatoryChanges: 'low' | 'medium' | 'high';
    };
  };
  socialRisks: {
    laborShortages: 'low' | 'medium' | 'high';
    communityAcceptance: 'low' | 'medium' | 'high';
    foodSafety: 'low' | 'medium' | 'high';
    supplyChainDisruption: 'low' | 'medium' | 'high';
  };
  governanceRisks: {
    cyberSecurity: 'low' | 'medium' | 'high'; // High for automated systems
    regulatoryCompliance: 'low' | 'medium' | 'high';
    reputationalRisk: 'low' | 'medium' | 'high';
    intellectualProperty: 'low' | 'medium' | 'high';
  };
}