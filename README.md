# BankrollOS

BankrollOS is a comprehensive sports betting bankroll management application. It allows users to import, track, and analyze their betting history, profit and loss (PnL), and tipster performance.

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **Supabase** (PostgreSQL, Authentication, Row Level Security)
- **shadcn/ui** for UI components

## Architecture Overview

The project follows a feature-based Clean Architecture:

- `app/` (Routing Layer): Next.js Route Handlers (`api/`), Pages, and Layouts.
- `src/features/` (Domain Layer): Self-contained modules (e.g., `bets`, `bankroll`, `dashboard`, `auth`). Each feature contains its own `components/`, `hooks/`, `schemas/`, and `services/`.
- `src/shared/` (Shared Layer): Cross-feature components (like `shadcn/ui`), hooks, and utilities.
- `src/lib/` (Infrastructure Layer): Supabase client configurations, integrations, and external tools.

## Local Setup & Installation

### Prerequisites

- Node.js (version 20+ recommended)
- A Supabase project for database and authentication

### 1. Clone the repository

```bash
git clone https://github.com/fidehlg89/next_bet-bankroll.git
cd next_bet-bankroll
```

### 2. Install dependencies

```bash
npm install
```

_(Or use `pnpm`, `yarn`, `bun` depending on your preferred package manager)_

### 3. Environment Variables

Create a `.env.local` file in the root of your project and configure your Supabase variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` — Starts the Next.js development server.
- `npm run build` — Builds the application for production.
- `npm start` — Starts the production server.
- `npm run lint` — Runs Next.js ESLint.
- `npm run format` — Formats the code using Prettier.
- `npm run test` — Runs the Vitest test suite.
- `npm run test:watch` — Runs Vitest in watch mode.
