"use client";

import { Countdown } from "@/components/Countdown";
import { useRouter } from "next/navigation";
import { Users, Share2, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";


export default function SeasonCard({ season, referralCode }: any) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // 🔥 START NULL (prevents hydration mismatch)
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const update = () => setNow(new Date());

    update(); // run immediately after mount

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const regStart = new Date(season.registration_start);
  const regEnd = new Date(season.registration_end);
  const start = new Date(season.start_date);
  const end = new Date(season.end_date);

  const isRegistrationOpen = now >= regStart && now <= regEnd;
  const isActive = now >= start && now <= end;

  let label = "Starting...";
  let targetDate = season.start_date;

  if (isRegistrationOpen) {
    label = "Starts in";
    targetDate = season.start_date;
  } else if (isActive) {
    label = "Ends in";
    targetDate = season.end_date;
  }

  const handleShare = async () => {
    if (!referralCode) return;

    const url = `${window.location.origin}/signup?ref=${referralCode}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "AscendBet Challenge is ON 🔥",
          text: "This isn’t luck — it’s strategy. Do you think you can compete? Join now and prove it.",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch (err) {
      console.log("SHARE ERROR:", err);
    }
  };

  return (
    <div
      className="relative rounded-2xl p-[1px]
      bg-gradient-to-b from-purple-500/30 via-transparent to-transparent
      hover:from-purple-500/60 transition duration-300 hover:scale-[1.01]"
    >
      <div
        className="relative rounded-2xl p-5 space-y-4
        bg-gradient-to-br from-[#140a26] via-[#1a0f35] to-[#0c061a]
        shadow-[0_25px_80px_rgba(0,0,0,0.9)]
        before:absolute before:inset-0 before:rounded-2xl
        before:bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_60%)]
        after:absolute after:inset-0 after:rounded-2xl
        after:bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.15),transparent_60%)]"
      >
        {/* HEADER */}
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight bg-gradient-to-r from-purple-200 to-white bg-clip-text text-transparent">
              {season.name}
            </h2>

            <div className="flex items-center gap-1 mt-1 text-xs text-white/60">
              <Users size={12} className="text-purple-400" />
              <span suppressHydrationWarning>
                {season.players?.toLocaleString()} players
              </span>
            </div>
          </div>

          {/* LIVE BADGE */}
          <span
            className="relative text-[10px] px-2.5 py-1 rounded-full font-medium
            bg-green-500/10 text-green-400 border border-green-500/30
            shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          >
            LIVE
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
          </span>
        </div>

        {/* TIMER */}
        <div className="relative z-10">
        <p className="text-[11px] text-purple-300 mb-1">
          {now ? label : "Loading..."}
        </p>

          <div className="flex">
            <div className="inline-flex w-fit px-2 py-1 rounded-md bg-white/5 border border-white/10">
              <div className="scale-[0.8] origin-left leading-none w-fit">
                <div className="inline-flex w-fit">
                  <Countdown target={targetDate} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 PROGRESS BAR */}
        <div className="relative z-10">
          <div className="h-[3px] bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 transition-[width] duration-700 ease-out"
              style={{
                width: (() => {
                  if (!now) return "0%"; // SSR safe

                  if (now < start) return "0%";
                  if (now > end) return "100%";

                  const progress =
                    ((now.getTime() - start.getTime()) /
                      (end.getTime() - start.getTime())) *
                    100;

                  return `${progress.toFixed(2)}%`;
                })(),
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />
          </div>
        </div>

        {/* REWARD */}
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-[10px] text-white/50">
              Performance Rewards
            </p>
            <p className="text-sm font-semibold text-purple-400 tracking-tight">
              Unlock Premium Access
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white
            bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500
            shadow-[0_8px_30px_rgba(168,85,247,0.5)]
            hover:scale-[1.05] active:scale-[0.97]
            transition"
          >
            Join for Free
          </button>
        </div>

        {/* BALANCE */}
        <div className="pt-3 border-t border-white/5 space-y-3 relative z-10">
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-[10px] text-white/40">Starting Balance</p>
              <p className="text-white font-semibold">
                ₦{Number(season.starting_balance).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-white/40">Max Drawdown</p>
              <p className="text-red-400 font-semibold">
                ₦{Number(season.drawdown_limit).toLocaleString()}
              </p>
            </div>
          </div>

          {/* ACTION ROW */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 text-xs text-purple-300 hover:text-white transition"
            >
              {open ? "View Less" : "View Challenge Details"}
              <ChevronDown
                size={12}
                className={`transition ${open ? "rotate-180" : ""}`}
              />
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-xs text-purple-300 hover:text-white transition"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>
        </div>

        {/* EXPANDABLE */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-3 rounded-xl bg-white/5 border border-white/10 p-4 space-y-4">
            <div>
              <p className="text-white font-semibold text-sm mb-1">
                How to Participate
              </p>
              <p className="text-xs text-white/70">
                Start with ₦
                {Number(season.starting_balance).toLocaleString()} and grow your
                balance through disciplined betting.
              </p>
            </div>

            <div>
              <p className="text-white font-semibold text-sm mb-1">
                Rules
              </p>
              <ul className="text-xs text-white/70 space-y-1 list-disc pl-4">
                <li>Maximum of 3 bets per day</li>
                <li>Stake: ₦500 – ₦2,000</li>
                <li>Total odds: 1.8 – 6.0</li>
                <li>Minimum pick odds: 1.3</li>
              </ul>
            </div>

            <div>
              <p className="text-white font-semibold text-sm mb-1">
                Rewards
              </p>
              <ul className="text-xs text-white/70 space-y-1 list-disc pl-4">
                <li>Top 5: Premium challenge access</li>
                <li>Early access to paid & private modes</li>
                <li>All participants receive future perks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}