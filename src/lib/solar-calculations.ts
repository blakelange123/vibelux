// Solar irradiance calculations for greenhouse supplemental lighting

export interface SolarData {
  zipCode: string;
  latitude: number;
  longitude: number;
  annualAvgDLI: number;
  monthlyDLI: number[];
  location: string;
}

export interface GreenhouseType {
  name: string;
  transmission: number;
}

export const GREENHOUSE_TYPES: Record<string, GreenhouseType> = {
  glass: { name: 'Glass (Single Layer)', transmission: 0.85 },
  doubleGlass: { name: 'Glass (Double Layer)', transmission: 0.75 },
  polycarbonate: { name: 'Polycarbonate', transmission: 0.80 },
  polyethylene: { name: 'Polyethylene', transmission: 0.70 },
  acrylic: { name: 'Acrylic', transmission: 0.88 },
  shadecloth30: { name: 'Glass + 30% Shade', transmission: 0.60 },
  shadecloth50: { name: 'Glass + 50% Shade', transmission: 0.43 },
  shadecloth70: { name: 'Glass + 70% Shade', transmission: 0.26 }
};

// ZIP code to approximate location data
const ZIP_TO_LOCATION: Record<string, { lat: number; lng: number; city: string }> = {
  // California
  '90': { lat: 34.05, lng: -118.25, city: 'Los Angeles, CA' },
  '91': { lat: 34.14, lng: -118.15, city: 'Pasadena, CA' },
  '92': { lat: 32.72, lng: -117.16, city: 'San Diego, CA' },
  '93': { lat: 34.42, lng: -119.70, city: 'Santa Barbara, CA' },
  '94': { lat: 37.77, lng: -122.42, city: 'San Francisco, CA' },
  '95': { lat: 38.58, lng: -121.49, city: 'Sacramento, CA' },
  
  // Arizona
  '85': { lat: 33.45, lng: -112.07, city: 'Phoenix, AZ' },
  '86': { lat: 32.22, lng: -110.97, city: 'Tucson, AZ' },
  
  // Texas
  '75': { lat: 32.78, lng: -96.80, city: 'Dallas, TX' },
  '77': { lat: 29.76, lng: -95.37, city: 'Houston, TX' },
  '78': { lat: 30.27, lng: -97.74, city: 'Austin, TX' },
  
  // Florida
  '33': { lat: 25.76, lng: -80.19, city: 'Miami, FL' },
  '32': { lat: 30.33, lng: -81.66, city: 'Jacksonville, FL' },
  
  // New York
  '10': { lat: 40.71, lng: -74.01, city: 'New York, NY' },
  '11': { lat: 40.73, lng: -73.64, city: 'Long Island, NY' },
  
  // Illinois
  '60': { lat: 41.88, lng: -87.63, city: 'Chicago, IL' },
  
  // Colorado
  '80': { lat: 39.74, lng: -104.99, city: 'Denver, CO' },
  
  // Washington
  '98': { lat: 47.61, lng: -122.33, city: 'Seattle, WA' },
  
  // Oregon
  '97': { lat: 45.52, lng: -122.68, city: 'Portland, OR' },
  
  // Michigan
  '48': { lat: 42.33, lng: -83.05, city: 'Detroit, MI' },
  
  // Ohio
  '43': { lat: 39.96, lng: -83.00, city: 'Columbus, OH' },
  '44': { lat: 41.50, lng: -81.69, city: 'Cleveland, OH' },
  
  // Default
  '00': { lat: 40.0, lng: -95.0, city: 'Central US' }
};

// Calculate solar DLI based on latitude (simplified model)
function calculateDLIFromLatitude(latitude: number): number {
  // Simplified model: DLI decreases with distance from equator
  // Peak DLI at equator ~45, minimum at poles ~5
  const absLat = Math.abs(latitude);
  const baseDLI = 45;
  const latitudeFactor = 1 - (absLat / 90) * 0.85;
  
  // Seasonal variation factor (annual average)
  const annualAvg = baseDLI * latitudeFactor;
  
  // Cloud cover adjustment (simplified)
  const cloudAdjustment = 0.7; // 30% reduction for average cloud cover
  
  return annualAvg * cloudAdjustment;
}

// Get monthly DLI variation
function getMonthlyDLI(annualAvg: number, latitude: number): number[] {
  const months: number[] = [];
  const absLat = Math.abs(latitude);
  
  // Seasonal variation increases with latitude
  const seasonalVariation = absLat / 90 * 0.6; // Up to 60% variation
  
  for (let month = 0; month < 12; month++) {
    // Calculate sun angle factor for each month
    const dayOfYear = month * 30 + 15; // Approximate middle of month
    const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
    const sunAngleFactor = Math.cos((latitude - declination) * Math.PI / 180);
    
    // Apply seasonal variation
    const monthlyVariation = 1 + (sunAngleFactor - 0.5) * seasonalVariation;
    months.push(Math.max(5, annualAvg * monthlyVariation));
  }
  
  return months;
}

export async function getSolarDataForZipCode(zipCode: string): Promise<SolarData> {
  const prefix = zipCode.substring(0, 2);
  const locationData = ZIP_TO_LOCATION[prefix] || ZIP_TO_LOCATION['00'];
  
  const annualAvgDLI = calculateDLIFromLatitude(locationData.lat);
  const monthlyDLI = getMonthlyDLI(annualAvgDLI, locationData.lat);
  
  return {
    zipCode,
    latitude: locationData.lat,
    longitude: locationData.lng,
    annualAvgDLI,
    monthlyDLI,
    location: locationData.city
  };
}

export function calculateSupplementalLighting(
  targetDLI: number,
  solarDLI: number,
  greenhouseTransmission: number,
  photoperiod: number
): {
  effectiveSolarDLI: number;
  requiredSupplementalDLI: number;
  requiredPPFD: number;
  percentSolarContribution: number;
} {
  const effectiveSolarDLI = solarDLI * greenhouseTransmission;
  const requiredSupplementalDLI = Math.max(0, targetDLI - effectiveSolarDLI);
  
  // Convert DLI to PPFD: PPFD = DLI × 1,000,000 / (photoperiod × 3600)
  const requiredPPFD = Math.round((requiredSupplementalDLI * 1000000) / (photoperiod * 3600));
  
  const percentSolarContribution = targetDLI > 0 
    ? Math.round((effectiveSolarDLI / targetDLI) * 100)
    : 0;
  
  return {
    effectiveSolarDLI,
    requiredSupplementalDLI,
    requiredPPFD,
    percentSolarContribution
  };
}

// Helper function to get current month's DLI
export function getCurrentMonthDLI(monthlyDLI: number[]): number {
  const currentMonth = new Date().getMonth();
  return monthlyDLI[currentMonth];
}

// Helper function to get worst-case (winter) DLI
export function getWinterDLI(monthlyDLI: number[]): number {
  // Find minimum DLI (typically December/January in Northern Hemisphere)
  return Math.min(...monthlyDLI);
}