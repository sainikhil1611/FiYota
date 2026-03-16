import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, DollarSign, TrendingUp, Coins, Gauge, LineChart, Award, TrendingDown } from "lucide-react";

export type ChartView = 'price' | 'monthly' | 'total' | 'savings' | 'comparison' | 'affordability' | 'equity' | 'creditImpact' | 'downPayment' | 'depreciation';

interface ChartNavigationProps {
  activeViews: ChartView[];
  onViewsChange: (views: ChartView[]) => void;
}

const chartOptions = [
  // Basic Cost Charts
  {
    id: 'price' as ChartView,
    label: 'Base Price',
    icon: DollarSign,
    description: 'Compare vehicle base prices',
    category: 'basic'
  },
  {
    id: 'monthly' as ChartView,
    label: 'Monthly Payment',
    icon: Coins,
    description: 'View monthly payment amounts',
    category: 'basic'
  },
  {
    id: 'comparison' as ChartView,
    label: 'Lease vs Finance',
    icon: TrendingUp,
    description: 'Side-by-side comparison',
    category: 'basic'
  },
  {
    id: 'total' as ChartView,
    label: 'Total Cost',
    icon: BarChart3,
    description: 'Long-term cost analysis',
    category: 'basic'
  },
  {
    id: 'savings' as ChartView,
    label: 'Savings Analysis',
    icon: BarChart3,
    description: 'Cost difference between options',
    category: 'basic'
  },
  // Financial Insights - New High-Impact Charts
  {
    id: 'affordability' as ChartView,
    label: 'Affordability Index',
    icon: Gauge,
    description: 'Budget impact analysis',
    category: 'insight'
  },
  {
    id: 'equity' as ChartView,
    label: 'Equity Timeline',
    icon: LineChart,
    description: 'Wealth building over time',
    category: 'insight'
  },
  {
    id: 'creditImpact' as ChartView,
    label: 'Credit Impact',
    icon: Award,
    description: 'Score affects your payment',
    category: 'insight'
  },
  {
    id: 'downPayment' as ChartView,
    label: 'Down Payment',
    icon: DollarSign,
    description: 'Upfront investment impact',
    category: 'insight'
  },
  {
    id: 'depreciation' as ChartView,
    label: 'Depreciation',
    icon: TrendingDown,
    description: 'Vehicle value over time',
    category: 'insight'
  }
];

export const ChartNavigation = ({ activeViews, onViewsChange }: ChartNavigationProps) => {
  const handleToggleView = (viewId: ChartView) => {
    if (activeViews.includes(viewId)) {
      // If only one view is active, don't allow deselecting it
      if (activeViews.length === 1) return;
      onViewsChange(activeViews.filter(v => v !== viewId));
    } else {
      onViewsChange([...activeViews, viewId]);
    }
  };
  const allowed: ChartView[] = ['monthly', 'total', 'comparison', 'depreciation', 'affordability'];
  const filtered = chartOptions.filter(opt => allowed.includes(opt.id));

  return (
    <Card className="p-4">
      <div className="mb-3">
        <p className="text-sm text-muted-foreground">
          Select one or more charts to view {activeViews.length > 1 && `(${activeViews.length} selected)`}
        </p>
      </div>

      {/* Financial Insights Section (single row) */}
      {filtered.length > 0 && (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Financial Insights</h4>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Smart Analysis</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {filtered.map((option) => {
            const Icon = option.icon;
            const isActive = activeViews.includes(option.id);

            return (
              <Button
                key={option.id}
                variant="outline"
                className={`h-auto py-3 px-3 flex flex-col items-start gap-2 transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/15'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleToggleView(option.id)}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-left">
                  <div className="font-semibold text-xs">{option.label}</div>
                  <div className={`text-xs ${isActive ? 'text-primary/80' : 'text-muted-foreground'}`}>
                    {option.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
      )}
    </Card>
  );
};
