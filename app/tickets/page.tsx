import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TicketsClient from "@/components/TicketsClient";

interface TicketSelection {
  odds: number;
  market?: string;
  selection?: string;
  fixture_id?: number;
  home_team?: string;
  away_team?: string;
  home_goals?: number | null;
  away_goals?: number | null;
  result?: "won" | "lost" | "pending";
}

interface Ticket {
  id: string;
  stake: number;
  ticket_type: string;
  status: "won" | "lost" | "pending";
  placed_at: string;
  ticket_selections?: TicketSelection[];
}

/* ---------------- GET SEASONS ---------------- */

async function getSeasons(userId: string) {
  const supabase = await createClient();

  const { data: instances } = await supabase
    .from("season_instances")
    .select("id, season_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false }); // ✅ newest first

  if (!instances || instances.length === 0) return [];

  const seasonIds = instances.map((s) => s.season_id);

  const { data: seasons } = await supabase
    .from("seasons")
    .select("id, name")
    .in("id", seasonIds);

  return instances.map((inst) => {
    const season = seasons?.find((s) => s.id === inst.season_id);

    return {
      id: inst.id, // season_instance_id
      season_id: inst.season_id,
      name: season?.name || "Season",
    };
  });
}

/* ---------------- GET TICKETS ---------------- */

async function getTickets(seasonInstanceId: string) {
  const supabase = await createClient();

  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      id,
      stake,
      ticket_type,
      status,
      placed_at,
      ticket_selections (
        odds,
        market,
        market_label,
        selection,
        pick_label,
        fixture_id,
        home_team,
        away_team,
        home_goals,
        away_goals,
        result
      )
    `)
    .eq("season_instance_id", seasonInstanceId)
    .order("placed_at", { ascending: false });

  if (!tickets) return [];

  return tickets.map((t) => {
    const legs: TicketSelection[] = (t.ticket_selections ?? []).map((l) => ({
      odds: l.odds,
      market: l.market,
      marketLabel: l.market_label,
      selection: l.selection,
      pickLabel: l.pick_label,
      fixture_id: l.fixture_id,
      home_team: l.home_team,
      away_team: l.away_team,
      home_goals: l.home_goals,
      away_goals: l.away_goals,
      result: l.result,
    }));

    const totalOdds =
      legs.length > 0
        ? legs.reduce((acc, l) => acc * l.odds, 1)
        : 0;

    const potentialReturn = Math.round(t.stake * totalOdds);

    return {
      ...t,
      totalOdds,
      potentialReturn,
      legs,
    };
  });
}

/* ---------------- PAGE ---------------- */

export default async function TicketsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (!user.email_confirmed_at) {
    redirect("/verify-email");
  }

  const seasons = await getSeasons(user.id);

  /* ---------------- DETERMINE DEFAULT SEASON ---------------- */

  // 1. Get active season
  const { data: activeSeason } = await supabase
    .from("seasons")
    .select("id")
    .eq("status", "active")
    .maybeSingle();

  let defaultSeason = null;

  /* 2. Try active season instance */

  if (activeSeason) {
    const { data: instance } = await supabase
      .from("season_instances")
      .select("id, season_id")
      .eq("user_id", user.id)
      .eq("season_id", activeSeason.id)
      .maybeSingle();

    if (instance) {
      defaultSeason = instance;
    }
  }

  /* 3. Fallback → latest season instance */

  if (!defaultSeason && seasons.length > 0) {
    defaultSeason = {
      id: seasons[0].id, // ✅ already latest
    };
  }

  /* ---------------- GET TICKETS ---------------- */

  const tickets = defaultSeason
    ? await getTickets(defaultSeason.id)
    : [];

    return (
      <div className="mx-auto max-w-lg flex flex-col h-[calc(100dvh-120px)]">

        {/* 🔹 PAGE HEADER */}
        <div className="flex-shrink-0 px-4 pt-4 pb-4">
          <h1 className="text-lg font-semibold text-text">
            Ticket History
          </h1>
        </div>

        {/* 🔹 CONTENT WRAPPER */}
        <div className="flex-1 flex flex-col overflow-hidden px-4">
          <div className="flex-1 overflow-y-auto scroll-smooth">
            
            <TicketsClient
              seasons={seasons}
              defaultSeasonId={defaultSeason?.id || null}
              tickets={tickets}
            />

          </div>
        </div>

    </div>
    );
}