interface MetricCardProps {
  label: string;
  value: string | number;
  className?: string;
}

export function MetricCard({ label, value, className = "" }: MetricCardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-4 transition-opacity duration-[var(--duration-normal)] ${className}`}
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-text">{value}</p>
    </div>
  );
}
