import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Car, FinancingOption } from "@/types/car";
import { calculateFinancing, getDefaultFinancingOptions } from "@/utils/financing";

interface TotalCostChartProps {
  cars: Car[];
  carFinancingOptions: Map<string, { lease: FinancingOption; finance: FinancingOption }>;
}

export const TotalCostChart = ({ cars, carFinancingOptions }: TotalCostChartProps) => {
  const data = cars.map(car => {
    const options = carFinancingOptions.get(car.id) || getDefaultFinancingOptions();
    const lease = calculateFinancing(car.basePrice, options.lease);
    const finance = calculateFinancing(car.basePrice, options.finance);

    return {
      name: car.name,
      lease: lease.totalCost || 0,
      finance: finance.totalCost || 0,
      savings: Math.abs((lease.totalCost || 0) - (finance.totalCost || 0))
    };
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Total Cost Comparison: Lease vs Finance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-sm" />
          <YAxis className="text-sm" />
          <Tooltip 
            formatter={(value) => `$${Number(value).toLocaleString()}`}
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="lease" 
            stroke="hsl(var(--chart-3))" 
            name="Lease Total" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="finance" 
            stroke="hsl(var(--chart-4))" 
            name="Finance Total" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
