import type { Client, Estimate, Invoice, Job, MileageTrip, Receipt, Transaction } from '../../../types';

export type GlobalSearchKind = 'transaction' | 'invoice' | 'estimate' | 'client' | 'job' | 'mileage' | 'receipt';
export type GlobalSearchTone = 'income' | 'expense' | 'invoice' | 'estimate' | 'client' | 'job' | 'mileage' | 'receipt';

export interface GlobalSearchResult {
  key: string;
  id: string;
  kind: GlobalSearchKind;
  tone: GlobalSearchTone;
  title: string;
  subtitle: string;
  detail?: string;
}

export interface GlobalSearchGroup {
  id: GlobalSearchKind;
  label: string;
  results: GlobalSearchResult[];
}

interface BuildGlobalSearchGroupsInput {
  query: string;
  transactions: Transaction[];
  invoices: Invoice[];
  estimates: Estimate[];
  clients: Client[];
  jobs: Job[];
  mileageTrips: MileageTrip[];
  receipts: Receipt[];
  formatCurrency: (value: number) => string;
}

const displayDate = (value?: string) => {
  if (!value) return '';
  const iso = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const dateSearchValues = (value?: string) => {
  if (!value) return [];
  const displayed = displayDate(value);
  const date = new Date(String(value).match(/^\d{4}-\d{2}-\d{2}/) ? `${String(value).slice(0, 10)}T12:00:00` : value);
  const longDate = Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return [value, displayed, longDate];
};

const amountSearchValues = (value: number | undefined, formatCurrency: (value: number) => string) => {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return [];
  return [String(n), n.toFixed(2), formatCurrency(n)];
};

const makeMatcher = (query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  const compactQuery = normalizedQuery.replace(/[^a-z0-9]/g, '');

  return (values: Array<unknown>) => {
    const corpus = values
      .flatMap((value) => Array.isArray(value) ? value : [value])
      .filter((value) => value !== undefined && value !== null && value !== '')
      .map((value) => String(value))
      .join(' ')
      .toLowerCase();

    if (corpus.includes(normalizedQuery)) return true;
    if (compactQuery.length < 2) return false;
    return corpus.replace(/[^a-z0-9]/g, '').includes(compactQuery);
  };
};

const byDateDesc = (a: { date?: string }, b: { date?: string }) =>
  new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();

export const buildGlobalSearchGroups = ({
  query,
  transactions,
  invoices,
  estimates,
  clients,
  jobs,
  mileageTrips,
  receipts,
  formatCurrency,
}: BuildGlobalSearchGroupsInput): GlobalSearchGroup[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) return [];

  const matches = makeMatcher(normalizedQuery);

  const transactionResults: GlobalSearchResult[] = [...transactions]
    .sort(byDateDesc)
    .filter((transaction) => matches([
      transaction.name,
      transaction.category,
      transaction.notes,
      amountSearchValues(transaction.amount, formatCurrency),
      dateSearchValues(transaction.date),
    ]))
    .map((transaction) => ({
      key: `transaction:${transaction.id}`,
      id: transaction.id,
      kind: 'transaction',
      tone: transaction.type === 'income' ? 'income' : 'expense',
      title: transaction.name || transaction.category || (transaction.type === 'income' ? 'Income' : 'Expense'),
      subtitle: `${transaction.type === 'income' ? 'Income' : 'Expense'} • ${transaction.category || 'Uncategorized'} • ${formatCurrency(transaction.amount)} • ${displayDate(transaction.date)}`,
      detail: transaction.notes && matches([transaction.notes]) ? `Notes: ${transaction.notes}` : undefined,
    }));

  const invoiceResults: GlobalSearchResult[] = [...invoices]
    .sort(byDateDesc)
    .filter((invoice) => matches([
      invoice.number,
      invoice.client,
      invoice.clientCompany,
      invoice.clientAddress,
      invoice.clientEmail,
      invoice.category,
      invoice.description,
      invoice.notes,
      invoice.terms,
      invoice.poNumber,
      invoice.status,
      invoice.payMethod,
      invoice.items?.map((item) => item.description),
      amountSearchValues(invoice.amount, formatCurrency),
      dateSearchValues(invoice.date),
      dateSearchValues(invoice.due),
    ]))
    .map((invoice) => {
      const matchingItem = invoice.items?.find((item) => item.description && matches([item.description]));
      const detail = matchingItem?.description
        ? `Line item: ${matchingItem.description}`
        : invoice.description && matches([invoice.description])
          ? `Description: ${invoice.description}`
          : invoice.notes && matches([invoice.notes])
            ? `Notes: ${invoice.notes}`
            : invoice.poNumber && matches([invoice.poNumber])
              ? `PO / reference: ${invoice.poNumber}`
              : invoice.category && matches([invoice.category])
                ? `Category: ${invoice.category}`
                : invoice.clientEmail && matches([invoice.clientEmail])
                  ? `Email: ${invoice.clientEmail}`
                  : undefined;
      return {
        key: `invoice:${invoice.id}`,
        id: invoice.id,
        kind: 'invoice',
        tone: 'invoice',
        title: invoice.number ? `Invoice ${invoice.number}${invoice.client ? ` — ${invoice.client}` : ''}` : `Invoice — ${invoice.client || 'No client'}`,
        subtitle: `${formatCurrency(invoice.amount)} • ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)} • Due ${displayDate(invoice.due)}`,
        detail,
      };
    });

  const estimateResults: GlobalSearchResult[] = [...estimates]
    .sort(byDateDesc)
    .filter((estimate) => matches([
      estimate.number,
      estimate.client,
      estimate.clientCompany,
      estimate.clientAddress,
      estimate.clientEmail,
      estimate.clientPhone,
      estimate.projectTitle,
      estimate.scopeOfWork,
      estimate.timeline,
      estimate.exclusions,
      estimate.category,
      estimate.description,
      estimate.notes,
      estimate.terms,
      estimate.acceptanceTerms,
      estimate.poNumber,
      estimate.status,
      estimate.items?.map((item) => item.description),
      amountSearchValues(estimate.amount, formatCurrency),
      dateSearchValues(estimate.date),
      dateSearchValues(estimate.validUntil),
      dateSearchValues(estimate.followUpDate),
    ]))
    .map((estimate) => {
      const matchingItem = estimate.items?.find((item) => item.description && matches([item.description]));
      const detail = matchingItem?.description
        ? `Line item: ${matchingItem.description}`
        : estimate.scopeOfWork && matches([estimate.scopeOfWork])
          ? `Scope: ${estimate.scopeOfWork}`
          : estimate.description && matches([estimate.description])
            ? `Description: ${estimate.description}`
            : estimate.notes && matches([estimate.notes])
              ? `Notes: ${estimate.notes}`
              : estimate.poNumber && matches([estimate.poNumber])
                ? `PO / reference: ${estimate.poNumber}`
                : estimate.clientEmail && matches([estimate.clientEmail])
                  ? `Email: ${estimate.clientEmail}`
                  : estimate.clientPhone && matches([estimate.clientPhone])
                    ? `Phone: ${estimate.clientPhone}`
                    : undefined;
      return {
        key: `estimate:${estimate.id}`,
        id: estimate.id,
        kind: 'estimate',
        tone: 'estimate',
        title: estimate.number
          ? `Estimate ${estimate.number}${estimate.projectTitle ? ` — ${estimate.projectTitle}` : estimate.client ? ` — ${estimate.client}` : ''}`
          : `Estimate — ${estimate.projectTitle || estimate.client || 'No client'}`,
        subtitle: `${estimate.client || estimate.clientCompany || 'No client'} • ${formatCurrency(estimate.amount)} • ${estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)} • Valid until ${displayDate(estimate.validUntil)}`,
        detail,
      };
    });

  const clientResults: GlobalSearchResult[] = [...clients]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
    .filter((client) => matches([
      client.name,
      client.company,
      client.email,
      client.phone,
      client.address,
      client.notes,
      client.status,
    ]))
    .map((client) => ({
      key: `client:${client.id}`,
      id: client.id,
      kind: 'client',
      tone: 'client',
      title: client.name || client.company || 'Client',
      subtitle: [client.company, client.email, client.phone].filter(Boolean).join(' • ') || `${client.status.charAt(0).toUpperCase() + client.status.slice(1)} client`,
      detail: client.notes && matches([client.notes])
        ? `Notes: ${client.notes}`
        : client.address && matches([client.address])
          ? `Address: ${client.address}`
          : undefined,
    }));

  const clientById = new Map(clients.map(client => [client.id, client] as const));
  const jobResults: GlobalSearchResult[] = [...jobs]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
    .filter(job => {
      const client = job.clientId ? clientById.get(job.clientId) : undefined;
      return matches([
        job.title,
        job.description,
        job.status,
        job.clientName,
        client?.name,
        client?.company,
        dateSearchValues(job.startDate),
        dateSearchValues(job.endDate),
      ]);
    })
    .map(job => {
      const client = job.clientId ? clientById.get(job.clientId) : undefined;
      const clientName = client?.name || client?.company || job.clientName || 'No client';
      return {
        key: `job:${job.id}`,
        id: job.id,
        kind: 'job',
        tone: 'job',
        title: job.title,
        subtitle: `${clientName} • ${job.status.charAt(0).toUpperCase() + job.status.slice(1)}${job.startDate ? ` • Started ${displayDate(job.startDate)}` : ''}`,
        detail: job.description && matches([job.description]) ? `Scope: ${job.description}` : undefined,
      };
    });

  const mileageResults: GlobalSearchResult[] = [...mileageTrips]
    .sort(byDateDesc)
    .filter((trip) => matches([
      trip.purpose,
      trip.client,
      trip.notes,
      trip.miles,
      `${trip.miles} miles`,
      dateSearchValues(trip.date),
    ]))
    .map((trip) => ({
      key: `mileage:${trip.id}`,
      id: trip.id,
      kind: 'mileage',
      tone: 'mileage',
      title: trip.purpose || 'Mileage trip',
      subtitle: `${trip.client ? `${trip.client} • ` : ''}${trip.miles} miles • ${displayDate(trip.date)}`,
      detail: trip.notes && matches([trip.notes]) ? `Notes: ${trip.notes}` : undefined,
    }));

  const transactionByReceiptId = new Map(
    transactions
      .filter((transaction) => transaction.receiptId)
      .map((transaction) => [String(transaction.receiptId), transaction] as const)
  );
  const receiptResults: GlobalSearchResult[] = [...receipts]
    .sort(byDateDesc)
    .filter((receipt) => {
      const linkedTransaction = transactionByReceiptId.get(String(receipt.id));
      return matches([
        receipt.note,
        dateSearchValues(receipt.date),
        linkedTransaction?.name,
        linkedTransaction?.category,
        linkedTransaction?.notes,
        linkedTransaction ? amountSearchValues(linkedTransaction.amount, formatCurrency) : [],
      ]);
    })
    .map((receipt) => {
      const linkedTransaction = transactionByReceiptId.get(String(receipt.id));
      return {
        key: `receipt:${receipt.id}`,
        id: receipt.id,
        kind: 'receipt',
        tone: 'receipt',
        title: receipt.note?.trim() || linkedTransaction?.name || 'Receipt',
        subtitle: `Receipt • ${displayDate(receipt.date)}${linkedTransaction ? ` • ${linkedTransaction.name} • ${formatCurrency(linkedTransaction.amount)}` : ''}`,
        detail: linkedTransaction?.notes && matches([linkedTransaction.notes])
          ? `Linked expense notes: ${linkedTransaction.notes}`
          : linkedTransaction?.category && matches([linkedTransaction.category])
            ? `Linked expense category: ${linkedTransaction.category}`
            : undefined,
      };
    });

  return [
    { id: 'transaction', label: 'Transactions', results: transactionResults },
    { id: 'invoice', label: 'Invoices', results: invoiceResults },
    { id: 'estimate', label: 'Estimates', results: estimateResults },
    { id: 'client', label: 'Clients', results: clientResults },
    { id: 'job', label: 'Jobs / Projects', results: jobResults },
    { id: 'mileage', label: 'Mileage', results: mileageResults },
    { id: 'receipt', label: 'Receipts', results: receiptResults },
  ];
};
