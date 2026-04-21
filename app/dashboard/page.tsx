export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CapitalBlock from "@/components/CapitalBlock";
import Tooltip from "@/components/ui/Tooltip";
import { StatusBadge } from "@/components/StatusBadge";

function formatBalance(n: number) {
  return `₦${n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}


export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

if (!user) redirect("/login");

if (!user.email_confirmed_at) {
  redirect("/verify-email");
}

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  /* ---------------- ACTIVE SEASON ---------------- */

// 1. Get active season
const { data: activeSeason } = await supabase
.from("seasons")
.select(`
  id,
  name,
  registration_start,
  registration_end,
  start_date,
  end_date
`)
.eq("status", "active")
.maybeSingle();

let season = null;

// 2. Get user's instance ONLY for active season
if (activeSeason) {
const { data: instance } = await supabase
  .from("season_instances")
  .select(
    "id, current_balance, target_balance, hard_drawdown, starting_balance, settled_bet_count, discipline_score, active_betting_days, is_disqualified, is_qualified"
  )
  .eq("user_id", user.id)
  .eq("season_id", activeSeason.id) // 🔥 IMPORTANT
  .maybeSingle();

season = instance;
}


  const username = profile?.username ?? "User";

  if (!season) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-120px)] max-w-lg flex-col px-4 py-2">
        
        <section className="mb-3">
          <p className="text-sm text-muted">Welcome back,</p>
          <p className="text-lg font-medium text-muted">{username}</p>
        </section>
  
        <div className="mt-10 text-center text-sm text-muted">
          You have not joined the active season.
        </div>
  
      </div>
    );
  }

  const remainingToTarget = Math.max(
    0,
    season.target_balance - season.current_balance
  );
  const remainingDdBuffer = Math.max(
    0,
    season.current_balance - season.hard_drawdown
  );

  const progressValue = Math.max(
    0,
    season.current_balance - season.starting_balance
  );
  
  const progressRange =
    season.target_balance - season.starting_balance;
    
  const progressPercent =
    progressRange > 0
      ? Math.min(100, (progressValue / progressRange) * 100)
      : 0;

  const progressColor = season.is_disqualified
    ? "bg-danger"
    : season.is_qualified
    ? "bg-success"
    : "bg-accent";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-120px)] max-w-lg flex-col px-4 py-2">

      {/* Greeting */}
      <section className="mb-2">
        <p className="text-sm text-muted">Welcome back,</p>
        <p className="text-lg font-medium text-text/80">{username}</p>
      </section>

      {/* Capital Block */}
      <CapitalBlock
        balance={season.current_balance}
        remainingToTarget={remainingToTarget}
        remainingDdBuffer={remainingDdBuffer}
        progressPercent={progressPercent}
        progressColor={progressColor}
      />

      {/* Performance Strip */}
      <section className="mb-3 grid grid-cols-3 rounded-md border border-border bg-surface">
        <div className="border-r border-border px-2 py-2 text-center">
        <div className="flex items-center justify-center gap-1 relative">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Settled tickets
            </p>

            <Tooltip
              title="Tickets"
              content="The total number of completed tickets that count toward your performance in the current season."
              />
          </div>
          <p className="mt-0.5 text-xl font-semibold tabular-nums text-text">
            {season.settled_bet_count}
          </p>
        </div>

        <div className="border-r border-border px-2 py-2 text-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-[10px] uppercase tracking-wider text-muted">
            Active days
          </p>

          <Tooltip
            title="Active Days"
            content="The number of days you submitted at least one ticket during the season."
          />
        </div>
          <p className="mt-0.5 text-xl font-semibold tabular-nums text-text">
            {season.active_betting_days ?? 0}
          </p>
        </div>

        <div className="px-2 py-2 text-center min-w-0">
        <div className="flex items-center justify-center gap-1">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Discipline Score
            </p>

            <div className="relative flex items-center">
            <Tooltip
              title="Discipline"
              content="Measures how well you follow the rules, maintain consistency, and stay disciplined throughout the season."
              direction="left"
           />
            </div>
          </div>
          <p className="mt-0.5 text-xl font-semibold tabular-nums text-text">
            {season.discipline_score}
          </p>
        </div>
      </section>

      {/* Actions */}
      <nav className="mt-auto pb-0.5">
      <div className="flex gap-2">

        <Link
          href="/place-bet"
          className="flex h-12 w-[70%] items-center justify-center rounded-md bg-accent font-medium text-text"
        >
          Place Bet
        </Link>

        <Link
          href="/tickets"
          className="flex h-12 w-[30%] items-center justify-center rounded-md border border-border bg-surface text-sm font-medium text-text"
        >
          Tickets
        </Link>

        </div>
      </nav>
    </div>
  );
}