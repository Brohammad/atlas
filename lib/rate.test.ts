import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loss, reachedLoss, runDescent } from "./descent.ts";
import {
  RATE_OK,
  RATE_STEPS,
  bowlMatchesPoints,
  lineCleared,
  rateQuestions,
  shallowLine,
  steepLine,
  sumSquared,
  unseenLine,
} from "./rate.ts";

describe("learning rate on the line", () => {
  it("matches each line's sum of squares to its bowl", () => {
    for (const line of [shallowLine, steepLine, unseenLine]) {
      for (const w of [0, 1, 2, 3, 4]) assert.equal(bowlMatchesPoints(line, w), true);
    }
    assert.equal(sumSquared(shallowLine, 4), 4);
    assert.equal(sumSquared(steepLine, 4), 16);
    assert.equal(loss(steepLine.bowl, -4), 144);
  });

  it("steps the shallow line from 4 to 3 at rate 0.25", () => {
    const trace = runDescent(shallowLine.bowl, 0.25, 1);
    assert.equal(trace[1]?.w, 3);
    assert.equal(trace[1]?.loss, 1);
  });

  it("lets 0.4 finish the shallow line and overshoot the steep line", () => {
    assert.equal(lineCleared(shallowLine, 0.4), true);
    assert.equal(
      lineCleared(shallowLine, 0.4),
      reachedLoss(runDescent(shallowLine.bowl, 0.4, RATE_STEPS), RATE_STEPS, RATE_OK),
    );
    assert.equal(lineCleared(steepLine, 0.4), false);
    const trace = runDescent(steepLine.bowl, 0.5, 1);
    assert.equal(trace[1]?.w, -4);
    assert.equal(trace[1]?.loss, 144);
  });

  it("accepts 0.1 on both practice lines and rejects 0.05 on the shallow one", () => {
    assert.equal(lineCleared(shallowLine, 0.1), true);
    assert.equal(lineCleared(steepLine, 0.1), true);
    assert.equal(lineCleared(shallowLine, 0.05), false);
    assert.equal(lineCleared(steepLine, 0.05), true);
  });

  it("clears the unseen line at 0.15 and not at the steep line's 0.2", () => {
    assert.equal(lineCleared(unseenLine, 0.05), true);
    assert.equal(lineCleared(unseenLine, 0.15), true);
    assert.equal(lineCleared(unseenLine, 0.2), false);
    assert.equal(lineCleared(unseenLine, 0.5), false);
    assert.equal(lineCleared(steepLine, 0.2), true);
  });

  it("locks the published answers", () => {
    assert.deepEqual(
      rateQuestions.map((question) => question.answer),
      ["3", "short", "rate"],
    );
    for (const question of rateQuestions) {
      assert.equal(question.options.some((option) => option.id === question.answer), true);
      assert.equal(new Set(question.options.map((option) => option.id)).size, 4);
    }
  });
});
