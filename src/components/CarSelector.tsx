import { Car, FinancingOption } from "@/types/car";
import { UserFinancialProfile } from "@/types/userProfile";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateFinancing } from "@/utils/financing";
import { analyzeAffordability, getInterestRateForCreditScore } from "@/utils/affordability";
import { AffordabilityBadge } from "./AffordabilityBadge";
import { Sparkles } from "lucide-react";

interface CarSelectorProps {
  cars: Car[];
  selectedCarIds: string[];
  onSelectionChange: (carIds: string[]) => void;
  userProfile?: UserFinancialProfile;
  financingOption?: FinancingOption;
  recommendedCarIds?: string[];
  affordableCarIds?: string[];
  collapsed?: boolean;
}

export const CarSelector = ({
  cars,
  selectedCarIds,
  onSelectionChange,
  userProfile,
  financingOption,
  recommendedCarIds = [],
  affordableCarIds = [],
  collapsed = false,
}: CarSelectorProps) => {
  const handleCarToggle = (carId: string) => {
    const newSelection = selectedCarIds.includes(carId)
      ? selectedCarIds.filter(id => id !== carId)
      : [...selectedCarIds, carId];
    onSelectionChange(newSelection);
  };

  // Sort cars to show recommended first, then affordable, then others
  const sortedCars = [...cars].sort((a, b) => {
    const aIsRecommended = recommendedCarIds.includes(a.id);
    const bIsRecommended = recommendedCarIds.includes(b.id);
    const aIsAffordable = affordableCarIds.includes(a.id);
    const bIsAffordable = affordableCarIds.includes(b.id);

    // Recommended cars first
    if (aIsRecommended && !bIsRecommended) return -1;
    if (!aIsRecommended && bIsRecommended) return 1;

    // Then affordable cars
    if (aIsAffordable && !bIsAffordable) return -1;
    if (!aIsAffordable && bIsAffordable) return 1;

    // Otherwise maintain original order
    return 0;
  });

  const categories = Array.from(new Set(sortedCars.map(car => car.category)));

  const getAffordabilityForCar = (car: Car) => {
    if (!userProfile || !financingOption) return null;
    
    const adjustedRate = getInterestRateForCreditScore(userProfile.creditScore, financingOption.interestRate);
    const adjustedOption = { ...financingOption, interestRate: adjustedRate };
    const totalDownPayment = userProfile.maxDownPayment + (userProfile.hasTradeIn ? userProfile.tradeInValue : 0);
    const adjustedDownPayment = Math.min(totalDownPayment, car.basePrice * 0.3);
    
    const calculated = calculateFinancing(car.basePrice, { ...adjustedOption, downPayment: adjustedDownPayment });
    return analyzeAffordability(calculated.monthlyPayment || 0, userProfile);
  };

  if (collapsed) {
    return (
      <div className="space-y-3">
        {categories.map(category => (
          <div key={category} className="space-y-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{category}</div>
            <div className="grid grid-cols-2 gap-2">
              {sortedCars
                .filter(car => car.category === category)
                .map(car => {
                  const isRecommended = recommendedCarIds.includes(car.id);
                  const isSelected = selectedCarIds.includes(car.id);
                  return (
                    <button
                      key={car.id}
                      onClick={() => handleCarToggle(car.id)}
                      className={`relative h-14 w-full rounded-md overflow-hidden border ${
                        isSelected ? 'ring-2 ring-primary border-primary' : ''
                      }`}
                      aria-pressed={isSelected}
                    >
                      <img src={car.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                      {isSelected && <div className="absolute inset-0 bg-primary/25" />}
                      {isRecommended && <span className="absolute top-1 left-1 h-1.5 w-1.5 rounded-full bg-green-500" />}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Vehicles</h2>
        <p className="text-muted-foreground text-sm">
          {recommendedCarIds.length > 0
            ? `Top ${recommendedCarIds.length} recommended for your profile`
            : "Choose one or more vehicles to compare"}
        </p>
      </div>

      {categories.map(category => (
        <div key={category}>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
            {category}
          </h3>
          <div className="space-y-2">
            {sortedCars
              .filter(car => car.category === category)
              .map(car => {
                const isRecommended = recommendedCarIds.includes(car.id);
                const isAffordable = affordableCarIds.includes(car.id);
                const affordability = getAffordabilityForCar(car);

                // Tags: Top 3 + Affordability (In Budget / Out of Budget)
                const tags: JSX.Element[] = [];
                if (isRecommended) {
                  tags.push(
                    <Badge key="top3" className="h-5 px-1.5 py-0 text-[10px] leading-none bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      Top 3
                    </Badge>
                  );
                }
                if (affordability) {
                  if (affordability.canAfford) {
                    tags.push(
                      <Badge key="inbudget" className="h-5 px-1.5 py-0 text-[10px] leading-none bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        In Budget
                      </Badge>
                    );
                  } else {
                    tags.push(
                      <Badge key="outbudget" variant="outline" className="h-5 px-1.5 py-0 text-[10px] leading-none text-muted-foreground border border-destructive/20">
                        Out of Budget
                      </Badge>
                    );
                  }
                }

                return (
                  <Card
                    key={car.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedCarIds.includes(car.id) ? 'border-primary bg-primary/5' : ''
                    } ${isRecommended ? 'border-green-500/50' : ''}`}
                    onClick={() => handleCarToggle(car.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={car.id}
                        checked={selectedCarIds.includes(car.id)}
                        onCheckedChange={() => handleCarToggle(car.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Label
                              htmlFor={car.id}
                              className="text-base font-semibold cursor-pointer"
                            >
                              {car.year} Toyota {car.name}
                            </Label>
                            {tags.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                {tags}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{car.model}</p>
                          <p className="text-lg font-bold mt-1">
                            ${car.basePrice.toLocaleString()}
                          </p>
                        </div>
                        <img
                          src={car.image}
                          alt={`${car.year} Toyota ${car.name}`}
                          className="w-24 h-16 object-cover rounded-md"
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};
