# Fiyota Project Architecture and Logic

## Overview

Fiyota is a Vite + React (TypeScript) single-page application that helps users explore Toyota vehicles and make smarter financing choices. It provides a guided quiz, a data-driven dashboard with affordability and cost insights, and supporting flows like inventory, pre-approval, and applications.

## Tech Stack

- React 18 + TypeScript
- Vite (dev/build) with custom dev server and proxy
- Tailwind CSS + shadcn/ui (Radix primitives)
- React Router (client-side routing)
- @tanstack/react-query (provider ready for data fetching)
- Recharts (charts; used within dashboard components)

## Project Structure

```
src/
  App.tsx                # Router, app providers, and shared user profile state
  main.tsx               # React root mount
  components/            # UI components and layout
  data/                  # Static data (e.g., cars)
  hooks/                 # Custom hooks
  lib/                   # Lib utilities
  pages/                 # Route pages (Landing, Quiz, Dashboard, etc.)
  types/                 # TypeScript types
  utils/                 # Affordability and financing logic
public/                  # Static assets
vercel.json              # Production rewrites (proxy + SPA fallback)
vite.config.ts           # Dev server config and API proxy
```

### Key Files

- `src/App.tsx`
  - Sets up providers: `QueryClientProvider`, `TooltipProvider`, toaster components.
  - Configures routes using `react-router-dom`:
    - `/` → `Landing`
    - `/dashboard` → `Index` (main dashboard)
    - `/quiz` → `Quiz` (guided onboarding)
    - `/inventory` → `Inventory`
    - `/preapproval` → `PreApproval`
    - `/applications` → `Applications`
    - `/profile` → `Profile`
    - `*` → `NotFound`
  - Holds shared `userProfile` state and passes it to relevant pages.

- `src/pages/`
  - `Landing.tsx` — Marketing-style entry, navigation into flows.
  - `Quiz.tsx` — Guided quiz to gather payment preference, budget, term, down payment.
  - `Index.tsx` — Dashboard with charts and comparisons; uses utilities to compute values.
  - `Inventory.tsx` — Browse vehicle data from `data/cars.ts`.
  - `PreApproval.tsx` — Client-side heuristic scoring for approval likelihood.
  - `Applications.tsx` — Placeholder/applications workflow UI.
  - `Profile.tsx` — Edit user financial profile.
  - `NotFound.tsx` — Catch-all 404.

- `src/utils/`
  - `affordability.ts` — Affordability scores, recommendations, income/payment ratios.
  - `financing.ts` — Payment amortization, equity over time, depreciation, sensitivity.

- `src/data/`
  - `cars.ts` — Static Toyota vehicle list with basic pricing and attributes.

- `vite.config.ts`
  - Dev server runs on port `5000`.
  - Proxy: `/api/carfax` → `https://helix.carfax.com` (path rewritten).

- `vercel.json`
  - Rewrite `/api/carfax/*` → Carfax Helix API.
  - SPA fallback: all non-API paths → `/index.html` for client routing.

## Routing and Navigation

- The app is an SPA; routes are handled in `src/App.tsx` using `BrowserRouter`.
- Vercel serves `index.html` for all non-API routes (see `vercel.json`) to prevent production 404s when deep-linking.
- In development, Vite handles client routing automatically.

## Core Logic

### User Profile State

- Defined in `src/App.tsx` (`userProfile`):
  - `monthlyIncome`, `creditScore`, `maxDownPayment`, `preferredMonthlyPayment`, `hasTradeIn`, `tradeInValue`, `financingType`, `loanTerm`, `interestRate`.
- Passed to `Index` (dashboard) and `Profile`; other flows derive or update parts of it transiently.

### Quiz Flow (`src/pages/Quiz.tsx`)

- 4-step guided flow with a live preview panel on the right.
  1) Payment preference: `finance` or `lease`.
  2) Monthly budget: quick ranges.
  3) Term selection: preference-based options plus a custom slider.
     - Lease quick options: 24, 36, 39, 42, 48 months.
     - Finance quick options: 36, 48, 60, 72 months.
     - Slider (always visible):
       - Lease range: 12–48 (step 3)
       - Finance range: 24–84 (step 6)
     - Selecting an option or “Use this term” proceeds to step 4.
  4) Down payment: quick amount options, or “Get My Top 3”.
- Live preview uses `loanTerm`, `downPayment`, and a credit-score-based APR heuristic to estimate monthly payment.
- On completion, navigates to `/dashboard` with query parameters reflecting the user’s selections.

### Dashboard Logic (`src/pages/Index.tsx`)

- Consumes selected cars (`data/cars.ts`), user profile, and per-car financing options.
- Uses utilities:
  - `getTop3RecommendedVehicles(...)` (from `utils/affordability.ts`) to recommend cars.
  - Financing calculations (from `utils/financing.ts`) to compute:
    - Monthly payments (amortization)
    - Total cost
    - Equity build
    - Depreciation curve
    - Down payment sensitivity
- Renders multiple charts (Recharts) and control panels to adjust terms per vehicle.

## Data and Utilities

- All data is in-memory on the client. There’s no backend by default.
- `data/cars.ts` contains key vehicle attributes (price, category, etc.).
- `utils/financing.ts` implements the math for payments, equity, and depreciation.
- `utils/affordability.ts` provides affordability scoring and recommendation logic.

## API Proxying

- Development: `vite.config.ts` proxies `GET/POST /api/carfax/*` → `https://helix.carfax.com/*` (rewrites path).
- Production (Vercel): `vercel.json` contains an equivalent rewrite so the same relative path works in prod.

## Environment Variables

- Chat/AI features may rely on an API key (e.g., Google Gemini) if enabled in the UI flow.
- Typical setup (optional):
  - `.env.local` in project root (gitignored)
  - Example: `VITE_GEMINI_API_KEY=...`

## Development

- Start: `npm run dev` → Vite on `http://localhost:5000`
- Lint: `npm run lint`
- Build: `npm run build` → `dist/`

## Deployment

- Deploy static build to Vercel.
- Ensure `vercel.json` includes:
  - Carfax proxy rewrite: `/api/carfax/(.*)` → `https://helix.carfax.com/$1`
  - SPA fallback rewrite: `/((?!api).*)` → `/index.html`

## Notes and Conventions

- UI components built with shadcn/ui; Tailwind for styling.
- Routing paths defined centrally in `src/App.tsx`.
- Keep API interactions behind `/api/*` to benefit from proxy behavior in both dev and prod.
- All critical calculations live in `utils/` for reuse and single-source-of-truth.
