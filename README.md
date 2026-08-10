# MONIEZI Pro Finance v38.0.12

Clean v38 branch based directly on Claude's MONIEZI v37.12.1 source.

Changes from that base:

- Pinch-to-zoom remains enabled.
- Home Overview **In** opens Activity filtered to income.
- Home Overview **Out** opens Activity filtered to expenses.
- Version/PWA/storage identity updated to v38 so v37 and v38 can be installed and tested separately.
- Global Search in the main header finds transactions, invoices, estimates, clients, mileage, and receipts without changing stored data.
- v38.0.11 is a maintenance release that preserves the v38.0.10 presentation pass and fixes a TypeScript control-flow check in the Estimates list so the GitHub `npm run check` typecheck can proceed.

Business logic, storage, licensing, PDFs, calculations, search behavior, zoom behavior, and the v38.0.10 visual design remain unchanged; v38.0.11 removes only a redundant Estimate-status comparison that TypeScript rejected.

See `GITHUB_CLOUDFLARE_OWNER_KEY_SETUP.md` for deployment steps.


## v38.0.12 release note

- Estimates now render as separate cards instead of one divided list container, matching the clear card-by-card delineation used by invoices.
- Invoice and estimate card borders are lighter and more subtle, with softer default shadows while preserving status accent borders and existing actions.
- No business logic, storage, licensing, PDF, calculation, filtering, or workflow behavior was changed.
