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

export const metadata = {
  title: "AscendBet",
  description: "Compete. Climb. Dominate the leaderboard.",
  
  openGraph: {
    title: "AscendBet",
    description: "Compete. Climb. Dominate the leaderboard.",
    url: "https://app.joinascendbet.com",
    siteName: "AscendBet",
    images: [
      {
        url: "https://app.joinascendbet.com/ascendbet-preview.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AscendBet",
    description: "Compete. Climb. Dominate the leaderboard.",
    images: ["https://app.joinascendbet.com/ascendbet-preview.png"],
  },
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
