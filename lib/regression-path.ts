/** Recommended play order for the open regression track (Pilot 001 and home). */
export type RegressionPathStep = { href: string; label: string };

export const REGRESSION_PATH_STEPS: RegressionPathStep[] = [
  { href: "/beginner", label: "Fit a line" },
  { href: "/lab", label: "Gradient descent lab" },
  { href: "/classical/regression", label: "A line with a bias" },
  { href: "/classical/two", label: "Two inputs" },
  { href: "/classical/residuals", label: "Residuals" },
  { href: "/classical/rate", label: "Learning rate on the line" },
  { href: "/classical/baseline", label: "Mean baseline" },
  { href: "/classical/leak", label: "Target leakage" },
];

export const REGRESSION_PATH_HREFS = REGRESSION_PATH_STEPS.map((step) => step.href);

/** Index of the first step that is not finished. Length of the path when every step is finished. */
export function firstOpenStep(finished: readonly boolean[]): number {
  const index = finished.findIndex((step) => !step);
  return index === -1 ? REGRESSION_PATH_STEPS.length : index;
}

/** Where Begin should go. A finished path stays on the last unit. */
export function continueHref(finished: readonly boolean[]): string {
  const index = firstOpenStep(finished);
  const step = REGRESSION_PATH_STEPS[Math.min(index, REGRESSION_PATH_STEPS.length - 1)];
  return step?.href ?? "/beginner";
}