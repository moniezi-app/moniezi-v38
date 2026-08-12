import type { Client, Estimate, Invoice, Job, JobTimeEntry, MileageTrip, Transaction } from '../../../types';

export type JobProfitabilityRow = {
  job: Job;
  clientName: string;
  invoiced: number;
  directIncome: number;
  revenue: number;
  collected: number;
  outstanding: number;

  // Recorded expense transactions linked to the job.
  expenses: number;
  materialsExpenses: number;
  subcontractorExpenses: number;
  otherExpenses: number;

  // Internal labor tracking (kept separate from cash expenses).
  actualLaborHours: number;
  actualLaborCost: number;
  totalActualCost: number;

  estimatedProfit: number;
  marginPct: number;
  cashPosition: number;

  // Budget / expected baseline.
  hasBudget: boolean;
  budgetRevenue: number;
  budgetMaterials: number;
  budgetLaborHours: number;
  budgetLaborRate: number;
  budgetLaborCost: number;
  budgetSubcontractors: number;
  budgetOtherCosts: number;
  budgetTotalCost: number;
  budgetProfit: number;
  budgetMarginPct: number;
  revenueVariance: number;
  costVariance: number;
  profitVariance: number;
  laborHoursVariance: number;

  miles: number;
  mileageDeduction: number;
  estimateValue: number;
  acceptedEstimateValue: number;
  invoiceCount: number;
  expenseCount: number;
  mileageCount: number;
  timeEntryCount: number;
};

export type JobActivityRow = {
  kind: 'invoice' | 'estimate' | 'income' | 'expense' | 'mileage' | 'labor';
  id: string;
  date: string;
  title: string;
  detail: string;
  amount?: number;
  status?: string;
};

const finiteNonNegative = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const optionalFiniteNonNegative = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function normalizeJobTimeEntries(raw: unknown): JobTimeEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(entry => entry && typeof entry === 'object')
    .map((entry, index) => {
      const src = entry as any;
      return {
        id: String(src.id || `legacy_time_${index + 1}`),
        date: String(src.date || new Date().toISOString().split('T')[0]),
        hours: finiteNonNegative(src.hours),
        costRate: finiteNonNegative(src.costRate),
        worker: src.worker ? String(src.worker) : undefined,
        description: src.description ? String(src.description) : undefined,
      } satisfies JobTimeEntry;
    })
    .filter(entry => entry.hours > 0);
}

export function buildJobActivityRows(input: {
  jobId: string;
  job?: Job;
  transactions: Transaction[];
  invoices: Invoice[];
  estimates: Estimate[];
  mileageTrips: MileageTrip[];
}): JobActivityRow[] {
  const { jobId, job, transactions, invoices, estimates, mileageTrips } = input;
  const linkedInvoicePaymentIds = new Set(
    invoices
      .filter(invoice => invoice.jobId === jobId)
      .map(invoice => invoice.linkedTransactionId)
      .filter((id): id is string => Boolean(id)),
  );

  const invoiceRows: JobActivityRow[] = invoices
    .filter(invoice => invoice.jobId === jobId)
    .map(invoice => ({
      kind: 'invoice',
      id: invoice.id,
      date: invoice.date,
      title: invoice.number ? `Invoice ${invoice.number}` : 'Invoice',
      detail: invoice.description || invoice.client || 'Invoice',
      amount: Number(invoice.amount || 0),
      status: invoice.status,
    }));

  const estimateRows: JobActivityRow[] = estimates
    .filter(estimate => estimate.jobId === jobId)
    .map(estimate => ({
      kind: 'estimate',
      id: estimate.id,
      date: estimate.date,
      title: estimate.number ? `Estimate ${estimate.number}` : 'Estimate',
      detail: estimate.projectTitle || estimate.description || estimate.client || 'Estimate',
      amount: Number(estimate.amount || 0),
      status: estimate.status,
    }));

  const transactionRows: JobActivityRow[] = transactions
    .filter(transaction => transaction.jobId === jobId)
    .filter(transaction => !(transaction.type === 'income' && linkedInvoicePaymentIds.has(transaction.id)))
    .map(transaction => ({
      kind: transaction.type,
      id: transaction.id,
      date: transaction.date,
      title: transaction.name || (transaction.type === 'income' ? 'Income' : 'Expense'),
      detail: transaction.category || (transaction.type === 'income' ? 'Income' : 'Expense'),
      amount: Number(transaction.amount || 0),
      status: transaction.type,
    }));

  const mileageRows: JobActivityRow[] = mileageTrips
    .filter(trip => trip.jobId === jobId)
    .map(trip => ({
      kind: 'mileage',
      id: trip.id,
      date: trip.date,
      title: trip.purpose || 'Business mileage',
      detail: `${Number(trip.miles || 0).toFixed(1)} mi${trip.client ? ` · ${trip.client}` : ''}`,
      status: 'mileage',
    }));

  const laborRows: JobActivityRow[] = normalizeJobTimeEntries(job?.timeEntries)
    .map(entry => ({
      kind: 'labor',
      id: entry.id,
      date: entry.date,
      title: entry.description || 'Labor time',
      detail: `${entry.hours.toFixed(1)} hr${entry.worker ? ` · ${entry.worker}` : ''} · $${entry.costRate.toFixed(2)}/hr internal cost`,
      amount: entry.hours * entry.costRate,
      status: 'labor',
    }));

  const kindRank: Record<JobActivityRow['kind'], number> = { invoice: 0, estimate: 1, income: 2, expense: 3, labor: 4, mileage: 5 };
  return [...invoiceRows, ...estimateRows, ...transactionRows, ...laborRows, ...mileageRows]
    .sort((a, b) => b.date.localeCompare(a.date) || kindRank[a.kind] - kindRank[b.kind]);
}

const inYear = (dateValue: string | undefined, year?: number) => {
  if (!year) return true;
  if (!dateValue) return false;
  const date = new Date(dateValue);
  return !Number.isNaN(date.getTime()) && date.getFullYear() === year;
};

export function normalizeJobs(raw: unknown): Job[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(item => item && typeof item === 'object' && String((item as any).id || '').trim() && String((item as any).title || '').trim())
    .map(item => {
      const src = item as any;
      const now = new Date().toISOString();
      const status = src.status === 'completed' || src.status === 'archived' ? src.status : 'active';
      return {
        id: String(src.id),
        title: String(src.title).trim(),
        clientId: src.clientId ? String(src.clientId) : undefined,
        clientName: src.clientName ? String(src.clientName) : undefined,
        description: src.description ? String(src.description) : undefined,
        status,
        startDate: src.startDate ? String(src.startDate) : undefined,
        endDate: src.endDate ? String(src.endDate) : undefined,
        budgetRevenue: optionalFiniteNonNegative(src.budgetRevenue),
        budgetMaterials: optionalFiniteNonNegative(src.budgetMaterials),
        budgetLaborHours: optionalFiniteNonNegative(src.budgetLaborHours),
        budgetLaborRate: optionalFiniteNonNegative(src.budgetLaborRate),
        budgetSubcontractors: optionalFiniteNonNegative(src.budgetSubcontractors),
        budgetOtherCosts: optionalFiniteNonNegative(src.budgetOtherCosts),
        timeEntries: normalizeJobTimeEntries(src.timeEntries),
        createdAt: src.createdAt ? String(src.createdAt) : now,
        updatedAt: src.updatedAt ? String(src.updatedAt) : now,
      } as Job;
    });
}

const MATERIAL_CATEGORIES = new Set(['Equipment', 'Office Supplies', 'Shipping / Delivery']);
const SUBCONTRACTOR_CATEGORIES = new Set(['Contractors', 'Professional Services']);

export function classifyJobExpense(category: string | undefined): 'materials' | 'subcontractors' | 'other' {
  const normalized = String(category || '').trim();
  if (MATERIAL_CATEGORIES.has(normalized)) return 'materials';
  if (SUBCONTRACTOR_CATEGORIES.has(normalized)) return 'subcontractors';
  return 'other';
}

export function buildJobProfitabilityRows(input: {
  jobs: Job[];
  clients: Client[];
  transactions: Transaction[];
  invoices: Invoice[];
  estimates: Estimate[];
  mileageTrips: MileageTrip[];
  mileageRateCents: number;
  year?: number;
}): JobProfitabilityRow[] {
  const { jobs, clients, transactions, invoices, estimates, mileageTrips, mileageRateCents, year } = input;
  const clientMap = new Map(clients.map(client => [client.id, client] as const));
  const invoicePaymentTransactionIds = new Set(
    invoices.map(inv => inv.linkedTransactionId).filter((id): id is string => Boolean(id)),
  );
  const mileageRate = Math.max(0, Number(mileageRateCents || 0)) / 100;

  return jobs.map(job => {
    const jobInvoices = invoices.filter(inv => inv.jobId === job.id && inv.status !== 'void' && inYear(inv.date, year));
    const jobEstimates = estimates.filter(est => est.jobId === job.id && est.status !== 'void' && inYear(est.date, year));
    const jobTransactions = transactions.filter(tx => tx.jobId === job.id && inYear(tx.date, year));
    const directIncomeTransactions = jobTransactions.filter(tx => tx.type === 'income' && !invoicePaymentTransactionIds.has(tx.id));
    const expenseTransactions = jobTransactions.filter(tx => tx.type === 'expense');
    const jobMileage = mileageTrips.filter(trip => trip.jobId === job.id && inYear(trip.date, year));
    const timeEntries = normalizeJobTimeEntries(job.timeEntries).filter(entry => inYear(entry.date, year));

    const invoiced = jobInvoices.reduce((sum, inv) => sum + finiteNonNegative(inv.amount), 0);
    const directIncome = directIncomeTransactions.reduce((sum, tx) => sum + finiteNonNegative(tx.amount), 0);
    const revenue = invoiced + directIncome;
    const collectedInvoices = jobInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + finiteNonNegative(inv.amount), 0);
    const collected = collectedInvoices + directIncome;
    const outstanding = jobInvoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + finiteNonNegative(inv.amount), 0);

    let materialsExpenses = 0;
    let subcontractorExpenses = 0;
    let otherExpenses = 0;
    for (const tx of expenseTransactions) {
      const amount = finiteNonNegative(tx.amount);
      const bucket = classifyJobExpense(tx.category);
      if (bucket === 'materials') materialsExpenses += amount;
      else if (bucket === 'subcontractors') subcontractorExpenses += amount;
      else otherExpenses += amount;
    }
    const expenses = materialsExpenses + subcontractorExpenses + otherExpenses;

    const actualLaborHours = timeEntries.reduce((sum, entry) => sum + finiteNonNegative(entry.hours), 0);
    const actualLaborCost = timeEntries.reduce((sum, entry) => sum + finiteNonNegative(entry.hours) * finiteNonNegative(entry.costRate), 0);
    const totalActualCost = expenses + actualLaborCost;
    const estimatedProfit = revenue - totalActualCost;
    const marginPct = revenue > 0 ? (estimatedProfit / revenue) * 100 : 0;
    const cashPosition = collected - expenses;

    const miles = jobMileage.reduce((sum, trip) => sum + finiteNonNegative(trip.miles), 0);
    const estimateValue = jobEstimates.reduce((sum, est) => sum + finiteNonNegative(est.amount), 0);
    const acceptedEstimateValue = jobEstimates.filter(est => est.status === 'accepted').reduce((sum, est) => sum + finiteNonNegative(est.amount), 0);

    const hasBudget = [job.budgetRevenue, job.budgetMaterials, job.budgetLaborHours, job.budgetLaborRate, job.budgetSubcontractors, job.budgetOtherCosts]
      .some(value => optionalFiniteNonNegative(value) !== undefined && finiteNonNegative(value) > 0);
    const budgetRevenue = optionalFiniteNonNegative(job.budgetRevenue) ?? (acceptedEstimateValue > 0 ? acceptedEstimateValue : estimateValue);
    const budgetMaterials = finiteNonNegative(job.budgetMaterials);
    const budgetLaborHours = finiteNonNegative(job.budgetLaborHours);
    const budgetLaborRate = finiteNonNegative(job.budgetLaborRate);
    const budgetLaborCost = budgetLaborHours * budgetLaborRate;
    const budgetSubcontractors = finiteNonNegative(job.budgetSubcontractors);
    const budgetOtherCosts = finiteNonNegative(job.budgetOtherCosts);
    const budgetTotalCost = budgetMaterials + budgetLaborCost + budgetSubcontractors + budgetOtherCosts;
    const budgetProfit = budgetRevenue - budgetTotalCost;
    const budgetMarginPct = budgetRevenue > 0 ? (budgetProfit / budgetRevenue) * 100 : 0;

    const client = job.clientId ? clientMap.get(job.clientId) : undefined;

    return {
      job,
      clientName: client?.name || client?.company || job.clientName || 'No client',
      invoiced,
      directIncome,
      revenue,
      collected,
      outstanding,
      expenses,
      materialsExpenses,
      subcontractorExpenses,
      otherExpenses,
      actualLaborHours,
      actualLaborCost,
      totalActualCost,
      estimatedProfit,
      marginPct,
      cashPosition,
      hasBudget,
      budgetRevenue,
      budgetMaterials,
      budgetLaborHours,
      budgetLaborRate,
      budgetLaborCost,
      budgetSubcontractors,
      budgetOtherCosts,
      budgetTotalCost,
      budgetProfit,
      budgetMarginPct,
      revenueVariance: revenue - budgetRevenue,
      costVariance: totalActualCost - budgetTotalCost,
      profitVariance: estimatedProfit - budgetProfit,
      laborHoursVariance: actualLaborHours - budgetLaborHours,
      miles,
      mileageDeduction: miles * mileageRate,
      estimateValue,
      acceptedEstimateValue,
      invoiceCount: jobInvoices.length,
      expenseCount: expenseTransactions.length,
      mileageCount: jobMileage.length,
      timeEntryCount: timeEntries.length,
    };
  });
}
