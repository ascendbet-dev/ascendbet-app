import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SeasonNotStarted } from "@/components/SeasonNotStarted";
import BetslipPageClient from "@/components/BetslipPageClient"; // 👈 NEW

export default async function BetslipPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  /* 🔥 1. GET ACTIVE SEASON */
  const { data: activeSeason } = await supabase
    .from("seasons")
    .select("*")
    .eq("status", "active")
    .maybeSingle();

  if (!activeSeason) {
    return (
      <div className="text-center text-sm text-muted mt-10">
        No active season
      </div>
    );
  }

  /* 🔥 2. CHECK IF USER JOINED THIS SEASON */
  const { data: instance } = await supabase
    .from("season_instances")
    .select("id, current_balance")
    .eq("user_id", user.id)
    .eq("season_id", activeSeason.id)
    .maybeSingle();

  if (!instance) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-4">
        <section className="rounded-lg border border-border bg-surface px-4 py-6 text-center">
          <p className="text-sm text-muted">
            You need to join the active season first.
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-text"
          >
            Go to Dashboard
          </Link>
        </section>
      </div>
    );
  }

  const now = new Date();
  const seasonStart = new Date(activeSeason.start_date);
  const seasonEnd = new Date(activeSeason.end_date);

  /* 🔴 SEASON ENDED */
  if (now > seasonEnd) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-4">
        <section className="rounded-lg border border-border bg-surface px-4 py-6 text-center">
          <p className="text-sm text-muted">
            This season has ended. Selection is closed.
          </p>

          <Link
            href="/leaderboard"
            className="mt-3 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-text"
          >
            View Leaderboard
          </Link>
        </section>
      </div>
    );
  }

  /* 🟣 SEASON NOT STARTED */
  if (now < seasonStart) {
    return <SeasonNotStarted target={activeSeason.start_date} />;
  }

  /* ✅ ACTIVE → SHOW BETSLIP ONLY */

  return (
    <BetslipPageClient
      balance={instance.current_balance}
      seasonInstanceId={instance.id}
    />
  );
}