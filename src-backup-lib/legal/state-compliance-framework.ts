import { prisma } from '@/lib/prisma';

interface StateComplianceRule {
  state: string;
  jurisdiction: 'state' | 'municipal' | 'utility';
  category: 'licensing' | 'metering' | 'billing' | 'interconnection' | 'tariff' | 'net_metering' | 'data_privacy';
  requirement: string;
  compliance_level: 'required' | 'recommended' | 'prohibited';
  authority: string;
  regulation_reference: string;
  penalty_description?: string;
  annual_fee?: number;
  renewal_period_months?: number;
  notification_days?: number;
  documentation_required: string[];
  effective_date: Date;
  last_updated: Date;
}

interface ComplianceAssessment {
  customerId: string;
  state: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'unknown';
  violations: ComplianceViolation[];
  required_actions: ComplianceAction[];
  estimated_cost: number;
  timeline_days: number;
  last_assessed: Date;
}

interface ComplianceViolation {
  rule_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  potential_penalty: string;
  remediation_required: boolean;
}

interface ComplianceAction {
  type: 'license_application' | 'filing_requirement' | 'notification' | 'documentation' | 'fee_payment';
  description: string;
  deadline: Date;
  cost: number;
  responsible_party: 'customer' | 'vibelux' | 'third_party';
  status: 'pending' | 'in_progress' | 'completed';
}

export class StateComplianceFramework {
  private complianceRules: Map<string, StateComplianceRule[]> = new Map();
  
  constructor() {
    this.initializeComplianceRules();
  }

  /**
   * Initialize comprehensive compliance rules for all 50 states
   */
  private initializeComplianceRules(): void {
    // Major energy states with detailed compliance requirements
    this.addStateRules('CA', [
      {
        state: 'CA',
        jurisdiction: 'state',
        category: 'licensing',
        requirement: 'Energy Service Provider (ESP) Registration with CPUC',
        compliance_level: 'required',
        authority: 'California Public Utilities Commission',
        regulation_reference: 'CPUC Rule 22',
        penalty_description: 'Fines up to $50,000 per violation, potential criminal charges',
        annual_fee: 5000,
        renewal_period_months: 12,
        notification_days: 30,
        documentation_required: [
          'Certificate of Incorporation',
          'Financial statements (audited)',
          'Insurance certificates ($5M liability)',
          'Consumer protection plan',
          'Privacy policy',
          'Billing procedures documentation'
        ],
        effective_date: new Date('2023-01-01'),
        last_updated: new Date('2024-06-15'),
      },
      {
        state: 'CA',
        jurisdiction: 'state',
        category: 'net_metering',
        requirement: 'Net Energy Metering 3.0 (NEM 3.0) Compliance',
        compliance_level: 'required',
        authority: 'California Public Utilities Commission',
        regulation_reference: 'Decision 22-12-056',
        penalty_description: 'Loss of net metering eligibility, penalties up to $25,000',
        documentation_required: [
          'Interconnection application',
          'Engineering drawings',
          'Equipment specifications',
          'Utility coordination documentation'
        ],
        effective_date: new Date('2023-04-15'),
        last_updated: new Date('2024-03-01'),
      },
      {
        state: 'CA',
        jurisdiction: 'state',
        category: 'data_privacy',
        requirement: 'California Consumer Privacy Act (CCPA) Compliance',
        compliance_level: 'required',
        authority: 'California Attorney General',
        regulation_reference: 'California Civil Code 1798.100',
        penalty_description: 'Fines up to $7,500 per violation',
        documentation_required: [
          'Privacy policy',
          'Data processing agreements',
          'Consumer rights procedures',
          'Security incident response plan'
        ],
        effective_date: new Date('2020-01-01'),
        last_updated: new Date('2024-01-01'),
      }
    ]);

    this.addStateRules('TX', [
      {
        state: 'TX',
        jurisdiction: 'state',
        category: 'licensing',
        requirement: 'Retail Electric Provider (REP) Certification',
        compliance_level: 'required',
        authority: 'Public Utility Commission of Texas',
        regulation_reference: '16 TAC Chapter 25.107',
        penalty_description: 'Administrative penalty up to $25,000 per violation per day',
        annual_fee: 7500,
        renewal_period_months: 24,
        notification_days: 60,
        documentation_required: [
          'Corporate organizational documents',
          'Financial statements',
          'Credit rating or financial security',
          'Operations plan',
          'Customer service standards',
          'Billing and payment procedures'
        ],
        effective_date: new Date('2002-01-01'),
        last_updated: new Date('2024-02-01'),
      },
      {
        state: 'TX',
        jurisdiction: 'state',
        category: 'billing',
        requirement: 'Customer Protection Standards for REPs',
        compliance_level: 'required',
        authority: 'Public Utility Commission of Texas',
        regulation_reference: '16 TAC Chapter 25.474',
        penalty_description: 'Administrative penalty up to $15,000 per violation',
        documentation_required: [
          'Terms of service document',
          'Bill format compliance certification',
          'Disconnect procedures',
          'Customer complaint procedures'
        ],
        effective_date: new Date('2002-01-01'),
        last_updated: new Date('2023-09-15'),
      }
    ]);

    this.addStateRules('NY', [
      {
        state: 'NY',
        jurisdiction: 'state',
        category: 'licensing',
        requirement: 'Energy Service Company (ESCO) Registration',
        compliance_level: 'required',
        authority: 'New York Public Service Commission',
        regulation_reference: '16 NYCRR Part 94',
        penalty_description: 'Civil penalties up to $100,000 per violation',
        annual_fee: 3000,
        renewal_period_months: 36,
        notification_days: 90,
        documentation_required: [
          'Registration application',
          'Financial statements',
          'Credit worthiness documentation',
          'Consumer protection procedures',
          'Marketing materials',
          'Service terms and conditions'
        ],
        effective_date: new Date('1998-01-01'),
        last_updated: new Date('2024-01-15'),
      }
    ]);

    this.addStateRules('FL', [
      {
        state: 'FL',
        jurisdiction: 'state',
        category: 'interconnection',
        requirement: 'Net Metering and Interconnection Standards',
        compliance_level: 'required',
        authority: 'Florida Public Service Commission',
        regulation_reference: 'Rule 25-6.065, FAC',
        penalty_description: 'Administrative fines up to $25,000 per violation',
        documentation_required: [
          'Interconnection agreement',
          'System specifications',
          'Insurance documentation',
          'Installation certifications'
        ],
        effective_date: new Date('2008-01-01'),
        last_updated: new Date('2023-12-01'),
      }
    ]);

    // Add remaining 46 states with basic compliance frameworks
    const remainingStates = [
      'AL', 'AK', 'AZ', 'AR', 'CO', 'CT', 'DE', 'GA', 'HI', 'ID', 'IL', 'IN', 
      'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 
      'NE', 'NV', 'NH', 'NJ', 'NM', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 
      'SC', 'SD', 'TN', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    remainingStates.forEach(state => {
      this.addStateRules(state, this.generateBasicStateRules(state));
    });
  }

  /**
   * Generate basic compliance rules for states without detailed frameworks
   */
  private generateBasicStateRules(state: string): StateComplianceRule[] {
    const stateAuthorities: Record<string, string> = {
      'AL': 'Alabama Public Service Commission',
      'AK': 'Regulatory Commission of Alaska',
      'AZ': 'Arizona Corporation Commission',
      'AR': 'Arkansas Public Service Commission',
      'CO': 'Colorado Public Utilities Commission',
      'CT': 'Public Utilities Regulatory Authority',
      'DE': 'Delaware Public Service Commission',
      'GA': 'Georgia Public Service Commission',
      'HI': 'Hawaii Public Utilities Commission',
      'ID': 'Idaho Public Utilities Commission',
      'IL': 'Illinois Commerce Commission',
      'IN': 'Indiana Utility Regulatory Commission',
      'IA': 'Iowa Utilities Board',
      'KS': 'Kansas Corporation Commission',
      'KY': 'Kentucky Public Service Commission',
      'LA': 'Louisiana Public Service Commission',
      'ME': 'Maine Public Utilities Commission',
      'MD': 'Maryland Public Service Commission',
      'MA': 'Massachusetts Department of Public Utilities',
      'MI': 'Michigan Public Service Commission',
      'MN': 'Minnesota Public Utilities Commission',
      'MS': 'Mississippi Public Service Commission',
      'MO': 'Missouri Public Service Commission',
      'MT': 'Montana Public Service Commission',
      'NE': 'Nebraska Public Service Commission',
      'NV': 'Nevada Public Utilities Commission',
      'NH': 'New Hampshire Public Utilities Commission',
      'NJ': 'New Jersey Board of Public Utilities',
      'NM': 'New Mexico Public Regulation Commission',
      'NC': 'North Carolina Utilities Commission',
      'ND': 'North Dakota Public Service Commission',
      'OH': 'Public Utilities Commission of Ohio',
      'OK': 'Oklahoma Corporation Commission',
      'OR': 'Oregon Public Utility Commission',
      'PA': 'Pennsylvania Public Utility Commission',
      'RI': 'Rhode Island Public Utilities Commission',
      'SC': 'South Carolina Public Service Commission',
      'SD': 'South Dakota Public Utilities Commission',
      'TN': 'Tennessee Regulatory Authority',
      'UT': 'Utah Public Service Commission',
      'VT': 'Vermont Public Utility Commission',
      'VA': 'State Corporation Commission of Virginia',
      'WA': 'Washington Utilities and Transportation Commission',
      'WV': 'West Virginia Public Service Commission',
      'WI': 'Public Service Commission of Wisconsin',
      'WY': 'Wyoming Public Service Commission'
    };

    return [
      {
        state,
        jurisdiction: 'state',
        category: 'licensing',
        requirement: 'Business Registration and Utility Commission Notification',
        compliance_level: 'required',
        authority: stateAuthorities[state] || `${state} State Utility Commission`,
        regulation_reference: 'State Public Utility Code',
        penalty_description: 'Administrative penalties and potential service suspension',
        annual_fee: 1000,
        renewal_period_months: 12,
        notification_days: 30,
        documentation_required: [
          'Business license',
          'Insurance documentation',
          'Service area designation',
          'Customer protection plan'
        ],
        effective_date: new Date('2020-01-01'),
        last_updated: new Date('2024-01-01'),
      },
      {
        state,
        jurisdiction: 'state',
        category: 'interconnection',
        requirement: 'Distributed Generation Interconnection Standards',
        compliance_level: 'required',
        authority: stateAuthorities[state] || `${state} State Utility Commission`,
        regulation_reference: 'State Interconnection Standards',
        penalty_description: 'Loss of interconnection rights, system disconnection',
        documentation_required: [
          'Interconnection application',
          'System technical specifications',
          'Safety certification',
          'Utility coordination records'
        ],
        effective_date: new Date('2015-01-01'),
        last_updated: new Date('2023-06-01'),
      }
    ];
  }

  /**
   * Add compliance rules for a state
   */
  private addStateRules(state: string, rules: StateComplianceRule[]): void {
    this.complianceRules.set(state, rules);
  }

  /**
   * Assess compliance for customer in specific state
   */
  async assessCustomerCompliance(customerId: string, state: string): Promise<ComplianceAssessment> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        energyServiceAgreements: true,
        utilityConnections: true,
      }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const stateRules = this.complianceRules.get(state) || [];
    const violations: ComplianceViolation[] = [];
    const requiredActions: ComplianceAction[] = [];
    let estimatedCost = 0;
    let timelineDays = 0;

    // Check each compliance rule
    for (const rule of stateRules) {
      const compliance = await this.checkRuleCompliance(customerId, rule);
      
      if (!compliance.compliant) {
        violations.push({
          rule_id: `${rule.state}_${rule.category}_${rule.requirement.replace(/\s+/g, '_')}`,
          severity: this.determineSeverity(rule),
          description: `Non-compliance with ${rule.requirement}`,
          potential_penalty: rule.penalty_description || 'Regulatory action possible',
          remediation_required: rule.compliance_level === 'required',
        });

        // Generate required actions
        const action = this.generateComplianceAction(rule);
        requiredActions.push(action);
        estimatedCost += action.cost;
        
        if (action.deadline.getTime() - Date.now() > timelineDays * 24 * 60 * 60 * 1000) {
          timelineDays = Math.ceil((action.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        }
      }
    }

    const assessment: ComplianceAssessment = {
      customerId,
      state,
      status: violations.length === 0 ? 'compliant' : 'non_compliant',
      violations,
      required_actions: requiredActions,
      estimated_cost: estimatedCost,
      timeline_days: timelineDays,
      last_assessed: new Date(),
    };

    // Store assessment
    await this.storeComplianceAssessment(assessment);

    return assessment;
  }

  /**
   * Check if customer complies with specific rule
   */
  private async checkRuleCompliance(customerId: string, rule: StateComplianceRule): Promise<{
    compliant: boolean;
    reason?: string;
  }> {
    // Check existing compliance records
    const existingCompliance = await prisma.complianceRecord.findFirst({
      where: {
        customerId,
        state: rule.state,
        category: rule.category,
        requirement: rule.requirement,
        status: 'ACTIVE',
      }
    });

    if (existingCompliance) {
      // Check if renewal is needed
      if (rule.renewal_period_months && existingCompliance.expiresAt) {
        if (existingCompliance.expiresAt < new Date()) {
          return { compliant: false, reason: 'License/certification expired' };
        }
      }
      return { compliant: true };
    }

    // Rule-specific compliance checks
    switch (rule.category) {
      case 'licensing':
        return this.checkLicensingCompliance(customerId, rule);
      
      case 'interconnection':
        return this.checkInterconnectionCompliance(customerId, rule);
      
      case 'billing':
        return this.checkBillingCompliance(customerId, rule);
      
      case 'data_privacy':
        return this.checkDataPrivacyCompliance(customerId, rule);
      
      default:
        return { compliant: false, reason: 'No compliance record found' };
    }
  }

  /**
   * Check licensing compliance
   */
  private async checkLicensingCompliance(customerId: string, rule: StateComplianceRule): Promise<{
    compliant: boolean;
    reason?: string;
  }> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { energyServiceAgreements: true }
    });

    if (!customer?.energyServiceAgreements.length) {
      return { compliant: true }; // No service agreements = no licensing required
    }

    // Check if customer has energy service agreements in this state
    const hasServiceInState = customer.energyServiceAgreements.some(
      agreement => agreement.serviceAddress?.includes(rule.state)
    );

    if (!hasServiceInState) {
      return { compliant: true }; // No service in state = no licensing required
    }

    return { compliant: false, reason: 'Energy service licensing required for operations in state' };
  }

  /**
   * Check interconnection compliance
   */
  private async checkInterconnectionCompliance(customerId: string, rule: StateComplianceRule): Promise<{
    compliant: boolean;
    reason?: string;
  }> {
    const agreements = await prisma.energyServiceAgreement.findMany({
      where: { customerId }
    });

    const hasInterconnection = agreements.some(agreement => 
      agreement.serviceType === 'SOLAR_PLUS_STORAGE' || 
      agreement.serviceType === 'ENERGY_STORAGE'
    );

    if (!hasInterconnection) {
      return { compliant: true }; // No interconnection = no compliance needed
    }

    return { compliant: false, reason: 'Interconnection approval required for distributed generation' };
  }

  /**
   * Check billing compliance
   */
  private async checkBillingCompliance(customerId: string, rule: StateComplianceRule): Promise<{
    compliant: boolean;
    reason?: string;
  }> {
    // Check if customer has active billing
    const agreements = await prisma.energyServiceAgreement.findMany({
      where: { customerId, status: 'ACTIVE' }
    });

    if (!agreements.length) {
      return { compliant: true };
    }

    // In production, would check billing format compliance, customer protection standards, etc.
    return { compliant: false, reason: 'Billing procedures must meet state customer protection standards' };
  }

  /**
   * Check data privacy compliance
   */
  private async checkDataPrivacyCompliance(customerId: string, rule: StateComplianceRule): Promise<{
    compliant: boolean;
    reason?: string;
  }> {
    // Check if privacy policy and procedures are in place
    // In production, would verify CCPA, privacy policy, data processing agreements
    return { compliant: false, reason: 'Data privacy compliance documentation required' };
  }

  /**
   * Determine violation severity
   */
  private determineSeverity(rule: StateComplianceRule): 'critical' | 'high' | 'medium' | 'low' {
    if (rule.compliance_level === 'required') {
      if (rule.category === 'licensing' || rule.category === 'data_privacy') {
        return 'critical';
      }
      return 'high';
    }
    return 'medium';
  }

  /**
   * Generate compliance action for rule
   */
  private generateComplianceAction(rule: StateComplianceRule): ComplianceAction {
    const baseDeadline = new Date();
    baseDeadline.setDate(baseDeadline.getDate() + (rule.notification_days || 30));

    return {
      type: this.getActionType(rule.category),
      description: `Complete ${rule.requirement} with ${rule.authority}`,
      deadline: baseDeadline,
      cost: rule.annual_fee || 1000,
      responsible_party: 'customer',
      status: 'pending',
    };
  }

  /**
   * Get action type from category
   */
  private getActionType(category: string): ComplianceAction['type'] {
    switch (category) {
      case 'licensing':
        return 'license_application';
      case 'billing':
      case 'interconnection':
        return 'filing_requirement';
      case 'data_privacy':
        return 'documentation';
      default:
        return 'notification';
    }
  }

  /**
   * Store compliance assessment
   */
  private async storeComplianceAssessment(assessment: ComplianceAssessment): Promise<void> {
    await prisma.complianceAssessment.create({
      data: {
        customerId: assessment.customerId,
        state: assessment.state,
        status: assessment.status,
        violations: assessment.violations,
        requiredActions: assessment.required_actions,
        estimatedCost: assessment.estimated_cost,
        timelineDays: assessment.timeline_days,
        assessedAt: assessment.last_assessed,
        createdAt: new Date(),
      }
    });
  }

  /**
   * Get compliance status for all customer states
   */
  async getCustomerComplianceStatus(customerId: string): Promise<ComplianceAssessment[]> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { energyServiceAgreements: true }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get unique states from service agreements
    const states = [...new Set(
      customer.energyServiceAgreements
        .map(agreement => this.extractStateFromAddress(agreement.serviceAddress))
        .filter(Boolean)
    )];

    const assessments = [];
    for (const state of states) {
      const assessment = await this.assessCustomerCompliance(customerId, state);
      assessments.push(assessment);
    }

    return assessments;
  }

  /**
   * Extract state from address string
   */
  private extractStateFromAddress(address: string | null): string | null {
    if (!address) return null;
    
    const stateMatch = address.match(/\b([A-Z]{2})\b/);
    return stateMatch ? stateMatch[1] : null;
  }

  /**
   * Get compliance requirements for state
   */
  getStateRequirements(state: string): StateComplianceRule[] {
    return this.complianceRules.get(state) || [];
  }

  /**
   * Get upcoming compliance deadlines
   */
  async getUpcomingDeadlines(customerId: string, days: number = 30): Promise<ComplianceAction[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const assessments = await prisma.complianceAssessment.findMany({
      where: {
        customerId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const upcomingActions: ComplianceAction[] = [];
    
    for (const assessment of assessments) {
      const actions = assessment.requiredActions as ComplianceAction[];
      const upcoming = actions.filter(action => 
        action.status === 'pending' && 
        new Date(action.deadline) <= cutoffDate
      );
      upcomingActions.push(...upcoming);
    }

    return upcomingActions.sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  }

  /**
   * Mark compliance action as completed
   */
  async completeComplianceAction(
    customerId: string, 
    actionDescription: string,
    completionDate: Date = new Date()
  ): Promise<void> {
    // Create compliance record
    await prisma.complianceRecord.create({
      data: {
        customerId,
        state: 'MULTI', // Will be updated with specific state logic
        category: 'licensing', // Will be determined from action
        requirement: actionDescription,
        status: 'ACTIVE',
        completedAt: completionDate,
        expiresAt: new Date(completionDate.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year default
        createdAt: new Date(),
      }
    });
  }

  /**
   * Generate compliance report for customer
   */
  async generateComplianceReport(customerId: string): Promise<{
    customer: any;
    overall_status: 'compliant' | 'non_compliant' | 'partial';
    state_assessments: ComplianceAssessment[];
    total_violations: number;
    critical_violations: number;
    total_estimated_cost: number;
    upcoming_deadlines: ComplianceAction[];
    recommendations: string[];
  }> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    const assessments = await this.getCustomerComplianceStatus(customerId);
    const upcomingDeadlines = await this.getUpcomingDeadlines(customerId);

    const totalViolations = assessments.reduce((sum, a) => sum + a.violations.length, 0);
    const criticalViolations = assessments.reduce((sum, a) => 
      sum + a.violations.filter(v => v.severity === 'critical').length, 0
    );
    const totalCost = assessments.reduce((sum, a) => sum + a.estimated_cost, 0);

    const overallStatus = assessments.every(a => a.status === 'compliant') 
      ? 'compliant' 
      : assessments.some(a => a.status === 'compliant')
      ? 'partial'
      : 'non_compliant';

    const recommendations = this.generateRecommendations(assessments, upcomingDeadlines);

    return {
      customer,
      overall_status: overallStatus,
      state_assessments: assessments,
      total_violations: totalViolations,
      critical_violations: criticalViolations,
      total_estimated_cost: totalCost,
      upcoming_deadlines: upcomingDeadlines,
      recommendations,
    };
  }

  /**
   * Generate compliance recommendations
   */
  private generateRecommendations(
    assessments: ComplianceAssessment[], 
    deadlines: ComplianceAction[]
  ): string[] {
    const recommendations: string[] = [];

    // Critical violations
    const criticalStates = assessments.filter(a => 
      a.violations.some(v => v.severity === 'critical')
    );
    
    if (criticalStates.length > 0) {
      recommendations.push(
        `Address critical compliance violations in ${criticalStates.map(s => s.state).join(', ')} immediately to avoid penalties`
      );
    }

    // Upcoming deadlines
    const urgentDeadlines = deadlines.filter(d => 
      new Date(d.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
    );

    if (urgentDeadlines.length > 0) {
      recommendations.push(
        `Complete ${urgentDeadlines.length} compliance actions within the next 7 days`
      );
    }

    // Cost optimization
    const totalCost = assessments.reduce((sum, a) => sum + a.estimated_cost, 0);
    if (totalCost > 25000) {
      recommendations.push(
        'Consider engaging compliance consultant to optimize regulatory strategy and reduce costs'
      );
    }

    // Multi-state optimization
    if (assessments.length > 3) {
      recommendations.push(
        'Implement standardized compliance procedures across all states to reduce administrative burden'
      );
    }

    return recommendations;
  }
}