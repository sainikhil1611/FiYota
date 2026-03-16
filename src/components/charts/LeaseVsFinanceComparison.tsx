import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, FinancingOption } from "@/types/car";
import { calculateFinancing, getDefaultFinancingOptions } from "@/utils/financing";

interface LeaseVsFinanceComparisonProps {
  cars: Car[];
  carFinancingOptions: Map<string, { lease: FinancingOption; finance: FinancingOption }>;
}

export const LeaseVsFinanceComparison = ({
  cars,
  carFinancingOptions
}: LeaseVsFinanceComparisonProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Lease vs Finance Comparison</h3>
      <div className="space-y-4">
        {cars.map(car => {
          const options = carFinancingOptions.get(car.id) || getDefaultFinancingOptions();
          const lease = calculateFinancing(car.basePrice, options.lease);
          const finance = calculateFinancing(car.basePrice, options.finance);
          
          const monthlySavings = (finance.monthlyPayment || 0) - (lease.monthlyPayment || 0);
          const totalSavings = (finance.totalCost || 0) - (lease.totalCost || 0);
          
          return (
            <div key={car.id} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">
                {car.year} Toyota {car.name} - ${car.basePrice.toLocaleString()}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lease Column */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Lease</Badge>
                    <span className="text-xs text-muted-foreground">{options.lease.term} months</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Payment</p>
                    <p className="text-2xl font-bold text-primary">
                      ${lease.monthlyPayment?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-lg font-semibold">
                      ${lease.totalCost?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Down Payment</p>
                    <p className="text-sm font-medium">
                      ${options.lease.downPayment.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                    <p className="text-sm font-medium">
                      {options.lease.interestRate}%
                    </p>
                  </div>
                </div>

                {/* Finance Column */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Finance</Badge>
                    <span className="text-xs text-muted-foreground">{options.finance.term} months</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Payment</p>
                    <p className="text-2xl font-bold text-primary">
                      ${finance.monthlyPayment?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-lg font-semibold">
                      ${finance.totalCost?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Down Payment</p>
                    <p className="text-sm font-medium">
                      ${options.finance.downPayment.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                    <p className="text-sm font-medium">
                      {options.finance.interestRate}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparison Summary */}
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Monthly Difference</p>
                    <p className={`font-semibold ${monthlySavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {monthlySavings > 0 ? 'Lease saves' : 'Finance saves'} ${Math.abs(monthlySavings).toLocaleString()}/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Difference</p>
                    <p className={`font-semibold ${totalSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalSavings > 0 ? 'Lease saves' : 'Finance saves'} ${Math.abs(totalSavings).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
