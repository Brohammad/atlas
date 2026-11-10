export type Bowl = {
  k: number;
  mu: number;
  w0: number;
};

export type UpdateMode = "descent" | "ascent";

export type TracePoint = {
  step: number;
  w: number;
  loss: number;
  grad: number;
  delta: number;
};

export const teachBowl: Bowl = { k: 2, mu: 2, w0: 4.5 };
export const flatBowl: Bowl = { k: 1, mu: 0, w0: 5 };
export const steepBowl: Bowl = { k: 10, mu: 0, w0: 2 };
export const debugBowl: Bowl = { k: 2, mu: 0, w0: 1.2 };
export const unseenBowl: Bowl = { k: 6, mu: -1.5, w0: 1 };
export const retentionBowl: Bowl = { k: 4, mu: 1, w0: -2 };

export const TEACH_LR = 0.25;
export const DEBUG_OSC_LR = 1.4;
export const DEBUG_SIGN_LR = 0.25;
export const EXPERIMENT_STEPS = 10;
export const APPLY_STEPS = 12;
export const RETENTION_STEPS = 12;
export const LOSS_OK = 0.05;

export type PredictItem = {
  bowl: Bowl;
  lr: number;
  steps: number;
  span?: number;
};

// Each item is a fully specified update. The last one is L(θ)=θ² from θ=1 at rate 1.5.
export const predictItems: PredictItem[] = [
  { bowl: { k: 2, mu: 0, w0: 3 }, lr: 0.1, steps: 1 },
  { bowl: { k: 2, mu: 0, w0: 4 }, lr: 0.5, steps: 1 },
  { bowl: { k: 2, mu: 0, w0: 1 }, lr: 1.5, steps: 4, span: 18 },
];

export function loss(bowl: Bowl, w: number): number {
  const d = w - bowl.mu;
  return (bowl.k / 2) * d * d;
}

export function gradient(bowl: Bowl, w: number): number {
  return bowl.k * (w - bowl.mu);
}

export function stableLearningRate(k: number, lr: number): boolean {
  return lr > 0 && Math.abs(1 - lr * k) < 1;
}

export function stepParameter(
  w: number,
  g: number,
  lr: number,
  mode: UpdateMode = "descent",
): number {
  return mode === "ascent" ? w + lr * g : w - lr * g;
}

export function runDescent(
  bowl: Bowl,
  lr: number,
  steps: number,
  mode: UpdateMode = "descent",
): TracePoint[] {
  const points: TracePoint[] = [];
  let w = bowl.w0;
  for (let i = 0; i <= steps; i++) {
    const g = gradient(bowl, w);
    const l = loss(bowl, w);
    const next = i === steps ? w : stepParameter(w, g, lr, mode);
    points.push({
      step: i,
      w,
      loss: l,
      grad: g,
      delta: i === steps ? 0 : next - w,
    });
    w = next;
    if (!Number.isFinite(w) || Math.abs(w) > 1e6) break;
  }
  return points;
}

export function runWithStepFn(
  bowl: Bowl,
  lr: number,
  steps: number,
  stepFn: (w: number, grad: number, lr: number) => number,
): TracePoint[] {
  const points: TracePoint[] = [];
  let w = bowl.w0;
  for (let i = 0; i <= steps; i++) {
    const g = gradient(bowl, w);
    const l = loss(bowl, w);
    let next = w;
    let delta = 0;
    if (i !== steps) {
      next = stepFn(w, g, lr);
      delta = next - w;
    }
    points.push({ step: i, w, loss: l, grad: g, delta });
    w = next;
    if (!Number.isFinite(w) || Math.abs(w) > 1e6) break;
  }
  return points;
}

export function reachedLoss(
  trace: TracePoint[],
  steps: number,
  limit = LOSS_OK,
): boolean {
  if (trace.length < steps + 1) return false;
  const last = trace[trace.length - 1];
  return Boolean(last && Number.isFinite(last.loss) && last.loss < limit);
}

export function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 0.001 || abs >= 10000)) return n.toExponential(2);
  const rounded = Math.round(n * 1000) / 1000;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

export function daysSince(startedAt: number, now: number): number {
  return Math.floor((now - startedAt) / 86_400_000);
}

export function retentionDue(startedAt: number, now: number): boolean {
  return daysSince(startedAt, now) >= 7;
}
