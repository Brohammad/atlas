"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Choices, Verdict } from "@/components/choices";
import { LossChart } from "@/components/curve";
import { sendEvent } from "@/lib/browser-log";
import {
  APPLY_STEPS,
  DEBUG_OSC_LR,
  DEBUG_SIGN_LR,
  EXPERIMENT_STEPS,
  LOSS_OK,
  debugBowl,
  debugOscBowl,
  describeBowl,
  flatBowl,
  fmt,
  predictItems,
  reachedLoss,
  runDescent,
  runWithStepFn,
  trajectoryNote,
  steepBowl,
  teachBowl,
  TEACH_LR,
  unseenBowl,
  type Bowl,
  type TracePoint,
  type UpdateMode,
} from "@/lib/descent";
import {
  debugQuestions,
  postQuestions,
  preQuestions,
  predictQuestions,
  understandQuestion,
  type Question,
} from "@/lib/lesson";
import { checkStepSource, evaluateStep, STARTER_STEP } from "@/lib/step-expr";

export const STORAGE_KEY = "atlas.gd.v1";

type Stage =
  | "intro"
  | "pre"
  | "understand"
  | "predict"
  | "experiment"
  | "debug"
  | "apply"
  | "post"
  | "results"
  | "retention";

type BowlName = "flat" | "steep";

export type Progress = {
  sessionId: string;
  startedAt: number;
  stage: Stage;
  hints: number;
  loggedStart: boolean;
  pre: string[];
  understand: string | null;
  predict: string[];
  experimentRuns: number;
  experimentFirst: Record<BowlName, boolean | null>;
  experimentFinal: Record<BowlName, boolean | null>;
  debug: string[];
  applyChecks: number;
  applyTestsPassed: boolean;
  applyRuns: number;
  applyPassed: boolean;
  post: string[];
  completedAt: number | null;
  retentionTried: boolean;
  retentionPassed: boolean | null;
};

const button =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper disabled:cursor-not-allowed disabled:opacity-40";
const primary = `${button} bg-copper text-paper`;
const ghost = `${button} border border-line bg-plate text-ink`;

const caps = ["understand", "predict", "experiment", "debug", "apply"] as const;
const ClearedContext = createContext(0);

export function Lab() {
  const [progress, setProgress] = useState<Progress>(loadProgress);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const key = `atlas.gd.started.${progress.sessionId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    sendEvent(progress.sessionId, "session_started");
  }, [progress.sessionId]);

  const noteHint = (stage: string) => {
    sendEvent(progress.sessionId, "hint", { stage });
    setProgress((current) => (current ? { ...current, hints: current.hints + 1 } : current));
  };

  return (
    <ClearedContext.Provider value={clearedCount(progress)}>
      {progress.stage === "pre" && (
        <QuestionRun
          stage="pre"
          intro="Answer before the lab. No correction until the end."
          questions={preQuestions}
          eventName="pre_answer"
          sessionId={progress.sessionId}
          onDone={(pre) => setProgress({ ...progress, pre, stage: "understand" })}
        />
      )}
      {progress.stage === "understand" && (
        <UnderstandStage
          sessionId={progress.sessionId}
          onHint={() => noteHint("understand")}
          onDone={(understand) => setProgress({ ...progress, understand, stage: "predict" })}
        />
      )}
      {progress.stage === "predict" && (
        <PredictStage
          sessionId={progress.sessionId}
          onDone={(predict) => setProgress({ ...progress, predict, stage: "experiment" })}
        />
      )}
      {progress.stage === "experiment" && (
        <ExperimentStage
          sessionId={progress.sessionId}
          onDone={(result) => setProgress({ ...progress, ...result, stage: "debug" })}
        />
      )}
      {progress.stage === "debug" && (
        <DebugStage
          sessionId={progress.sessionId}
          onHint={() => noteHint("debug")}
          onDone={(debug) => setProgress({ ...progress, debug, stage: "apply" })}
        />
      )}
      {progress.stage === "apply" && (
        <ApplyStage
          sessionId={progress.sessionId}
          onHint={() => noteHint("apply")}
          onDone={(result) => setProgress({ ...progress, ...result, stage: "post" })}
        />
      )}
      {progress.stage === "post" && (
        <QuestionRun
          stage="post"
          intro="Same ideas, different questions. No correction until the end."
          questions={postQuestions}
          eventName="post_answer"
          sessionId={progress.sessionId}
          onDone={(post) => {
            const completedAt = Date.now();
            sendEvent(progress.sessionId, "lesson_completed", {
              pre: scoreOf(preQuestions, progress.pre),
              post: scoreOf(postQuestions, post),
              ms: completedAt - progress.startedAt,
              hints: progress.hints,
            });
            setProgress({ ...progress, post, completedAt, stage: "results" });
          }}
        />
      )}
      {progress.stage === "results" && (
        <Results
          progress={progress}
          onReset={() => {
            sessionStorage.removeItem(STORAGE_KEY);
            setProgress(freshProgress());
          }}
        />
      )}
    </ClearedContext.Provider>
  );
}

function loadProgress(): Progress {
  const created = freshProgress();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return created;
    const parsed = JSON.parse(raw) as Progress;
    if (!parsed.sessionId || !parsed.stage) return created;
    if (parsed.stage === "intro") return { ...parsed, stage: "pre" };
    if (parsed.stage === "retention") return { ...parsed, stage: "results" };
    return parsed;
  } catch {
    return created;
  }
}

function freshProgress(): Progress {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: Date.now(),
    stage: "pre",
    hints: 0,
    loggedStart: false,
    pre: [],
    understand: null,
    predict: [],
    experimentRuns: 0,
    experimentFirst: { flat: null, steep: null },
    experimentFinal: { flat: null, steep: null },
    debug: [],
    applyChecks: 0,
    applyTestsPassed: false,
    applyRuns: 0,
    applyPassed: false,
    post: [],
    completedAt: null,
    retentionTried: false,
    retentionPassed: null,
  };
}

function Frame({
  stage,
  children,
  actions,
}: {
  stage: Stage;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const track = trackState(stage);
  const cleared = useContext(ClearedContext);
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-xs font-semibold tracking-[0.22em] text-copper">
          ATLAS
        </Link>
        <div className="flex flex-wrap gap-2">
          <p className="rounded-full bg-plate px-3 py-1 text-xs font-semibold tracking-wide text-ink">
            {trackCaption(stage, track)}
          </p>
          {stage !== "intro" && (
            <p className="rounded-full bg-copper px-3 py-1 text-xs font-semibold tracking-wide text-paper">
              {cleared} cleared
            </p>
          )}
        </div>
      </header>
      <RunTrack done={track.done} current={track.current} />
      <div className="mt-8">{children}</div>
      {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
    </main>
  );
}

function trackState(stage: Stage): { done: number; current: number | null } {
  const index = caps.indexOf(stage as (typeof caps)[number]);
  if (index >= 0) return { done: index, current: index };
  if (stage === "post" || stage === "results" || stage === "retention") {
    return { done: caps.length, current: null };
  }
  return { done: 0, current: null };
}

function trackCaption(stage: Stage, track: { done: number; current: number | null }): string {
  if (track.current !== null) return `Station ${track.current + 1} of ${caps.length}`;
  if (track.done === caps.length) return "Run complete";
  return stageLabel(stage);
}

function RunTrack({ done, current }: { done: number; current: number | null }) {
  const fill = current === null ? (done === caps.length ? 100 : 0) : (current / (caps.length - 1)) * 100;
  return (
    <div className="relative mt-5">
      <div className="absolute top-[17px] right-[10%] left-[10%] h-1 rounded-full bg-line" />
      <div
        className="atlas-line absolute top-[17px] left-[10%] h-1 rounded-full bg-copper"
        style={{ width: `${fill * 0.8}%` }}
      />
      <ol className="relative grid grid-cols-5">
        {caps.map((cap, index) => {
          const state = index < done ? "done" : index === current ? "now" : "ahead";
          return (
            <li key={cap} className="flex flex-col items-center text-center">
              <span
                className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-semibold ${
                  state === "done"
                    ? "border-copper bg-copper text-paper"
                    : state === "now"
                      ? "border-copper bg-plate text-copper shadow-[0_0_0_4px_rgba(198,241,53,0.2)]"
                      : "border-line bg-plate text-muted"
                }`}
              >
                {state === "done" ? "✓" : index + 1}
              </span>
              <span className={`mt-2 text-[10px] leading-tight sm:text-xs ${state === "ahead" ? "text-muted" : "text-ink"}`}>
                {cap[0]?.toUpperCase()}{cap.slice(1)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function stageLabel(stage: Stage): string {
  switch (stage) {
    case "intro":
      return "Gradient descent lab";
    case "pre":
      return "Check, before";
    case "post":
      return "Check, after";
    case "results":
      return "This sitting";
    case "retention":
      return "Seven days later";
    default:
      return stage[0]?.toUpperCase() + stage.slice(1);
  }
}

function QuestionRun({
  stage,
  intro,
  questions,
  eventName,
  sessionId,
  onDone,
}: {
  stage: "pre" | "post";
  intro: string;
  questions: Question[];
  eventName: "pre_answer" | "post_answer";
  sessionId: string;
  onDone: (answers: string[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const question = questions[index];
  if (!question) return null;
  return (
    <Frame
      stage={stage}
      actions={
        <button
          className={primary}
          type="button"
          disabled={!choice}
          onClick={() => {
            if (!choice) return;
            const next = [...answers, choice];
            sendEvent(sessionId, eventName, {
              index,
              choice,
              correct: choice === question.answer,
            });
            if (next.length === questions.length) onDone(next);
            else {
              setAnswers(next);
              setIndex(index + 1);
              setChoice(null);
            }
          }}
        >
          Commit
        </button>
      }
    >
      <p className="mb-6 text-sm text-muted">
        {intro} {index + 1} of {questions.length}.
      </p>
      <Choices
        name={`${eventName}-${index}`}
        question={question}
        value={choice}
        onChange={setChoice}
        revealed={false}
      />
    </Frame>
  );
}

function UnderstandStage({
  sessionId,
  onHint,
  onDone,
}: {
  sessionId: string;
  onHint: () => void;
  onDone: (choice: string) => void;
}) {
  const trace = useMemo(() => runDescent(teachBowl, TEACH_LR, 1), []);
  const [cursor, setCursor] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hinted, setHinted] = useState(false);
  const right = choice === understandQuestion.answer;
  return (
    <Frame
      stage="understand"
      actions={
        cursor === 0 ? (
          <button className={primary} type="button" onClick={() => setCursor(1)}>
            Take one step
          </button>
        ) : !revealed ? (
          <>
            <button
              className={primary}
              type="button"
              disabled={!choice}
              onClick={() => {
                if (!choice) return;
                setRevealed(true);
                sendEvent(sessionId, "understand_answer", {
                  choice,
                  correct: choice === understandQuestion.answer,
                });
              }}
            >
              Commit
            </button>
            <button
              className={ghost}
              type="button"
              disabled={hinted}
              onClick={() => {
                setHinted(true);
                onHint();
              }}
            >
              Hint
            </button>
          </>
        ) : (
          <button className={primary} type="button" onClick={() => choice && onDone(choice)}>
            Continue
          </button>
        )
      }
    >
      <p className="font-serif text-2xl leading-snug">
        One step moves opposite the slope. The learning rate decides how far.
      </p>
      <p className="mt-3 text-[15px] leading-6 text-muted">
        This loss is L(w) = (w − 2)². The gradient is 2(w − 2). The update is w ← w − η ×
        gradient, with η = {TEACH_LR}. Take the step, then say what set its direction and size.
      </p>
      <div className="mt-6">
        <LossChart bowl={teachBowl} trace={trace} cursor={cursor} showTangent />
      </div>
      {cursor > 0 && (
        <div className="mt-6">
          <Choices
            name="understand"
            question={understandQuestion}
            value={choice}
            onChange={setChoice}
            revealed={revealed}
          />
          {hinted && !revealed && (
            <p className="mt-4 text-sm text-muted">
              The point did not land on the minimum. Compare the sign of the slope with the
              direction of the move.
            </p>
          )}
          {revealed && <div className="mt-4"><Verdict right={right} idea={understandQuestion.idea} /></div>}
        </div>
      )}
    </Frame>
  );
}

function PredictStage({
  sessionId,
  onDone,
}: {
  sessionId: string;
  onDone: (answers: string[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const item = predictItems[index] ?? predictItems[0];
  const total = item?.steps ?? 1;
  const trace = useMemo(
    () => (item ? runDescent(item.bowl, item.lr, item.steps) : []),
    [item],
  );
  const question = predictQuestions[index];

  useEffect(() => {
    if (!revealed || cursor >= total) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setCursor((current) => {
        if (current >= total) {
          window.clearInterval(id);
          return current;
        }
        return current + 1;
      });
    }, 380);
    return () => window.clearInterval(id);
  }, [revealed, total, cursor]);

  if (!question) return null;
  return (
    <Frame
      stage="predict"
      actions={
        !revealed ? (
          <button
            className={primary}
            type="button"
            disabled={!choice}
            onClick={() => {
              if (!choice) return;
              setRevealed(true);
              if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setCursor(total);
              sendEvent(sessionId, "predict_answer", {
                index,
                choice,
                correct: choice === question.answer,
              });
            }}
          >
            Commit, then run
          </button>
        ) : (
          <button
            className={primary}
            type="button"
            onClick={() => {
              if (!choice) return;
              const next = [...answers, choice];
              if (next.length === predictQuestions.length) onDone(next);
              else {
                setAnswers(next);
                setIndex(index + 1);
                setChoice(null);
                setRevealed(false);
                setCursor(0);
              }
            }}
          >
            Continue
          </button>
        )
      }
    >
      <p className="text-sm text-muted">
        Commit before the chart moves. {index + 1} of {predictQuestions.length}.
      </p>
      {question.setup && <p className="mt-4 max-w-xl text-base leading-relaxed">{question.setup}</p>}
      <div className="mt-6">
        {item && (
          <LossChart
            bowl={item.bowl}
            trace={trace}
            cursor={revealed ? cursor : 0}
            span={item.span}
            readout={revealed ? "full" : "position"}
          />
        )}
      </div>
      <div className="mt-6">
        <Choices
          name={`predict-${index}`}
          question={question}
          value={choice}
          onChange={setChoice}
          revealed={revealed}
        />
        {revealed && (
          <div className="mt-4">
            <Verdict right={choice === question.answer} idea={question.idea} />
          </div>
        )}
      </div>
    </Frame>
  );
}

function ExperimentStage({
  sessionId,
  onDone,
}: {
  sessionId: string;
  onDone: (result: Pick<Progress, "experimentRuns" | "experimentFirst" | "experimentFinal">) => void;
}) {
  const [bowl, setBowl] = useState<BowlName>("flat");
  const [lr, setLr] = useState(0.4);
  const [traces, setTraces] = useState<Partial<Record<BowlName, { lr: number; trace: TracePoint[] }>>>({});
  const [runs, setRuns] = useState(0);
  const [first, setFirst] = useState<Record<BowlName, boolean | null>>({ flat: null, steep: null });
  const [finalPass, setFinalPass] = useState<Record<BowlName, boolean | null>>({ flat: null, steep: null });
  const spec = bowl === "flat" ? flatBowl : steepBowl;
  const saved = traces[bowl];
  const fresh = saved?.lr === lr;
  const bothIn = finalPass.flat !== null && finalPass.steep !== null;

  function run() {
    const trace = runDescent(spec, lr, EXPERIMENT_STEPS);
    setTraces((current) => ({ ...current, [bowl]: { lr, trace } }));
    setRuns((count) => count + 1);
    sendEvent(sessionId, "experiment_run", { bowl, lr });
  }

  function submit() {
    if (!saved || saved.lr !== lr) return;
    const pass = reachedLoss(saved.trace, EXPERIMENT_STEPS, LOSS_OK);
    const wasFirst = first[bowl] === null;
    setFirst((current) => (current[bowl] === null ? { ...current, [bowl]: pass } : current));
    setFinalPass((current) => ({ ...current, [bowl]: pass }));
    sendEvent(sessionId, "experiment_submit", { bowl, lr, correct: pass, first: wasFirst });
  }

  return (
    <Frame
      stage="experiment"
      actions={
        <>
          <button className={primary} type="button" onClick={run}>
            Run {EXPERIMENT_STEPS} steps
          </button>
          <button className={ghost} type="button" disabled={!fresh} onClick={submit}>
            Submit this rate
          </button>
          <button
            className={ghost}
            type="button"
            disabled={!bothIn}
            onClick={() =>
              onDone({
                experimentRuns: runs,
                experimentFirst: first,
                experimentFinal: finalPass,
              })
            }
          >
            Continue
          </button>
        </>
      }
    >
      <p className="font-serif text-2xl leading-snug">Pick a rate. Run {EXPERIMENT_STEPS} steps. Read the last loss.</p>
      <p className="mt-3 text-[15px] leading-6 text-muted">
        {describeBowl(spec)} The rate stays fixed for all {EXPERIMENT_STEPS} steps. You can change it
        and run again. A bowl is cleared only when the loss after step {EXPERIMENT_STEPS} is under {LOSS_OK}.
        The loss on the way does not count.
      </p>
      <ul className="mt-5 grid grid-cols-2 gap-2">
        {(["flat", "steep"] as const).map((name) => {
          const mark = finalPass[name];
          const selected = bowl === name;
          return (
            <li key={name}>
              <button
                className={`w-full rounded-2xl border px-3 py-3 text-left ${
                  mark === true ? "border-good" : mark === false ? "border-bad" : "border-line"
                } ${selected ? "bg-plate" : "bg-paper"} ${mark !== null ? "atlas-stamp" : ""}`}
                type="button"
                onClick={() => setBowl(name)}
              >
                <span className={`block text-[10px] tracking-[0.14em] uppercase ${mark === true ? "text-good" : mark === false ? "text-bad" : "text-muted"}`}>
                  {mark === true ? "Cleared" : mark === false ? "Open" : "Waiting"}
                </span>
                <span className="mt-1 block text-sm">{name === "flat" ? "Flatter bowl" : "Steeper bowl"}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <RateSlider lr={lr} min={0.05} max={1} step={0.05} onChange={setLr} />
      <div className="mt-4">
        <LossChart bowl={spec} trace={fresh && saved ? saved.trace : runDescent(spec, lr, 0)} cursor={fresh && saved ? EXPERIMENT_STEPS : 0} />
      </div>
      {fresh && saved && (
        <>
          <p className="mt-3 break-words font-mono text-xs leading-5 text-muted">
            η = {fmt(lr)}. w → {saved.trace.map((point) => fmt(point.w)).join(" → ")}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">{trajectoryNote(spec, saved.trace)}</p>
        </>
      )}
      {bothIn && (
        <p className="mt-4 text-sm text-muted">
          {finalPass.flat && finalPass.steep
            ? "Both cleared. The steeper bowl has larger curvature, so it needed the smaller rate."
            : "One bowl is still above 0.05 after 10 steps. Run another rate, or continue with this result."}
        </p>
      )}
    </Frame>
  );
}

function DebugStage({
  sessionId,
  onHint,
  onDone,
}: {
  sessionId: string;
  onHint: () => void;
  onDone: (answers: string[]) => void;
}) {
  const cases: { bowl: Bowl; lr: number; mode: UpdateMode; steps: number; span?: number; rule: string }[] = [
    { bowl: debugOscBowl, lr: DEBUG_OSC_LR, mode: "descent", steps: 3, span: 10, rule: "w = w - lr * grad" },
    { bowl: debugBowl, lr: DEBUG_SIGN_LR, mode: "ascent", steps: 6, rule: "w = w + lr * grad" },
  ];
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState<string[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hinted, setHinted] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const item = cases[index];
  const question = debugQuestions[index];
  const trace = useMemo(
    () => (item ? runDescent(item.bowl, item.lr, item.steps, item.mode) : []),
    [item],
  );
  if (!item || !question) return null;
  const ready = ["loss", "rate", "log", "rule"].every((panel) => opened.includes(panel));

  function open(panel: string) {
    if (opened.includes(panel)) return;
    sendEvent(sessionId, "debug_open", { case: index, panel, order: opened.length });
    setOpened([...opened, panel]);
  }

  return (
    <Frame
      stage="debug"
      actions={
        !revealed ? (
          <>
            <button className={primary} type="button" disabled={!ready || !choice} onClick={() => {
              if (!choice) return;
              setRevealed(true);
              sendEvent(sessionId, "debug_answer", {
                case: index,
                choice,
                correct: choice === question.answer,
                inspectOrder: opened,
              });
            }}>
              Commit
            </button>
            <button className={ghost} type="button" disabled={!ready || hinted} onClick={() => { setHinted(true); onHint(); }}>
              Hint
            </button>
          </>
        ) : (
          <button
            className={primary}
            type="button"
            onClick={() => {
              if (!choice) return;
              const next = [...answers, choice];
              if (next.length === cases.length) onDone(next);
              else {
                setAnswers(next);
                setIndex(index + 1);
                setOpened([]);
                setChoice(null);
                setRevealed(false);
                setHinted(false);
              }
            }}
          >
            Continue
          </button>
        )
      }
    >
      <p className="font-serif text-2xl leading-snug">Look at the run before you name the fault.</p>
      <p className="mt-3 text-sm text-muted">
        Case {index + 1} of {cases.length}. Open the loss, the learning rate, the gradient log, and
        the update rule. The answer stays closed until you have seen all four.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className={opened.includes("loss") ? primary : ghost} type="button" onClick={() => open("loss")}>
          Loss
        </button>
        <button className={opened.includes("rate") ? primary : ghost} type="button" onClick={() => open("rate")}>
          Learning rate
        </button>
        <button className={opened.includes("log") ? primary : ghost} type="button" onClick={() => open("log")}>
          Gradient log
        </button>
        <button className={opened.includes("rule") ? primary : ghost} type="button" onClick={() => open("rule")}>
          Update rule
        </button>
      </div>
      {opened.includes("loss") && (
        <div className="mt-4">
          <LossChart bowl={item.bowl} trace={trace} cursor={item.steps} span={item.span} />
        </div>
      )}
      {opened.includes("rate") && (
        <p className="mt-4 rounded-2xl border border-line bg-plate px-3 py-3 font-mono text-sm">η = {fmt(item.lr)}</p>
      )}
      {opened.includes("log") && <DebugLog trace={trace} minimum={item.bowl.mu} />}
      {opened.includes("rule") && (
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-line bg-plate p-3 font-mono text-sm">{`grad = k * (w - minimum)\n${item.rule}`}</pre>
      )}
      <div className="mt-6">
        {question.setup && <p className="mb-4 text-sm leading-6 text-muted">{question.setup}</p>}
        <Choices
          name={`debug-${index}`}
          question={question}
          value={choice}
          onChange={setChoice}
          revealed={revealed}
          disabled={!ready}
        />
        {!ready && <p className="mt-3 text-sm text-muted">Open the four pieces of evidence first.</p>}
        {hinted && !revealed && (
          <p className="mt-3 text-sm text-muted">
            Three of those pieces are measurements. One of them is a choice someone made.
          </p>
        )}
        {revealed && <div className="mt-4"><Verdict right={choice === question.answer} idea={question.idea} /></div>}
      </div>
    </Frame>
  );
}

function DebugLog({ trace, minimum }: { trace: TracePoint[]; minimum: number }) {
  const start = trace[0]?.w ?? minimum;
  const rows = trace;
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[28rem] border-collapse text-left font-mono text-xs">
        <caption className="sr-only">First steps of the broken run</caption>
        <thead className="bg-plate text-muted">
          <tr>
            {["step", "w", "gradient", "change in w", "loss"].map((label) => (
              <th key={label} className="px-2 py-2 font-normal">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((point) => (
            <tr
              key={point.step}
              className={`border-t border-line ${
                Math.abs(point.w - minimum) > Math.abs(start - minimum) ? "text-bad" : ""
              }`}
            >
              <td className="px-2 py-2">{point.step}</td>
              <td className="px-2 py-2">{fmt(point.w)}</td>
              <td className="px-2 py-2">{fmt(point.grad)}</td>
              <td className="px-2 py-2">{fmt(point.delta)}</td>
              <td className="px-2 py-2">{fmt(point.loss)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApplyStage({
  sessionId,
  onHint,
  onDone,
}: {
  sessionId: string;
  onHint: () => void;
  onDone: (result: Pick<Progress, "applyChecks" | "applyTestsPassed" | "applyRuns" | "applyPassed">) => void;
}) {
  const [source, setSource] = useState(STARTER_STEP);
  const [check, setCheck] = useState<ReturnType<typeof checkStepSource> | null>(null);
  const [checks, setChecks] = useState(0);
  const [lr, setLr] = useState(0.5);
  const [trace, setTrace] = useState<TracePoint[] | null>(null);
  const [runs, setRuns] = useState(0);
  const [passed, setPassed] = useState(false);
  const [hinted, setHinted] = useState(false);
  const testsOk = Boolean(check?.ok);

  function finish(next: { checks: number; testsOk: boolean; runs: number; passed: boolean }) {
    onDone({
      applyChecks: next.checks,
      applyTestsPassed: next.testsOk,
      applyRuns: next.runs,
      applyPassed: next.passed,
    });
  }

  return (
    <Frame
      stage="apply"
      actions={
        <>
          <button
            className={primary}
            type="button"
            onClick={() => {
              const result = checkStepSource(source);
              const nextChecks = checks + 1;
              setChecks(nextChecks);
              setCheck(result);
              sendEvent(sessionId, "apply_check", { ok: result.ok, checks: nextChecks });
            }}
          >
            Check the step
          </button>
          {testsOk && runs < 3 && !passed && (
            <button
              className={ghost}
              type="button"
              onClick={() => {
                const nextTrace = runWithStepFn(unseenBowl, lr, APPLY_STEPS, (w, grad, learningRate) => {
                  const value = evaluateStep(source, { w, grad, lr: learningRate });
                  return value.ok ? value.value : Number.NaN;
                });
                const ok = reachedLoss(nextTrace, APPLY_STEPS, LOSS_OK);
                const nextRuns = runs + 1;
                setTrace(nextTrace);
                setRuns(nextRuns);
                if (ok) setPassed(true);
                sendEvent(sessionId, "apply_run", { lr, correct: ok, run: nextRuns });
              }}
            >
              Run unseen bowl
            </button>
          )}
          <button className={ghost} type="button" disabled={hinted} onClick={() => { setHinted(true); onHint(); }}>
            Hint
          </button>
          {(passed || checks >= 2 || runs >= 3) && (
            <button
              className={ghost}
              type="button"
              onClick={() => finish({ checks, testsOk, runs, passed })}
            >
              {passed ? "Continue" : "Continue without a pass"}
            </button>
          )}
        </>
      }
    >
      <p className="font-serif text-2xl leading-snug">Write the step, then use it on a bowl you have not seen.</p>
      <p className="mt-3 text-[15px] leading-6 text-muted">
        Return the next parameter from w, grad, and lr. The checker tests the behavior, not a
        string match. After it passes, you get three runs on a new bowl. Bring the loss under {LOSS_OK}.
        The starting rate, 0.5, is a guess.
      </p>
      <label className="mt-5 block text-sm" htmlFor="step-fn">
        Step function
        <textarea
          id="step-fn"
          className="mt-2 h-28 w-full rounded-2xl border border-line bg-plate p-3 font-mono text-sm"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          value={source}
          onChange={(event) => {
            setSource(event.target.value);
            setCheck(null);
            setTrace(null);
            setPassed(false);
          }}
        />
      </label>
      {check && (
        <ul className="mt-4 space-y-1 text-sm">
          {check.tests.map((test) => (
            <li key={test.name} className={test.pass ? "text-good" : "text-bad"}>
              {test.pass ? "Pass" : "Miss"} · {test.name}
            </li>
          ))}
          {check.error && <li className="text-muted">{check.error}</li>}
        </ul>
      )}
      {hinted && (
        <p className="mt-3 text-sm text-muted">
          When the gradient is positive, the next parameter should be smaller. The learning rate
          changes how much smaller.
        </p>
      )}
      {testsOk && (
        <>
          <RateSlider lr={lr} min={0.02} max={0.8} step={0.02} onChange={setLr} />
          <p className="mt-2 text-sm text-muted">Runs used: {runs} of 3.</p>
          {trace && (
            <div className="mt-4">
              <LossChart bowl={unseenBowl} trace={trace} cursor={trace.length - 1} />
            </div>
          )}
          {passed && <p className="atlas-stamp mt-3 text-sm text-good">Cleared. The unseen bowl came down.</p>}
        </>
      )}
    </Frame>
  );
}

function Results({
  progress,
  onReset,
}: {
  progress: Progress;
  onReset: () => void;
}) {
  const pre = scoreOf(preQuestions, progress.pre);
  const post = scoreOf(postQuestions, progress.post);
  const elapsed = progress.completedAt ? progress.completedAt - progress.startedAt : null;
  const timeLabel =
    elapsed === null
      ? null
      : elapsed < 60_000
        ? `${Math.max(1, Math.round(elapsed / 1000))} sec`
        : `${Math.round(elapsed / 60_000)} min`;
  return (
    <Frame
      stage="results"
      actions={
        <button className={ghost} type="button" onClick={onReset}>
          Start over on this browser
        </button>
      }
    >
      <h1 className="font-serif text-4xl leading-tight">
        {pre} of {preQuestions.length} before. {post} of {postQuestions.length} after.
      </h1>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Meter label="Before" value={pre} total={preQuestions.length} />
        <Meter label="After" value={post} total={postQuestions.length} />
      </div>
      <p className="mt-4 text-[15px] leading-7 text-muted">
        {timeLabel ? `${timeLabel} in this sitting. ` : ""}
        {progress.hints} hint{progress.hints === 1 ? "" : "s"}. The second check uses different
        questions, so a higher score can still be this page staying in your head.
        {missLabels(progress).length === 0
          ? " Next is a line with a bias: the partial, and the step you write."
          : ""}
      </p>
      <ReplyCard progress={progress} />
      {missLabels(progress).length === 0 ? (
        <Link href="/classical/regression" className={`${primary} mt-6`}>
          A line with a bias
        </Link>
      ) : null}
      <ul className="mt-6 grid gap-2 sm:grid-cols-5">
        <Station
          name="Understand"
          clear={progress.understand === understandQuestion.answer}
          detail={yesNo(progress.understand === understandQuestion.answer)}
        />
        <Station
          name="Predict"
          clear={countMatches(predictQuestions, progress.predict) === predictQuestions.length}
          detail={`${countMatches(predictQuestions, progress.predict)} of ${predictQuestions.length}`}
        />
        <Station
          name="Experiment"
          clear={progress.experimentFinal.flat === true && progress.experimentFinal.steep === true}
          detail={`First try ${yesNo(progress.experimentFirst.flat)} / ${yesNo(progress.experimentFirst.steep)}`}
        />
        <Station
          name="Debug"
          clear={countMatches(debugQuestions, progress.debug) === debugQuestions.length}
          detail={`${countMatches(debugQuestions, progress.debug)} of ${debugQuestions.length}`}
        />
        <Station
          name="Apply"
          clear={progress.applyPassed}
          detail={progress.applyPassed ? "Loss came down" : "Did not pass"}
        />
      </ul>
      {progress.retentionTried && (
        <p className="mt-4 text-sm text-muted">
          Seven-day bowl: {progress.retentionPassed ? "loss came down" : "did not pass"}.
        </p>
      )}
      <div className="mt-8 space-y-6">
        <MissList progress={progress} />
        <CheckList title="Before" questions={preQuestions} answers={progress.pre} />
        <CheckList title="After" questions={postQuestions} answers={progress.post} />
      </div>
    </Frame>
  );
}

function ReplyCard({ progress }: { progress: Progress }) {
  const misses = missLabels(progress);
  const text =
    misses.length === 0
      ? "tried the gradient descent lab. cleared it.\nhttps://atlas.brohammad.tech"
      : `tried the gradient descent lab. got these wrong: ${misses.join(", ")}.\nhttps://atlas.brohammad.tech`;
  const [copied, setCopied] = useState(false);
  return (
    <section className="mt-6 rounded-2xl border border-line bg-plate p-4">
      <h2 className="text-xs font-semibold tracking-[0.14em] text-copper uppercase">For the reply</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{text}</p>
      <button
        className={`${ghost} mt-4`}
        type="button"
        onClick={() => {
          void copyReply(text).then((ok) => setCopied(ok));
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </section>
  );
}

function MissList({ progress }: { progress: Progress }) {
  const rows = missRows(progress);
  if (rows.length === 0) return null;
  return (
    <section>
      <h2 className="text-xs tracking-[0.14em] text-muted uppercase">What you missed</h2>
      <ul className="mt-3 space-y-4">
        {rows.map((row) => (
          <li key={row.label}>
            <p className="text-sm">{row.label}</p>
            <p className="mt-1 text-sm text-bad">Miss</p>
            <p className="mt-1 text-sm text-muted">{row.idea}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function copyReply(text: string): Promise<boolean> {
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

function missLabels(progress: Progress): string[] {
  return missRows(progress).map((row) => row.label);
}

function missRows(progress: Progress): { label: string; idea: string }[] {
  const rows: { label: string; idea: string }[] = [];
  if (progress.understand && progress.understand !== understandQuestion.answer) {
    rows.push({ label: understandQuestion.label ?? understandQuestion.prompt, idea: understandQuestion.idea });
  }
  predictQuestions.forEach((question, index) => {
    const choice = progress.predict[index];
    if (choice && choice !== question.answer) rows.push({ label: question.label ?? question.prompt, idea: question.idea });
  });
  if (progress.experimentFirst.flat === false) {
    rows.push({
      label: "flatter bowl, first try",
      idea: "On the flatter bowl a moderate rate can finish. The same rate is not safe once the bowl gets steeper.",
    });
  }
  if (progress.experimentFirst.steep === false) {
    rows.push({
      label: "steeper bowl, first try",
      idea: "Steeper curvature makes the same learning rate a longer step. Stable rates sit below 2 divided by that curvature.",
    });
  }
  debugQuestions.forEach((question, index) => {
    const choice = progress.debug[index];
    if (choice && choice !== question.answer) rows.push({ label: question.label ?? question.prompt, idea: question.idea });
  });
  if (progress.applyChecks + progress.applyRuns > 0 && !progress.applyPassed) {
    rows.push({
      label: "the unseen bowl",
      idea: "The step is w minus the learning rate times the gradient. The rate still has to fit that bowl’s curvature.",
    });
  }
  return rows;
}

export function clearedCount(progress: Progress): number {
  return (
    (progress.understand === understandQuestion.answer ? 1 : 0) +
    countMatches(predictQuestions, progress.predict) +
    (progress.experimentFinal.flat === true ? 1 : 0) +
    (progress.experimentFinal.steep === true ? 1 : 0) +
    countMatches(debugQuestions, progress.debug) +
    (progress.applyPassed ? 1 : 0)
  );
}

function CheckList({ title, questions, answers }: { title: string; questions: Question[]; answers: string[] }) {
  return (
    <section>
      <h2 className="text-xs tracking-[0.14em] text-muted uppercase">{title}</h2>
      <ul className="mt-3 space-y-4">
        {questions.map((question, index) => {
          const choice = answers[index];
          const right = choice === question.answer;
          return (
            <li key={question.prompt}>
              <p className="text-sm">{question.prompt}</p>
              <p className={`mt-1 text-sm ${right ? "text-good" : "text-bad"}`}>{right ? "Cleared" : "Miss"}</p>
              <p className="mt-1 text-sm text-muted">{question.idea}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Station({ name, clear, detail }: { name: string; clear: boolean; detail: string }) {
  return (
    <li className={`rounded-2xl border px-3 py-3 ${clear ? "border-good bg-plate" : "border-line bg-plate"}`}>
      <p className={`text-[10px] tracking-[0.14em] uppercase ${clear ? "text-good" : "text-bad"}`}>
        {clear ? "Cleared" : "Open"}
      </p>
      <p className="mt-1 text-sm">{name}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </li>
  );
}

function Meter({ label, value, total }: { label: string; value: number; total: number }) {
  const width = total === 0 ? 0 : (value / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted">
          {value} of {total}
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-line">
        <div className="h-full rounded-full bg-copper" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function RateSlider({
  lr,
  min,
  max,
  step,
  onChange,
}: {
  lr: number;
  min: number;
  max: number;
  step: number;
  onChange: (lr: number) => void;
}) {
  return (
    <label className="mt-5 block text-sm">
      Learning rate, {fmt(lr)}
      <input
        className="mt-2 block w-full accent-copper"
        type="range"
        min={min}
        max={max}
        step={step}
        value={lr}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function scoreOf(questions: Question[], answers: string[]): number {
  return countMatches(questions, answers);
}

function countMatches(questions: Question[], answers: string[]): number {
  return questions.filter((question, index) => answers[index] === question.answer).length;
}

function yesNo(value: boolean | null): string {
  if (value === null) return "—";
  return value ? "Yes" : "No";
}
