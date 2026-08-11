# MONIEZI Commercial Regression Checklist

Use this checklist before publishing a customer-facing build.

## Activation and launch
- Fresh browser launch reaches the license flow when no valid license is stored.
- Valid customer/owner key activates successfully.
- Invalid key produces a clear error and does not open the app.
- Relaunch after activation opens normally.
- Installed PWA launches from the home-screen icon.
- App update replaces the previous cached shell without deleting business data.

## Demo and reset
- Demo data loads once and the Demo banner appears.
- Demo Home shows the intended rich transaction history and 10 receipt images.
- Demo Jobs, Goals, invoices, estimates, mileage, reports, and Tax Prep Readiness all contain meaningful data.
- Remove Demo removes demo records without affecting unrelated app settings.
- Reset/clear-data confirmation behaves as expected.

## Home
- Overview period controls work for Year, Month, 30 Days, and All.
- In/Out values open the appropriate Activity view.
- Needs Your Attention routes to the correct records.
- Monthly Goals show current progress and can be edited/cleared.
- Continue Work actions open or repeat the intended record.
- Invoice/collection and Sales Pipeline summaries are readable on narrow mobile screens.
- Recent Receipts shows receipt images only; no bare expense placeholders appear.
- Missing Receipts opens Expenses filtered to records without receipts.

## Activity and transactions
- Search works across description/category/client/job/amount.
- Income and expense filters work.
- Add/Edit Transaction works with the mobile keyboard open.
- Repeat, Batch, Recurring, and Delete actions work.
- Category selector, custom category, Review Status, Job/Project, and receipt linking work.
- Activity bottom navigation does not cover the keyboard/search results.

## Receipts
- Scan Receipt creates a receipt record.
- Add Expense opens the expense editor.
- Receipt preview, View, Download, Link/Unlink work.
- Linked receipt opens the associated expense from Home.
- Demo receipt assets load offline after the app has cached them.

## Invoices and estimates
- Invoice and Estimate tabs, period controls, and filters work.
- Create/edit forms have correct spacing and no label overlap.
- Client and Job/Project selectors work.
- Separate list cards remain clearly delineated in light and dark mode.
- Invoice status, payment recording, duplicate/repeat, PDF/export, and reminder/share actions work.
- Estimate follow-up, snooze, Done, duplicate/repeat, acceptance/decline, and PDF/export work.

## Clients and jobs
- Create/edit Clients and Jobs/Projects.
- Client statement opens and exports correctly.
- Job links propagate to invoices, estimates, expenses, and mileage.
- Job Profitability totals do not double-count invoice payment transactions.
- Completing/archiving/deleting a job preserves underlying financial records as designed.

## Mileage
- Add/edit/repeat trips.
- Client/Job linkage works.
- Mileage summary and report totals are readable on mobile.
- Incomplete trip purpose is surfaced by readiness checks.

## Reports and tax
- Report Center opens every report.
- Profit & Loss, Tax Summary, Money Owed to You, Expenses & Receipts, Mileage, Clients & Work, Job Profitability, Money In & Out, Estimate Pipeline, Transaction Ledger, and Year-End Summary render.
- Tax Prep Readiness score and issue links work.
- Accountant Package creates the expected archive and exports.
- Tax Snapshot/Planner controls and logged tax payments work.

## Backup, restore, and settings
- Backup export completes.
- Restore preserves supported records including Jobs and Company Equity.
- Receipt blobs/metadata restore as designed.
- Theme, receipt reminder, tax setup, business details, optional features, and update checks work.
- Company Equity toggle respects explicit OFF and defaults ON only when no saved preference exists.

## Navigation, search, and mobile UI
- Global Search finds supported entities including Jobs/Projects.
- Main menu and drawers open/close without horizontal drift.
- Header and bottom navigation remain visible/hidden at the correct times.
- Android and iPhone zoom/keyboard behavior remain stable.
- Dark-blue surface system preserves readable semantic red/green/amber/violet states.
- Light mode maintains sufficient contrast.

## CI/package
- `npm ci`
- `npm run check`
- `npm run build`
- ZIP contains `.github/workflows/deploy-pages.yml`.
- ZIP does not contain `node_modules`, `dist`, `.tmp`, secrets, local `.env`, or obsolete release/history files.
