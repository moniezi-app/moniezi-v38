# MONIEZI Pro Finance v38.0.14

Release date: 2026-08-10

## Job / Project Profitability

v38.0.14 adds an optional Job / Project layer on top of the existing MONIEZI records without changing or invalidating older data.

### New in v38.0.14

- New **Jobs / Projects** screen under **Your Business**.
- Jobs can be linked to a client and marked Active, Completed, or Archived.
- Invoices, estimates, income, expenses, and mileage can now be assigned to a job/project.
- A new job can be created directly while editing an invoice, estimate, transaction, or mileage trip.
- Job cards show revenue, expenses, estimated profit, profit margin, outstanding invoices, mileage, and estimate activity.
- New **Reports → Job Profitability** report with year selection.
- Client records show their linked jobs/projects.
- Global Search now searches jobs/projects.
- Linked job names are visible on invoices, estimates, and mileage records.
- Paid invoice transactions inherit the invoice job link, while profitability calculations avoid double-counting the linked payment transaction.
- Deleting a job keeps all business records and only removes their job assignment.
- Backups now include Jobs / Projects; older backups without jobs continue to restore normally.

### Profit calculation

Estimated job profit is calculated as linked invoice value plus linked non-invoice income, minus linked expenses. Unpaid invoices remain visible as outstanding. Business mileage and its estimated tax deduction are shown separately and are not treated as an operating expense.

## Compatibility

All v38.0.13 functionality remains in place, including Needs Your Attention, Business Insights, Tax Prep Readiness, Accountant Package, Client Statements, follow-up messages, Report Center, custom selectors, optional Company Equity, and the previous mobile/layout refinements.
