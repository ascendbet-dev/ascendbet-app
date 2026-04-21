import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PlaceBetClient } from "@/components/PlaceBetClient";
import { SeasonNotStarted } from "@/components/SeasonNotStarted";

export default async function PlaceBetPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (!user.email_confirmed_at) {
    redirect("/verify-email");
  }

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
    .eq("season_id", activeSeason.id) // ✅ FIXED
    .maybeSingle();

  if (!instance) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[420px] flex-col px-4 py-4">
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

  /* 🔥 3. CHECK IF SEASON HAS STARTED */
  const now = new Date();
  const seasonStart = new Date(activeSeason.start_date);

  const seasonEnd = new Date(activeSeason.end_date);

if (now > seasonEnd) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[420px] flex-col px-4 py-4">
      <section className="rounded-lg border border-border bg-surface px-4 py-6 text-center">
        <p className="text-sm text-muted">
          This season has ended. Betting is closed.
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

  if (now < seasonStart) {
    return <SeasonNotStarted target={activeSeason.start_date} />;
  }

  /* ✅ 4. ALLOW BETTING */
  return (
    <PlaceBetClient
      balance={instance.current_balance}
      seasonInstanceId={instance.id}
    />
  );
}