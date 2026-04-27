"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Countdown({ target }: { target: string }) {
  const router = useRouter();

  const [time, setTime] = useState({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
    done: false,
  });

  useEffect(() => {
    let refreshed = false; // 🔥 prevent multiple refresh

    function update() {
      const parsedTarget = new Date(target.replace(" ", "T")).getTime();
      const diff = parsedTarget - Date.now();

      if (diff <= 0) {
        setTime({ d: 0, h: 0, m: 0, s: 0, done: true });

        // 🔥 AUTO REFRESH ONCE
        if (!refreshed) {
          refreshed = true;
          router.refresh();
        }

        return;
      }

      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor(diff / 3600000) % 24,
        m: Math.floor(diff / 60000) % 60,
        s: Math.floor(diff / 1000) % 60,
        done: false,
      });
    }

    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [target, router]);

  if (time.done) {
    return <p className="text-sm text-muted">Starting...</p>;
  }

  return (
    <div className="w-full flex justify-center">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {["d", "h", "m", "s"].map((k) => (
          <div
            key={k}
            className="
              flex flex-col items-center justify-center
              w-12 h-12 sm:w-14 sm:h-14
              rounded-lg
              bg-[#140a26]
              border border-purple-500/20
              shadow-[0_0_10px_rgba(168,85,247,0.2)]
            "
          >
            <span className="text-sm sm:text-base font-semibold text-white">
              {time[k as keyof typeof time]}
            </span>
  
            <span className="text-[9px] sm:text-[10px] text-muted uppercase">
            { k === "d" ? "D" : k === "h" ? "H" : k === "m" ? "M" : "S" }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}