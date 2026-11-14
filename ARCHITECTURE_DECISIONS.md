# Architecture decisions — Project Atlas

**Date:** 14 November 2026 (Asia/Calcutta)  
**Purpose:** Record decisions **already embodied** in the repo, **gaps** that need explicit choices, and **rejected** options — aligned with `PRODUCT_ARCHITECTURE.md`, audit findings, and curriculum contracts.  
**Status labels:** **Accepted (in code)** · **Accepted (docs only)** · **Proposed** · **Rejected** · **Deferred**.

---

## ADR-001 — Monolith Next.js app as the only runtime

| | |
|---|---|
| **Status** | **Accepted (in code)** |
| **Context** | Interactive lessons, one deploy, cohort of ~20. |
| **Decision** | Single Next.js App Router application on Vercel; no FastAPI sidecar, no worker. |
| **Consequences** | All grading and simulation run in the browser; API route is events-only. |
| **Alternatives rejected** | FastAPI + SPA (not installed; no trigger). |

---

## ADR-002 — Lesson truth in TypeScript `lib/` modules

| | |
|---|---|
| **Status** | **Accepted (in code)** |
| **Context** | Answer drift is the main quality risk. |
| **Decision** | Questions, numeric instances, and graders live in `lib/*.ts`; `lib/*.test.ts` recomputes published answers. |
| **Consequences** | No CMS; authors edit code; Flutter (if ever) must import or port these files. |
| **Alternatives rejected** | JSON/YAML content without executable tests; lesson engine rendering 140 inventory items. |

---

## ADR-003 — Question schema (`Question` / `Option`)

| | |
|---|---|
| **Status** | **Accepted (in code)** |
| **Contract** | `LESSON_DESIGN_STANDARD.md` + `lib/lesson.ts`. |
| **Decision** | Four options; `answer` is option `id`; `idea` mandatory on miss; `setup` carries instance rules. |
| **Consequences** | MCQ runner in `choices.tsx` assumes this shape; code stations use parallel `"pass"` convention in `answers[]`. |
| **Gap** | No shared JSON Schema file — TypeScript types are the schema. **Proposed:** add `docs/curriculum/QUESTION_SCHEMA.json` as non-runtime documentation only if authors request it. |

---

## ADR-004 — Client-side grading and visible answer keys

| | |
|---|---|
| **Status** | **Accepted (in code)** |
| **Context** | Free practice lab; no proctoring. |
| **Decision** | Correct answers ship in the bundle; mastery is “cleared in session,” not credential-grade. |
| **Consequences** | G2/G4 rely on paste-back and **out-of-bundle** transfer items, not anti-cheat. |
| **Deferred** | Server-side grading if a paid credential is sold (`PRD` non-goals). |

---

## ADR-005 — Restricted expression language for `step(w, grad, lr)`

| | |
|---|---|
| **Status** | **Accepted (in code)** |
| **Context** | Gradient descent contract requires a written update; not full Python. |
| **Decision** | `lib/step-expr.ts`: parse/eval subset; `checkStepSource` for behavior; numeric check against known descent. |
| **Consequences** | No Pyodide for step station; regression code station uses same grader. |
| **Alternatives rejected** | Pyodide/NumPy until a unit needs semantics this grader cannot score. |

---

## ADR-006 — Gradient descent simulation kernel (`lib/descent.ts`)

| | |
|---|---|
| **Status** | **Accepted (in code)** |
| **Contract** | `TRADITIONAL_ML_TRACK.md`: quadratic bowl, fixed-step runs, `LOSS_OK = 0.05` after 10 steps. |
| **Decision** | Shared `runDescent`, bowl constants, `predictItems` for locked trajectories. |
| **Consequences** | `lib/rate.ts` duplicates a local `Bowl` type and implements `lineCleared` — **technical debt**, not a second formula. |
| **Proposed** | Import `Bowl` from `descent.ts` in `rate.ts` when next touching rate. |

---

## ADR-007 — Gradient descent lab stage machine

| | |
|---|---|
| **Status** | **Accepted (in code)**; **Partial** vs marketing PRD |
| **Decision** | Stages: `pre` → `understand` → `predict` → `experiment` → `debug` → `apply` → `post` → `results`. Five-station track excludes pre/post. |
| **Retention** | **Accepted:** no navigable retention stage; stored `retention` redirects to `results`. Math for `retentionBowl` remains tested. |
| **Gap** | PRD table still mentions seven-day bowl on `/lab` — **docs-only drift**; align with D-01 in implementation plan. |
| **Contract note** | `retention_run` in event allowlist but **no UI emits it** — remove from allowlist or implement UI only when ADR-012 triggers. |

---

## ADR-008 — `sessionStorage` progress model

| | |
|---|---|
| **Status** | **Accepted (in code)** |
| **Decision** | One JSON blob per unit (`atlas.*.v1`); anonymous `sessionId` per sitting. |
| **Consequences** | Tab-close ends sitting; no G5; seven-day retention impossible. |
| **Deferred** | ADR-012 database + auth. |

---

## ADR-009 — Event logging contract

| | |
|---|---|
| **Status** | **Accepted (in code)**; **Partial** test coverage |
| **Decision** | `POST /api/events` with UUID session, ISO `at`, allowlisted `name`, optional `data`; append `data/events.jsonl` locally; swallow errors on Vercel. |
| **Consequences** | Production is not a source of truth for metrics. |
| **Proposed** | Test entire `NAMES` set; document canonical list in `docs/architecture/EVENT_CONTRACT.md` (derived from route + `browser-log` call sites). |

---

## ADR-010 — Loader pattern (`ssr: false`)

| | |
|---|---|
| **Status** | **Accepted (in code)** |
| **Decision** | Labs load via `dynamic(..., { ssr: false })` because `sessionStorage` is unavailable on server. |
| **Consequences** | Crawlers see metadata + loading shell, not full lesson HTML. |
| **Exception** | `/design` uses direct client import — acceptable for internal mock. |

---

## ADR-011 — Traditional ML track structure

| | |
|---|---|
| **Status** | **Accepted (in code)** |
| **Decision** | Twelve `classicalModules` titles; only regression has playable units; map shows four cards. |
| **Consequences** | `lessons: 12` per module is inventory metadata, not UI promise. |
| **Ordering** | Documented desired order; **no route guards** — **Proposed** soft prerequisites (copy + map state), not middleware redirects (user constraint: do not delete routes). |

---

## ADR-012 — Durable storage and auth

| | |
|---|---|
| **Status** | **Deferred** |
| **Trigger** | Paste-back fails as collection method; or learners need second-device resume; or G5 must be measured. |
| **Default** | Neon/Postgres for events first (B-01), then identities (B-02) — per roadmap, not preemptively. |
| **Rejected** | Auth before first cohort without evidence of tab-loss pain. |

---

## ADR-013 — Analytics and pilot instrumentation

| | |
|---|---|
| **Status** | **Accepted (in code)** + **Accepted (docs only)** |
| **Primary instrument** | Pasted `*Reply()` strings from each unit. |
| **Secondary** | Local JSONL + `/review` for GD debugging. |
| **Rejected** | Warehouse, session replay, A/B platform for n=20. |
| **Proposed** | ML-aware `/review` or export script for local pilots only. |

---

## ADR-014 — Testing strategy

| | |
|---|---|
| **Status** | **Accepted (in code)** |
| **Decision** | Node unit tests on `lib/` only; no E2E in repo. |
| **Consequences** | UI regressions caught manually (390px browser pass per definition of done). |
| **Proposed** | CI workflow running `npm test` and `npm run build`; optional Playwright smoke later. |

---

## ADR-015 — Caching / Next 16 features

| | |
|---|---|
| **Status** | **Accepted (in code)** |
| **Decision** | `cacheComponents: true`, `partialPrefetching: true` in `next.config.ts`. |
| **Consequences** | `/review` uses Partial Prerender; labs remain client-heavy. |

---

## ADR-016 — Stack exclusions (brief vs reality)

| | |
|---|---|
| **Status** | **Rejected** (for current phase) |
| **Items** | Plotly (have `curve.tsx` SVG), scikit-learn, Redis, microservices, generic mastery engine, 140-lesson platform. |
| **Revisit when** | Documented in `PRODUCT_ARCHITECTURE.md` “When it becomes rational” table. |

---

## ADR-017 — Learning rate unit placement

| | |
|---|---|
| **Status** | **Accepted (in code)** — ahead of stale roadmap |
| **Decision** | Unit at `/classical/rate` after residuals; mixes MCQ with experiment stations (`lines`, `unseen`). |
| **Consequences** | Milestone 3 in roadmap should be marked complete; next curriculum commit is **baseline** (C-03), not rate. |

---

## ADR-018 — Change rule for new units

| | |
|---|---|
| **Status** | **Accepted (in code)** |
| **Decision** | From `PRODUCT_ARCHITECTURE.md`: new `lib` module + test locking all answers + client sitting + route + map card; extend shared runners if needed, don't fork formulas. |
| **Applies to** | Baseline, leak, any future regression extension. |

---

## Decision log maintenance

| When | Action |
|---|---|
| Pilot batch of 5 | Revisit ADR-004, ADR-012, ADR-013 |
| G4 pass/fail | Revisit baseline/leak priority (ADR-018) |
| Any new runtime (Pyodide, DB) | New ADR with explicit trigger citation |

---

*This file is normative for **new** work. Where it conflicts with older docs, prefer this audit + code on `main` until D-00 doc sync lands.*