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
        const currentTimestamp = await publicClient.getBlock({
          blockTag: "latest"
        });
        const delay = await publicClient.readContract({
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "UNSTAKE_DELAY",
        
        });

      
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
       
        setEstimatedMetroAmount(amount);
        setEstimatedUnlockTime(Big(currentTimestamp.timestamp).add(delay).toNumber());
      } catch (err: any) {
        console.log(err)
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
