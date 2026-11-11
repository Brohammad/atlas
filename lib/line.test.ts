import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  linePoints,
  lineQuestions,
  predict,
  squaredError,
  totalSquaredError,
} from "./line.ts";

describe("beginner line", () => {
  it("squares one miss of 2", () => {
    assert.equal(squaredError(6, 4), 4);
    assert.equal(squaredError(4, 6), 4);
    assert.equal(6 - 4, 2);
    assert.equal(4 - 6, -2);
    assert.equal(6 * 4, 24);
  });

  it("adds squared errors at w = 1 to 5", () => {
    assert.deepEqual(
      linePoints.map((point) => predict(1, point.x)),
      [1, 2, 4],
    );
    assert.equal(totalSquaredError(1), 5);
    const raw = linePoints.reduce((sum, point) => sum + (point.y - predict(1, point.x)), 0);
    assert.equal(raw, 3);
    assert.equal(squaredError(6, 4), 4);
    assert.equal(
      linePoints.reduce((sum, point) => sum + point.y, 0),
      10,
    );
  });

  it("puts the w = 1.5 loss on the first point only", () => {
    assert.deepEqual(
      linePoints.map((point) => predict(1.5, point.x)),
      [1.5, 3, 6],
    );
    assert.deepEqual(
      linePoints.map((point) => squaredError(point.y, predict(1.5, point.x))),
      [0.25, 0, 0],
    );
    assert.equal(totalSquaredError(1.5), 0.25);
  });

  it("keeps w = 1.5 over the nearby weights", () => {
    assert.equal(totalSquaredError(2), 6);
    assert.equal(totalSquaredError(0), 1 + 9 + 36);
    assert.ok(totalSquaredError(1.5) < totalSquaredError(1));
    assert.ok(totalSquaredError(1.5) < totalSquaredError(2));
    assert.ok(totalSquaredError(1.5) < totalSquaredError(0));
  });

  it("scores the new point on its own", () => {
    assert.equal(predict(1.5, 2), 3);
    assert.equal(squaredError(2, 3), 1);
    assert.notEqual(squaredError(2, 3), totalSquaredError(1.5));
  });

  it("locks the published answers to those totals", () => {
    assert.deepEqual(
      lineQuestions.map((question) => question.answer),
      ["4", "5", "first", "1.5", "1", "direction"],
    );
    assert.match(lineQuestions[1]?.setup ?? "", /no bias/);
    assert.match(lineQuestions[1]?.setup ?? "", /sum of squared errors/);
    for (const question of lineQuestions) {
      assert.equal(question.options.some((option) => option.id === question.answer), true);
      assert.equal(new Set(question.options.map((option) => option.id)).size, 4);
    }
  });
});
