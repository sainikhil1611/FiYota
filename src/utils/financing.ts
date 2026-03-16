import { FinancingOption } from "@/types/car";

export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  termMonths: number
): number => {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / termMonths;
  
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.round(payment * 100) / 100;
};

export const calculateTotalCost = (
  monthlyPayment: number,
  termMonths: number,
  downPayment: number
): number => {
  return Math.round((monthlyPayment * termMonths + downPayment) * 100) / 100;
};

export const calculateFinancing = (
  basePrice: number,
  option: FinancingOption
): FinancingOption => {
  const principal = basePrice - option.downPayment;
  const monthlyPayment = calculateMonthlyPayment(principal, option.interestRate, option.term);
  const totalCost = calculateTotalCost(monthlyPayment, option.term, option.downPayment);

  return {
    ...option,
    monthlyPayment,
    totalCost
  };
};

export const getDefaultFinancingOptions = (): {
  lease: FinancingOption;
  finance: FinancingOption;
} => ({
  lease: {
    type: 'lease',
    term: 36,
    downPayment: 3000,
    interestRate: 3.9
  },
  finance: {
    type: 'finance',
    term: 60,
    downPayment: 5000,
    interestRate: 5.5
  }
});

// Calculate equity built over time for financing (excludes lease which has $0 equity)
export const calculateEquityOverTime = (
  basePrice: number,
  downPayment: number,
  monthlyPayment: number,
  interestRate: number,
  termMonths: number
): Array<{ month: number; equity: number; remaining: number }> => {
  const monthlyRate = interestRate / 12 / 100;
  let remainingPrincipal = basePrice - downPayment;
  const equityTimeline: Array<{ month: number; equity: number; remaining: number }> = [];

  // Start with down payment equity
  equityTimeline.push({
    month: 0,
    equity: downPayment,
    remaining: remainingPrincipal
  });

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = remainingPrincipal * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingPrincipal -= principalPayment;

    const currentEquity = basePrice - Math.max(0, remainingPrincipal);

    equityTimeline.push({
      month,
      equity: Math.round(currentEquity * 100) / 100,
      remaining: Math.max(0, Math.round(remainingPrincipal * 100) / 100)
    });
  }

  return equityTimeline;
};

// Calculate depreciation curve for a vehicle
export const calculateDepreciationCurve = (
  basePrice: number,
  years: number = 5
): Array<{ year: number; value: number; depreciationPercent: number }> => {
  const depreciationCurve: Array<{ year: number; value: number; depreciationPercent: number }> = [];

  // Industry-standard depreciation rates
  // Year 1: 20%, Year 2: 15%, Year 3: 10%, Years 4-5: 8% per year
  const depreciationRates = [0, 0.20, 0.15, 0.10, 0.08, 0.08];

  let currentValue = basePrice;
  depreciationCurve.push({
    year: 0,
    value: Math.round(currentValue),
    depreciationPercent: 0
  });

  for (let year = 1; year <= years; year++) {
    const rate = depreciationRates[year] || 0.08;
    currentValue = currentValue * (1 - rate);
    const depreciationPercent = ((basePrice - currentValue) / basePrice) * 100;

    depreciationCurve.push({
      year,
      value: Math.round(currentValue),
      depreciationPercent: Math.round(depreciationPercent * 10) / 10
    });
  }

  return depreciationCurve;
};

// Calculate affordability impact as percentage of monthly income
export const calculateAffordabilityImpact = (
  monthlyPayment: number,
  monthlyIncome: number
): {
  percentage: number;
  status: 'excellent' | 'good' | 'caution' | 'overextended';
  message: string;
} => {
  const percentage = (monthlyPayment / monthlyIncome) * 100;

  let status: 'excellent' | 'good' | 'caution' | 'overextended';
  let message: string;

  if (percentage < 10) {
    status = 'excellent';
    message = 'Well within budget - excellent financial position';
  } else if (percentage < 15) {
    status = 'good';
    message = 'Comfortable payment - good financial balance';
  } else if (percentage < 20) {
    status = 'caution';
    message = 'Stretching budget - consider lower payment';
  } else {
    status = 'overextended';
    message = 'Over budget - payment too high for income';
  }

  return {
    percentage: Math.round(percentage * 10) / 10,
    status,
    message
  };
};

// Calculate how interest rate changes with credit score
export const getInterestRateByCredit = (
  baseRate: number,
  creditScore: number
): number => {
  if (creditScore >= 750) {
    return baseRate - 1.0; // Excellent: -1%
  } else if (creditScore >= 700) {
    return baseRate - 0.5; // Good: -0.5%
  } else if (creditScore >= 650) {
    return baseRate; // Fair: base rate
  } else if (creditScore >= 600) {
    return baseRate + 1.5; // Poor: +1.5%
  } else {
    return baseRate + 3.0; // Very Poor: +3%
  }
};

// Calculate credit score impact scenarios
export const calculateCreditScoreImpact = (
  basePrice: number,
  downPayment: number,
  baseRate: number,
  termMonths: number
): Array<{
  creditScore: number;
  interestRate: number;
  monthlyPayment: number;
  totalInterest: number;
}> => {
  const creditScores = [600, 650, 700, 750, 800];
  const principal = basePrice - downPayment;

  return creditScores.map(score => {
    const rate = getInterestRateByCredit(baseRate, score);
    const monthly = calculateMonthlyPayment(principal, rate, termMonths);
    const totalPaid = monthly * termMonths;
    const totalInterest = totalPaid - principal;

    return {
      creditScore: score,
      interestRate: Math.round(rate * 10) / 10,
      monthlyPayment: Math.round(monthly * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100
    };
  });
};

// Calculate down payment sensitivity
export const calculateDownPaymentSensitivity = (
  basePrice: number,
  interestRate: number,
  termMonths: number,
  minDownPayment: number = 0,
  maxDownPayment?: number
): Array<{
  downPayment: number;
  monthlyPayment: number;
  totalInterest: number;
  monthlyReduction: number;
}> => {
  const maxDown = maxDownPayment || basePrice * 0.5;
  const step = (maxDown - minDownPayment) / 5;
  const results: Array<{
    downPayment: number;
    monthlyPayment: number;
    totalInterest: number;
    monthlyReduction: number;
  }> = [];

  let previousMonthly = 0;

  for (let down = minDownPayment; down <= maxDown; down += step) {
    const principal = basePrice - down;
    const monthly = calculateMonthlyPayment(principal, interestRate, termMonths);
    const totalPaid = monthly * termMonths;
    const totalInterest = totalPaid - principal;
    const reduction = previousMonthly > 0 ? previousMonthly - monthly : 0;

    results.push({
      downPayment: Math.round(down),
      monthlyPayment: Math.round(monthly * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      monthlyReduction: Math.round(reduction * 100) / 100
    });

    previousMonthly = monthly;
  }

  return results;
};
