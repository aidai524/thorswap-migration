"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Lock, Clock, TrendingUp } from "lucide-react";
import useUserOperations, {
  type OperationItem
} from "@/hooks/use-user-operations";
import { formatUnits } from "viem";
import { Spinner } from "@/components/ui/spinner";
import dayjs from "@/lib/dayjs";
import duration from "dayjs/plugin/duration";
import { formatNumber } from "@/lib/format-number";

dayjs.extend(duration);

export function StakeUserOperations() {
  const { sortedOperations, isLoading, error } = useUserOperations();

  const getOperationLabel = (item: OperationItem): string => {
    switch (item.type) {
      case "thorLock3m":
        return "3M THOR Lock";
      case "thorLock10m":
        return "10M THOR Lock";
      case "yThorVesting":
        return "yTHOR Vesting";
      case "unstakeRequest":
        return "Unstake Request";
      case "contributorVesting":
        return "Contributor Vesting";
      default:
        return "Unknown";
    }
  };

  const getOperationIcon = (item: OperationItem) => {
    switch (item.type) {
      case "thorLock3m":
      case "thorLock10m":
        return <Lock className="h-3 w-3 text-muted-foreground" />;
      case "yThorVesting":
      case "contributorVesting":
        return <TrendingUp className="h-3 w-3 text-muted-foreground" />;
      case "unstakeRequest":
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getOperationAmount = (item: OperationItem): string => {
    switch (item.type) {
      case "thorLock3m":
      case "thorLock10m":
        return formatNumber(item.data.amount, 2, true) + " METRO";
      case "yThorVesting":
        return formatNumber(item.data.totalAmount, 2, true) + " METRO";
      case "contributorVesting":
        return formatNumber(item.data.totalAmount, 2, true) + " METRO";
      case "unstakeRequest":
        return formatNumber(item.data.amount, 2, true) + " xMETRO";
      default:
        return "0";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="py-8 text-center text-destructive">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedOperations.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            No operation history found
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (durationMs: number): string => {
    const d = dayjs.duration(durationMs);
    const years = d.years();
    const months = d.months();
    const days = d.days();

    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} year${years > 1 ? "s" : ""}`);
    }
    if (months > 0) {
      parts.push(`${months} month${months > 1 ? "s" : ""}`);
    }
    if (days > 0 || parts.length === 0) {
      parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    }

    return parts.join(" ");
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 pb-2">
          {sortedOperations.map((item, index) => {
            const isVesting =
              item.type === "yThorVesting" ||
              item.type === "contributorVesting";
            const vestingData = isVesting ? item.data : null;

            return (
              <div
                key={`${item.type}-${index}`}
                className="flex min-w-[280px] flex-col gap-2 rounded-lg border p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {getOperationAmount(item)}
                    </span>
                    {getOperationIcon(item)}
                    <span className="text-xs text-muted-foreground">
                      {getOperationLabel(item)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {dayjs(item.timestamp).format("MM/DD/YYYY HH:mm:ss")}
                    </span>
                  </div>
                </div>
                {isVesting && vestingData && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Claimed: {formatNumber(vestingData.claimed, 2, true)}{" "}
                      {item.type === "yThorVesting" ? "yTHOR" : "METRO"}
                    </span>
                    <span>
                      Duration: {formatDuration(vestingData.duration)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
