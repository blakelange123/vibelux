/**
 * Professional IES Photometric File Parser
 * Supports IES LM-63-02 and LM-63-95 formats
 * Full luminous intensity distribution processing
 */

export interface IESData {
  // Header information
  header: {
    version: string;
    manufacturer: string;
    catalogNumber: string;
    luminaire: string;
    lamp: string;
    dateCreated: string;
    keywords: string[];
  };
  
  // Photometric data
  photometry: {
    // Standard parameters
    numberLamps: number;
    lumensPerLamp: number;
    candlelaMultiplier: number;
    numberVerticalAngles: number;
    numberHorizontalAngles: number;
    photometricType: number; // 1=Type C, 2=Type B, 3=Type A
    unitsType: number; // 1=feet, 2=meters
    luminaireWidth: number;
    luminaireLength: number;
    luminaireHeight: number;
    
    // Ballast information
    ballastFactor: number;
    ballastDescription: string;
    inputWatts: number;
    
    // Angular data
    verticalAngles: number[];
    horizontalAngles: number[];
    candelaValues: number[][]; // [vertical][horizontal]
    
    // Calculated properties
    totalLumens: number;
    efficacy: number; // lumens per watt
    maxCandela: number;
    meanCandela: number;
    
    // Distribution characteristics
    beamAngle: number; // 50% intensity cone
    fieldAngle: number; // 10% intensity cone
    upwardLightRatio: number;
    downwardLightRatio: number;
  };
  
  // Calculated coefficients for quick calculations
  coefficients: {
    // Coefficient of Utilization tables
    cuTable: CUTable;
    // Light loss factors
    lightLossFactor: number;
    // Spacing criteria
    spacingCriteria: {
      maximum: number;
      recommended: number;
    };
  };
}

export interface CUTable {
  roomIndex: number[];
  ceilingReflectance: number[];
  wallReflectance: number[];
  floorReflectance: number[];
  coefficients: number[][][]; // [ceiling][wall][floor]
}

export interface PhotometricCalculationPoint {
  x: number;
  y: number;
  z: number;
  illuminance: number;
  luminance?: number;
  vectorToSource: [number, number, number];
  incidentAngle: number;
}

export class IESParser {
  
  /**
   * Parse IES file content
   */
  static parseIES(fileContent: string): IESData {
    const lines = fileContent.split('\n').map(line => line.trim());
    let currentLine = 0;
    
    try {
      // Parse header
      const header = this.parseHeader(lines, currentLine);
      currentLine = header.nextLine;
      
      // Parse photometric data
      const photometry = this.parsePhotometry(lines, currentLine);
      
      // Calculate derived properties
      this.calculateDerivedProperties(photometry);
      
      // Generate coefficient tables
      const coefficients = this.generateCoefficients(photometry);
      
      return {
        header: header.data,
        photometry,
        coefficients
      };
      
    } catch (error) {
      throw new Error(`IES parsing failed: ${error}`);
    }
  }
  
  /**
   * Parse IES header section
   */
  private static parseHeader(lines: string[], startLine: number) {
    const header = {
      version: '',
      manufacturer: '',
      catalogNumber: '',
      luminaire: '',
      lamp: '',
      dateCreated: '',
      keywords: [] as string[]
    };
    
    let currentLine = startLine;
    
    // Look for IESNA header
    if (lines[currentLine].startsWith('IESNA')) {
      header.version = lines[currentLine];
      currentLine++;
    }
    
    // Parse header keywords until we hit the TILT line
    while (currentLine < lines.length && !lines[currentLine].startsWith('TILT=')) {
      const line = lines[currentLine];
      
      if (line.startsWith('[')) {
        // Keyword format: [KEYWORD] value
        const match = line.match(/\[([^\]]+)\]\s*(.*)/);
        if (match) {
          const keyword = match[1].toLowerCase();
          const value = match[2];
          
          switch (keyword) {
            case 'manufac':
            case 'manufacturer':
              header.manufacturer = value;
              break;
            case 'lumcat':
            case 'catalog':
              header.catalogNumber = value;
              break;
            case 'luminaire':
              header.luminaire = value;
              break;
            case 'lamp':
              header.lamp = value;
              break;
            case 'date':
              header.dateCreated = value;
              break;
            default:
              header.keywords.push(`${keyword}: ${value}`);
          }
        }
      }
      currentLine++;
    }
    
    return { data: header, nextLine: currentLine };
  }
  
  /**
   * Parse photometric data section
   */
  private static parsePhotometry(lines: string[], startLine: number) {
    let currentLine = startLine;
    
    // Skip TILT line (assume TILT=NONE for now)
    if (lines[currentLine].startsWith('TILT=')) {
      currentLine++;
    }
    
    // Parse main photometric parameters
    const params = this.parseNumericLine(lines[currentLine]);
    currentLine++;
    
    const photometry = {
      numberLamps: params[0],
      lumensPerLamp: params[1],
      candlelaMultiplier: params[2],
      numberVerticalAngles: params[3],
      numberHorizontalAngles: params[4],
      photometricType: params[5],
      unitsType: params[6],
      luminaireWidth: params[7],
      luminaireLength: params[8],
      luminaireHeight: params[9],
      ballastFactor: 1.0,
      ballastDescription: '',
      inputWatts: 0,
      verticalAngles: [] as number[],
      horizontalAngles: [] as number[],
      candelaValues: [] as number[][],
      totalLumens: 0,
      efficacy: 0,
      maxCandela: 0,
      meanCandela: 0,
      beamAngle: 0,
      fieldAngle: 0,
      upwardLightRatio: 0,
      downwardLightRatio: 0
    };
    
    // Parse ballast information (3 lines)
    const ballastParams = this.parseNumericLine(lines[currentLine]);
    photometry.ballastFactor = ballastParams[0];
    photometry.inputWatts = ballastParams[2];
    currentLine++;
    
    // Parse vertical angles
    const verticalData = this.parseAngularData(lines, currentLine, photometry.numberVerticalAngles);
    photometry.verticalAngles = verticalData.angles;
    currentLine = verticalData.nextLine;
    
    // Parse horizontal angles
    const horizontalData = this.parseAngularData(lines, currentLine, photometry.numberHorizontalAngles);
    photometry.horizontalAngles = horizontalData.angles;
    currentLine = horizontalData.nextLine;
    
    // Parse candela values
    photometry.candelaValues = [];
    for (let h = 0; h < photometry.numberHorizontalAngles; h++) {
      const candelaData = this.parseAngularData(lines, currentLine, photometry.numberVerticalAngles);
      photometry.candelaValues[h] = candelaData.angles.map(val => val * photometry.candlelaMultiplier);
      currentLine = candelaData.nextLine;
    }
    
    return photometry;
  }
  
  /**
   * Parse numeric data line (space or comma separated)
   */
  private static parseNumericLine(line: string): number[] {
    return line.split(/[\s,]+/)
      .filter(val => val.length > 0)
      .map(val => parseFloat(val))
      .filter(val => !isNaN(val));
  }
  
  /**
   * Parse angular data (can span multiple lines)
   */
  private static parseAngularData(lines: string[], startLine: number, expectedCount: number) {
    const angles: number[] = [];
    let currentLine = startLine;
    
    while (angles.length < expectedCount && currentLine < lines.length) {
      const values = this.parseNumericLine(lines[currentLine]);
      angles.push(...values);
      currentLine++;
    }
    
    return { angles: angles.slice(0, expectedCount), nextLine: currentLine };
  }
  
  /**
   * Calculate derived photometric properties
   */
  private static calculateDerivedProperties(photometry: any) {
    // Calculate total lumens using zonal method
    photometry.totalLumens = this.calculateTotalLumens(photometry);
    
    // Calculate efficacy
    if (photometry.inputWatts > 0) {
      photometry.efficacy = photometry.totalLumens / photometry.inputWatts;
    }
    
    // Find max candela
    photometry.maxCandela = Math.max(...photometry.candelaValues.flat());
    
    // Calculate mean candela
    const allValues = photometry.candelaValues.flat();
    photometry.meanCandela = allValues.reduce((sum: number, val: number) => sum + val, 0) / allValues.length;
    
    // Calculate beam and field angles
    const beamFieldAngles = this.calculateBeamFieldAngles(photometry);
    photometry.beamAngle = beamFieldAngles.beam;
    photometry.fieldAngle = beamFieldAngles.field;
    
    // Calculate upward/downward light ratios
    const lightRatios = this.calculateLightRatios(photometry);
    photometry.upwardLightRatio = lightRatios.upward;
    photometry.downwardLightRatio = lightRatios.downward;
  }
  
  /**
   * Calculate total lumens using zonal method
   */
  private static calculateTotalLumens(photometry: any): number {
    let totalLumens = 0;
    
    for (let h = 0; h < photometry.numberHorizontalAngles; h++) {
      for (let v = 0; v < photometry.numberVerticalAngles - 1; v++) {
        const theta1 = photometry.verticalAngles[v] * Math.PI / 180;
        const theta2 = photometry.verticalAngles[v + 1] * Math.PI / 180;
        
        const candela1 = photometry.candelaValues[h][v];
        const candela2 = photometry.candelaValues[h][v + 1];
        const avgCandela = (candela1 + candela2) / 2;
        
        // Zonal calculation
        const solidAngle = 2 * Math.PI * (Math.cos(theta1) - Math.cos(theta2));
        totalLumens += avgCandela * solidAngle;
      }
    }
    
    // Average across horizontal angles
    return totalLumens / photometry.numberHorizontalAngles;
  }
  
  /**
   * Calculate beam and field angles (50% and 10% intensity points)
   */
  private static calculateBeamFieldAngles(photometry: any) {
    const maxIntensity = photometry.maxCandela;
    const beam50 = maxIntensity * 0.5;
    const field10 = maxIntensity * 0.1;
    
    let beamAngle = 180;
    let fieldAngle = 180;
    
    // Find angles for nadir (0°) horizontal plane
    const nadirPlaneIndex = photometry.horizontalAngles.findIndex((angle: number) => angle === 0);
    if (nadirPlaneIndex >= 0) {
      const intensityProfile = photometry.candelaValues[nadirPlaneIndex];
      
      for (let i = 0; i < intensityProfile.length; i++) {
        const angle = photometry.verticalAngles[i];
        const intensity = intensityProfile[i];
        
        if (intensity >= beam50 && angle > beamAngle) {
          beamAngle = angle;
        }
        if (intensity >= field10 && angle > fieldAngle) {
          fieldAngle = angle;
        }
      }
    }
    
    return { beam: beamAngle * 2, field: fieldAngle * 2 }; // Convert to full cone angle
  }
  
  /**
   * Calculate upward and downward light ratios
   */
  private static calculateLightRatios(photometry: any) {
    let upwardLumens = 0;
    let downwardLumens = 0;
    
    for (let h = 0; h < photometry.numberHorizontalAngles; h++) {
      for (let v = 0; v < photometry.numberVerticalAngles - 1; v++) {
        const theta1 = photometry.verticalAngles[v] * Math.PI / 180;
        const theta2 = photometry.verticalAngles[v + 1] * Math.PI / 180;
        
        const candela1 = photometry.candelaValues[h][v];
        const candela2 = photometry.candelaValues[h][v + 1];
        const avgCandela = (candela1 + candela2) / 2;
        
        const solidAngle = 2 * Math.PI * (Math.cos(theta1) - Math.cos(theta2));
        const zoneLumens = avgCandela * solidAngle;
        
        const avgAngle = (photometry.verticalAngles[v] + photometry.verticalAngles[v + 1]) / 2;
        
        if (avgAngle <= 90) {
          downwardLumens += zoneLumens;
        } else {
          upwardLumens += zoneLumens;
        }
      }
    }
    
    const totalLumens = upwardLumens + downwardLumens;
    
    return {
      upward: totalLumens > 0 ? upwardLumens / totalLumens : 0,
      downward: totalLumens > 0 ? downwardLumens / totalLumens : 0
    };
  }
  
  /**
   * Generate Coefficient of Utilization table
   */
  private static generateCoefficients(photometry: any) {
    // Generate CU table for standard room configurations
    const roomIndices = [0.6, 0.8, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
    const ceilingRefl = [0.8, 0.7, 0.5, 0.3, 0.1];
    const wallRefl = [0.7, 0.5, 0.3, 0.1];
    const floorRefl = [0.2];
    
    const cuTable: CUTable = {
      roomIndex: roomIndices,
      ceilingReflectance: ceilingRefl,
      wallReflectance: wallRefl,
      floorReflectance: floorRefl,
      coefficients: []
    };
    
    // Calculate CU for each combination (simplified method)
    for (let c = 0; c < ceilingRefl.length; c++) {
      cuTable.coefficients[c] = [];
      for (let w = 0; w < wallRefl.length; w++) {
        cuTable.coefficients[c][w] = [];
        for (let f = 0; f < floorRefl.length; f++) {
          // Simplified CU calculation - would need full radiosity for accuracy
          const baseCU = 0.5; // Base coefficient
          const ceilingFactor = ceilingRefl[c] * 0.3;
          const wallFactor = wallRefl[w] * 0.2;
          const floorFactor = floorRefl[f] * 0.1;
          
          cuTable.coefficients[c][w][f] = baseCU + ceilingFactor + wallFactor + floorFactor;
        }
      }
    }
    
    return {
      cuTable,
      lightLossFactor: 0.8, // Default LLF
      spacingCriteria: {
        maximum: 1.5,
        recommended: 1.2
      }
    };
  }
  
  /**
   * Calculate illuminance at a point using the IES data
   */
  static calculatePointIlluminance(
    iesData: IESData, 
    fixturePosition: [number, number, number],
    fixtureRotation: [number, number, number],
    calculationPoint: [number, number, number]
  ): PhotometricCalculationPoint {
    
    const [fx, fy, fz] = fixturePosition;
    const [px, py, pz] = calculationPoint;
    
    // Vector from fixture to point
    const dx = px - fx;
    const dy = py - fy;
    const dz = pz - fz;
    
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance === 0) {
      return {
        x: px, y: py, z: pz,
        illuminance: 0,
        vectorToSource: [0, 0, 1],
        incidentAngle: 0
      };
    }
    
    // Unit vector from fixture to point
    const unitVector: [number, number, number] = [dx / distance, dy / distance, dz / distance];
    
    // Convert to spherical coordinates relative to fixture orientation
    const theta = Math.acos(-unitVector[2]) * 180 / Math.PI; // Vertical angle (0° = straight down)
    const phi = Math.atan2(unitVector[1], unitVector[0]) * 180 / Math.PI; // Horizontal angle
    
    // Interpolate candela value from IES data
    const candela = this.interpolateCandela(iesData.photometry, theta, phi);
    
    // Calculate illuminance using inverse square law
    const illuminance = candela / (distance * distance);
    
    // Calculate incident angle (angle between light ray and surface normal)
    const surfaceNormal: [number, number, number] = [0, 0, 1]; // Assume horizontal surface
    const incidentAngle = Math.acos(-unitVector[2]) * 180 / Math.PI;
    
    return {
      x: px,
      y: py, 
      z: pz,
      illuminance: illuminance * Math.cos(incidentAngle * Math.PI / 180), // Cosine correction
      vectorToSource: [-unitVector[0], -unitVector[1], -unitVector[2]],
      incidentAngle
    };
  }
  
  /**
   * Interpolate candela value for given angles
   */
  private static interpolateCandela(photometry: any, theta: number, phi: number): number {
    // Find bounding angles
    const verticalIndex = this.findBoundingIndices(photometry.verticalAngles, theta);
    const horizontalIndex = this.findBoundingIndices(photometry.horizontalAngles, phi);
    
    // Bilinear interpolation
    const v1 = verticalIndex.lower;
    const v2 = verticalIndex.upper;
    const h1 = horizontalIndex.lower;
    const h2 = horizontalIndex.upper;
    
    const c11 = photometry.candelaValues[h1][v1];
    const c12 = photometry.candelaValues[h1][v2];
    const c21 = photometry.candelaValues[h2][v1];
    const c22 = photometry.candelaValues[h2][v2];
    
    const t1 = verticalIndex.fraction;
    const t2 = horizontalIndex.fraction;
    
    const c1 = c11 * (1 - t1) + c12 * t1;
    const c2 = c21 * (1 - t1) + c22 * t1;
    
    return c1 * (1 - t2) + c2 * t2;
  }
  
  /**
   * Find bounding indices for interpolation
   */
  private static findBoundingIndices(angles: number[], targetAngle: number) {
    let lower = 0;
    let upper = angles.length - 1;
    
    for (let i = 0; i < angles.length - 1; i++) {
      if (targetAngle >= angles[i] && targetAngle <= angles[i + 1]) {
        lower = i;
        upper = i + 1;
        break;
      }
    }
    
    const fraction = upper > lower ? 
      (targetAngle - angles[lower]) / (angles[upper] - angles[lower]) : 0;
    
    return { lower, upper, fraction };
  }
}