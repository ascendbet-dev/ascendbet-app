import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BalanceChart } from "@/components/admin/BalanceChart";
import Link from "next/link";

export default async function SeasonDashboard({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const seasonId = params.id;

  /* 🔐 AUTH CHECK */
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

  /* 📊 FETCH DATA */
  const { data: instances } = await supabase
    .from("season_instances")
    .select("*")
    .eq("season_id", seasonId);

  if (!instances) return null;

  /* 📊 METRICS */
  const total = instances.length;

  const qualified = instances.filter(
    (i) => i.current_balance >= i.target_balance
  ).length;

  const disqualified = instances.filter(
    (i) => i.current_balance <= i.hard_drawdown
  ).length;

  const active = total - qualified - disqualified;

  const balances = instances.map((i) => i.current_balance);

  const avg =
    balances.reduce((a, b) => a + b, 0) / (balances.length || 1);

  const max = Math.max(...balances, 0);
  const min = Math.min(...balances, 0);

  const distribution = [
    {
      range: "Below 88k",
      count: instances.filter(i => i.current_balance < i.hard_drawdown).length,
    },
    {
      range: "88k - 100k",
      count: instances.filter(i => i.current_balance >= 88000 && i.current_balance < 100000).length,
    },
    {
      range: "100k - 120k",
      count: instances.filter(i => i.current_balance >= 100000 && i.current_balance < 120000).length,
    },
    {
      range: "120k+",
      count: instances.filter(i => i.current_balance >= 120000).length,
    },
  ];

  /* 🏆 LEADERBOARD */
  const leaderboard = [...instances]
    .sort((a, b) => b.current_balance - a.current_balance)
    .slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* HEADER */}
      <h1 className="text-xl font-semibold text-white">
        Season Dashboard
      </h1>

      {/* METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Stat label="Participants" value={total} />
        <Stat label="Active" value={active} />
        <Stat label="Qualified" value={qualified} />
        <Stat label="Disqualified" value={disqualified} />

      </div>

      {/* BALANCE INSIGHT */}
      <div className="grid grid-cols-3 gap-4">

        <Stat label="Avg Balance" value={`₦${Math.round(avg)}`} />
        <Stat label="Highest" value={`₦${max}`} />
        <Stat label="Lowest" value={`₦${min}`} />

      </div>

      {/* 📊 BALANCE CHART */}
      <div className="mt-2">
        <BalanceChart data={distribution} />
    </div>

      {/* LEADERBOARD */}
      <div className="bg-[#140a26] rounded-2xl p-4">

        <h2 className="text-sm text-muted mb-3">
          Top Performers
        </h2>

        <div className="space-y-2">

          {leaderboard.map((u, i) => (
            <div
              key={u.id}
              className="flex justify-between text-sm text-white border-b border-white/5 pb-2"
            >
              <span>#{i + 1}</span>
              <Link
                href={`/admin/users/${u.user_id}`}
                className="hover:text-accent transition"
                >
                {u.user_id.slice(0, 6)}
            </Link>
              <span>₦{u.current_balance}</span>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

/* 🔥 STAT COMPONENT */
function Stat({ label, value }: any) {
  return (
    <div className="bg-[#140a26] p-4 rounded-xl text-center">

      <p className="text-[10px] text-muted">{label}</p>

      <p className="text-white font-semibold mt-1">
        {value}
      </p>

    </div>
  );
}

