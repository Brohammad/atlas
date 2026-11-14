# Metrics

Every number below is a gate for the first cohort, not a dashboard requirement. We do not build charts until the collection method works. Vercel does not persist `data/events.jsonl`. `/review` says so. Keep it that way until the log has a real store.

## Collection for the first 20

Primary instrument: the result sentence each sitting already builds (`regReply`, and the equivalents on the other units). Ask each engineer to send it back. That sentence includes misses. It is honest about being self-reported, and it works on the production site today.

Secondary instrument, local only: `/api/events` accepts the names the labs send. Use it to debug the sitting. Do not quote production counts from it.

Do not add a warehouse, a session replay tool, or an A/B platform for this cohort.

## Gates

Invite 20 working engineers. Stop inviting and change the sitting if a gate fails. Do not open classification to compensate.

| Id | Measure | Gate | How |
|---|---|---|---|
| G1 | Started unit 1 | At least 10 of 20 send any regression result | Pasted `regReply` |
| G2 | Finished unit 1 | At least 6 of those 10 cleared it | Same sentence, zero misses |
| G3 | The miss is instructive | At least 4 of the people who missed reply that the idea named their actual mistake | One question in the ask-back, not a survey product |
| G4 | Transfer | At least 4 of the finishers get an unseen regression item right, sent after the sitting, not inside it | A single item we have not published in the client |
| G5 | Return | At least 3 open the track again within 7 days | Ask, until storage survives a week. A return we cannot see does not count |
| G6 | Pay | Not in this cohort | Record unsolicited "I would pay" comments. Do not put up a price |

G4 is the metric that matches the product claim. G2 without G4 means the unit is memorisable. G1 failing means the front door or the length is wrong, and more units will not fix it.

## Inside a sitting, once events are accepted

These are diagnostic, not gates:

- First-try miss rate per station. A station everyone clears is a giveaway or a slogan. A station nobody clears is ambiguous or arithmetically unfair.
- Which distractor was chosen. A distractor with zero selections gets rewritten or removed.
- Whether the code station passed after a failed behavior check. That is the implementation signal for unit 1.
- Experiment attempts on the bowls, and whether the steep bowl was passed only after a cut in the rate.

The gradient-descent lab emits `pre_answer`, `post_answer`, `hint`, `experiment_*`, `debug_*`, `apply_*`, `lesson_completed`, and related names listed in `ALLOWED_EVENT_NAMES` in `app/api/events/route.ts`. The ML units emit `line_*`, `regression_*`, `two_*`, `resid_*`, and `rate_*` names; the route accepts them. `retention_run` is allowlisted but not sent by any sitting until a retention UI exists. Use a local log to debug; do not quote production counts.

## What we will not optimize

Time on page, lesson count, daily active users, streak length, and social shares. A short sitting that produces a right answer on a new instance beats a long one that produces a cleared progress bar.

## Review cadence

After each batch of five pasted results, read the misses before writing the next unit. If the same distractor wins, fix that question. Do not add a station downstream of a broken one.
