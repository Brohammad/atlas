# Atlas

Browser-based classical ML track for working engineers. Learn regression and gradient descent by doing the arithmetic yourself—no `fit()` calls.

**Production:** https://atlas.brohammad.tech  
**Open path:** fit a line → gradient descent lab → six classical units (bias, two inputs, residuals, learning rate, mean baseline, target leakage).

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000. Progress lives in `sessionStorage` per unit.

## Verify

```bash
npm test    # locks answers and event allowlist (54 tests)
npm run lint
npm run build
```

CI runs the same on `main` (`.github/workflows/ci.yml`).

## Docs

| Doc | Purpose |
| --- | --- |
| [docs/roadmap/EXECUTION_ROADMAP.md](docs/roadmap/EXECUTION_ROADMAP.md) | What is shipped vs gated |
| [docs/curriculum/TRADITIONAL_ML_TRACK.md](docs/curriculum/TRADITIONAL_ML_TRACK.md) | Lesson math and outcomes |
| [docs/pilot/](docs/pilot/) | Pilot 001 facilitator packet |

## Events

Labs POST anonymous events to `/api/events`. Locally they append to `data/events.jsonl` (view `/review`). Vercel discards the file; cohort paste-back remains the production instrument (see `docs/product/PRODUCT_METRICS.md`).