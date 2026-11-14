# Traditional ML curriculum audit (imported)

**Source:** `traditional_ml_audit.zip` uploaded 14 November 2026 (IST).  
**Auditor verdict:** Not ready for SME sign-off (53 defects on 35 pilot questions; math keys largely correct).

This folder is **reference material** for the planned JSON curriculum (`traditional_ml/`). It is **not** the shipped Next.js regression pilot (`lib/*.ts` sittings on `/beginner`, `/lab`, `/classical/*`).

## Contents

| Path | Description |
|---|---|
| `AUDIT_REPORT.md` | Full human report |
| `audit_findings.json` | Scorecards, defects, summary |
| `proposed_patches/` | 39 RFC 6902 patches (**not applied**; targets `traditional_ml/question_banks/*.json`) |
| `GRADIENT_DESCENT_LAB_RECONCILIATION.md` | Maps audit M02 / AUD-052 to **this repo’s** shipped lab |
| `PATCH_APPLICATION_STATUS.md` | Why patches are held and how to apply later |

Scratch scripts from the zip are **not** imported (reproducible from auditor environment only). Re-run harnesses require the `traditional_ml/` tree and schemas.

## Relationship to Project Atlas

| Audit scope | Shipped Atlas (`main`) |
|---|---|
| M01-L002, M02-L006, M06-L008 question banks | Hand-built units in `lib/line.ts`, `lib/descent.ts`, `lib/rate.ts`, … |
| `labs/gradient_descent_lab.contract.json` | **`docs/audit/gradient_descent_lab.SOURCE_OF_TRUTH.md`** (source files, not build chunks) |
| Phase 3.5 validators / 1,134 checks | `npm test` (41 tests, 14 Nov 2026 baseline) |

## Next owner actions (from audit)

1. **SME review** — 30 defects flagged `sme_verification_required` (see `audit_findings.json`).
2. **Apply patches** — only after `traditional_ml/` exists in-repo; follow `proposed_patches/README.md`.
3. **AUD-052 / AT-027** — keep curriculum lab contract aligned with `lib/descent.ts`, `lib/step-expr.ts`, `components/lab-app.tsx` (see reconciliation doc).

Do **not** treat this import as SME approval or as proof the pilot cohort ran.