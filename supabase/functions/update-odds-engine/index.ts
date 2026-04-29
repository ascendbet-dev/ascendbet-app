import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { calculateForm } from "../_shared/formEngine.ts";

const FOOTBALL_KEY = Deno.env.get("FOOTBALL_DATA_KEY")

const supabase = createClient(
 Deno.env.get("SUPABASE_URL")!,
 Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

/* ---------------- LEAGUES ---------------- */

const COMPETITIONS = [
  "PL","ELC","EL1","EL2","FAC","EFL",
  "PD","BL1","SA","FL1",
  "DED","PPL","BSA",
  "BPL","DSL","IPL","SPL","ED2","SSL","TSL",
  "MLS",
  "CL","EL","ECL"
]

const SPORTSDB_LEAGUE_MAP: Record<string, string> = {
    "English Premier League": "PL",
    "English League Championship": "ELC",

    "English League One": "EL1",
    "English League 1": "EL1",
    "League One": "EL1",

    "English League Two": "EL2",
    "English League 2": "EL2",
    "League Two": "EL2",

    "FA Cup": "FAC",
    "EFL Cup": "EFL",
  
    "Spanish La Liga": "PD",
    "German Bundesliga": "BL1",
    "Italian Serie A": "SA",
    "French Ligue 1": "FL1",
    
    "Portuguese Primeira Liga": "PPL",
    "Primeira Liga": "PPL",
    "Liga NOS": "PPL",
  
    "Belgian Pro League": "BPL",
    "Belgian First Division A": "BPL",

    "Danish Superliga": "DSL",
    "Israeli Premier League": "IPL",
    "Saudi Pro League": "SPL",
    "Swiss Super League": "SSL",
    "Turkish Super Lig": "TSL",
    
    "Dutch Eerste Divisie": "ED2",
    "Eerste Divisie": "ED2",
    "Netherlands Eerste Divisie": "ED2",

    "Major League Soccer": "MLS",
    "American Major League Soccer": "MLS",
    "MLS": "MLS",

    "UEFA Champions League": "CL",
    "UEFA Europa League": "EL",
    "UEFA Europa Conference League": "ECL",
  
    "International Friendlies": "INT"
  };

/* ---------------- MATH ---------------- */

function factorial(n:number){
    let result = 1
    for(let i=2;i<=n;i++){
     result *= i
    }
    return result
   }

function poisson(lambda:number,k:number){
 return (Math.pow(lambda,k)*Math.exp(-lambda))/factorial(k)
}

/* ---------------- SCORE MATRIX ---------------- */

function scoreMatrix(homeXG:number,awayXG:number){

    const MAX_GOALS = 15
    const matrix:number[][]=[]
   
    const rho = -0.10
   
    for(let h=0;h<=MAX_GOALS;h++){
   
     matrix[h]=[]
   
     for(let a=0;a<=MAX_GOALS;a++){
   
      let p = poisson(homeXG,h)*poisson(awayXG,a)
   
      if(h===0 && a===0) p *= 1 - (homeXG*awayXG*rho)
      if(h===0 && a===1) p *= 1 + (homeXG*rho)
      if(h===1 && a===0) p *= 1 + (awayXG*rho)
      if(h===1 && a===1) p *= 1 - rho
   
      matrix[h][a] = p
   
     }
   
    }
   
    return matrix
   }

/* ---------------- Normalize MATRIX ---------------- */

function normalizeMatrix(matrix:number[][]){
    let total = 0
  
    for(let h=0; h<matrix.length; h++){
      for(let a=0; a<matrix.length; a++){
        total += matrix[h][a]
      }
    }
  
    for(let h=0; h<matrix.length; h++){
      for(let a=0; a<matrix.length; a++){
        matrix[h][a] /= total
      }
    }
  
    return matrix
  }

  function safe(p:number){
    return Math.max(0, Math.min(1, p))
  }

  function clampTotals(p:number){

    // soft bounds
      if(p > 0.70) return 0.70 + (p - 0.70) * 0.5
      if(p < 0.30) return 0.30 - (0.30 - p) * 0.5

    return p
  }
  

/* ---------------- LEAGUE MODIFIER ---------------- */

const LEAGUE_GOALS: Record<string, number> = {
 PL:1.00, BL1:1.08, PD:0.92, SA:0.94,
 FL1:0.90, ELC:0.93, DED:1.10, PPL:0.88,
 BSA:0.82, ED2:1.12, CL:1.02
}


/* ---------------- FORM BOOST ---------------- */

function formBoost(form:any){

  let boost = 0

  boost += (form.points - 7.5) * 5
  boost += form.winStreak * 8
  boost += (form.avgGoalsFor - 1.3) * 25
  boost -= (form.avgGoalsAgainst - 1.3) * 20

  return boost
}

/* ---------------- EXPECTED GOALS ---------------- */

function expectedGoals(
  home:number,
  away:number,
  league:string,
  homeForm:any,
  awayForm:any,
  goalBias:number
){

  let baseAdv = 50

// 🔥 UCL HOME ADVANTAGE REDUCTION
if (league === "CL") {
  baseAdv = 20
}

// 🔥 reduce home advantage when mismatch is large
const strengthGap = Math.abs(home - away)

const adjustedAdv =
  strengthGap > 150 ? 30 :
  strengthGap > 100 ? 35 :
  strengthGap > 50  ? 40 :
  baseAdv

const diff = (home + adjustedAdv) - away

const tempoMap: Record<string, number> = {
  PL: 2.8,
  BL1: 3.0,
  PD: 2.65,
  SA: 2.45,
  FL1: 2.6,

  // 🔥 ADD THESE
  DED: 3.1,
  ED2: 3.05,   // Netherlands (very attacking)
  PPL: 2.5,   // Portugal
  BSA: 2.4,   // Brazil
  TSL: 2.7,   // Turkey
  MLS: 2.9    // MLS high scoring
}

let tempoBase = (tempoMap[league] ?? 2.6)

// 🔥 UCL HARD CONTROL
if (league === "CL") {
  tempoBase *= 0.92   // stronger cut
}

  // 🔥 team strength effect
  const strengthDividerMap: Record<string, number> = {
    PL: 1400,   // keep stable
    PD: 1100,   // keep stable
    BL1: 1200,
    SA: 1200,
    FL1: 900,
    ELC: 1000
  }
  
  const divider = strengthDividerMap[league] ?? 1200
  
  const attackFactor =
  ((home - 1700) + (away - 1700)) / divider

  // 🔥 form goals
  const formGoals =
    ((homeForm?.avgGoalsFor ?? 1.2) +
     (awayForm?.avgGoalsFor ?? 1.2)) / 2

  const formFactor = (formGoals - 1.2) * 0.4

  let baseTotal =
  tempoBase *
  (1 + attackFactor * 0.3) *
  (1 + formFactor * 0.25)

  // 🔥 UCL: reduce attacking inflation
if (league === "CL") {
  baseTotal *= 0.95
}

    // 🔥 SAFE GOAL BIAS (NO EXPLOSION)
  const cappedBias = Math.max(-0.08, Math.min(0.08, goalBias))
  baseTotal *= (1 + cappedBias)

  let homeShare = 1 / (1 + Math.exp(-diff / 400))

if (league === "CL") {
  homeShare = 1 / (1 + Math.exp(-diff / 650))
  homeShare *= 0.97   // 🔥 VERY IMPORTANT
}

  const homeXG = baseTotal * homeShare
  const awayXG = baseTotal * (1 - homeShare)


  return { homeXG, awayXG }
}

/* ---------------- MATCH PROBS ---------------- */

function matchProbs(matrix:number[][]){

 let home=0
 let draw=0
 let away=0

 for(let h=0;h<matrix.length;h++){
 for(let a=0;a<matrix.length;a++){

 const p=matrix[h][a]

 if(h>a) home+=p
 else if(h===a) draw+=p
 else away+=p

 }}


 const total = home+draw+away

 return{
  home:home/total,
  draw:draw/total,
  away:away/total
 }

}


/* ---------------- TOTAL GOALS ---------------- */

function totals(matrix:number[][], league:string){

  let over05=0, over15=0, over25=0, over35=0, over45=0
  let totalProb = 0

  for(let h=0; h<matrix.length; h++){
    for(let a=0; a<matrix.length; a++){

      const p = matrix[h][a]
      
      const goals = h + a

    let adjustedP = p

    // 🔥 La Liga mid-score correction (THIS IS YOUR LINE)
    if (league === "PD") {
      if (goals === 2) adjustedP *= 1.06
      if (goals === 3) adjustedP *= 1.12
    }

    if (league === "SA") {
      if (goals === 2) adjustedP *= 1.05
      if (goals === 3) adjustedP *= 1.08
    }

      totalProb += adjustedP

      if(goals >= 1) over05 += adjustedP
      if(goals >= 2) over15 += adjustedP
      if(goals >= 3) over25 += adjustedP
      if(goals >= 4) over35 += adjustedP
      if(goals >= 5) over45 += adjustedP
    }
  }

  // normalize
  over05 /= totalProb
  over15 /= totalProb
  over25 /= totalProb
  over35 /= totalProb
  over45 /= totalProb

  if (league === "CL") {
    const target15 = 0.72
    const diff15 = target15 - over15
  
    over15 = safe(over15 + diff15 * 0.7)
  }

  return {
    over05, under05:1-over05,
    over15, under15:1-over15,
    over25, under25:1-over25,
    over35, under35:1-over35,
    over45, under45:1-over45
  }

}

/* ---------------- BTTS ---------------- */

function btts(matrix:number[][], homeXG:number, awayXG:number){

  let yes = 0
  let total = 0

  for(let h=0; h<matrix.length; h++){
    for(let a=0; a<matrix.length; a++){

      const p = matrix[h][a]
      total += p

      if(h > 0 && a > 0){

        let adjusted = p

        // 🔥 MUCH LIGHTER CONTROL

      if(homeXG < 0.9 && h > 0) adjusted *= 0.97
      if(awayXG < 0.9 && a > 0) adjusted *= 0.97

      if(Math.abs(homeXG - awayXG) > 1.5){
        adjusted *= 0.96
      }
        yes += adjusted
      }
    }
  }

  yes /= total


    // 🔥 GLOBAL MICRO BOOST (fix market alignment)
    yes = safe(yes)

  return {
    yes,
    no: 1 - yes
  }
}


/* ---------------- HALF / NIL MARKETS ---------------- */

function halfMarkets(homeXG:number,awayXG:number){

    const h1_home = homeXG * 0.45
    const h1_away = awayXG * 0.45
    
    const h2_home = homeXG * 0.55
    const h2_away = awayXG * 0.55
    
    let homeWinBoth = 0
    let awayWinBoth = 0
    let homeWinEither = 0
    let awayWinEither = 0
    let homeWinNil = 0
    let awayWinNil = 0
    
    for(let h1=0;h1<=6;h1++){
    for(let a1=0;a1<=6;a1++){
    
    const p1 = poisson(h1_home,h1)*poisson(h1_away,a1)
    
    for(let h2=0;h2<=6;h2++){
    for(let a2=0;a2<=6;a2++){
    
    const p2 = poisson(h2_home,h2)*poisson(h2_away,a2)
    
    const p = p1*p2
    
    /* home win both halves */
    
    if(h1>a1 && h2>a2){
    homeWinBoth += p
    }
    
    /* away win both halves */
    
    if(a1>h1 && a2>h2){
    awayWinBoth += p
    }
    
    /* home win either half */
    
    if(h1>a1 || h2>a2){
    homeWinEither += p
    }
    
    /* away win either half */
    
    if(a1>h1 || a2>h2){
    awayWinEither += p
    }
    
    /* win to nil */
    
    if(h1+h2 > a1+a2 && (a1+a2)===0){
    homeWinNil += p
    }
    
    if(a1+a2 > h1+h2 && (h1+h2)===0){
    awayWinNil += p
    }
    
    }}}}
    
    return{
    
    home_win_both:homeWinBoth,
    away_win_both:awayWinBoth,
    
    home_win_either:homeWinEither,
    away_win_either:awayWinEither,
    
    home_win_nil:homeWinNil,
    away_win_nil:awayWinNil
    
    }
    
    }

/* ---------------- HANDICAP (FIXED) ---------------- */

function handicap(matrix:number[][]){

    function calcHome(line:number){
    
    let win = 0
    let push = 0
    
    for(let h=0; h<matrix.length; h++){
    for(let a=0; a<matrix.length; a++){
    
    const diff = h - a
    const p = matrix[h][a]
    
    if(diff > line) win += p
    if(diff === line) push += p
    
    }}
    
    const active = 1 - push
    return active > 0 ? win / active : 0
    }
    
    function calcAway(line:number){
    
    let win = 0
    let push = 0
    
    for(let h=0; h<matrix.length; h++){
    for(let a=0; a<matrix.length; a++){
    
    const diff = a - h
    const p = matrix[h][a]
    
    if(diff > line) win += p
    if(diff === line) push += p
    
    }}
    
    const active = 1 - push
    return active > 0 ? win / active : 0
    }
    
    return {
    
    home_minus15: calcHome(1.5),
    home_minus1: calcHome(1),
    home_minus05: calcHome(0.5),
    
    away_plus05: calcAway(-0.5),
    away_plus1: calcAway(-1),
    away_plus15: calcAway(-1.5)
    
    }
    
    }


/* ---------------- TEAM TOTALS ---------------- */

function teamTotals(homeXG:number,awayXG:number){

    function over(lambda:number,line:number){

        let prob = 0
       
        const start = Math.floor(line) + 1
       
        for(let g=start; g<=15; g++){
       
         let p = poisson(lambda,g)
       
         /* strong attacks (Spurs etc) */
         if(lambda > 1.6 && g >= 1){
           p *= 0.92
         }
       
         /* weak attacks (Palace etc) */
         if(lambda < 1.2){
       
           if(g === 1) p *= 0.85   // reduce 1-goal spike
           if(g === 2) p *= 1.20
           if(g === 3) p *= 1.35
           if(g >= 4) p *= 1.25
       
         }
       
         prob += p
        }
       
        return prob
       }
   
    const home05 = over(homeXG,0.5)
    const home15 = over(homeXG,1.5)
    const home25 = over(homeXG,2.5)
    const home35 = over(homeXG,3.5)
   
    const away05 = over(awayXG,0.5)
    const away15 = over(awayXG,1.5)
    const away25 = over(awayXG,2.5)
    const away35 = over(awayXG,3.5)
   
    return{
   
     home_over05:home05,
     home_under05:1-home05,
   
     home_over15:home15,
     home_under15:1-home15,
   
     home_over25:home25,
     home_under25:1-home25,
   
     home_over35:home35,
     home_under35:1-home35,
   
     away_over05:away05,
     away_under05:1-away05,
   
     away_over15:away15,
     away_under15:1-away15,
   
     away_over25:away25,
     away_under25:1-away25,
   
     away_over35:away35,
     away_under35:1-away35
    }
   }

/* ---------------- HALVES ---------------- */

function halves(homeXG:number,awayXG:number){

    const firstHalf = (homeXG + awayXG) * 0.45
    const secondHalf = (homeXG + awayXG) * 0.55
    
    /* probability of 0 or 1 goals */
    
    const first_under15 =
    poisson(firstHalf,0) +
    poisson(firstHalf,1)
    
    const second_under15 =
    poisson(secondHalf,0) +
    poisson(secondHalf,1)
    
    /* probability of 2+ goals */
    
    const first_over15 = 1 - first_under15
    const second_over15 = 1 - second_under15
    
    /* both halves */
    
    const both_over15 = first_over15 * second_over15
    const both_under15 = first_under15 * second_under15
    
    return{
    
    both_halves_over15: both_over15,
    both_halves_over15_no: 1 - both_over15,
    
    both_halves_under15: both_under15,
    both_halves_under15_no: 1 - both_under15
    
    }
    
    }

/* ---------------- HALVES TOTALS ---------------- */
    
function halfTotals(homeXG:number,awayXG:number){

        const firstHalfLambda = (homeXG + awayXG) * 0.45
        const secondHalfLambda = (homeXG + awayXG) * 0.55
        
        function calc(lambda:number,line:number){
        
        let prob = 0
        
        const start = Math.floor(line) + 1
        
        for(let g=start; g<=10; g++){
        prob += poisson(lambda,g)
        }
        
        return prob
        
        }
        
        /* FIRST HALF */
        
        const fh05 = calc(firstHalfLambda,0.5)
        const fh1 = calc(firstHalfLambda,1)
        const fh15 = calc(firstHalfLambda,1.5)
        const fh2 = calc(firstHalfLambda,2)
        const fh25 = calc(firstHalfLambda,2.5)
        const fh3 = calc(firstHalfLambda,3)
        
        /* SECOND HALF */
        
        const sh05 = calc(secondHalfLambda,0.5)
        const sh1 = calc(secondHalfLambda,1)
        const sh15 = calc(secondHalfLambda,1.5)
        const sh2 = calc(secondHalfLambda,2)
        const sh25 = calc(secondHalfLambda,2.5)
        const sh3 = calc(secondHalfLambda,3)
        
        return{
        
        /* FIRST HALF */
        
        fh_over05:fh05,
        fh_under05:1-fh05,
        
        fh_over1:fh1,
        fh_under1:1-fh1,
        
        fh_over15:fh15,
        fh_under15:1-fh15,
        
        fh_over2:fh2,
        fh_under2:1-fh2,
        
        fh_over25:fh25,
        fh_under25:1-fh25,
        
        fh_over3:fh3,
        fh_under3:1-fh3,
        
        /* SECOND HALF */
        
        sh_over05:sh05,
        sh_under05:1-sh05,
        
        sh_over1:sh1,
        sh_under1:1-sh1,
        
        sh_over15:sh15,
        sh_under15:1-sh15,
        
        sh_over2:sh2,
        sh_under2:1-sh2,
        
        sh_over25:sh25,
        sh_under25:1-sh25,
        
        sh_over3:sh3,
        sh_under3:1-sh3
        
        }
        
        }

/* ---------------- HIGHEST SCORING HALF ---------------- */

function highestScoringHalf(homeXG:number,awayXG:number){

    const firstLambda = (homeXG + awayXG) * 0.45
    const secondLambda = (homeXG + awayXG) * 0.55
   
    let firstHalf = 0
    let secondHalf = 0
    let equal = 0
   
    for(let g1=0; g1<=10; g1++){
    for(let g2=0; g2<=10; g2++){
   
    const p =
    poisson(firstLambda,g1) *
    poisson(secondLambda,g2)
   
    if(g1>g2) firstHalf+=p
    else if(g2>g1) secondHalf+=p
    else equal+=p
   
    }}
   
    const total = firstHalf + secondHalf + equal
   
    return{
    first_half:firstHalf/total,
    second_half:secondHalf/total,
    equal:equal/total
    }
   
   }

/* ---------------- COMBO MARKETS ---------------- */

function comboMarkets(matrix:number[][]){

    let home_over15=0
    let draw_over15=0
    let away_over15=0
    
    let home_over25=0
    let draw_over25=0
    let away_over25=0
    
    let home_btts=0
    let draw_btts=0
    let away_btts=0
    
    let over25_btts=0
    let under25_btts=0
    
    for(let h=0;h<matrix.length;h++){
    for(let a=0;a<matrix.length;a++){
    
    const p = matrix[h][a]
    const goals = h+a
    
    const homeWin = h>a
    const drawMatch = h===a
    const awayWin = a>h
    
    const btts = h>0 && a>0
    
    /* ---------- 1X2 + O/U 1.5 ---------- */
    
    if(goals>=2){
    
    if(homeWin) home_over15+=p
    if(drawMatch) draw_over15+=p
    if(awayWin) away_over15+=p
    
    }
    
    /* ---------- 1X2 + O/U 2.5 ---------- */
    
    if(goals>=3){
    
    if(homeWin) home_over25+=p
    if(drawMatch) draw_over25+=p
    if(awayWin) away_over25+=p
    
    }
    
    /* ---------- 1X2 + BTTS ---------- */
    
    if(btts){
    
    if(homeWin) home_btts+=p
    if(drawMatch) draw_btts+=p
    if(awayWin) away_btts+=p
    
    }
    
    /* ---------- O/U + BTTS ---------- */
    
    if(goals>=3 && btts) over25_btts+=p
    if(goals<=2 && btts) under25_btts+=p
    
    }}
    
    return{
    
    home_over15,
    draw_over15,
    away_over15,
    
    home_over25,
    draw_over25,
    away_over25,
    
    home_btts,
    draw_btts,
    away_btts,
    
    over25_btts,
    under25_btts
    
    }
    }

/* ---------------- WIN OR MARKETS ---------------- */

function winOrMarkets(
        probs:any,
        t:any,
        both:any,
        combo:any
      ){
      
      function clamp(p:number){
       return Math.max(0,Math.min(1,p))
      }
      
      return{
      
      /* -------- WIN OR OVER/UNDER 2.5 -------- */
      
      home_or_over25:
      clamp(probs.home + t.over25 - combo.home_over25),
      
      home_or_under25:
      clamp(probs.home + t.under25 - (probs.home - combo.home_over25)),
      
      draw_or_over25:
      clamp(probs.draw + t.over25 - combo.draw_over25),
      
      draw_or_under25:
      clamp(probs.draw + t.under25 - (probs.draw - combo.draw_over25)),
      
      away_or_over25:
      clamp(probs.away + t.over25 - combo.away_over25),
      
      away_or_under25:
      clamp(probs.away + t.under25 - (probs.away - combo.away_over25)),
      
      /* -------- WIN OR GG -------- */
      
      home_or_gg:
      clamp(probs.home + both.yes - combo.home_btts),
      
      draw_or_gg:
      clamp(probs.draw + both.yes - combo.draw_btts),
      
      away_or_gg:
      clamp(probs.away + both.yes - combo.away_btts)
      
      }
      
      }

/* ---------------- ODDS ---------------- */

function odds(p:number){
  const margin = 1.10
  const prob = Math.max(0.001, Math.min(0.999, p))

  let price = 1 / (prob * margin)

  if(price < 1.02) price = 1.02

  return +price.toFixed(2)
}

/* ---------------- API-FOOTBALL FIXTURE FETCH ---------------- */
async function fetchSportsDBFixtures(){

    try{
  
      console.log("🌍 SportsDB fallback start");
  
      const API_KEY = "123";
  
      const leagues = [
        "4328","4329","4396","4397","4480","4481",
        "4335","4331","4332","4334",
        "4338","4344","4349","4342","4355","4339","4346"
      ];
  
      let all:any[] = [];
  
      /* 🔥 1. NEXT LEAGUE MATCHES */
  
      for(const leagueId of leagues){
  
        const res = await fetch(
          `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsnextleague.php?id=${leagueId}`
        );
  
        const data = await res.json();
  
        console.log(`📦 League ${leagueId}:`, data.events?.length);
  
        if(data.events){
          all.push(...data.events);
        }
      }
  
      /* 🔥 2. MATCHES BY DATE (CRITICAL ADDITION) */
  
      const today = new Date();
      const date = today.toISOString().split("T")[0];
  
      const resDay = await fetch(
        `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsday.php?d=${date}&s=Soccer`
      );
  
      const dayData = await resDay.json();
  
      console.log("📅 Events today:", dayData.events?.length);
  
      if(dayData.events){
        all.push(...dayData.events);
      }
  
      console.log("🌍 TOTAL SportsDB:", all.length);
  
      if(!all.length) return [];
  
      return all.map((e:any)=>{

        const leagueName = e.strLeague;
        const code = SPORTSDB_LEAGUE_MAP[leagueName] ?? "INT";
      
        return {
      
          id: e.idEvent,
      
          utcDate: e.dateEvent + "T" + (e.strTime || "00:00:00"),
      
          competition:{
            code
          },
      
          homeTeam:{
            name: e.strHomeTeam
          },
      
          awayTeam:{
            name: e.strAwayTeam
          }
      
        }
      
      });
  
    }catch(err){
      console.error("SportsDB error:", err);
      return [];
    }
  
  }

  const TEAM_ALIASES: Record<string,string> = {

    // Sporting
    "sportingcp": "sporting",
    "sportingclubedeportugal": "sporting",
    "sporting": "sporting",
  
    // Arsenal
    "arsenalfc": "arsenal",
    "arsenal": "arsenal",

    // FC Augsburg
    "fcaugsburg": "augsburg",
    "augsburg": "augsburg",

    // AS Roma
    "asroma": "roma",
    "roma": "roma",
    
    // AZ Alkmaar
    "azalkmaar": "az",
    "az": "az",

    // PSV
    "psveindhoven": "psv",
    "psv": "psv",

    // PEC Zwolle
    "peczwolle": "peczwolle",
    "zwolle": "peczwolle",

    // Go Ahead Eagles
    "goaheadeagles": "goahead",
    "goahead": "goahead",

    // Hoffenheim
    "tsg1899hoffenheim": "hoffenheim",
    "hoffenheim": "hoffenheim",
  
  
    // Moreirense
    "moreirensefc": "moreirense",
    "moreirense": "moreirense",
  
    // Famalicao
    "fcfamalicão": "famalicao",
    "famalicao": "famalicao",
  
    // Marseille
    "olympiquedemarseille": "marseille",
    "marseille": "marseille",

    // Liverpool FC
    "liverpoolfc": "liverpool",
    "liverpool": "liverpool",

        // Athletic Bilbao
    "athleticclub": "bilbao",
    "athleticbilbao": "bilbao",
    "athletic": "bilbao",

    // Osasuna
    "caosasuna": "osasuna",
    "osasuna": "osasuna",

    // Pisa
    "acpisa1909": "pisa",
    "pisa1909": "pisa",
    "pisa": "pisa",

    // Genoa
    "genoacfc": "genoa",
    "genoa": "genoa",

    // Juventus
    "juventusfc": "juventus",
    "juventus": "juventus",

    // Bologna
    "bolognafc1909": "bologna",
    "bologna": "bologna",

      // PSG
    "parissg": "psg",
    "parissaintgermain": "psg",

    "manchestercity": "mancity",
    "mancity": "mancity",

    "manchesterunited": "manunited",
    "manutd": "manunited",

    "tottenhamhotspur": "tottenham",
    "spurs": "tottenham",

    "newcastleunited": "newcastle",

    "wolverhamptonwanderers": "wolves",

    "brightonandhovealbion": "brighton"
  }

  function simplify(name:string){
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/fc|cf|afc|sc|ac|as|tsg/gi,"")
      .replace(/[^a-z0-9]/g,"")
  }

  function getCanonicalTeam(name: string) {
    const cleaned = simplify(name);
  
    if (TEAM_ALIASES[cleaned]) {
      return TEAM_ALIASES[cleaned];
    }
  
    // 🔥 NEW: partial matching fallback
    for (const key in TEAM_ALIASES) {
      if (cleaned.includes(key)) {
        return TEAM_ALIASES[key];
      }
    }
  
    return cleaned.replace(/[0-9]/g, "");
  }

/* ---------------- FIXTURE FETCH ---------------- */

async function fetchFixtures(){

    const today = new Date()
    const to = new Date()
   
    to.setDate(today.getDate() + 14)
   
    const from = today.toISOString().split("T")[0]
    const toDate = to.toISOString().split("T")[0]

    const competitions = [
    "PL","PD","BL1","SA","FL1",
    "ELC","PPL","DED","BSA",
    "CL","WC","EC"
    ]

    const requests = competitions.map(comp =>
      fetch(
        `https://api.football-data.org/v4/competitions/${comp}/matches?status=SCHEDULED`,
        {
          headers:{ "X-Auth-Token": FOOTBALL_KEY! }
        }
      )
    )

    const responses = await Promise.all(requests)

    let baseMatches:any[] = []

    for(let i=0;i<responses.length;i++){

      const res = responses[i]
      const comp = competitions[i]

      console.log(`📡 ${comp}:`, res.status)

      const data = await res.json()

      console.log(`📦 ${comp} matches:`, data.matches?.length)

      if(data.matches){
        baseMatches.push(...data.matches)
      }
    }

    console.log("⚽ Base matches:", baseMatches.length)  

    const BLOCKED_LEAGUES = new Set([
      "PL",   // Premier League
      "PD",   // La Liga
      "BL1",  // Bundesliga
      "SA",   // Serie A
      "FL1",  // Ligue 1
      "ELC",  // Championship
      "PPL",  // Portugal
      "DED",  // Eredivisie
      "BSA",  // Brazil
      "CL",   // Champions League
      "WC",   // World Cup
      "EC"    // Euros
    ])

   
    /* 🔥 USE FALLBACK ONLY IF LOW */
   
    const fallback = await fetchSportsDBFixtures()

    console.log("🌍 SportsDB matches:", fallback.length)
    
    const map = new Map()

    // 🔥 STEP 1: INSERT ONLY FOOTBALL-DATA FIRST
    baseMatches.forEach(m => {

      if(!m?.homeTeam?.name || !m?.awayTeam?.name) return

      const home = getCanonicalTeam(m.homeTeam.name)
      const away = getCanonicalTeam(m.awayTeam.name)

      const date = new Date(m.utcDate)

      const roundedTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        0,
        0
      ).getTime()

      const teams = [home, away].sort().join("_")
      const key = `${teams}_${roundedTime}`

      // 👇 ADD THIS
  if (map.has(key)) {
    console.log("⚠️ DUPLICATE IN FOOTBALL-DATA:", key)
  }

      map.set(key, m) // ✅ ALWAYS trust football-data
    })


    // 🔥 STEP 2: ADD SPORTDB ONLY IF MISSING
    fallback.forEach(m => {

      if(!m?.homeTeam?.name || !m?.awayTeam?.name) return
    
      const leagueCode = m.competition?.code
    
      // 🚫 BLOCK leagues already covered by football-data
      if (BLOCKED_LEAGUES.has(leagueCode)) {
        console.log("🚫 BLOCKED LEAGUE (sportsdb):", leagueCode)
        return
      }
    
      const home = getCanonicalTeam(m.homeTeam.name)
      const away = getCanonicalTeam(m.awayTeam.name)
    
      const date = new Date(m.utcDate)
    
      const roundedTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        0,
        0
      ).getTime()
    
      const teams = [home, away].sort().join("_")
      const key = `${teams}_${roundedTime}`
    
      if (!map.has(key)) {
        map.set(key, m)
      }
    
    })
              
    const merged = Array.from(map.values())
    
    merged.sort((a,b)=>
      new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
    )
    
    console.log("✅ FINAL MERGED:", merged.length)
    
    return merged.slice(0,150)

  }

/* ---------------- ENGINE ---------------- */

serve(async()=>{

 try{

 const fixtures=await fetchFixtures()

 console.log("🚨 FIXTURES COUNT:", fixtures.length);

 const now = new Date().toISOString()

await supabase
  .from("odds_matches")
  .delete()
  .lte("commence_time", now)

 const { data: ratings } = await supabase
 .from("team_ratings")
 .select("team,rating")

 const { data: calibration } = await supabase
.from("model_calibration")
.select("*");

const calMap: Record<string, any> = {};

calibration?.forEach(c => {
  calMap[c.league] = c;
});

 const ratingMap: Record<string, number> = {}

 ratings?.forEach((r:any)=>{
  const key = getCanonicalTeam(r.team)
  ratingMap[key] = r.rating
})

const { data: allHistory } = await supabase
  .from("team_match_history")
  .select("*")
  .order("match_date", { ascending: false });

const history = allHistory ?? [];

 for(const m of fixtures){

  console.log("⚽ Processing:", m.homeTeam?.name, "vs", m.awayTeam?.name);

  const source = typeof m.id === "number"
  ? "football-data"
  : "sportsdb";

  const homeKey = getCanonicalTeam(m.homeTeam.name)
  const awayKey = getCanonicalTeam(m.awayTeam.name)
  
  const date = new Date(m.utcDate)
  
  const roundedTime = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    0,
    0
  ).getTime()
  
  const teamsSorted = [homeKey, awayKey].sort().join("_")
  const matchId = `${teamsSorted}_${new Date(m.utcDate).getTime()}`
  const externalId = m.id ? String(m.id) : String(matchId);

 const home=m.homeTeam.name
 const away=m.awayTeam.name

 // 🔥 GET LAST 5 MATCHES

 const homeMatches = history
 .filter(m => m.home_team === homeKey || m.away_team === homeKey)
 .slice(0, 5);

const awayMatches = history
 .filter(m => m.home_team === awayKey || m.away_team === awayKey)
 .slice(0, 5);


console.log("📊 HOME MATCHES:", home, homeMatches.length);
console.log("📊 AWAY MATCHES:", away, awayMatches.length);

/* 🔥 FORM */
const homeForm = calculateForm(
 homeMatches.map(m => ({ ...m, team: homeKey }))
);

const awayForm = calculateForm(
 awayMatches.map(m => ({ ...m, team: awayKey }))
);

const baseHome = ratingMap[homeKey] ?? 1750
const baseAway = ratingMap[awayKey] ?? 1750

const homeBoost =
  homeMatches && homeMatches.length >= 3
    ? formBoost(homeForm)
    : 0

const awayBoost =
  awayMatches && awayMatches.length >= 3
    ? formBoost(awayForm)
    : 0

const homeRating = baseHome + homeBoost
const awayRating = baseAway + awayBoost

const cal = calMap[m.competition.code];

let goalBias = 0;

if (cal && cal.sample_size > 20) {
  goalBias = cal.goal_bias ?? 0;
}

const { homeXG, awayXG } = expectedGoals(
  homeRating,
  awayRating,
  m.competition.code,
  homeForm,
  awayForm,
  goalBias
)


 const matrix = normalizeMatrix(
  scoreMatrix(homeXG, awayXG)
)

let probs = matchProbs(matrix)

// 🔥 DRAW CALIBRATION
const DRAW_BOOST = 1.08;

probs.draw *= DRAW_BOOST;

const totalDrawFix = probs.home + probs.draw + probs.away;

probs.home /= totalDrawFix;
probs.draw /= totalDrawFix;
probs.away /= totalDrawFix;

if (cal && cal.sample_size > 20) {

  const adjust = (p:number, model:number, actual:number) => {
    const diff = actual - model;
    return safe(p + diff * 0.25);
  };

  probs.home = adjust(probs.home, cal.avg_home_prob, cal.actual_home_rate);
  probs.draw = adjust(probs.draw, cal.avg_draw_prob, cal.actual_draw_rate);
  probs.away = adjust(probs.away, cal.avg_away_prob, cal.actual_away_rate);

  const total = probs.home + probs.draw + probs.away;

  probs.home /= total;
  probs.draw /= total;
  probs.away /= total;
}

// 🔥 BIG MATCH CONTEXT (VERY IMPORTANT)

function isBigMatch(homeKey:string, awayKey:string){

  const BIG_TEAMS = [
    "mancity","arsenal","liverpool","chelsea",
    "manunited","tottenham",
    "realmadrid","barcelona","atleticomadrid",
    "bayernmunich","psg"
  ]

  return BIG_TEAMS.includes(homeKey) && BIG_TEAMS.includes(awayKey)
}

if (isBigMatch(homeKey, awayKey)) {

  console.log("🔥 BIG MATCH DETECTED:", homeKey, "vs", awayKey)

  // reduce dominance
  probs.home *= 0.92
  probs.away *= 0.92

  // increase draw probability
  probs.draw *= 1.08

  // normalize
  const total = probs.home + probs.draw + probs.away

  probs.home /= total
  probs.draw /= total
  probs.away /= total
}


// normalize again
const totalBias = probs.home + probs.draw + probs.away

probs.home /= totalBias
probs.draw /= totalBias
probs.away /= totalBias

const league = m.competition.code
const t = totals(matrix, league)

// 🔥 LIGUE 1 FINAL CALIBRATION (CORRECT PLACE)
if (league === "FL1") {
  const target = 0.54

  const diff = target - t.over25

  t.over25 = safe(t.over25 + diff * 0.6)
  t.under25 = 1 - t.over25
}

// ✅ DEFINE FIRST
const O25_SHIFT: Record<string, number> = {
  PL: 0.02,
  BL1: 0.08,
  PD: 0.00,
  SA: 0.00,
  FL1: 0.04,
  DED: 0.05,
  ED2: 0.05 
}

// ✅ 1. LEAGUE SHIFT
const shift = (O25_SHIFT[league] ?? 0)

t.over25 = safe(t.over25 + shift)
t.under25 = 1 - t.over25


t.over25 = clampTotals(t.over25)
t.under25 = 1 - t.over25

// 🔥 BUNDESLIGA COMPRESSION (VERY IMPORTANT)
if (league === "BL1") {

  // pull extremes toward center
  if (t.over25 > 0.60) {
    t.over25 = 0.60 + (t.over25 - 0.60) * 0.5
  }

  if (t.over25 < 0.45) {
    t.over25 = 0.45 - (0.45 - t.over25) * 0.5
  }

  t.over25 = safe(t.over25)
  t.under25 = 1 - t.over25
}


// 🔥 UCL GAME CONTROL (STRONG)
if (league === "CL") {

  const target = isBigMatch(homeKey, awayKey) ? 0.62 : 0.55

  const diff = target - t.over25

  t.over25 = safe(t.over25 + diff * 0.8)   // aggressive pull

  t.under25 = 1 - t.over25
}


const both = btts(matrix, homeXG, awayXG)

// 🔥 BASE LEAGUE ADJUSTMENT (LIGHT ONLY)
const BTTS_SHIFT: Record<string, number> = {
  PL: 0.02,
  BL1: 0.04,
  PD: 0.00,
  SA: 0.00,
  FL1: 0.01
}

both.yes = safe(both.yes + (BTTS_SHIFT[league] ?? 0))

if (league === "CL") {

  const target = isBigMatch(homeKey, awayKey) ? 0.64 : 0.58

  const diff = target - both.yes

  both.yes = safe(both.yes + diff * 0.85)

  both.no = 1 - both.yes
}

// 🔥 CORRELATION (CONTROLLED — NOT AGGRESSIVE)
let correlation = (t.over25 - 0.5) * 0.30

if (league === "CL") {
  correlation = 0   // ❌ disable for UCL
}
else if (isBigMatch(homeKey, awayKey)) {
  correlation *= 0.6
}


both.yes = safe(both.yes + correlation)
both.no = 1 - both.yes

 const hc=handicap(matrix)
 const teams = teamTotals(homeXG,awayXG)
 const halfMarketsData = halfMarkets(homeXG,awayXG)
 const halfTotalsData = halfTotals(homeXG,awayXG)
 const half=halves(homeXG,awayXG)
 const highestHalf = highestScoringHalf(homeXG,awayXG)
 const combo = comboMarkets(matrix)
 const winOr = winOrMarkets(probs,t,both,combo)


 const markets={

 h2h:{
 home:odds(probs.home),
 draw:odds(probs.draw),
 away:odds(probs.away)
 },

 totals:{
 over05:odds(t.over05),
 under05:odds(t.under05),
 over15:odds(t.over15),
 under15:odds(t.under15),
 over25:odds(t.over25),
 under25:odds(t.under25),
 over35:odds(t.over35),
 under35:odds(t.under35),
 over45:odds(t.over45),
 under45:odds(t.under45)
 },

 btts:{
 yes:odds(both.yes),
 no:odds(both.no)
 },

 double_chance:{
 home_draw:odds(probs.home+probs.draw),
 away_draw:odds(probs.away+probs.draw),
 home_away:odds(probs.home+probs.away)
 },

 draw_no_bet:{
 home:odds(probs.home/(probs.home+probs.away)),
 away:odds(probs.away/(probs.home+probs.away))
 },

 asian_handicap:{
    home_minus15: odds(hc.home_minus15),
    home_minus1: odds(hc.home_minus1),
    home_minus05: odds(hc.home_minus05),
   
    away_plus05: odds(hc.away_plus05),
    away_plus1: odds(hc.away_plus1),
    away_plus15: odds(hc.away_plus15)
   },

team_totals:{
    home_over05:odds(teams.home_over05),
    home_under05:odds(teams.home_under05),
    
    home_over15:odds(teams.home_over15),
    home_under15:odds(teams.home_under15),
    
    home_over25:odds(teams.home_over25),
    home_under25:odds(teams.home_under25),
    
    home_over35:odds(teams.home_over35),
    home_under35:odds(teams.home_under35),
    
    away_over05:odds(teams.away_over05),
    away_under05:odds(teams.away_under05),
    
    away_over15:odds(teams.away_over15),
    away_under15:odds(teams.away_under15),
    
    away_over25:odds(teams.away_over25),
    away_under25:odds(teams.away_under25),
    
    away_over35:odds(teams.away_over35),
    away_under35:odds(teams.away_under35)
    
    },

halves:{
    both_halves_over15: odds(half.both_halves_over15),
    both_halves_over15_no: odds(half.both_halves_over15_no),
        
    both_halves_under15: odds(half.both_halves_under15),
    both_halves_under15_no: odds(half.both_halves_under15_no)
        
        },

half_results:{
     home_win_both_yes:odds(halfMarketsData.home_win_both),
     home_win_both_no:odds(1-halfMarketsData.home_win_both),
            
    away_win_both_yes:odds(halfMarketsData.away_win_both),
    away_win_both_no:odds(1-halfMarketsData.away_win_both),
            
    home_win_either_yes:odds(halfMarketsData.home_win_either),
    home_win_either_no:odds(1-halfMarketsData.home_win_either),
            
    away_win_either_yes:odds(halfMarketsData.away_win_either),
    away_win_either_no:odds(1-halfMarketsData.away_win_either),
            
    home_win_nil_yes:odds(halfMarketsData.home_win_nil),
    home_win_nil_no:odds(1-halfMarketsData.home_win_nil),
            
    away_win_nil_yes:odds(halfMarketsData.away_win_nil),
    away_win_nil_no:odds(1-halfMarketsData.away_win_nil)
            
     },

highest_scoring_half:{
        first_half:odds(highestHalf.first_half ?? 0.33),
        second_half:odds(highestHalf.second_half ?? 0.34),
        equal:odds(highestHalf.equal ?? 0.33)
       },

first_half_totals:{
      over05:odds(halfTotalsData.fh_over05),
      under05:odds(halfTotalsData.fh_under05),
                
      over1:odds(halfTotalsData.fh_over1),
      under1:odds(halfTotalsData.fh_under1),
                
      over15:odds(halfTotalsData.fh_over15),
      under15:odds(halfTotalsData.fh_under15),
                
      over2:odds(halfTotalsData.fh_over2),
      under2:odds(halfTotalsData.fh_under2),
                
      over25:odds(halfTotalsData.fh_over25),
      under25:odds(halfTotalsData.fh_under25),
                
      over3:odds(halfTotalsData.fh_over3),
     under3:odds(halfTotalsData.fh_under3)
                
        },
                
second_half_totals:{ 
     over05:odds(halfTotalsData.sh_over05),
     under05:odds(halfTotalsData.sh_under05),
                
     over1:odds(halfTotalsData.sh_over1),
     under1:odds(halfTotalsData.sh_under1),
                
     over15:odds(halfTotalsData.sh_over15),
     under15:odds(halfTotalsData.sh_under15),
                
     over2:odds(halfTotalsData.sh_over2),
     under2:odds(halfTotalsData.sh_under2),
                
     over25:odds(halfTotalsData.sh_over25),
     under25:odds(halfTotalsData.sh_under25),
                
     over3:odds(halfTotalsData.sh_over3),
     under3:odds(halfTotalsData.sh_under3)
                
      },

combo:{

        /* ---------- 1X2 + Over/Under 1.5 ---------- */
        
        home_over15: odds(combo.home_over15),
        home_under15: odds(safe(probs.home - combo.home_over15)),
        
        draw_over15: odds(combo.draw_over15),
        draw_under15: odds(safe(probs.draw - combo.draw_over15)),
        
        away_over15: odds(combo.away_over15),
        away_under15: odds(safe(probs.away - combo.away_over15)),
        
        /* ---------- 1X2 + Over/Under 2.5 ---------- */
        
        home_over25: odds(combo.home_over25),
        home_under25: odds(safe(probs.home - combo.home_over25)),
        
        draw_over25: odds(combo.draw_over25),
        draw_under25: odds(safe(probs.draw - combo.draw_over25)),
        
        away_over25: odds(combo.away_over25),
        away_under25: odds(safe(probs.away - combo.away_over25)),
        
        /* ---------- 1X2 + BTTS ---------- */
        
        home_btts: odds(combo.home_btts),
        home_btts_no: odds(safe(probs.home - combo.home_btts)),
        
        draw_btts: odds(combo.draw_btts),
        draw_btts_no: odds(safe(probs.draw - combo.draw_btts)),
        
        away_btts: odds(combo.away_btts),
        away_btts_no: odds(safe(probs.away - combo.away_btts)),
        
        
        /* ---------- O/U + BTTS ---------- */

        over25_btts: odds(combo.over25_btts),

        over25_btts_no: odds(
          safe((t.over25 - combo.over25_btts) * 1.8)
        ),

        under25_btts: odds(combo.under25_btts),

        under25_btts_no: odds(
          safe((t.under25 - combo.under25_btts) * 1.2)
        )
        
        },

win_or:{

            home_or_over25: odds(winOr.home_or_over25),
            home_or_over25_no: odds(1 - winOr.home_or_over25),
            
            home_or_under25: odds(winOr.home_or_under25),
            home_or_under25_no: odds(1 - winOr.home_or_under25),
            
            draw_or_over25: odds(winOr.draw_or_over25),
            draw_or_over25_no: odds(1 - winOr.draw_or_over25),
            
            draw_or_under25: odds(winOr.draw_or_under25),
            draw_or_under25_no: odds(1 - winOr.draw_or_under25),
            
            away_or_over25: odds(winOr.away_or_over25),
            away_or_over25_no: odds(1 - winOr.away_or_over25),
            
            away_or_under25: odds(winOr.away_or_under25),
            away_or_under25_no: odds(1 - winOr.away_or_under25),
            
            home_or_gg: odds(winOr.home_or_gg),
            home_or_gg_no: odds(1 - winOr.home_or_gg),
            
            draw_or_gg: odds(winOr.draw_or_gg),
            draw_or_gg_no: odds(1 - winOr.draw_or_gg),
            
            away_or_gg: odds(winOr.away_or_gg),
            away_or_gg_no: odds(1 - winOr.away_or_gg)
            
            }

 }

 console.log("📦 INSERTING:", matchId, externalId, source);

 const { error } = await supabase
  .from("odds_matches")
  .upsert({
    fixture_id: matchId,
    external_id: externalId,
    league: m.competition.code,
    home,
    away,
    commence_time: m.utcDate,
    markets,
    source,
  }, {
    onConflict: "fixture_id",
    ignoreDuplicates: false
  });

if (error) {
  console.error("❌ UPSERT ERROR:", error);
}

 }

 return new Response(JSON.stringify({status:"odds generated"}));

}catch(err){

  console.error("ENGINE ERROR:", err)
 
  return new Response(
    JSON.stringify({error:String(err)}),
    {status:500}
  );
 
 }

});