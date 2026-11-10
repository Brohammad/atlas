import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  APPLY_STEPS,
  DEBUG_OSC_LR,
  DEBUG_SIGN_LR,
  EXPERIMENT_STEPS,
  LOSS_OK,
  debugBowl,
  flatBowl,
  gradient,
  loss,
  predictItems,
  reachedLoss,
  retentionBowl,
  retentionDue,
  runDescent,
  stableLearningRate,
  steepBowl,
  teachBowl,
  unseenBowl,
  TEACH_LR,
  RETENTION_STEPS,
} from "./descent.ts";
import { checkStepSource, evaluateStep } from "./step-expr.ts";

describe("gradient descent", () => {
  it("moves opposite a positive slope on the teaching bowl", () => {
    const trace = runDescent(teachBowl, TEACH_LR, 1);
    const first = trace[0];
    const second = trace[1];
    assert.ok(first && second);
    assert.equal(first.grad, gradient(teachBowl, teachBowl.w0));
    assert.ok(first.grad > 0);
    assert.ok(second.w < first.w);
    assert.ok(second.loss < first.loss);
  });

  it("predicts the three specified updates, including the wrong calculations", () => {
    const [one, exact, four] = predictItems;
    assert.ok(one && exact && four);
    assert.equal(runDescent(one.bowl, one.lr, one.steps).at(-1)?.w, 2.4);
    assert.equal(3 - 0.1 * 3, 2.7);
    assert.equal(3 + 0.1 * 6, 3.6);

    assert.equal(runDescent(exact.bowl, exact.lr, exact.steps).at(-1)?.w, 0);
    assert.equal(loss(exact.bowl, 0), 0);
    assert.equal(4 - 0.5 * 4, 2);
    assert.equal(4 - 0.5 * 16, -4);

    const blown = runDescent(four.bowl, four.lr, four.steps);
    assert.deepEqual(
      blown.map((point) => point.w),
      [1, -2, 4, -8, 16],
    );
    assert.equal(stableLearningRate(four.bowl.k, four.lr), false);
    assert.equal(Math.pow(-0.5, 4), 1 / 16);
    assert.equal(Math.pow(-3, 4), 81);
    let subtracted = 1;
    for (let i = 0; i < 4; i++) subtracted -= 1.5;
    assert.equal(subtracted, -5);
  });

  it("accepts 0.4 on the flat bowl and rejects it on the steep bowl", () => {
    assert.equal(reachedLoss(runDescent(flatBowl, 0.4, EXPERIMENT_STEPS), EXPERIMENT_STEPS, LOSS_OK), true);
    assert.equal(reachedLoss(runDescent(steepBowl, 0.4, EXPERIMENT_STEPS), EXPERIMENT_STEPS, LOSS_OK), false);
    assert.equal(reachedLoss(runDescent(steepBowl, 0.1, EXPERIMENT_STEPS), EXPERIMENT_STEPS, LOSS_OK), true);
    const grid = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.6, 0.8, 1];
    const both = grid.filter(
      (lr) =>
        reachedLoss(runDescent(flatBowl, lr, EXPERIMENT_STEPS), EXPERIMENT_STEPS, LOSS_OK) &&
        reachedLoss(runDescent(steepBowl, lr, EXPERIMENT_STEPS), EXPERIMENT_STEPS, LOSS_OK),
    );
    assert.deepEqual(both, []);
  });

  it("oscillates upward at the debug learning rate and walks uphill when the sign is flipped", () => {
    const osc = runDescent(debugBowl, DEBUG_OSC_LR, 4);
    assert.ok((osc[1]?.loss ?? 0) > (osc[0]?.loss ?? 0));
    assert.ok((osc[1]?.w ?? 0) < 0);
    assert.ok(Math.abs(osc[2]?.w ?? 0) > Math.abs(osc[1]?.w ?? 0));

    const up = runDescent(debugBowl, DEBUG_SIGN_LR, 4, "ascent");
    for (let i = 1; i < up.length; i++) {
      assert.ok((up[i]?.loss ?? 0) > (up[i - 1]?.loss ?? 0));
      assert.ok((up[i]?.delta ?? 0) === 0 || Math.sign(up[i - 1]?.delta ?? 0) === Math.sign(up[i - 1]?.grad ?? 0));
    }
  });

  it("has a non-empty pass band on the unseen and retention bowls", () => {
    const unseenRates = [0.05, 0.1, 0.15, 0.2, 0.5];
    const unseenPass = unseenRates.filter((lr) =>
      reachedLoss(runDescent(unseenBowl, lr, APPLY_STEPS), APPLY_STEPS, LOSS_OK),
    );
    assert.ok(unseenPass.includes(0.15));
    assert.ok(!unseenPass.includes(0.5));

    const keep = [0.05, 0.1, 0.2, 0.4, 0.6].filter((lr) =>
      reachedLoss(runDescent(retentionBowl, lr, RETENTION_STEPS), RETENTION_STEPS, LOSS_OK),
    );
    assert.ok(keep.includes(0.2));
    assert.ok(!keep.includes(0.6));
  });

  it("waits seven days before the retention bowl", () => {
    const start = Date.parse("2026-11-10T00:00:00Z");
    assert.equal(retentionDue(start, start + 6 * 86_400_000), false);
    assert.equal(retentionDue(start, start + 7 * 86_400_000), true);
  });
});

describe("step expression", () => {
  it("evaluates a correct update and rejects the wrong sign", () => {
    const good = "def step(w, grad, lr):\n    return w - lr * grad\n";
    const bad = "def step(w, grad, lr):\n    return w + lr * grad\n";
    assert.deepEqual(evaluateStep(good, { w: 3, grad: 2, lr: 0.5 }), { ok: true, value: 2 });
    assert.equal(checkStepSource(good).ok, true);
    assert.equal(checkStepSource(bad).ok, false);
    assert.equal(checkStepSource("def step(w, grad, lr):\n    return w\n").ok, false);
  });

  it("rejects names outside the step", () => {
    const result = evaluateStep("def step(w, grad, lr):\n    return w - lr * loss\n", {
      w: 1,
      grad: 1,
      lr: 0.1,
    });
    assert.equal(result.ok, false);
  });
});
