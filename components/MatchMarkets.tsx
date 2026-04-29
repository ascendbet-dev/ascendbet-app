"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { Match, BetSelection } from "@/lib/place-bet-types";
import { MarketOddsButton } from "./MarketOddsButton";
import Tooltip from "@/components/ui/Tooltip"; 

function getMarketInfo(title: string): string {
  const map: Record<string, string> = {
    "Match Winner":
      "Predict which team wins the match. 1 = Home, X = Draw, 2 = Away.",

    "Double Chance":
      "Covers two outcomes in one selection (1X, X2, or 12). Safer but lower odds.",

    "Goals Over / Under":
      "Predict total goals scored in the match above or below a line.",

    "Both Teams To Score":
      "Yes if both teams score at least one goal, No otherwise.",

    "Handicap":
      "Virtual goal advantage/disadvantage given to a team before match starts.",

    "Team Totals":
      "Predict how many goals a specific team will score.",

    "1st Half - Over/Under":
      "Total goals scored in the first half only.",

    "2nd Half - Over/Under":
      "Total goals scored in the second half only.",

    "Home Team to Win Both Halves":
      "Home team must win both halves.",

    "Away Team to Win Both Halves":
      "Away team must win both halves.",

    "Home Team to Win Either Halves":
      "Home team must win first half or second half.",

    "Away Team to Win Either Halves":
      "Away team must win first half or second half.",

    "Home Team to Win to Nil":
      "Home team must win the match without conceding.",

    "Away Team to Win to Nil":
      "Home team must win the match without conceding.",

    "Highest Scoring Half":
      "Predict which half will have more goals.",

    "Both Halves Over 1.5":
      "Each half must have at least 2 goals.",

    "Both Halves Under 1.5":
      "Each half must have 0 or 1 goal.",

    "1X2 & Over/Under 2.5":
      "Combination of match result and total goals.",
    
    "1X2 & GG/NG":
    "Combination of match result and both teams must score.",

    "Over/Under & GG/NG":
    "Total goals score and both teams must score.",

    "Win or GG":
      "Team must win OR both teams must score.",

    "Win or Over/Under 2.5":
      "Team must win OR total goals condition must be met.",
  };

  return map[title] || "Market information not available.";
}

/* ---------------- BUILD SELECTION ---------------- */

function buildSelection(
  match: Match,
  market: string,
  marketLabel: string,
  pick: string,
  pickLabel: string,
  odds: number
): BetSelection {


  const matchEnd = (() => {
    const d = new Date(match.date);
    d.setHours(d.getHours() + 2);
    return d.toISOString();
  })();

  return {
    fixture_id: match.fixture_id,
    external_id: (match as any).external_id,
    market,
    source:
    match.source ??
    (typeof match.fixture_id === "string" &&
    isNaN(Number(match.fixture_id))
      ? "sportsdb"
      : "football-data"),
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

/* ---------------- COLLAPSIBLE MARKET ---------------- */


function MarketSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="mb-6">

      <div className="flex items-center justify-between border-b border-border pb-2">

        <div className="flex items-center gap-1.5">

          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {title}
          </p>

          {/* 🔥 TOOLTIP HERE */}
          <Tooltip
            title={title}
            content={getMarketInfo(title)}
          />

        </div>

        <button onClick={() => setOpen(!open)}>
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

      </div>

      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

interface MatchMarketsProps {
  match: Match | null;
  betSlip: BetSelection[];
  onAddSelection: (selection: BetSelection) => void;
  onRemoveSelection: (selection: BetSelection) => void;
  onClose: () => void;
}

export function MatchMarkets({
  match,
  betSlip,
  onAddSelection,
  onRemoveSelection,
  onClose,
}: MatchMarketsProps) {

  if (!match) return null;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const markets = (match as any).markets ?? {};

  const handicap = markets?.asian_handicap ?? {};
  const teamTotals = markets?.team_totals ?? {};
  const halves = markets?.halves ?? {};
  const halfResults = markets?.half_results ?? {}
  const firstHalf = markets?.first_half_totals ?? {}
  const secondHalf = markets?.second_half_totals ?? {}
  const highestHalf = markets?.highest_scoring_half ?? {}
  const combo = markets?.combo ?? {};
  const winOr = markets?.win_or || {}

  const isSelected = (pick: string, market: string) =>
    betSlip.some(
      (s) =>
        s.fixture_id === match.fixture_id &&
        s.pick === pick &&
        s.market === market
    );

    function toggleSelection(selection: BetSelection){
      onAddSelection(selection);
    }

  return (
    <>
      {/* BACKDROP */}

      <div
      className="fixed bottom-[52px] left-1/2 -translate-x-1/2 w-full max-w-[420px] top-[80px] z-40 bg-black/5"
      onClick={onClose}
    />

     {/* MODAL */}
     <div className="fixed bottom-[52px] left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50 flex items-end">
     <div className="w-full h-[calc(100dvh-109px)] px-2 bg-bg-primary border border-border rounded-2xl flex flex-col">

        {/* HEADER */}

        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-muted hover:bg-surface hover:text-text"
            aria-label="Close"
          >
            ←
          </button>
          <h2 className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-text">
            {match.home} vs {match.away}
          </h2>
          <span className="w-10 shrink-0" aria-hidden />
        </div>

        {/* MARKETS */}

        <div 
        data-scroll-container
        className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-10">

          {/* MATCH WINNER */}

          <MarketSection title="Match Winner">

            <div className="grid grid-cols-3 gap-2">

              <MarketOddsButton label="1" odds={markets?.h2h?.home ?? 0}
                isSelected={isSelected("home","1X2")}
                onClick={() =>
                  toggleSelection(buildSelection(match,"1X2","Match Winner","home","1",markets?.h2h?.home ?? 0))
                }
              />

              <MarketOddsButton label="X" odds={markets?.h2h?.draw ?? 0}
                isSelected={isSelected("draw","1X2")}
                onClick={() =>
                  toggleSelection(buildSelection(match,"1X2","Match Winner","draw","X",markets?.h2h?.draw ?? 0))
                }
              />

              <MarketOddsButton label="2" odds={markets?.h2h?.away ?? 0}
                isSelected={isSelected("away","1X2")}
                onClick={() =>
                  toggleSelection(buildSelection(match,"1X2","Match Winner","away","2",markets?.h2h?.away ?? 0))
                }
              />

            </div>

          </MarketSection>

          {/* DOUBLE CHANCE */}

          <MarketSection title="Double Chance">

            <div className="grid grid-cols-3 gap-2">

              <MarketOddsButton label="1X"
                odds={markets?.double_chance?.home_draw ?? 0}
                isSelected={isSelected("1x","DOUBLE_CHANCE")}
                onClick={() =>
                  toggleSelection(buildSelection(match,"DOUBLE_CHANCE","Double Chance","1x","1X",markets?.double_chance?.home_draw ?? 0))
                }
              />

              <MarketOddsButton label="12"
                odds={markets?.double_chance?.home_away ?? 0}
                isSelected={isSelected("12","DOUBLE_CHANCE")}
                onClick={() =>
                  toggleSelection(buildSelection(match,"DOUBLE_CHANCE","Double Chance","12","12",markets?.double_chance?.home_away ?? 0))
                }
              />

              <MarketOddsButton label="X2"
                odds={markets?.double_chance?.away_draw ?? 0}
                isSelected={isSelected("x2","DOUBLE_CHANCE")}
                onClick={() =>
                  toggleSelection(buildSelection(match,"DOUBLE_CHANCE","Double Chance","x2","X2",markets?.double_chance?.away_draw ?? 0))
                }
              />

            </div>

          </MarketSection>

          {/* OVER UNDER */}

          <MarketSection title="Goals Over / Under">

            <table className="w-full text-xs border border-border rounded-lg overflow-hidden">

              <thead className="bg-surface text-muted">
                <tr>
                  <th className="p-2"></th>
                  <th className="p-2 text-center">Over</th>
                  <th className="p-2 text-center">Under</th>
                </tr>
              </thead>

              <tbody>

                {[0.5,1.5,2.5,3.5,4.5].map((line)=>{

                  const key = line.toString().replace(".","")

                  const over = markets?.totals?.[`over${key}`] ?? 0
                  const under = markets?.totals?.[`under${key}`] ?? 0

                  return(

                    <tr key={line} className="border-t border-border">

                      <td className="p-2 font-medium text-text">
                        {line}
                      </td>

                      <td className="p-1 text-center">

                        <MarketOddsButton
                          label=""
                          odds={over}
                          isSelected={isSelected(`over${line}`,"TOTALS")}
                          onClick={() =>
                            toggleSelection(buildSelection(match,"TOTALS","Over",`over${line}`,`Over ${line}`,over))
                          }
                        />

                      </td>

                      <td className="p-1 text-center">

                        <MarketOddsButton
                          label=""
                          odds={under}
                          isSelected={isSelected(`under${line}`,"TOTALS")}
                          onClick={() =>
                            toggleSelection(buildSelection(match,"TOTALS","Under",`under${line}`,`Under ${line}`,under))
                          }
                        />

                      </td>

                    </tr>

                  )

                })}

              </tbody>

            </table>

          </MarketSection>

          {/* BTTS */}

          <MarketSection title="Both Teams To Score">

            <div className="grid grid-cols-2 gap-2">

              <MarketOddsButton label="Yes"
                odds={markets?.btts?.yes ?? 0}
                isSelected={isSelected("yes","BTTS")}
                onClick={() =>
                  toggleSelection(buildSelection(match,"BTTS","BTTS","yes","Yes",markets?.btts?.yes ?? 0))
                }
              />

              <MarketOddsButton label="No"
                odds={markets?.btts?.no ?? 0}
                isSelected={isSelected("no","BTTS")}
                onClick={() =>
                  toggleSelection(buildSelection(match,"BTTS","BTTS","no","No",markets?.btts?.no ?? 0))
                }
              />

            </div>

          </MarketSection>

          {/* ASIAN HANDICAP */}

          <MarketSection title="Handicap">

          <table className="w-full text-xs border border-border rounded-lg overflow-hidden">

          <thead className="bg-surface text-muted">
          <tr>
          <th className="p-2 text-left"></th>
          <th className="p-2 text-center">{match.home}</th>
          <th className="p-2 text-center">{match.away}</th>
          </tr>
          </thead>

          <tbody>

          {[
          {label:-1.5, home:"home_minus15", away:"away_plus15", mirror:false},
          {label:-1, home:"home_minus1", away:"away_plus1", mirror:false},
          {label:-0.5, home:"home_minus05", away:"away_plus05", mirror:false},

          {label:+0.5, home:"away_plus05", away:"home_minus05", mirror:true},
          {label:+1, home:"away_plus1", away:"home_minus1", mirror:true},
          {label:+1.5, home:"away_plus15", away:"home_minus15", mirror:true}

          ].map((row)=>{

          const homeOdds = handicap?.[row.home] ?? 0
          const awayOdds = handicap?.[row.away] ?? 0

          /* create unique keys for mirrored rows */

          const homeKey = row.mirror ? `${row.home}_mirror` : row.home
          const awayKey = row.mirror ? `${row.away}_mirror` : row.away

          return(

          <tr key={row.label} className="border-t border-border">

          <td className="p-2 font-medium text-text">
          {row.label > 0 ? `+${row.label}` : row.label}
          </td>

          <td className="p-1 text-center">

          <MarketOddsButton
          label=""
          odds={homeOdds}
          isSelected={isSelected(homeKey,"HANDICAP")}
          onClick={()=>toggleSelection(
          buildSelection(
          match,
          "HANDICAP",
          "Handicap",
          homeKey,
          `Home ${row.label}`,
          homeOdds
          )
          )}
          />

          </td>

          <td className="p-1 text-center">

          <MarketOddsButton
          label=""
          odds={awayOdds}
          isSelected={isSelected(awayKey,"HANDICAP")}
          onClick={()=>toggleSelection(
          buildSelection(
          match,
          "HANDICAP",
          "Handicap",
          awayKey,
          `Away ${row.label}`,
          awayOdds
          )
          )}
          />

          </td>

          </tr>

          )

          })}

          </tbody>
          </table>

          </MarketSection>

          {/* TEAM TOTALS */}

            <MarketSection title="Team Totals">

            {[match.home, match.away].map((team,i)=>{

            const prefix = i === 0 ? "home" : "away"

            return(

            <div key={team} className="mb-6">

            <div className="text-xs font-semibold text-muted mb-2">
            {team}
            </div>

            <table className="w-full text-xs border border-border rounded-lg overflow-hidden">

            <thead className="bg-surface text-muted">
            <tr>
            <th className="p-2"></th>
            <th className="p-2 text-center">Over</th>
            <th className="p-2 text-center">Under</th>
            </tr>
            </thead>

            <tbody>

            {[0.5,1.5,2.5].map((line)=>{

            const key = String(line).replace(".","")

            const overKey = `${prefix}_over${key}`
            const underKey = `${prefix}_under${key}`

            const overOdds = teamTotals?.[overKey] ?? 0
            const underOdds = teamTotals?.[underKey] ?? 0

            return(

            <tr key={line} className="border-t border-border">

            <td className="p-2 font-medium text-text">
            {line}
            </td>

            <td className="p-1 text-center">

            <MarketOddsButton
            label=""
            odds={overOdds}
            isSelected={isSelected(overKey,"TEAM_TOTALS")}
            onClick={()=>toggleSelection(
            buildSelection(
            match,
            "TEAM_TOTALS",
            `${team} Over`,
            overKey,
            `over_${line}`,
            overOdds
            )
            )}
            />

            </td>

            <td className="p-1 text-center">

            <MarketOddsButton
            label=""
            odds={underOdds}
            isSelected={isSelected(underKey,"TEAM_TOTALS")}
            onClick={()=>toggleSelection(
            buildSelection(
            match,
            "TEAM_TOTALS",
            `${team} Under`,
            underKey,
            `under_${line}`,
            underOdds
            )
            )}
            />

            </td>

            </tr>

            )

            })}

            </tbody>
            </table>

            </div>

            )

            })}

            </MarketSection>

          {/* BOTH HALVES OVER 1.5 */}

          <MarketSection title="Both Halves Over 1.5">

          <div className="grid grid-cols-2 gap-2">

          <MarketOddsButton
          label="Yes"
          odds={halves?.both_halves_over15 ?? 0}
          isSelected={isSelected("bh_over_yes","BOTH_HALVES")}
          onClick={()=>toggleSelection(
          buildSelection(
          match,
          "BOTH_HALVES",
          "Both Halves Over 1.5",
          "bh_over_yes",
          "Yes",
          halves?.both_halves_over15 ?? 0
          )
          )}
          />

          <MarketOddsButton
          label="No"
          odds={halves?.both_halves_over15_no ?? 0}
          isSelected={isSelected("bh_over_no","BOTH_HALVES")}
          onClick={()=>toggleSelection(
          buildSelection(
          match,
          "BOTH_HALVES",
          "Both Halves Over 1.5",
          "bh_over_no",
          "No",
          halves?.both_halves_over15_no ?? 0
          )
          )}
          />

          </div>

          </MarketSection>

          <MarketSection title="Both Halves Under 1.5">

          <div className="grid grid-cols-2 gap-2">

          <MarketOddsButton
          label="Yes"
          odds={halves?.both_halves_under15 ?? 0}
          isSelected={isSelected("bh_under_yes","BOTH_HALVES")}
          onClick={()=>toggleSelection(
          buildSelection(
          match,
          "BOTH_HALVES",
          "Both Halves Under 1.5",
          "bh_under_yes",
          "Yes",
          halves?.both_halves_under15 ?? 0
          )
          )}
          />

          <MarketOddsButton
          label="No"
          odds={halves?.both_halves_under15_no ?? 0}
          isSelected={isSelected("bh_under_no","BOTH_HALVES")}
          onClick={()=>toggleSelection(
          buildSelection(
          match,
          "BOTH_HALVES",
          "Both Halves Under 1.5",
          "bh_under_no",
          "No",
          halves?.both_halves_under15_no ?? 0
          )
          )}
          />

          </div>

          </MarketSection>

          {/* FIRST HALF TOTALS */}

          <MarketSection title="1st Half - Over/Under">

            <table className="w-full text-xs border border-border rounded-lg overflow-hidden">

            <thead className="bg-surface text-muted">
            <tr>
            <th className="p-2 text-left"></th>
            <th className="p-2 text-center">Over</th>
            <th className="p-2 text-center">Under</th>
            </tr>
            </thead>

            <tbody>

            {[
            {line:"0.5", over:"over05", under:"under05"},
            {line:"1.5", over:"over15", under:"under15"},
            {line:"2.5", over:"over25", under:"under25"},
            ].map(row=>{

            const overOdds = firstHalf?.[row.over] ?? 0
            const underOdds = firstHalf?.[row.under] ?? 0

            return(

            <tr key={row.line} className="border-t border-border">

            <td className="p-2">{row.line}</td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={overOdds}
            isSelected={isSelected(row.over,"FIRST_HALF")}
            onClick={()=>toggleSelection(
            buildSelection(match,"FIRST_HALF","1st Half Over/Under",row.over,`Over ${row.line}`,overOdds)
            )}
            />
            </td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={underOdds}
            isSelected={isSelected(row.under,"FIRST_HALF")}
            onClick={()=>toggleSelection(
            buildSelection(match,"FIRST_HALF","1st Half Over/Under",row.under,`Under ${row.line}`,underOdds)
            )}
            />
            </td>

            </tr>

            )

            })}

            </tbody>
            </table>

            </MarketSection>

          {/* SECOND HALF TOTALS */}

          <MarketSection title="2nd Half - Over/Under">

            <table className="w-full text-xs border border-border rounded-lg overflow-hidden">

            <thead className="bg-surface text-muted">
            <tr>
            <th className="p-2 text-left"></th>
            <th className="p-2 text-center">Over</th>
            <th className="p-2 text-center">Under</th>
            </tr>
            </thead>

            <tbody>

            {[
            {line:"0.5", over:"over05", under:"under05"},
            {line:"1.5", over:"over15", under:"under15"},
            {line:"2.5", over:"over25", under:"under25"},
            ].map(row=>{

            const overOdds = secondHalf?.[row.over] ?? 0
            const underOdds = secondHalf?.[row.under] ?? 0

            return(

            <tr key={row.line} className="border-t border-border">

            <td className="p-2">{row.line}</td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={overOdds}
            isSelected={isSelected(row.over,"SECOND_HALF")}
            onClick={()=>toggleSelection(
            buildSelection(match,"SECOND_HALF","2nd Half Over/Under",row.over,`Over ${row.line}`,overOdds)
            )}
            />
            </td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={underOdds}
            isSelected={isSelected(row.under,"SECOND_HALF")}
            onClick={()=>toggleSelection(
            buildSelection(match,"SECOND_HALF","2nd Half Over/Under",row.under,`Under ${row.line}`,underOdds)
            )}
            />
            </td>

            </tr>

            )

            })}

            </tbody>
            </table>

          </MarketSection>

          {/* HALF RESULT MARKETS */}

          <MarketSection title="Home Team to Win Both Halves">

          <div className="grid grid-cols-2 gap-2">

          <MarketOddsButton
          label="Yes"
          odds={halfResults.home_win_both_yes ?? 0}
          isSelected={isSelected("home_win_both_yes","HALF_RESULTS")}
          onClick={()=>toggleSelection(
          buildSelection(match,"HALF_RESULTS","Home Win Both Halves","home_win_both_yes","Yes",halfResults.home_win_both_yes)
          )}
          />

          <MarketOddsButton
          label="No"
          odds={halfResults.home_win_both_no ?? 0}
          isSelected={isSelected("home_win_both_no","HALF_RESULTS")}
          onClick={()=>toggleSelection(
          buildSelection(match,"HALF_RESULTS","Home Win Both Halves","home_win_both_no","No",halfResults.home_win_both_no)
          )}
          />

          </div>

          </MarketSection>


          <MarketSection title="Away Team to Win Both Halves">

          <div className="grid grid-cols-2 gap-2">

          <MarketOddsButton
          label="Yes"
          odds={halfResults.away_win_both_yes ?? 0}
          isSelected={isSelected("away_win_both_yes","HALF_RESULTS")}
          onClick={()=>toggleSelection(
          buildSelection(match,"HALF_RESULTS","Away Win Both Halves","away_win_both_yes","Yes",halfResults.away_win_both_yes)
          )}
          />

          <MarketOddsButton
          label="No"
          odds={halfResults.away_win_both_no ?? 0}
          isSelected={isSelected("away_win_both_no","HALF_RESULTS")}
          onClick={()=>toggleSelection(
          buildSelection(match,"HALF_RESULTS","Away Win Both Halves","away_win_both_no","No",halfResults.away_win_both_no)
          )}
          />

          </div>

          </MarketSection>


          <MarketSection title="Home Team to Win Either Half">

          <div className="grid grid-cols-2 gap-2">

          <MarketOddsButton
          label="Yes"
          odds={halfResults.home_win_either_yes ?? 0}
          isSelected={isSelected("home_win_either_yes","HALF_RESULTS")}
          onClick={()=>toggleSelection(
          buildSelection(match,"HALF_RESULTS","Home Win Either Half","home_win_either_yes","Yes",halfResults.home_win_either_yes)
          )}
          />

          <MarketOddsButton
          label="No"
          odds={halfResults.home_win_either_no ?? 0}
          isSelected={isSelected("home_win_either_no","HALF_RESULTS")}
          onClick={()=>toggleSelection(
          buildSelection(match,"HALF_RESULTS","Home Win Either Half","home_win_either_no","No",halfResults.home_win_either_no)
          )}
          />

          </div>

          </MarketSection>


          <MarketSection title="Away Team to Win Either Half">

          <div className="grid grid-cols-2 gap-2">

          <MarketOddsButton
          label="Yes"
          odds={halfResults.away_win_either_yes ?? 0}
          isSelected={isSelected("away_win_either_yes","HALF_RESULTS")}
          onClick={()=>toggleSelection(
          buildSelection(match,"HALF_RESULTS","Away Win Either Half","away_win_either_yes","Yes",halfResults.away_win_either_yes)
          )}
          />

          <MarketOddsButton
          label="No"
          odds={halfResults.away_win_either_no ?? 0}
          isSelected={isSelected("away_win_either_no","HALF_RESULTS")}
          onClick={()=>toggleSelection(
          buildSelection(match,"HALF_RESULTS","Away Win Either Half","away_win_either_no","No",halfResults.away_win_either_no)
          )}
          />

          </div>

          </MarketSection>


          <MarketSection title="Home Team to Win to Nil">

          <div className="grid grid-cols-2 gap-2">

          <MarketOddsButton
          label="Yes"
          odds={halfResults.home_win_nil_yes ?? 0}
          isSelected={isSelected("home_win_nil_yes","HALF_RESULTS")}
          onClick={()=>toggleSelection(
          buildSelection(match,"HALF_RESULTS","Home Win to Nil","home_win_nil_yes","Yes",halfResults.home_win_nil_yes)
          )}
          />

          <MarketOddsButton
          label="No"
          odds={halfResults.home_win_nil_no ?? 0}
          isSelected={isSelected("home_win_nil_no","HALF_RESULTS")}
          onClick={()=>toggleSelection(
          buildSelection(match,"HALF_RESULTS","Home Win to Nil","home_win_nil_no","No",halfResults.home_win_nil_no)
          )}
          />

          </div>

          </MarketSection>


          <MarketSection title="Away Team to Win to Nil">

          <div className="grid grid-cols-2 gap-2">

          <MarketOddsButton
          label="Yes"
          odds={halfResults.away_win_nil_yes ?? 0}
          isSelected={isSelected("away_win_nil_yes","HALF_RESULTS")}
          onClick={()=>toggleSelection(
          buildSelection(match,"HALF_RESULTS","Away Win to Nil","away_win_nil_yes","Yes",halfResults.away_win_nil_yes)
          )}
          />

          <MarketOddsButton
          label="No"
          odds={halfResults.away_win_nil_no ?? 0}
          isSelected={isSelected("away_win_nil_no","HALF_RESULTS")}
          onClick={()=>toggleSelection(
          buildSelection(match,"HALF_RESULTS","Away Win to Nil","away_win_nil_no","No",halfResults.away_win_nil_no)
          )}
          />

          </div>

          </MarketSection>

          {/* HIGHEST SCORING HALF */}

          <MarketSection title="Highest Scoring Half">

            <div className="grid grid-cols-3 gap-2">

            <MarketOddsButton
            label="1st Half"
            odds={highestHalf.first_half ?? 0}
            isSelected={isSelected("first_half","HIGHEST_HALF")}
            onClick={()=>toggleSelection(
            buildSelection(match,"HIGHEST_HALF","Highest Scoring Half","first_half","1st Half",highestHalf.first_half)
            )}
            />

            <MarketOddsButton
            label="2nd Half"
            odds={highestHalf.second_half ?? 0}
            isSelected={isSelected("second_half","HIGHEST_HALF")}
            onClick={()=>toggleSelection(
            buildSelection(match,"HIGHEST_HALF","Highest Scoring Half","second_half","2nd Half",highestHalf.second_half)
            )}
            />

            <MarketOddsButton
            label="Equal"
            odds={highestHalf.equal ?? 0}
            isSelected={isSelected("equal","HIGHEST_HALF")}
            onClick={()=>toggleSelection(
            buildSelection(match,"HIGHEST_HALF","Highest Scoring Half","equal","Equal",highestHalf.equal)
            )}
            />

            </div>

          </MarketSection>
            
          {/* COMBO */}

          <MarketSection title="1X2 & Over/Under 1.5">

            <table className="w-full text-xs border border-border rounded-lg overflow-hidden">

            <thead className="bg-surface text-muted">
            <tr>
            <th className="p-2"></th>
            <th className="p-2 text-center">Under 1.5</th>
            <th className="p-2 text-center">Over 1.5</th>
            </tr>
            </thead>

            <tbody>

            <tr className="border-t border-border">

            <td className="p-2 font-medium">Home</td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={combo.home_under15 ?? 0}
            isSelected={isSelected("home_under15","COMBO")}
            onClick={()=>toggleSelection(
            buildSelection(match,"COMBO","Home & Under 1.5","home_under15","Home & Under 1.5",combo.home_under15)
            )}
            />
            </td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={combo.home_over15 ?? 0}
            isSelected={isSelected("home_over15","COMBO")}
            onClick={()=>toggleSelection(
            buildSelection(match,"COMBO","Home & Over 1.5","home_over15","Home & Over 1.5",combo.home_over15)
            )}
            />
            </td>

            </tr>

            <tr className="border-t border-border">

            <td className="p-2 font-medium">Draw</td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={combo.draw_under15 ?? 0}
            isSelected={isSelected("draw_under15","COMBO")}
            onClick={()=>toggleSelection(
            buildSelection(match,"COMBO","Draw & Under 1.5","draw_under15","Draw & Under 1.5",combo.draw_under15)
            )}
            />
            </td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={combo.draw_over15 ?? 0}
            isSelected={isSelected("draw_over15","COMBO")}
            onClick={()=>toggleSelection(
            buildSelection(match,"COMBO","Draw & Over 1.5","draw_over15","Draw & Over 1.5",combo.draw_over15)
            )}
            />
            </td>

            </tr>

            <tr className="border-t border-border">

            <td className="p-2 font-medium">Away</td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={combo.away_under15 ?? 0}
            isSelected={isSelected("away_under15","COMBO")}
            onClick={()=>toggleSelection(
            buildSelection(match,"COMBO","Away & Under 1.5","away_under15","Away & Under 1.5",combo.away_under15)
            )}
            />
            </td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={combo.away_over15 ?? 0}
            isSelected={isSelected("away_over15","COMBO")}
            onClick={()=>toggleSelection(
            buildSelection(match,"COMBO","Away & Over 1.5","away_over15","Away & Over 1.5",combo.away_over15)
            )}
            />
            </td>

            </tr>

            </tbody>
            </table>

          </MarketSection>
          
          <MarketSection title="1X2 & Over/Under 2.5">

            <table className="w-full text-xs border border-border rounded-lg overflow-hidden">

            <thead className="bg-surface text-muted">
            <tr>
            <th className="p-2"></th>
            <th className="p-2 text-center">Under 2.5</th>
            <th className="p-2 text-center">Over 2.5</th>
            </tr>
            </thead>

            <tbody>

            <tr className="border-t border-border">
            <td className="p-2 font-medium">Home</td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={combo.home_under25 ?? 0}
            isSelected={isSelected("home_under25","COMBO")}
            onClick={()=>toggleSelection(
            buildSelection(match,"COMBO","Home & Under 2.5","home_under25","Home & Under 2.5",combo.home_under25)
            )}
            />
            </td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={combo.home_over25 ?? 0}
            isSelected={isSelected("home_over25","COMBO")}
            onClick={()=>toggleSelection(
            buildSelection(match,"COMBO","Home & Over 2.5","home_over25","Home & Over 2.5",combo.home_over25)
            )}
            />
            </td>
            </tr>

            <tr className="border-t border-border">
            <td className="p-2 font-medium">Draw</td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={combo.draw_under25 ?? 0}
            isSelected={isSelected("draw_under25","COMBO")}
            onClick={()=>toggleSelection(
            buildSelection(match,"COMBO","Draw & Under 2.5","draw_under25","Draw & Under 2.5",combo.draw_under25)
            )}
            />
            </td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={combo.draw_over25 ?? 0}
            isSelected={isSelected("draw_over25","COMBO")}
            onClick={()=>toggleSelection(
            buildSelection(match,"COMBO","Draw & Over 2.5","draw_over25","Draw & Over 2.5",combo.draw_over25)
            )}
            />
            </td>
            </tr>

            <tr className="border-t border-border">
            <td className="p-2 font-medium">Away</td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={combo.away_under25 ?? 0}
            isSelected={isSelected("away_under25","COMBO")}
            onClick={()=>toggleSelection(
            buildSelection(match,"COMBO","Away & Under 2.5","away_under25","Away & Under 2.5",combo.away_under25)
            )}
            />
            </td>

            <td className="p-1 text-center">
            <MarketOddsButton
            label=""
            odds={combo.away_over25 ?? 0}
            isSelected={isSelected("away_over25","COMBO")}
            onClick={()=>toggleSelection(
            buildSelection(match,"COMBO","Away & Over 2.5","away_over25","Away & Over 2.5",combo.away_over25)
            )}
            />
            </td>
            </tr>

            </tbody>
            </table>

          </MarketSection>

          <MarketSection title="1X2 & GG/NG">

          <table className="w-full text-xs border border-border rounded-lg overflow-hidden">

          <thead className="bg-surface/80 text-muted text-[11px] uppercase tracking-wide">
            <tr className="h-8 border-b border-border">

              {/* LABEL COLUMN */}
              <th className="px-3 text-left font-medium">
                {/* empty intentionally */}
              </th>

              {/* YES */}
              <th className="text-center font-medium">
                Yes
              </th>

              {/* NO */}
              <th className="text-center font-medium">
                No
              </th>

            </tr>
          </thead>

          <tbody>

          <tr className="border-t border-border">
          <td className="p-2 font-medium">Home</td>

          <td className="px-2 py-2 text-center">
          <MarketOddsButton
          label=""
          odds={combo.home_btts ?? 0}
          isSelected={isSelected("home_btts","COMBO")}
          onClick={()=>toggleSelection(
          buildSelection(match,"COMBO","Home & BTTS","home_btts","Home & Yes",combo.home_btts)
          )}
          />
          </td>

          <td className="px-2 py-2 text-center">
          <MarketOddsButton
          label=""
          odds={combo.home_btts_no ?? 0}
          isSelected={isSelected("home_btts_no","COMBO")}
          onClick={()=>toggleSelection(
          buildSelection(match,"COMBO","Home & BTTS","home_btts_no","Home & No",combo.home_btts_no)
          )}
          />
          </td>

          </tr>

          <tr className="border-t border-border">
          <td className="p-2 font-medium">Draw</td>

          <td className="text-center p-1">
          <MarketOddsButton
          label=""
          odds={combo.draw_btts ?? 0}
          isSelected={isSelected("draw_btts","COMBO")}
          onClick={()=>toggleSelection(
          buildSelection(match,"COMBO","Draw & BTTS","draw_btts","Draw & Yes",combo.draw_btts)
          )}
          />
          </td>

          <td className="text-center p-1">
          <MarketOddsButton
          label=""
          odds={combo.draw_btts_no ?? 0}
          isSelected={isSelected("draw_btts_no","COMBO")}
          onClick={()=>toggleSelection(
          buildSelection(match,"COMBO","Draw & BTTS","draw_btts_no","Draw & No",combo.draw_btts_no)
          )}
          />
          </td>

          </tr>

          <tr className="border-t border-border">
          <td className="p-2 font-medium">Away</td>

          <td className="text-center p-1">
          <MarketOddsButton
          label=""
          odds={combo.away_btts ?? 0}
          isSelected={isSelected("away_btts","COMBO")}
          onClick={()=>toggleSelection(
          buildSelection(match,"COMBO","Away & BTTS","away_btts","Away & Yes",combo.away_btts)
          )}
          />
          </td>

          <td className="text-center p-1">
          <MarketOddsButton
          label=""
          odds={combo.away_btts_no ?? 0}
          isSelected={isSelected("away_btts_no","COMBO")}
          onClick={()=>toggleSelection(
          buildSelection(match,"COMBO","Away & BTTS","away_btts_no","Away & No",combo.away_btts_no)
          )}
          />
          </td>

          </tr>

          </tbody>
          </table>

          </MarketSection>

          <MarketSection title="Over/Under & GG/NG">

          <table className="w-full text-xs border border-border rounded-lg overflow-hidden">

          <thead className="bg-surface/80 text-muted text-[11px] uppercase tracking-wide">
          <tr className="h-8 border-b border-border">

            {/* LABEL COLUMN */}
            <th className="px-3 text-left font-medium">
              {/* empty intentionally */}
            </th>

            {/* YES */}
            <th className="text-center font-medium">
              Yes
            </th>

            {/* NO */}
            <th className="text-center font-medium">
              No
            </th>

          </tr>
        </thead>

          <tbody>

          <tr className="border-t border-border">
          <td className="p-2 font-medium">Over 2.5</td>

          <td className="text-center p-1">
          <MarketOddsButton
          label=""
          odds={combo.over25_btts ?? 0}
          isSelected={isSelected("over25_btts","COMBO")}
          onClick={()=>toggleSelection(
          buildSelection(match,"COMBO","Over 2.5 & BTTS","over25_btts","Yes",combo.over25_btts)
          )}
          />
          </td>

          <td className="text-center p-1">
          <MarketOddsButton
          label=""
          odds={combo.over25_btts_no ?? 0}
          isSelected={isSelected("over25_btts_no","COMBO")}
          onClick={()=>toggleSelection(
          buildSelection(match,"COMBO","Over 2.5 & BTTS","over25_btts_no","No",combo.over25_btts_no)
          )}
          />
          </td>

          </tr>

          <tr className="border-t border-border">
          <td className="p-2 font-medium">Under 2.5</td>

          <td className="text-center p-1">
          <MarketOddsButton
          label=""
          odds={combo.under25_btts ?? 0}
          isSelected={isSelected("under25_btts","COMBO")}
          onClick={()=>toggleSelection(
          buildSelection(match,"COMBO","Under 2.5 & BTTS","under25_btts","Yes",combo.under25_btts)
          )}
          />
          </td>

          <td className="text-center p-1">
          <MarketOddsButton
          label=""
          odds={combo.under25_btts_no ?? 0}
          isSelected={isSelected("under25_btts_no","COMBO")}
          onClick={()=>toggleSelection(
          buildSelection(match,"COMBO","Under 2.5 & BTTS","under25_btts_no","No",combo.under25_btts_no)
          )}
          />
          </td>

          </tr>

          </tbody>
          </table>

          </MarketSection>

         {/* WIN OR OVER/UNDER 2.5 */}

          <MarketSection title="Win or Over/Under 2.5">

          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">

          <thead className="bg-surface text-muted">
          <tr className="h-8">
          <th className="px-3"></th>
          <th className="text-center px-3">Yes</th>
          <th className="text-center px-3">No</th>
          </tr>
          </thead>

          <tbody>

          <tr className="border-b border-border h-12">
          <td className="px-3 py-3 font-medium">Home or Over 2.5</td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.home_or_over25 ?? 0}
          isSelected={isSelected("home_or_over25","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Home or Over 2.5","home_or_over25","Yes",winOr.home_or_over25)
          )}
          compact
          />
          </td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.home_or_over25_no ?? 0}
          isSelected={isSelected("home_or_over25_no","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Home or Over 2.5","home_or_over25_no","No",winOr.home_or_over25_no)
          )}
          compact
          />
          </td>
          </tr>


          <tr className="border-b border-border h-12">
          <td className="px-3 py-3 font-medium">Home or Under 2.5</td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.home_or_under25 ?? 0}
          isSelected={isSelected("home_or_under25","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Home or Under 2.5","home_or_under25","Yes",winOr.home_or_under25)
          )}
          compact
          />
          </td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.home_or_under25_no ?? 0}
          isSelected={isSelected("home_or_under25_no","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Home or Under 2.5","home_or_under25_no","No",winOr.home_or_under25_no)
          )}
          compact
          />
          </td>
          </tr>


          <tr className="border-b border-border h-12">
          <td className="px-3 py-3 font-medium">Draw or Over 2.5</td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.draw_or_over25 ?? 0}
          isSelected={isSelected("draw_or_over25","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Draw or Over 2.5","draw_or_over25","Yes",winOr.draw_or_over25)
          )}
          compact
          />
          </td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.draw_or_over25_no ?? 0}
          isSelected={isSelected("draw_or_over25_no","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Draw or Over 2.5","draw_or_over25_no","No",winOr.draw_or_over25_no)
          )}
          compact
          />
          </td>
          </tr>


          <tr className="border-b border-border h-12">
          <td className="px-3 py-3 font-medium">Draw or Under 2.5</td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.draw_or_under25 ?? 0}
          isSelected={isSelected("draw_or_under25","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Draw or Under 2.5","draw_or_under25","Yes",winOr.draw_or_under25)
          )}
          compact
          />
          </td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.draw_or_under25_no ?? 0}
          isSelected={isSelected("draw_or_under25_no","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Draw or Under 2.5","draw_or_under25_no","No",winOr.draw_or_under25_no)
          )}
          compact
          />
          </td>
          </tr>


          <tr className="border-b border-border h-12">
          <td className="px-3 py-3 font-medium">Away or Over 2.5</td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.away_or_over25 ?? 0}
          isSelected={isSelected("away_or_over25","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Away or Over 2.5","away_or_over25","Yes",winOr.away_or_over25)
          )}
          compact
          />
          </td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.away_or_over25_no ?? 0}
          isSelected={isSelected("away_or_over25_no","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Away or Over 2.5","away_or_over25_no","No",winOr.away_or_over25_no)
          )}
          compact
          />
          </td>
          </tr>


          <tr className="h-12">
          <td className="px-3 py-3 font-medium">Away or Under 2.5</td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.away_or_under25 ?? 0}
          isSelected={isSelected("away_or_under25","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Away or Under 2.5","away_or_under25","Yes",winOr.away_or_under25)
          )}
          compact
          />
          </td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.away_or_under25_no ?? 0}
          isSelected={isSelected("away_or_under25_no","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Away or Under 2.5","away_or_under25_no","No",winOr.away_or_under25_no)
          )}
          compact
          />
          </td>
          </tr>

          </tbody>
          </table>

          </MarketSection>

        {/* WIN OR GG */}

          <MarketSection title="Win or GG">

          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">

          <thead className="bg-surface text-muted">
          <tr className="h-8">
          <th className="px-3"></th>
          <th className="text-center px-3">Yes</th>
          <th className="text-center px-3">No</th>
          </tr>
          </thead>

          <tbody>

          <tr className="border-b border-border h-12">
          <td className="px-3 py-3 font-medium">Home or GG</td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.home_or_gg ?? 0}
          isSelected={isSelected("home_or_gg","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Home or GG","home_or_gg","Yes",winOr.home_or_gg)
          )}
          compact
          />
          </td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.home_or_gg_no ?? 0}
          isSelected={isSelected("home_or_gg_no","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Home or GG","home_or_gg_no","No",winOr.home_or_gg_no)
          )}
          compact
          />
          </td>
          </tr>


          <tr className="border-b border-border h-12">
          <td className="px-3 py-3 font-medium">Draw or GG</td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.draw_or_gg ?? 0}
          isSelected={isSelected("draw_or_gg","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Draw or GG","draw_or_gg","Yes",winOr.draw_or_gg)
          )}
          compact
          />
          </td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.draw_or_gg_no ?? 0}
          isSelected={isSelected("draw_or_gg_no","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Draw or GG","draw_or_gg_no","No",winOr.draw_or_gg_no)
          )}
          compact
          />
          </td>
          </tr>


          <tr className="h-12">
          <td className="px-3 py-3 font-medium">Away or GG</td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.away_or_gg ?? 0}
          isSelected={isSelected("away_or_gg","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Away or GG","away_or_gg","Yes",winOr.away_or_gg)
          )}
          compact
          />
          </td>

          <td className="text-center py-2">
          <MarketOddsButton
          label=""
          odds={winOr.away_or_gg_no ?? 0}
          isSelected={isSelected("away_or_gg_no","WIN_OR")}
          onClick={()=>toggleSelection(
          buildSelection(match,"WIN_OR","Away or GG","away_or_gg_no","No",winOr.away_or_gg_no)
          )}
          compact
          />
          </td>
          </tr>

          </tbody>
          </table>

          </MarketSection>

        </div>
      </div>
      </div>

    </>
  );
}