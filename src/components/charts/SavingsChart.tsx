import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Car, FinancingOption } from "@/types/car";
import { calculateFinancing, getDefaultFinancingOptions } from "@/utils/financing";

interface SavingsChartProps {
  cars: Car[];
  carFinancingOptions: Map<string, { lease: FinancingOption; finance: FinancingOption }>;
}

export const SavingsChart = ({ cars, carFinancingOptions }: SavingsChartProps) => {
  const data = cars.map(car => {
    const options = carFinancingOptions.get(car.id) || getDefaultFinancingOptions();
    const lease = calculateFinancing(car.basePrice, options.lease);
    const finance = calculateFinancing(car.basePrice, options.finance);

    const leaseCost = lease.totalCost || 0;
    const financeCost = finance.totalCost || 0;
    const savings = financeCost - leaseCost;

    return {
      name: car.name,
      savings: Math.abs(savings),
      better: savings > 0 ? 'Lease' : 'Finance'
    };
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Potential Savings</h3>
      <div className="mb-4 text-sm text-muted-foreground">
        Shows the cost difference between lease and finance options
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-sm" />
          <YAxis className="text-sm" />
          <Tooltip 
            formatter={(value) => `$${Number(value).toLocaleString()}`}
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          />
          <Legend />
          <Bar dataKey="savings" fill="hsl(var(--chart-5))" name="Cost Difference" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
