"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className = "" }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text transition-opacity duration-150 hover:opacity-80 disabled:opacity-50 ${className}`}
    >
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}