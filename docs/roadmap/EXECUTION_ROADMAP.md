# Execution roadmap

Milestone 0 is done. The next work is the measurement hole and the two false endings, then one new unit. Dates are deliberately absent. The cohort gates in `PRODUCT_METRICS.md` are the clock.

Complexity is S (a sitting or less), M (a few sittings), L (a new subsystem). Priority P0 blocks the cohort. P1 is the next learning gain. P2 waits on a gate.

## Milestone 0 — shipped

Playable line, gradient-descent lab, bias unit with a graded step, two-input unit, residual unit, map that does not invent lessons, phone layout, production deploy. 33 node tests at the time of this document. Preserved as-is unless a task below names the file.

## Milestone 1 — make a pilot possible

No new concepts. A-01 and F-01 are in the tree: the route accepts the ML event names, and a cleared unit links to the next one. P-01, sending the ask, is the remaining step. A local log no longer drops the ML track. Production still does not keep the file.

| Id | Area | Description | User value | Pri | Depends | Complexity | Acceptance | Done when |
|---|---|---|---|---|---|---|---|---|
| A-01 | Analytics | Add the nine ML event names the labs already send to the allowlist in `app/api/events/route.ts` | A miss during a local pilot is visible | P0 | None | S | A fixture POST of `resid_answer` returns 204. An unknown name still returns 400 | Test covers the new names and one rejection |
| F-01 | Frontend | Point unit 1's ending at unit 2, and unit 2's ending at residuals | Someone who finishes is not told to stop | P0 | None | S | Copy names the next route. Phone and desktop both show it | Clicked through from a finished state |
| P-01 | Product | Write the 20-person ask: the URL, the result sentence to paste, and the single "did the idea name your mistake" question | The cohort has a script | P0 | None | S | Script lives with this roadmap's pilot note below | Ready to send |
| T-01 | Testing | Keep answer locks green for all five `lib` suites | A copy change cannot drift the math | P0 | A-01 | S | `npm test` passes | Command output shows zero failures |

## Milestone 2 — one path

F-02 and D-01 are in the tree. A cleared line opens the lab, a cleared lab opens the bias unit, and the seven-day bowl is not on the run. A fresh Begin starts at the line. Later URLs are still reachable directly.

| Id | Area | Description | User value | Pri | Depends | Complexity | Acceptance | Done when |
|---|---|---|---|---|---|---|---|---|
| C-01 | Curriculum | Order the open work as line → search → bias → two inputs → residuals | The partial is not the first time they see a square | P1 | M1 | S | Documented order matches the links | This file and the track doc agree |
| F-02 | Frontend | From each unit's end, link the next existing unit. From the home page, offer the track as the ML path and keep the lab as search inside it | One way through | P1 | F-01, C-01 | M | A fresh browser can walk all five without being told a unit is closed | Browser pass at 390px and desktop |
| D-01 | Design | Remove the seven-day retention station from the visible run, or relabel it as unavailable | We stop promising a return the storage deletes | P1 | None | S | A new user never lands on a retention screen they cannot reach a week later | Copy and route checked |

F-02 is a navigation change. It is not a rewrite of the labs.

## Milestone 3 — the next unit

The learning-rate unit is at `/classical/rate`. Baseline is the next unbuilt unit. If the first replies all miss the same station, fix that station before baseline.

| Id | Area | Description | User value | Pri | Depends | Complexity | Acceptance | Done when |
|---|---|---|---|---|---|---|---|---|
| C-02 | Curriculum | Specify numeric bowls for "learning rate on the line" with a pass threshold and locked distractors | The transfer unit is real before it is coded | P1 | Five pilot notes | M | Every option's number is the result of a named wrong procedure | Section in the track doc matches the test |
| F-03 | Frontend | Build that unit on the question runner and the existing step loop | The bowl lesson applies to the model they just fit | P1 | C-02 | M | Unseen case has no idea text. Bad run explains crossing | Browser pass, overflow 0 at 390 |
| T-02 | Testing | Lock the new answers from the points | The key cannot drift | P1 | F-03 | S | New `lib` test in `npm test` | Green |

## Milestone 4 — baseline, then the cohort gate

| Id | Area | Description | User value | Pri | Depends | Complexity | Acceptance | Done when |
|---|---|---|---|---|---|---|---|---|
| C-03 | Curriculum | Mean baseline versus the line, on a holdout | "I fitted something" stops counting as success | P1 | M3 reviewed | M | The mean's loss is computed in the test, and a worse line is rejected | Unit shipped the same way as residuals |
| P-02 | Product | Run G1–G5 | We learn whether to continue | P0 | M1, and M3 if it shipped | M | Twenty invites, results filed | Gates scored in writing |
| B-01 | Backend | Durable event store | Only if paste-back fails as an operation | P2 | P-02 shows we cannot collect | L | Events from production can be read back the next day | A deploy no longer loses them |

## Explicitly later

| Id | Area | Why it waits |
|---|---|---|
| B-02 | Accounts and storage that survives a week | G5 cannot be measured by asking, or learners demand to resume on a second device |
| P-03 | A price on one track | G1–G5 passed, and the answer key is no longer in the client for any item we call an assessment |
| C-04 | Leakage unit, then classification | G4 passed on regression |
| F-04 | Flutter | A cohort is using the site on a phone and hitting a limit the site cannot fix. Shared math, no second formula |
| C-05 | Any other module in `classicalModules` | Opening one is a new product decision, taken in writing, after C-04 |

## Pilot note (P-01)

Send: the track URL, "finish the bias unit, paste the sentence Atlas gives you, and say whether the miss explanation described the mistake you actually made." Do not send a rubric. Do not sit with them. A result produced while the author watches is not G2.

## Definition of done, for any unit

Tests lock the answers. Lint is clean on the files touched. A fresh session can miss the designed misconception and read an idea that uses their numbers. A 390px viewport does not scroll sideways. The map lists the unit. The previous unit's ending links to it. Deployed on `atlas.brohammad.tech`. Not committed unless that was asked.

## Recommendation

Implement milestone 1 next. A-01 and F-01 are the highest-leverage changes in the repo: the track is already teaching, and it is both unmeasured and lying at the finish line. Milestone 3 is the right next lesson. It is the wrong next commit.
