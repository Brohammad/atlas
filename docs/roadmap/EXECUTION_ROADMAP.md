# Execution roadmap

Milestone 0 is done. Milestone 1 analytics and linking are largely in the tree; the pilot script is in `docs/pilot/PILOT_ASK.md`. Milestone 3 (learning rate) is shipped. The next curriculum commit after pilot signal is **baseline** (Milestone 4 C-03). Dates are deliberately absent. The cohort gates in `PRODUCT_METRICS.md` are the clock.

**Verification baseline (14 November 2026):** `npm test` — **41** passing tests (seven `lib/*.test.ts` files, including full `ALLOWED_EVENT_NAMES` coverage in `lib/events.test.ts`).

Complexity is S (a sitting or less), M (a few sittings), L (a new subsystem). Priority P0 blocks the cohort. P1 is the next learning gain. P2 waits on a gate.

## Milestone 0 — shipped

Playable line, gradient-descent lab, bias unit with a graded step, two-input unit, residual unit, **learning-rate unit**, map that does not invent lessons, phone layout, production deploy. 41 node tests as of 14 November 2026. Preserved as-is unless a task below names the file.

## Milestone 1 — make a pilot possible

| Id | Area | Description | User value | Pri | Depends | Complexity | Acceptance | Status |
|---|---|---|---|---|---|---|---|---|
| A-01 | Analytics | ML and GD event names on the allowlist in `app/api/events/route.ts` | A miss during a local pilot is visible | P0 | None | S | `resid_answer` and GD names return 204; unknown returns 400 | **Done** — `ALLOWED_EVENT_NAMES`; `lib/events.test.ts` covers full allowlist |
| F-01 | Frontend | Unit endings link to the next unit | Someone who finishes is not told to stop | P0 | None | S | Copy names the next route | **Done** |
| P-01 | Product | Pilot ask script | The cohort has a script | P0 | None | S | `docs/pilot/PILOT_ASK.md` | **Done** |
| T-00 | Testing | Event allowlist regression | Allowlist cannot drift from tests | P0 | A-01 | S | Every `ALLOWED_EVENT_NAMES` entry returns 204 | **Done** |
| T-01 | Testing | Answer locks green for all unit `lib` suites | A copy change cannot drift the math | P0 | A-01 | S | `npm test` passes | **Done** (41 tests) |

Production still does not persist `data/events.jsonl` on Vercel. P-01 script is ready to send; **the pilot has not been run or validated in this repo.**

## Milestone 2 — one path

F-02 partially shipped via forward links. D-01 (retention off the visible run) is in the tree.

| Id | Area | Description | User value | Pri | Depends | Complexity | Acceptance | Status |
|---|---|---|---|---|---|---|---|---|
| C-01 | Curriculum | Order: line → search → bias → two inputs → residuals → rate | Documented order matches links | P1 | M1 | S | Track doc + journeys agree | **Done** (docs); home still multi-door |
| F-02 | Frontend | One path from home without removing deep links | One way through | P1 | F-01, C-01 | M | Fresh browser walks all six via endings | **Partial** |
| D-01 | Design | Seven-day retention station not navigable | No false promise of a week-later bowl | P1 | None | S | New user never lands on retention UI | **Done** — `retention` stage → `results`; `retention_run` not emitted |

F-02 is a navigation change. It is not a rewrite of the labs.

## Milestone 3 — learning rate (shipped)

| Id | Area | Description | User value | Pri | Depends | Complexity | Acceptance | Status |
|---|---|---|---|---|---|---|---|---|
| C-02 | Curriculum | Numeric bowls for learning rate on the line | Transfer unit specified | P1 | Five pilot notes | M | Track doc matches tests | **Done** — `TRADITIONAL_ML_TRACK.md`, `lib/rate.ts` |
| F-03 | Frontend | Unit at `/classical/rate` | Bowl lesson on regression loss | P1 | C-02 | M | Unseen case, line experiments | **Done** |
| T-02 | Testing | Lock rate answers | Key cannot drift | P1 | F-03 | S | `lib/rate.test.ts` in `npm test` | **Done** |

**Next lesson to build:** mean baseline (Milestone 4 C-03), not another rate change.

## Milestone 4 — baseline, then the cohort gate

| Id | Area | Description | User value | Pri | Depends | Complexity | Acceptance | Done when |
|---|---|---|---|---|---|---|---|---|
| C-03 | Curriculum | Mean baseline versus the line, on a holdout | "I fitted something" stops counting as success | P1 | M3 reviewed | M | Mean loss in test; worse line rejected | Not started |
| P-02 | Product | Run G1–G5 | We learn whether to continue | P0 | M1 | M | Twenty invites, results filed | Not started |
| B-01 | Backend | Durable event store | Only if paste-back fails | P2 | P-02 | L | Events readable next day | Not started |

## Explicitly later

| Id | Area | Why it waits |
|---|---|---|
| B-02 | Accounts and storage that survives a week | G5 cannot be measured by asking, or learners demand to resume on a second device |
| P-03 | A price on one track | G1–G5 passed, and the answer key is no longer in the client for any item we call an assessment |
| C-04 | Leakage unit, then classification | G4 passed on regression |
| F-04 | Flutter | A cohort is using the site on a phone and hitting a limit the site cannot fix. Shared math, no second formula |
| C-05 | Any other module in `classicalModules` | Opening one is a new product decision, taken in writing, after C-04 |

## Pilot ask (P-01)

See **`docs/pilot/PILOT_ASK.md`**. Short version: send the regression unit URL, ask for the pasted result sentence, and ask whether the miss idea named their actual mistake.

## Definition of done, for any unit

Tests lock the answers. Lint is clean on the files touched. A fresh session can miss the designed misconception and read an idea that uses their numbers. A 390px viewport does not scroll sideways. The map lists the unit. The previous unit's ending links to it. Deployed on `atlas.brohammad.tech`. Not committed unless that was asked.

## Recommendation

Send the pilot ask (`PILOT_ASK.md`) and collect the first five pasted replies before building baseline (C-03). Fix any station that wins the same distractor in those replies. Do not open classification to compensate for a failed gate.