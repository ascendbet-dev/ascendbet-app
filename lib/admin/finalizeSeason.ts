import { createClient } from "@/lib/supabase/server";

export async function finalizeSeason(seasonId: string) {
  const supabase = await createClient();

  /* 🔥 CHECK IF ALREADY FINALIZED */
  const { data: check } = await supabase
    .from("seasons")
    .select("is_finalized")
    .eq("id", seasonId)
    .maybeSingle();

  if (check?.is_finalized) {
    throw new Error("Season already finalized");
  }

  /* 📊 GET ALL PARTICIPANTS */
  const { data: users, error } = await supabase
    .from("season_instances")
    .select("*")
    .eq("season_id", seasonId);

  if (error) {
    throw new Error("Failed to fetch users");
  }

  /* 🔥 HANDLE EMPTY SEASON */
  if (!users?.length) {
    await supabase
      .from("seasons")
      .update({
        is_finalized: true,
        status: "finalized",
      })
      .eq("id", seasonId);

    return { success: true };
  }

  /* 🏆 SORT — MATCH LEADERBOARD EXACTLY */
  const sorted = [...users].sort((a, b) => {
    // 1. Disqualified last
    if (a.is_disqualified !== b.is_disqualified) {
      return a.is_disqualified ? 1 : -1;
    }

    // 2. Balance
    if (b.current_balance !== a.current_balance) {
      return b.current_balance - a.current_balance;
    }

    // 3. Discipline score
    if ((b.discipline_score ?? 0) !== (a.discipline_score ?? 0)) {
      return (b.discipline_score ?? 0) - (a.discipline_score ?? 0);
    }

    // 4. Active days
    if ((b.active_betting_days ?? 0) !== (a.active_betting_days ?? 0)) {
      return (b.active_betting_days ?? 0) - (a.active_betting_days ?? 0);
    }

    // 5. Settled bets
    if ((b.settled_bet_count ?? 0) !== (a.settled_bet_count ?? 0)) {
      return (b.settled_bet_count ?? 0) - (a.settled_bet_count ?? 0);
    }

    return 0;
  });

  /* 🔢 UPDATE USERS */
  for (let i = 0; i < sorted.length; i++) {
    const u = sorted[i];

    const isQualified = u.current_balance >= u.target_balance;
    const isDisqualified = u.current_balance <= u.hard_drawdown;

    await supabase
      .from("season_instances")
      .update({
        is_qualified: isQualified,
        is_disqualified: isDisqualified,
        is_finalized: true,
        final_position: i + 1,
      })
      .eq("id", u.id);
  }

  /* 🔒 MARK SEASON FINALIZED */
  await supabase
    .from("seasons")
    .update({
      is_finalized: true,
      status: "finalized",
    })
    .eq("id", seasonId);

  return { success: true };
}