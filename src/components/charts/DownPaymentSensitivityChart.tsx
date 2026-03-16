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
import { calculateDownPaymentSensitivity, getDefaultFinancingOptions } from "@/utils/financing";
import { DollarSign } from "lucide-react";

interface DownPaymentSensitivityChartProps {
  cars: Car[];
  carFinancingOptions: Map<string, { lease: FinancingOption; finance: FinancingOption }>;
}

export const DownPaymentSensitivityChart = ({
  cars,
  carFinancingOptions
}: DownPaymentSensitivityChartProps) => {
  if (cars.length === 0) return null;

  // Calculate sensitivity for all cars
  const allCarsSensitivity = cars.map(car => {
    const options = carFinancingOptions.get(car.id) || getDefaultFinancingOptions();
    const financeOption = options.finance;

    const sensitivityData = calculateDownPaymentSensitivity(
      car.basePrice,
      financeOption.interestRate,
      financeOption.term,
      0,
      car.basePrice * 0.5
    );

    // Find current down payment scenario
    const currentScenario = sensitivityData.find(
      d => Math.abs(d.downPayment - financeOption.downPayment) < 1000
    ) || sensitivityData[0];

    const bestScenario = sensitivityData[sensitivityData.length - 1];
    const monthlySavingsVsCurrent = currentScenario.monthlyPayment - bestScenario.monthlyPayment;
    const totalInterestSavings = currentScenario.totalInterest - bestScenario.totalInterest;

    return {
      car,
      sensitivityData,
      currentScenario,
      bestScenario,
      monthlySavingsVsCurrent,
      totalInterestSavings,
      term: financeOption.term
    };
  });

  // Build unified chart data
  const downPaymentSteps = allCarsSensitivity[0].sensitivityData.length;
  const chartData = Array.from({ length: downPaymentSteps }, (_, index) => {
    const dataPoint: any = {};

    allCarsSensitivity.forEach(({ car, sensitivityData }) => {
      const stepData = sensitivityData[index];
      if (stepData) {
        dataPoint.downPayment = stepData.downPayment;
        dataPoint[`${car.name}_payment`] = stepData.monthlyPayment;
        dataPoint[`${car.name}_interest`] = stepData.totalInterest;
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

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Down Payment Sensitivity</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Impact of upfront investment on monthly costs
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="downPayment"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            label={{ value: 'Down Payment', position: 'insideBottom', offset: -5 }}
            className="text-sm"
          />
          <YAxis
            label={{ value: 'Monthly Payment ($)', angle: -90, position: 'insideLeft' }}
            className="text-sm"
          />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            labelFormatter={(value) => `Down: $${Number(value).toLocaleString()}`}
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
        {allCarsSensitivity.map(({ car, currentScenario, bestScenario }) => (
          <div key={car.id} className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">{car.name}</p>
            <p className="text-lg font-bold">
              ${currentScenario.downPayment.toLocaleString()} down
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ${currentScenario.monthlyPayment.toLocaleString()}/mo
            </p>
            <p className="text-xs text-green-600 mt-1">
              Max down: ${bestScenario.monthlyPayment.toLocaleString()}/mo
            </p>
          </div>
        ))}
      </div>

      {allCarsSensitivity.some(d => d.totalInterestSavings > 0) && (
        <div className="mt-4 space-y-3">
          {allCarsSensitivity.filter(d => d.totalInterestSavings > 0).map(({ car, monthlySavingsVsCurrent, totalInterestSavings, currentScenario, bestScenario }) => (
            <div key={car.id} className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-2">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    {car.name} - Interest Savings with Higher Down
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    ${totalInterestSavings.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Save ${monthlySavingsVsCurrent.toLocaleString()}/mo by increasing down payment from
                    ${currentScenario.downPayment.toLocaleString()} to ${bestScenario.downPayment.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-1">Strategic Insight</p>
        <p className="text-xs text-muted-foreground">
          Every additional $1,000 down reduces your monthly payment and total interest paid.
          The curve shows diminishing returns - the first dollars down have the biggest impact.
          Balance this against keeping cash for emergencies.
        </p>
      </div>
    </Card>
  );
};
