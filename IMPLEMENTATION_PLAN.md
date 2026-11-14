# Implementation plan — Project Atlas

**Date:** 14 November 2026 (Asia/Calcutta)  
**Inputs:** `REPOSITORY_AUDIT.md`, `docs/roadmap/EXECUTION_ROADMAP.md`, product/curriculum docs, current `main` codebase.  
**Constraint:** No application code changes in the audit turn; this plan sequences **next** engineering work without inventing completed features.

---

## Executive summary

Atlas has a **shippable regression learning path** (line → gradient descent → four classical units, including learning rate). The blocking gap for a 20-person pilot is **evidence and narrative consistency**, not another lesson: finalize the ask-back protocol, close doc/code drift, harden analytics tests, and complete “one path” UX without removing routes.

**Do not** open baseline, leak, classification, or platform infrastructure until **G1–G3** signal from pasted replies (per `PRODUCT_METRICS.md`).

---

## Phase 0 — Documentation and contract sync (no new pedagogy)

**Goal:** Single source of truth matches deployment.

| ID | Work | Priority | Complexity | Acceptance |
|---|---|---|---|---|
| D-00 | Update `PRODUCT_ARCHITECTURE.md`, `PRODUCT_METRICS.md`, `EXECUTION_ROADMAP.md`, PRD gradient-descent row for: ML events allowlist, rate unit shipped, test count 41, retention off-run | P0 | S | No contradictory “rejects ML events” / “rate not built” / “seven-day bowl on run” |
| D-01 | Add `docs/pilot/PILOT_ASK.md` from roadmap P-01 (URL, reply sentence, one miss question) | P0 | S | File exists; linked from roadmap |
| T-00 | Extend `lib/events.test.ts` to assert **all** names in `route.ts` `NAMES` (GD + ML), one rejection | P0 | S | Test fails if allowlist drifts |
| T-01 | Optional: parametrized tests for `parse*` / `*Cleared` on one module, replicate pattern | P1 | S | Prevents scoring regressions |

**Application code:** documentation and tests only — no route deletion.

---

## Phase 1 — Pilot-ready (Milestone 1 completion)

**Goal:** A stranger can finish the open path and the team can score G1–G3 with pasted replies.

| ID | Work | Priority | Depends | Complexity | Acceptance |
|---|---|---|---|---|---|
| P-01 | Ship pilot ask (`PILOT_ASK.md`) and send to first five engineers | P0 | D-01 | S | Five replies filed |
| F-02 | **One path UX** without removing deep links: home copy + primary CTA favors line → lab → track; secondary links labeled “skip to …” | P1 | None | M | Fresh session can walk all six surfaces via endings; home defaults to line |
| A-02 | `/review` or a sibling **ML session summary** (read same JSONL, group `regression_*`, `line_*`, etc.) | P2 | T-00 | M | Local dev shows ML session rows |
| Q-01 | Lock `lesson.ts` answer keys in `lesson.test.ts` (mirror other units) | P1 | None | S | All GD MCQ answers covered |

**Explicit non-work:** Postgres, auth, new units, Flutter.

---

## Phase 2 — Cohort gate and course correction (Milestone 4 P-02)

**Goal:** Run G1–G5 honestly; change sittings before adding content.

| ID | Work | Priority | Trigger | Complexity |
|---|---|---|---|---|
| P-02 | Score G1–G3 from pasted `*Reply()` strings after each batch of five | P0 | Phase 1 invites | M |
| P-03 | **G4 transfer item:** one unseen regression MCQ **not** in client bundle — deliver via email/form after sitting | P0 | ≥6 unit-1 finishers | M |
| P-04 | G5: ask-back only until storage survives 7 days | P1 | Optional B-02 | S |
| C-fix | If same distractor wins in replies, rewrite that question in `lib/*` + tests | P0 | Batch review | S–M |

**Gate:** If G1 or G2 fails, **stop** Phase 3 and fix front door / length / unit 1 only.

---

## Phase 3 — Next curriculum units (only after G4 path is defined)

**Goal:** Close regression track per `TRADITIONAL_ML_TRACK.md`.

| ID | Unit | Route (proposed) | Lib pattern | Priority | Complexity |
|---|---|---|---|---|---|
| C-03 | Mean baseline vs line on holdout | `/classical/baseline` (new) | New `lib/baseline.ts` + test | P1 | M |
| C-04 | One leak column | `/classical/leak` (new) | New `lib/leak.ts` + test | P1 | M |
| C-05 | Closed-form as check (one station) | Extend regression or short `/classical/closed` | Extend `classical.ts` or new module | P2 | M |

Each unit follows the **definition of done** in `EXECUTION_ROADMAP.md`: locked tests, map card, previous unit link, 390px pass, deploy.

**Do not** add modules 3–12 inventory lessons or a generic lesson engine.

---

## Phase 4 — Infrastructure (evidence-driven only)

| ID | Work | Open when | Complexity |
|---|---|---|---|
| B-01 | Durable event store (Neon/Postgres or hosted log drain) | Paste-back fails operationally OR local `/review` is insufficient | L |
| B-02 | Auth + progress beyond `sessionStorage` | G5 matters OR learners lose cleared work on second device | L |
| B-03 | Re-enable retention bowl UI | B-02 + week-long storage OR server-side `retentionDue` | M |
| P-03-price | Paid track experiment | G1–G6 passed; assessment items not in client | M |

**Rejected until trigger (from architecture doc):** Pyodide, FastAPI, Plotly, Redis, microservices, analytics vendor for n=20.

---

## Suggested execution order (next commits)

1. **D-00 + T-00** — zero learner-facing risk, stops false operational beliefs.  
2. **D-01 + P-01** — unblocks cohort clock.  
3. **F-02 + Q-01** — path clarity and GD content test parity.  
4. **P-02 / batch review** — decide whether C-03 is warranted.  
5. **C-03** baseline — first new `lib` module after gates.

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Roadmap says M3 undone while rate unit ships | D-00 sync; treat M3 as **done**, shift focus to baseline + pilot |
| Production metrics quoted from events | Forbidden until B-01; use paste-back only |
| Answer key in bundle | Accept for free lab; G4 uses **out-of-bundle** item |
| `rate.ts` duplicate `Bowl` type | Consolidate with `descent.ts` when touching rate (low priority refactor) |
| No CI in repo | Add minimal GitHub Action: `npm test` + `npm run build` when touching app code |

---

## Out of scope (reaffirmed)

- Deleting or replacing existing routes (`/lab`, `/design`, direct classical URLs).  
- Building 140-lesson inventory or classification track before G4.  
- Second formula in Flutter without cohort signal (F-04).  
- Inventing “completed” platform features (mastery engine, LMS, Pyodide) in docs or code.

---

*Plan owner: Staff engineer / Project Atlas. Revise after each five-reply pilot batch.*