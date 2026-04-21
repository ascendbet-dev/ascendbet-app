"use client";

import { useEffect, useState } from "react";

export type BetSlipSelection = {
  fixture_id: number;
  market: string;
  pick: string;
};

export function useBetSlip() {

  const [selections,setSelections] = useState<BetSlipSelection[]>([]);

  /* LOAD FROM STORAGE */

  useEffect(()=>{

    const raw = localStorage.getItem("ascendbet_betslip");

    if(!raw) return;

    try{

      const parsed = JSON.parse(raw);

      const restored = parsed.map((s:any)=>({
        fixture_id: s.fixture_id,
        market: s.market,
        pick: s.pick
      }));

      setSelections(restored);

    }catch{}

  },[]);


  /* SAVE TO STORAGE */

  useEffect(()=>{

    const raw = localStorage.getItem("ascendbet_betslip");

    if(!raw) return;

    window.dispatchEvent(new Event("betslipUpdated"));

  },[selections]);


  function isActive(
    fixture_id:number,
    market:string,
    pick:string
  ){

    return selections.some(
      s =>
        s.fixture_id === fixture_id &&
        s.market === market &&
        s.pick === pick
    );

  }


  function toggleSelection(
    fixture_id:number,
    market:string,
    pick:string
  ){

    setSelections(prev=>{

      const existing = prev.find(
        s =>
          s.fixture_id === fixture_id &&
          s.market === market
      );

      if(existing?.pick === pick){

        return prev.filter(
          s =>
            !(s.fixture_id === fixture_id && s.market === market)
        );

      }

      if(existing){

        return prev.map(s =>
          s.fixture_id === fixture_id && s.market === market
            ? {...s,pick}
            : s
        );

      }

      return [...prev,{fixture_id,market,pick}];

    });

  }

  return {
    selections,
    toggleSelection,
    isActive
  };

}