ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS external_id text;
CREATE UNIQUE INDEX IF NOT EXISTS bets_user_external_id_unique
  ON public.bets (user_id, external_id)
  WHERE external_id IS NOT NULL;