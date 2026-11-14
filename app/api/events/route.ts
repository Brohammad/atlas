import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/** Names the labs may POST. `retention_run` is reserved for a future retention station; no client emits it today. */
export const ALLOWED_EVENT_NAMES = [
  "session_started",
  "pre_answer",
  "understand_answer",
  "predict_answer",
  "experiment_run",
  "experiment_submit",
  "debug_open",
  "debug_answer",
  "apply_check",
  "apply_run",
  "hint",
  "post_answer",
  "lesson_completed",
  "retention_run",
  "line_started",
  "line_answer",
  "regression_started",
  "regression_answer",
  "regression_code",
  "two_started",
  "two_answer",
  "resid_started",
  "resid_answer",
  "rate_started",
  "rate_answer",
  "rate_run",
  "rate_unseen",
] as const;

const NAMES = new Set<string>(ALLOWED_EVENT_NAMES);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { code: "BAD_JSON", message: "The body was not JSON." } }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: { code: "BAD_BODY", message: "Missing event." } }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  const { sessionId, name, at, data } = record;
  if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return Response.json({ error: { code: "BAD_SESSION", message: "Missing session." } }, { status: 400 });
  }
  if (typeof name !== "string" || !NAMES.has(name)) {
    return Response.json({ error: { code: "BAD_EVENT", message: "Unknown event." } }, { status: 400 });
  }
  if (typeof at !== "string" || Number.isNaN(Date.parse(at))) {
    return Response.json({ error: { code: "BAD_TIME", message: "Missing time." } }, { status: 400 });
  }
  const line = JSON.stringify({ sessionId, name, at, data: data ?? {} });
  if (line.length > 8000) {
    return Response.json({ error: { code: "TOO_LARGE", message: "Event is too large." } }, { status: 413 });
  }
  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "events.jsonl"), `${line}\n`, "utf8");
  } catch {
    // Vercel’s filesystem does not keep this file. The lesson still runs.
  }
  return new Response(null, { status: 204 });
}
