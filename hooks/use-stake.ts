"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { parseUnits, formatUnits, isAddress } from "viem";
import Big from "big.js";
import { toast } from "@/hooks/use-toast";
import { useTokenBalance } from "./use-token-balance";
import { MetroToken, xMetroToken } from "@/config/tokens";
import { useWallet } from "@/contexts/wallet";
import xMetroAbi from "@/config/abi/xmetro";
import useUserStore from "@/stores/use-user";
import { useDebounceFn } from "ahooks";

/**
 * Hook return value interface
 */
interface UseStakeReturn {
  /** Loading state for staking */
  staking: boolean;
  /** Stake amount input */
  stakeAmount: string;
  /** Set stake amount */
  setStakeAmount: (amount: string) => void;
  /** Receiver address input (for contributor stake) */
  receiver: string;
  /** Set receiver address */
  setReceiver: (receiver: string) => void;
  /** Whether user is a contributor */
  isContributor: boolean;
  /** Whether to use contributor stake (only relevant when isContributor is true) */
  useContributorStake: boolean;
  /** Set whether to use contributor stake */
  setUseContributorStake: (use: boolean) => void;
  /** Token balance loading state */
  isTokenBalanceLoading: boolean;
  /** Token balance */
  tokenBalance: string | null;
  /** Execute stake transaction */
  stake: () => Promise<void>;
  /** Amount validation error message */
  amountError: string | null;
  /** Receiver address validation error message */
  receiverError: string | null;
  /** Estimated xMETRO amount that will be minted */
  estimatedXMetroAmount: string | null;
  /** Loading state for estimating xMETRO amount */
  isEstimatingXMetro: boolean;
}

/**
 * Hook for executing stake transactions
 *
 * @returns Stake function and related state
 *
 * @example
 * ```tsx
 * const { stake, staking, stakeAmount, setStakeAmount } = useStake();
 *
 * <input value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} />
 * <button onClick={stake} disabled={staking}>
 *   {staking ? "Staking..." : "Stake"}
 * </button>
 * ```
 */
export default function useStake({
  onSuccess
}: {
  onSuccess: () => void;
}): UseStakeReturn {
  const [staking, setStaking] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [receiverError, setReceiverError] = useState<string | null>(null);
  const [estimatedXMetroAmount, setEstimatedXMetroAmount] = useState<
    string | null
  >(null);
  const [isEstimatingXMetro, setIsEstimatingXMetro] = useState(false);
  const [useContributorStake, setUseContributorStake] = useState(true);
  const { account, publicClient, walletClient } = useWallet();
  const {
    balance: tokenBalance,
    isLoading: isTokenBalanceLoading,
    refetch: fetchTokenBalance
  } = useTokenBalance({ token: MetroToken });
  const { isContributor } = useUserStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Validate stake amount
   * 1. Amount must be greater than 0
   * 2. Amount must not exceed token balance
   */
  const validateAmount = useCallback((): string | null => {
    // Check if amount is provided
    if (!stakeAmount || stakeAmount.trim() === "") {
      return null; // Don't show error for empty input
    }

    // Check if amount is greater than 0
    if (Big(stakeAmount).lte(0)) {
      return "Amount must be greater than 0";
    }

    // Check if amount exceeds token balance
    if (tokenBalance) {
      if (Big(stakeAmount).gt(tokenBalance)) {
        return "Insufficient balance";
      }
    }

    return null;
  }, [stakeAmount, tokenBalance]);

  /**
   * Validate receiver address
   * 1. Receiver must be provided when using contributor stake
   * 2. Receiver must be a valid Ethereum address
   */
  const validateReceiver = useCallback((): string | null => {
    // Only validate receiver when using contributor stake
    if (!isContributor || !useContributorStake) {
      return null;
    }

    // Check if receiver is provided
    if (!receiver || receiver.trim() === "") {
      return "Receiver address is required";
    }

    // Check if receiver is a valid address
    if (!isAddress(receiver.trim())) {
      return "Invalid receiver address";
    }

    return null;
  }, [receiver, isContributor, useContributorStake]);

  // Validate amount when dependencies change
  useEffect(() => {
    const error = validateAmount();
    setAmountError(error);
  }, [validateAmount]);

  // Validate receiver when dependencies change
  useEffect(() => {
    const error = validateReceiver();
    setReceiverError(error);
  }, [validateReceiver]);

  /**
   * Estimate xMETRO amount by simulating stake call
   * This is a static call that doesn't modify the blockchain state
   */
  const estimateXMetroAmount = useCallback(
    async (amount: string) => {
      // Reset estimation if amount is empty or invalid
      if (!amount || amount.trim() === "" || Big(amount).lte(0)) {
        setEstimatedXMetroAmount(null);
        setIsEstimatingXMetro(false);
        return;
      }

      // Need publicClient and account to simulate
      if (!publicClient || !account?.address) {
        setEstimatedXMetroAmount(null);
        setIsEstimatingXMetro(false);
        return;
      }

      // Check if amount exceeds balance (avoid unnecessary simulation)
      if (tokenBalance && Big(amount).gt(tokenBalance)) {
        setEstimatedXMetroAmount(null);
        setIsEstimatingXMetro(false);
        return;
      }

      // If using contributor stake, check if receiver is valid
      if (isContributor && useContributorStake) {
        if (!receiver || !receiver.trim() || !isAddress(receiver.trim())) {
          setEstimatedXMetroAmount(null);
          setIsEstimatingXMetro(false);
          return;
        }
      }

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsEstimatingXMetro(true);

      try {
        const amountInWei = parseUnits(Big(amount).toFixed(18), 18);

        // Determine which method to use based on contributor status and user choice
        const method =
          isContributor && useContributorStake ? "stakeContributor" : "stake";

        // Prepare args based on method
        const args =
          method === "stakeContributor"
            ? [amountInWei, receiver.trim() as `0x${string}`]
            : [amountInWei];

        // Simulate stake call to get minted shares
        // Note: This may fail if user hasn't approved or has insufficient balance
        // We handle errors silently as they're expected during estimation
        const result = await publicClient.simulateContract({
          account: account.address as `0x${string}`,
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: method,
          args
        });

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        // stake method returns mintedShares directly
        const mintedShares = result.result as bigint;
        const xMetroAmount = formatUnits(mintedShares, 18);
        setEstimatedXMetroAmount(xMetroAmount);
      } catch (err: any) {
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        // Silently handle simulation errors (e.g., insufficient balance, not approved)
        // These are expected during estimation and shouldn't be shown to users
        // Only log for debugging purposes
        if (process.env.NODE_ENV === "development") {
          console.debug(
            "Failed to estimate xMETRO amount (this is normal if not approved or insufficient balance):",
            err
          );
        }
        setEstimatedXMetroAmount(null);
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsEstimatingXMetro(false);
        }
      }
    },
    [
      publicClient,
      account?.address,
      tokenBalance,
      isContributor,
      useContributorStake,
      receiver
    ]
  );

  // Debounced version of estimateXMetroAmount
  const { run: debouncedEstimateXMetro } = useDebounceFn(estimateXMetroAmount, {
    wait: 500 // 500ms debounce
  });

  // Estimate xMETRO amount when stakeAmount, useContributorStake, or receiver changes
  useEffect(() => {
    debouncedEstimateXMetro(stakeAmount);

    // Cleanup: abort request when component unmounts or stakeAmount changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [stakeAmount, useContributorStake, receiver, debouncedEstimateXMetro]);

  /**
   * Execute stake transaction
   * Calls the stake method on xMetroToken contract
   * Will check and handle approval automatically
   */
  const stake = async () => {
    // Validate wallet connection
    if (!account?.address) {
      toast({
        title: "Stake Failed!",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    // Validate wallet client and public client
    if (!walletClient || !publicClient) {
      toast({
        title: "Stake Failed!",
        description: "Wallet not available",
        variant: "destructive"
      });
      return;
    }

    // Validate amount
    const validationError = validateAmount();
    if (validationError) {
      toast({
        title: "Stake Failed!",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    // Validate receiver address if using contributor stake
    const receiverValidationError = validateReceiver();
    if (receiverValidationError) {
      toast({
        title: "Stake Failed!",
        description: receiverValidationError,
        variant: "destructive"
      });
      return;
    }

    // Validate stake amount is provided
    if (!stakeAmount || Big(stakeAmount).lte(0)) {
      toast({
        title: "Stake Failed!",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setStaking(true);

    try {
      // Convert amount to bigint (METRO token has 18 decimals)
      const amountInWei = parseUnits(Big(stakeAmount).toFixed(18), 18);
      // Determine which method to use based on contributor status and user choice
      const method =
        isContributor && useContributorStake ? "stakeContributor" : "stake";

      // Prepare args based on method
      const args =
        method === "stakeContributor"
          ? [amountInWei, receiver.trim() as `0x${string}`]
          : [amountInWei];

      // Estimate gas
      let gasEstimate: bigint | undefined;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          account: account.address as `0x${string}`,
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: method,
          args
        });
      } catch (err) {
        console.log("Gas estimation failed:", err);
      }

      // Show pending toast
      toast({
        title: "Stake Pending!",
        description: "Confirm the transaction in your wallet...",
        variant: "default"
      });

      // Send transaction
      const hash = await walletClient.writeContract({
        address: xMetroToken.address as `0x${string}`,
        abi: xMetroAbi,
        functionName: method,
        args,
        gas: gasEstimate ? (gasEstimate * BigInt(120)) / BigInt(100) : undefined
      });

      console.log("Stake transaction hash:", hash);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash
      });

      setStaking(false);

      if (receipt.status === "success") {
        toast({
          title: "Stake Successful!",
          description: `Successfully staked ${stakeAmount} METRO`,
          variant: "default"
        });
        // Reset stake amount and receiver after successful stake
        setStakeAmount("");
        setReceiver("");
        // Refresh balance
        fetchTokenBalance();
        onSuccess();
      } else {
        toast({
          title: "Stake Failed!",
          description: "Transaction was not successful",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error("Stake error:", err);
      setStaking(false);

      const errorMessage =
        err?.message?.includes("user rejected") ||
        err?.message?.includes("User rejected") ||
        err?.cause?.message?.includes("user rejected")
          ? "User rejected transaction"
          : err?.message || "Stake transaction failed";

      toast({
        title: "Stake Failed!",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return {
    staking,
    stakeAmount,
    setStakeAmount,
    receiver,
    setReceiver,
    isContributor,
    useContributorStake,
    setUseContributorStake,
    isTokenBalanceLoading,
    tokenBalance,
    stake,
    amountError,
    receiverError,
    estimatedXMetroAmount,
    isEstimatingXMetro
  };
}
