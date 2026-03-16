import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DealerSummary } from "./DealerList";

export function DealerDetail({
  dealer,
  onApply,
}: {
  dealer: DealerSummary;
  onApply: (payload: { dealerId: string; name: string; email: string; date?: string; time?: string }) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onApply({ dealerId: dealer.id, name, email, date, time });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div>
        <div className="text-lg font-semibold">{dealer.name}</div>
        <div className="text-sm text-muted-foreground">{dealer.city}{dealer.state ? `, ${dealer.state}` : ''}</div>
      </div>
      <div className="text-sm space-y-1">
        {dealer.phone && <div>Phone: <span className="text-muted-foreground">{dealer.phone}</span></div>}
        {dealer.url && (
          <div>
            Website: <a className="text-primary hover:underline" href={dealer.url} target="_blank" rel="noreferrer">Dealer site</a>
          </div>
        )}
      </div>

      {!done ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={submitting || !name || !email}>
            {submitting ? 'Submitting…' : 'Apply & Schedule'}
          </Button>
        </div>
      ) : (
        <div className="p-3 rounded-md border bg-muted text-sm">
          Application submitted to {dealer.name}. We’ll email confirmation and your appointment details.
        </div>
      )}
    </Card>
  );
}
