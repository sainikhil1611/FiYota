import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { groundedDealerSearch } from "@/utils/geminiMaps";
import { predictLoanApproval } from "@/utils/preApproval";
import type { UserFinancialProfile } from "@/types/userProfile";

export default function PreApproval() {
  // Minimal internal user profile (seeded defaults)
  const [profile, setProfile] = useState<UserFinancialProfile>({
    monthlyIncome: 5000,
    creditScore: 700,
    maxDownPayment: 3000,
    preferredMonthlyPayment: 400,
    hasTradeIn: false,
    tradeInValue: 0,
    financingType: 'finance',
    loanTerm: 60,
    interestRate: 6.0,
  });

  // Form state
  const [fullName, setFullName] = useState("Alex Driver");
  const [ssn, setSsn] = useState("000-00-0000");
  const [email, setEmail] = useState("alex.driver@example.com");
  const [phone, setPhone] = useState("(512) 555-0199");
  const [docs, setDocs] = useState<{ id: string; label: string; provided: boolean }[]>([
    { id: 'id', label: 'Government ID', provided: true },
    { id: 'address', label: 'Proof of Address', provided: true },
    { id: 'income', label: 'Income Verification', provided: true },
  ]);
  const [debts, setDebts] = useState({ cc: 150, student: 200, other: 0, housing: 1200 });
  const [consent, setConsent] = useState(false);
  const [zip, setZip] = useState<string>(() => localStorage.getItem('lastZip') || "78701");
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<{ id: string; name: string; url?: string } | null>(null);
  const [grounded, setGrounded] = useState<Array<{ title: string; uri: string }>>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [geoGrounded, setGeoGrounded] = useState<Array<{ title: string; uri: string; lat: number; lng: number }>>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  const base = useMemo(() => predictLoanApproval(profile, undefined), [profile]);
  const confidence = useMemo(() => {
    let score = base.approvalPercentage;
    // doc boosts
    score += docs.filter(d=>d.provided).length * 3;
    if (ssn) score += 5;
    // DTI adjustment
    const totalDebt = debts.cc + debts.student + debts.other + debts.housing;
    const income = Math.max(1, profile.monthlyIncome);
    const dti = totalDebt / income;
    if (dti < 0.25) score += 6; else if (dti < 0.35) score += 3; else if (dti > 0.45) score -= 6;
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [base, docs, ssn, debts, profile.monthlyIncome]);

  const [radius, setRadius] = useState<number>(25);
  const [scheduleFor, setScheduleFor] = useState<{ id: string; date: string; time: string } | null>(null);

  // Google Maps JS removed – we use OSM geocoding + Gemini Maps Grounding only

  // Geo helper: get lat/lng from ZIP using OpenStreetMap (no API key needed)
  const geocodeZip = async (zipCode: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(zipCode)}`, {
        headers: { 'Accept': 'application/json' }
      });
      const j = await r.json();
      if (Array.isArray(j) && j.length) {
        const { lat, lon } = j[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      }
    } catch {}
    return null;
  };

  // Geocode a place title to coordinates via OSM (best-effort)
  const geocodePlace = async (title: string, zipCode: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const q = `${title} near ${zipCode}`;
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`, { headers: { 'Accept': 'application/json' } });
      const j = await r.json();
      if (Array.isArray(j) && j.length) {
        return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) };
      }
    } catch {}
    return null;
  };

  const submitApplication = () => {
    if (!consent) return;
    // derive status: Submitted, Under Review, Pre-Approved
    let status: 'Pre-Approved' | 'Under Review' | 'Submitted';
    if (confidence >= 80) status = 'Pre-Approved';
    else if (confidence >= 55) status = 'Under Review';
    else status = 'Submitted';

    const app = {
      id: `${Date.now()}`,
      submittedAt: new Date().toISOString(),
      applicant: { fullName, email, phone, ssn: ssn ? '***-**-****' : '' },
      profile,
      dealer: selectedDealer,
      confidence,
      status,
    };
    const key = 'tfs_applications_v1';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift(app);
    localStorage.setItem(key, JSON.stringify(list));
    window.location.assign('/applications');
  };

  return (
    <div className="container mx-auto p-6 grid md:grid-cols-2 gap-6">
      {/* Left: Dealer locator */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Find Nearby Toyota Dealers</h2>
          <div className="grid grid-cols-3 gap-2 items-end">
            <div className="col-span-2"><Input placeholder="ZIP code" value={zip} onChange={(e)=>setZip(e.target.value)} /></div>
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={radius} onChange={(e)=>setRadius(Number(e.target.value))}>
              <option value={10}>10 mi</option>
              <option value={25}>25 mi</option>
              <option value={50}>50 mi</option>
            </select>
          </div>
          <div>
            <Button onClick={async ()=>{
              if (!zip || zip.trim().length < 5) return;
              setLoadingDealers(true);
              localStorage.setItem('lastZip', zip.trim());
              try {
                setErrorMsg("");
                const loc = await geocodeZip(zip.trim());
                const q = `Find Toyota dealerships within ${radius} miles of ZIP ${zip}. Return up to 8 options with Google Maps links.`;
                const gr = await groundedDealerSearch(q, loc?.lat, loc?.lng).catch((e)=>{ setErrorMsg(e?.message || 'Gemini request failed'); return { sources: [], text: ''}; });
                setGrounded(gr.sources || []);
                if (loc) setCenter(loc);
                // Geocode grounded items to coordinates for mapping
                const withGeo: Array<{ title: string; uri: string; lat: number; lng: number }> = [];
                for (const s of (gr.sources || []).slice(0, 12)) {
                  const g = await geocodePlace(s.title, zip.trim());
                  if (g) withGeo.push({ title: s.title, uri: s.uri, lat: g.lat, lng: g.lng });
                }
                setGeoGrounded(withGeo);
              } finally { setLoadingDealers(false); }
            }}>{loadingDealers ? 'Locating…' : 'Locate Dealers'}</Button>
          </div>
          <div className="text-xs text-muted-foreground">Hover a dealer to schedule or get directions.</div>
          {errorMsg && (<div className="text-xs text-red-600">{errorMsg}</div>)}
          {/* Results as cards (no map) */}
          <div className="mt-3 grid gap-2">
            {grounded.slice(0, 12).map((s) => (
              <div key={s.uri} className="rounded border p-3 flex items-center justify-between">
                <div className="text-sm font-medium truncate pr-2">{s.title}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild><a href={s.uri} target="_blank" rel="noreferrer">Open</a></Button>
                  <Button variant="outline" size="sm" onClick={()=>setScheduleFor({ id: s.uri, date: '', time: '' })}>Schedule</Button>
                </div>
              </div>
            ))}
            {grounded.length === 0 && (
              <div className="text-xs text-muted-foreground">No results yet. Try a different ZIP or radius, and ensure VITE_GEMINI_API_KEY is set.</div>
            )}
          </div>
          {scheduleFor && (
            <div className="rounded border p-3 space-y-2">
              <div className="text-sm font-medium">Schedule appointment</div>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={scheduleFor.date} onChange={(e)=>setScheduleFor(prev=>prev && { ...prev, date: e.target.value })} />
                <Input type="time" value={scheduleFor.time} onChange={(e)=>setScheduleFor(prev=>prev && { ...prev, time: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={()=>{ setScheduleFor(null); }}>Cancel</Button>
                <Button size="sm" onClick={()=>{ setScheduleFor(null); alert('Appointment requested. Dealer will confirm via email.'); }}>Confirm</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right: Form only */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Toyota Financial Services: Pre‑Approval Application</h2>
          <details open className="rounded border">
            <summary className="px-3 py-2 font-medium cursor-pointer">Personal & Contact Information</summary>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Full Legal Name" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
              <Input placeholder="Social Security Number (SSN)" value={ssn} onChange={(e)=>setSsn(e.target.value)} />
              <Input placeholder="Email Address" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <Input placeholder="Phone Number" value={phone} onChange={(e)=>setPhone(e.target.value)} />
              {docs.map(d => (
                <label key={d.id} className="inline-flex items-center gap-2">
                  <Input type="file" className="hidden" onChange={(e)=>{const ok=!!e.target.files?.[0]; setDocs(prev=>prev.map(x=>x.id===d.id?{...x,provided:ok}:x));}} />
                  <Button size="sm" variant={d.provided? 'default':'outline'}>{d.provided? `${d.label} ✓` : `Upload ${d.label}`}</Button>
                </label>
              ))}
            </div>
          </details>
          <details className="rounded border">
            <summary className="px-3 py-2 font-medium cursor-pointer">Employment, Income & Debts</summary>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Gross Monthly Income" type="number" value={profile.monthlyIncome} onChange={(e)=>setProfile({...profile, monthlyIncome: Number(e.target.value||0)})} />
              <Input placeholder="Preferred Monthly Payment" type="number" value={profile.preferredMonthlyPayment} onChange={(e)=>setProfile({...profile, preferredMonthlyPayment: Number(e.target.value||0)})} />
              <Input placeholder="Monthly Housing Payment" type="number" value={debts.housing} onChange={(e)=>setDebts({...debts, housing: Number(e.target.value||0)})} />
              <Input placeholder="Credit Card Payments (mo)" type="number" value={debts.cc} onChange={(e)=>setDebts({...debts, cc: Number(e.target.value||0)})} />
              <Input placeholder="Student Loans (mo)" type="number" value={debts.student} onChange={(e)=>setDebts({...debts, student: Number(e.target.value||0)})} />
              <Input placeholder="Other Loans (mo)" type="number" value={debts.other} onChange={(e)=>setDebts({...debts, other: Number(e.target.value||0)})} />
            </div>
          </details>
          <details className="rounded border">
            <summary className="px-3 py-2 font-medium cursor-pointer">Vehicle & Terms</summary>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Max Down Payment" type="number" value={profile.maxDownPayment} onChange={(e)=>setProfile({...profile, maxDownPayment: Number(e.target.value||0)})} />
              <Input placeholder="Loan Term (months)" type="number" value={profile.loanTerm} onChange={(e)=>setProfile({...profile, loanTerm: Number(e.target.value||0)})} />
              <Input placeholder="APR (%)" type="number" value={profile.interestRate} onChange={(e)=>setProfile({...profile, interestRate: Number(e.target.value||0)})} />
            </div>
          </details>
          <label className="text-sm inline-flex items-center gap-2"><input type="checkbox" checked={consent} onChange={(e)=>setConsent(e.target.checked)} /> I agree to the Privacy Policy and consent to a hard inquiry.</label>
          <Button className="w-full" disabled={!consent} onClick={submitApplication}>Submit Pre‑Approval</Button>
        </CardContent>
      </Card>
    </div>
  );
}
