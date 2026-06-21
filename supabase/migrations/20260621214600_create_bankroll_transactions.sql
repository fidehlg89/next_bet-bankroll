CREATE TABLE public.bankroll_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'initial')),
  amount NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bankroll_transactions TO authenticated;
GRANT ALL ON public.bankroll_transactions TO service_role;
ALTER TABLE public.bankroll_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_bankroll_transactions_select" ON public.bankroll_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_bankroll_transactions_insert" ON public.bankroll_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_bankroll_transactions_update" ON public.bankroll_transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_bankroll_transactions_delete" ON public.bankroll_transactions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_bankroll_transactions_user_date ON public.bankroll_transactions(user_id, transaction_date DESC);
