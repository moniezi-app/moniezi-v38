import * as assert from 'node:assert/strict';
import type { Transaction } from '../../types';
import { buildMonthlyGoalProgress } from '../../src/features/goals/monthlyGoals';

export const runMonthlyGoalsRegressionTests = () => {
  const transactions: Transaction[] = [
    { id: 'i1', date: '2026-08-02', name: 'Job payment', category: 'Services', amount: 6000, type: 'income' },
    { id: 'e1', date: '2026-08-04', name: 'Materials', category: 'Materials', amount: 1800, type: 'expense' },
    { id: 'i2', date: '2026-07-31', name: 'Prior month', category: 'Services', amount: 9000, type: 'income' },
    { id: 'e2', date: '2026-07-20', name: 'Prior expense', category: 'Materials', amount: 2500, type: 'expense' },
  ];

  const progress = buildMonthlyGoalProgress(transactions, 10000, 5000, new Date(2026, 7, 11));
  assert.equal(progress.revenue, 6000);
  assert.equal(progress.expenses, 1800);
  assert.equal(progress.profit, 4200);
  assert.equal(progress.previousRevenue, 9000);
  assert.equal(progress.previousProfit, 6500);
  assert.equal(progress.revenuePct, 60);
  assert.equal(progress.profitPct, 84);
  assert.equal(progress.revenueRemaining, 4000);
  assert.equal(progress.profitRemaining, 800);
  assert.equal(progress.hasRevenueGoal, true);
  assert.equal(progress.hasProfitGoal, true);

  const optional = buildMonthlyGoalProgress(transactions, 0, undefined, new Date(2026, 7, 11));
  assert.equal(optional.hasRevenueGoal, false);
  assert.equal(optional.hasProfitGoal, false);
  assert.equal(optional.revenuePct, 0);
  assert.equal(optional.profitPct, 0);
};
