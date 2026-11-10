import { fmt, loss, type Bowl, type TracePoint } from "@/lib/descent";

const width = 640;
const height = 300;
const pad = { l: 44, r: 12, t: 14, b: 32 };

export function LossChart({
  bowl,
  trace,
  cursor,
  showTangent = false,
  span: spanProp,
  readout = "full",
}: {
  bowl: Bowl;
  trace: TracePoint[];
  cursor: number;
  showTangent?: boolean;
  span?: number;
  readout?: "full" | "position";
}) {
  const span = spanProp ?? Math.max(2.2, Math.abs(bowl.w0 - bowl.mu) * 1.75);
  const wMin = bowl.mu - span;
  const wMax = bowl.mu + span;
  const samples = Array.from({ length: 81 }, (_, i) => {
    const w = wMin + ((wMax - wMin) * i) / 80;
    return { w, y: loss(bowl, w) };
  });
  const yMax = Math.max(...samples.map((sample) => sample.y), 1e-6) * 1.06;
  const plotW = width - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;
  const xOf = (w: number) => pad.l + ((w - wMin) / (wMax - wMin)) * plotW;
  const yOf = (value: number) => pad.t + (1 - Math.min(Math.max(value, 0), yMax) / yMax) * plotH;
  const curve = samples
    .map((sample, i) => `${i === 0 ? "M" : "L"}${xOf(sample.w).toFixed(1)} ${yOf(sample.y).toFixed(1)}`)
    .join(" ");
  const index = Math.min(Math.max(cursor, 0), Math.max(trace.length - 1, 0));
  const shown = trace.slice(0, index + 1);
  const inside = shown.filter((point) => point.w >= wMin && point.w <= wMax && point.loss <= yMax);
  const walked = inside
    .map((point, i) => `${i === 0 ? "M" : "L"}${xOf(point.w).toFixed(1)} ${yOf(point.loss).toFixed(1)}`)
    .join(" ");
  const current = trace[index];
  const leftWindow = shown.some((point) => point.w < wMin || point.w > wMax || point.loss > yMax);
  const tangent = showTangent && current ? tangentPath(current, xOf, yOf, wMin, wMax) : null;

  return (
    <figure className="border border-line bg-plate">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={
          current
            ? readout === "full"
              ? `Loss curve. Parameter ${fmt(current.w)}, loss ${fmt(current.loss)}, gradient ${fmt(current.grad)}.`
              : `Loss curve. Parameter ${fmt(current.w)}, loss ${fmt(current.loss)}.`
            : "Loss curve"
        }
        className="h-auto w-full"
      >
        {[0.25, 0.5, 0.75].map((tick) => (
          <line
            key={tick}
            x1={pad.l}
            x2={width - pad.r}
            y1={yOf(yMax * tick)}
            y2={yOf(yMax * tick)}
            stroke="var(--line)"
          />
        ))}
        <line x1={xOf(bowl.mu)} x2={xOf(bowl.mu)} y1={pad.t} y2={height - pad.b} stroke="var(--line)" />
        <text x={xOf(bowl.mu) + 6} y={pad.t + 12} fill="var(--muted)" fontSize="12">
          minimum
        </text>
        <path d={curve} fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        {walked && <path d={walked} fill="none" stroke="var(--copper)" strokeWidth="2" />}
        {tangent && <path d={tangent} fill="none" stroke="var(--muted)" strokeWidth="1" />}
        {current && current.w >= wMin && current.w <= wMax && (
          <circle cx={xOf(current.w)} cy={yOf(Math.min(current.loss, yMax))} r="5" fill="var(--copper)" />
        )}
        <text x={pad.l} y={height - 8} fill="var(--muted)" fontSize="12">
          parameter w
        </text>
        <text x={8} y={pad.t + 12} fill="var(--muted)" fontSize="12">
          loss
        </text>
      </svg>
      {current && (
        <figcaption className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-3 py-2 font-mono text-xs text-muted">
          <span>w = {fmt(current.w)}</span>
          <span>loss = {fmt(current.loss)}</span>
          {readout === "full" && <span>gradient = {fmt(current.grad)}</span>}
          {readout === "full" && current.delta !== 0 && <span>change in w = {fmt(current.delta)}</span>}
          {leftWindow && <span>A step left this window.</span>}
        </figcaption>
      )}
    </figure>
  );
}

function tangentPath(
  point: TracePoint,
  xOf: (w: number) => number,
  yOf: (value: number) => number,
  wMin: number,
  wMax: number,
): string | null {
  const dw = Math.min(0.45, (wMax - wMin) * 0.08);
  const w1 = Math.max(wMin, point.w - dw);
  const w2 = Math.min(wMax, point.w + dw);
  const y1 = point.loss + point.grad * (w1 - point.w);
  const y2 = point.loss + point.grad * (w2 - point.w);
  if (y1 < 0 && y2 < 0) return null;
  return `M${xOf(w1).toFixed(1)} ${yOf(Math.max(y1, 0)).toFixed(1)} L${xOf(w2).toFixed(1)} ${yOf(Math.max(y2, 0)).toFixed(1)}`;
}
