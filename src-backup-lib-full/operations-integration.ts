// Operations Integration Service
// Connects operational data with environmental monitoring systems

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  co2: number;
  vpd: number;
  lightIntensity: number;
  ph?: number;
  ec?: number;
  waterTemp?: number;
}

interface OperationalTrigger {
  id: string;
  parameter: string;
  condition: 'above' | 'below' | 'equals' | 'change';
  threshold: number;
  action: 'create_task' | 'send_alert' | 'adjust_setpoint' | 'log_event';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface TaskCreationData {
  title: string;
  description: string;
  type: 'lighting' | 'irrigation' | 'maintenance' | 'harvest' | 'ipm';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: number;
  room: string;
  environmentalTrigger: {
    parameter: string;
    condition: string;
    value: number;
  };
}

// Environmental triggers that create operational tasks
export const ENVIRONMENTAL_TRIGGERS: OperationalTrigger[] = [
  // Temperature triggers
  {
    id: 'high-temp',
    parameter: 'temperature',
    condition: 'above',
    threshold: 85,
    action: 'create_task',
    priority: 'high',
    description: 'Check HVAC system and adjust cooling'
  },
  {
    id: 'low-temp',
    parameter: 'temperature',
    condition: 'below',
    threshold: 65,
    action: 'create_task',
    priority: 'high',
    description: 'Check heating system'
  },
  
  // Humidity triggers
  {
    id: 'high-humidity',
    parameter: 'humidity',
    condition: 'above',
    threshold: 70,
    action: 'create_task',
    priority: 'critical',
    description: 'Increase dehumidification to prevent mold'
  },
  {
    id: 'low-humidity',
    parameter: 'humidity',
    condition: 'below',
    threshold: 40,
    action: 'create_task',
    priority: 'medium',
    description: 'Check humidification system'
  },
  
  // VPD triggers
  {
    id: 'vpd-out-of-range',
    parameter: 'vpd',
    condition: 'above',
    threshold: 1.5,
    action: 'send_alert',
    priority: 'high',
    description: 'VPD outside optimal range'
  },
  
  // pH triggers
  {
    id: 'ph-drift',
    parameter: 'ph',
    condition: 'change',
    threshold: 0.3,
    action: 'create_task',
    priority: 'critical',
    description: 'Check pH dosing system'
  },
  
  // EC triggers
  {
    id: 'ec-high',
    parameter: 'ec',
    condition: 'above',
    threshold: 3.0,
    action: 'create_task',
    priority: 'high',
    description: 'Dilute nutrient solution'
  },
  
  // Light intensity triggers
  {
    id: 'low-light',
    parameter: 'lightIntensity',
    condition: 'below',
    threshold: 600,
    action: 'create_task',
    priority: 'medium',
    description: 'Check light fixtures and clean if needed'
  }
];

// Analyze environmental data and generate operational insights
export function analyzeEnvironmentalImpact(
  envData: EnvironmentalData,
  historicalData: EnvironmentalData[]
): {
  triggers: OperationalTrigger[];
  recommendations: string[];
  riskScore: number;
} {
  const triggeredActions: OperationalTrigger[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;

  // Check each trigger condition
  ENVIRONMENTAL_TRIGGERS.forEach(trigger => {
    const currentValue = envData[trigger.parameter as keyof EnvironmentalData];
    
    if (currentValue !== undefined) {
      let triggered = false;
      
      switch (trigger.condition) {
        case 'above':
          triggered = currentValue > trigger.threshold;
          break;
        case 'below':
          triggered = currentValue < trigger.threshold;
          break;
        case 'equals':
          triggered = Math.abs(currentValue - trigger.threshold) < 0.1;
          break;
        case 'change':
          // Compare with last historical value
          if (historicalData.length > 0) {
            const lastValue = historicalData[historicalData.length - 1][trigger.parameter as keyof EnvironmentalData];
            if (lastValue !== undefined) {
              triggered = Math.abs(currentValue - lastValue) > trigger.threshold;
            }
          }
          break;
      }
      
      if (triggered) {
        triggeredActions.push(trigger);
        // Increase risk score based on priority
        switch (trigger.priority) {
          case 'critical': riskScore += 30; break;
          case 'high': riskScore += 20; break;
          case 'medium': riskScore += 10; break;
          case 'low': riskScore += 5; break;
        }
      }
    }
  });

  // Generate recommendations based on patterns
  if (envData.temperature > 80 && envData.humidity > 60) {
    recommendations.push('High temperature and humidity combination increases disease risk. Consider increasing air circulation.');
  }

  if (envData.vpd && (envData.vpd < 0.8 || envData.vpd > 1.2)) {
    recommendations.push('VPD is outside optimal range. Adjust temperature and humidity to improve transpiration.');
  }

  if (envData.co2 < 800 && envData.lightIntensity > 700) {
    recommendations.push('CO2 levels may be limiting photosynthesis at current light levels. Consider CO2 supplementation.');
  }

  return {
    triggers: triggeredActions,
    recommendations,
    riskScore: Math.min(100, riskScore)
  };
}

// Calculate operational efficiency based on environmental stability
export function calculateOperationalEfficiency(
  environmentalData: EnvironmentalData[],
  targetSetpoints: Partial<EnvironmentalData>
): {
  efficiency: number;
  deviations: { parameter: string; deviation: number }[];
} {
  if (environmentalData.length === 0) {
    return { efficiency: 0, deviations: [] };
  }

  const deviations: { parameter: string; deviation: number }[] = [];
  let totalDeviation = 0;
  let parameterCount = 0;

  // Calculate average values
  const averages: Partial<EnvironmentalData> = {};
  Object.keys(targetSetpoints).forEach(key => {
    const values = environmentalData
      .map(d => d[key as keyof EnvironmentalData])
      .filter(v => v !== undefined) as number[];
    
    if (values.length > 0) {
      averages[key as keyof EnvironmentalData] = values.reduce((a, b) => a + b, 0) / values.length;
    }
  });

  // Calculate deviations from targets
  Object.entries(targetSetpoints).forEach(([key, target]) => {
    const avg = averages[key as keyof EnvironmentalData];
    if (avg !== undefined && target !== undefined) {
      const deviation = Math.abs((avg - target) / target) * 100;
      deviations.push({ parameter: key, deviation });
      totalDeviation += deviation;
      parameterCount++;
    }
  });

  const efficiency = parameterCount > 0 
    ? Math.max(0, 100 - (totalDeviation / parameterCount))
    : 100;

  return { efficiency, deviations };
}

// Generate predictive alerts based on trends
export function generatePredictiveAlerts(
  currentData: EnvironmentalData,
  historicalData: EnvironmentalData[],
  timeHorizon: number = 24 // hours
): {
  alerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    probability: number;
    preventiveActions: string[];
  }>;
} {
  const alerts: any[] = [];

  // Simple trend analysis (in production, use more sophisticated ML models)
  if (historicalData.length >= 3) {
    // Temperature trend
    const tempTrend = calculateTrend(historicalData.map(d => d.temperature));
    if (tempTrend > 0.5 && currentData.temperature > 75) {
      alerts.push({
        type: 'temperature',
        severity: 'high',
        message: 'Temperature rising trend detected',
        probability: Math.min(95, 60 + tempTrend * 10),
        preventiveActions: [
          'Check HVAC system efficiency',
          'Verify all exhaust fans are operational',
          'Consider reducing light intensity temporarily'
        ]
      });
    }

    // Humidity trend
    const humidityTrend = calculateTrend(historicalData.map(d => d.humidity));
    if (humidityTrend > 0.3 && currentData.humidity > 55) {
      alerts.push({
        type: 'humidity',
        severity: 'critical',
        message: 'Rising humidity may lead to mold/mildew issues',
        probability: Math.min(90, 70 + humidityTrend * 10),
        preventiveActions: [
          'Increase dehumidification capacity',
          'Check for water leaks',
          'Improve air circulation in dense canopy areas'
        ]
      });
    }
  }

  return { alerts };
}

// Helper function to calculate trend
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  
  let trend = 0;
  for (let i = 1; i < values.length; i++) {
    trend += (values[i] - values[i - 1]);
  }
  return trend / (values.length - 1);
}

// Create operational task from environmental trigger
export function createTaskFromTrigger(
  trigger: OperationalTrigger,
  envData: EnvironmentalData,
  room: string
): TaskCreationData {
  return {
    title: `${trigger.description} - ${room}`,
    description: `Automated task created due to ${trigger.parameter} ${trigger.condition} ${trigger.threshold}. Current value: ${envData[trigger.parameter as keyof EnvironmentalData]}`,
    type: determineTaskType(trigger.parameter),
    priority: trigger.priority,
    estimatedTime: estimateTaskDuration(trigger),
    room,
    environmentalTrigger: {
      parameter: trigger.parameter,
      condition: trigger.condition,
      value: envData[trigger.parameter as keyof EnvironmentalData] as number
    }
  };
}

// Helper functions
function determineTaskType(parameter: string): TaskCreationData['type'] {
  switch (parameter) {
    case 'temperature':
    case 'humidity':
    case 'co2':
      return 'maintenance';
    case 'ph':
    case 'ec':
      return 'irrigation';
    case 'lightIntensity':
      return 'lighting';
    default:
      return 'maintenance';
  }
}

function estimateTaskDuration(trigger: OperationalTrigger): number {
  switch (trigger.priority) {
    case 'critical': return 30;
    case 'high': return 20;
    case 'medium': return 15;
    case 'low': return 10;
    default: return 15;
  }
}

// Export integration functions
export const OperationsIntegration = {
  analyzeEnvironmentalImpact,
  calculateOperationalEfficiency,
  generatePredictiveAlerts,
  createTaskFromTrigger,
  ENVIRONMENTAL_TRIGGERS
};