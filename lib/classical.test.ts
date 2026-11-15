import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FIT_B,
  FIT_LR,
  FIT_W,
  classicalModules,
  descend,
  partialW,
  predictLinear,
  regressionCodeNote,
  regressionQuestions,
  regressionStepCases,
  squaredGap,
  sumSquaredError,
  trainPoints,
} from "./classical.ts";
import { checkStepSource, evaluateStep } from "./step-expr.ts";

describe("linear regression unit", () => {
  it("predicts 1.5 x + 1 at x = 2", () => {
    assert.equal(predictLinear(1.5, 1, 2), 4);
    assert.equal(predictLinear(1.5, 0, 2), 3);
    assert.equal(1.5 + 1, 2.5);
  });

  it("squares one miss of 1", () => {
    assert.equal(squaredGap(4, 5), 1);
    assert.equal(4 - 5, -1);
    assert.equal(5 * 4, 20);
  });

  it("sums the worked fit to 2 and the partial to −12", () => {
    assert.deepEqual(
      trainPoints.map((point) => predictLinear(FIT_W, FIT_B, point.x)),
      [3, 4, 6],
    );
    assert.equal(sumSquaredError(FIT_W, FIT_B), 2);
    assert.equal(partialW(FIT_W, FIT_B), -12);
    assert.equal(
      trainPoints.reduce((sum, point) => sum + point.y, 0),
      15,
    );
  });

  it("steps to 1.6 by descent and to 0.4 by adding the partial", () => {
    assert.equal(descend(FIT_W, -12, FIT_LR), 1.6);
    assert.ok(Math.abs(FIT_W + FIT_LR * -12 - 0.4) < 1e-9);
    assert.equal(descend(FIT_W, -6, FIT_LR), 1.3);
  });

  it("raises loss after the taught unit step while moving in gradient direction", () => {
    assert.equal(sumSquaredError(FIT_W, FIT_B), 2);
    assert.ok(Math.abs(sumSquaredError(1.6, FIT_B) - 2.36) < 1e-9);
    assert.ok(sumSquaredError(1.6, FIT_B) > sumSquaredError(FIT_W, FIT_B));
  });

  it("scores the held-out point on its own", () => {
    assert.equal(predictLinear(FIT_W, FIT_B, 3), 5);
    assert.equal(squaredGap(5, 6), 1);
    assert.notEqual(squaredGap(5, 6), sumSquaredError(FIT_W, FIT_B));
  });

  function regressionStepPasses(source: string): boolean {
    if (!checkStepSource(source).ok) return false;
    for (const triple of regressionStepCases) {
      const got = evaluateStep(source, triple);
      if (!got.ok || Math.abs(got.value - descend(triple.w, triple.grad, triple.lr)) > 1e-9) {
        return false;
      }
    }
    return true;
  }

  it("accepts a descent step and rejects the starter, wrong sign, and constants", () => {
    const inputs = { w: FIT_W, grad: partialW(FIT_W, FIT_B), lr: FIT_LR };
    const good = evaluateStep("def step(w, grad, lr):\n    return w - lr * grad\n", inputs);
    const goodSource = "def step(w, grad, lr):\n    return w - lr * grad\n";
    const altSource = "def step(w, grad, lr):\n    return w - grad * lr\n";
    assert.equal(regressionStepPasses(goodSource), true);
    assert.equal(regressionStepPasses(altSource), true);
    const success = regressionCodeNote(1.6);
    assert.equal(success.ok, true);
    assert.match(success.note, /2\.36/);
    assert.match(success.note, /learning rate was too large/i);
    assert.doesNotMatch(success.note, /lower loss/i);
    assert.equal(regressionStepPasses("def step(w, grad, lr):\n    return 1.6\n"), false);
    assert.equal(regressionStepPasses("def step(w, grad, lr):\n    return w + lr * grad\n"), false);
    const bad = evaluateStep("def step(w, grad, lr):\n    return w + lr * grad\n", inputs);
    const half = evaluateStep("def step(w, grad, lr):\n    return w - 0.5 * lr * grad\n", inputs);
    assert.equal(good.ok, true);
    assert.equal(bad.ok, true);
    if (bad.ok) {
      assert.equal(regressionCodeNote(bad.value).ok, false);
      assert.match(regressionCodeNote(bad.value).note, /0\.4/);
    }
    assert.equal(half.ok, true);
    if (half.ok) {
      assert.equal(regressionCodeNote(half.value).ok, false);
      assert.match(regressionCodeNote(half.value).note, /1\.3/);
    }
  });

  it("locks the published answers", () => {
    assert.deepEqual(
      regressionQuestions.map((question) => question.answer),
      ["4", "1", "2", "-12", "1.6", "0.4", "1"],
    );
    for (const question of regressionQuestions) {
      assert.equal(question.options.some((option) => option.id === question.answer), true);
      assert.equal(new Set(question.options.map((option) => option.id)).size, 4);
    }
  });

  it("keeps regression as the only open module", () => {
    assert.equal(classicalModules.length, 12);
    assert.deepEqual(
      classicalModules.filter((mod) => mod.status === "open").map((mod) => mod.id),
      ["regression"],
    );
  });
});
