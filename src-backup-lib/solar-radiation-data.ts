// Regional Solar Radiation Database
// NREL data for major regions with monthly average daily solar radiation

export interface SolarRadiationData {
  region: string
  state: string
  city: string
  latitude: number
  longitude: number
  annualAverage: number // kWh/m²/day
  monthlyData: {
    january: number
    february: number
    march: number
    april: number
    may: number
    june: number
    july: number
    august: number
    september: number
    october: number
    november: number
    december: number
  }
  peakSunHours: {
    winter: number
    spring: number
    summer: number
    fall: number
  }
}

// NREL Solar Radiation Data for major US cities
export const solarRadiationDatabase: SolarRadiationData[] = [
  // West Coast
  {
    region: "West Coast",
    state: "California",
    city: "Los Angeles",
    latitude: 34.0522,
    longitude: -118.2437,
    annualAverage: 5.62,
    monthlyData: {
      january: 3.6,
      february: 4.4,
      march: 5.5,
      april: 6.5,
      may: 6.9,
      june: 7.2,
      july: 7.4,
      august: 7.0,
      september: 5.9,
      october: 4.8,
      november: 3.8,
      december: 3.3
    },
    peakSunHours: {
      winter: 3.8,
      spring: 6.3,
      summer: 7.2,
      fall: 4.8
    }
  },
  {
    region: "West Coast",
    state: "California",
    city: "San Francisco",
    latitude: 37.7749,
    longitude: -122.4194,
    annualAverage: 4.76,
    monthlyData: {
      january: 2.7,
      february: 3.6,
      march: 4.8,
      april: 6.0,
      may: 6.6,
      june: 6.9,
      july: 6.7,
      august: 6.0,
      september: 5.2,
      october: 4.0,
      november: 2.9,
      december: 2.4
    },
    peakSunHours: {
      winter: 2.9,
      spring: 5.8,
      summer: 6.5,
      fall: 4.0
    }
  },
  {
    region: "West Coast",
    state: "Oregon",
    city: "Portland",
    latitude: 45.5152,
    longitude: -122.6784,
    annualAverage: 3.72,
    monthlyData: {
      january: 1.4,
      february: 2.2,
      march: 3.3,
      april: 4.5,
      may: 5.5,
      june: 5.9,
      july: 6.7,
      august: 5.8,
      september: 4.3,
      october: 2.6,
      november: 1.5,
      december: 1.1
    },
    peakSunHours: {
      winter: 1.6,
      spring: 4.4,
      summer: 6.1,
      fall: 2.8
    }
  },
  {
    region: "West Coast",
    state: "Washington",
    city: "Seattle",
    latitude: 47.6062,
    longitude: -122.3321,
    annualAverage: 3.57,
    monthlyData: {
      january: 1.2,
      february: 2.0,
      march: 3.1,
      april: 4.3,
      may: 5.3,
      june: 5.7,
      july: 6.5,
      august: 5.6,
      september: 4.1,
      october: 2.4,
      november: 1.3,
      december: 0.9
    },
    peakSunHours: {
      winter: 1.4,
      spring: 4.2,
      summer: 5.9,
      fall: 2.6
    }
  },
  // Southwest
  {
    region: "Southwest",
    state: "Arizona",
    city: "Phoenix",
    latitude: 33.4484,
    longitude: -112.0740,
    annualAverage: 6.58,
    monthlyData: {
      january: 4.1,
      february: 5.0,
      march: 6.3,
      april: 7.8,
      may: 8.7,
      june: 8.9,
      july: 8.3,
      august: 7.6,
      september: 6.8,
      october: 5.7,
      november: 4.6,
      december: 3.8
    },
    peakSunHours: {
      winter: 4.3,
      spring: 7.6,
      summer: 8.3,
      fall: 5.7
    }
  },
  {
    region: "Southwest",
    state: "Nevada",
    city: "Las Vegas",
    latitude: 36.1699,
    longitude: -115.1398,
    annualAverage: 6.41,
    monthlyData: {
      january: 3.8,
      february: 4.9,
      march: 6.3,
      april: 7.6,
      may: 8.5,
      june: 9.0,
      july: 8.5,
      august: 7.8,
      september: 6.7,
      october: 5.4,
      november: 4.1,
      december: 3.4
    },
    peakSunHours: {
      winter: 4.0,
      spring: 7.5,
      summer: 8.4,
      fall: 5.4
    }
  },
  {
    region: "Southwest",
    state: "New Mexico",
    city: "Albuquerque",
    latitude: 35.0844,
    longitude: -106.6504,
    annualAverage: 6.21,
    monthlyData: {
      january: 3.7,
      february: 4.6,
      march: 5.8,
      april: 7.2,
      may: 8.0,
      june: 8.4,
      july: 8.0,
      august: 7.3,
      september: 6.3,
      october: 5.2,
      november: 4.1,
      december: 3.4
    },
    peakSunHours: {
      winter: 3.9,
      spring: 7.0,
      summer: 7.9,
      fall: 5.2
    }
  },
  // Mountain Region
  {
    region: "Mountain",
    state: "Colorado",
    city: "Denver",
    latitude: 39.7392,
    longitude: -104.9903,
    annualAverage: 5.23,
    monthlyData: {
      january: 3.2,
      february: 4.0,
      march: 4.9,
      april: 5.8,
      may: 6.3,
      june: 7.0,
      july: 6.8,
      august: 6.2,
      september: 5.4,
      october: 4.4,
      november: 3.4,
      december: 2.9
    },
    peakSunHours: {
      winter: 3.4,
      spring: 5.7,
      summer: 6.7,
      fall: 4.4
    }
  },
  {
    region: "Mountain",
    state: "Utah",
    city: "Salt Lake City",
    latitude: 40.7608,
    longitude: -111.8910,
    annualAverage: 5.26,
    monthlyData: {
      january: 2.8,
      february: 3.8,
      march: 5.0,
      april: 6.2,
      may: 7.2,
      june: 8.0,
      july: 7.8,
      august: 7.0,
      september: 5.8,
      october: 4.4,
      november: 3.0,
      december: 2.4
    },
    peakSunHours: {
      winter: 3.0,
      spring: 6.1,
      summer: 7.6,
      fall: 4.4
    }
  },
  // Midwest
  {
    region: "Midwest",
    state: "Illinois",
    city: "Chicago",
    latitude: 41.8781,
    longitude: -87.6298,
    annualAverage: 4.08,
    monthlyData: {
      january: 2.0,
      february: 2.8,
      march: 3.7,
      april: 4.8,
      may: 5.6,
      june: 6.1,
      july: 6.0,
      august: 5.4,
      september: 4.4,
      october: 3.2,
      november: 2.1,
      december: 1.6
    },
    peakSunHours: {
      winter: 2.1,
      spring: 4.7,
      summer: 5.8,
      fall: 3.2
    }
  },
  {
    region: "Midwest",
    state: "Wisconsin",
    city: "Milwaukee",
    latitude: 43.0389,
    longitude: -87.9065,
    annualAverage: 4.07,
    monthlyData: {
      january: 2.0,
      february: 2.9,
      march: 3.8,
      april: 4.8,
      may: 5.6,
      june: 6.0,
      july: 6.0,
      august: 5.3,
      september: 4.2,
      october: 3.0,
      november: 1.9,
      december: 1.5
    },
    peakSunHours: {
      winter: 2.1,
      spring: 4.7,
      summer: 5.8,
      fall: 3.0
    }
  },
  // South
  {
    region: "South",
    state: "Texas",
    city: "Houston",
    latitude: 29.7604,
    longitude: -95.3698,
    annualAverage: 4.92,
    monthlyData: {
      january: 3.2,
      february: 3.9,
      march: 4.6,
      april: 5.2,
      may: 5.7,
      june: 6.2,
      july: 6.3,
      august: 5.9,
      september: 5.2,
      october: 4.6,
      november: 3.6,
      december: 3.0
    },
    peakSunHours: {
      winter: 3.4,
      spring: 5.2,
      summer: 6.1,
      fall: 4.5
    }
  },
  {
    region: "South",
    state: "Florida",
    city: "Miami",
    latitude: 25.7617,
    longitude: -80.1918,
    annualAverage: 5.26,
    monthlyData: {
      january: 4.0,
      february: 4.6,
      march: 5.4,
      april: 6.0,
      may: 5.9,
      june: 5.6,
      july: 5.8,
      august: 5.6,
      september: 5.0,
      october: 4.6,
      november: 4.1,
      december: 3.7
    },
    peakSunHours: {
      winter: 4.1,
      spring: 5.8,
      summer: 5.7,
      fall: 4.6
    }
  },
  // Northeast
  {
    region: "Northeast",
    state: "New York",
    city: "New York City",
    latitude: 40.7128,
    longitude: -74.0060,
    annualAverage: 4.08,
    monthlyData: {
      january: 2.2,
      february: 3.0,
      march: 3.9,
      april: 4.8,
      may: 5.4,
      june: 5.8,
      july: 5.9,
      august: 5.3,
      september: 4.4,
      october: 3.4,
      november: 2.4,
      december: 1.9
    },
    peakSunHours: {
      winter: 2.4,
      spring: 4.7,
      summer: 5.7,
      fall: 3.4
    }
  },
  {
    region: "Northeast",
    state: "Massachusetts",
    city: "Boston",
    latitude: 42.3601,
    longitude: -71.0589,
    annualAverage: 4.01,
    monthlyData: {
      january: 2.1,
      february: 2.9,
      march: 3.8,
      april: 4.6,
      may: 5.2,
      june: 5.7,
      july: 5.8,
      august: 5.2,
      september: 4.3,
      october: 3.3,
      november: 2.3,
      december: 1.8
    },
    peakSunHours: {
      winter: 2.3,
      spring: 4.5,
      summer: 5.6,
      fall: 3.3
    }
  }
]

// Helper functions for solar radiation calculations
export function getSolarRadiationByLocation(latitude: number, longitude: number): SolarRadiationData | null {
  // Find closest location in database
  let closestLocation: SolarRadiationData | null = null
  let minDistance = Infinity

  for (const location of solarRadiationDatabase) {
    const distance = Math.sqrt(
      Math.pow(location.latitude - latitude, 2) + 
      Math.pow(location.longitude - longitude, 2)
    )
    
    if (distance < minDistance) {
      minDistance = distance
      closestLocation = location
    }
  }

  return closestLocation
}

export function getMonthlyDLIFromSolar(solarRadiation: number): number {
  // Convert solar radiation (kWh/m²/day) to DLI
  // 1 kWh/m² = 1000 W·h/m²
  // Assume 45% of solar radiation is PAR
  // 1 W PAR ≈ 4.57 μmol/s (for sunlight)
  const parFraction = 0.45
  const wattsToMicromoles = 4.57
  const hoursToSeconds = 3600
  
  return solarRadiation * 1000 * parFraction * wattsToMicromoles * hoursToSeconds / 1000000
}

export function calculateSupplementalDLI(
  targetDLI: number,
  naturalDLI: number,
  photoperiod: number
): { supplementalDLI: number; supplementalPPFD: number } {
  const supplementalDLI = Math.max(0, targetDLI - naturalDLI)
  const supplementalPPFD = supplementalDLI / (photoperiod * 0.0036)
  
  return {
    supplementalDLI,
    supplementalPPFD
  }
}

export function getSeasonFromMonth(month: number): 'winter' | 'spring' | 'summer' | 'fall' {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

export function calculateAnnualSupplementalCost(
  location: SolarRadiationData,
  targetDLI: number,
  photoperiod: number,
  fixtureWattage: number,
  electricityRate: number
): {
  annualCost: number
  monthlyCosts: Record<string, number>
  annualSupplementalDLI: number
} {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ]
  
  let annualCost = 0
  let annualSupplementalDLI = 0
  const monthlyCosts: Record<string, number> = {}
  
  months.forEach((month, index) => {
    const solarDLI = getMonthlyDLIFromSolar(location.monthlyData[month as keyof typeof location.monthlyData])
    const { supplementalDLI, supplementalPPFD } = calculateSupplementalDLI(targetDLI, solarDLI, photoperiod)
    
    // Calculate daily energy use
    const dailyEnergyKWh = (fixtureWattage * photoperiod) / 1000
    const daysInMonth = new Date(2024, index + 1, 0).getDate()
    const monthlyEnergyKWh = dailyEnergyKWh * daysInMonth * (supplementalDLI / targetDLI)
    const monthlyCost = monthlyEnergyKWh * electricityRate
    
    monthlyCosts[month] = monthlyCost
    annualCost += monthlyCost
    annualSupplementalDLI += supplementalDLI * daysInMonth
  })
  
  return {
    annualCost,
    monthlyCosts,
    annualSupplementalDLI: annualSupplementalDLI / 365
  }
}