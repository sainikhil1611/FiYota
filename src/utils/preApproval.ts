import { UserFinancialProfile } from "@/types/userProfile";
import { Car } from "@/types/car";

export interface PreApprovalResult {
  status: "Very Likely" | "Likely" | "Possible" | "Unlikely";
  approvalPercentage: number; // 0-100
  factors: {
    creditScore: {
      percentage: number; // 0-100
      status: "excellent" | "good" | "fair" | "poor";
      message: string;
    };
    incomeRatio: {
      percentage: number; // 0-100
      ratio: number;
      status: "excellent" | "good" | "concern" | "issue";
      message: string;
    };
    downPayment: {
      percentage: number; // 0-100
      percentDown: number;
      status: "excellent" | "good" | "minimal" | "low";
      message: string;
    };
    tradeIn: {
      percentage: number; // 0-100
      status: "helpful" | "none";
      message: string;
    };
  };
  recommendations: string[];
  estimatedCarPrice: number;
}

export function predictLoanApproval(
  userProfile: UserFinancialProfile,
  selectedCar?: Car
): PreApprovalResult {
  const {
    monthlyIncome,
    creditScore,
    maxDownPayment,
    preferredMonthlyPayment,
    hasTradeIn,
    tradeInValue,
  } = userProfile;

  // Basic approval thresholds
  const minCreditScore = 610;
  const minIncomePerPaymentRatio = 2.5;
  const minDownPaymentPercent = 0.1;
  const targetTradeInValueOkay = 1000;

  const recommendations: string[] = [];

  // Estimate car price based on selected car or target payment
  let estimatedCarPrice = selectedCar
    ? selectedCar.basePrice
    : preferredMonthlyPayment * 60; // Rough estimate: 60 months

  // === CREDIT SCORE EVALUATION (40% weight) ===
  let creditScorePercentage = 0;
  let creditStatus: "excellent" | "good" | "fair" | "poor";
  let creditMessage = "";

  if (creditScore < minCreditScore) {
    creditScorePercentage = 0;
    creditStatus = "poor";
    creditMessage = `Credit score of ${creditScore} is below the typical minimum (${minCreditScore}). Focus on improving credit before applying.`;
    recommendations.push(
      "Improve your credit score to at least 610 by paying bills on time and reducing debt"
    );
  } else if (creditScore >= 720) {
    creditScorePercentage = 100;
    creditStatus = "excellent";
    creditMessage = `Excellent credit score of ${creditScore}! You qualify for the best interest rates.`;
  } else if (creditScore >= 660) {
    creditScorePercentage = 75;
    creditStatus = "good";
    creditMessage = `Good credit score of ${creditScore}. You should qualify for competitive rates.`;
    recommendations.push(
      "Consider improving credit to 720+ for the best interest rates"
    );
  } else {
    // 610-659: proportional score
    creditScorePercentage = 50;
    creditStatus = "fair";
    creditMessage = `Fair credit score of ${creditScore}. You may qualify but with higher interest rates.`;
    recommendations.push(
      "Work on improving your credit score to get better loan terms"
    );
  }

  // === INCOME TO PAYMENT RATIO (30% weight) ===
  let incomeRatioPercentage = 0;
  const actualRatio = monthlyIncome / preferredMonthlyPayment;
  let incomeStatus: "excellent" | "good" | "concern" | "issue";
  let incomeMessage = "";

  if (monthlyIncome < preferredMonthlyPayment * minIncomePerPaymentRatio) {
    incomeRatioPercentage = 0;
    incomeStatus = "issue";
    incomeMessage = `Monthly income of $${monthlyIncome.toLocaleString()} is too low for a $${preferredMonthlyPayment.toLocaleString()} payment. Lenders prefer income to be at least 2.5x the payment.`;
    recommendations.push(
      `Reduce target monthly payment to $${Math.floor(monthlyIncome / minIncomePerPaymentRatio).toLocaleString()} or increase income`
    );
  } else if (actualRatio >= 5) {
    incomeRatioPercentage = 100;
    incomeStatus = "excellent";
    incomeMessage = `Your income is ${actualRatio.toFixed(1)}x your target payment - excellent ratio!`;
  } else if (actualRatio >= 3.5) {
    incomeRatioPercentage = 75;
    incomeStatus = "good";
    incomeMessage = `Your income is ${actualRatio.toFixed(1)}x your target payment - good ratio.`;
  } else {
    // 2.5-3.5x: proportional
    incomeRatioPercentage = 50;
    incomeStatus = "concern";
    incomeMessage = `Your income is ${actualRatio.toFixed(1)}x your target payment - meets minimum but tight.`;
    recommendations.push("Consider a lower monthly payment for better approval odds");
  }

  // === DOWN PAYMENT EVALUATION (20% weight) ===
  let downPaymentPercentage = 0;
  const totalDownPayment = maxDownPayment + (hasTradeIn ? tradeInValue : 0);
  const percentDown = (totalDownPayment / estimatedCarPrice) * 100;
  let downPaymentStatus: "excellent" | "good" | "minimal" | "low";
  let downPaymentMessage = "";

  if (percentDown >= 20) {
    downPaymentPercentage = 100;
    downPaymentStatus = "excellent";
    downPaymentMessage = `Excellent down payment of ${percentDown.toFixed(1)}% ($${totalDownPayment.toLocaleString()})! This significantly increases approval chances.`;
  } else if (percentDown >= 15) {
    downPaymentPercentage = 83;
    downPaymentStatus = "good";
    downPaymentMessage = `Good down payment of ${percentDown.toFixed(1)}% ($${totalDownPayment.toLocaleString()}).`;
  } else if (percentDown >= minDownPaymentPercent * 100) {
    downPaymentPercentage = 67;
    downPaymentStatus = "minimal";
    downPaymentMessage = `Down payment of ${percentDown.toFixed(1)}% ($${totalDownPayment.toLocaleString()}) meets minimum requirements.`;
    recommendations.push("Consider increasing down payment to 15-20% for better terms");
  } else {
    downPaymentPercentage = 33;
    downPaymentStatus = "low";
    downPaymentMessage = `Down payment of ${percentDown.toFixed(1)}% ($${totalDownPayment.toLocaleString()}) is below the recommended 10% minimum.`;
    recommendations.push(
      `Increase down payment to at least $${Math.ceil(estimatedCarPrice * 0.1).toLocaleString()} (10% of vehicle price)`
    );
  }

  // === TRADE-IN EVALUATION (10% weight) ===
  let tradeInPercentage = 0;
  let tradeInStatus: "helpful" | "none";
  let tradeInMessage = "";

  if (hasTradeIn && tradeInValue >= targetTradeInValueOkay) {
    tradeInPercentage = 100;
    tradeInStatus = "helpful";
    tradeInMessage = `Trade-in value of $${tradeInValue.toLocaleString()} helps reduce the amount financed.`;
  } else if (hasTradeIn && tradeInValue < targetTradeInValueOkay) {
    tradeInPercentage = 50;
    tradeInStatus = "helpful";
    tradeInMessage = `Trade-in value of $${tradeInValue.toLocaleString()} provides minimal help.`;
  } else {
    tradeInPercentage = 0;
    tradeInStatus = "none";
    tradeInMessage = "No trade-in vehicle. Consider trading in a current vehicle to reduce financed amount.";
  }

  // === CALCULATE OVERALL APPROVAL PERCENTAGE ===
  // Weighted average: Credit 40%, Income 30%, Down Payment 20%, Trade-In 10%
  const overallPercentage = Math.round(
    creditScorePercentage * 0.4 +
    incomeRatioPercentage * 0.3 +
    downPaymentPercentage * 0.2 +
    tradeInPercentage * 0.1
  );

  // === FINAL STATUS DETERMINATION ===
  let status: "Very Likely" | "Likely" | "Possible" | "Unlikely";

  if (overallPercentage >= 85) {
    status = "Very Likely";
  } else if (overallPercentage >= 70) {
    status = "Likely";
  } else if (overallPercentage >= 50) {
    status = "Possible";
  } else {
    status = "Unlikely";
  }

  // Log to terminal
  console.log("\n" + "=".repeat(80));
  console.log("🏦 PRE-APPROVAL CHECK");
  console.log("=".repeat(80));
  console.log(`Status: ${status}`);
  console.log(`Approval Percentage: ${overallPercentage}%`);
  console.log(`Vehicle: ${selectedCar ? `${selectedCar.year} ${selectedCar.name} ${selectedCar.model}` : "Generic"}`);
  console.log(`Estimated Price: $${estimatedCarPrice.toLocaleString()}`);
  console.log("\nFactor Breakdown:");
  console.log(`  Credit Score: ${creditScorePercentage}% - ${creditStatus}`);
  console.log(`  Income Ratio: ${incomeRatioPercentage}% - ${incomeStatus}`);
  console.log(`  Down Payment: ${downPaymentPercentage}% - ${downPaymentStatus}`);
  console.log(`  Trade-In: ${tradeInPercentage}% - ${tradeInStatus}`);
  if (recommendations.length > 0) {
    console.log("\nRecommendations:");
    recommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
  }
  console.log("=".repeat(80) + "\n");

  return {
    status,
    approvalPercentage: overallPercentage,
    factors: {
      creditScore: {
        percentage: creditScorePercentage,
        status: creditStatus,
        message: creditMessage,
      },
      incomeRatio: {
        percentage: incomeRatioPercentage,
        ratio: actualRatio,
        status: incomeStatus,
        message: incomeMessage,
      },
      downPayment: {
        percentage: downPaymentPercentage,
        percentDown,
        status: downPaymentStatus,
        message: downPaymentMessage,
      },
      tradeIn: {
        percentage: tradeInPercentage,
        status: tradeInStatus,
        message: tradeInMessage,
      },
    },
    recommendations,
    estimatedCarPrice,
  };
}
