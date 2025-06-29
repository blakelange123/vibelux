export interface EmergencyFixture {
  id: string;
  type: 'exit_sign' | 'emergency_light' | 'combo';
  x: number;
  y: number;
  z: number;
  lumens: number;
  batteryMinutes: number; // 90 min typical
  testDate?: Date;
  maintenanceDate?: Date;
  wattage?: number;
  batteryCapacityWh?: number;
  manufacturer?: string;
  model?: string;
  photometricFile?: string;
  customName?: string;
  group?: string;
  candlePower?: number; // For exit signs
  viewingDistance?: number; // For exit signs
}

export interface EgressPath {
  id: string;
  name: string;
  points: { x: number; y: number; z: number }[];
  width: number; // meters
  isMainExit: boolean;
  capacity: number; // persons
}

export interface EmergencyRequirements {
  code: 'NFPA101' | 'IBC' | 'OSHA' | 'Local';
  minIlluminance: number; // lux at floor level
  maxSpacing: number; // meters between fixtures
  exitSignVisibility: number; // meters
  pathOfEgressMinWidth: number; // meters
  batteryBackupMinutes: number;
}

export interface ExitDoor {
  id: string;
  x: number;
  y: number;
  width: number;
  name: string;
  isMainExit: boolean;
  capacity: number; // persons
  wall: 'north' | 'south' | 'east' | 'west';
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  length: number;
  height: number;
  type: 'wall' | 'equipment' | 'storage' | 'column';
}

export interface PhotometricData {
  angles: number[]; // vertical angles
  intensities: number[]; // candela values
  lumens: number;
}

export interface MaintenanceRecord {
  date: Date;
  type: 'monthly_test' | 'annual_test' | 'battery_replacement' | 'lamp_replacement';
  passed: boolean;
  notes?: string;
  technician?: string;
  duration?: number; // minutes for battery test
}

export interface EmergencyAnalysisResult {
  compliant: boolean;
  violations: string[];
  recommendations: string[];
  illuminanceLevels: Map<string, number>; // Path ID to min illuminance
  exitSignCoverage: number; // percentage
  exitSignVisibility: Map<string, boolean>; // Point ID to visibility
  batteryLoadAnalysis: {
    totalLoad: number; // watts
    runtime: number; // minutes
    adequate: boolean;
    fixtures: {
      id: string;
      load: number;
      runtime: number;
    }[];
  };
  photometricAnalysis?: {
    minIlluminance: number;
    maxIlluminance: number;
    avgIlluminance: number;
    uniformity: number;
  };
  maintenanceStatus: {
    overdueTests: string[];
    upcomingTests: string[];
    lastTestDate?: Date;
  };
}

export class EmergencyLightingCalculator {
  private static readonly CODES: Record<string, EmergencyRequirements> = {
    NFPA101: {
      code: 'NFPA101',
      minIlluminance: 10.76, // 1 footcandle = 10.76 lux
      maxSpacing: 30.48, // 100 feet
      exitSignVisibility: 22.86, // 75 feet
      pathOfEgressMinWidth: 0.9144, // 36 inches
      batteryBackupMinutes: 90
    },
    IBC: {
      code: 'IBC',
      minIlluminance: 10.76,
      maxSpacing: 30.48,
      exitSignVisibility: 30.48, // 100 feet
      pathOfEgressMinWidth: 1.016, // 40 inches
      batteryBackupMinutes: 90
    },
    OSHA: {
      code: 'OSHA',
      minIlluminance: 10.76,
      maxSpacing: 22.86, // 75 feet
      exitSignVisibility: 22.86,
      pathOfEgressMinWidth: 0.711, // 28 inches
      batteryBackupMinutes: 90
    }
  };

  static analyzeEmergencyLighting(
    fixtures: EmergencyFixture[],
    paths: EgressPath[],
    roomDimensions: { width: number; length: number; height: number },
    code: 'NFPA101' | 'IBC' | 'OSHA' = 'NFPA101',
    obstacles: Obstacle[] = [],
    exitDoors: ExitDoor[] = []
  ): EmergencyAnalysisResult {
    const requirements = this.CODES[code];
    const violations: string[] = [];
    const recommendations: string[] = [];
    const illuminanceLevels = new Map<string, number>();

    // Check path illuminance
    paths.forEach(path => {
      const minIlluminance = this.calculatePathIlluminance(path, fixtures);
      illuminanceLevels.set(path.id, minIlluminance);

      if (minIlluminance < requirements.minIlluminance) {
        violations.push(
          `Path "${path.name}" has insufficient illuminance: ${minIlluminance.toFixed(1)} lux (requires ${requirements.minIlluminance} lux)`
        );
        recommendations.push(
          `Add emergency lighting along path "${path.name}" to achieve minimum ${requirements.minIlluminance} lux`
        );
      }

      // Check path width
      if (path.width < requirements.pathOfEgressMinWidth) {
        violations.push(
          `Path "${path.name}" is too narrow: ${path.width}m (requires ${requirements.pathOfEgressMinWidth}m minimum)`
        );
      }
    });

    // Check exit sign visibility with line-of-sight
    const exitSigns = fixtures.filter(f => f.type === 'exit_sign' || f.type === 'combo');
    const exitSignCoverage = this.calculateExitSignCoverage(
      exitSigns,
      roomDimensions,
      requirements.exitSignVisibility
    );
    
    // Check exit sign visibility from key points
    const exitSignVisibility = new Map<string, boolean>();
    if (exitDoors.length > 0) {
      // Check visibility from each exit door
      exitDoors.forEach(door => {
        const visible = exitSigns.some(sign => 
          this.checkExitSignVisibility(
            { x: door.x, y: door.y, z: 1.5 },
            sign,
            obstacles,
            requirements.exitSignVisibility
          )
        );
        exitSignVisibility.set(door.id, visible);
        if (!visible) {
          violations.push(`No exit sign visible from exit door "${door.name}"`);
        }
      });
    }

    if (exitSignCoverage < 100) {
      violations.push(
        `Exit sign coverage is only ${exitSignCoverage.toFixed(0)}% (100% required)`
      );
      recommendations.push(
        'Add exit signs to ensure visibility from all locations'
      );
    }

    // Check fixture spacing
    const spacingViolations = this.checkFixtureSpacing(fixtures, requirements.maxSpacing);
    violations.push(...spacingViolations);

    // Enhanced battery load analysis
    const batteryCapacityAnalysis = this.calculateBatteryCapacity(fixtures, requirements.batteryBackupMinutes);
    const batteryLoadAnalysis = {
      totalLoad: batteryCapacityAnalysis.totalLoadW,
      runtime: Math.min(...batteryCapacityAnalysis.fixtureLoads.map(f => f.runtime)),
      adequate: batteryCapacityAnalysis.fixtureLoads.every(f => f.runtime >= requirements.batteryBackupMinutes),
      fixtures: batteryCapacityAnalysis.fixtureLoads
    };
    
    if (!batteryLoadAnalysis.adequate) {
      violations.push(
        `Battery backup insufficient: ${batteryLoadAnalysis.runtime} minutes (requires ${requirements.batteryBackupMinutes} minutes)`
      );
      recommendations.push(...batteryCapacityAnalysis.recommendations);
    }

    // Check maintenance
    const maintenanceIssues = this.checkMaintenance(fixtures);
    const now = new Date();
    const overdueTests = fixtures.filter(f => {
      if (!f.testDate) return true;
      const daysSinceTest = (now.getTime() - f.testDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceTest > 30;
    }).map(f => f.customName || f.id);
    
    const upcomingTests = fixtures.filter(f => {
      if (!f.testDate) return false;
      const daysSinceTest = (now.getTime() - f.testDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceTest > 20 && daysSinceTest <= 30;
    }).map(f => f.customName || f.id);
    
    if (maintenanceIssues.length > 0) {
      recommendations.push(...maintenanceIssues);
    }

    // Calculate photometric analysis
    let minIlluminance = Infinity;
    let maxIlluminance = 0;
    let totalIlluminance = 0;
    let sampleCount = 0;
    
    // Sample grid for photometric analysis
    const gridSize = 1; // 1 meter grid
    for (let x = 0; x <= roomDimensions.width; x += gridSize) {
      for (let y = 0; y <= roomDimensions.length; y += gridSize) {
        const illuminance = this.calculatePointIlluminance({ x, y, z: 0 }, fixtures);
        minIlluminance = Math.min(minIlluminance, illuminance);
        maxIlluminance = Math.max(maxIlluminance, illuminance);
        totalIlluminance += illuminance;
        sampleCount++;
      }
    }
    
    const avgIlluminance = totalIlluminance / sampleCount;
    const uniformity = minIlluminance / avgIlluminance;

    return {
      compliant: violations.length === 0,
      violations,
      recommendations,
      illuminanceLevels,
      exitSignCoverage,
      exitSignVisibility,
      batteryLoadAnalysis,
      photometricAnalysis: {
        minIlluminance,
        maxIlluminance,
        avgIlluminance,
        uniformity
      },
      maintenanceStatus: {
        overdueTests,
        upcomingTests,
        lastTestDate: fixtures
          .filter(f => f.testDate)
          .map(f => f.testDate!)
          .sort((a, b) => b.getTime() - a.getTime())[0]
      }
    };
  }

  private static calculatePathIlluminance(
    path: EgressPath,
    fixtures: EmergencyFixture[]
  ): number {
    let minIlluminance = Infinity;

    // Sample points along the path
    const sampleDistance = 1; // meter
    for (let i = 0; i < path.points.length - 1; i++) {
      const p1 = path.points[i];
      const p2 = path.points[i + 1];
      
      const distance = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + 
        Math.pow(p2.y - p1.y, 2)
      );
      
      const steps = Math.ceil(distance / sampleDistance);
      
      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        const samplePoint = {
          x: p1.x + (p2.x - p1.x) * t,
          y: p1.y + (p2.y - p1.y) * t,
          z: 0 // Floor level
        };
        
        const illuminance = this.calculatePointIlluminance(samplePoint, fixtures);
        minIlluminance = Math.min(minIlluminance, illuminance);
      }
    }

    return minIlluminance;
  }

  private static calculatePointIlluminance(
    point: { x: number; y: number; z: number },
    fixtures: EmergencyFixture[]
  ): number {
    let totalIlluminance = 0;

    fixtures.forEach(fixture => {
      if (fixture.type === 'exit_sign') return; // Exit signs don't contribute to floor illuminance
      
      const dx = point.x - fixture.x;
      const dy = point.y - fixture.y;
      const dz = point.z - fixture.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance === 0) return;
      
      // Inverse square law with cosine correction
      const cosineAngle = Math.abs(dz) / distance;
      const illuminance = (fixture.lumens / (4 * Math.PI)) * cosineAngle / (distance * distance);
      
      totalIlluminance += illuminance;
    });

    return totalIlluminance;
  }

  private static calculateExitSignCoverage(
    exitSigns: EmergencyFixture[],
    roomDimensions: { width: number; length: number; height: number },
    visibilityDistance: number
  ): number {
    if (exitSigns.length === 0) return 0;

    // Grid-based coverage calculation
    const gridSize = 1; // meter
    let coveredPoints = 0;
    let totalPoints = 0;

    for (let x = 0; x <= roomDimensions.width; x += gridSize) {
      for (let y = 0; y <= roomDimensions.length; y += gridSize) {
        totalPoints++;
        
        // Check if any exit sign is visible from this point
        const isVisible = exitSigns.some(sign => {
          const distance = Math.sqrt(
            Math.pow(x - sign.x, 2) + 
            Math.pow(y - sign.y, 2) + 
            Math.pow(1.5 - sign.z, 2) // Eye level
          );
          
          return distance <= visibilityDistance;
        });
        
        if (isVisible) coveredPoints++;
      }
    }

    return (coveredPoints / totalPoints) * 100;
  }

  private static checkFixtureSpacing(
    fixtures: EmergencyFixture[],
    maxSpacing: number
  ): string[] {
    const violations: string[] = [];
    
    // Check spacing between emergency lights (not exit signs)
    const emergencyLights = fixtures.filter(f => f.type !== 'exit_sign');
    
    for (let i = 0; i < emergencyLights.length; i++) {
      const f1 = emergencyLights[i];
      let nearestDistance = Infinity;
      
      for (let j = 0; j < emergencyLights.length; j++) {
        if (i === j) continue;
        
        const f2 = emergencyLights[j];
        const distance = Math.sqrt(
          Math.pow(f1.x - f2.x, 2) + 
          Math.pow(f1.y - f2.y, 2)
        );
        
        nearestDistance = Math.min(nearestDistance, distance);
      }
      
      if (nearestDistance > maxSpacing) {
        violations.push(
          `Emergency fixture spacing exceeds ${maxSpacing}m at location (${f1.x.toFixed(1)}, ${f1.y.toFixed(1)})`
        );
      }
    }
    
    return violations;
  }


  private static checkMaintenance(fixtures: EmergencyFixture[]): string[] {
    const recommendations: string[] = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    fixtures.forEach(fixture => {
      // Monthly test requirement
      if (!fixture.testDate || fixture.testDate < thirtyDaysAgo) {
        recommendations.push(
          `Emergency fixture at (${fixture.x.toFixed(1)}, ${fixture.y.toFixed(1)}) requires monthly testing`
        );
      }
      
      // Annual maintenance requirement
      if (!fixture.maintenanceDate || fixture.maintenanceDate < oneYearAgo) {
        recommendations.push(
          `Emergency fixture at (${fixture.x.toFixed(1)}, ${fixture.y.toFixed(1)}) requires annual maintenance`
        );
      }
    });
    
    return recommendations;
  }

  static placeExitSigns(
    exits: { x: number; y: number; name: string }[],
    roomDimensions: { width: number; length: number; height: number }
  ): EmergencyFixture[] {
    const exitSigns: EmergencyFixture[] = [];
    
    exits.forEach((exit, index) => {
      // Place exit sign above door
      exitSigns.push({
        id: `exit-sign-${index}`,
        type: 'exit_sign',
        x: exit.x,
        y: exit.y,
        z: 2.3, // Above door height
        lumens: 50, // Typical LED exit sign
        batteryMinutes: 90
      });
    });
    
    return exitSigns;
  }

  static autoPlaceEmergencyLights(
    roomDimensions: { width: number; length: number; height: number },
    paths: EgressPath[],
    existingFixtures: EmergencyFixture[] = []
  ): EmergencyFixture[] {
    const newFixtures: EmergencyFixture[] = [];
    const spacing = 10; // 10 meters typical spacing
    
    // Place along paths
    paths.forEach(path => {
      let accumulatedDistance = 0;
      
      for (let i = 0; i < path.points.length - 1; i++) {
        const p1 = path.points[i];
        const p2 = path.points[i + 1];
        
        const segmentLength = Math.sqrt(
          Math.pow(p2.x - p1.x, 2) + 
          Math.pow(p2.y - p1.y, 2)
        );
        
        const numFixtures = Math.floor((accumulatedDistance + segmentLength) / spacing);
        
        for (let j = 0; j < numFixtures; j++) {
          const t = (j * spacing - accumulatedDistance) / segmentLength;
          
          newFixtures.push({
            id: `emergency-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF}`,
            type: 'emergency_light',
            x: p1.x + (p2.x - p1.x) * t,
            y: p1.y + (p2.y - p1.y) * t,
            z: roomDimensions.height - 0.3, // Near ceiling
            lumens: 400, // Typical emergency light
            batteryMinutes: 90
          });
        }
        
        accumulatedDistance = (accumulatedDistance + segmentLength) % spacing;
      }
    });
    
    return newFixtures;
  }

  // Enhanced photometric calculations
  static calculatePhotometricIlluminance(
    point: { x: number; y: number; z: number },
    fixture: EmergencyFixture,
    photometricData?: PhotometricData
  ): number {
    const dx = point.x - fixture.x;
    const dy = point.y - fixture.y;
    const dz = point.z - fixture.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance === 0) return 0;
    
    // Calculate angle from fixture to point
    const angle = Math.atan2(Math.sqrt(dx * dx + dy * dy), Math.abs(dz)) * 180 / Math.PI;
    
    if (photometricData && photometricData.angles.length > 0) {
      // Interpolate intensity from photometric data
      let intensity = 0;
      
      for (let i = 0; i < photometricData.angles.length - 1; i++) {
        if (angle >= photometricData.angles[i] && angle <= photometricData.angles[i + 1]) {
          const t = (angle - photometricData.angles[i]) / 
                   (photometricData.angles[i + 1] - photometricData.angles[i]);
          intensity = photometricData.intensities[i] * (1 - t) + 
                     photometricData.intensities[i + 1] * t;
          break;
        }
      }
      
      // Calculate illuminance using inverse square law
      const illuminance = intensity * Math.abs(dz) / (distance * distance * distance);
      return illuminance;
    } else {
      // Fallback to basic calculation
      const cosineAngle = Math.abs(dz) / distance;
      return (fixture.lumens / (4 * Math.PI)) * cosineAngle / (distance * distance);
    }
  }

  // Exit sign visibility with line-of-sight checking
  static checkExitSignVisibility(
    viewPoint: { x: number; y: number; z: number },
    exitSign: EmergencyFixture,
    obstacles: Obstacle[],
    maxDistance: number
  ): boolean {
    const dx = exitSign.x - viewPoint.x;
    const dy = exitSign.y - viewPoint.y;
    const dz = exitSign.z - viewPoint.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Check if within viewing distance
    if (distance > maxDistance) return false;
    
    // Check line of sight for obstacles
    const steps = Math.ceil(distance);
    for (let step = 1; step < steps; step++) {
      const t = step / steps;
      const checkPoint = {
        x: viewPoint.x + dx * t,
        y: viewPoint.y + dy * t,
        z: viewPoint.z + dz * t
      };
      
      // Check if line passes through any obstacle
      for (const obstacle of obstacles) {
        if (checkPoint.x >= obstacle.x && 
            checkPoint.x <= obstacle.x + obstacle.width &&
            checkPoint.y >= obstacle.y && 
            checkPoint.y <= obstacle.y + obstacle.length &&
            checkPoint.z <= obstacle.height) {
          return false; // Line of sight blocked
        }
      }
    }
    
    return true;
  }

  // Enhanced battery capacity calculations
  static calculateBatteryCapacity(
    fixtures: EmergencyFixture[],
    requiredRuntime: number = 90
  ): {
    totalLoadW: number;
    requiredCapacityWh: number;
    fixtureLoads: { id: string; load: number; runtime: number }[];
    recommendations: string[];
  } {
    const fixtureLoads: { id: string; load: number; runtime: number }[] = [];
    const recommendations: string[] = [];
    let totalLoadW = 0;
    
    fixtures.forEach(fixture => {
      // Calculate actual wattage
      const watts = fixture.wattage || (fixture.lumens / 100); // Assume 100 lm/W if not specified
      totalLoadW += watts;
      
      // Calculate runtime with battery capacity
      let runtime = fixture.batteryMinutes;
      if (fixture.batteryCapacityWh) {
        runtime = (fixture.batteryCapacityWh / watts) * 60;
      }
      
      fixtureLoads.push({
        id: fixture.id,
        load: watts,
        runtime: runtime
      });
      
      if (runtime < requiredRuntime) {
        recommendations.push(
          `Fixture ${fixture.customName || fixture.id} has insufficient battery: ${runtime.toFixed(0)} min (requires ${requiredRuntime} min)`
        );
      }
    });
    
    // Calculate required battery capacity
    const requiredCapacityWh = (totalLoadW * requiredRuntime) / 60;
    
    // Add efficiency factor (85% typical)
    const adjustedCapacityWh = requiredCapacityWh / 0.85;
    
    return {
      totalLoadW,
      requiredCapacityWh: adjustedCapacityWh,
      fixtureLoads,
      recommendations
    };
  }

  // Maintenance scheduling
  static generateMaintenanceSchedule(
    fixtures: EmergencyFixture[],
    startDate: Date = new Date()
  ): {
    monthlyTests: { date: Date; fixtures: string[] }[];
    annualTests: { date: Date; fixtures: string[] }[];
  } {
    const monthlyTests: { date: Date; fixtures: string[] }[] = [];
    const annualTests: { date: Date; fixtures: string[] }[] = [];
    
    // Generate schedule for next 12 months
    for (let month = 0; month < 12; month++) {
      const testDate = new Date(startDate);
      testDate.setMonth(testDate.getMonth() + month);
      
      monthlyTests.push({
        date: testDate,
        fixtures: fixtures.map(f => f.customName || f.id)
      });
      
      if (month === 0) {
        annualTests.push({
          date: testDate,
          fixtures: fixtures.map(f => f.customName || f.id)
        });
      }
    }
    
    return { monthlyTests, annualTests };
  }

  // Code compliance report generation
  static generateComplianceReport(
    analysisResult: EmergencyAnalysisResult,
    code: string,
    projectInfo: {
      name: string;
      address: string;
      date: Date;
      inspector?: string;
    }
  ): {
    summary: string;
    details: string[];
    passFailStatus: 'PASS' | 'FAIL';
  } {
    const details: string[] = [];
    
    // Header
    details.push(`EMERGENCY LIGHTING COMPLIANCE REPORT`);
    details.push(`Project: ${projectInfo.name}`);
    details.push(`Address: ${projectInfo.address}`);
    details.push(`Date: ${projectInfo.date.toLocaleDateString()}`);
    details.push(`Code: ${code}`);
    if (projectInfo.inspector) {
      details.push(`Inspector: ${projectInfo.inspector}`);
    }
    details.push('');
    
    // Summary
    const passFailStatus = analysisResult.compliant ? 'PASS' : 'FAIL';
    details.push(`Overall Status: ${passFailStatus}`);
    details.push('');
    
    // Violations
    if (analysisResult.violations.length > 0) {
      details.push('VIOLATIONS:');
      analysisResult.violations.forEach((v, i) => {
        details.push(`${i + 1}. ${v}`);
      });
      details.push('');
    }
    
    // Photometric Analysis
    if (analysisResult.photometricAnalysis) {
      details.push('PHOTOMETRIC ANALYSIS:');
      details.push(`Min Illuminance: ${analysisResult.photometricAnalysis.minIlluminance.toFixed(1)} lux`);
      details.push(`Max Illuminance: ${analysisResult.photometricAnalysis.maxIlluminance.toFixed(1)} lux`);
      details.push(`Avg Illuminance: ${analysisResult.photometricAnalysis.avgIlluminance.toFixed(1)} lux`);
      details.push(`Uniformity: ${analysisResult.photometricAnalysis.uniformity.toFixed(2)}`);
      details.push('');
    }
    
    // Battery Analysis
    details.push('BATTERY BACKUP ANALYSIS:');
    details.push(`Total Emergency Load: ${analysisResult.batteryLoadAnalysis.totalLoad.toFixed(0)}W`);
    details.push(`Runtime: ${analysisResult.batteryLoadAnalysis.runtime} minutes`);
    details.push(`Status: ${analysisResult.batteryLoadAnalysis.adequate ? 'Adequate' : 'Insufficient'}`);
    details.push('');
    
    // Recommendations
    if (analysisResult.recommendations.length > 0) {
      details.push('RECOMMENDATIONS:');
      analysisResult.recommendations.forEach((r, i) => {
        details.push(`${i + 1}. ${r}`);
      });
    }
    
    const summary = `Emergency lighting system ${passFailStatus} compliance with ${code}. ` +
                   `${analysisResult.violations.length} violations found.`;
    
    return { summary, details, passFailStatus };
  }

  // Emergency lighting layout optimization
  static optimizeEmergencyLayout(
    roomDimensions: { width: number; length: number; height: number },
    paths: EgressPath[],
    exitDoors: ExitDoor[],
    obstacles: Obstacle[] = [],
    code: 'NFPA101' | 'IBC' | 'OSHA' = 'NFPA101'
  ): {
    fixtures: EmergencyFixture[];
    coverage: number;
    estimatedCost: number;
  } {
    const requirements = this.CODES[code];
    const fixtures: EmergencyFixture[] = [];
    
    // Place exit signs at all exits
    exitDoors.forEach((door, index) => {
      fixtures.push({
        id: `exit-sign-${index}`,
        type: 'exit_sign',
        x: door.x,
        y: door.y,
        z: 2.3, // Above door
        lumens: 50,
        batteryMinutes: 90,
        wattage: 5,
        candlePower: 50
      });
    });
    
    // Calculate optimal emergency light placement
    const gridSpacing = requirements.maxSpacing / 2; // Conservative spacing
    
    for (let x = gridSpacing; x < roomDimensions.width; x += gridSpacing) {
      for (let y = gridSpacing; y < roomDimensions.length; y += gridSpacing) {
        // Check if location is clear of obstacles
        let clear = true;
        for (const obstacle of obstacles) {
          if (x >= obstacle.x && x <= obstacle.x + obstacle.width &&
              y >= obstacle.y && y <= obstacle.y + obstacle.length) {
            clear = false;
            break;
          }
        }
        
        if (clear) {
          // Check if location is near a path
          let nearPath = false;
          for (const path of paths) {
            for (const point of path.points) {
              const distance = Math.sqrt(
                Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
              );
              if (distance < gridSpacing) {
                nearPath = true;
                break;
              }
            }
            if (nearPath) break;
          }
          
          if (nearPath) {
            fixtures.push({
              id: `emergency-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF}`,
              type: 'emergency_light',
              x,
              y,
              z: roomDimensions.height - 0.3,
              lumens: 400,
              batteryMinutes: 90,
              wattage: 4
            });
          }
        }
      }
    }
    
    // Calculate coverage
    const analysisResult = this.analyzeEmergencyLighting(
      fixtures,
      paths,
      roomDimensions,
      code,
      obstacles,
      exitDoors
    );
    
    // Estimate cost
    const exitSignCost = 150; // per sign
    const emergencyLightCost = 200; // per light
    const exitSigns = fixtures.filter(f => f.type === 'exit_sign').length;
    const emergencyLights = fixtures.filter(f => f.type === 'emergency_light').length;
    const estimatedCost = (exitSigns * exitSignCost) + (emergencyLights * emergencyLightCost);
    
    return {
      fixtures,
      coverage: analysisResult.exitSignCoverage,
      estimatedCost
    };
  }
}