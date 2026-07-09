# Fiyota

A Vite + React (TypeScript) single-page app that helps users explore Toyota
vehicles and make smarter financing choices: a guided quiz, a data-driven
dashboard with affordability/cost insights (Recharts), and supporting flows
for inventory, pre-approval, and applications. Built with shadcn/ui (Radix
primitives) + Tailwind CSS, react-router-dom for client-side routing, and
TanStack Query. It optionally calls Google's Gemini API client-side for an
in-app financing chatbot and grounded dealer search. There is no backend —
it's a pure static SPA (originally generated with Lovable.dev) that calls
third-party APIs directly from the browser, with a `/api/carfax/*` reverse
proxy for the Carfax Helix API.

## Quick start (devcontainer — recommended)

1. Prereqs: [Docker](https://docs.docker.com/get-docker/), [VS Code](https://code.visualstudio.com/) + the "Dev Containers" extension.
2. Open this folder in VS Code → "Reopen in Container" when prompted.
3. `cp .env.example .env` and fill in values (see table below) — optional, the app runs without it.
4. Run: `npm run dev` → open http://localhost:5000

## Manual setup (no devcontainer)

```bash
npm ci
cp .env.example .env   # optional, fill in VITE_GEMINI_API_KEY if you want the chatbot/dealer search
npm run dev             # http://localhost:5000
```

Other commands: `npm run build` (production build to `dist/`), `npm run lint`, `npm run preview`.

## Environment variables

| Variable | Required | Purpose | Where to get it |
|---|---|---|---|
| `VITE_GEMINI_API_KEY` | No | Powers the in-app financing chatbot (`src/utils/geminiService.ts`) and grounded dealer search (`src/utils/geminiMaps.ts`). Without it, these features degrade gracefully (chat disabled, warning logged). | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `VITE_GEMINI_MODEL` | No | Overrides the Gemini model used for grounded dealer search. Falls back to `gemini-2.5-flash`, then `gemini-2.5-pro`. | N/A (Gemini model name) |

These are Vite `VITE_*` build-time variables, not runtime server config — see
"Known limitations" below for what that means.

## Testing

No automated tests exist in this project (no test script in `package.json`,
no test files). Verification is done via `npm run build` succeeding and
manual/container smoke checks (see Deployment below).

## Deployment

Build the production image, passing the Gemini key as a build arg:
`docker build --build-arg VITE_GEMINI_API_KEY=your_api_key -t fiyota .`
(optionally also `--build-arg VITE_GEMINI_MODEL=your_model`)
Run it: `docker run -p 8080:80 fiyota` → open http://localhost:8080

Note: `.env` is excluded from the build context by `.dockerignore` (by
design, to avoid baking arbitrary local env files into images), so a local
`.env` file is never read at `docker build` time and `--env-file` at
`docker run` time has no effect on the Gemini key — `VITE_GEMINI_API_KEY`
is baked into the JS bundle at *build* time via the `--build-arg` above
(see "Known limitations" below for why that means the key is effectively
public once deployed). The build succeeds without the build arg too; the
app just runs with the chatbot/Gemini features disabled.

This container runs on any host (Fly.io, Render, a VPS with Docker) — see
[DEPLOYMENT.md](../DEPLOYMENT.md) in the Projects root for the full walkthrough.

The production image serves the built `dist/` via nginx (`nginx.conf`),
which replicates `vercel.json`'s two rewrites: an SPA catch-all
(`try_files $uri /index.html`) for client-side routing, and a
`/api/carfax/` reverse proxy to `https://helix.carfax.com/` (this location
is matched before the catch-all, since nginx picks the longest-matching
prefix location regardless of file order).

## Known limitations

- **The Gemini API key is exposed client-side.** This app has no backend —
  `VITE_GEMINI_API_KEY` is read via `import.meta.env` and, because Vite
  inlines all `VITE_*` variables into the built JS bundle, the key ships
  inside `dist/assets/*.js` in plain text. Anyone who loads the deployed app
  can extract it from browser devtools or the network tab. This is inherent
  to the current architecture (no serverless/backend proxy in front of
  Gemini), not a bug introduced by containerization — fixing it properly
  would require adding a backend endpoint that holds the key server-side
  and proxies requests on the app's behalf. Do not use a Gemini key with
  billing limits you aren't comfortable having scraped and abused; treat
  any key configured here as effectively public once deployed.
- `src/utils/geminiMaps.ts` additionally passes the key as a URL query
  string (`?key=...`) to `generativelanguage.googleapis.com`, which is more
  likely to leak via logs/referrers than header-based auth — same root
  cause as above, not independently fixed here.
- The Gemini-backed chatbot and grounded dealer search are unverified
  end-to-end in this pass — verifying them requires a real
  `VITE_GEMINI_API_KEY`, which was not available. Without a key, the app
  runs and degrades gracefully (chat disabled, console warning).
- `src/pages/PreApproval.tsx` calls `https://nominatim.openstreetmap.org`
  directly from the browser with no custom `User-Agent` header, which
  Nominatim's usage policy requires; under sustained load this could get
  the deploying host's outbound IP rate-limited. Not fixed here (fine for
  normal/low-volume use).
- The Carfax reverse proxy (`/api/carfax/*` → `https://helix.carfax.com/*`)
  was verified to genuinely forward requests (the response comes from
  Carfax's server, not the SPA fallback), but the app-level feature behind
  it was not exercised — no Carfax API key was found in the codebase, so
  it's unclear whether the endpoint is public or expects auth Carfax-side.
- `npm audit` reports 16 vulnerabilities (6 moderate, 10 high) in
  dependencies as of this pass; not remediated here (dependency upgrades
  are outside this task's scope — flagged for follow-up).
- No automated test suite exists (see Testing above).

## Architecture notes

<details>
<summary>Project structure, routing, and core logic (click to expand)</summary>

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
nginx.conf                # Production (container) rewrites, mirrors vercel.json
```

**Routing** (`src/App.tsx`, `react-router-dom` `BrowserRouter`): `/` → `Landing`,
`/dashboard` → `Index` (main dashboard), `/quiz` → `Quiz` (guided onboarding),
`/inventory` → `Inventory`, `/preapproval` → `PreApproval`, `/applications` →
`Applications`, `/profile` → `Profile`, `*` → `NotFound`. Shared `userProfile`
state (`monthlyIncome`, `creditScore`, `maxDownPayment`,
`preferredMonthlyPayment`, `hasTradeIn`, `tradeInValue`, `financingType`,
`loanTerm`, `interestRate`) lives in `App.tsx` and is passed to `Index` and
`Profile`.

**Quiz flow** (`src/pages/Quiz.tsx`): 4-step guided flow (payment
preference → monthly budget → term selection → down payment) with a live
preview panel that estimates monthly payment from `loanTerm`, `downPayment`,
and a credit-score-based APR heuristic. Navigates to `/dashboard` with query
params reflecting the selections on completion.

**Dashboard** (`src/pages/Index.tsx`): consumes selected cars
(`data/cars.ts`), the user profile, and per-car financing options; uses
`getTop3RecommendedVehicles` (`utils/affordability.ts`) for recommendations
and `utils/financing.ts` for amortization, total cost, equity build,
depreciation, and down-payment sensitivity. Renders Recharts charts and
per-vehicle controls.

**API proxying**: dev (`vite.config.ts`) proxies `/api/carfax/*` →
`https://helix.carfax.com/*`; production uses the equivalent rewrite in
`vercel.json` (Vercel deploys) or `nginx.conf` (this container image).

All data is in-memory/client-side; there is no backend or database.

</details>
