import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminUserPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const userId = params.id;

  /* 🔐 AUTH */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/");

  /* 🔍 ACTIVE SEASON (WITH FALLBACK) */
  let { data: activeSeason } = await supabase
    .from("seasons")
    .select("*")
    .eq("status", "active")
    .maybeSingle();

  if (!activeSeason) {
    const { data } = await supabase
      .from("seasons")
      .select("*")
      .eq("status", "ended")
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    activeSeason = data;
  }

  /* 👤 USER PROFILE */
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  /* 📊 SEASON INSTANCE (STRICTLY BY season_id) */
  const { data: instance } = await supabase
    .from("season_instances")
    .select("*")
    .eq("user_id", userId)
    .eq("season_id", activeSeason?.id)
    .maybeSingle();

  /* 🎟 BETS */
  const { data: tickets } = await supabase
    .from("bets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  /* 🎨 BALANCE COLOR */
  let balanceColor = "text-white";
  if (instance?.current_balance >= instance?.target_balance)
    balanceColor = "text-green-400";
  else if (instance?.current_balance <= instance?.drawdown_limit)
    balanceColor = "text-red-400";

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* 👤 HEADER */}
      <div className="bg-[#140a26] p-5 rounded-2xl">
        <h1 className="text-white font-semibold text-lg">
          {userProfile?.username || "User"}
        </h1>
        <p className="text-xs text-muted">ID: {userId}</p>
      </div>

      {/* 📊 STATS */}
      {instance && (
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Balance" value={`₦${instance.current_balance}`} className={balanceColor} />
          <Stat label="Start" value={`₦${instance.starting_balance}`} />
          <Stat label="Target" value={`₦${instance.target_balance}`} />
        </div>
      )}

      {/* 🚨 STATUS */}
      {instance && (
        <div className="bg-[#140a26] p-4 rounded-xl text-xs text-muted">
          Status:{" "}
          <span
            className={
              instance.is_disqualified
                ? "text-red-400"
                : "text-green-400"
            }
          >
            {instance.is_disqualified ? "Disqualified" : "Active"}
          </span>
        </div>
      )}

      {/* 🚨 ADMIN ACTIONS */}
      <div className="bg-[#140a26] p-5 rounded-2xl space-y-3">

        <h2 className="text-sm text-muted">
          Admin Actions
        </h2>

        <div className="flex flex-wrap gap-2">

          {/* ❌ DISQUALIFY */}
          <form action={disqualifyUser}>
            <input type="hidden" name="user_id" value={userId} />
            <button className="px-3 py-2 text-xs bg-red-500 rounded text-white">
              Disqualify
            </button>
          </form>

          {/* ✅ REINSTATE */}
          <form action={reinstateUser}>
            <input type="hidden" name="user_id" value={userId} />
            <button className="px-3 py-2 text-xs bg-green-600 rounded text-white">
              Reinstate
            </button>
          </form>

        </div>

        {/* 💰 ADJUST BALANCE */}
        <form action={adjustBalance} className="flex gap-2 pt-2">

          <input
            name="amount"
            placeholder="New Balance"
            className="input text-xs"
            required
          />

          <input type="hidden" name="user_id" value={userId} />

          <button className="px-3 py-2 text-xs bg-accent rounded text-white">
            Update
          </button>

        </form>

      </div>

      {/* 🎟 TICKETS */}
      <div className="bg-[#140a26] p-5 rounded-2xl">

        <h2 className="text-sm text-muted mb-3">
          Recent Bets
        </h2>

        <div className="space-y-2">

          {tickets?.map((t: any) => (
            <div
              key={t.id}
              className="flex justify-between text-sm text-white border-b border-white/5 pb-2"
            >
              <span>{t.market}</span>
              <span>{t.pick}</span>
              <span>₦{t.stake}</span>
            </div>
          ))}

          {!tickets?.length && (
            <p className="text-xs text-muted">
              No bets yet
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

/* 🔥 AUTH HELPER */
async function verifyAdmin(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");
}

/* 🔍 GET ACTIVE SEASON */
async function getActiveSeason(supabase: any) {
  let { data } = await supabase
    .from("seasons")
    .select("id")
    .eq("status", "active")
    .maybeSingle();

  if (!data) {
    const { data: fallback } = await supabase
      .from("seasons")
      .select("id")
      .eq("status", "ended")
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    data = fallback;
  }

  return data;
}

/* 🔥 ACTIONS */

async function disqualifyUser(formData: FormData) {
  "use server";

  const supabase = await createClient();
  await verifyAdmin(supabase);

  const userId = formData.get("user_id");

  const season = await getActiveSeason(supabase);
  if (!season) return;

  await supabase
    .from("season_instances")
    .update({ is_disqualified: true })
    .eq("user_id", userId)
    .eq("season_id", season.id);

  redirect(`/admin/users/${userId}`);
}

async function reinstateUser(formData: FormData) {
  "use server";

  const supabase = await createClient();
  await verifyAdmin(supabase);

  const userId = formData.get("user_id");

  const season = await getActiveSeason(supabase);
  if (!season) return;

  await supabase
    .from("season_instances")
    .update({ is_disqualified: false })
    .eq("user_id", userId)
    .eq("season_id", season.id);

  redirect(`/admin/users/${userId}`);
}

async function adjustBalance(formData: FormData) {
  "use server";

  const supabase = await createClient();
  await verifyAdmin(supabase);

  const userId = formData.get("user_id");
  const amount = Number(formData.get("amount"));

  if (!amount) return;

  const season = await getActiveSeason(supabase);
  if (!season) return;

  await supabase
    .from("season_instances")
    .update({ current_balance: amount })
    .eq("user_id", userId)
    .eq("season_id", season.id);

  redirect(`/admin/users/${userId}`);
}

/* 🔥 STAT */
function Stat({ label, value, className = "" }: any) {
  return (
    <div className="bg-[#140a26] p-4 rounded-xl text-center">
      <p className="text-[10px] text-muted">{label}</p>
      <p className={`font-semibold mt-1 ${className}`}>
        {value}
      </p>
    </div>
  );
}