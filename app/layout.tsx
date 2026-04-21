import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClientLayout } from "@/components/ClientLayout";
import "./globals.css";
import { SeasonGate } from "@/components/SeasonGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AscendBet Season 0",
  description: "Performance-based betting discipline challenge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
  className={`${geistSans.variable} ${geistMono.variable} min-h-screen text-text antialiased
  bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent_40%),radial-gradient(circle_at_bottom,rgba(79,70,229,0.12),transparent_40%),#05010a]`}
>
  <ClientLayout>
    <SeasonGate>
      {children}
    </SeasonGate>
  </ClientLayout>
</body>
    </html>
  );
}
