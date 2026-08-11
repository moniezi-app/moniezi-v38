# MONIEZI v38.0.18 — Optimized U.S. Receipt Gallery

- Replaces the prior demo receipt artwork with 10 photo-style U.S. receipt images matching the approved thermal-paper-on-dark-surface look.
- Uses the four user-approved reference receipts plus six matching U.S. store receipts.
- Converts all 10 gallery assets to optimized WebP at 600×900; the full set is approximately 0.36 MB total.
- Demo Home Receipts now presents the same 10 featured receipts in a stable order for video/screenshot demos.
- Each featured receipt is linked to an expense record rather than appearing as a generic placeholder.
- Real-business behavior remains unchanged: Home shows the 10 most recent receipt images.
- Preserves the Missing Receipts workflow, dark-blue visual system, rich demo history, Reports, Jobs, Goals, and all prior v38 functionality.

## Commercial source cleanup

- Removed obsolete v30/v32/v35 documentation and prior v36/v38.0.16/v38.0.17 release notes.
- Removed unused public stylesheet, redundant unreferenced favicons, and orphaned ESLint configuration.
- Replaced the old deployment/owner-key document with current Stripe + Cloudflare + GitHub instructions.
- Replaced the old regression checklist with a current commercial v38 checklist.
- Corrected the license-email `APP_URL` from the legacy v36 project path to the v38 project path.
- Removed stale Gumroad/v36/v37 wording from active license-worker documentation/comments.
- Cleaned package/workflow labels without changing the application data model or PWA identity.
