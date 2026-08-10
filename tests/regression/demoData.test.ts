import * as assert from 'node:assert/strict';
import { getFreshDemoData } from '../../constants';
import { buildJobProfitabilityRows } from '../../src/features/jobs/jobCore';
import { buildMonthlyGoalProgress } from '../../src/features/goals/monthlyGoals';

export function runDemoDataRegressionTests() {
  const first = getFreshDemoData();
  const second = getFreshDemoData();

  assert.deepEqual(first, second, 'commercial demo should be deterministic within the same day');
  assert.equal(first.clients.length, 5, 'demo client count should stay curated');
  assert.equal(first.jobs.length, 4, 'demo should include linked jobs/projects');
  assert.equal(first.invoices.length, 6, 'demo should include a compact invoice history');
  assert.equal(first.estimates.length, 6, 'demo should include a compact estimate pipeline');
  assert.equal(first.receipts.length, 5, 'all bundled demo receipt assets should be represented');
  assert.ok(first.settings.monthlyRevenueGoal > 0, 'demo should visibly exercise monthly revenue goals');
  assert.ok(first.settings.monthlyProfitGoal > 0, 'demo should visibly exercise monthly profit goals');

  const jobIds = new Set(first.jobs.map(job => job.id));
  const clientIds = new Set(first.clients.map(client => client.id));
  const receiptIds = new Set(first.receipts.map(receipt => receipt.id));

  for (const job of first.jobs) {
    if (job.clientId) assert.ok(clientIds.has(job.clientId), `job ${job.id} should link to a real demo client`);
  }
  for (const record of [...first.transactions, ...first.invoices, ...first.estimates, ...first.mileageTrips]) {
    if (record.jobId) assert.ok(jobIds.has(record.jobId), `record should not reference a missing demo job: ${record.jobId}`);
  }
  for (const transaction of first.transactions) {
    if (transaction.receiptId) assert.ok(receiptIds.has(transaction.receiptId), `transaction should not reference a missing receipt: ${transaction.receiptId}`);
  }

  const currentYear = new Date().getFullYear();
  const currentYearExpenses = first.transactions.filter(tx => tx.type === 'expense' && new Date(tx.date).getFullYear() === currentYear);
  assert.equal(currentYearExpenses.length, 7, 'Tax Prep demo should use a controlled current-year expense set');
  assert.equal(currentYearExpenses.filter(tx => !tx.receiptId).length, 2, 'Tax Prep demo should show exactly two missing receipts');
  assert.equal(currentYearExpenses.filter(tx => !tx.reviewedAt).length, 1, 'Tax Prep demo should show exactly one expense awaiting review');
  assert.equal(first.mileageTrips.filter(trip => !trip.purpose || trip.miles <= 0).length, 1, 'Tax Prep demo should show one incomplete mileage trip');

  const rows = buildJobProfitabilityRows({
    jobs: first.jobs,
    clients: first.clients,
    transactions: first.transactions,
    invoices: first.invoices,
    estimates: first.estimates,
    mileageTrips: first.mileageTrips,
    mileageRateCents: first.settings.mileageRateCents || 72.5,
    year: currentYear,
  });
  const bathroom = rows.find(row => row.job.id === 'job_demo_1');
  assert.ok(bathroom, 'bathroom demo job should exist in Job Profitability');
  assert.equal(bathroom?.revenue, 6850);
  assert.equal(bathroom?.expenses, 2310);
  assert.equal(bathroom?.estimatedProfit, 4540);
  assert.ok(Math.abs((bathroom?.miles || 0) - 84.6) < 0.001, 'bathroom demo job should show 84.6 business miles');

  const goals = buildMonthlyGoalProgress(first.transactions, first.settings.monthlyRevenueGoal, first.settings.monthlyProfitGoal, new Date());
  assert.equal(goals.revenue, 9850, 'demo monthly revenue should be stable and meaningful');
  assert.ok(Math.abs(goals.profit - 7447.2) < 0.001, 'demo monthly profit should be stable and meaningful');
  assert.equal(goals.hasRevenueGoal, true);
  assert.equal(goals.hasProfitGoal, true);
}
