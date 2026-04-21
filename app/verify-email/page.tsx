import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage() {

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // ✅ If already verified → go home
  if (user.email_confirmed_at) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">

      <div className="w-full max-w-sm rounded-2xl bg-[#140a26] p-6 text-center border border-border">

        <h1 className="text-lg font-semibold text-white mb-2">
          Verify Your Email
        </h1>

        <p className="text-sm text-muted mb-4">
          Please check your email and click the confirmation link
          before continuing.
        </p>

        <p className="text-xs text-muted">
          Once verified, refresh this page.
        </p>

      </div>

    </div>
  );
}