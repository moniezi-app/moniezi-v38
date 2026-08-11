# MONIEZI v38.0.19

Source package for the v38.0.19 Job Dashboard & Quick Add Integration release.

## New in v38.0.19

- Adds **New Job / Project** to the Home/Activity Quick Add chooser.
- Tapping a job now opens a purpose-built Job Dashboard instead of dropping directly into the edit form.
- Job Dashboard separates Invoiced, Collected, Outstanding, Expenses, Estimated Job Profit, margin, and Cash Position.
- Adds one-tap Invoice, Estimate, Expense, and Mileage actions from inside a job; new records are pre-linked to that job.
- Adds a chronological Job Activity timeline for linked invoices, estimates, direct income, expenses, and mileage.
- Editing job metadata is now a secondary **Edit Job Details** action.
- Preserves the optimized 10-receipt U.S. demo gallery and the cleaned commercial-source structure from v38.0.18.

MONIEZI v38.0.19 preserves the v38.0.18 data model and all earlier MONIEZI records. Existing installed v38 PWAs keep the same manifest application ID so updates continue normally.

## Commercial source package

This package intentionally excludes obsolete historical development docs, old release notes, `node_modules`, `dist`, and temporary test output.

Current documentation includes:
- `README.md`
- `MONIEZI_v38.0.19_RELEASE_NOTE.md`
- `docs/COMMERCIAL_REGRESSION_CHECKLIST.md`
- `DEPLOYMENT_AND_LICENSE_SETUP.md`
