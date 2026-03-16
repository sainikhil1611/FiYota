export interface UserFinancialProfile {
  monthlyIncome: number;
  creditScore: number;
  maxDownPayment: number;
  preferredMonthlyPayment: number;
  hasTradeIn: boolean;
  tradeInValue: number;
  // Financing preferences (applied to all vehicles)
  financingType: 'lease' | 'finance';
  loanTerm: number; // in months
  interestRate: number; // annual percentage
}

export type CreditScoreRange = 'excellent' | 'good' | 'fair' | 'poor';

export interface AffordabilityAnalysis {
  canAfford: boolean;
  budgetImpact: number; // percentage of monthly income
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}
