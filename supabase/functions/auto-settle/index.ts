import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js"
import { updateRatings } from "../_shared/updateRatings.ts"
import { getCanonicalTeam } from "../_shared/teamUtils.ts"

const corsHeaders = {
 "Access-Control-Allow-Origin": "*",
 "Access-Control-Allow-Headers": "authorization, content-type",
}

/* ---------------- MARKET EVALUATOR ---------------- */

function evaluateMarket(leg:any, match:any){

 const home = match.home_goals
 const away = match.away_goals
 const htHome = match.ht_home_goals ?? 0
 const htAway = match.ht_away_goals ?? 0

 const total = home + away
 const secondHalfHome = home - htHome
 const secondHalfAway = away - htAway
 const secondHalfTotal = secondHalfHome + secondHalfAway

 const homeWin = home > away
 const awayWin = away > home
 const draw = home === away
 const bothScored = home > 0 && away > 0

 const selection = String(leg.selection).toLowerCase()

 /* 1X2 */

 if(leg.market === "1X2"){
   return (
     (selection==="home" && homeWin) ||
     (selection==="away" && awayWin) ||
     (selection==="draw" && draw)
   )
 }

 /* DOUBLE CHANCE */

 if (leg.market === "DOUBLE_CHANCE") {

  if (selection === "1x" || selection === "home_or_draw") {
    return homeWin || draw
  }

  if (selection === "x2" || selection === "draw_or_away") {
    return awayWin || draw
  }

  if (selection === "12" || selection === "home_or_away") {
    return homeWin || awayWin
  }
}

 /* BTTS */

 if(leg.market === "BTTS"){
   return (
     (selection==="yes" && bothScored) ||
     (selection==="no" && !bothScored)
   )
 }

 /* TOTALS */

 if(leg.market === "TOTALS"){
   const type = selection.startsWith("over") ? "over" : "under"
   const goalLine = parseFloat(selection.replace("over","").replace("under",""))

   return (
     (type==="over" && total > goalLine) ||
     (type==="under" && total < goalLine)
   )
 }

 /* OVER 2.5 */

 if(leg.market === "OVER_25"){
   return (
     (selection==="over" && total > 2.5) ||
     (selection==="under" && total < 2.5)
   )
 }

 /* TEAM TOTALS */

 if(leg.market === "TEAM_TOTALS"){

   const team = selection.startsWith("home") ? "home" : "away"
   const type = selection.includes("over") ? "over" : "under"

   const raw = selection
       .replace("home_over","")
       .replace("home_under","")
       .replace("away_over","")
       .replace("away_under","")

   const goalLine = parseFloat(raw) / 10

   const goals = team === "home" ? home : away

   return (
     (type==="over" && goals > goalLine) ||
     (type==="under" && goals < goalLine)
   )
 }

 /* FIRST HALF */

 if(leg.market === "FIRST_HALF"){

   const totalHT = htHome + htAway
   const type = selection.startsWith("over") ? "over" : "under"
   const goalLine = parseFloat(selection.replace("over","").replace("under","")) / 10

   return (
     (type==="over" && totalHT > goalLine) ||
     (type==="under" && totalHT < goalLine)
   )
 }

 /* HANDICAP */

 if (leg.market === "HANDICAP") {

  const parts = selection.split("_")

  let team = parts[0]
  const modifier = parts[1]

  if (selection.includes("mirror")) {
    team = team === "home" ? "away" : "home"
  }

  let handicap = 0

  if (modifier.startsWith("plus")) {
    handicap = parseFloat(modifier.replace("plus","")) / 10
  }

  if (modifier.startsWith("minus")) {
    handicap = -parseFloat(modifier.replace("minus","")) / 10
  }

  const adjusted =
    team === "home"
      ? home + handicap - away
      : away + handicap - home

  return adjusted > 0
 }

 /* HALF RESULTS */

 if(leg.market==="HALF_RESULTS"){

   const homeWinHT = htHome > htAway
   const homeWinSH = secondHalfHome > secondHalfAway

   const awayWinHT = htAway > htHome
   const awayWinSH = secondHalfAway > secondHalfHome

   if(selection==="home_win_either_yes"){
     return homeWinHT || homeWinSH
   }

   if(selection==="away_win_either_yes"){
     return awayWinHT || awayWinSH
   }

   if(selection==="home_win_both_yes"){
     return homeWinHT && homeWinSH
   }

   if(selection==="away_win_both_yes"){
     return awayWinHT && awayWinSH
   }

   return false
 }

 /* HIGHEST HALF */

 if(leg.market==="HIGHEST_HALF"){

   const firstHalfTotal = htHome + htAway

   if(selection==="first_half"){
     return firstHalfTotal > secondHalfTotal
   }

   if(selection==="second_half"){
     return secondHalfTotal > firstHalfTotal
   }

   return false
 }

 /* BOTH HALVES */

 if(leg.market==="BOTH_HALVES"){

   const firstHalfTotal = htHome + htAway

   if(selection==="bh_under_no"){
     return !(firstHalfTotal < 1.5 && secondHalfTotal < 1.5)
   }

   return false
 }

 /* COMBO */

 if(leg.market==="COMBO"){

   if(selection==="home_over15"){
     return homeWin && total > 1.5
   }

   if(selection==="away_over15"){
     return awayWin && total > 1.5
   }

 }

 /* WIN OR */

 if(leg.market==="WIN_OR"){

   if(selection==="draw_or_gg"){
     return draw || bothScored
   }

   if(selection==="away_or_over25"){
     return awayWin || total > 2.5
   }

 }

 console.log("Unsupported market", leg.market, selection)

 return false
}

/* ---------------- AUTO SETTLE ---------------- */

serve(async (req) => {

 const CRON_SECRET = Deno.env.get("CRON_SECRET")
 const auth = req.headers.get("authorization")

 if (auth !== `Bearer ${CRON_SECRET}`) {
   return new Response("Unauthorized", { status: 401 })
 }

 const supabase = createClient(
   Deno.env.get("SUPABASE_URL")!,
   Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
 )

 const { data: results } = await supabase
  .from("match_results")
  .select("*")
  .eq("processed", false)
   

 if (!results || results.length === 0) {
   return new Response(JSON.stringify({ message: "no results" }), { headers: corsHeaders })
 }

 for (const match of results) {

  console.log("PROCESSING MATCH:", match.fixture_id);

  if (
    match.voided !== true &&
    (match.home_goals == null || match.away_goals == null)
  ) {
    console.log("⏭️ Skipping match with no scores:", match.fixture_id);
    continue;
  }
  
  const { data: legs } = await supabase
  .from("ticket_selections")
  .select("*")
  .eq("external_id", match.external_id)
  .eq("source", match.source) // 🔥 ADD THIS
  .eq("result", "pending")

   if (!legs || legs.length === 0) continue

   console.log("FINISHED MATCH:", match.fixture_id);

   /* SETTLE LEGS */

   for (const leg of legs) {

    if (leg.result !== "pending") continue

     if (match.voided === true) {
       await supabase
         .from("ticket_selections")
         .update({ result: "void" })
         .eq("id", leg.id)
       continue
     }

     console.log("EVALUATING:", {
      market: leg.market,
      selection: leg.selection,
      home: match.home_goals,
      away: match.away_goals
    });

     const won = evaluateMarket(leg, match)

     console.log("RESULT:", won ? "WON" : "LOST");

     await supabase
       .from("ticket_selections")
       .update({
         result: won ? "won" : "lost",
         home_goals: match.home_goals,
         away_goals: match.away_goals
       })
       .eq("id", leg.id)

   }

   /* GET TICKETS */

   const { data: ticketIdsData } = await supabase
     .from("ticket_selections")
     .select("ticket_id")
     .eq("external_id", match.external_id)
     .eq("source", match.source)

   if (!ticketIdsData) continue

   const ticketIds = [...new Set(ticketIdsData.map(t => t.ticket_id))]

   for (const ticketId of ticketIds) {

     const { data: ticket } = await supabase
       .from("tickets")
       .select("*")
       .eq("id", ticketId)
       .maybeSingle()

    if (!ticket) continue

    if (ticket.settlement_time) continue

     const { data: selections } = await supabase
       .from("ticket_selections")
       .select("*")
       .eq("ticket_id", ticketId)

     if (!selections) continue

     if (selections.some(s => s.result === "pending")) continue

     const hasLost = selections.some(s => s.result === "lost")
     const allWon = selections.every(s => s.result === "won" || s.result === "void")

     let ticketStatus: "pending" | "won" | "lost" = "pending"

     if (hasLost) ticketStatus = "lost"
     else if (allWon) ticketStatus = "won"

     const { data: season } = await supabase
       .from("season_instances")
       .select("*")
       .eq("id", ticket.season_instance_id)
       .single()

     if (!season) continue

     let newBalance = season.current_balance

     if (ticketStatus === "won") {

       let totalOdds = 1

       for (const s of selections) {
         if (s.result !== "void") {
           totalOdds *= Number(s.odds)
         }
       }

       const returns = Number(ticket.stake) * totalOdds
       newBalance += returns

       console.log("Balance update", {
        oldBalance: season.current_balance,
        returns,
        newBalance
      })

     }

     const prevCount = season.settled_bet_count ?? 0;
     const newSettledCount = prevCount + 1;
     
     const newAverageOdds =
       ((season.average_odds || 0) * prevCount + ticket.total_odds) /
       newSettledCount;
     
     const newAverageStake =
       ((season.average_stake || 0) * prevCount + ticket.stake) /
       newSettledCount;

    /* DISCIPLINE CALCULATION */

      const oddsScore =
        100 - ((newAverageOdds - 1.2) / 2.8) * 100

      const stakeRatio =
        newAverageStake / 100000

      const stakeScore =
        100 - (stakeRatio * 100)

      const drawdownScore =
        100 - ((season.max_drawdown || 0) / 12000) * 100

      const activityScore =
        Math.min((newSettledCount / 30) * 100, 100)

      const disciplineScore =
        Math.min(
          100,
          (
            oddsScore * 0.30 +
            stakeScore * 0.25 +
            drawdownScore * 0.25 +
            activityScore * 0.20
          )
        )

        console.log("Settling ticket", {
          ticketId,
          ticketStatus,
          selections
        })

        await supabase
        .from("tickets")
        .update({
          status: ticketStatus,
          settlement_time: new Date().toISOString()
        })
        .eq("id", ticketId)

    await supabase
      .from("season_instances")
      .update({
        current_balance: newBalance,
        settled_bet_count: newSettledCount,
        average_odds: newAverageOdds,
        average_stake: newAverageStake,
        discipline_score: Number(disciplineScore.toFixed(2))
      })
      .eq("id", season.id)

     /* CHECK DRAWDOWN */

     const DRAW_DOWN_LIMIT = season.hard_drawdown + 500

     if (newBalance < DRAW_DOWN_LIMIT) {

       const { count: pending } = await supabase
         .from("tickets")
         .select("id", { count: "exact", head: true })
         .eq("season_instance_id", season.id)
         .eq("status", "pending")

       if ((pending ?? 0) === 0) {

         await supabase
           .from("season_instances")
           .update({ is_disqualified: true })
           .eq("id", season.id)

       }
     }

     /* -------- CHECK QUALIFICATION -------- */

      if (
        !season.is_qualified &&
        !season.is_disqualified &&
        newBalance >= season.target_balance &&
        season.active_betting_days >= 10 &&
        season.settled_bet_count + 1 >= 15
      ) {

        await supabase
          .from("season_instances")
          .update({
            is_qualified: true
          })
          .eq("id", season.id)

      }

   }

   /* ---------- UPDATE TEAM RATINGS ---------- */
   if (!match.voided) {

    const homeTeam = getCanonicalTeam(match.home_team)
    const awayTeam = getCanonicalTeam(match.away_team)
  
    const { data: teams } = await supabase
      .from("team_ratings")
      .select("team, rating")
      .in("team", [homeTeam, awayTeam])
  
    const homeRow = teams?.find(t => t.team === homeTeam)
    const awayRow = teams?.find(t => t.team === awayTeam)
  
    const homeRating = homeRow?.rating ?? 1750
    const awayRating = awayRow?.rating ?? 1750
  
    const updated = updateRatings(
      homeRating,
      awayRating,
      match.home_goals,
      match.away_goals
    )
  
    await supabase.from("team_ratings").upsert([
      {
        team: homeTeam,
        rating: updated.home,
        updated_at: new Date().toISOString()
      },
      {
        team: awayTeam,
        rating: updated.away,
        updated_at: new Date().toISOString()
      }
    ])
  
    console.log("📈 Ratings updated:", homeTeam, awayTeam)
  }

   /* MARK MATCH PROCESSED */

   await supabase
     .from("match_results")
     .update({ processed: true })
     .eq("fixture_id", match.fixture_id)
     .eq("source", match.source)

 }

 
/* -------- SAFETY NET: SETTLE ANY STUCK TICKETS -------- */

const { data: pendingTickets } = await supabase
.from("tickets")
.select("*")
.eq("status", "pending")

if (pendingTickets && pendingTickets.length > 0) {

for (const ticket of pendingTickets) {

  const { data: selections } = await supabase
    .from("ticket_selections")
    .select("*")
    .eq("ticket_id", ticket.id)

  if (!selections || selections.length === 0) continue

  if (selections.some(s => s.result === "pending")) continue

  const hasLost = selections.some(s => s.result === "lost")
  const allWon = selections.every(s => s.result === "won" || s.result === "void")

  let ticketStatus: "won" | "lost" = "lost"

  if (allWon) ticketStatus = "won"

  const { data: season } = await supabase
    .from("season_instances")
    .select("*")
    .eq("id", ticket.season_instance_id)
    .single()

  if (!season) continue

  let newBalance = season.current_balance

  if (ticketStatus === "won") {

    let totalOdds = 1

    for (const s of selections) {
      if (s.result !== "void") {
        totalOdds *= Number(s.odds)
      }
    }

    const returns = Number(ticket.stake) * totalOdds
    newBalance += returns
  }

  await supabase
    .from("tickets")
    .update({
      status: ticketStatus,
      settlement_time: new Date().toISOString()
    })
    .eq("id", ticket.id)

  await supabase
    .from("season_instances")
    .update({
      current_balance: newBalance
    })
    .eq("id", season.id)

}

}

return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })

})



