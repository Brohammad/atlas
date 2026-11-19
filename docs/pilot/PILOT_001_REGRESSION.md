# Atlas — Pilot 001

## Regression learning validation

**Objective:** Determine whether Atlas helps working software engineers understand linear regression, gradient descent, and learning-rate stability.

**Cohort:** 5 working software engineers  
**Recruit for:** ~75 minutes (buffer included; do not advertise 45 minutes)  
**Product scope:** Existing regression learning path  
**Facilitator:**  
**Date:**  
**Participant ID:** P01 / P02 / P03 / P04 / P05

**Production entry (send to participants):** https://atlas.brohammad.tech/beginner

**Facilitator:** For the full path, participants should reach `https://atlas.brohammad.tech/lab` and the classical units from the hub or map—not only the regression deep link in `PILOT_ASK.md`.

**Pre-session regression checklist (non-blocking):** Clear `atlas.line.v1`, complete all six beginner stations, confirm the **Gradient descent lab** link appears and opens `/lab` with a fresh sitting.

Related: lightweight async ask in `PILOT_ASK.md` (no facilitator, unit-1-only). Pilot 001 is facilitated, full path, baseline/post/interview.

**Session timing (facilitator):**

| Activity | Duration |
| --- | --- |
| Baseline | 5 min |
| Atlas session | 45–60 min |
| Post-assessment | 5–10 min |
| Interview | 10 min |
| **Total** | **65–85 min** |

**During the five sessions:** Do not change the product because one participant struggles. Record issues, look for repetition across the cohort, then change after review.

---

## 1. Baseline assessment — before Atlas (5 minutes)

Do not explain concepts or provide hints. Record the participant's answers verbatim where possible.

**Q1. What is gradient descent?**

Ask the participant to explain it in their own words.

Response / observations:

**Q2. Learning-rate scenario**

(Distinct numbers from post-assessment Q3; same concept—overshoot with a large learning rate.)

Consider:

\[
L(w)=(w-3)^2
\]

At \(w=1\), the gradient is \(-4\). The learning rate is \(1.25\).

What do you think happens to the parameter and the loss after one update? Explain your reasoning.

Response / observations:

**Expected facilitator answer (do not reveal):**

- Initial loss: 4
- Updated parameter: 6
- New loss: 9
- The update overshoots the minimum

**Baseline confidence:** Low / Medium / High

---

## 2. Learning session — Atlas (45–60 minutes of the full block)

Give the participant the starting URL:

`/beginner` (production: https://atlas.brohammad.tech/beginner)

**Expected journey:**

`/beginner` → `/lab` → `/classical/regression` → `/classical/two` → `/classical/residuals` → `/classical/rate` → `/classical/baseline` → `/classical/leak`

**Instructions to participant:**

- Work through the experience independently.
- Think aloud when possible.
- Do not search for external explanations.
- Ask for help naturally when stuck.
- You do not need to rush.

### Observation log

| Timestamp | Station | Observation |
| --- | --- | --- |
| | | |
| | | |
| | | |
| | | |
| | | |

**Record these events:**

- First request for a hint or explanation.
- Incorrect predictions and number of retries.
- Bowl experiment submissions and chosen rates.
- Code station attempts and failures.
- Time spent on confusing screens.
- Navigation mistakes or unexpected backtracking.
- Drop-off point, if any.
- Any moment of genuine understanding or surprise.

**Important:** Observe without teaching. If intervention is necessary, record exactly what was explained.

---

## 3. Post-assessment — without Atlas (5–10 minutes)

Close Atlas before asking these questions. Do not allow the participant to revisit the lesson.

**Q1. Gradient descent explanation**

Explain gradient descent to someone who has never encountered it. What does the gradient tell us, and what does the learning rate control?

Response:

**Q2. New quadratic problem**

Consider:

\[
L(w)=(w-2)^2
\]

Start at \(w=0\), with learning rate \(0.25\).

Calculate:

- The gradient at the starting point.
- The updated parameter after one step.
- The loss before and after the update.

**Expected facilitator answer:**

- Gradient: −4
- Updated parameter: 1
- Initial loss: 4
- New loss: 1

**Q3. Learning-rate transfer**

Now use the same starting point and loss function, but set the learning rate to \(1.25\).

What happens after one update? Why?

**Expected facilitator answer:**

- Updated parameter: 5
- New loss: 9
- The update overshoots the minimum, increasing the loss.

**Q4. Reflection**

What is one thing you understand now that you did not understand before?

Response:

**Q5. Target leakage (new curve, not in the lesson numbers)**

A model includes a feature that equals the label on every training row, so training loss is 0. At scoring time the label is not known yet.

Can you use that feature on a new row? In one sentence, why or why not?

**Expected facilitator answer:** No — it is the label (target leakage); it is not available before you predict.

Response:

---

## 4. Interview — 10 minutes

Ask without suggesting answers:

1. Which part of the experience was most confusing?
2. Where did you feel you were genuinely learning something?
3. Was anything unnecessarily repetitive or slow?
4. What would you change?
5. Would you voluntarily continue learning through Atlas? Why or why not?

Record exact phrases, not just your interpretation.

---

## 5. Facilitator scoring

### Learning outcomes

| Outcome | Baseline | Post |
| --- | --- | --- |
| Explains gradient descent | 0 / 1 / 2 | 0 / 1 / 2 |
| Understands gradient direction | 0 / 1 / 2 | 0 / 1 / 2 |
| Calculates a gradient update | 0 / 1 / 2 | 0 / 1 / 2 |
| Understands learning-rate overshoot | 0 / 1 / 2 | 0 / 1 / 2 |
| Transfers knowledge to a new example | 0 / 1 / 2 | 0 / 1 / 2 |
| Rejects a feature that copies the label at serve time | 0 / 1 / 2 | 0 / 1 / 2 |

**Scoring:**

- **0:** Incorrect or unable to explain.
- **1:** Partially correct; requires prompting or has conceptual gaps.
- **2:** Correct, independently explained.

Maximum: 10 points per assessment.

### Session outcome

- Completed entire path: Yes / No
- Needed facilitator intervention: Yes / No
- Most difficult station:
- Total completion time:
- Would voluntarily continue: Yes / No / Unsure
- Main reason:

### Final participant record

**What worked:**

**Where they struggled:**

**Misconceptions observed:**

**Unexpected behaviour:**

**Suggested improvements:**

**Would this participant recommend Atlas to another engineer? Why?**

---

## 6. Pilot 001 success criteria

Initial hypotheses, not claims of statistical significance:

- At least 4 of 5 participants complete the path.
- At least 3 of 5 score 8/10 or higher on the post-assessment.
- At least 3 of 5 independently explain why an excessively high learning rate can increase loss.
- We identify recurring friction patterns across participants.
- We identify whether participants genuinely want to continue.

**Decision after five participants:**

- Fix observed friction and repeat.
- Improve instructional explanations.
- Proceed to a larger pilot.
- Reconsider the learning experience.

**Rule:** Do not expand the curriculum based solely on positive feedback. Evidence of independent learning comes first.