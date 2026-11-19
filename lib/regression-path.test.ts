import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { REGRESSION_PATH_HREFS, REGRESSION_PATH_STEPS } from "./regression-path.ts";

describe("regression path", () => {
  it("lists eight steps in documented order", () => {
    assert.equal(REGRESSION_PATH_STEPS.length, 8);
    assert.deepEqual(REGRESSION_PATH_HREFS, [
      "/beginner",
      "/lab",
      "/classical/regression",
      "/classical/two",
      "/classical/residuals",
      "/classical/rate",
      "/classical/baseline",
      "/classical/leak",
    ]);
  });
});