/**
 * API-Football league IDs for get-matches?league=LEAGUE_ID
 */
export const leagueIds: Record<string, number> = {

  /* 🏴 ENGLAND */
  "Premier League": 39,
  "Championship": 40,
  "League One": 41,
  "League Two": 42,
  "FA Cup": 45,
  "EFL Cup": 48,

  /* 🇪🇸 SPAIN */
  "La Liga": 140,
  "Copa del Rey": 143,

  /* 🇩🇪 GERMANY */
  "Bundesliga": 78,
  "DFB-Pokal": 81,

  /* 🇮🇹 ITALY */
  "Serie A": 135,
  "Coppa Italia": 137,

  /* 🇫🇷 FRANCE */
  "Ligue 1": 61,
  "Coupe de France": 66,

  /* 🇳🇱 NETHERLANDS */
  "Eredivisie": 88,
  "Eerste Divisie": 89,

  /* 🇵🇹 PORTUGAL */
  "Primeira Liga": 94,
  "Taça de Portugal": 95,

  /* 🇧🇷 BRAZIL */
  "Campeonato Brasileiro Série A": 71,

  /* 🇧🇪 BELGIUM */
  "Belgian Pro League": 144,
  "Belgian Cup": 145,

  /* 🇩🇰 DENMARK */
  "Superliga": 119,
  "DBU Pokalen": 120,

  /* 🇮🇱 ISRAEL */
  "Ligat ha'Al": 169,
  "State Cup": 170,

  /* 🇸🇦 SAUDI ARABIA */
  "Saudi Pro League": 307,
  "King Cup": 308,

  /* 🇨🇭 SWITZERLAND */
  "Super League": 207,
  "Swiss Cup": 208,

  /* 🇹🇷 TURKEY */
  "Süper Lig": 203,
  "Turkish Cup": 204,

  /* 🇺🇸 USA */
  "MLS": 253,
  "US Open Cup": 254,

  /* 🌍 UEFA CLUB */
  "Champions League": 2,
  "UEFA Champions League": 2,
  "Europa League": 3,
  "Conference League": 848,

  /* 🌍 INTERNATIONAL */
  "FIFA World Cup": 1,
  "UEFA Nations League": 5,
  "UEFA U21": 6,
  "UEFA U19": 7,

  /* 🌍 INTERNATIONAL (API-FOOTBALL ONLY) */
  "International Friendlies": 10,
  "World Cup Qualification": 11,
  "CAF World Cup Qualification": 12,
  "CONMEBOL World Cup Qualification": 13,
  "AFC World Cup Qualification": 14,
};

/**
 * Get API-Football league ID for a league name
 */
export function getLeagueId(leagueName: string): number | undefined {
  return leagueIds[leagueName] ?? undefined;
}