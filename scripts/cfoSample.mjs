import { build13WeekCashForecast, buildCfoBillsSummary } from "../src/cfoSnapshot.js";

export function createSampleCfoSnapshot() {
  const todayIso = "2026-08-07";
  const bills = [
    { id: "b1", type: "pagar", wallet: "PJ", amount: 7_800, dueDate: "2026-08-10", paid: false },
    { id: "b2", type: "pagar", wallet: "PJ", amount: 6_200, dueDate: "2026-08-25", paid: false },
    { id: "b3", type: "receber", wallet: "PJ", amount: 14_000, dueDate: "2026-08-14", paid: false },
    { id: "b4", type: "pagar", wallet: "PF", amount: 2_400, dueDate: "2026-08-05", paid: false },
  ];
  const cashForecast13Weeks = build13WeekCashForecast({
    startingCash: 18_500,
    avgNetMonthly: 7_000,
    bills,
    wallet: "Tudo",
    todayIso,
  });

  return {
    version: 1,
    generatedAt: "2026-08-07T12:00:00.000Z",
    scope: "Tudo",
    privacy: { rawTransactionsIncluded: false, transactionDescriptionsIncluded: false },
    overview: {
      balance: 18_500,
      balancePF: 5_000,
      balancePJ: 13_500,
      inflowCurrentMonth: 42_000,
      outflowCurrentMonth: 35_000,
      averageNetMonthly: 7_000,
      savingsRate: 0.1667,
      incomeCommitmentRate: 0.8333,
      reserveMonths: 2.3,
      financialHealthScore: 63,
      analysisPeriod: "jun-ago/2026",
    },
    managementPnl: {
      receitaOp: 42_000,
      outrasEntradas: 0,
      receitaTotal: 42_000,
      custoFixo: 12_000,
      custoVar: 9_000,
      lucroBruto: 21_000,
      despOp: 6_000,
      despAdm: 3_500,
      resultadoOp: 11_500,
      tributos: 2_500,
      despFin: 900,
      pessoal: 0,
      invest: 1_100,
      naoClass: 0,
      resultado: 7_000,
      retiradas: 4_000,
      emprestimosIn: 0,
      margemBruta: 50,
      margemOp: 27.38,
      margemLiq: 16.67,
      count: 48,
    },
    cashForecast13Weeks,
    cashForecast90Days: {
      averageIn: 41_000,
      averageOut: 34_000,
      averageNet: 7_000,
      daysToZero: null,
      monthsUsed: 3,
      projections: [
        { horizonDays: 30, projectedCash: 23_100, scheduledPayables: 16_400, scheduledReceivables: 14_000 },
        { horizonDays: 60, projectedCash: 30_100, scheduledPayables: 16_400, scheduledReceivables: 14_000 },
        { horizonDays: 90, projectedCash: 37_100, scheduledPayables: 16_400, scheduledReceivables: 14_000 },
      ],
    },
    bills: buildCfoBillsSummary({ bills, wallet: "Tudo", todayIso }),
    taxReserve: { revenue: 42_000, pct: 6, shouldReserve: 2_520, paid: 1_200, provisioned: 1_320, remaining: 1_320 },
    budgets: [
      { category: "Fornecedores", spent: 9_000, limit: 8_000, percentUsed: 112.5 },
      { category: "Despesas administrativas", spent: 3_500, limit: 4_000, percentUsed: 87.5 },
    ],
    dataQuality: {
      score: 88,
      label: "Boa",
      invalidDates: 0,
      likelyDuplicates: 1,
      uncategorized: 3,
      uncategorizedRate: 0.0625,
      missingMonths: 0,
      monthsCovered: 6,
      transactions: 96,
    },
    patrimonialSeparation: {
      score: 72,
      label: "Mistura moderada",
      personalSpendFromBusinessRate: 0.08,
      businessSpendFromPersonalRate: 0.04,
      formalProlabore: true,
      transfersPerMonth: 1,
    },
    metonScore: { score: 67, label: "Atencao" },
    anomalies: [
      { type: "Crescimento atipico de categoria", category: "Fornecedores", value: 2_400, priority: "média" },
    ],
    ruleBasedActionPlan: {
      immediate: ["Revisar o estouro do orcamento de Fornecedores."],
      shortTerm: ["Separar R$ 1.320 para tributos antes de utilizar o caixa da PJ."],
      mediumTerm: ["Elevar a reserva de liquidez para reduzir vulnerabilidade a oscilacoes de receita."],
    },
    goals: [
      { name: "Reserva operacional", target: 60_000, saved: 18_500, deadline: "2027-06-30" },
    ],
    ruleBasedInsights: [
      "A margem de sobra e positiva, mas a reserva ainda cobre menos de tres meses de despesas.",
      "Fornecedores ultrapassou o orcamento mensal definido.",
    ],
  };
}

