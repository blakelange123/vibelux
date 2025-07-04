/**
 * Quality Verification and Certification System
 * Verifies business licenses, certifications, and quality standards
 */

export interface BusinessVerification {
  id: string;
  userId: string;
  businessName: string;
  
  // Business Documents
  businessLicense?: {
    number: string;
    state: string;
    expiryDate: Date;
    verified: boolean;
    verifiedAt?: Date;
    documentUrl?: string;
  };
  
  // PACA License (Perishable Agricultural Commodities Act)
  pacaLicense?: {
    number: string;
    type: 'full' | 'simplified';
    expiryDate: Date;
    verified: boolean;
    verifiedAt?: Date;
    documentUrl?: string;
  };
  
  // DRC Membership (Dispute Resolution Corporation)
  drcMembership?: {
    memberId: string;
    status: 'active' | 'inactive' | 'suspended';
    joinedDate: Date;
    verified: boolean;
    verifiedAt?: Date;
  };
  
  // Financial Verification
  creditCheck?: {
    provider: 'experian' | 'equifax' | 'transunion' | 'dun-bradstreet';
    score: number;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    checkedAt: Date;
    reportUrl?: string;
  };
  
  // Insurance
  insurance?: {
    provider: string;
    policyNumber: string;
    coverageAmount: number;
    expiryDate: Date;
    verified: boolean;
    types: ('general-liability' | 'product-liability' | 'cargo' | 'errors-omissions')[];
  };
  
  // Tax Information
  taxInfo?: {
    ein?: string; // Employer Identification Number
    stateRegistration?: string;
    salesTaxPermit?: string;
    w9Submitted: boolean;
    w9SubmittedAt?: Date;
  };
  
  // Overall Verification Status
  verificationStatus: 'unverified' | 'pending' | 'partial' | 'verified' | 'premium';
  verificationScore: number; // 0-100
  lastVerificationDate?: Date;
  nextVerificationDue?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityCertification {
  id: string;
  userId: string;
  
  // Organic Certifications
  organic?: {
    certifier: string;
    certificateNumber: string;
    scope: string[];
    expiryDate: Date;
    verified: boolean;
    documentUrl?: string;
  };
  
  // GAP (Good Agricultural Practices)
  gap?: {
    level: 'basic' | 'intermediate' | 'advanced';
    auditor: string;
    certificateNumber: string;
    auditDate: Date;
    expiryDate: Date;
    score?: number;
    verified: boolean;
    documentUrl?: string;
  };
  
  // Food Safety
  foodSafety?: {
    type: 'SQF' | 'BRC' | 'FSSC22000' | 'IFS' | 'HACCP';
    level?: string;
    certificateNumber: string;
    auditor: string;
    auditDate: Date;
    expiryDate: Date;
    verified: boolean;
    documentUrl?: string;
  };
  
  // GlobalGAP
  globalGap?: {
    ggn: string; // GlobalGAP Number
    version: string;
    options: ('option1' | 'option2')[];
    products: string[];
    expiryDate: Date;
    verified: boolean;
    documentUrl?: string;
  };
  
  // Non-GMO
  nonGmo?: {
    verifier: string;
    certificateNumber: string;
    expiryDate: Date;
    verified: boolean;
    documentUrl?: string;
  };
  
  // Fair Trade
  fairTrade?: {
    certificateNumber: string;
    expiryDate: Date;
    verified: boolean;
    documentUrl?: string;
  };
  
  // Local/Regional Certifications
  localCertifications?: {
    name: string;
    issuer: string;
    number: string;
    expiryDate: Date;
    verified: boolean;
  }[];
  
  // Lab Testing Results
  labTests?: {
    id: string;
    testType: 'pesticide-residue' | 'heavy-metals' | 'microbiology' | 'nutritional';
    lab: string;
    testDate: Date;
    results: 'pass' | 'fail' | 'conditional';
    reportUrl?: string;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationDocument {
  id: string;
  userId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  
  // Verification
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  
  // Metadata
  expiryDate?: Date;
  metadata?: Record<string, any>;
  
  uploadedAt: Date;
}

export class VerificationSystem {
  /**
   * Calculate overall verification score
   */
  static calculateVerificationScore(
    businessVerification: BusinessVerification,
    qualityCertifications: QualityCertification
  ): number {
    let score = 0;
    let maxScore = 0;
    
    // Business License (15 points)
    maxScore += 15;
    if (businessVerification.businessLicense?.verified) {
      score += 15;
    }
    
    // PACA License (25 points for produce businesses)
    maxScore += 25;
    if (businessVerification.pacaLicense?.verified) {
      score += businessVerification.pacaLicense.type === 'full' ? 25 : 20;
    }
    
    // DRC Membership (15 points)
    maxScore += 15;
    if (businessVerification.drcMembership?.verified && 
        businessVerification.drcMembership.status === 'active') {
      score += 15;
    }
    
    // Credit Check (20 points)
    maxScore += 20;
    if (businessVerification.creditCheck) {
      const creditScore = businessVerification.creditCheck.score;
      if (creditScore >= 750) score += 20;
      else if (creditScore >= 700) score += 15;
      else if (creditScore >= 650) score += 10;
      else if (creditScore >= 600) score += 5;
    }
    
    // Insurance (10 points)
    maxScore += 10;
    if (businessVerification.insurance?.verified) {
      score += 10;
    }
    
    // Quality Certifications (15 points)
    maxScore += 15;
    let certPoints = 0;
    if (qualityCertifications.organic?.verified) certPoints += 5;
    if (qualityCertifications.gap?.verified) certPoints += 5;
    if (qualityCertifications.foodSafety?.verified) certPoints += 5;
    if (qualityCertifications.globalGap?.verified) certPoints += 5;
    score += Math.min(certPoints, 15);
    
    return Math.round((score / maxScore) * 100);
  }
  
  /**
   * Determine verification status based on score and requirements
   */
  static getVerificationStatus(score: number): BusinessVerification['verificationStatus'] {
    if (score >= 90) return 'premium';
    if (score >= 70) return 'verified';
    if (score >= 40) return 'partial';
    if (score > 0) return 'pending';
    return 'unverified';
  }
  
  /**
   * Check if certification is expiring soon (within 30 days)
   */
  static isExpiringSoon(expiryDate: Date): boolean {
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }
  
  /**
   * Check if certification has expired
   */
  static isExpired(expiryDate: Date): boolean {
    return expiryDate.getTime() < Date.now();
  }
  
  /**
   * Get all active certifications
   */
  static getActiveCertifications(
    qualityCertifications: QualityCertification
  ): string[] {
    const active: string[] = [];
    
    if (qualityCertifications.organic?.verified && 
        !this.isExpired(qualityCertifications.organic.expiryDate)) {
      active.push('USDA Organic');
    }
    
    if (qualityCertifications.gap?.verified && 
        !this.isExpired(qualityCertifications.gap.expiryDate)) {
      active.push(`GAP ${qualityCertifications.gap.level}`);
    }
    
    if (qualityCertifications.foodSafety?.verified && 
        !this.isExpired(qualityCertifications.foodSafety.expiryDate)) {
      active.push(qualityCertifications.foodSafety.type);
    }
    
    if (qualityCertifications.globalGap?.verified && 
        !this.isExpired(qualityCertifications.globalGap.expiryDate)) {
      active.push('GlobalGAP');
    }
    
    if (qualityCertifications.nonGmo?.verified && 
        !this.isExpired(qualityCertifications.nonGmo.expiryDate)) {
      active.push('Non-GMO Verified');
    }
    
    if (qualityCertifications.fairTrade?.verified && 
        !this.isExpired(qualityCertifications.fairTrade.expiryDate)) {
      active.push('Fair Trade');
    }
    
    return active;
  }
  
  /**
   * Get verification badges for display
   */
  static getVerificationBadges(
    businessVerification: BusinessVerification,
    qualityCertifications: QualityCertification
  ): VerificationBadge[] {
    const badges: VerificationBadge[] = [];
    
    // Business Verification Badges
    if (businessVerification.pacaLicense?.verified) {
      badges.push({
        id: 'paca',
        name: 'PACA Licensed',
        icon: '🏛️',
        level: 'gold',
        tooltip: `PACA License #${businessVerification.pacaLicense.number}`
      });
    }
    
    if (businessVerification.drcMembership?.verified) {
      badges.push({
        id: 'drc',
        name: 'DRC Member',
        icon: '🤝',
        level: 'gold',
        tooltip: 'Dispute Resolution Corporation Member'
      });
    }
    
    if (businessVerification.creditCheck && businessVerification.creditCheck.rating === 'excellent') {
      badges.push({
        id: 'credit',
        name: 'Excellent Credit',
        icon: '💳',
        level: 'silver',
        tooltip: 'Verified excellent credit rating'
      });
    }
    
    // Quality Certification Badges
    const activeCerts = this.getActiveCertifications(qualityCertifications);
    activeCerts.forEach(cert => {
      badges.push({
        id: cert.toLowerCase().replace(/\s+/g, '-'),
        name: cert,
        icon: '✓',
        level: 'green',
        tooltip: `Certified ${cert}`
      });
    });
    
    return badges;
  }
  
  /**
   * Validate uploaded document
   */
  static async validateDocument(
    file: File,
    documentType: string
  ): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = [];
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size must be less than 10MB');
    }
    
    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('File must be PDF, JPEG, or PNG');
    }
    
    // Document-specific validation
    if (documentType === 'paca-license' && !file.name.toLowerCase().includes('paca')) {
      errors.push('File name should contain "PACA" for clarity');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  /**
   * Generate verification report
   */
  static generateVerificationReport(
    businessVerification: BusinessVerification,
    qualityCertifications: QualityCertification
  ): VerificationReport {
    const score = this.calculateVerificationScore(businessVerification, qualityCertifications);
    const status = this.getVerificationStatus(score);
    const badges = this.getVerificationBadges(businessVerification, qualityCertifications);
    
    const missingDocuments: string[] = [];
    const expiringDocuments: string[] = [];
    
    // Check for missing documents
    if (!businessVerification.businessLicense?.verified) {
      missingDocuments.push('Business License');
    }
    if (!businessVerification.pacaLicense?.verified) {
      missingDocuments.push('PACA License');
    }
    if (!businessVerification.insurance?.verified) {
      missingDocuments.push('Insurance Certificate');
    }
    
    // Check for expiring documents
    if (businessVerification.businessLicense?.expiryDate && 
        this.isExpiringSoon(businessVerification.businessLicense.expiryDate)) {
      expiringDocuments.push('Business License');
    }
    if (businessVerification.pacaLicense?.expiryDate && 
        this.isExpiringSoon(businessVerification.pacaLicense.expiryDate)) {
      expiringDocuments.push('PACA License');
    }
    
    return {
      score,
      status,
      badges,
      missingDocuments,
      expiringDocuments,
      recommendations: this.generateRecommendations(score, missingDocuments),
      generatedAt: new Date()
    };
  }
  
  private static generateRecommendations(score: number, missing: string[]): string[] {
    const recommendations: string[] = [];
    
    if (score < 70) {
      recommendations.push('Complete business verification to unlock premium features');
    }
    
    if (missing.includes('PACA License')) {
      recommendations.push('Obtain PACA license to trade with major buyers');
    }
    
    if (missing.includes('Insurance Certificate')) {
      recommendations.push('Add insurance coverage to increase buyer confidence');
    }
    
    if (score >= 70 && score < 90) {
      recommendations.push('Add quality certifications to achieve premium status');
    }
    
    return recommendations;
  }
}

// Type definitions
export interface VerificationBadge {
  id: string;
  name: string;
  icon: string;
  level: 'gold' | 'silver' | 'green';
  tooltip: string;
}

export interface VerificationReport {
  score: number;
  status: BusinessVerification['verificationStatus'];
  badges: VerificationBadge[];
  missingDocuments: string[];
  expiringDocuments: string[];
  recommendations: string[];
  generatedAt: Date;
}