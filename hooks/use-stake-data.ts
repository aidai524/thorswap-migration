"use client";

import { useState, useEffect, useCallback } from "react";
import { formatUnits } from "viem";
import { useDebounceFn } from "ahooks";
import { useWallet } from "@/contexts/wallet";
import { xMetroToken } from "@/config/tokens";
import xMetroAbi from "@/config/abi/xmetro";

/**
 * Interface for stake data return values
 * All values are formatted strings without 18 decimals precision
 */
interface StakeData {
  /** Total shares in the market */
  totalShares: string | null;
  /** Total locked shares in the market */
  totalLockedShares: string | null;
  /** User's total shares */
  totalSharesOf: string | null;
  /** User's locked shares */
  lockedShares: string | null;
}

/**
 * Hook return value interface
 */
interface UseStakeDataReturn {
  /** Stake data including market and user locked amounts */
  stakeData: StakeData;
  /** Loading state for fetching stake data */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Refresh stake data manually */
  refetch: () => Promise<void>;
}

/**
 * Hook for querying xMETRO contract stake data
 * Fetches totalShares, totalLockedShares, totalSharesOf, and lockedShares
 * Automatically refetches when user logs in or switches address
 *
 * @returns Stake data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { stakeData, isLoading, error, refetch } = useStakeData();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * console.log("Total shares:", stakeData.totalShares);
 * console.log("User shares:", stakeData.totalSharesOf);
 * ```
 */
export default function useStakeData(): UseStakeDataReturn {
  const [stakeData, setStakeData] = useState<StakeData>({
    totalShares: null,
    totalLockedShares: null,
    totalSharesOf: null,
    lockedShares: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account, publicClient } = useWallet();

  /**
   * Fetch stake data from xMETRO contract
   * Queries totalShares, totalLockedShares, totalSharesOf, and lockedShares
   */
  const fetchStakeData = useCallback(async () => {
    // Reset error state
    setError(null);

    // Validate public client
    if (!publicClient) {
      setError("Web3 provider not available");
      setStakeData({
        totalShares: null,
        totalLockedShares: null,
        totalSharesOf: null,
        lockedShares: null
      });
      setIsLoading(false);
      return;
    }

    // Validate chain ID
    if (account?.chainId && account.chainId !== xMetroToken.chainId) {
      setError("Please switch to the correct network");
      setStakeData({
        totalShares: null,
        totalLockedShares: null,
        totalSharesOf: null,
        lockedShares: null
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare contract address
      const contractAddress = xMetroToken.address as `0x${string}`;

      // Build contract calls array for multicall
      const contractCalls: any[] = [
        {
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "totalShares" as const,
          args: []
        },
        {
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "totalLockedShares" as const,
          args: []
        }
      ];

      // If user is connected, add user-specific contract calls
      if (account?.address) {
        const userAddress = account.address as `0x${string}`;
        contractCalls.push(
          {
            address: contractAddress,
            abi: xMetroAbi,
            functionName: "totalSharesOf" as const,
            args: [userAddress]
          },
          {
            address: contractAddress,
            abi: xMetroAbi,
            functionName: "lockedShares" as const,
            args: [userAddress]
          }
        );
      }

      // Execute multicall to batch query all contract methods
      // Try readContracts first (viem extension), fallback to multicall if not available

      const results = await publicClient.multicall({
        contracts: contractCalls,
        allowFailure: false
      });

      // Parse results based on whether user is connected
      const totalShares = results[0] as bigint;
      const totalLockedShares = results[1] as bigint;
      const totalSharesOf = account?.address ? (results[2] as bigint) : null;
      const lockedShares = account?.address ? (results[3] as bigint) : null;

      // Format all values to remove 18 decimals precision
      setStakeData({
        totalShares: formatUnits(totalShares || BigInt(0), 18),
        totalLockedShares: formatUnits(totalLockedShares || BigInt(0), 18),
        totalSharesOf: totalSharesOf
          ? formatUnits(totalSharesOf || BigInt(0), 18)
          : null,
        lockedShares: lockedShares
          ? formatUnits(lockedShares || BigInt(0), 18)
          : null
      });
    } catch (err: any) {
      console.error("Failed to fetch stake data:", err);
      setError(err?.message || "Failed to fetch stake data");
      setStakeData({
        totalShares: null,
        totalLockedShares: null,
        totalSharesOf: null,
        lockedShares: null
      });
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, account?.chainId, publicClient]);

  // Debounce fetchStakeData to prevent excessive queries when switching accounts
  const { run: debouncedFetchStakeData } = useDebounceFn(fetchStakeData, {
    wait: 300
  });

  // Automatically fetch stake data when account or publicClient changes
  useEffect(() => {
    debouncedFetchStakeData();
  }, [account?.address, account?.chainId, publicClient]);

  return {
    stakeData,
    isLoading,
    error,
    refetch: fetchStakeData
  };
}
