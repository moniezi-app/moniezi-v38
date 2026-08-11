# MONIEZI v38.0.16 — Commercial Readiness & Demo Synchronization

This release brings the existing MONIEZI demo and commercial presentation up to the capabilities introduced through v38.0.15.

## Highlights

- Deterministic demo data with linked clients, jobs, estimates, invoices, expenses, mileage, receipts, and tax payments.
- Demo-ready Job Profitability, Monthly Goals, Continue Work, Needs Your Attention, and Tax Prep Readiness examples.
- Cleaner Home information hierarchy with reduced duplication between urgency and productivity surfaces.
- Version-independent MONIEZI installed-app branding and standardized customer-facing product naming.
- Regression test coverage for the commercial demo and its critical cross-record relationships.

No new bookkeeping module is introduced in this release. The focus is consistency, demonstration quality, and commercial readiness.

## Demo history density correction

- Restores a deep deterministic commercial history instead of the overly small first v38.0.16 demo.
- Demo now contains 350+ transactions across every income and expense category, 40+ invoices, 28+ estimates, 60+ mileage trips, and 120+ receipt records.
- All-time demo activity is intentionally substantial (roughly $600K income) so Overview, Activity, category breakdowns, P&L, tax reports, client reports and year/month selectors all have meaningful data.
- Keeps the v38.0.16 controlled examples intact: exactly two current-tax-year expenses missing receipts, one expense awaiting review, one incomplete mileage trip, stable monthly Goals, and the existing Job Profitability example.
- Historical data remains deterministic: reloading the demo on the same day produces the same records and totals.
- The five bundled receipt images are reused locally for the larger receipt history without increasing the shipped image asset set.
