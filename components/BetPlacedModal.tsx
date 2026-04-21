"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  ticketId?: string;
  onClose: () => void;
}

export function BetPlacedModal({ isOpen, ticketId, onClose }: Props) {
  const router = useRouter();

  /* 🔥 AUTO CLOSE */
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (

        /* BACKDROP */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70"
        >

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="w-[85%] max-w-[350px] rounded-2xl border border-white/10 bg-surface/90 backdrop-blur-xl p-6 text-center shadow-2xl"
          >

            {/* SUCCESS ICON */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 300,
              }}
              className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15"
            >
              {/* glow */}
              <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl" />

              <svg
                className="h-8 w-8 text-green-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            {/* TITLE */}
            <h2 className="text-lg font-semibold text-text">
              Bet Placed 🎉
            </h2>

            {/* SUBTEXT */}
            <p className="mt-1 text-sm text-muted">
              Your ticket has been successfully placed
            </p>

            {/* TICKET ID */}
            {ticketId && (
              <div className="mt-4 rounded-xl border border-border bg-bg-primary px-3 py-2 text-sm">
                <p className="text-[11px] text-muted">Ticket ID</p>
                <p className="font-mono text-text tracking-wider">
                  #{ticketId.slice(0, 8)}
                </p>
              </div>
            )}

            {/* ACTIONS */}
            <div className="mt-5 space-y-2">

              <button
                onClick={() => {
                  onClose();
                
                  setTimeout(() => {
                    if (ticketId) {
                      router.push("/tickets");
                    } 
                  }, 100);
                }}
                className="w-full rounded-xl bg-accent py-2 text-sm font-medium text-white hover:opacity-90 transition"
              >
                View Ticket
              </button>

              <button
                onClick={onClose}
                className="w-full rounded-xl border border-border py-2 text-sm font-medium text-text hover:bg-surface transition"
              >
                Close
              </button>

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}