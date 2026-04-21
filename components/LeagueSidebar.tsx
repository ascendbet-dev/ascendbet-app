"use client";

import { useState } from "react";
import { TOP_LEAGUES, COUNTRIES, COUNTRY_LEAGUES } from "@/lib/league-data";

type Tab = "leagues" | "countries";

interface LeagueSidebarProps {
  selectedLeague: string | null;
  onSelectLeague: (league: string | null) => void;
}

export function LeagueSidebar({ selectedLeague, onSelectLeague }: LeagueSidebarProps) {
  const [tab, setTab] = useState<Tab>("leagues");
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  return (
    <aside className="flex flex-col h-full rounded-xl border border-border bg-surface">
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => {
            setTab("leagues")
            onSelectLeague(null)
          }}
          className={`flex-1 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-[var(--duration-fast)] ${
            tab === "leagues"
              ? "border-b-2 border-accent bg-accent/10 text-text"
              : "text-muted hover:bg-white/5 hover:text-text"
          }`}
        >
          Top Leagues
        </button>
        <button
          type="button"
          onClick={() => setTab("countries")}
          className={`flex-1 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-[var(--duration-fast)] ${
            tab === "countries"
              ? "border-b-2 border-accent bg-accent/10 text-text"
              : "text-muted hover:bg-white/5 hover:text-text"
          }`}
        >
          Top Countries
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide py-2 pb-3 overscroll-none">
        {tab === "leagues" && (
          <ul className="space-y-0.5 px-2 select-none">
            {TOP_LEAGUES.map((league) => (
              <li key={league}>
                <button
                  type="button"
                  onClick={() => onSelectLeague(league)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-[var(--duration-fast)] ${
                    selectedLeague === league
                      ? "bg-accent/20 text-text"
                      : "text-muted hover:bg-white/5 hover:text-text"
                  }`}
                >
                  {league}
                </button>
              </li>
            ))}
          </ul>
        )}

      
        {tab === "countries" && (
          <ul className="space-y-0.5 px-2 select-none">
            {COUNTRIES.map((country) => {
              const isExpanded = expandedCountry === country;
              const leagues = COUNTRY_LEAGUES[country] ?? [];
              return (
                <li key={country}>
                  <button
                    type="button"
                    onClick={() => setExpandedCountry(isExpanded ? null : country)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-[var(--duration-fast)] ${
                      isExpanded ? "bg-accent/15 text-text" : "text-muted hover:bg-white/5 hover:text-text"
                    }`}
                  >
                    <span>{country}</span>
                    <span
                      className={`text-muted transition-transform duration-[var(--duration-fast)] ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {isExpanded && (
                    <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-2">
                      {leagues.map((league) => (
                        <li key={league}>
                          <button
                            type="button"
                            onClick={() => onSelectLeague(league)}
                            className={`w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-all duration-[var(--duration-fast)] ${
                              selectedLeague === league
                                ? "bg-accent/20 text-text"
                                : "text-muted hover:bg-white/5 hover:text-text"
                            }`}
                          >
                            {league}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        </div>
     
    </aside>
  );
}
