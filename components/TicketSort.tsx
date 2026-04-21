"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type TicketSortType = "latest" | "oldest" | "month";

interface TicketSortProps {
  value: TicketSortType;
  onChange: (value: TicketSortType) => void;
}

export function TicketSort({ value, onChange }: TicketSortProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options: { label: string; value: TicketSortType }[] = [
    { label: "Latest", value: "latest" },
    { label: "Oldest", value: "oldest" },
    { label: "Month", value: "month" },
  ];

  const selected = options.find((o) => o.value === value);

  /* 🔥 CLOSE ON OUTSIDE CLICK */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">

      {/* 🔘 BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition hover:border-accent"
      >
        {selected?.label}

        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* 🔽 DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 z-[999] rounded-xl border border-border bg-[#0d061a]/95 backdrop-blur-md shadow-xl overflow-hidden">

          {/* 🔥 SCROLL AREA */}
          <div className="max-h-40 overflow-y-auto scrollbar-hide scroll-smooth">

            {options.map((opt) => {
              const isActive = opt.value === value;

              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`block w-full px-4 py-3 text-left text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-purple-500/20 text-purple-300"
                        : "text-text hover:bg-white/5"
                    }
                  `}
                >
                  {opt.label}
                </button>
              );
            })}

          </div>
        </div>
      )}
    </div>
  );
}