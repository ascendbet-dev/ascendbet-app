"use client";

interface MarketOddsButtonProps {
  label: string;
  odds: number;
  isSelected?: boolean;
  onClick: () => void;
  compact?: boolean;
}

export function MarketOddsButton({
  label,
  odds,
  isSelected = false,
  onClick,
  compact = false,
}: MarketOddsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e)=>e.preventDefault()}
      className={`
        select-none
        rounded-lg border font-medium tabular-nums transition-all duration-[var(--duration-normal)] ease-[var(--ease)]
        hover:border-accent/70 hover:shadow-[0_0_10px_rgba(124,58,237,0.25)]
        ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-1 text-sm"}
        ${
          isSelected
            ? "border-accent bg-accent/20 text-text shadow-[0_0_12px_rgba(124,58,237,0.4)]"
            : "border-border bg-bg-primary text-text hover:bg-accent/10"
        }
      `}
    >
      <span className="block">{odds.toFixed(2)}</span>
      <span className="block text-[10px] text-muted">{label}</span>
    </button>
  );
}