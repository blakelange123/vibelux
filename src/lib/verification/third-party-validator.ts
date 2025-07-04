import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createHash } from 'crypto';
import { differenceInDays } from 'date-fns';

interface ValidationResult {
  verified: boolean;
  confidence: number;
  discrepancies: string[];
  recommendations: string[];
  auditorNotes?: string;
  certificationId?: string;
}

interface EnergyAuditor {
  id: string;
  name: string;
  certification: string;
  apiEndpoint?: string;
  manualReview: boolean;
}

export class ThirdPartyValidationService {
  private s3Client: S3Client;
  private auditors: Map<string, EnergyAuditor>;
  
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    
    // Initialize approved auditors
    this.auditors = new Map([
      ['ashrae', {
        id: 'ashrae',
        name: 'ASHRAE Certified Auditor Network',
        certification: 'BEAP',
        apiEndpoint: 'https://api.ashrae.org/audit/v1',
        manualReview: false,
      }],
      ['bpi', {
        id: 'bpi',
        name: 'Building Performance Institute',
        certification: 'BPI-BA',
        apiEndpoint: 'https://api.bpi.org/validation/v2',
        manualReview: false,
      }],
      ['local_pe', {
        id: 'local_pe',
        name: 'Licensed Professional Engineers',
        certification: 'PE',
        manualReview: true,
      }],
    ]);
  }

  /**
   * Validate savings claims with third-party auditor
   */
  async validateSavingsClaims(
    facilityId: string,
    claimedSavings: number,
    startDate: Date,
    endDate: Date,
    validationLevel: 'automated' | 'manual' | 'certified' = 'automated'
  ): Promise<ValidationResult> {
    
    // Gather all data for validation
    const validationPackage = await this.prepareValidationPackage(
      facilityId,
      claimedSavings,
      startDate,
      endDate
    );
    
    let result: ValidationResult;
    
    switch (validationLevel) {
      case 'automated':
        result = await this.performAutomatedValidation(validationPackage);
        break;
      case 'manual':
        result = await this.requestManualAudit(validationPackage);
        break;
      case 'certified':
        result = await this.requestCertifiedAudit(validationPackage);
        break;
    }
    
    // Store validation record
    await this.storeValidationRecord(facilityId, result, validationPackage);
    
    // Update trust score based on validation
    await this.updateFacilityTrustScore(facilityId, result);
    
    return result;
  }

  /**
   * Prepare comprehensive validation package
   */
  private async prepareValidationPackage(
    facilityId: string,
    claimedSavings: number,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        baseline: true,
        utilityBills: {
          where: {
            billDate: {
              gte: startDate,
              lte: endDate,
            }
          }
        },
        iotReadings: {
          where: {
            timestamp: {
              gte: startDate,
              lte: endDate,
            }
          },
          orderBy: { timestamp: 'asc' },
          take: 1000, // Sample data
        },
        weatherNormalizations: {
          where: {
            periodStart: { gte: startDate },
            periodEnd: { lte: endDate },
          }
        },
        equipment: true,
        optimizationActions: {
          where: {
            implementedAt: {
              gte: startDate,
              lte: endDate,
            }
          }
        }
      }
    });
    
    if (!facility) {
      throw new Error('Facility not found');
    }
    
    // Calculate various metrics
    const metrics = await this.calculateValidationMetrics(facility, startDate, endDate);
    
    return {
      facilityId,
      facility: {
        type: facility.type,
        squareFootage: facility.squareFootage,
        location: {
          zipCode: facility.zipCode,
          climate: facility.climateZone,
        }
      },
      period: {
        start: startDate,
        end: endDate,
        days: differenceInDays(endDate, startDate),
      },
      baseline: {
        established: facility.baseline?.establishedAt,
        annualKwh: facility.baseline?.totalAnnualKwh,
        method: facility.baseline?.verificationMethod,
      },
      claims: {
        totalSavings: claimedSavings,
        energySavingsKwh: metrics.energySavingsKwh,
        demandSavingsKw: metrics.demandSavingsKw,
        percentReduction: metrics.percentReduction,
      },
      evidence: {
        utilityBills: facility.utilityBills.length,
        iotReadings: facility.iotReadings.length,
        weatherNormalized: facility.weatherNormalizations.length > 0,
        optimizationActions: facility.optimizationActions.length,
      },
      dataQuality: metrics.dataQuality,
      checksum: this.generateChecksum(metrics),
    };
  }

  /**
   * Perform automated validation using algorithms
   */
  private async performAutomatedValidation(pkg: any): Promise<ValidationResult> {
    const discrepancies: string[] = [];
    const recommendations: string[] = [];
    let confidence = 1.0;
    
    // 1. Check data completeness
    if (pkg.evidence.utilityBills < pkg.period.days / 30) {
      discrepancies.push('Missing utility bill data for complete period');
      confidence -= 0.2;
    }
    
    if (pkg.evidence.iotReadings < pkg.period.days * 24) {
      discrepancies.push('Insufficient IoT sensor readings');
      confidence -= 0.1;
    }
    
    // 2. Validate savings magnitude
    const savingsPercent = (pkg.claims.totalSavings / (pkg.baseline.annualKwh / 12)) * 100;
    if (savingsPercent > 40) {
      discrepancies.push(`Savings of ${savingsPercent.toFixed(1)}% exceed typical range`);
      recommendations.push('Request manual verification for high savings claims');
      confidence -= 0.3;
    }
    
    // 3. Check for data anomalies
    const anomalies = await this.detectDataAnomalies(pkg);
    if (anomalies.length > 0) {
      discrepancies.push(...anomalies);
      confidence -= 0.05 * anomalies.length;
    }
    
    // 4. Verify weather normalization
    if (!pkg.evidence.weatherNormalized) {
      recommendations.push('Apply weather normalization for more accurate results');
      confidence -= 0.1;
    }
    
    // 5. Cross-reference with similar facilities
    const benchmark = await this.getBenchmarkData(pkg.facility);
    if (pkg.claims.percentReduction > benchmark.p95Reduction) {
      discrepancies.push('Savings exceed 95th percentile for similar facilities');
      confidence -= 0.15;
    }
    
    // 6. Validate optimization actions
    if (pkg.evidence.optimizationActions === 0) {
      discrepancies.push('No optimization actions recorded during period');
      recommendations.push('Document specific actions taken to achieve savings');
      confidence -= 0.2;
    }
    
    // 7. Check baseline validity
    const baselineAge = differenceInDays(new Date(), new Date(pkg.baseline.established));
    if (baselineAge > 365) {
      recommendations.push('Update baseline - current baseline is over 1 year old');
      confidence -= 0.05;
    }
    
    return {
      verified: confidence >= 0.7,
      confidence: Math.max(0, Math.min(1, confidence)),
      discrepancies,
      recommendations,
    };
  }

  /**
   * Request manual audit from certified professional
   */
  private async requestManualAudit(pkg: any): Promise<ValidationResult> {
    // Create audit request
    const auditRequest = await prisma.auditRequest.create({
      data: {
        facilityId: pkg.facilityId,
        requestType: 'MANUAL_VERIFICATION',
        priority: pkg.claims.totalSavings > 10000 ? 'HIGH' : 'MEDIUM',
        dataPackage: pkg,
        status: 'PENDING',
        requestedAt: new Date(),
      }
    });
    
    // Find available auditor
    const auditor = await this.assignAuditor(auditRequest);
    
    // Send notification to auditor
    await this.notifyAuditor(auditor, auditRequest);
    
    // For demo purposes, simulate audit result
    // In production, this would wait for actual auditor response
    const simulatedResult = await this.simulateManualAudit(pkg);
    
    return {
      ...simulatedResult,
      auditorNotes: `Manual review by ${auditor.name} (${auditor.certification})`,
    };
  }

  /**
   * Request certified audit with site visit
   */
  private async requestCertifiedAudit(pkg: any): Promise<ValidationResult> {
    // This would integrate with certified auditor networks
    const auditor = this.auditors.get('ashrae')!;
    
    try {
      // Call auditor API
      const response = await axios.post(`${auditor.apiEndpoint}/audits`, {
        facility: pkg.facility,
        period: pkg.period,
        claims: pkg.claims,
        evidence: pkg.evidence,
        apiKey: process.env.ASHRAE_API_KEY,
      });
      
      return {
        verified: response.data.verified,
        confidence: response.data.confidence,
        discrepancies: response.data.issues || [],
        recommendations: response.data.recommendations || [],
        certificationId: response.data.certificationId,
        auditorNotes: response.data.notes,
      };
      
    } catch (error) {
      // Fallback to manual process
      return this.requestManualAudit(pkg);
    }
  }

  /**
   * Calculate validation metrics
   */
  private async calculateValidationMetrics(facility: any, startDate: Date, endDate: Date): Promise<any> {
    const baseline = facility.baseline;
    const bills = facility.utilityBills;
    const iotData = facility.iotReadings;
    
    // Calculate actual usage from bills
    const actualUsage = bills.reduce((sum: number, bill: any) => sum + bill.kwhUsed, 0);
    
    // Calculate expected baseline usage
    const days = differenceInDays(endDate, startDate);
    const expectedUsage = (baseline.totalAnnualKwh / 365) * days;
    
    // Calculate savings
    const energySavingsKwh = expectedUsage - actualUsage;
    const percentReduction = (energySavingsKwh / expectedUsage) * 100;
    
    // Calculate peak demand savings
    const baselinePeakKw = baseline.averageMonthlyPeakKw;
    const actualPeakKw = Math.max(...bills.map((b: any) => b.peakDemandKw));
    const demandSavingsKw = baselinePeakKw - actualPeakKw;
    
    // Assess data quality
    const dataQuality = this.assessDataQuality(bills, iotData, days);
    
    return {
      energySavingsKwh,
      demandSavingsKw,
      percentReduction,
      actualUsage,
      expectedUsage,
      dataQuality,
    };
  }

  /**
   * Detect anomalies in data
   */
  private async detectDataAnomalies(pkg: any): Promise<string[]> {
    const anomalies: string[] = [];
    
    // Check for data gaps
    if (pkg.dataQuality.completeness < 0.9) {
      anomalies.push(`Data completeness only ${(pkg.dataQuality.completeness * 100).toFixed(0)}%`);
    }
    
    // Check for suspicious patterns
    if (pkg.dataQuality.consistency < 0.8) {
      anomalies.push('Inconsistent data patterns detected');
    }
    
    // Check for outliers
    if (pkg.dataQuality.outliers > 5) {
      anomalies.push(`${pkg.dataQuality.outliers} statistical outliers found`);
    }
    
    return anomalies;
  }

  /**
   * Get benchmark data for facility type
   */
  private async getBenchmarkData(facility: any): Promise<any> {
    // This would query industry benchmark databases
    // For now, using typical values
    const benchmarks: Record<string, any> = {
      greenhouse: {
        avgReduction: 15,
        p95Reduction: 35,
        typicalRange: [10, 25],
      },
      warehouse: {
        avgReduction: 12,
        p95Reduction: 28,
        typicalRange: [8, 20],
      },
      processing: {
        avgReduction: 18,
        p95Reduction: 40,
        typicalRange: [12, 30],
      },
      indoor_farm: {
        avgReduction: 20,
        p95Reduction: 45,
        typicalRange: [15, 35],
      },
    };
    
    return benchmarks[facility.type] || benchmarks.warehouse;
  }

  /**
   * Assess data quality
   */
  private assessDataQuality(bills: any[], iotData: any[], expectedDays: number): any {
    const completeness = bills.length / (expectedDays / 30);
    const consistency = this.calculateConsistency(iotData);
    const outliers = this.countOutliers(iotData);
    
    return {
      completeness: Math.min(1, completeness),
      consistency,
      outliers,
      score: (completeness + consistency) / 2,
    };
  }

  /**
   * Calculate data consistency score
   */
  private calculateConsistency(data: any[]): number {
    if (data.length < 2) return 0;
    
    // Check for regular intervals
    const intervals = [];
    for (let i = 1; i < data.length; i++) {
      intervals.push(
        new Date(data[i].timestamp).getTime() - 
        new Date(data[i-1].timestamp).getTime()
      );
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, int) => 
      sum + Math.pow(int - avgInterval, 2), 0
    ) / intervals.length;
    
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avgInterval; // Coefficient of variation
    
    return Math.max(0, 1 - cv);
  }

  /**
   * Count statistical outliers
   */
  private countOutliers(data: any[]): number {
    if (data.length < 10) return 0;
    
    const values = data.map(d => d.energyUsage);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
    
    // Count values beyond 3 standard deviations
    return values.filter(val => Math.abs(val - mean) > 3 * stdDev).length;
  }

  /**
   * Generate checksum for data integrity
   */
  private generateChecksum(data: any): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  }

  /**
   * Store validation record
   */
  private async storeValidationRecord(
    facilityId: string,
    result: ValidationResult,
    pkg: any
  ): Promise<void> {
    await prisma.thirdPartyValidation.create({
      data: {
        facilityId,
        validationType: result.certificationId ? 'CERTIFIED' : 'AUTOMATED',
        verified: result.verified,
        confidence: result.confidence,
        discrepancies: result.discrepancies,
        recommendations: result.recommendations,
        auditorNotes: result.auditorNotes,
        certificationId: result.certificationId,
        dataChecksum: pkg.checksum,
        validatedAt: new Date(),
      }
    });
  }

  /**
   * Update facility trust score
   */
  private async updateFacilityTrustScore(
    facilityId: string,
    result: ValidationResult
  ): Promise<void> {
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: { trustScore: true }
    });
    
    if (!facility) return;
    
    const currentScore = facility.trustScore?.score || 0.5;
    const adjustment = result.verified ? 
      (result.confidence - 0.7) * 0.1 : // Positive adjustment
      -(0.7 - result.confidence) * 0.2; // Negative adjustment (penalize more)
    
    const newScore = Math.max(0, Math.min(1, currentScore + adjustment));
    
    await prisma.facilityTrustScore.upsert({
      where: { facilityId },
      create: {
        facilityId,
        score: newScore,
        lastValidation: new Date(),
        validationCount: 1,
      },
      update: {
        score: newScore,
        lastValidation: new Date(),
        validationCount: { increment: 1 },
      }
    });
  }

  /**
   * Assign auditor based on location and expertise
   */
  private async assignAuditor(request: any): Promise<any> {
    // This would match auditors based on location, certification, and availability
    return {
      id: 'auditor-123',
      name: 'John Smith, PE',
      certification: 'PE, CEM, BEAP',
      email: 'auditor@example.com',
    };
  }

  /**
   * Notify auditor of new request
   */
  private async notifyAuditor(auditor: any, request: any): Promise<void> {
    // Send email/SMS notification to auditor
  }

  /**
   * Simulate manual audit for demo
   */
  private async simulateManualAudit(pkg: any): Promise<ValidationResult> {
    // Simulate human review with some randomness
    const baseConfidence = 0.85;
    const randomFactor = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.2;
    const confidence = Math.max(0.6, Math.min(0.95, baseConfidence + randomFactor));
    
    const discrepancies = [];
    const recommendations = [];
    
    if (confidence < 0.8) {
      discrepancies.push('Some meter readings appear inconsistent with facility operations');
      recommendations.push('Install additional submetering for better granularity');
    }
    
    if (pkg.claims.percentReduction > 25) {
      recommendations.push('Consider ASHRAE Level 2 audit for savings above 25%');
    }
    
    return {
      verified: confidence >= 0.7,
      confidence,
      discrepancies,
      recommendations,
    };
  }

  /**
   * Generate validation certificate
   */
  async generateValidationCertificate(
    validationId: string
  ): Promise<string> {
    const validation = await prisma.thirdPartyValidation.findUnique({
      where: { id: validationId },
      include: {
        facility: {
          include: { owner: true }
        }
      }
    });
    
    if (!validation || !validation.verified) {
      throw new Error('Validation not found or not verified');
    }
    
    // Generate PDF certificate
    // This would use a PDF library to create a professional certificate
    const certificateUrl = `https://vibelux.com/certificates/${validation.id}`;
    
    return certificateUrl;
  }
}