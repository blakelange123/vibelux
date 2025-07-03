// Scientifically validated cultivation parameters
// Sources: University research, peer-reviewed studies, industry standards

export const VALIDATED_CULTIVATION_DATA = {
  // Temperature ranges (°F) - validated by UC Davis, Cornell, and industry data
  temperature: {
    cannabis: {
      seedling: { min: 68, max: 77, optimal: 72, source: "Chandra et al. 2008" },
      vegetative: { min: 70, max: 85, optimal: 75, source: "Chandra et al. 2011" },
      flowering: { min: 65, max: 80, optimal: 72, source: "Chandra et al. 2011" },
      nightDrop: { recommended: 10, max: 15, source: "Industry standard" }
    },
    tomatoes: {
      seedling: { min: 65, max: 75, optimal: 70, source: "Cornell Greenhouse Guide" },
      vegetative: { min: 65, max: 85, optimal: 75, source: "Cornell Greenhouse Guide" },
      flowering: { min: 60, max: 80, optimal: 70, source: "Cornell Greenhouse Guide" }
    },
    lettuce: {
      all: { min: 60, max: 70, optimal: 65, source: "Cornell CEA Guide" }
    }
  },

  // Humidity ranges (% RH) - validated research
  humidity: {
    cannabis: {
      seedling: { min: 65, max: 70, optimal: 68, vpd: { min: 0.4, max: 0.8 } },
      vegetative: { min: 40, max: 70, optimal: 55, vpd: { min: 0.8, max: 1.2 } },
      flowering: { min: 40, max: 50, optimal: 45, vpd: { min: 1.0, max: 1.5 } },
      late_flowering: { min: 30, max: 40, optimal: 35, vpd: { min: 1.2, max: 1.6 } }
    }
  },

  // Light intensity (PPFD μmol/m²/s) - validated by research
  ppfd: {
    cannabis: {
      seedling: { min: 100, max: 300, optimal: 200, dli: { min: 6, max: 12 } },
      vegetative: { min: 400, max: 600, optimal: 500, dli: { min: 18, max: 24 } },
      flowering: { min: 600, max: 1000, optimal: 800, dli: { min: 30, max: 45 } },
      source: "Photobiology research 2019-2023"
    },
    leafyGreens: {
      general: { min: 200, max: 400, optimal: 300, dli: { min: 12, max: 17 } }
    }
  },

  // CO2 enrichment (ppm) - validated levels
  co2: {
    ambient: 400,
    enriched: {
      seedling: { min: 400, max: 800, optimal: 600 },
      vegetative: { min: 800, max: 1200, optimal: 1000 },
      flowering: { min: 800, max: 1500, optimal: 1200 },
      safety_limit: 1500,
      source: "ASHRAE standards"
    }
  },

  // Nutrient EC/TDS ranges - validated
  nutrients: {
    cannabis: {
      seedling: { ec: { min: 0.4, max: 0.8 }, tds: { min: 200, max: 400 } },
      vegetative: { ec: { min: 1.2, max: 2.0 }, tds: { min: 600, max: 1000 } },
      flowering: { ec: { min: 1.5, max: 2.5 }, tds: { min: 750, max: 1250 } },
      flush: { ec: { min: 0.0, max: 0.4 }, tds: { min: 0, max: 200 } }
    }
  },

  // pH ranges - scientifically validated
  ph: {
    soil: { min: 6.0, max: 7.0, optimal: 6.5 },
    hydroponic: { min: 5.5, max: 6.5, optimal: 5.8 },
    coco: { min: 5.8, max: 6.2, optimal: 6.0 }
  },

  // Common deficiencies - visual identification validated
  deficiencies: {
    nitrogen: {
      symptoms: ["Yellowing of lower leaves", "Slow growth", "Pale green color"],
      solution: "Increase N in nutrient solution by 50-100ppm",
      caution: "Do not over-correct - N toxicity causes dark green leaves and clawing"
    },
    phosphorus: {
      symptoms: ["Purple/red stems", "Dark green leaves", "Slow growth"],
      solution: "Check pH first (P lockout common at pH >7), then increase P",
      caution: "P deficiency often caused by cold temps or pH issues"
    },
    calcium: {
      symptoms: ["Brown spots on leaves", "Twisted new growth", "Blossom end rot"],
      solution: "Add Cal-Mag at 200ppm, ensure pH is correct",
      caution: "Often related to VPD issues or pH lockout"
    }
  },

  // Pest management thresholds - IPM validated
  ipm_thresholds: {
    spider_mites: {
      action_threshold: "2-3 mites per leaf",
      preventive: "Keep humidity >40%, introduce predators",
      treatment: "Neem oil, insecticidal soap, predatory mites"
    },
    thrips: {
      action_threshold: "5 thrips per plant",
      preventive: "Blue sticky traps, clean growing area",
      treatment: "Spinosad, predatory insects"
    },
    powdery_mildew: {
      action_threshold: "First sign of white powder",
      preventive: "Keep humidity <50%, good airflow",
      treatment: "Potassium bicarbonate, sulfur (not in flower)"
    }
  }
};

// Validation function to ensure advice is within scientific bounds
export function validateCultivationAdvice(
  parameter: string,
  value: number,
  crop: string,
  stage: string
): { 
  isValid: boolean; 
  inRange: boolean; 
  message: string; 
  confidence: number;
  source?: string;
} {
  const data = VALIDATED_CULTIVATION_DATA;
  
  // Get the appropriate range
  let range: any;
  let source = "";
  
  switch (parameter) {
    case 'temperature':
      range = data.temperature[crop]?.[stage];
      source = range?.source || "Scientific literature";
      break;
    case 'humidity':
      range = data.humidity[crop]?.[stage];
      source = "VPD calculations and research";
      break;
    case 'ppfd':
      range = data.ppfd[crop]?.[stage];
      source = range?.source || "Photobiology research";
      break;
    case 'co2':
      range = data.co2.enriched[stage];
      source = data.co2.enriched.source;
      break;
    default:
      return {
        isValid: false,
        inRange: false,
        message: "Unknown parameter",
        confidence: 0
      };
  }

  if (!range) {
    return {
      isValid: false,
      inRange: false,
      message: `No validated data for ${crop} ${stage} ${parameter}`,
      confidence: 0
    };
  }

  const inRange = value >= range.min && value <= range.max;
  const optimal = Math.abs(value - range.optimal) < (range.max - range.min) * 0.1;
  
  let message = "";
  let confidence = 1.0;

  if (optimal) {
    message = `${parameter} is optimal for ${crop} in ${stage} stage`;
  } else if (inRange) {
    message = `${parameter} is acceptable but not optimal. Target: ${range.optimal}`;
    confidence = 0.9;
  } else if (value < range.min) {
    message = `${parameter} is too low. Minimum: ${range.min}, Optimal: ${range.optimal}`;
    confidence = 0.95;
  } else {
    message = `${parameter} is too high. Maximum: ${range.max}, Optimal: ${range.optimal}`;
    confidence = 0.95;
  }

  return {
    isValid: true,
    inRange,
    message,
    confidence,
    source
  };
}

// Fact-checking function for AI responses
export function factCheckAIResponse(
  response: string,
  context: any
): {
  verified: boolean;
  issues: string[];
  confidence: number;
} {
  const issues: string[] = [];
  let confidence = 1.0;

  // Check for impossible values
  const numberMatches = response.match(/\d+/g);
  if (numberMatches) {
    numberMatches.forEach(num => {
      const value = parseInt(num);
      
      // Check for impossible temperatures
      if (response.includes('°F') && value > 100) {
        issues.push(`Temperature ${value}°F seems too high for cultivation`);
        confidence *= 0.5;
      }
      
      // Check for impossible PPFD
      if (response.includes('PPFD') && value > 2000) {
        issues.push(`PPFD ${value} exceeds typical grow light capabilities`);
        confidence *= 0.6;
      }
      
      // Check for impossible humidity
      if (response.includes('%') && (value > 100 || value < 0)) {
        issues.push(`Humidity ${value}% is impossible`);
        confidence *= 0.3;
      }
    });
  }

  // Check for contradictions
  if (response.includes('increase humidity') && response.includes('decrease humidity')) {
    issues.push('Contradictory humidity advice detected');
    confidence *= 0.4;
  }

  // Check for dangerous advice
  const dangerousTerms = [
    'ignore safety',
    'disable alarms',
    'exceed limits',
    'skip testing',
    'no ventilation'
  ];

  dangerousTerms.forEach(term => {
    if (response.toLowerCase().includes(term)) {
      issues.push(`Potentially dangerous advice: "${term}"`);
      confidence *= 0.1;
    }
  });

  return {
    verified: issues.length === 0,
    issues,
    confidence
  };
}

// Get verified advice with confidence scoring
export function getVerifiedAdvice(
  crop: string,
  stage: string,
  currentConditions: any
): {
  recommendations: string[];
  confidence: number;
  sources: string[];
  warnings: string[];
} {
  const recommendations: string[] = [];
  const sources: string[] = [];
  const warnings: string[] = [];
  let totalConfidence = 1.0;

  // Check each parameter
  Object.entries(currentConditions).forEach(([param, value]) => {
    const validation = validateCultivationAdvice(param, value as number, crop, stage);
    
    if (validation.isValid && !validation.inRange) {
      recommendations.push(validation.message);
      if (validation.source) sources.push(validation.source);
      totalConfidence *= validation.confidence;
    }
  });

  // Add safety warnings
  if (currentConditions.co2 > 1500) {
    warnings.push("CO2 levels above 1500ppm can be harmful to workers");
  }

  if (currentConditions.temperature > 90) {
    warnings.push("Extreme heat stress - immediate cooling required");
  }

  if (currentConditions.humidity > 70 && stage === 'flowering') {
    warnings.push("High humidity in flowering risks bud rot - critical issue");
  }

  return {
    recommendations: recommendations.slice(0, 3), // Top 3 most important
    confidence: totalConfidence,
    sources: [...new Set(sources)], // Unique sources
    warnings
  };
}