import { create } from "zustand";

interface BackState {
  onBack?: () => void;
  setOnBack: (fn?: () => void) => void;
}

export const useBackStore = create<BackState>((set) => ({
  onBack: undefined,
  setOnBack: (fn) => set({ onBack: fn }),
}));