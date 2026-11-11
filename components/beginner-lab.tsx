"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Choices, Verdict } from "@/components/choices";
import { sendEvent } from "@/lib/browser-log";
import {
  LINE_KEY,
  freshLine,
  lineCleared,
  lineMisses,
  linePoints,
  lineQuestions,
  lineReply,
  lineStations,
  parseLine,
  predict,
  type LineRun,
} from "@/lib/line";

const button =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-40";
const primary = `${button} bg-copper text-paper`;
const ghost = `${button} border border-line bg-plate text-ink`;

export function BeginnerLab() {
  const [run, setRun] = useState<LineRun>(loadRun);

  useEffect(() => {
    sessionStorage.setItem(LINE_KEY, JSON.stringify(run));
  }, [run]);

  useEffect(() => {
    const key = `atlas.line.started.${run.sessionId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    sendEvent(run.sessionId, "line_started");
  }, [run.sessionId]);

  const done = run.completedAt != null;
  const question = lineQuestions[run.answers.length];
  const cleared = lineCleared(run);

  function commit() {
    if (!run.choice || run.revealed || !question) return;
    sendEvent(run.sessionId, "line_answer", {
      index: run.answers.length,
      choice: run.choice,
      correct: run.choice === question.answer,
    });
    setRun({ ...run, revealed: true });
  }

  function next() {
    if (!run.choice || !run.revealed) return;
    const answers = [...run.answers, run.choice];
    const finished = answers.length === lineQuestions.length;
    setRun({
      ...run,
      answers,
      choice: null,
      revealed: false,
      completedAt: finished ? Date.now() : null,
    });
  }

  function again() {
    const nextRun = freshLine();
    sessionStorage.setItem(LINE_KEY, JSON.stringify(nextRun));
    setRun(nextRun);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-xs font-semibold tracking-[0.22em] text-copper">
          ATLAS
        </Link>
        <div className="flex flex-wrap gap-2">
          <p className="rounded-full bg-plate px-3 py-1 text-xs font-semibold tracking-wide text-ink">
            {done ? "Run complete" : `Station ${run.answers.length + 1} of ${lineStations.length}`}
          </p>
          <p className="rounded-full bg-copper px-3 py-1 text-xs font-semibold tracking-wide text-paper">
            {cleared} cleared
          </p>
        </div>
      </header>
      <Track index={done ? lineStations.length : run.answers.length} />

      {done ? (
        <Result run={run} onAgain={again} />
      ) : question ? (
        <section className="mt-8">
          {question.setup && <p className="text-sm leading-6 text-muted">{question.setup}</p>}
          <Board index={run.answers.length} />
          <div className="mt-6">
            <Choices
              name={`line-${run.answers.length}`}
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
                {run.answers.length + 1 === lineQuestions.length ? "See the result" : "Next"}
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
      <div className="mt-4 grid grid-cols-2 gap-2">
        <p className="rounded-2xl border border-line bg-plate px-3 py-3 text-sm">y = 6</p>
        <p className="rounded-2xl border border-line bg-plate px-3 py-3 text-sm">ŷ = 4</p>
      </div>
    );
  }
  if (index === 3 || index === 5) {
    return (
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line text-sm">
        {[
          ["w = 1", "5"],
          ["w = 1.5", "0.25"],
          ["w = 2", "6"],
        ].map(([weight, total]) => (
          <li key={weight} className="flex justify-between gap-3 bg-plate px-3 py-2">
            <span>{weight}</span>
            <span className="text-muted">total {total}</span>
          </li>
        ))}
      </ul>
    );
  }
  const showPrediction = index === 2;
  const w = 1.5;
  const rows =
    index === 4
      ? [{ x: 2, y: 2 }]
      : linePoints;
  return (
    <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line text-sm">
      {rows.map((point) => (
        <li key={`${point.x}-${point.y}`} className="flex justify-between gap-3 bg-plate px-3 py-2">
          <span>x = {point.x}</span>
          <span>y = {point.y}</span>
          {showPrediction && <span className="text-muted">ŷ = {predict(w, point.x)}</span>}
        </li>
      ))}
    </ul>
  );
}

function Track({ index }: { index: number }) {
  return (
    <ol className="mt-5 grid grid-cols-6 gap-2">
      {lineStations.map((name, station) => {
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

function Result({ run, onAgain }: { run: LineRun; onAgain: () => void }) {
  const misses = lineMisses(run);
  const text = lineReply(run);
  const [copied, setCopied] = useState(false);
  return (
    <section className="mt-8">
      <h1 className="font-serif text-3xl leading-tight">
        {lineCleared(run)} of {lineQuestions.length} cleared
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        {misses.length === 0
          ? "The line is the loss of a weight on points. The gradient descent lab is the next sitting."
          : `Still open: ${misses.join(", ")}.`}
      </p>
      <section className="mt-6 rounded-2xl border border-line bg-plate p-4">
        <h2 className="text-xs font-semibold tracking-[0.14em] text-copper uppercase">For the reply</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{text}</p>
        <button
          className={`${ghost} mt-4`}
          type="button"
          onClick={() => {
            void copyText(text).then((ok) => setCopied(ok));
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/lab" className={primary}>
          Gradient descent lab
        </Link>
        <button className={ghost} type="button" onClick={onAgain}>
          Start over
        </button>
      </div>
    </section>
  );
}

function loadRun(): LineRun {
  if (typeof sessionStorage === "undefined") return freshLine();
  return parseLine(sessionStorage.getItem(LINE_KEY)) ?? freshLine();
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
