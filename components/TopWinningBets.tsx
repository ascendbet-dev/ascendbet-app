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
  const [bets, setBets] = useState(initialBets || []);
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

          if (!newBet || newBet.status !== "won") return;

          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", newBet.user_id)
            .single();

          setBets((prev) =>
            [
              {
                username: profile?.username ?? "User",
                profit: newBet.potential_return,
                created_at: newBet.created_at,
              },
              ...prev,
            ].slice(0, 10)
          );
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
        Top Winning Bets Today
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
                flex flex-col items-center justify-center
                border border-purple-500/20
                bg-gradient-to-br from-[#140a26] to-[#0b0616]
                relative
              "
            >
              <div className="absolute inset-0 bg-purple-500/5 blur-xl" />

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

              {isBigWin && (
                <span className="text-[8px] text-yellow-400 mt-1">
                  🔥 BIG WIN
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}