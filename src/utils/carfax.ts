export interface CarfaxListing {
  dealer: {
    carfaxId: string;
    dealerInventoryUrl?: string;
    dealerInventoryUrL?: string; // some responses use different casing
    name?: string;
    city?: string;
    state?: string;
    phone?: string;
  };
  vin?: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  mileage?: number;
  listPrice?: number;
  exteriorColor?: string;
  interiorColor?: string;
  fuelType?: string;
  image?: string;
  images?: {
    firstPhoto?: {
      large?: string;
    };
  };
  msrp?: number;
  monthlyPaymentEstimate?: {
    price?: number;
    downPaymentPercent?: number;
    interestRate?: number; // percent
    loanTerm?: number; // months
  };
}

export interface CarfaxSearchResponse {
  listings?: any[];
  page?: number;
  pageSize?: number;
  totalListingCount?: number;
}

const basePath = "/api/carfax";

export function normalizeModelForCarfax(model: string): string {
  const m = model.toLowerCase().replace(/\s+/g, "");
  // Common Toyota normalizations
  if (m.includes("rav4")) return "RAV4";
  if (m.includes("gr86")) return "GR86";
  if (m.includes("grsupra") || m.includes("supra")) return "GR Supra";
  if (m.includes("4runner") || m.includes("fourrunner")) return "4Runner";
  if (m.includes("priusprime")) return "Prius Prime";
  if (m.includes("corollacross")) return "Corolla Cross";
  return model.trim();
}

export async function fetchCarfaxVehicles(params: {
  zip: string;
  radius?: number;
  rows?: number;
  sort?: string;
  dynamicRadius?: boolean;
  vehicleCondition?: "NEW" | "USED" | "CERTIFIED";
  model?: string; // optional filter by model name
  mpgCombinedMin?: number;
  fetchImageLimit?: number;
  tpPositions?: string;
}): Promise<CarfaxListing[]> {
  const {
    zip,
    radius = 50,
    rows = 25,
    sort = "BEST",
    dynamicRadius = false,
    vehicleCondition = "NEW",
    model,
    mpgCombinedMin = 0,
    fetchImageLimit = 6,
    tpPositions = "1,2,3",
  } = params;

  const url = new URL(`${basePath}/search/v2/vehicles`, window.location.origin);
  url.searchParams.set("zip", zip);
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("sort", sort);
  url.searchParams.set("dynamicRadius", String(dynamicRadius));
  url.searchParams.set("vehicleCondition", vehicleCondition);
  url.searchParams.set("rows", String(rows));
  url.searchParams.set("mpgCombinedMin", String(mpgCombinedMin));
  url.searchParams.set("fetchImageLimit", String(fetchImageLimit));
  url.searchParams.set("tpPositions", tpPositions);
  if (model) {
    // Carfax supports filters like make/model via query in many endpoints; if unsupported, we'll filter client-side
    url.searchParams.set("model", normalizeModelForCarfax(model));
    url.searchParams.set("make", "Toyota");
  }

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Carfax request failed: ${res.status}`);
  const data: CarfaxSearchResponse = await res.json().catch(() => ({} as any));
  const listings: CarfaxListing[] = (data.listings || []).map((l: any) => ({
    dealer: l.dealer || {},
    vin: l.vin,
    year: l.year,
    make: l.make,
    model: l.model,
    trim: l.trim,
    mileage: l.mileage,
    listPrice: l.listPrice,
    msrp: l.msrp,
    exteriorColor: l.exteriorColor,
    interiorColor: l.interiorColor,
    fuelType: l.fuelType,
    image: l.image || l.primaryPhoto?.large || (Array.isArray(l.images) ? l.images?.[0] : undefined),
    images: l.images?.firstPhoto || l.primaryPhoto
      ? { firstPhoto: { large: l.images?.firstPhoto?.large || l.primaryPhoto?.large } }
      : undefined,
    monthlyPaymentEstimate: l.monthlyPaymentEstimate,
  }));

  // If server-side model filter didn't apply, do a light client-side filter
  const filtered = model ? listings.filter(x => (x.model || "").toLowerCase().includes(model.toLowerCase())) : listings;
  return filtered;
}
