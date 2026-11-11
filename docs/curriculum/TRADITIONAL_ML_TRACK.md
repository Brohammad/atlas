# Traditional ML track

The 12-module inventory in `lib/classical.ts` is a topic list. This document is the curriculum. Only the units in the first section exist. Everything after "Not built" is a sequence decision, not a pile of unwritten lessons.

## Playable now

Math for these units is implemented and tested. Formulas below match the code. Loss is the sum of squared errors, `(ŷ − y)²`, not the mean, except where a station says otherwise.

### Fit a line — `/beginner` — `lib/line.ts`

Model `ŷ = w x`. No bias. Points `(1, 1), (2, 3), (4, 6)`.

| Station | Objective | Misconception the distractors encode |
|---|---|---|
| Error | Square one miss | Report the signed miss, or the label |
| Total | Sum three squares at `w = 1` (loss 5) | Average them, or ignore a point |
| Source | Attribute the loss at `w = 1.5` | "Every point has loss" or "larger x has the loss" |
| Weight | Keep the weight with the smaller sum | Prefer an exact point, or a larger weight |
| New point | Score `(2, 2)` on its own | Reuse the training loss |
| Search | Follow the direction that reduces the loss | Random search, exact hits, or the average of tried weights |

Prerequisite: none. This is the real start of the track. Outcome: the learner can score a weight and say why trying weights at random is the wrong search.

### Gradient descent — `/lab` — `lib/descent.ts`, `lib/lesson.ts`

Bowl `L(w) = (k/2) (w − μ)²`, gradient `k (w − μ)`, update `w ← w − η ∇L`. Stable when `0 < η < 2/k`. For `L = w²`, `k = 2`, so the stable rates are `(0, 1)`. Rate `1.5` multiplies the error by `−2` and produces `1, −2, 4, −8`.

Stations: pre-check, one-step prediction, a 10-step experiment on a flat bowl and a steep bowl, debug of that diverging walk and of an ascent update, a restricted step function, an unseen bowl, and a retention bowl that the storage cannot deliver a week later.

Prerequisite we want: Fit a line. Prerequisite we enforce: none. Outcome: the learner can tell a long step from an uphill step, and can write the update.

### Bias and one step — `/classical/regression` — `lib/classical.ts`

Model `ŷ = w x + b` with `w = 1`, `b = 2`, rate `0.05`. Points `(1, 3), (2, 5), (4, 7)`. Predictions `3, 4, 6`. Loss `2`. `∂L/∂w = −12`. Descent lands on `1.6`. Adding the partial lands on `0.4`. Using `−6` instead of `−12` lands on `1.3`. Holdout `(3, 6)` has squared error `1`.

The code station must return the descent value `1.6`, not merely a plausible function of `w`, `grad`, and `lr`.

Prerequisite we want: the line unit and one descent step. Outcome: the learner can push a derivative through `ŷ` and can refuse the wrong sign.

### Two inputs — `/classical/two` — `lib/two.ts`

`ŷ = w1 x1 + w2 x2 + b` at weights `1, 1, 1`, rate `0.25`. Points `(1, 1, 3), (1, 0, 3), (0, 2, 5)`. The middle point has `x2 = 0`, so it does not move `w2`. `∂L/∂w2 = −8`. Descent sets `w2` to `3`. Forgetting the factor of two yields `−4` and a different step.

Prerequisite we want: the bias unit. Outcome: the learner attributes a partial to the feature that is present.

### Residuals — `/classical/residuals` — `lib/resid.ts`

`ŷ = x + 1` on `(1, 2), (2, 5), (4, 4)` gives residuals `0, −2, +1`, squares `0, 4, 1`, sum of residuals `−1`, loss `5`. A lower line `ŷ = x` on `(1, 3), (2, 4), (3, 6)` has residuals `−2, −2, −3` and loss `17`. Raising the bias by 2 leaves loss `1`.

Prerequisite we want: a sum of squares. Outcome: the learner can tell a signed miss from a loss, name the point that owns the loss, and raise a bias that is under every label.

## Ordering critique of the 12-module inventory

The inventory lists mathematical foundations, data preparation, regression, classification, trees, neighbors and margins, unsupervised learning, dimensionality reduction, model selection, feature engineering, probabilistic models, and production, with 10 to 13 lessons each. The sum is 140. Problems:

- **Foundations as module 1** repeats calculus before a model exists. The partial in unit 1 is the first derivative the learner needs. A separate NumPy workbook does not make that partial easier.
- **Data preparation before any loss** teaches splits in the abstract. The holdout station already introduces "a new point has its own error." Leakage belongs after that, on a table where a column contains the answer, not before the first line.
- **Model selection after trees, margins, and unsupervised work** asks the learner to trust scores they have no way to doubt. The minimum earlier move is a mean baseline and one holdout, inside regression, before a second algorithm.
- **Feature engineering after model selection** is backwards for tabular work. A feature is justified when it changes a holdout error against a baseline. That is a regression unit, not a late elective.
- **Probabilistic models as their own module** splits logistic regression away from classification and splits mixtures away from clustering. Teach the probability when the loss or the decision needs it.
- **Production as a closing module** with nothing trained on data the learner did not type in by hand is a deployment diagram. Serving waits until a model is worth serving.
- **Ensembles before a single shallow tree** would hide impurity behind a library call. When that module opens, the first object is one split.
- **Dimensionality reduction before a failure caused by dimension** is a visualization. PCA opens when a distance or a linear model has already broken because of unused coordinates.

Missing from regression, and more important than any of those modules:

- A **mean baseline**, so a loss has a comparator.
- The **learning rate on this sum of squares**, so the bowl lesson is not stranded at `/lab`.
- **Feature scale**, one station, when two inputs have different magnitudes. Unit 2 uses small integers and correctly does not pretend to teach scaling.
- **Closed form as a check**, once, after the step is understood. The normal equations define the least-squares solution. Gradient descent is a way to reach it. Teaching the formula first invites memorizing it. Teaching it never leaves the learner unable to see that iteration is not the definition.
- **Train and test as a procedure** on more than one held-out point, including a column that leaks.

Not missing, and not worth a lesson yet: logistic regression, trees, SVM, PCA, boosting, MLOps. Each is a later track decision.

## Duplication we are keeping

Fit a line and the bias unit both square an error and both score a new point. The second unit adds `b`, the chain rule, the sign of the update, and a graded step. That is a second encounter with a harder model, which is what we want. Deleting the first unit to look efficient would make the partial the first time a learner sees a squared error.

## Next unit — specified, not built

**Learning rate on the line.** Working title only. No route until it is implemented.

Objective: the same rate that reduces the loss on a shallow sum of squares overshoots on a steeper one, and the learner can see it in `w` and in the loss after a fixed number of steps.

Prerequisites: bias unit and the bowl experiment.

Concept: curvature of this loss, not a new optimizer.

Misconceptions to encode: a larger rate is always better; if one step decreased the loss, ten steps will; the bowl was a special case that does not apply once there is a bias.

Activity: pick a rate, run a fixed count of steps on two lines, read `w`, loss, and whether the parameter crossed the best weight. Pass condition is the loss after the last step, stated in the setup. Do not reveal which rate fails before the run.

Prediction, before the run: which rate will still be short of the best weight after the fixed count.

Debug, after a bad run: the trace crossed the best weight and the loss rose. The idea uses their rate and their weights.

Implementation: none in this unit. The step function already exists. A second code box here is filler.

Assessment: unseen line, new start, no idea text, loss under a stated threshold. Record the result separately from the practice runs.

Mastery claim allowed: the learner can cut a rate because the loss got worse, and can say that the steeper line was the reason. No claim about Adam, schedules, or batch size.

## After that, still regression, still one at a time

1. **Baseline.** Predict the mean of `y`. Compute its loss. Keep the line only if its holdout loss is smaller. Misconception: any fitted line is an improvement; `R²` without a baseline.
2. **Leak.** One extra column that is a copy of `y`. The training loss collapses and the honest column's holdout does not. Misconception: the lowest training loss is the best model.

Then stop the track and run the cohort. Classification is the module after a passed G4, not the reward for finishing a document.

## Per-lesson templates for unbuilt modules

Not written. A full objective, misconception list, and activity for 130 lessons we will not teach this year would be fiction, and fiction in the curriculum is how the map grew fake lesson counts. When a module is allowed to open, its first unit gets a section of the same shape as "Next unit" before any component is created.
