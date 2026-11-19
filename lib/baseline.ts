import type { Question } from "./lesson";

export const BASELINE_KEY = "atlas.baseline.v1";

export type BaselinePoint = { x: number; y: number };

/** Training points for the mean-versus-line comparison. */
export const trainPoints: BaselinePoint[] = [
  { x: 1, y: 2 },
  { x: 2, y: 4 },
  { x: 3, y: 6 },
];

/** Held-out point, scored on its own. */
export const holdoutPoint: BaselinePoint = { x: 4, y: 5 };

/** ŷ = 2 x fits every training point; it is worse than the mean on the holdout. */
export const LINE_W = 2;
export const LINE_B = 0;

export function meanY(points: BaselinePoint[] = trainPoints): number {
  if (points.length === 0) return 0;
  return points.reduce((sum, point) => sum + point.y, 0) / points.length;
}

export function predictMean(_x: number, points: BaselinePoint[] = trainPoints): number {
  return meanY(points);
}

export function predictLine(x: number, w = LINE_W, b = LINE_B): number {
  return w * x + b;
}

export function squaredError(yHat: number, y: number): number {
  const gap = yHat - y;
  return gap * gap;
}

export function sumSquaredMean(points: BaselinePoint[] = trainPoints): number {
  const mu = meanY(points);
  return points.reduce((sum, point) => sum + squaredError(mu, point.y), 0);
}

export function sumSquaredLine(points: BaselinePoint[] = trainPoints, w = LINE_W, b = LINE_B): number {
  return points.reduce((sum, point) => sum + squaredError(predictLine(point.x, w, b), point.y), 0);
}

export function holdoutSquaredMean(): number {
  return squaredError(predictMean(holdoutPoint.x), holdoutPoint.y);
}

export function holdoutSquaredLine(w = LINE_W, b = LINE_B): number {
  return squaredError(predictLine(holdoutPoint.x, w, b), holdoutPoint.y);
}

export const baselineStations = ["mean", "train-base", "train-line", "holdout", "keep"] as const;

export const baselineQuestions: Question[] = [
  {
    label: "the mean of the labels",
    setup:
      "Three training points: (1, 2), (2, 4), and (3, 6). The mean baseline always predicts the average label, on every x.",
    prompt: "What is the mean of y on these training points?",
    answer: "4",
    idea: "(2 + 4 + 6) / 3 = 4. The mean is not 2, the first label. It is not 6, the largest label. The line ŷ = 2 x is a separate model.",
    options: [
      { id: "4", text: "4" },
      { id: "2", text: "2" },
      { id: "6", text: "6" },
      { id: "2x", text: "It depends on x, like ŷ = 2 x." },
    ],
  },
  {
    label: "training loss of the mean",
    setup:
      "The mean baseline predicts 4 on every training point. Loss is the sum of squared errors, (ŷ − y)².",
    prompt: "What is the training loss?",
    answer: "8",
    idea: "Errors are 2, 0, and −2. Their squares are 4, 0, and 4, which add to 8. A sum of 0 is the line that hits every training point. 12 is the sum of the labels, not the loss.",
    options: [
      { id: "8", text: "8" },
      { id: "0", text: "0" },
      { id: "12", text: "12" },
      { id: "4", text: "4, only the first point counts." },
    ],
  },
  {
    label: "training loss of the line",
    setup: "The line is ŷ = 2 x with no bias. Score the same three training points.",
    prompt: "What is the training loss?",
    answer: "0",
    idea: "The predictions are 2, 4, and 6. Every squared error is 0. Training loss 8 belongs to the mean baseline. A loss of 1 would be a single holdout miss, not this training set.",
    options: [
      { id: "0", text: "0" },
      { id: "8", text: "8" },
      { id: "1", text: "1" },
      { id: "4", text: "4" },
    ],
  },
  {
    label: "holdout squared error",
    setup:
      "A new point is (4, 5), not used for fitting. The mean still predicts 4. The line still uses ŷ = 2 x.",
    prompt: "Which holdout squared error is smaller?",
    answer: "mean",
    idea: "The mean predicts 4, so (4 − 5)² = 1. The line predicts 8, so (8 − 5)² = 9. Zero training loss does not transfer. The smaller holdout error is 1, from the mean.",
    options: [
      { id: "mean", text: "1, from the mean baseline." },
      { id: "line", text: "9, from the line." },
      { id: "tie", text: "They tie." },
      { id: "train", text: "Use the training loss: the line is still 0." },
    ],
  },
  {
    label: "which model to keep",
    setup:
      "You must score new points like (4, 5). The line had loss 0 on training and 9 on this holdout. The mean had loss 8 on training and 1 on the holdout.",
    prompt: "Which model do you keep for new points?",
    answer: "mean",
    idea: "The holdout is the referee. Zero training loss can be overfitting. Keeping the line because it fitted training is the trap. The mean is worse on training here and better on the point you have not seen.",
    options: [
      { id: "mean", text: "The mean baseline. Its holdout loss is smaller." },
      { id: "line", text: "The line. Training loss 0 beats training loss 8." },
      { id: "either", text: "Either. Both are fitted models." },
      { id: "average", text: "Average their predictions." },
    ],
  },
];

export type BaselineRun = {
  sessionId: string;
  startedAt: number;
  answers: string[];
  choice: string | null;
  revealed: boolean;
  completedAt: number | null;
};

export function freshBaseline(): BaselineRun {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: Date.now(),
    answers: [],
    choice: null,
    revealed: false,
    completedAt: null,
  };
}

export function parseBaseline(raw: string | null): BaselineRun | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BaselineRun;
    if (!parsed.sessionId || !Array.isArray(parsed.answers)) return null;
    if (parsed.answers.length > baselineQuestions.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function baselineCleared(run: BaselineRun): number {
  return run.answers.filter((choice, index) => choice === baselineQuestions[index]?.answer).length;
}

export function baselineMisses(run: BaselineRun): string[] {
  return run.answers.flatMap((choice, index) => {
    const question = baselineQuestions[index];
    if (!question || choice === question.answer) return [];
    return [question.label ?? question.prompt];
  });
}

export function baselineReply(run: BaselineRun): string {
  const misses = baselineMisses(run);
  const link = "https://atlas.brohammad.tech/classical/baseline";
  if (misses.length === 0) return `tried the mean baseline unit. cleared it.\n${link}`;
  return `tried the mean baseline unit. got these wrong: ${misses.join(", ")}.\n${link}`;
}