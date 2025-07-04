// Rebate Program Verification Status
// This file tracks which rebate programs have been verified with actual utility documentation

export interface VerificationStatus {
  utilityId: string
  verificationLevel: 'verified' | 'partial' | 'unverified' | 'estimated'
  lastVerified?: Date
  sources?: string[]
  notes?: string
}

export const rebateVerificationStatus: VerificationStatus[] = [
  // VERIFIED PROGRAMS (confirmed with utility websites or documentation)
  {
    utilityId: 'consumers-energy-ag-2025',
    verificationLevel: 'partial',
    lastVerified: new Date('2024-12-15'),
    sources: ['Seinergy.com', 'CABA Tech testimonials'],
    notes: 'Rebate structure confirmed, but exact rates may vary. 20-60% coverage mentioned by contractors.'
  },
  {
    utilityId: 'sce-agee-2025',
    verificationLevel: 'partial',
    lastVerified: new Date('2024-12-15'),
    sources: ['Hort Americas blog', 'California rebate announcements'],
    notes: 'AgEE rates table appears accurate. Cannabis explicitly eligible. Must enroll before purchase.'
  },
  {
    utilityId: 'pge-ag-2025',
    verificationLevel: 'verified',
    lastVerified: new Date('2024-12-15'),
    sources: ['PG&E website'],
    notes: 'Agricultural program confirmed. Rates and requirements verified.'
  },
  
  // PARTIALLY VERIFIED (general program exists but cannabis/hort specifics unclear)
  {
    utilityId: 'eversource-ct-ag-2025',
    verificationLevel: 'partial',
    lastVerified: new Date('2024-12-15'),
    sources: ['EnergizeCT website'],
    notes: 'Commercial/agricultural lighting program exists. Cannabis eligibility not explicitly stated.'
  },
  {
    utilityId: 'bge-md-empower-2025',
    verificationLevel: 'partial',
    lastVerified: new Date('2024-12-15'),
    sources: ['BGE Smart Energy website', 'EmPOWER Maryland info'],
    notes: '50-80% coverage confirmed for businesses. Cannabis cultivation eligibility needs verification.'
  },
  {
    utilityId: 'xcel-co-cannabis-2025',
    verificationLevel: 'estimated',
    lastVerified: new Date('2024-12-15'),
    sources: ['General utility information'],
    notes: 'Cannabis-specific program details need verification. Rates shown are estimates based on commercial programs.'
  },
  
  // UNVERIFIED/ESTIMATED (based on general commercial programs)
  {
    utilityId: 'pnm-nm-cannabis-2025',
    verificationLevel: 'estimated',
    notes: 'Based on general commercial rates. Cannabis cultivation eligibility needs confirmation.'
  },
  {
    utilityId: 'northwestern-mt-cannabis-2025',
    verificationLevel: 'estimated',
    notes: 'E+ Business program exists. Cannabis-specific rates are estimates.'
  },
  {
    utilityId: 'chugach-ak-cannabis-2025',
    verificationLevel: 'estimated',
    notes: 'High electricity costs make LED attractive. Specific cannabis rebates need verification.'
  },
  {
    utilityId: 'national-grid-ri-cannabis-2025',
    verificationLevel: 'estimated',
    notes: 'Based on commercial lighting programs. Cannabis cultivation specifics need verification.'
  },
  {
    utilityId: 'dominion-va-medical-cannabis-2025',
    verificationLevel: 'estimated',
    notes: 'Medical cannabis is legal in VA. Specific rebate programs need verification.'
  },
  {
    utilityId: 'pseg-nj-cannabis-2025',
    verificationLevel: 'unverified',
    lastVerified: new Date('2024-12-15'),
    sources: ['General commercial program info'],
    notes: 'Cannabis-specific program not confirmed. May qualify under general commercial energy efficiency programs.'
  },
  {
    utilityId: 'eversource-ma-hort-2025',
    verificationLevel: 'estimated',
    notes: 'MA has cannabis cultivation. Specific horticulture rebates need verification.'
  },
  {
    utilityId: 'oge-ok-ag-2025',
    verificationLevel: 'unverified',
    lastVerified: new Date('2024-12-15'),
    sources: ['General business program info'],
    notes: 'Agricultural lighting rebates need verification. Cannabis eligibility not confirmed.'
  },
  {
    utilityId: 'pse-wa-horticulture-2025',
    verificationLevel: 'verified',
    lastVerified: new Date('2025-01-18'),
    sources: ['PSE Commercial Horticulture Lighting page', 'Web search confirmation'],
    notes: 'Cannabis (I-502 licensed) explicitly eligible. Up to 100% of incremental cost covered. Pre-approval required.'
  },
  {
    utilityId: 'dte-energy-ag-2025',
    verificationLevel: 'partial',
    lastVerified: new Date('2025-01-18'),
    sources: ['DTE Energy business website'],
    notes: 'General business energy efficiency programs exist. Cannabis-specific rates not confirmed.'
  },
  {
    utilityId: 'efficiency-vt-horticulture-2025',
    verificationLevel: 'partial',
    lastVerified: new Date('2025-01-18'),
    sources: ['Efficiency Vermont website search'],
    notes: 'Separate horticultural program exists from agricultural lighting. Commercial LED rebates phasing out 2025.'
  }
]

// Helper function to get verification status
export function getVerificationStatus(utilityId: string): VerificationStatus | undefined {
  return rebateVerificationStatus.find(status => status.utilityId === utilityId)
}

// Helper function to get only verified programs
export function getVerifiedPrograms(): string[] {
  return rebateVerificationStatus
    .filter(status => status.verificationLevel === 'verified' || status.verificationLevel === 'partial')
    .map(status => status.utilityId)
}