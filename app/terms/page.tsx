"use client";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-white">
          Terms & Conditions
        </h1>
        <p className="text-xs text-muted mt-2">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6 text-sm text-muted leading-relaxed">

        {/* INTRO */}
        <section>
          <p>
            Welcome to AscendBet. By accessing or using the platform, you agree
            to these Terms & Conditions. If you do not agree, please do not use
            the platform.
          </p>
        </section>

        {/* PLATFORM NATURE */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Nature of the Platform
          </h2>
          <p>
            AscendBet is a competitive sports prediction platform where users
            participate in structured challenges using virtual balances.
          </p>
          <p className="mt-2">
            The platform does not facilitate real-money betting or gambling.
            All in-platform balances are virtual and used solely for ranking
            and performance evaluation.
          </p>
        </section>

        {/* ELIGIBILITY */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Eligibility
          </h2>
          <p>
            You must be at least 18 years old to use AscendBet. By using the
            platform, you confirm that you meet this requirement.
          </p>
        </section>

        {/* CHALLENGE RULES */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Challenge Rules
          </h2>

          <ul className="list-disc pl-5 space-y-1">
            <li>Each season lasts 21 days.</li>
            <li>All users start with the same virtual balance.</li>
            <li>Users may be limited to a maximum number of picks per day.</li>
            <li>All rules related to discipline, participation, and scoring must be followed.</li>
            <li>No resets or restarts once a season begins.</li>
          </ul>
        </section>

        {/* VIRTUAL BALANCE */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Virtual Balance
          </h2>

          <p>
            All balances displayed on AscendBet are virtual and have no
            real-world monetary value. These balances are used solely to
            measure performance within a challenge.
          </p>
        </section>

        {/* LEADERBOARD */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Leaderboard & Ranking
          </h2>

          <p>
            Rankings are determined using a combination of performance metrics,
            which may include virtual balance, activity level, consistency,
            and discipline score.
          </p>

          <p className="mt-2">
            AscendBet reserves the right to modify ranking logic at any time
            to maintain fairness and competitive integrity.
          </p>
        </section>

        {/* FAIR USE */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Fair Use & Integrity
          </h2>

          <ul className="list-disc pl-5 space-y-1">
            <li>No multiple accounts or identity manipulation.</li>
            <li>No exploitation of system bugs or loopholes.</li>
            <li>No use of bots, automation, or unfair advantages.</li>
          </ul>

          <p className="mt-2">
            Violation of these rules may result in disqualification, suspension,
            or permanent account removal.
          </p>
        </section>

        {/* REWARDS */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Rewards
          </h2>

          <p>
            At the end of each challenge, top-performing users may receive
            rewards as defined prior to the start of the challenge.
          </p>

          <p className="mt-2">
            All rewards are fixed and determined by AscendBet. Rewards are not
            derived from pooled user funds.
          </p>

          <p className="mt-2">
            AscendBet reserves the right to verify all results and withhold
            rewards in cases of rule violations, suspicious activity, or
            fraudulent behavior.
          </p>
        </section>

        {/* PAID CHALLENGES */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Paid Challenges
          </h2>

          <p>
            AscendBet may offer paid challenges where users pay an access fee
            to participate. This fee grants access to the competition and does
            not represent a wager or stake.
          </p>

          <p className="mt-2">
            Additional terms may apply to paid challenges and will be clearly
            communicated before participation.
          </p>
        </section>

        {/* PAYOUT */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Reward Distribution
          </h2>

          <p>
            Winners may be required to provide valid payment details to claim
            rewards. Rewards are typically processed within a reasonable time
            frame after verification.
          </p>

          <p className="mt-2">
            Failure to claim rewards within the specified period may result in
            forfeiture.
          </p>
        </section>

        {/* LIABILITY */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Limitation of Liability
          </h2>

          <p>
            AscendBet is provided "as is" without warranties of any kind. We
            are not responsible for technical issues, interruptions, or data
            inaccuracies that may affect platform usage.
          </p>
        </section>

        {/* ACCOUNT */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Account Responsibility
          </h2>

          <p>
            You are responsible for maintaining the confidentiality of your
            account. All activities conducted under your account are your
            responsibility.
          </p>
        </section>

        {/* TERMINATION */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Termination
          </h2>

          <p>
            We reserve the right to suspend or terminate accounts that violate
            these Terms or engage in harmful or abusive behavior.
          </p>
        </section>

        {/* CHANGES */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Changes to Terms
          </h2>

          <p>
            These Terms may be updated at any time. Continued use of the
            platform indicates acceptance of any updates.
          </p>
        </section>

        {/* CONTACT */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Contact
          </h2>

          <p>
            For questions regarding these Terms, please contact support through
            the platform.
          </p>
        </section>

      </div>

    </div>
  );
}