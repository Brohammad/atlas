"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Choices, Verdict } from "@/components/choices";
import { sendEvent } from "@/lib/browser-log";
import {
  FIT_B,
  FIT_LR,
  FIT_W,
  REG_KEY,
  partialW,
  freshReg,
  parseReg,
  predictLinear,
  regCleared,
  regMisses,
  regReply,
  regressionCodeNote,
  regressionQuestions,
  regressionStations,
  trainPoints,
  type RegRun,
} from "@/lib/classical";
import { STARTER_STEP, evaluateStep } from "@/lib/step-expr";

const button =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-40";
const primary = `${button} bg-copper text-paper`;
const ghost = `${button} border border-line bg-plate text-ink`;

export function ClassicalLab() {
  const [run, setRun] = useState<RegRun>(() => loadRun());
  const onCode = run.answers.length >= regressionQuestions.length;

  useEffect(() => {
    sessionStorage.setItem(REG_KEY, JSON.stringify(run));
  }, [run]);

  useEffect(() => {
    const key = `atlas.reg.started.${run.sessionId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    sendEvent(run.sessionId, "regression_started");
  }, [run.sessionId]);

  const done = run.completedAt != null;
  const question = regressionQuestions[run.answers.length];

  function commit() {
    if (!run.choice || run.revealed || !question) return;
    sendEvent(run.sessionId, "regression_answer", {
      index: run.answers.length,
      choice: run.choice,
      correct: run.choice === question.answer,
    });
    setRun({ ...run, revealed: true });
  }

  function nextChoice() {
    if (!run.choice || !run.revealed) return;
    setRun({ ...run, answers: [...run.answers, run.choice], choice: null, revealed: false });
  }

  function checkCode() {
    const got = evaluateStep(run.code, { w: FIT_W, grad: partialW(FIT_W, FIT_B), lr: FIT_LR });
    const result = got.ok ? regressionCodeNote(got.value) : { ok: false, note: got.error };
    sendEvent(run.sessionId, "regression_code", { correct: result.ok });
    setRun({ ...run, codeNote: result.note, codeOk: result.ok });
  }

  function finishCode() {
    if (!run.codeOk) return;
    setRun({
      ...run,
      answers: [...run.answers, "pass"],
      completedAt: Date.now(),
    });
  }

  function again() {
    const nextRun = freshReg(STARTER_STEP);
    sessionStorage.setItem(REG_KEY, JSON.stringify(nextRun));
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
            {done ? "Unit complete" : `Station ${run.answers.length + 1} of ${regressionStations.length}`}
          </p>
          <p className="rounded-full bg-copper px-3 py-1 text-xs font-semibold tracking-wide text-paper">
            {regCleared(run)} cleared
          </p>
        </div>
      </header>
      <Track index={done ? regressionStations.length : run.answers.length} />

      {done ? (
        <Result run={run} onAgain={again} />
      ) : onCode ? (
        <CodeStation
          code={run.code}
          note={run.codeNote}
          ok={run.codeOk}
          onChange={(code) => setRun({ ...run, code, codeNote: null, codeOk: false })}
          onCheck={checkCode}
          onFinish={finishCode}
        />
      ) : question ? (
        <section className="mt-8">
          {question.setup && <p className="text-sm leading-6 text-muted">{question.setup}</p>}
          <Board index={run.answers.length} />
          <div className="mt-6">
            <Choices
              name={`reg-${run.answers.length}`}
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
              <button className={primary} type="button" onClick={nextChoice}>
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

function Board({ index }: { index: number }) {
  if (index === 3 || index === 4) {
    return (
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line text-sm">
        {trainPoints.map((point) => {
          const yHat = predictLinear(FIT_W, FIT_B, point.x);
          return (
            <li key={point.x} className="grid grid-cols-4 gap-2 bg-plate px-3 py-2">
              <span>x {point.x}</span>
              <span>y {point.y}</span>
              <span>ŷ {yHat}</span>
              <span className="text-muted">ŷ−y {yHat - point.y}</span>
            </li>
          );
        })}
      </ul>
    );
  }
  if (index === 2 || index === 6) {
    const rows = index === 6 ? [{ x: 3, y: 6 }] : trainPoints;
    return (
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line text-sm">
        {rows.map((point) => (
          <li key={`${point.x}-${point.y}`} className="flex justify-between bg-plate px-3 py-2">
            <span>x = {point.x}</span>
            <span>y = {point.y}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (index === 0) {
    return (
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <p className="rounded-2xl border border-line bg-plate px-3 py-3">w = 1.5</p>
        <p className="rounded-2xl border border-line bg-plate px-3 py-3">b = 1</p>
        <p className="rounded-2xl border border-line bg-plate px-3 py-3">x = 2</p>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <p className="rounded-2xl border border-line bg-plate px-3 py-3">y = 5</p>
        <p className="rounded-2xl border border-line bg-plate px-3 py-3">ŷ = 4</p>
      </div>
    );
  }
  return null;
}

function CodeStation({
  code,
  note,
  ok,
  onChange,
  onCheck,
  onFinish,
}: {
  code: string;
  note: string | null;
  ok: boolean;
  onChange: (code: string) => void;
  onCheck: () => void;
  onFinish: () => void;
}) {
  return (
    <section className="mt-8">
      <p className="text-sm leading-6 text-muted">
        Write the descent step. It receives w, the partial as grad, and lr. On this unit, step(1, −12, 0.05) has to return 1.6. The checker calls your function. It does not match the source text.
      </p>
      <label className="mt-4 block text-sm" htmlFor="reg-step">
        Step function
        <textarea
          id="reg-step"
          className="mt-2 h-28 w-full rounded-2xl border border-line bg-plate p-3 font-mono text-sm"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          value={code}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      {note && (
        <p className={`mt-4 text-sm leading-6 ${ok ? "text-good" : "text-bad"}`} role="status">
          {note}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button className={primary} type="button" onClick={onCheck}>
          Check
        </button>
        <button className={ghost} type="button" disabled={!ok} onClick={onFinish}>
          See the result
        </button>
      </div>
    </section>
  );
}

function Track({ index }: { index: number }) {
  return (
    <ol className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
      {regressionStations.map((name, station) => {
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

function Result({ run, onAgain }: { run: RegRun; onAgain: () => void }) {
  const misses = regMisses(run);
  const text = regReply(run);
  const [copied, setCopied] = useState(false);
  return (
    <section className="mt-8">
      <h1 className="font-serif text-3xl leading-tight">
        {regCleared(run)} of {regressionStations.length} cleared
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        {misses.length === 0
          ? "You computed a prediction, a loss, a partial, and a step, then wrote the step. The rest of the regression module is not open yet."
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

function loadRun(): RegRun {
  if (typeof sessionStorage === "undefined") return freshReg(STARTER_STEP);
  return parseReg(sessionStorage.getItem(REG_KEY)) ?? freshReg(STARTER_STEP);
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
