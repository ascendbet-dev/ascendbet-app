"use client";

import { useState } from "react";
import type { Match } from "@/lib/place-bet-types";
import { MatchMarkets } from "./MatchMarkets";
import type { BetSelection } from "@/lib/place-bet-types";
import { useBetslipStore } from "@/stores/useBetslipStore";
import { useBetslipBridge } from "@/hooks/useBetslipBridge";

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

  const limited = matches.slice(0, 20);

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

  function renderMatch(m: Match) {
    const homeOdds = m.markets?.h2h?.home;
    const drawOdds = m.markets?.h2h?.draw;
    const awayOdds = m.markets?.h2h?.away;

    return (
      <div
        key={m.fixture_id}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          openMatch(m);
        }}
        className="flex items-center justify-between border-t border-border px-3 py-3 cursor-pointer"
      >
        <div>
          <p className="text-sm font-semibold text-white">{m.home}</p>
          <p className="text-sm font-semibold text-white">{m.away}</p>
          <p className="text-xs text-muted mt-1">{formatTime(m.date)}</p>
        </div>

        <div className="flex gap-2">
          {oddsButton(m, "home", homeOdds)}
          {oddsButton(m, "draw", drawOdds)}
          {oddsButton(m, "away", awayOdds)}
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