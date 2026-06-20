UPDATE public.bets
SET bet_date = (bet_date + INTERVAL '1 year')::date
WHERE user_id = '12bc2a8c-f9fd-4409-a75e-3e679041fc81'
  AND bet_date < '2026-01-01';