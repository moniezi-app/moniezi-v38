# MONIEZI v38.0.21 — Job Dashboard Mobile UX Refinement

## Purpose

This release does not add another job-costing calculation. It reorganizes the completed v38.0.20 Job Dashboard so the information is readable and useful on a phone instead of being compressed into spreadsheet-like layouts.

## Job Dashboard

- Budget vs Actual is stacked into comparison cards on mobile.
- Labor labels use complete wording such as Budgeted Labor Hours, Actual Labor Hours, Hours Over/Under Budget, and Actual Labor Cost.
- Labor entries no longer truncate the description or worker name and use hours / per hour rather than abbreviations.
- Job Activity is presented as full vertical records with complete title, type/status, date, detail, amount, and open-record action.
- Financial Summary and Actual Cost Breakdown use one-column mobile layouts before expanding at larger breakpoints.
- Job actions, Quoted/Mileage, and Job Closeout receive additional spacing and responsive stacking.

## Navigation

The permanent bottom navigation is now: Home, Jobs, Invoice, Activity, Mileage, Reports. Jobs / Projects remains available under Your Business in the main menu.

## Compatibility

v38.0.21 preserves the v38.0.20 data model, job budgets, labor entries, demo data, backups, and calculations.

## v38.0.21 UI correction — Jobs list and dashboard actions

- Simplified Jobs list cards so they summarize instead of duplicating the full Job Dashboard.
- Added clear Financial Summary and Job Activity Snapshot sections to each job card.
- Removed mileage deduction, labor-cost, quoted-value, and accepted-estimate detail from the list card; those remain in the Job Dashboard where they belong.
- Added an explicit View Job affordance.
- Replaced the cramped three-column bottom action layout with Repeat Job / Complete Job on one row and a full-width Edit Job Details action below.
- Added additional bottom breathing room for mobile.
