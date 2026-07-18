import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TipsterSettingsState {
  inactiveTipsters: string[];
  toggleTipster: (tipster: string) => void;
  setTipsterActive: (tipster: string, active: boolean) => void;
}

export const useTipsterSettingsStore = create<TipsterSettingsState>()(
  persist(
    (set) => ({
      inactiveTipsters: [],
      toggleTipster: (tipster) =>
        set((state) => {
          const inactive = state.inactiveTipsters.includes(tipster);
          if (inactive) {
            return { inactiveTipsters: state.inactiveTipsters.filter((t) => t !== tipster) };
          } else {
            return { inactiveTipsters: [...state.inactiveTipsters, tipster] };
          }
        }),
      setTipsterActive: (tipster, active) =>
        set((state) => {
          const inactive = state.inactiveTipsters.includes(tipster);
          if (active && inactive) {
            return { inactiveTipsters: state.inactiveTipsters.filter((t) => t !== tipster) };
          }
          if (!active && !inactive) {
            return { inactiveTipsters: [...state.inactiveTipsters, tipster] };
          }
          return state;
        }),
    }),
    {
      name: "tipster-settings-storage",
    },
  ),
);
