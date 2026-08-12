# MONIEZI v38.0.20 — Complete Job Costing & Profitability

This release completes the Job / Project workflow rather than adding a separate duplicate module.

## Complete job costing
- Expected revenue and cost budget.
- Materials budget and actual materials costs.
- Estimated labor hours and internal hourly labor cost.
- Actual time entries with date, hours, worker, work performed, and captured cost rate.
- Subcontractor and other-cost budgets and actuals.
- Total actual job cost.
- Current/final job profit and margin.
- Cash position kept separate from internal labor cost.
- Budget vs Actual variance for revenue, costs, labor and profit.

## Job workflow
- Invoice, Estimate, Job Cost, Mileage and Log Time actions are linked automatically to the open job.
- Labor entries appear in the Job Activity timeline and can be edited or deleted.
- Active jobs can be completed directly from the dashboard.
- Completed jobs show a closeout summary with collected amount, total cost, final profit, margin and labor hours.

## Reports
The Job Profitability report now compares complete job economics and can rank jobs by profit, revenue, margin, total cost, outstanding amount or labor hours.

## Demo
All four existing commercial demo jobs now include budgets and labor time. The demo intentionally includes a strong job, a near-budget job, a weak-margin job and a completed job so the value of job costing is visible without manual setup.

## Compatibility
Existing Job records remain compatible because every new field is optional and normalized. Backup schema metadata is bumped to 3.
