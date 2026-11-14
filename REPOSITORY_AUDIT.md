# Repository audit — Project Atlas

**Auditor role:** Staff engineer engineering audit  
**Date:** 14 November 2026 (Asia/Calcutta)  
**Scope:** Full read of `/agent/repos/atlas` (71 tracked source files, all `app/`, `components/`, `lib/`, `docs/`). No application code was changed.  
**Verification run:** `npm test` — 41 tests, 0 failures; `npm run build` — success; `npm run lint` — success (after `npm ci`).

## Reference materials used for comparison

| Supplied label | Authoritative in-repo source | Notes |
|---|---|---|
| Phase 3.5 backlog | `docs/roadmap/EXECUTION_ROADMAP.md` | No file named “Phase 3.5 backlog” exists in the repository; milestones M0–M4 and task IDs (A-01, F-02, …) are taken from the execution roadmap. |
| Question schemas | `docs/curriculum/LESSON_DESIGN_STANDARD.md` + `lib/lesson.ts` (`Question`, `Option`) | Concrete schema is TypeScript types plus the design standard’s field list. |
| Gradient descent lab contract | `docs/curriculum/TRADITIONAL_ML_TRACK.md` (Gradient descent), `docs/product/PRD.md`, `lib/descent.ts`, `lib/lesson.ts`, `components/lab-app.tsx` | Runtime behavior is the union of curriculum spec and lab UI. |
| Repository inspection report | `docs/architecture/PRODUCT_ARCHITECTURE.md` | Dated “regression-and-residuals build”; several claims are **stale** versus current `main` (called out below). |

**Status legend:** **Implemented** · **Partial** · **Missing** · **Unverified** (not exercised in this audit run).

---

## 1. Application architecture

### Stack (implemented)

| Layer | Choice | Evidence |
|---|---|---|
| Framework | Next.js 16.4.6 App Router | `package.json`, `app/` |
| UI | React 19.3, Tailwind CSS 4.3 | `package.json`, `globals.css` |
| Language | TypeScript 5 | `tsconfig.json` |
| Deploy target | Single Vercel app (`atlas.brohammad.tech` per docs) | PRD, reply strings in `lib/*` |
| Tests | Node built-in test runner, `--experimental-strip-types` | `package.json` `test` script |

**Not installed (by design, per architecture doc):** FastAPI, Postgres/Neon, NumPy, scikit-learn, Plotly, Pyodide, Redis, auth.

### Shape (implemented)

```
app/           Routes + POST /api/events
components/    Client “sittings” (labs), loaders (dynamic import, ssr: false)
lib/           Pure math, question arrays, graders, sessionStorage helpers
data/          events.jsonl (local only, gitignored)
```

- **One deployable unit** — no worker, queue, or database.
- **next.config.ts** — `cacheComponents: true`, `partialPrefetching: true`, Turbopack CSS rule.

### Rendering model (implemented)

- Interactive lessons: thin Server Component `page.tsx` → `*Loader` → `dynamic(..., { ssr: false })` → client lab.
- **Exception:** `/design` imports `DesignBoard` directly (client boundary without `ssr: false`).
- **Exception:** `/review` — async RSC, `connection()`, reads `data/events.jsonl` locally; static “no log on Vercel” branch when `VERCEL` is set.

### Stale architecture doc items

`PRODUCT_ARCHITECTURE.md` still states ML sitting events are rejected by the API. **Current code is implemented:** `app/api/events/route.ts` allowlists gradient-descent and ML event names. `lib/events.test.ts` asserts 204 for ML names only — gradient-descent names are **unverified** in tests (see §6).

---

## 2. Lesson experiences and routes

### Route inventory

| Route | Page | Primary UI | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | `WebPage` | Front door: line vs gradient descent vs classical track |
| `/beginner` | `app/beginner/page.tsx` | `BeginnerLab` | Fit a line (no bias), 6 MCQ stations |
| `/lab` | `app/lab/page.tsx` | `Lab` (`lab-app.tsx`) | Gradient descent lab |
| `/classical` | `app/classical/page.tsx` | `ClassicalMap` | Track hub, 4 regression units + closed module titles |
| `/classical/regression` | … | `ClassicalLab` | Bias + partial + code step |
| `/classical/two` | … | `TwoLab` | Two features, partial attribution |
| `/classical/residuals` | … | `ResidLab` | Residuals vs loss |
| `/classical/rate` | … | `RateLab` | Learning rate on line loss |
| `/design` | `app/design/page.tsx` | `DesignBoard` | Internal design mock (**unlinked** per PRD) |
| `/review` | `app/review/page.tsx` | `PilotTable` | Local pilot log (GD-focused aggregation) |
| `POST /api/events` | `app/api/events/route.ts` | — | Anonymous event append |

**Build output:** 14 app routes; `/review` is Partial Prerender; `/api/events` is dynamic.

### Intended learner path (documented)

`USER_JOURNEYS.md`: line → gradient descent → bias → two inputs → residuals → learning rate → (baseline, leak — not built).

### Chain links (implemented in result screens)

| From | Condition | Next |
|---|---|---|
| `/beginner` | Cleared | `/lab` |
| `/lab` | Cleared | `/classical/regression` |
| `/classical/regression` | Cleared | `/classical/two` |
| `/classical/two` | Cleared | `/classical/residuals` |
| `/classical/residuals` | Cleared | `/classical/rate` |
| `/classical/rate` | Cleared | `/classical` only (end of open track) |

### Path enforcement (missing)

- **Partial:** Endings link forward when a unit clears; **no guard** blocks opening later URLs first (`USER_JOURNEYS.md`, `PRODUCT_ARCHITECTURE.md`).
- **Partial:** Home (`WebPage`) still exposes multiple doors (line, lab, classical/regression) — not a single forced sequence (`PRD` open decision #3).

### Retention station (partial vs contract)

- **PRD** still lists “seven-day retention bowl” in the gradient-descent row.
- **Runtime:** `lab-app.tsx` maps stored `stage: "retention"` → `"results"` on load; no `RetentionStage` UI; `retention_run` is allowlisted but **no emitter** in components (grep: only `route.ts`).
- **Math:** `retentionBowl`, `retentionDue`, `daysSince` in `lib/descent.ts` — **implemented** and tested.

### Roadmap vs reality: learning-rate unit

`EXECUTION_ROADMAP.md` Milestone 3 describes the rate unit as future work. **`/classical/rate` + `lib/rate.ts` + `RateLab` are implemented** on `main`. Curriculum doc `TRADITIONAL_ML_TRACK.md` documents the unit. Roadmap is **stale** for M3 F-03 / C-02 / T-02.

---

## 3. Lesson and question content architecture

### Question schema (implemented)

From `lib/lesson.ts`:

```ts
type Option = { id: string; text: string };
type Question = {
  setup?: string;
  label?: string;
  prompt: string;
  options: Option[];
  answer: string;  // option id
  idea: string;
};
```

`LESSON_DESIGN_STANDARD.md` adds authoring rules (four options, procedure-based distractors, ideas use learner numbers, node tests lock answers).

### Content modules (implemented)

| Unit | `lib` module | Stations | MCQ count | Special stations |
|---|---|---|---|---|
| Fit a line | `line.ts` | 6 | 6 | — |
| Gradient descent (lab) | `lesson.ts` + `descent.ts` | UI stages | 11 MCQ items in arrays + interactives | experiment, debug, apply (code) |
| Regression | `classical.ts` | 8 | 7 | `code` via `step-expr` |
| Two inputs | `two.ts` | 5 | 5 | — |
| Residuals | `resid.ts` | 5 | 5 | — |
| Learning rate | `rate.ts` | 5 | 3 | `lines`, `unseen` → `"pass"` / numeric runs |

### Module inventory (partial)

- `classicalModules` — 12 modules, **only `regression` status `open`**; `lessons: 12` counts are metadata, not rendered lesson bodies (`LESSON_DESIGN_STANDARD.md` rule 9).
- Map shows 4 regression units; does not surface 140-lesson fiction — **implemented**.

### Gaps vs question standard

| Gap | Status |
|---|---|
| `lesson.ts` pre/post/predict/understand answers not locked in dedicated tests | **Partial** (`descent.test.ts` covers debug + predict trajectories only) |
| `two.test.ts` does not assert four unique options per question | **Partial** (other unit tests do) |
| G4 “unseen item outside bundle” for cohort | **Missing** (no delivery mechanism) |
| Distractor selection analytics (rule 7 in design standard) | **Missing** (no cohort data) |

---

## 4. Gradient descent lab implementation

### Contract (curriculum)

`TRADITIONAL_ML_TRACK.md`: bowl `L(w) = (k/2)(w−μ)²`, update `w ← w − η∇L`, stable `0 < η < 2/k`; stations include pre-check, prediction, 10-step experiments (flat/steep), debug (divergence `1→−2→4→−8` and uphill step), restricted step function, unseen bowl, retention bowl.

### Engine (`lib/descent.ts`) — implemented

- Bowls: `teachBowl`, `flatBowl`, `steepBowl`, `debugBowl`, `debugOscBowl`, `unseenBowl`, `retentionBowl`.
- `EXPERIMENT_STEPS = 10`, `LOSS_OK = 0.05`, `runDescent`, `runWithStepFn`, `reachedLoss`, stability helpers.

### UI flow (`components/lab-app.tsx`) — partial vs full contract

| Contract station | UI | Status |
|---|---|---|
| Pre-check | `pre` → `preQuestions` (3) | **Implemented** |
| Post-check | `post` → `postQuestions` (3) | **Implemented** |
| One-step prediction | `predict` + `predictItems` / `predictQuestions` | **Implemented** |
| Understand slope | `understand` (1 MCQ) | **Implemented** (extra vs bullet list) |
| Experiment flat + steep | `experiment`, pass if loss &lt; 0.05 after 10 steps | **Implemented** |
| Debug diverging + uphill | `debug` + `debugQuestions` | **Implemented** |
| Write `step(w, grad, lr)` | `apply` + `step-expr.ts` | **Implemented** |
| Unseen bowl | `apply` runs on `unseenBowl` | **Implemented** |
| Seven-day retention bowl | No navigable stage; legacy fields on `Progress` | **Partial** (math + allowlist only) |
| Retention on visible run | Removed from progression (`retention` → `results` on load) | **Implemented** per M2 D-01 intent |

**Track UI:** Five capability stations (`understand`, `predict`, `experiment`, `debug`, `apply`); pre/post sit outside the 5-station bar.

**Clearing rule:** `clearedCount` requires understand, all predict, both experiments passed, all debug, `applyPassed` — pre/post scores shown on results but not in `clearedCount` (**documented behavior**, verify against product intent: **unverified**).

### Step grader (`lib/step-expr.ts`) — implemented

Restricted expression language; `checkStepSource` (behavior) + numeric check against descent in regression/`apply` contexts. Tested in `descent.test.ts` and `classical.test.ts`.

---

## 5. Persistence and analytics

### Progress (implemented, client-only)

| Key | Unit |
|---|---|
| `atlas.gd.v1` | Gradient descent |
| `atlas.line.v1` | Beginner line |
| `atlas.reg.v1` | Regression |
| `atlas.two.v1` | Two inputs |
| `atlas.resid.v1` | Residuals |
| `atlas.rate.v1` | Learning rate |
| `atlas.<domain>.started.<uuid>` | Once-per-session analytics flags |

**Missing:** cross-device resume, week-long retention, accounts.

### Events (partial)

- **Client:** `lib/browser-log.ts` — fire-and-forget POST.
- **Server:** UUID session, name allowlist (~27 names), append JSONL; write failures swallowed on Vercel.
- **Tests:** ML names accepted; unknown rejected — **gradient-descent names unverified** in `events.test.ts`.
- **`/review`:** Aggregates GD events (`lesson_completed`, `pre_answer`, etc.) only — **partial** for ML pilot.

### Cohort metrics (`PRODUCT_METRICS.md`)

- Primary: pasted reply strings (`*Reply()` in each `lib` module) — **implemented**.
- Production finish rate from events — **missing** (ephemeral FS).
- G4 transfer item — **missing**.
- G5 return within 7 days — **missing** (storage + product).

### Doc drift

`PRODUCT_METRICS.md` line 37 still says ML events “the route currently rejects” — **stale**; route accepts them.

---

## 6. Testing and validation

### Implemented

| Suite | Focus |
|---|---|
| `descent.test.ts` | GD math, predict trajectories, experiments, retention timing, step-expr |
| `line.test.ts` | SSE math, locked answers |
| `classical.test.ts` | Regression math, code step, modules, locked answers |
| `two.test.ts` | Two-feature math, locked answers |
| `resid.test.ts` | Residual math, locked answers |
| `rate.test.ts` | Bowl–line equivalence, trajectories, locked answers |
| `events.test.ts` | API allowlist (ML subset) |

**Count:** 41 tests (roadmap “33 tests” is stale).

### Missing / unverified

| Area | Status |
|---|---|
| Browser / E2E (Playwright, etc.) | **Missing** |
| Component tests | **Missing** |
| `browser-log` payload tests | **Missing** |
| Run helpers (`parse*`, `*Cleared`, `*Misses`, `*Reply`) | **Missing** (except indirect use) |
| Full event allowlist regression test | **Partial** |
| CI configuration in repo | **Unverified** (no `.github/workflows` in tree) |
| Accessibility audit (390px) | **Unverified** (docs claim; not measured in this audit) |

---

## 7. Missing infrastructure for Traditional ML curriculum

Against `TRADITIONAL_ML_TRACK.md` “Not built” and `EXECUTION_ROADMAP.md` later milestones:

| Capability | Status | Notes |
|---|---|---|
| Mean baseline unit | **Missing** | Specified in track doc |
| Train/test leak unit | **Missing** | Specified after baseline |
| Closed-form normal equations check | **Missing** | Named as future regression content |
| Feature scaling station | **Missing** | Named for two-input follow-up |
| Classification and modules 3–12 | **Missing** | `classicalModules` `later` |
| House-price / tabular project | **Missing** | PRD explicitly out |
| Pyodide / NumPy runtime | **Missing** | Not required for current units |
| Durable event store (B-01) | **Missing** | P2 until paste-back fails |
| Auth + server progress (B-02) | **Missing** | G5 / multi-device |
| Lesson content engine / CMS | **Missing** | Hand-built `lib` modules by design |
| Mastery model beyond per-unit clear | **Missing** | Design standard acknowledges limit |
| G4 delivery channel (unpublished item) | **Missing** | Product gate |
| Pilot script artifact (P-01) | **Partial** | Pilot paragraph in roadmap, not a separate script file |
| Enforced prerequisites / single front door (F-02) | **Partial** | Links exist; guards and home merge incomplete |

---

## 8. Backlog alignment snapshot (EXECUTION_ROADMAP)

| Task | Roadmap claim | Current `main` |
|---|---|---|
| A-01 ML events allowlist | To do | **Implemented** |
| F-01 unit → next links | To do | **Implemented** |
| P-01 pilot ask script | To do | **Partial** (roadmap note only) |
| T-01 tests green | To do | **Implemented** (41 passing) |
| F-02 one path from home | To do | **Partial** |
| D-01 retention off run | To do | **Implemented** (UI); PRD table **stale** |
| C-02 / F-03 / T-02 rate unit | Future M3 | **Implemented** (ahead of roadmap) |
| C-03 baseline | Future | **Missing** |
| B-01 durable events | P2 | **Missing** |

---

## 9. Summary matrix

| Area | Overall |
|---|---|
| Architecture | **Implemented** (intentionally minimal) |
| Playable regression path (6 surfaces) | **Implemented** |
| Gradient descent lab (core stations) | **Implemented**; retention **Partial** |
| Content/schema discipline | **Implemented** with test gaps on `lesson.ts` |
| Analytics / evidence for cohort | **Partial** |
| Full Traditional ML track | **Missing** (4 of 12 modules’ first units only; 2 spec units not built) |
| Docs vs code | **Partial** (architecture, metrics, roadmap, PRD retention row) |

---

*This audit did not modify application routes or code. Items marked **unverified** require a follow-up run (browser pass at 390px, CI inspection, or cohort pilot).*