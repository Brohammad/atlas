import type { Question } from "./lesson";

export const TWO_KEY = "atlas.two.v1";

export type TwoPoint = { x1: number; x2: number; y: number };

/** Worked fit: w1 = 1, w2 = 1, b = 1. Residuals are 0, −1, −2. */
export const twoPoints: TwoPoint[] = [
  { x1: 1, x2: 1, y: 3 },
  { x1: 1, x2: 0, y: 3 },
  { x1: 0, x2: 2, y: 5 },
];

export const W1 = 1;
export const W2 = 1;
export const B = 1;
export const TWO_LR = 0.25;

export function predictTwo(w1: number, w2: number, b: number, x1: number, x2: number): number {
  return w1 * x1 + w2 * x2 + b;
}

export function twoLoss(w1 = W1, w2 = W2, b = B, points: TwoPoint[] = twoPoints): number {
  return points.reduce((sum, point) => {
    const gap = predictTwo(w1, w2, b, point.x1, point.x2) - point.y;
    return sum + gap * gap;
  }, 0);
}

/** ∂/∂w of Σ (ŷ − y)². The residual is multiplied by that feature only. */
export function partialFeature(
  feature: "x1" | "x2",
  w1 = W1,
  w2 = W2,
  b = B,
  points: TwoPoint[] = twoPoints,
): number {
  return (
    2 *
    points.reduce((sum, point) => {
      const residual = predictTwo(w1, w2, b, point.x1, point.x2) - point.y;
      return sum + residual * (feature === "x1" ? point.x1 : point.x2);
    }, 0)
  );
}

export const twoStations = ["predict", "total", "partial", "update", "holdout"] as const;

export const twoQuestions: Question[] = [
  {
    label: "a prediction with two inputs",
    setup: "The model is ŷ = w1 x1 + w2 x2 + b. w1 = 2, w2 = 3, and b = 1.",
    prompt: "At x1 = 1 and x2 = 2, what is ŷ?",
    answer: "9",
    idea: "2 × 1 + 3 × 2 + 1 = 9. Dropping the bias gives 8. Using only the second term gives 6. Adding the inputs to the bias, and ignoring the weights, gives 4.",
    options: [
      { id: "9", text: "9" },
      { id: "8", text: "8" },
      { id: "6", text: "6" },
      { id: "4", text: "4" },
    ],
  },
  {
    label: "the loss with two weights",
    setup:
      "w1 = 1, w2 = 1, and b = 1. The loss is the sum of squared errors on (x1, x2, y): (1, 1, 3), (1, 0, 3), and (0, 2, 5). Do not average.",
    prompt: "What is the loss?",
    answer: "5",
    idea: "The predictions are 3, 2, and 3. Squared errors are 0, 1, and 4, which add to 5. Scoring only the last miss gives 4. Adding the raw residuals, without squaring, gives 3. Adding the labels gives 11.",
    options: [
      { id: "5", text: "5" },
      { id: "4", text: "4" },
      { id: "3", text: "3" },
      { id: "11", text: "11" },
    ],
  },
  {
    label: "the partial for the second weight",
    setup:
      "Same fit. Residuals ŷ − y are 0, −1, and −2. L = Σ (ŷ − y)², so ∂L/∂w2 = 2 Σ (ŷ − y) x2. A point only moves w2 when its x2 is not zero.",
    prompt: "What is ∂L/∂w2?",
    answer: "-8",
    idea: "Σ (ŷ − y) x2 = 0×1 + (−1)×0 + (−2)×2 = −4. The 2 from the square makes the partial −8. The middle point has x2 = 0, so it does not move w2. −2 is ∂L/∂w1, which multiplies by x1 instead. −4 forgot the 2. −6 is the partial for the bias.",
    options: [
      { id: "-8", text: "−8" },
      { id: "-2", text: "−2" },
      { id: "-4", text: "−4" },
      { id: "-6", text: "−6" },
    ],
  },
  {
    label: "one step of the second weight",
    setup: "w2 is 1. ∂L/∂w2 is −8. The learning rate is 0.25. Descent is w2 ← w2 − 0.25 × ∂L/∂w2. w1 and b stay put for this question.",
    prompt: "What is w2 after one update?",
    answer: "3",
    idea: "1 − 0.25 × (−8) = 3. Adding the partial gives −1. Using −4 in place of −8 gives 2. The rate is large enough to move w2.",
    options: [
      { id: "3", text: "3" },
      { id: "-1", text: "−1" },
      { id: "2", text: "2" },
      { id: "1", text: "1" },
    ],
  },
  {
    label: "a new point with two inputs",
    setup: "You kept w1 = 1, w2 = 1, and b = 1. A new point arrives: x1 = 1, x2 = 1, y = 4. Score only this point. The training loss was 5.",
    prompt: "What is the squared error on the new point?",
    answer: "1",
    idea: "ŷ = 1 × 1 + 1 × 1 + 1 = 3, and (3 − 4)² = 1. Two exact training points do not make this point exact. The training loss does not transfer. 2 is the sum of the inputs.",
    options: [
      { id: "1", text: "1" },
      { id: "5", text: "5, the training loss." },
      { id: "0", text: "0. Two training points were exact, so this one is exact." },
      { id: "2", text: "2, the sum of the inputs." },
    ],
  },
];

export type TwoRun = {
  sessionId: string;
  startedAt: number;
  answers: string[];
  choice: string | null;
  revealed: boolean;
  completedAt: number | null;
};

export function freshTwo(): TwoRun {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: Date.now(),
    answers: [],
    choice: null,
    revealed: false,
    completedAt: null,
  };
}

export function parseTwo(raw: string | null): TwoRun | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as TwoRun;
    if (!parsed.sessionId || !Array.isArray(parsed.answers)) return null;
    if (parsed.answers.length > twoQuestions.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function twoCleared(run: TwoRun): number {
  return run.answers.filter((choice, index) => choice === twoQuestions[index]?.answer).length;
}

export function twoMisses(run: TwoRun): string[] {
  return run.answers.flatMap((choice, index) => {
    const question = twoQuestions[index];
    if (!question || choice === question.answer) return [];
    return [question.label ?? question.prompt];
  });
}

export function twoReply(run: TwoRun): string {
  const misses = twoMisses(run);
  const link = "https://atlas.brohammad.tech/classical/two";
  if (misses.length === 0) return `tried two-input regression. cleared it.\n${link}`;
  return `tried two-input regression. got these wrong: ${misses.join(", ")}.\n${link}`;
}
