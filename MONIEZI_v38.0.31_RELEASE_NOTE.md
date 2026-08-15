# MONIEZI v38.0.31 — Add Picker Refinement & Version Sync

This release completes the current Add picker typography refinement and corrects the stale customer-facing version display.

## Add picker

- Removed the redundant “Choose an item” heading.
- “Money & Sales” and “Business” use weight 500 for hierarchy.
- Selectable Add choices remain weight 400.
- Choice icons use a lighter 1.25px stroke.

## Version sync

The runtime app version is now injected by Vite from the root `package.json`. This single build-time source feeds the existing `CUSTOMER_VERSION` value used by Settings, Menu, reports, backups, and other customer-facing version labels, preventing the previous hard-coded 38.0.26 value from drifting behind future releases.
