import { create } from "zustand";

interface UserState {
  /** Whether user is a contributor */
  isContributor: boolean;
  /** Set contributor status */
  setIsContributor: (isContributor: boolean) => void;
}

const useUserStore = create<UserState>((set) => ({
  isContributor: false,
  setIsContributor: (isContributor) => set({ isContributor })
}));

export default useUserStore;
