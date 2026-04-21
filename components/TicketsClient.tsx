"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TicketCard } from "@/components/TicketCard";
import { TicketTabs } from "@/components/TicketTabs";
import { SeasonSelector } from "@/components/SeasonSelector";
import { SettledFilter } from "@/components/SettledFilter";
import { TicketSort } from "@/components/TicketSort";

type TicketStatus = "won" | "lost" | "pending";

interface Ticket {
  id: string;
  stake: number;
  status: TicketStatus;
  placed_at: string;
  totalOdds: number;
  potentialReturn: number;
  legs: any[];
}

export default function TicketsClient({
  seasons,
  defaultSeasonId,
  tickets,
}: any) {

  const [activeTab, setActiveTab] =
    useState<"pending" | "settled">("pending");

  const [filter, setFilter] =
    useState<"all" | "won" | "lost">("all");

  const [sort, setSort] =
    useState<"latest" | "oldest" | "month">("latest");

  const [seasonId, setSeasonId] =
    useState(defaultSeasonId);

  const [liveTickets, setLiveTickets] = useState<Ticket[]>(tickets);
  const [loading, setLoading] = useState(false);

  const [expandedTicket, setExpandedTicket] =
    useState<string | null>(null);

  /* FETCH TICKETS */
  useEffect(() => {
    if (!seasonId) return;

    async function fetchTickets() {
      try {
        setLoading(true);

        const res = await fetch(`/api/tickets?seasonId=${seasonId}`);
        const data = await res.json();

        setLiveTickets(data.tickets || []);
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [seasonId]);

  /* FILTERING */

  const pendingTickets = useMemo(
    () => liveTickets.filter((t: Ticket) => t.status === "pending"),
    [liveTickets]
  );

  const settledTickets = useMemo(() => {

    let result = liveTickets.filter(
      (t: Ticket) => t.status === "won" || t.status === "lost"
    );

    if (filter === "won")
      result = result.filter((t: Ticket) => t.status === "won");

    if (filter === "lost")
      result = result.filter((t: Ticket) => t.status === "lost");

    if (sort === "latest")
      result.sort(
        (a: Ticket, b: Ticket) =>
          new Date(b.placed_at).getTime() -
          new Date(a.placed_at).getTime()
      );

    if (sort === "oldest")
      result.sort(
        (a: Ticket, b: Ticket) =>
          new Date(a.placed_at).getTime() -
          new Date(b.placed_at).getTime()
      );

    return result;

  }, [liveTickets, filter, sort]);

  const displayedTickets =
    activeTab === "pending"
      ? pendingTickets
      : settledTickets;

  return (

    <div className="flex flex-col h-full">

      {/* 🔥 FIXED TOP SECTION */}
      <div className="flex-shrink-0 space-y-3">

        <SeasonSelector
          seasons={seasons}
          currentSeasonId={seasonId}
          onChange={setSeasonId}
        />

        <TicketTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          pendingCount={pendingTickets.length}
          settledCount={settledTickets.length}
        />

        {activeTab === "settled" && (
          <div className="flex items-center justify-between">
            <SettledFilter
              activeFilter={filter}
              onChange={setFilter}
            />

            <TicketSort
              value={sort}
              onChange={setSort}
            />
          </div>
        )}

      </div>

      {/* 🔥 SCROLLABLE TICKETS ONLY */}
      <div className="flex-1 overflow-y-auto relative scrollbar-hide mt-3 space-y-3 pr-1 pb-6">

        {loading ? (

          <div className="flex items-center justify-center py-10">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-sm text-muted"
            >
              Loading tickets...
            </motion.div>
          </div>

        ) : displayedTickets.length === 0 ? (

          <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur p-6 text-center text-muted">
            No tickets found.
          </div>

        ) : (

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            className="space-y-3"
          >

            {displayedTickets.map((ticket: Ticket) => (

              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >

                <TicketCard
                  ticketId={ticket.id}
                  stake={ticket.stake}
                  totalOdds={ticket.totalOdds}
                  potentialReturn={ticket.potentialReturn}
                  status={ticket.status}
                  placedAt={ticket.placed_at}
                  legs={ticket.legs}
                  expanded={expandedTicket === ticket.id}
                  onToggle={() =>
                    setExpandedTicket(
                      expandedTicket === ticket.id
                        ? null
                        : ticket.id
                    )
                  }
                />

              </motion.div>

            ))}

          </motion.div>

        )}

      </div>

    </div>

  );
}