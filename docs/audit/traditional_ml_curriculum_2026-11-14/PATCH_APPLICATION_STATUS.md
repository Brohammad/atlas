# Proposed patches — application status

**Imported:** 39 JSON Patch files under `proposed_patches/` (from independent curriculum audit, 14 Nov 2026).  
**Applied to this repository:** **none** (as required by the audit README).

## Why nothing was applied

Patches target paths such as:

- `question_banks/module_01/lesson_01_002.json`
- `question_banks/module_02/lesson_02_006.json`
- `question_banks/module_06/lesson_06_008.json`
- `architecture/assembly_rules.json`

Those files belong to a **`traditional_ml/`** content tree that is **not present** on `main` in the Next.js Atlas repository. Applying patches here would create orphan files outside the product’s hand-built `lib/*.ts` lessons.

## Preconditions to apply (checklist)

1. [ ] Commit or submodule the full `traditional_ml/` tree (schemas, validators, manifest).
2. [ ] Recompute `target_sha256_at_audit` for each patch target; fail loud if drifted.
3. [ ] SME sign-off on defects marked `sme_verification_required` in `audit_findings.json` (30 items).
4. [ ] Apply **AUD-042 + AUD-043** together (M06 Q011); see `proposed_patches/README.md`.
5. [ ] Run repository validators (`validate_phase1.py`, `validators/*`) and lab-contract check post-merge.
6. [ ] Re-run auditor-style code harness for M02 Q009, Q011, Q012, Q013 if M02 changes.

## Patches with no file (owner / curriculum actions)

Per audit README: AUD-012, AUD-013, AUD-016, AUD-030, AUD-044–047, AUD-049–051, **AUD-052**, AUD-053. These need redesign, new lesson content, or lab-contract work — not jsonpatch alone.

**AUD-052** interim mitigation in Atlas repo: `docs/audit/gradient_descent_lab.SOURCE_OF_TRUTH.md` (see `GRADIENT_DESCENT_LAB_RECONCILIATION.md`).

## Validation record (from auditor)

`proposed_patches/patch_validation_results.json` — all 39 patches applied cleanly to **copies** and passed schema checks at audit time. That result is **not** re-run in this import.

## If patches are applied elsewhere

After merging into a repo that contains `traditional_ml/`, bump item `version`, `change_log`, and set `review_state` per `review_protocol.json` — the audit explicitly did not do this.