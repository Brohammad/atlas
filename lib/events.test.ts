import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { POST } from "../app/api/events/route.ts";

const SESSION = "00000000-0000-4000-8000-000000000001";
const NAMES = [
  "line_started",
  "line_answer",
  "regression_started",
  "regression_answer",
  "regression_code",
  "two_started",
  "two_answer",
  "resid_started",
  "resid_answer",
];

function event(name: string): Request {
  return new Request("http://localhost/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId: SESSION, name, at: "2026-11-11T10:00:00.000Z", data: { correct: false } }),
  });
}

describe("lab events", () => {
  it("accepts the names the ML sittings already send", async () => {
    for (const name of NAMES) {
      const response = await POST(event(name));
      assert.equal(response.status, 204, name);
    }
  });

  it("rejects an unknown name", async () => {
    const response = await POST(event("not_an_event"));
    assert.equal(response.status, 400);
  });
});
