type Status = "won" | "lost" | "pending" | "qualified" | "disqualified";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const styles: Record<Status, string> = {
    won: "bg-success/15 text-success border-success/30",
    lost: "bg-danger/15 text-danger border-danger/30",
    pending: "bg-muted/15 text-muted border-border",
    qualified: "bg-success/15 text-success border-success/30",
    disqualified: "bg-danger/15 text-danger border-danger/30",
  };

  const labels: Record<Status, string> = {
    won: "Won",
    lost: "Lost",
    pending: "Pending",
    qualified: "Qualified",
    disqualified: "Disqualified",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}
