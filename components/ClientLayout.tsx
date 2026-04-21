"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { FooterNav } from "./FooterNav";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  return (
    <div className="flex justify-center">

      <div className="w-full max-w-[420px] h-screen flex flex-col overflow-hidden border-x border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.6)]">

        <Header />

        <main
        className={`flex-1 ${
          isLoginPage
            ? "overflow-hidden pb-6"
            : isSignupPage
            ? "overflow-y-auto pb-12"
            : "overflow-y-auto pb-20"
        } scroll-smooth no-scrollbar`}
      >
          {children}
        </main>

        <FooterNav />

      </div>
    </div>
  );
}