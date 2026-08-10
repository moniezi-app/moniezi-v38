import type { Transaction } from '../../../types';

export interface MonthlyGoalProgress {
  revenue: number;
  expenses: number;
  profit: number;
  previousRevenue: number;
  previousProfit: number;
  revenueGoal: number;
  profitGoal: number;
  revenuePct: number;
  profitPct: number;
  revenueRemaining: number;
  profitRemaining: number;
  hasRevenueGoal: boolean;
  hasProfitGoal: boolean;
}

const safePositive = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const safeAmount = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const pct = (value: number, goal: number) => goal > 0 ? Math.max(0, (value / goal) * 100) : 0;

export const buildMonthlyGoalProgress = (
  transactions: Transaction[],
  revenueGoalInput?: number,
  profitGoalInput?: number,
  referenceDate: Date = new Date(),
): MonthlyGoalProgress => {
  const monthKey = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`;
  const previousDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
  const previousMonthKey = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`;
  const monthTransactions = transactions.filter(transaction => String(transaction.date || '').slice(0, 7) === monthKey);
  const previousMonthTransactions = transactions.filter(transaction => String(transaction.date || '').slice(0, 7) === previousMonthKey);
  const revenue = monthTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + safeAmount(transaction.amount), 0);
  const expenses = monthTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + safeAmount(transaction.amount), 0);
  const profit = revenue - expenses;
  const previousRevenue = previousMonthTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + safeAmount(transaction.amount), 0);
  const previousExpenses = previousMonthTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + safeAmount(transaction.amount), 0);
  const previousProfit = previousRevenue - previousExpenses;
  const revenueGoal = safePositive(revenueGoalInput);
  const profitGoal = safePositive(profitGoalInput);

  return {
    revenue,
    expenses,
    profit,
    previousRevenue,
    previousProfit,
    revenueGoal,
    profitGoal,
    revenuePct: pct(revenue, revenueGoal),
    profitPct: pct(profit, profitGoal),
    revenueRemaining: revenueGoal > 0 ? Math.max(0, revenueGoal - revenue) : 0,
    profitRemaining: profitGoal > 0 ? Math.max(0, profitGoal - profit) : 0,
    hasRevenueGoal: revenueGoal > 0,
    hasProfitGoal: profitGoal > 0,
  };
};
