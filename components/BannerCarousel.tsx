"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "@/lib/banners";

type Props = {
  banners: Banner[];
};

export function BannerCarousel({ banners }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners.length) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const banner = banners[index];
  if (!banner) return null;

  return (
    <div className="w-full">

      {banner.type === "registration" ? (
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
          <RegistrationBanner banner={banner} />
        </div>
      ) : (
        <Link href={banner.link || "/"}>
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden cursor-pointer hover:scale-[1.01] transition-all duration-300">
            <DefaultBanner banner={banner} />
          </div>
        </Link>
      )}

      {/* DOTS */}
      {/* <div className="flex justify-center gap-2 mt-3">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition ${
              i === index ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div> */}

    </div>
  );
}

/* ---------------- DEFAULT ---------------- */

function DefaultBanner({ banner }: { banner: Banner }) {
  return (
    <>
      {banner.image ? (
        <Image
          src={banner.image}
          alt={banner.title || `${banner.type} banner`}
          fill
          priority
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#0d061a]" />
      )}
    </>
  );
}

/* ---------------- REGISTRATION ---------------- */

function RegistrationBanner({ banner }: { banner: Banner }) {
  const initialTime = banner.expires_at
    ? getTimeLeft(banner.expires_at)
    : null;

  const isExpired = !initialTime;

  return (
    <>
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        {banner.image && banner.image.trim() !== "" ? (
          <Image
            src={banner.image}
            alt={banner.title || "registration banner"}
            fill
            priority
            className={`object-cover transition-all duration-700 
              ${isExpired ? "scale-105 blur-sm brightness-50" : ""}`}
          />
        ) : (
          <div className="absolute inset-0 bg-[#0d061a]" />
        )}

        {isExpired && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-purple-900/30 to-black/70 backdrop-blur-[2px]" />
        )}
      </div>

      {/* CONTENT */}
      {banner.expires_at && (
        <RegistrationContent
          expiresAt={banner.expires_at}
          banner={banner}
          initialTime={initialTime}
        />
      )}
    </>
  );
}

/* ---------------- CONTENT ---------------- */

function RegistrationContent({
  expiresAt,
  banner,
  initialTime,
}: {
  expiresAt: string;
  banner: Banner;
  initialTime: any;
}) {


  const time = useCountdown(expiresAt, initialTime);

  /* ⏳ ACTIVE */
  if (time) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">

  {/* 🔥 TITLE */}
  {banner.title && (
    <h2 className="text-white text-lg md:text-xl font-semibold tracking-wide mb-8">
      {banner.title}
    </h2>
  )}

  {/* 🔥 COUNTDOWN (CENTER CORE) */}
  <div className="w-[85%] max-w-md mb-8">
    <Countdown time={time} />
  </div>

  {/* 🔥 BUTTON (LOWER + BREATHING SPACE) */}
  {banner.buttonText && (
    <Link href={banner.link || "/"} className="mt-2">
      <span className="px-6 py-2.5 rounded-full text-sm font-medium text-white 
        bg-gradient-to-r from-purple-500 to-indigo-500 
        shadow-[0_0_20px_rgba(168,85,247,0.6)] 
        hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
        {banner.buttonText}
      </span>
    </Link>
  )}

</div>
    );
  }

  /* 🚀 EXPIRED */
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 animate-fade-in">

      <h2 className="text-white text-xl md:text-2xl font-bold tracking-wide 
        drop-shadow-[0_0_20px_rgba(168,85,247,0.9)]">
        Season is Live 🚀
      </h2>

      <p className="text-xs md:text-sm text-purple-200 mt-2 max-w-xs leading-relaxed">
        Registration has closed. Track your progress and climb to the top.
      </p>

      <Link href={banner.link || "/leaderboard"} className="mt-4">
        <span className="px-5 py-2 rounded-full text-sm font-medium text-white 
          bg-gradient-to-r from-purple-500 to-indigo-500 
          shadow-[0_0_20px_rgba(168,85,247,0.6)] 
          hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
          View Leaderboard
        </span>
      </Link>

    </div>
  );
}

/* ---------------- COUNTDOWN ---------------- */

function Countdown({ time }: { time: any }) {
  const items = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 w-full text-white text-center">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center pt-1">
          <p className="text-2xl md:text-3xl font-bold tracking-widest leading-none -mt-1 
            drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]">
            {item.value.toString().padStart(2, "0")}
          </p>
          <p className="text-[8px] uppercase tracking-[0.18em] text-purple-300 mt-1">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- HOOK ---------------- */

function useCountdown(targetDate: string, initial: any) {
  const [time, setTime] = useState(initial);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return time;
}

function getTimeLeft(targetDate: string) {
  const diff =
    new Date(targetDate).getTime() - new Date().getTime();

  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}