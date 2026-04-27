import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {

  console.log("PLACE TICKET FUNCTION LOADED v2");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader =
      req.headers.get("Authorization") ??
      req.headers.get("authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseUser.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const body = await req.json();
    const { season_instance_id, stake, ticket_type, selections } = body;

    if (!season_instance_id || !stake || !ticket_type || !selections) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    /* ---------- GET SEASON ---------- */

    const { data: season, error: seasonError } = await supabaseAdmin
      .from("season_instances")
      .select("*")
      .eq("id", season_instance_id)
      .eq("user_id", user.id)
      .single();

    if (seasonError || !season) {
      return new Response(JSON.stringify({ error: "Season not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    if (season.current_balance < stake) {
      return new Response(JSON.stringify({ error: "Insufficient balance" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    /* ---------- GET ACTUAL SEASON ---------- */
const { data: activeSeason, error: activeSeasonError } = await supabaseAdmin
.from("seasons")
.select("*")
.eq("id", season.season_id)
.single();

if (activeSeasonError || !activeSeason) {
return new Response(JSON.stringify({ error: "Season not found" }), {
  status: 404,
  headers: corsHeaders,
});
}

/* 🔒 BLOCK IF SEASON NOT STARTED */
const now = new Date();
const seasonStart = new Date(activeSeason.start_date);

if (now < seasonStart) {
return new Response(
  JSON.stringify({
    error: "Season not started",
    start_date: activeSeason.start_date
  }),
  {
    status: 403,
    headers: corsHeaders,
  }
);
}

/* 🔒 BLOCK IF SEASON ENDED (IMPORTANT) */
const seasonEnd = new Date(activeSeason.end_date);

if (now > seasonEnd) {
return new Response(
  JSON.stringify({ error: "Season has ended" }),
  {
    status: 403,
    headers: corsHeaders,
  }
);
}
  /* ---------- MATCH TIME VALIDATION ---------- */

const nowTime = new Date();
const seasonEndTime = new Date(activeSeason.end_date);

for (const leg of selections) {
  const matchStart = new Date(leg.match_start);

  /* ❌ BLOCK IF MATCH ALREADY STARTED */
  if (matchStart <= nowTime) {
    return new Response(
      JSON.stringify({
        error: "One or more matches already started",
      }),
      { status: 400, headers: corsHeaders }
    );
  }

  /* ❌ BLOCK IF MATCH OUTSIDE SEASON */
  if (matchStart > seasonEndTime) {
    return new Response(
      JSON.stringify({
        error: "Match is outside season timeframe",
      }),
      { status: 400, headers: corsHeaders }
    );
  }
}

 /* ---------- DRAWDOWN PROTECTION (CORRECT) ---------- */

const DRAW_DOWN_LIMIT = season.hard_drawdown;

const newBalance = season.current_balance - stake;

if (newBalance < DRAW_DOWN_LIMIT) {
  return new Response(JSON.stringify({
    error: "Season ended — drawdown reached"
  }), {
    status: 400,
    headers: corsHeaders
  });
}

    /* ---------- DAILY BET LIMIT ---------- */
      const todayStart = new Date();
      todayStart.setUTCHours(0,0,0,0);

      const { count: todayBetCount } = await supabaseAdmin
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("season_instance_id", season_instance_id)
        .gte("placed_at", todayStart.toISOString());

      if ((todayBetCount ?? 0) >= 3) {
        return new Response(JSON.stringify({
          error: "Maximum 3 bets allowed per day"
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

    /* ---------- CALCULATE ODDS ---------- */

    let totalOdds = 1;

    for (const leg of selections) {
      totalOdds *= Number(leg.odds);
    }

    const potentialReturn = Math.round(stake * totalOdds);

    const fixtureIds = selections.map((s: any) => s.fixture_id);

    /* ---------- RECHECK DAILY LIMIT (ANTI-RACE CONDITION) ---------- */

    const { count: recheckCount } = await supabaseAdmin
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("season_instance_id", season_instance_id)
      .gte("placed_at", todayStart.toISOString());

    if ((recheckCount ?? 0) >= 3) {
      return new Response(JSON.stringify({
        error: "Daily bet limit reached"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    /* ---------- CHECK FIRST BET OF DAY ---------- */

    const { count: betsToday } = await supabaseAdmin
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("season_instance_id", season_instance_id)
    .gte("placed_at", todayStart.toISOString());

    const isFirstBetToday = (betsToday ?? 0) === 0;

    /* ---------- INSERT TICKET ---------- */

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from("tickets")
      .insert({
        season_instance_id,
        user_id: user.id,
        stake,
        ticket_type,
        status: "pending",
        placed_at: new Date().toISOString(),
        total_odds: totalOdds,
        potential_return: potentialReturn,
        api_fixture_ids: fixtureIds
      })
      .select()
      .single();
      

    if (ticketError) {

      console.error("TICKET INSERT ERROR:", ticketError);

      return new Response(JSON.stringify({
        error: "Ticket insert failed",
        details: ticketError
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

   
    /* ---------- ACTIVE BETTING DAY ---------- */

    if (isFirstBetToday) {

      await supabaseAdmin
        .from("season_instances")
        .update({
          active_betting_days: (season.active_betting_days ?? 0) + 1
        })
        .eq("id", season.id)

    }

   /* ---------- INSERT SELECTIONS ---------- */

    for (const leg of selections) {

      console.log("SELECTION RECEIVED:", leg);

      if (!leg.selection && !leg.pick) {
        console.error("❌ INVALID LEG:", leg);
      }

      const { error } = await supabaseAdmin
        .from("ticket_selections")
        .insert({
          ticket_id: ticket.id,
          fixture_id: leg.fixture_id,
          external_id: leg.external_id,
          source: leg.source,
        
          market: leg.market,
          market_label: leg.marketLabel,
        
          selection: leg.selection ?? leg.pick,
          pick_label: leg.pickLabel ?? leg.pick,
          odds: leg.odds,
          
          home_team: leg.home_team,
          away_team: leg.away_team,
        
          match_start: leg.match_start,
          match_end: leg.match_end
        });
      if (error) {
        console.error("SELECTION ERROR:", error);
      }
    }

    /* ---------- UPDATE BALANCE ---------- */

    await supabaseAdmin
      .from("season_instances")
      .update({
        current_balance: newBalance,
        last_bet_at: new Date().toISOString(), // 🔥 RESET TIMER
      })
      .eq("id", season.id)

    return new Response(JSON.stringify({
      success: true,
      ticket_id: ticket.id,
      new_balance: newBalance
      
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });

  } catch (err) {

    console.error("EDGE FUNCTION ERROR:", err);

    return new Response(JSON.stringify({
      error: "Internal server error",
      details: err?.message
    }), {
      status: 500,
      headers: corsHeaders
    });

  }

});