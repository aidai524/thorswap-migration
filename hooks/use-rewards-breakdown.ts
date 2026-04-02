"use client";

import { useMemo, useCallback } from "react";
import Big from "big.js";
import useStakeData from "@/hooks/use-stake-data";
import useUserOperations from "@/hooks/use-user-operations";

export interface RewardsBreakdown {
  stakedMetro: string;
  locked10m: string;
  locked3m: string;
  vestedMetro: string;
  isLoading: boolean;
}

export default function useRewardsBreakdown(): RewardsBreakdown & {
  refresh: () => Promise<void>;
} {
  const { stakeData, isLoading: stakeLoading, refetch: refetchStake } =
    useStakeData();
  const {
    sortedOperations,
    isLoading: opsLoading,
    refresh: refreshOps
  } = useUserOperations();

  const breakdown = useMemo((): Omit<RewardsBreakdown, "isLoading"> => {
    let lock3m = Big(0);
    let lock10m = Big(0);
    let vested = Big(0);

    for (const op of sortedOperations) {
      if (op.type === "thorLock3m") {
        lock3m = lock3m.plus(op.data.amount);
      } else if (op.type === "thorLock10m") {
        lock10m = lock10m.plus(op.data.amount);
      } else if (op.type === "yThorVesting") {
        const remaining = Big(op.data.totalAmount).minus(op.data.claimed);
        if (remaining.gt(0)) vested = vested.plus(remaining);
      } else if (op.type === "contributorVesting") {
        const remaining = Big(op.data.totalAmount).minus(op.data.claimed);
        if (remaining.gt(0)) vested = vested.plus(remaining);
      }
    }

    const totalShares = stakeData.totalSharesOf
      ? Big(stakeData.totalSharesOf)
      : Big(0);
    const lockedShares = stakeData.lockedShares
      ? Big(stakeData.lockedShares)
      : Big(0);
    const stakedFlexible = totalShares.minus(lockedShares);
    const stakedMetro = stakedFlexible.gte(0)
      ? stakedFlexible.toString()
      : "0";

    return {
      stakedMetro,
      locked10m: lock10m.toString(),
      locked3m: lock3m.toString(),
      vestedMetro: vested.toString()
    };
  }, [sortedOperations, stakeData]);

  const refresh = useCallback(async () => {
    await Promise.all([refetchStake(), refreshOps()]);
  }, [refetchStake, refreshOps]);

  return {
    ...breakdown,
    isLoading: stakeLoading || opsLoading,
    refresh
  };
}
