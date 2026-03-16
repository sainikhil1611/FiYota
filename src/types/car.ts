export interface Car {
  id: string;
  name: string;
  model: string;
  year: number;
  basePrice: number;
  image: string;
  category: string;
  priceSource?: string;
}

export interface FinancingOption {
  type: 'lease' | 'finance';
  term: number; // months
  downPayment: number;
  interestRate: number;
  monthlyPayment?: number;
  totalCost?: number;
}

export interface ComparisonData {
  carId: string;
  financing: FinancingOption;
}
