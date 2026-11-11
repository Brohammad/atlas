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
/** L(w) = w² from w = 1 at rate 1.5. The parameter walks 1, −2, 4, −8. */
export const debugOscBowl: Bowl = { k: 2, mu: 0, w0: 1 };
export const unseenBowl: Bowl = { k: 6, mu: -1.5, w0: 1 };
export const retentionBowl: Bowl = { k: 4, mu: 1, w0: -2 };

export const TEACH_LR = 0.25;
export const DEBUG_OSC_LR = 1.5;
export const DEBUG_SIGN_LR = 0.25;
export const EXPERIMENT_STEPS = 10;
export const APPLY_STEPS = 12;
export const RETENTION_STEPS = 10;
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

export function describeBowl(bowl: Bowl): string {
  const half = bowl.k / 2;
  const inside = bowl.mu === 0 ? "w" : bowl.mu > 0 ? `(w − ${bowl.mu})` : `(w + ${Math.abs(bowl.mu)})`;
  const lossBody = bowl.mu === 0 ? "w²" : `${inside}²`;
  const lossText = half === 1 ? lossBody : `${half} ${lossBody}`;
  const gradient = bowl.k === 1 ? inside : `${bowl.k}${inside}`;
  const start = String(bowl.w0).replace("-", "−");
  return `L(w) = ${lossText}. The gradient is ${gradient}. Start at w = ${start}.`;
}

export function trajectoryNote(bowl: Bowl, trace: TracePoint[], limit = LOSS_OK): string {
  const start = trace[0];
  const end = trace.at(-1);
  if (!start || !end) return "Run the steps, then read the last loss.";
  if (Number.isFinite(end.loss) && end.loss < limit && trace.length > 1) {
    return "The loss at the last step is under 0.05.";
  }
  const dist = (w: number) => w - bowl.mu;
  const crossed = trace.some((point, index) => index > 0 && dist(start.w) * dist(point.w) < 0);
  const grew = Math.abs(dist(end.w)) > Math.abs(dist(start.w));
  if (crossed && grew) {
    return "It crossed the minimum, and a later step landed farther away. The gradient grew on the other side, so this same rate took a longer step. Try a smaller rate. The rate stays fixed for every step of the run.";
  }
  if (Math.abs(dist(end.w)) < Math.abs(dist(start.w))) {
    return "It moved toward the minimum and was still short at the last step. A larger rate, still fixed for the whole run, may finish under 0.05.";
  }
  return "The loss at the last step is still above 0.05. Change the rate and run again. The rate stays fixed for every step.";
}

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
