import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  /* ---------- GROUP BY LEAGUE ---------- */

  const { data, error } = await supabase.rpc("aggregate_model_performance");

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  if (!data || data.length === 0) {
    return new Response(JSON.stringify({ message: "no data" }));
  }

  for (const row of data) {

    const {
      league,
      avg_brier,
      avg_home_prob,
      actual_home_rate,
      avg_draw_prob,
      actual_draw_rate,
      avg_away_prob,
      actual_away_rate,
      sample_size
    } = row;

    await supabase
      .from("model_calibration")
      .upsert({
        league,
        avg_brier,
        avg_home_prob,
        actual_home_rate,
        avg_draw_prob,
        actual_draw_rate,
        avg_away_prob,
        actual_away_rate,
        sample_size,
        updated_at: new Date()
      });
  }

  return new Response(JSON.stringify({ success: true, leagues: data.length }));
});