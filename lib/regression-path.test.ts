import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { continueHref, firstOpenStep, REGRESSION_PATH_HREFS, REGRESSION_PATH_STEPS } from "./regression-path.ts";

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

  it("sends continue to the first unfinished step", () => {
    const none = [false, false, false, false, false, false, false, false];
    const lineDone = [true, false, false, false, false, false, false, false];
    const all = [true, true, true, true, true, true, true, true];
    assert.equal(firstOpenStep(none), 0);
    assert.equal(continueHref(none), "/beginner");
    assert.equal(continueHref(lineDone), "/lab");
    assert.equal(firstOpenStep(all), 8);
    assert.equal(continueHref(all), "/classical/leak");
  });
});