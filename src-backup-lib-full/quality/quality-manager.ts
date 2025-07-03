import {
  QualityDocument,
  CAPA,
  LabResult,
  COA,
  Deviation,
  ChangeControl,
  Supplier,
  ProductSpecification,
  DocumentStatus,
  CAPAStatus,
  TestStatus,
  DeviationStatus,
  ChangeControlStatus,
  ApprovalStatus,
  Priority,
  Severity
} from './quality-types';

export class QualityManager {
  private documents: Map<string, QualityDocument> = new Map();
  private capas: Map<string, CAPA> = new Map();
  private labResults: Map<string, LabResult> = new Map();
  private coas: Map<string, COA> = new Map();
  private deviations: Map<string, Deviation> = new Map();
  private changeControls: Map<string, ChangeControl> = new Map();
  private suppliers: Map<string, Supplier> = new Map();
  private productSpecs: Map<string, ProductSpecification> = new Map();

  // Document Management
  createDocument(document: Omit<QualityDocument, 'id' | 'createdAt' | 'updatedAt'>): QualityDocument {
    const newDoc: QualityDocument = {
      ...document,
      id: `DOC-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.documents.set(newDoc.id, newDoc);
    return newDoc;
  }

  updateDocumentStatus(docId: string, status: DocumentStatus, approvedBy?: string): void {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    
    doc.status = status;
    if (approvedBy) doc.approvedBy = approvedBy;
    doc.updatedAt = new Date();
    
    if (status === DocumentStatus.Obsolete) {
      this.archiveDocument(doc);
    }
  }

  // CAPA Management
  createCAPA(capa: Omit<CAPA, 'id' | 'createdAt' | 'updatedAt'>): CAPA {
    const newCAPA: CAPA = {
      ...capa,
      id: `CAPA-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.capas.set(newCAPA.id, newCAPA);
    
    // Trigger notifications based on priority
    if (capa.priority === Priority.Critical) {
      this.notifyManagement(newCAPA);
    }
    
    return newCAPA;
  }

  updateCAPAStatus(capaId: string, status: CAPAStatus, updates?: Partial<CAPA>): void {
    const capa = this.capas.get(capaId);
    if (!capa) throw new Error('CAPA not found');
    
    capa.status = status;
    if (updates) {
      Object.assign(capa, updates);
    }
    
    if (status === CAPAStatus.Implemented) {
      capa.completionDate = new Date();
    } else if (status === CAPAStatus.Verified) {
      capa.verificationDate = new Date();
    }
    
    capa.updatedAt = new Date();
  }

  // Lab Results & COA
  importLabResult(result: Omit<LabResult, 'id' | 'createdAt' | 'updatedAt'>): LabResult {
    const newResult: LabResult = {
      ...result,
      id: `LAB-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.labResults.set(newResult.id, newResult);
    
    // Auto-generate COA if all tests passed
    if (this.allTestsPassed(newResult)) {
      this.generateCOA(newResult);
    } else {
      // Create deviation for failed tests
      this.createDeviationFromFailedTest(newResult);
    }
    
    return newResult;
  }

  generateCOA(labResult: LabResult): COA {
    const coa: COA = {
      id: `COA-${Date.now()}`,
      batchId: labResult.batchId,
      labResultId: labResult.id,
      certificateNumber: this.generateCertificateNumber(),
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      productName: 'Product Name', // Would be fetched from batch
      productType: 'Flower', // Would be fetched from batch
      strain: 'Strain Name', // Would be fetched from batch
      lot: labResult.batchId,
      passedAllTests: true,
      qrCode: this.generateQRCode(labResult),
      signature: 'QA Manager',
      notes: '',
      createdAt: new Date()
    };
    
    this.coas.set(coa.id, coa);
    return coa;
  }

  // Deviation Management
  createDeviation(deviation: Omit<Deviation, 'id' | 'createdAt' | 'updatedAt'>): Deviation {
    const newDeviation: Deviation = {
      ...deviation,
      id: `DEV-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.deviations.set(newDeviation.id, newDeviation);
    
    // Auto-create CAPA for critical deviations
    if (deviation.severity === Severity.Critical && deviation.investigationRequired) {
      const capa = this.createCAPA({
        type: 'Corrective',
        issueDate: new Date(),
        status: CAPAStatus.Open,
        priority: Priority.Critical,
        description: `CAPA for deviation: ${deviation.description}`,
        rootCause: 'To be determined',
        proposedAction: 'Investigation required',
        responsiblePerson: deviation.reportedBy,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        effectiveness: '',
        attachments: [],
        relatedBatches: deviation.affectedBatches
      });
      
      newDeviation.capaId = capa.id;
    }
    
    return newDeviation;
  }

  // Change Control
  createChangeControl(change: Omit<ChangeControl, 'id' | 'createdAt' | 'updatedAt'>): ChangeControl {
    const newChange: ChangeControl = {
      ...change,
      id: `CC-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.changeControls.set(newChange.id, newChange);
    return newChange;
  }

  approveChangeControl(changeId: string, approval: any): void {
    const change = this.changeControls.get(changeId);
    if (!change) throw new Error('Change control not found');
    
    change.approvals.push(approval);
    
    // Check if all required approvals are complete
    const requiredApprovals = this.getRequiredApprovals(change.changeType);
    const hasAllApprovals = requiredApprovals.every(role => 
      change.approvals.some(a => a.role === role && a.status === 'Approved')
    );
    
    if (hasAllApprovals) {
      change.status = ChangeControlStatus.Approved;
    }
    
    change.updatedAt = new Date();
  }

  // Supplier Management
  addSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier {
    const newSupplier: Supplier = {
      ...supplier,
      id: `SUP-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.suppliers.set(newSupplier.id, newSupplier);
    return newSupplier;
  }

  updateSupplierScorecard(supplierId: string, scores: Partial<Supplier['scorecard']>): void {
    const supplier = this.suppliers.get(supplierId);
    if (!supplier) throw new Error('Supplier not found');
    
    Object.assign(supplier.scorecard, scores);
    supplier.scorecard.overallScore = this.calculateOverallScore(supplier.scorecard);
    supplier.scorecard.lastUpdated = new Date();
    
    // Update approval status based on score
    if (supplier.scorecard.overallScore < 60) {
      supplier.approvalStatus = ApprovalStatus.Suspended;
      this.notifySupplierIssue(supplier);
    }
    
    supplier.updatedAt = new Date();
  }

  // Product Specifications
  createProductSpec(spec: Omit<ProductSpecification, 'id' | 'createdAt' | 'updatedAt'>): ProductSpecification {
    const newSpec: ProductSpecification = {
      ...spec,
      id: `SPEC-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.productSpecs.set(newSpec.id, newSpec);
    return newSpec;
  }

  // Quality Metrics
  getQualityMetrics(startDate: Date, endDate: Date) {
    const metrics = {
      totalDeviations: 0,
      criticalDeviations: 0,
      openCAPAs: 0,
      overdueCapas: 0,
      failedTests: 0,
      totalTests: 0,
      supplierIssues: 0,
      documentsDueForReview: 0,
      changesPending: 0,
      avgCAPAClosureTime: 0,
      testPassRate: 0,
      deviationTrend: [] as any[],
      topDeviationTypes: [] as any[]
    };

    // Calculate deviation metrics
    this.deviations.forEach(dev => {
      if (dev.date >= startDate && dev.date <= endDate) {
        metrics.totalDeviations++;
        if (dev.severity === Severity.Critical) {
          metrics.criticalDeviations++;
        }
      }
    });

    // Calculate CAPA metrics
    let totalClosureTime = 0;
    let closedCapas = 0;
    
    this.capas.forEach(capa => {
      if (capa.status !== CAPAStatus.Closed) {
        metrics.openCAPAs++;
        if (new Date() > capa.targetDate) {
          metrics.overdueCapas++;
        }
      } else if (capa.completionDate) {
        totalClosureTime += capa.completionDate.getTime() - capa.issueDate.getTime();
        closedCapas++;
      }
    });
    
    if (closedCapas > 0) {
      metrics.avgCAPAClosureTime = totalClosureTime / closedCapas / (24 * 60 * 60 * 1000); // Days
    }

    // Calculate test metrics
    this.labResults.forEach(result => {
      if (result.testDate >= startDate && result.testDate <= endDate) {
        metrics.totalTests++;
        if (result.status === TestStatus.Failed) {
          metrics.failedTests++;
        }
      }
    });
    
    if (metrics.totalTests > 0) {
      metrics.testPassRate = ((metrics.totalTests - metrics.failedTests) / metrics.totalTests) * 100;
    }

    // Calculate supplier metrics
    this.suppliers.forEach(supplier => {
      if (supplier.approvalStatus === ApprovalStatus.Suspended || 
          supplier.scorecard.overallScore < 70) {
        metrics.supplierIssues++;
      }
    });

    // Documents due for review
    this.documents.forEach(doc => {
      if (doc.status === DocumentStatus.Approved && 
          new Date() > doc.reviewDate) {
        metrics.documentsDueForReview++;
      }
    });

    // Pending changes
    this.changeControls.forEach(change => {
      if (change.status === ChangeControlStatus.UnderReview) {
        metrics.changesPending++;
      }
    });

    return metrics;
  }

  // Helper methods
  private allTestsPassed(result: LabResult): boolean {
    const pesticidesPassed = result.pesticides.every(p => p.status === 'Pass');
    const metalsPassed = result.heavyMetals.every(m => m.status === 'Pass');
    const microbialsPassed = result.microbials.every(m => m.status === 'Pass');
    const mycotoxinsPassed = result.mycotoxins.every(m => m.status === 'Pass');
    
    return pesticidesPassed && metalsPassed && microbialsPassed && mycotoxinsPassed;
  }

  private createDeviationFromFailedTest(result: LabResult): void {
    const failedTests: string[] = [];
    
    result.pesticides.forEach(p => {
      if (p.status === 'Fail') failedTests.push(`Pesticide: ${p.analyte}`);
    });
    
    result.heavyMetals.forEach(m => {
      if (m.status === 'Fail') failedTests.push(`Heavy Metal: ${m.metal}`);
    });
    
    result.microbials.forEach(m => {
      if (m.status === 'Fail') failedTests.push(`Microbial: ${m.organism}`);
    });
    
    result.mycotoxins.forEach(m => {
      if (m.status === 'Fail') failedTests.push(`Mycotoxin: ${m.mycotoxin}`);
    });
    
    this.createDeviation({
      date: new Date(),
      type: 'Testing',
      severity: Severity.Critical,
      description: `Lab test failures: ${failedTests.join(', ')}`,
      immediateAction: 'Batch quarantined pending investigation',
      investigationRequired: true,
      affectedBatches: [result.batchId],
      reportedBy: 'Quality System',
      status: DeviationStatus.Open
    });
  }

  private generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10000).toString().padStart(4, '0');
    return `COA-${year}-${random}`;
  }

  private generateQRCode(labResult: LabResult): string {
    // In real implementation, would generate actual QR code
    return `QR-${labResult.id}`;
  }

  private getRequiredApprovals(changeType: string): string[] {
    const approvals: Record<string, string[]> = {
      Process: ['QA Manager', 'Production Manager', 'Facility Manager'],
      Equipment: ['QA Manager', 'Maintenance Manager', 'Facility Manager'],
      Facility: ['QA Manager', 'Facility Manager', 'Compliance Officer'],
      Software: ['QA Manager', 'IT Manager', 'Facility Manager'],
      Supplier: ['QA Manager', 'Purchasing Manager'],
      Document: ['QA Manager', 'Department Head']
    };
    
    return approvals[changeType] || ['QA Manager'];
  }

  private calculateOverallScore(scorecard: any): number {
    const weights = {
      qualityScore: 0.4,
      deliveryScore: 0.3,
      priceScore: 0.15,
      serviceScore: 0.15
    };
    
    return (
      scorecard.qualityScore * weights.qualityScore +
      scorecard.deliveryScore * weights.deliveryScore +
      scorecard.priceScore * weights.priceScore +
      scorecard.serviceScore * weights.serviceScore
    );
  }

  private notifyManagement(capa: CAPA): void {
    // Implementation for notifications
  }

  private notifySupplierIssue(supplier: Supplier): void {
    // Implementation for supplier notifications
  }

  private archiveDocument(doc: QualityDocument): void {
    // Implementation for document archival
  }
}