# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.1] - 2026-07-23

### Fixed
- **Tipster Lists Scroll**: Added a max-height of 500px and a scrollbar to the tipster lists on the dashboard to prevent the tables from growing indefinitely and taking up too much vertical space.

## [1.6.0] - 2026-07-18

### Added
- **Active Tipsters Configuration**: Added a new configuration dialog in the bet filters to enable or disable tipsters. Inactive tipsters are hidden from the filter dropdown and the daily P&L chart, but their data remains in overall statistics.
## [1.5.0] - 2026-07-17

### Added
- **Tipster Active Days**: Added a new column "Días" to the Top Tipsters leaderboard on the dashboard to show how many days each tipster has been active (calculated as the difference between their first and last bet dates).

## [1.4.2] - 2026-07-12

### Fixed
- **Result Distribution Chart Layout**: Changed the legend layout to display in a column at the bottom with a smaller font (`12px`), ensuring the pie chart remains perfectly centered within its card.

## [1.4.1] - 2026-07-11

### Fixed
- **Stake Decimals**: Changed the step interval in the `BetForm` stake input to `0.001` to allow values with three decimal places (e.g., `2.552`).

## [1.4.0] - 2026-07-11

### Added
- **Result Distribution Values**: Enhanced the 'Distribución de Resultados' pie chart legend to display the exact number of picks next to each result type (e.g., `W (Ganadas) - 45`).

## [1.3.0] - 2026-07-11

### Added
- **Date Range Filter**: Replaced the month filter dropdown with a `DateRangePicker` in the `BetFiltersBar` component to allow selecting custom time periods for filtering bets.

## [1.2.0] - 2026-07-11

### Added
- **P&L Chart Filter**: Made the 'P&L acumulado por tipster' chart filterable. Users can now click on tipsters in the legend to toggle their visibility on the chart.

## [1.1.6] - 2026-07-10

### Fixed
- **Bet Form Validation**: Changed minimum allowed odds from `0.5` to `0.01` in bet form validation schema to correctly allow sub-1.01 odds (e.g., `0.93` for certain markets).

## [1.1.5] - 2026-07-10

### Fixed
- **Number Formatter Bug**: Fixed a bug where small negative values (e.g. `-0.004`) were being displayed as `(0,00 €)` or `-0.00%` in the UI by explicitly rounding numbers to 2 decimal places in `fEUR`, `fPct`, and `pnlClass` formatters.
## [1.1.4] - 2026-07-09

### Fixed
- **YieldCell Duplicate Plus**: Removed the extra `+` sign in `MonthlyPeriodsTable`'s `YieldCell` component since `fPct` already includes it natively.

## [1.1.3] - 2026-07-09

### Fixed
- **Bankroll Chart Tweaks**: Moved reference line labels completely to the right, outside the chart area (`position="right"`). Adjusted right margin to prevent cutoffs.

## [1.1.2] - 2026-07-09

### Fixed
- **Bankroll Chart Tweaks**: Reverted the Y-axis to the left side while keeping the 150-step scale. Hidden the X-axis completely. Removed the black background from reference labels and aligned them to the right inside the chart to look cleaner.

## [1.1.1] - 2026-07-09

### Fixed
- **Bankroll Chart Labels**: Shifted reference line labels to the left side to avoid overlap with the top-right legend. Removed text prefixes (Max/Min/Med) to keep it clean.
- **Negative Currency Format**: Updated global `fEUR` formatter to use accounting format `(X,XX €)` for negative values.

## [1.1.0] - 2026-07-09

### Added
- **Bankroll Chart Reference Lines**: Added horizontal reference lines for Maximum, Minimum, and Average (Media) to the bankroll evolution chart to give a clearer perspective of performance peaks and valleys over time.

## [1.0.3] - 2026-07-09

### Fixed
- **BetForm Pending Pick Validation**: Added support for `"pending-_"` in the Zod validation schema to fix a bug where users could not save edits when leaving the pick result as "Pendiente".

## [1.0.2] - 2026-07-09

### Fixed
- **DateTimePicker Date Change Bug**: Fixed an issue where the `DateTimePicker` was incorrectly producing local ISO strings upon user interaction. This caused edits to nominal dates (like 21:02) to inadvertently apply a local timezone offset before saving, preventing users from effectively editing the date. The component now consistently produces purely nominal `YYYY-MM-DDTHH:mm` time, ensuring accurate timezone-agnostic behaviour on save.

## [1.0.1] - 2026-07-09

### Fixed
- **Timezone Offset (#58)**: Resolved the timezone offset bug that caused bet times (e.g., 21:02) to shift by 1 hour when importing or modifying records. Fixed by explicitly parsing and submitting all dates as UTC, and using `timeZone: "UTC"` in the UI formatters to ensure timezone-agnostic behaviour.
  - Updated `src/shared/lib/formatters.ts` to use UTC timezone in `Intl.DateTimeFormat`.
  - Modified `BetForm.tsx` to handle dates with UTC methods and append `Z` to submitted times.
  - Adjusted `html-22bet-import.functions.ts` to parse dates strictly as UTC using `Date.UTC`.

## [1.0.0] - 2026-07-08

### Added
- **Base Architecture / V1 Release**: 
  - Complete migration from a client-side Lovable project (using TanStack Query/Router) to a full-stack **Next.js 15 (App Router)** architecture.
  - **Supabase Backend**: Integration of PostgreSQL database with Row Level Security (RLS) and Supabase Authentication.
  - **Core Features**: Comprehensive sports betting bankroll management functionality.
    - Importing, tracking, and analyzing betting history.
    - Profit & Loss (PnL) metrics calculations.
    - Tipster performance tracking.
  - **UI/UX**: Implementation using React, TypeScript, Tailwind CSS, and shadcn/ui.
