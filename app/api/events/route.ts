import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const NAMES = new Set([
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
]);

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
  const dir = path.join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "events.jsonl"), `${line}\n`, "utf8");
  return new Response(null, { status: 204 });
}
