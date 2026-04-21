import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/time";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  /* 🔍 ACTIVE SEASON (WITH FALLBACK) */
  let { data: activeSeason } = await supabase
    .from("seasons")
    .select("*")
    .eq("status", "active")
    .maybeSingle();

  let isFallback = false;

  if (!activeSeason) {
    const { data: fallbackSeason } = await supabase
      .from("seasons")
      .select("*")
      .eq("status", "ended")
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    activeSeason = fallbackSeason;
    isFallback = true;
  }

  /* ❌ NO SEASON CASE */
  if (!activeSeason) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-purple-500/10 bg-gradient-to-b from-[#1a0f2e] to-[#0d061a] p-6 text-center">
          <h2 className="text-white text-lg font-semibold">
            No seasons found
          </h2>
          <p className="text-muted text-sm mt-2">
            Create your first season to get started
          </p>

          <Link href="/admin/seasons" className="btn mt-4 inline-block">
            Create Season
          </Link>
        </div>
      </div>
    );
  }

  const seasonId = activeSeason.id;

  /* 📊 STATS */
  const [
    { count: totalUsers },
    { count: participants },
    { count: activeUsers },
    { count: qualified },
    { count: disqualified },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),

    supabase
      .from("season_instances")
      .select("*", { count: "exact", head: true })
      .eq("season_id", seasonId),

    supabase
      .from("season_instances")
      .select("*", { count: "exact", head: true })
      .eq("season_id", seasonId)
      .eq("is_disqualified", false),

    isFallback
      ? supabase
          .from("season_instances")
          .select("*", { count: "exact", head: true })
          .eq("season_id", seasonId)
          .eq("is_qualified", true)
      : supabase
          .from("season_instances")
          .select("*", { count: "exact", head: true })
          .eq("season_id", seasonId)
          .gte("current_balance", activeSeason.target_balance),

    isFallback
      ? supabase
          .from("season_instances")
          .select("*", { count: "exact", head: true })
          .eq("season_id", seasonId)
          .eq("is_disqualified", true)
      : supabase
          .from("season_instances")
          .select("*", { count: "exact", head: true })
          .eq("season_id", seasonId)
          .lte("current_balance", activeSeason.drawdown_limit),
  ]);

  return (
    <div className="mx-auto w-full max-w-[420px] px-3 pt-4 pb-24 space-y-4">
  
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold text-white tracking-wide">
          Admin Dashboard
        </h1>
      </div>
  
      {/* ACTIVE SEASON */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
  
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-white">
              {activeSeason.name}
            </p>
  
            <p className="text-[10px] text-muted">
              {formatDate(activeSeason.start_date)} →{" "}
              {formatDate(activeSeason.end_date)}
            </p>
          </div>
  
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
              activeSeason.status === "active"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {activeSeason.status}
          </span>
        </div>
  
        <p className="text-[10px] text-muted">
          Registration: {formatDate(activeSeason.registration_start)} →{" "}
          {formatDate(activeSeason.registration_end)}
        </p>
  
        {isFallback && (
          <p className="text-[10px] text-yellow-400">
            Showing last ended season
          </p>
        )}
      </div>
  
      {/* METRICS (2 PER ROW — MOBILE PERFECT) */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Users" value={totalUsers} />
        <StatCard label="Participants" value={participants} />
        <StatCard label="Active" value={activeUsers} />
        <StatCard label="Qualified" value={qualified} />
        <StatCard label="Disqualified" value={disqualified} />
      </div>
  
      {/* ACTIONS */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/admin/seasons" className="btn text-xs py-2">
          Create
        </Link>
  
        <Link href="/admin/seasons" className="btn-green text-xs py-2">
          Manage
        </Link>
      </div>
  
    </div>
  );
}

/* 🔹 STAT CARD */
function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-[#140a26] px-3 py-2">
      <p className="text-[10px] text-muted">{label}</p>
      <p className="text-white text-sm font-semibold">
        {value ?? 0}
      </p>
    </div>
  );
}