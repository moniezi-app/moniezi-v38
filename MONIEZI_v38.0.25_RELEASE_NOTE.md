# MONIEZI v38.0.25 — Activity Contextual Add Flow

This release removes an unnecessary Quick Add step when the Activity screen already knows what kind of record the user wants to create.

## Activity + behavior

- All → Quick Add
- Income → Add Income
- Expense → Add Expense
- Invoice → New Invoice

## Entry-type selector

The add-entry selector now presents Income, Expense, Estimate, and Invoice as four explicit choices in a 2 × 2 mobile layout. Estimate and Invoice each open/reset their own billing-document draft correctly.

No data model, Demo-mode, storage, licensing, reports, Jobs, or receipt workflow changes are included in this release.
