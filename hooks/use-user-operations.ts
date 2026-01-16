"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/contexts/wallet";
import { ThorToken, YThorToken, xMetroToken } from "@/config/tokens";
import xMetroAbi from "@/config/abi/xmetro";
import useUserStore from "@/stores/use-user";
import Big from "big.js";

/**
 * ThorLock structure from contract
 */
export interface ThorLock {
  amount: string;
  endTime: number;
  type: "thorLock3m" | "thorLock10m";
}

/**
 * VestingSchedule structure from contract
 */
export interface VestingSchedule {
  totalAmount: string;
  claimed: string;
  startTime: number;
  duration: number;
  type: "yThorVesting" | "contributorVesting";
}

/**
 * UnstakeRequest structure from contract
 */
export interface UnstakeRequest {
  amount: string;
  unlockTime: number;
  type: "unstakeRequest";
}

/**
 * User operations data structure
 */
export interface UserOperations {
  /** 3-month THOR locks */
  thorLocks3m: ThorLock[];
  /** 10-month THOR locks */
  thorLocks10m: ThorLock[];
  /** yTHOR vesting schedules */
  yThorVesting: VestingSchedule[];
  /** Unstake requests */
  unstakeRequests: UnstakeRequest[];
  /** Contributor vesting schedules */
  contributorVesting: VestingSchedule[];
}

/**
 * Unified operation item type for sorted list
 */
export type OperationItem =
  | {
      type: "thorLock3m";
      data: ThorLock;
      timestamp: number; // endTime
    }
  | {
      type: "thorLock10m";
      data: ThorLock;
      timestamp: number; // endTime
    }
  | {
      type: "yThorVesting";
      data: VestingSchedule;
      timestamp: number; // startTime
    }
  | {
      type: "unstakeRequest";
      data: UnstakeRequest;
      timestamp: number; // unlockTime
    }
  | {
      type: "contributorVesting";
      data: VestingSchedule;
      timestamp: number; // startTime
    };

/**
 * Hook return value interface
 */
interface UseUserOperationsReturn {
  /** All operations sorted by timestamp in descending order (newest first) */
  sortedOperations: OperationItem[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Refresh function */
  refresh: () => Promise<void>;
}

/**
 * Hook for querying user operation records from xMETRO contract
 * Uses multicall to batch contract queries for efficiency
 *
 * @returns User operations data and related functions
 *
 * @example
 * ```tsx
 * const { operations, isLoading, refresh } = useUserOperations();
 *
 * useEffect(() => {
 *   refresh();
 * }, [refresh]);
 * ```
 */
export default function useUserOperations(): UseUserOperationsReturn {
  const { account, publicClient } = useWallet();
  const { isContributor } = useUserStore();
  const [sortedOperations, setSortedOperations] = useState<OperationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Query user operation records
   * First queries count functions, then queries detailed data if count > 0
   */
  const fetchUserOperations = useCallback(async () => {
    if (!account?.address || !publicClient) {
      setSortedOperations([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contractAddress = xMetroToken.address as `0x${string}`;
      const userAddress = account.address as `0x${string}`;

      // Step 1: Query all count functions using multicall
      const countCalls: any[] = [
        {
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "thorLocks3mCount",
          args: [userAddress]
        },
        {
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "thorLocks10mCount",
          args: [userAddress]
        },
        {
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "yThorVestingCount",
          args: [userAddress]
        },
        {
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "unstakeRequestCount",
          args: [userAddress]
        }
      ];

      // Only query contributorVestingCount if user is a contributor
      if (isContributor) {
        countCalls.push({
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "contributorVestingCount",
          args: [userAddress]
        });
      }

      const countResults = await publicClient.multicall({
        contracts: countCalls,
        allowFailure: false
      });

      const thorLocks3mCount = Number(countResults[0] || 0);
      const thorLocks10mCount = Number(countResults[1] || 0);
      const yThorVestingCount = Number(countResults[2] || 0);
      const unstakeRequestCount = Number(countResults[3] || 0);
      const contributorVestingCount = isContributor
        ? Number(countResults[4] || 0)
        : 0;

      // Step 2: Query detailed data if count > 0 using multicall
      const detailCalls: any[] = [];

      // Query thorLock3m details
      for (let i = 0; i < thorLocks3mCount; i++) {
        detailCalls.push({
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "thorLock3m",
          args: [userAddress, BigInt(i)]
        });
      }

      // Query thorLock10m details
      for (let i = 0; i < thorLocks10mCount; i++) {
        detailCalls.push({
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "thorLock10m",
          args: [userAddress, BigInt(i)]
        });
      }

      // Query yThorVesting details
      for (let i = 0; i < yThorVestingCount; i++) {
        detailCalls.push({
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "yThorVesting",
          args: [userAddress, BigInt(i)]
        });
      }

      // Query unstakeRequest details
      for (let i = 0; i < unstakeRequestCount; i++) {
        detailCalls.push({
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "unstakeRequest",
          args: [userAddress, BigInt(i)]
        });
      }

      // Query contributorVesting details (only if user is contributor and has records)
      if (isContributor) {
        for (let i = 0; i < contributorVestingCount; i++) {
          detailCalls.push({
            address: contractAddress,
            abi: xMetroAbi,
            functionName: "contributorVesting",
            args: [userAddress, BigInt(i)]
          });
        }
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
      let resultIndex = 0;

      // Parse thorLock3m results
      const thorLocks3m: ThorLock[] = [];
      for (let i = 0; i < thorLocks3mCount; i++) {
        const result = detailResults[resultIndex];
        resultIndex++;
        if (result) {
          thorLocks3m.push({
            amount: Big(result.amount)
              .div(10 ** ThorToken.decimals)
              .toString(),
            endTime: Big(result.endTime).mul(1000).toNumber(),
            type: "thorLock3m" as const
          });
        }
      }

      // Parse thorLock10m results
      const thorLocks10m: ThorLock[] = [];
      for (let i = 0; i < thorLocks10mCount; i++) {
        const result = detailResults[resultIndex];
        resultIndex++;
        if (result) {
          thorLocks10m.push({
            amount: Big(result.amount)
              .div(10 ** ThorToken.decimals)
              .toString(),
            endTime: Big(result.endTime).mul(1000).toNumber(),
            type: "thorLock10m" as const
          });
        }
      }

      // Parse yThorVesting results
      const yThorVesting: VestingSchedule[] = [];
      for (let i = 0; i < yThorVestingCount; i++) {
        const result = detailResults[resultIndex];
        resultIndex++;
        if (result) {
          yThorVesting.push({
            totalAmount: Big(result.totalAmount)
              .div(10 ** YThorToken.decimals)
              .toString(),
            claimed: Big(result.claimed)
              .div(10 ** YThorToken.decimals)
              .toString(),
            startTime: Big(result.startTime).mul(1000).toNumber(),
            duration: Big(result.duration).mul(1000).toNumber(),
            type: "yThorVesting" as const
          });
        }
      }

      // Parse unstakeRequest results
      const unstakeRequests: UnstakeRequest[] = [];
      for (let i = 0; i < unstakeRequestCount; i++) {
        const result = detailResults[resultIndex];

        resultIndex++;
        if (result) {
          unstakeRequests.push({
            amount: Big(result.amount)
              .div(10 ** xMetroToken.decimals)
              .toString(),
            unlockTime: Big(result.unlockTime).mul(1000).toNumber(),
            type: "unstakeRequest" as const
          });
        }
      }
      // Parse contributorVesting results
      const contributorVesting: VestingSchedule[] = [];
      if (isContributor) {
        for (let i = 0; i < contributorVestingCount; i++) {
          const result = detailResults[resultIndex];
          resultIndex++;
          if (result) {
            contributorVesting.push({
              totalAmount: Big(result.totalAmount)
                .div(10 ** xMetroToken.decimals)
                .toString(),
              claimed: Big(result.claimed)
                .div(10 ** xMetroToken.decimals)
                .toString(),
              startTime: Big(result.startTime).mul(1000).toNumber(),
              duration: Big(result.duration).mul(1000).toNumber(),
              type: "contributorVesting" as const
            });
          }
        }
      }

      // Merge all operations into a unified list and sort by timestamp (descending)
      const sortedOperations: OperationItem[] = [
        ...thorLocks3m.map((lock) => ({
          type: "thorLock3m" as const,
          data: lock,
          timestamp: lock.endTime
        })),
        ...thorLocks10m.map((lock) => ({
          type: "thorLock10m" as const,
          data: lock,
          timestamp: lock.endTime
        })),
        ...yThorVesting.map((vesting) => ({
          type: "yThorVesting" as const,
          data: vesting,
          timestamp: vesting.startTime
        })),
        ...unstakeRequests.map((request) => ({
          type: "unstakeRequest" as const,
          data: request,
          timestamp: request.unlockTime
        })),
        ...contributorVesting.map((vesting) => ({
          type: "contributorVesting" as const,
          data: vesting,
          timestamp: vesting.startTime
        }))
      ].sort((a, b) => {
        // Sort by timestamp in descending order (newest first)
        if (a.timestamp > b.timestamp) return -1;
        if (a.timestamp < b.timestamp) return 1;
        return 0;
      });

      setSortedOperations(sortedOperations);
    } catch (err: any) {
      console.error("Failed to fetch user operations:", err);
      setError(err?.message || "Failed to fetch user operations");
      setSortedOperations([]);
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, publicClient, isContributor]);

  // Auto-refresh when dependencies change
  useEffect(() => {
    fetchUserOperations();
  }, [fetchUserOperations]);

  return {
    sortedOperations,
    isLoading,
    error,
    refresh: fetchUserOperations
  };
}
