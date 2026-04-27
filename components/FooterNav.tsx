"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Target,
  Trophy,
  User,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/place-bet", label: "Bet", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export function FooterNav() {
  const [hidden, setHidden] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const open = document.body.getAttribute("data-market-open") === "true";
    setHidden(open);
  }, []);

  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-20 border-t border-border/60 bg-bg-primary/95 backdrop-blur">
      <div className="flex items-center justify-around px-2 py-1.5 select-none">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isBet = href === "/place-bet";
          const isActive = pathname === href;

          return (
            <button
              key={href}
              onClick={() => {
                if (isBet) {
                  router.push("/place-bet?fresh=1"); // 🔥 reset entry state
                } else {
                  router.push(href);
                }
              }}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1 transition relative
                ${isActive ? "text-white" : "text-muted"}
              `}
            >
              <Icon
                className={`h-4 w-4 transition ${
                  isActive ? "text-purple-400 scale-110" : "text-muted"
                }`}
              />
              <span className="text-[9px]">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}