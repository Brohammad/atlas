# Architecture

Inspected from the repo at the regression-and-residuals build. Stack actually in `package.json`: Next.js 16.4.6, React 19.3, TypeScript, Tailwind 4.3. The brief's FastAPI, Postgres, NumPy, scikit-learn, Plotly, and Pyodide are not installed. Do not add them to look like the brief.

## Shape

A Next.js App Router site. Lessons are data plus pure functions in `lib/`. Client components render questions, charts, and the one code box. `next.config.ts` enables `cacheComponents` and `partialPrefetching`. Routes that touch `sessionStorage` load their client with `ssr: false`, because the server cannot see that storage.

```
app/                 routes and POST /api/events
components/          sittings and the map
lib/                 math, questions, graders, tests
data/events.jsonl    local only, gitignored
```

There is one deployable service: this app on Vercel, alias `atlas.brohammad.tech`. No worker, no database, no queue.

## Source of truth

| Concern | Where |
|---|---|
| Bowl, step, stability | `lib/descent.ts` |
| Restricted Python step | `lib/step-expr.ts` evaluates a subset in the browser. There is no Python process |
| Line, bias, two inputs, residuals | `lib/line.ts`, `lib/classical.ts`, `lib/two.ts`, `lib/resid.ts` |
| Module inventory | `classicalModules` in `lib/classical.ts`. `status: "open"` is only `regression`. `lessons` counts are inventory metadata. The map does not render them |
| Progress | `sessionStorage` keys listed in `USER_JOURNEYS.md` |
| Events | `lib/browser-log.ts` posts JSON. `app/api/events/route.ts` allowlists names, then appends a file and ignores write failures |

Tests are `node --experimental-strip-types --test` on the `lib/*.test.ts` files. They recompute the published answers. They do not drive a browser.

## Decisions already embodied, and worth keeping

- Math in TypeScript so a unit cannot drift from its test. A later Flutter client imports the same rules or ports them from these files. It does not grow a second formula.
- Grading in the client for the cohort, with the answer key visible to anyone who reads the bundle. Stated limitation, not an accident to paper over with obscurity.
- One expression language for code, with a behavior check and an exact numeric check. That is enough until a unit needs arrays.
- Closed modules are data for the map's "not open" list, not routes.
- Anonymous events. No account table.

## Defects that are architectural

1. **Allowlist.** The route accepts the gradient-descent names (`session_started`, `pre_answer`, `experiment_run`, `retention_run`, and the rest in `NAMES`). It rejects `line_started`, `line_answer`, `regression_started`, `regression_answer`, `regression_code`, `two_started`, `two_answer`, `resid_started`, and `resid_answer`, which the sittings send. Those responses are 400. `sendEvent` swallows the failure. The ML track is silent even on a developer machine.
2. **Production log.** The `catch` around `appendFile` is deliberate. Serverless disks do not keep the file. Any metric that cites production events is invented.
3. **Retention versus `sessionStorage`.** The seven-day rule in `lib/descent.ts` and the persistence mechanism contradict each other.
4. **Copy that denies shipped routes.** Unit 1 and unit 2 endings tell the learner the next unit is closed.
5. **No enforced prerequisite.** Routes are independent. The curriculum order is documentary only.

## What we will not introduce on a hunch

| Proposal | When it becomes rational |
|---|---|
| Postgres or Neon | The pasted-result pilot fails, or progress must survive a second device |
| Auth | Same moment as the database, not before |
| Pyodide | A unit needs NumPy semantics the expression grader cannot score. The step station does not |
| FastAPI | A Python grader has to run off the browser. That is the same trigger as Pyodide, and we would pick one of them |
| Plotly | The loss chart is already a small component. A second chart library for one curve is overhead |
| Redis, microservices, an analytics vendor | Not for 20 people |
| A lesson engine that renders the 140-count inventory | The inventory is not the product. Hand-built units are slow on purpose |

## Change rule

A new unit adds a `lib` module, a test that locks every answer from the raw points, a client sitting, a route, and a card on the map. It does not add a service. If the unit cannot be graded by the existing question runner or the step grader, extend that runner once, in a way the previous units still pass.
