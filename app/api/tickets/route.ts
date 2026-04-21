import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const seasonId = searchParams.get("seasonId");

  if (!seasonId) {
    return NextResponse.json({ tickets: [] });
  }

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
    .eq("season_instance_id", seasonId)
    .order("placed_at", { ascending: false });

  if (!tickets) {
    return NextResponse.json({ tickets: [] });
  }

  /* 🔥 NORMALIZE DATA (IMPORTANT) */

  const formatted = tickets.map((t) => {
    const legs = (t.ticket_selections ?? []).map((l: any) => ({
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
      legs,
      totalOdds,
      potentialReturn,
    };
  });

  return NextResponse.json({ tickets: formatted });
}