// Operations Metrics & KPIs

export interface OperationsMetrics {
  // OTIF (On-Time In-Full) Metrics
  otif: {
    score: number; // percentage
    onTimeDeliveries: number;
    inFullDeliveries: number;
    totalOrders: number;
    trend: TrendData[];
  };

  // Yield Metrics
  yield: {
    currentYield: number; // g/m²/day
    targetYield: number;
    yieldEfficiency: number; // percentage
    yieldByStrain: Record<string, YieldData>;
    yieldTrend: TrendData[];
    predictedYield: number;
    varianceFromTarget: number;
  };

  // Quality Metrics
  quality: {
    firstPassYield: number; // percentage
    defectRate: number;
    qualityScore: number;
    rejectionRate: number;
    customerComplaints: number;
    qualityByStage: Record<string, QualityData>;
    pathogenDetections: number;
    passedInspections: number;
  };

  // Inventory Metrics
  inventory: {
    turnoverRate: number;
    stockAccuracy: number; // percentage
    nutrientLevels: NutrientInventory;
    seedInventory: SeedInventory;
    suppliesOnHand: number; // days
    wastageRate: number;
    cycleCountAccuracy: number;
  };

  // Labor Metrics
  labor: {
    productivity: number; // units per hour
    efficiency: number; // percentage
    utilizationRate: number;
    overtimeHours: number;
    trainingCompliance: number;
    laborCostPerUnit: number;
    tasksPerEmployee: number;
  };

  // Production Metrics
  production: {
    throughput: number; // units per day
    cycleTime: number; // days
    capacityUtilization: number; // percentage
    downtime: number; // hours
    oee: number; // Overall Equipment Effectiveness
    batchSuccessRate: number;
    harvestEfficiency: number;
  };

  // Environmental Metrics
  environmental: {
    energyEfficiency: number; // kWh per kg
    waterUsage: number; // L per kg
    co2Efficiency: number;
    temperatureStability: number;
    humidityStability: number;
    lightingEfficiency: number; // µmol/J
    hvacPerformance: number;
  };

  // Financial Metrics
  financial: {
    costPerUnit: number;
    revenuePerSqFt: number;
    grossMargin: number;
    operatingMargin: number;
    roi: number;
    paybackPeriod: number;
    customerAcquisitionCost: number;
  };

  // Compliance Metrics
  compliance: {
    regulatoryScore: number;
    auditPassRate: number;
    documentationCompliance: number;
    trainingCompliance: number;
    incidentRate: number;
    correctiveActionClosure: number;
  };

  // Innovation Metrics
  innovation: {
    r2dCycleTime: number; // R&D to production
    experimentsActive: number;
    successfulTrials: number;
    newStrainsIntroduced: number;
    processImprovements: number;
    patentApplications: number;
  };
}

export interface YieldData {
  strain: string;
  currentYield: number;
  historicalAverage: number;
  bestYield: number;
  growCycles: number;
  consistency: number; // CV%
}

export interface QualityData {
  stage: string;
  defects: number;
  passRate: number;
  commonIssues: string[];
}

export interface NutrientInventory {
  nitrogen: InventoryItem;
  phosphorus: InventoryItem;
  potassium: InventoryItem;
  calcium: InventoryItem;
  magnesium: InventoryItem;
  micronutrients: Record<string, InventoryItem>;
  stockTanks: StockTank[];
}

export interface SeedInventory {
  totalVarieties: number;
  totalSeeds: number;
  byStrain: Record<string, SeedStock>;
  germinationRates: Record<string, number>;
  seedAge: Record<string, Date>;
}

export interface InventoryItem {
  quantity: number;
  unit: string;
  reorderPoint: number;
  maxStock: number;
  supplier: string;
  lastOrdered: Date;
  nextDelivery?: Date;
  cost: number;
}

export interface StockTank {
  id: string;
  capacity: number;
  currentVolume: number;
  recipe: string;
  ec: number;
  ph: number;
  lastRefill: Date;
  nextRefillDue: Date;
}

export interface SeedStock {
  quantity: number;
  lotNumber: string;
  supplier: string;
  receivedDate: Date;
  testedGermination: number;
  viability: number;
  storage: string;
}

export interface TrendData {
  date: Date;
  value: number;
  target?: number;
}

// Operational Excellence Metrics
export interface OperationalExcellence {
  lean: {
    wasteReduction: number;
    valueStreamEfficiency: number;
    pullSystemAdherence: number;
    continuousFlowRate: number;
    setupTimeReduction: number;
  };
  
  sixSigma: {
    dpmo: number; // Defects per million opportunities
    sigmaLevel: number;
    processCapability: number;
    yieldRate: number;
    rtfr: number; // Right First Time Rate
  };

  fiveS: {
    sortCompliance: number;
    setInOrderScore: number;
    shineScore: number;
    standardizeAdherence: number;
    sustainScore: number;
    overallScore: number;
  };
}

// Advanced Analytics
export interface PredictiveAnalytics {
  yieldPrediction: {
    nextHarvest: number;
    confidence: number;
    factors: Factor[];
  };
  
  diseaseRisk: {
    probability: number;
    riskFactors: string[];
    preventiveMeasures: string[];
  };
  
  demandForecast: {
    nextWeek: number;
    nextMonth: number;
    seasonalTrend: number;
    accuracy: number;
  };
  
  maintenancePrediction: {
    equipmentHealth: Record<string, number>;
    failureRisk: Record<string, number>;
    scheduledMaintenance: MaintenanceItem[];
  };
}

export interface Factor {
  name: string;
  impact: number; // -100 to 100
  current: number;
  optimal: number;
}

export interface MaintenanceItem {
  equipment: string;
  dueDate: Date;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedDowntime: number;
}

// Real-time Monitoring
export interface RealTimeMonitoring {
  alerts: Alert[];
  systemHealth: SystemHealth;
  productionStatus: ProductionStatus;
  environmentalStatus: EnvironmentalStatus;
}

export interface Alert {
  id: string;
  type: 'Critical' | 'Warning' | 'Info';
  category: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface SystemHealth {
  overall: number; // percentage
  irrigation: number;
  lighting: number;
  hvac: number;
  automation: number;
  sensors: number;
}

export interface ProductionStatus {
  activeBatches: number;
  plantsInProduction: number;
  harvestingToday: number;
  packagingQueue: number;
  ordersInProgress: number;
}

export interface EnvironmentalStatus {
  zones: Record<string, ZoneStatus>;
  deviations: Deviation[];
  stability: number; // percentage
}

export interface ZoneStatus {
  temperature: number;
  humidity: number;
  co2: number;
  vpd: number;
  ppfd: number;
  inSpec: boolean;
}

export interface Deviation {
  parameter: string;
  zone: string;
  actual: number;
  target: number;
  duration: number; // minutes
  severity: 'Low' | 'Medium' | 'High';
}