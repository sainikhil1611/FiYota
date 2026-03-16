import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toyotaCars } from "@/data/cars";
import { getTop3RecommendedVehicles } from "@/utils/affordability";
import type { FinancingOption } from "@/types/car";

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Answers
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [creditScore, setCreditScore] = useState(720);
  const [downPayment, setDownPayment] = useState(5000);
  const [preferredPayment, setPreferredPayment] = useState(450);
  const [loanTerm, setLoanTerm] = useState(60);
  const [customTerm, setCustomTerm] = useState(60);
  const [hasTradeIn, setHasTradeIn] = useState(false);
  const [tradeInValue, setTradeInValue] = useState(0);
  const [drivingStyle, setDrivingStyle] = useState("commute");
  const [familySize, setFamilySize] = useState(1);
  const [eco, setEco] = useState("neutral");
  const [preference, setPreference] = useState<"finance" | "lease">("finance");

  useEffect(() => {
    // Reset custom term to a sensible default when preference changes
    setCustomTerm(preference === "lease" ? 36 : 60);
  }, [preference]);

  const interestGuess = useMemo(() => {
    // Simple heuristic for APR based on credit score
    if (creditScore >= 760) return 4.5;
    if (creditScore >= 700) return 5.5;
    if (creditScore >= 640) return 7.5;
    return 10.5;
  }, [creditScore]);

  const progressPct = useMemo(() => {
    const total = 4; // number of steps (flashcards)
    return Math.min(100, Math.max(0, Math.round((step / total) * 100)));
  }, [step]);

  // Live preview data
  const previewOption: FinancingOption = useMemo(() => ({
    type: preference,
    term: loanTerm,
    downPayment,
    interestRate: interestGuess,
  }), [preference, loanTerm, downPayment, interestGuess]);

  const currentProfile = useMemo(() => ({
    monthlyIncome,
    creditScore,
    maxDownPayment: downPayment,
    preferredMonthlyPayment: preferredPayment,
    hasTradeIn,
    tradeInValue,
    financingType: preference,
    loanTerm,
    interestRate: interestGuess,
  }), [monthlyIncome, creditScore, downPayment, preferredPayment, hasTradeIn, tradeInValue, preference, loanTerm, interestGuess]);

  const top3Ids = useMemo(() => getTop3RecommendedVehicles(toyotaCars as any[], currentProfile as any, previewOption), [currentProfile, previewOption]);
  const topCar = useMemo(() => toyotaCars.find(c => c.id === top3Ids[0]), [top3Ids]);

  const estimatedMonthly = useMemo(() => {
    if (!topCar) return 0;
    const principal = Math.max(0, topCar.basePrice - downPayment);
    const r = (interestGuess / 100) / 12;
    const n = loanTerm;
    if (r <= 0) return Math.round(principal / Math.max(1, n));
    const m = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(m);
  }, [topCar, downPayment, interestGuess, loanTerm]);

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => Math.max(1, s - 1));

  // Quick Start: apply a preset and immediately compute Top 3
  const applyPresetAndFinish = (preset: 'budget' | 'family' | 'student' | 'eco') => {
    if (preset === 'budget') {
      setMonthlyIncome(4500);
      setCreditScore(700);
      setDownPayment(2500);
      setPreferredPayment(350);
      setLoanTerm(60);
      setHasTradeIn(false);
      setTradeInValue(0);
      setDrivingStyle('commute');
      setFamilySize(2);
      setEco('neutral');
      setPreference('finance');
    } else if (preset === 'family') {
      setMonthlyIncome(8000);
      setCreditScore(720);
      setDownPayment(6000);
      setPreferredPayment(500);
      setLoanTerm(60);
      setHasTradeIn(true);
      setTradeInValue(4000);
      setDrivingStyle('commute');
      setFamilySize(4);
      setEco('neutral');
      setPreference('finance');
    } else if (preset === 'student') {
      setMonthlyIncome(3000);
      setCreditScore(680);
      setDownPayment(1000);
      setPreferredPayment(250);
      setLoanTerm(48);
      setHasTradeIn(false);
      setTradeInValue(0);
      setDrivingStyle('commute');
      setFamilySize(1);
      setEco('eco');
      setPreference('finance');
    } else if (preset === 'eco') {
      setMonthlyIncome(6500);
      setCreditScore(740);
      setDownPayment(5000);
      setPreferredPayment(450);
      setLoanTerm(60);
      setHasTradeIn(false);
      setTradeInValue(0);
      setDrivingStyle('commute');
      setFamilySize(2);
      setEco('eco');
      setPreference('finance');
    }
    // Slight delay to allow state to settle before finishing
    setTimeout(() => finish(), 0);
  };

  const finish = () => {
    const profile = {
      monthlyIncome,
      creditScore,
      maxDownPayment: downPayment,
      preferredMonthlyPayment: preferredPayment,
      hasTradeIn,
      tradeInValue,
      financingType: preference,
      loanTerm,
      interestRate: interestGuess,
    };

    const option: FinancingOption = {
      type: preference,
      term: loanTerm,
      downPayment,
      interestRate: interestGuess,
    };

    // Lightly bias toward SUVs for families, hybrids for eco
    const candidates = toyotaCars.filter((c) => {
      if (familySize >= 3 && !(c.category.includes("SUV") || c.name.includes("Sienna"))) return false;
      if (eco === "eco" && !(c.name.includes("Prius") || c.name.includes("Hybrid") || c.name.includes("Venza"))) return false;
      return true;
    });

    const recommended = getTop3RecommendedVehicles(candidates.length ? candidates : toyotaCars, profile as any, option);
    const preselect = recommended.slice(0, 3).join(",");

    const qs = new URLSearchParams();
    qs.set("preselect", preselect);
    qs.set("monthlyIncome", String(profile.monthlyIncome));
    qs.set("creditScore", String(profile.creditScore));
    qs.set("maxDownPayment", String(profile.maxDownPayment));
    qs.set("preferredMonthlyPayment", String(profile.preferredMonthlyPayment));
    qs.set("hasTradeIn", String(profile.hasTradeIn));
    qs.set("tradeInValue", String(profile.tradeInValue));
    qs.set("financingType", profile.financingType);
    qs.set("loanTerm", String(profile.loanTerm));
    qs.set("interestRate", String(profile.interestRate));

    navigate(`/dashboard?${qs.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Find your perfect Toyota</h1>
          <div className="text-sm text-muted-foreground">Step {step} / 4</div>
        </div>
        <div className="container mx-auto px-4 pb-3">
          <div className="h-1.5 w-full rounded bg-muted overflow-hidden">
            <div className="h-full bg-primary/60" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Start Presets */}
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-muted-foreground">Skip the quiz. Get instant picks:</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => applyPresetAndFinish('budget')}>Budget-Friendly</Button>
                <Button variant="outline" onClick={() => applyPresetAndFinish('family')}>Family</Button>
                <Button variant="outline" onClick={() => applyPresetAndFinish('student')}>Student</Button>
                <Button variant="outline" onClick={() => applyPresetAndFinish('eco')}>Eco</Button>
                <Button onClick={() => finish()}>Get My Top 3</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flashcards + Live Preview */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              {/* Left: Flashcards */}
              <div className="p-6 space-y-6">
                {step === 1 && (
                  <div className="animate-in fade-in slide-in-from-left-4">
                    <div className="rounded-xl bg-primary/5 p-6 border border-primary/10">
                      <h2 className="text-xl font-semibold mb-2">How do you want to pay?</h2>
                      <p className="text-sm text-muted-foreground mb-4">Pick one to continue</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-16 text-left justify-start" onClick={() => { setPreference('finance'); setStep(2); }}>Finance</Button>
                        <Button variant="outline" className="h-16 text-left justify-start" onClick={() => { setPreference('lease'); setStep(2); }}>Lease</Button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-in fade-in slide-in-from-left-4">
                    <div className="rounded-xl bg-primary/5 p-6 border border-primary/10">
                      <h2 className="text-xl font-semibold mb-2">What monthly budget feels right?</h2>
                      <p className="text-sm text-muted-foreground mb-4">Tap a range</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { label: '< $300', value: 275 },
                          { label: '$300–$450', value: 375 },
                          { label: '$450–$600', value: 525 },
                          { label: '$600+', value: 700 },
                        ].map(o => (
                          <Button key={o.label} variant="outline" className="h-14" onClick={() => { setPreferredPayment(o.value); setStep(3); }}>{o.label}</Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-in fade-in slide-in-from-left-4">
                    <div className="rounded-xl bg-primary/5 p-6 border border-primary/10">
                      <h2 className="text-xl font-semibold mb-2">What term works for you?</h2>
                      <p className="text-sm text-muted-foreground mb-4">Select your {preference === 'lease' ? 'lease' : 'loan'} term</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {(
                          preference === 'lease'
                            ? [
                                { label: '24 mo', value: 24 },
                                { label: '36 mo', value: 36 },
                                { label: '39 mo', value: 39 },
                                { label: '42 mo', value: 42 },
                                { label: '48 mo', value: 48 },
                              ]
                            : [
                                { label: '36 mo', value: 36 },
                                { label: '48 mo', value: 48 },
                                { label: '60 mo', value: 60 },
                                { label: '72 mo', value: 72 },
                              ]
                        ).map(o => (
                          <Button key={o.label} variant="outline" className="h-14" onClick={() => { setLoanTerm(o.value); setStep(4); }}>{o.label}</Button>
                        ))}
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Or pick a custom term</Label>
                          <div className="text-sm font-medium">{customTerm} months</div>
                        </div>
                        <Slider
                          value={[customTerm]}
                          onValueChange={(v) => setCustomTerm(v[0])}
                          min={preference === 'lease' ? 12 : 24}
                          max={preference === 'lease' ? 48 : 84}
                          step={preference === 'lease' ? 3 : 6}
                        />
                        <div className="flex justify-end">
                          <Button onClick={() => { setLoanTerm(customTerm); setStep(4); }}>Use this term</Button>
                        </div>
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button variant="ghost" onClick={prev}>Back</Button>
                        <Button variant="ghost" onClick={() => setStep(4)}>Continue</Button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="animate-in fade-in slide-in-from-left-4">
                    <div className="rounded-xl bg-primary/5 p-6 border border-primary/10">
                      <h2 className="text-xl font-semibold mb-2">How much upfront?</h2>
                      <p className="text-sm text-muted-foreground mb-4">Choose a down payment</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { label: '$0', value: 0 },
                          { label: '$1,000', value: 1000 },
                          { label: '$2,500', value: 2500 },
                          { label: '$5,000+', value: 5000 },
                        ].map(o => (
                          <Button key={o.label} variant="outline" className="h-14" onClick={() => { setDownPayment(o.value); finish(); }}>{o.label}</Button>
                        ))}
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button variant="ghost" onClick={prev}>Back</Button>
                        <Button onClick={finish}>Get My Top 3</Button>
                      </div>
                    </div>
                  </div>
                )}

                {step < 4 && (
                  <div className="flex items-center justify-between pt-2">
                    <Button variant="outline" onClick={prev} disabled={step === 1}>Back</Button>
                    <Button variant="ghost" onClick={finish}>Skip and see picks</Button>
                  </div>
                )}
              </div>

              {/* Right: Live Preview */}
              <div className="p-6 border-t md:border-t-0 md:border-l">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                  <div className="text-sm text-muted-foreground">Updates instantly as you tweak your inputs.</div>

                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">Est. monthly</div>
                        <div className="text-2xl font-bold">${estimatedMonthly.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Term</div>
                        <div className="font-medium">{loanTerm} mo • {interestGuess}% APR</div>
                      </div>
                    </div>
                    {topCar && (
                      <div className="mt-4 text-sm">
                        <div className="text-muted-foreground">Likely top pick</div>
                        <div className="font-medium">{topCar.year} Toyota {topCar.name}</div>
                      </div>
                    )}
                    {top3Ids.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {top3Ids.map(id => {
                          const c = toyotaCars.find(tc => tc.id === id);
                          return c ? (
                            <span key={id} className="text-xs rounded-full border px-2 py-0.5 bg-muted">{c.name}</span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  <Button className="w-full" onClick={finish}>Get My Top 3</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
