# Reconciliation: curriculum audit ↔ shipped Atlas lab

**Date:** 14 November 2026 (IST)  
**Audit refs:** AUD-052, AUD-016, AUD-024, AUD-050; lesson **TML-M02-L006**  
**Shipped product:** `/lab` (`components/lab-app.tsx`, `lib/descent.ts`, `lib/step-expr.ts`)

## Executive summary

| Topic | Audit finding | Shipped Atlas status |
|---|---|---|
| Lab contract pinned to build chunk | AUD-052 **medium** | **Mitigated in repo:** `docs/audit/gradient_descent_lab.SOURCE_OF_TRUTH.md` pins TypeScript sources |
| M02 items vs lab overlap / transfer | AUD-024, AUD-016 **medium** | **Partial:** `/lab` covers 1D bowls; **`/classical/rate`** covers learning rate on line loss; M02 bank items are broader (2D, coding) |
| No lesson body for M02 | AUD-050 **high** | **True for JSON track**; Atlas has track copy in components + `TRADITIONAL_ML_TRACK.md`, not a M02 lesson body |
| Four step checks vs numeric gate | AUD-052 narrative | **Documented:** behavior checks in `checkStepSource`; regression adds exact numeric check |

**No learner-facing code changed** in this reconciliation import.

## AUD-052: contract pinning

**Audit issue:** `traditional_ml/labs/gradient_descent_lab.contract.json` referenced `/_next/static/immutable/chunks/....js` and omitted behaviors (audit cites “11 differences,” including behavior-only step checks).

**Action taken in this repo:**

1. Added **`docs/audit/gradient_descent_lab.SOURCE_OF_TRUTH.md`** listing bowls, stages, events, and step grading from source.
2. Recorded that **`retention_run`** is allowlisted but not emitted (matches D-00 / architecture docs).

**Still requires SME (cannot close in import alone):**

- The original `gradient_descent_lab.contract.json` is **not in this repository**; the “11 differences” list lives in the external repo report the auditor cited. When `traditional_ml/` is checked in, regenerate the JSON contract from the SOURCE_OF_TRUTH doc and diff explicitly (AT-027).

**Step-check verification (14 Nov 2026, against `lib/step-expr.ts`):**

| Expression | `checkStepSource` |
|---|---|
| `w - lr * grad` | Pass |
| `w + lr * (-grad)` | Pass (equivalent descent) |
| `w - lr * grad * 0.5` | Pass (half-step; behavior-only) |
| `w + lr * grad` | Fail |
| `w + grad` | Fail |

So outright **ascent** updates fail the four behavior tests. The audit’s “non-descent” wording may refer to **equivalent forms** or to **stricter** expectations in M02 Q011’s public tests (see below). Regression **`regressionCodeNote`** still enforces the exact descent numeric on the worked partial — stricter than Apply alone.

## M02-L006 ↔ shipped surfaces

| M02 audit theme | JSON bank (not in repo) | Shipped Atlas analogue |
|---|---|---|
| 1D bowl predict / experiment / debug | Q003–Q005, Q009 (lab-aligned) | `/lab` stages |
| Learning rate on regression loss | Q007–Q008 style | `/classical/rate` (`lib/rate.ts`) |
| Batch GD / MSE / stopping | Q001, Q008, Q012 | **Not shipped** (out of scope for `/lab`) |
| Coding `step` with hidden tests | Q009, Q011–Q013 | `step-expr` + regression code station |
| 2D conditioning / zig-zag paths | Q001, Q008 | **Not in `/lab`** (1D bowls only) |

**AUD-024 (Q009 = exact lab case):** True for the **JSON** lab contract the bank was written against. Shipped `/lab` does not expose the same cases as M02 Q009 until banks and UI are unified.

**AUD-050 (no M02 lesson body):** The audit’s “only instruction is the lab” applies to the **curriculum product** under `traditional_ml/`. Atlas learners also have prose in sitting components and `docs/curriculum/TRADITIONAL_ML_TRACK.md`, but there is still **no** M02-L006 lesson page equivalent to a full lesson body.

## Pilot lesson scorecards (audit summary)

| Lesson | High defects (audit) | Relevance to shipped Atlas |
|---|---|---|
| M01-L002 | 4 | **None today** — matrix bank not published |
| M02-L006 | 5 | **Alignment work** — lab + rate unit; see above |
| M06-L008 | 6 | **None today** — leakage unit not built (roadmap C-04) |

Overall audit: **6 pass / 20 concern / 9 fail** on question scorecards; **not SME-approved**.

## Recommended engineering follow-ups (owner)

| ID | Action | Blocks |
|---|---|---|
| AT-027 | Add `traditional_ml/labs/gradient_descent_lab.contract.json` generated from SOURCE_OF_TRUTH | `traditional_ml/` tree in repo |
| — | Apply `proposed_patches/` per README after SME on flagged items | Question bank files |
| — | Do **not** merge M02 coding items with Atlas `/lab` until step-test semantics are agreed | AUD-052 SME |

See `PATCH_APPLICATION_STATUS.md` in this folder.