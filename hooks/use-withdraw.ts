"use client";

import { useState, useEffect, useCallback } from "react";
import { formatUnits } from "viem";
import Big from "big.js";
import { toast } from "@/hooks/use-toast";
import { xMetroToken } from "@/config/tokens";
import { useWallet } from "@/contexts/wallet";
import xMetroAbi from "@/config/abi/xmetro";

/**
 * Withdraw type definition
 */
export type WithdrawType = "Normal" | "THOR" | "yTHOR" | "Contributor";

/**
 * Withdraw type configuration
 */
export interface WithdrawTypeConfig {
  type: WithdrawType;
  label: string;
  functionName: string;
}

/**
 * Withdrawable amounts state
 */
interface WithdrawableAmounts {
  normal: string;
  thor: string;
  ythor: string;
  contributor: string;
}

/**
 * Loading state for each withdraw type
 */
interface WithdrawLoading {
  normal: boolean;
  thor: boolean;
  ythor: boolean;
  contributor: boolean;
}

/**
 * Hook return value interface
 */
interface UseWithdrawReturn {
  /** Withdrawable amounts for each type */
  withdrawableAmounts: WithdrawableAmounts;
  /** Loading state for each withdraw type */
  loading: WithdrawLoading;
  /** Loading state for fetching amounts */
  isLoadingAmounts: boolean;
  /** Withdraw type configurations */
  withdrawTypes: WithdrawTypeConfig[];
  /** Execute withdraw transaction for a specific type */
  handleWithdraw: (type: WithdrawType, functionName: string) => Promise<void>;
  /** Format amount for display */
  formatAmount: (amount: string) => string;
  /** Refresh withdrawable amounts */
  refreshAmounts: () => Promise<void>;
}

export default function useWithdraw(): UseWithdrawReturn {
  const { account, publicClient, walletClient } = useWallet();
  const [withdrawableAmounts, setWithdrawableAmounts] =
    useState<WithdrawableAmounts>({
      normal: "0",
      thor: "0",
      ythor: "0",
      contributor: "0"
    });
  const [loading, setLoading] = useState<WithdrawLoading>({
    normal: false,
    thor: false,
    ythor: false,
    contributor: false
  });
  const [isLoadingAmounts, setIsLoadingAmounts] = useState(false);

  // Withdraw type configurations
  const withdrawTypes: WithdrawTypeConfig[] = [
    { type: "Normal", label: "Normal", functionName: "withdraw" },
    { type: "THOR", label: "THOR", functionName: "withdrawUnlockedThor" },
    { type: "yTHOR", label: "yTHOR", functionName: "withdrawUnlockedYThor" },
    {
      type: "Contributor",
      label: "Contributor",
      functionName: "withdrawUnlockedContributor"
    }
  ];

  /**
   * Fetch withdrawable amounts from contract
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

      // Fetch Normal withdrawable amount by simulating withdraw call
      let normalWithdrawable = BigInt(0);
      try {
        const simulateResult = await publicClient.simulateContract({
          account: account.address as `0x${string}`,
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "withdraw",
          args: [0] // maxRequests
        });
        normalWithdrawable = simulateResult.result as bigint;
      } catch (err) {
        console.error("Failed to simulate withdraw for normal amount:", err);
        // If simulation fails, set to 0
        normalWithdrawable = BigInt(0);
      }

      setWithdrawableAmounts({
        normal: formatUnits(normalWithdrawable, 18),
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
  }, [fetchWithdrawableAmounts]);

  /**
   * Handle withdraw for a specific type
   */
  const handleWithdraw = async (type: WithdrawType, functionName: string) => {
    if (!account?.address) {
      toast({
        title: "Withdraw Failed!",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }
    if (!walletClient || !publicClient) {
      toast({
        title: "Withdraw Failed!",
        description: "Wallet not available",
        variant: "destructive"
      });
      return;
    }
    const amountKey =
      type === "yTHOR"
        ? "ythor"
        : (type.toLowerCase() as keyof typeof withdrawableAmounts);
    const amount = withdrawableAmounts[amountKey];
    if (!amount || Big(amount || "0").lte(0)) {
      toast({
        title: "Withdraw Failed!",
        description: `No ${type} amount available to withdraw`,
        variant: "destructive"
      });
      return;
    }
    setLoading((prev) => ({ ...prev, [amountKey]: true }));
    try {
      // Estimate gas
      let gasEstimate: bigint | undefined;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          account: account.address as `0x${string}`,
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: functionName as any,
          args: [BigInt(1000)] // maxRequests/maxLocks/maxSchedules
        });
      } catch (err) {
        console.log("Gas estimation failed:", err);
      }
      // Show pending toast
      toast({
        title: "Withdraw Pending!",
        description: "Confirm the transaction in your wallet...",
        variant: "default"
      });
      // Send transaction
      const hash = await walletClient.writeContract({
        address: xMetroToken.address as `0x${string}`,
        abi: xMetroAbi,
        functionName: functionName as any,
        args: [BigInt(1000)],
        gas: gasEstimate ? (gasEstimate * BigInt(120)) / BigInt(100) : undefined
      });
      console.log("Withdraw transaction hash:", hash);
      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash
      });
      setLoading((prev) => ({ ...prev, [amountKey]: false }));
      if (receipt.status === "success") {
        toast({
          title: "Withdraw Successful!",
          description: `Successfully withdrew ${amount} METRO (${type})`,
          variant: "default"
        });
        const amounts = withdrawableAmounts;
        amounts[amountKey] = "0";
        setWithdrawableAmounts(JSON.parse(JSON.stringify(amounts)));
      } else {
        toast({
          title: "Withdraw Failed!",
          description: "Transaction was not successful",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error("Withdraw error:", err);
      setLoading((prev) => ({ ...prev, [amountKey]: false }));
      const errorMessage =
        err?.message?.includes("user rejected") ||
        err?.message?.includes("User rejected") ||
        err?.cause?.message?.includes("user rejected")
          ? "User rejected transaction"
          : err?.message || "Withdraw transaction failed";
      toast({
        title: "Withdraw Failed!",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  /**
   * Format amount for display
   */
  const formatAmount = (amount: string): string => {
    if (!amount || Big(amount || "0").lte(0)) {
      return "0.00";
    }
    return Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  return {
    withdrawableAmounts,
    loading,
    isLoadingAmounts,
    withdrawTypes,
    handleWithdraw,
    formatAmount,
    refreshAmounts: fetchWithdrawableAmounts
  };
}
