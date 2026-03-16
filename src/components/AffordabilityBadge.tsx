import { Badge } from "@/components/ui/badge";
import { AffordabilityAnalysis } from "@/types/userProfile";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface AffordabilityBadgeProps {
  analysis: AffordabilityAnalysis;
  showDetails?: boolean;
}

export const AffordabilityBadge = ({ analysis, showDetails = false }: AffordabilityBadgeProps) => {
  const getIcon = () => {
    switch (analysis.riskLevel) {
      case 'low':
        return <CheckCircle className="h-3 w-3" />;
      case 'medium':
        return <AlertTriangle className="h-3 w-3" />;
      case 'high':
        return <XCircle className="h-3 w-3" />;
    }
  };

  const getVariant = () => {
    switch (analysis.riskLevel) {
      case 'low':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'destructive';
    }
  };

  const getLabel = () => {
    if (analysis.canAfford) {
      return analysis.riskLevel === 'low' ? 'Excellent Fit' : 'Within Budget';
    }
    return 'Above Budget';
  };

  return (
    <div className="space-y-2">
      <Badge variant={getVariant()} className="flex items-center gap-1 w-fit">
        {getIcon()}
        {getLabel()}
      </Badge>
      {showDetails && (
        <div className="text-xs text-muted-foreground">
          <p>{analysis.budgetImpact.toFixed(1)}% of monthly income</p>
          <p className="mt-1">{analysis.recommendation}</p>
        </div>
      )}
    </div>
  );
};
