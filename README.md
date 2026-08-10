# MONIEZI Pro Finance v38.0.12

Release date: 2026-08-10

## What changed

- Estimates use clearly separated individual cards instead of one continuous divided list container.
- Invoice cards and estimate cards use stronger, more visible borders so each record is easy to distinguish.
- Activity search on mobile hides the fixed bottom navigation while the search field is focused, preventing the navigation bar from covering the search area when the on-screen keyboard opens.
- Invoice and estimate edit forms use stronger visual hierarchy and clearer borders: section cards are more visible, headings are separated from fields, and input/select borders are easier to see.
- The main Menu has proper top spacing below its header, stronger section headings, and visible dividers between Your Business, Trying MONIEZI, App, and the version/privacy note.
- App-wide corner radii use a more compact proportional hierarchy while preserving rounded shapes; intentional circles and pill controls remain fully rounded.
- Native HTML dropdowns were replaced with a reusable MONIEZI-controlled selector throughout the app. Open selector menus use app-controlled 14 px option text, compact rows, MONIEZI dark/light styling, and consistent rounded corners instead of Android/Chrome native popup typography.
- Expense Review Status uses a mobile-first vertical layout so the explanation gets full width and NEW / REVIEWED sits below it.
- Mobile usability pass: follow-up alert actions, Mileage header/actions, Receipt Reminder settings, Company Equity record actions, invoice period totals, mileage totals, and estimate-card amount/status layouts now stack safely on narrow screens instead of squeezing text into narrow columns.
- Transaction category selection no longer uses a fixed-height nested scrolling area; the main editor scroll now owns the scrolling flow.

## Notes

Business logic, storage, licensing, PDFs, calculations, exports, and the broader v38 behavior remain unchanged. This release is focused on mobile readability, card clarity, keyboard-safe Activity search, invoice/estimate form usability, menu structure, compact corner radii, and app-controlled selectors.

## Invoice / Estimate header alignment refinement

- The document icon and Invoices/Estimates title now share one aligned header row.
- The add button sits on that same header row.
- The Invoices / Estimates segmented control now uses its own full-width row below the title instead of being indented under the title text.
