import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserFinancialProfile, CreditScoreRange } from "@/types/userProfile";
import { getCreditScoreRange } from "@/utils/affordability";
import { DollarSign, TrendingUp, Wallet, CreditCard, Car, Calendar, Percent } from "lucide-react";

interface FinancialProfileFormProps {
  profile: UserFinancialProfile;
  onProfileChange: (profile: UserFinancialProfile) => void;
}

export const FinancialProfileForm = ({ profile, onProfileChange }: FinancialProfileFormProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const creditRange = getCreditScoreRange(profile.creditScore);
  
  const getCreditRangeColor = (range: CreditScoreRange) => {
    switch (range) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
    }
  };

  const getCreditRangeLabel = (range: CreditScoreRange) => {
    switch (range) {
      case 'excellent': return 'Excellent (750+)';
      case 'good': return 'Good (700-749)';
      case 'fair': return 'Fair (650-699)';
      case 'poor': return 'Poor (<650)';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Your Financial Profile
          </h3>
          <p className="text-sm text-muted-foreground">
            Help us personalize your financing options
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Monthly Income */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Monthly Income
              </Label>
              <span className="font-semibold">${profile.monthlyIncome.toLocaleString()}</span>
            </div>
            <Slider
              value={[profile.monthlyIncome]}
              onValueChange={([monthlyIncome]) => onProfileChange({ ...profile, monthlyIncome })}
              min={2000}
              max={20000}
              step={500}
            />
            <p className="text-xs text-muted-foreground">
              Recommended payment: ${Math.round(profile.monthlyIncome * 0.15).toLocaleString()} - ${Math.round(profile.monthlyIncome * 0.20).toLocaleString()} (15-20% of income)
            </p>
          </div>

          {/* Credit Score */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Credit Score
              </Label>
              <span className={`font-semibold ${getCreditRangeColor(creditRange)}`}>
                {profile.creditScore} - {getCreditRangeLabel(creditRange)}
              </span>
            </div>
            <Slider
              value={[profile.creditScore]}
              onValueChange={([creditScore]) => onProfileChange({ ...profile, creditScore })}
              min={500}
              max={850}
              step={10}
            />
          </div>

          {/* Max Down Payment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Maximum Down Payment
              </Label>
              <span className="font-semibold">${profile.maxDownPayment.toLocaleString()}</span>
            </div>
            <Slider
              value={[profile.maxDownPayment]}
              onValueChange={([maxDownPayment]) => onProfileChange({ ...profile, maxDownPayment })}
              min={0}
              max={20000}
              step={500}
            />
          </div>

          {/* Preferred Monthly Payment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Target Monthly Payment
              </Label>
              <span className="font-semibold">${profile.preferredMonthlyPayment.toLocaleString()}</span>
            </div>
            <Slider
              value={[profile.preferredMonthlyPayment]}
              onValueChange={([preferredMonthlyPayment]) => onProfileChange({ ...profile, preferredMonthlyPayment })}
              min={200}
              max={2000}
              step={50}
            />
          </div>

          {/* Trade-in */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Do you have a trade-in?
              </Label>
              <Switch
                checked={profile.hasTradeIn}
                onCheckedChange={(hasTradeIn) => onProfileChange({ ...profile, hasTradeIn })}
              />
            </div>

            {profile.hasTradeIn && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">Trade-in Value</Label>
                  <span className="font-semibold">${profile.tradeInValue.toLocaleString()}</span>
                </div>
                <Slider
                  value={[profile.tradeInValue]}
                  onValueChange={([tradeInValue]) => onProfileChange({ ...profile, tradeInValue })}
                  min={0}
                  max={30000}
                  step={500}
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 text-sm">Financing Preferences</h4>
            <p className="text-xs text-muted-foreground mb-4">
              These settings will apply to all vehicles
            </p>
          </div>

          {/* Financing Type */}
          <div className="space-y-3">
            <Label className="text-sm">Financing Type</Label>
            <Tabs
              value={profile.financingType}
              onValueChange={(value) => onProfileChange({ ...profile, financingType: value as 'lease' | 'finance' })}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lease">Lease</TabsTrigger>
                <TabsTrigger value="finance">Finance</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              {profile.financingType === 'lease'
                ? 'Lower monthly payments, return vehicle at end of term'
                : 'Own the vehicle, build equity over time'}
            </p>
          </div>

          {/* Loan Term */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Loan Term
              </Label>
              <span className="font-semibold">{profile.loanTerm} months</span>
            </div>
            <Slider
              value={[profile.loanTerm]}
              onValueChange={([loanTerm]) => onProfileChange({ ...profile, loanTerm })}
              min={24}
              max={profile.financingType === 'lease' ? 48 : 84}
              step={12}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>24 mo</span>
              <span>{profile.financingType === 'lease' ? '48 mo' : '84 mo'}</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-sm">
                <Percent className="h-4 w-4" />
                Interest Rate (APR)
              </Label>
              <span className="font-semibold">{profile.interestRate.toFixed(1)}%</span>
            </div>
            <Slider
              value={[profile.interestRate]}
              onValueChange={([interestRate]) => onProfileChange({ ...profile, interestRate })}
              min={0}
              max={profile.financingType === 'lease' ? 10 : 15}
              step={0.1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>{profile.financingType === 'lease' ? '10%' : '15%'}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
