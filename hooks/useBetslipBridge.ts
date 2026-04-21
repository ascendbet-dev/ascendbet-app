import type { BetSelection } from "@/lib/place-bet-types";
import { useBetslipStore } from "@/stores/useBetslipStore";

interface Props {
  setSlipOpen: (v: boolean) => void;
  setPlaceError: (v: string | null) => void;
  setPlaceSuccess: (v: string | null) => void;
}

export function useBetslipBridge({
  setSlipOpen,
  setPlaceError,
  setPlaceSuccess,
}: Props) {

  // 🔥 Zustand ONLY
  const addSelection = useBetslipStore((s) => s.addSelection);
  const removeByIndex = useBetslipStore((s) => s.removeByIndex);
  const removeSelectionStore = useBetslipStore((s) => s.removeSelection);
  const clear = useBetslipStore((s) => s.clear);

  function addToSlip(selection: BetSelection) {
    addSelection(selection);
    setPlaceError(null);
    setPlaceSuccess(null);
  }

  function removeFromSlip(idx: number) {
    removeByIndex(idx);

    const remaining = useBetslipStore.getState().selections;

    if (remaining.length === 0) {
      setSlipOpen(false);
    }

    setPlaceError(null);
    setPlaceSuccess(null);
  }

  function removeSelection(selection: BetSelection) {
    removeSelectionStore(selection);
  }

  function clearSlip() {
    clear(); // 🔥 FIXED (no setBetSlip)
    setSlipOpen(false);
    setPlaceError(null);
    setPlaceSuccess(null);
  }

  return {
    addToSlip,
    removeFromSlip,
    removeSelection,
    clearSlip,
  };
}