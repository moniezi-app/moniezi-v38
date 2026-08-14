# MONIEZI v38.0.24 — Mobile Numeric Editing & Jobs Overview Refinement

This release applies three approved mobile usability corrections without changing existing Demo, Jobs, invoice, estimate, or storage workflows.

## Changes

1. **Jobs Overview** — removes the redundant upper-right active-job badge. Active/completed/archive counts remain available in the filter selector below the overview.
2. **Invoice & Estimate Quantity** — changes `Qty` to `Quantity`, requests a decimal numeric keypad, and selects the existing value on focus so the next typed value replaces it (for example, `1` → type `2` → `2`, not `12`).
3. **Job / Project budget fields** — applies the same select-to-replace behavior to Expected Revenue, Materials Budget, Estimated Labor Hours, Internal Labor Cost / Hr, Subcontractor Budget, and Other Cost Budget (for example, `0` → type `1` → `1`, not `01`).

The service-worker cache revision is advanced so installed PWAs receive the corrected interface.
