# Lesson design standard

A unit is a sequence of questions about one mechanism. It is not a chapter with a quiz at the end. The standard is the pattern already used in `lib/lesson.ts`, `lib/line.ts`, `lib/classical.ts`, `lib/two.ts`, and `lib/resid.ts`.

## Question

Each question has:

- `setup` — the model, the points, and the rule of the calculation. State what is included (bias or not, sum or mean, how many steps, what "cleared" means).
- `prompt` — one decision.
- `options` — four. The right one is a procedure. Each wrong one is a procedure a competent person might actually run: drop the factor of two, add the partial, treat the residual as the loss, read a negative residual as "line too high."
- `answer` — an id, locked by a node test that recomputes the quantity from the points.
- `idea` — shown after a miss. It must use the learner's numbers. "Incorrect, the answer is B" is a failed question.

Arithmetic in the distractors must be the arithmetic of that wrong procedure, not a nearby random number. If two procedures land on the same number, change the instance.

## Levels

Use the cheapest level that still requires a judgment.

| Level | Demand | Example already shipped |
|---|---|---|
| Recall | Name the operation | Pre-check: a step moves opposite the slope |
| Prediction | Compute the next value | ŷ at x = 2; w after one descent step |
| Diagnosis | Say what the trace implies | `1 → −2 → 4 → −8` means the rate is past the stable range |
| Intervention | Choose the change | All residuals negative, so raise the bias |
| Transfer | A case that was not the worked example | Holdout point; retention bowl; the code station |

A unit that is only recall is a glossary. A unit that is only arithmetic with the formula printed above the options is a calculator. Prediction questions should withhold the intermediate the learner is supposed to form. The new-point station on Fit a line hides ŷ for this reason.

## Stages

Pick stages the mechanism needs. Do not march every unit through a fixed eleven.

| Stage | Use when | Do not use when |
|---|---|---|
| Hook | The first screen of a track, once | Inside a unit that already has a setup |
| Predict | The next number is determined | The learner has no rule yet |
| Experiment | A parameter changes the trace and the pass condition is numeric | The widget decorates a paragraph |
| Calculate | A derivative or a sum is the skill | The setup already prints the result |
| Debug | A log is wrong for a reason | The question restates an earlier multiple choice |
| Implement | The expression is gradable | The only check is "it looks like Python" |
| Apply / prove | The instance is new and the hints are off | We still have to teach the operation |
| Recall | Days later, new instance, no idea text | Storage cannot bring them back |

Shipped instances:

- Bowls: predict, then run 10 steps at a fixed rate, pass only if the loss after step 10 is under 0.05. Feedback after the run describes crossing or falling short. It does not announce the failure before the run.
- Debug: the log is visible, rows that move away from the minimum are marked, and the idea explains the multiplier.
- Code: a restricted `def step(w, grad, lr)` graded by behavior and by an exact descent result. The starter `return w` fails. A half-step can pass a loose behavior check and still fail the numeric check. That split is intentional.
- Residuals: the sign question is an intervention. The feedback distinguishes "below the label" from "line too high."

## Authoring rules

1. One new idea per station. Unit 2's idea is "a zero input does not move that weight," not a second copy of the bias partial.
2. The loss definition stays stable inside a unit. We use the sum of squared errors, not the mean, unless the station is about that difference.
3. State the step count and the pass threshold in the setup. "Try until it looks small" is not gradable.
4. Do not spoil the experimental result in the prompt.
5. The idea never appears on a no-hint transfer station.
6. Every numeric answer is recomputed in `lib/*.test.ts` from the points. A changed point that leaves the old answer in place is a broken unit.
7. Distractors with no selections across a real cohort get cut. We have no such cohort yet, so this rule waits.
8. Do not add a twentieth multiple choice to avoid writing an experiment. The bowl runner and the step grader are the expensive interactions. More of those, fewer slogans.
9. Closed modules do not get lesson bodies, empty routes, or counts in the UI.

## Mastery, as far as this build can claim

A unit is cleared when every station is right, including the code station where one exists. That is a progress fact. It is not independent competence. Independent competence requires an unseen item that is not in the bundle (metric G4) and, later, a return visit the product can actually remember.

## Accessibility

The phone width is 390 CSS pixels with no horizontal overflow. Options are real controls. The next value is text, not only a chart. Color is not the only signal for a miss.
