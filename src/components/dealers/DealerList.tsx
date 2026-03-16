import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CarfaxListing } from "@/utils/carfax";

export interface DealerSummary {
  id: string;
  name: string;
  city?: string;
  state?: string;
  phone?: string;
  url?: string;
}

export function DealerList({
  listings,
  onSelect,
  selectedId,
}: {
  listings: CarfaxListing[];
  onSelect: (dealer: DealerSummary) => void;
  selectedId?: string;
}) {
  const dealers = useMemo<DealerSummary[]>(() => {
    const map = new Map<string, DealerSummary>();
    for (const l of listings) {
      const id = l.dealer?.carfaxId || `${l.dealer?.name}-${l.dealer?.city}`;
      if (!id) continue;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: l.dealer?.name || "Toyota Dealer",
          city: l.dealer?.city,
          state: l.dealer?.state,
          phone: l.dealer?.phone,
          url: l.dealer?.dealerInventoryUrl || l.dealer?.dealerInventoryUrL,
        });
      }
    }
    return Array.from(map.values());
  }, [listings]);

  if (!dealers.length) {
    return <div className="text-sm text-muted-foreground">No dealers found. Try a different ZIP or radius.</div>;
  }

  return (
    <div className="space-y-2">
      {dealers.map((d) => (
        <Card key={d.id} className={`p-3 flex items-center justify-between ${selectedId === d.id ? 'border-primary' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-muted grid place-items-center text-xs font-semibold">
              {d.name.split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-muted-foreground">{d.city}{d.state ? `, ${d.state}` : ''}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {d.phone && <span className="text-xs text-muted-foreground hidden sm:inline">{d.phone}</span>}
            <Button variant="outline" size="sm" onClick={() => onSelect(d)}>{selectedId === d.id ? 'Hide' : 'View'}</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
