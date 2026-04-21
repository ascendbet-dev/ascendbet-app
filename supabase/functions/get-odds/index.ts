import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {

  /* CORS preflight */

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {

    const now = new Date();
    now.setHours(now.getHours() - 3);

    const { data, error } = await supabase
      .from("odds_matches")
      .select("*")
      .gt("commence_time", now.toISOString())
      .order("commence_time", { ascending: true })
      .limit(200);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        matches: data.map((m) => {
          return {
            ...m,
            external_id: m.external_id,
            source: m.source ?? "sportsdb",
          };
        }),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (err) {

    return new Response(
      JSON.stringify({ error: "Failed to fetch odds" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  }

});