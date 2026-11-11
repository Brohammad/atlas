import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  lowPoints,
  predictLine,
  residPoints,
  residQuestions,
  residual,
  squared,
  sumResiduals,
  sumSquared,
} from "./resid.ts";

describe("residuals", () => {
  it("records a signed miss of 2 at x = 2", () => {
    assert.equal(predictLine(2), 3);
    assert.equal(residual(3, 5), -2);
    assert.equal(squared(3, 5), 4);
    assert.equal(residual(predictLine(1), 2), 0);
  });

  it("gives the middle point most of the loss", () => {
    assert.deepEqual(
      residPoints.map((point) => squared(predictLine(point.x), point.y)),
      [0, 4, 1],
    );
    assert.equal(sumSquared(residPoints), 5);
    assert.equal(sumResiduals(residPoints), -1);
  });

  it("keeps every low-line residual negative", () => {
    assert.deepEqual(
      lowPoints.map((point) => residual(predictLine(point.x, 0), point.y)),
      [-2, -2, -3],
    );
    assert.equal(sumSquared(lowPoints, 0), 17);
  });

  it("drops the loss to 1 after the bias rises by 2", () => {
    assert.deepEqual(
      lowPoints.map((point) => predictLine(point.x, 2)),
      [3, 4, 5],
    );
    assert.deepEqual(
      lowPoints.map((point) => squared(predictLine(point.x, 2), point.y)),
      [0, 0, 1],
    );
    assert.equal(sumSquared(lowPoints, 2), 1);
    assert.equal(residual(5, 6), -1);
  });

  it("locks the published answers", () => {
    assert.deepEqual(
      residQuestions.map((question) => question.answer),
      ["-2", "middle", "cancel", "raise", "1"],
    );
    for (const question of residQuestions) {
      assert.equal(question.options.some((option) => option.id === question.answer), true);
      assert.equal(new Set(question.options.map((option) => option.id)).size, 4);
    }
  });
});
