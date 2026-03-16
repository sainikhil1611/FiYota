import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Car, FinancingOption } from "@/types/car";
import { UserFinancialProfile } from "@/types/userProfile";
import { calculateCreditScoreImpact, getDefaultFinancingOptions } from "@/utils/financing";
import { TrendingDown, Award } from "lucide-react";

interface CreditScoreImpactChartProps {
  cars: Car[];
  carFinancingOptions: Map<string, { lease: FinancingOption; finance: FinancingOption }>;
  userProfile: UserFinancialProfile;
}

export const CreditScoreImpactChart = ({
  cars,
  carFinancingOptions,
  userProfile
}: CreditScoreImpactChartProps) => {
  if (cars.length === 0) return null;

  // Calculate credit impact for all cars
  const creditScores = [600, 650, 700, 750, 800];

  // Build chart data with all cars
  const chartData = creditScores.map(score => {
    const dataPoint: any = { creditScore: score };

    cars.forEach(car => {
      const options = carFinancingOptions.get(car.id) || getDefaultFinancingOptions();
      const financeOption = options.finance;

      const creditImpactData = calculateCreditScoreImpact(
        car.basePrice,
        financeOption.downPayment,
        financeOption.interestRate,
        financeOption.term
      );

      const scoreData = creditImpactData.find(d => d.creditScore === score);
      if (scoreData) {
        dataPoint[`${car.name}_payment`] = scoreData.monthlyPayment;
        dataPoint[`${car.name}_rate`] = scoreData.interestRate;
        dataPoint[`${car.name}_interest`] = scoreData.totalInterest;
      }
    });

    return dataPoint;
  });

  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  // Get current and best scenario for summary
  const allCarsImpact = cars.map(car => {
    const options = carFinancingOptions.get(car.id) || getDefaultFinancingOptions();
    const financeOption = options.finance;
    const creditImpactData = calculateCreditScoreImpact(
      car.basePrice,
      financeOption.downPayment,
      financeOption.interestRate,
      financeOption.term
    );

    const userCurrentData = creditImpactData.find(d => d.creditScore >= userProfile.creditScore);
    const bestScenario = creditImpactData[creditImpactData.length - 1];
    const potentialSavings = userCurrentData
      ? (userCurrentData.monthlyPayment - bestScenario.monthlyPayment) * financeOption.term
      : 0;

    return {
      car,
      userCurrentData,
      bestScenario,
      potentialSavings,
      term: financeOption.term
    };
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-2">
        <Award className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Credit Score Impact Simulator</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        How improving your credit affects monthly payments
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="creditScore"
            label={{ value: 'Credit Score', position: 'insideBottom', offset: -5 }}
            className="text-sm"
          />
          <YAxis
            label={{ value: 'Monthly Payment ($)', angle: -90, position: 'insideLeft' }}
            className="text-sm"
          />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          />
          <Legend />

          {cars.map((car, index) => (
            <Line
              key={car.id}
              type="monotone"
              dataKey={`${car.name}_payment`}
              stroke={colors[index % colors.length]}
              name={car.name}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
        {allCarsImpact.map(({ car, userCurrentData, bestScenario }) => (
          <div key={car.id} className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">{car.name} (Score {userProfile.creditScore})</p>
            <p className="text-lg font-bold">
              ${userCurrentData?.monthlyPayment.toLocaleString() || 'N/A'}/mo
            </p>
            <p className="text-xs text-green-600 mt-1">
              Best: ${bestScenario.monthlyPayment.toLocaleString()}/mo
            </p>
          </div>
        ))}
      </div>

      {allCarsImpact.some(d => d.potentialSavings > 0) && (
        <div className="mt-4 space-y-3">
          {allCarsImpact.filter(d => d.potentialSavings > 0).map(({ car, potentialSavings, term }) => (
            <div key={car.id} className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {car.name} - Potential Savings
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    ${potentialSavings.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Total savings over {term} months if you improve to 750+ credit score
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-1">Financial Coaching</p>
        <p className="text-xs text-muted-foreground">
          Your credit score directly impacts your interest rate. Improving from 650 to 750 can save
          you thousands over the life of your loan. Consider delaying your purchase to improve your
          credit if you're below 700.
        </p>
      </div>
    </Card>
  );
};
