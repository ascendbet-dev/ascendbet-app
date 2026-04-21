import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  /* 🔐 ADMIN CHECK */
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">

      <h1 className="text-white text-xl font-semibold">
        Analytics
      </h1>

      <div className="bg-[#140a26] p-4 rounded-xl border border-white/5">
        <p className="text-muted text-sm">
          Analytics coming soon...
        </p>
      </div>

    </div>
  );
}