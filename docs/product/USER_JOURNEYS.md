# Journeys

## What a new visitor can do today

1. Land on `/`. The chart is the search question. A fresh Begin starts at the line.
2. Finish the line and the result opens `/lab` at the pre-check. There is no second copy of the marketing page inside the lab.
3. The lab and the track stay direct links. The endings are what carry a cleared sitting forward.
4. On the track, start unit 1 (bias), unit 2 (two inputs), or unit 3 (residuals) in any order. Nothing requires the previous unit.
5. Progress for each sitting is a separate `sessionStorage` key: `atlas.gd.v1`, `atlas.line.v1`, `atlas.reg.v1`, `atlas.two.v1`, `atlas.resid.v1`, `atlas.rate.v1`. Closing the tab ends the sitting. Another browser never sees it.
6. Finish unit 1 and the result offers two inputs. Finish unit 2 and the result offers residuals. Finish residuals and the result offers the learning rate. That unit is the last open one.
7. `/api/events` accepts the gradient-descent names and the ML sitting names. On the deployed site the write is discarded because the filesystem does not persist.

## Journey we are willing to support

One path, still with no account:

1. Front door states the job: fit a number without calling `fit`.
2. Fit a line with no bias. Six questions. End by needing a direction, not a million random weights.
3. Search that direction on a bowl. Predict, run a fixed rate for a fixed number of steps, debug the diverging sequence `1 → −2 → 4 → −8`, write `w - lr * grad`.
4. Add a bias. Compute the partial. Write the step. Score a point that was not in the fit.
5. Add a second input. See that a zero feature contributes nothing to that weight.
6. Read residuals. Separate the sum of signed misses from the loss. Decide whether the bias should rise.
7. Carry the learning-rate lesson onto this loss at `/classical/rate` (shipped).
8. Beat a mean baseline on a holdout (not built).
9. Stop. The result sentence is what they send back.

The seven-day bowl is not on the run. `retentionDue` stays tested in `lib/descent.ts`. The screen comes back only when storage can still be there a week later.

## Where the current journey breaks

| Break | Consequence |
|---|---|
| Doors stay open out of order | The endings point line → search → bias → two inputs → residuals. Nothing stops a learner from opening a later URL first. |
| `sessionStorage` | "Continue" works inside one tab session only. The seven-day bowl cannot be reached by the person it was written for. |
| Answer key in the bundle | We cannot tell a cleared unit from a viewed source file. The pilot has to ask what they missed, not only whether they finished. |
| Production writes dropped | We cannot compute finish rate from the deployed site. Local `/review` can. Pretending the Vercel log is a pilot dashboard would be false. |

## Journey we will not design yet

Signup, payment, a mentor chat, a cohort calendar, a mobile store listing, and a placement test that routes people into unbuilt modules. A placement test with nowhere to place them is a form.
