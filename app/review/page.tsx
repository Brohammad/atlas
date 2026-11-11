import { readFile } from "node:fs/promises";
import path from "node:path";
import { Suspense } from "react";
import { connection } from "next/server";

type LabEvent = {
  sessionId: string;
  name: string;
  at: string;
  data?: { correct?: boolean; pre?: number; post?: number; hints?: number; ms?: number };
};

export default function ReviewPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-xs tracking-[0.2em] text-copper">ATLAS</p>
      <h1 className="mt-3 font-serif text-3xl">Pilot log</h1>
      {process.env.VERCEL ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          This server does not keep the lab log. Events stay on the machine where the lab is run
          from the project folder. The lesson itself does not need the log.
        </p>
      ) : (
        <Suspense fallback={<p className="mt-3 text-sm text-muted">Reading the log…</p>}>
          <PilotTable />
        </Suspense>
      )}
    </main>
  );
}

async function PilotTable() {
  await connection();
  const sessions = group(await readEvents());
  return (
    <>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Local record of anonymous lab events. Do not put this page on a public server without a
        lock. {sessions.length} session{sessions.length === 1 ? "" : "s"}.
      </p>
      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <thead className="bg-plate text-muted">
            <tr>
              {["Session", "Started", "Minutes", "Before", "After", "Hints", "Events"].map((label) => (
                <th key={label} className="px-3 py-2 font-normal">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-t border-line">
                <td className="px-3 py-2 font-mono text-xs">{session.id.slice(0, 8)}</td>
                <td className="px-3 py-2">{session.started.slice(0, 16).replace("T", " ")}</td>
                <td className="px-3 py-2">{session.minutes}</td>
                <td className="px-3 py-2">{session.pre}</td>
                <td className="px-3 py-2">{session.post}</td>
                <td className="px-3 py-2">{session.hints}</td>
                <td className="px-3 py-2">{session.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

async function readEvents(): Promise<LabEvent[]> {
  try {
    const raw = await readFile(path.join(process.cwd(), "data", "events.jsonl"), "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .flatMap((line) => {
        try {
          return [JSON.parse(line) as LabEvent];
        } catch {
          return [];
        }
      });
  } catch {
    return [];
  }
}

function group(events: LabEvent[]) {
  const map = new Map<string, LabEvent[]>();
  for (const event of events) {
    const list = map.get(event.sessionId) ?? [];
    list.push(event);
    map.set(event.sessionId, list);
  }
  return [...map.entries()].map(([id, list]) => {
    const started = list[0]?.at ?? "";
    const done = [...list].reverse().find((event) => event.name === "lesson_completed");
    const preRight = list.filter((event) => event.name === "pre_answer" && event.data?.correct).length;
    const postRight = list.filter((event) => event.name === "post_answer" && event.data?.correct).length;
    const hintEvents = list.filter((event) => event.name === "hint").length;
    return {
      id,
      started,
      minutes: typeof done?.data?.ms === "number" ? Math.max(1, Math.round(done.data.ms / 60000)) : "—",
      pre: preRight || "—",
      post: typeof done?.data?.post === "number" ? done.data.post : postRight || "—",
      hints: typeof done?.data?.hints === "number" ? done.data.hints : hintEvents,
      count: list.length,
    };
  });
}
