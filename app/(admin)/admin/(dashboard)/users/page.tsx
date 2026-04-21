import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string };
}) {
  const supabase = await createClient();

  const query = searchParams?.q || "";
  const filter = searchParams?.filter || "all";

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

  if (!activeSeason) {
    return (
      <div className="text-white">
        No season found
      </div>
    );
  }

  /* 📊 USERS WITH SEASON INSTANCE */
  let queryBuilder = supabase
    .from("season_instances")
    .select(`
      *,
      profiles (
        username
      )
    `)
    .eq("season_id", activeSeason.id);

  /* 🔍 SEARCH */
  if (query) {
    queryBuilder = queryBuilder.ilike("profiles.username", `%${query}%`);
  }

  const { data: users } = await queryBuilder;

  /* 🎯 FILTER LOGIC (SERVER SIDE) */
  let filteredUsers = users || [];

  if (filter === "qualified") {
    filteredUsers = filteredUsers.filter(
      (u: any) => u.current_balance >= u.target_balance
    );
  }

  if (filter === "disqualified") {
    filteredUsers = filteredUsers.filter(
      (u: any) => u.current_balance <= u.drawdown_limit || u.is_disqualified
    );
  }

  if (filter === "active") {
    filteredUsers = filteredUsers.filter(
      (u: any) => !u.is_disqualified
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">

      {/* 🔥 HEADER */}
      <h1 className="text-xl text-white font-semibold">
        Users
      </h1>

      {/* 🔍 SEARCH + FILTER */}
      <form className="flex flex-wrap gap-3">

        <input
          name="q"
          placeholder="Search username..."
          defaultValue={query}
          className="input"
        />

        <select
          name="filter"
          defaultValue={filter}
          className="input"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="qualified">Qualified</option>
          <option value="disqualified">Disqualified</option>
        </select>

        <button className="btn">
          Apply
        </button>

      </form>

      {/* 📋 USER LIST */}
      <div className="space-y-3">

        {filteredUsers.map((u: any) => {

          let status = "Active";
          let color = "text-accent";

          if (u.current_balance >= u.target_balance) {
            status = "Qualified";
            color = "text-green-400";
          } else if (
            u.current_balance <= u.drawdown_limit ||
            u.is_disqualified
          ) {
            status = "Disqualified";
            color = "text-red-400";
          }

          return (
            <Link
              key={u.id}
              href={`/admin/users/${u.user_id}`}
              className="block rounded-xl border border-white/5 bg-[#140a26] p-4 hover:border-purple-500/20 transition"
            >

              <div className="flex justify-between items-center">

                {/* LEFT */}
                <div>
                  <p className="text-white font-semibold">
                    {u.profiles?.username || "User"}
                  </p>

                  <p className="text-[11px] text-muted">
                    Balance: ₦{u.current_balance.toLocaleString()}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <p className={`text-sm font-semibold ${color}`}>
                    {status}
                  </p>
                </div>

              </div>

            </Link>
          );
        })}

        {!filteredUsers.length && (
          <p className="text-muted text-sm">
            No users found
          </p>
        )}

      </div>

    </div>
  );
}