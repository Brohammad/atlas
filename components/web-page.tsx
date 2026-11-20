"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { continueHref, firstOpenStep, REGRESSION_PATH_STEPS } from "@/lib/regression-path";
import { useEffect, useState } from "react";
import { LossChart } from "@/components/curve";
import { clearedCount, STORAGE_KEY, type Progress } from "@/components/lab-app";
import { runDescent } from "@/lib/descent";
import { REG_KEY, parseReg, regCleared, regressionStations, type RegRun } from "@/lib/classical";
import { BASELINE_KEY, parseBaseline } from "@/lib/baseline";
import { LINE_KEY, lineCleared, lineQuestions, parseLine, type LineRun } from "@/lib/line";
import { LEAK_KEY, parseLeak } from "@/lib/leak";
import { RATE_KEY, parseRate } from "@/lib/rate";
import { RESID_KEY, parseResid } from "@/lib/resid";
import { TWO_KEY, parseTwo } from "@/lib/two";

const cta =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-copper px-5 text-sm font-semibold text-paper";
const quiet =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-plate px-5 text-sm font-semibold text-ink";

const stations = ["understand", "predict", "experiment", "debug", "apply"] as const;

export function WebPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [visit, setVisit] = useState(0);
  useEffect(() => {
    const refresh = () => setVisit((n) => n + 1);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  void visit;
  const sitting = pathname === "/" ? readSitting() : null;
  const line = pathname === "/" ? readLine() : null;
  const regression = pathname === "/" ? readReg() : null;
  const finished =
    pathname === "/"
      ? [
          line?.completedAt != null,
          labFinished(sitting),
          regression?.completedAt != null,
          readCompleted(TWO_KEY, parseTwo),
          readCompleted(RESID_KEY, parseResid),
          readCompleted(RATE_KEY, parseRate),
          readCompleted(BASELINE_KEY, parseBaseline),
          readCompleted(LEAK_KEY, parseLeak),
        ]
      : REGRESSION_PATH_STEPS.map(() => false);
  const next = firstOpenStep(finished);
  const nextHref = continueHref(finished);
  const lineOpen = line !== null && (line.answers.length > 0 || line.choice !== null || line.completedAt != null);
  const regOpen =
    regression !== null &&
    (regression.answers.length > 0 || regression.choice !== null || regression.completedAt != null);
  const open = sitting !== null;
  const done = labFinished(sitting);
  const beginLabel = next === 0 && !lineOpen ? "Begin" : next >= REGRESSION_PATH_STEPS.length ? "Review" : "Continue";

  function begin() {
    router.push(nextHref);
  }

  function startOver() {
    sessionStorage.removeItem(STORAGE_KEY);
    router.push("/lab");
  }

  function resetLine() {
    sessionStorage.removeItem(LINE_KEY);
    router.push("/beginner");
  }

  function resetReg() {
    sessionStorage.removeItem(REG_KEY);
    router.push("/classical/regression");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.22em] text-copper">ATLAS</p>
        <button className={cta} type="button" onClick={begin}>
          {beginLabel}
        </button>
      </header>

      <div className="mt-12 grid items-start gap-10 lg:mt-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-[1.05]">
            {done
              ? "Your result is still on this browser."
              : open
                ? "Your sitting is still here."
                : "Say the next value before the chart moves."}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-muted">
            {open
              ? "No account. This browser kept the run. Continue it, or start again from the check."
              : "Fifteen minutes. No account. Start with a line. The chart on this page is the search that comes after it."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className={cta} type="button" onClick={begin}>
              {next === 0 && !lineOpen ? "Begin with a line" : beginLabel}
            </button>
            {open ? (
              <button className={quiet} type="button" onClick={startOver}>
                Start over
              </button>
            ) : (
              <button
                className={quiet}
                type="button"
                onClick={() =>
                  document.getElementById("sample-question")?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                See a question
              </button>
            )}
          </div>
        </div>
        <QuestionCard />
      </div>

      <ol className="mt-12 grid grid-cols-5 gap-2">
        {stations.map((name, index) => {
          const state = stationState(sitting, index);
          return (
            <li key={name} className="text-center">
              <span
                className={`mx-auto grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-semibold ${
                  state === "done"
                    ? "border-copper bg-copper text-paper"
                    : state === "now"
                      ? "border-copper bg-plate text-copper shadow-[0_0_0_4px_rgba(198,241,53,0.2)]"
                      : "border-line bg-plate text-muted"
                }`}
              >
                {state === "done" ? "✓" : index + 1}
              </span>
              <span className={`mt-2 block text-[10px] leading-tight sm:text-xs ${state === "ahead" ? "text-muted" : "text-ink"}`}>
                {name[0]?.toUpperCase()}{name.slice(1)}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-8 max-w-lg text-sm leading-6 text-muted">
        {open
          ? `${clearedCount(sitting)} cleared so far. Understand, predict, find a rate, name the fault, then write the update.`
          : "Understand the step, predict the next one, find a rate, name the fault, then write the update yourself."}
      </p>
      <RecommendedPath next={next} />
      <LineDoor line={line} onOpen={() => router.push("/beginner")} onReset={resetLine} />
      <TrackDoor
        run={regression}
        onOpen={() => router.push(regOpen ? "/classical/regression" : "/classical")}
        onReset={resetReg}
      />
    </main>
  );
}

function RecommendedPath({ next }: { next: number }) {
  return (
    <section className="mt-10 rounded-2xl border border-line bg-plate p-5">
      <p className="text-xs font-semibold tracking-[0.14em] text-copper uppercase">Recommended path</p>
      <ol className="mt-3 space-y-2 text-sm leading-6">
        {REGRESSION_PATH_STEPS.map((step, index) => (
          <li key={step.href} className="flex gap-2">
            <span className="text-muted tabular-nums">{index + 1}.</span>
            <Link href={step.href} className="font-medium text-ink underline-offset-2 hover:underline">
              {step.label}
            </Link>
            {index < next ? <span className="text-muted">Done</span> : null}
            {index === next ? <span className="font-semibold text-copper">Next</span> : null}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm leading-6 text-muted">
        Deep links still work out of order. Each unit&apos;s result also offers the next sitting when you are ready.
      </p>
    </section>
  );
}

function TrackDoor({
  run,
  onOpen,
  onReset,
}: {
  run: RegRun | null;
  onOpen: () => void;
  onReset: () => void;
}) {
  const open = run !== null && (run.answers.length > 0 || run.choice !== null || run.completedAt != null);
  const done = run?.completedAt != null;
  return (
    <section className="mt-4 rounded-2xl border border-line bg-plate p-5">
      <p className="text-xs font-semibold tracking-[0.14em] text-copper uppercase">Traditional ML</p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight">
        {done ? "Your regression result is still on this browser." : open ? "Regression is still open." : "Implement the model."}
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
        {open && run
          ? `${regCleared(run)} of ${regressionStations.length} cleared. This unit is the line with a bias, the partial, and the step you write.`
          : "After the line and the search: bias, two inputs, residuals, learning rate, a mean baseline, then a column that copies the label."}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button className={cta} type="button" onClick={onOpen}>
          {open ? "Continue regression" : "Open the track"}
        </button>
        {open ? (
          <button className={quiet} type="button" onClick={onReset}>
            Start over
          </button>
        ) : null}
      </div>
    </section>
  );
}

function LineDoor({
  line,
  onOpen,
  onReset,
}: {
  line: LineRun | null;
  onOpen: () => void;
  onReset: () => void;
}) {
  const open = line !== null && (line.answers.length > 0 || line.choice !== null || line.completedAt != null);
  const done = line?.completedAt != null;
  return (
    <section className="mt-10 rounded-2xl border border-line bg-plate p-5">
      <p className="text-xs font-semibold tracking-[0.14em] text-copper uppercase">Beginner</p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight">
        {done ? "Your line result is still on this browser." : open ? "The line is still open." : "Fit a line."}
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
        {open
          ? `${line ? lineCleared(line) : 0} of ${lineQuestions.length} cleared. One weight, three points, then the reason to take a step.`
          : `${lineQuestions.length} questions before the gradient descent lab. One weight, three points, no bias, then why you stop trying weights one by one.`}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button className={cta} type="button" onClick={onOpen}>
          {open ? "Continue the line" : "Begin the line"}
        </button>
        {open ? (
          <button className={quiet} type="button" onClick={onReset}>
            Start over
          </button>
        ) : null}
      </div>
    </section>
  );
}

function QuestionCard() {
  const trace = runDescent({ k: 2, mu: 0, w0: 1 }, 0, 0);
  return (
    <div id="sample-question" className="rounded-2xl border border-line bg-plate p-4">
      <p className="text-xs font-semibold tracking-wide text-copper">A question from the lab</p>
      <p className="mt-3 text-sm leading-6">
        L(θ) = θ². Start at θ = 1. Learning rate 1.5. After four updates, what is θ?
      </p>
      <div className="mt-4">
        <LossChart bowl={{ k: 2, mu: 0, w0: 1 }} trace={trace} cursor={0} span={4} readout="position" />
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {["16, distance doubles", "81, distance triples", "1/16, distance halves", "−5, never turns"].map((label) => (
          <li key={label} className="rounded-xl border border-line px-3 py-2">
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function readReg(): RegRun | null {
  try {
    return parseReg(sessionStorage.getItem(REG_KEY));
  } catch {
    return null;
  }
}

function readLine(): LineRun | null {
  try {
    return parseLine(sessionStorage.getItem(LINE_KEY));
  } catch {
    return null;
  }
}

function labFinished(sitting: Progress | null): boolean {
  return sitting?.stage === "results" || sitting?.stage === "retention" || sitting?.completedAt != null;
}

function readCompleted(key: string, parse: (raw: string | null) => { completedAt: number | null } | null): boolean {
  try {
    return parse(sessionStorage.getItem(key))?.completedAt != null;
  } catch {
    return false;
  }
}

function readSitting(): Progress | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Progress;
    if (!parsed.sessionId || !parsed.stage || parsed.stage === "intro") return null;
    return parsed;
  } catch {
    return null;
  }
}

function stationState(sitting: Progress | null, index: number): "done" | "now" | "ahead" {
  if (!sitting) return "ahead";
  if (sitting.stage === "results" || sitting.stage === "retention" || sitting.stage === "post") return "done";
  const at = stations.indexOf(sitting.stage as (typeof stations)[number]);
  if (at < 0) return "ahead";
  if (index < at) return "done";
  if (index === at) return "now";
  return "ahead";
}
