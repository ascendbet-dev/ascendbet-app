import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = new Date();

  const { data: users } = await supabase
    .from("season_instances")
    .select("id, current_balance, last_bet_at, is_disqualified, season_id")
    .eq("is_disqualified", false);

  if (!users) {
    return new Response(JSON.stringify({ success: true }));
  }

  // 🔥 FETCH SEASONS (for drawdown)
  const seasonIds = [...new Set(users.map((u) => u.season_id))];

  const { data: seasons } = await supabase
    .from("seasons")
    .select("id, drawdown_limit")
    .in("id", seasonIds);

  const seasonMap = new Map();
  seasons?.forEach((s) => {
    seasonMap.set(s.id, s.drawdown_limit);
  });

  for (const user of users) {
    if (!user.last_bet_at) continue;

    const lastBet = new Date(user.last_bet_at);
    const diffHours =
      (now.getTime() - lastBet.getTime()) / (1000 * 60 * 60);

    if (diffHours < 48) continue;

    const periods = Math.floor(diffHours / 48);
    if (periods <= 0) continue;

    const drawdownLimit = seasonMap.get(user.season_id) ?? 0;

    // 🔥 THIS IS WHERE YOUR CONDITION GOES
    if (user.current_balance <= drawdownLimit) continue;

    const newBalance =
      user.current_balance * Math.pow(0.98, periods);

    const newLastBet = new Date(
      lastBet.getTime() + periods * 48 * 60 * 60 * 1000
    );

    await supabase
      .from("season_instances")
      .update({
        current_balance: Math.round(newBalance),
        last_bet_at: newLastBet.toISOString(),
      })
      .eq("id", user.id);
  }

  return new Response(JSON.stringify({ success: true }));
});