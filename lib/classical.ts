import type { Question } from "./lesson";

export const REG_KEY = "atlas.reg.v1";

export type TrainPoint = { x: number; y: number };

/** Three training points for ŷ = w x + b. The worked fit is w = 1, b = 2. */
export const trainPoints: TrainPoint[] = [
  { x: 1, y: 3 },
  { x: 2, y: 5 },
  { x: 4, y: 7 },
];

export const FIT_W = 1;
export const FIT_B = 2;
export const FIT_LR = 0.05;

export function predictLinear(w: number, b: number, x: number): number {
  return w * x + b;
}

export function squaredGap(yHat: number, y: number): number {
  const gap = yHat - y;
  return gap * gap;
}

export function sumSquaredError(w: number, b: number, points: TrainPoint[] = trainPoints): number {
  return points.reduce((sum, point) => sum + squaredGap(predictLinear(w, b, point.x), point.y), 0);
}

/** ∂/∂w of Σ (ŷ − y)², with ŷ = w x + b. */
export function partialW(w: number, b: number, points: TrainPoint[] = trainPoints): number {
  return (
    2 *
    points.reduce((sum, point) => {
      const residual = predictLinear(w, b, point.x) - point.y;
      return sum + residual * point.x;
    }, 0)
  );
}

export function descend(w: number, partial: number, lr: number): number {
  return w - lr * partial;
}

export const regressionStations = [
  "predict",
  "square",
  "total",
  "partial",
  "update",
  "sign",
  "holdout",
  "code",
] as const;

export const regressionQuestions: Question[] = [
  {
    label: "a prediction with bias",
    setup: "The model is ŷ = w x + b. It has a bias term. w = 1.5 and b = 1.",
    prompt: "At x = 2, what is ŷ?",
    answer: "4",
    idea: "1.5 × 2 + 1 = 4. Dropping the bias gives 3. Adding the weight to the bias, and ignoring x, gives 2.5. The weight alone is 1.5.",
    options: [
      { id: "4", text: "4" },
      { id: "3", text: "3" },
      { id: "1.5", text: "1.5" },
      { id: "2.5", text: "2.5" },
    ],
  },
  {
    label: "one squared error",
    setup: "One training point. The label is y = 5 and the model says ŷ = 4. Squared error is (ŷ − y)².",
    prompt: "What is the squared error?",
    answer: "1",
    idea: "(4 − 5)² = 1. −1 is the residual before it is squared. 5 is the label. 20 is the product of the label and the prediction.",
    options: [
      { id: "1", text: "1" },
      { id: "-1", text: "−1" },
      { id: "5", text: "5" },
      { id: "20", text: "20" },
    ],
  },
  {
    label: "sum of squared errors",
    setup:
      "ŷ = w x + b with w = 1 and b = 2. The loss is the sum of squared errors on the training points (1, 3), (2, 5), and (4, 7). Do not average them.",
    prompt: "What is the loss?",
    answer: "2",
    idea: "The predictions are 3, 4, and 6. Squared errors are 0, 1, and 1, which add to 2. Scoring only one miss gives 1. A perfect line would be 0. Adding the labels gives 15.",
    options: [
      { id: "2", text: "2" },
      { id: "1", text: "1" },
      { id: "0", text: "0" },
      { id: "15", text: "15" },
    ],
  },
  {
    label: "the partial for w",
    setup:
      "Same fit, w = 1 and b = 2. Residuals ŷ − y are 0, −1, and −1. The loss is L = Σ (ŷ − y)², so ∂L/∂w = 2 Σ (ŷ − y) x. The x in that sum is the chain rule through ŷ = w x + b.",
    prompt: "What is ∂L/∂w?",
    answer: "-12",
    idea: "Σ (ŷ − y) x = 0×1 + (−1)×2 + (−1)×4 = −6. Differentiating the square brings a 2, so the partial is −12. −6 forgot that 2. −2 is only the sum of the residuals. 12 is the uphill direction.",
    options: [
      { id: "-12", text: "−12" },
      { id: "-6", text: "−6" },
      { id: "-2", text: "−2" },
      { id: "12", text: "12" },
    ],
  },
  {
    label: "one descent step",
    setup:
      "w is 1. ∂L/∂w is −12. The learning rate is 0.05, and it stays fixed for this step. Descent is w ← w − 0.05 × ∂L/∂w.",
    prompt: "What is w after one update?",
    answer: "1.6",
    idea: "1 − 0.05 × (−12) = 1.6. Adding the partial instead gives 0.4, which moves the other way. Using −6 in place of −12 gives 1.3. Replacing w with the partial gives −12.",
    options: [
      { id: "1.6", text: "1.6" },
      { id: "0.4", text: "0.4" },
      { id: "1.3", text: "1.3" },
      { id: "-12", text: "−12" },
    ],
  },
  {
    label: "an update that adds the partial",
    setup: "The code does w ← w + 0.05 × ∂L/∂w. w is 1 and ∂L/∂w is −12.",
    prompt: "What is w after this update?",
    answer: "0.4",
    idea: "1 + 0.05 × (−12) = 0.4. The partial is negative, so adding it decreases w and walks away from 1.6. The rate did move the weight. Descent subtracts the partial.",
    options: [
      { id: "0.4", text: "0.4. The step added the partial." },
      { id: "1.6", text: "1.6. This code is already descent." },
      { id: "-12", text: "−12. The weight is replaced by the partial." },
      { id: "1", text: "1. A rate of 0.05 is too small to move." },
    ],
  },
  {
    label: "a held-out point",
    setup: "You kept w = 1 and b = 2. A new point arrives: x = 3, y = 6. Score only this point. The training loss was 2.",
    prompt: "What is the squared error on the new point?",
    answer: "1",
    idea: "ŷ = 1 × 3 + 2 = 5, and (5 − 6)² = 1. The training sum does not transfer. Fitting (1, 3) exactly does not make this point exact. 3 is the input, not the error.",
    options: [
      { id: "1", text: "1" },
      { id: "2", text: "2, the training loss." },
      { id: "0", text: "0. One training point was exact, so new points are exact." },
      { id: "3", text: "3, the input." },
    ],
  },
];

function showNum(n: number): string {
  const rounded = Math.round(n * 1000) / 1000;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

export function regressionCodeNote(value: number): { ok: boolean; note: string } {
  const expect = descend(FIT_W, partialW(FIT_W, FIT_B), FIT_LR);
  if (Math.abs(value - expect) > 1e-9) {
    return {
      ok: false,
      note: `step(1, −12, 0.05) returned ${showNum(value)}. Descent on this partial returns ${showNum(expect)}.`,
    };
  }
  return {
    ok: true,
    note: "step(1, −12, 0.05) returned 1.6. The partial is negative, so subtracting it moves w up, toward the lower loss.",
  };
}

export type RegRun = {
  sessionId: string;
  startedAt: number;
  answers: string[];
  choice: string | null;
  revealed: boolean;
  code: string;
  codeNote: string | null;
  codeOk: boolean;
  completedAt: number | null;
};

export function freshReg(code: string): RegRun {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: Date.now(),
    answers: [],
    choice: null,
    revealed: false,
    code,
    codeNote: null,
    codeOk: false,
    completedAt: null,
  };
}

export function parseReg(raw: string | null): RegRun | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as RegRun;
    if (!parsed.sessionId || !Array.isArray(parsed.answers)) return null;
    if (parsed.answers.length > regressionStations.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function regCleared(run: RegRun): number {
  const choiceHits = run.answers.filter((choice, index) => choice === regressionQuestions[index]?.answer).length;
  const codeHit = run.answers[regressionQuestions.length] === "pass" ? 1 : 0;
  return choiceHits + codeHit;
}

export function regMisses(run: RegRun): string[] {
  const misses = run.answers.flatMap((choice, index) => {
    const question = regressionQuestions[index];
    if (!question || choice === question.answer) return [];
    return [question.label ?? question.prompt];
  });
  if (run.answers[regressionQuestions.length] && run.answers[regressionQuestions.length] !== "pass") {
    misses.push("the descent step");
  }
  return misses;
}

export function regReply(run: RegRun): string {
  const misses = regMisses(run);
  const link = "https://atlas.brohammad.tech/classical/regression";
  if (misses.length === 0) return `tried the regression unit. cleared it.\n${link}`;
  return `tried the regression unit. got these wrong: ${misses.join(", ")}.\n${link}`;
}

export type ModuleStatus = "open" | "later";

export type ClassicalModule = {
  id: string;
  title: string;
  objective: string;
  project: string;
  lessons: number;
  status: ModuleStatus;
};

export const classicalModules: ClassicalModule[] = [
  {
    id: "math",
    title: "Mathematical foundations",
    objective: "Vectors, matrices, derivatives, and probability, used when a later unit needs them.",
    project: "A NumPy toolkit, with no high-level ML library.",
    lessons: 12,
    status: "later",
  },
  {
    id: "data",
    title: "Data preparation",
    objective: "What makes a table learnable, and how a split can leak the answer.",
    project: "A reproducible preprocessing pipeline on a messy table.",
    lessons: 12,
    status: "later",
  },
  {
    id: "regression",
    title: "Regression",
    objective: "Predict a number. Compute the loss, the partial, and the update yourself.",
    project: "House prices, with an error analysis. Four units are open.",
    lessons: 12,
    status: "open",
  },
  {
    id: "classification",
    title: "Classification",
    objective: "Predict a category, and know what a false positive costs.",
    project: "A fraud classifier judged on false positives and false negatives.",
    lessons: 12,
    status: "later",
  },
  {
    id: "ensembles",
    title: "Trees and ensembles",
    objective: "Splits, impurity, and why a forest can beat one deep tree.",
    project: "Several models on one table, and a reason the winner won.",
    lessons: 13,
    status: "later",
  },
  {
    id: "margins",
    title: "Neighbors and margins",
    objective: "Distance, K, and a maximum-margin boundary.",
    project: "KNN against a linear SVM and a kernel SVM.",
    lessons: 10,
    status: "later",
  },
  {
    id: "unsupervised",
    title: "Unsupervised learning",
    objective: "Structure when there is no label.",
    project: "Customer segments and an anomaly rule.",
    lessons: 11,
    status: "later",
  },
  {
    id: "reduction",
    title: "Dimensionality reduction",
    objective: "When a coordinate is noise, and what a component keeps.",
    project: "One high-dimensional table, several representations.",
    lessons: 10,
    status: "later",
  },
  {
    id: "selection",
    title: "Model selection",
    objective: "Generalization, validation, and the ways a score can lie.",
    project: "A selection pipeline and a defense of the model you keep.",
    lessons: 12,
    status: "later",
  },
  {
    id: "features",
    title: "Feature engineering",
    objective: "Signals built from raw columns, including a rare positive class.",
    project: "Credit risk or churn, with the imbalance handled on purpose.",
    lessons: 12,
    status: "later",
  },
  {
    id: "probability",
    title: "Probabilistic models",
    objective: "Bayes, mixtures, and a forecast that says how unsure it is.",
    project: "A recommender or a classical forecast.",
    lessons: 12,
    status: "later",
  },
  {
    id: "production",
    title: "Production",
    objective: "A model that can be served, watched, and retrained.",
    project: "An inference service with a retraining rule.",
    lessons: 12,
    status: "later",
  },
];
