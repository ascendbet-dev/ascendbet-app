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
    .select("id, name, status")
    .eq("status", "active")
    .maybeSingle();

  if (activeSeason) {
    season = activeSeason;
  } else {
    const { data: lastSeason } = await supabase
      .from("seasons")
      .select("id, name, status")
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
    <div className="mx-auto max-w-lg h-[calc(100vh-100px)] px-4 py-4 flex flex-col">

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

          const target = row.target_balance ?? 120000;
          const drawdown = row.drawdown_limit ?? 88000;

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
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide scroll-smooth will-change-scroll">
        {rest.map((row: any) => {

          const isCurrentUser = row.username === username;

          const target = row.target_balance ?? 120000;
          const drawdown = row.drawdown_limit ?? 88000;

          let badge = "Contender";
          let badgeColor = "text-white";

          if (row.is_disqualified) {
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
              className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
                isCurrentUser ? "bg-accent/10" : ""
              }`}
            >
              <SlantedBlock className="w-[30px] text-center !px-1 !py-1">
                <div className="flex flex-col items-center justify-center leading-none">
                  <span className="text-xs font-semibold">{row.rank}</span>
                  <span className={`text-[8px] ${getMovementColor(row.movement)}`}>
                    {getMovementIcon(row.movement)}
                  </span>
                </div>
              </SlantedBlock>

              <SlantedBlock className="w-[110px] text-center truncate">
              <div className="truncate">
                {formatName(row.username)}
              </div>
              </SlantedBlock>

              <SlantedBlock className={`w-[90px] text-center ${balanceColor}`}>
                {formatBalance(row.current_balance)}
              </SlantedBlock>

              <SlantedBlock className="w-[60px] text-center">
                {row.discipline_score ?? 0}
              </SlantedBlock>

              <SlantedBlock className={`w-[90px] text-center ${badgeColor}`}>
                {badge}
              </SlantedBlock>

            </div>
          );
        })}
      </div>

    </div>
  );
}