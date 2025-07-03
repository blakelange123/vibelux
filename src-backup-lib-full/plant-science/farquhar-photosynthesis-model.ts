// Farquhar-von Caemmerer-Berry Photosynthesis Model
// Advanced C3 photosynthesis modeling for precision agriculture

export interface PhotosynthesisParameters {
  // Biochemical parameters
  vcmax25: number; // Maximum carboxylation rate at 25°C (μmol CO2 m⁻² s⁻¹)
  jmax25: number; // Maximum electron transport rate at 25°C (μmol e⁻ m⁻² s⁻¹)
  rd25: number; // Dark respiration rate at 25°C (μmol CO2 m⁻² s⁻¹)
  
  // Michaelis-Menten constants at 25°C
  kc25: number; // Michaelis constant for CO2 (μmol mol⁻¹)
  ko25: number; // Michaelis constant for O2 (mmol mol⁻¹)
  
  // Temperature response parameters
  haVcmax: number; // Activation energy for Vcmax (J mol⁻¹)
  haJmax: number; // Activation energy for Jmax (J mol⁻¹)
  haRd: number; // Activation energy for Rd (J mol⁻¹)
  haKc: number; // Activation energy for Kc (J mol⁻¹)
  haKo: number; // Activation energy for Ko (J mol⁻¹)
  
  // High temperature deactivation
  hdVcmax: number; // Deactivation energy for Vcmax (J mol⁻¹)
  hdJmax: number; // Deactivation energy for Jmax (J mol⁻¹)
  sVcmax: number; // Entropy term for Vcmax (J mol⁻¹ K⁻¹)
  sJmax: number; // Entropy term for Jmax (J mol⁻¹ K⁻¹)
  
  // Light response parameters
  alpha: number; // Quantum efficiency of PSII (mol e⁻ mol⁻¹ photons)
  theta: number; // Curvature factor for light response
  
  // Stomatal conductance parameters
  g0: number; // Minimum stomatal conductance (mol H2O m⁻² s⁻¹)
  g1: number; // Stomatal slope parameter
  
  // Mesophyll conductance
  gm25: number; // Mesophyll conductance at 25°C (mol CO2 m⁻² s⁻¹ Pa⁻¹)
  haGm: number; // Activation energy for gm (J mol⁻¹)
}

export interface EnvironmentalConditions {
  // Light conditions
  ppfd: number; // Photosynthetic photon flux density (μmol photons m⁻² s⁻¹)
  spectrumQuality: SpectrumQuality;
  
  // Temperature conditions
  leafTemperature: number; // °C
  airTemperature: number; // °C
  
  // Gas concentrations
  co2Concentration: number; // μmol CO2 mol⁻¹ (ppm)
  o2Concentration: number; // mmol O2 mol⁻¹ (typically 210)
  
  // Water relations
  relativeHumidity: number; // %
  vaporPressureDeficit: number; // kPa
  leafWaterPotential: number; // MPa
  
  // Atmospheric conditions
  atmosphericPressure: number; // kPa
  windSpeed: number; // m s⁻¹
}

export interface SpectrumQuality {
  redPPFD: number; // 660-700 nm (μmol m⁻² s⁻¹)
  bluePPFD: number; // 400-500 nm (μmol m⁻² s⁻¹)
  greenPPFD: number; // 500-600 nm (μmol m⁻² s⁻¹)
  farRedPPFD: number; // 700-800 nm (μmol m⁻² s⁻¹)
  redFarRedRatio: number; // R:FR ratio
  blueRedRatio: number; // B:R ratio
}

export interface PhotosynthesisResults {
  // Photosynthetic rates
  netPhotosynthesis: number; // An (μmol CO2 m⁻² s⁻¹)
  grossPhotosynthesis: number; // Ag (μmol CO2 m⁻² s⁻¹)
  darkRespiration: number; // Rd (μmol CO2 m⁻² s⁻¹)
  
  // Limiting processes
  rubiscoLimitedRate: number; // Ac (μmol CO2 m⁻² s⁻¹)
  lightLimitedRate: number; // Aj (μmol CO2 m⁻² s⁻¹)
  tpuLimitedRate: number; // Ap (μmol CO2 m⁻² s⁻¹)
  limitingFactor: 'rubisco' | 'light' | 'tpu';
  
  // Internal conditions
  intercellularCO2: number; // Ci (μmol mol⁻¹)
  chloroplastCO2: number; // Cc (μmol mol⁻¹)
  co2CompensationPoint: number; // Γ* (μmol mol⁻¹)
  
  // Electron transport
  electronTransportRate: number; // J (μmol e⁻ m⁻² s⁻¹)
  quantumYield: number; // Φ (mol CO2 mol⁻¹ photons)
  
  // Conductances
  stomatalConductance: number; // gs (mol H2O m⁻² s⁻¹)
  mesophyllConductance: number; // gm (mol CO2 m⁻² s⁻¹ Pa⁻¹)
  
  // Water relations
  transpiration: number; // E (mmol H2O m⁻² s⁻¹)
  waterUseEfficiency: number; // WUE (μmol CO2 mmol⁻¹ H2O)
  
  // Energy balance
  leafEnergyBalance: number; // W m⁻²
  evaporativeCooling: number; // W m⁻²
  
  // Efficiency metrics
  lightUseEfficiency: number; // LUE (μmol CO2 μmol⁻¹ photons)
  nitrogenUseEfficiency: number; // NUE (μmol CO2 g⁻¹ N s⁻¹)
  
  // Stress indicators
  photorespiration: number; // μmol CO2 m⁻² s⁻¹
  photoinhibition: number; // % reduction in efficiency
  heatStress: number; // % reduction due to high temperature
}

export interface PhotosynthesisOptimization {
  optimalConditions: {
    co2Concentration: number; // ppm
    leafTemperature: number; // °C
    ppfd: number; // μmol m⁻² s⁻¹
    vpd: number; // kPa
  };
  maxPhotosynthesis: number; // μmol CO2 m⁻² s⁻¹
  limitingFactors: string[];
  recommendations: string[];
  costBenefit: {
    co2Cost: number; // $ per day
    lightingCost: number; // $ per day
    coolingCost: number; // $ per day
    totalCost: number; // $ per day
    yieldIncrease: number; // %
    roi: number; // days to payback
  };
}

export class FarquharPhotosynthesisModel {
  private readonly gasConstant = 8.314; // J mol⁻¹ K⁻¹
  private readonly kelvinOffset = 273.15;
  
  constructor(
    private parameters: PhotosynthesisParameters
  ) {}

  // Main photosynthesis calculation
  public calculatePhotosynthesis(
    conditions: EnvironmentalConditions
  ): PhotosynthesisResults {
    
    const leafTempK = conditions.leafTemperature + this.kelvinOffset;
    
    // Calculate temperature-adjusted parameters
    const vcmax = this.temperatureResponse(
      this.parameters.vcmax25,
      this.parameters.haVcmax,
      leafTempK,
      this.parameters.hdVcmax,
      this.parameters.sVcmax
    );
    
    const jmax = this.temperatureResponse(
      this.parameters.jmax25,
      this.parameters.haJmax,
      leafTempK,
      this.parameters.hdJmax,
      this.parameters.sJmax
    );
    
    const rd = this.temperatureResponse(
      this.parameters.rd25,
      this.parameters.haRd,
      leafTempK
    );
    
    const kc = this.temperatureResponse(
      this.parameters.kc25,
      this.parameters.haKc,
      leafTempK
    );
    
    const ko = this.temperatureResponse(
      this.parameters.ko25,
      this.parameters.haKo,
      leafTempK
    );
    
    const gm = this.temperatureResponse(
      this.parameters.gm25,
      this.parameters.haGm,
      leafTempK
    );
    
    // Calculate CO2 compensation point
    const gammaS = this.calculateCO2CompensationPoint(conditions.leafTemperature);
    
    // Calculate electron transport rate
    const j = this.calculateElectronTransportRate(conditions.ppfd, jmax, conditions.spectrumQuality);
    
    // Solve for photosynthesis using coupled equations
    const solution = this.solveCoupledEquations(
      vcmax, j, rd, kc, ko, gm, gammaS, conditions
    );
    
    // Calculate additional metrics
    const transpiration = this.calculateTranspiration(
      solution.stomatalConductance, 
      conditions.vaporPressureDeficit
    );
    
    const wue = solution.netPhotosynthesis / transpiration;
    const lue = solution.netPhotosynthesis / conditions.ppfd;
    
    const photorespiration = this.calculatePhotorespiration(
      solution.chloroplastCO2, 
      conditions.o2Concentration, 
      gammaS, 
      vcmax
    );
    
    const photoinhibition = this.calculatePhotoinhibition(conditions.ppfd, conditions.leafTemperature);
    const heatStress = this.calculateHeatStress(conditions.leafTemperature);
    
    return {
      netPhotosynthesis: solution.netPhotosynthesis,
      grossPhotosynthesis: solution.netPhotosynthesis + rd,
      darkRespiration: rd,
      rubiscoLimitedRate: solution.rubiscoLimited,
      lightLimitedRate: solution.lightLimited,
      tpuLimitedRate: solution.tpuLimited,
      limitingFactor: solution.limitingFactor,
      intercellularCO2: solution.intercellularCO2,
      chloroplastCO2: solution.chloroplastCO2,
      co2CompensationPoint: gammaS,
      electronTransportRate: j,
      quantumYield: solution.netPhotosynthesis / conditions.ppfd,
      stomatalConductance: solution.stomatalConductance,
      mesophyllConductance: gm,
      transpiration,
      waterUseEfficiency: wue,
      leafEnergyBalance: this.calculateEnergyBalance(conditions),
      evaporativeCooling: transpiration * 44000, // J mol⁻¹ latent heat
      lightUseEfficiency: lue,
      nitrogenUseEfficiency: this.calculateNitrogenUseEfficiency(solution.netPhotosynthesis),
      photorespiration,
      photoinhibition,
      heatStress
    };
  }

  // Temperature response function (Arrhenius with high-temperature deactivation)
  private temperatureResponse(
    param25: number,
    ha: number,
    tempK: number,
    hd?: number,
    s?: number
  ): number {
    
    const temp25K = 25 + this.kelvinOffset;
    
    // Basic Arrhenius response
    let response = param25 * Math.exp((ha * (tempK - temp25K)) / (this.gasConstant * tempK * temp25K));
    
    // High-temperature deactivation
    if (hd !== undefined && s !== undefined) {
      const deactivation = (1 + Math.exp((s * temp25K - hd) / (this.gasConstant * temp25K))) /
                          (1 + Math.exp((s * tempK - hd) / (this.gasConstant * tempK)));
      response *= deactivation;
    }
    
    return response;
  }

  // CO2 compensation point calculation
  private calculateCO2CompensationPoint(leafTemp: number): number {
    // Γ* = 0.5 * O2 / (2600 * exp(-1750 / (T - 10)))
    const tempK = leafTemp + this.kelvinOffset;
    return 0.5 * 210000 / (2600 * Math.exp(-1750 / (tempK - 10)));
  }

  // Electron transport rate calculation
  private calculateElectronTransportRate(
    ppfd: number, 
    jmax: number, 
    spectrum: SpectrumQuality
  ): number {
    
    // Spectrum quality effects
    const spectrumFactor = this.calculateSpectrumFactor(spectrum);
    const effectivePPFD = ppfd * spectrumFactor;
    
    // Light response curve with curvature
    const alpha = this.parameters.alpha;
    const theta = this.parameters.theta;
    
    // Solve quadratic equation: θJ² - (αI + Jmax)J + αIJmax = 0
    const a = theta;
    const b = -(alpha * effectivePPFD + jmax);
    const c = alpha * effectivePPFD * jmax;
    
    const discriminant = b * b - 4 * a * c;
    const j = (-b - Math.sqrt(discriminant)) / (2 * a);
    
    return Math.max(0, j);
  }

  private calculateSpectrumFactor(spectrum: SpectrumQuality): number {
    // Spectrum quality effects on photosynthesis
    let factor = 1.0;
    
    // Red light is most efficient for photosynthesis
    const redFraction = spectrum.redPPFD / (spectrum.redPPFD + spectrum.bluePPFD + spectrum.greenPPFD);
    factor *= 0.8 + 0.4 * redFraction;
    
    // Blue light enhances efficiency but saturates
    const blueFraction = spectrum.bluePPFD / (spectrum.redPPFD + spectrum.bluePPFD + spectrum.greenPPFD);
    factor *= 1 + 0.2 * Math.min(blueFraction / 0.2, 1);
    
    // Far-red light can reduce efficiency
    if (spectrum.redFarRedRatio < 1) {
      factor *= 0.9 + 0.1 * spectrum.redFarRedRatio;
    }
    
    return Math.max(0.5, Math.min(factor, 1.3));
  }

  // Solve coupled photosynthesis-stomatal conductance equations
  private solveCoupledEquations(
    vcmax: number,
    j: number,
    rd: number,
    kc: number,
    ko: number,
    gm: number,
    gammaS: number,
    conditions: EnvironmentalConditions
  ): any {
    
    const ca = conditions.co2Concentration;
    const oa = conditions.o2Concentration;
    
    // Initial guess for intercellular CO2
    let ci = ca * 0.7;
    let gs = this.parameters.g0;
    
    // Iterative solution
    for (let iter = 0; iter < 20; iter++) {
      const oldCi = ci;
      
      // Calculate chloroplast CO2 concentration
      const cc = ci - (ci - ca) * (1 - gm / gs);
      
      // Calculate photosynthetic rates
      const ac = this.calculateRubiscoLimitedRate(vcmax, cc, gammaS, kc, ko, oa);
      const aj = this.calculateLightLimitedRate(j, cc, gammaS);
      const ap = vcmax / 2; // TPU limitation (simplified)
      
      // Net photosynthesis is minimum of three rates
      const an = Math.min(ac, aj, ap) - rd;
      
      // Update stomatal conductance using Ball-Berry model
      gs = this.parameters.g0 + this.parameters.g1 * an * conditions.relativeHumidity / ca;
      
      // Update intercellular CO2
      ci = ca - an / gs;
      
      // Check convergence
      if (Math.abs(ci - oldCi) < 0.1) {
        return {
          netPhotosynthesis: Math.max(0, an),
          rubiscoLimited: ac - rd,
          lightLimited: aj - rd,
          tpuLimited: ap - rd,
          limitingFactor: ac <= aj && ac <= ap ? 'rubisco' : 
                         aj <= ap ? 'light' : 'tpu',
          intercellularCO2: ci,
          chloroplastCO2: cc,
          stomatalConductance: gs
        };
      }
    }
    
    // Return if convergence not achieved
    return {
      netPhotosynthesis: 0,
      rubiscoLimited: 0,
      lightLimited: 0,
      tpuLimited: 0,
      limitingFactor: 'rubisco' as const,
      intercellularCO2: ci,
      chloroplastCO2: ci,
      stomatalConductance: gs
    };
  }

  // Rubisco-limited photosynthesis rate
  private calculateRubiscoLimitedRate(
    vcmax: number,
    cc: number,
    gammaS: number,
    kc: number,
    ko: number,
    oa: number
  ): number {
    
    const kcPrime = kc * (1 + oa / ko);
    return vcmax * (cc - gammaS) / (cc + kcPrime);
  }

  // Light-limited photosynthesis rate
  private calculateLightLimitedRate(
    j: number,
    cc: number,
    gammaS: number
  ): number {
    
    return j * (cc - gammaS) / (4 * (cc + 2 * gammaS));
  }

  // Calculate transpiration rate
  private calculateTranspiration(gs: number, vpd: number): number {
    // E = gs * VPD / P (simplified)
    const atmosphericPressure = 101.325; // kPa
    return gs * vpd / atmosphericPressure * 1000; // mmol H2O m⁻² s⁻¹
  }

  // Calculate photorespiration
  private calculatePhotorespiration(
    cc: number,
    oa: number,
    gammaS: number,
    vcmax: number
  ): number {
    
    // Simplified photorespiration calculation
    const oxygenationRate = vcmax * oa / (oa + 2 * gammaS * cc / gammaS);
    return oxygenationRate * 0.5; // Half of oxygenation is lost as CO2
  }

  // Calculate photoinhibition
  private calculatePhotoinhibition(ppfd: number, leafTemp: number): number {
    // Photoinhibition increases with high light and temperature
    const lightStress = Math.max(0, (ppfd - 1000) / 1000); // Stress above 1000 μmol m⁻² s⁻¹
    const tempStress = Math.max(0, (leafTemp - 30) / 10); // Stress above 30°C
    
    const totalStress = lightStress + tempStress;
    return Math.min(totalStress * 20, 50); // Max 50% inhibition
  }

  // Calculate heat stress
  private calculateHeatStress(leafTemp: number): number {
    if (leafTemp < 35) return 0;
    
    const stressFactor = (leafTemp - 35) / 10; // Stress above 35°C
    return Math.min(stressFactor * 30, 80); // Max 80% stress
  }

  // Calculate energy balance
  private calculateEnergyBalance(conditions: EnvironmentalConditions): number {
    // Simplified energy balance calculation
    const solarInput = conditions.ppfd * 2.5; // Convert to W m⁻²
    const convectiveOutput = (conditions.leafTemperature - conditions.airTemperature) * 25; // Simplified
    
    return solarInput - convectiveOutput;
  }

  // Calculate nitrogen use efficiency
  private calculateNitrogenUseEfficiency(netPhotosynthesis: number): number {
    // Simplified relationship between photosynthesis and nitrogen
    const leafNitrogen = 2.0; // g N m⁻² (typical value)
    return netPhotosynthesis / leafNitrogen;
  }

  // Optimize growing conditions
  public optimizeConditions(
    baseConditions: EnvironmentalConditions,
    constraints: {
      maxCO2: number;
      maxPPFD: number;
      maxTemp: number;
      energyCost: number; // $ per kWh
      co2Cost: number; // $ per kg CO2
    }
  ): PhotosynthesisOptimization {
    
    let maxPhotosynthesis = 0;
    let optimalConditions = { ...baseConditions };
    const limitingFactors: string[] = [];
    
    // Test different CO2 concentrations
    for (let co2 = 400; co2 <= constraints.maxCO2; co2 += 100) {
      // Test different light levels
      for (let ppfd = 200; ppfd <= constraints.maxPPFD; ppfd += 100) {
        // Test different temperatures
        for (let temp = 20; temp <= constraints.maxTemp; temp += 2) {
          
          const testConditions: EnvironmentalConditions = {
            ...baseConditions,
            co2Concentration: co2,
            ppfd: ppfd,
            leafTemperature: temp
          };
          
          const result = this.calculatePhotosynthesis(testConditions);
          
          if (result.netPhotosynthesis > maxPhotosynthesis) {
            maxPhotosynthesis = result.netPhotosynthesis;
            optimalConditions = {
              co2Concentration: co2,
              leafTemperature: temp,
              ppfd: ppfd,
              vpd: baseConditions.vaporPressureDeficit
            };
          }
        }
      }
    }
    
    // Analyze what's limiting at optimal conditions
    const optimalResult = this.calculatePhotosynthesis({
      ...baseConditions,
      ...optimalConditions
    });
    
    if (optimalResult.limitingFactor === 'rubisco') {
      limitingFactors.push('RuBisCO capacity (consider higher CO2 or cooler temperatures)');
    }
    if (optimalResult.limitingFactor === 'light') {
      limitingFactors.push('Light availability (consider higher PPFD)');
    }
    if (optimalResult.limitingFactor === 'tpu') {
      limitingFactors.push('Triose phosphate utilization (metabolic limitation)');
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(optimalResult, baseConditions);
    
    // Calculate cost-benefit
    const costBenefit = this.calculateCostBenefit(
      baseConditions,
      optimalConditions,
      constraints,
      maxPhotosynthesis
    );
    
    return {
      optimalConditions,
      maxPhotosynthesis,
      limitingFactors,
      recommendations,
      costBenefit
    };
  }

  private generateRecommendations(
    result: PhotosynthesisResults,
    current: EnvironmentalConditions
  ): string[] {
    
    const recommendations: string[] = [];
    
    // CO2 recommendations
    if (current.co2Concentration < 800) {
      recommendations.push(`Increase CO2 to 800-1200 ppm for ${((800/current.co2Concentration - 1) * 100).toFixed(0)}% potential increase`);
    }
    
    // Light recommendations
    if (result.limitingFactor === 'light') {
      recommendations.push('Increase PPFD to 800-1000 μmol m⁻² s⁻¹ during photoperiod');
    }
    
    // Temperature recommendations
    if (current.leafTemperature > 28) {
      recommendations.push('Reduce leaf temperature to 22-26°C for optimal enzyme activity');
    }
    
    // VPD recommendations
    if (current.vaporPressureDeficit > 1.5) {
      recommendations.push('Reduce VPD to 0.8-1.2 kPa to maintain stomatal conductance');
    }
    
    // Efficiency recommendations
    if (result.lightUseEfficiency < 0.03) {
      recommendations.push('Optimize spectrum quality with more red and blue light');
    }
    
    if (result.waterUseEfficiency < 3) {
      recommendations.push('Improve water use efficiency through better humidity control');
    }
    
    return recommendations;
  }

  private calculateCostBenefit(
    baseline: EnvironmentalConditions,
    optimal: any,
    constraints: any,
    maxPhotosynthesis: number
  ): any {
    
    // Calculate baseline photosynthesis
    const baselineResult = this.calculatePhotosynthesis(baseline);
    const yieldIncrease = ((maxPhotosynthesis - baselineResult.netPhotosynthesis) / baselineResult.netPhotosynthesis) * 100;
    
    // Calculate daily costs
    const co2Increase = Math.max(0, optimal.co2Concentration - baseline.co2Concentration);
    const co2Cost = (co2Increase / 1000000) * 1.8 * constraints.co2Cost; // kg CO2 per day
    
    const lightIncrease = Math.max(0, optimal.ppfd - baseline.ppfd);
    const lightingCost = (lightIncrease / 1000) * 12 * constraints.energyCost; // 12 hours photoperiod
    
    const tempDecrease = Math.max(0, baseline.leafTemperature - optimal.leafTemperature);
    const coolingCost = tempDecrease * 2 * constraints.energyCost; // Simplified cooling cost
    
    const totalCost = co2Cost + lightingCost + coolingCost;
    
    // Calculate ROI
    const dailyValue = yieldIncrease * 0.01; // $0.01 per % yield increase per day
    const roi = totalCost > 0 ? dailyValue / totalCost : -1;
    
    return {
      co2Cost,
      lightingCost,
      coolingCost,
      totalCost,
      yieldIncrease,
      roi: roi > 0 ? 1 / roi : -1 // Days to payback
    };
  }

  // Update model parameters (for different species/cultivars)
  public updateParameters(newParameters: Partial<PhotosynthesisParameters>): void {
    this.parameters = { ...this.parameters, ...newParameters };
  }

  // Get species-specific parameters
  public static getSpeciesParameters(species: string): PhotosynthesisParameters {
    const parameterSets: { [key: string]: PhotosynthesisParameters } = {
      'cannabis': {
        vcmax25: 120,
        jmax25: 200,
        rd25: 2.0,
        kc25: 270,
        ko25: 165,
        haVcmax: 73637,
        haJmax: 49884,
        haRd: 46390,
        haKc: 80990,
        haKo: 23720,
        hdVcmax: 149252,
        hdJmax: 152044,
        sVcmax: 485,
        sJmax: 495,
        alpha: 0.24,
        theta: 0.7,
        g0: 0.01,
        g1: 9.0,
        gm25: 0.4,
        haGm: 49600
      },
      'lettuce': {
        vcmax25: 80,
        jmax25: 160,
        rd25: 1.5,
        kc25: 270,
        ko25: 165,
        haVcmax: 73637,
        haJmax: 49884,
        haRd: 46390,
        haKc: 80990,
        haKo: 23720,
        hdVcmax: 149252,
        hdJmax: 152044,
        sVcmax: 485,
        sJmax: 495,
        alpha: 0.22,
        theta: 0.7,
        g0: 0.02,
        g1: 12.0,
        gm25: 0.3,
        haGm: 49600
      },
      'tomato': {
        vcmax25: 100,
        jmax25: 180,
        rd25: 1.8,
        kc25: 270,
        ko25: 165,
        haVcmax: 73637,
        haJmax: 49884,
        haRd: 46390,
        haKc: 80990,
        haKo: 23720,
        hdVcmax: 149252,
        hdJmax: 152044,
        sVcmax: 485,
        sJmax: 495,
        alpha: 0.26,
        theta: 0.7,
        g0: 0.015,
        g1: 8.0,
        gm25: 0.35,
        haGm: 49600
      },
      'basil': {
        vcmax25: 90,
        jmax25: 170,
        rd25: 1.6,
        kc25: 270,
        ko25: 165,
        haVcmax: 73637,
        haJmax: 49884,
        haRd: 46390,
        haKc: 80990,
        haKo: 23720,
        hdVcmax: 149252,
        hdJmax: 152044,
        sVcmax: 485,
        sJmax: 495,
        alpha: 0.23,
        theta: 0.7,
        g0: 0.02,
        g1: 10.0,
        gm25: 0.32,
        haGm: 49600
      }
    };
    
    return parameterSets[species.toLowerCase()] || parameterSets['cannabis'];
  }

  // Light response curve
  public generateLightResponseCurve(
    conditions: EnvironmentalConditions,
    maxPPFD: number = 2000
  ): { ppfd: number; photosynthesis: number; quantum_yield: number }[] {
    
    const curve: { ppfd: number; photosynthesis: number; quantum_yield: number }[] = [];
    
    for (let ppfd = 0; ppfd <= maxPPFD; ppfd += 50) {
      const testConditions = { ...conditions, ppfd };
      const result = this.calculatePhotosynthesis(testConditions);
      
      curve.push({
        ppfd,
        photosynthesis: result.netPhotosynthesis,
        quantum_yield: result.quantumYield
      });
    }
    
    return curve;
  }

  // CO2 response curve
  public generateCO2ResponseCurve(
    conditions: EnvironmentalConditions,
    maxCO2: number = 2000
  ): { co2: number; photosynthesis: number; wue: number }[] {
    
    const curve: { co2: number; photosynthesis: number; wue: number }[] = [];
    
    for (let co2 = 200; co2 <= maxCO2; co2 += 50) {
      const testConditions = { ...conditions, co2Concentration: co2 };
      const result = this.calculatePhotosynthesis(testConditions);
      
      curve.push({
        co2,
        photosynthesis: result.netPhotosynthesis,
        wue: result.waterUseEfficiency
      });
    }
    
    return curve;
  }

  // Temperature response curve
  public generateTemperatureResponseCurve(
    conditions: EnvironmentalConditions,
    minTemp: number = 15,
    maxTemp: number = 45
  ): { temperature: number; photosynthesis: number; limiting_factor: string }[] {
    
    const curve: { temperature: number; photosynthesis: number; limiting_factor: string }[] = [];
    
    for (let temp = minTemp; temp <= maxTemp; temp += 2) {
      const testConditions = { ...conditions, leafTemperature: temp };
      const result = this.calculatePhotosynthesis(testConditions);
      
      curve.push({
        temperature: temp,
        photosynthesis: result.netPhotosynthesis,
        limiting_factor: result.limitingFactor
      });
    }
    
    return curve;
  }
}