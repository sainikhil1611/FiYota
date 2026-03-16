import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Car } from "@/types/car";

interface PriceComparisonChartProps {
  cars: Car[];
}

export const PriceComparisonChart = ({ cars }: PriceComparisonChartProps) => {
  const data = cars.map(car => ({
    name: car.name,
    price: car.basePrice
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Base Price Comparison</h3>
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
          <Bar dataKey="price" fill="hsl(var(--chart-1))" name="Base Price" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
