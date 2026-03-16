import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AppItem {
  id: string;
  submittedAt: string;
  applicant: { fullName: string; email: string; phone: string; ssn?: string };
  profile: any;
  confidence: number;
  status: 'Pre-Approved' | 'Under Review' | 'Needs Info';
}

export default function Applications() {
  const [apps, setApps] = useState<AppItem[]>([]);

  useEffect(() => {
    const key = 'tfs_applications_v1';
    const list: AppItem[] = JSON.parse(localStorage.getItem(key) || '[]');
    setApps(list);
  }, []);

  const badge = (s: AppItem['status']) => s === 'Pre-Approved' ? 'bg-emerald-100 text-emerald-700' : s === 'Under Review' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h2 className="text-lg font-semibold">Pre‑Approval Applications</h2>
      {apps.length === 0 ? (
        <div className="text-sm text-muted-foreground">No applications yet. Submit one from the Pre‑Approval page.</div>
      ) : (
        <div className="grid gap-3">
          {apps.map(a => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.applicant.fullName || 'Applicant'} <span className="text-xs text-muted-foreground">({new Date(a.submittedAt).toLocaleString()})</span></div>
                  <div className="text-sm text-muted-foreground">Confidence: {a.confidence}% • {a.applicant.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded border ${badge(a.status)}`}>{a.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
