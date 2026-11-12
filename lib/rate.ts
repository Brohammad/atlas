import type { Question } from "./lesson";

type Bowl = { k: number; mu: number; w0: number };

export const RATE_KEY = "atlas.rate.v1";
export const RATE_STEPS = 10;
export const RATE_OK = 0.05;

export type FitPoint = { x: number; y: number };

export type FitLine = {
  id: "shallow" | "steep" | "unseen";
  bowl: Bowl;
  points: FitPoint[];
  best: number;
};

/** ŷ = w x. One point (1, 2). L = (w − 2)², so k = 2. */
export const shallowLine: FitLine = {
  id: "shallow",
  bowl: { k: 2, mu: 2, w0: 4 },
  points: [{ x: 1, y: 2 }],
  best: 2,
};

/** ŷ = w x. One point (2, 4). L = 4(w − 2)², so k = 8. */
export const steepLine: FitLine = {
  id: "steep",
  bowl: { k: 8, mu: 2, w0: 4 },
  points: [{ x: 2, y: 4 }],
  best: 2,
};

/** Points (1, 1) and (2, 2). L = 5(w − 1)², so k = 10. */
export const unseenLine: FitLine = {
  id: "unseen",
  bowl: { k: 10, mu: 1, w0: 3 },
  points: [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
  ],
  best: 1,
};

export function sumSquared(line: FitLine, w: number): number {
  return line.points.reduce((sum, point) => {
    const gap = w * point.x - point.y;
    return sum + gap * gap;
  }, 0);
}

export function lineCleared(line: FitLine, lr: number, steps = RATE_STEPS, limit = RATE_OK): boolean {
  let w = line.bowl.w0;
  let last = sumSquared(line, w);
  for (let i = 0; i < steps; i++) {
    const grad = line.bowl.k * (w - line.bowl.mu);
    w = w - lr * grad;
    if (!Number.isFinite(w) || Math.abs(w) > 1e6) return false;
    last = sumSquared(line, w);
  }
  return last < limit;
}

export const rateStations = ["step", "short", "lines", "cause", "unseen"] as const;

export const rateQuestions: Question[] = [
  {
    label: "one update on the shallow line",
    setup:
      "The model is ŷ = w x. There is no bias. The only point is (1, 2), so the best weight is 2. The loss is (w − 2)² and the gradient is 2(w − 2). Start at w = 4. The rate is 0.25 for this one step.",
    prompt: "What is w after one update?",
    answer: "3",
    idea: "The gradient at 4 is 2 × (4 − 2) = 4. Subtract 0.25 × 4 and w is 3. Subtracting only the rate leaves 3.75. Adding the step leaves 5. The best weight is 2, and this step does not land on it.",
    options: [
      { id: "3", text: "3" },
      { id: "3.75", text: "3.75. Subtract the rate, and ignore the gradient." },
      { id: "5", text: "5. Add the rate times the gradient." },
      { id: "2", text: "2. One step lands on the best weight." },
    ],
  },
  {
    label: "still short of the best weight",
    setup:
      "Same line. One step moved w from 4 to 3. The best weight is still 2. The loss fell from 4 to 1.",
    prompt: "What is true about this step?",
    answer: "short",
    idea: "3 is still above 2, so the step has not crossed the best weight. The loss falling from 4 to 1 does not finish the fit. The best weight is still 2, the weight that hits (1, 2).",
    options: [
      { id: "short", text: "w is still short of the best weight, on the side it started." },
      { id: "crossed", text: "w crossed the best weight." },
      { id: "done", text: "The loss fell, so the fit is finished." },
      { id: "moved", text: "The best weight is now 3, because that is where the step stopped." },
    ],
  },
  {
    label: "a step that crossed",
    setup:
      "The steep line has one point, (2, 4). The best weight is 2. Start at w = 4. The rate is 0.5, fixed. One step sends w to −4, and the loss rises from 16 to 144.",
    prompt: "What does this step tell you?",
    answer: "rate",
    idea: "The gradient at 4 is 8 × (4 − 2) = 16. A rate of 0.5 subtracts 8, so w lands at −4, past 2. The distance from 2 grew from 2 to 6, and the loss went from 16 to 144. The gradient was not zero. Averaging the loss would not throw w to the other side. The best weight is still 2. The rate is too large for this curvature.",
    options: [
      { id: "rate", text: "The rate is too large for this curvature." },
      { id: "moved", text: "The best weight moved to −4." },
      { id: "zero", text: "The gradient was zero, so the step should not have moved." },
      { id: "averaged", text: "The loss is being averaged, which flips the sign." },
    ],
  },
];

export function rateQuestionAt(index: number): Question | null {
  if (index === 0) return rateQuestions[0] ?? null;
  if (index === 1) return rateQuestions[1] ?? null;
  if (index === 3) return rateQuestions[2] ?? null;
  return null;
}

export type LineMarks = { shallow: boolean | null; steep: boolean | null };

export type RateRun = {
  sessionId: string;
  startedAt: number;
  answers: string[];
  choice: string | null;
  revealed: boolean;
  lines: LineMarks;
  unseenRuns: number;
  unseenPass: boolean;
  completedAt: number | null;
};

export function freshRate(): RateRun {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: Date.now(),
    answers: [],
    choice: null,
    revealed: false,
    lines: { shallow: null, steep: null },
    unseenRuns: 0,
    unseenPass: false,
    completedAt: null,
  };
}

export function parseRate(raw: string | null): RateRun | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as RateRun;
    if (!parsed.sessionId || !Array.isArray(parsed.answers) || !parsed.lines) return null;
    if (parsed.answers.length > rateStations.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function rateCleared(run: RateRun): number {
  const step = run.answers[0] === rateQuestions[0]?.answer ? 1 : 0;
  const short = run.answers[1] === rateQuestions[1]?.answer ? 1 : 0;
  const lines = run.answers[2] === "pass" ? 1 : 0;
  const cause = run.answers[3] === rateQuestions[2]?.answer ? 1 : 0;
  const unseen = run.answers[4] === "pass" ? 1 : 0;
  return step + short + lines + cause + unseen;
}

export function rateMisses(run: RateRun): string[] {
  const misses: string[] = [];
  if (run.answers[0] && run.answers[0] !== rateQuestions[0]?.answer) misses.push(rateQuestions[0]?.label ?? "the step");
  if (run.answers[1] && run.answers[1] !== rateQuestions[1]?.answer) misses.push(rateQuestions[1]?.label ?? "the short step");
  if (run.answers[2] && run.answers[2] !== "pass") misses.push("the two lines");
  if (run.answers[3] && run.answers[3] !== rateQuestions[2]?.answer) misses.push(rateQuestions[2]?.label ?? "the crossed step");
  if (run.answers[4] && run.answers[4] !== "pass") misses.push("the new line");
  return misses;
}

export function rateReply(run: RateRun): string {
  const misses = rateMisses(run);
  const link = "https://atlas.brohammad.tech/classical/rate";
  if (misses.length === 0) return `tried the learning-rate unit. cleared it.\n${link}`;
  return `tried the learning-rate unit. got these wrong: ${misses.join(", ")}.\n${link}`;
}

export function bowlMatchesPoints(line: FitLine, w: number): boolean {
  const gap = w - line.bowl.mu;
  const bowlLoss = (line.bowl.k / 2) * gap * gap;
  return Math.abs(sumSquared(line, w) - bowlLoss) < 1e-9;
}
