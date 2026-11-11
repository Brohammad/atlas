import type { Question } from "@/lib/lesson";

export const LINE_KEY = "atlas.line.v1";

export type Point = { x: number; y: number };

/** Three points for ŷ = w × x. Totals below are sums of squared errors, not means. */
export const linePoints: Point[] = [
  { x: 1, y: 1 },
  { x: 2, y: 3 },
  { x: 4, y: 6 },
];

export const lineStations = ["error", "total", "source", "weight", "new", "search"] as const;

export function predict(w: number, x: number): number {
  return w * x;
}

export function squaredError(y: number, yHat: number): number {
  const gap = y - yHat;
  return gap * gap;
}

export function totalSquaredError(w: number, points: Point[] = linePoints): number {
  return points.reduce((sum, point) => sum + squaredError(point.y, predict(w, point.x)), 0);
}

export const lineQuestions: Question[] = [
  {
    label: "squared error of one point",
    setup: "One point. The label is y = 6. The model outputs ŷ = 4. Squared error is (y − ŷ)².",
    prompt: "What is the squared error on this point?",
    answer: "4",
    idea: "(6 − 4)² = 4. The difference is 2, and squaring it gives 4. −2 is that difference with the sign flipped, not the squared error. 6 × 4 = 24 multiplies the label by the prediction.",
    options: [
      { id: "4", text: "4" },
      { id: "2", text: "2" },
      { id: "-2", text: "−2" },
      { id: "24", text: "24" },
    ],
  },
  {
    label: "total at w = 1",
    setup:
      "The model is ŷ = w × x. There is no bias term. The loss is the sum of squared errors on the three training points (1, 1), (2, 3), and (4, 6). Do not average them. w = 1.",
    prompt: "What is the total squared error?",
    answer: "5",
    idea: "The predictions are 1, 2, and 4. Squared errors are 0, 1, and 4, which add to 5. Adding the raw errors, without squaring, gives 3. Scoring only the worst point gives 4. Adding the labels gives 10.",
    options: [
      { id: "5", text: "5" },
      { id: "3", text: "3" },
      { id: "4", text: "4" },
      { id: "10", text: "10" },
    ],
  },
  {
    label: "where the loss comes from",
    setup: "Same model, no bias. Same three training points, loss still the sum. w = 1.5 predicts 1.5, 3, and 6.",
    prompt: "Where is the loss coming from?",
    answer: "first",
    idea: "Squared errors are 0.25, 0, and 0. The two exact points contribute nothing. A larger x does not create loss when the prediction matches the label. Two exact points do not cancel the miss.",
    options: [
      { id: "first", text: "Only (1, 1). The other two predictions match their labels." },
      { id: "all", text: "All three points equally. A model always has loss on every point." },
      { id: "last", text: "Only (4, 6). A larger x always means a larger loss." },
      { id: "none", text: "Nowhere. Two exact points mean the fit is finished." },
    ],
  },
  {
    label: "which weight to keep",
    setup:
      "Same model, no bias. The loss is the sum of squared errors on the three training points: 5 at w = 1, 0.25 at w = 1.5, and 6 at w = 2.",
    prompt: "Which weight do you keep?",
    answer: "1.5",
    idea: "Keep the smaller loss. w = 1 hits (1, 1) exactly and still totals 5. A larger weight is not owed to larger labels. w = 2 totals 6.",
    options: [
      { id: "1.5", text: "1.5. Its total is 0.25." },
      { id: "1", text: "1. It hits (1, 1) exactly, and exact beats close." },
      { id: "2", text: "2. The labels get larger, so the weight should be larger." },
      { id: "0", text: "0. A weight of zero has not made an error yet." },
    ],
  },
  {
    label: "a new point",
    setup: "You kept w = 1.5. A new point arrives: x = 2, y = 2. Score only this point.",
    prompt: "What is the squared error on the new point?",
    answer: "1",
    idea: "ŷ = 1.5 × 2 = 3, and (2 − 3)² = 1. Fitting the earlier points does not make this error 0. 0.25 was the sum on those three training points, not the score of this one.",
    options: [
      { id: "1", text: "1" },
      { id: "0", text: "0. This weight already fit two of the earlier points." },
      { id: "2", text: "2, the label." },
      { id: "0.25", text: "0.25, the earlier total. A new point does not get its own error." },
    ],
  },
  {
    label: "when you cannot try every weight",
    setup:
      "You compared three weights. w = 1.5 had the smallest sum. The model is still ŷ = w × x, with no bias. Suppose the weight can be any number, and trying weights one by one is not practical.",
    prompt: "How do you look for a better weight?",
    answer: "direction",
    idea: "Three weights were enough to see that 1.5 has a low error. With millions of possible weights, trying them does not scale, and averaging the ones you already tried is still a guess. Calculate the direction that reduces the loss, update the weight, and repeat. That repeated update is gradient descent.",
    options: [
      { id: "direction", text: "Calculate which direction reduces the loss, then update the weight and repeat." },
      { id: "million", text: "Try a million random weights and keep the smallest loss." },
      { id: "exact", text: "Keep the weight that hits the most training points exactly." },
      { id: "average", text: "Average the three weights you already tried." },
    ],
  },
];

export type LineRun = {
  sessionId: string;
  startedAt: number;
  answers: string[];
  choice: string | null;
  revealed: boolean;
  completedAt: number | null;
};

export function freshLine(): LineRun {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: Date.now(),
    answers: [],
    choice: null,
    revealed: false,
    completedAt: null,
  };
}

export function parseLine(raw: string | null): LineRun | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LineRun;
    if (!parsed.sessionId || !Array.isArray(parsed.answers)) return null;
    if (parsed.answers.length > lineQuestions.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function lineCleared(run: LineRun): number {
  return run.answers.filter((choice, index) => choice === lineQuestions[index]?.answer).length;
}

export function lineMisses(run: LineRun): string[] {
  return run.answers.flatMap((choice, index) => {
    const question = lineQuestions[index];
    if (!question || choice === question.answer) return [];
    return [question.label ?? question.prompt];
  });
}

export function lineReply(run: LineRun): string {
  const misses = lineMisses(run);
  const link = "https://atlas.brohammad.tech/beginner";
  if (misses.length === 0) return `tried the beginner line. cleared it.\n${link}`;
  return `tried the beginner line. got these wrong: ${misses.join(", ")}.\n${link}`;
}
