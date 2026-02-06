"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/contexts/wallet";
import { xMetroToken } from "@/config/tokens";
import xMetroAbi from "@/config/abi/xmetro";
import Big from "big.js";
import { OperationItem } from "@/sections/history-record/types";

/**
 * Hook return value interface
 */
interface UseUnstakeRequestsReturn {
  /** Unstake requests */
  unstakeRequests: OperationItem[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Withdrawable amount */
  withdrawableAmount: string;
  /** Refresh function */
  refresh: () => Promise<void>;
}

/**
 * Hook for querying unstake request records from xMETRO contract
 * Uses multicall to batch contract queries for efficiency
 *
 * @returns Unstake requests data and related functions
 */
export default function useUnstakeRequests(): UseUnstakeRequestsReturn {
  const { account, publicClient } = useWallet();
  const [unstakeRequests, setUnstakeRequests] = useState<OperationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawableAmount, setWithdrawableAmount] = useState<string>("0");

  /**
   * Query unstake request records
   * First queries count function, then queries detailed data if count > 0
   */
  const fetchUnstakeRequests = useCallback(async () => {
    if (!account?.address || !publicClient) {
      setUnstakeRequests([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contractAddress = xMetroToken.address as `0x${string}`;
      const userAddress = account.address as `0x${string}`;

      // Step 1: Query count function

      const [countResult, cursorResult] = await publicClient.multicall({
        contracts: [
          {
            address: contractAddress,
            abi: xMetroAbi,
            functionName: "unstakeRequestCountFree",
            args: [userAddress]
          },
          {
            address: contractAddress,
            abi: xMetroAbi,
            functionName: "unstakeCursorFree",
            args: [userAddress]
          }
        ],
        allowFailure: false
      });

      const unstakeRequestCount = Number(countResult || 0);

      // Step 2: Query detailed data if count > 0 using multicall
      const detailCalls: any[] = [];

      for (let i = 0; i < unstakeRequestCount; i++) {
        detailCalls.push({
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "unstakeRequestFree",
          args: [userAddress, BigInt(i)]
        });
      }

      // Execute multicall for detailed data
      let detailResults: any[] = [];
      if (detailCalls.length > 0) {
        detailResults = await publicClient.multicall({
          contracts: detailCalls,
          allowFailure: false
        });
      }

      // Parse results
      const unstakeRequestsData: OperationItem[] = [];
      const _withdrawableAmount = Big(0);
      for (let i = 0; i < unstakeRequestCount; i++) {
        const result = detailResults[i];
        if (result) {
          unstakeRequestsData.unshift({
            index: i,
            amount: Big(result.amount)
              .div(10 ** xMetroToken.decimals)
              .toString(),
            unlockTime: Big(result.unlockTime).mul(1000).toNumber(),
            type: "unstakeRequest" as const,
            widthdrawed: i <= Number(cursorResult || 0)
          });
          if (i > Number(cursorResult || 0)) {
            _withdrawableAmount.plus(
              Big(result.amount).div(10 ** xMetroToken.decimals)
            );
          }
        }
      }

      setWithdrawableAmount(_withdrawableAmount.toString());
      setUnstakeRequests(unstakeRequestsData);
    } catch (err: any) {
      console.error("Failed to fetch unstake requests:", err);
      setError(err?.message || "Failed to fetch unstake requests");
      setUnstakeRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, publicClient]);

  // Auto-refresh when dependencies change
  useEffect(() => {
    fetchUnstakeRequests();
  }, [account, publicClient]);

  return {
    unstakeRequests,
    isLoading,
    error,
    withdrawableAmount,
    refresh: fetchUnstakeRequests
  };
}
