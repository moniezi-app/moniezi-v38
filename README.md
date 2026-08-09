# MONIEZI Pro Finance v38.0.0

This is the v38 usability-focused continuation of MONIEZI Pro Finance v37.11.0.

- Same product identity; v38 uses a distinct install identity for side-by-side Android testing
- Same application data and storage keys
- Same existing license/device binding
- No customer-data migration required
- New v38 GitHub repository line
- Simplified everyday workflows and progressive disclosure of advanced controls

The deployed license-worker hostname may still contain `v37`; that is an infrastructure URL and should remain unchanged unless the Worker itself is deliberately redeployed under a new hostname.

See `GITHUB_CLOUDFLARE_OWNER_KEY_SETUP.md` for deployment steps and `MONIEZI_v38.0.0_RELEASE_NOTE.md` for this release summary.

## Android testing identity

For v38 installs, the manifest uses **MONIEZI 38** as the short launcher name and **MONIEZI v38.0.0** as the full PWA name. The manifest ID is `/moniezi-v38/`, allowing Android/Chrome to distinguish the v38 install from earlier repository versions.
