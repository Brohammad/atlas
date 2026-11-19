import type { Question } from "./lesson";

export const LEAK_KEY = "atlas.leak.v1";

export type LeakRow = { x: number; y: number; cheat: number };

/** cheat is a copy of y on every training row. */
export const trainRows: LeakRow[] = [
  { x: 1, y: 5, cheat: 5 },
  { x: 2, y: 6, cheat: 6 },
  { x: 3, y: 11, cheat: 11 },
];

export const holdoutRow: LeakRow = { x: 4, y: 13, cheat: 13 };

/** Honest model ŷ = 2 x + 3 uses only x. */
export const HONEST_W = 2;
export const HONEST_B = 3;

export function predictHonest(x: number, w = HONEST_W, b = HONEST_B): number {
  return w * x + b;
}

export function predictCheat(cheat: number): number {
  return cheat;
}

export function squaredError(yHat: number, y: number): number {
  const gap = yHat - y;
  return gap * gap;
}

export function sumSquaredCheat(rows: LeakRow[] = trainRows): number {
  return rows.reduce((sum, row) => sum + squaredError(predictCheat(row.cheat), row.y), 0);
}

export function sumSquaredHonest(rows: LeakRow[] = trainRows, w = HONEST_W, b = HONEST_B): number {
  return rows.reduce((sum, row) => sum + squaredError(predictHonest(row.x, w, b), row.y), 0);
}

export function holdoutSquaredHonest(w = HONEST_W, b = HONEST_B): number {
  return squaredError(predictHonest(holdoutRow.x, w, b), holdoutRow.y);
}

export const leakStations = ["column", "train-cheat", "train-honest", "serve", "leak"] as const;

export const leakQuestions: Question[] = [
  {
    label: "what the cheat column is",
    setup:
      "Three training rows. Each row has x, the label y, and a column named cheat. On every row, cheat equals y.",
    prompt: "What is cheat?",
    answer: "copy",
    idea: "cheat is a copy of the label on each row. It is not x rescaled. It is not the mean of y. A column that equals y is not an honest input feature.",
    options: [
      { id: "copy", text: "A copy of y on that row." },
      { id: "x", text: "x multiplied by 2." },
      { id: "mean", text: "The mean of y, repeated." },
      { id: "residual", text: "y minus ŷ from another model." },
    ],
  },
  {
    label: "training loss with cheat",
    setup: "A teammate fits ŷ = cheat on the three training rows. Loss is the sum of squared errors.",
    prompt: "What is the training loss?",
    answer: "0",
    idea: "cheat equals y on every row, so ŷ − y is 0 everywhere. Loss 5 belongs to the honest x-only model on this table. Loss 4 is the holdout score for the honest model here, not the cheat training loss.",
    options: [
      { id: "0", text: "0" },
      { id: "5", text: "5" },
      { id: "1", text: "1" },
      { id: "17", text: "17" },
    ],
  },
  {
    label: "training loss with x only",
    setup: "You fit ŷ = 2 x + 3 on the same three rows, using only x.",
    prompt: "What is the training loss?",
    answer: "5",
    idea: "Predictions are 5, 7, and 9. Squared errors are 0, 1, and 4, which add to 5. Zero belongs to cheat. Eighteen would be three times six, not this sum of squares.",
    options: [
      { id: "5", text: "5" },
      { id: "0", text: "0" },
      { id: "1", text: "1" },
      { id: "18", text: "18" },
    ],
  },
  {
    label: "prediction time on a new row",
    setup:
      "A new row arrives at x = 4 with y = 13. You must emit ŷ before you know the final label in production.",
    prompt: "Can you use cheat in that prediction?",
    answer: "no",
    idea: "cheat is the label. You do not have it when you score a new application. Using it in training borrowed the answer. x = 4 is available, but cheat is not.",
    options: [
      { id: "no", text: "No. cheat is the label, and it is not known yet." },
      { id: "yes", text: "Yes. cheat was in the training table." },
      { id: "holdout", text: "Yes, on holdout rows only." },
      { id: "mean", text: "Use the mean of cheat from training instead." },
    ],
  },
  {
    label: "why training loss misled",
    setup:
      "The cheat model had training loss 0. The honest model had training loss 5. On the holdout row (x = 4, y = 13), ŷ = 2 x + 3 has squared error 4.",
    prompt: "What went wrong with the cheat model?",
    answer: "leak",
    idea: "Training loss 0 came from target leakage: the feature was the label. The honest model is worse on training and is what you can actually score at serve time. Overfitting alone does not require a column that equals y.",
    options: [
      { id: "leak", text: "Target leakage. cheat copied y into a feature." },
      { id: "rate", text: "The learning rate was too large." },
      { id: "sign", text: "Gradient descent used the wrong sign." },
      { id: "overfit", text: "The honest model needed more training rows only." },
    ],
  },
];

export type LeakRun = {
  sessionId: string;
  startedAt: number;
  answers: string[];
  choice: string | null;
  revealed: boolean;
  completedAt: number | null;
};

export function freshLeak(): LeakRun {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: Date.now(),
    answers: [],
    choice: null,
    revealed: false,
    completedAt: null,
  };
}

export function parseLeak(raw: string | null): LeakRun | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LeakRun;
    if (!parsed.sessionId || !Array.isArray(parsed.answers)) return null;
    if (parsed.answers.length > leakQuestions.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function leakCleared(run: LeakRun): number {
  return run.answers.filter((choice, index) => choice === leakQuestions[index]?.answer).length;
}

export function leakMisses(run: LeakRun): string[] {
  return run.answers.flatMap((choice, index) => {
    const question = leakQuestions[index];
    if (!question || choice === question.answer) return [];
    return [question.label ?? question.prompt];
  });
}

export function leakReply(run: LeakRun): string {
  const misses = leakMisses(run);
  const link = "https://atlas.brohammad.tech/classical/leak";
  if (misses.length === 0) return `tried the leak column unit. cleared it.\n${link}`;
  return `tried the leak column unit. got these wrong: ${misses.join(", ")}.\n${link}`;
}