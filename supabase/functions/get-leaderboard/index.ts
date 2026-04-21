import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    /* ---------------- GET INPUT ---------------- */

    let season_id = null;

    try {
      const body = await req.json();
      season_id = body?.season_id;
    } catch {}

    /* ---------------- FALLBACK LOGIC ---------------- */

    if (!season_id) {
      // 🔥 1. ACTIVE
      const { data: activeSeason } = await supabase
        .from("seasons")
        .select("id")
        .eq("status", "active")
        .maybeSingle();

      if (activeSeason) {
        season_id = activeSeason.id;
      } else {
        // 🔥 2. LAST COMPLETED
        const { data: lastSeason } = await supabase
          .from("seasons")
          .select("id")
          .eq("status", "completed") // ✅ FIXED
          .order("end_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        season_id = lastSeason?.id;
      }
    }

    /* ---------------- NO SEASON SAFETY ---------------- */

    if (!season_id) {
      return new Response(
        JSON.stringify({ leaderboard: [] }),
        { status: 200, headers: corsHeaders }
      );
    }

    /* ---------------- FETCH PARTICIPANTS ---------------- */

    const { data: seasons, error } = await supabase
      .from("season_instances")
      .select(`
        id,
        user_id,
        current_balance,
        settled_bet_count,
        average_stake,
        average_odds,
        max_drawdown,
        discipline_score,
        is_disqualified
      `)
      .eq("season_id", season_id);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!seasons || seasons.length === 0) {
      return new Response(
        JSON.stringify({ leaderboard: [] }),
        { status: 200, headers: corsHeaders }
      );
    }

    /* ---------------- FETCH PROFILES ---------------- */

    const userIds = seasons.map((s) => s.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);

    const profileMap = new Map<string, string>();

    if (profiles) {
      profiles.forEach((p) => {
        profileMap.set(p.id, p.username);
      });
    }

    /* ---------------- RANKING LOGIC ---------------- */

    const ranked = seasons.sort((a, b) => {

      // 1. Disqualified always last
      if (a.is_disqualified !== b.is_disqualified) {
        return a.is_disqualified ? 1 : -1;
      }
    
      // 2. Higher balance wins
      if (b.current_balance !== a.current_balance) {
        return b.current_balance - a.current_balance;
      }
    
      // 3. Higher discipline score wins
      if ((b.discipline_score ?? 0) !== (a.discipline_score ?? 0)) {
        return (b.discipline_score ?? 0) - (a.discipline_score ?? 0);
      }
    
      // 4. More active betting days wins
      if ((b.active_betting_days ?? 0) !== (a.active_betting_days ?? 0)) {
        return (b.active_betting_days ?? 0) - (a.active_betting_days ?? 0);
      }
    
      // 5. More settled bets wins
      if ((b.settled_bet_count ?? 0) !== (a.settled_bet_count ?? 0)) {
        return (b.settled_bet_count ?? 0) - (a.settled_bet_count ?? 0);
      }
    
      return 0;
    });

    /* ---------------- PREVIOUS SNAPSHOT ---------------- */

    let previousMap = new Map<string, number>();

    const { data: previousSnapshot } = await supabase
      .from("leaderboard_snapshots")
      .select("user_id, rank")
      .eq("season_id", season_id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (previousSnapshot && previousSnapshot.length > 0) {
      previousSnapshot.forEach((p) => {
        previousMap.set(p.user_id, p.rank);
      });
    }

    /* ---------------- FINAL OUTPUT ---------------- */

    const leaderboard = ranked.map((user, index) => {
      const currentRank = index + 1;
      const previousRank =
        previousMap.get(user.user_id) ?? currentRank;

      const movement = previousRank - currentRank;

      return {
        rank: currentRank,
        previous_rank: previousRank,
        movement, // 🔥 NEW
        username: profileMap.get(user.user_id) ?? "Unknown",
        current_balance: user.current_balance,
        settled_bet_count: user.settled_bet_count,
        discipline_score: user.discipline_score,
        is_disqualified: user.is_disqualified,
      };
    });

    /* ---------------- SMART SNAPSHOT ---------------- */

    try {
      const { data: lastSnapshot } = await supabase
        .from("leaderboard_snapshots")
        .select("user_id, rank")
        .eq("season_id", season_id)
        .order("created_at", { ascending: false })
        .limit(100);

      let shouldSave = false;

      if (!lastSnapshot || lastSnapshot.length === 0) {
        shouldSave = true; // first snapshot
      } else {
        for (let i = 0; i < ranked.length; i++) {
          const user = ranked[i];
          const previous = lastSnapshot.find(
            (p) => p.user_id === user.user_id
          );

          const prevRank = previous?.rank ?? i + 1;

          if (prevRank !== i + 1) {
            shouldSave = true;
            break;
          }
        }
      }

      if (shouldSave) {
        const snapshotData = ranked.map((user, index) => ({
          season_id,
          user_id: user.user_id,
          rank: index + 1,
        }));

        await supabase.from("leaderboard_snapshots").insert(snapshotData);
      }

    } catch (e) {
      console.log("Snapshot safe fail:", e);
    }

    return new Response(
      JSON.stringify({ leaderboard }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});