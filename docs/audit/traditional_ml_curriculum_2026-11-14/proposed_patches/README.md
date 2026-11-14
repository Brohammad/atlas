# Proposed patches (NOT APPLIED)

None of these patches has been applied to any file. No file under `traditional_ml/` was written. Each patch is an RFC 6902 JSON Patch whose paths are relative to its `target` document (path relative to `/workspace/atlas/`). Every patch starts with `test` operations that pin the question id and the old value, so it fails loudly instead of applying to the wrong place, or on top of a source that has changed since the audit (`target_sha256_at_audit` records the hash the patch was built against).

## Rules for whoever applies them

- Each file is a proposal. Applying it is an owner or SME decision, not an audit action.
- The patches do not change `version`, `change_log`, `review_state` or `sme_approved`. When applying, the author must bump the item version, add a change_log entry and return the item to draft as review_protocol.json requires. Nothing here marks anything SME-approved.
- After applying, re-run the repository validators (the auditor did not re-run them) and, for lab-related items, the lab-contract check.
- AUD-043.json (M06 Q011 prompt) must be applied only together with AUD-042.json (M06 Q011 required criteria). Applied alone, it removes cues for criteria that stay mandatory and makes the item harsher.
- AUD-025.json (M02 Q009 extra test) uses explicit arguments and works with or without AUD-024.json (M02 Q009 new numbers). Both combinations were tested.
- AUD-004.json also fixes AUD-005 (same option text).
- Patches on the same item touch different paths, and all patches per target apply cleanly in sequence (see below).

## Validation performed by the auditor

Method (scratch/build_patches.py, audit venv: jsonpatch 1.33, jsonschema 4.26.0): each patch was applied with `jsonpatch` to a deep copy of the source; the original was asserted unchanged. Each patched question was validated against `question.schema.json`, and the patched bank against `question_bank.schema.json`, with a Draft 2020-12 validator and a Registry over `traditional_ml/schemas/**` (it resolves the type-specific `$ref`s). As a sanity check, the validator rejected a deliberately invalid item (difficulty 9) and a debugging item with no failing_tests. `assembly_rules.json` has no schema; for it the auditor checked that the patch applies and changes only `/lesson_practice/rules/2`.

| Patch | Defects | Question | Target | Ops | Applies to copy | Schema | SME sign-off |
|---|---|---|---|---|---|---|---|
| AUD-001.json | AUD-001 | TML-M01-L002-Q003 | question_banks/module_01/lesson_01_002.json | 7 | yes | pass | no |
| AUD-002.json | AUD-002 | TML-M01-L002-Q002 | question_banks/module_01/lesson_01_002.json | 3 | yes | pass | no |
| AUD-003.json | AUD-003 | TML-M01-L002-Q004 | question_banks/module_01/lesson_01_002.json | 3 | yes | pass | no |
| AUD-004.json | AUD-004, AUD-005 | TML-M01-L002-Q006 | question_banks/module_01/lesson_01_002.json | 15 | yes | pass | yes |
| AUD-006.json | AUD-006 | TML-M01-L002-Q007 | question_banks/module_01/lesson_01_002.json | 3 | yes | pass | yes |
| AUD-007.json | AUD-007 | TML-M01-L002-Q007 | question_banks/module_01/lesson_01_002.json | 7 | yes | pass | yes |
| AUD-008.json | AUD-008 | TML-M01-L002-Q008 | question_banks/module_01/lesson_01_002.json | 3 | yes | pass | no |
| AUD-009.json | AUD-009 | TML-M01-L002-Q009 | question_banks/module_01/lesson_01_002.json | 3 | yes | pass | no |
| AUD-010.json | AUD-010 | TML-M01-L002-Q011 | question_banks/module_01/lesson_01_002.json | 3 | yes | pass | yes |
| AUD-011.json | AUD-011 | TML-M01-L002-Q011 | question_banks/module_01/lesson_01_002.json | 3 | yes | pass | no |
| AUD-014.json | AUD-014 | TML-M02-L006-Q001 | question_banks/module_02/lesson_02_006.json | 3 | yes | pass | no |
| AUD-015.json | AUD-015 | TML-M02-L006-Q001 | question_banks/module_02/lesson_02_006.json | 3 | yes | pass | no |
| AUD-017.json | AUD-017 | TML-M02-L006-Q004 | question_banks/module_02/lesson_02_006.json | 3 | yes | pass | yes |
| AUD-018.json | AUD-018 | TML-M02-L006-Q006 | question_banks/module_02/lesson_02_006.json | 5 | yes | pass | no |
| AUD-019.json | AUD-019 | TML-M02-L006-Q006 | question_banks/module_02/lesson_02_006.json | 3 | yes | pass | no |
| AUD-020.json | AUD-020 | TML-M02-L006-Q007 | question_banks/module_02/lesson_02_006.json | 19 | yes | pass | no |
| AUD-021.json | AUD-021 | TML-M02-L006-Q007 | question_banks/module_02/lesson_02_006.json | 5 | yes | pass | yes |
| AUD-022.json | AUD-022 | TML-M02-L006-Q007 | question_banks/module_02/lesson_02_006.json | 3 | yes | pass | yes |
| AUD-023.json | AUD-023 | TML-M02-L006-Q008 | question_banks/module_02/lesson_02_006.json | 5 | yes | pass | no |
| AUD-024.json | AUD-024 | TML-M02-L006-Q009 | question_banks/module_02/lesson_02_006.json | 17 | yes | pass | yes |
| AUD-025.json | AUD-025 | TML-M02-L006-Q009 | question_banks/module_02/lesson_02_006.json | 2 | yes | pass | no |
| AUD-026.json | AUD-026 | TML-M02-L006-Q011 | question_banks/module_02/lesson_02_006.json | 3 | yes | pass | no |
| AUD-027.json | AUD-027 | TML-M02-L006-Q012 | question_banks/module_02/lesson_02_006.json | 5 | yes | pass | no |
| AUD-028.json | AUD-028 | TML-M02-L006-Q013 | question_banks/module_02/lesson_02_006.json | 5 | yes | pass | yes |
| AUD-029.json | AUD-029 | TML-M02-L006-Q013 | question_banks/module_02/lesson_02_006.json | 4 | yes | pass | yes |
| AUD-031.json | AUD-031 | TML-M06-L008-Q001 | question_banks/module_06/lesson_06_008.json | 3 | yes | pass | no |
| AUD-032.json | AUD-032 | TML-M06-L008-Q002 | question_banks/module_06/lesson_06_008.json | 27 | yes | pass | yes |
| AUD-033.json | AUD-033 | TML-M06-L008-Q003 | question_banks/module_06/lesson_06_008.json | 5 | yes | pass | yes |
| AUD-034.json | AUD-034 | TML-M06-L008-Q003 | question_banks/module_06/lesson_06_008.json | 3 | yes | pass | no |
| AUD-035.json | AUD-035 | TML-M06-L008-Q004 | question_banks/module_06/lesson_06_008.json | 3 | yes | pass | no |
| AUD-036.json | AUD-036 | TML-M06-L008-Q005 | question_banks/module_06/lesson_06_008.json | 7 | yes | pass | no |
| AUD-037.json | AUD-037 | TML-M06-L008-Q006 | question_banks/module_06/lesson_06_008.json | 2 | yes | pass | no |
| AUD-038.json | AUD-038 | TML-M06-L008-Q007 | question_banks/module_06/lesson_06_008.json | 5 | yes | pass | yes |
| AUD-039.json | AUD-039 | TML-M06-L008-Q009 | question_banks/module_06/lesson_06_008.json | 13 | yes | pass | yes |
| AUD-040.json | AUD-040 | TML-M06-L008-Q009 | question_banks/module_06/lesson_06_008.json | 5 | yes | pass | yes |
| AUD-041.json | AUD-041 | TML-M06-L008-Q010 | question_banks/module_06/lesson_06_008.json | 3 | yes | pass | no |
| AUD-042.json | AUD-042 | TML-M06-L008-Q011 | question_banks/module_06/lesson_06_008.json | 10 | yes | pass | yes |
| AUD-043.json | AUD-043 | TML-M06-L008-Q011 | question_banks/module_06/lesson_06_008.json | 3 | yes | pass | yes |
| AUD-048.json | AUD-048 | n/a | architecture/assembly_rules.json | 2 | yes | n/a (no schema) | no |

All patches applied per target in sequence: question_banks/module_01/lesson_01_002.json: applies, schema pass; question_banks/module_02/lesson_02_006.json: applies, schema pass; question_banks/module_06/lesson_06_008.json: applies, schema pass; architecture/assembly_rules.json: applies, schema n/a

### Code tests re-run on patched copies (scratch/retest_patched.py)

| Check | Result | Expected | As expected |
|---|---|---|---|
| M02-Q009[patched_all] corrected | pass | pass | yes |
| M02-Q009[patched_all] defective | fail | fail | yes |
| M02-Q009[patched_all] mutant negative default lr | fail | fail | yes |
| M02-Q009[patched_all] mutant negated grad() | fail | fail | yes |
| M02-Q009[patched_all] mutant hard-coded w*0.5 | fail | fail | yes |
| M02-Q009[patched_tests_only] corrected | pass | pass | yes |
| M02-Q009[patched_tests_only] defective | fail | fail | yes |
| M02-Q009[patched_tests_only] mutant negative default lr | fail | fail | yes |
| M02-Q009[patched_tests_only] mutant negated grad() | fail | fail | yes |
| M02-Q009[patched_tests_only] mutant hard-coded w*0.5 | fail | fail | yes |
| M02-Q011 reference | pass | pass | yes |
| M02-Q011 mutant run() never calls step | fail | fail | yes |
| M02-Q012 reference | pass | pass | yes |
| M02-Q012 mutant rejects only lr==0 | fail | fail | yes |
| M02-Q013 reference | pass | pass | yes |
| M02-Q013 eta=1.9 | pass | pass | yes |
| M02-Q013 eta=2.05 | fail | fail | yes |
| M02-Q013 eta=2.1 | fail | fail | yes |
| M02-Q013 eta=2.2 | fail | fail | yes |
| M02-Q013 eta=2.5 | fail | fail | yes |
| M02-Q013 Newton step | pass | pass | yes |
| M06-Q006 corrected | pass | pass | yes |
| M06-Q006 defective | fail | fail | yes |
| M06-Q006 mutant expanding mean | fail | fail | yes |
| M06-Q006 mutant 30-day window | fail | fail | yes |
| M06-Q004 corrected (spec now pins ddof=0) | pass | pass | yes |

Known limit: after AUD-029.json, a Newton-step solution to M02 Q013 still passes the tests. Tests cannot see the method, so the new fixed-learning-rate constraint has to be enforced by the human rubric.

## Patches that need SME sign-off

- AUD-004.json (AUD-004, AUD-005): Whether the 2x2 determinant is taught in M01-L002 is a curriculum decision.
- AUD-006.json (AUD-006): Numerical linear algebra judgement about the reference answer.
- AUD-007.json (AUD-007): Prerequisite placement of rank and consistency.
- AUD-010.json (AUD-010): Confirms both strategies are acceptable.
- AUD-017.json (AUD-017): Item design trade-off.
- AUD-021.json (AUD-021): Objective mapping.
- AUD-022.json (AUD-022): Technical claim about loss curves.
- AUD-024.json (AUD-024): Lab alignment and v_lab re-run.
- AUD-028.json (AUD-028): Mastery-item design and prerequisite judgement.
- AUD-029.json (AUD-029): Confirm the added constraint does not exclude intended solutions.
- AUD-032.json (AUD-032): Leakage taxonomy wording.
- AUD-033.json (AUD-033): SME-07 misconception fit.
- AUD-038.json (AUD-038): Objective mapping.
- AUD-039.json (AUD-039): Rubric gating and placement.
- AUD-040.json (AUD-040): SME-07.
- AUD-042.json (AUD-042): Mastery gating.
- AUD-043.json (AUD-043): Difficulty calibration.

Patches not listed above fix wording, option balance, metadata or tests whose behaviour the auditor verified by execution. They still need normal author review before use.

## Defects with no patch

AUD-012, AUD-013, AUD-016, AUD-030, AUD-044, AUD-045, AUD-046, AUD-047, AUD-049, AUD-050, AUD-051, AUD-052, AUD-053. These need a redesign, an owner decision, a new objective or misconception entry, a schema change or new lesson content, which the auditor must not invent. See audit_findings.json for the proposed correction for each.
