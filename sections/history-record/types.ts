export type OperationItem =
  | {
      type: "thorLock3m";
      amount: string;
      endTime: number;
      widthdrawed: boolean;
    }
  | {
      type: "thorLock10m";
      amount: string;
      endTime: number;
      widthdrawed: boolean;
    }
  | {
      type: "yThorVesting";
      totalAmount: string;
      claimed: string;
      startTime: number;
      duration: number;
    }
  | {
      index: number;
      type: "unstakeRequest";
      amount: string;
      unlockTime: number; // unlockTime
      widthdrawed: boolean;
    }
  | {
      type: "contributorVesting";
      totalAmount: string;
      claimed: string;
      startTime: number;
      duration: number;
    };
