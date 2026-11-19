"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Choices, Verdict } from "@/components/choices";
import { sendEvent } from "@/lib/browser-log";
import {
  BASELINE_KEY,
  baselineCleared,
  baselineMisses,
  baselineQuestions,
  baselineReply,
  baselineStations,
  freshBaseline,
  holdoutPoint,
  meanY,
  parseBaseline,
  predictLine,
  predictMean,
  squaredError,
  sumSquaredLine,
  sumSquaredMean,
  trainPoints,
  type BaselineRun,
} from "@/lib/baseline";

const button =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-40";
const primary = `${button} bg-copper text-paper`;
const ghost = `${button} border border-line bg-plate text-ink`;

export function BaselineLab() {
  const [run, setRun] = useState<BaselineRun>(loadRun);

  useEffect(() => {
    sessionStorage.setItem(BASELINE_KEY, JSON.stringify(run));
  }, [run]);

  useEffect(() => {
    const key = `atlas.baseline.started.${run.sessionId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    sendEvent(run.sessionId, "baseline_started");
  }, [run.sessionId]);

  const done = run.completedAt != null;
  const question = baselineQuestions[run.answers.length];

  function commit() {
    if (!run.choice || run.revealed || !question) return;
    sendEvent(run.sessionId, "baseline_answer", {
      index: run.answers.length,
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
      completedAt: answers.length === baselineQuestions.length ? Date.now() : null,
    });
  }

  function again() {
    const nextRun = freshBaseline();
    sessionStorage.setItem(BASELINE_KEY, JSON.stringify(nextRun));
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
            {done ? "Unit complete" : `Station ${run.answers.length + 1} of ${baselineStations.length}`}
          </p>
          <p className="rounded-full bg-copper px-3 py-1 text-xs font-semibold tracking-wide text-paper">
            {baselineCleared(run)} cleared
          </p>
        </div>
      </header>
      <Track index={done ? baselineStations.length : run.answers.length} />
      {done ? (
        <Result run={run} onAgain={again} />
      ) : question ? (
        <section className="mt-8">
          {question.setup && <p className="text-sm leading-6 text-muted">{question.setup}</p>}
          <Board index={run.answers.length} />
          <div className="mt-6">
            <Choices
              name={`baseline-${run.answers.length}`}
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
                {run.answers.length + 1 === baselineQuestions.length ? "See the result" : "Next"}
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

function Board({ index }: { index: number }) {
  if (index === 0) {
    return (
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line text-sm">
        {trainPoints.map((point) => (
          <li key={point.x} className="bg-plate px-3 py-2 leading-6">
            ({point.x}, {point.y})
          </li>
        ))}
        <li className="bg-plate px-3 py-2 font-medium leading-6">mean y = {meanY(trainPoints)}</li>
      </ul>
    );
  }
  if (index === 1) {
    const mu = meanY(trainPoints);
    return (
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line text-sm">
        {trainPoints.map((point) => (
          <li key={point.x} className="bg-plate px-3 py-2 leading-6">
            ŷ = {mu} · y = {point.y} · (ŷ − y)² = {squaredError(mu, point.y)}
          </li>
        ))}
        <li className="bg-plate px-3 py-2 font-medium leading-6">sum = {sumSquaredMean()}</li>
      </ul>
    );
  }
  if (index === 2) {
    return (
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line text-sm">
        {trainPoints.map((point) => (
          <li key={point.x} className="bg-plate px-3 py-2 leading-6">
            ŷ = {predictLine(point.x)} · y = {point.y} · (ŷ − y)² = {squaredError(predictLine(point.x), point.y)}
          </li>
        ))}
        <li className="bg-plate px-3 py-2 font-medium leading-6">sum = {sumSquaredLine()}</li>
      </ul>
    );
  }
  if (index === 3 || index === 4) {
    return (
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line text-sm">
        <li className="bg-plate px-3 py-2 leading-6">
          Holdout ({holdoutPoint.x}, {holdoutPoint.y}) · mean ŷ = {predictMean(holdoutPoint.x)} · (ŷ − y)² ={" "}
          {squaredError(predictMean(holdoutPoint.x), holdoutPoint.y)}
        </li>
        <li className="bg-plate px-3 py-2 leading-6">
          Holdout ({holdoutPoint.x}, {holdoutPoint.y}) · line ŷ = {predictLine(holdoutPoint.x)} · (ŷ − y)² ={" "}
          {squaredError(predictLine(holdoutPoint.x), holdoutPoint.y)}
        </li>
      </ul>
    );
  }
  return null;
}

function Track({ index }: { index: number }) {
  return (
    <ol className="mt-5 grid grid-cols-5 gap-2">
      {baselineStations.map((name, station) => {
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
              {name === "train-base" ? "Train μ" : name === "train-line" ? "Train ŷ" : name[0]?.toUpperCase() + name.slice(1)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Result({ run, onAgain }: { run: BaselineRun; onAgain: () => void }) {
  const misses = baselineMisses(run);
  const text = baselineReply(run);
  const [copied, setCopied] = useState(false);
  return (
    <section className="mt-8">
      <h1 className="font-serif text-3xl leading-tight">
        {baselineCleared(run)} of {baselineStations.length} cleared
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        {misses.length === 0
          ? "A line with zero training loss can still lose on a holdout. Next: a feature that copies y and fakes a perfect training score."
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
        <Link href="/classical/leak" className={misses.length === 0 ? primary : ghost}>
          Target leakage
        </Link>
        <Link href="/classical" className={misses.length === 0 ? ghost : primary}>
          Back to the track
        </Link>
        <button className={ghost} type="button" onClick={onAgain}>
          Start over
        </button>
      </div>
    </section>
  );
}

function loadRun(): BaselineRun {
  if (typeof sessionStorage === "undefined") return freshBaseline();
  return parseBaseline(sessionStorage.getItem(BASELINE_KEY)) ?? freshBaseline();
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}