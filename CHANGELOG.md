# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 (2026-08-29)


### Features

* **bets:** add datetime picker for bet_date and db migration ([edd7ae1](https://github.com/fidehlg89/next_bet-bankroll/commit/edd7ae124b72f751b2ba4ccb5cb94514402552f4))
* **bets:** add summary bar for filtered bets ([#79](https://github.com/fidehlg89/next_bet-bankroll/issues/79)) ([e21181c](https://github.com/fidehlg89/next_bet-bankroll/commit/e21181c4829b326a9e6507fe321e9b9be6f5b4d7))
* **bets:** replace month filter with date range picker ([#51](https://github.com/fidehlg89/next_bet-bankroll/issues/51)) ([6128b93](https://github.com/fidehlg89/next_bet-bankroll/commit/6128b93c1da81497e5d3f96b0954bfee4b51ed77))
* **dashboard:** add active betting days per tipster ([#82](https://github.com/fidehlg89/next_bet-bankroll/issues/82)) ([a48cc25](https://github.com/fidehlg89/next_bet-bankroll/commit/a48cc25ab4752c657c61c2cc4a2842d815d2da68))
* **dashboard:** add dynamic bankroll adjustments ([#20](https://github.com/fidehlg89/next_bet-bankroll/issues/20)) ([5ed0c82](https://github.com/fidehlg89/next_bet-bankroll/commit/5ed0c82cc490955f2f9bd472ee25089cf730f002))
* **dashboard:** add max min avg reference lines to bankroll chart ([868045b](https://github.com/fidehlg89/next_bet-bankroll/commit/868045b9a4d66b5813b8b4ac3a875f920f97b64f))
* **dashboard:** add Total Contributed indicator ([#102](https://github.com/fidehlg89/next_bet-bankroll/issues/102)) ([0c85a29](https://github.com/fidehlg89/next_bet-bankroll/commit/0c85a2982fffa6db51903baa17fcefbe89917107))
* **migration:** refactor import endpoints and establish engineering skills ([259e845](https://github.com/fidehlg89/next_bet-bankroll/commit/259e845b0aabb3b0982d23ae731137ba761ce54d))
* monthly bankroll periods management ([#23](https://github.com/fidehlg89/next_bet-bankroll/issues/23)) ([cc1fca2](https://github.com/fidehlg89/next_bet-bankroll/commit/cc1fca274efb8cffdf975113b6aee0c63d96c878))
* monthly bankroll periods management ([#25](https://github.com/fidehlg89/next_bet-bankroll/issues/25)) ([a42c5f4](https://github.com/fidehlg89/next_bet-bankroll/commit/a42c5f43091ff2da240cb31cf06f295712b33c56))
* **performance:** add values to result distribution pie chart ([#52](https://github.com/fidehlg89/next_bet-bankroll/issues/52)) ([4767503](https://github.com/fidehlg89/next_bet-bankroll/commit/4767503ad0da400674bead7d3486aa69ef857559))
* **performance:** add win/loss/push distribution pie chart ([1547e4f](https://github.com/fidehlg89/next_bet-bankroll/commit/1547e4fe9b23593923d56d8fc2ecd0d323fe8570))
* **performance:** make P&L tipster chart filterable ([#53](https://github.com/fidehlg89/next_bet-bankroll/issues/53)) ([8b6e6b8](https://github.com/fidehlg89/next_bet-bankroll/commit/8b6e6b887df16cee13928d84cc7a99d08c34ca2f))
* **tipsters:** add configuration to hide inactive tipsters ([69b71a1](https://github.com/fidehlg89/next_bet-bankroll/commit/69b71a117ec4d2f22b9cad42728e0fd9e007ac76))
* **ui:** add custom favicon with sports ball and chart arrow ([a65e0dd](https://github.com/fidehlg89/next_bet-bankroll/commit/a65e0dd5720bda93e328f5748b205d1303f76a7a))
* **ui:** add pagination to bet table showing 10 items per page ([b6bbae0](https://github.com/fidehlg89/next_bet-bankroll/commit/b6bbae0c78d42be9f5d36e707ad81a6eafe239a2))
* **ui:** add top loading progress bar for route transitions ([b5a1c4a](https://github.com/fidehlg89/next_bet-bankroll/commit/b5a1c4ac302f87e2a7d42eb6503eebde7467e359))
* **ui:** add total profit to market performance table ([#92](https://github.com/fidehlg89/next_bet-bankroll/issues/92)) ([d9317f9](https://github.com/fidehlg89/next_bet-bankroll/commit/d9317f9823cd1cb941fdbbc49adf4088a18d5b6e))
* **ui:** add UFC, Hockey and Volleyball to allowed MARKETS ([258b52f](https://github.com/fidehlg89/next_bet-bankroll/commit/258b52f1ec7d5910613d77189812751dbefefb73))
* **ui:** enhance pagination with items per page control and first/last page buttons ([e01d687](https://github.com/fidehlg89/next_bet-bankroll/commit/e01d6872c536671b7fe5559077f88703bef8b363))
* **ui:** increase global layout spacing and table padding to min 12px for better readability ([b30abcb](https://github.com/fidehlg89/next_bet-bankroll/commit/b30abcbfaf74b72622260bd28b66aca3c2dde878))


### Bug Fixes

* **api:** improve error extraction in 22bet import route to prevent opaque error messages ([b8cf55b](https://github.com/fidehlg89/next_bet-bankroll/commit/b8cf55b087e561a1d7e02ab796082301ca80168c))
* **bankroll:** deduct pending picks stake from current bankroll ([#30](https://github.com/fidehlg89/next_bet-bankroll/issues/30)) ([a55fa94](https://github.com/fidehlg89/next_bet-bankroll/commit/a55fa943bdb158fd41eae9db91fc43f12d119ad2))
* **bankroll:** remove duplicate plus sign from yield cell ([29e039b](https://github.com/fidehlg89/next_bet-bankroll/commit/29e039b93775dc3e25423186bd591c40d570ccb8))
* **bankroll:** type error in active period banner tests ([#50](https://github.com/fidehlg89/next_bet-bankroll/issues/50)) ([d6d7b20](https://github.com/fidehlg89/next_bet-bankroll/commit/d6d7b20ab0979ebceed28f8b938c5a8ba47f8765))
* **bets:** allow 3 decimal places for stake ([fcb9048](https://github.com/fidehlg89/next_bet-bankroll/commit/fcb90480d575c0381bb31cc6ee66b37d962df64c))
* **bets:** allow odds below 1.01 ([#22](https://github.com/fidehlg89/next_bet-bankroll/issues/22)) ([8f0ee1f](https://github.com/fidehlg89/next_bet-bankroll/commit/8f0ee1f2850a059486be2a563c375107be647cc0))
* **bets:** bypass Supabase 1000 limit to load all bets ([#105](https://github.com/fidehlg89/next_bet-bankroll/issues/105)) ([b19bc11](https://github.com/fidehlg89/next_bet-bankroll/commit/b19bc1148f3f467e5cf73f7db204a3419952dc2e))
* **bets:** hide inactive tipsters from dropdowns ([9541f17](https://github.com/fidehlg89/next_bet-bankroll/commit/9541f17c31b0bfb2454e88876feb11c50bd209d8))
* **bets:** permitir cuota de 0.5 para casos de medio reembolso ([#55](https://github.com/fidehlg89/next_bet-bankroll/issues/55)) ([f0047ef](https://github.com/fidehlg89/next_bet-bankroll/commit/f0047efce392d166240e609b163af23ad4d9d006))
* **bets:** resolve datetime picker timezone offset bug on edit ([3e8f88c](https://github.com/fidehlg89/next_bet-bankroll/commit/3e8f88c96c03c4b65a524a777295a1beb4e7ac36))
* **bets:** resolve timezone offset on import and modification ([#58](https://github.com/fidehlg89/next_bet-bankroll/issues/58)) ([75c1091](https://github.com/fidehlg89/next_bet-bankroll/commit/75c1091813696c8f6de805b1e6401dab5ed20751))
* **bets:** resolve validation error when selecting pending result ([81f55a2](https://github.com/fidehlg89/next_bet-bankroll/commit/81f55a2518a902bb1a6ca777dc67b78c4e907575))
* **chart:** format X-axis dates as DD/MM ([#27](https://github.com/fidehlg89/next_bet-bankroll/issues/27)) ([bff37e1](https://github.com/fidehlg89/next_bet-bankroll/commit/bff37e198f585608badd82929ea34151fdb46270))
* **dashboard:** position bankroll reference labels entirely on the right outside the chart ([2ba3c0f](https://github.com/fidehlg89/next_bet-bankroll/commit/2ba3c0f6e5241e88f1457bd6ee60c3b6554b59f0))
* **dashboard:** remove duplicate adjust bank action from header ([#32](https://github.com/fidehlg89/next_bet-bankroll/issues/32)) ([abc7b2d](https://github.com/fidehlg89/next_bet-bankroll/commit/abc7b2daab665cdb1496590cebca89c7c408e975))
* **dashboard:** reposition reference labels to the left and format negative currency ([0ff208f](https://github.com/fidehlg89/next_bet-bankroll/commit/0ff208f75d1e15af3a411a3e08d07828a87af7fc))
* **dashboard:** set bankroll adjustment amount default to empty string ([#21](https://github.com/fidehlg89/next_bet-bankroll/issues/21)) ([bec4612](https://github.com/fidehlg89/next_bet-bankroll/commit/bec4612f317719eb194ebec654c0a4d2d6ae09df))
* **formatters:** round numbers to fix negative zero display bug ([dbee814](https://github.com/fidehlg89/next_bet-bankroll/commit/dbee81456cc99d306fd9bd7f75ba48ddca0e07d6))
* **import:** migrate from lovable gateway to direct google sheets api ([6c5430a](https://github.com/fidehlg89/next_bet-bankroll/commit/6c5430a36fa91bf8e0f2e748a51baca6ee198b00))
* **lint:** resolve prettier and eslint errors breaking CI ([1361301](https://github.com/fidehlg89/next_bet-bankroll/commit/13613012d0f8ef53d5d531fe6be5b5cf30f4ae6a))
* **performance:** adjust pie chart layout and legend ([#77](https://github.com/fidehlg89/next_bet-bankroll/issues/77)) ([b7da304](https://github.com/fidehlg89/next_bet-bankroll/commit/b7da3046130cbd91eb28293d1857cc8f3b13e8ba))
* **test:** update BankrollAdjustmentModal tests for new hook ([be38c08](https://github.com/fidehlg89/next_bet-bankroll/commit/be38c08be1482448bae3d57d577481ef95862254))
* **ui:** add favicon.ico fallback to prevent browser 404 error ([bd4771d](https://github.com/fidehlg89/next_bet-bankroll/commit/bd4771dd60df14f1b1cdc2ecb439756804c5065f))
* **ui:** add max-height and scroll to tipster lists ([#84](https://github.com/fidehlg89/next_bet-bankroll/issues/84)) ([3a80253](https://github.com/fidehlg89/next_bet-bankroll/commit/3a80253838709aa1337814c2f45dd64d444dfb6c))
* **ui:** add py-6 to BetFiltersBar to forcefully pad filters ([7204bec](https://github.com/fidehlg89/next_bet-bankroll/commit/7204bec1e8616182be68fd9b3a6500fabeaaa747))
* **ui:** align 'Limpiar' button vertically in BetFilters ([#94](https://github.com/fidehlg89/next_bet-bankroll/issues/94)) ([86154fa](https://github.com/fidehlg89/next_bet-bankroll/commit/86154fa1ffdd618ab329b7d0b9c399bbcf835ed7))
* **ui:** constrain auth form width and center on desktop ([#29](https://github.com/fidehlg89/next_bet-bankroll/issues/29)) ([dc8d113](https://github.com/fidehlg89/next_bet-bankroll/commit/dc8d1134c040f4c63dd5c9d4d83c668c2aa49841))
* **ui:** display inactive tipster names in gray ([#86](https://github.com/fidehlg89/next_bet-bankroll/issues/86)) ([bd8ef54](https://github.com/fidehlg89/next_bet-bankroll/commit/bd8ef542cf76b6074ad9597d6f3ae8ca5396e7cf))
* **ui:** import missing PaginationLink component ([9a338ae](https://github.com/fidehlg89/next_bet-bankroll/commit/9a338aee5baeccc81cef8037f710a7550beb3147))
* **ui:** replace 'sincronizar' copy with 'importar' on import page ([#98](https://github.com/fidehlg89/next_bet-bankroll/issues/98)) ([68c63e5](https://github.com/fidehlg89/next_bet-bankroll/commit/68c63e50c260bacb00e5056f24fd8bfed90fbc79))
* **ui:** replace space-y with flex gap for reliable component spacing ([c570cc4](https://github.com/fidehlg89/next_bet-bankroll/commit/c570cc46d4af3b62bc7967cca90e77be3aedd52c))
* **ui:** revert back to space-y-8 ([f8d5ecc](https://github.com/fidehlg89/next_bet-bankroll/commit/f8d5ecc2ed99c7e35e427e634ff6066831ed4a8c))
* **ui:** suppress hydration warning on input component ([a48e1a8](https://github.com/fidehlg89/next_bet-bankroll/commit/a48e1a8a0eae0ff63593431841774c12a14fd01c))
* **ui:** suppress hydration warnings from browser extensions on root layout ([c8a5f9a](https://github.com/fidehlg89/next_bet-bankroll/commit/c8a5f9a5a935f8b6f118664c3ffde129d1f81e90))
* **ui:** suppress hydration warnings on textarea component ([cf8a7a1](https://github.com/fidehlg89/next_bet-bankroll/commit/cf8a7a1b38adf078791e518b2f7df2603c674102))
* **ui:** use ISO strings for datetime picker and fix 22bet import date parsing ([f1e3856](https://github.com/fidehlg89/next_bet-bankroll/commit/f1e3856dcd803306f9f787db5f8d84c4db65eef2))

## [Unreleased]

## [1.8.3] - 2026-08-29

### Fixed
- **Supabase Query Limits**: Implemented auto-paging / chunked queries in batches of 1000 for `bets` and `bankroll_transactions` in order to bypass the PostgREST default maximum row limit of 1000, ensuring users with large betting histories can view all their data on the web app.

## [1.8.2] - 2026-08-24

### Fixed
- **Tipster Dropdown List**: Fixed a bug where tipsters (e.g. TipsPro) were not appearing in the tipster selection dropdown due to the Supabase 1000-row limit on the bets table. The list now correctly queries the `tipsters` table as the primary source of truth.

## [1.8.1] - 2026-08-11

### Changed
- **Dashboard**: Renamed "Aportado" to "Total Aportado" and aligned it horizontally next to the "Inicial" amount in the Bankroll KPI card for better readability.

## [1.8.0] - 2026-08-10

### Added
- **Dashboard**: Added "Total Aportado" (Total Contributed) indicator to the main Bankroll card to clearly show the net funds inserted into the platform (deposits minus withdrawals, including initial bankroll). (#102)

## [1.7.0] - 2026-07-25

### Removed
- **Google Sheet Import**: Removed the Google Sheet import functionality from the UI and backend as it is no longer used, leaving only the 22Bet HTML import.
## [1.6.8] - 2026-07-24

### Fixed
- **Import Page UI**: Replaced all occurrences of the term "sincronizar" with "importar" on the import page to unify the user interface wording around data import (#98).

## [1.6.7] - 2026-07-24

### Added
- **Component Unit Test Coverage**: Added comprehensive Vitest + Testing Library test suites for `MarketTable`, `KpiCards`, `TipsterLeaderboard`, `BestWorstPicks`, `MonthlyStats`, `WinStreak`, and `BetSummary` components (#96).

## [1.6.6] - 2026-07-24

### Fixed
- **Filter Reset Button Alignment**: Fixed height (`h-9`) of the "Limpiar" clear filters button in `BetFilters` component to align seamlessly with adjacent dropdown triggers (#94).

## [1.6.5] - 2026-07-23

### Added
- **Market Table Total Profit**: Added a total profit indicator to the "Rendimiento por mercado" (Market Performance) table header to easily see the overall gain or loss across all markets.

## [1.6.3] - 2026-07-23

### Changed
- **UI Scrollbars**: Implemented thinner custom scrollbars globally across the application for a cleaner and more modern look.

## [1.6.2] - 2026-07-23

### Fixed
- **Inactive Tipsters Display**: Inactive tipsters' names are now displayed in a muted gray color in the leaderboard and monthly tables to easily differentiate them from active tipsters.

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
