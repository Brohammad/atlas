# PRD — Atlas, regression cohort

Status: the learning surface exists. The evidence layer does not. This PRD freezes scope until 20 engineers have been through the open units.

## Problem

Working engineers are told they "know ML" when they can import an estimator and call `fit`. They cannot say what the loss is, which parameter moved, why a step diverged, or why a training point being exact says nothing about a new point. Courses either skip the mechanism or dump a math chapter before any model exists.

## User

Primary: a software engineer with Python who can read a formula and has not implemented a training step. Secondary: the author, using the same sittings to rehearse explanations for interviews and for the first cohort. See `USER_PERSONAS.md`.

## Job to be done

Give me one model, make me compute the next number, show me the consequence when I use the wrong procedure, and make me do it again on a case I have not memorized.

## Product today

Shipped and deployed:

| Surface | Route | What the learner does |
|---|---|---|
| Front door | `/` | Enters the gradient-descent sitting or the Traditional ML track |
| Gradient descent | `/lab` | Pre-check, predict, experiment on two bowls, debug a diverging step and an uphill step, write a restricted `step`, then post-check. The seven-day retention bowl is not on the run (math stays in `lib/descent.ts`). |
| Fit a line | `/beginner` | Six questions, no bias, sum of squared errors, which point owns the loss, discrete search, why search has to follow the loss |
| Track map | `/classical` | Four open units under Regression (bias, two inputs, residuals, learning rate). Other modules are titles and one-line objectives |
| Line with bias | `/classical/regression` | Predict, square, sum, partial, descent step, wrong sign, holdout, handwritten step |
| Two inputs | `/classical/two` | A partial that only the non-zero feature can move |
| Residuals | `/classical/residuals` | Sign, which point owns the loss, cancellation, raising a bias that sits under every label |
| Learning rate | `/classical/rate` | Rate on shallow vs steep line loss, diagnosis, unseen line — bowl lesson transferred to the regression loss |

Design mock at `/design` is unlinked. Pilot table at `/review` reads a local file and tells the truth on Vercel: the server does not keep the log.

## MVP

The MVP is this regression path, made measurable, and then extended by one unit at a time until a stranger can finish it.

In:

- The sittings above, with misconception feedback and a tested answer key.
- Five regression sittings on one linked path (line, gradient descent, four classical units). Learning rate is shipped at `/classical/rate` (`lib/rate.ts`). The next regression unit after pilot review is **mean baseline**, not another rate lesson.
- An event contract that accepts the events the labs already send (`ALLOWED_EVENT_NAMES` in `app/api/events/route.ts`).
- A pilot protocol for 20 engineers that does not require accounts. Script: `docs/pilot/PILOT_ASK.md`. The sittings produce a result sentence; the pilot asks for that sentence back.
- Phone layout of the same pages. The site is the app.

Out, with the reason:

| Exclusion | Reason |
|---|---|
| The other 11 modules, Pyodide, NumPy, scikit-learn | No learner has finished regression yet. A runtime does not fix an unfinished argument. |
| FastAPI, Postgres, Redis, auth, AI tutor | Progress fits in `sessionStorage`. A database starts when we need the same sitting on a second device. |
| Streaks, XP, leaderboards | They reward opening the app. A seven-day retention bowl is deferred until progress can survive a week. |
| Payments, teams, employer dashboard | Willingness to pay is unmeasured. |
| Flutter | Later, and it must call the same math, not a second copy. |
| A math textbook module before the models | Derivatives appear at the moment a partial is required. That decision is already in the units. |
| House-price project | A project on a real table comes after a learner can beat a mean baseline and explain a residual. Neither unit exists yet. |

## Success

Numeric gates are in `PRODUCT_METRICS.md`. The product claim is narrower than the vision statement: an engineer who completes the open regression units can compute a residual, a sum of squares, one partial, and one descent step, and can reject the wrong sign and a leaked or memorized training score.

## Non-goals for this cohort

Mastery scores, spaced repetition across the whole track, proctoring, and hiding answers from the client bundle. Answers ship in the JavaScript today. That is acceptable for a free practice lab. It is fatal for a paid credential. Do not sell a credential on this build.

## Open decisions

These change the product. Defaults are in force until a pilot result overturns them.

1. **Identity.** Default: anonymous `sessionStorage` per sitting. A login is justified only after we watch people lose a finished unit by closing the tab and caring.
2. **Seven-day retention.** The station is off the run. The rule stays in `lib/descent.ts`. Put the screen back only when progress survives a week.
3. **One path.** Default order: line, then gradient descent, then bias, then two inputs, then residuals, then learning rate. Endings link forward; home may still offer multiple doors until F-02 merges the front door.
4. **Durable analytics.** Default for the first 20: pasted result sentences plus a fixed event allowlist so local `/review` is not lying. A hosted table waits until paste-back fails as an operation.
5. **Price.** Default: free. The first price test is a single track, after the metric gates pass, offered to people who finished. No enterprise motion before one stranger has paid or explicitly refused.

## Risks

- We add units forever and never watch a stranger miss. Content is ahead of evidence.
- The event route accepts the ML sitting names. Production still drops accepted events on a read-only filesystem, so a finish rate cannot be quoted from Vercel.
- Answer keys in the client make "mastery" self-reported.
- Building the 140-lesson platform (engines, mastery, datasets) before a finish rate exists. That work has no user yet.
