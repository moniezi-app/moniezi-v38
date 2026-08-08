import type { Transaction, Invoice, TaxPayment, UserSettings } from "../types";

export type InsightSeverity = "low" | "medium" | "high";

/**
 * Smart Insights is deliberately business-only. MONIEZI records business
 * bookkeeping activity, so the app should not infer personal savings goals,
 * investment behavior, emergency-fund needs, or household budgets from it.
 */
export type InsightCategory =
  | "cashflow"
  | "spending"
  | "income"
  | "patterns"
  | "anomaly"
  | "subscriptions"
  | "forecast"
  | "vendors"
  | "seasonal"
  | "recurring"
  | "distribution"
  | "invoices"
  | "tax"
  | "receipts"
  | "review";

export type Insight = {
  id: string;
  severity: InsightSeverity;
  category: InsightCategory;
  title: string;
  message: string;
  detail?: string;
  priority: number;
  actionable: boolean;
  data?: any;
};

const DISMISSED_KEY = "moniezi_insights_dismissed_v1";

export function getDismissedInsightIds(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

export function dismissInsightId(id: string) {
  const curr = new Set(getDismissedInsightIds());
  curr.add(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(curr)));
}

export function clearDismissedInsights() {
  localStorage.removeItem(DISMISSED_KEY);
}

function parseDate(d: string | Date): number {
  if (d instanceof Date) return d.getTime();
  const t = Date.parse(d);
  return Number.isFinite(t) ? t : 0;
}

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

function average(nums: number[]): number {
  return nums.length ? sum(nums) / nums.length : 0;
}

function standardDeviation(nums: number[]): number {
  if (!nums.length) return 0;
  const avg = average(nums);
  return Math.sqrt(average(nums.map((n) => Math.pow(n - avg, 2))));
}

function lastNDaysTransactions(transactions: Transaction[], days: number): Transaction[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return transactions.filter((t) => parseDate(t.date) >= cutoff);
}

function groupByMonth(transactions: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>();
  transactions.forEach((t) => {
    const month = (t.date || "").substring(0, 7);
    if (!month) return;
    if (!map.has(month)) map.set(month, []);
    map.get(month)!.push(t);
  });
  return map;
}

function formatMoney(n: number): string {
  const sign = n < 0 ? "-" : "";
  const val = Math.abs(n);
  return `${sign}$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateInsights(input: {
  transactions: Transaction[];
  invoices: Invoice[];
  taxPayments: TaxPayment[];
  settings: UserSettings;
}): Insight[] {
  const { transactions, invoices, taxPayments, settings } = input;
  const insights: Insight[] = [];

  analyzeBusinessCashFlow(transactions, insights);
  analyzeInvoices(invoices, insights);
  analyzeMissingReceipts(transactions, insights);
  analyzeReviewQueue(transactions, insights);
  analyzeExpenseTrends(transactions, insights);
  analyzeCategoryConcentration(transactions, insights);
  analyzeVendorConcentration(transactions, insights);
  analyzeIncomeStability(transactions, insights);
  detectUnusualExpenses(transactions, insights);
  detectBusinessSubscriptions(transactions, insights);
  analyzeExpenseForecast(transactions, insights);
  analyzeTaxReserve(transactions, taxPayments, settings, insights);

  insights.sort((a, b) => b.priority - a.priority);
  const seen = new Set<string>();
  return insights.filter((insight) => {
    const key = `${insight.category}-${insight.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function analyzeBusinessCashFlow(transactions: Transaction[], insights: Insight[]) {
  if (transactions.length < 5) return;
  const recent = lastNDaysTransactions(transactions, 30);
  const source = recent.length >= 3 ? recent : transactions;
  const income = sum(source.filter((t) => t.type === "income").map((t) => Math.abs(t.amount)));
  const expenses = sum(source.filter((t) => t.type === "expense").map((t) => Math.abs(t.amount)));
  const net = income - expenses;

  if (income > 0 && net < 0) {
    insights.push({
      id: "business_cashflow_negative",
      severity: "high",
      category: "cashflow",
      title: "Business expenses are above income",
      message: `${formatMoney(expenses)} went out versus ${formatMoney(income)} in for the period reviewed.`,
      detail: "Open Activity and review the largest expense categories and any income that may still need to be recorded.",
      priority: 10,
      actionable: true,
      data: { income, expenses, net },
    });
  } else if (income > 0 && net > 0) {
    insights.push({
      id: "business_cashflow_positive",
      severity: "low",
      category: "cashflow",
      title: "Business is operating above recorded expenses",
      message: `Recorded income exceeds recorded expenses by ${formatMoney(net)} for the period reviewed.`,
      detail: "Use this alongside unpaid invoices, upcoming expenses, and tax reserves when reviewing business cash flow.",
      priority: 4,
      actionable: false,
      data: { income, expenses, net },
    });
  }
}

function analyzeInvoices(invoices: Invoice[], insights: Insight[]) {
  const active = invoices.filter((inv) => inv.status !== "void");
  const unpaid = active.filter((inv) => inv.status === "unpaid");
  if (!unpaid.length) return;

  const now = Date.now();
  const overdue = unpaid.filter((inv) => {
    const due = parseDate(inv.due || inv.date);
    return due > 0 && due < now;
  });
  const unpaidTotal = sum(unpaid.map((inv) => Math.abs(inv.amount || 0)));

  if (overdue.length) {
    const overdueTotal = sum(overdue.map((inv) => Math.abs(inv.amount || 0)));
    insights.push({
      id: "invoices_overdue",
      severity: "high",
      category: "invoices",
      title: `${overdue.length} overdue invoice${overdue.length === 1 ? "" : "s"}`,
      message: `${formatMoney(overdueTotal)} is past due.`,
      detail: "Open Invoices, review the overdue items, and follow up with the customers who still owe payment.",
      priority: 10,
      actionable: true,
      data: { overdueCount: overdue.length, overdueTotal },
    });
  } else {
    insights.push({
      id: "invoices_unpaid",
      severity: "medium",
      category: "invoices",
      title: `${unpaid.length} unpaid invoice${unpaid.length === 1 ? "" : "s"}`,
      message: `${formatMoney(unpaidTotal)} is still outstanding.`,
      detail: "Review upcoming due dates so customer follow-ups happen before invoices become overdue.",
      priority: 7,
      actionable: true,
      data: { unpaidCount: unpaid.length, unpaidTotal },
    });
  }
}

function analyzeMissingReceipts(transactions: Transaction[], insights: Insight[]) {
  const recentExpenses = lastNDaysTransactions(transactions, 90).filter((t) => t.type === "expense");
  if (recentExpenses.length < 3) return;
  const missing = recentExpenses.filter((t) => !t.receiptId);
  if (!missing.length) return;
  const amount = sum(missing.map((t) => Math.abs(t.amount)));
  insights.push({
    id: "receipts_missing_90d",
    severity: missing.length >= 10 ? "high" : "medium",
    category: "receipts",
    title: `${missing.length} expense${missing.length === 1 ? "" : "s"} missing receipts`,
    message: `${formatMoney(amount)} of recent expenses do not have a receipt attached.`,
    detail: "Open Activity and use the receipt filter to attach the documents you still have. You can also leave an expense without a receipt when none is available.",
    priority: missing.length >= 10 ? 9 : 7,
    actionable: true,
    data: { count: missing.length, amount },
  });
}

function analyzeReviewQueue(transactions: Transaction[], insights: Insight[]) {
  const expenses = lastNDaysTransactions(transactions, 90).filter((t) => t.type === "expense");
  const pending = expenses.filter((t) => !t.reviewedAt);
  if (pending.length < 5) return;
  insights.push({
    id: "expense_review_queue",
    severity: pending.length >= 20 ? "medium" : "low",
    category: "review",
    title: `${pending.length} expenses still need review`,
    message: "These records have not yet been marked reviewed in Activity.",
    detail: "Use review status during a bookkeeping or tax-prep pass to confirm the category, amount, and receipt for each expense.",
    priority: pending.length >= 20 ? 7 : 4,
    actionable: true,
    data: { count: pending.length },
  });
}

function analyzeExpenseTrends(transactions: Transaction[], insights: Insight[]) {
  const last30 = lastNDaysTransactions(transactions, 30).filter((t) => t.type === "expense");
  const last60 = lastNDaysTransactions(transactions, 60).filter((t) => t.type === "expense");
  const cutoff30 = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const previous30 = last60.filter((t) => parseDate(t.date) < cutoff30);
  if (last30.length < 3 || previous30.length < 3) return;
  const current = sum(last30.map((t) => Math.abs(t.amount)));
  const previous = sum(previous30.map((t) => Math.abs(t.amount)));
  if (previous <= 0) return;
  const change = ((current - previous) / previous) * 100;

  if (change >= 25) {
    insights.push({
      id: "expenses_up_30d",
      severity: "medium",
      category: "spending",
      title: "Business expenses increased",
      message: `Expenses are ${change.toFixed(0)}% higher than the previous 30-day period.`,
      detail: `Current period: ${formatMoney(current)}. Previous period: ${formatMoney(previous)}. Review which categories created the increase.`,
      priority: 8,
      actionable: true,
      data: { current, previous, change },
    });
  } else if (change <= -20) {
    insights.push({
      id: "expenses_down_30d",
      severity: "low",
      category: "spending",
      title: "Business expenses decreased",
      message: `Expenses are ${Math.abs(change).toFixed(0)}% lower than the previous 30-day period.`,
      detail: `Current period: ${formatMoney(current)}. Previous period: ${formatMoney(previous)}.`,
      priority: 4,
      actionable: false,
      data: { current, previous, change },
    });
  }
}

function analyzeCategoryConcentration(transactions: Transaction[], insights: Insight[]) {
  const expenses = lastNDaysTransactions(transactions, 90).filter((t) => t.type === "expense");
  if (expenses.length < 8) return;
  const totals = new Map<string, number>();
  expenses.forEach((t) => totals.set(t.category || "Uncategorized", (totals.get(t.category || "Uncategorized") || 0) + Math.abs(t.amount)));
  const total = sum(Array.from(totals.values()));
  const top = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])[0];
  if (!top || total <= 0) return;
  const pct = (top[1] / total) * 100;
  if (pct >= 35) {
    insights.push({
      id: "expense_category_concentration",
      severity: "medium",
      category: "distribution",
      title: `${top[0]} is your largest expense category`,
      message: `${pct.toFixed(0)}% of recent business expenses (${formatMoney(top[1])}) are in this category.`,
      detail: "A concentrated category is not automatically a problem. Review it to confirm the classification and understand what is driving the total.",
      priority: 6,
      actionable: true,
      data: { category: top[0], amount: top[1], percentage: pct },
    });
  }
}

function analyzeVendorConcentration(transactions: Transaction[], insights: Insight[]) {
  const expenses = lastNDaysTransactions(transactions, 90).filter((t) => t.type === "expense" && t.name?.trim());
  if (expenses.length < 10) return;
  const totals = new Map<string, number>();
  expenses.forEach((t) => totals.set(t.name.trim(), (totals.get(t.name.trim()) || 0) + Math.abs(t.amount)));
  const total = sum(Array.from(totals.values()));
  const top = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])[0];
  if (!top || total <= 0) return;
  const pct = (top[1] / total) * 100;
  if (pct >= 25) {
    insights.push({
      id: "vendor_concentration",
      severity: "low",
      category: "vendors",
      title: `${top[0]} is your largest recent vendor`,
      message: `${pct.toFixed(0)}% of recent expenses (${formatMoney(top[1])}) were recorded with this vendor.`,
      detail: "Use this as a business-review signal: confirm the records are categorized correctly and decide whether the concentration is expected.",
      priority: 4,
      actionable: true,
      data: { vendor: top[0], amount: top[1], percentage: pct },
    });
  }
}

function analyzeIncomeStability(transactions: Transaction[], insights: Insight[]) {
  const income = transactions.filter((t) => t.type === "income");
  if (income.length < 6) return;
  const monthly = Array.from(groupByMonth(income).entries()).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 4);
  if (monthly.length < 3) return;
  const values = monthly.map(([, txs]) => sum(txs.map((t) => Math.abs(t.amount))));
  const avg = average(values);
  if (avg <= 0) return;
  const variation = (standardDeviation(values) / avg) * 100;
  if (variation >= 30) {
    insights.push({
      id: "business_income_variable",
      severity: "medium",
      category: "income",
      title: "Business income varies month to month",
      message: `Recorded monthly income has varied by about ${variation.toFixed(0)}% across recent months.`,
      detail: "Use the pattern for business cash-flow planning, customer follow-up, and timing larger business expenses.",
      priority: 6,
      actionable: true,
      data: { averageIncome: avg, variation, values },
    });
  } else if (variation <= 12) {
    insights.push({
      id: "business_income_stable",
      severity: "low",
      category: "income",
      title: "Business income has been relatively consistent",
      message: "Recent monthly income totals are staying within a fairly narrow range.",
      detail: "That consistency can make business cash-flow and tax planning easier.",
      priority: 3,
      actionable: false,
      data: { averageIncome: avg, variation, values },
    });
  }
}

function detectUnusualExpenses(transactions: Transaction[], insights: Insight[]) {
  const expenses = lastNDaysTransactions(transactions, 120).filter((t) => t.type === "expense");
  if (expenses.length < 10) return;
  const amounts = expenses.map((t) => Math.abs(t.amount)).filter((n) => n > 0);
  const avg = average(amounts);
  const sd = standardDeviation(amounts);
  if (sd <= 0) return;
  const unusual = expenses.filter((t) => Math.abs(t.amount) > avg + 2 * sd).sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  if (!unusual.length) return;
  const top = unusual[0];
  insights.push({
    id: `unusual_expense_${top.id}`,
    severity: "medium",
    category: "anomaly",
    title: "Unusually large expense detected",
    message: `${top.name || "An expense"} was ${formatMoney(Math.abs(top.amount))}, well above your recent typical expense.`,
    detail: "Confirm the amount and category are correct. Large legitimate purchases can simply be dismissed after review.",
    priority: 7,
    actionable: true,
    data: { transactionId: top.id, amount: top.amount, average: avg },
  });
}

function detectBusinessSubscriptions(transactions: Transaction[], insights: Insight[]) {
  const groups = new Map<string, Transaction[]>();
  transactions.filter((t) => t.type === "expense" && t.name?.trim()).forEach((t) => {
    const rounded = Math.round(Math.abs(t.amount));
    const key = `${t.name.trim().toLowerCase()}_${rounded}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  });

  const subscriptions: Array<{ name: string; amount: number }> = [];
  groups.forEach((txs) => {
    if (txs.length < 3) return;
    const dates = txs.map((t) => parseDate(t.date)).filter(Boolean).sort((a, b) => a - b);
    if (dates.length < 3) return;
    const intervals: number[] = [];
    for (let i = 1; i < dates.length; i++) intervals.push((dates[i] - dates[i - 1]) / 86400000);
    const avgInterval = average(intervals);
    if (avgInterval >= 25 && avgInterval <= 35) subscriptions.push({ name: txs[0].name, amount: Math.abs(txs[0].amount) });
  });

  if (subscriptions.length >= 2) {
    const monthly = sum(subscriptions.map((s) => s.amount));
    insights.push({
      id: "business_subscriptions",
      severity: "low",
      category: "subscriptions",
      title: `${subscriptions.length} recurring business charges detected`,
      message: `They total about ${formatMoney(monthly)} per month based on recent records.`,
      detail: "Review recurring software, services, memberships, or other repeating vendor charges to confirm they are still active business expenses.",
      priority: 5,
      actionable: true,
      data: { subscriptions, monthly },
    });
  }
}

function analyzeExpenseForecast(transactions: Transaction[], insights: Insight[]) {
  const monthly = Array.from(groupByMonth(transactions.filter((t) => t.type === "expense")).entries()).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 4);
  if (monthly.length < 3) return;
  const completeish = monthly.slice(1); // avoid comparing a partial current month to full months
  const typical = average(completeish.map(([, txs]) => sum(txs.map((t) => Math.abs(t.amount)))));
  if (typical <= 0) return;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const current = transactions.filter((t) => t.type === "expense" && t.date.startsWith(currentMonth));
  if (current.length < 2) return;
  const currentSpend = sum(current.map((t) => Math.abs(t.amount)));
  const day = Math.max(1, new Date().getDate());
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projected = (currentSpend / day) * daysInMonth;

  if (projected >= typical * 1.2) {
    insights.push({
      id: "expense_forecast_high",
      severity: "medium",
      category: "forecast",
      title: "This month is trending above normal expenses",
      message: `At the current pace, business expenses project to about ${formatMoney(projected)} versus a recent monthly average of ${formatMoney(typical)}.`,
      detail: "Check the current month's largest categories. A planned equipment or materials purchase may fully explain the difference.",
      priority: 6,
      actionable: true,
      data: { projected, typical, currentSpend },
    });
  }
}

function analyzeTaxReserve(transactions: Transaction[], taxPayments: TaxPayment[], settings: UserSettings, insights: Insight[]) {
  const year = new Date().getFullYear();
  const ytd = transactions.filter((t) => Number((t.date || "").slice(0, 4)) === year);
  const income = sum(ytd.filter((t) => t.type === "income").map((t) => Math.abs(t.amount)));
  const expenses = sum(ytd.filter((t) => t.type === "expense").map((t) => Math.abs(t.amount)));
  const profit = Math.max(0, income - expenses);
  if (profit <= 0) return;
  const estimatedRate = Math.max(0, Number(settings.taxRate || 0) + Number(settings.stateTaxRate || 0)) / 100;
  if (estimatedRate <= 0) return;
  const target = profit * estimatedRate;
  const paid = sum(taxPayments.filter((p) => Number((p.date || "").slice(0, 4)) === year).map((p) => Math.abs(p.amount || 0)));
  const remaining = Math.max(0, target - paid);
  if (remaining <= 0) return;

  insights.push({
    id: "tax_reserve_gap",
    severity: remaining >= target * 0.6 ? "medium" : "low",
    category: "tax",
    title: "Estimated tax amount still uncovered",
    message: `Based on your current MONIEZI tax-rate settings, about ${formatMoney(remaining)} remains after recorded tax payments.`,
    detail: "Open Tax Planner to review the estimate. This is a planning calculation from your settings and records, not a tax filing determination.",
    priority: remaining >= target * 0.6 ? 7 : 4,
    actionable: true,
    data: { profit, target, paid, remaining, estimatedRate },
  });
}

export function getInsightCount(input: {
  transactions: Transaction[];
  invoices: Invoice[];
  taxPayments: TaxPayment[];
  settings: UserSettings;
}): number {
  const insights = generateInsights(input);
  const dismissed = new Set(getDismissedInsightIds());
  return insights.filter((i) => !dismissed.has(i.id)).length;
}
