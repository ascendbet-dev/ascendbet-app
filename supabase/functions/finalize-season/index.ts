import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {

  // 🔥 CORS / preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  }

  console.log("🔥 finalize-season triggered");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {

    const body = await req.json();
    const season_id = body?.season_id;

    if (!season_id) {
      return new Response(
        JSON.stringify({ error: "season_id required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    /* 🔥 FETCH ALL PARTICIPANTS */

    const { data: seasons, error } = await supabase
      .from("season_instances")
      .select("*")
      .eq("season_id", season_id);

    if (error || !seasons || seasons.length === 0) {
      return new Response(
        JSON.stringify({ error: "No participants found" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    /* 🔥 SORT (SAME AS LEADERBOARD) */

    const ranked = seasons.sort((a, b) => {

      // 1. Disqualified last
      if (a.is_disqualified !== b.is_disqualified) {
        return a.is_disqualified ? 1 : -1;
      }

      // 2. Balance
      if (b.current_balance !== a.current_balance) {
        return b.current_balance - a.current_balance;
      }

      // 3. Discipline
      if ((b.discipline_score ?? 0) !== (a.discipline_score ?? 0)) {
        return (b.discipline_score ?? 0) - (a.discipline_score ?? 0);
      }

      // 4. Active days
      if ((b.active_betting_days ?? 0) !== (a.active_betting_days ?? 0)) {
        return (b.active_betting_days ?? 0) - (a.active_betting_days ?? 0);
      }

      // 5. Settled bets
      if ((b.settled_bet_count ?? 0) !== (a.settled_bet_count ?? 0)) {
        return (b.settled_bet_count ?? 0) - (a.settled_bet_count ?? 0);
      }

      return 0;
    });

    /* 🔥 UPDATE FINAL POSITIONS */

    for (let i = 0; i < ranked.length; i++) {

      const user = ranked[i];
      const position = i + 1;

      await supabase
        .from("season_instances")
        .update({
          final_position: position,
          is_finalized: true,
        })
        .eq("id", user.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        players: ranked.length
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err) {

    console.error("❌ finalize-season error:", err);

    return new Response(
      JSON.stringify({ error: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

});