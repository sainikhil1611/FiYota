import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Car, FinancingOption } from "@/types/car";
import { getDefaultFinancingOptions } from "@/utils/financing";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface PerCarFinancingControlsProps {
  cars: Car[];
  carFinancingOptions: Map<string, { lease: FinancingOption; finance: FinancingOption }>;
  onFinancingChange: (carId: string, type: 'lease' | 'finance', option: FinancingOption) => void;
}

export const PerCarFinancingControls = ({
  cars,
  carFinancingOptions,
  onFinancingChange
}: PerCarFinancingControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'lease' | 'finance'>('lease');
  const [expandedCar, setExpandedCar] = useState<string>(cars[0]?.id || '');

  const getCarOptions = (carId: string) => {
    return carFinancingOptions.get(carId) || getDefaultFinancingOptions();
  };

  const renderFinancingControls = (car: Car, option: FinancingOption, type: 'lease' | 'finance') => {
    const isLease = type === 'lease';

    return (
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm">{isLease ? 'Lease' : 'Finance'} Term</Label>
            <Badge variant="secondary" className="font-semibold">
              {option.term} months
            </Badge>
          </div>
          <Slider
            value={[option.term]}
            onValueChange={([term]) => onFinancingChange(car.id, type, { ...option, term })}
            min={24}
            max={isLease ? 48 : 84}
            step={12}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>24 mo</span>
            <span>{isLease ? '48 mo' : '84 mo'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Down Payment</Label>
            <Badge variant="secondary" className="font-semibold">
              ${option.downPayment.toLocaleString()}
            </Badge>
          </div>
          <Slider
            value={[option.downPayment]}
            onValueChange={([downPayment]) => onFinancingChange(car.id, type, { ...option, downPayment })}
            min={0}
            max={isLease ? 10000 : 15000}
            step={500}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>${(isLease ? 10000 : 15000).toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Interest Rate</Label>
            <Badge variant="secondary" className="font-semibold">
              {option.interestRate.toFixed(1)}%
            </Badge>
          </div>
          <Slider
            value={[option.interestRate]}
            onValueChange={([interestRate]) => onFinancingChange(car.id, type, { ...option, interestRate })}
            min={0}
            max={isLease ? 10 : 15}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>{isLease ? '10%' : '15%'}</span>
          </div>
        </div>
      </div>
    );
  };

  if (cars.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/5 transition-colors">
        <div>
          <h3 className="text-lg font-bold text-left">Financing Options</h3>
          <p className="text-sm text-muted-foreground text-left">
            Customize lease and finance terms for each vehicle
          </p>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="px-4 pb-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'lease' | 'finance')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="lease">Lease</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
          </TabsList>

          <TabsContent value="lease" className="space-y-3 mt-0">
            <Accordion
              type="single"
              collapsible
              value={expandedCar}
              onValueChange={setExpandedCar}
              className="space-y-2"
            >
              {cars.map((car) => {
                const options = getCarOptions(car.id);
                return (
                  <AccordionItem
                    key={car.id}
                    value={car.id}
                    className="border rounded-lg px-4 bg-card hover:bg-accent/5 transition-colors"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center justify-between w-full pr-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            <img
                              src={car.image}
                              alt={car.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">{car.name}</div>
                            <div className="text-xs text-muted-foreground">{car.model}</div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {options.lease.term}mo • ${options.lease.downPayment.toLocaleString()} • {options.lease.interestRate}%
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {renderFinancingControls(car, options.lease, 'lease')}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>

          <TabsContent value="finance" className="space-y-3 mt-0">
            <Accordion
              type="single"
              collapsible
              value={expandedCar}
              onValueChange={setExpandedCar}
              className="space-y-2"
            >
              {cars.map((car) => {
                const options = getCarOptions(car.id);
                return (
                  <AccordionItem
                    key={car.id}
                    value={car.id}
                    className="border rounded-lg px-4 bg-card hover:bg-accent/5 transition-colors"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center justify-between w-full pr-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            <img
                              src={car.image}
                              alt={car.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">{car.name}</div>
                            <div className="text-xs text-muted-foreground">{car.model}</div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {options.finance.term}mo • ${options.finance.downPayment.toLocaleString()} • {options.finance.interestRate}%
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {renderFinancingControls(car, options.finance, 'finance')}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  );
};
