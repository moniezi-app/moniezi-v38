# MONIEZI Pro Finance v38.0.10

Clean v38 branch based directly on Claude's MONIEZI v37.12.1 source.

Changes from that base:

- Pinch-to-zoom remains enabled.
- Home Overview **In** opens Activity filtered to income.
- Home Overview **Out** opens Activity filtered to expenses.
- Version/PWA/storage identity updated to v38 so v37 and v38 can be installed and tested separately.
- Global Search in the main header finds transactions, invoices, estimates, clients, mileage, and receipts without changing stored data.
- v38.0.10 adds a presentation-only consistency pass: calmer mobile spacing, consistent page-header geometry, semantic colors for Income/Expense/Invoice/Estimate/Mileage/Client/Receipt, clearer touch targets, and consistent Clients terminology.

Business logic, storage, licensing, PDFs, calculations, search behavior, and zoom behavior remain based on the existing v38 branch; v38.0.10 changes presentation only.

See `GITHUB_CLOUDFLARE_OWNER_KEY_SETUP.md` for deployment steps.
