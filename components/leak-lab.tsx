"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Choices, Verdict } from "@/components/choices";
import { sendEvent } from "@/lib/browser-log";
import {
  LEAK_KEY,
  freshLeak,
  holdoutRow,
  leakCleared,
  leakMisses,
  leakQuestions,
  leakReply,
  leakStations,
  parseLeak,
  predictCheat,
  predictHonest,
  squaredError,
  sumSquaredCheat,
  sumSquaredHonest,
  trainRows,
  type LeakRun,
} from "@/lib/leak";

const button =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-40";
const primary = `${button} bg-copper text-paper`;
const ghost = `${button} border border-line bg-plate text-ink`;

export function LeakLab() {
  const [run, setRun] = useState<LeakRun>(loadRun);

  useEffect(() => {
    sessionStorage.setItem(LEAK_KEY, JSON.stringify(run));
  }, [run]);

  useEffect(() => {
    const key = `atlas.leak.started.${run.sessionId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    sendEvent(run.sessionId, "leak_started");
  }, [run.sessionId]);

  const done = run.completedAt != null;
  const question = leakQuestions[run.answers.length];

  function commit() {
    if (!run.choice || run.revealed || !question) return;
    sendEvent(run.sessionId, "leak_answer", {
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
      completedAt: answers.length === leakQuestions.length ? Date.now() : null,
    });
  }

  function again() {
    const nextRun = freshLeak();
    sessionStorage.setItem(LEAK_KEY, JSON.stringify(nextRun));
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
            {done ? "Unit complete" : `Station ${run.answers.length + 1} of ${leakStations.length}`}
          </p>
          <p className="rounded-full bg-copper px-3 py-1 text-xs font-semibold tracking-wide text-paper">
            {leakCleared(run)} cleared
          </p>
        </div>
      </header>
      <Track index={done ? leakStations.length : run.answers.length} />
      {done ? (
        <Result run={run} onAgain={again} />
      ) : question ? (
        <section className="mt-8">
          {question.setup && <p className="text-sm leading-6 text-muted">{question.setup}</p>}
          <Board index={run.answers.length} />
          <div className="mt-6">
            <Choices
              name={`leak-${run.answers.length}`}
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
                {run.answers.length + 1 === leakQuestions.length ? "See the result" : "Next"}
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
  if (index === 0 || index === 1 || index === 2) {
    return (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs tracking-wide text-muted uppercase">
              <th className="py-2 pr-3">x</th>
              <th className="py-2 pr-3">y</th>
              <th className="py-2 pr-3">cheat</th>
              {index === 1 ? <th className="py-2">ŷ = cheat</th> : null}
              {index === 2 ? <th className="py-2">ŷ = 2x + 3</th> : null}
            </tr>
          </thead>
          <tbody>
            {trainRows.map((row) => (
              <tr key={row.x} className="border-b border-line">
                <td className="py-2 pr-3">{row.x}</td>
                <td className="py-2 pr-3">{row.y}</td>
                <td className="py-2 pr-3">{row.cheat}</td>
                {index === 1 ? (
                  <td className="py-2">{(row.cheat - row.y) ** 2 === 0 ? "0" : "—"}</td>
                ) : null}
                {index === 2 ? (
                  <td className="py-2">{squaredError(predictHonest(row.x), row.y)}</td>
                ) : null}
              </tr>
            ))}
            {index === 1 ? (
              <tr>
                <td colSpan={4} className="py-2 font-medium">
                  sum = {sumSquaredCheat()}
                </td>
              </tr>
            ) : null}
            {index === 2 ? (
              <tr>
                <td colSpan={4} className="py-2 font-medium">
                  sum = {sumSquaredHonest()}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    );
  }
  if (index === 3 || index === 4) {
    return (
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line text-sm">
        <li className="bg-plate px-3 py-2 leading-6">
          Holdout x = {holdoutRow.x}, y = {holdoutRow.y}. Features available at serve time: x only.
        </li>
        <li className="bg-plate px-3 py-2 leading-6">
          Honest ŷ = {predictHonest(holdoutRow.x)} · (ŷ − y)² = {squaredError(predictHonest(holdoutRow.x), holdoutRow.y)}
        </li>
        <li className="bg-plate px-3 py-2 leading-6">
          cheat would be {predictCheat(holdoutRow.cheat)}, but that uses the label you do not have yet.
        </li>
      </ul>
    );
  }
  return null;
}

function Track({ index }: { index: number }) {
  return (
    <ol className="mt-5 grid grid-cols-5 gap-2">
      {leakStations.map((name, station) => {
        const state = station < index ? "done" : station === index ? "now" : "ahead";
        const label =
          name === "train-cheat" ? "Train cheat" : name === "train-honest" ? "Train x" : name[0]?.toUpperCase() + name.slice(1);
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
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Result({ run, onAgain }: { run: LeakRun; onAgain: () => void }) {
  const misses = leakMisses(run);
  const text = leakReply(run);
  const [copied, setCopied] = useState(false);
  return (
    <section className="mt-8">
      <h1 className="font-serif text-3xl leading-tight">
        {leakCleared(run)} of {leakStations.length} cleared
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        {misses.length === 0
          ? "Training loss 0 can mean target leakage, not a model you can ship. You reached the end of the open regression track."
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

function loadRun(): LeakRun {
  if (typeof sessionStorage === "undefined") return freshLeak();
  return parseLeak(sessionStorage.getItem(LEAK_KEY)) ?? freshLeak();
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