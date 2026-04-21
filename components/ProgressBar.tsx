interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  className?: string;
}

export function ProgressBar({
  label,
  value,
  max,
  className = "",
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className={className}>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="text-text">{Math.round(percent)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface border border-border">
        <div
          className="h-full rounded-full bg-accent transition-all duration-[var(--duration-normal)] ease-[var(--ease)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
