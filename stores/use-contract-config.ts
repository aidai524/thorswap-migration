import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Static contract configuration (cached in localStorage)
 * These values don't change frequently
 */
export interface StaticContractConfig {
  cap10M: string;
  cap3M: string;
  capYThor: string;
  deadline10M: string;
  deadline3M: string;
  deadlineYThor: string;
  ratio10M: string;
  ratio3M: string;
  ratioYThor: string;
  migrationStartTime: string;
}

interface ContractConfigState {
  /** Static configuration cached in localStorage */
  staticConfig: StaticContractConfig | null;
  /** Set static configuration */
  setStaticConfig: (config: StaticContractConfig) => void;
  /** Clear static configuration */
  clearStaticConfig: () => void;
}

const useContractConfigStore = create<ContractConfigState>()(
  persist(
    (set) => ({
      staticConfig: null,
      setStaticConfig: (config) => set({ staticConfig: config }),
      clearStaticConfig: () => set({ staticConfig: null })
    }),
    {
      name: "contract-config-storage", // localStorage key
      version: 0.1,
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export default useContractConfigStore;
