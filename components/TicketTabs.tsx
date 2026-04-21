"use client";

type TabType = "pending" | "settled";

interface TicketTabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
  pendingCount?: number;
  settledCount?: number;
}

export function TicketTabs({
  activeTab,
  onChange,
  pendingCount = 0,
  settledCount = 0,
}: TicketTabsProps) {
  return (
    <div className="flex w-full rounded-xl border border-border bg-surface p-1">
      {/* PENDING TAB */}
      <button
        onClick={() => onChange("pending")}
        className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
          activeTab === "pending"
            ? "bg-accent text-white"
            : "text-muted hover:text-text"
        }`}
      >
        Pending
        {pendingCount > 0 && (
          <span className="ml-1 text-xs opacity-80">
            ({pendingCount})
          </span>
        )}
      </button>

      {/* SETTLED TAB */}
      <button
        onClick={() => onChange("settled")}
        className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
          activeTab === "settled"
            ? "bg-accent text-white"
            : "text-muted hover:text-text"
        }`}
      >
        Settled
        {settledCount > 0 && (
          <span className="ml-1 text-xs opacity-80">
            ({settledCount})
          </span>
        )}
      </button>
    </div>
  );
}