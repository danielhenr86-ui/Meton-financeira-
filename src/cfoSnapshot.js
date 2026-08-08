const DAY_MS = 86_400_000;

function money(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function utcDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""))) return null;
  const d = new Date(`${iso}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function scopedOpenBills(bills, wallet) {
  return (Array.isArray(bills) ? bills : []).filter((bill) => {
    if (!bill || bill.paid) return false;
    if (wallet !== "Tudo" && bill.wallet !== wallet) return false;
    return Number.isFinite(Number(bill.amount)) && Number(bill.amount) > 0 && utcDate(bill.dueDate);
  });
}

export function build13WeekCashForecast({ startingCash, avgNetMonthly, bills, wallet = "Tudo", todayIso }) {
  const today = utcDate(todayIso) || utcDate(new Date().toISOString().slice(0, 10));
  const openBills = scopedOpenBills(bills, wallet);
  const weeklyRunRateNet = money((Number(avgNetMonthly) || 0) * 12 / 52);
  const buckets = Array.from({ length: 13 }, (_, index) => ({
    payables: 0,
    receivables: 0,
    count: 0,
    index,
  }));

  for (const bill of openBills) {
    const due = utcDate(bill.dueDate);
    const daysFromToday = Math.floor((due.getTime() - today.getTime()) / DAY_MS);
    const weekIndex = daysFromToday < 0 ? 0 : Math.floor(daysFromToday / 7);
    if (weekIndex > 12) continue;
    const bucket = buckets[weekIndex];
    const amount = money(bill.amount);
    if (bill.type === "receber") bucket.receivables += amount;
    else bucket.payables += amount;
    bucket.count += 1;
  }

  let cash = money(startingCash);
  const weeks = buckets.map((bucket) => {
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() + bucket.index * 7);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    const scheduledPayables = money(bucket.payables);
    const scheduledReceivables = money(bucket.receivables);
    const netChange = money(weeklyRunRateNet + scheduledReceivables - scheduledPayables);
    cash = money(cash + netChange);
    return {
      week: bucket.index + 1,
      startDate: isoDate(start),
      endDate: isoDate(end),
      historicalRunRateNet: weeklyRunRateNet,
      scheduledPayables,
      scheduledReceivables,
      scheduledItems: bucket.count,
      netChange,
      endCash: cash,
    };
  });

  const lowest = weeks.reduce((best, week) => (week.endCash < best.endCash ? week : best), weeks[0]);
  const firstNegative = weeks.find((week) => week.endCash < 0) || null;

  return {
    weeks,
    weeklyRunRateNet,
    lowestCash: lowest?.endCash ?? money(startingCash),
    lowestWeek: lowest?.week ?? null,
    firstNegativeWeek: firstNegative?.week ?? null,
    assumptions: [
      "Forecast gerencial indicativo, nao uma previsao contabil ou garantia de caixa.",
      "O run-rate semanal usa o fluxo liquido medio mensal historico convertido por 12/52.",
      "Contas em aberto cadastradas sao adicionadas ao run-rate; recorrencias presentes tambem no historico podem causar sobreposicao.",
      "Contas vencidas em aberto sao tratadas como compromisso da semana 1.",
    ],
  };
}

export function buildCfoBillsSummary({ bills, wallet = "Tudo", todayIso }) {
  const today = utcDate(todayIso) || utcDate(new Date().toISOString().slice(0, 10));
  const openBills = scopedOpenBills(bills, wallet);
  const summary = {
    openPayables: 0,
    openReceivables: 0,
    overduePayables: 0,
    overduePayablesCount: 0,
    payablesDue7d: 0,
    payablesDue30d: 0,
    receivablesDue30d: 0,
  };

  for (const bill of openBills) {
    const due = utcDate(bill.dueDate);
    const days = Math.floor((due.getTime() - today.getTime()) / DAY_MS);
    const amount = money(bill.amount);
    if (bill.type === "receber") {
      summary.openReceivables += amount;
      if (days >= 0 && days <= 30) summary.receivablesDue30d += amount;
      continue;
    }
    summary.openPayables += amount;
    if (days < 0) {
      summary.overduePayables += amount;
      summary.overduePayablesCount += 1;
    }
    if (days >= 0 && days <= 7) summary.payablesDue7d += amount;
    if (days >= 0 && days <= 30) summary.payablesDue30d += amount;
  }

  return Object.fromEntries(Object.entries(summary).map(([key, value]) => [key, typeof value === "number" ? money(value) : value]));
}

