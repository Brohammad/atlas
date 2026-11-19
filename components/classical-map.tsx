"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  REG_KEY,
  classicalModules,
  parseReg,
  regCleared,
  regressionStations,
  type RegRun,
} from "@/lib/classical";
import { BASELINE_KEY, baselineCleared, baselineStations, parseBaseline, type BaselineRun } from "@/lib/baseline";
import { LEAK_KEY, leakCleared, leakStations, parseLeak, type LeakRun } from "@/lib/leak";
import { RATE_KEY, parseRate, rateCleared, rateStations, type RateRun } from "@/lib/rate";
import { RESID_KEY, parseResid, residCleared, residStations, type ResidRun } from "@/lib/resid";
import { TWO_KEY, parseTwo, twoCleared, twoStations, type TwoRun } from "@/lib/two";

const cta =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-copper px-5 text-sm font-semibold text-paper";
const quiet =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-plate px-5 text-sm font-semibold text-ink";

export function ClassicalMap() {
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
  const run = pathname === "/classical" ? readRun() : null;
  const two = pathname === "/classical" ? readTwo() : null;
  const open = run !== null && (run.answers.length > 0 || run.choice !== null || run.completedAt != null);
  const twoOpen = two !== null && (two.answers.length > 0 || two.choice !== null || two.completedAt != null);
  const resid = pathname === "/classical" ? readResid() : null;
  const residOpen = resid !== null && (resid.answers.length > 0 || resid.choice !== null || resid.completedAt != null);
  const rate = pathname === "/classical" ? readRate() : null;
  const rateOpen = rate !== null && (rate.answers.length > 0 || rate.choice !== null || rate.completedAt != null);
  const baseline = pathname === "/classical" ? readBaseline() : null;
  const baselineOpen =
    baseline !== null && (baseline.answers.length > 0 || baseline.choice !== null || baseline.completedAt != null);
  const leak = pathname === "/classical" ? readLeak() : null;
  const leakOpen = leak !== null && (leak.answers.length > 0 || leak.choice !== null || leak.completedAt != null);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <Link href="/" className="text-xs font-semibold tracking-[0.22em] text-copper">
          ATLAS
        </Link>
        <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Traditional ML</p>
      </header>
      <h1 className="mt-10 max-w-xl text-4xl font-semibold leading-[1.05]">
        Implement the model. Do not call fit.
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted">
        Regression is the open module. Six units. The rest of the track is named below and has no
        lessons yet.
      </p>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
        Fit a line and the gradient descent lab come first. They are not on this list. The six units
        below assume you have done both.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link href="/beginner" className={quiet}>
          Fit a line
        </Link>
        <Link href="/lab" className={quiet}>
          Gradient descent lab
        </Link>
      </div>
      <h2 className="mt-10 text-xs font-semibold tracking-[0.14em] text-copper uppercase">Regression</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
        Predict a number. House prices come after these units.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <UnitCard
          kicker="Unit 1"
          title="A line with a bias"
          body={
            open && run
              ? `${regCleared(run)} of ${regressionStations.length} cleared.`
              : "Prediction, loss, partial, one update, and the step written by hand."
          }
          action={open ? "Continue" : "Begin"}
          onOpen={() => router.push("/classical/regression")}
          onReset={
            open
              ? () => {
                  sessionStorage.removeItem(REG_KEY);
                  router.push("/classical/regression");
                }
              : undefined
          }
        />
        <UnitCard
          kicker="Unit 2"
          title="Two inputs"
          body={
            twoOpen && two
              ? `${twoCleared(two)} of ${twoStations.length} cleared.`
              : "The partial for w2 multiplies the residual by x2, not by x1."
          }
          action={twoOpen ? "Continue" : "Begin"}
          onOpen={() => router.push("/classical/two")}
          onReset={
            twoOpen
              ? () => {
                  sessionStorage.removeItem(TWO_KEY);
                  router.push("/classical/two");
                }
              : undefined
          }
        />
        <UnitCard
          kicker="Unit 3"
          title="Residuals"
          body={
            residOpen && resid
              ? `${residCleared(resid)} of ${residStations.length} cleared.`
              : "A negative residual means the prediction is too low. The sum can hide the loss."
          }
          action={residOpen ? "Continue" : "Begin"}
          onOpen={() => router.push("/classical/residuals")}
          onReset={
            residOpen
              ? () => {
                  sessionStorage.removeItem(RESID_KEY);
                  router.push("/classical/residuals");
                }
              : undefined
          }
        />
        <UnitCard
          kicker="Unit 4"
          title="Learning rate"
          body={
            rateOpen && rate
              ? `${rateCleared(rate)} of ${rateStations.length} cleared.`
              : "The same rate can finish a shallow line and step past the best weight on a steeper one."
          }
          action={rateOpen ? "Continue" : "Begin"}
          onOpen={() => router.push("/classical/rate")}
          onReset={
            rateOpen
              ? () => {
                  sessionStorage.removeItem(RATE_KEY);
                  router.push("/classical/rate");
                }
              : undefined
          }
        />
        <UnitCard
          kicker="Unit 5"
          title="Mean baseline"
          body={
            baselineOpen && baseline
              ? `${baselineCleared(baseline)} of ${baselineStations.length} cleared.`
              : "Predict the mean of y. A fitted line must beat it on a holdout, not only on training."
          }
          action={baselineOpen ? "Continue" : "Begin"}
          onOpen={() => router.push("/classical/baseline")}
          onReset={
            baselineOpen
              ? () => {
                  sessionStorage.removeItem(BASELINE_KEY);
                  router.push("/classical/baseline");
                }
              : undefined
          }
        />
        <UnitCard
          kicker="Unit 6"
          title="Target leakage"
          body={
            leakOpen && leak
              ? `${leakCleared(leak)} of ${leakStations.length} cleared.`
              : "A column that copies y drives training loss to zero. It is not there at prediction time."
          }
          action={leakOpen ? "Continue" : "Begin"}
          onOpen={() => router.push("/classical/leak")}
          onReset={
            leakOpen
              ? () => {
                  sessionStorage.removeItem(LEAK_KEY);
                  router.push("/classical/leak");
                }
              : undefined
          }
        />
      </div>
      <h2 className="mt-12 text-xs font-semibold tracking-[0.14em] text-muted uppercase">Not open</h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {classicalModules
          .filter((mod) => mod.status !== "open")
          .map((mod) => (
            <li key={mod.id} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-6">
              <p className="text-sm font-semibold">{mod.title}</p>
              <p className="text-sm leading-6 text-muted">{mod.objective}</p>
            </li>
          ))}
      </ul>
    </main>
  );
}

function UnitCard({
  kicker,
  title,
  body,
  action,
  onOpen,
  onReset,
}: {
  kicker: string;
  title: string;
  body: string;
  action: string;
  onOpen: () => void;
  onReset?: () => void;
}) {
  return (
    <section className="rounded-2xl border border-copper bg-plate p-4">
      <p className="text-xs font-semibold tracking-[0.14em] text-copper uppercase">{kicker}</p>
      <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className={cta} type="button" onClick={onOpen}>
          {action}
        </button>
        {onReset ? (
          <button className={quiet} type="button" onClick={onReset}>
            Start over
          </button>
        ) : null}
      </div>
    </section>
  );
}

function readLeak(): LeakRun | null {
  try {
    return parseLeak(sessionStorage.getItem(LEAK_KEY));
  } catch {
    return null;
  }
}

function readBaseline(): BaselineRun | null {
  try {
    return parseBaseline(sessionStorage.getItem(BASELINE_KEY));
  } catch {
    return null;
  }
}

function readRate(): RateRun | null {
  try {
    return parseRate(sessionStorage.getItem(RATE_KEY));
  } catch {
    return null;
  }
}

function readResid(): ResidRun | null {
  try {
    return parseResid(sessionStorage.getItem(RESID_KEY));
  } catch {
    return null;
  }
}

function readTwo(): TwoRun | null {
  try {
    return parseTwo(sessionStorage.getItem(TWO_KEY));
  } catch {
    return null;
  }
}

function readRun(): RegRun | null {
  try {
    return parseReg(sessionStorage.getItem(REG_KEY));
  } catch {
    return null;
  }
}
