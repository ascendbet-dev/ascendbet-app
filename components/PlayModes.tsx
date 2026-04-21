"use client";

import {
  Trophy,
  Wallet,
  Users,
  Target,
  User,
  Gift,
  Play,
  Lock
} from "lucide-react";
import { useState } from "react";

const modes = [
  { name: "Season", icon: Trophy, active: true },
  { name: "Promo", icon: Gift, locked: true },
  { name: "Paid", icon: Wallet, locked: true },
  { name: "Personal", icon: User, locked: true },
  { name: "Private", icon: Users, locked: true },
  { name: "Live", icon: Play, locked: true },
  { name: "Sponsored", icon: Target, locked: true },
];

export function PlayModes() {
  const [toast, setToast] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleClick = (mode: any, e: any) => {
    if (mode.locked) {
      if (toast !== null) return; // prevent spam

      const rect = e.currentTarget.getBoundingClientRect();

      setToast({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });

      setTimeout(() => setToast(null), 1200);
    } else {
      // future navigation
    }
  };

  return (
    <div className="mb-3 -mt-2 relative">

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">

        {modes.map((mode, i) => {
          const Icon = mode.icon;

          return (
            <div
              key={i}
              onClick={(e) => handleClick(mode, e)}
              className={`relative flex flex-col items-center justify-center
              w-[56px] h-[62px] rounded-xl shrink-0
              px-1 py-2 transition-transform duration-200

              ${!mode.locked && "hover:scale-[1.05] active:scale-[0.96]"}

              ${
                mode.active
                  ? "bg-gradient-to-br from-purple-500 to-purple-700 text-white"
                  : "bg-surface/50 border border-white/5"
              }

              ${mode.locked ? "opacity-40" : "opacity-100"}
              `}
            >

              {/* LOCK */}
              {mode.locked && (
                <Lock
                  size={7}
                  className="absolute top-1.5 right-1.5 text-white/40"
                />
              )}

              {/* ICON */}
              <Icon
                size={26}
                className={`mb-[4px] ${
                  mode.active ? "text-white" : "text-white/80"
                }`}
              />

              {/* TEXT */}
              <div className="flex flex-col items-center leading-tight">

                <span
                  className={`text-[9px] font-medium ${
                    mode.active ? "text-white" : "text-white/85"
                  }`}
                >
                  {mode.name}
                </span>

                <span className="text-[6px] mt-[2px] text-white/40 tracking-wide">
                  Challenge
                </span>

              </div>

            </div>
          );
        })}
      </div>

      {/* GLOBAL FLOATING TOAST */}
      {toast && (
        <div
          className="fixed z-[9999] text-[10px] px-3 py-[4px]
          rounded-full bg-black text-white whitespace-nowrap shadow-lg"
          style={{
            left: toast.x,
            top: toast.y - 10,
            transform: "translateX(-50%)",
          }}
        >
          Coming Soon 🚀
        </div>
      )}

      {/* DIVIDER */}
      <div className="mt-3 h-[0.5px] w-full bg-white/5" />

    </div>
  );
}