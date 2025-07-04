/**
 * ESG Emissions Calculator for Controlled Environment Agriculture
 * Calculates Scope 1, 2, and 3 emissions with focus on Scope 2 (electricity)
 */

export interface EmissionFactors {
  // Grid emission factors by region (kg CO2e per kWh)
  gridEmissions: {
    [region: string]: number;
  };
  // Fuel emission factors (kg CO2e per unit)
  fuelEmissions: {
    naturalGas: number; // per cubic meter
    propane: number; // per liter
    diesel: number; // per liter
  };
  // Refrigerant GWP factors
  refrigerantGWP: {
    R410A: number;
    R134a: number;
    R32: number;
    CO2: number;
  };
}

export interface FacilityData {
  location: string;
  zipCode: string;
  squareFeet: number;
  monthlyElectricityKWh: number;
  monthlyNaturalGasCubicMeters?: number;
  refrigerantType?: keyof EmissionFactors['refrigerantGWP'];
  refrigerantLeakageKg?: number;
  solarGenerationKWh?: number;
  renewableEnergyPercent?: number;
}

export interface EmissionsReport {
  scope1: {
    naturalGas: number;
    refrigerants: number;
    other: number;
    total: number;
  };
  scope2: {
    electricity: number;
    electricityLocationBased: number;
    electricityMarketBased: number;
    total: number;
  };
  scope3: {
    upstreamEnergy: number;
    waste: number;
    transportation: number;
    total: number;
  };
  totalEmissions: number;
  emissionsIntensity: number; // kg CO2e per sq ft
  reductions: {
    fromSolar: number;
    fromEfficiency: number;
    fromRenewables: number;
    total: number;
  };
}

export class EmissionsCalculator {
  private emissionFactors: EmissionFactors = {
    gridEmissions: {
      // US Grid Emission Factors by eGRID subregion (2023 data)
      'CAMX': 0.239, // California
      'NYLI': 0.374, // NYC/Long Island
      'NEWE': 0.296, // New England
      'RFCW': 0.644, // Great Lakes
      'RMPA': 0.656, // Rocky Mountains
      'SPNO': 0.732, // Kansas/Nebraska
      'SRMW': 0.814, // Missouri
      'ERCT': 0.397, // Texas ERCOT
      'FRCC': 0.417, // Florida
      'MROE': 0.652, // Wisconsin
      'NWPP': 0.349, // Pacific Northwest
      'SERC': 0.415, // Southeast
      // International
      'CA-ON': 0.029, // Ontario (mostly hydro/nuclear)
      'CA-BC': 0.011, // British Columbia (hydro)
      'EU-DE': 0.366, // Germany
      'EU-NL': 0.275, // Netherlands
      'DEFAULT': 0.455 // US Average
    },
    fuelEmissions: {
      naturalGas: 1.885, // kg CO2e per cubic meter
      propane: 1.51, // kg CO2e per liter
      diesel: 2.68 // kg CO2e per liter
    },
    refrigerantGWP: {
      R410A: 2088,
      R134a: 1430,
      R32: 675,
      CO2: 1
    }
  };

  /**
   * Get grid emission factor for a location
   */
  private getGridEmissionFactor(location: string): number {
    // Map zip codes to eGRID subregions (simplified)
    const zipToRegion: { [prefix: string]: string } = {
      '900': 'CAMX', '901': 'CAMX', '902': 'CAMX', // California
      '100': 'NYLI', '101': 'NYLI', '102': 'NYLI', // New York
      '330': 'FRCC', '331': 'FRCC', '332': 'FRCC', // Florida
      '750': 'ERCT', '751': 'ERCT', '752': 'ERCT', // Texas
      '980': 'NWPP', '981': 'NWPP', '982': 'NWPP', // Washington
    };

    const zipPrefix = location.substring(0, 3);
    const region = zipToRegion[zipPrefix] || 'DEFAULT';
    return this.emissionFactors.gridEmissions[region];
  }

  /**
   * Calculate Scope 1 emissions (direct emissions)
   */
  private calculateScope1(data: FacilityData): EmissionsReport['scope1'] {
    let naturalGas = 0;
    let refrigerants = 0;

    // Natural gas combustion
    if (data.monthlyNaturalGasCubicMeters) {
      naturalGas = data.monthlyNaturalGasCubicMeters * 
                   this.emissionFactors.fuelEmissions.naturalGas * 
                   12; // Annual
    }

    // Refrigerant leakage
    if (data.refrigerantType && data.refrigerantLeakageKg) {
      const gwp = this.emissionFactors.refrigerantGWP[data.refrigerantType];
      refrigerants = data.refrigerantLeakageKg * gwp;
    }

    return {
      naturalGas,
      refrigerants,
      other: 0,
      total: naturalGas + refrigerants
    };
  }

  /**
   * Calculate Scope 2 emissions (indirect emissions from electricity)
   */
  private calculateScope2(data: FacilityData): EmissionsReport['scope2'] {
    const gridFactor = this.getGridEmissionFactor(data.zipCode);
    const annualElectricity = data.monthlyElectricityKWh * 12;
    
    // Location-based method (grid average)
    const electricityLocationBased = annualElectricity * gridFactor;
    
    // Market-based method (accounts for renewable energy purchases)
    let electricityMarketBased = electricityLocationBased;
    
    if (data.renewableEnergyPercent) {
      electricityMarketBased *= (1 - data.renewableEnergyPercent / 100);
    }
    
    return {
      electricity: electricityMarketBased,
      electricityLocationBased,
      electricityMarketBased,
      total: electricityMarketBased
    };
  }

  /**
   * Calculate Scope 3 emissions (other indirect emissions)
   */
  private calculateScope3(data: FacilityData): EmissionsReport['scope3'] {
    // Simplified Scope 3 - typically requires more detailed data
    const annualElectricity = data.monthlyElectricityKWh * 12;
    
    // Upstream energy (T&D losses, ~5% of electricity)
    const upstreamEnergy = annualElectricity * 0.05 * this.getGridEmissionFactor(data.zipCode);
    
    // Waste (estimate based on facility size)
    const waste = data.squareFeet * 0.001; // kg CO2e per sq ft
    
    // Transportation (estimate)
    const transportation = data.squareFeet * 0.002;
    
    return {
      upstreamEnergy,
      waste,
      transportation,
      total: upstreamEnergy + waste + transportation
    };
  }

  /**
   * Calculate emissions reductions from efficiency measures
   */
  private calculateReductions(data: FacilityData): EmissionsReport['reductions'] {
    let fromSolar = 0;
    const fromEfficiency = 0;
    let fromRenewables = 0;
    
    const gridFactor = this.getGridEmissionFactor(data.zipCode);
    
    // Solar generation offset
    if (data.solarGenerationKWh) {
      fromSolar = data.solarGenerationKWh * 12 * gridFactor;
    }
    
    // Renewable energy purchases
    if (data.renewableEnergyPercent && data.monthlyElectricityKWh) {
      fromRenewables = data.monthlyElectricityKWh * 12 * 
                       (data.renewableEnergyPercent / 100) * 
                       gridFactor;
    }
    
    return {
      fromSolar,
      fromEfficiency,
      fromRenewables,
      total: fromSolar + fromEfficiency + fromRenewables
    };
  }

  /**
   * Generate complete emissions report
   */
  public calculateEmissions(data: FacilityData): EmissionsReport {
    const scope1 = this.calculateScope1(data);
    const scope2 = this.calculateScope2(data);
    const scope3 = this.calculateScope3(data);
    const reductions = this.calculateReductions(data);
    
    const totalEmissions = scope1.total + scope2.total + scope3.total;
    const emissionsIntensity = totalEmissions / data.squareFeet;
    
    return {
      scope1,
      scope2,
      scope3,
      totalEmissions,
      emissionsIntensity,
      reductions
    };
  }

  /**
   * Compare emissions to baseline (e.g., traditional greenhouse)
   */
  public calculateEmissionsReduction(
    current: EmissionsReport,
    baseline: EmissionsReport
  ): {
    absoluteReduction: number;
    percentReduction: number;
    equivalentTrees: number;
    equivalentCars: number;
  } {
    const absoluteReduction = baseline.totalEmissions - current.totalEmissions;
    const percentReduction = (absoluteReduction / baseline.totalEmissions) * 100;
    
    // EPA equivalencies
    const equivalentTrees = Math.round(absoluteReduction / 39.5); // kg CO2 per tree per year
    const equivalentCars = Math.round(absoluteReduction / 4600); // kg CO2 per car per year
    
    return {
      absoluteReduction,
      percentReduction,
      equivalentTrees,
      equivalentCars
    };
  }

  /**
   * Generate GHG Protocol compliant report
   */
  public generateGHGProtocolReport(
    data: FacilityData,
    report: EmissionsReport
  ): {
    organizationalBoundary: string;
    reportingPeriod: string;
    scopes: typeof report;
    methodology: string;
    dataQuality: string;
  } {
    return {
      organizationalBoundary: 'Operational Control',
      reportingPeriod: new Date().getFullYear().toString(),
      scopes: report,
      methodology: 'GHG Protocol Corporate Standard',
      dataQuality: 'Tier 2 - Facility-specific activity data with regional emission factors'
    };
  }
}

// Efficiency benchmarking data
export const CEABenchmarks = {
  traditional: {
    electricityPerSqFt: 50, // kWh/sq ft/year
    naturalGasPerSqFt: 100, // cubic feet/sq ft/year
    waterPerSqFt: 20, // gallons/sq ft/year
  },
  efficient: {
    electricityPerSqFt: 35,
    naturalGasPerSqFt: 50,
    waterPerSqFt: 10,
  },
  bestInClass: {
    electricityPerSqFt: 25,
    naturalGasPerSqFt: 20,
    waterPerSqFt: 5,
  }
};

// Carbon intensity targets aligned with SBTi
export const CarbonTargets = {
  '2025': 0.5, // kg CO2e per sq ft
  '2030': 0.3,
  '2040': 0.1,
  '2050': 0.0 // Net zero
};