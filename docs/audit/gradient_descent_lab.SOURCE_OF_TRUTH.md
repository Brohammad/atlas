# Gradient descent lab — implementation source of truth

Replaces pinning the lab to a minified Next.js chunk (audit **AUD-052**). For curriculum authors and M02-L006 alignment only; learners use `/lab`.

**Canonical implementation (code, not bundle hash):**

| Concern | File |
|---|---|
| Bowls, steps, loss threshold | `lib/descent.ts` |
| Pre/post/debug MCQ copy | `lib/lesson.ts` |
| Stage UI, experiments, apply | `components/lab-app.tsx` |
| `def step(w, grad, lr)` grader | `lib/step-expr.ts` |
| Answer locks | `lib/descent.test.ts` |

Pedagogy summary: `docs/curriculum/TRADITIONAL_ML_TRACK.md` (Gradient descent section).

## Visible stage machine (`components/lab-app.tsx`)

Order: `pre` → `understand` → `predict` → `experiment` → `debug` → `apply` → `post` → `results`.

Five-station track: understand, predict, experiment, debug, apply (pre/post outside the bar).

**Retention:** No navigable seven-day station; stored `stage: "retention"` loads as `results`. `retentionBowl` / `retentionDue` remain in `lib/descent.ts` for tests only. API allows `retention_run`; **no client emits it**.

## Bowls and pass rules (`lib/descent.ts`)

- Loss: `L(w) = (k/2)(w − μ)²`; gradient `k(w − μ)`; update in sim: `w ← w − η ∇L` (plus `ascent` mode in debug).
- Experiment: `flatBowl`, `steepBowl`, `EXPERIMENT_STEPS = 10`, `LOSS_OK = 0.05`.
- Apply unseen: `unseenBowl`, `APPLY_STEPS = 12`, up to 3 runs after behavior checks pass.
- Debug oscillation: `debugOscBowl`, rate `1.5` → trace `1, −2, 4, −8` (test-locked).

## Step function grading (`lib/step-expr.ts`)

**Behavior (`checkStepSource`)** — four checks:

1. Positive `grad` → next `w` **smaller** than current.
2. Negative `grad` → next `w` **larger**.
3. Zero `grad` → `w` unchanged.
4. Larger `lr` → larger move magnitude (same sign as case 1).

**Not required by behavior checks:** exact formula `w − lr * grad`. A half-step `w - lr * grad * 0.5` can pass behavior.

**Apply stage:** behavior must pass; then unseen bowl must reach `loss < LOSS_OK`.

**Regression unit (`/classical/regression`):** after behavior, `regressionCodeNote` requires **numeric match** to one descent step (`w − lr × ∂L/∂w` on the worked partial). That stricter gate is intentional (classical-lab).

## Telemetry (`ALLOWED_EVENT_NAMES`)

Gradient-descent sitting: `session_started`, `hint`, `pre_answer`, `understand_answer`, `predict_answer`, `experiment_run`, `experiment_submit`, `debug_open`, `debug_answer`, `apply_check`, `apply_run`, `post_answer`, `lesson_completed`.

## Deliberate omissions vs full M02-L006 bank

The shipped lab is a **1D scalar bowl** sitting. It does **not** include:

- Batch MSE over datasets or NumPy training loops (M02 Q001, Q008, Q012 topics).
- Multi-dimensional conditioning or 2D loss surfaces (M02 Q001).
- Tolerance-based early stopping beyond fixed step counts.
- Importable Python sandboxes for coding items in the JSON bank.

Those belong to the future `traditional_ml/` M02 lesson body + items, or to later Atlas units — not invented here.

## Maintenance rule (AT-027)

When changing lab behavior, update this file and `lib/descent.test.ts` in the same change. When `traditional_ml/labs/gradient_descent_lab.contract.json` is added to the repo, regenerate it from these sources — do not pin `_next/static/...` chunks.