import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  baselineQuestions,
  holdoutPoint,
  holdoutSquaredLine,
  holdoutSquaredMean,
  meanY,
  sumSquaredLine,
  sumSquaredMean,
  trainPoints,
} from "./baseline.ts";

describe("mean baseline unit", () => {
  it("computes the training mean and mean baseline loss", () => {
    assert.equal(meanY(trainPoints), 4);
    assert.equal(sumSquaredMean(trainPoints), 8);
  });

  it("gives the line zero training loss", () => {
    assert.equal(sumSquaredLine(trainPoints), 0);
  });

  it("puts the mean ahead on the holdout", () => {
    assert.equal(holdoutSquaredMean(), 1);
    assert.equal(holdoutSquaredLine(), 9);
    assert.ok(holdoutSquaredMean() < holdoutSquaredLine());
  });

  it("locks every answer", () => {
    assert.equal(baselineQuestions.length, 5);
    assert.deepEqual(
      baselineQuestions.map((question) => question.answer),
      ["4", "8", "0", "mean", "mean"],
    );
  });

  it("scores the holdout point alone", () => {
    assert.equal(holdoutPoint.x, 4);
    assert.equal(holdoutPoint.y, 5);
  });
});