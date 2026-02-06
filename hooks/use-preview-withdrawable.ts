"use client";

import { useState, useEffect, useCallback } from "react";
import { formatUnits } from "viem";
import { xMetroToken } from "@/config/tokens";
import { useWallet } from "@/contexts/wallet";
import xMetroAbi from "@/config/abi/xmetro";

/**
 * Withdrawable amounts state
 */
export interface WithdrawableAmounts {
  thor: string;
  ythor: string;
  contributor: string;
}

/**
 * Hook return value interface
 */
interface UsePreviewWithdrawableReturn {
  /** Withdrawable amounts for each type */
  withdrawableAmounts: WithdrawableAmounts;
  /** Loading state for fetching amounts */
  isLoadingAmounts: boolean;
  /** Refresh withdrawable amounts */
  refreshAmounts: () => Promise<void>;
}

/**
 * Hook for previewing withdrawable amounts using previewWithdrawableNow
 */
export default function usePreviewWithdrawable(): UsePreviewWithdrawableReturn {
  const { account, publicClient } = useWallet();
  const [withdrawableAmounts, setWithdrawableAmounts] =
    useState<WithdrawableAmounts>({
      thor: "0",
      ythor: "0",
      contributor: "0"
    });
  const [isLoadingAmounts, setIsLoadingAmounts] = useState(false);

  /**
   * Fetch withdrawable amounts from contract using previewWithdrawableNow
   */
  const fetchWithdrawableAmounts = useCallback(async () => {
    if (!account?.address || !publicClient) {
      return;
    }

    setIsLoadingAmounts(true);
    try {
      // Fetch THOR, yTHOR, and Contributor amounts from previewWithdrawableNow
      const previewResult = await publicClient.readContract({
        address: xMetroToken.address as `0x${string}`,
        abi: xMetroAbi,
        functionName: "previewWithdrawableNow",
        args: [account.address as `0x${string}`]
      });

      const [thorUnlockable, yThorUnlockable, contributorUnlockable] =
        previewResult as [bigint, bigint, bigint, bigint];

      setWithdrawableAmounts({
        thor: formatUnits(thorUnlockable, 18),
        ythor: formatUnits(yThorUnlockable, 18),
        contributor: formatUnits(contributorUnlockable, 18)
      });
    } catch (err) {
      console.error("Failed to fetch withdrawable amounts:", err);
    } finally {
      setIsLoadingAmounts(false);
    }
  }, [account?.address, publicClient]);

  // Fetch amounts when account or publicClient changes
  useEffect(() => {
    fetchWithdrawableAmounts();
  }, [account, publicClient]);

  return {
    withdrawableAmounts,
    isLoadingAmounts,
    refreshAmounts: fetchWithdrawableAmounts
  };
}
