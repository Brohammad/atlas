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
        Regression is the open module. Three units. The rest of the track is named below and has no
        lessons yet.
      </p>
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
