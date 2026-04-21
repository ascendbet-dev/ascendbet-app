import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { finalizeSeason } from "@/lib/admin/finalizeSeason";
import { formatDate, parseLocalDateTime } from "@/lib/time";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

export default async function AdminSeasonsPage() {
  const supabase = await createClient();

  /* 🔥 FETCH SEASONS */
  const { data: seasons } = await supabase
    .from("seasons")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: instances } = await supabase
    .from("season_instances")
    .select("season_id");

  return (
    <div className="mx-auto w-full max-w-[420px] px-3 pt-4 pb-24 space-y-4">

      {/* HEADER */}
      <h1 className="text-sm font-semibold text-white">
        Season Management
      </h1>

      {/* CREATE SEASON */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">

  <p className="text-xs text-muted">Create Season</p>

  <form action={createSeason} className="space-y-4">

    {/* NAME */}
    <input
      name="name"
      placeholder="Season Name"
      className="input w-full"
      required
    />

    {/* 🔥 REGISTRATION */}
    <div className="space-y-2">
      <p className="text-[11px] text-purple-400 font-medium">
        Registration Period
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-[9px] text-muted">Start</p>
          <input
            name="registration_start"
            type="datetime-local"
            className="input text-xs"
            required
          />
        </div>

        <div className="space-y-1">
          <p className="text-[9px] text-muted">End</p>
          <input
            name="registration_end"
            type="datetime-local"
            className="input text-xs"
            required
          />
        </div>
      </div>
    </div>

    {/* 🔥 SEASON */}
    <div className="space-y-2">
      <p className="text-[11px] text-green-400 font-medium">
        Season Duration
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-[9px] text-muted">Kickoff</p>
          <input
            name="start_date"
            type="datetime-local"
            className="input text-xs"
            required
          />
        </div>

        <div className="space-y-1">
          <p className="text-[9px] text-muted">End</p>
          <input
            name="end_date"
            type="datetime-local"
            className="input text-xs"
            required
          />
        </div>
      </div>
    </div>

    {/* 🔥 BALANCE */}
    <div className="space-y-2">
      <p className="text-[11px] text-yellow-400 font-medium">
        Balance Rules
      </p>

      <div className="grid grid-cols-3 gap-2">
        <input
          name="starting_balance"
          defaultValue="100000"
          className="input text-xs"
          placeholder="Start"
        />
        <input
          name="target_balance"
          defaultValue="120000"
          className="input text-xs"
          placeholder="Target"
        />
        <input
          name="drawdown_limit"
          defaultValue="88000"
          className="input text-xs"
          placeholder="DD Limit"
        />
      </div>
    </div>

    <button className="w-full py-2 rounded-lg bg-accent text-white text-sm font-semibold">
      Create Season
    </button>

  </form>
</div>

      {/* SEASONS LIST */}
      <div className="space-y-3">

        {seasons?.map((s: any) => {
          const isActive = s.status === "active";

          const participants_count =
            instances?.filter(
              (i) => String(i.season_id).trim() === String(s.id).trim()
            ).length ?? 0;

          return (
            <div
              key={s.id}
              className="rounded-xl border border-border bg-[#140a26] p-4 space-y-2"
            >

              {/* TOP */}
              <div className="flex justify-between items-start">

                <div>
                  <Link href={`/admin/seasons/${s.id}`}>
                    <p className="text-sm font-semibold text-white">
                      {s.name}
                    </p>
                  </Link>

                  <p className="text-[10px] text-muted">
                    {formatDate(s.start_date)} → {formatDate(s.end_date)}
                  </p>

                  <p className="text-[10px] text-purple-400">
                    {participants_count} players
                  </p>
                </div>

                <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold
                  ${
                    s.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : s.status === "completed"
                      ? "bg-red-500/20 text-red-400"
                      : s.status === "finalized"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                  {s.status ?? "draft"}
                </span>

              </div>

              {/* REG */}
              <p className="text-[10px] text-muted">
                Reg: {formatDate(s.registration_start)} → {formatDate(s.registration_end)}
              </p>

              {/* ACTIONS */}
              <div className="grid grid-cols-2 gap-2 pt-2">

                {!isActive && (
                  <form action={activateSeason}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn-green w-full text-xs py-2">
                      Activate
                    </button>
                  </form>
                )}

                {isActive && (
                  <form action={endSeason}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn-red w-full text-xs py-2">
                      End
                    </button>
                  </form>
                )}

                <Link
                  href={`/admin/seasons/${s.id}`}
                  className="btn-yellow w-full text-xs py-2 text-center"
                >
                  View
                </Link>

                {!isActive && (
                  <form action={deleteSeason}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn-red-outline w-full text-xs py-2">
                      Delete
                    </button>
                  </form>
                )}

              </div>

              {/* FINALIZE */}
              {s.status === "completed" && participants_count > 0 && (
                <form action={finalizeSeasonAction} className="pt-1">
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    className={`w-full text-xs py-2 rounded-md font-medium ${
                      s.is_finalized
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : "bg-purple-600 text-white"
                    }`}
                    disabled={s.is_finalized}
                  >
                    {s.is_finalized ? "Finalized" : "Finalize"}
                  </button>
                </form>
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
}

/* 🔥 CREATE */
async function createSeason(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const regStart = parseLocalDateTime(formData.get("registration_start") as string);
  const regEnd = parseLocalDateTime(formData.get("registration_end") as string);
  const start = parseLocalDateTime(formData.get("start_date") as string);
  const end = parseLocalDateTime(formData.get("end_date") as string);

  if (regEnd <= regStart || start <= regEnd || end <= start) return;

  await supabase.from("seasons").insert({
    name: formData.get("name"),
    start_date: start.toISOString(),
    registration_start: regStart.toISOString(),
    registration_end: regEnd.toISOString(),
    end_date: end.toISOString(),
    starting_balance: Number(formData.get("starting_balance")),
    target_balance: Number(formData.get("target_balance")),
    drawdown_limit: Number(formData.get("drawdown_limit")),
    status: "draft",
  });

  redirect("/admin/seasons");
}

/* 🔥 ACTIVATE */
async function activateSeason(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const id = formData.get("id");

  await supabase.from("seasons").update({ status: "completed" }).eq("status", "active");
  await supabase.from("seasons").update({ status: "active" }).eq("id", id);

  redirect("/admin/seasons");
}

/* 🔥 END */
async function endSeason(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("seasons").update({ status: "completed" }).eq("id", id);

  redirect("/admin/seasons");
}

/* 🔥 DELETE */
async function deleteSeason(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const id = formData.get("id");

  await supabase.from("seasons").delete().eq("id", id);

  redirect("/admin/seasons");
}

/* 🔥 FINALIZE */
async function finalizeSeasonAction(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;

  await finalizeSeason(id);
  revalidatePath("/admin/seasons");
  redirect("/admin/seasons");
}