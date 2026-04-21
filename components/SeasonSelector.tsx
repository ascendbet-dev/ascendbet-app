"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";

interface Season {
  id: string;
  name: string;
}

interface SeasonSelectorProps {
  seasons: Season[];
  currentSeasonId: string;
  onChange: (seasonId: string) => void;
}

export function SeasonSelector({
  seasons,
  currentSeasonId,
  onChange,
}: SeasonSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const currentSeason = seasons.find(
    (s) => s.id === currentSeasonId
  );

  /* 🔍 FILTERED SEASONS */
  const filteredSeasons = useMemo(() => {
    if (!query) return seasons;

    return seasons.filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [seasons, query]);

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

  /* 🔥 AUTO SCROLL TO SELECTED */
  useEffect(() => {
    if (!open || !listRef.current) return;

    const activeEl = listRef.current.querySelector(
      `[data-active="true"]`
    );

    if (activeEl) {
      activeEl.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [open, filteredSeasons]);

  return (
    <div ref={ref} className="relative w-full">

      {/* 🔘 BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text transition hover:border-accent"
      >
        <span>{currentSeason?.name || "No Season"}</span>

        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* 🔽 DROPDOWN */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-[#0d061a]/95 backdrop-blur-md shadow-xl overflow-hidden">

          {/* 🔍 SEARCH */}
          <div className="px-3 py-2 border-b border-white/5">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <Search size={14} className="text-muted" />
              <input
                type="text"
                placeholder="Search seasons..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent outline-none text-sm text-white placeholder:text-muted w-full"
              />
            </div>
          </div>

          {/* 🔥 SCROLL AREA */}
          <div
            ref={listRef}
            className="max-h-40 overflow-y-auto scrollbar-hide scroll-smooth"
          >
            {filteredSeasons.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted">
                No seasons found
              </p>
            ) : (
              filteredSeasons.map((season) => {
                const isActive = season.id === currentSeasonId;

                return (
                  <button
                    key={season.id}
                    data-active={isActive}
                    onClick={() => {
                      onChange(season.id);
                      setOpen(false);
                      setQuery(""); // reset search
                    }}
                    className={`block w-full px-4 py-3 text-left text-sm font-medium transition
                      ${
                        isActive
                          ? "bg-purple-500/20 text-purple-300"
                          : "text-text hover:bg-white/5"
                      }
                    `}
                  >
                    {season.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}