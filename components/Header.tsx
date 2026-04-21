"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useBetslipStore } from "@/stores/useBetslipStore";

function formatBalance(n: number) {
  return `₦${n?.toLocaleString() ?? "0"}`;
}

export function Header() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<number>(0);

  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === "/";
  const isProfile = pathname === "/profile";
  const isBetslipPage = pathname === "/betslip"; // 🔥 ADD THIS

  const setUser = useBetslipStore((s) => s.setUser);
  const [target, setTarget] = useState(0);
  const [drawdown, setDrawdown] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const isLogged = !!session;
      setLoggedIn(isLogged);

      if (!isLogged) {
        setUser(null);
        setBalance(0);
        return;
      }

      setUser(session.user.id);

      const { data: activeSeason } = await supabase
        .from("seasons")
        .select("id")
        .eq("status", "active")
        .maybeSingle();

      if (!activeSeason) {
        setBalance(0);
        return;
      }

      const { data: seasonMeta } = await supabase
      .from("seasons")
      .select("target_balance, drawdown_limit")
      .eq("id", activeSeason.id)
      .single();


      const { data: instance } = await supabase
        .from("season_instances")
        .select("current_balance")
        .eq("user_id", session.user.id)
        .eq("season_id", activeSeason.id)
        .maybeSingle();

        setBalance(Number(instance?.current_balance ?? 0));

        setTarget(Number(seasonMeta?.target_balance ?? 0));
        setDrawdown(Number(seasonMeta?.drawdown_limit ?? 0));
    };

    load();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setLoggedIn(!!session);

        if (!session) {
          setUser(null);
          setBalance(0);
          return;
        }

        setUser(session.user.id);
        load();
      });

    return () => subscription.unsubscribe();
  }, [setUser]);

  /* 🔥 FIXED BACK HANDLER */
  useEffect(() => {
    (window as any).ascendbetBack = () => {
      if (isBetslipPage) {
        router.replace("/"); // only redirect if on betslip page
      } else {
        router.back(); // normal behavior elsewhere
      }
    };

    return () => {
      (window as any).ascendbetBack = null;
    };
  }, [isBetslipPage, router]);

  /* 🔥 REAL-TIME BALANCE */
  useEffect(() => {
    function handleBalanceUpdate(e: any) {
      if (typeof e.detail === "number") {
        setBalance(e.detail);
      }
    }

    window.addEventListener("balanceUpdated", handleBalanceUpdate);

    return () => {
      window.removeEventListener("balanceUpdated", handleBalanceUpdate);
    };
  }, []);

  let balanceColor = "text-white";

  if (target && balance >= target) {
    balanceColor = "text-green-400";
  } else if (drawdown && balance <= drawdown) {
    balanceColor = "text-red-400";
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg-primary/95 backdrop-blur-md">
      <div className="flex min-h-14 items-center justify-between px-4 select-none">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-1">
          <Image
            src="/logo-v1.png"
            alt="AscendBet"
            width={35}
            height={35}
            className="rounded-md object-contain"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">
          <span className="text-white">ASCEND</span>
          <span className="text-purple-400">BET</span>
        </span>
        </Link>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {isHome && loggedIn === false && (
            <>
              <Link href="/signup" className="rounded-md bg-accent px-4 py-2 text-xs font-medium text-text">
                Join Now
              </Link>
              <Link href="/login" className="rounded-md border border-border px-4 py-2 text-xs text-text">
                Log In
              </Link>
            </>
          )}

          {isHome && loggedIn === true && (
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-lg text-xs font-semibold
              bg-gradient-to-r from-[#2a174a] to-[#140a26]
              border border-purple-500/20
              ${balanceColor}
              transition-all duration-300 hover:scale-105`}
            >
              {formatBalance(balance)}
            </Link>
          )}

          {isProfile && loggedIn === true && (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
                router.replace("/login");
                router.refresh();
              }}
              className="text-xs px-3 py-1 rounded-md border border-red-400/30 text-red-400 hover:bg-red-400/10"
            >
              Logout
            </button>
          )}

          {!isHome && !isProfile && (
            <button
              onClick={() => {
                const handler = (window as any).ascendbetBack;

                if (typeof handler === "function") {
                  handler();
                } else {
                  router.back();
                }
              }}
              className="text-sm text-muted hover:text-text"
            >
              ← Back
            </button>
          )}

        </div>
      </div>
    </header>
  );
}