"use client";

import { useSeasonStatus } from "@/hooks/useSeasonStatus";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Countdown } from "@/components/Countdown";
import { useEffect, useState } from "react";



export function SeasonGate({ children }: any) {
  const { loading, season, joined, isAdmin, isLoggedIn } = useSeasonStatus();
  const pathname = usePathname();
  const PUBLIC_ROUTES = ["/", "/login", "/signup"];
  const isPublic = PUBLIC_ROUTES.includes(pathname ?? "");
  const router = useRouter();
  const [joining, setJoining] = useState(false);

  const [now, setNow] = useState(Date.now());

  /* 🔥 LIVE TIME (prevents stale UI) */
  useEffect(() => {
    const interval = setInterval(() => {
      setNow((prev) => prev + 1000);
    }, 1000);
  
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    function handleFocus() {
      router.refresh(); // 🔥 refetch everything when user returns
    }
  
    window.addEventListener("focus", handleFocus);
  
    return () => window.removeEventListener("focus", handleFocus);
  }, [router]);

  /* 🔒 PROTECTED ROUTES */
  const protectedRoutes = ["/place-bet", "/dashboard"];

  const isProtected = protectedRoutes.some((route) =>
    pathname?.startsWith(route)
  );

  /* 🔥 BLOCK RENDER UNTIL READY */
  if (isPublic) return children;

  if (loading) return null;
  
  if (!isProtected) return children;
  if (!isLoggedIn) return children;
  if (isAdmin) return children;

  if (!season) {
    return (
      <GateCard
        title="No Active Season"
        label="Next season will be announced soon"
      />
    );
  }

  const seasonEnd = new Date(season.end_date).getTime();

    /* 🔴 SEASON ENDED (TOP PRIORITY) */
    if (now > seasonEnd) {
      return (
        <GateCard
          title="Season Ended. Stay Tuned ✨"
          label="Next season registration opening soon"
        />
      );
    }

  const regStart = new Date(season.registration_start).getTime();
  const regEnd = new Date(season.registration_end).getTime();
  const seasonStart = new Date(season.start_date).getTime();

  /* 🟣 REGISTRATION NOT OPEN */
  if (now < regStart) {
    return <GateCard title="Registration Not Open" label="Opens in" target={season.registration_start} />;
  }

  /* 🔴 REGISTRATION CLOSED */
  if (now > regEnd && !joined) {
    return (
      <GateCard
      title="Registration Closed"
      label="Next season opens in"
      target={season.end_date}
    />
    );
  }

  /* 🟡 REGISTRATION OPEN */
  if (!joined) {
    return (
      <GateCard
        title="Season Registration is Open"
        label="Closes in"
        target={season.registration_end}
        action={
          <button
        onClick={() => joinSeason(router, setJoining)}
        disabled={joining}
        className="mt-5 w-full py-3 rounded-lg bg-accent text-white text-sm font-semibold
        shadow-[0_0_12px_rgba(168,85,247,0.4)]
        disabled:opacity-60"
      >
        {joining ? (
          <span className="animate-pulse">Joining...</span>
        ) : (
          "Join Season"
        )}
      </button>
        }
      />
    );
  }

  /* 🟣 JOINED BUT NOT STARTED */
  if (now < seasonStart) {
    return (
      <GateCard
        title="You’re In 🚀"
        label="Season starts in"
        target={season.start_date}
      />
    );
  }

  /* 🟢 ACTIVE */
  return children;
}

function GateCard({
  title,
  label,
  target,
  action,
}: {
  title: string;
  label?: string;
  target?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm rounded-2xl p-6
        bg-gradient-to-b from-[#1a0f2e] to-[#0d061a]
        border border-purple-500/20 text-center">

        <h2 className="text-white font-semibold mb-2 tracking-wide">{title}</h2>

        {label && (
          <p className="text-xs text-muted mb-4">{label}</p>
        )}

        {target && <Countdown target={target} />}

        {action}
      </div>
    </div>
  );
}

async function joinSeason(router: any, setJoining: any) {
  setJoining(true);

  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/join-season`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    setJoining(false);
    return;
  }

  // 🔥 FORCE FULL STATE RESET
  await new Promise((res) => setTimeout(res, 500));
  router.refresh();
}