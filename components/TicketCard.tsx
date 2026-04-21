"use client";

import { ChevronDown, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "./StatusBadge";

type TicketStatus = "won" | "lost" | "pending";

interface Leg {
  fixture_id?: number;
  odds: number;

  market?: string;
  marketLabel?: string;

  selection?: string;
  pickLabel?: string;

  home_team?: string;
  away_team?: string;

  home_goals?: number | null;
  away_goals?: number | null;

  result?: "won" | "lost" | "pending" | "void";
}

interface TicketCardProps {
  ticketId?: string;
  stake: number;
  totalOdds: number;
  potentialReturn: number;
  status: TicketStatus;
  placedAt: string;
  legs?: Leg[];

  expanded: boolean;
  onToggle: () => void;
}

function formatBalance(n: number) {
  return `₦${n.toLocaleString()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function formatMarket(market?: string) {
  if (!market) return "";

  return market
    .replace(/_/g, " ")
    .replace(/\b(\w)/g, (c) => c.toUpperCase());
}

export function TicketCard({
  ticketId,
  stake,
  totalOdds,
  potentialReturn,
  status,
  placedAt,
  legs = [],
  expanded,
  onToggle,
}: TicketCardProps) {

  const isExpandable = legs.length > 0;

  return (
    <motion.div
      layout
      className="rounded-xl border border-border bg-surface/80 backdrop-blur-md shadow-sm hover:shadow-md transition"
    >

      {/* HEADER */}
      <div
        className="cursor-pointer px-3 py-3"
        onClick={onToggle}
      >

        {/* TOP ROW */}
        <div className="flex items-center justify-between">

          {/* LEFT: ID + DATE INLINE */}
          <div className="flex items-center gap-2 text-[11px] text-muted">

            <span className="font-medium text-text">
              #{ticketId?.slice(0,6)}
            </span>

            <span className="opacity-50">•</span>

            <span>{formatDate(placedAt)}</span>

          </div>

          {/* STATUS */}
          <StatusBadge status={status} />

        </div>

        {/* MAIN GRID */}
        <div className="mt-2 grid grid-cols-3 gap-2">

          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted/70">
              Stake
            </p>
            <p className="text-[13px] font-semibold text-text">
              {formatBalance(stake)}
            </p>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted/70">
              Odds
            </p>
            <p className="text-[13px] font-semibold text-text">
              {(totalOdds ?? 0).toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted/70">
              Return
            </p>
            <p className="text-[13px] font-semibold text-text">
              {formatBalance(potentialReturn)}
            </p>
          </div>

        </div>

        {/* FOOTER ROW */}
        <div className="mt-2 flex items-center justify-between">

          <span className="text-[10px] text-muted">
            • {legs.length > 1 ? `${legs.length} picks` : "Single"}
          </span>

          {isExpandable && (
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted" />
            </motion.div>
          )}

        </div>

      </div>

      {/* EXPANDED */}
      <AnimatePresence initial={false}>
        {expanded && legs.length > 0 && (

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >

            <div className="px-3 py-3">

              <ul className="space-y-2">

                {legs.map((leg, i) => {

                  const pick = leg.pickLabel ?? leg.selection ?? "";

                  const market =
                    leg.marketLabel ?? formatMarket(leg.market);

                  const match =
                    leg.home_team && leg.away_team
                      ? `${leg.home_team} vs ${leg.away_team}`
                      : "Fixture";

                  const scoreVisible =
                    leg.home_goals !== null &&
                    leg.away_goals !== null;

                  const score = scoreVisible
                    ? `[ ${leg.home_goals} - ${leg.away_goals} ]`
                    : null;

                  const resultIcon =
                    leg.result === "won" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : leg.result === "lost" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : null;

                  const resultColor =
                    leg.result === "won"
                      ? "text-green-400"
                      : leg.result === "lost"
                      ? "text-red-400"
                      : "text-text";

                  return (

                    <motion.li
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="rounded-lg border border-border bg-bg-primary px-2.5 py-2"
                    >

                      <div className="flex items-center justify-between gap-2">

                        {/* LEFT */}
                        <div className="flex flex-col">

                          <span className={`text-[12px] font-semibold ${resultColor}`}>
                            {pick}
                          </span>

                          <span className="text-[10px] text-muted">
                            {market}
                          </span>

                          <span className="text-[10px] text-muted mt-0.5">
                            {match}
                            {score && (
                              <span className="ml-1 text-text">
                                {score}
                              </span>
                            )}
                          </span>

                        </div>

                        {/* RIGHT */}
                        <div className="flex items-center gap-2">

                          <span className="text-[12px] font-semibold text-text">
                            {leg.odds.toFixed(2)}
                          </span>

                          {resultIcon}

                        </div>

                      </div>

                    </motion.li>

                  );
                })}

              </ul>

            </div>

          </motion.div>

        )}
      </AnimatePresence>

    </motion.div>
  );
}