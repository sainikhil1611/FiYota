import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Car, FinancingOption } from "@/types/car";
import { calculateFinancing, getDefaultFinancingOptions } from "@/utils/financing";

interface MonthlyPaymentChartProps {
  cars: Car[];
  carFinancingOptions: Map<string, { lease: FinancingOption; finance: FinancingOption }>;
}

export const MonthlyPaymentChart = ({ cars, carFinancingOptions }: MonthlyPaymentChartProps) => {
  const data = cars.map(car => {
    const options = carFinancingOptions.get(car.id) || getDefaultFinancingOptions();
    const leaseCalculated = calculateFinancing(car.basePrice, options.lease);
    const financeCalculated = calculateFinancing(car.basePrice, options.finance);

    return {
      name: car.name,
      lease: leaseCalculated.monthlyPayment || 0,
      finance: financeCalculated.monthlyPayment || 0
    };
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Monthly Payment Comparison</h3>
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
          <Bar dataKey="lease" fill="hsl(var(--chart-3))" name="Lease" radius={[8, 8, 0, 0]} />
          <Bar dataKey="finance" fill="hsl(var(--chart-4))" name="Finance" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
