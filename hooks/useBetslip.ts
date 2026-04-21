import { useState, useEffect } from "react";
import type { BetSelection } from "@/lib/place-bet-types";

export function useBetslip() {

  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [betSlipRestored, setBetSlipRestored] = useState(false);

  /* RESTORE */

  useEffect(() => {
    const savedSlip = localStorage.getItem("ascendbet_betslip");

    if (savedSlip) {
      try {
        setBetSlip(JSON.parse(savedSlip));
      } catch {
        localStorage.removeItem("ascendbet_betslip");
      }
    }

    setBetSlipRestored(true);
  }, []);

  /* ADD */

  function addToSlip(selection: BetSelection) {

    setBetSlip(prev => {

      const existingIndex = prev.findIndex(
        s =>
          s.fixture_id === selection.fixture_id &&
          s.market === selection.market
      );

      // same pick → remove
      if (
        existingIndex !== -1 &&
        prev[existingIndex].pick === selection.pick
      ) {
        return prev.filter((_, i) => i !== existingIndex);
      }

      // replace same market
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = selection;
        return updated;
      }

      // add new
      return [...prev, selection];

    });
  }

  /* REMOVE */

  function removeFromSlip(idx: number) {

    setBetSlip(prev =>
      prev.filter((_, i) => i !== idx)
    );

  }

  /* REMOVE BY OBJECT (for MatchMarkets fix later) */

  function removeSelection(selection: BetSelection) {
    setBetSlip(prev =>
      prev.filter(
        s =>
          !(
            s.fixture_id === selection.fixture_id &&
            s.market === selection.market &&
            s.pick === selection.pick
          )
      )
    );
  }

  /* CLEAR */

  function clearSlip() {
    setBetSlip([]);
    localStorage.removeItem("ascendbet_betslip");
  }

  /* PERSIST */

  useEffect(() => {

    if (!betSlipRestored) return;

    localStorage.setItem(
      "ascendbet_betslip",
      JSON.stringify(betSlip)
    );

    window.dispatchEvent(new Event("betslipUpdated"));

  }, [betSlip, betSlipRestored]);

  return {
    betSlip,
    addToSlip,
    removeFromSlip,
    removeSelection,
    clearSlip,
  };
}