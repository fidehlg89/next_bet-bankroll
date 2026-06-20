
-- BETS
CREATE TABLE public.bets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bet_date    DATE NOT NULL,
  event       TEXT,
  market      TEXT NOT NULL CHECK (market IN ('Football','Basketball','Tennis','Baseball','Combinada')),
  pick        TEXT,
  bet_type    TEXT NOT NULL CHECK (bet_type IN ('Simple','Combinada','Bono')),
  tipster     TEXT NOT NULL,
  odds        NUMERIC(6,3) NOT NULL,
  stake       NUMERIC(8,2) NOT NULL,
  result      TEXT CHECK (result IN ('W','L','P')),
  pnl         NUMERIC(8,2),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bets TO authenticated;
GRANT ALL ON public.bets TO service_role;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_bets_select" ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_bets_insert" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_bets_update" ON public.bets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_bets_delete" ON public.bets FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_bets_user_date ON public.bets(user_id, bet_date DESC);
CREATE INDEX idx_bets_tipster ON public.bets(user_id, tipster);
CREATE INDEX idx_bets_market ON public.bets(user_id, market);

-- TIPSTERS
CREATE TABLE public.tipsters (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name    TEXT NOT NULL,
  active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tipsters TO authenticated;
GRANT ALL ON public.tipsters TO service_role;
ALTER TABLE public.tipsters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_tipsters_select" ON public.tipsters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_tipsters_insert" ON public.tipsters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_tipsters_update" ON public.tipsters FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_tipsters_delete" ON public.tipsters FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER bets_updated_at BEFORE UPDATE ON public.bets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- VIEWS
CREATE VIEW public.v_tipster_monthly
WITH (security_invoker = true) AS
SELECT
  user_id,
  tipster,
  DATE_TRUNC('month', bet_date)::DATE AS month,
  COUNT(*)::INT                                                              AS picks,
  COUNT(*) FILTER (WHERE result = 'W')::INT                                  AS wins,
  COUNT(*) FILTER (WHERE result = 'L')::INT                                  AS losses,
  COUNT(*) FILTER (WHERE result = 'P')::INT                                  AS pushes,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'W')::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE result IN ('W','L')), 0) * 100, 2
  )                                                                          AS win_rate,
  ROUND(COALESCE(SUM(pnl),0), 2)                                             AS profit,
  ROUND(COALESCE(SUM(pnl),0) / NULLIF(SUM(stake) FILTER (WHERE bet_type <> 'Bono'), 0) * 100, 2) AS yield
FROM public.bets
WHERE result IS NOT NULL
GROUP BY user_id, tipster, DATE_TRUNC('month', bet_date);

GRANT SELECT ON public.v_tipster_monthly TO authenticated;

CREATE VIEW public.v_market_stats
WITH (security_invoker = true) AS
SELECT
  user_id,
  market,
  COUNT(*)::INT                                                              AS picks,
  COUNT(*) FILTER (WHERE result = 'W')::INT                                  AS wins,
  COUNT(*) FILTER (WHERE result = 'L')::INT                                  AS losses,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'W')::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE result IN ('W','L')), 0) * 100, 2
  )                                                                          AS win_rate,
  ROUND(COALESCE(SUM(pnl),0), 2)                                             AS profit,
  ROUND(COALESCE(SUM(pnl),0) / NULLIF(SUM(stake) FILTER (WHERE bet_type <> 'Bono'), 0) * 100, 2) AS yield
FROM public.bets
WHERE result IS NOT NULL
GROUP BY user_id, market;

GRANT SELECT ON public.v_market_stats TO authenticated;

CREATE VIEW public.v_bankroll_daily
WITH (security_invoker = true) AS
SELECT
  user_id,
  bet_date,
  SUM(COALESCE(pnl,0)) OVER (PARTITION BY user_id ORDER BY bet_date ROWS UNBOUNDED PRECEDING) AS cumulative_pnl,
  SUM(COALESCE(pnl,0)) OVER (PARTITION BY user_id, tipster ORDER BY bet_date ROWS UNBOUNDED PRECEDING) AS cumulative_pnl_tipster,
  tipster
FROM public.bets
WHERE result IS NOT NULL;

GRANT SELECT ON public.v_bankroll_daily TO authenticated;
