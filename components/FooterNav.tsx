"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, LayoutDashboard, Target, Trophy, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/place-bet", label: "Bet", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export function FooterNav() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const open = document.body.getAttribute("data-market-open") === "true";
    setHidden(open);
  }, []);

  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-20 border-t border-border/60 bg-bg-primary/95 backdrop-blur">
       <div className="flex items-center justify-around px-2 py-1.5 select-none">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted transition hover:text-text"
          >
            <Icon className="h-4 w-4" />
            <span className="text-[9px]">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}