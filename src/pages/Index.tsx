import { useEffect, useState } from "react";
import { toyotaCars } from "@/data/cars";
import { CarSelector } from "@/components/CarSelector";
import { ChartNavigation, ChartView } from "@/components/ChartNavigation";
import { PriceComparisonChart } from "@/components/charts/PriceComparisonChart";
import { MonthlyPaymentChart } from "@/components/charts/MonthlyPaymentChart";
import { TotalCostChart } from "@/components/charts/TotalCostChart";
import { SavingsChart } from "@/components/charts/SavingsChart";
import { LeaseVsFinanceComparison } from "@/components/charts/LeaseVsFinanceComparison";
import { AffordabilityGaugeChart } from "@/components/charts/AffordabilityGaugeChart";
import { EquityBuildChart } from "@/components/charts/EquityBuildChart";
import { CreditScoreImpactChart } from "@/components/charts/CreditScoreImpactChart";
import { DownPaymentSensitivityChart } from "@/components/charts/DownPaymentSensitivityChart";
import { DepreciationCurveChart } from "@/components/charts/DepreciationCurveChart";
import { ChatButton } from "@/components/ChatButton";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ProfileButton } from "@/components/ProfileButton";
import { recommendVehicles, getTop3RecommendedVehicles } from "@/utils/affordability";
import { FinancingOption } from "@/types/car";
import { UserFinancialProfile } from "@/types/userProfile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface IndexProps {
  userProfile: UserFinancialProfile;
  onProfileChange: (profile: UserFinancialProfile) => void;
}

const Index = ({ userProfile, onProfileChange }: IndexProps) => {
  const [selectedCarIds, setSelectedCarIds] = useState<string[]>([]);
  const [activeViews, setActiveViews] = useState<ChartView[]>([
    'monthly',
    'total',
    'comparison',
    'depreciation',
    'affordability',
  ]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [zip, setZip] = useState("");
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);

  const selectedCars = toyotaCars.filter(car => selectedCarIds.includes(car.id));

  // Onboarding handoff: read query params to preselect cars and update profile (top-level hook)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const preselect = sp.get("preselect");
    if (preselect) {
      const ids = preselect.split(",").map(s => s.trim()).filter(Boolean);
      setSelectedCarIds(ids);
    }

    const maybeNumber = (k: string) => {
      const v = sp.get(k);
      return v != null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : null;
    };
    const maybeBool = (k: string) => {
      const v = sp.get(k);
      return v === "true" ? true : v === "false" ? false : null;
    };
    const nextProfile = { ...userProfile };
    const monthlyIncomeN = maybeNumber("monthlyIncome");
    if (monthlyIncomeN !== null) nextProfile.monthlyIncome = monthlyIncomeN;
    const creditScoreN = maybeNumber("creditScore");
    if (creditScoreN !== null) nextProfile.creditScore = creditScoreN;
    const maxDownPaymentN = maybeNumber("maxDownPayment");
    if (maxDownPaymentN !== null) nextProfile.maxDownPayment = maxDownPaymentN;
    const preferredMonthlyPaymentN = maybeNumber("preferredMonthlyPayment");
    if (preferredMonthlyPaymentN !== null) nextProfile.preferredMonthlyPayment = preferredMonthlyPaymentN;
    const hasTradeInB = maybeBool("hasTradeIn");
    if (hasTradeInB !== null) nextProfile.hasTradeIn = hasTradeInB;
    const tradeInValueN = maybeNumber("tradeInValue");
    if (tradeInValueN !== null) nextProfile.tradeInValue = tradeInValueN;
    const loanTermN = maybeNumber("loanTerm");
    if (loanTermN !== null) nextProfile.loanTerm = loanTermN;
    const interestRateN = maybeNumber("interestRate");
    if (interestRateN !== null) nextProfile.interestRate = interestRateN;
    const financingType = sp.get("financingType") as any;
    if (financingType === "finance" || financingType === "lease") nextProfile.financingType = financingType;

    if ([monthlyIncomeN, creditScoreN, maxDownPaymentN, preferredMonthlyPaymentN, hasTradeInB, tradeInValueN, loanTermN, interestRateN, financingType].some(v => v !== null && v !== undefined)) {
      onProfileChange(nextProfile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create financing options map from user profile (applies to all vehicles)
  const carFinancingOptions = new Map<string, { lease: FinancingOption; finance: FinancingOption }>();
  selectedCars.forEach(car => {
    const leaseOption: FinancingOption = {
      type: 'lease',
      term: userProfile.loanTerm > 48 ? 36 : userProfile.loanTerm, // Cap lease at 48
      downPayment: userProfile.maxDownPayment,
      interestRate: userProfile.interestRate > 10 ? 7 : userProfile.interestRate,
    };
    const financeOption: FinancingOption = {
      type: 'finance',
      term: userProfile.loanTerm,
      downPayment: userProfile.maxDownPayment,
      interestRate: userProfile.interestRate,
    };
    carFinancingOptions.set(car.id, { lease: leaseOption, finance: financeOption });
  });

  // For affordability recommendations, use the current financing type from profile
  const currentFinancingOption: FinancingOption = {
    type: userProfile.financingType,
    term: userProfile.loanTerm,
    downPayment: userProfile.maxDownPayment,
    interestRate: userProfile.interestRate,
  };
  const recommendedCarIds = getTop3RecommendedVehicles(toyotaCars, userProfile, currentFinancingOption);
  const allAffordableCarIds = recommendVehicles(toyotaCars, userProfile, currentFinancingOption);

  const renderChart = (view: ChartView) => {
    switch (view) {
      case 'price':
        return <PriceComparisonChart cars={selectedCars} />;
      case 'monthly':
        return (
          <MonthlyPaymentChart
            cars={selectedCars}
            carFinancingOptions={carFinancingOptions}
          />
        );
      case 'comparison':
        return (
          <LeaseVsFinanceComparison
            cars={selectedCars}
            carFinancingOptions={carFinancingOptions}
          />
        );
      case 'total':
        return (
          <TotalCostChart
            cars={selectedCars}
            carFinancingOptions={carFinancingOptions}
          />
        );
      case 'savings':
        return (
          <SavingsChart
            cars={selectedCars}
            carFinancingOptions={carFinancingOptions}
          />
        );
      // New Financial Insight Charts
      case 'affordability':
        return (
          <AffordabilityGaugeChart
            cars={selectedCars}
            carFinancingOptions={carFinancingOptions}
            userProfile={userProfile}
            financingType="finance"
          />
        );
      case 'equity':
        return (
          <EquityBuildChart
            cars={selectedCars}
            carFinancingOptions={carFinancingOptions}
          />
        );
      case 'creditImpact':
        return (
          <CreditScoreImpactChart
            cars={selectedCars}
            carFinancingOptions={carFinancingOptions}
            userProfile={userProfile}
          />
        );
      case 'downPayment':
        return (
          <DownPaymentSensitivityChart
            cars={selectedCars}
            carFinancingOptions={carFinancingOptions}
          />
        );
      case 'depreciation':
        return <DepreciationCurveChart cars={selectedCars} />;
      default:
        return <PriceComparisonChart cars={selectedCars} />;
    }
  };

  const getGridCols = () => {
    const count = activeViews.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (count === 3) return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
    return 'grid-cols-1 lg:grid-cols-2';
  };

  // Compute the top suggested model name (family) for convenience
  const topSuggested = (() => {
    const topId = recommendedCarIds[0];
    const car = toyotaCars.find(c => c.id === topId);
    return car?.name || "";
  })();

  const goToInventory = () => {
    if (!zip || zip.trim().length < 5) return;
    const params = new URLSearchParams();
    params.set("zip", zip.trim());
    if (topSuggested) params.set("model", topSuggested);
    navigate(`/inventory?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-20">
        <div className="px-4 py-4 flex items-center justify-between gap-4">
          <div className="ml-2">
            <h1 className="text-3xl font-bold">
              <span className="text-primary">TOYOTA</span> Vehicle Comparison Tool
            </h1>
            <p className="text-muted-foreground mt-1">
              Compare prices, payments, and financing options
            </p>
          </div>
          <div className="mr-4 flex items-end gap-2">
            <div className="hidden md:block text-sm mr-2">
              <label htmlFor="zip-top" className="block text-muted-foreground">ZIP code</label>
              <Input id="zip-top" placeholder="Enter ZIP" value={zip} onChange={(e) => setZip(e.target.value)} className="w-40" />
            </div>
            <Button onClick={goToInventory} disabled={!zip || zip.trim().length < 5}>
              Find nearby inventory{topSuggested ? ` • ${topSuggested}` : ""}
            </Button>
            <ProfileButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex w-full">
        {/* Sidebar */}
        <aside
          className={`${collapsed ? 'w-28' : 'w-96'} border-r bg-card transition-[width] duration-300`}
          onMouseEnter={() => setCollapsed(false)}
          onMouseLeave={() => setCollapsed(true)}
        >
          <ScrollArea className="h-[calc(100vh-73px)]">
            <div className={`${collapsed ? 'p-2' : 'p-6'} space-y-6`}>
              <CarSelector
                cars={toyotaCars}
                selectedCarIds={selectedCarIds}
                onSelectionChange={setSelectedCarIds}
                userProfile={userProfile}
                financingOption={currentFinancingOption}
                recommendedCarIds={recommendedCarIds}
                affordableCarIds={allAffordableCarIds}
                collapsed={collapsed}
              />
            </div>
          </ScrollArea>
        </aside>

        {/* Main Area */}
        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-73px)]">
            <div className="container mx-auto p-6 space-y-6">
              {selectedCars.length === 0 ? (
                <div className="flex items-center justify-center h-[60vh]">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Select vehicles to compare</h2>
                    <p className="text-muted-foreground">
                      Choose one or more vehicles from the sidebar to view detailed comparisons
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    <ChartNavigation
                      activeViews={activeViews}
                      onViewsChange={setActiveViews}
                    />

                    <div className={`grid ${getGridCols()} gap-6`}>
                      {activeViews.map(view => (
                        <div key={view}>
                          {renderChart(view)}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* Chat Button */}
      <ChatButton onClick={() => setIsChatOpen(true)} />

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        context={{
          selectedCars,
          userProfile,
          financingOptions: carFinancingOptions,
        }}
      />
    </div>
  );
};

export default Index;
