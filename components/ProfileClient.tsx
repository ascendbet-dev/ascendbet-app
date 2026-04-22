"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Headphones,
  Info,
  Shield,
  FileText,
  HelpCircle,
  Bell,
  Lightbulb,
} from "lucide-react";

function formatBalance(n: number) {
  return `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function ProfileClient({
  username,
  seasonJoined,
  balance,
  disciplineScore,
  averageOdds,
  averageStake,
  maxDrawdown,
  progressPercent,
  hasSeason,
  referralCode,
  history,
}: any) {

  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [referralUrl, setReferralUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  /* 🎨 BALANCE COLOR */
  let balanceColor = "text-white";
  if (balance >= 120000) balanceColor = "text-green-400";
  else if (balance <= 88000) balanceColor = "text-red-400";

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) return;
  
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
  
      if (data?.role === "admin") {
        setIsAdmin(true);
      }
    }
  
    checkAdmin();
  }, []);

  useEffect(() => {
    if (!referralCode) return;
  
    setReferralUrl(
      `${window.location.origin}/signup?ref=${referralCode}`
    );
  }, [referralCode]);

  useEffect(() => {
    const handleClick = () => setShowInfo(false);
  
    if (showInfo) {
      window.addEventListener("click", handleClick);
    }
  
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [showInfo]);

  useEffect(() => {
    if (!showInfo) return;
  
    const handleScroll = () => setShowInfo(false);
  
    window.addEventListener("scroll", handleScroll, { passive: true });
  
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showInfo]);

  return (
    <div
  data-scroll-container
  className="space-y-6 pb-10"
>

      {/* 🔥 HEADER */}
      <div className="flex items-center gap-3 mt-2">

        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-white font-bold">
          {username.charAt(0).toUpperCase()}
        </div>

        <div>
          <h1 className="text-lg font-semibold text-white capitalize">
            {username}
          </h1>
          <p className="text-[10px] text-muted">{seasonJoined}</p>
        </div>

      </div>

      {/* 💰 BALANCE */}
      <div className="rounded-2xl p-6 border border-purple-500/20
      bg-gradient-to-b from-[#1a0f2e] to-[#0d061a]">

<div className="flex items-center gap-2 relative">
  
  <p className="text-xs text-muted">Current Capital</p>

  <button
    onClick={(e) => {
      e.stopPropagation();
      setShowInfo((prev) => !prev);
    }}
    className="text-muted hover:text-white transition"
  >
    <Info size={14} />
  </button>

  {/* TOOLTIP */}
  {showInfo && (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute left-0 top-6 z-10 w-72 rounded-lg 
      border border-white/10 
      bg-gradient-to-b from-[#111] to-[#0a0a0a] 
      p-4 text-xs text-muted shadow-xl backdrop-blur"
    >
      <p className="text-white font-medium mb-1">
        Current Capital
      </p>

      <p className="leading-relaxed">
      This is your virtual balance for the competition.
      It updates based on your performance and is used to track your progress throughout the season.
      It does not represent real money and cannot be withdrawn.
      </p>
    </div>
        )}

      </div>

        <h2 className={`text-2xl font-bold mt-1 ${balanceColor}`}>
          {formatBalance(balance)}
        </h2>

      </div>

      {/* 💳 WALLET */}
      <div className="grid grid-cols-2 gap-3">

        <button className="py-3 rounded-lg bg-green-600 text-white text-sm font-semibold">
          Deposit (Coming Soon)
        </button>

        <button className="py-3 rounded-lg border border-green-500 text-green-400 text-sm font-semibold">
          Withdraw (Coming Soon)
        </button>

      </div>

      {/* 📊 STATS */}
      <div className="grid grid-cols-2 gap-3">

        <div className="p-4 bg-[#140a26] rounded-xl text-center">
          <p className="text-[10px] text-muted">Avg Odds</p>
          <p className="text-white font-semibold">
            {averageOdds ? averageOdds.toFixed(2) : "—"}
          </p>
        </div>

        <div className="p-4 bg-[#140a26] rounded-xl text-center">
          <p className="text-[10px] text-muted">Avg Stake</p>
          <p className="text-white font-semibold">
            {averageStake ? formatBalance(averageStake) : "—"}
          </p>
        </div>

        <div className="p-4 bg-[#140a26] rounded-xl text-center col-span-2">
          <p className="text-[10px] text-muted">Max Drawdown</p>
          <p className="text-red-400 font-semibold">
            {formatBalance(maxDrawdown)}
          </p>
        </div>

      </div>

      {/* 🎁 REFERRAL */}
      <div
        onClick={() => {
          if (!referralUrl) return;

          navigator.clipboard.writeText(referralUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="p-4 rounded-xl bg-[#140a26] cursor-pointer active:scale-[0.98] transition"
      >
        <p className="text-xs text-muted mb-2">Referral Link</p>

        <div className="flex justify-between items-center">
           <span className="text-xs text-white truncate">
            {referralCode ? referralUrl : "Generating..."}
          </span>
          <span className="text-xs text-purple-400 hover:text-purple-300">
            {copied ? "Copied!" : "Copy"}
          </span>
        </div>
      </div>

   
        {/* 📊 SEASON HISTORY */}
        <div className="bg-[#140a26] rounded-2xl p-5">

{/* HEADER */}
<div className="flex justify-between items-center mb-4">
  <p className="text-sm text-white font-semibold">
    Season Histories
  </p>

  <Link
    href="/dashboard/history"
    className="text-xs text-purple-400 hover:text-purple-300"
  >
    View More
  </Link>
</div>

{/* TABLE HEADER */}
<div className="grid grid-cols-5 text-[10px] text-muted mb-2 px-2">
  <span className="text-left">Season</span>
  <span className="text-center">Pos</span>
  <span className="text-center">Balance</span>
  <span className="text-center">Bets</span>
  <span className="text-center">Status</span>
</div>

{/* DATA */}
<div className="space-y-2">

  {history && history.length > 0 ? (
    history.map((s: any, index: number) => {

      const status = s.is_disqualified
        ? "Eliminated"
        : s.is_qualified
        ? "Pro"
        : "Contender";

      return (
        <div
          key={index}
          className="grid grid-cols-5 items-center text-xs px-2 py-3 rounded-lg bg-[#0f061c] border border-white/5"
        >

          {/* SEASON */}
          <span className="text-white truncate text-left">
            {s.season_name ?? `Season ${index + 1}`}
          </span>

          {/* POSITION */}
          <span
            className={`
              text-center font-bold
              ${
                s.final_position && s.final_position <= 3
                  ? "text-yellow-400"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
              }
            `}
          >
            #{s.final_position ?? "-"}
          </span>

          {/* BALANCE */}
          <span className="text-green-400 text-center">
            ₦{Number(s.current_balance).toLocaleString()}
          </span>

          {/* BETS */}
          <span className="text-white text-center">
            {s.settled_bet_count ?? 0}
          </span>

          {/* STATUS */}
          <div className="flex justify-center">
            <span
              className={`
                text-[10px] px-2 py-1 rounded-md
                ${
                  status === "Pro"
                    ? "bg-green-500/10 text-green-400"
                    : status === "Eliminated"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-yellow-500/10 text-yellow-400"
                }
              `}
            >
              {status}
            </span>
          </div>

        </div>
      );
    })
  ) : (
    <p className="text-xs text-muted text-center py-4">
      No season history yet
    </p>
  )}

</div>

</div>

      {/* 📋 MENU SECTION */}
      <div className="bg-[#140a26] rounded-xl divide-y divide-white/5">

      <MenuItem
  icon={<FileText size={16} />}
  label="Tickets"
  href="/tickets"
/>

  <MenuItem
    icon={<Headphones size={16} />}
    label="Customer Support"
    href="/support"
  />

  <MenuItem
    icon={<HelpCircle size={16} />}
    label="FAQ"
    href="/faq"
  />

  <MenuItem
    icon={<Info size={16} />}
    label="How It Works"
    href="/how-it-works"
  />

  <MenuItem
    icon={<FileText size={16} />}
    label="Terms & Conditions"
    href="/terms"
  />

  <MenuItem
    icon={<FileText size={16} />}
    label="Privacy Policy"
    href="/privacy"
  />

    {isAdmin && (
      <MenuItem
        icon={<Shield size={16} />}
        label="Admin Dashboard"
        href="/admin"
      />
    )}

  <MenuItem
    icon={<Lightbulb size={16} />}
    label="Share an Idea"
    href="/support"
  />

</div>

      {/* ⚙️ ACTIONS */}
      <div className="space-y-2">

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="w-full py-3 rounded-lg border border-border text-white"
        >
          Logout
        </button>

        <button
          onClick={() => setShowDelete(true)}
          className="w-full py-3 rounded-lg border border-red-400/40 text-red-400"
        >
          Delete Account
        </button>

      </div>

      {/* 🚨 DELETE MODAL */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">

          <div className="bg-[#140a26] p-6 rounded-xl w-full max-w-sm">

            <h3 className="text-white font-semibold mb-2">
              Delete Account
            </h3>

            <p className="text-sm text-muted mb-4">
              This action cannot be undone.
            </p>

            <div className="flex gap-2">

              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 py-2 border border-border rounded-lg text-white"
              >
                Cancel
              </button>

              <button
                className="flex-1 py-2 bg-red-500 rounded-lg text-white"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-border pt-4 text-xs text-muted flex flex-wrap gap-4">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/responsible">Responsible Play</Link>
        <Link href="/support">Support</Link>
      </footer>


    </div>
  );
}

/* 🔹 MENU ITEM */
function MenuItem({ icon, label, href }: any) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 py-3 text-sm text-white hover:bg-white/5 cursor-pointer transition"
    >
      <div className="flex items-center gap-3">
        <span className="text-muted">{icon}</span>
        <span>{label}</span>
      </div>

      <span className="text-muted">›</span>
    </Link>
  );
}