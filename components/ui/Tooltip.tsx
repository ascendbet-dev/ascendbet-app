"use client";

import { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";
import { createPortal } from "react-dom";

let activeTooltip: (() => void) | null = null;

export default function Tooltip({
  title,
  content,
  direction = "auto",
}: {
  title: string;
  content: string;
  direction?: "auto" | "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    translateX: "-50%",
  });

  const btnRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    activeTooltip = null;
  };

  const calculatePosition = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;

    const tooltipWidth = 220;
    const padding = 10;

    let left = rect.left + rect.width / 2;
    let translateX = "-50%";

    if (direction === "left") {
      translateX = "-100%";
    } else if (direction === "right") {
      translateX = "0%";
    }

    const half = tooltipWidth / 2;

    // 🔥 ALWAYS CLAMP TO VIEWPORT (most reliable)
    if (direction === "auto") {
      if (left - half < padding) {
        left = padding;
        translateX = "0%";
      } else if (left + half > window.innerWidth - padding) {
        left = window.innerWidth - padding;
        translateX = "-100%";
      }
    } else {
      // still clamp but don’t override direction
      if (left < padding) left = padding;
      if (left > window.innerWidth - padding) left = window.innerWidth - padding;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const isBottom = spaceBelow > 100;

    const top = isBottom
  ? rect.bottom + 6   // tighter
  : rect.top - 6;

    setCoords({ top, left, translateX });
  };

  const handleToggle = (e: any) => {
    e.stopPropagation();

    if (open) {
      close();
      return;
    }

    if (activeTooltip && activeTooltip !== close) {
      activeTooltip();
    }

    activeTooltip = close;

    setOpen(true);
  };

  /* 🔥 CRITICAL: calculate AFTER render */
  useEffect(() => {
    if (!open) return;

    const id = requestAnimationFrame(() => {
      calculatePosition();
    });

    return () => cancelAnimationFrame(id);
  }, [open]);

  /* outside click */
  useEffect(() => {
    const handleClick = () => close();

    if (open) window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [open]);

  /* scroll */
  useEffect(() => {
    if (!open) return;

    const handleScroll = () => close();

    const scrollables = document.querySelectorAll("[data-scroll-container]");

    scrollables.forEach((el) =>
      el.addEventListener("scroll", handleScroll)
    );

    window.addEventListener("scroll", handleScroll);

    return () => {
      scrollables.forEach((el) =>
        el.removeEventListener("scroll", handleScroll)
      );
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  /* resize */
  useEffect(() => {
    const handleResize = () => close();

    if (open) window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  return (
    <>
      {/* ICON */}
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="text-muted hover:text-white transition"
      >
        <Info size={12} />
      </button>

      {/* TOOLTIP */}
      {open &&
  createPortal(
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        transform: `translateX(${coords.translateX})`,
        zIndex: 9999,
        pointerEvents: "auto", // 🔥 important
      }}
      className="w-[220px] rounded-lg border border-white/10 bg-[#0f0f0f] p-3 text-xs text-muted shadow-md"
    >
      <div
  className={`absolute -top-1 w-2 h-2 bg-[#0f0f0f] rotate-45 border-l border-t border-white/10 ${
    coords.translateX === "-50%"
      ? "left-1/2 -translate-x-1/2"
      : coords.translateX === "-100%"
      ? "right-4"
      : "left-4"
  }`}
/>

      <p className="text-white text-sm font-semibold mb-1">
        {title}
      </p>

      <p className="leading-relaxed">
        {content}
      </p>
    </div>,
    document.body
  )}
    </>
  );
}