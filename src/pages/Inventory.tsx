import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchCarfaxVehicles, CarfaxListing } from "@/utils/carfax";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function Inventory() {
  const [params, setParams] = useSearchParams();
  const [zip, setZip] = useState(params.get("zip") || "");
  const [model, setModel] = useState(params.get("model") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CarfaxListing[]>([]);

  const canSearch = useMemo(() => zip.trim().length >= 5, [zip]);

  const runSearch = async () => {
    if (!canSearch) return;
    setError(null);
    setLoading(true);
    try {
      const listings = await fetchCarfaxVehicles({
        zip: zip.trim(),
        model: model.trim() || undefined,
        radius: 50,
        rows: 25,
        vehicleCondition: "NEW",
      });
      setResults(listings);
      // reflect in URL
      const next = new URLSearchParams(params);
      next.set("zip", zip.trim());
      if (model.trim()) next.set("model", model.trim()); else next.delete("model");
      setParams(next, { replace: true });
    } catch (e: any) {
      setError(e?.message || "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // auto run if URL already has a zip
    if ((params.get("zip") || "").trim()) {
      runSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Nearby Inventory</h1>
            <p className="text-muted-foreground text-sm">Search Toyota vehicles available near your ZIP code.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
              <div className="sm:col-span-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" placeholder="75052" value={zip} onChange={(e) => setZip(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="model">Model (optional)</Label>
                <Input id="model" placeholder="Camry" value={model} onChange={(e) => setModel(e.target.value)} />
              </div>
              <div className="sm:col-span-1">
                <Button className="w-full" onClick={runSearch} disabled={!canSearch || loading}>
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, idx) => (
              <Card key={`${item.vin || idx}-${idx}`} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted overflow-hidden">
                    {item.images?.firstPhoto?.large ? (
                      <img src={item.images?.firstPhoto?.large} alt={`${item.year || ""} ${item.model || "Toyota"}`} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-semibold">
                      {item.year ? `${item.year} ` : ""}{item.make || "Toyota"} {item.model || "Vehicle"} {item.trim ? `• ${item.trim}` : ""}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.mileage ? `${item.mileage.toLocaleString()} mi • ` : ""}
                      {item.exteriorColor || "Exterior"}
                    </p>
                    {/* Price + MSRP with deal tag */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold">{item.listPrice ? `$${item.listPrice.toLocaleString()}` : "Ask for price"}</p>
                      {typeof item.msrp === 'number' && (
                        <span className="text-sm text-muted-foreground">MSRP ${item.msrp.toLocaleString()}</span>
                      )}
                      {typeof item.msrp === 'number' && typeof item.listPrice === 'number' && (
                        (() => {
                          const diff = item.listPrice - item.msrp;
                          const pct = item.msrp > 0 ? diff / item.msrp : 0;
                          let label = 'Fair Deal';
                          let cls = 'bg-amber-100 text-amber-700 border-amber-200';
                          if (pct <= -0.03) { label = 'Good Deal'; cls = 'bg-emerald-100 text-emerald-700 border-emerald-200'; }
                          else if (pct >= 0.03) { label = 'Above MSRP'; cls = 'bg-red-100 text-red-700 border-red-200'; }
                          return <span className={`text-xs px-2 py-0.5 rounded border ${cls}`}>{label}</span>;
                        })()
                      )}
                    </div>
                    {/* Estimated monthly payment */}
                    {(() => {
                      const price = typeof item.listPrice === 'number' ? item.listPrice : (typeof item.msrp === 'number' ? item.msrp : undefined);
                      if (!price) return null;
                      const est = (item as any).monthlyPaymentEstimate || {};
                      const rate = typeof est.interestRate === 'number' ? est.interestRate : 6.5;
                      const term = typeof est.loanTerm === 'number' ? est.loanTerm : 60;
                      const downPct = typeof est.downPaymentPercent === 'number' ? est.downPaymentPercent : 10;
                      const principal = price * (1 - downPct / 100);
                      const r = rate / 100 / 12;
                      const n = term;
                      const monthly = r > 0 ? principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : principal / Math.max(1, n);
                      return (
                        <div className="text-sm text-muted-foreground">Est. payment: <span className="font-medium text-foreground">${Math.round(monthly).toLocaleString()}</span> / mo • {term} mo @ {rate.toFixed(3)}% APR</div>
                      );
                    })()}
                    {item.dealer && (
                      <p className="text-sm text-muted-foreground">
                        Dealer: {item.dealer.name || item.dealer.carfaxId}
                        {item.dealer.city ? ` • ${item.dealer.city}, ${item.dealer.state || ""}` : ""}
                      </p>
                    )}
                    {item.dealer?.dealerInventoryUrl && (
                      <a className="text-sm text-primary hover:underline" href={item.dealer.dealerInventoryUrl} target="_blank" rel="noreferrer">
                        View on dealer site
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!loading && results.length === 0 && (
              <div className="text-muted-foreground">No vehicles found. Try a different ZIP, radius, or model.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
