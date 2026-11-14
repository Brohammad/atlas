# Traditional ML curriculum audit: pilot lessons M01-L002, M02-L006, M06-L008

Independent Curriculum Auditor, 2026-11-14 (IST). Scope: 35 pilot questions, the three lesson entries, and curriculum-level defects found along the way. This is not an audit of all 20 modules.

## Verdict

Not ready for SME sign-off. No critical defects were found: every numeric key, distractor value and reference solution the auditor recomputed or executed is correct. Validity problems are systemic, though. Length-cued keys in 8 items let test-wise learners score without understanding. Mastery and required-rubric gates in M02 Q013 and M06 Q009 and Q011 depend on content taught later or never. Two lessons have no lesson body and the third has only the lab, so no item can yet be checked against what was taught. The 1,134 passing automated checks do not change this verdict: every defect below sits in an item or file that passed validation.

Defects: 53 total; critical 0, high 13, medium 23, low 17. 40 defects have a proposed patch (39 patch files, none applied). 30 defects need SME or owner verification. Question scorecards overall: 6 pass, 20 concern, 9 fail.

## Critical and high defects

There are no critical defects.

| ID | Severity | Item | Issue | Fix | SME | Patch |
|---|---|---|---|---|---|---|
| AUD-001 | high | M01-L002-Q003 | Option B, (2, 2) for A * B.T, is not what a learner who reads * as a matrix product would predict: a matrix product of two (2, 3) arrays is undefined, so that learner predicts a ValueError (option C). | Rewrite option_feedback B and C and repoint the MC-004 evidence to option C (patch). | no | proposed_patches/AUD-001.json |
| AUD-005 | high | M01-L002-Q006 | Test-wiseness cue: the key is 135 characters against at most 59 for any distractor (2.29x) and is the only option with a justification, so 'pick the longest, most qualified option' scores without understanding. | Shorten the key to a claim of similar length to the distractors; the patch for the determinant defect does this. | no | proposed_patches/AUD-004.json |
| AUD-020 | high | M02-L006-Q007 | Key is 193 characters, the next longest 67 (2.88x). | Make all four options complete four-run mappings of equal form, keep the MC-033 and MC-270 distractors, and repoint the evidence (patch). | no | proposed_patches/AUD-020.json |
| AUD-023 | high | M02-L006-Q008 | Key is 303 characters against at most 119 (2.55x) and is the only option with a mechanism, evidence and remedy. | Shorten the key and lengthen the saddle-point distractor (patch). | no | proposed_patches/AUD-023.json |
| AUD-028 | high | M02-L006-Q013 | The mastery item requires differentiating log(cosh(u)) and bounding sech^2, which no lesson teaches. | Give the two derivative identities as usable facts, so the transfer is applying them, bounding the curvature and choosing eta (patch). | yes | proposed_patches/AUD-028.json |
| AUD-036 | high | M06-L008-Q005 | Key is 396 characters against at most 114 (3.47x). | Shorten the key and replace D with a plausible leakage suspect (patch). | no | proposed_patches/AUD-036.json |
| AUD-039 | high | M06-L008-Q009 | R07-R10 are required for pass but assess M09 operating-point content outside O04; a learner meeting O04 fully still fails. | Make R07-R10 credit-earning but not required (patch), and move the operating-point reasoning to a cumulative assessment after M09 (AT-033). | yes | proposed_patches/AUD-039.json |
| AUD-041 | high | M06-L008-Q010 | Key is 185 characters against at most 86 (2.15x) and is the only option that names both safeguards. | Shorten the key (patch). | no | proposed_patches/AUD-041.json |
| AUD-042 | high | M06-L008-Q011 | All s2 criteria are required, including R03 (M10-L005 purging), R05 (M09/M15 resampling) and R07 (M09 metrics), so the mastery item gates on untaught content. | Make R03, R05 and R07 credit-earning but not required (patch). | yes | proposed_patches/AUD-042.json |
| AUD-047 | high | M01-L002, M02-L006, M06-L008 | Practice time is 55/86/103 minutes against a 20-30 minute target, and lesson_index has no time field. | Add a core/practice/deep-challenge tag per item and a lesson time budget (AT-030). | yes | none |
| AUD-048 | high | architecture/assembly_rules.json | assembly_rules specifies a provisional LLM score for rubric items, contradicting DEC-018 (no AI grader at launch). | Replace with human-only grading wording (patch). | no | proposed_patches/AUD-048.json |
| AUD-050 | high | M02-L006 | The only M02-L006 instruction is the lab, which does not teach O04 batch GD on data, 2-D conditioning or stopping criteria that items assess. | Write the lesson body (AT-031), or limit the M02-L006 core to what the lab teaches and mark Q001, Q008, Q012 and Q013 as practice or deep challenge until it exists. | yes | none |
| AUD-051 | high | M01-L002, M06-L008 | No lesson body exists in the product for either lesson (repo report, section 7), so no item can be checked against what was taught, and the prerequisite guards (PRQ-01) can only compare item text with concept names. | Write the lesson bodies before SME review, so the SME can check items against instruction (AT-031). | yes | none |

## Severity definitions

- **critical**: Wrong key, grading that misgrades most learners, or the item teaches false content as correct.
- **high**: The item cannot measure its objective; a pass gate depends on untaught content; feedback states something false; a strong test-wiseness cue (key at least 2x the next-longest option or an equivalent giveaway); or a specification contradiction that enables a banned practice.
- **medium**: Weakened validity, transfer or grading reliability; graders could disagree; tests accept specific wrong answers or reject legitimate ones while the rubric or other items partly mitigate.
- **low**: Polish, metadata or minor wording issues with no material effect on scores.

## Prior concerns

- **M06 Q009/Q011 mandatory criteria depend on M09, M10 and M15**: CONFIRMED. Q009 R07-R10 (required) need M09-L001 to L005. Q011 s2 R03 needs M10-L005, R05 needs M09-L002 and M15-L005, R07 needs M09. Nuance: R04 follows from the contamination principle taught here and R08 from the prerequisite M06-L007, so those are fair; and the s2 prompt cues R03. (AUD-039, AUD-042, AUD-043)
- **Misconception-evidence rule was broadened**: CONFIRMED WITH NUANCE. MAP-03 now admits omission and optional-criterion evidence. Every pointer resolves, but M01 Q003 is wrong, and M06 Q009 MC-093, M06 Q003 MC-106 and M02 Q004 MC-031 are weak. The M02 Q010 MC-027 link is sound, so the concern is refuted for that item. (AUD-001, AUD-033, AUD-040, AUD-053)
- **M02 Q009 is an exact lab case**: CONFIRMED. Same bowl, start, rate, step count and fault as lab Debug case B. Q003, Q004 and Q011 also overlap the lab. (AUD-024, AUD-016, AUD-017)
- **Lessons are too long (55/86/103 vs 20-30 minutes)**: CONFIRMED. Auditor sums of estimated_time_minutes are 55, 86 and 103. Estimates for M06 Q009 (15) and Q011 (22) look optimistic, so true times are likely higher. (AUD-047)

## Per-lesson findings

### TML-M01-L002 (matrix operations)

Strong items: Q001, Q005, Q008 and Q010. All keys are correct; the auditor recomputed (AB) row 2, column 1 = 5 in Q002 and the Q008 buggy value 7/3. Main problems: the Q003 feedback and misconception pointer are wrong, the determinant is used but not taught, Q007 is ambiguous and needs rank, keys are length-cued, and the level-4 mastery item is scaffolded.

Lesson scorecard:

| Criterion | Result | Reason |
|---|---|---|
| technical_correctness | pass | All keys and code are technically correct (auditor harness and recomputation). |
| mathematical_correctness | pass | Every recomputed number matches. |
| prerequisite_validity | concern | The determinant (Q006) and rank or consistency (Q007 R04, O06) are used but not taught in this lesson or its single prerequisite (determinant, O06 and R04 defects). |
| pedagogical_clarity | concern | No lesson body exists to check items against (lesson-body defect); items themselves are mostly clear. |
| assessment_validity | concern | Length-cued keys (Q006, Q009) and the unassessed "verify with NumPy" half of O02. |
| misconception_alignment | fail | Q003 links MC-004 to the wrong option, and its feedback states a false implication (Q003 defect). |
| feedback_quality | concern | Q003 option B feedback is false; Q002 lists an unreachable common error. |
| difficulty_calibration | concern | 55 minutes of practice against a 20-30 minute target; the level-4 mastery item is partly recognition scaffolding. |
| independent_transfer | pass | Q011 s4 is a genuine transfer task (memory-bounded top-k over chunked embeddings). |
| ambiguity_edge_cases | concern | Q007 "hot loop" ambiguity; Q011 R03 rejects an equally valid reduction. |

Item overview (full 10-criterion scorecards with reasons are in audit_findings.json):

| Item | Type | Level | Minutes | Overall | Fail on | Concern on | Defects |
|---|---|---|---|---|---|---|---|
| Q001 | multi_select | 1 | 3 | pass | - | - | - |
| Q002 | numerical | 1 | 2 | concern | - | feedback_quality, ambiguity_edge_cases | AUD-002 |
| Q003 | prediction | 2 | 2 | fail | mathematical_correctness, misconception_alignment, feedback_quality | - | AUD-001 |
| Q004 | formula_derivation | 2 | 6 | concern | - | pedagogical_clarity | AUD-003 |
| Q005 | fill_blank | 2 | 3 | pass | - | - | - |
| Q006 | multiple_choice | 1 | 2 | fail | assessment_validity, ambiguity_edge_cases | prerequisite_validity | AUD-004, AUD-005 |
| Q007 | short_answer | 3 | 5 | concern | - | technical_correctness, prerequisite_validity, assessment_validity, ambiguity_edge_cases | AUD-006, AUD-007 |
| Q008 | debugging | 2 | 6 | concern | - | ambiguity_edge_cases | AUD-008 |
| Q009 | code_reading | 3 | 4 | concern | - | assessment_validity | AUD-009 |
| Q010 | coding | 2 | 10 | pass | - | - | - |
| Q011 | multi_step | 4 | 12 | concern | - | assessment_validity, difficulty_calibration, independent_transfer, ambiguity_edge_cases | AUD-010, AUD-011, AUD-012 |

| ID | Severity | Item | Issue | Fix | SME | Patch |
|---|---|---|---|---|---|---|
| AUD-001 | high | M01-L002-Q003 | Option B, (2, 2) for A * B.T, is not what a learner who reads * as a matrix product would predict: a matrix product of two (2, 3) arrays is undefined, so that learner predicts a ValueError (option C). | Rewrite option_feedback B and C and repoint the MC-004 evidence to option C (patch). | no | proposed_patches/AUD-001.json |
| AUD-002 | low | M01-L002-Q002 | A has only 2 rows, so 'picking row 3' is impossible; the listed error cannot be matched to any numeric response, which defeats the value-specific feedback rule in feedback_framework.json. | Replace with a reachable error and its value: reading column 1 as the second column gives (AB)_{2,2} = 10 (auditor-recomputed). | no | proposed_patches/AUD-002.json |
| AUD-003 | low | M01-L002-Q004 | 'the product rule' is ambiguous for learners who know the calculus product rule; the hint means the transpose-of-a-product rule. | Name the rule explicitly: (AB)^T = B^T A^T (patch). | no | proposed_patches/AUD-003.json |
| AUD-004 | medium | M01-L002-Q006 | The keyed option, explanation and first hint rely on the 2x2 determinant. | Make the key and hints rely on column dependence and mention ad - bc only as an aside (patch). | yes | proposed_patches/AUD-004.json |
| AUD-005 | high | M01-L002-Q006 | Test-wiseness cue: the key is 135 characters against at most 59 for any distractor (2.29x) and is the only option with a justification, so 'pick the longest, most qualified option' scores without understanding. | Shorten the key to a claim of similar length to the distractors; the patch for the determinant defect does this. | no | proposed_patches/AUD-004.json |
| AUD-006 | medium | M01-L002-Q007 | If A does not change inside the loop (a common reading of 'hot loop'), the best answer is to factorise once outside the loop (lu_factor/cho_factor and lu_solve). | State in the prompt that A and b are rebuilt on every iteration (patch); optionally add a rubric note crediting 'factorise once and reuse' when A is fixed. | yes | proposed_patches/AUD-006.json |
| AUD-007 | medium | M01-L002-Q007 | R04 is required for pass and asks for 'no solution or infinitely many'. | Require only 'singular, so no unique solution'; credit naming both cases but do not require it (patch). | yes | proposed_patches/AUD-007.json |
| AUD-008 | low | M01-L002-Q008 | The config refers to a 'hidden shape-variant test' that does not exist in the item; the shape-variant check is the public failing test fail_both_weight_shapes. | Name the tests that actually run (patch). | no | proposed_patches/AUD-008.json |
| AUD-009 | medium | M01-L002-Q009 | Key is 221 characters against at most 123 (1.8x) and is the only option with a complete mechanism plus fix, which cues test-wise learners. | Shorten the key (patch). | no | proposed_patches/AUD-009.json |
| AUD-010 | medium | M01-L002-Q011 | R03 is required and prescribes a running best. | Accept either reduction strategy (patch). | yes | proposed_patches/AUD-010.json |
| AUD-011 | low | M01-L002-Q011 | Carry-forward is meaningless here: S and S.T have the same byte count (auditor-recomputed 2,560,000 either way), and the other s1 options are undefined products, so there is no learner shape to carry forward. | Say carry-forward is not needed (patch). | no | proposed_patches/AUD-011.json |
| AUD-012 | medium | M01-L002-Q011 | The level-4 mastery item is scaffolded into four steps; s1 and s3 are single-step shape recognition at the level of Q001 (s3 is nearly s1 again), so 2 of 5 points need no transfer. | Redesign: drop s3, make s1 free-response (write the expression and its shape) or fold it into s4, and weight s4 more. | yes | none |

### TML-M02-L006 (gradient descent)

All numbers are correct, including the Q005 clearing sets (steep bowl 0.05 to 0.15, flat bowl 0.25 to 1.0) and the Q013 tight-cluster curvature (about 0.895). Main problems: the mastery item needs untaught hyperbolic calculus, Q007 and Q008 have strong length cues, several items overlap the lab (Q003, Q004, Q009 verbatim, Q011), tests accept wrong fixes, and there is no lesson body beyond the lab.

Lesson scorecard:

| Criterion | Result | Reason |
|---|---|---|
| technical_correctness | concern | Keys correct, but Q007 explanation misstates that multi-dimensional quadratic losses show oscillation, and tests accept wrong fixes (Q009, Q011, Q012, Q013). |
| mathematical_correctness | pass | Every recomputed number matches, including the Q005 clearing sets and the Q013 curvature at the tight-cluster root. |
| prerequisite_validity | fail | The mastery item Q013 needs hyperbolic-function calculus taught nowhere; the prerequisite closure is over-tight (eigenvalues, PSD). |
| pedagogical_clarity | fail | The only instruction is the lab, which has no dataset, MSE, second parameter or stopping criterion, yet Q001, Q008 and Q012 assess them. |
| assessment_validity | fail | Strong length cues on Q007 (2.88x) and Q008 (2.55x); Q007 does not measure its O05 tag. |
| misconception_alignment | concern | Mostly sound (MC-027, MC-033, MC-270); MC-031 on Q004 is weak; Q005 links nothing despite diagnostic values. |
| feedback_quality | pass | Value-specific feedback is good across the numeric items; Q001 A feedback overgeneralises (low). |
| difficulty_calibration | concern | 86 minutes of practice; Q004 hands over the recurrence. |
| independent_transfer | concern | Q003, Q004, Q009 and Q011 reproduce lab steps whose answers the lab reveals; Q009 is lab Debug case B verbatim. |
| ambiguity_edge_cases | concern | Q006 presupposes lab history; the lab contract is pinned to build hashes. |

Item overview (full 10-criterion scorecards with reasons are in audit_findings.json):

| Item | Type | Level | Minutes | Overall | Fail on | Concern on | Defects |
|---|---|---|---|---|---|---|---|
| Q001 | multiple_choice | 2 | 3 | concern | - | technical_correctness, assessment_validity, feedback_quality | AUD-014, AUD-015 |
| Q002 | numerical | 1 | 2 | pass | - | - | - |
| Q003 | multi_step | 2 | 5 | concern | - | assessment_validity, independent_transfer | AUD-016 |
| Q004 | multi_step | 2 | 6 | concern | - | misconception_alignment, difficulty_calibration, independent_transfer | AUD-017 |
| Q005 | numerical | 3 | 4 | concern | - | misconception_alignment | AUD-030 |
| Q006 | prediction | 3 | 4 | concern | - | pedagogical_clarity, assessment_validity | AUD-018, AUD-019 |
| Q007 | visual_interpretation | 2 | 4 | fail | assessment_validity | technical_correctness | AUD-020, AUD-021, AUD-022 |
| Q008 | data_interpretation | 3 | 6 | fail | assessment_validity | - | AUD-023 |
| Q009 | debugging | 2 | 4 | concern | - | assessment_validity, independent_transfer, ambiguity_edge_cases | AUD-024, AUD-025 |
| Q010 | debugging | 3 | 5 | pass | - | - | - |
| Q011 | coding | 2 | 8 | concern | - | assessment_validity | AUD-026 |
| Q012 | coding | 3 | 15 | concern | - | assessment_validity | AUD-027 |
| Q013 | coding | 4 | 20 | fail | prerequisite_validity, assessment_validity | misconception_alignment | AUD-028, AUD-029 |

| ID | Severity | Item | Issue | Fix | SME | Patch |
|---|---|---|---|---|---|---|
| AUD-014 | low | M02-L006-Q001 | Option A feedback overgeneralises: the gradient also points at the minimum from an axis start on this bowl. | Qualify the statement (patch). | no | proposed_patches/AUD-014.json |
| AUD-015 | medium | M02-L006-Q001 | Key is 191 characters against at most 134 (1.43x) and is the most qualified option. | Shorten the key (patch). | no | proposed_patches/AUD-015.json |
| AUD-016 | medium | M02-L006-Q003 | s1 (gradient 5) and s2 (w1 = 3.25) reproduce the lab's Understand step on the same bowl, rate and start, which the lab displays. | Use a new start or rate (e.g. | yes | none |
| AUD-017 | medium | M02-L006-Q004 | The prompt hands over the multiplier that decides every step, and three of the four rates (0.1, 0.5, 1.5) are the lab's Predict-stage rates on the same bowl, whose outcomes the lab reveals immediately. | Remove the recurrence from the prompt (patch); consider replacing 0.1 or 1.5 with rates not used by the lab. | yes | proposed_patches/AUD-017.json |
| AUD-018 | medium | M02-L006-Q006 | Key is 188 characters against at most 120 (1.57x) and states the full reasoning. | Shorten the key and move the reasoning to feedback (patch). | no | proposed_patches/AUD-018.json |
| AUD-019 | low | M02-L006-Q006 | Presupposes a lab history the learner may not have: the lab lets learners continue without clearing, and 0.05 and 0.10 also clear that bowl (auditor-recomputed clearing set 0.05, 0.10, 0.15). | State it as a fact about the lab (patch). | no | proposed_patches/AUD-019.json |
| AUD-020 | high | M02-L006-Q007 | Key is 193 characters, the next longest 67 (2.88x). | Make all four options complete four-run mappings of equal form, keep the MC-033 and MC-270 distractors, and repoint the evidence (patch). | no | proposed_patches/AUD-020.json |
| AUD-021 | medium | M02-L006-Q007 | The item is tagged O05 (interpret a training loss curve), but it shows parameter trajectories, and the item itself notes that the loss curve would not show the oscillation. | Tag the item to O02 only (patch) and flag the O05 oscillation gap to the owner. | yes | proposed_patches/AUD-021.json |
| AUD-022 | low | M02-L006-Q007 | For a convex quadratic in any number of dimensions, converging full-batch GD decreases every eigen-component of the loss monotonically, so a multi-dimensional quadratic loss does not show oscillation either. | Correct the parenthetical (patch). | yes | proposed_patches/AUD-022.json |
| AUD-023 | high | M02-L006-Q008 | Key is 303 characters against at most 119 (2.55x) and is the only option with a mechanism, evidence and remedy. | Shorten the key and lengthen the saddle-point distractor (patch). | no | proposed_patches/AUD-023.json |
| AUD-024 | medium | M02-L006-Q009 | Item is the lab Debug case B verbatim; the lab already reveals the diagnosis, so it tests recall. | Keep the fault type but use new numbers and do not name the lab case (patch: w0 = -0.8, lr = 0.3, 5 steps; observed, expected values and tests auditor-recomputed). | yes | proposed_patches/AUD-024.json |
| AUD-025 | medium | M02-L006-Q009 | The tests call run() only with its defaults. | Add a failing test with explicit arguments that also checks grad() (patch); the auditor ran it against all three mutants and they fail. | no | proposed_patches/AUD-025.json |
| AUD-026 | low | M02-L006-Q011 | Unenforced constraint: a run() that inlines w - lr * grad and never calls step passed every test in the auditor's harness. | Add a hidden test that counts calls to step (patch). | no | proposed_patches/AUD-026.json |
| AUD-027 | low | M02-L006-Q012 | Two stated constraints are not checked. | Add a negative-lr hidden test and state that vectorisation is not auto-graded (patch). | no | proposed_patches/AUD-027.json |
| AUD-028 | high | M02-L006-Q013 | The mastery item requires differentiating log(cosh(u)) and bounding sech^2, which no lesson teaches. | Give the two derivative identities as usable facts, so the transfer is applying them, bounding the curvature and choosing eta (patch). | yes | proposed_patches/AUD-028.json |
| AUD-029 | medium | M02-L006-Q013 | The hid_tight_cluster test (added in Phase 3.5) catches eta = 2.5 but not rates just above the bound. | Add a hidden test whose curvature at the root is essentially 1, and state the fixed-learning-rate constraint (patch). | yes | proposed_patches/AUD-029.json |
| AUD-030 | low | M02-L006-Q005 | The item recognises diagnostic values (0.1 and 0.4) in feedback but links no misconception, while sibling items (Q002, Q003) link diagnostic numeric values under the broadened MAP-03 rule. | Add a misconception entry for coefficient-versus-curvature (MAP-05) and link it via the 0.4 diagnostic value, or explicitly accept the item as misconception-free. | yes | none |

### TML-M06-L008 (data leakage)

Q008 is the strongest coding item in the pilot. The auditor reproduced the Q003 claim by simulation: selecting features on all rows gives a mean accuracy of 0.98 on pure noise, against 0.482 with train-only selection. Main problems: required criteria in Q009 and Q011 depend on M09, M10 and M15; Q005 and Q010 have strong length cues; Q002 s2 has two defensible answers; the Q011 prompt scaffolds a level-4 item; and practice runs to 103 minutes.

Lesson scorecard:

| Criterion | Result | Reason |
|---|---|---|
| technical_correctness | pass | Keys and code are correct; the M06 Q003 noise-feature-selection claim was reproduced (select-on-all-rows mean accuracy 0.98 vs train-only 0.482). |
| mathematical_correctness | pass | Q009 fraud volume (2,200 a day) and rubric totals recomputed. |
| prerequisite_validity | fail | Required criteria in Q009 and Q011 depend on M09, M10-L005 and M15-L005; the prerequisite closure (31 lessons) is over-tight. |
| pedagogical_clarity | concern | No lesson body; Q002 labels restate the stems. |
| assessment_validity | fail | Strong length cues on Q005 (3.47x) and Q010 (2.15x); gates on untaught content in Q009 and Q011. |
| misconception_alignment | concern | MC-106 mismatched on Q003; MC-093 evidenced only by an optional criterion on Q009. |
| feedback_quality | pass | Feedback is specific; Q003 "run it" assumes a runtime (low). |
| difficulty_calibration | fail | 103 minutes of practice against 20-30; Q011 s2 prompt enumerates the rubric in a level-4 item. |
| independent_transfer | pass | Q008, Q009 and Q011 pose genuinely new contexts. |
| ambiguity_edge_cases | concern | Q002 s2 has two defensible labels; Q004 ddof unspecified; Q006 window not pinned by tests. |

Item overview (full 10-criterion scorecards with reasons are in audit_findings.json):

| Item | Type | Level | Minutes | Overall | Fail on | Concern on | Defects |
|---|---|---|---|---|---|---|---|
| Q001 | multi_select | 1 | 3 | concern | - | misconception_alignment, ambiguity_edge_cases | AUD-031 |
| Q002 | multi_step | 2 | 5 | concern | - | assessment_validity, ambiguity_edge_cases | AUD-032 |
| Q003 | multi_step | 3 | 8 | concern | - | misconception_alignment, feedback_quality | AUD-033, AUD-034 |
| Q004 | debugging | 2 | 6 | concern | - | assessment_validity, ambiguity_edge_cases | AUD-035 |
| Q005 | data_interpretation | 2 | 4 | fail | assessment_validity | - | AUD-036 |
| Q006 | debugging | 3 | 7 | concern | - | assessment_validity | AUD-037 |
| Q007 | coding | 2 | 12 | concern | - | assessment_validity | AUD-038 |
| Q008 | coding | 3 | 15 | pass | - | - | - |
| Q009 | scenario | 3 | 15 | fail | prerequisite_validity, assessment_validity | misconception_alignment | AUD-039, AUD-040 |
| Q010 | model_selection | 3 | 6 | fail | assessment_validity | - | AUD-041 |
| Q011 | multi_step | 4 | 22 | fail | prerequisite_validity, assessment_validity | difficulty_calibration, independent_transfer | AUD-042, AUD-043 |

| ID | Severity | Item | Issue | Fix | SME | Patch |
|---|---|---|---|---|---|---|
| AUD-031 | low | M06-L008-Q001 | The key depends on when the historical row was written. | State that rows were filled in after the month ended (patch). | no | proposed_patches/AUD-031.json |
| AUD-032 | medium | M06-L008-Q002 | s2 has two defensible labels: the item's own feedback concedes that the feature is also post-outcome in time, so 'temporal leakage (future information)' is correct as well. | Define option C as leakage through the split (training rows after test rows) and drop the restating parentheticals (patch). | yes | proposed_patches/AUD-032.json |
| AUD-033 | low | M06-L008-Q003 | MC-106 is about scaling before splitting. | Relink to MC-272 (patch). | yes | proposed_patches/AUD-033.json |
| AUD-034 | low | M06-L008-Q003 | 'run it' assumes a runnable environment in a predict-before-run item; the product cannot run Python (repo report, section 5). | Replace with a reasoning prompt (patch). | no | proposed_patches/AUD-034.json |
| AUD-035 | medium | M06-L008-Q004 | The tests compare against np.std (ddof=0) of the imputed training rows, but the task never says so. | State ddof=0 on imputed training rows in the expected behaviour (patch), or accept either ddof in the tests. | no | proposed_patches/AUD-035.json |
| AUD-036 | high | M06-L008-Q005 | Key is 396 characters against at most 114 (3.47x). | Shorten the key and replace D with a plausible leakage suspect (patch). | no | proposed_patches/AUD-036.json |
| AUD-037 | medium | M06-L008-Q006 | The tests check only that the future and the same day are excluded, not the 7-day window. | Add a failing test with exact expected values (patch; values auditor-recomputed: f[1] = 0, f[3] = 1, f[10] = 6, f[19] = 15). | no | proposed_patches/AUD-037.json |
| AUD-038 | low | M06-L008-Q007 | Tagged O05 (redesign a leaky workflow), but the problem statement prescribes every fitted step, so no redesign is asked for. | Tag the item to O03 only (patch). | yes | proposed_patches/AUD-038.json |
| AUD-039 | high | M06-L008-Q009 | R07-R10 are required for pass but assess M09 operating-point content outside O04; a learner meeting O04 fully still fails. | Make R07-R10 credit-earning but not required (patch), and move the operating-point reasoning to a cumulative assessment after M09 (AT-033). | yes | proposed_patches/AUD-039.json |
| AUD-040 | low | M06-L008-Q009 | MC-093 is evidenced only by optional criterion R06. | Drop the MC-093 link from this item (patch); MC-093 remains tested in Q011. | yes | proposed_patches/AUD-040.json |
| AUD-041 | high | M06-L008-Q010 | Key is 185 characters against at most 86 (2.15x) and is the only option that names both safeguards. | Shorten the key (patch). | no | proposed_patches/AUD-041.json |
| AUD-042 | high | M06-L008-Q011 | All s2 criteria are required, including R03 (M10-L005 purging), R05 (M09/M15 resampling) and R07 (M09 metrics), so the mastery item gates on untaught content. | Make R03, R05 and R07 credit-earning but not required (patch). | yes | proposed_patches/AUD-042.json |
| AUD-043 | medium | M06-L008-Q011 | The s2 prompt lists the rubric's dimensions, including the purging cue. | Remove the enumerated cues (patch). | yes | proposed_patches/AUD-043.json |

### Lesson, curriculum and architecture level

| ID | Severity | Item | Issue | Fix | SME | Patch |
|---|---|---|---|---|---|---|
| AUD-013 | low | M01-L002 | The 'verify it with NumPy' half of O02 is not assessed. | Add a step to Q002 or a new practice item that checks a hand result against NumPy, or narrow the objective (owner decision). | yes | none |
| AUD-044 | medium | M02-L006 | The prerequisite closure is 10 lessons (auditor-computed) and includes eigenvalues (M01-L006) and PSD matrices (M01-L007), reached via M02-L005 Convexity, then M02-L004 Hessians, then M01-L007. | Owner decision: make M02-L005 a soft prerequisite of M02-L006, or move the 1-D core of M02-L006 ahead of convexity, and update prerequisite_graph.json in step. | yes | none |
| AUD-045 | medium | M06-L008 | The prerequisite closure is 31 lessons (auditor-computed), including Hessians, convexity, gradient descent and MLE, because of the chain M06-L007, M05-L004, M05-L003 (which requires M02-L005 and M04-L007). | Owner decision: review the M05-L003 hard edges, or mark them soft for M06. | yes | none |
| AUD-046 | low | M06-L008 | The summary lists duplicate leakage and the items test it (Q002 s4, Q011 option D), but O01 enumerates only target leakage, contamination and temporal leakage, so those parts assess no stated objective. | Owner decision: extend O01 to include group or duplicate leakage, or drop those parts. | yes | none |
| AUD-047 | high | M01-L002, M02-L006, M06-L008 | Practice time is 55/86/103 minutes against a 20-30 minute target, and lesson_index has no time field. | Add a core/practice/deep-challenge tag per item and a lesson time budget (AT-030). | yes | none |
| AUD-048 | high | architecture/assembly_rules.json | assembly_rules specifies a provisional LLM score for rubric items, contradicting DEC-018 (no AI grader at launch). | Replace with human-only grading wording (patch). | no | proposed_patches/AUD-048.json |
| AUD-049 | medium | M01-L002 | The lesson's concepts do not list the determinant, which Q006 uses (see the Q006 determinant defect). | Owner decision: add 'determinant of a 2x2 matrix (as a test)' to M01-L002 concepts, or keep O06 at the column-dependence level and move the rank language to M01-L004. | yes | none |
| AUD-050 | high | M02-L006 | The only M02-L006 instruction is the lab, which does not teach O04 batch GD on data, 2-D conditioning or stopping criteria that items assess. | Write the lesson body (AT-031), or limit the M02-L006 core to what the lab teaches and mark Q001, Q008, Q012 and Q013 as practice or deep challenge until it exists. | yes | none |
| AUD-051 | high | M01-L002, M06-L008 | No lesson body exists in the product for either lesson (repo report, section 7), so no item can be checked against what was taught, and the prerequisite guards (PRQ-01) can only compare item text with concept names. | Write the lesson bodies before SME review, so the SME can check items against instruction (AT-031). | yes | none |
| AUD-052 | medium | labs/gradient_descent_lab.contract.json | The contract is pinned to a Next.js build-hash filename, which the repo report says will change with each build. | Re-pin the contract to lib/descent.ts, lib/step-expr.ts and components/lab-app.tsx and record the 11 differences, or classify them as defects (AT-027, owner). | yes | none |
| AUD-053 | medium | architecture/misconception_mapping.json | MAP-03 counts omissions and optional criteria as misconception evidence, which cannot separate a misconception from carelessness. | Add an evidence-strength field (strong: chosen distractor, produced defect, or diagnostic value; weak: omission or optional criterion) and let only strong evidence trigger the misconception feedback layer. | yes | none |

Systemic themes:

- **Systemic length cue** (high): In 13 of 22 single-choice decisions the key is the longest option, in 5 it is at least 2x the next longest, and among standalone single-choice items 8 of 9 key the longest option. Keys fall on A 11 times, B 5, C 3, D 3. A test-wise learner can beat chance across the bank without understanding. Validation has no option-balance check. (AUD-005, AUD-009, AUD-015, AUD-018, AUD-020, AUD-023, AUD-036, AUD-041)
- **AI grader contradiction** (high): assembly_rules.json lesson_practice rule 2 specifies a provisional LLM score, contradicting DEC-018. (AUD-048)
- **Lesson length** (high): Practice alone is 55, 86 and 103 minutes against a 20-30 minute target; no time field exists per lesson. (AUD-047)
- **Gates on untaught content** (high): Required rubric criteria in M06 Q009 and Q011 rely on M09, M10-L005 and M15-L005; M02 Q013 mastery relies on hyperbolic functions taught nowhere; M01 Q007 R04 relies on rank from M01-L004; M01 Q006 relies on the determinant, taught nowhere. (AUD-004, AUD-007, AUD-028, AUD-039, AUD-042, AUD-049)
- **Missing lesson bodies** (high): No lesson text exists for M01-L002 or M06-L008, and M02-L006 has only the lab, which does not cover O04, 2-D conditioning or stopping criteria. Items cannot be checked against instruction. (AUD-050, AUD-051)
- **Prerequisite over-tightness** (medium): Closures of 10 (M02-L006) and 31 (M06-L008) lessons include material none of the items use. (AUD-044, AUD-045)
- **Broadened misconception evidence** (medium): MAP-03 counts omissions and optional criteria as evidence; several links are weak and one (M01 Q003) is wrong. (AUD-001, AUD-033, AUD-040, AUD-053)
- **Level-4 scaffolding** (medium): Both level-4 items with steps scaffold the response (M01 Q011 s1/s3, M06 Q011 s2 prompt), contradicting "No scaffold in the prompt". (AUD-012, AUD-043)
- **Lab overlap** (medium): M02 Q003, Q004, Q009 and Q011 reproduce lab steps whose answers the lab reveals. (AUD-016, AUD-017, AUD-024)
- **Lab contract fragility** (medium): Contract pinned to minified build-hash chunks, with 11 undocumented differences. (AUD-052)

## Where validation passed but the item is still weak

All 35 items are auto_validated and the suite reports 1,134 checks with 0 errors and 11 warnings. That proves structure, schema conformance, numeric consistency and that registered mutants fail; it does not prove educational quality. Every defect in this file was present in items that passed validation. validation_results.json reports mutation 50/50 passed, yet the auditor's own mutants below passed every test of their item before patching.

- M02 Q009 (wrong fixes pass; exact lab case)
- M02 Q011 (step not required to be called)
- M02 Q012 (negative lr unchecked)
- M02 Q013 (eta above bound and Newton step pass; untaught calculus)
- M06 Q006 (wrong windows pass)
- M06 Q004 (legitimate ddof=1 fix fails)
- every length-cued item: M01 Q006, Q009; M02 Q001, Q006, Q007, Q008; M06 Q005, Q010
- M01 Q003 (misconception_evidence_resolves passed on a wrong pointer)
- M06 Q009 and Q011 (rubric structure valid; gates on untaught content)

Auditor mutants that passed every test of their item before patching: TML-M01-L002-Q010 mutant:uses_numpy_forbidden, TML-M02-L006-Q009 mutant:wrong_fix_negative_default_lr, TML-M02-L006-Q009 mutant:wrong_fix_negate_grad_function, TML-M02-L006-Q009 mutant:wrong_fix_hardcode_halving, TML-M02-L006-Q011 mutant:run_inlines_update_without_calling_step, TML-M02-L006-Q012 mutant:python_loop_over_samples_forbidden, TML-M02-L006-Q012 mutant:only_rejects_lr_equal_zero, TML-M02-L006-Q013 mutant:eta_2.1, TML-M02-L006-Q013 mutant:eta_2.2, TML-M02-L006-Q013 mutant:newton_step_not_gd, TML-M06-L008-Q006 mutant:wrong_fix_expanding_mean_not_7day, TML-M06-L008-Q006 mutant:wrong_fix_shift8_window. M01 Q010 uses_numpy passes only because no import hook was available in the auditor harness; the production sandbox is specified to block it, so it is not a test defect. M02 Q012 python_loop is unenforceable by tests (see the Q012 defect). Legitimate alternatives correctly accepted: TML-M01-L002-Q008 mutant:alt_correct_ravel_w, TML-M02-L006-Q013 mutant:eta_1.9.

## What an SME must verify

- AUD-004 (medium, M01-L002-Q006): Whether the 2x2 determinant is taught in M01-L002 is a curriculum decision.
- AUD-006 (medium, M01-L002-Q007): Numerical linear algebra judgement about the reference answer.
- AUD-007 (medium, M01-L002-Q007): Prerequisite placement of rank and consistency.
- AUD-010 (medium, M01-L002-Q011): Confirms both strategies are acceptable.
- AUD-012 (medium, M01-L002-Q011): Difficulty calibration needs an assessment specialist.
- AUD-013 (low, M01-L002): Objective scope is an owner or curriculum decision.
- AUD-016 (medium, M02-L006-Q003): Lab alignment decision (AT-027).
- AUD-017 (medium, M02-L006-Q004): Item design trade-off.
- AUD-021 (medium, M02-L006-Q007): Objective mapping.
- AUD-022 (low, M02-L006-Q007): Technical claim about loss curves.
- AUD-024 (medium, M02-L006-Q009): Lab alignment and v_lab re-run.
- AUD-028 (high, M02-L006-Q013): Mastery-item design and prerequisite judgement.
- AUD-029 (medium, M02-L006-Q013): Confirm the added constraint does not exclude intended solutions.
- AUD-030 (low, M02-L006-Q005): New misconception entry.
- AUD-032 (medium, M06-L008-Q002): Leakage taxonomy wording.
- AUD-033 (low, M06-L008-Q003): SME-07 misconception fit.
- AUD-038 (low, M06-L008-Q007): Objective mapping.
- AUD-039 (high, M06-L008-Q009): Rubric gating and placement.
- AUD-040 (low, M06-L008-Q009): SME-07.
- AUD-042 (high, M06-L008-Q011): Mastery gating.
- AUD-043 (medium, M06-L008-Q011): Difficulty calibration.
- AUD-044 (medium, M02-L006): Curriculum sequencing.
- AUD-045 (medium, M06-L008): Curriculum sequencing.
- AUD-046 (low, M06-L008): Objective wording.
- AUD-047 (high, M01-L002, M02-L006, M06-L008): Time calibration needs learner data.
- AUD-049 (medium, M01-L002): Curriculum scope.
- AUD-050 (high, M02-L006): Instruction-assessment alignment.
- AUD-051 (high, M01-L002, M06-L008): SME review is not meaningful without instruction.
- AUD-052 (medium, labs/gradient_descent_lab.contract.json): Lab owner confirmation.
- AUD-053 (medium, architecture/misconception_mapping.json): SME-07.

Nothing in this audit marks any item SME-approved, and no review_state was changed. All 35 items remain `auto_validated` with `sme_approved` false, as found.

## What the auditor actually executed

- scratch/hashcheck.py: sha256 of every file under traditional_ml/ against ARTIFACT_MANIFEST.json, before (hashes_before.json) and after (hashes_after.json) the audit
- scratch/recompute_numeric.py: independent recomputation of every numeric key, distractor and diagnostic value in the three banks (output recompute_numeric_out.json); all keys correct
- scratch/recompute_m06_q003.py: simulation of M06 Q003 (select-on-all-rows vs train-only feature selection on noise, 100 seeds)
- scratch/code_harness.py: ran every coding/debugging item's reference or corrected code, every defective original, and 21 auditor-written mutants against the item's own public, hidden and failing tests, each in a fresh python -I subprocess (output code_harness_out.json). Note: no sandbox or import hook was available, so allowed_imports was not enforced.
- scratch/option_cue_analysis.py: option-length analysis of 22 single-choice decisions (output option_cue_out.json)
- scratch/build_patches.py: applied each of 39 patches to a deep copy of its source with jsonpatch 1.33, validated patched items against question.schema.json and patched banks against question_bank.schema.json with jsonschema 4.26.0 Draft202012Validator and a Registry over traditional_ml/schemas (validator sanity-checked to reject a deliberately invalid item); then applied all patches per target in sequence to a copy and validated again
- scratch/retest_patched.py: re-ran the code tests on patched copies of M02 Q009, Q011, Q012, Q013 and M06 Q004, Q006 (output retest_patched_out.json)
- scratch/build_findings.py and assemble.py: generated this file; every quoted excerpt was asserted to occur verbatim at its JSON pointer

Not executed:

- The repository validators (validate_phase1.py, validators/*) were read in part but not re-run; the 1,134-check figure is taken from validation_results.json.
- No learner data or calibration responses were available; difficulty and time judgements are expert estimates.
- The live product and lab were not opened; lab facts come from the lab contract and the repository inspection report.

Not read: traditional_ml/curriculum/coverage_matrix.json, traditional_ml/validation/phase3_5_report.json, concept_surface_forms.json, other modules' question banks.

## Source integrity

Before the audit, sha256 of the files under traditional_ml/ matched ARTIFACT_MANIFEST.json for 93 of 93 artifacts (0 mismatched, 0 missing, 0 unlisted). After the audit: 93 of 93 matched (0 mismatched, 0 missing, 0 unlisted). All 94 files (93 artifacts plus the manifest) have identical hashes before and after: True. Checked 2026-11-14 12:23 IST.

## Deliverables

- audit_findings.json (strict JSON: metadata, severity definitions, 35 question scorecards, 3 lesson scorecards, defects, curriculum-level findings, prior concerns, summary, source integrity)
- proposed_patches/ (one RFC 6902 patch per fixable defect, README.md, patch_validation_results.json), none applied
- scratch/ (all auditor scripts and their outputs)
