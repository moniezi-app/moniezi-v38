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

## Android version-identification update

- Full PWA manifest name: **MONIEZI v38.0.0**.
- Android launcher short name: **MONIEZI 38**.
- Browser title: **MONIEZI v38.0.0**.
- Manifest ID: `/moniezi-v38/` so Android/Chrome can distinguish v38 from earlier repository versions.
- Service-worker cache identifier bumped so updated install metadata is not masked by the prior v38 cache.

The underlying MONIEZI data-storage and license/device-binding keys remain unchanged.

## Data and activation continuity

The following are intentionally unchanged so existing installations and activations continue cleanly:

- MONIEZI IndexedDB database names
- Receipt-image database
- Local-storage keys and preferences
- Device identity key
- License activation storage key
- Offline license-binding salt/version
- Backup data model

There is **no v37-to-v38 customer-data migration step**.

## License backend URL

`.env.example` intentionally retains the currently deployed Worker hostname containing `v37`. The hostname is infrastructure, not the MONIEZI app version. Change it only if the Worker is actually redeployed under a different hostname.

## Repository

Recommended repository name: `moniezi-v38`.

Upload the contents of the source folder directly to the repository root.

## v38 storage isolation

MONIEZI v38 uses version-specific browser storage so v37 and v38 can be installed and tested side-by-side on the same `github.io` origin without sharing or clearing each other's bookkeeping data.

- App-state IndexedDB: `moniezi-app-v38`
- Receipt IndexedDB: `moniezi-receipts-v38`
- Legacy data fallback key: `moniezi_core_data_v1_v38`
- License key: `moniezi_license_v1_v38`
- Device ID key: `moniezi_device_id_v1_v38`
- Home KPI period: `moniezi_home_kpi_period_v38`
- Theme: `moniezi_theme_v38`
- Demo/sample flag: `moniezi_sample_tried_v1_v38`
- Dismissed insights: `moniezi_insights_dismissed_v1_v38`

For license continuity only, v38 performs a one-time copy of the existing v37 license/device identity into the new v38 keys. It does not migrate v37 bookkeeping data or receipt blobs.
