"use client";

export type SettledFilterType = "all" | "won" | "lost";

interface SettledFilterProps {
  activeFilter: SettledFilterType;
  onChange: (filter: SettledFilterType) => void;
}

export function SettledFilter({ activeFilter, onChange }: SettledFilterProps) {
  const filters: SettledFilterType[] = ["all", "won", "lost"];

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            activeFilter === filter
              ? "bg-accent text-white"
              : "border border-border bg-surface text-muted hover:text-text"
          }`}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>
      ))}
    </div>
  );
}