import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  B,
  TWO_LR,
  W1,
  W2,
  partialFeature,
  predictTwo,
  twoLoss,
  twoPoints,
  twoQuestions,
} from "./two.ts";
import { descend } from "./classical.ts";

describe("two-input regression", () => {
  it("predicts 2 x1 + 3 x2 + 1 at (1, 2)", () => {
    assert.equal(predictTwo(2, 3, 1, 1, 2), 9);
    assert.equal(predictTwo(2, 3, 0, 1, 2), 8);
    assert.equal(3 * 2, 6);
    assert.equal(1 + 2 + 1, 4);
  });

  it("sums the worked fit to 5", () => {
    assert.deepEqual(
      twoPoints.map((point) => predictTwo(W1, W2, B, point.x1, point.x2)),
      [3, 2, 3],
    );
    assert.equal(twoLoss(), 5);
    assert.equal(
      twoPoints.reduce((sum, point) => sum + point.y, 0),
      11,
    );
  });

  it("puts the second partial on the point whose x2 is not zero", () => {
    assert.equal(partialFeature("x2"), -8);
    assert.equal(partialFeature("x1"), -2);
    const residuals = twoPoints.map(
      (point) => predictTwo(W1, W2, B, point.x1, point.x2) - point.y,
    );
    assert.deepEqual(residuals, [0, -1, -2]);
    assert.equal(
      residuals.reduce((sum, residual, index) => sum + residual * (twoPoints[index]?.x2 ?? 0), 0),
      -4,
    );
    assert.equal(2 * residuals.reduce((sum, residual) => sum + residual, 0), -6);
  });

  it("steps w2 to 3 and rejects the other procedures", () => {
    assert.equal(descend(W2, partialFeature("x2"), TWO_LR), 3);
    assert.equal(W2 + TWO_LR * partialFeature("x2"), -1);
    assert.equal(descend(W2, -4, TWO_LR), 2);
  });

  it("scores the new point on its own", () => {
    assert.equal(predictTwo(W1, W2, B, 1, 1), 3);
    assert.equal((3 - 4) ** 2, 1);
    assert.notEqual(1, twoLoss());
  });

  it("locks the published answers", () => {
    assert.deepEqual(
      twoQuestions.map((question) => question.answer),
      ["9", "5", "-8", "3", "1"],
    );
  });
});
