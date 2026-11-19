import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  holdoutRow,
  holdoutSquaredHonest,
  leakQuestions,
  sumSquaredCheat,
  sumSquaredHonest,
  trainRows,
} from "./leak.ts";

describe("leak column unit", () => {
  it("matches every cheat value to y on training", () => {
    assert.ok(trainRows.every((row) => row.cheat === row.y));
  });

  it("gives zero training loss for ŷ = cheat", () => {
    assert.equal(sumSquaredCheat(), 0);
  });

  it("gives positive training loss for the honest x-only line", () => {
    assert.equal(sumSquaredHonest(), 5);
  });

  it("scores the holdout with the honest model only", () => {
    assert.equal(holdoutSquaredHonest(), 4);
    assert.equal(holdoutRow.y, 13);
    assert.equal(holdoutRow.x, 4);
  });

  it("locks every answer", () => {
    assert.equal(leakQuestions.length, 5);
    assert.deepEqual(
      leakQuestions.map((question) => question.answer),
      ["copy", "0", "5", "no", "leak"],
    );
  });
});