/**
 * AI-Powered Compliance Assistant with Claude
 * Helps facilities maintain regulatory compliance and certifications
 */

import { ClaudeVibeLuxAssistant } from './claude-integration';
import { cropDatabase } from './comprehensive-crop-database';
import { anomalyExplanationSystem } from './anomaly-explanation-system';

export interface ComplianceFramework {
  id: string;
  name: string;
  acronym: string;
  category: 'cultivation' | 'manufacturing' | 'safety' | 'environmental' | 'quality';
  jurisdiction: 'federal' | 'state' | 'local' | 'international';
  applicableIndustries: string[];
  version: string;
  effectiveDate: Date;
  requirements: ComplianceRequirement[];
  certificationBody?: string;
  renewalPeriod?: string;
}

export interface ComplianceRequirement {
  id: string;
  section: string;
  title: string;
  description: string;
  type: 'documentation' | 'operational' | 'testing' | 'reporting' | 'training';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one-time';
  criticalityLevel: 'mandatory' | 'important' | 'recommended';
  verificationMethod: string;
  acceptanceCriteria: string[];
  commonViolations: string[];
  penalties: {
    minor: string;
    major: string;
    critical: string;
  };
}

export interface ComplianceStatus {
  frameworkId: string;
  facilityId: string;
  overallStatus: 'compliant' | 'non-compliant' | 'pending' | 'at-risk';
  score: number; // 0-100
  lastAuditDate?: Date;
  nextAuditDate?: Date;
  requirementStatuses: RequirementStatus[];
  gaps: ComplianceGap[];
  risks: ComplianceRisk[];
  certificationStatus?: {
    certified: boolean;
    certificateNumber?: string;
    expirationDate?: Date;
  };
}

export interface RequirementStatus {
  requirementId: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable';
  lastVerified: Date;
  evidence: Evidence[];
  notes: string;
  correctionDeadline?: Date;
}

export interface Evidence {
  id: string;
  type: 'document' | 'record' | 'photo' | 'sensor-data' | 'signature' | 'test-result';
  title: string;
  description: string;
  timestamp: Date;
  location: string; // URL or file path
  verifiedBy?: string;
  expirationDate?: Date;
}

export interface ComplianceGap {
  requirementId: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  identifiedDate: Date;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'closed';
  remediationPlan?: RemediationPlan;
  estimatedCost?: number;
}

export interface RemediationPlan {
  id: string;
  steps: RemediationStep[];
  totalEstimatedTime: string;
  totalEstimatedCost: number;
  assignedTo: string[];
  approvedBy?: string;
  approvalDate?: Date;
}

export interface RemediationStep {
  id: string;
  action: string;
  description: string;
  responsibleParty: string;
  targetDate: Date;
  estimatedHours: number;
  estimatedCost: number;
  dependencies: string[];
  completionCriteria: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
}

export interface ComplianceRisk {
  id: string;
  category: 'regulatory' | 'operational' | 'financial' | 'reputational';
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // probability * impact
  mitigationStrategies: string[];
  monitoringRequired: boolean;
  escalationThreshold?: string;
}

export interface ComplianceDocument {
  id: string;
  type: 'sop' | 'policy' | 'record' | 'certificate' | 'report' | 'training';
  title: string;
  version: string;
  effectiveDate: Date;
  reviewDate: Date;
  content: string;
  approvedBy: string;
  relatedRequirements: string[];
  changeHistory: DocumentChange[];
}

export interface DocumentChange {
  version: string;
  changeDate: Date;
  changedBy: string;
  summary: string;
  requirementUpdates: string[];
}

export class AIComplianceAssistant {
  private claudeAssistant: ClaudeVibeLuxAssistant;
  private frameworks: Map<string, ComplianceFramework>;
  private documentTemplates: Map<string, string>;

  // Major compliance frameworks
  private readonly COMPLIANCE_FRAMEWORKS = {
    GMP: {
      name: 'Good Manufacturing Practices',
      category: 'manufacturing',
      sections: ['Personnel', 'Buildings', 'Equipment', 'Production', 'Quality Control']
    },
    GACP: {
      name: 'Good Agricultural and Collection Practices',
      category: 'cultivation',
      sections: ['Seeds', 'Cultivation', 'Harvest', 'Processing', 'Storage']
    },
    GAP: {
      name: 'Good Agricultural Practices',
      category: 'cultivation',
      sections: ['Water', 'Soil', 'Animals', 'Worker Health', 'Traceability']
    },
    HACCP: {
      name: 'Hazard Analysis Critical Control Points',
      category: 'safety',
      sections: ['Hazard Analysis', 'CCPs', 'Critical Limits', 'Monitoring', 'Verification']
    },
    ISO22000: {
      name: 'Food Safety Management Systems',
      category: 'quality',
      sections: ['Management', 'PRPs', 'Hazard Analysis', 'Validation', 'Improvement']
    },
    OSHA: {
      name: 'Occupational Safety and Health',
      category: 'safety',
      sections: ['Hazard Communication', 'PPE', 'Emergency', 'Training', 'Recordkeeping']
    }
  };

  constructor() {
    this.claudeAssistant = new ClaudeVibeLuxAssistant();
    this.frameworks = new Map();
    this.documentTemplates = new Map();
    this.initializeFrameworks();
  }

  /**
   * Assess compliance status for a facility
   */
  async assessCompliance(
    facilityId: string,
    frameworkId: string,
    facilityData: any
  ): Promise<ComplianceStatus> {
    const framework = this.frameworks.get(frameworkId);
    if (!framework) {
      throw new Error(`Unknown compliance framework: ${frameworkId}`);
    }

    console.log(`Assessing ${framework.name} compliance for facility ${facilityId}`);

    // Evaluate each requirement
    const requirementStatuses = await this.evaluateRequirements(framework, facilityData);
    
    // Identify gaps
    const gaps = this.identifyComplianceGaps(framework, requirementStatuses, facilityData);
    
    // Assess risks
    const risks = await this.assessComplianceRisks(gaps, framework, facilityData);
    
    // Calculate overall score
    const score = this.calculateComplianceScore(requirementStatuses, framework);
    
    // Determine overall status
    const overallStatus = this.determineOverallStatus(score, gaps, risks);

    const status: ComplianceStatus = {
      frameworkId,
      facilityId,
      overallStatus,
      score,
      requirementStatuses,
      gaps,
      risks,
      lastAuditDate: facilityData.lastAudit?.date,
      nextAuditDate: this.calculateNextAuditDate(framework, facilityData.lastAudit?.date)
    };

    return status;
  }

  /**
   * Generate compliance documentation
   */
  async generateComplianceDocument(
    type: string,
    framework: string,
    facilityData: any,
    customRequirements?: string[]
  ): Promise<ComplianceDocument> {
    console.log(`Generating ${type} document for ${framework} compliance`);

    const prompt = `
    Generate a professional ${type} document for ${framework} compliance:

    FACILITY INFORMATION:
    - Name: ${facilityData.name}
    - Type: ${facilityData.type}
    - Crops: ${facilityData.crops?.join(', ') || 'General cultivation'}
    - Size: ${facilityData.size} sq ft
    - Location: ${facilityData.location}

    DOCUMENT TYPE: ${type}
    ${customRequirements ? `
    SPECIFIC REQUIREMENTS:
    ${customRequirements.join('\n')}
    ` : ''}

    Create a comprehensive, compliance-ready document that includes:
    1. Purpose and scope
    2. Responsibilities
    3. Procedures/policies
    4. Monitoring and verification
    5. Record keeping requirements
    6. Training requirements
    7. Review and update procedures

    Format as a professional document suitable for regulatory inspection.
    Include specific details relevant to ${facilityData.type} operations.
    Ensure alignment with ${framework} requirements.
    `;

    try {
      const response = await this.claudeAssistant.answerDataQuery(prompt, {
        facilityData,
        sensorData: [],
        userRole: 'COMPLIANCE_OFFICER',
        timeframe: 'current'
      });

      const document: ComplianceDocument = {
        id: `doc_${Date.now()}`,
        type: type as any,
        title: this.generateDocumentTitle(type, framework, facilityData),
        version: '1.0',
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        content: response.answer,
        approvedBy: 'AI Compliance Assistant',
        relatedRequirements: customRequirements || [],
        changeHistory: [{
          version: '1.0',
          changeDate: new Date(),
          changedBy: 'AI Assistant',
          summary: 'Initial document creation',
          requirementUpdates: []
        }]
      };

      return document;

    } catch (error) {
      console.error('Error generating compliance document:', error);
      throw error;
    }
  }

  /**
   * Provide real-time compliance guidance
   */
  async getComplianceGuidance(
    query: string,
    framework: string,
    context: any
  ): Promise<string> {
    const frameworkData = this.frameworks.get(framework);
    
    const prompt = `
    Provide expert compliance guidance for this query:

    QUERY: ${query}

    COMPLIANCE FRAMEWORK: ${frameworkData?.name || framework}
    FACILITY CONTEXT: ${JSON.stringify(context, null, 2)}

    Provide:
    1. Direct answer to the query
    2. Relevant regulatory citations
    3. Best practices
    4. Common mistakes to avoid
    5. Documentation requirements
    6. Any critical warnings or time-sensitive requirements

    Be specific, accurate, and actionable.
    `;

    try {
      const response = await this.claudeAssistant.answerDataQuery(prompt, {
        facilityData: context,
        sensorData: [],
        userRole: 'COMPLIANCE_OFFICER',
        timeframe: 'current'
      });

      return response.answer;

    } catch (error) {
      console.error('Error getting compliance guidance:', error);
      return 'Unable to provide guidance at this time. Please consult compliance documentation.';
    }
  }

  /**
   * Generate remediation plan for compliance gaps
   */
  async generateRemediationPlan(
    gaps: ComplianceGap[],
    framework: ComplianceFramework,
    facilityData: any
  ): Promise<RemediationPlan> {
    console.log(`Generating remediation plan for ${gaps.length} compliance gaps`);

    const prompt = `
    Create a detailed remediation plan for these compliance gaps:

    FRAMEWORK: ${framework.name}
    FACILITY: ${facilityData.name}

    COMPLIANCE GAPS:
    ${gaps.map((gap, i) => `
    ${i + 1}. ${gap.description}
       Severity: ${gap.severity}
       Due Date: ${gap.dueDate}
       Requirement: ${framework.requirements.find(r => r.id === gap.requirementId)?.title}
    `).join('\n')}

    Generate a practical remediation plan with:
    1. Prioritized action steps
    2. Resource requirements
    3. Timeline with milestones
    4. Cost estimates
    5. Success criteria
    6. Risk mitigation during implementation

    Consider facility constraints and operational continuity.
    `;

    try {
      const response = await this.claudeAssistant.answerDataQuery(prompt, {
        facilityData,
        sensorData: [],
        userRole: 'COMPLIANCE_MANAGER',
        timeframe: 'planning'
      });

      // Parse response into structured plan
      return this.parseRemediationPlan(response.answer, gaps);

    } catch (error) {
      console.error('Error generating remediation plan:', error);
      throw error;
    }
  }

  /**
   * Monitor compliance in real-time
   */
  async monitorCompliance(
    facilityData: any,
    sensorData: any[],
    framework: string
  ): Promise<{
    alerts: ComplianceAlert[];
    recommendations: string[];
    metricsInCompliance: number;
    metricsOutOfCompliance: number;
  }> {
    const alerts: ComplianceAlert[] = [];
    const recommendations: string[] = [];
    
    // Check environmental parameters
    const envCompliance = await this.checkEnvironmentalCompliance(sensorData, framework);
    alerts.push(...envCompliance.alerts);
    
    // Check operational compliance
    const opsCompliance = await this.checkOperationalCompliance(facilityData, framework);
    alerts.push(...opsCompliance.alerts);
    
    // Check documentation currency
    const docCompliance = await this.checkDocumentationCompliance(facilityData, framework);
    alerts.push(...docCompliance.alerts);
    
    // Generate recommendations
    if (alerts.length > 0) {
      recommendations.push(...await this.generateComplianceRecommendations(alerts, framework));
    }

    return {
      alerts,
      recommendations,
      metricsInCompliance: envCompliance.compliant + opsCompliance.compliant + docCompliance.compliant,
      metricsOutOfCompliance: alerts.length
    };
  }

  /**
   * Train staff on compliance requirements
   */
  async generateTrainingContent(
    role: string,
    framework: string,
    topics: string[]
  ): Promise<TrainingModule> {
    const prompt = `
    Create compliance training content for ${role} on ${framework}:

    TOPICS TO COVER:
    ${topics.join('\n')}

    Generate:
    1. Learning objectives
    2. Key concepts with examples
    3. Common scenarios and correct responses
    4. Interactive quiz questions
    5. Reference materials
    6. Certification requirements

    Make content engaging, practical, and role-specific.
    Include real-world examples from cultivation facilities.
    `;

    try {
      const response = await this.claudeAssistant.answerDataQuery(prompt, {
        facilityData: { role, framework },
        sensorData: [],
        userRole: 'TRAINER',
        timeframe: 'training'
      });

      return this.parseTrainingContent(response.answer, role, framework, topics);

    } catch (error) {
      console.error('Error generating training content:', error);
      throw error;
    }
  }

  // Helper methods
  private initializeFrameworks(): void {
    // Initialize with comprehensive framework data
    // In production, this would load from a compliance database
    
    this.frameworks.set('GMP', {
      id: 'GMP',
      name: 'Good Manufacturing Practices',
      acronym: 'GMP',
      category: 'manufacturing',
      jurisdiction: 'federal',
      applicableIndustries: ['cannabis', 'pharmaceuticals', 'food'],
      version: '21 CFR Part 210/211',
      effectiveDate: new Date('2023-01-01'),
      requirements: this.generateGMPRequirements()
    });

    this.frameworks.set('GACP', {
      id: 'GACP',
      name: 'Good Agricultural and Collection Practices',
      acronym: 'GACP',
      category: 'cultivation',
      jurisdiction: 'international',
      applicableIndustries: ['cannabis', 'herbs', 'botanicals'],
      version: 'WHO GACP 2003',
      effectiveDate: new Date('2003-01-01'),
      requirements: this.generateGACPRequirements()
    });
  }

  private generateGMPRequirements(): ComplianceRequirement[] {
    return [
      {
        id: 'GMP-1.1',
        section: '211.25',
        title: 'Personnel Qualifications',
        description: 'Personnel must have education, training, and experience to perform assigned functions',
        type: 'documentation',
        frequency: 'continuous',
        criticalityLevel: 'mandatory',
        verificationMethod: 'Training records review',
        acceptanceCriteria: ['Current training records', 'Competency assessments', 'Job descriptions'],
        commonViolations: ['Missing training records', 'Outdated certifications'],
        penalties: {
          minor: 'Written warning',
          major: 'Mandatory retraining',
          critical: 'Production halt'
        }
      },
      {
        id: 'GMP-2.1',
        section: '211.42',
        title: 'Design and Construction Features',
        description: 'Buildings must be suitable size, construction, and location',
        type: 'operational',
        frequency: 'continuous',
        criticalityLevel: 'mandatory',
        verificationMethod: 'Facility inspection',
        acceptanceCriteria: ['Adequate space', 'Proper ventilation', 'Pest control'],
        commonViolations: ['Inadequate separation', 'Poor maintenance'],
        penalties: {
          minor: 'Correction notice',
          major: 'Remediation required',
          critical: 'Facility closure'
        }
      }
      // Additional requirements would be added here
    ];
  }

  private generateGACPRequirements(): ComplianceRequirement[] {
    return [
      {
        id: 'GACP-1.1',
        section: '1',
        title: 'Seeds and Propagation Material',
        description: 'Seeds and propagation material should be identified, specified and verified',
        type: 'documentation',
        frequency: 'continuous',
        criticalityLevel: 'mandatory',
        verificationMethod: 'Seed certification review',
        acceptanceCriteria: ['Variety identification', 'Source documentation', 'Quality certificates'],
        commonViolations: ['Unknown genetics', 'Missing certificates'],
        penalties: {
          minor: 'Documentation required',
          major: 'Batch quarantine',
          critical: 'Crop rejection'
        }
      }
      // Additional requirements would be added here
    ];
  }

  private async evaluateRequirements(
    framework: ComplianceFramework,
    facilityData: any
  ): Promise<RequirementStatus[]> {
    const statuses: RequirementStatus[] = [];
    
    for (const requirement of framework.requirements) {
      const status = await this.evaluateRequirement(requirement, facilityData);
      statuses.push(status);
    }
    
    return statuses;
  }

  private async evaluateRequirement(
    requirement: ComplianceRequirement,
    facilityData: any
  ): Promise<RequirementStatus> {
    // Simulate requirement evaluation
    // In production, this would check actual facility data
    
    const hasEvidence = Math.random() > 0.2; // 80% compliance rate for demo
    
    return {
      requirementId: requirement.id,
      status: hasEvidence ? 'compliant' : 'non-compliant',
      lastVerified: new Date(),
      evidence: hasEvidence ? [{
        id: `evidence_${requirement.id}`,
        type: 'document',
        title: `${requirement.title} Compliance Record`,
        description: 'Verified compliance documentation',
        timestamp: new Date(),
        location: `/compliance/${requirement.id}`
      }] : [],
      notes: hasEvidence ? 'All criteria met' : 'Missing required documentation'
    };
  }

  private identifyComplianceGaps(
    framework: ComplianceFramework,
    statuses: RequirementStatus[],
    facilityData: any
  ): ComplianceGap[] {
    const gaps: ComplianceGap[] = [];
    
    statuses.forEach(status => {
      if (status.status !== 'compliant') {
        const requirement = framework.requirements.find(r => r.id === status.requirementId);
        if (requirement) {
          gaps.push({
            requirementId: requirement.id,
            description: `Non-compliance with ${requirement.title}`,
            severity: requirement.criticalityLevel === 'mandatory' ? 'critical' : 'major',
            identifiedDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'open',
            estimatedCost: requirement.criticalityLevel === 'mandatory' ? 5000 : 2000
          });
        }
      }
    });
    
    return gaps;
  }

  private async assessComplianceRisks(
    gaps: ComplianceGap[],
    framework: ComplianceFramework,
    facilityData: any
  ): Promise<ComplianceRisk[]> {
    const risks: ComplianceRisk[] = [];
    
    // Risk from gaps
    if (gaps.filter(g => g.severity === 'critical').length > 0) {
      risks.push({
        id: 'risk_critical_gaps',
        category: 'regulatory',
        description: 'Critical compliance gaps could result in enforcement action',
        probability: 'high',
        impact: 'critical',
        riskScore: 9,
        mitigationStrategies: ['Immediate remediation', 'Compliance consultant engagement'],
        monitoringRequired: true,
        escalationThreshold: '48 hours without action'
      });
    }
    
    // Operational risks
    if (gaps.length > 5) {
      risks.push({
        id: 'risk_operational',
        category: 'operational',
        description: 'Multiple compliance gaps indicate systemic issues',
        probability: 'medium',
        impact: 'high',
        riskScore: 6,
        mitigationStrategies: ['Process review', 'Staff training', 'Quality system upgrade'],
        monitoringRequired: true
      });
    }
    
    return risks;
  }

  private calculateComplianceScore(
    statuses: RequirementStatus[],
    framework: ComplianceFramework
  ): number {
    const totalRequirements = statuses.length;
    const compliantRequirements = statuses.filter(s => s.status === 'compliant').length;
    const partialRequirements = statuses.filter(s => s.status === 'partial').length;
    
    // Weight mandatory requirements more heavily
    const mandatoryStatuses = statuses.filter(s => {
      const req = framework.requirements.find(r => r.id === s.requirementId);
      return req?.criticalityLevel === 'mandatory';
    });
    
    const mandatoryCompliant = mandatoryStatuses.filter(s => s.status === 'compliant').length;
    const mandatoryWeight = 0.7;
    const overallWeight = 0.3;
    
    const mandatoryScore = (mandatoryCompliant / mandatoryStatuses.length) * 100 * mandatoryWeight;
    const overallScore = ((compliantRequirements + partialRequirements * 0.5) / totalRequirements) * 100 * overallWeight;
    
    return Math.round(mandatoryScore + overallScore);
  }

  private determineOverallStatus(
    score: number,
    gaps: ComplianceGap[],
    risks: ComplianceRisk[]
  ): 'compliant' | 'non-compliant' | 'pending' | 'at-risk' {
    if (gaps.filter(g => g.severity === 'critical').length > 0) {
      return 'non-compliant';
    }
    
    if (score >= 95 && gaps.length === 0) {
      return 'compliant';
    }
    
    if (score >= 80 && risks.filter(r => r.impact === 'critical').length === 0) {
      return 'at-risk';
    }
    
    if (score >= 70) {
      return 'pending';
    }
    
    return 'non-compliant';
  }

  private calculateNextAuditDate(framework: ComplianceFramework, lastAudit?: Date): Date {
    const baseInterval = framework.renewalPeriod === 'annual' ? 365 : 180; // days
    const lastAuditDate = lastAudit || new Date();
    
    return new Date(lastAuditDate.getTime() + baseInterval * 24 * 60 * 60 * 1000);
  }

  private generateDocumentTitle(type: string, framework: string, facilityData: any): string {
    const typeMap: Record<string, string> = {
      sop: 'Standard Operating Procedure',
      policy: 'Policy Document',
      record: 'Compliance Record',
      certificate: 'Certificate',
      report: 'Compliance Report',
      training: 'Training Material'
    };
    
    return `${facilityData.name} - ${typeMap[type] || type} - ${framework} Compliance`;
  }

  private parseRemediationPlan(response: string, gaps: ComplianceGap[]): RemediationPlan {
    // Parse Claude's response into structured remediation plan
    // In production, this would use sophisticated NLP
    
    const steps: RemediationStep[] = gaps.map((gap, index) => ({
      id: `step_${index + 1}`,
      action: `Remediate ${gap.description}`,
      description: `Address compliance gap through corrective actions`,
      responsibleParty: 'Compliance Manager',
      targetDate: gap.dueDate,
      estimatedHours: gap.severity === 'critical' ? 40 : 20,
      estimatedCost: gap.estimatedCost || 1000,
      dependencies: index > 0 ? [`step_${index}`] : [],
      completionCriteria: ['Documentation updated', 'Process implemented', 'Staff trained'],
      status: 'pending'
    }));
    
    return {
      id: `plan_${Date.now()}`,
      steps,
      totalEstimatedTime: `${steps.reduce((sum, s) => sum + s.estimatedHours, 0)} hours`,
      totalEstimatedCost: steps.reduce((sum, s) => sum + s.estimatedCost, 0),
      assignedTo: ['Compliance Manager', 'Operations Team'],
      approvedBy: 'Facility Director',
      approvalDate: new Date()
    };
  }

  private async checkEnvironmentalCompliance(
    sensorData: any[],
    framework: string
  ): Promise<{ alerts: ComplianceAlert[]; compliant: number }> {
    const alerts: ComplianceAlert[] = [];
    let compliant = 0;
    
    // Check temperature compliance
    const tempData = sensorData.filter(d => d.type === 'temperature');
    const avgTemp = tempData.reduce((sum, d) => sum + d.value, 0) / tempData.length;
    
    if (avgTemp < 18 || avgTemp > 25) {
      alerts.push({
        id: `alert_temp_${Date.now()}`,
        type: 'environmental',
        severity: 'medium',
        message: 'Temperature outside GMP range (18-25°C)',
        requirement: 'Environmental control',
        timestamp: new Date(),
        actionRequired: 'Adjust HVAC settings'
      });
    } else {
      compliant++;
    }
    
    // Check humidity compliance
    const humidityData = sensorData.filter(d => d.type === 'humidity');
    const avgHumidity = humidityData.reduce((sum, d) => sum + d.value, 0) / humidityData.length;
    
    if (avgHumidity < 45 || avgHumidity > 65) {
      alerts.push({
        id: `alert_humidity_${Date.now()}`,
        type: 'environmental',
        severity: 'medium',
        message: 'Humidity outside recommended range (45-65%)',
        requirement: 'Environmental control',
        timestamp: new Date(),
        actionRequired: 'Adjust dehumidification'
      });
    } else {
      compliant++;
    }
    
    return { alerts, compliant };
  }

  private async checkOperationalCompliance(
    facilityData: any,
    framework: string
  ): Promise<{ alerts: ComplianceAlert[]; compliant: number }> {
    const alerts: ComplianceAlert[] = [];
    let compliant = 0;
    
    // Check training compliance
    if (!facilityData.lastTrainingDate || 
        new Date().getTime() - new Date(facilityData.lastTrainingDate).getTime() > 90 * 24 * 60 * 60 * 1000) {
      alerts.push({
        id: `alert_training_${Date.now()}`,
        type: 'operational',
        severity: 'high',
        message: 'Staff training overdue (>90 days)',
        requirement: 'Personnel training',
        timestamp: new Date(),
        actionRequired: 'Schedule mandatory training'
      });
    } else {
      compliant++;
    }
    
    return { alerts, compliant };
  }

  private async checkDocumentationCompliance(
    facilityData: any,
    framework: string
  ): Promise<{ alerts: ComplianceAlert[]; compliant: number }> {
    const alerts: ComplianceAlert[] = [];
    let compliant = 0;
    
    // Check SOP currency
    if (!facilityData.sopLastReview || 
        new Date().getTime() - new Date(facilityData.sopLastReview).getTime() > 365 * 24 * 60 * 60 * 1000) {
      alerts.push({
        id: `alert_sop_${Date.now()}`,
        type: 'documentation',
        severity: 'medium',
        message: 'SOP review overdue (>1 year)',
        requirement: 'Document control',
        timestamp: new Date(),
        actionRequired: 'Review and update SOPs'
      });
    } else {
      compliant++;
    }
    
    return { alerts, compliant };
  }

  private async generateComplianceRecommendations(
    alerts: ComplianceAlert[],
    framework: string
  ): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Group alerts by type
    const byType = alerts.reduce((acc, alert) => {
      if (!acc[alert.type]) acc[alert.type] = [];
      acc[alert.type].push(alert);
      return acc;
    }, {} as Record<string, ComplianceAlert[]>);
    
    // Generate type-specific recommendations
    if (byType.environmental?.length > 0) {
      recommendations.push('Review and calibrate environmental control systems');
      recommendations.push('Implement redundant monitoring for critical parameters');
    }
    
    if (byType.operational?.length > 0) {
      recommendations.push('Establish automated training reminders');
      recommendations.push('Create compliance dashboard for real-time monitoring');
    }
    
    if (byType.documentation?.length > 0) {
      recommendations.push('Implement document management system with auto-reminders');
      recommendations.push('Schedule quarterly documentation reviews');
    }
    
    return recommendations;
  }

  private parseTrainingContent(
    response: string,
    role: string,
    framework: string,
    topics: string[]
  ): TrainingModule {
    return {
      id: `training_${Date.now()}`,
      title: `${framework} Compliance Training for ${role}`,
      role,
      framework,
      topics,
      duration: '2 hours',
      content: response,
      objectives: [
        `Understand ${framework} requirements`,
        'Identify compliance risks',
        'Execute role-specific compliance tasks'
      ],
      assessmentRequired: true,
      passingScore: 80,
      certificateValidity: '1 year'
    };
  }
}

// Supporting interfaces
interface ComplianceAlert {
  id: string;
  type: 'environmental' | 'operational' | 'documentation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  requirement: string;
  timestamp: Date;
  actionRequired: string;
}

interface TrainingModule {
  id: string;
  title: string;
  role: string;
  framework: string;
  topics: string[];
  duration: string;
  content: string;
  objectives: string[];
  assessmentRequired: boolean;
  passingScore: number;
  certificateValidity: string;
}

// Export singleton instance
export const complianceAssistant = new AIComplianceAssistant();