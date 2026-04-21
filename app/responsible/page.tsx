"use client";

export default function ResponsiblePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-white">
          Responsible Play
        </h1>
        <p className="text-sm text-muted mt-2">
          Compete with discipline. Stay in control.
        </p>
      </div>

      <div className="space-y-6 text-sm text-muted leading-relaxed">

        {/* INTRO */}
        <section>
          <p>
            AscendBet is built around discipline, consistency, and smart
            decision-making. While our platform uses virtual balances in a
            competitive environment, we encourage all users to participate
            responsibly and maintain full control of their decisions.
          </p>
        </section>

        {/* PHILOSOPHY */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Our Philosophy
          </h2>

          <ul className="list-disc pl-5 space-y-1">
            <li>Discipline over luck</li>
            <li>Consistency over short-term wins</li>
            <li>Control over impulsive decisions</li>
          </ul>
        </section>

        {/* GUIDELINES */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Responsible Participation Guidelines
          </h2>

          <ul className="list-disc pl-5 space-y-2">
            <li>Participate for competition and entertainment</li>
            <li>Avoid making impulsive or emotional decisions</li>
            <li>Follow structured strategies and discipline rules</li>
            <li>Take breaks when needed</li>
            <li>Know when to stop</li>
          </ul>
        </section>

        {/* WARNING SIGNS */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Warning Signs of Unhealthy Behavior
          </h2>

          <ul className="list-disc pl-5 space-y-2">
            <li>Feeling pressure to constantly participate</li>
            <li>Making decisions based on emotions rather than strategy</li>
            <li>Spending excessive time thinking about results</li>
            <li>Difficulty stepping away from the platform</li>
          </ul>
        </section>

        {/* SAFEGUARDS */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Platform Safeguards
          </h2>

          <ul className="list-disc pl-5 space-y-2">
            <li>Daily participation limits</li>
            <li>Drawdown controls to limit excessive losses</li>
            <li>Structured challenge format (21-day seasons)</li>
          </ul>

          <p className="mt-2">
            These rules are designed to promote discipline, fairness,
            and long-term consistency.
          </p>
        </section>

        {/* SUPPORT */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Need Support?
          </h2>

          <p>
            If you feel your habits are becoming difficult to manage,
            we encourage you to take a break and seek support from
            trusted professionals or organizations in your region.
          </p>
        </section>

        {/* DISCLAIMER */}
        <section>
          <p className="text-xs">
            AscendBet does not provide real-money betting services.
            All balances are virtual and used solely for competition ranking.
          </p>
        </section>

        {/* FINAL NOTE */}
        <section>
          <div className="rounded-xl border border-purple-500/20 
          bg-gradient-to-b from-[#1a0f2e] to-[#0d061a] p-5 text-center">

            <p className="text-white font-medium">
              Discipline is your greatest edge.
            </p>

            <p className="text-xs text-muted mt-2">
              Stay consistent. Stay in control.
            </p>

          </div>
        </section>

      </div>

    </div>
  );
}