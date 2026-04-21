import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();



  if (!user) {
    console.log("NO USER → REDIRECT");
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();


  if (!profile || profile.role !== "admin") {
    console.log("NOT ADMIN → REDIRECT");
    redirect("/");
  }

  return <>{children}</>;
}