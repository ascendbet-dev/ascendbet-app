"use client";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted mt-2">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6 text-sm text-muted leading-relaxed">

        {/* INTRO */}
        <section>
          <p>
            AscendBet ("we", "our", "us") respects your privacy and is committed
            to protecting your personal information. This Privacy Policy explains
            how we collect, use, and safeguard your data when you use our platform.
          </p>
        </section>

        {/* DATA COLLECTION */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Information We Collect
          </h2>

          <ul className="list-disc pl-5 space-y-1">
            <li>Account information (e.g. username, email address)</li>
            <li>Authentication data handled via secure providers (e.g. Supabase)</li>
            <li>Platform activity (predictions, performance, leaderboard data)</li>
            <li>Device and usage data (for analytics and performance improvements)</li>
          </ul>
        </section>

        {/* USAGE */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            How We Use Your Information
          </h2>

          <ul className="list-disc pl-5 space-y-1">
            <li>To operate, maintain, and improve the platform</li>
            <li>To manage competition rankings and results</li>
            <li>To enforce platform rules and ensure fair play</li>
            <li>To communicate updates, notifications, and support messages</li>
          </ul>
        </section>

        {/* VIRTUAL SYSTEM */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Virtual Competition System
          </h2>

          <p>
            AscendBet operates using a virtual balance system. All balances and
            performance metrics are used solely for competition ranking and do
            not represent real money or financial accounts.
          </p>
        </section>

        {/* PUBLIC DATA */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Public Competition Data
          </h2>

          <p>
            By participating in challenges, your username, ranking, and
            performance metrics (such as virtual balance and discipline score)
            may be displayed publicly on leaderboards.
          </p>
        </section>

        {/* DATA SHARING */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Data Sharing
          </h2>

          <p>
            We do not sell your personal data. Your information may be shared only
            with trusted third-party services required to operate the platform,
            such as hosting, analytics, and authentication providers.
          </p>
        </section>

        {/* PAYMENTS */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Payments & Rewards
          </h2>

          <p>
            If you participate in challenges that offer rewards, you may be
            required to provide payment details (such as bank account information)
            solely for the purpose of processing payouts. This information is
            handled securely and is not stored longer than necessary.
          </p>
        </section>

        {/* SECURITY */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Data Security
          </h2>

          <p>
            We implement reasonable technical and organizational measures to
            protect your data. However, no system is completely secure, and we
            cannot guarantee absolute security.
          </p>
        </section>

        {/* COOKIES */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Cookies & Tracking
          </h2>

          <p>
            We may use cookies or similar technologies to enhance your experience,
            analyze usage, and improve platform performance.
          </p>
        </section>

        {/* USER RIGHTS */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Your Rights
          </h2>

          <p>
            You have the right to access, correct, or request deletion of your
            personal data. You may contact us at any time to exercise these rights.
          </p>
        </section>

        {/* RETENTION */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Data Retention
          </h2>

          <p>
            We retain your data only for as long as necessary to provide the
            platform and comply with legal obligations.
          </p>
        </section>

        {/* CHANGES */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Changes to This Policy
          </h2>

          <p>
            We may update this Privacy Policy from time to time. Continued use of
            the platform indicates acceptance of any updates.
          </p>
        </section>

        {/* CONTACT */}
        <section>
          <h2 className="text-white font-semibold mb-2">
            Contact
          </h2>

          <p>
            If you have any questions about this Privacy Policy, please contact
            us through the support section of the platform.
          </p>
        </section>

      </div>

    </div>
  );
}