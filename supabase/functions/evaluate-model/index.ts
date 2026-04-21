import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {

  /* ---------- CRON SECURITY ---------- */

  const CRON_SECRET = Deno.env.get("CRON_SECRET");
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  /* ---------- GET UNPROCESSED RESULTS ---------- */

  const { data: results } = await supabase
    .from("match_results")
    .select("*")
    .eq("processed", false)
    .eq("voided", false)
    .limit(50);

  if (!results || results.length === 0) {
    return new Response(JSON.stringify({ message: "no results to process" }));
  }

  let evaluated = 0;

  for (const r of results) {

    /* ---------- FIND MATCH IN ODDS ---------- */

    const { data: oddsRow } = await supabase
      .from("odds_matches")
      .select("*")
      .eq("external_id", r.external_id)
      .eq("source", r.source)
      .maybeSingle();

    if (!oddsRow) {
      console.log("❌ No odds found for:", r.external_id);
      continue;
    }

    const markets = oddsRow.markets;

    if (!markets?.h2h) continue;

    /* ---------- CONVERT ODDS → PROB ---------- */

    const homeProb = 1 / markets.h2h.home;
    const drawProb = 1 / markets.h2h.draw;
    const awayProb = 1 / markets.h2h.away;

    const total = homeProb + drawProb + awayProb;

    const pHome = homeProb / total;
    const pDraw = drawProb / total;
    const pAway = awayProb / total;

    /* ---------- ACTUAL RESULT ---------- */

    let actual = [0, 0, 0]; // [home, draw, away]

    if (r.home_goals > r.away_goals) actual = [1, 0, 0];
    else if (r.home_goals === r.away_goals) actual = [0, 1, 0];
    else actual = [0, 0, 1];

    /* ---------- BRIER SCORE ---------- */

    const brier =
      Math.pow(pHome - actual[0], 2) +
      Math.pow(pDraw - actual[1], 2) +
      Math.pow(pAway - actual[2], 2);

    /* ---------- STORE PERFORMANCE ---------- */

    await supabase.from("model_performance").insert({
      fixture_id: r.fixture_id,
      external_id: r.external_id,
      source: r.source,
      league: oddsRow.league,
      brier_score: brier,
      home_prob: pHome,
      draw_prob: pDraw,
      away_prob: pAway,
      actual_home: actual[0],
      actual_draw: actual[1],
      actual_away: actual[2]
    });

    /* ---------- MARK AS PROCESSED ---------- */

    await supabase
      .from("match_results")
      .update({ processed: true })
      .eq("id", r.id);

    evaluated++;
  }

  return new Response(
    JSON.stringify({
      success: true,
      evaluated
    }),
    { status: 200 }
  );
});