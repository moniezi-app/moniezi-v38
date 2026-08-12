import * as assert from 'node:assert/strict';
import { CATS_IN, CATS_OUT, getFreshDemoData } from '../../constants';
import type { Estimate, Invoice, Job, MileageTrip, Receipt, Transaction, Client } from '../../types';
import { buildJobProfitabilityRows } from '../../src/features/jobs/jobCore';
import { buildMonthlyGoalProgress } from '../../src/features/goals/monthlyGoals';

export function runDemoDataRegressionTests() {
  const first = getFreshDemoData();
  const second = getFreshDemoData();

  assert.deepEqual(first, second, 'commercial demo should be deterministic within the same day');

  const transactions = first.transactions as Transaction[];
  const invoices = first.invoices as Invoice[];
  const estimates = first.estimates as Estimate[];
  const mileageTrips = first.mileageTrips as MileageTrip[];
  const jobs = first.jobs as Job[];
  const clients = first.clients as Client[];
  const receipts = first.receipts as Receipt[];

  assert.equal(clients.length, 5, 'demo client count should stay curated');
  assert.equal(jobs.length, 4, 'demo should include linked jobs/projects');

  // Commercial-demo density: protect against accidentally shrinking the demo
  // back to a handful of records. These floors intentionally leave room for
  // future curation without requiring exact fixture counts forever.
  assert.ok(transactions.length >= 350, 'demo should include a deep transaction history');
  assert.ok(invoices.length >= 40, 'demo should include a substantial invoice history');
  assert.ok(estimates.length >= 28, 'demo should include a substantial estimate history');
  assert.ok(mileageTrips.length >= 60, 'demo should include meaningful mileage history');
  assert.ok(receipts.length >= 120, 'demo should include rich receipt coverage');
  assert.ok(first.settings.monthlyRevenueGoal > 0, 'demo should visibly exercise monthly revenue goals');
  assert.ok(first.settings.monthlyProfitGoal > 0, 'demo should visibly exercise monthly profit goals');

  const incomeTotal = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const expenseTotal = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  assert.ok(incomeTotal >= 550000, 'demo all-time income should look like an established operating business');
  assert.ok(expenseTotal >= 100000, 'demo all-time expenses should be substantial enough for reports and categories');

  const incomeCategories = new Set(transactions.filter(tx => tx.type === 'income').map(tx => tx.category));
  const expenseCategories = new Set(transactions.filter(tx => tx.type === 'expense').map(tx => tx.category));
  for (const category of CATS_IN) assert.ok(incomeCategories.has(category), `demo should exercise income category: ${category}`);
  for (const category of CATS_OUT) assert.ok(expenseCategories.has(category), `demo should exercise expense category: ${category}`);

  const jobIds = new Set(jobs.map(job => job.id));
  const clientIds = new Set(clients.map(client => client.id));
  const receiptIds = new Set(receipts.map(receipt => receipt.id));
  for (let index = 1; index <= 10; index += 1) {
    const featuredReceiptId = `rcpt_demo_${index}`;
    assert.ok(receiptIds.has(featuredReceiptId), `demo should include featured receipt ${featuredReceiptId}`);
    assert.ok(transactions.some(tx => tx.receiptId === featuredReceiptId), `featured receipt ${featuredReceiptId} should be linked to an expense`);
  }

  for (const job of jobs) {
    if (job.clientId) assert.ok(clientIds.has(job.clientId), `job ${job.id} should link to a real demo client`);
  }
  for (const record of [...transactions, ...invoices, ...estimates, ...mileageTrips]) {
    if (record.jobId) assert.ok(jobIds.has(record.jobId), `record should not reference a missing demo job: ${record.jobId}`);
  }
  for (const transaction of transactions) {
    if (transaction.receiptId) assert.ok(receiptIds.has(transaction.receiptId), `transaction should not reference a missing receipt: ${transaction.receiptId}`);
  }

  const currentYear = new Date().getFullYear();
  const currentYearExpenses = transactions.filter(tx => tx.type === 'expense' && new Date(tx.date).getFullYear() === currentYear);
  assert.ok(currentYearExpenses.length >= 50, 'current tax year should have enough expenses for meaningful tax/report demos');
  assert.equal(currentYearExpenses.filter(tx => !tx.receiptId).length, 2, 'Tax Prep demo should show exactly two deliberate missing receipts');
  assert.equal(currentYearExpenses.filter(tx => !tx.reviewedAt).length, 1, 'Tax Prep demo should show exactly one expense awaiting review');
  assert.equal(mileageTrips.filter(trip => !trip.purpose || trip.miles <= 0).length, 1, 'Tax Prep demo should show one incomplete mileage trip');

  const rows = buildJobProfitabilityRows({
    jobs,
    clients,
    transactions,
    invoices,
    estimates,
    mileageTrips,
    mileageRateCents: first.settings.mileageRateCents || 72.5,
    year: currentYear,
  });
  const bathroom = rows.find(row => row.job.id === 'job_demo_1');
  assert.ok(bathroom, 'bathroom demo job should exist in Job Profitability');
  assert.equal(bathroom?.revenue, 6850);
  assert.equal(bathroom?.expenses, 2310);
  assert.equal(bathroom?.actualLaborHours, 30);
  assert.equal(bathroom?.actualLaborCost, 1050);
  assert.equal(bathroom?.totalActualCost, 3360);
  assert.equal(bathroom?.estimatedProfit, 3490);
  assert.equal(bathroom?.budgetProfit, 3420);
  assert.equal(bathroom?.profitVariance, 70);
  assert.ok(Math.abs((bathroom?.miles || 0) - 84.6) < 0.001, 'bathroom demo job should show 84.6 business miles');

  const lawn = rows.find(row => row.job.id === 'job_demo_3');
  assert.ok(lawn, 'lawn-care demo job should exist');
  assert.ok((lawn?.marginPct || 0) < 15, 'demo should include a visibly weak-margin job for the job-costing story');
  const completed = rows.find(row => row.job.id === 'job_demo_4');
  assert.equal(completed?.job.status, 'completed', 'demo should include a completed job for closeout');
  assert.ok((completed?.actualLaborHours || 0) > 0, 'completed demo job should include actual labor time');

  // Historical density must not pollute the intentionally simple current-month
  // Goals example used on Home.
  const goals = buildMonthlyGoalProgress(transactions, first.settings.monthlyRevenueGoal, first.settings.monthlyProfitGoal, new Date());
  assert.equal(goals.revenue, 9850, 'demo monthly revenue should stay stable and meaningful');
  assert.ok(Math.abs(goals.profit - 7447.2) < 0.001, 'demo monthly profit should stay stable and meaningful');
  assert.equal(goals.hasRevenueGoal, true);
  assert.equal(goals.hasProfitGoal, true);
}
