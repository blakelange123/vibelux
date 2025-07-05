export enum InvestmentType {
  GAAS = 'GAAS',
  YEP = 'YEP',
  HYBRID = 'HYBRID'
}

export interface Investment {
  id: string;
  userId: string;
  facilityId: string;
  investmentType: InvestmentType;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  contractStartDate: Date;
  monthlyServiceFee: number;
  targetYieldImprovement: number;
  yieldSharePercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  id: string;
  investmentId: string;
  amount: number;
  currency: string;
  date: Date;
  status: 'pending' | 'paid' | 'overdue';
  paymentType: 'service_fee' | 'yield_share';
}

export interface InvestmentRound {
  id: string;
  name: string;
  targetAmount: number;
  raisedAmount: number;
  startDate: Date;
  endDate: Date;
  minimumInvestment: number;
  status: 'open' | 'closed' | 'upcoming';
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  totalInvested: number;
  investments: Investment[];
  tier: 'seed' | 'angel' | 'series-a' | 'series-b';
}

// Additional types for investment data generator
export enum InvestorType {
  ANGEL = 'ANGEL',
  VENTURE_CAPITAL = 'VENTURE_CAPITAL',
  FAMILY_OFFICE = 'FAMILY_OFFICE',
  STRATEGIC = 'STRATEGIC',
  RETAIL = 'RETAIL'
}

export enum RiskTolerance {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH'
}

export enum DealStatus {
  PROSPECTING = 'PROSPECTING',
  DUE_DILIGENCE = 'DUE_DILIGENCE',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED'
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY'
}