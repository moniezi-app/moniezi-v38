import * as assert from 'node:assert/strict';
import type { Client, Estimate, Invoice, Job, MileageTrip, Transaction } from '../../types';
import { buildJobActivityRows, buildJobProfitabilityRows, normalizeJobs } from '../../src/features/jobs/jobCore';

export function runJobProfitabilityRegressionTests() {
  const jobs: Job[] = [{
    id: 'j1', title: 'Kitchen Repair', clientId: 'c1', status: 'active', createdAt: '2026-01-01', updatedAt: '2026-01-01',
    budgetRevenue: 3300, budgetMaterials: 700, budgetLaborHours: 8, budgetLaborRate: 40, budgetSubcontractors: 0, budgetOtherCosts: 100,
    timeEntries: [
      { id: 'time1', date: '2026-02-03', hours: 5, costRate: 40, worker: 'Owner', description: 'Installation' },
      { id: 'time2', date: '2026-02-04', hours: 4, costRate: 40, worker: 'Owner', description: 'Finish work' },
    ],
  }];
  const clients: Client[] = [{ id: 'c1', name: 'Smith', status: 'client', createdAt: '2026-01-01', updatedAt: '2026-01-01' }];
  const invoices: Invoice[] = [
    { id: 'i1', jobId: 'j1', clientId: 'c1', client: 'Smith', amount: 2800, category: 'Service', description: 'Work', date: '2026-02-01', due: '2026-02-15', status: 'paid', linkedTransactionId: 'pay1' },
    { id: 'i2', jobId: 'j1', clientId: 'c1', client: 'Smith', amount: 500, category: 'Service', description: 'Add-on', date: '2026-02-10', due: '2026-02-25', status: 'unpaid' },
  ];
  const transactions: Transaction[] = [
    { id: 'pay1', jobId: 'j1', date: '2026-02-01', name: 'Pmt: Smith', category: 'Service', amount: 2800, type: 'income' },
    { id: 'extra', jobId: 'j1', date: '2026-02-05', name: 'Cash add-on', category: 'Service', amount: 100, type: 'income' },
    { id: 'e1', jobId: 'j1', date: '2026-02-03', name: 'Materials', category: 'Equipment', amount: 740, type: 'expense' },
  ];
  const estimates: Estimate[] = [{ id: 'est1', jobId: 'j1', client: 'Smith', amount: 3300, category: 'Service', description: 'Quote', date: '2026-01-20', validUntil: '2026-02-20', status: 'accepted' }];
  const mileageTrips: MileageTrip[] = [{ id: 'm1', jobId: 'j1', date: '2026-02-03', miles: 100, purpose: 'Job site', client: 'Smith' }];

  const [row] = buildJobProfitabilityRows({ jobs, clients, transactions, invoices, estimates, mileageTrips, mileageRateCents: 72.5, year: 2026 });
  assert.equal(row.revenue, 3400, 'invoice payment transaction must not double-count invoice revenue');
  assert.equal(row.collected, 2900);
  assert.equal(row.outstanding, 500);
  assert.equal(row.expenses, 740);
  assert.equal(row.materialsExpenses, 740);
  assert.equal(row.actualLaborHours, 9);
  assert.equal(row.actualLaborCost, 360);
  assert.equal(row.totalActualCost, 1100);
  assert.equal(row.estimatedProfit, 2300);
  assert.equal(row.cashPosition, 2160, 'cash position excludes internal labor cost');
  assert.equal(row.budgetTotalCost, 1120);
  assert.equal(row.budgetProfit, 2180);
  assert.equal(row.profitVariance, 120);
  assert.equal(row.laborHoursVariance, 1);
  assert.equal(row.miles, 100);
  assert.equal(row.mileageDeduction, 72.5);
  assert.equal(row.acceptedEstimateValue, 3300);

  const activity = buildJobActivityRows({ jobId: 'j1', job: jobs[0], transactions, invoices, estimates, mileageTrips });
  assert.equal(activity.some(item => item.id === 'pay1'), false, 'invoice payment transaction should not duplicate the linked invoice in job activity');
  assert.equal(activity.filter(item => item.kind === 'invoice').length, 2);
  assert.equal(activity.filter(item => item.kind === 'estimate').length, 1);
  assert.equal(activity.filter(item => item.kind === 'expense').length, 1);
  assert.equal(activity.filter(item => item.kind === 'income').length, 1);
  assert.equal(activity.filter(item => item.kind === 'labor').length, 2);
  assert.equal(activity.filter(item => item.kind === 'mileage').length, 1);
  assert.equal(activity[0].date >= activity[activity.length - 1].date, true, 'job activity should be newest first');

  const [normalized] = normalizeJobs([{ id: 'legacy', title: 'Legacy Job', status: 'active', timeEntries: [{ id: 't', date: '2026-01-01', hours: '2.5', costRate: '30' }] }]);
  assert.equal(normalized.timeEntries?.[0].hours, 2.5, 'job normalization should preserve/clean labor time entries');
  assert.equal(normalized.timeEntries?.[0].costRate, 30);
}
