type Expr =
  | { kind: "num"; value: number }
  | { kind: "name"; value: "w" | "grad" | "lr" }
  | { kind: "neg"; expr: Expr }
  | { kind: "bin"; op: "+" | "-" | "*" | "/"; left: Expr; right: Expr };

export type StepEval =
  | { ok: true; value: number }
  | { ok: false; error: string };

const NAMES = new Set(["w", "grad", "lr"]);

export function evaluateStep(
  source: string,
  inputs: { w: number; grad: number; lr: number },
): StepEval {
  const parsed = parseStep(source);
  if (!parsed.ok) return parsed;
  try {
    const value = evalExpr(parsed.expr, inputs);
    if (!Number.isFinite(value)) {
      return { ok: false, error: "That expression did not return a finite number." };
    }
    return { ok: true, value };
  } catch {
    return { ok: false, error: "That expression could not be evaluated." };
  }
}

function parseStep(source: string): { ok: true; expr: Expr } | { ok: false; error: string } {
  const withoutComments = source
    .split("\n")
    .map((line) => line.replace(/#.*$/, ""))
    .join("\n")
    .trim();
  if (!withoutComments) {
    return { ok: false, error: "Write a step function before checking it." };
  }
  if (/\b(import|while|for|lambda|exec|eval|open|__)\b/.test(withoutComments)) {
    return {
      ok: false,
      error: "This box runs one return expression using w, grad, and lr.",
    };
  }
  const match = withoutComments.match(
    /^def\s+step\s*\(\s*w\s*,\s*grad\s*,\s*lr\s*\)\s*:\s*return\s+([\s\S]+)$/,
  );
  if (!match || !match[1]) {
    return {
      ok: false,
      error: "Keep def step(w, grad, lr) and a single return expression.",
    };
  }
  const tokens = tokenize(match[1].trim());
  if (!tokens.ok) return tokens;
  const parsed = parseExpr(tokens.tokens);
  if (!parsed.ok) return parsed;
  if (parsed.pos !== tokens.tokens.length) {
    return { ok: false, error: "The return expression has an extra symbol." };
  }
  return { ok: true, expr: parsed.expr };
}

type Tok =
  | { t: "num"; v: number }
  | { t: "name"; v: string }
  | { t: "op"; v: "+" | "-" | "*" | "/" }
  | { t: "(" }
  | { t: ")" };

function tokenize(input: string): { ok: true; tokens: Tok[] } | { ok: false; error: string } {
  const tokens: Tok[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i] ?? "";
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === "(" || ch === ")") {
      tokens.push({ t: ch });
      i += 1;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/") {
      tokens.push({ t: "op", v: ch });
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i + 1;
      while (j < input.length && /[0-9.]/.test(input[j] ?? "")) j += 1;
      const raw = input.slice(i, j);
      const value = Number(raw);
      if (!Number.isFinite(value) || raw.split(".").length > 2) {
        return { ok: false, error: `Cannot read the number ${raw}.` };
      }
      tokens.push({ t: "num", v: value });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < input.length && /[A-Za-z0-9_]/.test(input[j] ?? "")) j += 1;
      const name = input.slice(i, j);
      if (!NAMES.has(name)) {
        return {
          ok: false,
          error: `Only w, grad, and lr are available. ${name} is not.`,
        };
      }
      tokens.push({ t: "name", v: name });
      i = j;
      continue;
    }
    return { ok: false, error: `Cannot read “${ch}” in the return expression.` };
  }
  return { ok: true, tokens };
}

function parseExpr(
  tokens: Tok[],
  pos = 0,
): { ok: true; expr: Expr; pos: number } | { ok: false; error: string } {
  return parseAdd(tokens, pos);
}

function parseAdd(
  tokens: Tok[],
  pos: number,
): { ok: true; expr: Expr; pos: number } | { ok: false; error: string } {
  let left = parseMul(tokens, pos);
  if (!left.ok) return left;
  while (left.pos < tokens.length) {
    const op: Tok | undefined = tokens[left.pos];
    if (!op || op.t !== "op" || (op.v !== "+" && op.v !== "-")) break;
    const right = parseMul(tokens, left.pos + 1);
    if (!right.ok) return right;
    left = {
      ok: true,
      expr: { kind: "bin", op: op.v, left: left.expr, right: right.expr },
      pos: right.pos,
    };
  }
  return left;
}

function parseMul(
  tokens: Tok[],
  pos: number,
): { ok: true; expr: Expr; pos: number } | { ok: false; error: string } {
  let left = parseUnary(tokens, pos);
  if (!left.ok) return left;
  while (left.pos < tokens.length) {
    const op: Tok | undefined = tokens[left.pos];
    if (!op || op.t !== "op" || (op.v !== "*" && op.v !== "/")) break;
    const right = parseUnary(tokens, left.pos + 1);
    if (!right.ok) return right;
    left = {
      ok: true,
      expr: { kind: "bin", op: op.v, left: left.expr, right: right.expr },
      pos: right.pos,
    };
  }
  return left;
}

function parseUnary(
  tokens: Tok[],
  pos: number,
): { ok: true; expr: Expr; pos: number } | { ok: false; error: string } {
  const tok = tokens[pos];
  if (tok && tok.t === "op" && tok.v === "-") {
    const inner = parseUnary(tokens, pos + 1);
    if (!inner.ok) return inner;
    return { ok: true, expr: { kind: "neg", expr: inner.expr }, pos: inner.pos };
  }
  if (tok && tok.t === "op" && tok.v === "+") {
    return parseUnary(tokens, pos + 1);
  }
  return parsePrimary(tokens, pos);
}

function parsePrimary(
  tokens: Tok[],
  pos: number,
): { ok: true; expr: Expr; pos: number } | { ok: false; error: string } {
  const tok = tokens[pos];
  if (!tok) return { ok: false, error: "The return expression is incomplete." };
  if (tok.t === "num") return { ok: true, expr: { kind: "num", value: tok.v }, pos: pos + 1 };
  if (tok.t === "name") {
    return {
      ok: true,
      expr: { kind: "name", value: tok.v as "w" | "grad" | "lr" },
      pos: pos + 1,
    };
  }
  if (tok.t === "(") {
    const inner = parseExpr(tokens, pos + 1);
    if (!inner.ok) return inner;
    const close = tokens[inner.pos];
    if (!close || close.t !== ")") {
      return { ok: false, error: "A parenthesis is missing." };
    }
    return { ok: true, expr: inner.expr, pos: inner.pos + 1 };
  }
  return { ok: false, error: "The return expression is incomplete." };
}

function evalExpr(expr: Expr, inputs: { w: number; grad: number; lr: number }): number {
  switch (expr.kind) {
    case "num":
      return expr.value;
    case "name":
      return inputs[expr.value];
    case "neg":
      return -evalExpr(expr.expr, inputs);
    case "bin": {
      const l = evalExpr(expr.left, inputs);
      const r = evalExpr(expr.right, inputs);
      if (expr.op === "+") return l + r;
      if (expr.op === "-") return l - r;
      if (expr.op === "*") return l * r;
      if (r === 0) throw new Error("division by zero");
      return l / r;
    }
  }
}

export const STARTER_STEP = `def step(w, grad, lr):
    return w
`;

export type HiddenTest = { name: string; pass: boolean };

export function checkStepSource(source: string): { ok: boolean; tests: HiddenTest[]; error?: string } {
  const cases: { name: string; w: number; grad: number; lr: number; expect: (value: number) => boolean }[] =
    [
      {
        name: "A positive gradient moves the parameter down",
        w: 2,
        grad: 4,
        lr: 0.25,
        expect: (value) => value < 2,
      },
      {
        name: "A negative gradient moves the parameter up",
        w: 2,
        grad: -4,
        lr: 0.25,
        expect: (value) => value > 2,
      },
      {
        name: "A zero gradient leaves the parameter unchanged",
        w: 2,
        grad: 0,
        lr: 0.5,
        expect: (value) => value === 2,
      },
      {
        name: "The learning rate scales the size of the step",
        w: 3,
        grad: 2,
        lr: 0.5,
        expect: (value) => {
          const half = evaluateStep(source, { w: 3, grad: 2, lr: 0.25 });
          return half.ok && Math.abs(3 - value) > Math.abs(3 - half.value) && value !== 3;
        },
      },
    ];
  const tests: HiddenTest[] = [];
  let error: string | undefined;
  for (const item of cases) {
    const result = evaluateStep(source, { w: item.w, grad: item.grad, lr: item.lr });
    if (!result.ok) {
      error = result.error;
      tests.push({ name: item.name, pass: false });
      continue;
    }
    tests.push({ name: item.name, pass: item.expect(result.value) });
  }
  return { ok: tests.every((test) => test.pass), tests, error };
}
