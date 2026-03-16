import { UserFinancialProfile, CreditScoreRange, AffordabilityAnalysis } from "@/types/userProfile";
import { FinancingOption } from "@/types/car";

export const getCreditScoreRange = (score: number): CreditScoreRange => {
  if (score >= 750) return 'excellent';
  if (score >= 700) return 'good';
  if (score >= 650) return 'fair';
  return 'poor';
};

export const getInterestRateForCreditScore = (
  score: number,
  baseRate: number
): number => {
  const range = getCreditScoreRange(score);
  
  switch (range) {
    case 'excellent':
      return baseRate;
    case 'good':
      return baseRate + 1.0;
    case 'fair':
      return baseRate + 2.5;
    case 'poor':
      return baseRate + 4.5;
    default:
      return baseRate;
  }
};

export const analyzeAffordability = (
  monthlyPayment: number,
  profile: UserFinancialProfile
): AffordabilityAnalysis => {
  const budgetImpact = (monthlyPayment / profile.monthlyIncome) * 100;
  
  // Financial rule of thumb: car payment shouldn't exceed 15-20% of monthly income
  if (budgetImpact <= 15) {
    return {
      canAfford: true,
      budgetImpact,
      recommendation: "This fits comfortably within your budget! You'll have plenty of room for other expenses.",
      riskLevel: 'low'
    };
  } else if (budgetImpact <= 20) {
    return {
      canAfford: true,
      budgetImpact,
      recommendation: "This is within recommended limits, but consider keeping a financial cushion for unexpected expenses.",
      riskLevel: 'medium'
    };
  } else if (budgetImpact <= 25) {
    return {
      canAfford: false,
      budgetImpact,
      recommendation: "This payment is higher than recommended. Consider a longer term, larger down payment, or a more affordable vehicle.",
      riskLevel: 'high'
    };
  } else {
    return {
      canAfford: false,
      budgetImpact,
      recommendation: "This payment may strain your budget significantly. We strongly recommend exploring more affordable options.",
      riskLevel: 'high'
    };
  }
};

export const getFinancialTips = (profile: UserFinancialProfile): string[] => {
  const tips: string[] = [];
  const creditRange = getCreditScoreRange(profile.creditScore);
  
  // Credit score tips
  if (creditRange === 'poor' || creditRange === 'fair') {
    tips.push("💡 Improving your credit score by 50-100 points could save you thousands in interest over the life of your loan.");
  }
  
  // Down payment tips
  if (profile.maxDownPayment < 3000) {
    tips.push("💰 A larger down payment reduces your monthly payments and the total interest you'll pay. Aim for at least 10-20% down.");
  } else if (profile.maxDownPayment >= 5000) {
    tips.push("✨ Great down payment capacity! This will significantly reduce your interest costs and monthly payments.");
  }
  
  // Monthly budget tips
  const recommendedMax = profile.monthlyIncome * 0.15;
  if (profile.preferredMonthlyPayment > recommendedMax) {
    tips.push("⚠️ Your target payment exceeds 15% of your monthly income. Consider adjusting to avoid financial stress.");
  }
  
  // Trade-in tips
  if (profile.hasTradeIn && profile.tradeInValue > 0) {
    tips.push("🚗 Using your trade-in as a down payment can reduce your financing needs and improve loan terms.");
  }
  
  // General tips
  tips.push("📊 Leasing typically offers lower monthly payments but you won't own the vehicle. Financing costs more monthly but builds equity.");
  tips.push("🎯 Consider total cost of ownership including insurance, maintenance, and fuel when budgeting for your vehicle.");
  
  return tips;
};

export const recommendVehicles = (
  cars: any[],
  profile: UserFinancialProfile,
  option: FinancingOption
): string[] => {
  const adjustedRate = getInterestRateForCreditScore(profile.creditScore, option.interestRate);
  const affordableCarIds: string[] = [];

  cars.forEach(car => {
    const principal = car.basePrice - Math.min(profile.maxDownPayment, car.basePrice * 0.2);
    const monthlyRate = adjustedRate / 12 / 100;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, option.term)) /
      (Math.pow(1 + monthlyRate, option.term) - 1);

    const analysis = analyzeAffordability(monthlyPayment, profile);

    // Consider medium risk as affordable enough for recommendation list
    if (analysis.canAfford) {
      affordableCarIds.push(car.id);
    }
  });

  // Fallback: if nothing qualified, return the 3 cheapest cars
  if (affordableCarIds.length === 0) {
    return [...cars]
      .sort((a, b) => a.basePrice - b.basePrice)
      .slice(0, 3)
      .map(c => c.id);
  }

  return affordableCarIds;
};

interface CarScore {
  id: string;
  score: number;
  monthlyPayment: number;
  budgetImpact: number;
}

export const getTop3RecommendedVehicles = (
  cars: any[],
  profile: UserFinancialProfile,
  option: FinancingOption
): string[] => {
  const adjustedRate = getInterestRateForCreditScore(profile.creditScore, option.interestRate);
  const carScores: CarScore[] = [];

  cars.forEach(car => {
    const totalDownPayment = profile.maxDownPayment + (profile.hasTradeIn ? profile.tradeInValue : 0);
    const adjustedDownPayment = Math.min(totalDownPayment, car.basePrice * 0.3);
    const principal = car.basePrice - adjustedDownPayment;
    const monthlyRate = adjustedRate / 12 / 100;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, option.term)) /
      (Math.pow(1 + monthlyRate, option.term) - 1);

    const analysis = analyzeAffordability(monthlyPayment, profile);

    // Prefer affordable cars, but allow a broader set if nothing qualifies
    if (analysis.canAfford || carScores.length === 0) {
      // Scoring system:
      // - Lower budget impact is better (max 50 points)
      // - Closer to preferred payment is better (max 30 points)
      // - Low risk gets bonus points (max 20 points)

      const budgetImpactScore = Math.max(0, 50 - (analysis.budgetImpact * 2.5));

      const safePref = Math.max(1, profile.preferredMonthlyPayment || 0);
      const paymentDifference = Math.abs(monthlyPayment - safePref);
      const paymentScore = Math.max(0, 30 - (paymentDifference / safePref * 30));

      const riskScore = analysis.riskLevel === 'low' ? 20 : 10;

      const totalScore = budgetImpactScore + paymentScore + riskScore;

      carScores.push({
        id: car.id,
        score: totalScore,
        monthlyPayment,
        budgetImpact: analysis.budgetImpact
      });
    }
  });

  // Sort by score (highest first) and return top 3
  const top = carScores.sort((a, b) => b.score - a.score).slice(0, 3).map(cs => cs.id);
  if (top.length > 0) return top;

  // Final fallback: 3 cheapest
  return [...cars]
    .sort((a, b) => a.basePrice - b.basePrice)
    .slice(0, 3)
    .map(c => c.id);
};
