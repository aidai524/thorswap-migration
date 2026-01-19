import { create } from "zustand";
import type { ThorPhase, YThorPhase } from "@/lib/types";

interface MigrationState {
  thorPhase: ThorPhase;
  yThorPhase: YThorPhase;
  token: string;
  amount: string;
  set: (params: any) => void;
}

const useMigrationStore = create<MigrationState>((set) => ({
  thorPhase: "10M",
  yThorPhase: "4Y",
  token: "THOR",
  amount: "",
  set: (params) => set(() => ({ ...params }))
}));

export default useMigrationStore;
