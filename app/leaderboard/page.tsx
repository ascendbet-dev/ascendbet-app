import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SlantedBlock } from "@/components/SlantedBlock";

/* ---------------- HELPERS ---------------- */

function formatBalance(n: number) {
  return `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function getMovementIcon(movement?: number) {
  if (movement === undefined || movement === null) return "—";
  if (movement > 0) return "▲";
  if (movement < 0) return "▼";
  return "—"; // 👈 handles 0
}

function getMovementColor(movement?: number) {
  if (movement === undefined || movement === null) return "text-muted";
  if (movement > 0) return "text-green-400";
  if (movement < 0) return "text-red-400";
  return "text-muted";
}

/* ---------------- PAGE ---------------- */

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  /* ---------------- GET CURRENT SEASON ---------------- */

  let season = null;

  const { data: activeSeason } = await supabase
    .from("seasons")
    .select("id, name, status, target_balance, starting_balance, drawdown_limit")
    .eq("status", "active")
    .maybeSingle();

  if (activeSeason) {
    season = activeSeason;
  } else {
    const { data: lastSeason } = await supabase
      .from("seasons")
      .select("id, name, status, target_balance, starting_balance, drawdown_limit")
      .eq("status", "completed")
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    season = lastSeason;
  }

  if (!season) {
    return (
      <div className="p-6 text-center text-muted">
        No leaderboard available yet.
      </div>
    );
  }

  /* ---------------- FETCH LEADERBOARD ---------------- */

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-leaderboard`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season_id: season.id }),
      cache: "no-store",
    }
  );

  const { leaderboard } = await res.json();

  const top3 = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

  const username = user.email?.split("@")[0];

  /* ---------------- UI ---------------- */

  return (
    <div className="mx-auto max-w-lg h-[calc(100vh-100px)] px-4 py-4 flex flex-col overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-lg font-bold text-white">Leaderboard</h1>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">
            {season?.name ?? "No Season"}
          </span>

          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              season?.status === "active"
                ? "bg-green-500/20 text-green-400"
                : "bg-white/10 text-muted"
            }`}
          >
            {season?.status === "active" ? "Live" : "Completed"}
          </span>
        </div>
      </div>

      {/* 🥇 TOP 3 */}
      <div className="grid grid-cols-3 gap-4 mb-6 shrink-0 items-end">
        {top3.map((row: any) => {

          const isFirst = row.rank === 1;
          const isSecond = row.rank === 2;

          const target = season?.target_balance ?? 0;
          const drawdown = season?.drawdown_limit ?? 0;

          let badge = "Contender";
          let badgeColor = "text-white";

          if (row.is_disqualified || row.current_balance <= drawdown) {
            badge = "Eliminated";
            badgeColor = "text-red-400";
          } else if (row.current_balance >= target) {
            badge = "Pro 👑";
            badgeColor = "text-yellow-400";
          }

          let balanceColor = "text-white";
          if (row.current_balance >= target) balanceColor = "text-green-400";
          else if (row.current_balance <= drawdown) balanceColor = "text-red-400";

          return (
            <div
              key={row.rank}
              className={`flex flex-col items-center text-center rounded-xl border border-purple-500/20 bg-gradient-to-b from-[#1a0f2e] to-[#0d061a]
              ${isFirst ? "py-6 scale-105" : isSecond ? "py-5 scale-100" : "py-4"}`}
            >
              <div className="text-lg mb-1">
                {row.rank === 1 && "🥇"}
                {row.rank === 2 && "🥈"}
                {row.rank === 3 && "🥉"}
              </div>

              <p className="text-sm font-semibold text-white truncate max-w-[90px]">
                {formatName(row.username)}
              </p>

              <p className={`text-sm font-bold ${balanceColor}`}>
                {formatBalance(row.current_balance)}
              </p>

              <p className={`text-[10px] ${badgeColor}`}>
                {badge}
              </p>
            </div>
          );
        })}
      </div>

      {/* LABELS */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <SlantedBlock variant="header" className="w-[40px]">POS</SlantedBlock>
        <SlantedBlock variant="header" className="w-[110px]">PLAYER</SlantedBlock>
        <SlantedBlock variant="header" className="w-[90px]">BALANCE</SlantedBlock>
        <SlantedBlock variant="header" className="w-[60px]">SCORE</SlantedBlock>
        <SlantedBlock variant="header" className="w-[90px]">BADGE</SlantedBlock>
      </div>

      {/* REST */}
      <div className="flex-1 overflow-y-auto overscroll-contain space-y-3 pr-1 scrollbar-hide scroll-smooth">
        {rest.map((row: any) => {

          const isCurrentUser = row.user_id === user.id;

          const target = season?.target_balance ?? 0;
          const drawdown = season?.drawdown_limit ?? 0;

          let badge = "Contender";
          let badgeColor = "text-white";

          if (row.is_disqualified || row.current_balance <= drawdown) {
            badge = "Eliminated";
            badgeColor = "text-red-400";
          } else if (row.current_balance >= target) {
            badge = "Pro 👑";
            badgeColor = "text-yellow-400";
          }

          let balanceColor = "text-white";
          if (row.current_balance >= target) balanceColor = "text-green-400";
          else if (row.current_balance <= drawdown) balanceColor = "text-red-400";

          return (
            <div
              key={row.rank}
              className={`relative flex items-center gap-2 px-2 py-2 rounded-lg ${
                isCurrentUser
                  ? "bg-white/[0.04] border border-purple-400/30 shadow-[0_0_10px_rgba(168,85,247,0.25)]"
                  : "hover:bg-white/5"
              }`}
            >
              {isCurrentUser && (
                  <div className="absolute left-0 top-0 h-full w-[2px] bg-purple-400/70 rounded-l-md" />
                )}

              <SlantedBlock className="w-[40px] text-center !px-1 !py-1">
                <div className="flex flex-col items-center justify-center leading-none">
                  <span className="text-xs font-semibold">{row.rank}</span>
                  <span className={`text-[8px] ${getMovementColor(row.movement)}`}>
                    {getMovementIcon(row.movement)}
                  </span>
                </div>
              </SlantedBlock>

              <SlantedBlock className="w-[110px] text-center truncate">
              <div className="flex items-center justify-center gap-1 truncate">
                <span className="truncate">{formatName(row.username)}</span>
              </div>
              </SlantedBlock>

              <SlantedBlock className={`w-[90px] !px-0 flex items-center justify-center ${balanceColor}`}>
                {formatBalance(row.current_balance)}
              </SlantedBlock>

              <SlantedBlock className="w-[60px] !px-0 flex items-center justify-center">
              {row.discipline_score !== null && row.discipline_score !== undefined
                ? row.discipline_score.toFixed(2)
                : "—"}
              </SlantedBlock>
              
              <SlantedBlock className={`w-[90px] !px-0 flex items-center justify-center ${badgeColor}`}>
                {badge}
              </SlantedBlock>


            </div>
          );
        })}
      </div>

    </div>
  );
}