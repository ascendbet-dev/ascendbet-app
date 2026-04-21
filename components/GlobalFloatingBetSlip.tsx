"use client";

import { useRouter } from "next/navigation";
import { useBetslipStore } from "@/stores/useBetslipStore";

export function GlobalFloatingBetSlip() {
  const router = useRouter();
  const selections = useBetslipStore((s) => s.selections);

  if (selections.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[420px] flex justify-end pr-2 z-40">
      <button
        onClick={() => router.push("/betslip")}
        className="flex flex-col items-center justify-center w-9 h-9 rounded-md bg-accent text-[10px] font-semibold text-white shadow-sm"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-accent">
          {selections.length}
        </span>
  
        <span className="mt-1 leading-none">
          Bet
        </span>
      </button>
    </div>
  );
}