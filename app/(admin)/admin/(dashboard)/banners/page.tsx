import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BannerForm } from "./BannerForm";

export default async function AdminBannersPage() {
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

  /* 📦 FETCH */
  const { data: banners } = await supabase
  .from("banners")
  .select("id, title, subtitle, type, image, active")
  .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">

      <h1 className="text-white text-xl font-semibold">
        Banner Management
      </h1>

      {/* ➕ CREATE */}
      <BannerForm action={createBanner} />

      {/* 📋 LIST */}
      <div className="space-y-3">

        {banners?.map((b: any) => (
          <div key={b.id} className="bg-[#140a26] p-4 rounded-xl border border-white/5">

            <p className="text-white text-sm font-semibold">
              {b.title}
            </p>

            {b.subtitle && (
                <p className="text-xs text-muted">
                    {b.subtitle}
                </p>
                )}

            <p className="text-xs text-muted mt-1">
              {b.type}
            </p>

            {b.image ? (
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-3">
            <img
              src={b.image}
              alt={b.title}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full aspect-[16/9] rounded-lg mb-3 bg-[#0d061a] flex items-center justify-center text-xs text-muted">
            No image
          </div>
        )}

            {/* 🔥 STATUS */}
            <p className="text-xs mt-2">
              Status:{" "}
              <span className={b.active ? "text-green-400" : "text-red-400"}>
                {b.active ? "Active" : "Inactive"}
              </span>
            </p>

            <div className="flex gap-2 mt-3">

              {/* 🔁 TOGGLE */}
              <form action={toggleBanner}>
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="active" value={b.active} />

                <button className="btn-yellow text-xs">
                  {b.active ? "Deactivate" : "Activate"}
                </button>
              </form>

              {/* 🗑 DELETE */}
              <form action={deleteBanner}>
                <input type="hidden" name="id" value={b.id} />
                <button className="btn-red-outline text-xs">
                  Delete
                </button>
              </form>

            </div>

          </div>
        ))}

        {/* EMPTY STATE */}
        {!banners?.length && (
          <p className="text-muted text-sm">
            No banners yet
          </p>
        )}

      </div>

    </div>
  );
}

/* ➕ CREATE */
async function createBanner(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const rawImage = formData.get("image")?.toString().trim();
  const image = rawImage ? rawImage : null;

  await supabase.from("banners").insert({
    type: formData.get("type"),
    title: formData.get("title") || null,
    subtitle: formData.get("subtitle"),
    image: image,
    button_text: formData.get("button_text"),
    link: formData.get("link"),
    expires_at: formData.get("expires_at") || null,
  });

  redirect("/admin/banners");
}

/* 🔁 TOGGLE */
async function toggleBanner(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const id = formData.get("id");
  const active = formData.get("active") === "true";

  await supabase
    .from("banners")
    .update({ active: !active })
    .eq("id", id);

  redirect("/admin/banners");
}

/* 🗑 DELETE */
async function deleteBanner(formData: FormData) {
  "use server";

  const supabase = await createClient();

  await supabase
    .from("banners")
    .delete()
    .eq("id", formData.get("id"));

  redirect("/admin/banners");
}
