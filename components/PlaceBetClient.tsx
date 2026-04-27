"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Match, BetSelection } from "@/lib/place-bet-types";
import { LEAGUE_CODE_MAP } from "@/lib/league-map";
import { LeagueSidebar } from "./LeagueSidebar";
import { MatchList } from "./MatchList";
import { MatchMarkets } from "./MatchMarkets";
import { BetSlip } from "./BetSlip";
import { BetPlacedModal } from "./BetPlacedModal";
import { useBetslipBridge } from "@/hooks/useBetslipBridge";
import { useBetslipStore } from "@/stores/useBetslipStore";
import { MobileFrame, FrameOverlay } from "@/components/MobileFrame";
import { useSearchParams } from "next/navigation";
import DashboardLoader from "@/components/DashboardLoader";


interface Props {
  balance: number;
  seasonInstanceId: string;
}

export function PlaceBetClient({ balance, seasonInstanceId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isBetslipPage = pathname === "/betslip";

  const [currentBalance, setCurrentBalance] = useState(balance);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // ✅ SINGLE STATE SYSTEM
  const initialState =
  typeof window !== "undefined" && !window.location.search.includes("fresh=1")
    ? JSON.parse(localStorage.getItem("placebet_state") || "{}")
    : {};

  const [activeLeague, setActiveLeague] = useState<string | null>(
    initialState.activeLeague || null
  )

  const [viewMode, setViewMode] = useState<"leagues" | "matches">(
    initialState.viewMode || "leagues"
  )

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const [slipOpen, setSlipOpen] = useState(false);

  const betSlip = useBetslipStore((s) => s.selections);
  const setSelections = useBetslipStore((s) => s.setSelections);

  const searchParams = useSearchParams();
  const fresh = searchParams.get("fresh");
  const fixtureFromUrl = searchParams.get("fixture");


  const [openingFromExternal, setOpeningFromExternal] = useState(false);
  const scrollPositions = useRef<Record<string, number>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);
  

  const {
    addToSlip,
    removeFromSlip,
    removeSelection,
    clearSlip,
  } = useBetslipBridge({
    setSlipOpen,
    setPlaceError: () => {},
    setPlaceSuccess: () => {},
  });

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [placeSuccess, setPlaceSuccess] = useState<string | null>(null);

  const [betPlaced, setBetPlaced] = useState(false);
  const [placedTicketId, setPlacedTicketId] = useState<string | null>(null);

  const [seasonEnd, setSeasonEnd] = useState<string | null>(null);
  const [allMatches, setAllMatches] = useState<Match[]>([]);

  const [pulling, setPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [canPull, setCanPull] = useState(false);

  /* ---------------- FETCH MATCHES ---------------- */

  useEffect(() => {
    async function fetchMatches() {
      setLoadingMatches(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-odds`
        );
        const data = await res.json();

        let raw: any[] = data.matches || [];

        // 🔥 PRIORITIZE football-data
        raw.sort((a, b) => {
          if (a.source === "football-data" && b.source !== "football-data") return -1;
          if (a.source !== "football-data" && b.source === "football-data") return 1;
          return 0;
        });


      // ✅ normalize FIRST
      const normalized: Match[] = raw.map((m: any) => {

        const rawDate =
          m.commence_time ||
          m.date ||
          m.kickoff ||
          null;

        let isoDate: string | null = null;

        if (rawDate) {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            isoDate = d.toISOString();
          }
        }
        

        return {
          ...m,
          date: isoDate ?? "", // always string for your type
        };
      });
      
      setAllMatches(normalized); // ✅ store full dataset

      const now = Date.now()

      let filtered = normalized.filter(m => {
        if (!m.date) return false

        const kickoff = new Date(m.date).getTime()
        return kickoff > now
      })

      const seen = new Set()

      filtered = filtered.filter(m => {
        if (seen.has(m.fixture_id)) return false
        seen.add(m.fixture_id)
        return true
      })

        if (activeLeague) {
          const code = LEAGUE_CODE_MAP[activeLeague];
        
          filtered = filtered.filter((m) =>
            code ? m.league === code : m.league === activeLeague
          );
        }

      setMatches(filtered);

      } catch {
        setMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    }

    fetchMatches();
  }, [activeLeague]);

  /* ---------------- READ QUERY PARAM---------------- */

  useEffect(() => {
    if (!fixtureFromUrl || allMatches.length === 0) return;
  
    const match = allMatches.find(
      (m) => String(m.fixture_id) === String(fixtureFromUrl)
    );
  
    if (match) {
      setSelectedMatch(match);
      setActiveLeague(match.league); // 🔥 add this
      setViewMode("matches");
      setOpeningFromExternal(false);
    
      router.replace("/place-bet");
    }
  }, [fixtureFromUrl, allMatches]);

  /* ---------------- DETECT URL---------------- */

  useEffect(() => {
    if (fixtureFromUrl) {
      setOpeningFromExternal(true);
    }
  }, [fixtureFromUrl]);

  /* ---------------- BETSLIP OPEN & CLOSE ---------------- */

  useEffect(() => {
    (window as any).ascendbetBack = () => {
  
      // 1. If betslip open → close it FIRST
      if (slipOpen) {
        setSlipOpen(false);
        return;
      }
  
      // 2. If match modal open → close it
      if (selectedMatch) {
        setSelectedMatch(null);
        return;
      }
  
      // 3. If in matches view → go back to leagues
      if (viewMode === "matches") {
        scrollPositions.current[`matches-${activeLeague}`] = scrollRef.current?.scrollTop || 0
      
        setViewMode("leagues");
        setActiveLeague(null);
        return;
      }
  
      // 4. If league selected → clear it
      if (activeLeague) {
        setActiveLeague(null);
        return;
      }
  
      // 5. Otherwise → leave page
      router.push("/dashboard");
    };
  
    return () => {
      (window as any).ascendbetBack = null;
    };
  
  }, [slipOpen, selectedMatch, viewMode, activeLeague]);

  /* ---------------- SCROLL MODE ---------------- */

  useEffect(() => {
    const key =
      viewMode === "leagues"
        ? "leagues"
        : `matches-${activeLeague}`
  
    const saved = scrollPositions.current[key] ?? 0
  
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = saved
      }
    })
  }, [viewMode, activeLeague, matches])


  useEffect(() => {
    localStorage.setItem(
      "placebet_state",
      JSON.stringify({
        activeLeague,
        viewMode,
      })
    )
  }, [activeLeague, viewMode])

  useEffect(() => {
    if (selectedMatch && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [selectedMatch])

  useEffect(() => {
    if (fresh === "1") {
      // 🔥 RESET STATE
      setActiveLeague(null);
      setViewMode("leagues");
  
      // 🔥 CLEAR OLD STATE
      localStorage.removeItem("placebet_state");
  
      // 🔥 CLEAN URL (VERY IMPORTANT)
      router.replace("/place-bet");
    }
  }, [fresh]);

  /* ---------------- PLACE BET ---------------- */

  async function handlePlaceBet(stake: number) {
    if (betSlip.length === 0) return;

    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    setPlacing(true);


    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/place-ticket`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            season_instance_id: seasonInstanceId,
            stake,
            ticket_type: betSlip.length <= 1 ? "single" : "accumulator",
            selections: betSlip.map((s) => ({
              fixture_id: s.fixture_id,
              external_id: s.external_id,
              source: s.source,
            
              market: s.market,
              marketLabel: s.marketLabel,
            
              selection: s.pick,
              pickLabel: s.pickLabel,
            
              odds: s.odds,
            
              home_team: (s as any).home_team ?? (s as any).home,
              away_team: (s as any).away_team ?? (s as any).away,
            
              match_start: s.match_start,
              match_end: s.match_end,
            }))
          })
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setPlaceError(result.error);
        return;
      }

      setCurrentBalance(result.new_balance);
      setPlacedTicketId(result.ticket_id);
      setBetPlaced(true);
    } finally {
      setPlacing(false);
    }
  }

  if (openingFromExternal) {
    return <DashboardLoader />;
  }

  /* ---------------- UI ---------------- */

  return (
    <MobileFrame>

      {/* MAIN */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-0.2 h-[calc(100dvh-100px)] overflow-y-auto no-scrollbar"

        onTouchStart={(e) => {
          if (scrollRef.current?.scrollTop === 0) {
            setStartY(e.touches[0].clientY);
            setCanPull(true);
          } else {
            setCanPull(false);
          }
        }}
        
        onTouchMove={(e) => {
          if (!canPull) return;
        
          const currentY = e.touches[0].clientY;
        
          if (currentY - startY > 70) {
            setPulling(true);
          }
        
          if (currentY - startY < 30) {
            setPulling(false);
          }
        }}
        
        onTouchEnd={() => {
          if (pulling && canPull) {
            router.refresh();
          }
        
          setPulling(false);
          setCanPull(false);
        }}
      >
        <div className="relative">
        <div
          className={`absolute top-0 left-0 right-0 text-center text-xs transition-all duration-200 ${
            pulling ? "opacity-100 translate-y-0 text-purple-400" : "opacity-0 -translate-y-2"
          }`}
        >
          Release to refresh...
        </div>
      </div>

        {/* LEAGUES */}
        {viewMode === "leagues" && (
          <LeagueSidebar
            selectedLeague={activeLeague}
            onSelectLeague={(league) => {
              scrollPositions.current["leagues"] =
                scrollRef.current?.scrollTop || 0
            
              setActiveLeague(league)
            
              // ❌ DO NOT open matches here
              // setViewMode("matches") ← REMOVE THIS
            }}
          />
        )}

        {/* MATCHES */}
        {viewMode === "matches" && (
          <main className="flex-1 pb-28">
            <MatchList
              matches={matches}
              loading={loadingMatches}
              betSlip={betSlip}
              onAddSelection={addToSlip}
              onMatchClick={(match) => {
                scrollPositions.current[`matches-${activeLeague}`] = scrollRef.current?.scrollTop || 0
                setSelectedMatch(match)
              }}
            />
          </main>
        )}

      </div>

      {/* CLEAR / VIEW BAR */}
      {!slipOpen && activeLeague && viewMode === "leagues" && (
        <div className="fixed bottom-[40px] left-1/2 -translate-x-1/2 w-full max-w-[420px] z-40 border-t border-border bg-bg-primary px-3 pt-3 pb-5">
          <div className="flex gap-2">

          <button
              onClick={() => {
                setActiveLeague(null)
                setSelectedMatch(null)
              }}
              className="flex-1 border border-border rounded-md py-2 text-xs"
            >
              Clear
            </button>

            <button
               onClick={() => {
                scrollPositions.current[`matches-${activeLeague}`] = 0
                setViewMode("matches")
              }}
              className="flex-1 bg-accent text-white rounded-md py-2 text-xs"
            >
              View
            </button>

          </div>
        </div>
      )}

      {/* FLOATING BET BUTTON */}
      {!slipOpen && betSlip.length > 0 && (
        <div className="fixed bottom-30 left-1/2 -translate-x-1/2 w-full max-w-[420px] flex justify-end pr-2 z-40">
        <button     
            onClick={() => setSlipOpen(true)}
            className="flex flex-col items-center justify-center w-9 h-9 rounded-md bg-accent text-[10px] font-semibold text-white shadow-sm"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-accent">
              {betSlip.length}
            </span>
            <span className="mt-1 leading-none">Bet</span>
          </button>
        </div>
      )}

      {/* BETSLIP */}
      {slipOpen && (
    <div className="fixed bottom-[35px] left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50">

    <div className="h-[calc(100vh-98px)] bg-background overflow-hidden">

      <BetSlip
        selections={betSlip}
        onRemove={removeFromSlip}
        onClear={clearSlip}
        onPlaceBet={handlePlaceBet}
        balance={currentBalance}
        isOpen={true}
        onToggleOpen={() => setSlipOpen(false)}
        isPlacing={placing}
        placeError={placeError}
        placeSuccess={placeSuccess}
        onOpenMatch={(s) => {
          const match = allMatches.find(m => m.fixture_id === s.fixture_id);
          if (match) setSelectedMatch(match);
        }}
        seasonEnd={seasonEnd ?? undefined}
      />

    </div>

  </div>
)}

      {/* MARKETS */}
      {selectedMatch && (
        <MatchMarkets
          match={selectedMatch}
          betSlip={betSlip}
          onAddSelection={addToSlip}
          onRemoveSelection={removeSelection}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      {/* SUCCESS */}
      <BetPlacedModal
        isOpen={betPlaced}
        ticketId={placedTicketId ?? undefined}
        onClose={() => {
          setBetPlaced(false);
          clearSlip();
        }}
      />

    </MobileFrame>
  );
}