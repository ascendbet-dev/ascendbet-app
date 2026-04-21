"use client";

import Link from "next/link";

export function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center min-h-dvh">

      {/* SAME FRAME */}
      <div className="w-full max-w-[420px] min-h-dvh flex flex-col overflow-hidden border-x border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.6)] bg-bg-primary">

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto px-3 py-4 pb-20">
          {children}
        </main>

        {/* FOOTER LINKS (not nav) */}
        <footer className="border-t border-border bg-surface/50 px-3 py-4 mt-auto">
          <div className="flex flex-wrap justify-between gap-y-2 text-xs text-muted">
            <Link href="#">Responsible Gaming</Link>
            <Link href="#">Contact</Link>
            <Link href="#">Support</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
          </div>
        </footer>

      </div>
    </div>
  );
}