# Journeys

## What a new visitor can do today

1. Land on `/`. The hero is the gradient-descent sitting: predict the next parameter before the chart moves.
2. Begin `/lab` at the pre-check. There is no second copy of the marketing page inside the lab.
3. Or open Fit a line at `/beginner`, or the track at `/classical`.
4. On the track, start unit 1 (bias), unit 2 (two inputs), or unit 3 (residuals) in any order. Nothing requires the previous unit.
5. Progress for each sitting is a separate `sessionStorage` key: `atlas.gd.v1`, `atlas.line.v1`, `atlas.reg.v1`, `atlas.two.v1`, `atlas.resid.v1`. Closing the tab ends the sitting. Another browser never sees it.
6. Finish unit 1 or unit 2 and read a sentence that says the next unit is closed. Unit 3 does not say that. The map, which lists all three, is the only honest navigation.
7. Events for the gradient-descent lab can be appended locally. Events for the other sittings are rejected by `/api/events` (unknown name). On the deployed site, accepted events are discarded because the filesystem does not persist.

## Journey we are willing to support

One path, still with no account:

1. Front door states the job: fit a number without calling `fit`.
2. Fit a line with no bias. Six questions. End by needing a direction, not a million random weights.
3. Search that direction on a bowl. Predict, run a fixed rate for a fixed number of steps, debug the diverging sequence `1 → −2 → 4 → −8`, write `w - lr * grad`.
4. Add a bias. Compute the partial. Write the step. Score a point that was not in the fit.
5. Add a second input. See that a zero feature contributes nothing to that weight.
6. Read residuals. Separate the sum of signed misses from the loss. Decide whether the bias should rise.
7. Carry the learning-rate lesson onto this loss (not built).
8. Beat a mean baseline on a holdout (not built).
9. Stop. The result sentence is what they send back.

Spaced recall of an unseen bowl stays in the spec for step 3 and stays off the marketed path until storage survives seven days.

## Where the current journey breaks

| Break | Consequence |
|---|---|
| Three doors, no required order | A learner can meet a partial before they have ever summed a squared error, or debug a bowl before they know what a residual is. |
| `sessionStorage` | "Continue" works inside one tab session only. The seven-day bowl cannot be reached by the person it was written for. |
| Stale endings on units 1 and 2 | The person who did the work is told to leave. |
| Answer key in the bundle | We cannot tell a cleared unit from a viewed source file. The pilot has to ask what they missed, not only whether they finished. |
| Event names rejected, and production writes dropped | We cannot compute finish rate from the deployed site. Pretending `/review` is a pilot dashboard would be false. |

## Journey we will not design yet

Signup, payment, a mentor chat, a cohort calendar, a mobile store listing, and a placement test that routes people into unbuilt modules. A placement test with nowhere to place them is a form.
