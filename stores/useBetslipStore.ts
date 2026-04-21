import { create } from "zustand";
import type { BetSelection } from "@/lib/place-bet-types";

interface BetslipState {
  selections: BetSelection[];
  userId: string | null;
  ready: boolean; // 🔥 NEW

  setUser: (userId: string | null) => void;

  addSelection: (selection: BetSelection) => void;
  removeSelection: (selection: BetSelection) => void;
  removeByIndex: (idx: number) => void;
  clear: () => void;
  setSelections: (selections: BetSelection[]) => void;
}

export const useBetslipStore = create<BetslipState>((set, get) => ({
  selections: [],
  userId: null,
  ready: false, // 🔥 NEW

  /* 🔥 SET USER + RESTORE DATA */
  setUser: (userId) => {
    if (!userId) {
      set({ selections: [], userId: null, ready: true }); // 🔥 important
      return;
    }

    const saved = localStorage.getItem(`ascendbet_betslip_${userId}`);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          set({ selections: parsed, userId, ready: true }); // 🔥 important
          return;
        }
      } catch {
        localStorage.removeItem(`ascendbet_betslip_${userId}`);
      }
    }

    set({ selections: [], userId, ready: true }); // 🔥 important
  },

  /* 🔥 ADD */
  addSelection: (selection) => {
    set((state) => {
      const current = state.selections;

      const existingIndex = current.findIndex(
        s =>
          s.fixture_id === selection.fixture_id &&
          s.market === selection.market
      );

      let updated: BetSelection[];

      if (
        existingIndex !== -1 &&
        current[existingIndex].pick === selection.pick
      ) {
        updated = current.filter((_, i) => i !== existingIndex);
      } else if (existingIndex !== -1) {
        updated = [...current];
        updated[existingIndex] = selection;
      } else {
        updated = [...current, selection];
      }

      const userId = get().userId;
      if (userId) {
        localStorage.setItem(
          `ascendbet_betslip_${userId}`,
          JSON.stringify(updated)
        );
      }

      return { selections: updated };
    });
  },

  /* 🔥 REMOVE SELECTION */
  removeSelection: (selection) => {
    set((state) => {
      const updated = state.selections.filter(
        s =>
          !(
            s.fixture_id === selection.fixture_id &&
            s.market === selection.market &&
            s.pick === selection.pick
          )
      );

      const userId = get().userId;
      if (userId) {
        localStorage.setItem(
          `ascendbet_betslip_${userId}`,
          JSON.stringify(updated)
        );
      }

      return { selections: updated };
    });
  },

  /* 🔥 REMOVE BY INDEX */
  removeByIndex: (idx) => {
    set((state) => {
      const updated = state.selections.filter((_, i) => i !== idx);

      const userId = get().userId;
      if (userId) {
        localStorage.setItem(
          `ascendbet_betslip_${userId}`,
          JSON.stringify(updated)
        );
      }

      return { selections: updated };
    });
  },

  /* 🔥 CLEAR */
  clear: () => {
    const userId = get().userId;

    if (userId) {
      localStorage.removeItem(`ascendbet_betslip_${userId}`);
    }

    set({ selections: [] });
  },

  /* 🔥 FORCE SET */
  setSelections: (selections) => {
    const userId = get().userId;

    if (userId) {
      localStorage.setItem(
        `ascendbet_betslip_${userId}`,
        JSON.stringify(selections)
      );
    }

    set({ selections });
  },
}));