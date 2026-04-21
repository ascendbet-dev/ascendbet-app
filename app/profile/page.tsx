import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "@/components/ProfileClient";

const SCALE_MIN = 100_000;
const SCALE_MAX = 120_000;

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (!user.email_confirmed_at) {
    redirect("/verify-email");
  }

  /* ---------------- PROFILE ---------------- */

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, referral_code")
    .eq("id", user.id)
    .single();
    

  /* ---------------- ACTIVE SEASON ---------------- */

  const { data: activeSeason } = await supabase
    .from("seasons")
    .select("id, name")
    .eq("status", "active")
    .maybeSingle();

  let season = null;

  if (activeSeason) {
    const { data: instance } = await supabase
      .from("season_instances")
      .select(`
        id,
        current_balance,
        hard_drawdown,
        discipline_score
      `)
      .eq("user_id", user.id)
      .eq("season_id", activeSeason.id)
      .maybeSingle();

    season = instance;
  }


  /* ---------------- SEASON HISTORY (LATEST 3) ---------------- */

const { data: history, error } = await supabase
.from("season_instances")
.select(`
  id,
  season_id,
  final_position,
  current_balance,
  settled_bet_count,
  average_stake,
  average_odds,
  discipline_score,
  active_betting_days,
  is_disqualified,
  is_qualified
`)
.eq("user_id", user.id)
.eq("is_finalized", true)
.order("created_at", { ascending: false })
.limit(3);

if (error) {
console.log("❌ HISTORY ERROR:", error);
}

/* 🔥 GET SEASON NAMES */

const seasonIds = history?.map((h) => h.season_id) || [];

const { data: seasons } = await supabase
.from("seasons")
.select("id, name")
.in("id", seasonIds);

/* 🔥 MERGE */

const historyWithRank =
history?.map((h) => ({
  ...h,
  season_name:
    seasons?.find((s) => s.id === h.season_id)?.name || "Season",
})) || [];

if (error) {
  console.log("❌ HISTORY ERROR:", error);
}


  /* ---------------- TICKETS (FOR STATS) ---------------- */

  const { data: tickets } = await supabase
    .from("tickets")
    .select("total_odds, stake")
    .eq("season_instance_id", season?.id)
    .eq("status", "won");

  /* ---------------- CALCULATIONS ---------------- */

  const averageOdds =
    tickets && tickets.length > 0
      ? tickets.reduce((sum, t) => sum + Number(t.total_odds), 0) /
        tickets.length
      : null;

  const averageStake =
    tickets && tickets.length > 0
      ? tickets.reduce((sum, t) => sum + Number(t.stake), 0) /
        tickets.length
      : null;

  /* ---------------- SAFE VALUES ---------------- */

  const username = profile?.username ?? "User";

  const progressPercent = season
    ? Math.min(
        100,
        Math.max(
          0,
          ((season.current_balance - SCALE_MIN) /
            (SCALE_MAX - SCALE_MIN)) *
            100
        )
      )
    : 0;

  /* ---------------- RENDER ---------------- */

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 md:pb-8 min-h-[calc(100dvh-80px)]">
      <ProfileClient
        username={username}
        seasonJoined={activeSeason?.name ?? "—"}
        balance={season?.current_balance ?? 0}
        disciplineScore={season?.discipline_score ?? 0}
        averageOdds={averageOdds}
        averageStake={averageStake}
        maxDrawdown={season?.hard_drawdown ?? 0}
        progressPercent={progressPercent}
        hasSeason={!!season}
        referralCode={profile?.referral_code ?? "N/A"}
        history={historyWithRank} // ✅ CLEAN DATA
      />

    </div>
  );
}