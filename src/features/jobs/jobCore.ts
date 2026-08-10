import type { Client, Estimate, Invoice, Job, MileageTrip, Transaction } from '../../../types';

export type JobProfitabilityRow = {
  job: Job;
  clientName: string;
  invoiced: number;
  directIncome: number;
  revenue: number;
  collected: number;
  outstanding: number;
  expenses: number;
  estimatedProfit: number;
  marginPct: number;
  miles: number;
  mileageDeduction: number;
  estimateValue: number;
  acceptedEstimateValue: number;
  invoiceCount: number;
  expenseCount: number;
  mileageCount: number;
};

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
        createdAt: src.createdAt ? String(src.createdAt) : now,
        updatedAt: src.updatedAt ? String(src.updatedAt) : now,
      } as Job;
    });
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

    const invoiced = jobInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const directIncome = directIncomeTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const revenue = invoiced + directIncome;
    const collectedInvoices = jobInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const collected = collectedInvoices + directIncome;
    const outstanding = jobInvoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const expenses = expenseTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const estimatedProfit = revenue - expenses;
    const marginPct = revenue > 0 ? (estimatedProfit / revenue) * 100 : 0;
    const miles = jobMileage.reduce((sum, trip) => sum + Number(trip.miles || 0), 0);
    const estimateValue = jobEstimates.reduce((sum, est) => sum + Number(est.amount || 0), 0);
    const acceptedEstimateValue = jobEstimates.filter(est => est.status === 'accepted').reduce((sum, est) => sum + Number(est.amount || 0), 0);
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
      estimatedProfit,
      marginPct,
      miles,
      mileageDeduction: miles * mileageRate,
      estimateValue,
      acceptedEstimateValue,
      invoiceCount: jobInvoices.length,
      expenseCount: expenseTransactions.length,
      mileageCount: jobMileage.length,
    };
  });
}
