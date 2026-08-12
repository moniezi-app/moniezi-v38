# MONIEZI v38.0.20

Source package for the v38.0.20 Complete Job Costing & Profitability release.

## New in v38.0.20

- Completes Jobs / Projects with expected job budgets and actual-cost comparison.
- Adds estimated labor hours, internal hourly labor cost, actual labor time entries, labor cost, and labor variance.
- Adds materials, subcontractor, other-cost, total-cost, profit, margin, and cash-position views per job.
- Adds Budget vs Actual and Profit vs Budget analysis.
- Adds Log Time and Job Cost actions directly from the Job Dashboard.
- Adds a one-tap Complete Job action and completed-job closeout summary.
- Expands Job Activity to include labor time entries.
- Expands Job Profitability Reports with ranking by profit, revenue, margin, total cost, outstanding balance, and labor hours.
- Expands all four existing demo jobs with realistic budgets and labor entries so the complete workflow is visible immediately.
- Preserves the optimized U.S. receipt demo, Reports, Tax Prep, Goals, Company Equity, backups, PWA behavior, and all earlier v38 functionality.

## Compatibility

The new Job fields are optional and normalized on load, so jobs created in v38.0.19 and earlier remain valid. Job labor entries are stored inside the Job record and are included automatically in app-state storage and backups. Backup schema metadata is now version 3.
