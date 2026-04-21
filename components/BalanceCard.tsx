interface BalanceCardProps {
  label: string;
  value: string;
  className?: string;
}

export function BalanceCard({ label, value, className = "" }: BalanceCardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-4 transition-opacity duration-[var(--duration-normal)] ${className}`}
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-lg font-medium text-text">{value}</p>
    </div>
  );
}
