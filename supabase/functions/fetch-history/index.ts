import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCanonicalTeam } from "../_shared/teamUtils.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const FOOTBALL_KEY = Deno.env.get("FOOTBALL_DATA_KEY");

const COMPETITIONS = ["PL","ELC","PD","SA","BL1","FL1"];

serve(async () => {

  try {

    let totalInserted = 0;

    for (const comp of COMPETITIONS) {

      console.log("📡 Fetching:", comp);

      /* 🔥 TIMEOUT PROTECTION */
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      let res;

      try {
        res = await fetch(
          `https://api.football-data.org/v4/competitions/${comp}/matches?status=FINISHED&limit=50`,
          {
            headers: {
              "X-Auth-Token": FOOTBALL_KEY!
            },
            signal: controller.signal
          }
        );
      } catch (err) {
        console.log("⛔ Timeout:", comp);
        clearTimeout(timeout);
        continue;
      }

      clearTimeout(timeout);

      if (!res.ok) {
        console.log("❌ Failed:", comp, res.status);
        continue;
      }

      const data = await res.json();

      console.log(`📦 ${comp} matches:`, data.matches?.length || 0);

      const rows = [];

      for (const m of data.matches || []) {

        const homeGoals = m.score?.fullTime?.home;
        const awayGoals = m.score?.fullTime?.away;

        if (homeGoals == null || awayGoals == null) continue;

        rows.push({
          fixture_id: String(m.id),
          source: "football-data",

          home_team: getCanonicalTeam(m.homeTeam.name),
          away_team: getCanonicalTeam(m.awayTeam.name),

          home_goals: homeGoals,
          away_goals: awayGoals,

          match_date: m.utcDate
        });
      }

      console.log("ROWS READY:", rows.length);

      if (!rows.length) {
        console.log("⚠️ No rows for:", comp);
        continue;
      }

      /* 🔥 INSERT (NO UPSERT FOR NOW) */
      const { error } = await supabase
        .from("team_match_history")
        .insert(rows);

      if (error) {
        console.log("❌ DB error:", error.message);
        continue;
      }

      console.log(`✅ Inserted ${rows.length} matches from ${comp}`);
      totalInserted += rows.length;
    }

    return new Response(JSON.stringify({
      success: true,
      totalInserted
    }));

  } catch (err) {

    console.error("🔥 FUNCTION ERROR:", err);

    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500 }
    );

  }

});