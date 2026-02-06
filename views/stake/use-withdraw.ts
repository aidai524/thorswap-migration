"use client";

import { useCallback, useState, useEffect } from "react";
import { formatUnits } from "viem";
import Big from "big.js";
import { toast } from "@/hooks/use-toast";
import { xMetroToken } from "@/config/tokens";
import { useWallet } from "@/contexts/wallet";
import xMetroAbi from "@/config/abi/xmetro";

/**
 * Hook return value interface
 */
interface UseWithdrawReturn {
  loading: boolean;
  isLoadingAmount: boolean;
  withdrawableAmount: string;
  refreshAmount: () => Promise<void>;
  /** Execute withdraw transaction for a specific type */
  handleWithdraw: (onSuccess?: () => void) => Promise<void>;
}

export default function useWithdraw(onSuccess?: () => void): UseWithdrawReturn {
  const { account, publicClient, walletClient } = useWallet();
  const [withdrawable, setWithdrawable] = useState("");
  const [isLoadingAmount, setIsLoadingAmount] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch withdrawable amounts from contract using previewWithdrawableNow
   */
  const fetchWithdrawableAmounts = useCallback(async () => {
    if (!account?.address || !publicClient) {
      return;
    }

    setIsLoadingAmount(true);
    try {
      let normalWithdrawable = BigInt(0);
      try {
        const simulateResult = await publicClient.simulateContract({
          account: account.address as `0x${string}`,
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "withdrawFree",
          args: [0] // maxRequests
        });
        normalWithdrawable = simulateResult.result as bigint;
      } catch (err) {
        console.error("Failed to simulate withdraw for normal amount:", err);
        // If simulation fails, set to 0
        normalWithdrawable = BigInt(0);
      }
      setWithdrawable(formatUnits(normalWithdrawable, 18));
    } catch (err) {
      console.error("Failed to fetch withdrawable amounts:", err);
    } finally {
      setIsLoadingAmount(false);
    }
  }, [account?.address, publicClient]);

  // Fetch amounts when account or publicClient changes
  useEffect(() => {
    fetchWithdrawableAmounts();
  }, [account, publicClient]);

  /**
   * Handle withdraw for a specific type
   */
  const handleWithdraw = async () => {
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
    setLoading(true);
    try {
      // Estimate gas
      let gasEstimate: bigint | undefined;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          account: account.address as `0x${string}`,
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "withdrawFree",
          args: [0] // maxRequests/maxLocks/maxSchedules
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
        functionName: "withdrawFree",
        args: [0],
        gas: gasEstimate ? (gasEstimate * BigInt(120)) / BigInt(100) : undefined
      });
      console.log("Withdraw transaction hash:", hash);
      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash
      });
      setLoading(false);
      if (receipt.status === "success") {
        toast({
          title: "Withdraw Successful!",
          description: `Successfully withdrew METRO`,
          variant: "default"
        });
        onSuccess?.();
        fetchWithdrawableAmounts();
      } else {
        toast({
          title: "Withdraw Failed!",
          description: "Transaction was not successful",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error("Withdraw error:", err);
      setLoading(false);
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

  return {
    loading,
    isLoadingAmount,
    withdrawableAmount: withdrawable,
    refreshAmount: fetchWithdrawableAmounts,
    handleWithdraw
  };
}
