# MONIEZI v38.0.32 — Single Add Picker

This release removes the duplicate Home/Activity Add-choice implementation and routes the general `+` action directly into the same screen-style picker used from selected transaction forms.

- One shared picker component and one shared option definition.
- Same typography, icon treatment, spacing, background, selected state, and close control everywhere.
- Home `+` and Activity `All → +` open the picker immediately.
- Contextual Activity Income / Expense / Invoice `+` actions still open their forms directly.
- No data-model or storage changes.
