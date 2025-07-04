/**
 * Advanced IES File Parser
 * Parses IESNA LM-63 photometric data files
 */

export interface IESPhotometricData {
  // File metadata
  header: {
    format: string;
    testNumber?: string;
    testLab?: string;
    manufacturer?: string;
    lumcat?: string;
    luminaire?: string;
    lamp?: string;
    ballast?: string;
    issueDate?: string;
    other?: string;
  };
  
  // Photometric properties
  photometry: {
    numberOfLamps: number;
    lumensPerLamp: number;
    candelaMultiplier: number;
    numberOfVerticalAngles: number;
    numberOfHorizontalAngles: number;
    photometricType: number; // 1=C, 2=B, 3=A
    unitsType: number; // 1=feet, 2=meters
    luminousOpeningWidth: number;
    luminousOpeningLength: number;
    luminousOpeningHeight: number;
  };
  
  // Measurement data
  measurements: {
    verticalAngles: number[];
    horizontalAngles: number[];
    candelaValues: number[][]; // [vertical][horizontal]
  };
  
  // Calculated values
  calculated?: {
    totalLumens: number;
    maxCandela: number;
    beamAngle: number; // Angle where intensity drops to 50%
    fieldAngle: number; // Angle where intensity drops to 10%
    luminousEfficacy?: number; // lm/W if wattage is known
  };
}

export class IESParser {
  /**
   * Parse IES file content
   */
  static parse(content: string): IESPhotometricData {
    const lines = content.split('\n').map(line => line.trim());
    let lineIndex = 0;
    
    // Parse header
    const header = this.parseHeader(lines, lineIndex);
    lineIndex = header.endIndex;
    
    // Find and parse TILT section
    const tiltIndex = lines.findIndex(line => line.startsWith('TILT='));
    if (tiltIndex === -1) {
      throw new Error('Invalid IES file: No TILT section found');
    }
    lineIndex = tiltIndex + 1;
    
    // Skip TILT data if present
    if (lines[tiltIndex] !== 'TILT=NONE') {
      const tiltCount = parseInt(lines[lineIndex]);
      lineIndex += 1 + Math.ceil(tiltCount / 10); // Skip tilt angles and factors
    }
    
    // Parse photometric data line
    const photoLine = this.findPhotometricLine(lines, lineIndex);
    const photometry = this.parsePhotometricLine(photoLine.line);
    lineIndex = photoLine.index + 1;
    
    // Parse measurements
    const measurements = this.parseMeasurements(lines, lineIndex, photometry);
    
    // Calculate derived values
    const calculated = this.calculateDerivedValues(photometry, measurements);
    
    return {
      header,
      photometry,
      measurements,
      calculated
    };
  }
  
  /**
   * Parse header information
   */
  private static parseHeader(lines: string[], startIndex: number): any {
    const header: any = {
      format: 'IESNA:LM-63'
    };
    
    let endIndex = startIndex;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('TILT=')) {
        endIndex = i;
        break;
      }
      
      if (line.startsWith('[')) {
        const match = line.match(/\[([^\]]+)\]\s*(.*)/);
        if (match) {
          const key = match[1].toLowerCase();
          const value = match[2].trim();
          
          switch (key) {
            case 'test': header.testNumber = value; break;
            case 'testlab': header.testLab = value; break;
            case 'manufac': header.manufacturer = value; break;
            case 'lumcat': header.lumcat = value; break;
            case 'luminaire': header.luminaire = value; break;
            case 'lamp': header.lamp = value; break;
            case 'ballast': header.ballast = value; break;
            case 'issuedate': header.issueDate = value; break;
            case 'other': header.other = value; break;
          }
        }
      } else if (line.includes('IESNA')) {
        header.format = line;
      }
    }
    
    return { ...header, endIndex };
  }
  
  /**
   * Find photometric data line
   */
  private static findPhotometricLine(lines: string[], startIndex: number): { line: string; index: number } {
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      // Look for line with 10 numeric values
      const values = line.split(/\s+/).filter(v => v);
      if (values.length >= 10 && values.every(v => !isNaN(parseFloat(v)))) {
        return { line, index: i };
      }
    }
    throw new Error('Invalid IES file: No photometric data line found');
  }
  
  /**
   * Parse photometric properties line
   */
  private static parsePhotometricLine(line: string): IESPhotometricData['photometry'] {
    const values = line.trim().split(/\s+/).map(parseFloat);
    
    if (values.length < 10) {
      throw new Error('Invalid photometric data line');
    }
    
    return {
      numberOfLamps: values[0],
      lumensPerLamp: values[1],
      candelaMultiplier: values[2],
      numberOfVerticalAngles: values[3],
      numberOfHorizontalAngles: values[4],
      photometricType: values[5],
      unitsType: values[6],
      luminousOpeningWidth: values[7],
      luminousOpeningLength: values[8],
      luminousOpeningHeight: values[9]
    };
  }
  
  /**
   * Parse measurement data
   */
  private static parseMeasurements(
    lines: string[], 
    startIndex: number, 
    photometry: IESPhotometricData['photometry']
  ): IESPhotometricData['measurements'] {
    let currentIndex = startIndex;
    const allValues: number[] = [];
    
    // Collect all numeric values
    while (currentIndex < lines.length) {
      const line = lines[currentIndex].trim();
      if (!line) {
        currentIndex++;
        continue;
      }
      
      const values = line.split(/\s+/)
        .filter(v => v)
        .map(v => parseFloat(v))
        .filter(v => !isNaN(v));
      
      allValues.push(...values);
      
      // Check if we have enough values
      const totalExpected = photometry.numberOfVerticalAngles + 
                           photometry.numberOfHorizontalAngles + 
                           (photometry.numberOfVerticalAngles * photometry.numberOfHorizontalAngles);
      
      if (allValues.length >= totalExpected) {
        break;
      }
      
      currentIndex++;
    }
    
    // Extract angles and candela values
    let valueIndex = 0;
    
    // Vertical angles
    const verticalAngles: number[] = [];
    for (let i = 0; i < photometry.numberOfVerticalAngles; i++) {
      verticalAngles.push(allValues[valueIndex++]);
    }
    
    // Horizontal angles
    const horizontalAngles: number[] = [];
    for (let i = 0; i < photometry.numberOfHorizontalAngles; i++) {
      horizontalAngles.push(allValues[valueIndex++]);
    }
    
    // Candela values (organized by vertical angle, then horizontal)
    const candelaValues: number[][] = [];
    for (let v = 0; v < photometry.numberOfVerticalAngles; v++) {
      const row: number[] = [];
      for (let h = 0; h < photometry.numberOfHorizontalAngles; h++) {
        row.push(allValues[valueIndex++] * photometry.candelaMultiplier);
      }
      candelaValues.push(row);
    }
    
    return {
      verticalAngles,
      horizontalAngles,
      candelaValues
    };
  }
  
  /**
   * Calculate derived values
   */
  private static calculateDerivedValues(
    photometry: IESPhotometricData['photometry'],
    measurements: IESPhotometricData['measurements']
  ): IESPhotometricData['calculated'] {
    const { candelaValues, verticalAngles } = measurements;
    
    // Find max candela
    let maxCandela = 0;
    for (const row of candelaValues) {
      for (const value of row) {
        maxCandela = Math.max(maxCandela, value);
      }
    }
    
    // Calculate total lumens (simplified - assumes symmetric distribution)
    const totalLumens = photometry.numberOfLamps * photometry.lumensPerLamp;
    
    // Find beam and field angles (simplified - looks at 0° horizontal plane)
    let beamAngle = 0;
    let fieldAngle = 0;
    
    const centerColumn = Math.floor(photometry.numberOfHorizontalAngles / 2);
    const centerIntensity = candelaValues[0]?.[centerColumn] || maxCandela;
    
    for (let i = 0; i < verticalAngles.length; i++) {
      const intensity = candelaValues[i]?.[centerColumn] || 0;
      const ratio = intensity / centerIntensity;
      
      if (ratio >= 0.5 && beamAngle === 0) {
        beamAngle = verticalAngles[i] * 2; // Double for full angle
      }
      if (ratio >= 0.1 && fieldAngle === 0) {
        fieldAngle = verticalAngles[i] * 2;
      }
    }
    
    return {
      totalLumens,
      maxCandela,
      beamAngle,
      fieldAngle
    };
  }
  
  /**
   * Convert IES data to PPFD for horticultural applications
   */
  static convertToPPFD(iesData: IESPhotometricData, distance: number, ppfPerLumen: number = 0.015): number[][] {
    const { measurements, photometry } = iesData;
    const ppfdGrid: number[][] = [];
    
    // Convert candela to PPFD at given distance
    // PPFD = (candela * PPF/lumen conversion factor) / (distance²)
    for (let v = 0; v < measurements.verticalAngles.length; v++) {
      const row: number[] = [];
      for (let h = 0; h < measurements.horizontalAngles.length; h++) {
        const candela = measurements.candelaValues[v][h];
        // Approximate conversion: assumes typical horticultural spectrum
        const ppfd = (candela * ppfPerLumen) / (distance * distance);
        row.push(ppfd);
      }
      ppfdGrid.push(row);
    }
    
    return ppfdGrid;
  }
  
  /**
   * Interpolate IES data for smooth rendering
   */
  static interpolate(
    iesData: IESPhotometricData,
    targetVerticalAngles: number,
    targetHorizontalAngles: number
  ): number[][] {
    const { measurements } = iesData;
    const interpolated: number[][] = [];
    
    for (let v = 0; v < targetVerticalAngles; v++) {
      const row: number[] = [];
      const vAngle = (v / (targetVerticalAngles - 1)) * 180;
      
      for (let h = 0; h < targetHorizontalAngles; h++) {
        const hAngle = (h / (targetHorizontalAngles - 1)) * 360;
        
        // Find surrounding data points
        const vIndex = this.findInterpolationIndices(vAngle, measurements.verticalAngles);
        const hIndex = this.findInterpolationIndices(hAngle, measurements.horizontalAngles);
        
        // Bilinear interpolation
        const value = this.bilinearInterpolation(
          measurements.candelaValues,
          vIndex.lower, vIndex.upper, vIndex.fraction,
          hIndex.lower, hIndex.upper, hIndex.fraction
        );
        
        row.push(value);
      }
      interpolated.push(row);
    }
    
    return interpolated;
  }
  
  private static findInterpolationIndices(
    target: number,
    values: number[]
  ): { lower: number; upper: number; fraction: number } {
    for (let i = 0; i < values.length - 1; i++) {
      if (target >= values[i] && target <= values[i + 1]) {
        const fraction = (target - values[i]) / (values[i + 1] - values[i]);
        return { lower: i, upper: i + 1, fraction };
      }
    }
    
    // If target is outside range, clamp to nearest
    if (target < values[0]) {
      return { lower: 0, upper: 0, fraction: 0 };
    }
    
    const lastIndex = values.length - 1;
    return { lower: lastIndex, upper: lastIndex, fraction: 0 };
  }
  
  private static bilinearInterpolation(
    data: number[][],
    v1: number, v2: number, vFraction: number,
    h1: number, h2: number, hFraction: number
  ): number {
    const q11 = data[v1]?.[h1] || 0;
    const q12 = data[v1]?.[h2] || 0;
    const q21 = data[v2]?.[h1] || 0;
    const q22 = data[v2]?.[h2] || 0;
    
    const r1 = q11 * (1 - hFraction) + q12 * hFraction;
    const r2 = q21 * (1 - hFraction) + q22 * hFraction;
    
    return r1 * (1 - vFraction) + r2 * vFraction;
  }
}