import test from "node:test";
import assert from "node:assert/strict";
import { build13WeekCashForecast, buildCfoBillsSummary } from "../src/cfoSnapshot.js";

test("forecast de 13 semanas inclui vencidos na semana 1 e respeita a carteira", () => {
  const bills = [
    { type: "pagar", wallet: "PF", amount: 200, dueDate: "2025-12-31", paid: false },
    { type: "receber", wallet: "PF", amount: 100, dueDate: "2026-01-03", paid: false },
    { type: "pagar", wallet: "PF", amount: 300, dueDate: "2026-01-10", paid: false },
    { type: "pagar", wallet: "PJ", amount: 999, dueDate: "2026-01-02", paid: false },
    { type: "pagar", wallet: "PF", amount: 500, dueDate: "2026-01-02", paid: true },
  ];
  const result = build13WeekCashForecast({ startingCash: 1_000, avgNetMonthly: 0, bills, wallet: "PF", todayIso: "2026-01-01" });

  assert.equal(result.weeks.length, 13);
  assert.equal(result.weeks[0].scheduledPayables, 200);
  assert.equal(result.weeks[0].scheduledReceivables, 100);
  assert.equal(result.weeks[0].endCash, 900);
  assert.equal(result.weeks[1].scheduledPayables, 300);
  assert.equal(result.weeks[1].endCash, 600);
  assert.equal(result.firstNegativeWeek, null);
});

test("forecast converte o run-rate mensal para semanal de modo deterministico", () => {
  const result = build13WeekCashForecast({ startingCash: 2_000, avgNetMonthly: -520, bills: [], todayIso: "2026-01-01" });
  assert.equal(result.weeklyRunRateNet, -120);
  assert.equal(result.weeks[0].endCash, 1_880);
  assert.equal(result.weeks[12].endCash, 440);
});

test("resumo de contas separa vencido, proximos 7 e 30 dias", () => {
  const result = buildCfoBillsSummary({
    todayIso: "2026-01-01",
    bills: [
      { type: "pagar", wallet: "PJ", amount: 400, dueDate: "2025-12-20", paid: false },
      { type: "pagar", wallet: "PJ", amount: 300, dueDate: "2026-01-07", paid: false },
      { type: "pagar", wallet: "PJ", amount: 500, dueDate: "2026-01-20", paid: false },
      { type: "receber", wallet: "PJ", amount: 900, dueDate: "2026-01-15", paid: false },
    ],
  });
  assert.deepEqual(result, {
    openPayables: 1_200,
    openReceivables: 900,
    overduePayables: 400,
    overduePayablesCount: 1,
    payablesDue7d: 300,
    payablesDue30d: 800,
    receivablesDue30d: 900,
  });
});

