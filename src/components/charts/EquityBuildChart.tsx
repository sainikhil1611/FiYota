import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Car, FinancingOption } from "@/types/car";
import { calculateFinancing, calculateEquityOverTime, getDefaultFinancingOptions } from "@/utils/financing";
import { TrendingUp } from "lucide-react";

interface EquityBuildChartProps {
  cars: Car[];
  carFinancingOptions: Map<string, { lease: FinancingOption; finance: FinancingOption }>;
}

export const EquityBuildChart = ({ cars, carFinancingOptions }: EquityBuildChartProps) => {
  if (cars.length === 0) return null;

  // Calculate equity for all cars
  const allCarsData = cars.map(car => {
    const options = carFinancingOptions.get(car.id) || getDefaultFinancingOptions();
    const financeCalculated = calculateFinancing(car.basePrice, options.finance);
    const leaseCalculated = calculateFinancing(car.basePrice, options.lease);

    const equityData = calculateEquityOverTime(
      car.basePrice,
      options.finance.downPayment,
      financeCalculated.monthlyPayment || 0,
      options.finance.interestRate,
      options.finance.term
    );

    return {
      car,
      options,
      equityData,
      financeCalculated,
      leaseCalculated
    };
  });

  // Use the longest term for the X axis
  const maxMonths = Math.max(...allCarsData.map(d => d.options.finance.term));

  // Build chart data
  const chartData = Array.from({ length: maxMonths + 1 }, (_, month) => {
    const dataPoint: any = {
      month,
      year: (month / 12).toFixed(1)
    };

    allCarsData.forEach(({ car, equityData }) => {
      const point = equityData.find(d => d.month === month);
      dataPoint[`${car.name}_finance`] = point ? point.equity : null;
      dataPoint[`${car.name}_lease`] = 0; // Lease always has $0 equity
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
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Equity Build: Finance vs Lease</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Ownership builds wealth, leasing builds nothing
      </p>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="month"
            label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
            className="text-sm"
          />
          <YAxis
            label={{ value: 'Equity Built ($)', angle: -90, position: 'insideLeft' }}
            className="text-sm"
          />
          <Tooltip
            formatter={(value: number) => `$${value?.toLocaleString() || 0}`}
            labelFormatter={(month) => `Month ${month} (Year ${(Number(month) / 12).toFixed(1)})`}
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          />
          <Legend />

          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />

          {/* Finance equity lines for each car */}
          {allCarsData.map(({ car }, index) => (
            <Line
              key={`${car.id}-finance`}
              type="monotone"
              dataKey={`${car.name}_finance`}
              stroke={colors[index % colors.length]}
              name={`${car.name} (Finance)`}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}

          {/* Lease equity lines (all at $0) - show only one dashed line */}
          <Line
            type="monotone"
            dataKey={`${cars[0].name}_lease`}
            stroke="hsl(var(--destructive))"
            name="Lease (All = $0)"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Finance summary for each car */}
        {allCarsData.map(({ car, options, equityData, financeCalculated }, index) => {
          const finalEquity = equityData[equityData.length - 1]?.equity || 0;
          return (
            <div key={car.id} className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                {car.name} - Finance: You Own It
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${finalEquity.toLocaleString()}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Equity after {options.finance.term} months
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Total paid: ${(financeCalculated.totalCost || 0).toLocaleString()}
              </p>
            </div>
          );
        })}

        {/* Lease summary - one box showing all equal $0 */}
        <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
            Lease: You Own Nothing
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            $0
          </p>
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
            All vehicles - equity after lease term
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            When lease ends, return the vehicle with nothing to show
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-1">Financial Insight</p>
        <p className="text-xs text-muted-foreground">
          When you finance, every payment builds equity - you're buying an asset. The lines above show how
          much of the vehicle you actually own over time. With a lease, you're simply renting - when the
          term ends, you walk away with nothing regardless of how much you paid.
        </p>
      </div>
    </Card>
  );
};
