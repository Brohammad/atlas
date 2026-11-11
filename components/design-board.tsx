"use client";

import { useState } from "react";
import { LossChart } from "@/components/curve";
import { runDescent, teachBowl, TEACH_LR } from "@/lib/descent";

type Surface = "webpage" | "app";
type Device = "desktop" | "phone";
type AppScreen = "home" | "run" | "result";

const pill =
  "rounded-full border border-line bg-plate px-3 py-1 text-xs font-semibold text-ink";
const pillOn = "rounded-full bg-copper px-3 py-1 text-xs font-semibold text-paper";
const cta =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-copper px-5 text-sm font-semibold text-paper";
const quiet =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-plate px-5 text-sm font-semibold text-ink";

const stations = ["Understand", "Predict", "Experiment", "Debug", "Apply"];

export function DesignBoard() {
  const [surface, setSurface] = useState<Surface>("webpage");
  const [device, setDevice] = useState<Device>("desktop");
  const [screen, setScreen] = useState<AppScreen>("home");
  const phone = device === "phone";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-copper">ATLAS DESIGN</p>
      <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-tight">
        One product. A public page, and the run.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        The page gets an engineer into the lab. The app is that lab on a desk or a phone. Same
        account-free run. Begin on these screens stays here so you can look.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button className={surface === "webpage" ? pillOn : pill} type="button" onClick={() => setSurface("webpage")}>
          Webpage
        </button>
        <button className={surface === "app" ? pillOn : pill} type="button" onClick={() => setSurface("app")}>
          App
        </button>
        <span className="mx-1 hidden w-px bg-line sm:block" />
        <button className={device === "desktop" ? pillOn : pill} type="button" onClick={() => setDevice("desktop")}>
          Desktop
        </button>
        <button className={device === "phone" ? pillOn : pill} type="button" onClick={() => setDevice("phone")}>
          Phone
        </button>
        {surface === "app" && (
          <>
            <span className="mx-1 hidden w-px bg-line sm:block" />
            {(["home", "run", "result"] as const).map((name) => (
              <button key={name} className={screen === name ? pillOn : pill} type="button" onClick={() => setScreen(name)}>
                {name[0]?.toUpperCase()}{name.slice(1)}
              </button>
            ))}
          </>
        )}
      </div>

      <div className={phone ? "mx-auto mt-8 w-full max-w-[390px]" : "mt-8"}>
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          {surface === "webpage" ? <WebPage phone={phone} /> : <AppScreenView screen={screen} phone={phone} />}
        </div>
      </div>
    </main>
  );
}

function WebPage({ phone }: { phone: boolean }) {
  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <header className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.22em] text-copper">ATLAS</p>
        <button className={cta} type="button">
          Begin
        </button>
      </header>
      <div className={phone ? "mt-10" : "mt-12 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]"}>
        <div>
          <h2 className="max-w-md text-4xl font-semibold leading-[1.05]">
            Say the next value before the chart moves.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-muted">
            Fifteen minutes. No account. For people who already know what gradient descent is, and
            still answer from the slogan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className={cta} type="button">
              Begin the lab
            </button>
            <button
              className={quiet}
              type="button"
              onClick={() => document.getElementById("sample-question")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              See a question
            </button>
          </div>
        </div>
        <QuestionCard />
      </div>
      <ol className="mt-12 grid grid-cols-5 gap-2">
        {stations.map((name, index) => (
          <li key={name} className="text-center">
            <span className="mx-auto grid h-8 w-8 place-items-center rounded-full border border-line bg-plate text-xs font-semibold text-copper">
              {index + 1}
            </span>
            <span className="mt-2 block text-[10px] leading-tight text-muted sm:text-xs">{name}</span>
          </li>
        ))}
      </ol>
      <p className="mt-8 max-w-lg text-sm leading-6 text-muted">
        Understand the step, predict the next one, find a rate, name the fault, then write the
        update yourself. The page ends when you begin.
      </p>
    </div>
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
        {["16, distance doubles", "81, distance triples", "1/16, distance halves", "−5, never turns"].map(
          (label) => (
            <li key={label} className="rounded-xl border border-line px-3 py-2">
              {label}
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function AppScreenView({ screen, phone }: { screen: AppScreen; phone: boolean }) {
  if (screen === "home") return <AppHome phone={phone} />;
  if (screen === "run") return <AppRun />;
  return <AppResult />;
}

function AppHome({ phone }: { phone: boolean }) {
  return (
    <div className={`px-5 py-6 ${phone ? "" : "mx-auto max-w-xl"}`}>
      <AppBar label="Gradient descent" cleared={0} />
      <h2 className="mt-10 text-3xl font-semibold leading-tight">Your sitting is still here.</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        No account. This browser keeps the run. Seven days later, a new bowl shows up on this
        screen.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className={cta} type="button">
          Continue
        </button>
        <button className={quiet} type="button">
          Start over
        </button>
      </div>
      <ol className="mt-10 grid grid-cols-5 gap-2">
        {stations.map((name, index) => (
          <li key={name} className="text-center">
            <span
              className={`mx-auto grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-semibold ${
                index === 0
                  ? "border-copper text-copper shadow-[0_0_0_4px_rgba(198,241,53,0.2)]"
                  : "border-line bg-plate text-muted"
              }`}
            >
              {index + 1}
            </span>
            <span className="mt-2 block text-[10px] leading-tight sm:text-xs">{name}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AppRun() {
  const trace = runDescent(teachBowl, TEACH_LR, 1);
  return (
    <div className="mx-auto max-w-xl px-5 py-6">
      <AppBar label="Station 1 of 5" cleared={0} />
      <ol className="mt-6 grid grid-cols-5 gap-2">
        {stations.map((name, index) => (
          <li key={name} className="text-center">
            <span
              className={`mx-auto grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-semibold ${
                index === 0 ? "border-copper bg-plate text-copper" : "border-line bg-plate text-muted"
              }`}
            >
              {index + 1}
            </span>
            <span className={`mt-2 block text-[10px] leading-tight sm:text-xs ${index === 0 ? "text-ink" : "text-muted"}`}>
              {name}
            </span>
          </li>
        ))}
      </ol>
      <h2 className="mt-8 text-2xl font-semibold leading-snug">
        One step moves opposite the slope. The learning rate decides how far.
      </h2>
      <div className="mt-5">
        <LossChart bowl={teachBowl} trace={trace} cursor={1} showTangent />
      </div>
      <button className={`${cta} mt-5`} type="button">
        Take one step
      </button>
    </div>
  );
}

function AppResult() {
  return (
    <div className="mx-auto max-w-xl px-5 py-6">
      <AppBar label="Run complete" cleared={6} />
      <h2 className="mt-8 text-3xl font-semibold leading-tight">3 of 3 before. 2 of 3 after.</h2>
      <div className="mt-5 space-y-3">
        <Meter label="Before" width="100%" detail="3 of 3" />
        <Meter label="After" width="66%" detail="2 of 3" />
      </div>
      <section className="mt-6 rounded-2xl border border-line bg-plate p-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-copper uppercase">For the reply</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
          {`tried the gradient descent lab. got these wrong: four updates from 1, steeper bowl, first try.\nhttps://atlas.brohammad.tech`}
        </p>
        <button className={`${quiet} mt-4`} type="button">
          Copy
        </button>
      </section>
    </div>
  );
}

function AppBar({ label, cleared }: { label: string; cleared: number }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs font-semibold tracking-[0.22em] text-copper">ATLAS</p>
      <div className="flex gap-2">
        <p className={pill}>{label}</p>
        <p className={pillOn}>{cleared} cleared</p>
      </div>
    </header>
  );
}

function Meter({ label, width, detail }: { label: string; width: string; detail: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted">{detail}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-line">
        <div className="h-full rounded-full bg-copper" style={{ width }} />
      </div>
    </div>
  );
}
