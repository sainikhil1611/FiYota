import { Card } from "@/components/ui/card";
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Car, FinancingOption } from "@/types/car";
import { UserFinancialProfile } from "@/types/userProfile";
import { calculateFinancing, calculateAffordabilityImpact, getDefaultFinancingOptions } from "@/utils/financing";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

interface AffordabilityGaugeChartProps {
  cars: Car[];
  carFinancingOptions: Map<string, { lease: FinancingOption; finance: FinancingOption }>;
  userProfile: UserFinancialProfile;
  financingType: 'lease' | 'finance';
}

export const AffordabilityGaugeChart = ({
  cars,
  carFinancingOptions,
  userProfile,
  financingType
}: AffordabilityGaugeChartProps) => {
  const data = cars.map(car => {
    const options = carFinancingOptions.get(car.id) || getDefaultFinancingOptions();
    const option = financingType === 'lease' ? options.lease : options.finance;
    const calculated = calculateFinancing(car.basePrice, option);
    const affordability = calculateAffordabilityImpact(
      calculated.monthlyPayment || 0,
      userProfile.monthlyIncome
    );

    return {
      name: car.name,
      percentage: affordability.percentage,
      status: affordability.status,
      message: affordability.message,
      monthlyPayment: calculated.monthlyPayment || 0,
      fill:
        affordability.status === 'excellent' ? 'hsl(var(--chart-1))' :
        affordability.status === 'good' ? 'hsl(var(--chart-2))' :
        affordability.status === 'caution' ? 'hsl(var(--chart-3))' :
        'hsl(var(--destructive))'
    };
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'good':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'caution':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-2">Affordability Index</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Payment as % of ${userProfile.monthlyIncome.toLocaleString()} monthly income
      </p>

      <div className="space-y-6">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(item.status)}
                <span className="font-medium">{item.name}</span>
              </div>
              <span className="text-sm font-bold">{item.percentage}%</span>
            </div>

            <ResponsiveContainer width="100%" height={120}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
                data={[item]}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 30]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background
                  dataKey="percentage"
                  cornerRadius={10}
                  fill={item.fill}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{item.message}</span>
              <span>${item.monthlyPayment.toLocaleString()}/mo</span>
            </div>

            <div className="flex justify-between text-xs pt-1 border-t">
              <span className="text-green-600">{"<10% Excellent"}</span>
              <span className="text-blue-600">{"<15% Good"}</span>
              <span className="text-yellow-600">{"<20% Caution"}</span>
              <span className="text-red-600">{">20% Risk"}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-1">Financial Guideline</p>
        <p className="text-xs text-muted-foreground">
          Industry experts recommend keeping vehicle payments under 15% of your monthly income
          to maintain financial flexibility.
        </p>
      </div>
    </Card>
  );
};
