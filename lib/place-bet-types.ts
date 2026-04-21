export interface Match {
  fixture_id: number;
  league: string;
  home: string;
  away: string;
  date: string;
  external_id: string;
  source: string;
  markets?: any
}

export interface BetSelection {
  fixture_id: number;
  market: string;
  marketLabel: string;
  pick: string;
  pickLabel: string;
  odds: number;
  external_id: string;
  source: string;

  home?: string
  away?: string
  
  home_team: string
  away_team: string
  
  match_start: string;
  match_end: string;
}

export const SINGLE_ODDS_MIN = 1.8;
export const SINGLE_ODDS_MAX = 2.5;
export const ACC_LEG_ODDS_MIN = 1.3;
export const ACC_LEG_ODDS_MAX = 2.5;
export const MIN_STAKE = 500;
export const MAX_STAKE = 2000;
