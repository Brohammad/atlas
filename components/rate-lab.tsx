"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Choices, Verdict } from "@/components/choices";
import { LossChart } from "@/components/curve";
import { sendEvent } from "@/lib/browser-log";
import { describeBowl, fmt, runDescent, trajectoryNote, type TracePoint } from "@/lib/descent";
import {
  RATE_KEY,
  RATE_OK,
  RATE_STEPS,
  freshRate,
  lineCleared,
  parseRate,
  rateCleared,
  rateMisses,
  rateQuestionAt,
  rateReply,
  rateStations,
  shallowLine,
  steepLine,
  unseenLine,
  type FitLine,
  type RateRun,
} from "@/lib/rate";

const button =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-40";
const primary = `${button} bg-copper text-paper`;
const ghost = `${button} border border-line bg-plate text-ink`;

const practice = ["shallow", "steep"] as const;

export function RateLab() {
  const [run, setRun] = useState<RateRun>(loadRun);

  useEffect(() => {
    sessionStorage.setItem(RATE_KEY, JSON.stringify(run));
  }, [run]);

  useEffect(() => {
    const key = `atlas.rate.started.${run.sessionId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    sendEvent(run.sessionId, "rate_started");
  }, [run.sessionId]);

  const done = run.completedAt != null;
  const index = run.answers.length;
  const question = rateQuestionAt(index);

  function commit() {
    if (!run.choice || run.revealed || !question) return;
    sendEvent(run.sessionId, "rate_answer", {
      index,
      choice: run.choice,
      correct: run.choice === question.answer,
    });
    setRun({ ...run, revealed: true });
  }

  function next() {
    if (!run.choice || !run.revealed) return;
    const answers = [...run.answers, run.choice];
    setRun({
      ...run,
      answers,
      choice: null,
      revealed: false,
      completedAt: answers.length === rateStations.length ? Date.now() : null,
    });
  }

  function again() {
    const nextRun = freshRate();
    sessionStorage.setItem(RATE_KEY, JSON.stringify(nextRun));
    setRun(nextRun);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/classical" className="text-xs font-semibold tracking-[0.22em] text-copper">
          ATLAS
        </Link>
        <div className="flex flex-wrap gap-2">
          <p className="rounded-full bg-plate px-3 py-1 text-xs font-semibold tracking-wide text-ink">
            {done ? "Unit complete" : `Station ${index + 1} of ${rateStations.length}`}
          </p>
          <p className="rounded-full bg-copper px-3 py-1 text-xs font-semibold tracking-wide text-paper">
            {rateCleared(run)} cleared
          </p>
        </div>
      </header>
      <Track index={done ? rateStations.length : index} />
      {done ? (
        <Result run={run} onAgain={again} />
      ) : index === 2 ? (
        <LinesStage
          sessionId={run.sessionId}
          marks={run.lines}
          onMark={(id, ok) => setRun({ ...run, lines: { ...run.lines, [id]: ok } })}
          onNext={() => {
            if (run.lines.shallow !== true || run.lines.steep !== true) return;
            setRun({ ...run, answers: [...run.answers, "pass"] });
          }}
        />
      ) : index === 4 ? (
        <UnseenStage
          sessionId={run.sessionId}
          runs={run.unseenRuns}
          passed={run.unseenPass}
          onRun={(ok) =>
            setRun({
              ...run,
              unseenRuns: run.unseenRuns + 1,
              unseenPass: run.unseenPass || ok,
            })
          }
          onNext={() =>
            setRun({
              ...run,
              answers: [...run.answers, run.unseenPass ? "pass" : "miss"],
              completedAt: Date.now(),
            })
          }
        />
      ) : question ? (
        <section className="mt-8">
          {question.setup && <p className="text-sm leading-6 text-muted">{question.setup}</p>}
          <div className="mt-6">
            <Choices
              name={`rate-${index}`}
              question={question}
              value={run.choice}
              onChange={(choice) => setRun({ ...run, choice })}
              revealed={run.revealed}
            />
          </div>
          {run.revealed && (
            <div className="mt-4">
              <Verdict right={run.choice === question.answer} idea={question.idea} />
            </div>
          )}
          <div className="mt-8">
            {run.revealed ? (
              <button className={primary} type="button" onClick={next}>
                Next
              </button>
            ) : (
              <button className={primary} type="button" disabled={!run.choice} onClick={commit}>
                Commit
              </button>
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function LinesStage({
  sessionId,
  marks,
  onMark,
  onNext,
}: {
  sessionId: string;
  marks: RateRun["lines"];
  onMark: (id: "shallow" | "steep", ok: boolean) => void;
  onNext: () => void;
}) {
  const [id, setId] = useState<"shallow" | "steep">("shallow");
  const [lr, setLr] = useState(0.4);
  const [saved, setSaved] = useState<Partial<Record<"shallow" | "steep", { lr: number; trace: TracePoint[] }>>>({});
  const line = id === "shallow" ? shallowLine : steepLine;
  const current = saved[id];
  const fresh = current?.lr === lr;
  const both = marks.shallow === true && marks.steep === true;

  function run() {
    const trace = runDescent(line.bowl, lr, RATE_STEPS);
    setSaved((prev) => ({ ...prev, [id]: { lr, trace } }));
    const ok = lineCleared(line, lr);
    onMark(id, ok);
    sendEvent(sessionId, "rate_run", { line: id, lr, correct: ok });
  }

  return (
    <section className="mt-8">
      <p className="font-serif text-2xl leading-snug">Pick a rate. Run {RATE_STEPS} steps. Read the last loss.</p>
      <p className="mt-3 text-[15px] leading-6 text-muted">
        ŷ = w x. No bias. {pointSentence(line)} {describeBowl(line.bowl)} The rate stays fixed for all {RATE_STEPS}{" "}
        steps. You can choose a different rate for the other line. A line is cleared only when the loss after step{" "}
        {RATE_STEPS} is under {RATE_OK}. The loss on the way does not count.
      </p>
      <ul className="mt-5 grid grid-cols-2 gap-2">
        {practice.map((name) => {
          const mark = marks[name];
          const selected = id === name;
          return (
            <li key={name}>
              <button
                className={`w-full rounded-2xl border px-3 py-3 text-left ${
                  mark === true ? "border-good" : mark === false ? "border-bad" : "border-line"
                } ${selected ? "bg-plate" : "bg-paper"}`}
                type="button"
                onClick={() => setId(name)}
              >
                <span className={`block text-[10px] tracking-[0.14em] uppercase ${mark === true ? "text-good" : mark === false ? "text-bad" : "text-muted"}`}>
                  {mark === true ? "Cleared" : mark === false ? "Open" : "Waiting"}
                </span>
                <span className="mt-1 block text-sm">{name === "shallow" ? "Shallow line" : "Steep line"}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <RateSlider lr={lr} onChange={setLr} />
      <div className="mt-4">
        <LossChart
          bowl={line.bowl}
          trace={fresh && current ? current.trace : runDescent(line.bowl, lr, 0)}
          cursor={fresh && current ? current.trace.length - 1 : 0}
          span={12}
        />
      </div>
      {fresh && current && (
        <>
          <p className="mt-3 break-words font-mono text-xs leading-5 text-muted">
            η = {fmt(lr)}. w → {current.trace.map((point) => fmt(point.w)).join(" → ")}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">{trajectoryNote(line.bowl, current.trace, RATE_OK)}</p>
        </>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button className={primary} type="button" onClick={run}>
          Run {RATE_STEPS} steps
        </button>
        <button className={primary} type="button" disabled={!both} onClick={onNext}>
          Next
        </button>
      </div>
    </section>
  );
}

function UnseenStage({
  sessionId,
  runs,
  passed,
  onRun,
  onNext,
}: {
  sessionId: string;
  runs: number;
  passed: boolean;
  onRun: (ok: boolean) => void;
  onNext: () => void;
}) {
  const [lr, setLr] = useState(0.5);
  const [trace, setTrace] = useState<TracePoint[] | null>(null);
  const last = trace?.at(-1);
  const open = runs < 2 && !passed;

  return (
    <section className="mt-8">
      <h1 className="font-serif text-3xl leading-tight">A new line. No review.</h1>
      <p className="mt-3 text-[15px] leading-6 text-muted">
        Points (1, 1) and (2, 2). ŷ = w x. The best weight is 1. {describeBowl(unseenLine.bowl)} Two runs. No hint.
        Each run keeps one rate for {RATE_STEPS} steps. Cleared if either ends under {RATE_OK}.
      </p>
      <RateSlider lr={lr} onChange={setLr} />
      <div className="mt-4">
        <LossChart
          bowl={unseenLine.bowl}
          trace={trace ?? runDescent(unseenLine.bowl, lr, 0)}
          cursor={trace ? trace.length - 1 : 0}
          span={8}
          readout="position"
        />
      </div>
      {last && (
        <p className="mt-3 text-sm leading-6 text-muted">
          Loss after step {RATE_STEPS} is {fmt(last.loss)}.
          {passed ? " Cleared." : last.loss < RATE_OK ? "" : " Still above 0.05."}
        </p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        {open && (
          <button
            className={primary}
            type="button"
            onClick={() => {
              const next = runDescent(unseenLine.bowl, lr, RATE_STEPS);
              const ok = lineCleared(unseenLine, lr);
              setTrace(next);
              onRun(ok);
              sendEvent(sessionId, "rate_unseen", { lr, correct: ok, run: runs + 1 });
            }}
          >
            Run {RATE_STEPS} steps
          </button>
        )}
        {(passed || runs >= 2) && (
          <button className={primary} type="button" onClick={onNext}>
            See the result
          </button>
        )}
      </div>
    </section>
  );
}

function RateSlider({ lr, onChange }: { lr: number; onChange: (lr: number) => void }) {
  return (
    <label className="mt-5 block text-sm">
      <span className="text-muted">Rate {fmt(lr)}</span>
      <input
        className="mt-2 block w-full accent-copper"
        type="range"
        min={0.05}
        max={0.8}
        step={0.05}
        value={lr}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function pointSentence(line: FitLine): string {
  const point = line.points[0];
  if (!point) return "";
  return `This line's point is (${point.x}, ${point.y}), so the best weight is ${line.best}.`;
}

function Track({ index }: { index: number }) {
  return (
    <ol className="mt-8 grid grid-cols-5 gap-2">
      {rateStations.map((name, station) => {
        const state = station < index ? "done" : station === index ? "now" : "ahead";
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
              {state === "done" ? "✓" : station + 1}
            </span>
            <span className={`mt-2 block text-[10px] leading-tight sm:text-xs ${state === "ahead" ? "text-muted" : "text-ink"}`}>
              {name[0]?.toUpperCase()}{name.slice(1)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Result({ run, onAgain }: { run: RateRun; onAgain: () => void }) {
  const misses = rateMisses(run);
  const text = rateReply(run);
  const [copied, setCopied] = useState(false);
  return (
    <section className="mt-8">
      <h1 className="font-serif text-3xl leading-tight">
        {rateCleared(run)} of {rateStations.length} cleared
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        {misses.length === 0
          ? "The same rate can finish a shallow line and step past the best weight on a steeper one."
          : `Still open: ${misses.join(", ")}.`}
      </p>
      <section className="mt-6 rounded-2xl border border-line bg-plate p-4">
        <h2 className="text-xs font-semibold tracking-[0.14em] text-copper uppercase">For the reply</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{text}</p>
        <button className={`${ghost} mt-4`} type="button" onClick={() => void copyText(text).then(setCopied)}>
          {copied ? "Copied" : "Copy"}
        </button>
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/classical" className={primary}>
          Back to the track
        </Link>
        <button className={ghost} type="button" onClick={onAgain}>
          Start over
        </button>
      </div>
    </section>
  );
}

function loadRun(): RateRun {
  if (typeof sessionStorage === "undefined") return freshRate();
  return parseRate(sessionStorage.getItem(RATE_KEY)) ?? freshRate();
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}
