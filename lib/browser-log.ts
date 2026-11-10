export function sendEvent(
  sessionId: string,
  name: string,
  data: Record<string, unknown> = {},
) {
  void fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sessionId,
      name,
      at: new Date().toISOString(),
      data,
    }),
  }).catch(() => undefined);
}
