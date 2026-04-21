import type { Match, BetSelection } from "./place-bet-types";

export function formatKickoff(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function formatCurrency(n: number): string {
  return `₦${n.toLocaleString()}`;
}

export function getMatchEnd(dateStr: string): string {
  const d = new Date(dateStr);
  d.setHours(d.getHours() + 2);
  return d.toISOString();
}

export function buildSelection(
  match: Match,
  market: string,
  marketLabel: string,
  pick: string,
  pickLabel: string,
  odds: number
): BetSelection {

  return {
    fixture_id: match.fixture_id,
    external_id: match.external_id,
    source: match.source, // 🔥 ADD THIS
    market,
    marketLabel,
    pick,
    pickLabel,
    odds,
    home: match.home,
    away: match.away,
    home_team: match.home,
    away_team: match.away,
    match_start: match.date,
    match_end: getMatchEnd(match.date),
  };
}
