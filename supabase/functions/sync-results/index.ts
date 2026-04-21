import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {

  /* ---------- CRON SECURITY ---------- */

  const CRON_SECRET = Deno.env.get("CRON_SECRET");
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  /* ---------- SUPABASE CLIENT ---------- */

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const FOOTBALL_KEY = Deno.env.get("FOOTBALL_DATA_KEY");

  /* ---------- GET PENDING FIXTURES ---------- */

  const { data: pendingFixtures } = await supabase
    .from("ticket_selections")
    .select("fixture_id, external_id, source")
    .eq("result", "pending");

  if (!pendingFixtures || pendingFixtures.length === 0) {
    return new Response(
      JSON.stringify({ message: "no pending bets" }),
      { status: 200 }
    );
  }

  /* ---------- UNIQUE FIXTURE IDS ---------- */

  const fixtures = [
    ...new Map(
      pendingFixtures.map(f => [`${f.external_id}_${f.source}`, f])
    ).values()
  ];

  let stored = 0;

  for (const fixture of fixtures) {
    
    const externalId = fixture.external_id;
    const fixtureId = fixture.fixture_id;

    if (!externalId) {
      console.log("⏭️ Missing external_id, skipping:", fixture);
      continue;
    }

    const source = fixture.source;

    /* ---------- SKIP IF ALREADY STORED ---------- */

    const { data: existing } = await supabase
    .from("match_results")
    .select("home_goals, away_goals")
    .eq("external_id", externalId)
    .eq("source", source)
    .maybeSingle();

    // ❌ only skip if already HAS result
    if (existing && existing.home_goals != null && existing.away_goals != null) {
      continue;
    }

    /* ---------- DETECT SOURCE ---------- */


    let matchData: any = null;

    /* ---------- SPORTSDB ---------- */

    let matchDate: string | null = null;

    if (source === "sportsdb") {

      const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);

          let res;

          try {
            res = await fetch(
              `https://www.thesportsdb.com/api/v1/json/123/lookupevent.php?id=${externalId}`,
              { signal: controller.signal }
            );
          } catch (err) {
            console.error("⛔ SportsDB timeout:", externalId);
            clearTimeout(timeout);
            continue;
          }

          clearTimeout(timeout);

      if (!res.ok) {
        console.error("Fetch failed for fixture:", externalId);
        continue;
      }

      const data = await res.json();
      const event = data.events?.[0];

      if (!event) continue;

      matchDate = event.dateEvent + "T" + (event.strTime || "00:00:00");

      /* VOID MATCHES */
      if (["Postponed", "Cancelled"].includes(event.strStatus)) {

        await supabase.from("match_results").insert({
          fixture_id: fixtureId,
          external_id: externalId,
          source,
          home_team: event.strHomeTeam,
          away_team: event.strAwayTeam,
          home_goals: null,
          away_goals: null,
          ht_home_goals: null,
          ht_away_goals: null,
          voided: true,
          processed: false
        });

        stored++;
        continue;
      }

      /* NOT FINISHED */

      const status = event.strStatus?.toLowerCase() || "";

      if (event.intHomeScore == null || event.intAwayScore == null) {
        console.log("⏭️ No score yet:", externalId);
        continue;
      }

      matchData = {
        homeTeam: { name: event.strHomeTeam },
        awayTeam: { name: event.strAwayTeam },
        score: {
          fullTime: {
            home: Number(event.intHomeScore ?? 0),
            away: Number(event.intAwayScore ?? 0),
          },
          halfTime: {
            home: Number(event.intHomeScoreHT || 0),
            away: Number(event.intAwayScoreHT || 0),
          }
        },
        status: "FINISHED"
      };

    }

    /* ---------- FOOTBALL-DATA ---------- */

    else if (source === "football-data") {

      const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        let res;

        try {
          res = await fetch(
            `https://api.football-data.org/v4/matches/${externalId}`,
            {
              headers: {
                "X-Auth-Token": FOOTBALL_KEY!
              },
              signal: controller.signal
            }
          );
        } catch (err) {
          console.error("⛔ Football-data timeout:", externalId);
          clearTimeout(timeout);
          continue;
        }

        clearTimeout(timeout);

      if (!res.ok) {
        console.error("Fetch failed for fixture:", externalId);
        continue;
      }

      const data = await res.json();
      if (!data) continue;
      matchDate = data.utcDate;

      /* VOID MATCHES */
      if (["POSTPONED", "CANCELLED", "SUSPENDED"].includes(data.status)) {

        await supabase.from("match_results").insert({
          fixture_id: fixtureId,
          external_id: externalId,
          source,
          home_team: data.homeTeam.name,
          away_team: data.awayTeam.name,
          home_goals: null,
          away_goals: null,
          ht_home_goals: null,
          ht_away_goals: null,
          voided: true,
          processed: false
        });

        stored++;
        continue;
      }

      /* NOT FINISHED */
      if (data.status !== "FINISHED") continue;

      matchData = data;

    }

   /* ---------- EXTRACT RESULT ---------- */

if (!matchData || !matchData.score || !matchData.score.fullTime) {
  console.log("⏭️ Skipping invalid match data:", fixtureId);
  continue;
}

const homeGoals = matchData.score.fullTime.home;
const awayGoals = matchData.score.fullTime.away;

if (homeGoals == null || awayGoals == null) {
  console.log("⚠️ Missing score, skipping:", fixtureId);
  continue;
}

const htHome = matchData.score.halfTime?.home ?? 0;
const htAway = matchData.score.halfTime?.away ?? 0;

console.log("📥 INSERTING RESULT:", {
  externalId,
  source,
  homeGoals,
  awayGoals,
});

    /* ---------- INSERT RESULT ---------- */

    const { error } = await supabase
  .from("match_results")
  .upsert(
    {
      fixture_id: fixtureId,
      external_id: externalId,
      source,
      home_team: matchData.homeTeam.name,
      away_team: matchData.awayTeam.name,
      home_goals: homeGoals,
      away_goals: awayGoals,
      ht_home_goals: htHome,
      ht_away_goals: htAway,
      voided: false,
      processed: false
    },
    { onConflict: "fixture_id,source" }
  );

if (error) {
  console.error("❌ UPSERT ERROR:", error.message);
}

    stored++;
  }

  return new Response(
    JSON.stringify({
      success: true,
      fixtures_checked: fixtures.length,
      results_stored: stored
    }),
    { status: 200 }
  );

});