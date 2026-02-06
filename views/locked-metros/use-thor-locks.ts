"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/contexts/wallet";
import { ThorToken, xMetroToken } from "@/config/tokens";
import xMetroAbi from "@/config/abi/xmetro";
import Big from "big.js";
import { OperationItem } from "@/sections/history-record/types";

/**
 * Hook return value interface
 */
interface UseThorLocksReturn {
  /** All THOR locks (3m and 10m) merged and sorted by endTime in descending order */
  thorLocks: OperationItem[];
  /** THOR unstake requests */
  unstakeRequests: OperationItem[];
  /** Loading state for locks */
  isLoadingLocks: boolean;
  /** Loading state for unstake requests */
  isLoadingRequests: boolean;
  /** Error message for locks */
  errorLocks: string | null;
  /** Error message for unstake requests */
  errorRequests: string | null;
  /** Requestable amount */
  requestableAmount: string;
  /** Withdrawable amount */
  withdrawableAmount: string;
  /** Refresh function */
  refresh: () => Promise<void>;
}

/**
 * Hook for querying THOR lock records (3m and 10m) from xMETRO contract
 * Uses multicall to batch contract queries for efficiency
 *
 * @returns THOR locks data and related functions
 */
export default function useThorLocks(): UseThorLocksReturn {
  const { account, publicClient } = useWallet();
  const [thorLocks, setThorLocks] = useState<OperationItem[]>([]);
  const [unstakeRequests, setUnstakeRequests] = useState<OperationItem[]>([]);
  const [isLoadingLocks, setIsLoadingLocks] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [errorLocks, setErrorLocks] = useState<string | null>(null);
  const [errorRequests, setErrorRequests] = useState<string | null>(null);
  const [requestableAmount, setRequestabledAmount] = useState<string>("0");
  const [withdrawableAmount, setWithdrawableAmount] = useState<string>("0");

  /**
   * Query THOR lock records
   * First queries count functions, then queries detailed data if count > 0
   */
  const fetchThorLocks = useCallback(async () => {
    if (!account?.address || !publicClient) {
      setThorLocks([]);
      setErrorLocks(null);
      return;
    }

    setIsLoadingLocks(true);
    setErrorLocks(null);

    try {
      const contractAddress = xMetroToken.address as `0x${string}`;
      const userAddress = account.address as `0x${string}`;

      // Step 1: Query count functions using multicall
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
          functionName: "thorLockCursor3m",
          args: [userAddress]
        },
        {
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "thorLockCursor10m",
          args: [userAddress]
        }
      ];

      const countResults = await publicClient.multicall({
        contracts: countCalls,
        allowFailure: false
      });

      const thorLocks3mCount = Number(countResults[0] || 0);
      const thorLocks10mCount = Number(countResults[1] || 0);

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
      let _requestabledAmount = Big(0);

      // Parse thorLock3m results
      const thorLocks3mData: OperationItem[] = [];
      for (let i = 0; i < thorLocks3mCount; i++) {
        const result = detailResults[resultIndex];
        resultIndex++;
        if (result) {
          thorLocks3mData.push({
            amount: Big(result.amount)
              .div(10 ** ThorToken.decimals)
              .toString(),
            endTime: Big(result.endTime).mul(1000).toNumber(),
            type: "thorLock3m" as const,
            widthdrawed: i <= Number(countResults[2] || 0)
          });
          if (i > Number(countResults[2] || 0)) {
            _requestabledAmount.plus(
              Big(result.amount).div(10 ** ThorToken.decimals)
            );
          }
        }
      }

      // Parse thorLock10m results
      const thorLocks10mData: OperationItem[] = [];
      for (let i = 0; i < thorLocks10mCount; i++) {
        const result = detailResults[resultIndex];
        resultIndex++;
        if (result) {
          const _endTime = Big(result.endTime).mul(1000).toNumber();
          thorLocks10mData.push({
            amount: Big(result.amount)
              .div(10 ** ThorToken.decimals)
              .toString(),
            endTime: Big(result.endTime).mul(1000).toNumber(),
            type: "thorLock10m" as const,
            widthdrawed: i < Number(countResults[3] || 0)
          });
          if (i >= Number(countResults[3] || 0) && _endTime <= Date.now()) {
            _requestabledAmount = _requestabledAmount.plus(
              Big(result.amount).div(10 ** ThorToken.decimals)
            );
          }
        }
      }

      setRequestabledAmount(_requestabledAmount.toString());

      // Merge and sort by endTime in descending order (newest first)
      const mergedLocks = [...thorLocks3mData, ...thorLocks10mData].sort(
        (a, b) => {
          if (a.type === "thorLock3m" && b.type === "thorLock10m") return -1;
          if (a.type === "thorLock10m" && b.type === "thorLock3m") return 1;
          return 0;
        }
      );

      setThorLocks(mergedLocks);
    } catch (err: any) {
      console.error("Failed to fetch THOR locks:", err);
      setErrorLocks(err?.message || "Failed to fetch THOR locks");
      setThorLocks([]);
    } finally {
      setIsLoadingLocks(false);
    }
  }, [account?.address, publicClient]);

  /**
   * Query THOR unstake request records
   * First queries count and cursor functions, then queries detailed data if count > 0
   */
  const fetchUnstakeRequests = useCallback(async () => {
    if (!account?.address || !publicClient) {
      setUnstakeRequests([]);
      setErrorRequests(null);
      return;
    }

    setIsLoadingRequests(true);
    setErrorRequests(null);

    try {
      const contractAddress = xMetroToken.address as `0x${string}`;
      const userAddress = account.address as `0x${string}`;

      // Step 1: Query count and cursor functions
      const [countResult, cursorResult] = await publicClient.multicall({
        contracts: [
          {
            address: contractAddress,
            abi: xMetroAbi,
            functionName: "unstakeRequestCountThor",
            args: [userAddress]
          },
          {
            address: contractAddress,
            abi: xMetroAbi,
            functionName: "unstakeCursorThor",
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
          functionName: "unstakeRequestThor",
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
      let _withdrawableAmount = Big(0);
      for (let i = 0; i < unstakeRequestCount; i++) {
        const result = detailResults[i];
        if (result) {
          const _unlockTime = Big(result.unlockTime).mul(1000).toNumber();
          unstakeRequestsData.push({
            index: i,
            amount: Big(result.amount)
              .div(10 ** xMetroToken.decimals)
              .toString(),
            unlockTime: _unlockTime,
            type: "unstakeRequest" as const,
            widthdrawed: i < Number(cursorResult || 0)
          });
          if (i >= Number(cursorResult || 0) && _unlockTime <= Date.now()) {
            _withdrawableAmount = _withdrawableAmount.plus(
              Big(result.amount).div(10 ** xMetroToken.decimals)
            );
          }
        }
      }

      // Sort by unlockTime in descending order (newest first)
      unstakeRequestsData.sort((a, b) => {
        if (a.type === "unstakeRequest" && b.type === "unstakeRequest") {
          return b.unlockTime - a.unlockTime;
        }
        return 0;
      });

      setUnstakeRequests(unstakeRequestsData);
      setWithdrawableAmount(_withdrawableAmount.toString());
    } catch (err: any) {
      console.error("Failed to fetch THOR unstake requests:", err);
      setErrorRequests(err?.message || "Failed to fetch THOR unstake requests");
      setUnstakeRequests([]);
      setWithdrawableAmount("0");
    } finally {
      setIsLoadingRequests(false);
    }
  }, [account?.address, publicClient]);

  // Auto-refresh when dependencies change
  useEffect(() => {
    fetchThorLocks();
    fetchUnstakeRequests();
  }, [account, publicClient]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchThorLocks(), fetchUnstakeRequests()]);
  }, [fetchThorLocks, fetchUnstakeRequests]);

  return {
    thorLocks,
    unstakeRequests,
    isLoadingLocks,
    isLoadingRequests,
    errorLocks,
    errorRequests,
    requestableAmount,
    withdrawableAmount,
    refresh
  };
}
