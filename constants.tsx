

export const CATS_IN = [
  "Sales / Services",
  "Consulting / Freelance",
  "Product Sales",
  "Affiliate / Referral",
  "Interest / Bank",
  "Refunds",
  "Other Income"
];

export const CATS_OUT = [
  "Advertising / Marketing",
  "Software / SaaS",
  "Rent / Workspace",
  "Utilities",
  "Office Supplies",
  "Phone / Internet",
  "Travel",
  "Meals (Business)",
  "Professional Services",
  "Insurance",
  "Contractors",
  "Payroll",
  "Taxes & Licenses",
  "Equipment",
  "Shipping / Delivery",
  "Bank Fees",
  "Other Expense"
];

export const CATS_BILLING = [
  "Web Development",
  "Graphic Design",
  "Strategy Consulting",
  "Content Writing",
  "Digital Marketing",
  "Maintenance Retainer",
  "Software Licensing",
  "Project Milestone",
  "Training / Workshop",
  "Other Service"
];

export const DEFAULT_PAY_PREFS = [
  "Card", "Bank Transfer", "Cash", "PayPal", "Stripe", "Zelle", "Venmo", "Wise"
];

/**
 * Storage is scoped to the ORIGIN, not the folder. Two builds served from the
 * same github.io origin therefore share one database even with different PWA
 * manifest ids — loading demo data in one would wipe the other. Suffixing the
 * major version keeps parallel installs genuinely independent.
 */
export const STORAGE_NAMESPACE = "v38";
export const DB_KEY = `moniezi_core_data_v1_${STORAGE_NAMESPACE}`;

// --- Tax Constants (2025 Estimates) ---
export const TAX_CONSTANTS = {
  // Estimated 2025 Standard Deductions
  STD_DEDUCTION_SINGLE: 15000, 
  STD_DEDUCTION_JOINT: 30000,
  STD_DEDUCTION_HEAD: 22500,
  // Self Employment Tax (Social Security 12.4% + Medicare 2.9%)
  SE_TAX_RATE: 0.153,
  // Only 92.35% of net earnings are subject to SE tax
  SE_TAXABLE_PORTION: 0.9235 
};

// --- Tax Planner Constants (2026 Estimates) ---
export const TAX_PLANNER_2026 = {
  STD_DEDUCTION_SINGLE: 16100,
  STD_DEDUCTION_JOINT: 32200,
  STD_DEDUCTION_HEAD: 24150,
  SE_TAX_RATE: 0.153
};

// --- Demo Data Generator ---
// v38.0.16: one curated, deterministic commercial demo. The records are
// intentionally connected so Home, Jobs, Reports, Tax Prep, Goals, invoices,
// estimates, mileage and receipts all tell the same business story.
export const getFreshDemoData = () => {
  const anchor = new Date();
  anchor.setHours(12, 0, 0, 0);

  const iso = (date: Date) => date.toISOString().split('T')[0];
  const addDays = (days: number) => {
    const date = new Date(anchor);
    date.setDate(date.getDate() + days);
    return iso(date);
  };
  const currentMonthPast = (daysBack: number) => {
    const day = Math.max(1, anchor.getDate() - daysBack);
    return iso(new Date(anchor.getFullYear(), anchor.getMonth(), day, 12));
  };
  const monthDate = (monthOffset: number, preferredDay: number) => {
    const year = anchor.getFullYear();
    const month = anchor.getMonth() + monthOffset;
    const lastDay = new Date(year, month + 1, 0).getDate();
    return iso(new Date(year, month, Math.min(preferredDay, lastDay), 12));
  };
  const yearDate = (year: number, monthIndex: number, preferredDay: number) => {
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    return iso(new Date(year, monthIndex, Math.min(preferredDay, lastDay), 12));
  };
  const reviewedAt = (date: string) => `${date}T12:00:00.000Z`;

  const currentYear = anchor.getFullYear();
  const previousYear = currentYear - 1;
  const today = iso(anchor);

  const clients = [
    {
      id: 'cli_demo_1', name: 'Kenny Barria', company: 'KB Landscaping',
      email: 'kenny@kblandscaping.com', phone: '(305) 555-0198',
      address: '12 Palm St, Miami, FL 33101', status: 'client' as const,
      createdAt: addDays(-180), updatedAt: addDays(-2),
      notes: 'Monthly property-maintenance client. Prefers text follow-ups.'
    },
    {
      id: 'cli_demo_2', name: 'Sophia Stanley', company: 'Stanley Studio',
      email: 'sophia@stanleystudio.co', phone: '(512) 555-0234',
      address: '88 Market Ave, Suite 200, Austin, TX 78701', status: 'client' as const,
      createdAt: addDays(-220), updatedAt: addDays(-8),
      notes: 'Branding client with a completed project.'
    },
    {
      id: 'cli_demo_3', name: 'Jimmy Wilson', company: 'Wilson Renovations',
      email: 'jimmy@wilsonreno.com', phone: '(619) 555-0142',
      address: '5 Harbor Rd, San Diego, CA 92101', status: 'client' as const,
      createdAt: addDays(-320), updatedAt: addDays(-1),
      notes: 'Repeat customer. Active bathroom renovation.'
    },
    {
      id: 'cli_demo_4', name: 'Maria Chen', company: 'Chen Tech Solutions',
      email: 'maria@chentech.io', phone: '(415) 555-0321',
      address: '500 Tech Blvd, San Francisco, CA 94107', status: 'client' as const,
      createdAt: addDays(-140), updatedAt: addDays(-1),
      notes: 'Office refresh in progress. Invoice is overdue.'
    },
    {
      id: 'cli_demo_5', name: 'Omar Hassan', company: 'OH Auto Detailing',
      email: 'omar@ohdetailing.com', phone: '(813) 555-0284',
      address: '9 River Dr, Tampa, FL 33602', status: 'lead' as const,
      createdAt: addDays(-35), updatedAt: addDays(-3),
      notes: 'New lead. Draft estimate still needs to be finished.'
    },
  ];

  const jobs = [
    {
      id: 'job_demo_1', title: 'Master Bathroom Renovation', clientId: 'cli_demo_3', clientName: 'Jimmy Wilson',
      description: 'Complete master-bath renovation with fixtures, plumbing and finish work.', status: 'active' as const,
      startDate: addDays(-21), createdAt: addDays(-28), updatedAt: addDays(-2),
    },
    {
      id: 'job_demo_2', title: 'Chen Tech Office Refresh', clientId: 'cli_demo_4', clientName: 'Maria Chen',
      description: 'Office refresh, hardware installation and client-space improvements.', status: 'active' as const,
      startDate: addDays(-14), createdAt: addDays(-18), updatedAt: addDays(-1),
    },
    {
      id: 'job_demo_3', title: 'KB Monthly Lawn Care', clientId: 'cli_demo_1', clientName: 'Kenny Barria',
      description: 'Monthly lawn-care package with four scheduled visits.', status: 'active' as const,
      startDate: addDays(-40), createdAt: addDays(-45), updatedAt: addDays(-4),
    },
    {
      id: 'job_demo_4', title: 'Stanley Brand Identity', clientId: 'cli_demo_2', clientName: 'Sophia Stanley',
      description: 'Brand identity system including logo, palette and final brand guide.', status: 'completed' as const,
      startDate: addDays(-58), endDate: addDays(-23), createdAt: addDays(-64), updatedAt: addDays(-23),
    },
  ];

  const estimates = [
    {
      id: 'est_demo_1', number: 'EST-0101', clientId: 'cli_demo_3', jobId: 'job_demo_1',
      client: 'Jimmy Wilson', clientCompany: 'Wilson Renovations', clientEmail: 'jimmy@wilsonreno.com', clientPhone: '(619) 555-0142', clientAddress: '5 Harbor Rd, San Diego, CA 92101',
      projectTitle: 'Master Bathroom Complete Renovation', category: 'Other Service', description: 'Complete master-bath renovation',
      scopeOfWork: 'Demolition, plumbing preparation, fixture installation, finish hardware and final walkthrough.', timeline: '5–7 business days',
      exclusions: 'Tile replacement, electrical modifications and permit fees are excluded.', acceptanceTerms: 'Reply APPROVED or sign and return.',
      date: addDays(-26), validUntil: addDays(4), status: 'accepted' as const, sentAt: addDays(-24), lastFollowUp: addDays(-21),
      items: [
        { id: 'est1_labor', description: 'Skilled labor', quantity: 32, rate: 95 },
        { id: 'est1_fixture', description: 'Vanity, fixtures and toilet', quantity: 1, rate: 2450 },
        { id: 'est1_plumbing', description: 'Plumbing materials', quantity: 1, rate: 820 },
        { id: 'est1_finish', description: 'Finish hardware and supplies', quantity: 1, rate: 540 },
      ],
      subtotal: 6850, discount: 0, taxRate: 0, shipping: 0, amount: 6850,
      notes: 'Accepted and converted to invoice.', terms: '50% to schedule, balance on completion.'
    },
    {
      id: 'est_demo_2', number: 'EST-0102', clientId: 'cli_demo_4', jobId: 'job_demo_2',
      client: 'Maria Chen', clientCompany: 'Chen Tech Solutions', clientEmail: 'maria@chentech.io', clientPhone: '(415) 555-0321', clientAddress: '500 Tech Blvd, San Francisco, CA 94107',
      projectTitle: 'Office Refresh & Hardware Installation', category: 'Other Service', description: 'Office refresh and hardware installation',
      scopeOfWork: 'Refresh work areas, install hardware and complete punch-list items.', timeline: '3–4 business days',
      date: addDays(-20), validUntil: addDays(8), status: 'accepted' as const, sentAt: addDays(-19),
      items: [
        { id: 'est2_labor', description: 'Installation labor', quantity: 16, rate: 110 },
        { id: 'est2_materials', description: 'Hardware and materials', quantity: 1, rate: 1640 },
      ],
      subtotal: 3400, discount: 0, taxRate: 0, shipping: 0, amount: 3400,
      notes: 'Accepted. Work is in progress.', terms: 'Net 15 after invoicing.'
    },
    {
      id: 'est_demo_3', number: 'EST-0103', clientId: 'cli_demo_1', jobId: 'job_demo_3',
      client: 'Kenny Barria', clientCompany: 'KB Landscaping', clientEmail: 'kenny@kblandscaping.com', clientPhone: '(305) 555-0198', clientAddress: '12 Palm St, Miami, FL 33101',
      projectTitle: 'Monthly Lawn Care Package', category: 'Other Service', description: 'Four monthly lawn-care visits',
      scopeOfWork: 'Mowing, edging, blowing, hedge trim and monthly weed-control treatment.', timeline: 'Ongoing monthly service',
      date: addDays(-8), validUntil: addDays(6), status: 'sent' as const, sentAt: addDays(-7), followUpDate: today, followUpCount: 0,
      items: [
        { id: 'est3_visits', description: 'Weekly lawn service', quantity: 4, rate: 95 },
        { id: 'est3_trim', description: 'Hedge trim and weed treatment', quantity: 1, rate: 120 },
      ],
      subtotal: 500, discount: 0, taxRate: 0, shipping: 0, amount: 500,
      notes: 'Follow-up is due today.', terms: 'Monthly billing, Net 7.'
    },
    {
      id: 'est_demo_4', number: 'EST-0104', clientId: 'cli_demo_2', jobId: 'job_demo_4',
      client: 'Sophia Stanley', clientCompany: 'Stanley Studio', clientEmail: 'sophia@stanleystudio.co', clientPhone: '(512) 555-0234', clientAddress: '88 Market Ave, Suite 200, Austin, TX 78701',
      projectTitle: 'Complete Brand Identity System', category: 'Graphic Design', description: 'Brand identity system',
      scopeOfWork: 'Discovery, logo concepts, revisions, color system, typography and final brand guide.', timeline: '3 weeks',
      date: addDays(-58), validUntil: addDays(-30), status: 'accepted' as const, sentAt: addDays(-56),
      items: [
        { id: 'est4_discovery', description: 'Discovery and visual direction', quantity: 1, rate: 600 },
        { id: 'est4_design', description: 'Logo and identity design', quantity: 1, rate: 1200 },
        { id: 'est4_guide', description: 'Brand guide and final files', quantity: 1, rate: 600 },
      ],
      subtotal: 2400, discount: 0, taxRate: 0, shipping: 0, amount: 2400,
      notes: 'Completed project.', terms: '50% upfront, 50% at delivery.'
    },
    {
      id: 'est_demo_5', number: 'EST-0105', clientId: 'cli_demo_5',
      client: 'Omar Hassan', clientCompany: 'OH Auto Detailing', clientEmail: 'omar@ohdetailing.com', clientPhone: '(813) 555-0284', clientAddress: '9 River Dr, Tampa, FL 33602',
      projectTitle: 'Two-Vehicle Detail Package', category: 'Other Service', description: 'Full-detail package for two vehicles',
      scopeOfWork: 'Interior deep clean, exterior wash, polish and protective finish.', timeline: '1 day',
      date: addDays(-3), validUntil: addDays(11), status: 'draft' as const,
      items: [
        { id: 'est5_sedan', description: 'Sedan full detail', quantity: 1, rate: 580 },
        { id: 'est5_suv', description: 'SUV full detail', quantity: 1, rate: 670 },
      ],
      subtotal: 1250, discount: 0, taxRate: 0, shipping: 0, amount: 1250,
      notes: 'Draft estimate — finish and send.', terms: 'Payment on completion.'
    },
    {
      id: 'est_demo_6', number: 'EST-0106', clientId: 'cli_demo_5',
      client: 'Omar Hassan', clientCompany: 'OH Auto Detailing', clientEmail: 'omar@ohdetailing.com', clientPhone: '(813) 555-0284', clientAddress: '9 River Dr, Tampa, FL 33602',
      projectTitle: 'Fleet Wash Pilot', category: 'Other Service', description: 'Pilot fleet wash service',
      date: addDays(-42), validUntil: addDays(-20), status: 'declined' as const,
      items: [{ id: 'est6_pilot', description: 'Fleet wash pilot', quantity: 1, rate: 1800 }],
      subtotal: 1800, discount: 0, taxRate: 0, shipping: 0, amount: 1800,
      notes: 'Declined after budget review.', terms: 'Net 7.'
    },
  ];

  const invoices = [
    {
      id: 'inv_demo_1', number: 'INV-0101', clientId: 'cli_demo_3', jobId: 'job_demo_1',
      client: 'Jimmy Wilson', clientCompany: 'Wilson Renovations', clientEmail: 'jimmy@wilsonreno.com', clientAddress: '5 Harbor Rd, San Diego, CA 92101',
      amount: 6850, category: 'Sales / Services', description: 'Master Bathroom Complete Renovation',
      date: currentMonthPast(9), due: addDays(-1), status: 'paid' as const, payMethod: 'Bank Transfer', linkedTransactionId: 'tx_demo_income_1',
      items: [
        { id: 'inv1_labor', description: 'Skilled labor', quantity: 32, rate: 95 },
        { id: 'inv1_fixture', description: 'Vanity, fixtures and toilet', quantity: 1, rate: 2450 },
        { id: 'inv1_plumbing', description: 'Plumbing materials', quantity: 1, rate: 820 },
        { id: 'inv1_finish', description: 'Finish hardware and supplies', quantity: 1, rate: 540 },
      ],
      subtotal: 6850, discount: 0, taxRate: 0, shipping: 0, notes: 'Paid in full.', terms: 'Balance due on completion.'
    },
    {
      id: 'inv_demo_2', number: 'INV-0102', clientId: 'cli_demo_4', jobId: 'job_demo_2',
      client: 'Maria Chen', clientCompany: 'Chen Tech Solutions', clientEmail: 'maria@chentech.io', clientAddress: '500 Tech Blvd, San Francisco, CA 94107',
      amount: 3400, category: 'Sales / Services', description: 'Office Refresh & Hardware Installation',
      date: addDays(-18), due: addDays(-4), status: 'unpaid' as const,
      items: [
        { id: 'inv2_labor', description: 'Installation labor', quantity: 16, rate: 110 },
        { id: 'inv2_materials', description: 'Hardware and materials', quantity: 1, rate: 1640 },
      ],
      subtotal: 3400, discount: 0, taxRate: 0, shipping: 0, notes: 'Overdue — follow-up needed.', terms: 'Net 14.'
    },
    {
      id: 'inv_demo_3', number: 'INV-0103', clientId: 'cli_demo_1', jobId: 'job_demo_3',
      client: 'Kenny Barria', clientCompany: 'KB Landscaping', clientEmail: 'kenny@kblandscaping.com', clientAddress: '12 Palm St, Miami, FL 33101',
      amount: 500, category: 'Sales / Services', description: 'Monthly Lawn Care Package',
      date: addDays(-2), due: addDays(5), status: 'unpaid' as const,
      items: [
        { id: 'inv3_visits', description: 'Weekly lawn service', quantity: 4, rate: 95 },
        { id: 'inv3_trim', description: 'Hedge trim and weed treatment', quantity: 1, rate: 120 },
      ],
      subtotal: 500, discount: 0, taxRate: 0, shipping: 0, notes: 'Current invoice.', terms: 'Net 7.'
    },
    {
      id: 'inv_demo_4', number: 'INV-0104', clientId: 'cli_demo_2', jobId: 'job_demo_4',
      client: 'Sophia Stanley', clientCompany: 'Stanley Studio', clientEmail: 'sophia@stanleystudio.co', clientAddress: '88 Market Ave, Suite 200, Austin, TX 78701',
      amount: 2400, category: 'Consulting / Freelance', description: 'Complete Brand Identity System',
      date: currentMonthPast(6), due: addDays(7), status: 'paid' as const, payMethod: 'Card', linkedTransactionId: 'tx_demo_income_2',
      items: [
        { id: 'inv4_discovery', description: 'Discovery and visual direction', quantity: 1, rate: 600 },
        { id: 'inv4_design', description: 'Logo and identity design', quantity: 1, rate: 1200 },
        { id: 'inv4_guide', description: 'Brand guide and final files', quantity: 1, rate: 600 },
      ],
      subtotal: 2400, discount: 0, taxRate: 0, shipping: 0, notes: 'Paid and completed.', terms: 'Due on delivery.'
    },
    {
      id: 'inv_demo_5', number: 'INV-0105', clientId: 'cli_demo_5',
      client: 'Omar Hassan', clientCompany: 'OH Auto Detailing', clientEmail: 'omar@ohdetailing.com', clientAddress: '9 River Dr, Tampa, FL 33602',
      amount: 780, category: 'Sales / Services', description: 'Previous detailing service',
      date: addDays(-24), due: addDays(-9), status: 'unpaid' as const,
      items: [{ id: 'inv5_detail', description: 'Detailing service', quantity: 1, rate: 780 }],
      subtotal: 780, discount: 0, taxRate: 0, shipping: 0, notes: 'Overdue — reminder available.', terms: 'Net 15.'
    },
    {
      id: 'inv_demo_6', number: 'INV-0106', clientId: 'cli_demo_3',
      client: 'Jimmy Wilson', clientCompany: 'Wilson Renovations', clientEmail: 'jimmy@wilsonreno.com', clientAddress: '5 Harbor Rd, San Diego, CA 92101',
      amount: 4200, category: 'Sales / Services', description: 'Kitchen repair milestone',
      date: monthDate(-1, 12), due: monthDate(-1, 26), status: 'paid' as const, payMethod: 'Check', linkedTransactionId: 'tx_demo_income_3',
      items: [
        { id: 'inv6_labor', description: 'Repair labor', quantity: 20, rate: 150 },
        { id: 'inv6_materials', description: 'Materials', quantity: 1, rate: 1200 },
      ],
      subtotal: 4200, discount: 0, taxRate: 0, shipping: 0, notes: 'Previous-month paid work.', terms: 'Net 14.'
    },
  ];

  const expenseDates = {
    hardware: currentMonthPast(8),
    fuel: currentMonthPast(7),
    subcontractor: currentMonthPast(5),
    meal: currentMonthPast(4),
    office: monthDate(-1, 18),
    refreshments: monthDate(-1, 20),
    drillBits: monthDate(-1, 22),
  };

  const transactions = [
    { id: 'tx_demo_income_1', date: currentMonthPast(8), name: 'Pmt: Jimmy Wilson', category: 'Sales / Services', amount: 6850, type: 'income' as const, notes: 'Payment for INV-0101', jobId: 'job_demo_1' },
    { id: 'tx_demo_income_2', date: currentMonthPast(5), name: 'Pmt: Sophia Stanley', category: 'Consulting / Freelance', amount: 2400, type: 'income' as const, notes: 'Payment for INV-0104', jobId: 'job_demo_4' },
    { id: 'tx_demo_income_4', date: currentMonthPast(2), name: 'On-site consultation', category: 'Consulting / Freelance', amount: 600, type: 'income' as const, notes: 'Direct service payment' },
    { id: 'tx_demo_income_3', date: monthDate(-1, 17), name: 'Pmt: Jimmy Wilson', category: 'Sales / Services', amount: 4200, type: 'income' as const, notes: 'Payment for INV-0106' },
    { id: 'tx_demo_income_5', date: monthDate(-1, 8), name: 'Small repair call', category: 'Sales / Services', amount: 1600, type: 'income' as const, notes: 'Direct service payment' },

    { id: 'tx_demo_exp_1', date: expenseDates.hardware, name: 'Hardware materials — Ace Hardware', category: 'Equipment', amount: 1450, type: 'expense' as const, notes: 'Bathroom fixtures and installation materials', receiptId: 'rcpt_demo_4', reviewedAt: reviewedAt(expenseDates.hardware), jobId: 'job_demo_1' },
    { id: 'tx_demo_exp_2', date: expenseDates.fuel, name: 'Fuel — Shell', category: 'Travel', amount: 80, type: 'expense' as const, notes: 'Travel to renovation job site', receiptId: 'rcpt_demo_2', reviewedAt: reviewedAt(expenseDates.fuel), jobId: 'job_demo_1' },
    { id: 'tx_demo_exp_3', date: expenseDates.subcontractor, name: 'Subcontractor help', category: 'Contractors', amount: 780, type: 'expense' as const, notes: 'Demo: receipt still needs to be attached', reviewedAt: reviewedAt(expenseDates.subcontractor), jobId: 'job_demo_1' },
    { id: 'tx_demo_exp_4', date: expenseDates.meal, name: 'Business meal — Corner Restaurant', category: 'Meals (Business)', amount: 92.80, type: 'expense' as const, notes: 'Client project lunch', receiptId: 'rcpt_demo_3', reviewedAt: reviewedAt(expenseDates.meal), jobId: 'job_demo_2' },
    { id: 'tx_demo_exp_5', date: expenseDates.office, name: 'Office supplies — Office Depot', category: 'Office Supplies', amount: 146.25, type: 'expense' as const, notes: 'Project organization supplies', receiptId: 'rcpt_demo_1', reviewedAt: reviewedAt(expenseDates.office), jobId: 'job_demo_2' },
    { id: 'tx_demo_exp_6', date: expenseDates.refreshments, name: 'Groceries / client refreshments — Market Fresh', category: 'Meals (Business)', amount: 64.50, type: 'expense' as const, notes: 'Refreshments for scheduled lawn-care work', receiptId: 'rcpt_demo_5', reviewedAt: reviewedAt(expenseDates.refreshments), jobId: 'job_demo_3' },
    { id: 'tx_demo_exp_7', date: expenseDates.drillBits, name: 'Replacement drill bits', category: 'Equipment', amount: 118, type: 'expense' as const, notes: 'Demo: new expense awaiting review and receipt', jobId: 'job_demo_2' },

    // Prior-year history keeps All Time and year selectors useful without distorting current Tax Prep Readiness.
    { id: 'tx_demo_hist_1', date: yearDate(previousYear, 10, 18), name: 'Exterior repair project', category: 'Sales / Services', amount: 5200, type: 'income' as const, notes: 'Prior-year demo history' },
    { id: 'tx_demo_hist_2', date: yearDate(previousYear, 8, 7), name: 'Maintenance contract', category: 'Sales / Services', amount: 3600, type: 'income' as const, notes: 'Prior-year demo history' },
    { id: 'tx_demo_hist_3', date: yearDate(previousYear, 5, 21), name: 'Design consultation', category: 'Consulting / Freelance', amount: 2800, type: 'income' as const, notes: 'Prior-year demo history' },
    { id: 'tx_demo_hist_4', date: yearDate(previousYear, 2, 12), name: 'Service call', category: 'Sales / Services', amount: 1900, type: 'income' as const, notes: 'Prior-year demo history' },
    { id: 'tx_demo_hist_5', date: yearDate(previousYear, 10, 20), name: 'Prior-year materials', category: 'Equipment', amount: 980, type: 'expense' as const, notes: 'Prior-year demo history' },
    { id: 'tx_demo_hist_6', date: yearDate(previousYear, 8, 9), name: 'Business insurance', category: 'Insurance', amount: 640, type: 'expense' as const, notes: 'Prior-year demo history' },
    { id: 'tx_demo_hist_7', date: yearDate(previousYear, 5, 23), name: 'Software subscriptions', category: 'Software / SaaS', amount: 310, type: 'expense' as const, notes: 'Prior-year demo history' },
    { id: 'tx_demo_hist_8', date: yearDate(previousYear, 2, 13), name: 'Advertising', category: 'Advertising / Marketing', amount: 420, type: 'expense' as const, notes: 'Prior-year demo history' },
  ].sort((a, b) => b.date.localeCompare(a.date));

  const mileageTrips = [
    { id: 'mi_demo_1', date: addDays(-19), miles: 42.3, purpose: 'Initial site visit', client: 'Jimmy Wilson', jobId: 'job_demo_1', notes: 'Bathroom renovation walkthrough' },
    { id: 'mi_demo_2', date: addDays(-12), miles: 18.1, purpose: 'Materials pickup', client: 'Jimmy Wilson', jobId: 'job_demo_1', notes: 'Fixture pickup' },
    { id: 'mi_demo_3', date: addDays(-6), miles: 24.2, purpose: 'Job-site work', client: 'Jimmy Wilson', jobId: 'job_demo_1', notes: 'Installation visit' },
    { id: 'mi_demo_4', date: addDays(-10), miles: 22.5, purpose: 'Office site visit', client: 'Maria Chen', jobId: 'job_demo_2', notes: 'Hardware measurements' },
    { id: 'mi_demo_5', date: addDays(-3), miles: 18.7, purpose: 'Office installation', client: 'Maria Chen', jobId: 'job_demo_2', notes: 'Finish work' },
    { id: 'mi_demo_6', date: addDays(-4), miles: 12.4, purpose: 'Lawn-care visit', client: 'Kenny Barria', jobId: 'job_demo_3', notes: 'Scheduled service' },
    { id: 'mi_demo_7', date: addDays(-24), miles: 26.8, purpose: 'Final client presentation', client: 'Sophia Stanley', jobId: 'job_demo_4', notes: 'Brand guide delivery' },
    { id: 'mi_demo_8', date: addDays(-16), miles: 8.0, purpose: '', client: '', notes: 'Demo: purpose still needs to be added' },
  ];

  const receipts = [
    { id: 'rcpt_demo_1', date: expenseDates.office, imageKey: 'rcpt_demo_1', mimeType: 'image/png', note: 'Office supplies — Office Depot' },
    { id: 'rcpt_demo_2', date: expenseDates.fuel, imageKey: 'rcpt_demo_2', mimeType: 'image/png', note: 'Fuel — Shell' },
    { id: 'rcpt_demo_3', date: expenseDates.meal, imageKey: 'rcpt_demo_3', mimeType: 'image/png', note: 'Business meal — Corner Restaurant' },
    { id: 'rcpt_demo_4', date: expenseDates.hardware, imageKey: 'rcpt_demo_4', mimeType: 'image/png', note: 'Hardware materials — Ace Hardware' },
    { id: 'rcpt_demo_5', date: expenseDates.refreshments, imageKey: 'rcpt_demo_5', mimeType: 'image/png', note: 'Groceries / client refreshments — Market Fresh' },
  ];

  const taxPayments = [
    { id: 'tax_demo_1', date: yearDate(currentYear, 0, 15), amount: 950, type: 'Estimated' as const, note: 'Q4 estimated tax payment' },
    { id: 'tax_demo_2', date: yearDate(currentYear, 3, 15), amount: 1150, type: 'Estimated' as const, note: 'Q1 estimated tax payment' },
    { id: 'tax_demo_3', date: yearDate(currentYear, 5, 15), amount: 1300, type: 'Estimated' as const, note: 'Q2 estimated tax payment' },
    { id: 'tax_demo_4', date: yearDate(previousYear, 11, 20), amount: 2400, type: 'Annual' as const, note: 'Prior-year annual tax payment' },
  ].sort((a, b) => b.date.localeCompare(a.date));

  return {
    settings: {
      businessName: 'Rivera Home & Business Services',
      ownerName: 'Alex Rivera',
      businessAddress: '214 Cedar Avenue, Austin, TX 78701',
      businessEmail: 'alex@riveraservices.example',
      businessPhone: '(512) 555-0148',
      businessWebsite: 'riveraservices.example',
      payPrefs: DEFAULT_PAY_PREFS,
      taxRate: 18,
      stateTaxRate: 0,
      taxEstimationMethod: 'custom' as const,
      filingStatus: 'single' as const,
      currencySymbol: '$',
      defaultInvoiceTerms: 'Net 14. Thank you for your business.',
      defaultInvoiceNotes: 'Please contact us with any questions.',
      requireReceiptOverThreshold: false,
      receiptThreshold: 0,
      receiptReminderEnabled: true,
      mileageRateCents: 72.5,
      companyEquityEnabled: true,
      monthlyRevenueGoal: 12000,
      monthlyProfitGoal: 8500,
    },
    transactions,
    clients,
    jobs,
    estimates,
    invoices: invoices.sort((a, b) => b.date.localeCompare(a.date)),
    mileageTrips,
    receipts,
    taxPayments,
  };
};
