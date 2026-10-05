# ADHD Indicator Screener

A research-based ADHD screening aid -- **not a diagnosis**. Combines two
validated questionnaires (ASRS-v1.1 Part A, WURS-25) with three objective
browser tasks (go/no-go CPT, stop-signal task, 2-back) and reports each
indicator's level against literature-informed norms, every claim traced to a
citation.

## Stack

- **`packages/core`** -- framework-agnostic TS: types, stats primitives,
  norms/citations, questionnaire item banks, task trial generation +
  scoring, and `computeIndicators()`. No build step; consumed as source by
  both apps below. Has its own vitest suite (42 tests).
- **`apps/api`** -- Express + Mongoose + JWT (httpOnly cookie) auth. Scores
  every submitted session server-side via `@adhd-screener/core` and
  persists it per-user in MongoDB.
- **`apps/web`** -- React + Tailwind + React Router. Runs the timed tasks
  client-side (needs real keyboard/timing), then posts raw trial data to the
  API. Dashboard shows a `recharts` trend of every objective indicator's
  z-score across a user's past screenings.

## Running it locally

```bash
docker compose up -d mongo          # MongoDB on localhost:27017
npm install                         # installs all 3 workspaces
cp apps/api/.env.example apps/api/.env   # fill in a real JWT_SECRET
npm run dev:api                     # http://localhost:4000
npm run dev:web                     # http://localhost:5173
```

Open http://localhost:5173, create an account, and run a screening.

## Tests / typecheck / build

```bash
npm run test         # packages/core vitest suite
npm run typecheck     # all 3 workspaces
npm run build         # apps/web production build
```

## Known gaps (stated here, not hidden)

- The three tasks are custom browser implementations, not clinically normed
  instruments (e.g. Conners CPT-3, TOVA) -- comparison norms in
  `packages/core/src/data/norms.ts` are literature-informed estimates, not
  exact normative tables. Said explicitly in the report UI, not just here.
- `npm audit` currently reports moderate/high advisories in dev-only
  tooling (esbuild's dev-server CORS behavior, tailwind's file watcher,
  vitest's mocker, react-router's `<Link>` redirect handling) -- all fixable
  via major-version bumps not yet taken. None affect what ships to a user;
  worth revisiting before any real deployment.
