import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BannerCarousel } from "@/components/BannerCarousel";
import { getBanners } from "@/lib/banners";
import { HomeUpcomingMatches } from "@/components/HomeUpcomingMatches";
import { GlobalFloatingBetSlip } from "@/components/GlobalFloatingBetSlip";
import { SlantedBlock } from "@/components/SlantedBlock";
import { TopWinningBets } from "@/components/TopWinningBets";
import { PlayModes } from "@/components/PlayModes";
import SeasonCard from "@/components/SeasonCardClient";

function formatBalance(n: number) {
  return `₦${n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  
  const userId = user?.id ?? null;

  /* ---------------- FETCH DATA ---------------- */

  const leaderboardRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-leaderboard`,
    { cache: "no-store" }
  );

  const { leaderboard } = await leaderboardRes.json();
  const top10 = leaderboard?.slice(0, 10) || [];

  const matchesRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-odds`,
    { cache: "no-store" }
  );

  const { matches } = await matchesRes.json();

  const upcomingMatches =
  matches?.map((m: any) => ({
    ...m, // 🔥 KEEP EVERYTHING
    date: m.commence_time || m.date, // normalize date only
  })).slice(0, 20) || [];

/* ---------------- WINNING BETS (FIXED) ---------------- */

const { data: winningBetsRaw } = await supabase
  .from("tickets")
  .select("user_id, potential_return, created_at")
  .eq("status", "won")
  .order("created_at", { ascending: false })
  .limit(10);

const userIds = winningBetsRaw?.map((b) => b.user_id) || [];

const { data: profiles } = await supabase
  .from("profiles")
  .select("id, username")
  .in("id", userIds);

const formattedWinningBets =
  winningBetsRaw?.map((bet) => {
    const profile = profiles?.find((p) => p.id === bet.user_id);

    return {
      username: profile?.username ?? "User",
      profit: bet.potential_return,
      created_at: bet.created_at,
    };
  }) || [];

    /* ---------------- SEASON ---------------- */

    const { data: season } = await supabase
    .from("seasons")
    .select("*")
    .eq("status", "active")
    .maybeSingle();

    let seasonWithPlayers = null;

    if (season) {
    const { data: instances } = await supabase
      .from("season_instances")
      .select("season_id")
      .eq("season_id", season.id);

    seasonWithPlayers = {
      ...season,
      players: instances?.length || 0,
    };
    }

    const { data: profile } = userId
    ? await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", userId)
        .single()
    : { data: null };

  const carouselCards = await getBanners();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 select-none space-y-5">

      {/* ---------------- PLAY MODES ---------------- */}

        <PlayModes />

      {/* ---------------- CAROUSEL ---------------- */}
      <BannerCarousel banners={carouselCards} />

      {/* DIVIDER */}
      <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80" />

      {/* ---------------- SEASON CARD ---------------- */}
      {seasonWithPlayers && <SeasonCard season={seasonWithPlayers} referralCode={profile?.referral_code} />}

      {/* DIVIDER */}
      <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80" />

      {/* ---------------- UPCOMING MATCHES ---------------- */}
      <section className="space-y-3">

        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-text">
            Upcoming Matches
          </h2>

          <Link href="/place-bet" className="text-xs text-accent">
            View All
          </Link>
        </div>

        <HomeUpcomingMatches matches={upcomingMatches} />
      </section>

      {/* DIVIDER */}
      <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80" />

      {/* ---------------- LEADERBOARD ---------------- */}
      <section className="space-y-3">

        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-text">
            Leaderboard
          </h2>

          <Link href="/leaderboard" className="text-xs text-accent">
            Full Leaderboard
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-surface">

          <div className="flex items-center gap-2 mb-2">

            <SlantedBlock variant="header" className="w-[40px]">
              POS
            </SlantedBlock>

            <SlantedBlock variant="header" className="w-[110px]">
              PLAYER
            </SlantedBlock>

            <SlantedBlock variant="header" className="w-[90px]">
              BAL
            </SlantedBlock>

            <SlantedBlock variant="header" className="w-[60px]">
              SCORE
            </SlantedBlock>

            <SlantedBlock variant="header" className="w-[90px]">
              BADGE
            </SlantedBlock>

          </div>

          {top10.map((row: any) => {
            const name =
              row.username.charAt(0).toUpperCase() +
              row.username.slice(1).toLowerCase();

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
              <div key={row.rank} className="flex items-center gap-2 py-1">

                <SlantedBlock className="w-[40px]">
                  {row.rank}
                </SlantedBlock>

                <SlantedBlock className="w-[110px] text-center truncate">
                  {name}
                </SlantedBlock>

                <SlantedBlock className={`w-[90px] text-center ${balanceColor}`}>
                  {formatBalance(row.current_balance)}
                </SlantedBlock>

                <SlantedBlock className="w-[60px] text-center">
                  {row.discipline_score}
                </SlantedBlock>

                <SlantedBlock className={`w-[90px] text-center normal-case ${badgeColor}`}>
                  {badge}
                </SlantedBlock>

              </div>
            );
          })}
        </div>

      </section>

      {/* DIVIDER */}
      <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80" />

      {/* ---------------- TOP WINNING BETS ---------------- */}
      <TopWinningBets initialBets={formattedWinningBets} />

      {/* ---------------- GLOBAL FLOATING BET SLIP ---------------- */}
      <GlobalFloatingBetSlip />

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-border pt-4 text-xs text-muted flex flex-wrap gap-4">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/responsible">Responsible Play</Link>
        <Link href="/support">Support</Link>
      </footer>

    </div>
  );
}