"use client";

import { useState,useMemo,useEffect } from "react";
import type { BetSelection } from "@/lib/place-bet-types";
import {
SINGLE_ODDS_MIN,
SINGLE_ODDS_MAX,
ACC_LEG_ODDS_MIN,
ACC_LEG_ODDS_MAX,
MIN_STAKE,
MAX_STAKE
} from "@/lib/place-bet-types";

const MIN_TOTAL_ODDS = 1.8;
const MAX_TOTAL_ODDS = 6;

const QUICK_STAKES=[500,1000,1500,2000]

function formatCurrency(n:number){
return `₦${n.toLocaleString()}`
}

interface BetSlipProps{
    selections:BetSelection[]
    onRemove:(index:number)=>void
    onClear:()=>void
    onPlaceBet:(stake:number)=>void
    balance:number
    isOpen:boolean
    onToggleOpen:()=>void
    isPlacing?:boolean
    placeError?:string|null
    placeSuccess?:string|null
  
    onOpenMatch:(selection:BetSelection)=>void
  
    hasStartedMatch?: boolean // ✅ ADD THIS
    seasonEnd?: string; // ✅ ADD THIS
  }

export function BetSlip({
selections,
onRemove,
onClear,
onPlaceBet,
balance,
isOpen,
onToggleOpen,
isPlacing=false,
placeError=null,
placeSuccess=null,
onOpenMatch,
seasonEnd,
hasStartedMatch=false
}:BetSlipProps){

const [stake,setStake]=useState("")

useEffect(()=>{
if(selections.length===0)setStake("")
},[selections.length])

/* duplicate detection */

const duplicateMatches=useMemo(()=>{

const map:Record<string,number>={}

selections.forEach(s=>{
map[s.fixture_id]=(map[s.fixture_id]||0)+1
})

return map

},[selections])

const hasDuplicate=Object.values(duplicateMatches).some(v=>v>1)

/* odds calc */

const totalOdds = useMemo(() => {
  if(selections.length === 0) return 0
  return selections.reduce((acc,s) => acc * s.odds, 1)
}, [selections])

const normalizedTotalOdds = Number(totalOdds.toFixed(2));

const stakeNum=parseFloat(stake)||0
const potentialReturn=stakeNum*totalOdds

const isSingle=selections.length<=1


/* odds validation */

const oddsError=useMemo(()=>{

if(selections.length===0)return null

if(hasDuplicate)return"Only one selection allowed per match"

if(isSingle){

  if(normalizedTotalOdds < SINGLE_ODDS_MIN || normalizedTotalOdds > SINGLE_ODDS_MAX)
    return `Total odds must be ${SINGLE_ODDS_MIN} - ${SINGLE_ODDS_MAX}`

}else{

  const bad = selections.find(
    s => s.odds < ACC_LEG_ODDS_MIN || s.odds > ACC_LEG_ODDS_MAX
  )

  if(bad)
    return `Each leg must be ${ACC_LEG_ODDS_MIN} - ${ACC_LEG_ODDS_MAX}`

  if(normalizedTotalOdds < MIN_TOTAL_ODDS || normalizedTotalOdds > MAX_TOTAL_ODDS)
    return `Total odds must be ${MIN_TOTAL_ODDS} - ${MAX_TOTAL_ODDS}`
}

return null

},[selections,isSingle,totalOdds,hasDuplicate])

/* stake validation */

const stakeError=useMemo(()=>{

if(selections.length===0)return null

if(stake==="")return"Enter stake"

if(stakeNum<MIN_STAKE)return`Min stake ${formatCurrency(MIN_STAKE)}`

if(stakeNum>MAX_STAKE)return`Max stake ${formatCurrency(MAX_STAKE)}`

if(stakeNum>balance)return"Insufficient balance"

return null

},[stake,stakeNum,balance,selections.length])

const canPlace =
  selections.length > 0 &&
  !stakeError &&
  !oddsError &&
  !isPlacing &&
  !hasStartedMatch;

function handlePlace(){
  if(!canPlace){
    return; // or trigger UI feedback if needed
  }

  onPlaceBet(stakeNum);
  setStake("");
}

function setQuickStake(v:number){
setStake(String(v))
}

/* UI */

const slipContent=(

<div className="flex h-full flex-col">

{/* HEADER */}

<div className="sticky top-0 z-20 border-b border-border bg-bg-primary px-4 py-3">

<div className="flex items-center justify-between">

<div>

<p className="text-xs text-muted">Balance</p>

<p className="text-lg font-semibold text-text">
{formatCurrency(balance)}
</p>

</div>

{selections.length>0&&(

<button
onClick={onClear}
className="text-xs text-danger"
>
Clear Slip
</button>

)}

</div>

</div>

{/* SCROLL AREA */}

<div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">

{selections.length===0?(

<p className="py-6 text-center text-sm text-muted">
No selections yet
</p>

):( 

<ul className="space-y-2">

{selections.map((s,idx)=>{

const now = new Date();
const matchTime = new Date(s.match_start);

const isStarted = matchTime <= now; // ✅ DEFINE HERE

const isOutsideSeason =
  seasonEnd && matchTime > new Date(seasonEnd);

const duplicate = duplicateMatches[s.fixture_id] > 1;
const invalidOdds = isSingle
  ? s.odds < SINGLE_ODDS_MIN || s.odds > SINGLE_ODDS_MAX
  : s.odds < ACC_LEG_ODDS_MIN || s.odds > ACC_LEG_ODDS_MAX;

return(

<li
key={`${s.fixture_id}-${idx}`}
className={`relative rounded-md border p-2 text-xs ${
    isStarted
      ? "border-danger bg-danger/10 opacity-60"
      : isOutsideSeason
      ? "border-yellow-500 bg-yellow-500/10"
      : duplicate
      ? "border-danger bg-danger/10"
      : "border-border bg-surface"
  }`}
>

<button
onClick={()=>onRemove(idx)}
className="absolute right-2 top-1 text-danger"
>
×
</button>

{/* CLICK TO OPEN MATCH */}
<div
onClick={()=>onOpenMatch(s)}
className="cursor-pointer pr-6"
>

<p className="font-semibold text-text">
{s.pickLabel}
</p>

<p className="text-[10px] text-muted">
{s.marketLabel}
</p>

<p className="text-[11px] text-muted">
{s.home ?? s.home_team} vs {s.away ?? s.away_team}
</p>

{isStarted && (
  <p className="text-[10px] text-danger mt-1">
    Match Started
  </p>
)}

{!isStarted && isOutsideSeason && (
  <p className="text-[10px] text-yellow-400 mt-1">
    Outside Current Season
  </p>
)}

</div>

<p
className={`absolute right-2 bottom-2 font-semibold ${
    isStarted
      ? "text-muted"
      : invalidOdds
      ? "text-danger"
      : "text-accent"
  }`}
>
{s.odds.toFixed(2)}
</p>

</li>

)

})}

</ul>

)}

{/* TOTAL */}

{selections.length>0&&(

<>

<div className="mt-3">

<p className="text-xs text-muted">
{isSingle?"Single":`Accumulator (${selections.length})`}
</p>

<p className="text-sm font-semibold text-text">
Total Odds {totalOdds.toFixed(2)}
</p>

</div>

{oddsError&&(
<p className="mt-2 text-xs text-danger">
{oddsError}
</p>
)}

{/* STAKE */}

<div className="mt-3">

<label className="text-[10px] text-muted">
Stake
</label>

<input
type="number"
value={stake}
onChange={e=>setStake(e.target.value)}
placeholder={`${formatCurrency(MIN_STAKE)}-${formatCurrency(MAX_STAKE)}`}
className="mt-1 w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-xs"
/>

<div className="mt-2 grid grid-cols-4 gap-2">

{QUICK_STAKES.map(v=>(

<button
key={v}
onClick={()=>setQuickStake(v)}
className="rounded border border-border py-1 text-xs hover:bg-surface"
>
{formatCurrency(v)}
</button>

))}

<button
onClick={()=>setStake("")}
className="rounded border border-border py-1 text-xs text-danger hover:bg-danger/10"
>
Clear
</button>

</div>

{stakeError&&(
<p className="mt-1 text-xs text-danger">
{stakeError}
</p>
)}

</div>

<p className="mt-2 text-xs text-muted">
Potential Return
</p>

<p className="text-sm font-semibold text-success">
{stakeNum>0?formatCurrency(potentialReturn):"—"}
</p>

{placeError&&(
<p className="mt-2 text-xs text-danger">{placeError}</p>
)}

{placeSuccess&&(
<p className="mt-2 text-xs text-success">{placeSuccess}</p>
)}

{hasStartedMatch && (
  <p className="mt-2 text-xs text-danger text-center">
    One or more matches already started
  </p>
)}

<button
  onClick={handlePlace}
  disabled={!canPlace}
  className={`mt-3 w-full rounded-md py-2 text-sm font-semibold text-text ${
    !canPlace
      ? "bg-gray-600 cursor-not-allowed opacity-50"
      : "bg-accent hover:opacity-90"
  }`}
>
  {isPlacing ? "Placing..." : "Place Bet"}
</button>

</>

)}

</div>

</div>

)

return(

<>

{/* MOBILE */}

<div className="w-full max-w-[420px] mx-auto">

<button
onClick={onToggleOpen}
className="flex w-full items-center justify-center gap-2 border-t border-accent bg-gradient-to-r from-accent to-purple-700 py-3 text-sm font-semibold text-white shadow-lg"
>

Bet Slip

{selections.length>0&&(
<span className="rounded-full bg-accent/20 px-2 text-xs">
{selections.length}
</span>
)}

<span>{isOpen?"▼":"▲"}</span>

</button>

<div
className={`border-t border-border bg-bg-primary transition-all ${
isOpen ? "h-[75vh]" : "h-0"
} overflow-hidden`}
>

<div className="h-full overflow-y-auto overscroll-contain scrollbar-hide touch-pan-y">
{slipContent}
</div>

</div>

</div>

{/* DESKTOP */}

<div className="hidden w-full max-w-sm shrink-0 rounded-xl border border-border bg-bg-primary md:flex-col md:h-[calc(100vh-8rem)]">

{slipContent}

</div>

</>

)

}