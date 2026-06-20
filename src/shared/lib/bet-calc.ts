import type { BetResult } from "@/features/bets/types/bet.types";

/** W: stake × (odds − 1) · L: −stake · P: 0 */
export const calcPnL = (stake: number, odds: number, result: BetResult): number => {
  if (result === "W") return parseFloat((stake * (odds - 1)).toFixed(2));
  if (result === "L") return parseFloat((-stake).toFixed(2));
  return 0;
};

export const calcYield = (profit: number, staked: number): number =>
  staked === 0 ? 0 : parseFloat(((profit / staked) * 100).toFixed(2));

export const calcWinRate = (wins: number, losses: number): number =>
  wins + losses === 0 ? 0 : parseFloat(((wins / (wins + losses)) * 100).toFixed(2));

/** Racha actual: positivo = W, negativo = L. Asume bets ordenadas DESC por fecha. */
export const calcCurrentStreak = (bets: { result?: BetResult | null }[]): number => {
  const settled = bets.filter((b) => b.result === "W" || b.result === "L");
  if (!settled.length) return 0;
  const last = settled[0].result;
  let count = 0;
  for (const b of settled) {
    if (b.result !== last) break;
    count++;
  }
  return last === "W" ? count : -count;
};
