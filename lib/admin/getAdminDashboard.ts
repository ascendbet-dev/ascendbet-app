import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboard() {
  const supabase = await createClient();

  // 1. Get active season
  let { data: activeSeason } = await supabase
    .from("seasons")
    .select("*")
    .eq("status", "active")
    .single();

  let seasonSource = "active";

  // 2. Fallback to last ended
  if (!activeSeason) {
    const { data: lastEnded } = await supabase
      .from("seasons")
      .select("*")
      .eq("status", "ended")
      .order("end_date", { ascending: false })
      .limit(1)
      .single();

    activeSeason = lastEnded;
    seasonSource = "fallback";
  }

  if (!activeSeason) {
    return {
      season: null,
      stats: null,
      meta: { seasonSource: "none" },
    };
  }

  const season_id = activeSeason.id;

  // 3. Stats
  const [{ count: totalUsers }, { count: participants }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("season_instances")
        .select("*", { count: "exact", head: true })
        .eq("season_id", season_id),
    ]);

  // Active users
  const { count: activeUsers } = await supabase
    .from("season_instances")
    .select("*", { count: "exact", head: true })
    .eq("season_id", season_id)
    .eq("is_disqualified", false);

  // Qualified
  const { count: qualified } = await supabase
    .from("season_instances")
    .select("*", { count: "exact", head: true })
    .eq("season_id", season_id)
    .gte("balance", activeSeason.target_balance);

  // Disqualified
  const { count: disqualified } = await supabase
    .from("season_instances")
    .select("*", { count: "exact", head: true })
    .eq("season_id", season_id)
    .lte("balance", activeSeason.drawdown_limit);

  return {
    season: activeSeason,
    stats: {
      totalUsers,
      participants,
      activeUsers,
      qualified,
      disqualified,
    },
    meta: {
      seasonSource,
      generatedAt: new Date().toISOString(),
    },
  };
}