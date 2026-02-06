import { formatNumber } from "@/utils/format-number";
import { OperationItem } from "./types";
import { Lock, Clock, TrendingUp } from "lucide-react";

export const getOperationLabel = (data: OperationItem): string => {
  switch (data.type) {
    case "thorLock3m":
      return "3M THOR Lock";
    case "thorLock10m":
      return "10M THOR Lock";
    case "yThorVesting":
      return "yTHOR Vesting";
    case "unstakeRequest":
      return "";
    case "contributorVesting":
      return "Contributor Vesting";
    default:
      return "Unknown";
  }
};

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
      return formatNumber(data.amount, 2, true) + " METRO";
    case "yThorVesting":
      return formatNumber(data.totalAmount, 2, true) + " METRO";
    case "contributorVesting":
      return formatNumber(data.totalAmount, 2, true) + " METRO";
    case "unstakeRequest":
      return formatNumber(data.amount, 2, true) + " METRO";
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
