# MONIEZI v38.0.25

Source package for the v38.0.25 Activity Contextual Add Flow release.

## New in v38.0.25

- Activity now respects the selected record type when the `+` button is used.
  - Income opens Add Income directly.
  - Expense opens Add Expense directly.
  - Invoice opens New Invoice directly.
  - All continues to open Quick Add because no single record type is selected.
- The add-entry type selector now exposes all four creation paths in a mobile-friendly 2 × 2 layout: Income, Expense, Estimate, and Invoice.
- Switching between Estimate and Invoice resets the correct billing-document draft explicitly, avoiding stale document-type state.
- All v38.0.24 numeric-editing, Jobs Overview, Demo, installation, reports, receipt, and storage behavior is preserved.

MONIEZI v38.0.25 preserves the v38 data model and remains compatible with existing v38 backups and installed PWAs.
