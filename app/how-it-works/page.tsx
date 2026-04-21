"use client";

const steps = [
  {
    title: "Join the Season",
    desc: "Enter a 21-day competition and compete against other players.",
    icon: "🚀",
  },
  {
    title: "Start with ₦100,000",
    desc: "Everyone begins with the same virtual balance.",
    icon: "💰",
  },
  {
    title: "Make Smart Picks",
    desc: "You can place up to 3 tickets per day. Discipline matters.",
    icon: "🎯",
  },
  {
    title: "Stay Above Drawdown",
    desc: "Drop below the limit and you can no longer make selections.",
    icon: "⚠️",
  },
  {
    title: "Climb the Leaderboard",
    desc: "Rank based on balance, discipline, and activity.",
    icon: "📈",
  },
  {
    title: "Earn Rewards",
    desc: "Top performers at the end of 21 days receive fixed rewards.",
    icon: "🏆",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">

      {/* 🔥 HERO */}
      <div className="text-center mb-10">
        <h1 className="text-xl font-semibold text-white">
          How AscendBet Works
        </h1>
        <p className="text-sm text-muted mt-2">
          A 21-day competition where discipline beats luck
        </p>
      </div>

      {/* 🚀 STEPS */}
      <div className="space-y-4 mb-12">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex gap-4 items-start rounded-xl border border-border bg-surface p-4"
          >
            <div className="text-2xl">{step.icon}</div>

            <div>
              <h3 className="text-sm font-semibold text-text">
                {step.title}
              </h3>
              <p className="text-xs text-muted mt-1">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 📜 RULES */}
      <div className="mb-12">

        <h2 className="text-xs uppercase tracking-wider text-accent mb-3">
          Rules
        </h2>

        <div className="space-y-3">

          <div className="p-4 rounded-xl bg-[#140a26] border border-purple-500/20">
            <p className="text-sm text-white font-medium">
              Max 3 tickets per day
            </p>
            <p className="text-xs text-muted mt-1">
              Prevents over-participation and rewards discipline.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#140a26] border border-purple-500/20">
            <p className="text-sm text-white font-medium">
              Drawdown limit
            </p>
            <p className="text-xs text-muted mt-1">
              If your balance drops too low, you stop participating for the season.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#140a26] border border-purple-500/20">
            <p className="text-sm text-white font-medium">
              21-day fixed season
            </p>
            <p className="text-xs text-muted mt-1">
              No resets. Your performance is tracked until the end.
            </p>
          </div>

        </div>

      </div>

      {/* 📊 RANKING */}
      <div className="mb-12">

        <h2 className="text-xs uppercase tracking-wider text-accent mb-3">
          How You Are Ranked
        </h2>

        <div className="grid grid-cols-2 gap-3">

          <div className="p-4 bg-[#140a26] rounded-xl text-center">
            <p className="text-[10px] text-muted">Balance</p>
            <p className="text-white font-semibold">Higher is better</p>
          </div>

          <div className="p-4 bg-[#140a26] rounded-xl text-center">
            <p className="text-[10px] text-muted">Discipline</p>
            <p className="text-white font-semibold">Stay consistent</p>
          </div>

          <div className="p-4 bg-[#140a26] rounded-xl text-center">
            <p className="text-[10px] text-muted">Settled Picks</p>
            <p className="text-white font-semibold">Be active</p>
          </div>

          <div className="p-4 bg-[#140a26] rounded-xl text-center">
            <p className="text-[10px] text-muted">Active Days</p>
            <p className="text-white font-semibold">Show up daily</p>
          </div>

        </div>

      </div>

      {/* ⚠️ DISCLAIMER (IMPORTANT ADD) */}
      <div className="mb-10 text-center">
        <p className="text-xs text-muted">
          All balances are virtual and used solely for competition purposes.
        </p>
      </div>

      {/* 🏆 FINAL CTA */}
      <div className="text-center rounded-2xl border border-purple-500/20 
      bg-gradient-to-b from-[#1a0f2e] to-[#0d061a] p-6">

        <h3 className="text-white font-semibold">
          Think you can stay disciplined for 21 days?
        </h3>

        <p className="text-xs text-muted mt-2">
          Compete. Climb. Win.
        </p>

      </div>

    </div>
  );
}