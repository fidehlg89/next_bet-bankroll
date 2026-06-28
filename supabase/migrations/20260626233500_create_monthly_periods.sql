-- ============================================================
-- Monthly Bankroll Periods
-- Each row represents one calendar month of betting activity.
-- Only one period per user can be "open" (closing_balance IS NULL).
-- ============================================================

CREATE TABLE public.monthly_periods (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- First day of the month this period covers (e.g. 2026-07-01)
  period_month     DATE        NOT NULL,
  -- Bankroll at the start of this period (manual or carried over from previous closing)
  opening_balance  NUMERIC(10,2) NOT NULL,
  -- Bankroll at the close of this period. NULL means the period is still open.
  closing_balance  NUMERIC(10,2) DEFAULT NULL,
  notes            TEXT        DEFAULT NULL,
  -- Timestamp when the period was explicitly closed
  closed_at        TIMESTAMPTZ DEFAULT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Enforce one record per user per month
  CONSTRAINT uq_monthly_periods_user_month UNIQUE (user_id, period_month)
);

-- ── Grants ──────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_periods TO authenticated;
GRANT ALL ON public.monthly_periods TO service_role;

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE public.monthly_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monthly_periods_select" ON public.monthly_periods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "monthly_periods_insert" ON public.monthly_periods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "monthly_periods_update" ON public.monthly_periods
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "monthly_periods_delete" ON public.monthly_periods
  FOR DELETE USING (auth.uid() = user_id);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_monthly_periods_user_month
  ON public.monthly_periods(user_id, period_month DESC);

-- ── updated_at trigger ───────────────────────────────────────
-- Reuses the set_updated_at() function already created in the initial migration.
CREATE TRIGGER monthly_periods_updated_at
  BEFORE UPDATE ON public.monthly_periods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
