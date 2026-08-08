import test from "node:test";
import assert from "node:assert/strict";
import { CfoRequestSchema, toPublicCfoError } from "../api/_cfoAgent.js";
import { createSampleCfoSnapshot } from "../scripts/cfoSample.mjs";

test("contrato do agente aceita o snapshot ficticio completo", () => {
  const payload = { question: "Quais sao as prioridades?", snapshot: createSampleCfoSnapshot() };
  const parsed = CfoRequestSchema.parse(payload);
  assert.equal(parsed.snapshot.cashForecast13Weeks.weeks.length, 13);
  assert.equal(parsed.snapshot.privacy.rawTransactionsIncluded, false);
});

test("contrato rejeita payload que declare envio de transacoes brutas", () => {
  const snapshot = createSampleCfoSnapshot();
  snapshot.privacy.rawTransactionsIncluded = true;
  const parsed = CfoRequestSchema.safeParse({ question: "Analise o caixa", snapshot });
  assert.equal(parsed.success, false);
});

test("indisponibilidade de credito vira erro publico acionavel sem vazar detalhes internos", () => {
  const error = Object.assign(new Error("provider detail"), { status: 429, code: "credit_balance_exhausted" });
  const result = toPublicCfoError(error);
  assert.equal(result.status, 503);
  assert.equal(result.body.error, "api_quota_unavailable");
  assert.match(result.body.message, /créditos da API OpenAI/i);
  assert.doesNotMatch(result.body.message, /provider detail/i);
});
