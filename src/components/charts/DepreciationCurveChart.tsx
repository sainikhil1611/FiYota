import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Car } from "@/types/car";
import { calculateDepreciationCurve } from "@/utils/financing";
import { TrendingDown } from "lucide-react";

interface DepreciationCurveChartProps {
  cars: Car[];
}

export const DepreciationCurveChart = ({ cars }: DepreciationCurveChartProps) => {
  if (cars.length === 0) return null;

  // Calculate depreciation for all selected cars
  const depreciationData: Record<string, any>[] = [];
  const years = 5;

  for (let year = 0; year <= years; year++) {
    const dataPoint: Record<string, any> = { year };

    cars.forEach(car => {
      const curve = calculateDepreciationCurve(car.basePrice, years);
      const yearData = curve.find(d => d.year === year);
      if (yearData) {
        dataPoint[`${car.name}_value`] = yearData.value;
        dataPoint[`${car.name}_percent`] = yearData.depreciationPercent;
      }
    });

    depreciationData.push(dataPoint);
  }

  // Calculate summary stats for first car
  const car = cars[0];
  const carCurve = calculateDepreciationCurve(car.basePrice, years);
  const year1 = carCurve.find(d => d.year === 1);
  const year5 = carCurve.find(d => d.year === 5);

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
        <TrendingDown className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Vehicle Depreciation Curve</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Projected resale value over 5 years - understand your investment
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={depreciationData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="year"
            label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
            className="text-sm"
          />
          <YAxis
            label={{ value: 'Vehicle Value ($)', angle: -90, position: 'insideLeft' }}
            className="text-sm"
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name.includes('value')) {
                return `$${value.toLocaleString()}`;
              }
              return value;
            }}
            labelFormatter={(year) => `Year ${year}`}
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          />
          <Legend
            formatter={(value) => value.replace('_value', '')}
          />

          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />

          {cars.map((car, index) => (
            <Area
              key={car.id}
              type="monotone"
              dataKey={`${car.name}_value`}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Original Price</p>
          <p className="text-lg font-bold">
            ${car.basePrice.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Purchase price
          </p>
        </div>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">After 1 Year</p>
          <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            ${year1?.value.toLocaleString() || 'N/A'}
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            -{year1?.depreciationPercent}% depreciation
          </p>
        </div>

        <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
          <p className="text-xs text-orange-700 dark:text-orange-300 mb-1">After 5 Years</p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
            ${year5?.value.toLocaleString() || 'N/A'}
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
            -{year5?.depreciationPercent}% depreciation
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
          Understanding Your Investment
        </p>
        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <p>
            <strong>Year 1:</strong> Steepest drop (~20%) - new car becomes "used" immediately
          </p>
          <p>
            <strong>Years 2-3:</strong> Moderate decline (10-15%/year) - normal wear and tear
          </p>
          <p>
            <strong>Years 4-5:</strong> Slower decline (~8%/year) - value stabilizes
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-1">Financial Strategy</p>
        <p className="text-xs text-muted-foreground">
          Depreciation is inevitable but predictable. If you finance, plan to keep the vehicle until
          it's paid off (or beyond) to avoid being "underwater" (owing more than it's worth).
          This curve shows why leasing can make sense if you want a new car every 3 years.
        </p>
      </div>
    </Card>
  );
};
