import type { Question } from "./lesson";

export const RESID_KEY = "atlas.resid.v1";

export type ResidPoint = { x: number; y: number };

/** ŷ = x + 1. Residuals are 0, −2, and +1. */
export const residPoints: ResidPoint[] = [
  { x: 1, y: 2 },
  { x: 2, y: 5 },
  { x: 4, y: 4 },
];

/** ŷ = x. Every residual is negative. */
export const lowPoints: ResidPoint[] = [
  { x: 1, y: 3 },
  { x: 2, y: 4 },
  { x: 3, y: 6 },
];

export function predictLine(x: number, b = 1): number {
  return x + b;
}

export function residual(yHat: number, y: number): number {
  return yHat - y;
}

export function squared(yHat: number, y: number): number {
  const gap = residual(yHat, y);
  return gap * gap;
}

export function sumResiduals(points: ResidPoint[], b = 1): number {
  return points.reduce((sum, point) => sum + residual(predictLine(point.x, b), point.y), 0);
}

export function sumSquared(points: ResidPoint[], b = 1): number {
  return points.reduce((sum, point) => sum + squared(predictLine(point.x, b), point.y), 0);
}

export const residStations = ["residual", "owner", "cancel", "sign", "raise"] as const;

export const residQuestions: Question[] = [
  {
    label: "the residual at x = 2",
    setup: "The model is ŷ = x + 1. One training point is x = 2, y = 5. The residual is ŷ − y.",
    prompt: "What is the residual?",
    answer: "-2",
    idea: "ŷ = 3, and 3 − 5 = −2. The prediction is below the label. 2 flips that sign. 4 is the squared error. 0 is the point at x = 1, which sits on the line.",
    options: [
      { id: "-2", text: "−2" },
      { id: "2", text: "2" },
      { id: "4", text: "4" },
      { id: "0", text: "0" },
    ],
  },
  {
    label: "which point owns the loss",
    setup:
      "Same line, ŷ = x + 1. The points are (1, 2), (2, 5), and (4, 4). Squared errors are 0, 4, and 1. The loss is their sum.",
    prompt: "Which point owns most of the loss?",
    answer: "middle",
    idea: "(2, 5) contributes 4 of the loss of 5. (4, 4) has the larger prediction, and its squared error is only 1. (1, 2) is exact. Equal residuals are not what the loss adds.",
    options: [
      { id: "middle", text: "(2, 5). Its squared error is 4." },
      { id: "last", text: "(4, 4). Its prediction is the largest." },
      { id: "first", text: "(1, 2). It is the first point." },
      { id: "all", text: "All three. Any residual counts the same." },
    ],
  },
  {
    label: "a sum that cancels",
    setup: "The residuals on those three points are 0, −2, and +1. Their sum is −1. The loss, the sum of squares, is 5.",
    prompt: "What does the sum of residuals hide?",
    answer: "cancel",
    idea: "−2 and +1 partly cancel, so the sum is −1 while the loss is 5. A small sum is not a finished fit. The loss is not the sum of the signed residuals. The exact point does not erase the other two.",
    options: [
      { id: "cancel", text: "−2 and +1 cancel, so the sum is smaller than the loss." },
      { id: "done", text: "A sum of −1 means the fit is one step from done." },
      { id: "same", text: "The loss is that sum." },
      { id: "exact", text: "The exact point removes the other two residuals." },
    ],
  },
  {
    label: "every residual is negative",
    setup: "A different line, ŷ = x, on (1, 3), (2, 4), and (3, 6). The residuals are −2, −2, and −3.",
    prompt: "What do you change first?",
    answer: "raise",
    idea: "ŷ − y is negative on every point, so every prediction is below its label. Raise the bias. A negative residual does not mean the line is too high. The last point is not the only miss. Squaring keeps the size and drops the sign, so the pattern is evidence before you square.",
    options: [
      { id: "raise", text: "Raise the bias. Every prediction is below its label." },
      { id: "lower", text: "Lower the bias. A negative residual means the line is too high." },
      { id: "drop", text: "Drop (3, 6). The largest x is the only problem." },
      { id: "nothing", text: "Nothing. Squaring removes the sign, so the pattern is not evidence." },
    ],
  },
  {
    label: "the loss after raising the bias",
    setup:
      "You raise the bias by 2. The line is now ŷ = x + 2 on the same three points, (1, 3), (2, 4), and (3, 6). The old loss was 17.",
    prompt: "What is the new loss?",
    answer: "1",
    idea: "The new predictions are 3, 4, and 5. Squared errors are 0, 0, and 1. The loss is 1. Two exact points do not make the third exact. 17 was the old loss. −1 is the remaining residual, not the loss.",
    options: [
      { id: "1", text: "1" },
      { id: "17", text: "17, the old loss." },
      { id: "0", text: "0. Two points are exact, so the loss is gone." },
      { id: "-1", text: "−1, the remaining residual." },
    ],
  },
];

export type ResidRun = {
  sessionId: string;
  startedAt: number;
  answers: string[];
  choice: string | null;
  revealed: boolean;
  completedAt: number | null;
};

export function freshResid(): ResidRun {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: Date.now(),
    answers: [],
    choice: null,
    revealed: false,
    completedAt: null,
  };
}

export function parseResid(raw: string | null): ResidRun | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ResidRun;
    if (!parsed.sessionId || !Array.isArray(parsed.answers)) return null;
    if (parsed.answers.length > residQuestions.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function residCleared(run: ResidRun): number {
  return run.answers.filter((choice, index) => choice === residQuestions[index]?.answer).length;
}

export function residMisses(run: ResidRun): string[] {
  return run.answers.flatMap((choice, index) => {
    const question = residQuestions[index];
    if (!question || choice === question.answer) return [];
    return [question.label ?? question.prompt];
  });
}

export function residReply(run: ResidRun): string {
  const misses = residMisses(run);
  const link = "https://atlas.brohammad.tech/classical/residuals";
  if (misses.length === 0) return `tried the residual unit. cleared it.\n${link}`;
  return `tried the residual unit. got these wrong: ${misses.join(", ")}.\n${link}`;
}
