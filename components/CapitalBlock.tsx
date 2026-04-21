"use client";

import { useState, useEffect } from "react";
import { Info } from "lucide-react";

function formatBalance(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function CapitalBlock({
  balance,
  remainingToTarget,
  remainingDdBuffer,
  progressPercent,
  progressColor,
}: {
  balance: number;
  remainingToTarget: number;
  remainingDdBuffer: number;
  progressPercent: number;
  progressColor: string;
}) {
  const [showInfo, setShowInfo] = useState(false);

  // Close tooltip on outside click
  useEffect(() => {
    const handleClick = () => setShowInfo(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <section className="relative mb-2 rounded-md border border-border bg-surface px-4 py-3">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-accent" />

      <p className="text-[10px] uppercase tracking-wider text-muted">
        CURRENT CAPITAL
      </p>

      {/* Balance + Info */}
      <div className="relative">
        <div className="flex items-center gap-3 leading-none">
          <p className="mt-0.5 text-5xl font-semibold tabular-nums tracking-tight text-text">
            {formatBalance(balance)}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo((prev) => !prev);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full 
              bg-white/5 border border-white/10 
              hover:bg-white/10 transition"
          >
            <Info size={14} className="text-muted" />
          </button>
        </div>

        <p className="text-[10px] text-muted mt-1">
          Virtual Balance
        </p>

        {/* Tooltip */}
        {showInfo && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-1/2 top-14 z-10 w-72 -translate-x-1/2 rounded-lg 
            border border-white/10 
            bg-gradient-to-b from-[#111] to-[#0a0a0a] 
            p-4 text-xs text-muted shadow-xl backdrop-blur"
          >
            <p className="text-white font-medium mb-1">
              Virtual Balance
            </p>

            <p className="leading-relaxed">
              This balance is for competition purposes only. It does not
              represent real money and cannot be withdrawn. It is used to
              track your performance during the challenge.
            </p>
          </div>
        )}
      </div>

      <div className="my-2 h-px bg-border" />

      <div className="flex items-baseline gap-4 text-xs">
        <div className="flex items-baseline gap-1">
          <span className="text-muted">To target</span>
          <span className="font-semibold text-success tabular-nums">
            +{formatBalance(remainingToTarget)}
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-muted">Buffer</span>
          <span className="font-semibold text-danger tabular-nums">
            {formatBalance(remainingDdBuffer)}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex justify-end">
          <span className="text-[10px] tabular-nums text-muted">
            {Math.round(progressPercent)}%
          </span>
        </div>

        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full transition-[width] duration-[var(--duration-normal)] ease-[var(--ease)] ${progressColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>100k</span>
          <span>120k</span>
        </div>
      </div>
    </section>
  );
}