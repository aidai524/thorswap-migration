"use client";

import { useState, useEffect, useCallback } from "react";
import { formatUnits } from "viem";
import { erc20Abi } from "viem";
import type { Token } from "@/lib/types";
import { useWallet } from "@/contexts/wallet";

interface UseTokenBalanceOptions {
  /** Token to fetch balance for */
  token: Token | null;
}

interface UseTokenBalanceReturn {
  /** Token balance as a formatted string (e.g., "1000.5") */
  balance: string;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Manually refresh the balance */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch ERC20 token balance using viem
 *
 * @param options Configuration options for fetching token balance
 * @returns Token balance data and loading state
 *
 * @example
 * ```tsx
 * const { balance, isLoading, refetch } = useTokenBalance({
 *   token: ThorToken,
 * })
 * ```
 */
export function useTokenBalance({
  token
}: UseTokenBalanceOptions): UseTokenBalanceReturn {
  const [balance, setBalance] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicClient, account } = useWallet();
  /**
   * Fetch token balance from blockchain
   */
  const fetchBalance = useCallback(async () => {
    // Reset error state
    setError(null);

    // Validate inputs
    if (!token || !account?.address || account.chainId !== token.chainId) {
      setBalance("");
      setIsLoading(false);
      return;
    }

    // Get public client
    if (!publicClient) {
      setError("No provider available");
      setBalance("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Read token balance using viem's readContract
      const balanceResult = await publicClient.readContract({
        address: token.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account.address as `0x${string}`]
      });

      // Format balance with token decimals
      const formattedBalance = formatUnits(balanceResult, token.decimals);

      setBalance(formattedBalance);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch token balance";
      setError(errorMessage);
      setBalance("");

      console.error("Error fetching token balance:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, account?.address, publicClient]);

  // Initial fetch and refetch on dependency changes
  useEffect(() => {
    fetchBalance();
  }, [token, account?.address, publicClient]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance
  };
}
