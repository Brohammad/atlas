"use client";

import { useEffect, useMemo, useState } from "react";
import { Choices, Verdict } from "@/components/choices";
import { LossChart } from "@/components/curve";
import { sendEvent } from "@/lib/browser-log";
import {
  APPLY_STEPS,
  DEBUG_OSC_LR,
  DEBUG_SIGN_LR,
  EXPERIMENT_STEPS,
  LOSS_OK,
  RETENTION_STEPS,
  debugBowl,
  flatBowl,
  fmt,
  predictItems,
  reachedLoss,
  retentionBowl,
  retentionDue,
  runDescent,
  runWithStepFn,
  steepBowl,
  teachBowl,
  TEACH_LR,
  unseenBowl,
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

const STORAGE_KEY = "atlas.gd.v1";

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

type Progress = {
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
  "inline-flex min-h-11 items-center justify-center border border-ink px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40";
const primary = `${button} bg-ink text-paper`;
const ghost = `${button} bg-transparent text-ink`;

const caps = ["understand", "predict", "experiment", "debug", "apply"] as const;

export function Lab() {
  const [progress, setProgress] = useState<Progress>(loadProgress);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const noteHint = (stage: string) => {
    sendEvent(progress.sessionId, "hint", { stage });
    setProgress((current) => (current ? { ...current, hints: current.hints + 1 } : current));
  };

  return (
    <>
      {progress.stage === "intro" && (
        <Intro
          onStart={() => {
            if (!progress.loggedStart) sendEvent(progress.sessionId, "session_started");
            setProgress({ ...progress, loggedStart: true, stage: "pre" });
          }}
        />
      )}
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
      {progress.stage === "retention" && (
        <RetentionStage
          sessionId={progress.sessionId}
          onDone={(passed) =>
            setProgress({
              ...progress,
              retentionTried: true,
              retentionPassed: passed,
              stage: "results",
            })
          }
        />
      )}
    </>
  );
}

function loadProgress(): Progress {
  const created = freshProgress();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return created;
    const parsed = JSON.parse(raw) as Progress;
    if (!parsed.sessionId || !parsed.stage) return created;
    if (
      parsed.completedAt &&
      !parsed.retentionTried &&
      retentionDue(parsed.startedAt, Date.now())
    ) {
      return { ...parsed, stage: "retention" };
    }
    return parsed;
  } catch {
    return created;
  }
}

function freshProgress(): Progress {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: Date.now(),
    stage: "intro",
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
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-xs tracking-[0.2em] text-copper">ATLAS</p>
        <p className="text-sm text-muted">{trackCaption(stage, track)}</p>
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
      <div className="absolute top-3 right-[10%] left-[10%] h-px bg-line" />
      <div className="atlas-line absolute top-3 left-[10%] h-px bg-copper" style={{ width: `${fill * 0.8}%` }} />
      <ol className="relative grid grid-cols-5">
        {caps.map((cap, index) => {
          const state = index < done ? "done" : index === current ? "now" : "ahead";
          return (
            <li key={cap} className="flex flex-col items-center text-center">
              <span
                className={`relative z-10 grid h-6 w-6 place-items-center rounded-full border text-[11px] ${
                  state === "done"
                    ? "border-copper bg-copper text-paper"
                    : state === "now"
                      ? "border-ink bg-plate text-ink"
                      : "border-line bg-paper text-muted"
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

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <Frame
      stage="intro"
      actions={
        <button className={primary} type="button" onClick={onStart}>
          Begin the check
        </button>
      }
    >
      <h1 className="font-serif text-4xl leading-tight">Gradient descent</h1>
      <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted">
        Five stations, in order. About fifteen minutes, no account. Take a step, predict the next
        one before the chart moves, find a learning rate, diagnose a broken update, and write the
        step yourself.
      </p>
      <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted">
        A short check comes first, and a different check at the end. Answer those from what you
        know right now.
      </p>
    </Frame>
  );
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
      <p className="font-serif text-2xl leading-snug">
        The same learning rate is not safe on every bowl.
      </p>
      <p className="mt-3 text-[15px] leading-6 text-muted">
        Bring each bowl’s loss under {LOSS_OK} in {EXPERIMENT_STEPS} steps. The minimum is marked.
        The gradient is on the chart. A rate that finishes one bowl can leave the other.
      </p>
      <ul className="mt-5 grid grid-cols-2 gap-2">
        {(["flat", "steep"] as const).map((name) => {
          const mark = finalPass[name];
          const selected = bowl === name;
          return (
            <li key={name}>
              <button
                className={`w-full border px-3 py-2 text-left ${
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
      {bothIn && (
        <p className="mt-4 text-sm text-muted">
          {finalPass.flat && finalPass.steep
            ? "Both finished. They should not have needed the same rate. Stable rates sit in 0 < η < 2/k, and k is the curvature in the gradient."
            : "One bowl is still outside the loss target. You can submit another rate, or continue with this result."}
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
  const cases: { lr: number; mode: UpdateMode; rule: string }[] = [
    { lr: DEBUG_OSC_LR, mode: "descent", rule: "w = w - lr * grad" },
    { lr: DEBUG_SIGN_LR, mode: "ascent", rule: "w = w + lr * grad" },
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
    () => (item ? runDescent(debugBowl, item.lr, 6, item.mode) : []),
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
          <LossChart bowl={debugBowl} trace={trace} cursor={6} />
        </div>
      )}
      {opened.includes("rate") && (
        <p className="mt-4 border border-line bg-plate px-3 py-3 font-mono text-sm">η = {fmt(item.lr)}</p>
      )}
      {opened.includes("log") && <DebugLog trace={trace} />}
      {opened.includes("rule") && (
        <pre className="mt-4 overflow-x-auto border border-line bg-plate p-3 font-mono text-sm">{`grad = k * (w - minimum)\n${item.rule}`}</pre>
      )}
      <div className="mt-6">
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

function DebugLog({ trace }: { trace: TracePoint[] }) {
  const rows = trace.filter((point) => point.step < 6);
  return (
    <div className="mt-4 overflow-x-auto border border-line">
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
            <tr key={point.step} className="border-t border-line">
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
          className="mt-2 h-28 w-full border border-ink bg-plate p-3 font-mono text-sm"
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

function RetentionStage({
  sessionId,
  onDone,
}: {
  sessionId: string;
  onDone: (passed: boolean) => void;
}) {
  const [lr, setLr] = useState(0.5);
  const [trace, setTrace] = useState<TracePoint[] | null>(null);
  const [runs, setRuns] = useState(0);
  const [passed, setPassed] = useState(false);
  return (
    <Frame
      stage="retention"
      actions={
        <>
          {runs < 2 && !passed && (
            <button
              className={primary}
              type="button"
              onClick={() => {
                const next = runDescent(retentionBowl, lr, RETENTION_STEPS);
                const ok = reachedLoss(next, RETENTION_STEPS, LOSS_OK);
                const count = runs + 1;
                setTrace(next);
                setRuns(count);
                if (ok) setPassed(true);
                sendEvent(sessionId, "retention_run", { lr, correct: ok, run: count });
              }}
            >
              Run
            </button>
          )}
          {(passed || runs >= 2) && (
            <button className={ghost} type="button" onClick={() => onDone(passed)}>
              Done
            </button>
          )}
        </>
      }
    >
      <h1 className="font-serif text-3xl leading-tight">A new bowl, no review first.</h1>
      <p className="mt-3 text-[15px] leading-6 text-muted">
        Seven days since the lab. Two runs. Bring the loss under {LOSS_OK}. The minimum is marked
        and the gradient is on the chart.
      </p>
      <RateSlider lr={lr} min={0.05} max={0.8} step={0.05} onChange={setLr} />
      <div className="mt-4">
        <LossChart
          bowl={retentionBowl}
          trace={trace ?? runDescent(retentionBowl, lr, 0)}
          cursor={trace ? trace.length - 1 : 0}
        />
      </div>
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
        questions, so a higher score can still be this page staying in your head. There is no
        reminder. A new bowl unlocks here after seven days.
      </p>
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
        <CheckList title="Before" questions={preQuestions} answers={progress.pre} />
        <CheckList title="After" questions={postQuestions} answers={progress.post} />
      </div>
    </Frame>
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
    <li className={`border px-3 py-3 ${clear ? "border-good" : "border-line"}`}>
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
      <div className="mt-2 h-1.5 bg-line">
        <div className="h-full bg-copper" style={{ width: `${width}%` }} />
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
        className="mt-2 block w-full accent-ink"
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
