/**
 * Investment Platform Types for GaaS (Growing as a Service) and YEP (Yield Enhancement Program)
 */

export enum InvestmentType {
  GAAS = 'gaas',
  YEP = 'yep',
  HYBRID = 'hybrid'
}

export enum DealStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  TERMINATED = 'terminated'
}

export enum PaymentFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually'
}

export enum InvestorType {
  INDIVIDUAL = 'individual',
  INSTITUTIONAL = 'institutional',
  FAMILY_OFFICE = 'family_office'
}

export enum RiskTolerance {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive'
}

export interface Investor {
  company?: string;
  phone?: string;
  
  // Financial details
  
  // Risk preferences
  
  // Status
  
  // Metrics
  portfolioMetrics?: PortfolioMetrics;
}

export interface Facility {
  
  // Physical details
  
  // Current performance
  
  // Equipment
  
  // Financial
  
  // Risk factors
  
}

export interface Investment {
  
  // Deal details
  
  // Financial terms
  
  // Contract terms
  
  // Performance targets
  
  // Risk assessment
  
  
  // Related data
  investor?: Investor;
  facility?: Facility;
  performanceRecords?: PerformanceRecord[];
  payments?: Payment[];
}

export interface YieldBaseline {
  
  // Baseline period
  
  // Yield metrics
  
  // Quality metrics
  avgThcPercentage?: number;
  
  // Environmental baselines
  
  // Energy baselines
  
  // Statistical confidence
  
}

export interface PerformanceRecord {
  
  // Period
  
  // Yield performance
  
  // Quality metrics
  thcPercentage?: number;
  
  // Environmental data
  
  // Energy performance
  
  // Financial impact
  
}

export interface Payment {
  
  // Payment details
  
  // Period
  
  // Status
  paymentDate?: Date;
  transactionId?: string;
  
  // YEP specific
  baselineYield?: number;
  actualYield?: number;
  improvementPercentage?: number;
  
}

export interface PortfolioMetrics {
  
  // Portfolio summary
  
  // Performance metrics
  
  // Risk metrics
  
  // By investment type
  
  // Historical performance
  bestPerformingFacility?: string;
  worstPerformingFacility?: string;
  
}

export interface InvestmentProposal {
  
  // Proposal details
  
  // Projections
  
  // Analysis
  
  // Status
  submittedDate?: Date;
  reviewedDate?: Date;
  reviewerNotes?: string;
  
}

// Dashboard specific types
export interface InvestorDashboardData {
}

export interface FacilityDashboardData {
}