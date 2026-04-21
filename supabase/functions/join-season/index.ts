import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  /* 🔥 HANDLE PREFLIGHT */
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  /* 🔥 ADMIN CLIENT */
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  /* 🔥 USER CLIENT */
  const authHeader = req.headers.get("Authorization")!;

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: authHeader } },
    }
  );

  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }

  /* 🔥 GET ACTIVE SEASON */
  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select("*")
    .eq("status", "active")
    .single();

  if (seasonError || !season) {
    return new Response(
      JSON.stringify({ error: "No active season available" }),
      { status: 400, headers: corsHeaders }
    );
  }

  /* 🔒 REGISTRATION WINDOW CHECK */
  const now = new Date();

  if (
    !season.registration_start ||
    !season.registration_end ||
    now < new Date(season.registration_start) ||
    now > new Date(season.registration_end)
  ) {
    return new Response(
      JSON.stringify({ error: "Registration is closed" }),
      { status: 400, headers: corsHeaders }
    );
  }

  /* 🔥 CHECK IF USER ALREADY JOINED THIS SEASON */
  const { data: existing } = await supabase
    .from("season_instances")
    .select("id")
    .eq("user_id", user.id)
    .eq("season_id", season.id)
    .maybeSingle();

  if (existing) {
    return new Response(
      JSON.stringify({ error: "You already joined this season" }),
      { status: 400, headers: corsHeaders }
    );
  }

  /* 🔥 CREATE SEASON INSTANCE */
  const { data, error } = await supabase
    .from("season_instances")
    .insert({
      user_id: user.id,
      season_id: season.id,

      start_date: season.start_date,
      end_date: season.end_date,

      starting_balance: season.starting_balance,
      current_balance: season.starting_balance,
      peak_balance: season.starting_balance,

      hard_drawdown: season.drawdown_limit,
      target_balance: season.target_balance,
    })
    .select()
    .single();

  if (error) {
    console.error(error);

    return new Response(
      JSON.stringify({ error: "Failed to join season" }),
      { status: 500, headers: corsHeaders }
    );
  }

  /* ✅ SUCCESS */
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: corsHeaders,
  });
});