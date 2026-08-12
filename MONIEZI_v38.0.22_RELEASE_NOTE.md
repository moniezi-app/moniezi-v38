# MONIEZI v38.0.22 — Jobs Information Architecture & Progressive Disclosure

## Jobs landing page

- Consolidates status counts, revenue, cost, and job profit into one Jobs Overview surface.
- Makes Job Profit the primary portfolio-level result.
- Refines individual job cards with a profit-first hierarchy, clear Revenue and Total Cost, outstanding balance, compact activity chips, and an explicit View Job action.

## Job Dashboard

- Adds a clear Job Profit hero and compact Money summary.
- Introduces progressive disclosure for Budget Performance, Labor, Costs, and Job Activity.
- Replaces the full-screen Add to This Job card stack with one Add to Job button and compact action sheet for Invoice, Estimate, Expense / Job Cost, Mileage, and Log Time.
- Keeps Manage Job / budget editing separate from record creation.
- Adds concise Estimates & Invoices and Mileage summaries.
- Shows only recent activity by default while preserving access to the full chronological job history.

## Compatibility

No Job data fields were removed or changed. Existing v38.0.21 jobs, budgets, labor entries, linked records, backups, demo data, and report calculations remain compatible.


## v38.0.22 correction — Permanent Demo access

- Demo access is always visible in both Menu and Settings, regardless of whether the customer already has business records.
- The one-time first-run demo invitation is now independent from permanent Demo access.
- Entering Demo Mode with existing business records preserves the complete current business in IndexedDB.
- Removing Demo Mode restores the preserved business; entering from an empty app returns to an empty app.
- Reloading the demo does not overwrite the preserved return snapshot.
- Demo Mode clears private/advanced live-state surfaces while active so the sample business does not expose the customer’s Company Equity, templates, custom categories, duplication history, or Tax Planner entries.
- Reset & Clear All remains truly destructive and also clears any Demo Mode return snapshot.
