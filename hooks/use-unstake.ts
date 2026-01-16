"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { parseUnits } from "viem";
import Big from "big.js";
import { toast } from "@/hooks/use-toast";
import { xMetroToken } from "@/config/tokens";
import { useWallet } from "@/contexts/wallet";
import xMetroAbi from "@/config/abi/xmetro";
import { useDebounceFn } from "ahooks";
import { useTokenBalance } from "./use-token-balance";

/**
 * Hook return value interface
 */
interface UseUnstakeReturn {
  /** Loading state for unstaking */
  unstaking: boolean;
  /** Unstake amount input */
  unstakeAmount: string;
  /** Set unstake amount */
  setUnstakeAmount: (amount: string) => void;
  /** Available amount to unstake */
  tokenBalance: string;
  /** Loading state for available amount */
  isTokenBalanceLoading: boolean;
  /** Execute unstake transaction */
  unstake: () => Promise<void>;
  /** Amount validation error message */
  amountError: string | null;
  /** Handle max unstake button click */
  handleMaxUnstake: () => void;
  /** Estimated METRO amount that will be received */
  estimatedMetroAmount: string | null;
  /** Estimated unlock time (timestamp) */
  estimatedUnlockTime: number | null;
  /** Loading state for estimating unstake result */
  isEstimatingUnstake: boolean;
}

/**
 * Hook for executing unstake transactions
 *
 * @returns Unstake function and related state
 *
 * @example
 * ```tsx
 * const { unstake, unstaking, unstakeAmount, setUnstakeAmount, availableAmount } = useUnstake();
 *
 * <input value={unstakeAmount} onChange={(e) => setUnstakeAmount(e.target.value)} />
 * <button onClick={unstake} disabled={unstaking}>
 *   {unstaking ? "Unstaking..." : "Unstake"}
 * </button>
 * ```
 */
export default function useUnstake({
  onSuccess
}: {
  onSuccess: () => void;
}): UseUnstakeReturn {
  const { account, publicClient, walletClient } = useWallet();
  const [unstaking, setUnstaking] = useState(false);
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [estimatedMetroAmount, setEstimatedMetroAmount] = useState<
    string | null
  >(null);
  const [estimatedUnlockTime, setEstimatedUnlockTime] = useState<number | null>(
    null
  );
  const [isEstimatingUnstake, setIsEstimatingUnstake] = useState(false);
  const {
    balance: tokenBalance,
    isLoading: isTokenBalanceLoading,
    refetch: fetchTokenBalance
  } = useTokenBalance({ token: xMetroToken });
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Handle max unstake button click
   */
  const handleMaxUnstake = useCallback(() => {
    setUnstakeAmount(tokenBalance || "");
  }, [tokenBalance]);

  /**
   * Validate unstake amount
   * 1. Amount must be greater than 0
   * 2. Amount must not exceed available balance
   */
  const validateAmount = useCallback((): string | null => {
    // Check if amount is provided
    if (!unstakeAmount || unstakeAmount.trim() === "") {
      return null; // Don't show error for empty input
    }

    // Check if amount is greater than 0
    if (Big(unstakeAmount).lte(0)) {
      return "Amount must be greater than 0";
    }

    // Check if amount exceeds available balance
    if (Big(unstakeAmount).gt(tokenBalance || 0)) {
      return "Insufficient balance";
    }

    return null;
  }, [unstakeAmount, tokenBalance]);

  // Validate amount when dependencies change
  useEffect(() => {
    const error = validateAmount();
    setAmountError(error);
  }, [validateAmount]);

  /**
   * Estimate unstake result by simulating requestUnstake call
   * This queries what METRO amount will be received and unlock time
   */
  const estimateUnstakeResult = useCallback(
    async (amount: string) => {
      // Reset estimation if amount is empty or invalid
      if (!amount || amount.trim() === "" || Big(amount).lte(0)) {
        setEstimatedMetroAmount(null);
        setEstimatedUnlockTime(null);
        setIsEstimatingUnstake(false);
        return;
      }

      // Need publicClient and account to simulate
      if (!publicClient || !account?.address) {
        setEstimatedMetroAmount(null);
        setEstimatedUnlockTime(null);
        setIsEstimatingUnstake(false);
        return;
      }

      // Check if amount exceeds available balance (avoid unnecessary simulation)
      if (Big(amount).gt(tokenBalance || 0)) {
        setEstimatedMetroAmount(null);
        setEstimatedUnlockTime(null);
        setIsEstimatingUnstake(false);
        return;
      }

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsEstimatingUnstake(true);

      try {
        const amountInWei = parseUnits(Big(amount).toFixed(18), 18);

        // Simulate requestUnstake call to verify it would succeed
        // Note: requestUnstake doesn't return values, but we can verify the call succeeds
        await publicClient.simulateContract({
          account: account.address as `0x${string}`,
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "requestUnstake",
          args: [amountInWei]
        });

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        // Since requestUnstake doesn't return values, we need to query the unlock delay
        // and calculate the unlock time. Let's try to get the current block timestamp
        // and add the unlock delay (if available) or use a default delay
        try {
          // Get current block to get timestamp
          const block = await publicClient.getBlock();
          const currentTimestamp = Number(block.timestamp);

          // Check if request was aborted
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }

          // Try to query unlock delay from contract (if available)
          // For now, we'll use a default delay or query existing unstake requests to infer delay
          // Let's check if there are existing unstake requests to infer the delay
          let unlockDelay = 7 * 24 * 60 * 60; // Default: 7 days in seconds

          try {
            // Query unstakeRequestCount to see if user has existing requests
            const requestCount = await publicClient.readContract({
              address: xMetroToken.address as `0x${string}`,
              abi: xMetroAbi,
              functionName: "unstakeRequestCount",
              args: [account.address as `0x${string}`]
            });

            // Check if request was aborted
            if (abortControllerRef.current?.signal.aborted) {
              return;
            }

            // If user has existing requests, query one to get unlock time pattern
            if (requestCount > BigInt(0)) {
              try {
                const existingRequest = await publicClient.readContract({
                  address: xMetroToken.address as `0x${string}`,
                  abi: xMetroAbi,
                  functionName: "unstakeRequest",
                  args: [account.address as `0x${string}`, BigInt(0)]
                });

                // Check if request was aborted
                if (abortControllerRef.current?.signal.aborted) {
                  return;
                }

                const existingUnlockTime = Number(existingRequest[1] as bigint);
                if (existingUnlockTime > currentTimestamp) {
                  // Calculate delay from existing request
                  unlockDelay = existingUnlockTime - currentTimestamp;
                }
              } catch (err) {
                // If querying existing request fails, use default delay
                console.debug("Failed to query existing unstake request:", err);
              }
            }
          } catch (err) {
            // If querying request count fails, use default delay
            console.debug("Failed to query unstake request count:", err);
          }

          // Calculate unlock time
          const unlockTime = currentTimestamp + unlockDelay;

          // For METRO amount, requestUnstake converts xMETRO to METRO
          // The conversion rate depends on the contract's exchange rate
          // Since we can't get this from simulateContract, we'll use the input amount as estimate
          // (assuming 1:1 ratio, which may need adjustment based on actual contract logic)
          setEstimatedMetroAmount(amount);
          setEstimatedUnlockTime(unlockTime);
        } catch (queryErr) {
          // Check if request was aborted
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }
          console.error("Failed to query unlock time:", queryErr);
          setEstimatedMetroAmount(null);
          setEstimatedUnlockTime(null);
        }
      } catch (err: any) {
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        // Silently handle simulation errors (e.g., insufficient balance)
        // These are expected during estimation and shouldn't be shown to users
        if (process.env.NODE_ENV === "development") {
          console.debug(
            "Failed to estimate unstake result (this is normal if insufficient balance):",
            err
          );
        }
        setEstimatedMetroAmount(null);
        setEstimatedUnlockTime(null);
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsEstimatingUnstake(false);
        }
      }
    },
    [publicClient, account?.address, tokenBalance]
  );

  // Debounced version of estimateUnstakeResult
  const { run: debouncedEstimateUnstake } = useDebounceFn(
    estimateUnstakeResult,
    {
      wait: 500 // 500ms debounce
    }
  );

  // Estimate unstake result when unstakeAmount changes
  useEffect(() => {
    debouncedEstimateUnstake(unstakeAmount);

    // Cleanup: abort request when component unmounts or unstakeAmount changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [unstakeAmount, debouncedEstimateUnstake]);

  /**
   * Execute unstake transaction
   * Calls the requestUnstake method on xMetroToken contract
   */
  const unstake = async () => {
    // Validate wallet connection
    if (!account?.address) {
      toast({
        title: "Unstake Failed!",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    // Validate wallet client and public client
    if (!walletClient || !publicClient) {
      toast({
        title: "Unstake Failed!",
        description: "Wallet not available",
        variant: "destructive"
      });
      return;
    }

    // Validate amount
    const validationError = validateAmount();
    if (validationError) {
      toast({
        title: "Unstake Failed!",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    // Validate unstake amount is provided
    if (!unstakeAmount || Big(unstakeAmount).lte(0)) {
      toast({
        title: "Unstake Failed!",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setUnstaking(true);

    try {
      // Convert amount to bigint (METRO token has 18 decimals)
      const amountInWei = parseUnits(Big(unstakeAmount).toFixed(18), 18);

      // Estimate gas
      let gasEstimate: bigint | undefined;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          account: account.address as `0x${string}`,
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "requestUnstake",
          args: [amountInWei]
        });
      } catch (err) {
        console.log("Gas estimation failed:", err);
      }

      // Show pending toast
      toast({
        title: "Unstake Pending!",
        description: "Confirm the transaction in your wallet...",
        variant: "default"
      });

      // Send transaction
      const hash = await walletClient.writeContract({
        address: xMetroToken.address as `0x${string}`,
        abi: xMetroAbi,
        functionName: "requestUnstake",
        args: [amountInWei],
        gas: gasEstimate ? (gasEstimate * BigInt(120)) / BigInt(100) : undefined
      });

      console.log("Unstake transaction hash:", hash);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash
      });

      setUnstaking(false);

      if (receipt.status === "success") {
        toast({
          title: "Unstake Successful!",
          description: `Successfully requested unstake of ${unstakeAmount} METRO`,
          variant: "default"
        });
        // Reset unstake amount after successful unstake
        setUnstakeAmount("");
        // Refresh balance
        fetchTokenBalance();
        onSuccess();
      } else {
        toast({
          title: "Unstake Failed!",
          description: "Transaction was not successful",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error("Unstake error:", err);
      setUnstaking(false);

      const errorMessage =
        err?.message?.includes("user rejected") ||
        err?.message?.includes("User rejected") ||
        err?.cause?.message?.includes("user rejected")
          ? "User rejected transaction"
          : err?.message || "Unstake transaction failed";

      toast({
        title: "Unstake Failed!",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return {
    unstaking,
    unstakeAmount,
    setUnstakeAmount,
    tokenBalance,
    isTokenBalanceLoading,
    unstake,
    amountError,
    handleMaxUnstake,
    estimatedMetroAmount,
    estimatedUnlockTime,
    isEstimatingUnstake
  };
}
