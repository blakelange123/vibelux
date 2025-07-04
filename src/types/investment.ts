export interface Investment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
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