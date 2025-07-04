interface DesignObject {
  id: string;
  type: 'fixture' | 'rack' | 'fan' | 'sensor' | 'plant';
  x: number;
  y: number;
  z: number;
  rotation?: number;
  width: number;
  length: number;
  height: number;
  enabled: boolean;
  model?: any;
  group?: string;
}

interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  suggestions: Suggestion[];
  metrics: DesignMetrics;
}

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  affectedObjects?: string[];
}

interface Suggestion {
  priority: 'high' | 'medium' | 'low';
  category: string;
  message: string;
  action?: () => void;
}

interface DesignMetrics {
  uniformityRatio: number;
  averagePPFD: number;
  minPPFD: number;
  maxPPFD: number;
  powerDensity: number; // W/m²
  fixtureSpacingRatio: number;
  coverageEfficiency: number;
  maintenanceAccessibility: number;
  electricalLoadBalance: number;
  estimatedDLI: number;
}

export function validateDesign(
  objects: DesignObject[],
  roomDimensions: { width: number; length: number; height: number },
  targetPPFD: number,
  cropType?: string
): ValidationResult {
  const fixtures = objects.filter(obj => obj.type === 'fixture' && obj.enabled);
  const racks = objects.filter(obj => obj.type === 'rack');
  const fans = objects.filter(obj => obj.type === 'fan');
  
  const issues: ValidationIssue[] = [];
  const suggestions: Suggestion[] = [];
  
  // Calculate metrics
  const metrics = calculateDesignMetrics(fixtures, racks, roomDimensions, targetPPFD);
  
  // 1. Validate Uniformity
  if (metrics.uniformityRatio < 0.7) {
    issues.push({
      severity: 'warning',
      category: 'uniformity',
      message: `Light uniformity is ${(metrics.uniformityRatio * 100).toFixed(0)}%, below recommended 70%`
    });
    
    suggestions.push({
      priority: 'high',
      category: 'uniformity',
      message: 'Consider adding perimeter fixtures or adjusting spacing for better uniformity'
    });
  }
  
  // 2. Validate PPFD Targets
  const ppfdDeviation = Math.abs(metrics.averagePPFD - targetPPFD) / targetPPFD;
  if (ppfdDeviation > 0.15) {
    issues.push({
      severity: 'warning',
      category: 'intensity',
      message: `Average PPFD (${metrics.averagePPFD.toFixed(0)}) deviates ${(ppfdDeviation * 100).toFixed(0)}% from target (${targetPPFD})`
    });
    
    if (metrics.averagePPFD < targetPPFD) {
      suggestions.push({
        priority: 'high',
        category: 'intensity',
        message: 'Add more fixtures or use higher output models to reach target PPFD'
      });
    } else {
      suggestions.push({
        priority: 'medium',
        category: 'intensity',
        message: 'Consider dimming fixtures or reducing fixture count to save energy'
      });
    }
  }
  
  // 3. Validate Fixture Spacing
  const spacingIssues = validateFixtureSpacing(fixtures);
  issues.push(...spacingIssues);
  
  // 4. Validate Electrical Distribution
  const electricalIssues = validateElectricalDistribution(fixtures, roomDimensions);
  issues.push(...electricalIssues.issues);
  suggestions.push(...electricalIssues.suggestions);
  
  // 5. Validate Airflow (Cannabis specific)
  if (cropType === 'cannabis' && fans.length === 0) {
    issues.push({
      severity: 'error',
      category: 'airflow',
      message: 'No fans detected - Cannabis requires proper air circulation'
    });
    
    suggestions.push({
      priority: 'high',
      category: 'airflow',
      message: 'Add HAF fans at room corners for optimal air circulation'
    });
  }
  
  // 6. Validate Maintenance Access
  const accessIssues = validateMaintenanceAccess(fixtures, racks, roomDimensions);
  issues.push(...accessIssues);
  
  // 7. Validate Height Clearances
  const heightIssues = validateHeightClearances(fixtures, racks, roomDimensions);
  issues.push(...heightIssues);
  
  // 8. Validate Heat Load
  const heatLoadIssues = validateHeatLoad(fixtures, roomDimensions, cropType);
  issues.push(...heatLoadIssues.issues);
  suggestions.push(...heatLoadIssues.suggestions);
  
  // 9. Check for Shadowing
  const shadowingIssues = checkForShadowing(fixtures, racks);
  issues.push(...shadowingIssues);
  
  // 10. Validate DLI for Crop Type
  if (cropType) {
    const dliIssues = validateDLI(metrics.estimatedDLI, cropType);
    issues.push(...dliIssues.issues);
    suggestions.push(...dliIssues.suggestions);
  }
  
  // Calculate overall score
  const score = calculateOverallScore(metrics, issues);
  
  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    score,
    issues,
    suggestions: suggestions.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    }),
    metrics
  };
}

function calculateDesignMetrics(
  fixtures: DesignObject[],
  racks: DesignObject[],
  roomDimensions: { width: number; length: number; height: number },
  targetPPFD: number
): DesignMetrics {
  // Simplified PPFD calculation - in real implementation would use photometric data
  const roomArea = roomDimensions.width * roomDimensions.length;
  const totalPPF = fixtures.reduce((sum, f) => sum + (f.model?.ppf || 0), 0);
  const averagePPFD = totalPPF / roomArea;
  
  // Calculate uniformity (simplified - real implementation would use ray tracing)
  const gridPoints = generateGridPoints(roomDimensions, 1); // 1m grid
  const ppfdValues = gridPoints.map(point => calculatePPFDAtPoint(point, fixtures));
  const minPPFD = Math.min(...ppfdValues);
  const maxPPFD = Math.max(...ppfdValues);
  const uniformityRatio = minPPFD / averagePPFD;
  
  // Power density
  const totalPower = fixtures.reduce((sum, f) => sum + (f.model?.wattage || 0), 0);
  const powerDensity = totalPower / roomArea;
  
  // Fixture spacing ratio
  const avgSpacing = calculateAverageSpacing(fixtures);
  const idealSpacing = Math.sqrt(roomArea / fixtures.length);
  const fixtureSpacingRatio = avgSpacing / idealSpacing;
  
  // Coverage efficiency
  const coverageArea = calculateCoverageArea(fixtures);
  const coverageEfficiency = Math.min(coverageArea / roomArea, 1);
  
  // Maintenance accessibility (0-1 score)
  const maintenanceAccessibility = calculateMaintenanceScore(fixtures, racks, roomDimensions);
  
  // Electrical load balance
  const electricalLoadBalance = calculateElectricalBalance(fixtures, roomDimensions);
  
  // Estimated DLI (assuming 12-18 hour photoperiod)
  const photoperiod = targetPPFD >= 600 ? 12 : 18; // Flowering vs veg
  const estimatedDLI = (averagePPFD * photoperiod * 3600) / 1000000;
  
  return {
    uniformityRatio,
    averagePPFD,
    minPPFD,
    maxPPFD,
    powerDensity,
    fixtureSpacingRatio,
    coverageEfficiency,
    maintenanceAccessibility,
    electricalLoadBalance,
    estimatedDLI
  };
}

function validateFixtureSpacing(fixtures: DesignObject[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Check for fixtures too close together
  for (let i = 0; i < fixtures.length; i++) {
    for (let j = i + 1; j < fixtures.length; j++) {
      const distance = calculateDistance(fixtures[i], fixtures[j]);
      const minDistance = 0.5; // 0.5m minimum
      
      if (distance < minDistance) {
        issues.push({
          severity: 'warning',
          category: 'spacing',
          message: `Fixtures too close together (${distance.toFixed(2)}m)`,
          affectedObjects: [fixtures[i].id, fixtures[j].id]
        });
      }
    }
  }
  
  return issues;
}

function validateElectricalDistribution(
  fixtures: DesignObject[],
  roomDimensions: { width: number; length: number; height: number }
): { issues: ValidationIssue[]; suggestions: Suggestion[] } {
  const issues: ValidationIssue[] = [];
  const suggestions: Suggestion[] = [];
  
  // Divide room into quadrants
  const quadrants = [
    { x: 0, y: 0, w: roomDimensions.width / 2, h: roomDimensions.length / 2 },
    { x: roomDimensions.width / 2, y: 0, w: roomDimensions.width / 2, h: roomDimensions.length / 2 },
    { x: 0, y: roomDimensions.length / 2, w: roomDimensions.width / 2, h: roomDimensions.length / 2 },
    { x: roomDimensions.width / 2, y: roomDimensions.length / 2, w: roomDimensions.width / 2, h: roomDimensions.length / 2 }
  ];
  
  const quadrantLoads = quadrants.map(q => {
    const fixturesInQuadrant = fixtures.filter(f => 
      f.x >= q.x && f.x < q.x + q.w &&
      f.y >= q.y && f.y < q.y + q.h
    );
    return fixturesInQuadrant.reduce((sum, f) => sum + (f.model?.wattage || 0), 0);
  });
  
  const avgLoad = quadrantLoads.reduce((sum, load) => sum + load, 0) / 4;
  const maxDeviation = Math.max(...quadrantLoads.map(load => Math.abs(load - avgLoad) / avgLoad));
  
  if (maxDeviation > 0.25) {
    issues.push({
      severity: 'warning',
      category: 'electrical',
      message: `Unbalanced electrical load distribution (${(maxDeviation * 100).toFixed(0)}% deviation)`
    });
    
    suggestions.push({
      priority: 'medium',
      category: 'electrical',
      message: 'Redistribute fixtures for balanced electrical loading across circuits'
    });
  }
  
  // Check total load
  const totalLoad = fixtures.reduce((sum, f) => sum + (f.model?.wattage || 0), 0);
  const totalAmps = totalLoad / 240; // Assuming 240V
  
  if (totalAmps > 200) {
    suggestions.push({
      priority: 'high',
      category: 'electrical',
      message: `Consider multiple panels for ${totalAmps.toFixed(0)}A total load`
    });
  }
  
  return { issues, suggestions };
}

function validateMaintenanceAccess(
  fixtures: DesignObject[],
  racks: DesignObject[],
  roomDimensions: { width: number; length: number; height: number }
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const minAisleWidth = 0.9; // 3 feet
  
  // Check aisle spacing between racks
  for (let i = 0; i < racks.length; i++) {
    for (let j = i + 1; j < racks.length; j++) {
      const distance = calculateMinDistance(racks[i], racks[j]);
      if (distance < minAisleWidth) {
        issues.push({
          severity: 'error',
          category: 'access',
          message: `Insufficient aisle width (${distance.toFixed(2)}m) for maintenance access`,
          affectedObjects: [racks[i].id, racks[j].id]
        });
      }
    }
  }
  
  // Check perimeter access
  const perimeterFixtures = fixtures.filter(f => 
    f.x < 1 || f.x > roomDimensions.width - 1 ||
    f.y < 1 || f.y > roomDimensions.length - 1
  );
  
  if (perimeterFixtures.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'access',
      message: 'Fixtures too close to walls may be difficult to maintain',
      affectedObjects: perimeterFixtures.map(f => f.id)
    });
  }
  
  return issues;
}

function validateHeightClearances(
  fixtures: DesignObject[],
  racks: DesignObject[],
  roomDimensions: { width: number; length: number; height: number }
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Check fixture to canopy clearance
  racks.forEach(rack => {
    const fixturesAbove = fixtures.filter(f => 
      f.x >= rack.x - rack.width/2 && f.x <= rack.x + rack.width/2 &&
      f.y >= rack.y - rack.length/2 && f.y <= rack.y + rack.length/2 &&
      f.z > rack.z && f.z < rack.z + rack.height + 1
    );
    
    fixturesAbove.forEach(fixture => {
      const clearance = fixture.z - (rack.z + rack.height);
      const minClearance = 0.3; // 30cm minimum
      const maxClearance = 1.5; // 1.5m maximum
      
      if (clearance < minClearance) {
        issues.push({
          severity: 'error',
          category: 'clearance',
          message: `Fixture too close to canopy (${(clearance * 100).toFixed(0)}cm)`,
          affectedObjects: [fixture.id, rack.id]
        });
      } else if (clearance > maxClearance) {
        issues.push({
          severity: 'warning',
          category: 'clearance',
          message: `Fixture too far from canopy (${clearance.toFixed(1)}m) - reduced efficiency`,
          affectedObjects: [fixture.id]
        });
      }
    });
  });
  
  return issues;
}

function validateHeatLoad(
  fixtures: DesignObject[],
  roomDimensions: { width: number; length: number; height: number },
  cropType?: string
): { issues: ValidationIssue[]; suggestions: Suggestion[] } {
  const issues: ValidationIssue[] = [];
  const suggestions: Suggestion[] = [];
  
  // Calculate heat load in BTU/hr
  const totalWattage = fixtures.reduce((sum, f) => sum + (f.model?.wattage || 0), 0);
  const heatLoadBTU = totalWattage * 3.412;
  const roomVolume = roomDimensions.width * roomDimensions.length * roomDimensions.height;
  const btuPerCubicMeter = heatLoadBTU / roomVolume;
  
  // Thresholds vary by crop type
  const maxBTUPerM3 = cropType === 'cannabis' ? 150 : 100;
  
  if (btuPerCubicMeter > maxBTUPerM3) {
    issues.push({
      severity: 'warning',
      category: 'thermal',
      message: `High heat load: ${btuPerCubicMeter.toFixed(0)} BTU/m³ (recommended < ${maxBTUPerM3})`
    });
    
    suggestions.push({
      priority: 'high',
      category: 'thermal',
      message: `HVAC system needs ${(heatLoadBTU / 12000).toFixed(1)} tons of cooling capacity`
    });
  }
  
  return { issues, suggestions };
}

function checkForShadowing(fixtures: DesignObject[], racks: DesignObject[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Check for fixtures that might shadow each other
  fixtures.forEach((fixture, index) => {
    const fixturesBelow = fixtures.filter((f, i) => 
      i !== index &&
      Math.abs(f.x - fixture.x) < 0.5 &&
      Math.abs(f.y - fixture.y) < 0.5 &&
      f.z < fixture.z
    );
    
    if (fixturesBelow.length > 0) {
      issues.push({
        severity: 'warning',
        category: 'shadowing',
        message: 'Fixture may shadow fixtures below',
        affectedObjects: [fixture.id, ...fixturesBelow.map(f => f.id)]
      });
    }
  });
  
  return issues;
}

function validateDLI(
  estimatedDLI: number,
  cropType: string
): { issues: ValidationIssue[]; suggestions: Suggestion[] } {
  const issues: ValidationIssue[] = [];
  const suggestions: Suggestion[] = [];
  
  const dliTargets: Record<string, { min: number; max: number; optimal: number }> = {
    cannabis: { min: 25, max: 45, optimal: 35 },
    lettuce: { min: 12, max: 17, optimal: 15 },
    tomatoes: { min: 20, max: 30, optimal: 25 },
    herbs: { min: 10, max: 15, optimal: 12 },
    microgreens: { min: 8, max: 12, optimal: 10 }
  };
  
  const target = dliTargets[cropType];
  if (!target) return { issues, suggestions };
  
  if (estimatedDLI < target.min) {
    issues.push({
      severity: 'warning',
      category: 'DLI',
      message: `DLI (${estimatedDLI.toFixed(1)}) below minimum for ${cropType} (${target.min})`
    });
    
    suggestions.push({
      priority: 'high',
      category: 'DLI',
      message: 'Increase PPFD or photoperiod to reach optimal DLI'
    });
  } else if (estimatedDLI > target.max) {
    issues.push({
      severity: 'warning',
      category: 'DLI',
      message: `DLI (${estimatedDLI.toFixed(1)}) exceeds maximum for ${cropType} (${target.max})`
    });
    
    suggestions.push({
      priority: 'medium',
      category: 'DLI',
      message: 'Consider dimming or reducing photoperiod to save energy'
    });
  }
  
  return { issues, suggestions };
}

// Helper functions
function generateGridPoints(
  roomDimensions: { width: number; length: number },
  spacing: number
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let x = spacing/2; x < roomDimensions.width; x += spacing) {
    for (let y = spacing/2; y < roomDimensions.length; y += spacing) {
      points.push({ x, y });
    }
  }
  return points;
}

function calculatePPFDAtPoint(
  point: { x: number; y: number },
  fixtures: DesignObject[]
): number {
  // Simplified calculation - real implementation would use IES data
  let totalPPFD = 0;
  fixtures.forEach(fixture => {
    const distance = Math.sqrt(
      Math.pow(fixture.x - point.x, 2) + 
      Math.pow(fixture.y - point.y, 2) +
      Math.pow(fixture.z, 2)
    );
    const ppf = fixture.model?.ppf || 0;
    const beamAngle = fixture.model?.beamAngle || 120;
    // Simplified inverse square law with beam angle consideration
    const intensity = ppf / (4 * Math.PI * distance * distance) * (beamAngle / 180);
    totalPPFD += intensity;
  });
  return totalPPFD;
}

function calculateDistance(obj1: DesignObject, obj2: DesignObject): number {
  return Math.sqrt(
    Math.pow(obj1.x - obj2.x, 2) +
    Math.pow(obj1.y - obj2.y, 2) +
    Math.pow(obj1.z - obj2.z, 2)
  );
}

function calculateMinDistance(obj1: DesignObject, obj2: DesignObject): number {
  // Calculate minimum distance between two rectangular objects
  const dx = Math.max(0, Math.abs(obj1.x - obj2.x) - (obj1.width + obj2.width) / 2);
  const dy = Math.max(0, Math.abs(obj1.y - obj2.y) - (obj1.length + obj2.length) / 2);
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateAverageSpacing(fixtures: DesignObject[]): number {
  if (fixtures.length < 2) return 0;
  let totalDistance = 0;
  let count = 0;
  
  for (let i = 0; i < fixtures.length; i++) {
    for (let j = i + 1; j < fixtures.length; j++) {
      totalDistance += calculateDistance(fixtures[i], fixtures[j]);
      count++;
    }
  }
  
  return totalDistance / count;
}

function calculateCoverageArea(fixtures: DesignObject[]): number {
  // Simplified - assumes circular coverage pattern
  let totalArea = 0;
  fixtures.forEach(fixture => {
    const beamAngle = fixture.model?.beamAngle || 120;
    const radius = fixture.z * Math.tan((beamAngle / 2) * Math.PI / 180);
    totalArea += Math.PI * radius * radius;
  });
  return totalArea;
}

function calculateMaintenanceScore(
  fixtures: DesignObject[],
  racks: DesignObject[],
  roomDimensions: { width: number; length: number; height: number }
): number {
  let score = 1.0;
  
  // Deduct for fixtures too high
  const highFixtures = fixtures.filter(f => f.z > 3);
  score -= (highFixtures.length / fixtures.length) * 0.2;
  
  // Deduct for tight spacing
  const avgSpacing = calculateAverageSpacing(fixtures);
  if (avgSpacing < 1.5) score -= 0.2;
  
  // Deduct for poor aisle access
  if (racks.length > 1) {
    const minAisle = Math.min(...racks.map((r1, i) => 
      racks.slice(i + 1).map(r2 => calculateMinDistance(r1, r2))
    ).flat());
    if (minAisle < 1) score -= 0.3;
  }
  
  return Math.max(0, score);
}

function calculateElectricalBalance(
  fixtures: DesignObject[],
  roomDimensions: { width: number; length: number; height: number }
): number {
  // Calculate load distribution variance
  const quadrants = 4;
  const quadrantLoads: number[] = new Array(quadrants).fill(0);
  
  fixtures.forEach(fixture => {
    const quadrantX = fixture.x < roomDimensions.width / 2 ? 0 : 1;
    const quadrantY = fixture.y < roomDimensions.length / 2 ? 0 : 1;
    const quadrantIndex = quadrantY * 2 + quadrantX;
    quadrantLoads[quadrantIndex] += fixture.model?.wattage || 0;
  });
  
  const avgLoad = quadrantLoads.reduce((sum, load) => sum + load, 0) / quadrants;
  const variance = quadrantLoads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / quadrants;
  const stdDev = Math.sqrt(variance);
  const cv = avgLoad > 0 ? stdDev / avgLoad : 0;
  
  return Math.max(0, 1 - cv); // Return 1 for perfect balance, 0 for poor balance
}

function calculateOverallScore(metrics: DesignMetrics, issues: ValidationIssue[]): number {
  let score = 100;
  
  // Deduct points for issues
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'error': score -= 15; break;
      case 'warning': score -= 5; break;
      case 'info': score -= 1; break;
    }
  });
  
  // Bonus points for good metrics
  if (metrics.uniformityRatio > 0.8) score += 5;
  if (metrics.coverageEfficiency > 0.9) score += 5;
  if (metrics.electricalLoadBalance > 0.9) score += 5;
  if (metrics.maintenanceAccessibility > 0.8) score += 5;
  
  return Math.max(0, Math.min(100, score));
}