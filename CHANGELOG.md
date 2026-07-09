# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Timezone Offset (#58)**: Resolved the timezone offset bug that caused bet times (e.g., 21:02) to shift by 1 hour when importing or modifying records. Fixed by explicitly parsing and submitting all dates as UTC, and using `timeZone: "UTC"` in the UI formatters to ensure timezone-agnostic behaviour.
  - Updated `src/shared/lib/formatters.ts` to use UTC timezone in `Intl.DateTimeFormat`.
  - Modified `BetForm.tsx` to handle dates with UTC methods and append `Z` to submitted times.
  - Adjusted `html-22bet-import.functions.ts` to parse dates strictly as UTC using `Date.UTC`.
