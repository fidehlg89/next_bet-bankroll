export type BetResult = "W" | "L" | "P";
export type BetType = "Simple" | "Combinada" | "Bono";
export type Market =
  | "Football"
  | "Basketball"
  | "Tennis"
  | "Baseball"
  | "Combinada"
  | "Hockey"
  | "Volleyball"
  | "UFC";

export interface Bet {
  id: string;
  user_id: string;
  bet_date: string;
  event: string | null;
  market: Market;
  pick: string | null;
  bet_type: BetType;
  tipster: string;
  odds: number;
  stake: number;
  result: BetResult | null;
  pnl: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BetStats {
  totalPicks: number;
  wins: number;
  losses: number;
  pushes: number;
  pending: number;
  winRate: number;
  profit: number;
  yield: number;
  avgOdds: number;
  avgStake: number;
  /** Suma solo de transacciones tipo "initial" → se muestra como "Inicial X €" */
  initialBankroll: number;
  /** Suma de TODAS las transacciones → el bankroll real actual */
  baseBankroll: number;
  currentBankroll: number;
  bestWin: number;
  worstLoss: number;
  currentStreak: number;
  totalStaked: number;
}

export interface TipsterStat {
  tipster: string;
  picks: number;
  wins: number;
  losses: number;
  winRate: number;
  profit: number;
  yield: number;
}

export interface MarketStat {
  market: Market;
  picks: number;
  wins: number;
  losses: number;
  winRate: number;
  profit: number;
  yield: number;
}

export interface DailyBankroll {
  date: string;
  cumulativePnl: number;
}
