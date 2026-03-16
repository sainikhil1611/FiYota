import { X, CheckCircle, AlertCircle, XCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PreApprovalResult } from "@/utils/preApproval";

interface PreApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PreApprovalResult | null;
  vehicleName?: string;
}

export function PreApprovalModal({
  isOpen,
  onClose,
  result,
  vehicleName,
}: PreApprovalModalProps) {
  if (!isOpen || !result) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Very Likely":
        return "text-green-600 bg-green-50 border-green-200";
      case "Likely":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Possible":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Unlikely":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Very Likely":
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case "Likely":
        return <CheckCircle className="h-8 w-8 text-blue-600" />;
      case "Possible":
        return <AlertCircle className="h-8 w-8 text-yellow-600" />;
      case "Unlikely":
        return <XCircle className="h-8 w-8 text-red-600" />;
      default:
        return <AlertCircle className="h-8 w-8 text-gray-600" />;
    }
  };

  const getFactorColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Pre-Approval Check</h2>
              {vehicleName && (
                <p className="text-sm text-muted-foreground mt-1">
                  {vehicleName} • ${result.estimatedCarPrice.toLocaleString()}
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Card */}
            <Card
              className={`p-6 border-2 ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center gap-4">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <h3 className="text-xl font-bold">
                    Approval Status: {result.status}
                  </h3>
                  <p className="text-sm mt-1">
                    Based on your financial profile and vehicle selection
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">
                    {result.approvalPercentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Approval Likelihood
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={result.approvalPercentage} className="h-3" />
              </div>
            </Card>

            {/* Factors Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Approval Factors
              </h3>
              <div className="space-y-4">
                {/* Credit Score */}
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Credit Score</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          result.factors.creditScore.status === "excellent"
                            ? "bg-green-100 text-green-700"
                            : result.factors.creditScore.status === "good"
                            ? "bg-blue-100 text-blue-700"
                            : result.factors.creditScore.status === "fair"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {result.factors.creditScore.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">
                        {result.factors.creditScore.percentage}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={result.factors.creditScore.percentage}
                    className={`h-2 mb-2 ${getFactorColor(
                      result.factors.creditScore.percentage
                    )}`}
                  />
                  <p className="text-sm text-muted-foreground">
                    {result.factors.creditScore.message}
                  </p>
                </Card>

                {/* Income Ratio */}
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Income to Payment Ratio</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          result.factors.incomeRatio.status === "excellent"
                            ? "bg-green-100 text-green-700"
                            : result.factors.incomeRatio.status === "good"
                            ? "bg-blue-100 text-blue-700"
                            : result.factors.incomeRatio.status === "concern"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {result.factors.incomeRatio.ratio.toFixed(1)}x
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">
                        {result.factors.incomeRatio.percentage}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={result.factors.incomeRatio.percentage}
                    className={`h-2 mb-2 ${getFactorColor(
                      result.factors.incomeRatio.percentage
                    )}`}
                  />
                  <p className="text-sm text-muted-foreground">
                    {result.factors.incomeRatio.message}
                  </p>
                </Card>

                {/* Down Payment */}
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Down Payment</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          result.factors.downPayment.status === "excellent"
                            ? "bg-green-100 text-green-700"
                            : result.factors.downPayment.status === "good"
                            ? "bg-blue-100 text-blue-700"
                            : result.factors.downPayment.status === "minimal"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {result.factors.downPayment.percentDown.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">
                        {result.factors.downPayment.percentage}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={result.factors.downPayment.percentage}
                    className={`h-2 mb-2 ${getFactorColor(
                      result.factors.downPayment.percentage
                    )}`}
                  />
                  <p className="text-sm text-muted-foreground">
                    {result.factors.downPayment.message}
                  </p>
                </Card>

                {/* Trade-In */}
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Trade-In Value</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          result.factors.tradeIn.status === "helpful"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {result.factors.tradeIn.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">
                        {result.factors.tradeIn.percentage}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={result.factors.tradeIn.percentage}
                    className={`h-2 mb-2 ${getFactorColor(
                      result.factors.tradeIn.percentage
                    )}`}
                  />
                  <p className="text-sm text-muted-foreground">
                    {result.factors.tradeIn.message}
                  </p>
                </Card>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Recommendations to Improve Approval Odds
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 font-bold mt-0.5">
                        {index + 1}.
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Disclaimer */}
            <Card className="p-4 bg-muted">
              <p className="text-xs text-muted-foreground">
                <strong>Disclaimer:</strong> This is an estimate based on
                typical lending criteria and is not a guarantee of approval.
                Actual approval depends on additional factors including
                employment history, debt-to-income ratio, payment history, and
                lender-specific criteria. For accurate pre-approval, contact a
                Toyota Financial Services representative or your preferred
                lender.
              </p>
            </Card>
          </div>
        </Card>
      </div>
    </>
  );
}
