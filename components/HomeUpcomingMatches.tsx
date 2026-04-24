"use client";

import { useState } from "react";
import type { Match } from "@/lib/place-bet-types";
import { MatchMarkets } from "./MatchMarkets";
import type { BetSelection } from "@/lib/place-bet-types";
import { useBetslipStore } from "@/stores/useBetslipStore";
import { useBetslipBridge } from "@/hooks/useBetslipBridge";
import { COUNTRY_LEAGUES } from "@/lib/league-data";


export function HomeUpcomingMatches({ matches }: { matches: Match[] }) {

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // ✅ SINGLE SOURCE OF TRUTH
  const selections = useBetslipStore((s) => s.selections);
  const { addToSlip } = useBetslipBridge({
    setSlipOpen: (v) => {
      window.dispatchEvent(new CustomEvent("openBetslip"));
    },
    setPlaceError: () => {},
    setPlaceSuccess: () => {},
  });

  const selectionMap = new Map(
    selections.map(s => [
      `${s.fixture_id}-${s.market}-${s.pick}`,
      true
    ])
  );


  /* ---------- OPEN MATCH ---------- */
  function openMatch(match: Match) {
    const normalizedMatch = {
      ...match,
      date: match.date || new Date().toISOString(),
      home_team: match.home,
      away_team: match.away,
      match_start: match.date || new Date().toISOString(),
      match_end: match.date || new Date().toISOString(),
    };

    setSelectedMatch(normalizedMatch as any);
  }

  /* ---------- HELPERS ---------- */

  function formatTime(date: string) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getDayLabel(date: string) {
    const d = new Date(date);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const matchDay = new Date(d);
    matchDay.setHours(0, 0, 0, 0);

    if (matchDay.getTime() === today.getTime()) return "Today";
    if (matchDay.getTime() === tomorrow.getTime()) return "Tomorrow";

    return "Next";
  }

  const seen = new Set();

const uniqueMatches = matches.filter((m) => {
  const key = `${m.home?.toLowerCase()}-${m.away?.toLowerCase()}-${new Date(m.date).toDateString()}`;

  if (seen.has(key)) return false;

  seen.add(key);
  return true;
});

const limited = uniqueMatches.slice(0, 20);

  const grouped = {
    Today: limited.filter(m => {
      const now = new Date();
      return new Date(m.date) > now && getDayLabel(m.date) === "Today";
    }),
    Tomorrow: limited.filter(m => getDayLabel(m.date) === "Tomorrow"),
    Next: limited.filter(m => getDayLabel(m.date) === "Next"),
  };

  function isSelected(fixture_id: string | number, market: string, pick: string) {
    return selectionMap.has(`${fixture_id}-${market}-${pick}`);
  }

  /* ---------- BET HANDLER (SAFE) ---------- */
function handleSelection(selection: BetSelection) {
  if (!selection.external_id) {
    console.log("❌ BLOCKED: Missing external_id", selection);
    return;
  }

  if (!selection.odds) {
    console.log("❌ BLOCKED: Missing odds", selection);
    return;
  }

  addToSlip(selection);
}


/* ---------- ODDS BUTTON (FIXED) ---------- */
function oddsButton(
  match: Match,
  pick: "home" | "draw" | "away",
  value: number | undefined
) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        // ❌ HARD STOP invalid data
        if (!value) return;

        if (!match.external_id) {
          console.log("❌ Missing external_id, skipping match:", match);
          return;
        }

        const selection: BetSelection = {
          fixture_id: match.fixture_id,

          // ✅ NO fallback
          external_id: match.external_id,

          source: match.source,

          market: "1X2",
          marketLabel: "Match Winner",

          pick,
          pickLabel:
            pick === "home"
              ? match.home
              : pick === "away"
              ? match.away
              : "Draw",

          odds: value,

          home_team: match.home,
          away_team: match.away,

          match_start: match.date,
          match_end: match.date,
        };


        handleSelection(selection);
      }}
      className={`w-[56px] h-[38px] rounded-md border border-border text-sm font-semibold transition
      ${
        isSelected(match.fixture_id, "1X2", pick)
          ? "bg-accent text-white"
          : "bg-bg-primary hover:bg-accent/20"
      }`}
    >
      {value ?? "-"}
    </button>
  );
}

const LEAGUE_CODE_MAP: Record<string, string> = {
  PL: "Premier League",
  PD: "La Liga",
  BL1: "Bundesliga",
  SA: "Serie A",
  FL1: "Ligue 1",
  DED: "Eredivisie",
  PPL: "Primeira Liga",
  BPL: "Belgian Pro League",
  ELC: "England Championship",
  TSL: "Süper Lig",
};

function getLeagueCountry(league?: string) {
  if (!league) return null;

  const leagueName = LEAGUE_CODE_MAP[league] ?? league;

  for (const country in COUNTRY_LEAGUES) {
    if (COUNTRY_LEAGUES[country].includes(leagueName)) {
      return `${country} • ${leagueName}`;
    }
  }

  return leagueName;
}

const TOP_5_LEAGUES = [
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
];

function renderMatch(m: Match) {
  const homeOdds = m.markets?.h2h?.home;
  const drawOdds = m.markets?.h2h?.draw;
  const awayOdds = m.markets?.h2h?.away;

  const leagueLabel = getLeagueCountry(m.league);
  const leagueName = LEAGUE_CODE_MAP[m.league] ?? m.league;
  const isTopLeague = TOP_5_LEAGUES.includes(leagueName);

  return (
    <div
      key={m.fixture_id}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        openMatch(m);
      }}
      className="border-t border-border/60 px-2 py-3 cursor-pointer hover:bg-white/5 transition"
    >
      {/* 🔥 HEADER (HOT + TIME + LEAGUE) */}
      <div className="flex items-center text-[10px] text-muted mb-1 -mx-2 pl-0">

          {/* CHIP → TOUCHES WALL */}
          <span
  className={`
    flex items-center gap-1 pl-1.5 pr-2 py-[2px] text-[10px] font-medium rounded
    ${isTopLeague
      ? "bg-gradient-to-r from-red-300/15 via-orange-500/15 to-green-500/15 border border-green-400/30 text-green-300"
      : "bg-gradient-to-r from-red-500/15 to-orange-500/15 border border-red-400/30 text-red-300"
    }
  `}
>
  {isTopLeague ? (
    <>
      <span className="text-red-300">🔥</span>
      <span className="text-red-300">HOT</span>
      <span className="mx-[2px] text-white/30">•</span>
      <span className="text-green-300">BEST ODDS</span>
    </>
  ) : (
    <>
      <span>🔥</span>
      <span>HOT</span>
    </>
  )}
</span>

          {/* TIME */}
          <span className="ml-2">
            {formatTime(m.date)}
          </span>

          {/* LEAGUE → spaced + right aligned */}
          {leagueLabel && (
            <span className="ml-auto mr-2 text-purple-300 text-[10px] truncate">
              {leagueLabel}
            </span>
          )}

        </div>

      {/* 🧠 MAIN ROW */}
      <div className="flex items-center justify-between">

        {/* TEAMS */}
        <div className="flex flex-col text-sm leading-tight">
          <span className="text-white">{m.home}</span>
          <span className="text-white">{m.away}</span>
        </div>

        {/* ODDS */}
        <div className="flex gap-2">
          {oddsButton(m, "home", homeOdds)}
          {oddsButton(m, "draw", drawOdds)}
          {oddsButton(m, "away", awayOdds)}
        </div>

      </div>
    </div>
  );
}

  function Header({ title }: { title: string }) {
    return (
      <div className="flex justify-between bg-white/80 text-[11px] font-bold text-black px-3 py-2">
        <span>{title}</span>
        <div className="flex gap-2">
          <span className="w-[56px] text-center">1</span>
          <span className="w-[56px] text-center">X</span>
          <span className="w-[56px] text-center">2</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`rounded-xl border border-border overflow-hidden ${selectedMatch ? "blur-sm" : ""}`}>

        {grouped.Today.length > 0 && (
          <>
            <Header title="Today" />
            {grouped.Today.map(renderMatch)}
          </>
        )}

        {grouped.Tomorrow.length > 0 && (
          <>
            <Header title="Tomorrow" />
            {grouped.Tomorrow.map(renderMatch)}
          </>
        )}

        {grouped.Next.length > 0 && (
          <>
            <Header title="Next" />
            {grouped.Next.map(renderMatch)}
          </>
        )}

      </div>

      {selectedMatch && (
        <MatchMarkets
          match={selectedMatch}
          betSlip={selections}
          onAddSelection={handleSelection}
          onRemoveSelection={handleSelection}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </>
  );
}