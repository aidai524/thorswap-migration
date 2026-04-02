import { formatNumber } from "@/utils/format-number";
import { OperationItem } from "./types";
import { TrendingUp } from "lucide-react";



export const getOperationIcon = (data: OperationItem) => {
  switch (data.type) {
    case "thorLock3m":
    case "thorLock10m":
      return "";
    case "yThorVesting":
    case "contributorVesting":
      return <TrendingUp className="h-3 w-3 text-muted-foreground" />;
    case "unstakeRequest":
      return null;
    default:
      return null;
  }
};

export const getOperationAmount = (data: OperationItem): string => {
  switch (data.type) {
    case "thorLock3m":
    case "thorLock10m":
      return formatNumber(data.amount, 2, true);
    case "yThorVesting":
      return formatNumber(data.totalAmount, 2, true);
    case "contributorVesting":
      return formatNumber(data.totalAmount, 2, true);
    case "unstakeRequest":
      return formatNumber(data.amount, 2, true);
    default:
      return "0";
  }
};

export const getOperationUnlockTime = (data: OperationItem): number => {
  switch (data.type) {
    case "thorLock3m":
    case "thorLock10m":
      return data.endTime;
    case "yThorVesting":
      return data.startTime;
    case "unstakeRequest":
      return data.unlockTime;
    case "contributorVesting":
      return data.startTime;
    default:
      return 0;
  }
};
