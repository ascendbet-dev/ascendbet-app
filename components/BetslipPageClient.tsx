"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useBetslipStore } from "@/stores/useBetslipStore";
import { BetSlip } from "./BetSlip";
import { BetPlacedModal } from "./BetPlacedModal";
import { supabase } from "@/lib/supabase/client";

export default function BetslipPageClient({
  balance,
  seasonInstanceId,
}: {
  balance: number;
  seasonInstanceId: string;
}) {
  const router = useRouter();

  const {
    selections,
    removeByIndex,
    clear,
  } = useBetslipStore();

  /* 🔥 MATCH PlaceBetClient STATES */
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [placeSuccess, setPlaceSuccess] = useState<string | null>(null);

  const [betPlaced, setBetPlaced] = useState(false);
  const [placedTicketId, setPlacedTicketId] = useState<string | null>(null);

  const [isClosing, setIsClosing] = useState(false);

  /* ---------------- PLACE BET ---------------- */

  async function handlePlaceBet(stake: number) {
    
    if (selections.length === 0) return;

    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    setPlacing(true);
    setPlaceError(null);
    setPlaceSuccess(null);

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
            ticket_type: selections.length <= 1 ? "single" : "accumulator",
            selections: selections.map((s) => ({
              fixture_id: s.fixture_id,
              external_id: s.external_id, // 🔥 THIS WAS MISSING
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
            })),
          }),
        }
      );
      

      const result = await res.json();

      if (!res.ok) {
        setPlaceError(result.error || "Failed to place bet");
        return;
      }

      /* ✅ SUCCESS → SHOW MODAL (same as PlaceBetClient) */
      setPlacedTicketId(result.ticket_id);
      setBetPlaced(true);

    } catch (err: any) {
      setPlaceError(err.message || "Something went wrong");
    } finally {
      setPlacing(false);
    }
  }

  /* ---------------- Close with Animation ---------------- */

  function closeWithAnimation() {
    if (isClosing) return;
  
    setIsClosing(true);
  
    // 🔥 delay navigation slightly longer than animation
    setTimeout(() => {
      router.replace("/");
    }, 300); // increase from 220 → 300
  }

  /* ---------------- MATCH NAV ---------------- */

  function handleOpenMatch(selection: any) {
    router.push(`/place-bet?fixture=${selection.fixture_id}`);
  }

  /* ---------------- UI ---------------- */

  return (
    <>
      {/* MAIN CONTAINER */}
      <div
        className={`mx-auto w-full max-w-[420px] h-dvh flex flex-col bg-background transform transition-transform duration-300 ease-in-out ${
          isClosing ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <BetSlip
          selections={selections}

          onRemove={(idx) => {
            const current = selections.length;

            if (current === 1) {
              closeWithAnimation();
              setTimeout(() => removeByIndex(idx), 200);
              return;
            }

            removeByIndex(idx);
          }}

          onClear={() => {
            closeWithAnimation();
            setTimeout(() => clear(), 200);
          }}

          onPlaceBet={handlePlaceBet}

          balance={balance}

          isOpen={true}

          onToggleOpen={closeWithAnimation}

          onOpenMatch={handleOpenMatch}

          isPlacing={placing}
          placeError={placeError}
          placeSuccess={placeSuccess}
        />
      </div>

      {/* 🔥 MODAL MOVED OUTSIDE (THIS FIXES POSITION) */}
      <BetPlacedModal
        isOpen={betPlaced}
        ticketId={placedTicketId ?? undefined}
        onClose={() => {
          setBetPlaced(false);
          closeWithAnimation();
          setTimeout(() => clear(), 200);
        }}
      />
    </>
  );
}