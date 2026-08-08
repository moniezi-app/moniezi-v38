# MONIEZI Pro Finance v38.0.0 — Usability Release

This package promotes the reviewed MONIEZI v37.11.0 UX revision to the v38 repository line.

## Main usability changes

- Installation is presented before license activation so customers begin in the installed PWA environment.
- Expense entry is simplified and review-state handling is removed from the basic entry flow.
- Secondary transaction actions are grouped behind **More actions**.
- Receipt attachment is reduced to a simple add/change/remove flow.
- The confusing template prompt is replaced with a useful repeated-entry workflow.
- Batch/recurring concepts are consolidated into clearer **Future Copies** behavior.
- New invoices and estimates use sensible future date defaults.
- Optional invoice/estimate fields are progressively disclosed under **More Options**.
- Default billing categories are broader and suitable for more types of self-employed businesses.
- Home **In** and **Out** totals open the corresponding transaction views.
- Smart Insights focuses on business bookkeeping rather than personal-finance advice.
- Settings is simplified into **Business / Tax / Backup / App**.

## Version and repository changes

- Displayed application/report version: **38.0.0**.
- Root package name: `moniezi-pro-finance-v38`.
- Service-worker cache identifier bumped to the v38 line.
- GitHub Pages workflow markers updated to v38.
- License Worker package/source marker updated to **38.0.0** while retaining the stable Worker service name.
- GitHub Pages app URL in the Worker configuration updated to `/moniezi-v38/`.

## Data and activation continuity

The following are intentionally unchanged so existing installations and activations continue cleanly:

- MONIEZI IndexedDB database names
- Receipt-image database
- Local-storage keys and preferences
- Device identity key
- License activation storage key
- Offline license-binding salt/version
- PWA customer-facing identity
- Backup data model

There is **no v37-to-v38 customer-data migration step**.

## License backend URL

`.env.example` intentionally retains the currently deployed Worker hostname containing `v37`. The hostname is infrastructure, not the MONIEZI app version. Change it only if the Worker is actually redeployed under a different hostname.

## Repository

Recommended repository name: `moniezi-v38`.

Upload the contents of the source folder directly to the repository root.
