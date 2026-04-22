"use client";

import dynamic from "next/dynamic";

const SeasonCard = dynamic(() => import("./SeasonCard"), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] rounded-2xl bg-[#140a26] animate-pulse" />
  ),
});

export default SeasonCard;