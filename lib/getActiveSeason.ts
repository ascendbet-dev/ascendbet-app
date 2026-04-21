import { createClient } from "@/lib/supabase/server";

export async function getActiveSeason(userId?: string) {
  const supabase = await createClient();

  const { data: season } = await supabase
    .from("seasons")
    .select("*")
    .eq("status", "active")
    .maybeSingle();

  if (!season) return null;

  const { data: instances } = await supabase
    .from("season_instances")
    .select("season_id")
    .eq("season_id", season.id);

  const players = instances?.length ?? 0;

  return {
    ...season,
    players,
  };
}