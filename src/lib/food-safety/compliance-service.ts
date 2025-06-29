/**
 * Comprehensive Food Safety Compliance Service
 * Manages HACCP, FSMA, and multi-buyer compliance requirements
 */

import { prisma } from '@/lib/prisma';
import { sensorManager } from '@/lib/integrations/iot-sensors';
import { LIMSIntegrationService } from '@/lib/integrations/lims-integration';

interface ComplianceProfile {
  id: string;
  facilityId: string;
  buyerName: string;
  buyerType: 'US_FOODS' | 'WHOLE_FOODS' | 'SYSCO' | 'KROGER' | 'WALMART' | 'COSTCO' | 'CUSTOM';
  requirements: ComplianceRequirement[];
  certifications: Certification[];
  status: 'active' | 'pending' | 'expired' | 'suspended';
  lastAuditDate?: Date;
  nextAuditDate?: Date;
}

interface ComplianceRequirement {
  id: string;
  name: string;
  category: 'food_safety' | 'quality' | 'environmental' | 'social' | 'traceability';
  required: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  currentStatus: 'compliant' | 'non_compliant' | 'pending' | 'na';
  lastVerified?: Date;
  evidence?: Evidence[];
}

interface Certification {
  type: 'GFSI' | 'GAP' | 'ORGANIC' | 'NON_GMO' | 'FAIR_TRADE' | 'RAINFOREST' | 'CUSTOM';
  subType?: string; // BRC, SQF, FSSC22000, etc.
  certificateNumber: string;
  issueDate: Date;
  expiryDate: Date;
  certifyingBody: string;
  documentUrl?: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

interface Evidence {
  type: 'document' | 'record' | 'sensor_data' | 'lab_result' | 'audit_report';
  title: string;
  date: Date;
  url?: string;
  data?: any;
}

interface HACCPPlan {
  id: string;
  facilityId: string;
  version: string;
  effectiveDate: Date;
  approvedBy: string;
  hazardAnalysis: HazardAnalysis[];
  criticalControlPoints: CCP[];
  monitoringProcedures: MonitoringProcedure[];
  correctiveActions: CorrectiveAction[];
  verificationActivities: VerificationActivity[];
  status: 'draft' | 'approved' | 'under_review';
}

interface HazardAnalysis {
  step: string;
  hazardType: 'biological' | 'chemical' | 'physical' | 'allergen';
  hazardDescription: string;
  severity: 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  preventiveControl: string;
  isCCP: boolean;
}

interface CCP {
  id: string;
  stepName: string;
  hazardType: string;
  criticalLimit: {
    parameter: string;
    min?: number;
    max?: number;
    unit: string;
  };
  monitoringFrequency: string;
  responsiblePerson: string;
  sensorId?: string; // Link to IoT sensor for automated monitoring
}

interface MonitoringProcedure {
  ccpId: string;
  method: 'manual' | 'automated' | 'hybrid';
  frequency: string;
  recordType: string;
  sensorIntegration?: {
    sensorId: string;
    parameter: string;
    alertThresholds: {
      warning: number;
      critical: number;
    };
  };
}

interface CorrectiveAction {
  ccpId: string;
  trigger: string;
  immediateAction: string;
  rootCauseAnalysis: boolean;
  preventiveAction: string;
  notificationList: string[];
  recordingRequirement: string;
}

interface VerificationActivity {
  type: 'calibration' | 'record_review' | 'third_party_audit' | 'product_testing' | 'environmental_monitoring';
  frequency: string;
  responsible: string;
  acceptanceCriteria: string;
  lastCompleted?: Date;
  nextDue: Date;
}

interface ComplianceAlert {
  id: string;
  facilityId: string;
  type: 'deviation' | 'expiry' | 'audit_due' | 'training_due' | 'verification_due';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  requiresAction: boolean;
  actionItems?: string[];
}

export class FoodSafetyComplianceService {
  private limsService?: LIMSIntegrationService;

  constructor(limsConfig?: any) {
    if (limsConfig) {
      this.limsService = new LIMSIntegrationService(limsConfig);
    }
  }

  /**
   * Create compliance profile for a buyer
   */
  async createComplianceProfile(
    facilityId: string,
    buyerType: ComplianceProfile['buyerType'],
    customRequirements?: Partial<ComplianceRequirement>[]
  ): Promise<ComplianceProfile> {
    const baseRequirements = this.getBaseRequirements(buyerType);
    const requirements = customRequirements 
      ? this.mergeRequirements(baseRequirements, customRequirements)
      : baseRequirements;

    const profile = await prisma.complianceProfile.create({
      data: {
        facilityId,
        buyerName: this.getBuyerName(buyerType),
        buyerType,
        requirements: {
          create: requirements
        },
        status: 'pending',
        createdAt: new Date()
      },
      include: {
        requirements: true,
        certifications: true
      }
    });

    // Schedule initial compliance tasks
    await this.scheduleComplianceTasks(profile.id);

    return this.transformProfile(profile);
  }

  /**
   * Get base requirements for each buyer
   */
  private getBaseRequirements(buyerType: ComplianceProfile['buyerType']): ComplianceRequirement[] {
    const commonRequirements: ComplianceRequirement[] = [
      {
        id: 'gfsi-cert',
        name: 'GFSI Certification',
        category: 'food_safety',
        required: true,
        frequency: 'annual',
        currentStatus: 'pending'
      },
      {
        id: 'haccp-plan',
        name: 'HACCP/Food Safety Plan',
        category: 'food_safety',
        required: true,
        frequency: 'annual',
        currentStatus: 'pending'
      },
      {
        id: 'allergen-mgmt',
        name: 'Allergen Management Program',
        category: 'food_safety',
        required: true,
        frequency: 'annual',
        currentStatus: 'pending'
      },
      {
        id: 'traceability',
        name: 'Traceability System',
        category: 'traceability',
        required: true,
        frequency: 'quarterly',
        currentStatus: 'pending'
      },
      {
        id: 'recall-program',
        name: 'Recall Program & Mock Recalls',
        category: 'food_safety',
        required: true,
        frequency: 'quarterly',
        currentStatus: 'pending'
      }
    ];

    const buyerSpecific: Record<string, ComplianceRequirement[]> = {
      US_FOODS: [
        {
          id: 'usf-24-7-contact',
          name: '24/7 Emergency Contact',
          category: 'quality',
          required: true,
          currentStatus: 'pending'
        },
        {
          id: 'usf-ttr',
          name: 'TTR Device for Transportation',
          category: 'quality',
          required: true,
          currentStatus: 'pending'
        },
        {
          id: 'usf-cross-valley',
          name: 'Cross Valley Farms Standards',
          category: 'quality',
          required: true,
          frequency: 'daily',
          currentStatus: 'pending'
        }
      ],
      WHOLE_FOODS: [
        {
          id: 'wfm-responsibly-grown',
          name: 'Responsibly Grown Rating',
          category: 'environmental',
          required: true,
          frequency: 'annual',
          currentStatus: 'pending'
        },
        {
          id: 'wfm-banned-ingredients',
          name: 'Banned Ingredient Compliance',
          category: 'quality',
          required: true,
          currentStatus: 'pending'
        },
        {
          id: 'wfm-local-program',
          name: 'Local Producer Requirements',
          category: 'social',
          required: false,
          currentStatus: 'na'
        }
      ],
      SYSCO: [
        {
          id: 'sysco-quality-assurance',
          name: 'Sysco Quality Assurance Program',
          category: 'quality',
          required: true,
          frequency: 'annual',
          currentStatus: 'pending'
        },
        {
          id: 'sysco-sustainability',
          name: 'Sustainable Agriculture Practices',
          category: 'environmental',
          required: false,
          currentStatus: 'pending'
        }
      ],
      KROGER: [
        {
          id: 'kroger-food-safety',
          name: 'Kroger Food Safety Standards',
          category: 'food_safety',
          required: true,
          frequency: 'annual',
          currentStatus: 'pending'
        },
        {
          id: 'kroger-social-compliance',
          name: 'Social Compliance Audit',
          category: 'social',
          required: true,
          frequency: 'annual',
          currentStatus: 'pending'
        }
      ],
      WALMART: [
        {
          id: 'walmart-food-safety',
          name: 'Walmart Food Safety Requirements',
          category: 'food_safety',
          required: true,
          frequency: 'annual',
          currentStatus: 'pending'
        },
        {
          id: 'walmart-blockchain',
          name: 'Blockchain Traceability',
          category: 'traceability',
          required: true,
          currentStatus: 'pending'
        },
        {
          id: 'walmart-sustainability',
          name: 'Project Gigaton Reporting',
          category: 'environmental',
          required: false,
          currentStatus: 'pending'
        }
      ],
      COSTCO: [
        {
          id: 'costco-addendum',
          name: 'Costco Food Safety Addendum',
          category: 'food_safety',
          required: true,
          frequency: 'annual',
          currentStatus: 'pending'
        },
        {
          id: 'costco-specs',
          name: 'Product Specification Compliance',
          category: 'quality',
          required: true,
          currentStatus: 'pending'
        }
      ]
    };

    return [...commonRequirements, ...(buyerSpecific[buyerType] || [])];
  }

  /**
   * Create or update HACCP plan
   */
  async createHACCPPlan(
    facilityId: string,
    planData: Partial<HACCPPlan>
  ): Promise<HACCPPlan> {
    // Validate hazard analysis
    if (!planData.hazardAnalysis || planData.hazardAnalysis.length === 0) {
      throw new Error('Hazard analysis is required');
    }

    // Identify CCPs from hazard analysis
    const ccps = planData.hazardAnalysis
      .filter(ha => ha.isCCP)
      .map((ha, index) => ({
        id: `ccp-${index + 1}`,
        stepName: ha.step,
        hazardType: ha.hazardType,
        criticalLimit: this.determineCriticalLimit(ha),
        monitoringFrequency: this.determineMonitoringFrequency(ha),
        responsiblePerson: 'QA Manager' // Default, should be customized
      }));

    // Create monitoring procedures with sensor integration where possible
    const monitoringProcedures = await this.createMonitoringProcedures(ccps);

    const haccp = await prisma.haccpPlan.create({
      data: {
        facilityId,
        version: planData.version || '1.0',
        effectiveDate: planData.effectiveDate || new Date(),
        approvedBy: planData.approvedBy || 'Pending Approval',
        status: 'draft',
        hazardAnalysis: {
          create: planData.hazardAnalysis
        },
        criticalControlPoints: {
          create: ccps
        },
        monitoringProcedures: {
          create: monitoringProcedures
        },
        correctiveActions: {
          create: this.generateCorrectiveActions(ccps)
        },
        verificationActivities: {
          create: this.generateVerificationActivities()
        }
      },
      include: {
        hazardAnalysis: true,
        criticalControlPoints: true,
        monitoringProcedures: true,
        correctiveActions: true,
        verificationActivities: true
      }
    });

    return this.transformHACCP(haccp);
  }

  /**
   * Monitor CCPs in real-time
   */
  async monitorCCPs(facilityId: string): Promise<{
    ccpId: string;
    status: 'in_control' | 'warning' | 'out_of_control';
    currentValue: number;
    criticalLimit: any;
    timestamp: Date;
  }[]> {
    const haccp = await this.getActiveHACCPPlan(facilityId);
    if (!haccp) {
      throw new Error('No active HACCP plan found');
    }

    const monitoringResults = [];

    for (const ccp of haccp.criticalControlPoints) {
      const monitoring = haccp.monitoringProcedures.find(m => m.ccpId === ccp.id);
      
      if (monitoring?.sensorIntegration) {
        // Get real-time sensor data
        const sensorData = await this.getSensorReading(monitoring.sensorIntegration.sensorId);
        
        if (sensorData) {
          const status = this.evaluateCCPStatus(
            sensorData.value,
            ccp.criticalLimit,
            monitoring.sensorIntegration.alertThresholds
          );

          monitoringResults.push({
            ccpId: ccp.id,
            status,
            currentValue: sensorData.value,
            criticalLimit: ccp.criticalLimit,
            timestamp: new Date()
          });

          // Create alert if out of control
          if (status === 'out_of_control') {
            await this.createComplianceAlert({
              facilityId,
              type: 'deviation',
              severity: 'critical',
              title: `CCP ${ccp.stepName} Out of Control`,
              description: `${monitoring.sensorIntegration.parameter} reading ${sensorData.value} exceeds critical limit`,
              requiresAction: true,
              actionItems: haccp.correctiveActions
                .filter(ca => ca.ccpId === ccp.id)
                .map(ca => ca.immediateAction)
            });
          }
        }
      }
    }

    return monitoringResults;
  }

  /**
   * Perform mock recall
   */
  async performMockRecall(
    facilityId: string,
    productInfo: {
      productName: string;
      lotNumber: string;
      productionDate: Date;
    }
  ): Promise<{
    startTime: Date;
    endTime: Date;
    duration: number; // minutes
    tracedQuantity: number;
    totalQuantity: number;
    effectiveness: number; // percentage
    locations: any[];
    passed: boolean;
  }> {
    const startTime = new Date();

    // Trace forward from production
    const forwardTrace = await this.traceForward(facilityId, productInfo.lotNumber);
    
    // Trace backward to ingredients
    const backwardTrace = await this.traceBackward(facilityId, productInfo.lotNumber);

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000 / 60; // minutes

    // Calculate effectiveness
    const totalQuantity = await this.getTotalProductionQuantity(facilityId, productInfo.lotNumber);
    const tracedQuantity = forwardTrace.reduce((sum, item) => sum + item.quantity, 0);
    const effectiveness = (tracedQuantity / totalQuantity) * 100;

    // US Foods requires 100% traceability within 4 hours (240 minutes)
    const passed = effectiveness >= 100 && duration <= 240;

    const result = {
      startTime,
      endTime,
      duration,
      tracedQuantity,
      totalQuantity,
      effectiveness,
      locations: forwardTrace,
      ingredientSources: backwardTrace,
      passed
    };

    // Record mock recall results
    await prisma.mockRecall.create({
      data: {
        facilityId,
        productName: productInfo.productName,
        lotNumber: productInfo.lotNumber,
        startTime,
        endTime,
        duration,
        effectiveness,
        passed,
        results: result
      }
    });

    // Schedule next mock recall if this one passed
    if (passed) {
      await this.scheduleNextMockRecall(facilityId);
    }

    return result;
  }

  /**
   * Generate compliance dashboard data
   */
  async getComplianceDashboard(facilityId: string): Promise<{
    overallScore: number;
    profiles: Array<{
      buyer: string;
      status: string;
      completeness: number;
      nextAudit?: Date;
      alerts: number;
    }>;
    certifications: Array<{
      type: string;
      status: string;
      expiryDate: Date;
      daysUntilExpiry: number;
    }>;
    recentAlerts: ComplianceAlert[];
    upcomingTasks: Array<{
      task: string;
      dueDate: Date;
      priority: string;
    }>;
    mockRecallPerformance: {
      lastRecall?: Date;
      averageDuration: number;
      successRate: number;
      nextScheduled: Date;
    };
  }> {
    // Get all compliance profiles
    const profiles = await prisma.complianceProfile.findMany({
      where: { facilityId },
      include: {
        requirements: true,
        certifications: true
      }
    });

    // Calculate overall compliance score
    const overallScore = this.calculateOverallComplianceScore(profiles);

    // Get recent alerts
    const recentAlerts = await prisma.complianceAlert.findMany({
      where: {
        facilityId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: { severity: 'asc' },
      take: 10
    });

    // Get mock recall performance
    const mockRecalls = await prisma.mockRecall.findMany({
      where: { facilityId },
      orderBy: { startTime: 'desc' },
      take: 10
    });

    const mockRecallPerformance = {
      lastRecall: mockRecalls[0]?.startTime,
      averageDuration: mockRecalls.reduce((sum, r) => sum + r.duration, 0) / mockRecalls.length || 0,
      successRate: (mockRecalls.filter(r => r.passed).length / mockRecalls.length) * 100 || 0,
      nextScheduled: await this.getNextMockRecallDate(facilityId)
    };

    // Get upcoming tasks
    const upcomingTasks = await this.getUpcomingComplianceTasks(facilityId);

    return {
      overallScore,
      profiles: profiles.map(p => ({
        buyer: p.buyerName,
        status: p.status,
        completeness: this.calculateProfileCompleteness(p),
        nextAudit: p.nextAuditDate,
        alerts: recentAlerts.filter(a => a.profileId === p.id).length
      })),
      certifications: await this.getCertificationStatus(facilityId),
      recentAlerts: recentAlerts.map(a => this.transformAlert(a)),
      upcomingTasks,
      mockRecallPerformance
    };
  }

  /**
   * Automated compliance monitoring
   */
  async runComplianceMonitoring(facilityId: string): Promise<void> {
    // Monitor CCPs
    const ccpResults = await this.monitorCCPs(facilityId);
    
    // Check certification expiries
    await this.checkCertificationExpiries(facilityId);
    
    // Verify training records
    await this.verifyTrainingRecords(facilityId);
    
    // Check document expiries
    await this.checkDocumentExpiries(facilityId);
    
    // Environmental monitoring
    if (this.limsService) {
      const labResults = await this.limsService.fetchTestResults(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        new Date(),
        'produce'
      );
      
      // Check for any failed tests
      const failedTests = labResults.filter(r => !r.passedCompliance);
      if (failedTests.length > 0) {
        await this.createComplianceAlert({
          facilityId,
          type: 'deviation',
          severity: 'high',
          title: 'Failed Lab Tests Detected',
          description: `${failedTests.length} lab test(s) failed compliance requirements`,
          requiresAction: true,
          actionItems: ['Review test results', 'Implement corrective actions', 'Retest affected lots']
        });
      }
    }
  }

  /**
   * Generate compliance reports
   */
  async generateComplianceReport(
    facilityId: string,
    buyerType: ComplianceProfile['buyerType'],
    reportType: 'audit' | 'monthly' | 'annual'
  ): Promise<Buffer> {
    const profile = await this.getComplianceProfile(facilityId, buyerType);
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId }
    });

    // Generate PDF report (pseudo-code for structure)
    const reportData = {
      facility,
      profile,
      complianceScore: this.calculateProfileCompleteness(profile),
      certifications: await this.getCertificationStatus(facilityId),
      haccpStatus: await this.getHACCPStatus(facilityId),
      mockRecallResults: await this.getMockRecallHistory(facilityId),
      labTestResults: await this.getLabTestSummary(facilityId),
      nonConformances: await this.getNonConformances(facilityId),
      correctiveActions: await this.getCorrectiveActionsSummary(facilityId)
    };

    // In production, use a PDF generation library
    return Buffer.from(JSON.stringify(reportData, null, 2));
  }

  /**
   * Helper methods
   */
  private determineCriticalLimit(hazard: HazardAnalysis): CCP['criticalLimit'] {
    // Define critical limits based on hazard type and step
    const limits: Record<string, CCP['criticalLimit']> = {
      'temperature-biological': { parameter: 'temperature', max: 41, unit: '°F' },
      'temperature-cold-holding': { parameter: 'temperature', max: 41, unit: '°F' },
      'temperature-hot-holding': { parameter: 'temperature', min: 135, unit: '°F' },
      'ph-acidification': { parameter: 'pH', max: 4.6, unit: 'pH' },
      'time-cooling': { parameter: 'time', max: 6, unit: 'hours' },
      'metal-detection': { parameter: 'metal_size', max: 2.5, unit: 'mm' }
    };

    // Return appropriate limit based on hazard
    if (hazard.hazardType === 'biological' && hazard.step.toLowerCase().includes('storage')) {
      return limits['temperature-cold-holding'];
    }
    
    return { parameter: 'TBD', max: 0, unit: 'TBD' };
  }

  private determineMonitoringFrequency(hazard: HazardAnalysis): string {
    if (hazard.severity === 'high' && hazard.likelihood === 'high') {
      return 'continuous';
    } else if (hazard.severity === 'high') {
      return 'every hour';
    } else if (hazard.likelihood === 'high') {
      return 'every 2 hours';
    }
    return 'every 4 hours';
  }

  private async createMonitoringProcedures(ccps: CCP[]): Promise<MonitoringProcedure[]> {
    const procedures: MonitoringProcedure[] = [];
    
    for (const ccp of ccps) {
      // Check if we can integrate with sensors
      let sensorIntegration;
      if (ccp.criticalLimit.parameter === 'temperature') {
        // Find available temperature sensors
        const sensors = sensorManager.getAllSensors().filter(s => 
          s.type === 'temperature' && s.status === 'online'
        );
        
        if (sensors.length > 0) {
          sensorIntegration = {
            sensorId: sensors[0].id,
            parameter: 'temperature',
            alertThresholds: {
              warning: ccp.criticalLimit.max ? ccp.criticalLimit.max - 2 : 39,
              critical: ccp.criticalLimit.max || 41
            }
          };
        }
      }

      procedures.push({
        ccpId: ccp.id,
        method: sensorIntegration ? 'automated' : 'manual',
        frequency: ccp.monitoringFrequency,
        recordType: `${ccp.criticalLimit.parameter} log`,
        sensorIntegration
      });
    }
    
    return procedures;
  }

  private generateCorrectiveActions(ccps: CCP[]): CorrectiveAction[] {
    return ccps.map(ccp => ({
      ccpId: ccp.id,
      trigger: `${ccp.criticalLimit.parameter} exceeds critical limit`,
      immediateAction: this.getImmediateAction(ccp),
      rootCauseAnalysis: true,
      preventiveAction: 'Review and update procedures to prevent recurrence',
      notificationList: ['QA Manager', 'Production Manager', 'Facility Manager'],
      recordingRequirement: 'Document all actions taken in deviation log'
    }));
  }

  private getImmediateAction(ccp: CCP): string {
    if (ccp.criticalLimit.parameter === 'temperature') {
      return 'Segregate affected product, adjust temperature, verify equipment operation';
    } else if (ccp.criticalLimit.parameter === 'time') {
      return 'Evaluate product safety, adjust process timing, retrain staff if needed';
    }
    return 'Stop production, segregate product, evaluate for safety';
  }

  private generateVerificationActivities(): VerificationActivity[] {
    return [
      {
        type: 'calibration',
        frequency: 'monthly',
        responsible: 'QA Technician',
        acceptanceCriteria: '±1°F for temperature, ±0.1 for pH',
        nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'record_review',
        frequency: 'weekly',
        responsible: 'QA Manager',
        acceptanceCriteria: 'All CCPs monitored per frequency, deviations addressed',
        nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'third_party_audit',
        frequency: 'annual',
        responsible: 'Facility Manager',
        acceptanceCriteria: 'Pass with score ≥85%',
        nextDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'product_testing',
        frequency: 'monthly',
        responsible: 'QA Technician',
        acceptanceCriteria: 'Meets all microbiological specifications',
        nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'environmental_monitoring',
        frequency: 'weekly',
        responsible: 'QA Technician',
        acceptanceCriteria: 'No pathogens detected in Zone 1',
        nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  private async getSensorReading(sensorId: string): Promise<{ value: number; timestamp: Date } | null> {
    const sensor = sensorManager.getAllSensors().find(s => s.id === sensorId);
    if (!sensor || sensor.status !== 'online') {
      return null;
    }

    // Get latest reading from sensor
    const reading = await sensorManager.getLatestReading(sensorId);
    return reading;
  }

  private evaluateCCPStatus(
    currentValue: number,
    criticalLimit: CCP['criticalLimit'],
    alertThresholds?: { warning: number; critical: number }
  ): 'in_control' | 'warning' | 'out_of_control' {
    if (criticalLimit.min !== undefined && currentValue < criticalLimit.min) {
      return 'out_of_control';
    }
    if (criticalLimit.max !== undefined && currentValue > criticalLimit.max) {
      return 'out_of_control';
    }
    if (alertThresholds?.warning && currentValue > alertThresholds.warning) {
      return 'warning';
    }
    return 'in_control';
  }

  private async createComplianceAlert(alert: Omit<ComplianceAlert, 'id' | 'createdAt'>): Promise<void> {
    await prisma.complianceAlert.create({
      data: {
        ...alert,
        createdAt: new Date()
      }
    });

    // Send notifications based on severity
    if (alert.severity === 'critical') {
      // In production, send SMS/email/push notifications
    }
  }

  private getBuyerName(buyerType: ComplianceProfile['buyerType']): string {
    const names: Record<string, string> = {
      US_FOODS: 'US Foods',
      WHOLE_FOODS: 'Whole Foods Market',
      SYSCO: 'Sysco Corporation',
      KROGER: 'Kroger',
      WALMART: 'Walmart',
      COSTCO: 'Costco Wholesale',
      CUSTOM: 'Custom Buyer'
    };
    return names[buyerType] || buyerType;
  }

  private calculateOverallComplianceScore(profiles: any[]): number {
    if (profiles.length === 0) return 0;
    
    const scores = profiles.map(p => this.calculateProfileCompleteness(p));
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private calculateProfileCompleteness(profile: any): number {
    const requirements = profile.requirements || [];
    if (requirements.length === 0) return 0;
    
    const compliant = requirements.filter((r: any) => r.currentStatus === 'compliant').length;
    return Math.round((compliant / requirements.length) * 100);
  }

  private transformProfile(profile: any): ComplianceProfile {
    return {
      ...profile,
      requirements: profile.requirements || [],
      certifications: profile.certifications || []
    };
  }

  private transformHACCP(haccp: any): HACCPPlan {
    return {
      ...haccp,
      hazardAnalysis: haccp.hazardAnalysis || [],
      criticalControlPoints: haccp.criticalControlPoints || [],
      monitoringProcedures: haccp.monitoringProcedures || [],
      correctiveActions: haccp.correctiveActions || [],
      verificationActivities: haccp.verificationActivities || []
    };
  }

  private transformAlert(alert: any): ComplianceAlert {
    return {
      ...alert,
      actionItems: alert.actionItems || []
    };
  }

  private mergeRequirements(
    base: ComplianceRequirement[],
    custom: Partial<ComplianceRequirement>[]
  ): ComplianceRequirement[] {
    const merged = [...base];
    
    for (const customReq of custom) {
      const existing = merged.find(r => r.id === customReq.id);
      if (existing) {
        Object.assign(existing, customReq);
      } else {
        merged.push(customReq as ComplianceRequirement);
      }
    }
    
    return merged;
  }

  private async scheduleComplianceTasks(profileId: string): Promise<void> {
    // In production, integrate with task scheduling system
  }

  private async getActiveHACCPPlan(facilityId: string): Promise<any> {
    return prisma.haccpPlan.findFirst({
      where: {
        facilityId,
        status: 'approved'
      },
      include: {
        criticalControlPoints: true,
        monitoringProcedures: true,
        correctiveActions: true
      },
      orderBy: {
        effectiveDate: 'desc'
      }
    });
  }

  private async traceForward(facilityId: string, lotNumber: string): Promise<any[]> {
    // Implement forward traceability
    return [];
  }

  private async traceBackward(facilityId: string, lotNumber: string): Promise<any[]> {
    // Implement backward traceability
    return [];
  }

  private async getTotalProductionQuantity(facilityId: string, lotNumber: string): Promise<number> {
    // Get total quantity produced for lot
    return 1000; // Placeholder
  }

  private async scheduleNextMockRecall(facilityId: string): Promise<void> {
    // Schedule next mock recall in 6 months
    const nextDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
  }

  private async getNextMockRecallDate(facilityId: string): Promise<Date> {
    // Get next scheduled mock recall
    return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }

  private async getUpcomingComplianceTasks(facilityId: string): Promise<any[]> {
    // Get upcoming compliance tasks
    return [];
  }

  private async getCertificationStatus(facilityId: string): Promise<any[]> {
    // Get certification status
    return [];
  }

  private async checkCertificationExpiries(facilityId: string): Promise<void> {
    // Check for expiring certifications
  }

  private async verifyTrainingRecords(facilityId: string): Promise<void> {
    // Verify training records are current
  }

  private async checkDocumentExpiries(facilityId: string): Promise<void> {
    // Check for expiring documents
  }

  private async getComplianceProfile(
    facilityId: string,
    buyerType: ComplianceProfile['buyerType']
  ): Promise<any> {
    return prisma.complianceProfile.findFirst({
      where: {
        facilityId,
        buyerType
      },
      include: {
        requirements: true,
        certifications: true
      }
    });
  }

  private async getHACCPStatus(facilityId: string): Promise<any> {
    // Get HACCP plan status
    return {};
  }

  private async getMockRecallHistory(facilityId: string): Promise<any[]> {
    // Get mock recall history
    return [];
  }

  private async getLabTestSummary(facilityId: string): Promise<any> {
    // Get lab test summary
    return {};
  }

  private async getNonConformances(facilityId: string): Promise<any[]> {
    // Get non-conformances
    return [];
  }

  private async getCorrectiveActionsSummary(facilityId: string): Promise<any> {
    // Get corrective actions summary
    return {};
  }
}

/**
 * Buyer-specific compliance templates
 */
export const COMPLIANCE_TEMPLATES = {
  US_FOODS: {
    name: 'US Foods Supplier Requirements',
    certifications: ['BRC', 'SQF', 'FSSC22000', 'IFS'],
    specialRequirements: [
      '24/7 emergency contact',
      'TTR device for all shipments',
      'Mock recall within 4 hours',
      'Cross Valley Farms standards for produce'
    ]
  },
  WHOLE_FOODS: {
    name: 'Whole Foods Market Standards',
    certifications: ['Organic', 'Non-GMO', 'Fair Trade'],
    specialRequirements: [
      'Responsibly Grown rating',
      'Banned ingredient list compliance',
      'Local producer documentation',
      'Sustainable packaging'
    ]
  },
  SYSCO: {
    name: 'Sysco Quality Assurance',
    certifications: ['GFSI', 'GAP'],
    specialRequirements: [
      'Sysco QA audit',
      'Product specifications',
      'Nutritional analysis',
      'Sustainability metrics'
    ]
  },
  KROGER: {
    name: 'Kroger Food Safety Standards',
    certifications: ['GFSI', 'Social Compliance'],
    specialRequirements: [
      'Kroger food safety addendum',
      'Social compliance audit',
      'Responsible sourcing',
      'Animal welfare (if applicable)'
    ]
  },
  WALMART: {
    name: 'Walmart Requirements',
    certifications: ['GFSI', 'Organic', 'Fair Trade'],
    specialRequirements: [
      'Blockchain traceability',
      'On-time delivery metrics',
      'Sustainability reporting',
      'Food safety assessment'
    ]
  },
  COSTCO: {
    name: 'Costco Addendum',
    certifications: ['GFSI'],
    specialRequirements: [
      'Costco food safety addendum',
      'Product testing program',
      'Specification compliance',
      'Volume commitments'
    ]
  }
};