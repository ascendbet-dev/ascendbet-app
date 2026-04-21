"use client";

import type { Match, BetSelection } from "@/lib/place-bet-types";
import { MarketOddsButton } from "./MarketOddsButton";

/* ---------- DATE HELPERS ---------- */

function parseMatchDate(dateStr?: string) {
  if (!dateStr) return null;

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  return d;
}

function formatKickoff(dateStr: string) {
  if (!dateStr) return "--:--";

  const d = parseMatchDate(dateStr);
  if (!d) return "--:--";

  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

/* ---------- DATE GROUPING ---------- */

function getGroupLabel(dateStr: string) {
  if (!dateStr) return "UPCOMING";

  const d = parseMatchDate(dateStr);
  if (!d) return "UPCOMING";

  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" })
  );

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "TODAY";
  if (d.toDateString() === tomorrow.toDateString()) return "TOMORROW";

  const day = d.getDate();

  const suffix =
    day === 1 || day === 21 || day === 31 ? "ST" :
    day === 2 || day === 22 ? "ND" :
    day === 3 || day === 23 ? "RD" :
    "TH";

  const month = d.toLocaleDateString("en-GB", { month: "long" }).toUpperCase();

  return `${day}${suffix} ${month}`;
}

/* ---------- BUILD SELECTION ---------- */

function buildSelection(
  match: Match,
  market: string,
  marketLabel: string,
  pick: string,
  pickLabel: string,
  odds: number
): BetSelection {

  const matchEnd = (() => {
    if (!match.date) return new Date().toISOString();

    const d = new Date(match.date);
    if (isNaN(d.getTime())) return new Date().toISOString();

    d.setHours(d.getHours() + 2);
    return d.toISOString();
  })();

  return {
    fixture_id: match.fixture_id,
    external_id: match.external_id,
    source: match.source,

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
    match_end: matchEnd,
  };
}

/* ---------- COMPONENT ---------- */

interface MatchListProps {
  matches: Match[];
  loading: boolean;
  betSlip: BetSelection[];
  onAddSelection: (selection: BetSelection) => void;
  onMatchClick: (match: Match) => void;
}

export function MatchList({
  matches,
  loading,
  betSlip,
  onAddSelection,
  onMatchClick,
}: MatchListProps) {

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted">
        <span className="flex items-center gap-1">
          Loading matches
          <span className="animate-bounce">.</span>
          <span className="animate-bounce delay-150">.</span>
          <span className="animate-bounce delay-300">.</span>
        </span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-border bg-surface p-8">
        <p className="text-sm text-muted text-center">
          No odds available.
        </p>
      </div>
    );
  }

  /* ---------- SORT ---------- */

  const sortedMatches = [...matches].sort((a, b) => {
    const dA = parseMatchDate(a.date);
    const dB = parseMatchDate(b.date);

    return (dA?.getTime() ?? 0) - (dB?.getTime() ?? 0);
  });

  /* ---------- GROUP ---------- */

  const grouped: Record<string, Match[]> = {};

  sortedMatches.forEach((match) => {

    let label = "UPCOMING";

    const d = parseMatchDate(match.date);

    if (d) {
      label = getGroupLabel(match.date);
    }

    if (!grouped[label]) grouped[label] = [];

    grouped[label].push(match);
  });

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto">

      {Object.entries(grouped).map(([group, groupMatches]) => (

        <div key={group}>

          <div className="rounded-lg bg-white/80 px-4 py-2 text-sm font-extrabold tracking-wide text-black shadow-sm">
            {group}
          </div>

          <div className="mt-3 flex flex-col gap-3">

            {groupMatches.map((match) => {

              const markets = match.markets ?? {};

              const o1 = markets?.h2h?.home ?? 0;
              const oX = markets?.h2h?.draw ?? 0;
              const o2 = markets?.h2h?.away ?? 0;

              const oOver = markets?.totals?.over25 ?? 0;
              const oUnder = markets?.totals?.under25 ?? 0;

              const isSelected = (pick: string, market: string) =>
                Array.isArray(betSlip) &&
                betSlip.some(
                  (s) =>
                    s.fixture_id === match.fixture_id &&
                    s.pick === pick &&
                    s.market === market
                );

              return (
                <article
                  key={match.fixture_id}
                  className="rounded-xl border border-border bg-surface p-4 shadow-sm hover:shadow-md"
                >

                  <button
                    type="button"
                    onClick={() => onMatchClick(match)}
                    className="w-full text-left"
                  >

                    <div className="flex items-center justify-between gap-2">

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text">
                          {match.home}
                        </p>
                        <p className="truncate text-sm font-semibold text-text">
                          {match.away}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs font-medium text-muted">
                        {formatKickoff(match.date)}
                      </span>

                    </div>

                    <p className="mt-1 text-[10px] uppercase tracking-wider text-muted">
                      {match.league}
                    </p>

                  </button>

                  <div className="mt-3 flex flex-wrap items-center gap-2">

                    <MarketOddsButton
                      label="1"
                      odds={o1}
                      isSelected={isSelected("home", "1X2")}
                      onClick={() =>
                        onAddSelection(
                          buildSelection(match,"1X2","Match Winner","home",match.home,o1)
                        )
                      }
                      compact
                    />

                    <MarketOddsButton
                      label="X"
                      odds={oX}
                      isSelected={isSelected("draw", "1X2")}
                      onClick={() =>
                        onAddSelection(
                          buildSelection(match,"1X2","Match Winner","draw","Draw",oX)
                        )
                      }
                      compact
                    />

                    <MarketOddsButton
                      label="2"
                      odds={o2}
                      isSelected={isSelected("away", "1X2")}
                      onClick={() =>
                        onAddSelection(
                          buildSelection(match,"1X2","Match Winner","away",match.away,o2)
                        )
                      }
                      compact
                    />

                    <span className="mx-1 h-4 w-px bg-border" />

                    <MarketOddsButton
                      label="Over 2.5"
                      odds={oOver}
                      isSelected={isSelected("over", "OVER_25")}
                      onClick={() =>
                        onAddSelection(
                          buildSelection(match,"OVER_25","Over 2.5","over","Over 2.5",oOver)
                        )
                      }
                      compact
                    />

                    <MarketOddsButton
                      label="Under 2.5"
                      odds={oUnder}
                      isSelected={isSelected("under", "OVER_25")}
                      onClick={() =>
                        onAddSelection(
                          buildSelection(match,"OVER_25","Under 2.5","under","Under 2.5",oUnder)
                        )
                      }
                      compact
                    />

                  </div>

                </article>
              );

            })}

          </div>

        </div>

      ))}

    </div>
  );
}