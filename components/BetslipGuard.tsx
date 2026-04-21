"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBetslipStore } from "@/stores/useBetslipStore";

export function BetslipGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const selections = useBetslipStore((s) => s.selections);

  useEffect(() => {
    if (selections.length === 0) {
      router.replace("/"); // 🔥 no history stack
    }
  }, [selections, router]);

  if (selections.length === 0) return null;

  return <>{children}</>;
}