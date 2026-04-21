import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminFAQPage() {
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

  /* 📦 FETCH FAQ */
  const { data: faqs } = await supabase
    .from("faq")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">

      {/* 🔥 HEADER */}
      <h1 className="text-xl text-white font-semibold">
        FAQ Management
      </h1>

      {/* ➕ CREATE FAQ */}
      <div className="bg-[#140a26] p-5 rounded-2xl space-y-4">

        <h2 className="text-sm text-muted">
          Add FAQ
        </h2>

        <form action={createFAQ} className="space-y-3">

        <input
            name="category"
            placeholder="Category (e.g. Overview, Betting Rules)"
            className="input w-full"
            required
        />

          <input
            name="question"
            placeholder="Question"
            className="input w-full"
            required
          />

          <textarea
            name="answer"
            placeholder="Answer"
            className="input w-full h-24"
            required
          />

          <button className="btn w-full">
            Add FAQ
          </button>

        </form>

      </div>

      {/* 📋 FAQ LIST */}
      <div className="space-y-3">

        {faqs?.map((f: any) => (
          <div
            key={f.id}
            className="bg-[#140a26] p-4 rounded-xl border border-white/5"
          >

            <p className="text-white font-semibold text-sm">
              {f.question}
            </p>

            <p className="text-muted text-xs mt-1">
              {f.answer}
            </p>

            <div className="flex gap-2 mt-3">

              {/* ✏️ EDIT */}
              <form action={updateFAQ}>
                <input type="hidden" name="id" value={f.id} />

                <input
                    name="category"
                    defaultValue={f.category}
                    className="input text-xs mb-1"
                  />

                <input
                  name="question"
                  defaultValue={f.question}
                  className="input text-xs mb-1"
                />

                <input
                  name="answer"
                  defaultValue={f.answer}
                  className="input text-xs mb-1"
                />

                <button className="btn-yellow text-xs">
                  Update
                </button>
              </form>

              {/* 🗑 DELETE */}
              <form action={deleteFAQ}>
                <input type="hidden" name="id" value={f.id} />
                <button className="btn-red-outline text-xs">
                  Delete
                </button>
              </form>

            </div>

          </div>
        ))}

        {!faqs?.length && (
          <p className="text-muted text-sm">
            No FAQs yet
          </p>
        )}

      </div>

    </div>
  );
}

/* ➕ CREATE */
async function createFAQ(formData: FormData) {
  "use server";

  const supabase = await createClient();

  await supabase.from("faq").insert({
    category: formData.get("category"),
    question: formData.get("question"),
    answer: formData.get("answer"),
  });

  redirect("/admin/faq");
}

/* ✏️ UPDATE */
async function updateFAQ(formData: FormData) {
  "use server";

  const supabase = await createClient();

  await supabase
    .from("faq")
    .update({
      category: formData.get("category"),
      question: formData.get("question"),
      answer: formData.get("answer"),
    })
    .eq("id", formData.get("id"));

  redirect("/admin/faq");
}

/* 🗑 DELETE */
async function deleteFAQ(formData: FormData) {
  "use server";

  const supabase = await createClient();

  await supabase
    .from("faq")
    .delete()
    .eq("id", formData.get("id"));

  redirect("/admin/faq");
}