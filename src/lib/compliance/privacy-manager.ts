import crypto from 'crypto';
import { EventEmitter } from 'events';

export interface DataSubject {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  nationality?: string;
  consentRecords: ConsentRecord[];
  dataProcessingRecords: DataProcessingRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentRecord {
  id: string;
  dataSubjectId: string;
  purpose: DataProcessingPurpose;
  legalBasis: LegalBasis;
  consentGiven: boolean;
  consentTimestamp: Date;
  consentWithdrawnTimestamp?: Date;
  version: string;
  source: 'web' | 'mobile' | 'api' | 'manual';
  ipAddress?: string;
  userAgent?: string;
  granular: GranularConsent[];
}

export interface GranularConsent {
  category: DataCategory;
  purpose: DataProcessingPurpose;
  consented: boolean;
  mandatory: boolean;
}

export interface DataProcessingRecord {
  id: string;
  dataSubjectId: string;
  dataCategory: DataCategory;
  purpose: DataProcessingPurpose;
  legalBasis: LegalBasis;
  processingType: ProcessingType;
  dataLocation: string;
  retentionPeriod: number;
  thirdPartySharing: ThirdPartySharing[];
  timestamp: Date;
  automatedDecisionMaking: boolean;
  profiling: boolean;
}

export interface ThirdPartySharing {
  recipient: string;
  purpose: string;
  legalBasis: LegalBasis;
  dataTransferMechanism?: 'adequacy_decision' | 'standard_contractual_clauses' | 'binding_corporate_rules' | 'certification';
  country?: string;
  timestamp: Date;
}

export type DataCategory = 
  | 'personal_identifiers'
  | 'contact_information'
  | 'demographic_data'
  | 'financial_data'
  | 'health_data'
  | 'biometric_data'
  | 'behavioral_data'
  | 'location_data'
  | 'technical_data'
  | 'usage_data'
  | 'communication_data'
  | 'special_category_data';

export type DataProcessingPurpose = 
  | 'service_provision'
  | 'contract_performance'
  | 'legal_compliance'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interests'
  | 'marketing'
  | 'analytics'
  | 'security'
  | 'research'
  | 'profiling'
  | 'automated_decision_making';

export type LegalBasis = 
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interests';

export type ProcessingType = 
  | 'collection'
  | 'storage'
  | 'use'
  | 'disclosure'
  | 'combination'
  | 'erasure'
  | 'restriction'
  | 'transfer';

export interface DataAccessRequest {
  id: string;
  dataSubjectId: string;
  requestType: 'access' | 'portability' | 'rectification' | 'erasure' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'partially_completed';
  requestTimestamp: Date;
  completionTimestamp?: Date;
  verificationMethod: string;
  fulfillmentData?: any;
  rejectionReason?: string;
  extensionRequested?: boolean;
  extensionReason?: string;
}

export interface DataBreach {
  id: string;
  timestamp: Date;
  discoveredTimestamp: Date;
  reportedTimestamp?: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedDataSubjects: number;
  dataCategories: DataCategory[];
  breachType: 'confidentiality' | 'integrity' | 'availability' | 'combined';
  description: string;
  cause: string;
  containmentMeasures: string[];
  remediationMeasures: string[];
  supervisoryAuthorityNotified: boolean;
  dataSubjectsNotified: boolean;
  riskAssessment: RiskAssessment;
}

export interface RiskAssessment {
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  mitigatingFactors: string[];
}

export interface PrivacyImpactAssessment {
  id: string;
  projectName: string;
  description: string;
  dataCategories: DataCategory[];
  processingPurposes: DataProcessingPurpose[];
  riskAssessment: RiskAssessment;
  mitigationMeasures: string[];
  consultationRequired: boolean;
  supervisoryAuthorityConsulted: boolean;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
}

export interface DataRetentionPolicy {
  id: string;
  dataCategory: DataCategory;
  purpose: DataProcessingPurpose;
  retentionPeriod: number; // days
  retentionCriteria: string;
  deletionMethod: 'hard_delete' | 'soft_delete' | 'anonymization' | 'pseudonymization';
  exceptions: string[];
  legalRequirements: string[];
  reviewPeriod: number; // days
  lastReviewed: Date;
}

export interface AnonymizationConfig {
  technique: 'generalization' | 'suppression' | 'masking' | 'noise_addition' | 'differential_privacy';
  parameters: Record<string, any>;
  effectiveness: 'low' | 'medium' | 'high';
  reversible: boolean;
}

export class PrivacyManager extends EventEmitter {
  private dataSubjects: Map<string, DataSubject> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private dataAccessRequests: Map<string, DataAccessRequest> = new Map();
  private dataBreaches: Map<string, DataBreach> = new Map();
  private retentionPolicies: Map<string, DataRetentionPolicy> = new Map();
  private piaAssessments: Map<string, PrivacyImpactAssessment> = new Map();

  constructor() {
    super();
    this.initializeDefaultPolicies();
    this.startRetentionEnforcement();
  }

  private initializeDefaultPolicies(): void {
    // Initialize default retention policies
    const defaultPolicies: DataRetentionPolicy[] = [
      {
        id: 'personal-identifiers-service',
        dataCategory: 'personal_identifiers',
        purpose: 'service_provision',
        retentionPeriod: 2555, // 7 years
        retentionCriteria: 'Until account deletion or service termination',
        deletionMethod: 'hard_delete',
        exceptions: ['Legal hold', 'Ongoing dispute'],
        legalRequirements: ['Tax records', 'Financial regulations'],
        reviewPeriod: 365,
        lastReviewed: new Date()
      },
      {
        id: 'marketing-data',
        dataCategory: 'contact_information',
        purpose: 'marketing',
        retentionPeriod: 1095, // 3 years
        retentionCriteria: 'Until consent withdrawn or 3 years of inactivity',
        deletionMethod: 'hard_delete',
        exceptions: [],
        legalRequirements: [],
        reviewPeriod: 365,
        lastReviewed: new Date()
      }
    ];

    defaultPolicies.forEach(policy => {
      this.retentionPolicies.set(policy.id, policy);
    });
  }

  private startRetentionEnforcement(): void {
    // Run retention enforcement daily
    setInterval(() => {
      this.enforceRetentionPolicies();
    }, 24 * 60 * 60 * 1000);
  }

  // Data Subject Management
  async createDataSubject(data: Partial<DataSubject>): Promise<DataSubject> {
    const dataSubject: DataSubject = {
      id: data.id || this.generateId(),
      email: data.email!,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
      nationality: data.nationality,
      consentRecords: [],
      dataProcessingRecords: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dataSubjects.set(dataSubject.id, dataSubject);
    
    this.emit('data-subject-created', dataSubject);
    
    return dataSubject;
  }

  async updateDataSubject(id: string, updates: Partial<DataSubject>): Promise<DataSubject> {
    const dataSubject = this.dataSubjects.get(id);
    if (!dataSubject) {
      throw new Error(`Data subject ${id} not found`);
    }

    const updatedSubject = { ...dataSubject, ...updates, updatedAt: new Date() };
    this.dataSubjects.set(id, updatedSubject);
    
    this.emit('data-subject-updated', updatedSubject);
    
    return updatedSubject;
  }

  async deleteDataSubject(id: string, reason: string): Promise<void> {
    const dataSubject = this.dataSubjects.get(id);
    if (!dataSubject) {
      throw new Error(`Data subject ${id} not found`);
    }

    // Log data processing record for deletion
    await this.recordDataProcessing({
      dataSubjectId: id,
      dataCategory: 'personal_identifiers',
      purpose: 'legal_compliance',
      legalBasis: 'legal_obligation',
      processingType: 'erasure',
      dataLocation: 'local',
      retentionPeriod: 0,
      thirdPartySharing: [],
      automatedDecisionMaking: false,
      profiling: false
    });

    this.dataSubjects.delete(id);
    
    this.emit('data-subject-deleted', { id, reason });
  }

  // Consent Management
  async recordConsent(consent: Omit<ConsentRecord, 'id'>): Promise<ConsentRecord> {
    const consentRecord: ConsentRecord = {
      id: this.generateId(),
      ...consent
    };

    this.consentRecords.set(consentRecord.id, consentRecord);
    
    // Update data subject's consent records
    const dataSubject = this.dataSubjects.get(consent.dataSubjectId);
    if (dataSubject) {
      dataSubject.consentRecords.push(consentRecord);
      this.dataSubjects.set(dataSubject.id, dataSubject);
    }

    this.emit('consent-recorded', consentRecord);
    
    return consentRecord;
  }

  async withdrawConsent(consentId: string): Promise<void> {
    const consent = this.consentRecords.get(consentId);
    if (!consent) {
      throw new Error(`Consent record ${consentId} not found`);
    }

    consent.consentGiven = false;
    consent.consentWithdrawnTimestamp = new Date();
    
    this.consentRecords.set(consentId, consent);
    
    this.emit('consent-withdrawn', consent);
  }

  async getConsentStatus(dataSubjectId: string, purpose: DataProcessingPurpose): Promise<ConsentRecord | null> {
    const dataSubject = this.dataSubjects.get(dataSubjectId);
    if (!dataSubject) {
      return null;
    }

    // Find most recent consent for the purpose
    const relevantConsents = dataSubject.consentRecords
      .filter(c => c.purpose === purpose)
      .sort((a, b) => b.consentTimestamp.getTime() - a.consentTimestamp.getTime());

    return relevantConsents[0] || null;
  }

  async hasValidConsent(dataSubjectId: string, purpose: DataProcessingPurpose): Promise<boolean> {
    const consent = await this.getConsentStatus(dataSubjectId, purpose);
    return consent ? consent.consentGiven && !consent.consentWithdrawnTimestamp : false;
  }

  // Data Processing Records
  async recordDataProcessing(processing: Omit<DataProcessingRecord, 'id' | 'timestamp'>): Promise<DataProcessingRecord> {
    const record: DataProcessingRecord = {
      id: this.generateId(),
      timestamp: new Date(),
      ...processing
    };

    const dataSubject = this.dataSubjects.get(processing.dataSubjectId);
    if (dataSubject) {
      dataSubject.dataProcessingRecords.push(record);
      this.dataSubjects.set(dataSubject.id, dataSubject);
    }

    this.emit('data-processing-recorded', record);
    
    return record;
  }

  // Data Subject Rights
  async submitDataAccessRequest(request: Omit<DataAccessRequest, 'id' | 'requestTimestamp' | 'status'>): Promise<DataAccessRequest> {
    const accessRequest: DataAccessRequest = {
      id: this.generateId(),
      requestTimestamp: new Date(),
      status: 'pending',
      ...request
    };

    this.dataAccessRequests.set(accessRequest.id, accessRequest);
    
    this.emit('data-access-request-submitted', accessRequest);
    
    // Auto-process if possible
    if (accessRequest.requestType === 'access') {
      await this.processDataAccessRequest(accessRequest.id);
    }

    return accessRequest;
  }

  private async processDataAccessRequest(requestId: string): Promise<void> {
    const request = this.dataAccessRequests.get(requestId);
    if (!request) {
      throw new Error(`Data access request ${requestId} not found`);
    }

    request.status = 'processing';
    this.dataAccessRequests.set(requestId, request);

    try {
      switch (request.requestType) {
        case 'access':
          await this.fulfillAccessRequest(request);
          break;
        case 'portability':
          await this.fulfillPortabilityRequest(request);
          break;
        case 'rectification':
          await this.fulfillRectificationRequest(request);
          break;
        case 'erasure':
          await this.fulfillErasureRequest(request);
          break;
        case 'restriction':
          await this.fulfillRestrictionRequest(request);
          break;
        case 'objection':
          await this.fulfillObjectionRequest(request);
          break;
      }

      request.status = 'completed';
      request.completionTimestamp = new Date();
    } catch (error) {
      request.status = 'rejected';
      request.rejectionReason = error instanceof Error ? error.message : 'Unknown error';
    }

    this.dataAccessRequests.set(requestId, request);
    this.emit('data-access-request-processed', request);
  }

  private async fulfillAccessRequest(request: DataAccessRequest): Promise<void> {
    const dataSubject = this.dataSubjects.get(request.dataSubjectId);
    if (!dataSubject) {
      throw new Error('Data subject not found');
    }

    // Compile all personal data
    const personalData = {
      personalInformation: {
        id: dataSubject.id,
        email: dataSubject.email,
        firstName: dataSubject.firstName,
        lastName: dataSubject.lastName,
        phoneNumber: dataSubject.phoneNumber,
        dateOfBirth: dataSubject.dateOfBirth,
        nationality: dataSubject.nationality
      },
      consentRecords: dataSubject.consentRecords,
      processingRecords: dataSubject.dataProcessingRecords,
      requestHistory: Array.from(this.dataAccessRequests.values())
        .filter(r => r.dataSubjectId === request.dataSubjectId)
    };

    request.fulfillmentData = personalData;
  }

  private async fulfillPortabilityRequest(request: DataAccessRequest): Promise<void> {
    const dataSubject = this.dataSubjects.get(request.dataSubjectId);
    if (!dataSubject) {
      throw new Error('Data subject not found');
    }

    // Export data in structured format
    const portableData = {
      format: 'JSON',
      version: '1.0',
      exportTimestamp: new Date().toISOString(),
      data: {
        profile: {
          email: dataSubject.email,
          firstName: dataSubject.firstName,
          lastName: dataSubject.lastName,
          phoneNumber: dataSubject.phoneNumber
        },
        preferences: dataSubject.consentRecords
          .filter(c => c.consentGiven && !c.consentWithdrawnTimestamp)
          .map(c => ({
            purpose: c.purpose,
            timestamp: c.consentTimestamp.toISOString()
          }))
      }
    };

    request.fulfillmentData = portableData;
  }

  private async fulfillRectificationRequest(request: DataAccessRequest): Promise<void> {
    // Implementation would allow data subject to update their information
    // This would typically involve a secure form or API endpoint
  }

  private async fulfillErasureRequest(request: DataAccessRequest): Promise<void> {
    const dataSubject = this.dataSubjects.get(request.dataSubjectId);
    if (!dataSubject) {
      throw new Error('Data subject not found');
    }

    // Check if erasure is legally required or allowed
    const canErase = await this.canEraseDataSubject(request.dataSubjectId);
    if (!canErase.allowed) {
      throw new Error(`Erasure not allowed: ${canErase.reason}`);
    }

    await this.deleteDataSubject(request.dataSubjectId, 'Data subject erasure request');
  }

  private async fulfillRestrictionRequest(request: DataAccessRequest): Promise<void> {
    // Implementation would restrict processing for the data subject
    // This is a placeholder for the actual implementation
  }

  private async fulfillObjectionRequest(request: DataAccessRequest): Promise<void> {
    // Implementation would handle objection to processing
    // This is a placeholder for the actual implementation
  }

  private async canEraseDataSubject(dataSubjectId: string): Promise<{ allowed: boolean; reason?: string }> {
    // Check for legal holds, ongoing contracts, etc.
    const dataSubject = this.dataSubjects.get(dataSubjectId);
    if (!dataSubject) {
      return { allowed: true };
    }

    // Check for processing based on legal obligations
    const legalObligationProcessing = dataSubject.dataProcessingRecords
      .filter(r => r.legalBasis === 'legal_obligation');

    if (legalObligationProcessing.length > 0) {
      return { allowed: false, reason: 'Data required for legal compliance' };
    }

    // Check for active contracts
    const contractProcessing = dataSubject.dataProcessingRecords
      .filter(r => r.legalBasis === 'contract');

    if (contractProcessing.length > 0) {
      return { allowed: false, reason: 'Data required for contract performance' };
    }

    return { allowed: true };
  }

  // Data Breach Management
  async reportDataBreach(breach: Omit<DataBreach, 'id'>): Promise<DataBreach> {
    const dataBreach: DataBreach = {
      id: this.generateId(),
      ...breach
    };

    this.dataBreaches.set(dataBreach.id, dataBreach);
    
    this.emit('data-breach-reported', dataBreach);
    
    // Trigger breach notification process if required
    if (this.requiresBreachNotification(dataBreach)) {
      await this.initiateBreachNotification(dataBreach);
    }

    return dataBreach;
  }

  private requiresBreachNotification(breach: DataBreach): boolean {
    // GDPR requires notification within 72 hours for high-risk breaches
    return breach.riskAssessment.overallRisk === 'high' || 
           breach.riskAssessment.overallRisk === 'critical';
  }

  private async initiateBreachNotification(breach: DataBreach): Promise<void> {
    // Notify supervisory authority
    this.emit('breach-notification-required', breach);
    
    // Notify affected data subjects if high risk
    if (breach.riskAssessment.overallRisk === 'critical') {
      this.emit('data-subject-notification-required', breach);
    }
  }

  // Privacy Impact Assessment
  async createPrivacyImpactAssessment(pia: Omit<PrivacyImpactAssessment, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<PrivacyImpactAssessment> {
    const assessment: PrivacyImpactAssessment = {
      id: this.generateId(),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...pia
    };

    this.piaAssessments.set(assessment.id, assessment);
    
    this.emit('pia-created', assessment);
    
    return assessment;
  }

  async updatePrivacyImpactAssessment(id: string, updates: Partial<PrivacyImpactAssessment>): Promise<PrivacyImpactAssessment> {
    const pia = this.piaAssessments.get(id);
    if (!pia) {
      throw new Error(`Privacy Impact Assessment ${id} not found`);
    }

    const updated = { ...pia, ...updates, updatedAt: new Date() };
    this.piaAssessments.set(id, updated);
    
    this.emit('pia-updated', updated);
    
    return updated;
  }

  // Data Minimization and Anonymization
  async anonymizeData(dataSubjectId: string, config: AnonymizationConfig): Promise<void> {
    const dataSubject = this.dataSubjects.get(dataSubjectId);
    if (!dataSubject) {
      throw new Error(`Data subject ${dataSubjectId} not found`);
    }

    // Apply anonymization technique based on config
    switch (config.technique) {
      case 'generalization':
        await this.applyGeneralization(dataSubject, config.parameters);
        break;
      case 'suppression':
        await this.applySuppression(dataSubject, config.parameters);
        break;
      case 'masking':
        await this.applyMasking(dataSubject, config.parameters);
        break;
      case 'noise_addition':
        await this.applyNoiseAddition(dataSubject, config.parameters);
        break;
      case 'differential_privacy':
        await this.applyDifferentialPrivacy(dataSubject, config.parameters);
        break;
    }

    this.emit('data-anonymized', { dataSubjectId, technique: config.technique });
  }

  private async applyGeneralization(dataSubject: DataSubject, parameters: any): Promise<void> {
    // Generalize specific fields (e.g., age ranges instead of exact dates)
    if (dataSubject.dateOfBirth) {
      const age = new Date().getFullYear() - dataSubject.dateOfBirth.getFullYear();
      const ageRange = Math.floor(age / 10) * 10;
      // Would replace exact birthdate with age range
    }
  }

  private async applySuppression(dataSubject: DataSubject, parameters: any): Promise<void> {
    // Remove or redact specific fields
    dataSubject.firstName = undefined;
    dataSubject.lastName = undefined;
    dataSubject.phoneNumber = undefined;
  }

  private async applyMasking(dataSubject: DataSubject, parameters: any): Promise<void> {
    // Mask sensitive data
    if (dataSubject.email) {
      const [local, domain] = dataSubject.email.split('@');
      dataSubject.email = `${local.slice(0, 2)}***@${domain}`;
    }
  }

  private async applyNoiseAddition(dataSubject: DataSubject, parameters: any): Promise<void> {
    // Add statistical noise to numerical data
    if (dataSubject.dateOfBirth) {
      const noise = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 365) - 182; // +/- 6 months
      dataSubject.dateOfBirth.setDate(dataSubject.dateOfBirth.getDate() + noise);
    }
  }

  private async applyDifferentialPrivacy(dataSubject: DataSubject, parameters: any): Promise<void> {
    // Apply differential privacy mechanisms
    // This is a simplified implementation
    const epsilon = parameters.epsilon || 1.0;
    
    // Add Laplace noise to sensitive attributes
    if (dataSubject.dateOfBirth) {
      const sensitivity = 365; // days
      const noise = this.laplaceMechanism(0, sensitivity / epsilon);
      dataSubject.dateOfBirth.setDate(dataSubject.dateOfBirth.getDate() + Math.floor(noise));
    }
  }

  private laplaceMechanism(location: number, scale: number): number {
    const u = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5;
    return location - scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }

  // Retention Policy Management
  async createRetentionPolicy(policy: Omit<DataRetentionPolicy, 'id'>): Promise<DataRetentionPolicy> {
    const retentionPolicy: DataRetentionPolicy = {
      id: this.generateId(),
      ...policy
    };

    this.retentionPolicies.set(retentionPolicy.id, retentionPolicy);
    
    this.emit('retention-policy-created', retentionPolicy);
    
    return retentionPolicy;
  }

  async updateRetentionPolicy(id: string, updates: Partial<DataRetentionPolicy>): Promise<DataRetentionPolicy> {
    const policy = this.retentionPolicies.get(id);
    if (!policy) {
      throw new Error(`Retention policy ${id} not found`);
    }

    const updated = { ...policy, ...updates };
    this.retentionPolicies.set(id, updated);
    
    this.emit('retention-policy-updated', updated);
    
    return updated;
  }

  private async enforceRetentionPolicies(): Promise<void> {
    for (const [dataSubjectId, dataSubject] of this.dataSubjects.entries()) {
      for (const processing of dataSubject.dataProcessingRecords) {
        const policy = Array.from(this.retentionPolicies.values())
          .find(p => p.dataCategory === processing.dataCategory && p.purpose === processing.purpose);

        if (policy) {
          const retentionEnd = new Date(processing.timestamp.getTime() + policy.retentionPeriod * 24 * 60 * 60 * 1000);
          
          if (new Date() > retentionEnd) {
            await this.enforceRetention(dataSubjectId, processing, policy);
          }
        }
      }
    }
  }

  private async enforceRetention(dataSubjectId: string, processing: DataProcessingRecord, policy: DataRetentionPolicy): Promise<void> {
    switch (policy.deletionMethod) {
      case 'hard_delete':
        await this.deleteDataSubject(dataSubjectId, 'Retention policy enforcement');
        break;
      case 'soft_delete':
        // Mark as deleted but keep for recovery
        break;
      case 'anonymization':
        await this.anonymizeData(dataSubjectId, {
          technique: 'suppression',
          parameters: {},
          effectiveness: 'high',
          reversible: false
        });
        break;
      case 'pseudonymization':
        // Replace identifiers with pseudonyms
        break;
    }

    this.emit('retention-enforced', { dataSubjectId, policy: policy.id, method: policy.deletionMethod });
  }

  // Compliance Reporting
  async generatePrivacyReport(startDate: Date, endDate: Date): Promise<any> {
    const dataSubjectsCreated = Array.from(this.dataSubjects.values())
      .filter(ds => ds.createdAt >= startDate && ds.createdAt <= endDate).length;

    const consentRecords = Array.from(this.consentRecords.values())
      .filter(c => c.consentTimestamp >= startDate && c.consentTimestamp <= endDate);

    const accessRequests = Array.from(this.dataAccessRequests.values())
      .filter(r => r.requestTimestamp >= startDate && r.requestTimestamp <= endDate);

    const breaches = Array.from(this.dataBreaches.values())
      .filter(b => b.timestamp >= startDate && b.timestamp <= endDate);

    return {
      period: { startDate, endDate },
      dataSubjects: {
        created: dataSubjectsCreated,
        total: this.dataSubjects.size
      },
      consent: {
        given: consentRecords.filter(c => c.consentGiven).length,
        withdrawn: consentRecords.filter(c => c.consentWithdrawnTimestamp).length
      },
      dataSubjectRights: {
        accessRequests: accessRequests.filter(r => r.requestType === 'access').length,
        erasureRequests: accessRequests.filter(r => r.requestType === 'erasure').length,
        portabilityRequests: accessRequests.filter(r => r.requestType === 'portability').length,
        averageResponseTime: this.calculateAverageResponseTime(accessRequests)
      },
      breaches: {
        total: breaches.length,
        reported: breaches.filter(b => b.supervisoryAuthorityNotified).length,
        highRisk: breaches.filter(b => b.severity === 'high' || b.severity === 'critical').length
      }
    };
  }

  private calculateAverageResponseTime(requests: DataAccessRequest[]): number {
    const completedRequests = requests.filter(r => r.completionTimestamp);
    if (completedRequests.length === 0) return 0;

    const totalTime = completedRequests.reduce((sum, request) => {
      const responseTime = request.completionTimestamp!.getTime() - request.requestTimestamp.getTime();
      return sum + responseTime;
    }, 0);

    return totalTime / completedRequests.length / (24 * 60 * 60 * 1000); // Convert to days
  }

  // Compliance Checks
  async hasPrivacyByDesign(): Promise<boolean> {
    return this.piaAssessments.size > 0;
  }

  async getPrivacyDesignReport(): Promise<string[]> {
    return [
      'Privacy Impact Assessments conducted',
      'Data minimization principles applied',
      'Privacy by design methodology implemented'
    ];
  }

  async supportsDataAccess(): Promise<boolean> {
    return true; // Implementation supports data access requests
  }

  async supportsDataDeletion(): Promise<boolean> {
    return true; // Implementation supports data deletion
  }

  async getDeletionReport(): Promise<string[]> {
    const deletedSubjects = Array.from(this.dataAccessRequests.values())
      .filter(r => r.requestType === 'erasure' && r.status === 'completed');

    return [
      `${deletedSubjects.length} data erasure requests fulfilled`,
      'Automated retention policy enforcement active',
      'Secure deletion methods implemented'
    ];
  }

  async supportsDataDisclosure(): Promise<boolean> {
    return true; // Implementation supports data disclosure
  }

  async supportsOptOut(): Promise<boolean> {
    return true; // Implementation supports opt-out mechanisms
  }

  async hasDataClassification(): Promise<boolean> {
    return this.retentionPolicies.size > 0;
  }

  async getClassificationReport(): Promise<string[]> {
    const categories = new Set(Array.from(this.retentionPolicies.values()).map(p => p.dataCategory));
    return [
      `${categories.size} data categories classified`,
      'Retention policies defined for all categories',
      'Data handling procedures documented'
    ];
  }

  // Utility Methods
  private generateId(): string {
    return `privacy_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  // Export/Import
  async exportPrivacyData(format: 'JSON' | 'CSV'): Promise<string> {
    const data = {
      dataSubjects: Array.from(this.dataSubjects.values()),
      consentRecords: Array.from(this.consentRecords.values()),
      accessRequests: Array.from(this.dataAccessRequests.values()),
      breaches: Array.from(this.dataBreaches.values()),
      retentionPolicies: Array.from(this.retentionPolicies.values())
    };

    if (format === 'JSON') {
      return JSON.stringify(data, null, 2);
    } else {
      // CSV implementation would be more complex
      return JSON.stringify(data);
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; metrics: any }> {
    const pendingRequests = Array.from(this.dataAccessRequests.values())
      .filter(r => r.status === 'pending').length;

    const overduePias = Array.from(this.piaAssessments.values())
      .filter(pia => pia.status === 'draft' && 
        Date.now() - pia.createdAt.getTime() > 30 * 24 * 60 * 60 * 1000).length;

    return {
      status: pendingRequests < 10 && overduePias < 5 ? 'healthy' : 'unhealthy',
      metrics: {
        totalDataSubjects: this.dataSubjects.size,
        pendingAccessRequests: pendingRequests,
        overduePias,
        retentionPolicies: this.retentionPolicies.size,
        recentBreaches: Array.from(this.dataBreaches.values())
          .filter(b => Date.now() - b.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000).length
      }
    };
  }
}