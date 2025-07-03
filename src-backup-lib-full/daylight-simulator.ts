export interface SunPosition {
  azimuth: number; // degrees from north
  elevation: number; // degrees above horizon
  date: Date;
  latitude: number;
  longitude: number;
}

export interface Window {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  orientation: 'north' | 'south' | 'east' | 'west';
  transmittance: number; // 0-1
  shading: number; // 0-1 (0 = no shading, 1 = fully shaded)
}

export interface DaylightResults {
  sunPosition: SunPosition;
  directSunlight: number; // W/m²
  diffuseSkylight: number; // W/m²
  globalIrradiance: number; // W/m²
  ppfd: number; // μmol/m²/s
  dli: number; // mol/m²/day
  contributionMap: Map<string, number>; // Window ID to contribution %
}

export class DaylightSimulator {
  // Solar constant
  private static readonly SOLAR_CONSTANT = 1361; // W/m²
  
  // Conversion factors
  private static readonly SUNLIGHT_TO_PPFD = 2.1; // μmol/m²/s per W/m²
  private static readonly LUX_TO_PPFD = 0.02; // Approximate for sunlight
  
  static calculateSunPosition(
    date: Date,
    latitude: number,
    longitude: number,
    timezone: number = 0
  ): SunPosition {
    // Calculate Julian day
    const julianDay = this.getJulianDay(date);
    
    // Calculate equation of time
    const equationOfTime = this.getEquationOfTime(julianDay);
    
    // Calculate solar declination
    const declination = this.getSolarDeclination(julianDay);
    
    // Calculate hour angle
    const solarTime = this.getSolarTime(date, longitude, timezone, equationOfTime);
    const hourAngle = 15 * (solarTime - 12); // degrees
    
    // Calculate elevation (altitude)
    const latRad = latitude * Math.PI / 180;
    const decRad = declination * Math.PI / 180;
    const hourRad = hourAngle * Math.PI / 180;
    
    const elevation = Math.asin(
      Math.sin(latRad) * Math.sin(decRad) +
      Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourRad)
    ) * 180 / Math.PI;
    
    // Calculate azimuth
    const azimuthRad = Math.atan2(
      Math.sin(hourRad),
      Math.cos(hourRad) * Math.sin(latRad) - Math.tan(decRad) * Math.cos(latRad)
    );
    
    let azimuth = azimuthRad * 180 / Math.PI + 180; // Convert to degrees from north
    if (azimuth > 360) azimuth -= 360;
    
    return {
      azimuth,
      elevation,
      date,
      latitude,
      longitude
    };
  }
  
  static calculateDaylight(
    sunPosition: SunPosition,
    windows: Window[],
    roomDimensions: { width: number; length: number; height: number },
    calculationPoint: { x: number; y: number; z: number },
    cloudCover: number = 0 // 0-1 (0 = clear, 1 = overcast)
  ): DaylightResults {
    // Calculate direct normal irradiance (DNI)
    const dni = this.calculateDNI(sunPosition.elevation, cloudCover);
    
    // Calculate diffuse horizontal irradiance (DHI)
    const dhi = this.calculateDHI(sunPosition.elevation, cloudCover);
    
    // Calculate global horizontal irradiance (GHI)
    const ghi = dni * Math.sin(sunPosition.elevation * Math.PI / 180) + dhi;
    
    // Calculate contributions from each window
    const contributionMap = new Map<string, number>();
    let totalDirectLight = 0;
    let totalDiffuseLight = 0;
    
    windows.forEach(window => {
      const { direct, diffuse } = this.calculateWindowContribution(
        window,
        sunPosition,
        calculationPoint,
        dni,
        dhi
      );
      
      totalDirectLight += direct;
      totalDiffuseLight += diffuse;
      
      const totalContribution = direct + diffuse;
      contributionMap.set(window.id, totalContribution);
    });
    
    const totalLight = totalDirectLight + totalDiffuseLight;
    
    // Convert to PPFD
    const ppfd = totalLight * this.SUNLIGHT_TO_PPFD;
    
    // Calculate DLI for the day
    const dli = this.calculateDailyDLI(
      sunPosition.latitude,
      sunPosition.longitude,
      sunPosition.date,
      windows,
      calculationPoint,
      cloudCover
    );
    
    return {
      sunPosition,
      directSunlight: totalDirectLight,
      diffuseSkylight: totalDiffuseLight,
      globalIrradiance: totalLight,
      ppfd,
      dli,
      contributionMap
    };
  }
  
  private static calculateWindowContribution(
    window: Window,
    sunPosition: SunPosition,
    point: { x: number; y: number; z: number },
    dni: number,
    dhi: number
  ): { direct: number; diffuse: number } {
    // Calculate view factor from point to window
    const viewFactor = this.calculateViewFactor(window, point);
    
    // Calculate direct sunlight through window
    let directComponent = 0;
    if (this.isSunlightThroughWindow(window, sunPosition)) {
      const sunAngle = this.getSunAngleToWindow(window, sunPosition);
      const cosineFactor = Math.max(0, Math.cos(sunAngle * Math.PI / 180));
      directComponent = dni * cosineFactor * window.transmittance * (1 - window.shading) * viewFactor;
    }
    
    // Calculate diffuse skylight through window
    const diffuseComponent = dhi * window.transmittance * viewFactor * 0.5; // Sky view factor
    
    return {
      direct: directComponent,
      diffuse: diffuseComponent
    };
  }
  
  private static calculateViewFactor(
    window: Window,
    point: { x: number; y: number; z: number }
  ): number {
    // Simplified view factor calculation
    const dx = window.x - point.x;
    const dy = window.y - point.y;
    const dz = window.z - point.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance === 0) return 0;
    
    // Approximate view factor based on solid angle
    const windowArea = window.width * window.height;
    const solidAngle = windowArea / (distance * distance);
    
    return Math.min(1, solidAngle / (4 * Math.PI));
  }
  
  private static isSunlightThroughWindow(window: Window, sunPosition: SunPosition): boolean {
    // Check if sun is above horizon
    if (sunPosition.elevation <= 0) return false;
    
    // Check if sun is on the correct side of the building
    const windowAzimuth = {
      'north': 0,
      'south': 180,
      'east': 90,
      'west': 270
    }[window.orientation];
    
    const azimuthDiff = Math.abs(sunPosition.azimuth - windowAzimuth);
    return azimuthDiff < 90 || azimuthDiff > 270;
  }
  
  private static getSunAngleToWindow(window: Window, sunPosition: SunPosition): number {
    const windowAzimuth = {
      'north': 0,
      'south': 180,
      'east': 90,
      'west': 270
    }[window.orientation];
    
    const azimuthDiff = Math.abs(sunPosition.azimuth - windowAzimuth);
    const elevationAngle = 90 - sunPosition.elevation;
    
    // Calculate incident angle using spherical trigonometry
    return Math.acos(
      Math.cos(elevationAngle * Math.PI / 180) * 
      Math.cos(azimuthDiff * Math.PI / 180)
    ) * 180 / Math.PI;
  }
  
  private static calculateDNI(elevation: number, cloudCover: number): number {
    if (elevation <= 0) return 0;
    
    // Clear sky model (simplified)
    const airMass = 1 / Math.sin(Math.max(0.1, elevation) * Math.PI / 180);
    const clearSkyDNI = this.SOLAR_CONSTANT * Math.exp(-0.14 * airMass);
    
    // Apply cloud cover reduction
    return clearSkyDNI * (1 - cloudCover * 0.75);
  }
  
  private static calculateDHI(elevation: number, cloudCover: number): number {
    if (elevation <= 0) return 0;
    
    // Diffuse radiation increases with cloud cover
    const clearSkyDHI = 0.1 * this.SOLAR_CONSTANT * Math.sin(elevation * Math.PI / 180);
    const overcastDHI = 0.3 * this.SOLAR_CONSTANT;
    
    return clearSkyDHI * (1 - cloudCover) + overcastDHI * cloudCover;
  }
  
  private static calculateDailyDLI(
    latitude: number,
    longitude: number,
    date: Date,
    windows: Window[],
    point: { x: number; y: number; z: number },
    cloudCover: number
  ): number {
    let totalPPFD = 0;
    const samplesPerHour = 4;
    const hoursToSample = 24;
    
    for (let hour = 0; hour < hoursToSample; hour++) {
      for (let sample = 0; sample < samplesPerHour; sample++) {
        const sampleTime = new Date(date);
        sampleTime.setHours(hour, sample * (60 / samplesPerHour), 0, 0);
        
        const sunPos = this.calculateSunPosition(sampleTime, latitude, longitude);
        
        if (sunPos.elevation > 0) {
          const daylight = this.calculateDaylight(
            sunPos,
            windows,
            { width: 10, length: 10, height: 3 }, // Room dimensions
            point,
            cloudCover
          );
          
          totalPPFD += daylight.ppfd;
        }
      }
    }
    
    // Convert to DLI: μmol/m²/s to mol/m²/day
    const secondsPerSample = 3600 / samplesPerHour;
    const totalSeconds = totalPPFD * secondsPerSample;
    return totalSeconds / 1000000;
  }
  
  // Helper methods
  private static getJulianDay(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
           Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }
  
  private static getEquationOfTime(julianDay: number): number {
    const n = julianDay - 2451545;
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
    
    return 4 * (L - 0.0057183 - Math.atan2(
      Math.tan((L * Math.PI / 180 - 0.0053 * Math.sin(g) - 0.0069 * Math.sin(2 * g))),
      1
    ) * 180 / Math.PI);
  }
  
  private static getSolarDeclination(julianDay: number): number {
    const n = julianDay - 2451545;
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
    
    const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
    return Math.asin(Math.sin(lambda) * Math.sin(23.439 * Math.PI / 180)) * 180 / Math.PI;
  }
  
  private static getSolarTime(
    date: Date,
    longitude: number,
    timezone: number,
    equationOfTime: number
  ): number {
    const localTime = date.getHours() + date.getMinutes() / 60;
    const timeDiff = (longitude / 15) - timezone;
    
    return localTime + timeDiff + equationOfTime / 60;
  }
}