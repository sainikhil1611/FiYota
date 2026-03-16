import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancingOption } from "@/types/car";

interface FinancingControlsProps {
  leaseOption: FinancingOption;
  financeOption: FinancingOption;
  onLeaseChange: (option: FinancingOption) => void;
  onFinanceChange: (option: FinancingOption) => void;
  activeTab: 'lease' | 'finance';
  onTabChange: (tab: 'lease' | 'finance') => void;
}

export const FinancingControls = ({
  leaseOption,
  financeOption,
  onLeaseChange,
  onFinanceChange,
  activeTab,
  onTabChange
}: FinancingControlsProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Financing Options</h3>
      
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as 'lease' | 'finance')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lease">Lease</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="lease" className="space-y-6 mt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Lease Term</Label>
              <span className="font-semibold">{leaseOption.term} months</span>
            </div>
            <Slider
              value={[leaseOption.term]}
              onValueChange={([term]) => onLeaseChange({ ...leaseOption, term })}
              min={24}
              max={48}
              step={12}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Down Payment</Label>
              <span className="font-semibold">${leaseOption.downPayment.toLocaleString()}</span>
            </div>
            <Slider
              value={[leaseOption.downPayment]}
              onValueChange={([downPayment]) => onLeaseChange({ ...leaseOption, downPayment })}
              min={0}
              max={10000}
              step={500}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Interest Rate</Label>
              <span className="font-semibold">{leaseOption.interestRate}%</span>
            </div>
            <Slider
              value={[leaseOption.interestRate]}
              onValueChange={([interestRate]) => onLeaseChange({ ...leaseOption, interestRate })}
              min={0}
              max={10}
              step={0.1}
            />
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6 mt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Finance Term</Label>
              <span className="font-semibold">{financeOption.term} months</span>
            </div>
            <Slider
              value={[financeOption.term]}
              onValueChange={([term]) => onFinanceChange({ ...financeOption, term })}
              min={24}
              max={84}
              step={12}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Down Payment</Label>
              <span className="font-semibold">${financeOption.downPayment.toLocaleString()}</span>
            </div>
            <Slider
              value={[financeOption.downPayment]}
              onValueChange={([downPayment]) => onFinanceChange({ ...financeOption, downPayment })}
              min={0}
              max={15000}
              step={500}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Interest Rate</Label>
              <span className="font-semibold">{financeOption.interestRate}%</span>
            </div>
            <Slider
              value={[financeOption.interestRate]}
              onValueChange={([interestRate]) => onFinanceChange({ ...financeOption, interestRate })}
              min={0}
              max={15}
              step={0.1}
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
