"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

function formatName(name: string) {
  if (!name) return "User";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TopWinningBets({ initialBets }: { initialBets: any[] }) {
 
  const [bets, setBets] = useState(
    (initialBets || [])
      .map((b) => ({
        ...b,
        created_at: b.updated_at || b.created_at, // ✅ normalize to win time
      }))
      .filter((b) => b.profit >= 5000)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 10)
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  /* 🔥 AUTO SCROLL (SAFE) */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || bets.length < 3) return;
  
    let direction = 1; // 1 = right, -1 = left
  
    const interval = setInterval(() => {
      if (!el) return;
  
      el.scrollLeft += direction;
  
      // hit right end
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
        direction = -1;
      }
  
      // hit left end
      if (el.scrollLeft <= 0) {
        direction = 1;
      }
    }, 20);
  
    return () => clearInterval(interval);
  }, [bets]);

  /* 🔥 REALTIME (FIXED) */
  useEffect(() => {
    const channel = supabase
      .channel("top-wins")
      .on(
        "postgres_changes",
        {
          event: "*", // 🔥 IMPORTANT FIX
          schema: "public",
          table: "tickets",
        },
        async (payload: any) => {
          const newBet = payload.new;

          if (
            !newBet ||
            newBet.status !== "won" ||
            newBet.potential_return < 5000
          ) return;

          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", newBet.user_id)
            .single();

            setBets((prev) => {
              const updated = [
                {
                  username: profile?.username ?? "User",
                  profit: newBet.potential_return,
                  created_at: newBet.status === "won"
                    ? (newBet.updated_at || newBet.created_at)
                    : newBet.created_at
                },
                ...prev,
              ]
                .filter((b) => b.profit >= 5000)
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .slice(0, 10);
            
              return updated;
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* 🔥 LOOP EFFECT */
  const displayBets = bets.length > 0 ? [...bets, ...bets] : [];

  return (
    <section className="mb-10 pt-3">
      <h2 className="font-semibold text-text mb-4 text-left">
        Top Winning Bets
      </h2>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-hidden scroll-smooth"
      >
        {displayBets.map((bet: any, i: number) => {
          const isBigWin = bet.profit >= 10000;

          return (
            <div
              key={i}
              className="
                min-w-[140px]
                rounded-lg
                px-3 py-3
                flex flex-col items-center justify-start pt-2
                border border-purple-500/20
                bg-gradient-to-br from-[#140a26] to-[#0b0616]
                relative
              "
            >
              <div className="absolute inset-0 bg-purple-500/5 blur-xl" />

              <div className="flex items-center justify-center gap-1 mb-1 h-[12px]">
                {isBigWin && (
                  <span className="text-[8px] font-semibold px-1.5 py-[1px] rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                    🔥 BIG WIN
                  </span>
                )}
              </div>

              <p className="text-[9px] text-muted uppercase">Player</p>

              <p className="text-xs font-semibold text-white truncate">
                {formatName(bet.username)}
              </p>

              <p
                className={`text-sm font-bold mt-1 ${
                  isBigWin ? "text-yellow-400" : "text-green-400"
                }`}
              >
                ₦{bet.profit?.toLocaleString("en-NG", {
                  maximumFractionDigits: 0,
                })}
              </p>

              <p className="text-[9px] text-muted mt-1">
                {formatTime(bet.created_at)}
              </p>

            </div>
          );
        })}
      </div>
    </section>
  );
}