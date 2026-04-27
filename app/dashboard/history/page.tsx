"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ChevronDown } from "lucide-react";
import DashboardLoader from "@/components/DashboardLoader";

export default function SeasonHistoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [seasonMap, setSeasonMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("latest");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("season_instances")
      .select(`
        season_id,
        final_position,
        current_balance,
        discipline_score,
        average_odds,
        average_stake,
        settled_bet_count,
        active_betting_days,
        max_drawdown,
        is_disqualified,
        is_qualified,
        created_at
      `)
      .eq("user_id", user.id)
      .eq("is_finalized", true); // ✅ ONLY SHOW FINALIZED

    if (!error && data) {
      setData(data);

      const ids = [...new Set(data.map((d) => d.season_id))];

      const { data: seasons } = await supabase
        .from("seasons")
        .select("id, name")
        .in("id", ids);

      const map: Record<string, string> = {};
      seasons?.forEach((s) => {
        map[s.id] = s.name;
      });

      setSeasonMap(map);
    }

    setLoading(false);
  }

  // 🔥 FILTERS
  let filtered = [...data];

  if (search) {
    filtered = filtered.filter((s) =>
      seasonMap[s.season_id]?.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (filter === "latest") {
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (filter === "oldest") {
    filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  if (loading) {
    return <DashboardLoader />;
  }

  return (
    <div className="mx-auto max-w-lg flex flex-col h-[calc(100dvh-120px)]">

      {/* 🔥 FIXED HEADER */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 space-y-3">

        <h1 className="text-lg font-semibold text-text">
          Season History
        </h1>

        {/* FILTER BAR */}
        <div className="flex gap-2 bg-purple-900/30 border border-purple-500/20 p-2 rounded-xl">

          <input
            placeholder="Search season..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-black/30 text-sm outline-none"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-black/30 text-sm"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>

        </div>

      </div>
      

      {/* 🔥 SCROLLABLE AREA (LIKE TICKETS) */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-6 scrollbar-hide">

      {filtered.length === 0 && (
        <div className="text-center text-muted text-sm py-10">
            No completed seasons yet
        </div>
        )}

        {filtered.map((season, i) => {

          const isOpen = openIndex === i;

          const status = season.is_disqualified
            ? "Eliminated"
            : season.is_qualified
            ? "Pro"
            : "Contender";

          return (
            <div
              key={i}
              className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md shadow-sm"
            >

              {/* HEADER */}
              <div
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="cursor-pointer px-4 py-4"
              >

                {/* TOP ROW */}
                <div className="flex items-center justify-between">

                  <div className="flex flex-col">

                    <span className="text-[11px] text-muted">
                      {seasonMap[season.season_id] ?? "Season"}
                    </span>

                    {/* 🔥 POSITION ON TOP */}
                    <span
                      className={`
                        text-lg font-bold tracking-wide
                        ${
                          season.final_position && season.final_position <= 3
                            ? "text-yellow-400"
                            : "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
                        }
                      `}
                    >
                      # {season.final_position ?? "-"}
                    </span>
                  </div>

                  {/* 🔥 SMALL ICON */}
                  <div
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4 text-muted" />
                  </div>

                </div>

              </div>

              {/* CONTENT */}
              {isOpen && (
                <div className="px-4 pb-4">

                  <div className="grid grid-cols-3 gap-3 text-xs">

                    <Stat label="Balance" value={`₦${Number(season.current_balance).toLocaleString()}`} green />
                    <Stat label="Discipline Score" value={season.discipline_score} />
                    <Stat label="Settled Bets" value={season.settled_bet_count} />

                    <Stat
                      label="Avg Odds"
                      value={
                        season.average_odds !== null && season.average_odds !== undefined
                          ? Number(season.average_odds).toFixed(2)
                          : "-"
                      }
                    />
                    <Stat label="Avg Stake" value={`₦${Number(season.average_stake).toLocaleString()}`} />
                    <Stat label="Active Days" value={season.active_betting_days} />

                    <Stat label="Drawdown" value={`₦${Number(season.max_drawdown).toLocaleString()}`} red />
                    <Stat label="Status" value={status} />
                    <Stat
                        label="Final Position"
                        value={`# ${season.final_position ?? "-"}`}
                        />

                  </div>

                </div>
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}

function Stat({ label, value, green, red }: any) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wide text-muted/70">
        {label}
      </p>
      <p className={`text-[13px] font-semibold ${
        green ? "text-green-400" :
        red ? "text-red-400" :
        "text-text"
      }`}>
        {value ?? "-"}
      </p>
    </div>
  );
}