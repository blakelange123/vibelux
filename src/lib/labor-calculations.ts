// Labor calculation utilities for different crop types and automation levels

export interface LaborBenchmark {
  cropType: string;
  sqFtPerFTE: number;
  annualSalary: number;
  tasksPerDay: {
    propagation?: number;
    transplanting?: number;
    maintenance?: number;
    harvest?: number;
    packaging?: number;
    cleaning?: number;
  };
  automationFactors: {
    seeding?: number;      // 0-1, where 1 = fully automated
    transplanting?: number;
    watering?: number;
    harvesting?: number;
    packaging?: number;
  };
}

export const laborBenchmarks: LaborBenchmark[] = [
  {
    cropType: 'Leafy Greens',
    sqFtPerFTE: 8000,
    annualSalary: 50000,
    tasksPerDay: {
      propagation: 1.5,
      transplanting: 2.0,
      maintenance: 1.5,
      harvest: 3.0,
      packaging: 2.0,
      cleaning: 1.0
    },
    automationFactors: {
      seeding: 0.8,
      transplanting: 0.6,
      watering: 0.9,
      harvesting: 0.5,
      packaging: 0.7
    }
  },
  {
    cropType: 'Herbs',
    sqFtPerFTE: 6000,
    annualSalary: 55000,
    tasksPerDay: {
      propagation: 2.0,
      transplanting: 2.5,
      maintenance: 2.0,
      harvest: 4.0,
      packaging: 2.5,
      cleaning: 1.0
    },
    automationFactors: {
      seeding: 0.7,
      transplanting: 0.5,
      watering: 0.9,
      harvesting: 0.3,
      packaging: 0.6
    }
  },
  {
    cropType: 'Vine Crops',
    sqFtPerFTE: 4000,
    annualSalary: 65000,
    tasksPerDay: {
      propagation: 2.0,
      transplanting: 3.0,
      maintenance: 3.5,
      harvest: 5.0,
      packaging: 3.0,
      cleaning: 1.5
    },
    automationFactors: {
      seeding: 0.6,
      transplanting: 0.4,
      watering: 0.8,
      harvesting: 0.2,
      packaging: 0.5
    }
  },
  {
    cropType: 'Cannabis',
    sqFtPerFTE: 5000,
    annualSalary: 60000,
    tasksPerDay: {
      propagation: 7.4,
      transplanting: 3.0,
      maintenance: 3.8,
      harvest: 14.6,
      packaging: 8.4,
      cleaning: 2.0
    },
    automationFactors: {
      seeding: 0.5,
      transplanting: 0.3,
      watering: 0.7,
      harvesting: 0.1,
      packaging: 0.4
    }
  },
  {
    cropType: 'Microgreens',
    sqFtPerFTE: 10000,
    annualSalary: 45000,
    tasksPerDay: {
      propagation: 2.0,
      maintenance: 1.0,
      harvest: 3.0,
      packaging: 2.0,
      cleaning: 2.0
    },
    automationFactors: {
      seeding: 0.9,
      watering: 0.9,
      harvesting: 0.6,
      packaging: 0.8
    }
  },
  {
    cropType: 'Mushrooms',
    sqFtPerFTE: 3000,
    annualSalary: 55000,
    tasksPerDay: {
      propagation: 3.0,
      maintenance: 4.0,
      harvest: 5.0,
      packaging: 3.0,
      cleaning: 3.0
    },
    automationFactors: {
      seeding: 0.4,
      watering: 0.8,
      harvesting: 0.2,
      packaging: 0.5
    }
  }
];

export interface LaborCalculationParams {
  cropType: string;
  canopyArea: number;
  automationLevel: 'low' | 'medium' | 'high';
  localWageMultiplier?: number; // Adjust for local wage differences
  shifts?: 1 | 2 | 3; // Number of shifts per day
  overtimePercent?: number; // Percentage of overtime expected
}

export function calculateLaborCosts(params: LaborCalculationParams) {
  const {
    cropType,
    canopyArea,
    automationLevel = 'medium',
    localWageMultiplier = 1.0,
    shifts = 1,
    overtimePercent = 0.1
  } = params;

  // Find the benchmark for this crop type
  const benchmark = laborBenchmarks.find(b => b.cropType === cropType) || laborBenchmarks[0];

  // Adjust for automation level
  const automationMultiplier = {
    low: 1.2,    // Need more labor
    medium: 1.0, // Standard
    high: 0.7    // Need less labor
  }[automationLevel];

  // Calculate base FTEs needed
  const baseFTEs = (canopyArea / benchmark.sqFtPerFTE) * automationMultiplier;
  
  // Adjust for shifts (more shifts = more supervisors/overlap)
  const shiftMultiplier = shifts === 1 ? 1.0 : shifts === 2 ? 1.15 : 1.3;
  const adjustedFTEs = Math.ceil(baseFTEs * shiftMultiplier);

  // Calculate base annual cost
  const baseAnnualCost = adjustedFTEs * benchmark.annualSalary * localWageMultiplier;
  
  // Add benefits and overhead (typically 30-40% of salary)
  const benefitsMultiplier = 1.35;
  
  // Add overtime costs
  const overtimeCost = baseAnnualCost * overtimePercent * 0.5; // Overtime is 1.5x, so 0.5x extra
  
  // Total annual labor cost
  const totalAnnualCost = (baseAnnualCost * benefitsMultiplier) + overtimeCost;

  // Calculate productivity metrics
  const laborHoursPerYear = adjustedFTEs * 2080; // Standard work year
  const laborCostPerSqFt = totalAnnualCost / canopyArea;
  
  // Estimate daily task distribution
  const dailyTasks = Object.entries(benchmark.tasksPerDay).reduce((acc, [task, hours]) => {
    // Apply automation factors if available
    const automationFactor = benchmark.automationFactors[task as keyof typeof benchmark.automationFactors] || 1;
    const adjustedHours = hours * (1 - (automationFactor * (automationLevel === 'high' ? 0.8 : automationLevel === 'medium' ? 0.5 : 0.2)));
    acc[task] = adjustedHours;
    return acc;
  }, {} as Record<string, number>);

  return {
    fteRequired: adjustedFTEs,
    annualLaborCost: Math.round(totalAnnualCost),
    hourlyRate: Math.round((benchmark.annualSalary * localWageMultiplier) / 2080),
    laborCostPerSqFt: Number(laborCostPerSqFt.toFixed(2)),
    laborHoursPerYear,
    dailyTaskHours: dailyTasks,
    breakdown: {
      baseSalaries: Math.round(baseAnnualCost),
      benefitsAndOverhead: Math.round(baseAnnualCost * (benefitsMultiplier - 1)),
      overtime: Math.round(overtimeCost),
      perFTE: Math.round(totalAnnualCost / adjustedFTEs)
    }
  };
}

// Helper function to get labor cost estimate for quick calculations
export function getQuickLaborEstimate(cropType: string, canopyArea: number): number {
  const benchmark = laborBenchmarks.find(b => b.cropType === cropType) || laborBenchmarks[0];
  const ftes = Math.ceil(canopyArea / benchmark.sqFtPerFTE);
  return ftes * benchmark.annualSalary * 1.35; // Include benefits
}

// Calculate labor efficiency metrics
export function calculateLaborEfficiency(
  actualLaborCost: number,
  canopyArea: number,
  yieldPerSqFt: number,
  cropType: string
) {
  const benchmark = laborBenchmarks.find(b => b.cropType === cropType) || laborBenchmarks[0];
  const expectedCost = getQuickLaborEstimate(cropType, canopyArea);
  
  return {
    costPerSqFt: actualLaborCost / canopyArea,
    costPerPound: actualLaborCost / (canopyArea * yieldPerSqFt),
    efficiencyRatio: expectedCost / actualLaborCost, // >1 means more efficient than benchmark
    benchmarkCostPerSqFt: expectedCost / canopyArea,
    savingsOpportunity: Math.max(0, actualLaborCost - expectedCost)
  };
}