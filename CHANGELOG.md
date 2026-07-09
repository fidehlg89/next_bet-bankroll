# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
